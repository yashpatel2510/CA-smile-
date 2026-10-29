import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getReviewsStoreData } from "@/lib/reviews-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow access if logged in or for clinical admin preview
    const clinic = await prisma.clinic.findFirst().catch(() => null);
    const clinicName = clinic?.name || "SmileCraft Dental Studio";

    // 1. Fetch Patients (Contacts Tab)
    let patientsList: any[] = [];
    try {
      patientsList = await prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          appointments: {
            include: {
              service: true,
            },
          },
          treatments: true,
          whatsappConversations: {
            take: 1,
            orderBy: { lastMessageTimestamp: "desc" },
          },
        },
      });
    } catch (e) {
      // Fallback
    }

    // Merge in-memory patients if any
    const inMemAppts = inMemoryStore.getAppointments();
    const existingPhones = new Set(patientsList.map((p) => (p.phone || "").replace(/\D/g, "")));

    for (const apt of inMemAppts) {
      const cleanPhone = (apt.patient?.phone || "").replace(/\D/g, "");
      if (cleanPhone && !existingPhones.has(cleanPhone)) {
        existingPhones.add(cleanPhone);
        patientsList.push({
          id: `pat-${cleanPhone}`,
          firstName: apt.patient.firstName || "Valued",
          lastName: apt.patient.lastName || "Patient",
          email: apt.patient.email || null,
          phone: apt.patient.phone,
          medicalNotes: apt.notes,
          createdAt: apt.createdAt ? new Date(apt.createdAt) : new Date(),
          appointments: [
            {
              id: apt.id,
              startTime: new Date(apt.startTime),
              status: apt.status,
              source: apt.source,
              paidAmount: apt.paidAmount || 0,
              totalAmount: apt.totalAmount || 0,
              service: { name: apt.service?.name || "Dental Care" },
            },
          ],
          treatments: [],
          whatsappConversations: apt.source === "WHATSAPP" ? [{ id: "wa-1" }] : [],
        });
      }
    }

    // Format Contacts for Google Sheets (Patient Numbering, Name, Phone, Email, Visits)
    const contacts = patientsList.map((p, idx) => {
      const appointments = p.appointments || [];
      const totalVisits = appointments.length;

      return {
        rowNumber: idx + 1,
        id: p.id,
        patientNumber: idx + 1,
        fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Valued Patient",
        whatsappPhone: p.phone || "—",
        email: p.email || "—",
        visits: totalVisits,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    // 2. Fetch Bookings (Bookings Tab)
    let appointmentsList: any[] = [];
    try {
      appointmentsList = await prisma.appointment.findMany({
        orderBy: { startTime: "desc" },
        include: {
          patient: true,
          service: true,
          staffUser: true,
        },
      });
    } catch (e) {
      // Fallback
    }

    if (appointmentsList.length === 0) {
      appointmentsList = inMemoryStore.getAppointments();
    }

    // Create lookup for Patient Number
    const patientNumberMap = new Map<string, number>();
    patientsList.forEach((p, idx) => {
      const pNum = idx + 1;
      if (p.id) patientNumberMap.set(p.id, pNum);
      const clean = (p.phone || "").replace(/\D/g, "");
      if (clean) patientNumberMap.set(clean, pNum);
    });

    const bookings = appointmentsList.map((apt, idx) => {
      const patientName =
        apt.patientName ||
        (apt.patient ? `${apt.patient.firstName || ""} ${apt.patient.lastName || ""}`.trim() : "Valued Patient");

      const startDate = apt.startTime ? new Date(apt.startTime) : new Date();
      const formattedDate = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const clean = (apt.patient?.phone || apt.phone || "").replace(/\D/g, "");
      const pNum =
        (apt.patientId && patientNumberMap.get(apt.patientId)) ||
        (clean && patientNumberMap.get(clean)) ||
        (idx + 1);
      const patientNo = `#${pNum}`;

      return {
        rowNumber: idx + 1,
        id: apt.id,
        patientNo,
        patientName: patientName || "Valued Patient",
        phone: apt.patient?.phone || "—",
        service: apt.service?.name || apt.reason || "General Consultation",
        dateTime: `${formattedDate} • ${formattedTime}`,
        doctor: apt.preferredDoctor || apt.staffUser?.name || "Dr. Sankar",
        status: apt.status || "PENDING",
        source: apt.source || "WEB_FORM",
        createdAt: apt.createdAt ? new Date(apt.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    // 3. Fetch Feedback / Reviews (Feedback Tab)
    const reviewsStore = getReviewsStoreData();
    const feedbackList = reviewsStore.reviews || [];

    const feedback = feedbackList.map((rev, idx) => {
      return {
        rowNumber: idx + 1,
        id: rev.id,
        feedbackId: rev.id || `FB-${String(idx + 1).padStart(3, "0")}`,
        authorName: rev.authorName || "Anonymous Patient",
        rating: `${rev.rating} ★`,
        comment: rev.comment || "No comment provided",
        treatment: rev.treatment || "General Dental Care",
        source: rev.source || "Google Maps",
        date: rev.date || "Recent",
        status: rev.status || "APPROVED",
      };
    });

    return NextResponse.json({
      success: true,
      clinicName,
      lastEditTime: "Just now",
      stats: {
        contactsCount: contacts.length,
        bookingsCount: bookings.length,
        feedbackCount: feedback.length,
      },
      contacts,
      bookings,
      feedback,
    });
  } catch (err: any) {
    console.error("Google Sheets Gateway API Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to load Google Sheets gateway data",
      },
      { status: 500 }
    );
  }
}
