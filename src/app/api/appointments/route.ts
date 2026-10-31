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
import { appendPatientToGoogleSheet } from "@/lib/google-sheets/google-sheet-sync";
import { getPatientCode, assignPatientCode } from "@/lib/patient-numbering-store";
import { getDoctorsList } from "@/lib/doctors-store";
import {
  isDateToday,
  parseSlotToMinutes,
  getSlotScheduledTime,
} from "@/lib/booking-time-utils";
import {
  getCachedAppointmentsList,
  setCachedAppointmentsList,
  invalidateAppointmentsCache,
} from "@/lib/appointments-cache";

// Concurrency mutex to serialize rapid concurrent bookings for the same patient/phone & date
const activeBookingPromises = new Map<string, Promise<any>>();

// Global in-memory cache for clinic and services to eliminate roundtrips on every booking
const globalClinicCache = globalThis as unknown as {
  __cachedClinic?: any;
  __cachedClinicExpiry?: number;
  __cachedServicesMap?: Map<string, any>;
  __cachedServicesList?: any[];
  __cachedServicesExpiry?: number;
};

async function getCachedClinic(clinicSlug?: string) {
  const now = Date.now();
  if (globalClinicCache.__cachedClinic && now < (globalClinicCache.__cachedClinicExpiry || 0)) {
    return globalClinicCache.__cachedClinic;
  }
  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: "CA Smile Dental Clinic",
        slug: clinicSlug || "ca-smile-dental-clinic",
        themeKey: "teal-serenity",
      },
    });
  }
  globalClinicCache.__cachedClinic = clinic;
  globalClinicCache.__cachedClinicExpiry = now + 60 * 60 * 1000; // Cache for 1 hour
  return clinic;
}

async function getCachedService(serviceName?: string, serviceId?: string) {
  const now = Date.now();
  if (!globalClinicCache.__cachedServicesList || globalClinicCache.__cachedServicesList.length === 0 || now > (globalClinicCache.__cachedServicesExpiry || 0)) {
    try {
      const allServices = await prisma.service.findMany();
      globalClinicCache.__cachedServicesList = allServices;
      const sMap = new Map<string, any>();
      for (const s of allServices) {
        sMap.set(s.id, s);
        sMap.set(s.name.trim().toLowerCase(), s);
      }
      globalClinicCache.__cachedServicesMap = sMap;
      globalClinicCache.__cachedServicesExpiry = now + 60 * 60 * 1000; // Cache for 1 hour
    } catch {}
  }

  const sMap = globalClinicCache.__cachedServicesMap;
  if (serviceId && sMap?.has(serviceId)) {
    return sMap.get(serviceId);
  }
  if (serviceName && sMap?.has(serviceName.trim().toLowerCase())) {
    return sMap.get(serviceName.trim().toLowerCase());
  }
  return globalClinicCache.__cachedServicesList?.[0] || null;
}

// Rate limit: 10 requests per 60 seconds per IP
const BOOKING_RATE_LIMIT = { limit: 10, windowMs: 60000 };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Fast cache check for repeated GET requests
    const cacheKey = req.url;
    const cachedResponse = getCachedAppointmentsList(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          "Cache-Control": "private, no-cache, no-transform",
          "X-Cache": "HIT",
        },
      });
    }

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
          treatment: true,
          treatmentSession: true,
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

      const patientKey = apt.patient?.id || apt.patientId || apt.id;
      const patientCode = getPatientCode(patientKey, apt.createdAt);

      return {
        ...apt,
        patientName: computedPatientName,
        patientCode,
        patient: apt.patient
          ? {
              ...apt.patient,
              patientCode,
            }
          : apt.patient,
      };
    });

    const responseData = {
      success: true,
      count: serializedAppointments.length,
      page,
      limit,
      appointments: serializedAppointments,
    };

    setCachedAppointmentsList(cacheKey, responseData);

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "private, no-cache, no-transform",
        "X-Cache": "MISS",
      },
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
    const t0 = Date.now();
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

    // Anti-spam bot honeypot detection: silently discard automated bot submissions
    if (rawBody.patient_hp_trap || rawBody.honeypot || rawBody.website) {
      return NextResponse.json({
        success: true,
        appointment: {
          id: `APT-${Date.now()}`,
          patientName: rawBody.fullName || "Valued Patient",
          status: "PENDING",
        },
        message: "Appointment booked successfully",
      });
    }

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

    const rawDateStr =
      input.preferredDate ||
      input.appointmentDate ||
      (input as any).date;

    const timeStr = input.timeRange || input.appointmentTime || "";

    const forceOverride = Boolean(
      (input as any).forceOverride || (input as any).overrideConflict
    );

    // Calculate requested appointment start and end times
    let scheduledDate: Date;
    if (input.startTime) {
      scheduledDate = new Date(input.startTime);
    } else if (rawDateStr) {
      const { startTime } = getSlotScheduledTime(rawDateStr, timeStr);
      scheduledDate = startTime;
    } else {
      scheduledDate = new Date(Date.now() + 86400000);
    }

    // If scheduled date is on today's date (or rawDateStr is today):
    // Check if the requested session is still active/in-progress today.
    // If the patient is booking during an active session (e.g. Evening 5:00 PM - 7:30 PM at 5:23 PM),
    // adjust scheduledDate to upcoming minutes so patients can successfully book today's active session.
    const checkDateRef = rawDateStr || scheduledDate;
    if (isDateToday(checkDateRef) && timeStr) {
      const { startMinutes, endMinutes } = parseSlotToMinutes(timeStr);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // If current time is before the session end (with 5-minute buffer)
      if (currentMinutes < endMinutes - 5) {
        if (scheduledDate.getTime() < Date.now()) {
          const upcomingMin = Math.min(
            endMinutes - 10,
            Math.ceil((currentMinutes + 2) / 5) * 5
          );
          scheduledDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            Math.floor(upcomingMin / 60),
            upcomingMin % 60,
            0,
            0
          );
        }
      }
    }

    // Strict validation: Reject appointments scheduled in the past
    // Provide a 5-minute grace buffer for client submission/network latency
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (scheduledDate.getTime() < fiveMinutesAgo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot book an appointment for a past date or time. Please select an upcoming slot.",
          error: "Selected appointment time has already passed.",
        },
        { status: 400 }
      );
    }

    const durationMin = input.durationMinutes || 30;
    let endDate = input.endTime ? new Date(input.endTime) : null;
    if (!endDate || isNaN(endDate.getTime()) || endDate.getTime() <= scheduledDate.getTime()) {
      endDate = new Date(scheduledDate.getTime() + durationMin * 60000);
    }

    const registeredDoctorsList = (() => {
      try {
        const list = getDoctorsList();
        if (Array.isArray(list) && list.length > 0) {
          return list.map((d) => d.name);
        }
      } catch {}
      return ["Dr. Deep Arvindbhai Patel"];
    })();

    const CLINIC_DOCTORS = registeredDoctorsList;

    const explicitlyRequestedDoctor = Boolean(input.preferredDoctor);
    let assignedDoctor =
      input.preferredDoctor || registeredDoctorsList[0] || "Dr. Deep Arvindbhai Patel";

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

    const phoneVariants = Array.from(
      new Set(
        [
          input.phone,
          cleanDigits,
          last10Digits,
          `+91${last10Digits}`,
          `+91 ${last10Digits}`,
          `0${last10Digits}`,
        ].filter((p) => Boolean(p && p.length >= 7))
      )
    );

    // Concurrency Lock: Serialize rapid simultaneous requests for the same patient on this date
    const bookingLockKey = `${last10Digits || input.phone}_${scheduledDate.toISOString().slice(0, 10)}`;
    const pendingFlight = activeBookingPromises.get(bookingLockKey);
    if (pendingFlight) {
      try {
        await pendingFlight;
      } catch {}
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    activeBookingPromises.set(bookingLockKey, lockPromise);

    try {
      const tPreParallel = Date.now();
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
        getCachedService(chosenServiceName, input.serviceId),
        prisma.patient
          .findMany({
            where: {
              phone: { in: phoneVariants },
            },
            take: 5,
          })
          .catch(() => []),
      ]);

    // 1. Direct match by patientId if provided
    let existingPatient: any = null;
    if (input.patientId) {
      existingPatient = await prisma.patient
        .findUnique({ where: { id: input.patientId } })
        .catch(() => null);
    }

    // 2. Match existing patient by first name (case-insensitive) from phone match
    if (!existingPatient) {
      existingPatient = (matchedPatients || []).find(
        (p: any) =>
          p.firstName.trim().toLowerCase() === resolvedFirstName.toLowerCase()
      );
    }

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

    // -------------------------------------------------------------------------
    // DEDUPLICATION / IDEMPOTENCY GUARD:
    // If an appointment was already created for this exact patient (or same phone)
    // within 15 minutes of the requested slot, or created in the last 20 seconds,
    // return the existing appointment idempotently to prevent duplicate bookings!
    // -------------------------------------------------------------------------
    try {
      const candidatePatientIds = [
        existingPatient?.id,
        input.patientId,
        ...(matchedPatients || []).map((p: any) => p.id),
      ].filter(Boolean);

      // Only perform duplicate check if there are known matching patient IDs
      if (candidatePatientIds.length > 0) {
        const recentDuplicate = await prisma.appointment.findFirst({
          where: {
            patientId: { in: candidatePatientIds },
            status: { notIn: ["CANCELLED", "DECLINED"] },
            OR: [
              {
                startTime: {
                  gte: new Date(scheduledDate.getTime() - 15 * 60 * 1000),
                  lte: new Date(scheduledDate.getTime() + 15 * 60 * 1000),
                },
              },
              {
                createdAt: {
                  gte: new Date(Date.now() - 20 * 1000),
                },
              },
            ],
          },
          include: {
            patient: true,
            service: true,
          },
          orderBy: { createdAt: "desc" },
        });

        if (recentDuplicate) {
          console.log(
            `[Deduplication] Prevented duplicate appointment creation for phone ${input.phone}. Returning existing appointment ${recentDuplicate.id}`
          );
          const patientKey = recentDuplicate.patient?.id || recentDuplicate.patientId || recentDuplicate.id;
          const patientCode = getPatientCode(patientKey, recentDuplicate.createdAt);
          return NextResponse.json(
            {
              success: true,
              message: "Appointment already scheduled",
              appointment: {
                ...recentDuplicate,
                patientName: `${resolvedFirstName} ${resolvedLastName}`.trim() || "Valued Patient",
                patientCode,
              },
              duplicatePrevented: true,
            },
            { status: 200 }
          );
        }
      }
    } catch (dupErr) {
      console.warn("Deduplication lookup check failed, continuing:", dupErr);
    }

    // If an existing patient was matched and new details were entered, upgrade their record in background
    if (existingPatient) {
      const needsUpdate =
        (resolvedLastName && existingPatient.lastName !== resolvedLastName && (existingPatient.lastName === "Patient" || !existingPatient.lastName)) ||
        (existingPatient.firstName.toLowerCase() !== resolvedFirstName.toLowerCase() && (existingPatient.firstName.toLowerCase() === "valued" || existingPatient.firstName.toLowerCase() === "patient")) ||
        (input.email && !existingPatient.email);

      if (needsUpdate) {
        setImmediate(() => {
          prisma.patient
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
            .catch(() => {});
        });
      }
    }

    // All slots are available - do not block bookings with time slot conflicts
    if (!explicitlyRequestedDoctor) {
      const busyDoctors = new Set(
        overlaps.map((a) => a.preferredDoctor?.toLowerCase()).filter(Boolean)
      );
      const freeDoctor = CLINIC_DOCTORS.find(
        (doc) => !busyDoctors.has(doc.toLowerCase())
      );
      if (freeDoctor) {
        assignedDoctor = freeDoctor;
      }
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
    let safeSource = "MANUAL";
    if (input.source) {
      if (input.source === "CLINIC_ADMIN" || input.source === "ADMIN") {
        safeSource = "ADMIN";
      } else if (validSources.includes(input.source as any)) {
        safeSource = input.source as any;
      } else {
        safeSource = "WEB_FORM";
      }
    }

    // Determine appropriate status (Web/Contact form defaults to PENDING, Admin defaults to CONFIRMED)
    let appointmentStatus = "CONFIRMED";
    if (input.status) {
      appointmentStatus = input.status;
    } else if (
      safeSource === "WEB_FORM" ||
      safeSource === "WEBSITE" ||
      safeSource === "WHATSAPP"
    ) {
      appointmentStatus = "PENDING";
    }

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


      // Create appointment with direct foreign keys for high-speed insert
      const appointmentData: any = {
        clinicId: clinic.id,
        startTime: scheduledDate,
        endTime: endDate,
        status: appointmentStatus,
        source: safeSource,
        notes: consolidatedNotes,
        reason: input.reason || chosenServiceName,
        patientType: input.patientType || null,
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

      let serviceId = initialService?.id;
      if (!serviceId) {
        const newService = await prisma.service.create({
          data: {
            clinicId: clinic.id,
            name: chosenServiceName,
            price: input.totalAmount || 0.0,
            durationMinutes: durationMin,
          },
          select: { id: true, name: true, durationMinutes: true, price: true },
        });
        initialService = newService;
        serviceId = newService.id;
      }

      let patientId = existingPatient?.id;
      let patientObj = existingPatient;

      if (!patientId) {
        patientObj = await prisma.patient.create({
          data: {
            clinicId: clinic.id,
            firstName: resolvedFirstName,
            lastName: resolvedLastName,
            email: input.email || null,
            phone: input.phone,
            medicalNotes: consolidatedNotes,
          },
        });
        patientId = patientObj.id;
        existingPatient = patientObj;
      }

      appointmentData.patientId = patientId;
      appointmentData.serviceId = serviceId;
      if (treatmentId) {
        appointmentData.treatmentId = treatmentId;
      }

      const rawCreated = await prisma.appointment.create({
        data: appointmentData,
      });

      createdAppointment = {
        ...rawCreated,
        patient: patientObj,
        service: initialService,
      };

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
        status: appointmentStatus,
        source: safeSource,
        notes: consolidatedNotes,
        reason: input.reason || chosenServiceName,
        patientType: input.patientType || null,
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

    const finalPatientName =
      createdAppointment.patientType === "CHILD" && createdAppointment.childName
        ? `${createdAppointment.childName} (Child)`
        : `${resolvedFirstName} ${resolvedLastName}`.trim() || "Valued Patient";

    createdAppointment.patientName = finalPatientName;

    const patientKey =
      createdAppointment.patient?.id ||
      createdAppointment.patientId ||
      existingPatient?.id ||
      createdAppointment.id;
    const patientCode = assignPatientCode(patientKey, createdAppointment.createdAt);
    createdAppointment.patientCode = patientCode;
    if (createdAppointment.patient) {
      createdAppointment.patient.patientCode = patientCode;
    }

    // Schedule email notification and Google Sheet sync in background without delaying HTTP response
    setImmediate(() => {
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

      // Live auto-store patient in external Google Sheet
      appendPatientToGoogleSheet({
        id: createdAppointment.id,
        name: finalPatientName,
        phone: input.phone,
        email: input.email,
        service: chosenServiceName,
        doctor: assignedDoctor,
        dateTime: scheduledDate.toISOString(),
        amount: input.totalAmount || 0,
        source: input.source || "WEB_FORM",
      }).catch(() => {});
    });

      // Invalidate appointment caches immediately so admin/today and appointments views get fresh data
      invalidateAppointmentsCache();

      return NextResponse.json(
        {
          success: true,
          message: "Appointment successfully scheduled",
          appointment: createdAppointment,
        },
        { status: 201 }
      );
    } finally {
      releaseLock();
      activeBookingPromises.delete(bookingLockKey);
    }
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
