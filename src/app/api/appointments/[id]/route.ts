import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { invalidateAppointmentsCache } from "@/lib/appointments-cache";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    let appointment: any = null;

    try {
      appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          service: true,
          staffUser: true,
          treatment: {
            include: {
              sessions: {
                orderBy: { sessionNumber: "asc" },
                include: { appointment: true },
              },
            },
          },
          treatmentSession: true,
          auditLogs: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });
    } catch {
      appointment = inMemoryStore.getAppointment(appointmentId);
    }

    if (!appointment) {
      appointment = inMemoryStore.getAppointment(appointmentId);
    }

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: `Appointment ${appointmentId} not found` },
        { status: 404 }
      );
    }

    let computedPatientName = "Valued Patient";
    if (appointment.patientType === "CHILD" && appointment.childName) {
      computedPatientName = `${appointment.childName} (Child)`;
    } else if (appointment.patient) {
      const first = appointment.patient.firstName || "";
      const last =
        appointment.patient.lastName && appointment.patient.lastName !== "Patient"
          ? appointment.patient.lastName
          : "";
      computedPatientName = `${first} ${last}`.trim() || "Valued Patient";
    } else if (appointment.childName) {
      computedPatientName = appointment.childName;
    }

    return NextResponse.json({
      success: true,
      appointment: {
        ...appointment,
        patientName: computedPatientName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch appointment",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    const body = await req.json();

    const {
      notes,
      preferredDoctor,
      serviceName,
      serviceId,
      reason,
      totalAmount,
      paidAmount,
      paymentStatus,
      timeRange,
      startTime,
      endTime,
    } = body;

    let updated: any;
    try {
      let resolvedServiceId = serviceId;
      if (!resolvedServiceId && serviceName) {
        const foundService = await prisma.service.findFirst({
          where: { name: { contains: serviceName, mode: "insensitive" } },
        });
        if (foundService) {
          resolvedServiceId = foundService.id;
        }
      }

      updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          notes: notes || undefined,
          preferredDoctor: preferredDoctor || undefined,
          reason: reason || serviceName || undefined,
          serviceId: resolvedServiceId || undefined,
          totalAmount: typeof totalAmount === "number" ? totalAmount : undefined,
          paidAmount: typeof paidAmount === "number" ? paidAmount : undefined,
          paymentStatus: paymentStatus || undefined,
          timeRange: timeRange || undefined,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
        },
        include: {
          patient: true,
          service: true,
          treatment: true,
          treatmentSession: true,
        },
      });
    } catch {
      const existing = inMemoryStore.getAppointment(appointmentId);
      if (existing) {
        if (notes) existing.notes = notes;
        if (preferredDoctor) existing.preferredDoctor = preferredDoctor;
        if (serviceName) {
          existing.reason = serviceName;
          if (existing.service) existing.service.name = serviceName;
          else existing.service = { name: serviceName };
        }
        if (typeof totalAmount === "number") existing.totalAmount = totalAmount;
        if (typeof paidAmount === "number") existing.paidAmount = paidAmount;
        if (paymentStatus) existing.paymentStatus = paymentStatus;
        if (timeRange) existing.timeRange = timeRange;
        if (startTime) existing.startTime = startTime;
        if (endTime) existing.endTime = endTime;
        inMemoryStore.saveAppointment(existing);
        updated = existing;
      }
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Appointment ${appointmentId} not found` },
        { status: 404 }
      );
    }

    invalidateAppointmentsCache();

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update appointment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user && session.user.role !== "ADMIN" && session.user.role !== "DOCTOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) and Doctors are authorized to delete appointments.",
        },
        { status: 403 }
      );
    }

    const appointmentId = params.id;
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "Appointment ID is required" },
        { status: 400 }
      );
    }

    let deletedFromDb = false;

    try {
      // Disconnect treatment sessions
      await prisma.treatmentSession.updateMany({
        where: { appointmentId },
        data: { appointmentId: null },
      }).catch(() => null);

      // Delete audit logs
      await prisma.auditLog.deleteMany({
        where: { appointmentId },
      }).catch(() => null);

      // Delete WhatsApp messages
      await prisma.whatsAppMessage.deleteMany({
        where: { appointmentId },
      }).catch(() => null);

      // Delete appointment from DB
      const res = await prisma.appointment.deleteMany({
        where: { id: appointmentId },
      }).catch(() => null);

      if (res && res.count > 0) {
        deletedFromDb = true;
      }
    } catch (dbErr) {
      console.warn("DB error deleting appointment:", dbErr);
    }

    // Always clear from inMemoryStore
    inMemoryStore.deleteAppointment(appointmentId);
    invalidateAppointmentsCache();

    return NextResponse.json({
      success: true,
      message: `Appointment ${appointmentId} was successfully deleted.`,
      deletedId: appointmentId,
      deletedFromDb,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete appointment",
      },
      { status: 500 }
    );
  }
}
