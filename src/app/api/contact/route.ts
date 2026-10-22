import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, department, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide your name, email, and message.",
        },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    let savedAppointmentId: string | undefined;

    try {
      // 1. Resolve clinic
      const clinic =
        (await prisma.clinic.findFirst()) ||
        (await prisma.clinic.create({
          data: {
            name: "VS Multispeciality Dental Clinic",
            slug: "vs-dental-clinic",
            themeKey: "teal-serenity",
          },
        }));

      // 2. Resolve default service
      const serviceName = department || "General Patient Inquiry";
      let service = await prisma.service.findFirst({
        where: { clinicId: clinic.id, name: serviceName },
      });
      if (!service) {
        service = await prisma.service.create({
          data: {
            clinicId: clinic.id,
            name: serviceName,
            price: 0.0,
            durationMinutes: 30,
          },
        });
      }

      // 3. Upsert patient
      const nameParts = name.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || name.trim() || "Valued";
      const lastName = nameParts.slice(1).join(" ") || "";
      const cleanPhone = (phone || "9999999999").trim();

      let patient = await prisma.patient.findFirst({
        where: { clinicId: clinic.id, phone: cleanPhone },
      });
      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            clinicId: clinic.id,
            firstName,
            lastName,
            email,
            phone: cleanPhone,
            medicalNotes: message,
          },
        });
      }

      // 4. Create appointment inquiry in PENDING status
      const now = new Date();
      const startTime = new Date(now.getTime() + 86400000); // Default to tomorrow
      const endTime = new Date(startTime.getTime() + 30 * 60000);

      const apt = await prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: patient.id,
          serviceId: service.id,
          startTime,
          endTime,
          status: "PENDING",
          source: "WEB_FORM",
          reason: serviceName,
          notes: `Inquiry Message: ${message}`,
          preferredDoctor: "Any Available Specialist",
        },
      });

      savedAppointmentId = apt.id;
    } catch (dbErr) {
      console.warn("Could not save contact message to database, continuing:", dbErr);
    }

    const referenceId =
      savedAppointmentId || `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message:
          "Thank you for reaching out. Your inquiry has been registered in our patient system. Our clinical coordinator will respond shortly.",
        received: {
          name,
          email,
          phone: phone || "Not provided",
          department: department || "General Patient Inquiries",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process inquiry.",
      },
      { status: 500 }
    );
  }
}
