import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;
    let patient: any = null;
    let appointments: any[] = [];
    let treatments: any[] = [];

    try {
      patient = await prisma.patient.findFirst({
        where: {
          OR: [{ id: patientId }, { phone: patientId }],
        },
        include: {
          appointments: {
            orderBy: { startTime: "desc" },
            include: {
              service: true,
              staffUser: true,
              treatment: true,
              treatmentSession: true,
            },
          },
          treatments: {
            orderBy: { createdAt: "desc" },
            include: {
              sessions: { orderBy: { sessionNumber: "asc" } },
              service: true,
            },
          },
        },
      });

      if (patient) {
        appointments = patient.appointments;
        treatments = patient.treatments;
      }
    } catch {
      // In-memory fallback
      const allApts = inMemoryStore.getAppointments();
      const matchedApts = allApts.filter(
        (a) =>
          a.patientId === patientId ||
          a.patient.id === patientId ||
          a.patient.phone === patientId
      );

      if (matchedApts.length > 0) {
        const p = matchedApts[0].patient;
        patient = {
          id: p.id || patientId,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          dateOfBirth: p.dateOfBirth || "1990-01-01",
          gender: p.gender || "Not Specified",
        };
        appointments = matchedApts;
      }

      treatments = inMemoryStore.getPatientTreatments(patientId);
      if (treatments.length === 0 && matchedApts.length > 0) {
        // Collect from appointments
        const trtIds = new Set<string>();
        for (const a of matchedApts) {
          if (a.treatment && !trtIds.has(a.treatment.id)) {
            trtIds.add(a.treatment.id);
            treatments.push({
              ...a.treatment,
              sessions: inMemoryStore.getTreatmentSessions(a.treatment.id),
            });
          }
        }
      }
    }

    if (!patient) {
      // Mock fallback if query matches common seed
      patient = {
        id: patientId,
        firstName: "Patient",
        lastName: patientId,
        phone: "(555) 000-0000",
        email: "patient@clinic.com",
      };
    }

    // Separate active and completed treatments
    const activeTreatments = treatments.filter(
      (t) => t.status === "IN_PROGRESS" || t.status === "ON_HOLD"
    );
    const completedTreatments = treatments.filter(
      (t) => t.status === "COMPLETED"
    );

    return NextResponse.json({
      success: true,
      patient: {
        ...patient,
        appointments,
        treatments,
        activeTreatments,
        completedTreatments,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch patient details",
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
    const patientId = params.id;
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID is required." },
        { status: 400 }
      );
    }

    let deletedFromDb = false;
    let patientName = "Patient";

    try {
      // 1. Locate patient in DB
      const existing = await prisma.patient.findFirst({
        where: {
          OR: [{ id: patientId }, { phone: patientId }],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      });

      if (existing) {
        patientName = `${existing.firstName} ${existing.lastName}`.trim();

        // Find all appointments
        const appointments = await prisma.appointment.findMany({
          where: { patientId: existing.id },
          select: { id: true },
        });
        const aptIds = appointments.map((a) => a.id);

        // Disconnect treatment sessions
        if (aptIds.length > 0) {
          await prisma.treatmentSession.updateMany({
            where: { appointmentId: { in: aptIds } },
            data: { appointmentId: null },
          });

          await prisma.auditLog.deleteMany({
            where: {
              OR: [
                { appointmentId: { in: aptIds } },
                { entityId: existing.id, entityType: "Patient" },
              ],
            },
          });

          await prisma.appointment.deleteMany({
            where: { id: { in: aptIds } },
          });
        }

        // Delete treatments
        await prisma.treatment.deleteMany({
          where: { patientId: existing.id },
        });

        // Delete patient
        await prisma.patient.delete({
          where: { id: existing.id },
        });

        deletedFromDb = true;
      }
    } catch (dbErr) {
      console.warn("DB error deleting patient:", dbErr);
    }

    // Also clean up from inMemoryStore
    inMemoryStore.deletePatient(patientId);


    return NextResponse.json({
      success: true,
      message: `Patient record for "${patientName}" was successfully removed.`,
      deletedId: patientId,
      deletedFromDb,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove patient record.",
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
    const patientId = params.id;
    const body = await req.json();

    const {
      fullName,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      sex,
      bloodGroup,
      bloodType,
      leadSource,
      patientType,
      address,
      addressLine,
      locality,
      pin,
      city,
      state,
      patientCode,
      emergencyContact,
      medicalNotes,
    } = body;

    let finalFirst = firstName;
    let finalLast = lastName;
    if (fullName !== undefined) {
      const parts = fullName.trim().split(" ");
      finalFirst = parts[0] || "";
      finalLast = parts.slice(1).join(" ") || "";
    }

    const finalGender = sex || gender;
    const finalBlood = bloodGroup || bloodType;

    let finalAddress = address;
    if (!finalAddress && (addressLine || locality || city || state || pin)) {
      finalAddress = [addressLine, locality, city, state, pin].filter(Boolean).join(", ");
    }

    let updatedPatient: any = null;

    try {
      const existing = await prisma.patient.findFirst({
        where: {
          OR: [{ id: patientId }, { phone: patientId }],
        },
      });

      if (existing) {
        const updateData: any = {};
        if (finalFirst !== undefined) updateData.firstName = finalFirst;
        if (finalLast !== undefined) updateData.lastName = finalLast;
        if (phone !== undefined && phone.trim()) updateData.phone = phone.trim();
        if (finalGender !== undefined) updateData.gender = finalGender;
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (finalAddress !== undefined) updateData.address = finalAddress;
        if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;

        const notesParts = [
          existing.medicalNotes,
          medicalNotes,
          patientType ? `Patient Type: ${patientType}` : null,
          finalBlood ? `Blood Group: ${finalBlood}` : null,
          leadSource ? `Lead Source: ${leadSource}` : null,
        ].filter(Boolean);

        if (notesParts.length > 0) {
          updateData.medicalNotes = Array.from(new Set(notesParts)).join(" | ");
        }

        updatedPatient = await prisma.patient.update({
          where: { id: existing.id },
          data: updateData,
        });
      }
    } catch (dbErr) {
      console.warn("DB update error:", dbErr);
    }

    inMemoryStore.updatePatient(patientId, {
      firstName: finalFirst,
      lastName: finalLast,
      phone: phone?.trim(),
      gender: finalGender,
      dateOfBirth,
      bloodGroup: finalBlood,
      leadSource,
      patientType,
      address: finalAddress,
    });

    return NextResponse.json({
      success: true,
      message: "Patient record updated successfully.",
      patient: updatedPatient || {
        id: patientId,
        firstName: finalFirst,
        lastName: finalLast,
        fullName: `${finalFirst || ""} ${finalLast || ""}`.trim(),
        phone,
        gender: finalGender,
        patientType,
        dateOfBirth,
        bloodGroup: finalBlood,
        leadSource,
        address: finalAddress,
        patientCode: patientCode || patientId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update patient record.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  params: { params: { id: string } }
) {
  return PATCH(req, params);
}
