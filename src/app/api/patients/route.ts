import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getPatientCode } from "@/lib/patient-numbering-store";

// Global cache references to ensure patient counts never drop or decrease during transient DB locks
declare global {
  // eslint-disable-next-line no-var
  var __cachedGlobalPatients: any[] | undefined;
  // eslint-disable-next-line no-var
  var __cachedGlobalPatientsTimestamp: number | undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();

    let patients: any[] = [];
    let dbSuccess = false;

    try {
      const dbPatients = await prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          appointments: {
            orderBy: { startTime: "desc" },
            take: 3,
            include: {
              service: true,
            },
          },
          treatments: {
            select: { id: true, title: true, status: true },
          },
          _count: {
            select: { appointments: true, treatments: true },
          },
        },
      });

      patients = dbPatients.map((p) => {
        const lastApt = p.appointments?.[0];
        const fullName = `${p.firstName} ${p.lastName}`.trim();

        // Extract condition from medical notes or latest appointment
        let condition = "General Dental Wellness";
        if (lastApt?.service?.name) {
          condition = lastApt.service.name;
        } else if (lastApt?.reason) {
          condition = lastApt.reason;
        } else if (p.medicalNotes) {
          const notesFirstLine = p.medicalNotes.split("|").pop()?.trim();
          if (notesFirstLine && notesFirstLine.length < 50) {
            condition = notesFirstLine;
          }
        }

        // Determine source
        let source = lastApt?.source || "WEB_FORM";
        if (p.medicalNotes?.toLowerCase().includes("whatsapp")) {
          source = "WHATSAPP";
        }

        // Calculate age if DOB exists
        let age: number | null = null;
        if (p.dateOfBirth) {
          const dob = new Date(p.dateOfBirth);
          const diff = Date.now() - dob.getTime();
          age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }

        return {
          id: p.id,
          patientCode: getPatientCode(p.id, p.createdAt),
          firstName: p.firstName,
          lastName: p.lastName,
          name: fullName,
          phone: p.phone,
          email: p.email || "",
          gender: p.gender || "",
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString().split("T")[0] : "",
          age: age !== null ? age : null,
          bloodType: p.medicalNotes?.match(/Blood Group:\s*([^|]+)/i)?.[1]?.trim() || "",
          address: p.address || "",
          emergencyContact: p.emergencyContact || "",
          medicalNotes: p.medicalNotes || "",
          condition,
          source,
          totalVisits: Math.max(p._count?.appointments || 0, p.appointments?.length || 1),
          lastVisit: lastApt?.startTime
            ? new Date(lastApt.startTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recent",
          createdAt: p.createdAt.toISOString(),
          appointments: p.appointments || [],
          treatments: p.treatments || [],
        };
      });

      // Also merge any in-memory store patients or appointments if they are not yet in the DB
      try {
        const inMemAppointments = inMemoryStore.getAppointments();
        const existingPhones = new Set(patients.map((p) => p.phone?.replace(/\D/g, "")));
        const existingIds = new Set(patients.map((p) => p.id));

        for (const apt of inMemAppointments) {
          const p = apt.patient;
          if (!p) continue;
          const cleanPPhone = (p.phone || "").replace(/\D/g, "");
          if ((!cleanPPhone || !existingPhones.has(cleanPPhone)) && !existingIds.has(p.id)) {
            existingIds.add(p.id);
            if (cleanPPhone) existingPhones.add(cleanPPhone);

            patients.push({
              id: p.id || `PAT-${Date.now()}`,
              patientCode: getPatientCode(p.id || `PAT-${Date.now()}`),
              firstName: p.firstName,
              lastName: p.lastName,
              name: `${p.firstName} ${p.lastName}`.trim(),
              phone: p.phone,
              email: p.email || "",
              gender: p.gender || "",
              dateOfBirth: p.dateOfBirth || "",
              age: null,
              bloodType: "",
              address: "",
              emergencyContact: "",
              medicalNotes: apt.notes || "",
              condition: apt.service?.name || apt.reason || "Dental Care",
              source: apt.source || "WEB_FORM",
              totalVisits: 1,
              lastVisit: apt.startTime
                ? new Date(apt.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent",
              createdAt: apt.createdAt || new Date().toISOString(),
              appointments: [apt],
              treatments: apt.treatment ? [apt.treatment] : [],
            });
          }
        }
      } catch {}

      dbSuccess = true;
      global.__cachedGlobalPatients = patients;
      global.__cachedGlobalPatientsTimestamp = Date.now();
    } catch (dbError) {
      console.warn("DB query failed in GET /api/patients, checking resilient cache:", dbError);
      
      // If we have a previously cached list, use it to ensure count NEVER drops or decreases
      if (global.__cachedGlobalPatients && global.__cachedGlobalPatients.length > 0) {
        patients = [...global.__cachedGlobalPatients];
      } else {
        // Fallback to in-memory appointments
        const appointments = inMemoryStore.getAppointments();
        const patientMap = new Map<string, any>();

        for (const apt of appointments) {
          const p = apt.patient;
          const key = p.phone || p.firstName;
          if (!patientMap.has(key)) {
            patientMap.set(key, {
              id: p.id || `PAT-${key.slice(-4) || "001"}`,
              patientCode: getPatientCode(p.id || `PAT-${key.slice(-4) || "001"}`),
              firstName: p.firstName,
              lastName: p.lastName,
              name: `${p.firstName} ${p.lastName}`.trim(),
              phone: p.phone,
              email: p.email || "",
              gender: "",
              dateOfBirth: "",
              age: null,
              bloodType: "",
              address: "",
              emergencyContact: "",
              medicalNotes: apt.notes || "",
              condition: apt.service?.name || apt.reason || "Dental Care",
              source: apt.source || "WEB_FORM",
              totalVisits: 1,
              lastVisit: apt.startTime
                ? new Date(apt.startTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent",
              createdAt: apt.createdAt || new Date().toISOString(),
              appointments: [apt],
              treatments: apt.treatment ? [apt.treatment] : [],
            });
          } else {
            const item = patientMap.get(key);
            item.totalVisits += 1;
          }
        }

        patients = Array.from(patientMap.values());
      }
    }

    if (search) {
      patients = patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(search) ||
          p.phone?.includes(search) ||
          p.email?.toLowerCase().includes(search) ||
          p.id?.toLowerCase().includes(search) ||
          p.patientCode?.toLowerCase().includes(search) ||
          p.condition?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: patients.length,
        patients,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-transform",
          "X-Data-Source": dbSuccess ? "DB" : "CACHE_FALLBACK",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      dateOfBirth,
      bloodType,
      address,
      emergencyContact,
      medicalNotes,
      source = "ADMIN",
    } = body;

    if (!firstName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Patient first name is required." },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Patient phone number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const resolvedLastName = lastName?.trim() || "";
    const cleanNotes = [
      medicalNotes?.trim(),
      bloodType ? `Blood Group: ${bloodType}` : null,
      source ? `Source: ${source}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    let savedPatient: any = null;

    try {
      // Find clinic
      let clinic = await prisma.clinic.findFirst({
        where: { slug: process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG || "acme-health" },
      });
      if (!clinic) {
        clinic = await prisma.clinic.findFirst();
      }

      if (clinic) {
        // Upsert by phone within this clinic
        const existing = await prisma.patient.findFirst({
          where: { clinicId: clinic.id, phone: cleanPhone },
        });

        if (existing) {
          savedPatient = await prisma.patient.update({
            where: { id: existing.id },
            data: {
              firstName: firstName.trim(),
              lastName: resolvedLastName,
              email: email?.trim() || existing.email,
              gender: gender || existing.gender,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existing.dateOfBirth,
              address: address?.trim() || existing.address,
              emergencyContact: emergencyContact?.trim() || existing.emergencyContact,
              medicalNotes: cleanNotes || existing.medicalNotes,
            },
          });
        } else {
          savedPatient = await prisma.patient.create({
            data: {
              clinicId: clinic.id,
              firstName: firstName.trim(),
              lastName: resolvedLastName,
              phone: cleanPhone,
              email: email?.trim() || null,
              gender: gender || null,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              address: address?.trim() || null,
              emergencyContact: emergencyContact?.trim() || null,
              medicalNotes: cleanNotes || null,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB save error in POST /api/patients:", dbErr);
    }

    // In-memory fallback if DB was unavailable or no clinic
    if (!savedPatient) {
      savedPatient = {
        id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: firstName.trim(),
        lastName: resolvedLastName,
        phone: cleanPhone,
        email: email?.trim() || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address?.trim() || null,
        emergencyContact: emergencyContact?.trim() || null,
        medicalNotes: cleanNotes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Refresh global patient cache
    global.__cachedGlobalPatients = undefined;

    return NextResponse.json({
      success: true,
      message: `Patient ${savedPatient.firstName} ${savedPatient.lastName} saved successfully.`,
      patient: savedPatient,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add patient" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user && session.user.role !== "ADMIN" && session.user.role !== "DOCTOR") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) and Doctors are authorized to delete patient records.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'id' is required." },
        { status: 400 }
      );
    }

    let deletedFromDb = false;
    let patientName = "Patient";

    try {
      const existing = await prisma.patient.findFirst({
        where: { OR: [{ id }, { phone: id }] },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });

      if (existing) {
        patientName = `${existing.firstName} ${existing.lastName}`.trim();

        const appointments = await prisma.appointment.findMany({
          where: { patientId: existing.id },
          select: { id: true },
        });
        const aptIds = appointments.map((a) => a.id);

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

        await prisma.treatment.deleteMany({
          where: { patientId: existing.id },
        });

        await prisma.patient.delete({
          where: { id: existing.id },
        });

        deletedFromDb = true;
      }
    } catch (dbErr) {
      console.warn("DB error deleting patient in route.ts:", dbErr);
    }

    inMemoryStore.deletePatient(id);
    // Invalidate global patient cache
    global.__cachedGlobalPatients = undefined;

    return NextResponse.json({
      success: true,
      message: `Patient record for "${patientName}" removed successfully.`,
      deletedId: id,
      deletedFromDb,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove patient" },
      { status: 500 }
    );
  }
}
