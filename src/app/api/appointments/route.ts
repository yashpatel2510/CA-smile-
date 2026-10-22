import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createAppointmentSchema,
  appointmentQuerySchema,
} from "@/lib/validations/appointment";
import { inMemoryStore } from "@/lib/in-memory-store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { renderBookingRequestReceivedEmail } from "@/lib/email-templates";

// In-memory cache for clinic to avoid roundtrips on every booking
let cachedClinic: any = null;
let cachedClinicExpiry = 0;

async function getCachedClinic(clinicSlug?: string) {
  const now = Date.now();
  if (cachedClinic && now < cachedClinicExpiry) {
    return cachedClinic;
  }
  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: "VS Multispeciality Dental Clinic",
        slug: clinicSlug || "vs-dental-clinic",
        themeKey: "teal-serenity",
      },
    });
  }
  cachedClinic = clinic;
  cachedClinicExpiry = now + 10 * 60 * 1000; // Cache for 10 minutes
  return clinic;
}

// Rate limit: 10 requests per 60 seconds per IP
const BOOKING_RATE_LIMIT = { limit: 10, windowMs: 60000 };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryResult = appointmentQuerySchema.safeParse({
      status: searchParams.get("status") || undefined,
      date: searchParams.get("date") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      serviceId: searchParams.get("serviceId") || undefined,
      clinicSlug: searchParams.get("clinicSlug") || undefined,
      source: searchParams.get("source") || undefined,
      doctor: searchParams.get("doctor") || searchParams.get("dentist") || undefined,
      patientId: searchParams.get("patientId") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") || undefined,
      page: searchParams.get("page") || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, errors: queryResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      status,
      date,
      startDate,
      endDate,
      serviceId,
      source,
      doctor,
      patientId,
      search,
      limit,
      page,
    } = queryResult.data;

    let appointments: any[] = [];

    try {
      // Prisma query builder
      const where: any = {};

      if (status && status !== "ALL") {
        where.status = status;
      }

      if (source && source !== "ALL") {
        where.source = source;
      }

      if (doctor && doctor !== "ALL") {
        where.OR = [
          { preferredDoctor: { contains: doctor, mode: "insensitive" } },
          { staffUser: { name: { contains: doctor, mode: "insensitive" } } },
        ];
      }

      if (patientId) {
        where.patientId = patientId;
      }

      if (date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        where.startTime = { gte: startOfDay, lte: endOfDay };
      } else if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = new Date(startDate);
        if (endDate) where.startTime.lte = new Date(endDate);
      }

      if (serviceId) {
        where.serviceId = serviceId;
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { id: { contains: q, mode: "insensitive" } },
          { reason: { contains: q, mode: "insensitive" } },
          { notes: { contains: q, mode: "insensitive" } },
          { childName: { contains: q, mode: "insensitive" } },
          { guardianName: { contains: q, mode: "insensitive" } },
          { patient: { firstName: { contains: q, mode: "insensitive" } } },
          { patient: { lastName: { contains: q, mode: "insensitive" } } },
          { patient: { phone: { contains: q } } },
        ];
      }

      appointments = await prisma.appointment.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { startTime: "asc" },
        include: {
          patient: true,
          service: true,
          staffUser: true,
          treatment: {
            include: {
              sessions: {
                orderBy: { sessionNumber: "asc" },
              },
            },
          },
          treatmentSession: true,
          auditLogs: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch {
      // In-memory fallback
      let list = inMemoryStore.getAppointments();

      if (status && status !== "ALL") {
        list = list.filter((a) => a.status === status);
      }

      if (source && source !== "ALL") {
        list = list.filter((a) => a.source === source);
      }

      if (doctor && doctor !== "ALL") {
        list = list.filter(
          (a) =>
            a.preferredDoctor?.toLowerCase().includes(doctor.toLowerCase()) ||
            a.staffUser?.name?.toLowerCase().includes(doctor.toLowerCase())
        );
      }

      if (patientId) {
        list = list.filter((a) => a.patientId === patientId);
      }

      if (date) {
        list = list.filter((a) => a.startTime.startsWith(date));
      } else if (startDate || endDate) {
        const startMs = startDate ? new Date(startDate).getTime() : 0;
        const endMs = endDate ? new Date(endDate).getTime() : Infinity;
        list = list.filter((a) => {
          const t = new Date(a.startTime).getTime();
          return t >= startMs && t <= endMs;
        });
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (a) =>
            a.id.toLowerCase().includes(q) ||
            a.patient.firstName.toLowerCase().includes(q) ||
            a.patient.lastName.toLowerCase().includes(q) ||
            a.patient.phone.includes(q) ||
            a.service.name.toLowerCase().includes(q) ||
            a.treatment?.title.toLowerCase().includes(q)
        );
      }

      // Sort chronological
      list.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      appointments = list.slice((page - 1) * limit, page * limit);
    }

    const serializedAppointments = appointments.map((apt) => {
      let computedPatientName = "Valued Patient";
      if (apt.patientType === "CHILD" && apt.childName) {
        computedPatientName = `${apt.childName} (Child)`;
      } else if (apt.patient) {
        const first = apt.patient.firstName || "";
        const last =
          apt.patient.lastName && apt.patient.lastName !== "Patient"
            ? apt.patient.lastName
            : "";
        computedPatientName = `${first} ${last}`.trim() || "Valued Patient";
      } else if (apt.childName) {
        computedPatientName = apt.childName;
      }

      return {
        ...apt,
        patientName: computedPatientName,
      };
    });

    return NextResponse.json({
      success: true,
      count: serializedAppointments.length,
      page,
      limit,
      appointments: serializedAppointments,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimitCheck = rateLimit(clientIp, BOOKING_RATE_LIMIT);

    if (!rateLimitCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many requests from this IP. Please wait before creating another booking.",
          retryAfterSeconds: rateLimitCheck.resetSeconds,
        },
        { status: 429 }
      );
    }

    const rawBody = await req.json();
    const parseResult = createAppointmentSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed on appointment payload",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Resolve patient names cleanly without placeholder fallbacks
    const rawPatientName = (
      input.patientType === "CHILD" && input.childName
        ? input.childName
        : input.fullName ||
          `${input.firstName || ""} ${input.lastName && input.lastName !== "Patient" ? input.lastName : ""}`.trim() ||
          "Valued Patient"
    ).trim();

    const nameParts = rawPatientName.split(/\s+/).filter(Boolean);
    const derivedFirst = nameParts[0] || "Valued";
    const derivedLast = nameParts.slice(1).join(" ");

    const resolvedFirstName = (
      input.firstName && input.firstName !== "Patient"
        ? input.firstName
        : derivedFirst
    ).trim();

    const resolvedLastName = (
      input.lastName && input.lastName !== "Patient"
        ? input.lastName
        : derivedLast
    ).trim();

    const chosenServiceName =
      input.treatment ||
      input.serviceName ||
      "General Dental Consultation & Checkup";

    // Calculate requested appointment start and end times
    let scheduledDate: Date;
    if (input.startTime) {
      scheduledDate = new Date(input.startTime);
    } else {
      const rawDateStr =
        input.preferredDate ||
        input.appointmentDate ||
        (input as any).date;

      if (rawDateStr) {
        let hour = 10;
        let minute = 0;
        const timeStr = input.timeRange || input.appointmentTime || "";

        if (timeStr.includes("PM") && !timeStr.includes("12:")) {
          const m = timeStr.match(/(\d+):?(\d*)/);
          if (m) hour = (parseInt(m[1], 10) % 12) + 12;
          if (m && m[2]) minute = parseInt(m[2], 10) || 0;
        } else if (timeStr.includes("AM") || (timeStr.includes("12:") && timeStr.includes("PM"))) {
          const m = timeStr.match(/(\d+):?(\d*)/);
          if (m) hour = timeStr.includes("PM") ? 12 : parseInt(m[1], 10) % 12;
          if (m && m[2]) minute = parseInt(m[2], 10) || 0;
        } else if (timeStr.includes("Morning")) {
          hour = 10;
          minute = 30;
        } else if (timeStr.includes("Afternoon")) {
          hour = 14;
          minute = 30;
        } else if (timeStr.includes("Evening")) {
          hour = 17;
          minute = 30;
        }

        scheduledDate = new Date(
          `${rawDateStr}T${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}:00.000Z`
        );
        if (isNaN(scheduledDate.getTime())) {
          scheduledDate = new Date(`${rawDateStr}T10:00:00.000Z`);
        }
      } else {
        scheduledDate = new Date(Date.now() + 86400000);
      }
    }

    const durationMin = input.durationMinutes || 30;
    const endDate = input.endTime
      ? new Date(input.endTime)
      : new Date(scheduledDate.getTime() + durationMin * 60000);

    const CLINIC_DOCTORS = [
      "Dr. Sankar (Chief Dental Surgeon)",
      "Dr. Rohan Shah (Orthodontics)",
      "Dr. New Dental Specialist (Dental Surgeon)",
    ];

    const explicitlyRequestedDoctor = Boolean(input.preferredDoctor);
    let assignedDoctor =
      input.preferredDoctor || "Dr. Sankar (Chief Dental Surgeon)";

    const forceOverride = Boolean(
      (input as any).forceOverride || (input as any).overrideConflict
    );

    const hasOverlapCheck = (existingList: any[], doctorName: string) => {
      return existingList.find((a) => {
        if (["CANCELLED", "DECLINED", "NO_SHOW"].includes(a.status)) return false;
        const docMatches =
          a.preferredDoctor?.toLowerCase() === doctorName.toLowerCase() ||
          a.staffUser?.name?.toLowerCase() === doctorName.toLowerCase();
        if (!docMatches) return false;

        const aStart = new Date(a.startTime).getTime();
        const aEnd = new Date(a.endTime).getTime();
        return scheduledDate.getTime() < aEnd && endDate.getTime() > aStart;
      });
    };

    const cleanDigits = (input.phone || "").replace(/\D/g, "");
    const last10Digits = cleanDigits.slice(-10);

    // Parallelize clinic, doctor overlaps, service lookup, and patient lookup in ONE concurrent round-trip
    let [clinic, overlaps, initialService, matchedPatients] = await Promise.all([
      getCachedClinic(input.clinicSlug),
      !forceOverride
        ? prisma.appointment
            .findMany({
              where: {
                status: { notIn: ["CANCELLED", "DECLINED", "NO_SHOW"] },
                startTime: { lt: endDate },
                endTime: { gt: scheduledDate },
              },
              select: {
                id: true,
                preferredDoctor: true,
                startTime: true,
                endTime: true,
                status: true,
              },
            })
            .catch(() => [])
        : Promise.resolve([]),
      input.serviceId
        ? prisma.service.findUnique({ where: { id: input.serviceId } }).catch(() => null)
        : chosenServiceName
          ? prisma.service
              .findFirst({
                where: { name: chosenServiceName },
              })
              .catch(() => null)
          : Promise.resolve(null),
      prisma.patient
        .findMany({
          where: {
            OR: [
              { phone: input.phone },
              ...(last10Digits && last10Digits.length >= 7
                ? [{ phone: { contains: last10Digits } }]
                : []),
            ],
          },
        })
        .catch(() => []),
    ]);

    // Match existing patient by first name (case-insensitive)
    let existingPatient = (matchedPatients || []).find(
      (p: any) =>
        p.firstName.trim().toLowerCase() === resolvedFirstName.toLowerCase()
    );

    // If no exact first-name match, but only 1 candidate exists with a placeholder name (e.g. "Patient" or "Valued")
    if (!existingPatient && matchedPatients && matchedPatients.length === 1) {
      const single = matchedPatients[0];
      const isPlaceholder =
        single.firstName.toLowerCase() === "valued" ||
        single.firstName.toLowerCase() === "patient" ||
        single.lastName === "Patient";

      if (isPlaceholder) {
        existingPatient = single;
      }
    }

    // If an existing patient was matched and new details were entered, upgrade their record
    if (existingPatient) {
      const needsUpdate =
        (resolvedLastName && existingPatient.lastName !== resolvedLastName && (existingPatient.lastName === "Patient" || !existingPatient.lastName)) ||
        (existingPatient.firstName.toLowerCase() !== resolvedFirstName.toLowerCase() && (existingPatient.firstName.toLowerCase() === "valued" || existingPatient.firstName.toLowerCase() === "patient")) ||
        (input.email && !existingPatient.email);

      if (needsUpdate) {
        existingPatient = await prisma.patient
          .update({
            where: { id: existingPatient.id },
            data: {
              firstName:
                existingPatient.firstName.toLowerCase() === "valued" || existingPatient.firstName.toLowerCase() === "patient"
                  ? resolvedFirstName
                  : existingPatient.firstName,
              lastName: resolvedLastName || (existingPatient.lastName === "Patient" ? "" : existingPatient.lastName),
              email: input.email || existingPatient.email,
            },
          })
          .catch(() => existingPatient);
      }
    }

    let conflictingAppointment: any = null;

    if (!forceOverride) {
      if (explicitlyRequestedDoctor) {
        // Patient explicitly chose this doctor
        const match = overlaps.find(
          (a) =>
            a.preferredDoctor?.toLowerCase() === assignedDoctor.toLowerCase()
        );
        if (match) {
          conflictingAppointment = match;
        } else {
          conflictingAppointment = hasOverlapCheck(
            inMemoryStore.getAppointments(),
            assignedDoctor
          );
        }
      } else {
        // Patient did not specify doctor: auto-assign to an available specialist
        const busyDoctors = new Set(
          overlaps.map((a) => a.preferredDoctor?.toLowerCase()).filter(Boolean)
        );
        const freeDoctor = CLINIC_DOCTORS.find(
          (doc) => !busyDoctors.has(doc.toLowerCase())
        );

        if (freeDoctor) {
          assignedDoctor = freeDoctor;
        } else if (overlaps.length > 0) {
          conflictingAppointment = overlaps[0];
        } else {
          conflictingAppointment = hasOverlapCheck(
            inMemoryStore.getAppointments(),
            assignedDoctor
          );
        }
      }
    }

    if (conflictingAppointment) {
      const conflictStart = new Date(conflictingAppointment.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const conflictEnd = new Date(conflictingAppointment.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return NextResponse.json(
        {
          success: false,
          conflict: true,
          message: `Time slot conflict: All available doctors are scheduled from ${conflictStart} to ${conflictEnd}. Please select an alternative time slot.`,
        },
        { status: 409 }
      );
    }

    const consolidatedNotes = [
      input.patientType === "CHILD" && input.guardianName
        ? `Parent/Guardian: ${input.guardianName}`
        : null,
      assignedDoctor ? `Doctor: ${assignedDoctor}` : null,
      input.sessionNumber
        ? `Session ${input.sessionNumber}/${input.totalSessions || 1}`
        : null,
      input.timeRange ? `Time Slot: ${input.timeRange}` : null,
      input.contactMethod ? `Contact Via: ${input.contactMethod}` : null,
      input.notes,
    ]
      .filter(Boolean)
      .join(" | ");

    let createdAppointment: any;

    try {
      // Treatment connection (Requirement 4)
      let treatmentId = input.treatmentId || null;
      if (!treatmentId && input.totalSessions && input.totalSessions > 1) {
        // Need existing patient for treatment
        let patient = existingPatient;
        if (!patient) {
          patient = await prisma.patient.create({
            data: {
              clinicId: clinic.id,
              firstName: resolvedFirstName,
              lastName: resolvedLastName,
              email: input.email || null,
              phone: input.phone,
              medicalNotes: consolidatedNotes,
            },
          });
          existingPatient = patient;
        }

        let service = initialService;
        if (!service) {
          service = await prisma.service.create({
            data: {
              clinicId: clinic.id,
              name: chosenServiceName,
              price: input.totalAmount || 0.0,
              durationMinutes: durationMin,
            },
          });
          initialService = service;
        }

        const treatment = await prisma.treatment.create({
          data: {
            clinicId: clinic.id,
            patientId: patient.id,
            serviceId: service.id,
            title: chosenServiceName,
            treatmentType: service.category || chosenServiceName,
            status: "IN_PROGRESS",
            totalSessions: input.totalSessions || 1,
            completedSessions: 0,
            totalAmount: input.totalAmount || service.price || 0.0,
            paidAmount: input.paidAmount || 0.0,
            dentistName: assignedDoctor,
            startDate: scheduledDate,
          },
        });
        treatmentId = treatment.id;
      }

      const validSources = [
        "MANUAL",
        "AI_BOOKING",
        "WHATSAPP",
        "WEB_FORM",
        "WEBSITE",
        "PHONE",
        "WALK_IN",
        "ADMIN",
        "OTHER",
      ];
      const safeSource = validSources.includes(input.source as any)
        ? (input.source as any)
        : "WEB_FORM";

      // Create appointment with clean relational connects/creates
      const appointmentData: any = {
        clinic: { connect: { id: clinic.id } },
        startTime: scheduledDate,
        endTime: endDate,
        status: "PENDING",
        source: safeSource,
        notes: consolidatedNotes,
        reason: input.reason || chosenServiceName,
        patientType: input.patientType || "ADULT",
        childName: input.childName || null,
        guardianName: input.guardianName || null,
        preferredDoctor: assignedDoctor,
        timeRange: input.timeRange || null,
        contactMethod: input.contactMethod || "PHONE",
        consentAgreed: input.consentAgreed ?? true,
        paidAmount: input.paidAmount || 0.0,
        totalAmount: input.totalAmount || 0.0,
        paymentStatus: input.paymentStatus || "PENDING",
      };

      if (treatmentId) {
        appointmentData.treatment = { connect: { id: treatmentId } };
      }

      if (existingPatient) {
        appointmentData.patient = { connect: { id: existingPatient.id } };
      } else {
        appointmentData.patient = {
          create: {
            clinicId: clinic.id,
            firstName: resolvedFirstName,
            lastName: resolvedLastName,
            email: input.email || null,
            phone: input.phone,
            medicalNotes: consolidatedNotes,
          },
        };
      }

      if (initialService) {
        appointmentData.service = { connect: { id: initialService.id } };
      } else {
        appointmentData.service = {
          create: {
            clinicId: clinic.id,
            name: chosenServiceName,
            price: input.totalAmount || 0.0,
            durationMinutes: durationMin,
          },
        };
      }

      createdAppointment = await prisma.appointment.create({
        data: appointmentData,
        include: {
          patient: true,
          service: true,
          treatment: true,
        },
      });

      // If tied to treatment, create treatment session record
      if (treatmentId) {
        const sessionNumber = input.sessionNumber || 1;
        const session = await prisma.treatmentSession.create({
          data: {
            treatmentId,
            appointmentId: createdAppointment.id,
            sessionNumber,
            totalSessions: input.totalSessions || 1,
            status: "PENDING",
            procedure: input.reason || chosenServiceName,
            amount: input.totalAmount || 0.0,
            paidAmount: input.paidAmount || 0.0,
            paymentStatus: input.paymentStatus || "PENDING",
          },
        });
        createdAppointment.treatmentSession = session;
      }

      // Log initial creation audit entry in background (non-blocking)
      prisma.auditLog
        .create({
          data: {
            clinicId: clinic.id,
            appointmentId: createdAppointment.id,
            action: "APPOINTMENT_REQUESTED",
            entityType: "Appointment",
            entityId: createdAppointment.id,
            performedBy:
              safeSource === "ADMIN"
                ? "Clinic Admin Desk"
                : safeSource === "WHATSAPP"
                  ? "WhatsApp Inquiry"
                  : "Online Booking Patient",
            details: `Appointment booked for ${chosenServiceName} with ${assignedDoctor} on ${scheduledDate.toISOString()}`,
            newValues: {
              status: "PENDING",
              source: safeSource,
              doctor: assignedDoctor,
              startTime: scheduledDate.toISOString(),
            },
          },
        })
        .catch(() => {});
    } catch (dbErr) {
      console.error("Prisma appointment save error:", dbErr);
      // In-Memory Fallback
      const newId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
      const patientId = input.patientId || `PAT-${Math.floor(100 + Math.random() * 900)}`;

      let treatment = input.treatmentId
        ? inMemoryStore.getTreatment(input.treatmentId)
        : undefined;

      if (!treatment && input.totalSessions && input.totalSessions > 1) {
        treatment = inMemoryStore.saveTreatment({
          id: `TRT-${Math.floor(1000 + Math.random() * 9000)}`,
          clinicId: "clinic-default",
          patientId,
          title: chosenServiceName,
          treatmentType: chosenServiceName,
          status: "IN_PROGRESS",
          totalSessions: input.totalSessions,
          completedSessions: 0,
          totalAmount: input.totalAmount || 0,
          paidAmount: input.paidAmount || 0,
          dentistName: assignedDoctor,
          startDate: scheduledDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      let session = undefined;
      if (treatment) {
        session = inMemoryStore.saveTreatmentSession({
          id: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
          treatmentId: treatment.id,
          appointmentId: newId,
          sessionNumber: input.sessionNumber || 1,
          totalSessions: treatment.totalSessions,
          status: "PENDING",
          amount: input.totalAmount || 0,
          paidAmount: input.paidAmount || 0,
          paymentStatus: input.paymentStatus || "PENDING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      createdAppointment = {
        id: newId,
        patientId,
        startTime: scheduledDate.toISOString(),
        endTime: endDate.toISOString(),
        status: "PENDING",
        source: input.source || "MANUAL",
        notes: consolidatedNotes,
        reason: input.reason || chosenServiceName,
        patientType: input.patientType || "ADULT",
        childName: input.childName || null,
        guardianName: input.guardianName || null,
        preferredDoctor: assignedDoctor,
        timeRange: input.timeRange || null,
        contactMethod: input.contactMethod || "PHONE",
        consentAgreed: input.consentAgreed ?? true,
        treatmentId: treatment?.id,
        treatment,
        treatmentSessionId: session?.id,
        treatmentSession: session,
        paidAmount: input.paidAmount || 0,
        totalAmount: input.totalAmount || 0,
        paymentStatus: input.paymentStatus || "PENDING",
        patient: {
          id: patientId,
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
          email: input.email || undefined,
          phone: input.phone,
        },
        service: {
          name: chosenServiceName,
          price: input.totalAmount || 0,
          durationMinutes: durationMin,
        },
        staffUser: {
          name: assignedDoctor,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryStore.saveAppointment(createdAppointment);
    }

    // Optional patient email notification (fire and forget asynchronously)
    if (input.email) {
      try {
        const emailContent = renderBookingRequestReceivedEmail({
          patientName: `${resolvedFirstName} ${resolvedLastName}`,
          serviceName: chosenServiceName,
          appointmentDate: scheduledDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          appointmentTime: scheduledDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        });

        sendEmail({
          to: input.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }).catch(() => {});
      } catch {
        // Safe fail
      }
    }

    const finalPatientName =
      createdAppointment.patientType === "CHILD" && createdAppointment.childName
        ? `${createdAppointment.childName} (Child)`
        : `${resolvedFirstName} ${resolvedLastName}`.trim() || "Valued Patient";

    createdAppointment.patientName = finalPatientName;

    return NextResponse.json(
      {
        success: true,
        message: "Appointment successfully scheduled",
        appointment: createdAppointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to schedule appointment",
      },
      { status: 500 }
    );
  }
}
