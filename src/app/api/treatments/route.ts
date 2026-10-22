import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");
    const search = searchParams.get("search");

    let treatments: any[] = [];

    try {
      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }
      if (patientId) {
        where.patientId = patientId;
      }
      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { treatmentType: { contains: q, mode: "insensitive" } },
          { patient: { firstName: { contains: q, mode: "insensitive" } } },
          { patient: { lastName: { contains: q, mode: "insensitive" } } },
          { patient: { phone: { contains: q } } },
        ];
      }

      treatments = await prisma.treatment.findMany({
        where,
        orderBy: { updatedAt: "desc" },
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
          },
        },
      });
    } catch {
      let list = inMemoryStore.getTreatments();

      if (status && status !== "ALL") {
        list = list.filter((t) => t.status === status);
      }
      if (patientId) {
        list = list.filter((t) => t.patientId === patientId);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.treatmentType.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q)
        );
      }

      // Hydrate with in-memory sessions & patient
      treatments = list.map((t) => {
        const sessions = inMemoryStore.getTreatmentSessions(t.id);
        const appointments = inMemoryStore
          .getAppointments()
          .filter((a) => a.treatmentId === t.id);
        const patientApt = appointments[0];
        return {
          ...t,
          patient: patientApt
            ? patientApt.patient
            : { firstName: "Patient", lastName: t.patientId, phone: "" },
          sessions,
          appointments,
        };
      });
    }

    // Identify follow-up required (Requirement 19: Overdue / Missed Sessions Alert)
    // Treatments where previous session is completed, totalSessions > completedSessions,
    // and no upcoming scheduled session exists in CONFIRMED / PENDING status.
    const enrichedTreatments = treatments.map((t: any) => {
      const isOverdueFollowup =
        t.status === "IN_PROGRESS" &&
        t.completedSessions > 0 &&
        t.completedSessions < t.totalSessions &&
        !t.sessions?.some(
          (s: any) =>
            s.sessionNumber > t.completedSessions &&
            (s.status === "PENDING" ||
              s.status === "CONFIRMED" ||
              s.status === "CHECKED_IN")
        );

      return {
        ...t,
        isOverdueFollowup,
      };
    });

    const activeCount = enrichedTreatments.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const completedCount = enrichedTreatments.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const followUpRequiredCount = enrichedTreatments.filter(
      (t) => t.isOverdueFollowup
    ).length;

    return NextResponse.json({
      success: true,
      count: enrichedTreatments.length,
      stats: {
        activeCount,
        completedCount,
        followUpRequiredCount,
        totalCount: enrichedTreatments.length,
      },
      treatments: enrichedTreatments,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch treatments",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId,
      title,
      treatmentType,
      totalSessions,
      totalAmount,
      dentistName,
      notes,
    } = body;

    if (!patientId || !title) {
      return NextResponse.json(
        { success: false, message: "patientId and title are required" },
        { status: 400 }
      );
    }

    let createdTreatment: any;
    try {
      const clinic = await prisma.clinic.findFirst();
      if (!clinic) throw new Error("No clinic found");

      createdTreatment = await prisma.treatment.create({
        data: {
          clinicId: clinic.id,
          patientId,
          title,
          treatmentType: treatmentType || title,
          status: "IN_PROGRESS",
          totalSessions: totalSessions || 1,
          completedSessions: 0,
          totalAmount: totalAmount || 0,
          paidAmount: 0,
          dentistName: dentistName || "Dr. Sankar",
          notes,
        },
        include: {
          patient: true,
          sessions: true,
        },
      });
    } catch {
      createdTreatment = inMemoryStore.saveTreatment({
        id: `TRT-${Math.floor(1000 + Math.random() * 9000)}`,
        patientId,
        title,
        treatmentType: treatmentType || title,
        status: "IN_PROGRESS",
        totalSessions: totalSessions || 1,
        completedSessions: 0,
        totalAmount: totalAmount || 0,
        paidAmount: 0,
        dentistName: dentistName || "Dr. Sankar",
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Treatment created successfully",
        treatment: createdTreatment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create treatment",
      },
      { status: 500 }
    );
  }
}
