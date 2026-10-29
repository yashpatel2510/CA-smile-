export interface ConsultingTimeRange {
  from: string; // e.g. "09:00 AM"
  to: string; // e.g. "01:00 PM"
}

export interface ConsultingSchedule {
  id: string;
  days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  timeRanges: ConsultingTimeRange[];
}

export interface DoctorShift {
  id: string;
  startTime: string; // e.g. "05:00 PM"
  endTime: string; // e.g. "08:00 PM"
  location: string; // e.g. "Main Clinic"
}

export interface VacationBlock {
  id: string;
  from: string; // "YYYY-MM-DD"
  to?: string;
  reason?: string;
  createdAt?: string;
}

export interface DoctorWeeklySchedule {
  activeDays: string[]; // ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  dayShifts: Record<string, DoctorShift[]>;
  vacationBlocks?: VacationBlock[];
}

export interface DoctorRecord {
  id: string;
  name: string;
  registrationNumber: string;
  personalMobile: string;
  personalEmail: string;
  clinicPhone?: string;
  titlePrefix?: string;
  qualification?: string;
  postGraduateSpecialization?: string;
  specialty?: string;
  department?: string;
  doctorType: "In-house Consultant" | "Visiting Consultant";
  dailySlots: number;
  clinicBranch: string;
  isActive: boolean;
  digitalSignatureUrl?: string;
  consultingSchedules?: ConsultingSchedule[];
  weeklySchedule?: DoctorWeeklySchedule;
  vacationBlocks?: VacationBlock[];
  createdAt?: string;
  updatedAt?: string;
}

export function formatTimeRangeHuman(from: string, to: string): string {
  const clean = (t: string) => {
    return t
      .replace(/^0/, "")
      .replace(":00", "")
      .toLowerCase();
  };
  return `${clean(from)}–${clean(to)}`;
}

export function formatPrescriptionSchedule(schedules?: ConsultingSchedule[]): string {
  if (!schedules || schedules.length === 0) {
    return "Nothing set here, so prescriptions currently print the booking hours from the Schedule tab.";
  }

  const lines = schedules.map((sch) => {
    let dayStr = sch.days.join(", ");
    if (sch.days.length === 7) {
      dayStr = "Mon–Sun";
    } else if (
      sch.days.length === 6 &&
      sch.days.includes("Mon") &&
      sch.days.includes("Sat") &&
      !sch.days.includes("Sun")
    ) {
      dayStr = "Mon–Sat";
    } else if (
      sch.days.length === 5 &&
      sch.days.includes("Mon") &&
      sch.days.includes("Fri")
    ) {
      dayStr = "Mon–Fri";
    }

    const timeStr = sch.timeRanges
      .map((tr) => formatTimeRangeHuman(tr.from, tr.to))
      .join(", ");

    return `${dayStr} ${timeStr}`;
  });

  return lines.join(" | ");
}
