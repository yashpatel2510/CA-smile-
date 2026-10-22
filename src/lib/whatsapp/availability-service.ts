import { prisma } from "@/lib/prisma";
import { getWhatsAppSettings } from "./settings-store";
import { AvailabilityResult, TimeSlotOption } from "./types";
import inMemoryStore from "@/lib/in-memory-store";

/**
 * Format hours and minutes to 12-hour AM/PM string (e.g. 9:00 -> "09:00 AM")
 */
function formatSlotTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const padHour = String(displayHour).padStart(2, "0");
  const padMin = String(minutes).padStart(2, "0");
  return `${padHour}:${padMin} ${period}`;
}

/**
 * Parse time string like "09:30 AM" or "14:00" into { hours, minutes }
 */
export function parseSlotTime(timeStr: string): { hours: number; minutes: number } {
  const clean = timeStr.trim().toUpperCase();
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  }

  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return {
      hours: parseInt(match24[1], 10),
      minutes: parseInt(match24[2], 10),
    };
  }

  return { hours: 9, minutes: 0 };
}

/**
 * Compute available dynamic time slots for a given date and optional doctor.
 */
export async function getAvailableTimeSlots(
  dateStr: string,
  doctor?: string,
  clinicId?: string
): Promise<AvailabilityResult> {
  const settings = await getWhatsAppSettings(clinicId);
  const { businessHours, appointmentRules } = settings;

  // Parse target date YYYY-MM-DD
  const [year, month, day] = dateStr.split("-").map((v) => parseInt(v, 10));
  if (!year || !month || !day) {
    return { date: dateStr, slots: [], availableCount: 0 };
  }

  const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday, etc.

  // Check if clinic is open on this day
  if (!businessHours.days.includes(dayOfWeek)) {
    return {
      date: dateStr,
      doctor,
      slots: [],
      availableCount: 0,
    };
  }

  // Generate candidate slots for the working day
  const candidateSlots: Array<{ timeStr: string; start: Date; end: Date }> = [];
  const startHour = businessHours.startHour || 9;
  const endHour = businessHours.endHour || 18;
  const slotMinutes = businessHours.slotDurationMinutes || 30;
  const lunchStart = businessHours.lunchBreakStartHour ?? 13;
  const lunchEnd = businessHours.lunchBreakEndHour ?? 14;

  let currentMin = startHour * 60;
  const endMin = endHour * 60;

  while (currentMin + slotMinutes <= endMin) {
    const slotHour = Math.floor(currentMin / 60);
    const slotMin = currentMin % 60;

    // Skip lunch break
    const isLunch = slotHour >= lunchStart && slotHour < lunchEnd;
    if (!isLunch) {
      const slotTimeStr = formatSlotTime(slotHour, slotMin);
      const slotStartDate = new Date(year, month - 1, day, slotHour, slotMin, 0, 0);
      const slotEndDate = new Date(year, month - 1, day, slotHour, slotMin + slotMinutes, 0, 0);

      candidateSlots.push({
        timeStr: slotTimeStr,
        start: slotStartDate,
        end: slotEndDate,
      });
    }

    currentMin += slotMinutes;
  }

  // Determine past cutoff if booking for today
  const now = new Date();
  const minAdvanceMs = (appointmentRules.minAdvanceHours || 1) * 60 * 60 * 1000;
  const earliestAllowedTime = new Date(now.getTime() + minAdvanceMs);

  // Fetch booked appointments for this date from Database
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  const bookedSlotTimes = new Set<string>();

  try {
    const activeDbAppointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED", "DECLINED", "NO_SHOW"],
        },
        ...(doctor && doctor !== "Any Available Doctor" ? { preferredDoctor: doctor } : {}),
      },
      select: {
        startTime: true,
      },
    });

    for (const appt of activeDbAppointments) {
      const d = new Date(appt.startTime);
      const bookedTimeStr = formatSlotTime(d.getHours(), d.getMinutes());
      bookedSlotTimes.add(bookedTimeStr);
    }
  } catch (err) {
    // Fallback: check in-memory store
    const memAppts = inMemoryStore.getAppointments();
    for (const appt of memAppts) {
      if (appt.status !== "CANCELLED" && appt.status !== "DECLINED" && appt.status !== "NO_SHOW") {
        const d = new Date(appt.startTime);
        const apptDateStr = d.toISOString().split("T")[0];
        if (apptDateStr === dateStr) {
          if (!doctor || doctor === "Any Available Doctor" || appt.preferredDoctor === doctor) {
            bookedSlotTimes.add(formatSlotTime(d.getHours(), d.getMinutes()));
          }
        }
      }
    }
  }

  // Build slot results
  const slots: TimeSlotOption[] = [];

  for (const candidate of candidateSlots) {
    // Check if slot is in the past
    const isPast = candidate.start < earliestAllowedTime;
    // Check if already booked
    const isBooked = bookedSlotTimes.has(candidate.timeStr);

    const isAvailable = !isPast && !isBooked;

    slots.push({
      id: candidate.timeStr,
      title: candidate.timeStr,
      description: isBooked ? "Booked" : isPast ? "Past Slot" : "Available",
      available: isAvailable,
    });
  }

  const availableCount = slots.filter((s) => s.available).length;

  return {
    date: dateStr,
    doctor,
    slots,
    availableCount,
  };
}
