import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { appendPatientToGoogleSheet } from "@/lib/google-sheets/google-sheet-sync";
import { inMemoryStore } from "@/lib/in-memory-store";

export const dynamic = "force-dynamic";

const QUEUE_ORDER_FILE = path.join(process.cwd(), "src", "data", "today-queue-order.json");

function getQueueOrder(dateStr: string): string[] {
  try {
    if (fs.existsSync(QUEUE_ORDER_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUEUE_ORDER_FILE, "utf-8"));
      return data[dateStr] || [];
    }
  } catch (err) {
    console.error("Error reading queue order file:", err);
  }
  return [];
}

function saveQueueOrder(dateStr: string, order: string[]) {
  try {
    const dir = path.dirname(QUEUE_ORDER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let data: Record<string, string[]> = {};
    if (fs.existsSync(QUEUE_ORDER_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(QUEUE_ORDER_FILE, "utf-8"));
      } catch {}
    }
    data[dateStr] = order;
    fs.writeFileSync(QUEUE_ORDER_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving queue order file:", err);
  }
}

/**
 * GET /api/admin/today?date=YYYY-MM-DD
 * Fetch all appointments for the specified date (defaults to current local date)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    // Default to current date in India timezone YYYY-MM-DD (e.g. "2026-10-27")
    const localDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(now);
    const defaultDateStr = now.toISOString().split("T")[0];
    const targetDateStr = searchParams.get("date") || localDateStr || defaultDateStr;

    // Buffer query range (+/- 6 hours) to account for UTC vs IST offsets
    const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);
    const bufferedStart = new Date(startOfDay.getTime() - 6 * 3600 * 1000);
    const bufferedEnd = new Date(endOfDay.getTime() + 6 * 3600 * 1000);

    const clinic = await prisma.clinic.findFirst().catch(() => null);

    // Fetch appointments from Prisma
    let appointments: any[] = [];
    let dbSuccess = false;
    try {
      const rawAppointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: bufferedStart,
            lte: bufferedEnd,
          },
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              gender: true,
              medicalNotes: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
              durationMinutes: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });

      // Filter to ensure appointment strictly belongs to target date in either UTC or local IST
      appointments = rawAppointments.filter((apt) => {
        const aptDateUtc = new Date(apt.startTime).toISOString().split("T")[0];
        const aptDateIst = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date(apt.startTime));
        return aptDateUtc === targetDateStr || aptDateIst === targetDateStr;
      });
      dbSuccess = true;
    } catch (dbErr) {
      console.warn("Prisma today fetch error, relying on in-memory store:", dbErr);
    }

    // Only merge in-memory store appointments if database query failed
    if (!dbSuccess) {
      try {
        const memAppointments = inMemoryStore.getAppointments();
        const existingIds = new Set(appointments.map((a) => a.id));
        for (const m of memAppointments) {
          if (!existingIds.has(m.id) && !m.id.startsWith("apt-sample-")) {
            const mDateUtc = new Date(m.startTime).toISOString().split("T")[0];
            const mDateIst = new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Kolkata",
            }).format(new Date(m.startTime));
            if (mDateUtc === targetDateStr || mDateIst === targetDateStr) {
              appointments.push({
                id: m.id,
                startTime: new Date(m.startTime),
                endTime: new Date(m.endTime || m.startTime),
                status: m.status,
                source: m.source || "ADMIN",
                notes: m.notes || "",
                reason: m.reason || m.service?.name || "General Consultation",
                preferredDoctor: m.preferredDoctor || (m as any).dentistName || "Dr. Deep Arvindbhai Patel",
                patientId: m.patientId,
                patient: m.patient,
                serviceId: (m as any).serviceId || m.service?.id || "service-default",
                service: m.service,
                checkedInAt: m.checkedInAt ? new Date(m.checkedInAt) : null,
                treatmentStartedAt: m.treatmentStartedAt ? new Date(m.treatmentStartedAt) : null,
                paidAmount: m.paidAmount,
                totalAmount: m.totalAmount,
                paymentStatus: m.paymentStatus,
              });
            }
          }
        }
      } catch (memErr) {
        console.error("In-memory merge error:", memErr);
      }
    }



    // Read stored queue order
    const customOrder = getQueueOrder(targetDateStr);
    const orderMap = new Map<string, number>();
    customOrder.forEach((id, idx) => orderMap.set(id, idx));

    // Sort appointments: custom queue order first, then start time
    const sortedAppointments = [...appointments].sort((a, b) => {
      const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
      const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
      if (idxA !== idxB) return idxA - idxB;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    // Format appointments for receptionist UI
    const formatted = sortedAppointments.map((apt, index) => {
      const patientName = apt.patient
        ? `${apt.patient.firstName} ${apt.patient.lastName}`.trim()
        : "Walk-in Patient";

      const timeStr = new Date(apt.startTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Calculate waiting minutes if checked in
      let waitingMinutes = 0;
      if (apt.checkedInAt) {
        const diffMs = Date.now() - new Date(apt.checkedInAt).getTime();
        waitingMinutes = Math.max(0, Math.floor(diffMs / 60000));
      }

      const notesLower = (apt.notes || "").toLowerCase();
      const reasonLower = (apt.reason || "").toLowerCase();
      const srvLower = (apt.service?.name || "").toLowerCase();
      const statusUpper = (apt.status || "").toUpperCase();

      const isRescheduled =
        Boolean((apt as any).rescheduledAt) ||
        statusUpper === "RESCHEDULED" ||
        notesLower.includes("reschedul") ||
        reasonLower.includes("reschedul");

      const isFollowUp =
        statusUpper === "FOLLOW_UP" ||
        statusUpper === "FOLLOW-UP" ||
        notesLower.includes("follow-up") ||
        notesLower.includes("follow up") ||
        notesLower.includes("followup") ||
        notesLower.includes("revisit") ||
        reasonLower.includes("follow-up") ||
        reasonLower.includes("follow up") ||
        srvLower.includes("follow-up") ||
        srvLower.includes("follow up");

      return {
        id: apt.id,
        tokenNumber: index + 1,
        patientId: apt.patientId,
        patientName,
        phone: apt.patient?.phone || "—",
        email: apt.patient?.email || "",
        gender: apt.patient?.gender || "Not specified",
        serviceId: apt.serviceId,
        serviceName: apt.service?.name || apt.reason || "General Consultation",
        doctor: apt.preferredDoctor || "Dr. Sankar (Chief Dental Surgeon)",
        timeSlot: timeStr,
        startTime: apt.startTime.toISOString(),
        status: apt.status,
        source: apt.source, // "WEBSITE" | "WHATSAPP" | "WALK_IN" | "PHONE" | "WEB_FORM"
        notes: apt.notes || "",
        reason: apt.reason || "",
        checkedInAt: apt.checkedInAt ? apt.checkedInAt.toISOString() : null,
        treatmentStartedAt: apt.treatmentStartedAt ? apt.treatmentStartedAt.toISOString() : null,
        waitingMinutes,
        paidAmount: apt.paidAmount ? String(apt.paidAmount) : "0",
        totalAmount: apt.totalAmount ? String(apt.totalAmount) : "0",
        paymentStatus: apt.paymentStatus || "PENDING",
        isRescheduled,
        isFollowUp,
      };
    });

    // Compute live metrics
    const metrics = {
      total: formatted.length,
      website: formatted.filter((a) => a.source === "WEBSITE" || a.source === "WEB_FORM").length,
      whatsapp: formatted.filter((a) => a.source === "WHATSAPP").length,
      walkIn: formatted.filter((a) => a.source === "WALK_IN" || a.source === "MANUAL" || a.source === "PHONE").length,
      waiting: formatted.filter((a) => a.status === "CHECKED_IN").length,
      inChair: formatted.filter((a) => a.status === "TREATMENT_STARTED" || a.status === "IN_PROGRESS").length,
      completed: formatted.filter((a) => a.status === "COMPLETED" || a.status === "TREATMENT_DONE").length,
      pending: formatted.filter((a) => a.status === "PENDING").length,
      notThere: formatted.filter((a) => a.status === "NO_SHOW").length,
      confirmed: formatted.filter((a) => a.status === "CONFIRMED").length,
    };

    return NextResponse.json({
      success: true,
      date: targetDateStr,
      metrics,
      appointments: formatted,
    });
  } catch (err: any) {
    console.error("GET /api/admin/today error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/today
 * Add a new booking (Walk-in, WhatsApp, or Website) to Today's Queue
 * Can use an existing patient or create a new patient
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId, // Optional: if selecting an existing patient
      firstName,
      lastName,
      phone,
      email,
      serviceId,
      serviceName,
      doctor,
      source = "WALK_IN", // "WALK_IN" | "WHATSAPP" | "WEBSITE" | "PHONE"
      status = "CHECKED_IN", // Defaults to Checked-In (waiting in reception lounge)
      notes = "",
      position = "bottom", // "top" (place first in queue) or "bottom"
      targetDate,
      timeSlot,
    } = body;

    const clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      return NextResponse.json({ success: false, error: "No clinic found." }, { status: 400 });
    }

    let finalPatientId = patientId;

    // 1. If no existing patientId provided, find by phone or create new patient
    if (!finalPatientId) {
      if (!firstName || !phone) {
        return NextResponse.json(
          { success: false, error: "Patient name and phone number are required." },
          { status: 400 }
        );
      }

      // Check if patient with same phone exists
      const cleanPhone = phone.trim();
      let existingPatient = await prisma.patient.findFirst({
        where: { phone: { contains: cleanPhone.slice(-10) } },
      });

      if (!existingPatient) {
        existingPatient = await prisma.patient.create({
          data: {
            clinicId: clinic.id,
            firstName: firstName.trim(),
            lastName: (lastName || "").trim(),
            phone: cleanPhone,
            email: email ? email.trim() : null,
            medicalNotes: notes || `Registered via Reception Desk on ${new Date().toLocaleDateString()}`,
          },
        });
      }
      finalPatientId = existingPatient.id;
    }

    // 2. Resolve Service
    let finalServiceId = serviceId;
    if (!finalServiceId) {
      const defaultService = await prisma.service.findFirst({
        where: { clinicId: clinic.id },
      });
      finalServiceId = defaultService?.id;
    }

    if (!finalServiceId) {
      const createdService = await prisma.service.create({
        data: {
          clinicId: clinic.id,
          name: serviceName || "General Dental Consultation",
          durationMinutes: 30,
          price: 0,
        },
      });
      finalServiceId = createdService.id;
    }

    // 3. Resolve Date & Times
    const todayStr = targetDate || new Date().toISOString().split("T")[0];
    let hour = 10;
    let minute = 0;
    if (timeSlot) {
      if (timeSlot.includes("PM") && !timeSlot.includes("12:")) {
        const m = timeSlot.match(/(\d+):?(\d*)/);
        if (m) hour = (parseInt(m[1], 10) % 12) + 12;
        if (m && m[2]) minute = parseInt(m[2], 10) || 0;
      } else if (timeSlot.includes("AM") || timeSlot.includes("12:00 PM") || timeSlot.includes("12:30 PM")) {
        const m = timeSlot.match(/(\d+):?(\d*)/);
        if (m) hour = timeSlot.includes("PM") ? 12 : parseInt(m[1], 10) % 12;
        if (m && m[2]) minute = parseInt(m[2], 10) || 0;
      }
    }
    const appointmentTime = new Date(
      `${todayStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`
    );
    const endTime = new Date(appointmentTime.getTime() + 30 * 60000);

    // Deduplication check: prevent creating duplicate appointment if one exists for this patient today
    try {
      const existingTodayApt = await prisma.appointment.findFirst({
        where: {
          status: { notIn: ["CANCELLED", "DECLINED"] },
          patientId: finalPatientId,
          OR: [
            {
              startTime: {
                gte: new Date(appointmentTime.getTime() - 15 * 60 * 1000),
                lte: new Date(appointmentTime.getTime() + 15 * 60 * 1000),
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

      if (existingTodayApt) {
        return NextResponse.json({
          success: true,
          message: "Appointment already scheduled in today queue",
          appointment: existingTodayApt,
          duplicatePrevented: true,
        });
      }
    } catch (dupErr) {
      console.warn("Today appointment deduplication check warning:", dupErr);
    }

    // 4. Create the Appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: finalPatientId,
        serviceId: finalServiceId,
        startTime: appointmentTime,
        endTime: endTime,
        status: status as any,
        source: (source === "WHATSAPP"
          ? "WHATSAPP"
          : source === "WEBSITE" || source === "WEB_FORM"
          ? "WEBSITE"
          : "WALK_IN") as any,
        preferredDoctor: doctor || "Dr. Sankar (Chief Dental Surgeon)",
        reason: serviceName || "General Dental Consultation",
        notes: notes || `Booked via Receptionist Desk (${source})`,
        checkedInAt: status === "CHECKED_IN" || status === "TREATMENT_STARTED" ? new Date() : null,
        treatmentStartedAt: status === "TREATMENT_STARTED" ? new Date() : null,
      },
      include: {
        patient: true,
        service: true,
      },
    });

    // 5. Update Queue Order
    const currentOrder = getQueueOrder(todayStr);
    if (position === "top") {
      // Place at #1
      saveQueueOrder(todayStr, [newAppointment.id, ...currentOrder.filter((id) => id !== newAppointment.id)]);
    } else {
      // Place at end
      saveQueueOrder(todayStr, [...currentOrder.filter((id) => id !== newAppointment.id), newAppointment.id]);
    }

    // 6. Push to Google Sheet in background
    try {
      appendPatientToGoogleSheet({
        id: newAppointment.id,
        name: `${newAppointment.patient.firstName} ${newAppointment.patient.lastName}`.trim(),
        phone: newAppointment.patient.phone,
        email: newAppointment.patient.email || "",
        service: newAppointment.service?.name || "Consultation",
        doctor: newAppointment.preferredDoctor || "Chief Dental Surgeon",
        dateTime: newAppointment.startTime.toISOString(),
        source: newAppointment.source,
      });
    } catch (e) {
      console.warn("Google Sheet sync notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${newAppointment.patient.firstName} to Today's Queue!`,
      appointment: newAppointment,
    });
  } catch (err: any) {
    console.error("POST /api/admin/today error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/today
 * Update queue arrival order, status (Waiting, In Chair, Completed), or move patient
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, appointmentId, status, newOrder, date } = body;
    const targetDateStr = date || new Date().toISOString().split("T")[0];

    // 1. Bulk Reorder Queue
    if (action === "REORDER" && Array.isArray(newOrder)) {
      saveQueueOrder(targetDateStr, newOrder);
      return NextResponse.json({ success: true, message: "Queue order updated successfully!" });
    }

    // 2. Move single appointment up or down
    if (action === "MOVE_UP" || action === "MOVE_DOWN" || action === "MOVE_TOP" || action === "MOVE_BOTTOM") {
      if (!appointmentId) {
        return NextResponse.json({ success: false, error: "appointmentId required." }, { status: 400 });
      }

      // Fetch all today appointments to ensure we have the complete list
      const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);
      const allToday = await prisma.appointment.findMany({
        where: { startTime: { gte: startOfDay, lte: endOfDay } },
        select: { id: true },
      });

      const allIds = allToday.map((a) => a.id);
      let order = getQueueOrder(targetDateStr);
      // Merge any missing ids
      for (const id of allIds) {
        if (!order.includes(id)) order.push(id);
      }

      const currentIndex = order.indexOf(appointmentId);
      if (currentIndex !== -1) {
        if (action === "MOVE_UP" && currentIndex > 0) {
          const temp = order[currentIndex - 1];
          order[currentIndex - 1] = order[currentIndex];
          order[currentIndex] = temp;
        } else if (action === "MOVE_DOWN" && currentIndex < order.length - 1) {
          const temp = order[currentIndex + 1];
          order[currentIndex + 1] = order[currentIndex];
          order[currentIndex] = temp;
        } else if (action === "MOVE_TOP") {
          order = [appointmentId, ...order.filter((id) => id !== appointmentId)];
        } else if (action === "MOVE_BOTTOM") {
          order = [...order.filter((id) => id !== appointmentId), appointmentId];
        }
        saveQueueOrder(targetDateStr, order);
      }

      return NextResponse.json({ success: true, message: `Moved patient in queue!`, order });
    }

    // 3. Update Appointment Status
    if (action === "UPDATE_STATUS" && appointmentId && status) {
      const updates: any = { status };
      if (body.notes !== undefined) updates.notes = body.notes;

      if (status === "CHECKED_IN") {
        updates.checkedInAt = new Date();
      } else if (status === "TREATMENT_STARTED" || status === "IN_PROGRESS") {
        updates.treatmentStartedAt = new Date();
      } else if (status === "COMPLETED" || status === "TREATMENT_DONE") {
        updates.treatmentDoneAt = new Date();
      } else if (status === "CONFIRMED") {
        updates.confirmedAt = new Date();
      } else if (status === "CANCELLED" || status === "DECLINED") {
        updates.cancelledAt = new Date();
      } else if (status === "NO_SHOW") {
        updates.noShowAt = new Date();
      }

      try {
        const updated = await prisma.appointment.update({
          where: { id: appointmentId },
          data: updates,
          include: { patient: true, service: true },
        });

        // Also sync in-memory store
        try {
          inMemoryStore.updateAppointmentStatus(appointmentId, status as any);
        } catch {}

        return NextResponse.json({
          success: true,
          message: `Status updated to ${status}`,
          appointment: updated,
        });
      } catch (dbErr) {
        const memUpdated = inMemoryStore.updateAppointmentStatus(
          appointmentId,
          status as any
        );
        if (memUpdated && body.notes !== undefined) {
          memUpdated.notes = body.notes;
        }
        return NextResponse.json({
          success: true,
          message: `Status updated to ${status}`,
          appointment: memUpdated,
        });
      }
    }

    // 4. Update Appointment Notes
    if (action === "UPDATE_NOTES" && appointmentId) {
      const notes = body.notes || "";
      try {
        const updated = await prisma.appointment.update({
          where: { id: appointmentId },
          data: { notes },
          include: { patient: true, service: true },
        });
        return NextResponse.json({ success: true, appointment: updated });
      } catch (dbErr) {
        const apt = inMemoryStore.getAppointment(appointmentId);
        if (apt) {
          apt.notes = notes;
          inMemoryStore.saveAppointment(apt);
        }
        return NextResponse.json({ success: true, appointment: apt });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/admin/today error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
