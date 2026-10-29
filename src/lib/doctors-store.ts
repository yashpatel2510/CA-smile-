import fs from "fs";
import path from "path";
import {
  DoctorRecord,
  ConsultingSchedule,
  ConsultingTimeRange,
  formatTimeRangeHuman,
  formatPrescriptionSchedule,
} from "@/types/doctors";

export type { DoctorRecord, ConsultingSchedule, ConsultingTimeRange };
export { formatTimeRangeHuman, formatPrescriptionSchedule };

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "doctors-config.json");

const DEFAULT_DOCTORS: DoctorRecord[] = [
  {
    id: "doc-1",
    name: "Dr. Deep Patel",
    registrationNumber: "DEMO-GJ-SMILE-0001",
    personalMobile: "+91 98765 43210",
    personalEmail: "doctor@personalemail.com",
    clinicPhone: "917226098074",
    titlePrefix: "BDS",
    qualification: "BDS",
    postGraduateSpecialization: "Dental Surgeon",
    specialty: "Dental Surgeon",
    department: "Dentistry",
    doctorType: "In-house Consultant",
    dailySlots: 40,
    clinicBranch: "Main Clinic",
    isActive: true,
    digitalSignatureUrl: "",
    consultingSchedules: [
      {
        id: "sch-1",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        timeRanges: [{ from: "09:00 AM", to: "01:00 PM" }],
      },
    ],
    createdAt: "2026-10-27T10:00:00.000Z",
  },
];

let memoryCache: DoctorRecord[] | null = null;

export function getDoctorsList(): DoctorRecord[] {
  if (memoryCache) return memoryCache;

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed;
        return memoryCache!;
      }
    }
  } catch (err) {
    console.error("Failed to read doctors config:", err);
  }

  memoryCache = [...DEFAULT_DOCTORS];
  return memoryCache;
}

export function saveDoctorsList(list: DoctorRecord[]): DoctorRecord[] {
  memoryCache = list;
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write doctors config:", err);
  }
  return list;
}

export function saveOrUpdateDoctor(doctorData: Partial<DoctorRecord>): DoctorRecord {
  const current = getDoctorsList();
  const id = doctorData.id || `doc-${Date.now()}`;

  const existingIndex = current.findIndex((d) => d.id === id);

  const newRecord: DoctorRecord = {
    id,
    name: doctorData.name || "Dr. Dental Specialist",
    registrationNumber: doctorData.registrationNumber || "DEMO-GJ-SMILE-0001",
    personalMobile: doctorData.personalMobile || "",
    personalEmail: doctorData.personalEmail || "",
    clinicPhone: doctorData.clinicPhone || doctorData.personalMobile || "",
    titlePrefix: doctorData.titlePrefix || "",
    qualification: doctorData.qualification || "",
    postGraduateSpecialization: doctorData.postGraduateSpecialization || "",
    specialty: doctorData.specialty || doctorData.postGraduateSpecialization || "Dental Surgeon",
    department: doctorData.department || "Dentistry",
    doctorType: doctorData.doctorType || "In-house Consultant",
    dailySlots: typeof doctorData.dailySlots === "number" ? doctorData.dailySlots : 40,
    clinicBranch: doctorData.clinicBranch || "Main Clinic",
    isActive: doctorData.isActive ?? true,
    digitalSignatureUrl: doctorData.digitalSignatureUrl || "",
    consultingSchedules: doctorData.consultingSchedules || [],
    weeklySchedule: doctorData.weeklySchedule,
    vacationBlocks: doctorData.vacationBlocks || [],
    createdAt: doctorData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    current[existingIndex] = {
      ...current[existingIndex],
      ...newRecord,
      createdAt: current[existingIndex].createdAt,
    };
  } else {
    current.push(newRecord);
  }

  saveDoctorsList(current);
  return newRecord;
}

export function deleteDoctor(id: string): boolean {
  const current = getDoctorsList();
  const filtered = current.filter((d) => d.id !== id);
  if (filtered.length !== current.length) {
    saveDoctorsList(filtered);
    return true;
  }
  return false;
}
