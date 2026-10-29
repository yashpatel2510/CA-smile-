import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ExcelJS from "exceljs";
import prisma, { authPrisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getReviewsStoreData } from "@/lib/reviews-store";

interface ExportQueryOptions {
  format: "xlsx" | "csv";
  period: "daily" | "weekly" | "monthly" | "custom" | "all";
  startDate?: string;
  endDate?: string;
  entities: string[];
}

function getFilterCutoff(period: string, startDate?: string): Date | null {
  const now = new Date();
  if (period === "daily") {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  if (period === "weekly") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (period === "monthly") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  if (period === "custom" && startDate) {
    const d = new Date(startDate);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const body: ExportQueryOptions = await req.json().catch(() => ({}));
    const format = body.format === "csv" ? "csv" : "xlsx";
    const period = body.period || "all";
    const entities = Array.isArray(body.entities) && body.entities.length > 0
      ? body.entities
      : ["patients", "appointments", "treatments", "staff", "reviews", "whatsapp"];
    const cutoff = getFilterCutoff(period, body.startDate);

    // 1. Collect Patients
    let patientsList: any[] = [];
    if (entities.includes("patients")) {
      try {
        const fromDb = await prisma.patient.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
        });
        if (fromDb.length > 0) patientsList = fromDb;
      } catch {}
      if (patientsList.length === 0) {
        const seen = new Set<string>();
        inMemoryStore.getAppointments().forEach((a, idx) => {
          if (a.patient && !seen.has(a.patient.phone)) {
            seen.add(a.patient.phone);
            patientsList.push({
              id: `PAT-${String(idx + 1).padStart(3, "0")}`,
              name: `${a.patient.firstName || ""} ${a.patient.lastName || ""}`.trim(),
              email: a.patient.email || "patient@example.com",
              phone: a.patient.phone,
              gender: "Not specified",
              createdAt: a.createdAt,
            });
          }
        });
      }
      if (cutoff) {
        patientsList = patientsList.filter(
          (p) => new Date(p.createdAt || 0) >= cutoff
        );
      }
    }

    // 2. Collect Appointments
    let appointmentsList: any[] = [];
    if (entities.includes("appointments")) {
      try {
        const fromDb = await prisma.appointment.findMany({
          orderBy: { createdAt: "desc" },
          take: 500,
        });
        if (fromDb.length > 0) appointmentsList = fromDb;
      } catch {}
      if (appointmentsList.length === 0) {
        appointmentsList = inMemoryStore.getAppointments();
      }
      if (cutoff) {
        appointmentsList = appointmentsList.filter(
          (a) => new Date(a.createdAt || a.startTime || 0) >= cutoff
        );
      }
    }

    // 3. Collect Staff
    let staffList: any[] = [];
    if (entities.includes("staff")) {
      try {
        const fromDb = await authPrisma.staffUser.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            isActive: true,
            createdAt: true,
          },
          take: 100,
        });
        if (fromDb.length > 0) staffList = fromDb;
      } catch {}
      if (staffList.length === 0) {
        const fallbackOwnerEmail = process.env.OWNER_EMAILS?.split(",")[0] || "admin@casmile.com";
        staffList = [
          { id: "STF-001", name: "Clinic Admin", email: fallbackOwnerEmail, role: "ADMIN", phone: "+91 72260 98074", isActive: true },
          { id: "STF-002", name: "Dr. Evelyn Reed", email: "evelyn@example.com", role: "STAFF", phone: "+91 98470 54321", isActive: true },
        ];
      }
    }

    // 4. Collect Reviews
    let reviewsList: any[] = [];
    if (entities.includes("reviews")) {
      const store = getReviewsStoreData();
      reviewsList = store.reviews || [];
      if (cutoff) {
        reviewsList = reviewsList.filter(
          (r) => new Date(r.createdAt || r.date || 0) >= cutoff
        );
      }
    }

    // 5. Collect WhatsApp
    let whatsappList: any[] = [];
    if (entities.includes("whatsapp")) {
      whatsappList = inMemoryStore
        .getAppointments()
        .filter((a) => a.source === "WHATSAPP")
        .map((a) => ({
          id: a.id,
          patientName: `${a.patient.firstName || ""} ${a.patient.lastName || ""}`.trim(),
          phone: a.patient.phone,
          service: a.service?.name || "Dental Care",
          status: a.status,
          createdAt: a.createdAt,
        }));
      if (cutoff) {
        whatsappList = whatsappList.filter(
          (w) => new Date(w.createdAt || 0) >= cutoff
        );
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    // FORMAT: CSV
    if (format === "csv") {
      let csvContent = "";
      // If single entity selected, export cleanly
      if (entities.length === 1) {
        const entity = entities[0];
        if (entity === "patients") {
          csvContent = "ID,Name,Email,Phone,Gender,DateOfBirth,Created\n" +
            patientsList.map(p => `"${p.id}","${p.name || ""}","${p.email || ""}","${p.phone || ""}","${p.gender || ""}","${p.dateOfBirth || ""}","${p.createdAt || ""}"`).join("\n");
        } else if (entity === "appointments") {
          csvContent = "ID,PatientName,DoctorName,Date,Time,Status,Service\n" +
            appointmentsList.map(a => `"${a.id}","${a.patientName || ""}","${a.doctorName || ""}","${a.date || ""}","${a.time || ""}","${a.status || ""}","${a.service || ""}"`).join("\n");
        } else if (entity === "staff") {
          csvContent = "ID,Name,Email,Role,Phone,Active\n" +
            staffList.map(s => `"${s.id}","${s.name || ""}","${s.email || ""}","${s.role || ""}","${s.phone || ""}",${s.isActive}`).join("\n");
        } else if (entity === "reviews") {
          csvContent = "ID,Author,Rating,Comment,Source,Date\n" +
            reviewsList.map(r => `"${r.id}","${r.author || ""}","${r.rating}","${(r.comment || "").replace(/"/g, '""')}","${r.source || ""}","${r.date || ""}"`).join("\n");
        } else if (entity === "whatsapp") {
          csvContent = "ID,PatientName,Phone,Service,Status,Date\n" +
            whatsappList.map(w => `"${w.id}","${w.patientName || ""}","${w.phone || ""}","${w.service || ""}","${w.status || ""}","${w.createdAt || ""}"`).join("\n");
        }
      } else {
        // Multi-entity combined CSV with section separators
        csvContent = `Smile Dental Clinic Data Export (${period.toUpperCase()}) - ${new Date().toLocaleString("en-IN")}\n\n`;
        if (patientsList.length > 0) {
          csvContent += "=== PATIENTS ===\nID,Name,Email,Phone,Gender,Created\n" +
            patientsList.map(p => `"${p.id}","${p.name || ""}","${p.email || ""}","${p.phone || ""}","${p.gender || ""}","${p.createdAt || ""}"`).join("\n") + "\n\n";
        }
        if (appointmentsList.length > 0) {
          csvContent += "=== APPOINTMENTS ===\nID,Patient,Doctor,Date,Time,Status,Service\n" +
            appointmentsList.map(a => `"${a.id}","${a.patientName || ""}","${a.doctorName || ""}","${a.date || ""}","${a.time || ""}","${a.status || ""}","${a.service || ""}"`).join("\n") + "\n\n";
        }
        if (staffList.length > 0) {
          csvContent += "=== STAFF ===\nID,Name,Email,Role,Phone,Active\n" +
            staffList.map(s => `"${s.id}","${s.name || ""}","${s.email || ""}","${s.role || ""}","${s.phone || ""}",${s.isActive}`).join("\n") + "\n\n";
        }
        if (reviewsList.length > 0) {
          csvContent += "=== REVIEWS ===\nID,Author,Rating,Source,Comment\n" +
            reviewsList.map(r => `"${r.id}","${r.author || ""}","${r.rating}","${r.source || ""}","${(r.comment || "").replace(/"/g, '""')}"`).join("\n") + "\n\n";
        }
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="smile-dental-export-${period}-${timestamp}.csv"`,
        },
      });
    }

    // FORMAT: EXCEL (.xlsx)
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Smile Dental Clinic Platform";
    workbook.created = new Date();

    if (entities.includes("patients")) {
      const ws = workbook.addWorksheet("Patients");
      ws.columns = [
        { header: "Patient ID", key: "id", width: 22 },
        { header: "Name", key: "name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 18 },
        { header: "Gender", key: "gender", width: 12 },
        { header: "Date of Birth", key: "dob", width: 15 },
        { header: "Registered", key: "created", width: 20 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } };
      patientsList.forEach((p) => {
        ws.addRow({
          id: p.id,
          name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim(),
          email: p.email || "N/A",
          phone: p.phone || "N/A",
          gender: p.gender || "N/A",
          dob: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "N/A",
          created: p.createdAt ? String(p.createdAt).slice(0, 19).replace("T", " ") : "N/A",
        });
      });
    }

    if (entities.includes("appointments")) {
      const ws = workbook.addWorksheet("Appointments");
      ws.columns = [
        { header: "Appointment ID", key: "id", width: 22 },
        { header: "Patient Name", key: "patient", width: 25 },
        { header: "Doctor", key: "doctor", width: 25 },
        { header: "Service", key: "service", width: 28 },
        { header: "Date", key: "date", width: 14 },
        { header: "Time", key: "time", width: 12 },
        { header: "Status", key: "status", width: 14 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      appointmentsList.forEach((a) => {
        ws.addRow({
          id: a.id,
          patient: a.patientName || a.patient?.name || "Patient",
          doctor: a.doctorName || "Dr. Sankar",
          service: a.service || a.serviceName || "Dental Consultation",
          date: a.date ? String(a.date).slice(0, 10) : "N/A",
          time: a.time || "N/A",
          status: a.status || "CONFIRMED",
        });
      });
    }

    if (entities.includes("staff")) {
      const ws = workbook.addWorksheet("Staff & Users");
      ws.columns = [
        { header: "User ID", key: "id", width: 22 },
        { header: "Name", key: "name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Role", key: "role", width: 15 },
        { header: "Phone", key: "phone", width: 18 },
        { header: "Status", key: "status", width: 12 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } };
      staffList.forEach((s) => {
        ws.addRow({
          id: s.id,
          name: s.name || "Staff Member",
          email: s.email || "N/A",
          role: s.role || "STAFF",
          phone: s.phone || "N/A",
          status: s.isActive ? "ACTIVE" : "INACTIVE",
        });
      });
    }

    if (entities.includes("reviews")) {
      const ws = workbook.addWorksheet("Reviews");
      ws.columns = [
        { header: "Review ID", key: "id", width: 20 },
        { header: "Author", key: "author", width: 25 },
        { header: "Rating", key: "rating", width: 10 },
        { header: "Source", key: "source", width: 15 },
        { header: "Comment", key: "comment", width: 45 },
        { header: "Date", key: "date", width: 15 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE11D48" } };
      reviewsList.forEach((r) => {
        ws.addRow({
          id: r.id,
          author: r.author || "Anonymous",
          rating: r.rating || 5,
          source: r.source || "Google Maps",
          comment: r.comment || "",
          date: r.date || "Recent",
        });
      });
    }

    if (entities.includes("whatsapp")) {
      const ws = workbook.addWorksheet("WhatsApp Bookings");
      ws.columns = [
        { header: "Booking ID", key: "id", width: 22 },
        { header: "Patient Name", key: "name", width: 25 },
        { header: "Phone Number", key: "phone", width: 20 },
        { header: "Treatment Needed", key: "service", width: 25 },
        { header: "Status", key: "status", width: 15 },
        { header: "Created At", key: "created", width: 20 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } };
      whatsappList.forEach((w) => {
        ws.addRow({
          id: w.id,
          name: w.patientName || "WhatsApp Patient",
          phone: w.phone || "N/A",
          service: w.service || "General Inquiry",
          status: w.status || "CONFIRMED",
          created: w.createdAt ? String(w.createdAt).slice(0, 19).replace("T", " ") : "N/A",
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="smile-dental-export-${period}-${timestamp}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to generate export file" },
      { status: 500 }
    );
  }
}
