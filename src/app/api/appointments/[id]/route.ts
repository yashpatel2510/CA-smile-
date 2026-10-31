import { NextRequest, NextResponse } from "next/server";
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
