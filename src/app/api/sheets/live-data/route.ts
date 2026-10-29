import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getReviewsStoreData } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "contacts"; // contacts | bookings | feedback

    if (tab === "bookings") {
      let appointmentsList: any[] = [];
      try {
        appointmentsList = await prisma.appointment.findMany({
          orderBy: { startTime: "desc" },
          include: { patient: true, service: true, staffUser: true },
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
        const phone = `"${(a.patient?.phone || "—").replace(/"/g, '""')}"`;
        const service = `"${(a.service?.name || a.reason || "General Consultation").replace(/"/g, '""')}"`;
        const dateStr = a.startTime ? new Date(a.startTime).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Scheduled";
        const doctor = `"${(a.preferredDoctor || a.staffUser?.name || "Dr. Sankar").replace(/"/g, '""')}"`;
        const status = a.status || "PENDING";

        const clean = (a.patient?.phone || a.phone || "").replace(/\D/g, "");
        const pNum =
          (a.patientId && patientNumberMap.get(a.patientId)) ||
          (clean && patientNumberMap.get(clean)) ||
          (idx + 1);
        const patientNo = `"#${pNum}"`;

        return `${idx + 1},${patientNo},${patientName},${phone},${service},"${dateStr}",${doctor},"${status}"`;
      });

      const csvContent = ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Service", "Date & Slot", "Doctor", "Status"].join(",") + "\n" + rows.join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (tab === "feedback") {
      const store = getReviewsStoreData();
      const reviews = store.reviews || [];

      const rows = reviews.map((r, idx) => {
        const author = `"${(r.authorName || "Anonymous").replace(/"/g, '""')}"`;
        const rating = `"${r.rating} ★"`;
        const comment = `"${(r.comment || "").replace(/"/g, '""')}"`;
        const treatment = `"${(r.treatment || "Dental Care").replace(/"/g, '""')}"`;
        const source = `"${(r.source || "Google Maps").replace(/"/g, '""')}"`;
        const date = `"${(r.date || "Recent").replace(/"/g, '""')}"`;

        return `${idx + 1},"${r.id || `FB-${idx + 1}`}",${author},${rating},${comment},${treatment},${source},${date},"${r.status || "APPROVED"}"`;
      });

      const csvContent = ["#", "Feedback ID", "Patient / Author", "Rating", "Review", "Treatment", "Source", "Date", "Status"].join(",") + "\n" + rows.join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Default: Contacts (Patients)
    let patientsList: any[] = [];
    try {
      patientsList = await prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
        include: { appointments: true, treatments: true, whatsappConversations: { take: 1 } },
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
      const phone = `"${(p.phone || "—").replace(/"/g, '""')}"`;
      const email = `"${(p.email || "—").replace(/"/g, '""')}"`;

      return `${idx + 1},${idx + 1},${name},${phone},${email},${visits}`;
    });

    const csvContent = ["#", "Patient No.", "Full Name", "WhatsApp Phone", "Email", "Visits"].join(",") + "\n" + rows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
