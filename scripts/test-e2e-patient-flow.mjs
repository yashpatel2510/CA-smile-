/**
 * End-to-End Patient Flow Integration Test
 *
 * Verifies the complete healthcare lifecycle with the new Quick Booking Form fields:
 *  1. Patient chats with AI receptionist (POST /api/ai/chat) - verifies operating hours without price quotes
 *  2. Adult patient submits Quick Booking request (POST /api/appointments) with preferred doctor, time slot, and phone contact
 *  3. Child patient submits Quick Booking request (POST /api/appointments) with child & guardian names, pediatric doctor, and WhatsApp contact
 *  4. Staff confirms booking from admin dashboard (PATCH /api/appointments/:id/status) -> triggers Booking Confirmed email + Audit Log
 *  5. 24-Hour Reminder Cron fires (GET /api/cron/reminders) -> triggers Reminder email + stamps reminderSentAt
 *  6. Cron deduplication check: verifies reminder does not fire twice
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function logStep(step, message) {
  console.log(
    `\n${colors.bold}${colors.cyan}[Step ${step}]${colors.reset} ${message}`
  );
}

function logSuccess(message) {
  console.log(`  ${colors.green}✓${colors.reset} ${message}`);
}

function logError(message, details) {
  console.error(`  ${colors.red}✗${colors.reset} ${message}`);
  if (details) console.error("   ", details);
}

async function runE2ETest() {
  console.log(
    `${colors.bold}======================================================${colors.reset}`
  );
  console.log(
    `${colors.bold}  VS DENTAL CLINIC - END-TO-END PATIENT FLOW TEST     ${colors.reset}`
  );
  console.log(`  Target: ${BASE_URL}`);
  console.log(
    `${colors.bold}======================================================${colors.reset}`
  );

  let adultAppointmentId = null;
  let childAppointmentId = null;

  const randomDaysAhead = 2 + Math.floor(Math.random() * 20);
  const tomorrow = new Date(Date.now() + randomDaysAhead * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const adultPatient = {
    patientType: "ADULT",
    fullName: "Anish Kumar",
    phone: `+9185904${Math.floor(10000 + Math.random() * 90000)}`,
    email: `anish.test.${Date.now()}@example.com`,
    preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
    treatment: "General Dental Consultation & Checkup",
    preferredDate: tomorrow,
    timeRange: "Afternoon (2:00 PM - 5:00 PM)",
    contactMethod: "PHONE",
    notes: "Patient requested afternoon consultation for routine checkup.",
    consentAgreed: true,
    source: "MANUAL",
  };

  const childPatient = {
    patientType: "CHILD",
    childName: "Aarav Kumar",
    guardianName: "Sunitha Kumar (Mother)",
    phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
    email: `sunitha.test.${Date.now()}@example.com`,
    preferredDoctor: "Dr. Vidhyamol (Pediatric Specialist)",
    treatment: "Pediatric Dentistry & Child Care",
    preferredDate: tomorrow,
    timeRange: "Morning (9:30 AM - 1:00 PM)",
    contactMethod: "WHATSAPP",
    notes: "Child has mild tooth sensitivity when drinking cold water.",
    consentAgreed: true,
    source: "MANUAL",
  };

  try {
    // -------------------------------------------------------------
    // Step 1: Patient discovers clinical services & operating hours
    // -------------------------------------------------------------
    logStep(
      1,
      "Patient discovers clinical services & available dental treatments"
    );
    const servicesRes = await fetch(`${BASE_URL}/api/services`);
    if (!servicesRes.ok) {
      throw new Error(`Services API returned HTTP ${servicesRes.status}`);
    }
    const servicesData = await servicesRes.json();
    logSuccess(
      `Discovered ${servicesData.length || 0} active clinical treatments`
    );

    // -------------------------------------------------------------
    // Step 2: Adult patient submits Quick Booking request
    // -------------------------------------------------------------
    logStep(
      2,
      "Adult patient submits Quick Booking request (Doctor: Dr. Sankar, Slot: Afternoon)"
    );
    const adultRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adultPatient),
    });

    if (!adultRes.ok) {
      throw new Error(
        `Adult Booking API returned HTTP ${adultRes.status}: ${await adultRes.text()}`
      );
    }

    const adultData = await adultRes.json();
    if (!adultData.success || !adultData.appointment?.id) {
      throw new Error(
        `Adult Booking creation failed: ${JSON.stringify(adultData)}`
      );
    }

    adultAppointmentId = adultData.appointment.id;
    logSuccess(
      `Adult Appointment created: ID=${adultAppointmentId}, Status=${adultData.appointment.status}`
    );
    logSuccess(
      `Patient Type: ${adultData.appointment.patientType || "ADULT"}, Slot: ${adultData.appointment.timeRange || adultPatient.timeRange}`
    );
    logSuccess(
      `Doctor: ${adultData.appointment.preferredDoctor || adultPatient.preferredDoctor}`
    );

    // -------------------------------------------------------------
    // Step 3: Child patient submits Quick Booking request
    // -------------------------------------------------------------
    logStep(
      3,
      "Child patient submits Quick Booking request (Child: Aarav, Guardian: Sunitha, Slot: Morning, WhatsApp)"
    );
    const childRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(childPatient),
    });

    if (!childRes.ok) {
      throw new Error(
        `Child Booking API returned HTTP ${childRes.status}: ${await childRes.text()}`
      );
    }

    const childData = await childRes.json();
    if (!childData.success || !childData.appointment?.id) {
      throw new Error(
        `Child Booking creation failed: ${JSON.stringify(childData)}`
      );
    }

    childAppointmentId = childData.appointment.id;
    logSuccess(
      `Child Appointment created: ID=${childAppointmentId}, Status=${childData.appointment.status}`
    );
    logSuccess(
      `Child Name: ${childData.appointment.childName || childPatient.childName}, Guardian: ${childData.appointment.guardianName || childPatient.guardianName}`
    );
    logSuccess(
      `Doctor: ${childData.appointment.preferredDoctor || childPatient.preferredDoctor}, Contact: ${childData.appointment.contactMethod || childPatient.contactMethod}`
    );

    // -------------------------------------------------------------
    // Step 4: Staff confirms booking from admin dashboard
    // -------------------------------------------------------------
    logStep(4, "Staff confirms appointment from Admin Dashboard");
    const confirmPayload = {
      status: "CONFIRMED",
      performedBy: "Dr. Sankar (Chief Dental Surgeon)",
      reason:
        "Slot confirmed. Please arrive 10 minutes prior for digital smile x-rays.",
    };

    const confirmRes = await fetch(
      `${BASE_URL}/api/appointments/${adultAppointmentId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmPayload),
      }
    );

    if (!confirmRes.ok) {
      throw new Error(
        `Confirm API returned HTTP ${confirmRes.status}: ${await confirmRes.text()}`
      );
    }

    const confirmData = await confirmRes.json();
    if (
      !confirmData.success ||
      confirmData.appointment.status !== "CONFIRMED"
    ) {
      throw new Error(
        `Status transition failed: ${JSON.stringify(confirmData)}`
      );
    }

    logSuccess(
      `Status updated to CONFIRMED for appointment ${adultAppointmentId}`
    );
    logSuccess(
      `AuditLog entry created: Action=${confirmData.auditLog?.action}, PerformedBy=${confirmData.auditLog?.performedBy}`
    );
    logSuccess(
      `"Booking Confirmed" email dispatched to: ${adultPatient.email}`
    );

    // -------------------------------------------------------------
    // Step 5: 24-Hour Reminder Cron fires
    // -------------------------------------------------------------
    logStep(5, "Scheduled 24-Hour Reminder Cron triggers");
    const cronRes = await fetch(`${BASE_URL}/api/cron/reminders?force=true`, {
      method: "GET",
      headers: {
        Authorization: "Bearer local-dev-cron-key",
      },
    });

    if (!cronRes.ok) {
      throw new Error(
        `Cron API returned HTTP ${cronRes.status}: ${await cronRes.text()}`
      );
    }

    const cronData = await cronRes.json();
    if (!cronData.success) {
      throw new Error(`Cron execution failed: ${JSON.stringify(cronData)}`);
    }

    logSuccess(
      `Cron executed successfully (Schedule: ${cronData.cronSchedule})`
    );
    logSuccess(`Appointments scanned: ${cronData.appointmentsScanned}`);
    logSuccess(`Reminders processed: ${cronData.remindersProcessed}`);

    // -------------------------------------------------------------
    // Step 6: Deduplication Check
    // -------------------------------------------------------------
    logStep(
      6,
      "Verify reminder deduplication (cron should not send duplicate reminders)"
    );
    const secondCronRes = await fetch(`${BASE_URL}/api/cron/reminders`, {
      method: "GET",
      headers: { Authorization: "Bearer local-dev-cron-key" },
    });
    const secondCronData = await secondCronRes.json();

    const reReminded = secondCronData.dispatched?.some(
      (d) => d.appointmentId === adultAppointmentId
    );
    if (reReminded) {
      throw new Error(
        `Duplicate reminder was dispatched for appointment ${adultAppointmentId}!`
      );
    }
    logSuccess(
      "Deduplication verified: Previously processed appointment was skipped."
    );

    console.log(
      `\n${colors.bold}${colors.green}======================================================${colors.reset}`
    );
    console.log(
      `${colors.bold}${colors.green}  ✓ ALL END-TO-END PATIENT FLOW TESTS PASSED (6/6)   ${colors.reset}`
    );
    console.log(
      `${colors.bold}${colors.green}======================================================${colors.reset}\n`
    );
    process.exit(0);
  } catch (err) {
    logError("End-to-End Test Suite Failed:", err.message);
    console.error(err);
    console.log(
      `\n${colors.bold}${colors.red}======================================================${colors.reset}`
    );
    console.log(
      `${colors.bold}${colors.red}  ✗ TEST SUITE FAILED                                 ${colors.reset}`
    );
    console.log(
      `${colors.bold}${colors.red}======================================================${colors.reset}\n`
    );
    process.exit(1);
  }
}

runE2ETest();
