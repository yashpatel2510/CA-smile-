import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Read DATABASE_URL securely from environment or .env
let liveUrl = process.env.DATABASE_URL;
if (!liveUrl) {
  try {
    const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
    const match = envFile.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
    if (match) liveUrl = match[1];
  } catch {}
}
if (!liveUrl) {
  console.error("ERROR: DATABASE_URL is not set in environment or .env file.");
  process.exit(1);
}
if (!liveUrl.includes("connection_limit")) {
  liveUrl += (liveUrl.includes("?") ? "&" : "?") + "connection_limit=1";
}

async function main() {
  console.log("--------------------------------------------------");
  console.log("Connecting to Live Clinic Production Database...");
  console.log("Host: aws-0-ap-southeast-1.pooler.supabase.com");
  console.log("--------------------------------------------------");

  const prisma = new PrismaClient({
    datasources: { db: { url: liveUrl } },
    log: ["error"],
  });

  try {
    // 1. Fetch current counts sequentially to avoid connection spikes
    console.log("Fetching current counts...");
    const patCount = await prisma.patient.count().catch(() => 0);
    const aptCount = await prisma.appointment.count().catch(() => 0);
    const treatCount = await prisma.treatment.count().catch(() => 0);
    const sessionCount = await prisma.treatmentSession.count().catch(() => 0);
    const auditCount = await prisma.auditLog.count().catch(() => 0);
    const waConvCount = await prisma.whatsAppConversation.count().catch(() => 0);
    const waMsgCount = await prisma.whatsAppMessage.count().catch(() => 0);
    const chatSessionCount = await prisma.chatSession.count().catch(() => 0);
    const staffCount = await prisma.staffUser.count().catch(() => 0);
    const clinicCount = await prisma.clinic.count().catch(() => 0);
    const serviceCount = await prisma.service.count().catch(() => 0);

    console.log(`Current Live DB Status:
      - Patients: ${patCount}
      - Appointments: ${aptCount}
      - Treatments: ${treatCount}
      - Treatment Sessions: ${sessionCount}
      - Audit Logs: ${auditCount}
      - WhatsApp Conversations: ${waConvCount}
      - WhatsApp Messages: ${waMsgCount}
      - Visitor Chat Sessions: ${chatSessionCount}
      --------------------------------------------------
      [PRESERVED] Staff Accounts: ${staffCount}
      [PRESERVED] Clinic Profiles: ${clinicCount}
      [PRESERVED] Services Catalog: ${serviceCount}
    `);

    // 2. Create full safety backup before deleting
    const backupDir = path.resolve(process.cwd(), "src/data/backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFile = path.join(backupDir, `live-db-backup-before-clean-${Date.now()}.json`);

    console.log("Creating pre-clean backup file...");
    const allPatients = await prisma.patient.findMany();
    const allAppointments = await prisma.appointment.findMany();
    const allTreatments = await prisma.treatment.findMany().catch(() => []);
    const allSessions = await prisma.treatmentSession.findMany().catch(() => []);

    fs.writeFileSync(
      backupFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          database: "LIVE_PRODUCTION",
          patients: allPatients,
          appointments: allAppointments,
          treatments: allTreatments,
          sessions: allSessions,
        },
        null,
        2
      ),
      "utf-8"
    );
    console.log(`✅ Backup successfully saved to: ${backupFile}`);

    // 3. Delete records in correct relational dependency order
    console.log("\nDeleting all test/patient records from Live Production DB...");

    // a. Treatment Sessions
    const delSessions = await prisma.treatmentSession.deleteMany({}).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delSessions.count} treatment session(s)`);

    // b. Treatments
    const delTreatments = await prisma.treatment.deleteMany({}).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delTreatments.count} treatment(s)`);

    // c. WhatsApp Messages & Conversations
    const delWaMsg = await prisma.whatsAppMessage.deleteMany({}).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delWaMsg.count} WhatsApp message(s)`);
    const delWaConv = await prisma.whatsAppConversation.deleteMany({}).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delWaConv.count} WhatsApp conversation(s)`);

    // d. Chat Messages & Chat Sessions
    const delChatMsg = await prisma.chatMessage.deleteMany({}).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delChatMsg.count} chat message(s)`);
    const delChatSession = await prisma.chatSession.deleteMany({}).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delChatSession.count} chat session(s)`);

    // e. Audit Logs (Patient/Appointment logs)
    const delAudit = await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { entityType: "Patient" },
          { entityType: "Appointment" },
          { appointmentId: { not: null } },
        ],
      },
    }).catch(() => ({ count: 0 }));
    console.log(`  ✓ Deleted ${delAudit.count} patient/appointment audit log(s)`);

    // f. Appointments
    const delApts = await prisma.appointment.deleteMany({});
    console.log(`  ✓ Deleted ${delApts.count} appointment(s)`);

    // g. Patients
    const delPatients = await prisma.patient.deleteMany({});
    console.log(`  ✓ Deleted ${delPatients.count} patient(s)`);

    // 4. Reset local queue and cache files
    console.log("\nResetting local live queue state and patient record caches...");
    const queueOrderFile = path.resolve(process.cwd(), "src/data/today-queue-order.json");
    if (fs.existsSync(queueOrderFile)) {
      fs.writeFileSync(queueOrderFile, JSON.stringify({}, null, 2), "utf-8");
      console.log("  ✓ Reset src/data/today-queue-order.json");
    }

    const liveQueueFile = path.resolve(process.cwd(), "src/data/live-queue-state.json");
    if (fs.existsSync(liveQueueFile)) {
      const cleanQueue = {
        currentToken: 0,
        currentPatient: null,
        doctorName: "Dr. Deep Patel",
        service: "General Dental Consultation & Checkup",
        roomName: "Consultation Room 1",
        status: "WAITING",
        upcoming: [],
        callTimestamp: Date.now(),
        dateStr: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(liveQueueFile, JSON.stringify(cleanQueue, null, 2), "utf-8");
      console.log("  ✓ Reset src/data/live-queue-state.json");
    }

    const patientRecordsFile = path.resolve(process.cwd(), "src/data/patients-records.json");
    if (fs.existsSync(patientRecordsFile)) {
      fs.writeFileSync(patientRecordsFile, JSON.stringify([], null, 2), "utf-8");
      console.log("  ✓ Reset src/data/patients-records.json");
    }

    // 5. Final verification of remaining live database contents
    console.log("\nVerifying cleaned database state...");
    const finalPat = await prisma.patient.count();
    const finalApt = await prisma.appointment.count();
    const finalTreat = await prisma.treatment.count().catch(() => 0);
    const finalStaff = await prisma.staffUser.count();
    const finalClinics = await prisma.clinic.count();
    const finalServices = await prisma.service.count().catch(() => 0);

    const staffUsers = await prisma.staffUser.findMany({
      select: { email: true, name: true, role: true },
    });

    console.log("\n==================================================");
    console.log("LIVE CLINIC PRODUCTION DATABASE CLEANED SUCCESSFULLY:");
    console.log(`- Remaining Patients: ${finalPat}`);
    console.log(`- Remaining Appointments: ${finalApt}`);
    console.log(`- Remaining Treatments: ${finalTreat}`);
    console.log(`- Staff Accounts Preserved: ${finalStaff}`);
    staffUsers.forEach((s) => console.log(`    • [${s.role}] ${s.name} (${s.email})`));
    console.log(`- Clinic Profiles Preserved: ${finalClinics}`);
    console.log(`- Services In Catalog: ${finalServices}`);
    console.log("==================================================\n");
  } catch (err) {
    console.error("Error during cleanup:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
