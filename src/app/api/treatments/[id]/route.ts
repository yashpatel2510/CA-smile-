import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const treatmentId = params.id;
    let treatment: any = null;

    try {
      treatment = await prisma.treatment.findUnique({
        where: { id: treatmentId },
        include: {
          patient: true,
          service: true,
          sessions: {
            orderBy: { sessionNumber: "asc" },
            include: {
              appointment: true,
            },
          },
          appointments: {
            orderBy: { startTime: "asc" },
            include: {
              staffUser: true,
            },
          },
        },
      });
    } catch {
      treatment = inMemoryStore.getTreatment(treatmentId);
      if (treatment) {
        const sessions = inMemoryStore.getTreatmentSessions(treatmentId);
        const appointments = inMemoryStore
          .getAppointments()
          .filter((a) => a.treatmentId === treatmentId);
        const patient = appointments[0]?.patient || {
          firstName: "Patient",
          lastName: treatment.patientId,
          phone: "",
        };
        treatment = {
          ...treatment,
          patient,
          sessions,
          appointments,
        };
      }
    }

    if (!treatment) {
      return NextResponse.json(
        { success: false, message: `Treatment ${treatmentId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      treatment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch treatment",
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
    const treatmentId = params.id;
    const body = await req.json();
    const { status, notes, totalSessions, completedSessions, totalAmount, paidAmount } = body;

    let updatedTreatment: any;
    try {
      updatedTreatment = await prisma.treatment.update({
        where: { id: treatmentId },
        data: {
          status: status || undefined,
          notes: notes || undefined,
          totalSessions: typeof totalSessions === "number" ? totalSessions : undefined,
          completedSessions: typeof completedSessions === "number" ? completedSessions : undefined,
          totalAmount: typeof totalAmount === "number" ? totalAmount : undefined,
          paidAmount: typeof paidAmount === "number" ? paidAmount : undefined,
        },
        include: {
          patient: true,
          sessions: true,
        },
      });
    } catch {
      updatedTreatment = inMemoryStore.updateTreatmentStatus(
        treatmentId,
        status,
        completedSessions
      );
    }

    return NextResponse.json({
      success: true,
      message: "Treatment updated successfully",
      treatment: updatedTreatment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update treatment",
      },
      { status: 500 }
    );
  }
}
