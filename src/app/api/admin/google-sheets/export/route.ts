import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getReviewsStoreData } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "contacts"; // contacts | bookings | feedback | all

    let csvContent = "";
    let filename = `smilecraft-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (tab === "contacts" || tab === "all") {
      let patientsList: any[] = [];
      try {
        patientsList = await prisma.patient.findMany({
          orderBy: { createdAt: "desc" },
          include: { appointments: true, treatments: true },
        });
      } catch {}

      const inMemAppts = inMemoryStore.getAppointments();
      const existingPhones = new Set(patientsList.map((p) => (p.phone || "").replace(/\D/g, "")));
      for (const a of inMemAppts) {
        const clean = (a.patient?.phone || "").replace(/\D/g, "");
        if (clean && !existingPhones.has(clean)) {
          existingPhones.add(clean);
          patientsList.push({
            id: `pat-${clean}`,
            firstName: a.patient?.firstName || "Valued",
            lastName: a.patient?.lastName || "Patient",
            email: a.patient?.email,
            phone: a.patient?.phone,
            createdAt: a.createdAt,
            appointments: [a],
            treatments: [],
          });
        }
      }

      const rows = patientsList.map((p, idx) => {
        const visits = p.appointments?.length || 0;
        const name = `"${(`${p.firstName || ""} ${p.lastName || ""}`.trim() || "Valued Patient").replace(/"/g, '""')}"`;
        const phone = `"${(p.phone || "").replace(/"/g, '""')}"`;
        const email = `"${(p.email || "").replace(/"/g, '""')}"`;

        return `${idx + 1},${idx + 1},${name},${phone},${email},${visits}`;
      });

      csvContent += ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Email", "Visits"].join(",") + "\n";
      csvContent += rows.join("\n");
    } else if (tab === "bookings") {
      let appointmentsList: any[] = [];
      try {
        appointmentsList = await prisma.appointment.findMany({
          orderBy: { startTime: "desc" },
          include: { patient: true, service: true },
        });
      } catch {}

      if (appointmentsList.length === 0) {
        appointmentsList = inMemoryStore.getAppointments();
      }

      let patientsList: any[] = [];
      try {
        patientsList = await prisma.patient.findMany({
          orderBy: { createdAt: "desc" },
        });
      } catch {}

      const patientNumberMap = new Map<string, number>();
      patientsList.forEach((p, idx) => {
        const pNum = idx + 1;
        if (p.id) patientNumberMap.set(p.id, pNum);
        const clean = (p.phone || "").replace(/\D/g, "");
        if (clean) patientNumberMap.set(clean, pNum);
      });

      const rows = appointmentsList.map((a, idx) => {
        const patientName = `"${(a.patientName || `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.trim() || "Valued Patient").replace(/"/g, '""')}"`;
        const phone = `"${(a.patient?.phone || "").replace(/"/g, '""')}"`;
        const service = `"${(a.service?.name || a.reason || "General Consultation").replace(/"/g, '""')}"`;
        const dateStr = a.startTime ? new Date(a.startTime).toLocaleString("en-US") : "Scheduled";
        const doctor = `"${(a.preferredDoctor || "Dr. Sankar").replace(/"/g, '""')}"`;
        const status = a.status || "PENDING";

        const clean = (a.patient?.phone || a.phone || "").replace(/\D/g, "");
        const pNum =
          (a.patientId && patientNumberMap.get(a.patientId)) ||
          (clean && patientNumberMap.get(clean)) ||
          (idx + 1);
        const patientNo = `"#${pNum}"`;

        return `${idx + 1},${patientNo},${patientName},${phone},${service},"${dateStr}",${doctor},"${status}"`;
      });

      csvContent += ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Service", "Date & Slot", "Doctor", "Status"].join(",") + "\n";
      csvContent += rows.join("\n");
    } else if (tab === "feedback") {
      const store = getReviewsStoreData();
      const reviews = store.reviews || [];

      const rows = reviews.map((r, idx) => {
        const author = `"${(r.authorName || "Anonymous").replace(/"/g, '""')}"`;
        const comment = `"${(r.comment || "").replace(/"/g, '""')}"`;
        const treatment = `"${(r.treatment || "Dental Care").replace(/"/g, '""')}"`;
        const source = `"${(r.source || "Google Maps").replace(/"/g, '""')}"`;
        const date = `"${(r.date || "Recent").replace(/"/g, '""')}"`;

        return `${idx + 1},"${r.id || `FB-${idx + 1}`}",${author},${r.rating},${comment},${treatment},${source},${date},"${r.status || "APPROVED"}"`;
      });

      csvContent += ["#", "Feedback ID", "Patient / Author", "Rating", "Review", "Treatment", "Source", "Date", "Status"].join(",") + "\n";
      csvContent += rows.join("\n");
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
