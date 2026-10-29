import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";

const PATIENTS_PATH = path.join(process.cwd(), "src", "data", "patients-records.json");
const SERVICES_PATH = path.join(process.cwd(), "src", "data", "services-pricing-config.json");
const HISTORY_PATH = path.join(process.cwd(), "src", "data", "import-history.json");

// Helper to read JSON file safely
function readJsonFile(filePath: string, defaultValue: any = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON file safely
function writeJsonFile(filePath: string, data: any) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

export async function GET() {
  try {
    const patients = readJsonFile(PATIENTS_PATH, []);
    const services = readJsonFile(SERVICES_PATH, []);
    const history = readJsonFile(HISTORY_PATH, [
      {
        id: "imp-1",
        date: "2026-10-25 14:30",
        fileName: "smile_dental_patients_initial.csv",
        entityType: "Patients",
        recordsCount: 22,
        status: "Completed",
        performedBy: "Clinic Admin",
      },
      {
        id: "imp-2",
        date: "2026-10-26 11:15",
        fileName: "ca_smile_price_list.csv",
        entityType: "Services & Pricing",
        recordsCount: 10,
        status: "Completed",
        performedBy: "Clinic Admin",
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPatients: Array.isArray(patients) ? patients.length : 0,
          totalServices: Array.isArray(services) ? services.length : 0,
          totalAppointments: inMemoryStore.getAppointments().length || 40,
        },
        history,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load import data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      entityType = "patients",
      duplicateStrategy = "update",
      fileName = "import_file.csv",
      records = [],
    } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid records provided for import." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let skippedCount = 0;

    if (entityType === "patients") {
      const existing = readJsonFile(PATIENTS_PATH, []);
      const updatedList = [...existing];

      for (const row of records) {
        const name = (row.name || row.fullName || row.patientName || "").trim();
        const phone = (row.phone || row.mobile || row.contact || "").toString().trim();
        if (!name && !phone) {
          skippedCount++;
          continue;
        }

        const existingIndex = updatedList.findIndex(
          (p: any) =>
            (phone && p.phone && p.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")) ||
            (name && p.name && p.name.toLowerCase() === name.toLowerCase())
        );

        if (existingIndex >= 0) {
          if (duplicateStrategy === "skip") {
            skippedCount++;
            continue;
          } else if (duplicateStrategy === "update") {
            updatedList[existingIndex] = {
              ...updatedList[existingIndex],
              name: name || updatedList[existingIndex].name,
              phone: phone || updatedList[existingIndex].phone,
              age: row.age || updatedList[existingIndex].age || "Adult",
              gender: row.gender || updatedList[existingIndex].gender || "other",
              medicalNotes: row.notes || row.medicalNotes || updatedList[existingIndex].medicalNotes,
            };
            importedCount++;
            continue;
          }
        }

        // Create new patient
        const newNumber = updatedList.length + 1;
        const padCode = String(newNumber).padStart(5, "0");
        const newPatient = {
          id: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          patientNumber: `#${padCode}`,
          name: name || "Valued Patient",
          phone: phone || "0000000000",
          gender: (row.gender || "other").toLowerCase(),
          age: row.age || "Adult",
          dob: row.dob || "",
          isNew: true,
          totalVisits: 1,
          lastVisit: new Date().toLocaleDateString("en-GB"),
          avatarColor: "indigo",
          timeline: [
            {
              id: `tl-${Date.now()}`,
              type: "VISIT • INITIAL",
              date: new Date().toLocaleDateString("en-GB"),
              doctor: "Dr. Deep Arvindbhai Patel",
              reason: `Imported record: ${row.service || "General Consultation"}`,
              dotColor: "blue",
            },
          ],
          vitals: {
            bloodPressure: row.bp || "120/80 mmHg",
            heartRate: row.pulse || "72 bpm",
            weight: row.weight || "65 kg",
            temperature: "98.6 °F",
          },
          documentsCount: 0,
          labOrdersCount: 0,
        };

        updatedList.push(newPatient);
        importedCount++;
      }

      writeJsonFile(PATIENTS_PATH, updatedList);
    } else if (entityType === "services") {
      const existing = readJsonFile(SERVICES_PATH, []);
      const updatedList = [...existing];

      for (const row of records) {
        const name = (row.name || row.serviceName || "").trim();
        const price = Number(row.price || row.fee || 500);
        if (!name) {
          skippedCount++;
          continue;
        }

        const existingIndex = updatedList.findIndex(
          (s: any) => s.name.toLowerCase() === name.toLowerCase()
        );

        if (existingIndex >= 0) {
          if (duplicateStrategy === "skip") {
            skippedCount++;
            continue;
          } else {
            updatedList[existingIndex] = {
              ...updatedList[existingIndex],
              price,
              duration: row.duration || updatedList[existingIndex].duration || "30m",
            };
            importedCount++;
            continue;
          }
        }

        updatedList.push({
          id: `srv-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name,
          provider: "Dr. Deep Arvindbhai Patel",
          providerName: "Dr. Deep Arvindbhai Patel",
          price,
          duration: row.duration || "30m",
          isConsult: true,
        });
        importedCount++;
      }

      writeJsonFile(SERVICES_PATH, updatedList);
    } else if (entityType === "appointments") {
      for (const row of records) {
        const patientName = (row.patientName || row.name || "").trim();
        const dateStr = row.date || new Date().toISOString().split("T")[0];
        const timeStr = row.time || "10:00 AM";
        if (!patientName) {
          skippedCount++;
          continue;
        }

        try {
          const aptId = `apt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const parts = patientName.split(" ");
          const firstName = parts[0] || "Valued";
          const lastName = parts.slice(1).join(" ") || "Patient";

          const nowIso = new Date().toISOString();
          inMemoryStore.saveAppointment({
            id: aptId,
            startTime: `${dateStr}T10:00:00.000Z`,
            endTime: `${dateStr}T10:30:00.000Z`,
            status: (row.status?.toUpperCase() || "CONFIRMED") as any,
            source: "ADMIN",
            reason: row.service || "General Consultation",
            preferredDoctor: row.doctor || "Dr. Deep Arvindbhai Patel",
            service: {
              name: row.service || "General Consultation",
              durationMinutes: 30,
              price: 300,
            },
            patient: {
              firstName,
              lastName,
              phone: row.phone || "0000000000",
            },
            createdAt: nowIso,
            updatedAt: nowIso,
          });
          importedCount++;
        } catch {
          skippedCount++;
        }
      }
    }

    // Save to import history log
    const history = readJsonFile(HISTORY_PATH, []);
    const newLog = {
      id: `imp-${Date.now()}`,
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      fileName,
      entityType:
        entityType === "patients"
          ? "Patients"
          : entityType === "services"
          ? "Services & Pricing"
          : "Appointments",
      recordsCount: importedCount,
      status: "Completed",
      performedBy: "Clinic Admin",
    };
    history.unshift(newLog);
    writeJsonFile(HISTORY_PATH, history.slice(0, 30));

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} records (${skippedCount} skipped/duplicates).`,
      data: {
        importedCount,
        skippedCount,
        log: newLog,
      },
    });
  } catch (err: any) {
    console.error("Error in import API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
