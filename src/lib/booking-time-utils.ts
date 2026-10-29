/**
 * Utilities for validating booking dates and time slots.
 * Ensures past dates and past time slots for today cannot be selected.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateToday(dateInput: Date | string | null | undefined): boolean {
  if (!dateInput) return false;
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed === getTodayDateString();
    }
  }
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    if (typeof dateInput === "string" && dateInput.includes("-")) {
      return dateInput.slice(0, 10) === getTodayDateString();
    }
    return false;
  }
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isDateInPast(dateInput: Date | string | null | undefined): boolean {
  if (!dateInput) return false;
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed < getTodayDateString();
    }
  }
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return false;
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() < todayMidnight.getTime();
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses slot time string to minute range from midnight (0 to 1439).
 * Handles formats like:
 * - "Morning (9:30 AM - 1:00 PM)" -> { start: 570, end: 780 }
 * - "Afternoon (2:00 PM - 5:00 PM)" -> { start: 840, end: 1020 }
 * - "Evening (5:00 PM - 7:30 PM)" -> { start: 1020, end: 1170 }
 * - "10:45 am" -> { start: 645, end: 675 }
 * - "2:00 PM" -> { start: 840, end: 870 }
 */
export function parseSlotToMinutes(slotString: string): { startMinutes: number; endMinutes: number } {
  const s = slotString.trim();
  const lower = s.toLowerCase();

  // Range detection inside parentheses e.g. "Morning (9:30 AM - 1:00 PM)"
  const rangeMatch = s.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (rangeMatch) {
    const startM = parseSingleTimeToMinutes(rangeMatch[1]);
    const endM = parseSingleTimeToMinutes(rangeMatch[2]);
    return {
      startMinutes: startM,
      endMinutes: endM > startM ? endM : startM + 180,
    };
  }

  // Segment keywords fallback
  if (lower.includes("morning")) {
    return { startMinutes: 9 * 60 + 30, endMinutes: 13 * 60 }; // 9:30 AM to 1:00 PM
  }
  if (lower.includes("afternoon")) {
    return { startMinutes: 13 * 60, endMinutes: 17 * 60 }; // 1:00 PM to 5:00 PM
  }
  if (lower.includes("evening")) {
    return { startMinutes: 17 * 60, endMinutes: 20 * 60 + 30 }; // 5:00 PM to 8:30 PM
  }

  // Single time like "10:45 am", "2:30 pm"
  const single = parseSingleTimeToMinutes(s);
  return { startMinutes: single, endMinutes: single + 30 };
}

function parseSingleTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const str = timeStr.trim().toLowerCase();
  const isPm = str.includes("pm");
  const isAm = str.includes("am");

  const clean = str.replace(/[^\d:]/g, "");
  const [hStr, mStr] = clean.split(":");
  let hours = parseInt(hStr || "0", 10);
  const minutes = parseInt(mStr || "0", 10);

  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Checks whether a specific time slot has already passed for the given date.
 * If date is in the future, returns false.
 * If date is today, checks if the slot start or end time has already passed.
 */
export function isSlotInPast(slotString: string, dateInput: Date | string | null | undefined): boolean {
  if (!dateInput) return false;
  if (!isDateToday(dateInput)) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const { startMinutes, endMinutes } = parseSlotToMinutes(slotString);

  // If slot is a broad window (e.g. morning ending at 1:00 PM / 780 mins, evening ending at 7:30 PM / 1170 mins),
  // once the current time is past or within 5 mins of the end, it cannot be booked.
  // For individual slots (e.g. 10:45 AM / 645 mins), once current time is past startMinutes, it has passed.
  if (endMinutes - startMinutes > 45) {
    // Window slot: cannot book if current time is past or nearing end (within 5 mins)
    return currentMinutes >= endMinutes - 5;
  }

  return currentMinutes >= startMinutes;
}

/**
 * Filters a list of slots, returning only valid un-passed slots if date is today.
 */
export function filterAvailableSlots(slots: string[], dateInput: Date | string | null | undefined): string[] {
  if (!dateInput || !isDateToday(dateInput)) return slots;
  return slots.filter((slot) => !isSlotInPast(slot, dateInput));
}

/**
 * Calculates real appointment start and end Date objects for a given slot and date.
 * If the slot is currently active/in-progress today, it calculates the next upcoming
 * 5-minute interval so the appointment start time is always in the upcoming future.
 */
export function getSlotScheduledTime(
  dateInput: Date | string,
  slotString: string,
  durationMinutes = 30
): { startTime: Date; endTime: Date } {
  let targetYear: number;
  let targetMonth: number;
  let targetDay: number;

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim().slice(0, 10);
    const parts = trimmed.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      targetYear = parts[0];
      targetMonth = parts[1] - 1;
      targetDay = parts[2];
    } else {
      const parsed = new Date(dateInput);
      targetYear = parsed.getFullYear();
      targetMonth = parsed.getMonth();
      targetDay = parsed.getDate();
    }
  } else {
    targetYear = dateInput.getFullYear();
    targetMonth = dateInput.getMonth();
    targetDay = dateInput.getDate();
  }

  const { startMinutes, endMinutes } = parseSlotToMinutes(slotString);
  const isToday = isDateToday(dateInput);

  let effectiveStartMinutes = startMinutes;
  if (isToday) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // If current time is past slot start but before slot end - 5 mins,
    // this is an in-progress session. Schedule for the upcoming 5-minute interval.
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes - 5) {
      effectiveStartMinutes = Math.min(
        endMinutes - 10,
        Math.ceil((currentMinutes + 2) / 5) * 5
      );
    }
  }

  const startTime = new Date(
    targetYear,
    targetMonth,
    targetDay,
    Math.floor(effectiveStartMinutes / 60),
    effectiveStartMinutes % 60,
    0,
    0
  );

  const durationMs = durationMinutes * 60 * 1000;
  const nominalEndTime = new Date(startTime.getTime() + durationMs);

  return { startTime, endTime: nominalEndTime };
}

