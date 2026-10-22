import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const appointmentId = params.id;
    const body = await req.json().catch(() => ({}));
    const performedBy =
      body.performedBy ||
      session?.user?.name ||
      session?.user?.email ||
      "Clinic Administrator";

    // 1. Find Appointment in database
    let appointment: any = null;
    let isMemory = false;

    try {
      appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          service: true,
          clinic: true,
        },
      });
    } catch (dbErr) {
      console.warn("DB query failed in confirm route:", dbErr);
    }

    if (!appointment) {
      appointment = inMemoryStore.getAppointment(appointmentId);
      if (appointment) isMemory = true;
    }

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: `Appointment ${appointmentId} not found.` },
        { status: 404 }
      );
    }

    // 2. Reject confirmation if already cancelled
    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot confirm a cancelled appointment. Please reschedule or create a new booking.",
        },
        { status: 400 }
      );
    }

    // 3. Mark appointment as CONFIRMED
    const confirmedAt = new Date();
    let updatedAppointment: any = null;

    if (!isMemory) {
      try {
        updatedAppointment = await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status: "CONFIRMED",
            confirmedAt,
          },
          include: {
            patient: true,
            service: true,
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            clinicId: appointment.clinicId,
            appointmentId: appointment.id,
            action: "APPOINTMENT_CONFIRMED",
            entityType: "Appointment",
            entityId: appointment.id,
            performedBy,
            details: `Appointment confirmed by ${performedBy}.`,
            previousValues: { status: appointment.status },
            newValues: { status: "CONFIRMED", confirmedAt: confirmedAt.toISOString() },
          },
        }).catch(() => {});
      } catch (updErr) {
        console.warn("DB update failed, using in-memory update:", updErr);
      }
    }

    if (!updatedAppointment) {
      const memoryApt = inMemoryStore.getAppointment(appointmentId) || appointment;
      updatedAppointment = {
        ...memoryApt,
        status: "CONFIRMED",
        confirmedAt: confirmedAt.toISOString(),
      };
      inMemoryStore.saveAppointment(updatedAppointment);
    }

    return NextResponse.json({
      success: true,
      message: "Appointment confirmed successfully.",
      appointment: updatedAppointment,
    });
  } catch (error: any) {
    console.error("Error in appointment confirmation API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to confirm appointment." },
      { status: 500 }
    );
  }
}

