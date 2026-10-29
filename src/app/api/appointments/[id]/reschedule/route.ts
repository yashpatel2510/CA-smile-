import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { rescheduleAppointmentSchema } from "@/lib/validations/appointment";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const body = await req.json();

    const parseResult = rescheduleAppointmentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed for reschedule request",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { startTime, endTime, preferredDoctor, reason, performedBy } =
      parseResult.data;

    const newStartDate = new Date(startTime);
    const durationMin = 45;
    const newEndDate = endTime
      ? new Date(endTime)
      : new Date(newStartDate.getTime() + durationMin * 60000);

    // Double booking check for the new time slot
    let conflict = false;
    let conflictMsg = "";

    try {
      if (preferredDoctor) {
        const overlaps = await prisma.appointment.findMany({
          where: {
            id: { not: appointmentId },
            preferredDoctor,
            status: { notIn: ["CANCELLED", "DECLINED", "NO_SHOW"] },
            startTime: { lt: newEndDate },
            endTime: { gt: newStartDate },
          },
        });
        if (overlaps.length > 0) {
          conflict = true;
          conflictMsg = `Doctor ${preferredDoctor} has a conflicting appointment at this time.`;
        }
      }
    } catch {
      const overlaps = inMemoryStore.getAppointments().filter((a) => {
        if (a.id === appointmentId) return false;
        if (
          a.status === "CANCELLED" ||
          a.status === "DECLINED" ||
          a.status === "NO_SHOW"
        )
          return false;
        if (
          preferredDoctor &&
          a.preferredDoctor?.toLowerCase() === preferredDoctor.toLowerCase()
        ) {
          const aStart = new Date(a.startTime).getTime();
          const aEnd = new Date(a.endTime).getTime();
          return newStartDate.getTime() < aEnd && newEndDate.getTime() > aStart;
        }
        return false;
      });
      if (overlaps.length > 0) {
        conflict = true;
        conflictMsg = `Doctor ${preferredDoctor} has a conflicting appointment at this time.`;
      }
    }

    if (conflict) {
      return NextResponse.json(
        { success: false, conflict: true, message: conflictMsg },
        { status: 409 }
      );
    }

    let updatedAppointment: any;
    try {
      const existing = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!existing) {
        throw new Error("Not found in db");
      }

      const prevTime = existing.startTime;
      updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          startTime: newStartDate,
          endTime: newEndDate,
          originalStartTime: existing.originalStartTime || prevTime,
          rescheduledAt: new Date(),
          rescheduledReason: reason || "Patient requested reschedule",
          preferredDoctor: preferredDoctor || existing.preferredDoctor,
          status: "PENDING",
          notes: (existing.notes || "").includes("[Rescheduled]")
            ? existing.notes
            : `[Rescheduled] ${existing.notes || ""}`.trim(),
        },
        include: {
          patient: true,
          service: true,
          staffUser: true,
          treatment: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          clinicId: existing.clinicId,
          appointmentId: existing.id,
          action: "APPOINTMENT_RESCHEDULED",
          entityType: "Appointment",
          entityId: existing.id,
          performedBy,
          details: `Rescheduled from ${prevTime.toLocaleString()} to ${newStartDate.toLocaleString()}. Reason: ${reason || "N/A"}`,
          previousValues: { startTime: prevTime.toISOString() },
          newValues: {
            startTime: newStartDate.toISOString(),
            reason: reason || null,
          },
        },
      });

      try {
        inMemoryStore.rescheduleAppointment(
          appointmentId,
          newStartDate.toISOString(),
          newEndDate.toISOString(),
          reason,
          preferredDoctor,
          performedBy
        );
      } catch {}
    } catch {
      updatedAppointment = inMemoryStore.rescheduleAppointment(
        appointmentId,
        newStartDate.toISOString(),
        newEndDate.toISOString(),
        reason,
        preferredDoctor,
        performedBy
      );
    }

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, message: `Appointment ${appointmentId} not found` },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      message: "Appointment successfully rescheduled",
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to reschedule appointment",
      },
      { status: 500 }
    );
  }
}
