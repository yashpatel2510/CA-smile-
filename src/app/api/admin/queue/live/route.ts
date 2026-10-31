import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LIVE_QUEUE_FILE = path.join(process.cwd(), "src", "data", "live-queue-state.json");

interface LiveQueueState {
  currentToken: number;
  currentPatient: string;
  doctorName: string;
  service: string;
  roomName: string;
  status: "CALLING" | "CONSULTING" | "READY" | "COMPLETED";
  upcoming: { token: number; name: string }[];
  callTimestamp: number;
  dateStr: string;
  updatedAt: string;
}

function getStoredState(): LiveQueueState | null {
  try {
    if (fs.existsSync(LIVE_QUEUE_FILE)) {
      const raw = fs.readFileSync(LIVE_QUEUE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading live queue file:", err);
  }
  return null;
}

function saveStoredState(state: LiveQueueState): void {
  try {
    const dir = path.dirname(LIVE_QUEUE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LIVE_QUEUE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving live queue file:", err);
  }
}

/**
 * GET /api/admin/queue/live
 * Provides current calling token & patient for reception TVs & Queue Manager
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const todayDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(now);

    const stored = getStoredState();

    // If stored state is valid for today, return it
    if (stored && stored.dateStr === todayDateStr) {
      return NextResponse.json({ success: true, data: stored });
    }

    // Otherwise, compute dynamic initial state from database
    let activeToken = 1;
    let activePatient = "Doctor Chair Ready — Welcome to CA Smile Dental Clinic";
    let doctorName = "Dr. Deep Arvindbhai Patel";
    let service = "General Consultation";
    let status: LiveQueueState["status"] = "READY";
    let upcoming: { token: number; name: string }[] = [];

    try {
      const startOfDay = new Date(`${todayDateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${todayDateStr}T23:59:59.999Z`);
      const bufferedStart = new Date(startOfDay.getTime() - 6 * 3600 * 1000);
      const bufferedEnd = new Date(endOfDay.getTime() + 6 * 3600 * 1000);

      const appointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: bufferedStart,
            lte: bufferedEnd,
          },
        },
        include: {
          patient: true,
          service: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

      const todayAppointments = appointments.filter((apt) => {
        const aptDateIst = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date(apt.startTime));
        return aptDateIst === todayDateStr;
      });

      if (todayAppointments.length > 0) {
        // Look for in-consultation
        const inConsultation = todayAppointments.find((a) => {
          const st = (a.status as string)?.toUpperCase();
          return st === "TREATMENT_STARTED" || st === "IN_TREATMENT" || st === "CONSULTING";
        });

        // Look for waiting
        const waiting = todayAppointments.filter((a) => {
          const st = (a.status as string)?.toUpperCase();
          return (
            (st === "CHECKED_IN" ||
              st === "WAITING" ||
              st === "CONFIRMED" ||
              st === "PENDING" ||
              st === "BOOKED" ||
              st === "SCHEDULED") &&
            a.id !== inConsultation?.id
          );
        });

        const completed = todayAppointments.filter((a) => {
          const st = (a.status as string)?.toUpperCase();
          return st === "COMPLETED" || st === "TREATMENT_DONE" || st === "DONE";
        });

        if (inConsultation) {
          const idx = todayAppointments.findIndex((a) => a.id === inConsultation.id);
          activeToken = idx + 1;
          activePatient = inConsultation.patient
            ? `${inConsultation.patient.firstName} ${inConsultation.patient.lastName}`.trim()
            : "Consulting Patient";
          doctorName = inConsultation.preferredDoctor || doctorName;
          service = inConsultation.service?.name || service;
          status = "CONSULTING";
        } else if (waiting.length > 0) {
          const next = waiting[0];
          const idx = todayAppointments.findIndex((a) => a.id === next.id);
          activeToken = idx + 1;
          activePatient = next.patient
            ? `${next.patient.firstName} ${next.patient.lastName}`.trim()
            : "Next Patient";
          doctorName = next.preferredDoctor || doctorName;
          service = next.service?.name || service;
          status = "READY";
        } else if (completed.length > 0) {
          activeToken = completed.length;
          activePatient = "All Consultations Completed for Today";
          status = "COMPLETED";
        }

        const upcomingCandidates = inConsultation ? waiting : waiting.slice(1);
        upcoming = upcomingCandidates.slice(0, 4).map((w) => {
          const wIdx = todayAppointments.findIndex((a) => a.id === w.id);
          return {
            token: wIdx + 1,
            name: w.patient
              ? `${w.patient.firstName} ${w.patient.lastName}`.trim()
              : "Patient",
          };
        });
      }
    } catch (dbErr) {
      console.warn("DB queue fetch warning:", dbErr);
    }

    const initialState: LiveQueueState = {
      currentToken: activeToken,
      currentPatient: activePatient,
      doctorName,
      service,
      roomName: "ROOM DENTAL CHAIR 1",
      status,
      upcoming,
      callTimestamp: Date.now(),
      dateStr: todayDateStr,
      updatedAt: new Date().toISOString(),
    };

    saveStoredState(initialState);
    return NextResponse.json({ success: true, data: initialState });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load live queue state" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/queue/live
 * Update calling token & broadcast immediately to TV displays
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();
    const todayDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(now);

    const current = getStoredState();

    const newState: LiveQueueState = {
      currentToken: typeof body.token === "number" ? body.token : (current?.currentToken || 1),
      currentPatient: body.patient ? String(body.patient).trim() : (current?.currentPatient || "Patient"),
      doctorName: body.doctor ? String(body.doctor).trim() : (current?.doctorName || "Dr. Deep Arvindbhai Patel"),
      service: body.service ? String(body.service).trim() : (current?.service || "General Consultation"),
      roomName: body.room ? String(body.room).trim() : (current?.roomName || "ROOM DENTAL CHAIR 1"),
      status: body.status || (body.action === "FINISH" ? "COMPLETED" : "CALLING"),
      upcoming: Array.isArray(body.upcoming) ? body.upcoming : (current?.upcoming || []),
      callTimestamp: Date.now(),
      dateStr: todayDateStr,
      updatedAt: new Date().toISOString(),
    };

    saveStoredState(newState);

    // If chairId provided, optionally sync chair store state
    if (body.chairId) {
      try {
        const { updateChairStatus } = await import("@/lib/chairs-store");
        const chairStatus = body.status === "CALLING" || body.status === "CONSULTING" ? "IN_CONSULTATION" : "READY";
        updateChairStatus(body.chairId, chairStatus, {
          currentPatient: newState.currentPatient,
          currentToken: newState.currentToken,
          currentService: newState.service,
        });
      } catch (chairErr) {
        // Non-critical sync
      }
    }

    return NextResponse.json({
      success: true,
      message: "Live queue updated successfully.",
      data: newState,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update live queue state" },
      { status: 500 }
    );
  }
}
