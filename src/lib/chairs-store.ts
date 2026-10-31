import fs from "fs";
import path from "path";
import { DentalChair, ChairMutationInput, ChairColorTheme, ChairOperationalStatus } from "@/types/chairs";

const CHAIRS_CONFIG_PATH = path.join(process.cwd(), "src", "data", "chairs-config.json");

export const DEFAULT_CHAIRS: DentalChair[] = [
  {
    id: "chair-1",
    name: "Dental Chair 1",
    room: "ROOM DENTAL CHAIR 1",
    doctorName: "Dr. Deep Arvindbhai Patel",
    specialty: "General Dentistry & Implants",
    description: "Primary Consultation & Operatory Chair",
    colorTheme: "blue",
    status: "READY",
    isActive: true,
    isDefault: true,
    sortOrder: 1,
    currentApptId: null,
    currentPatient: "Dental Chair Ready",
    currentToken: 1,
    currentService: "General Consultation",
    seenCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "chair-2",
    name: "Dental Chair 2",
    room: "ROOM DENTAL CHAIR 2",
    doctorName: "Dr. Sankar (Chief Dental Surgeon)",
    specialty: "Oral Surgery & Extractions",
    description: "Oral Surgery & Consultations",
    colorTheme: "emerald",
    status: "AVAILABLE",
    isActive: true,
    isDefault: false,
    sortOrder: 2,
    currentApptId: null,
    currentPatient: "Ready for Consultations",
    currentToken: null,
    currentService: "Oral Surgery & Procedures",
    seenCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let memoryCache: DentalChair[] | null = null;

export function getChairsList(): DentalChair[] {
  if (memoryCache && Array.isArray(memoryCache) && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    if (fs.existsSync(CHAIRS_CONFIG_PATH)) {
      const raw = fs.readFileSync(CHAIRS_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed;
        return memoryCache!;
      }
    }
  } catch (err) {
    console.error("Failed to read chairs config:", err);
  }

  memoryCache = [...DEFAULT_CHAIRS];
  saveChairsList(memoryCache);
  return memoryCache;
}

export function saveChairsList(list: DentalChair[]): DentalChair[] {
  memoryCache = list;
  try {
    const dir = path.dirname(CHAIRS_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CHAIRS_CONFIG_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save chairs config:", err);
  }
  return list;
}

export function saveOrUpdateChair(input: Partial<DentalChair> & ChairMutationInput): DentalChair {
  const current = getChairsList();
  const id = input.id || `chair-${Date.now()}`;
  const now = new Date().toISOString();

  const existingIndex = current.findIndex((c) => c.id === id);

  const newRecord: DentalChair = {
    id,
    name: input.name?.trim() || `Dental Chair ${current.length + 1}`,
    room: input.room?.trim() || `ROOM DENTAL CHAIR ${current.length + 1}`,
    doctorName: input.doctorName?.trim() || "Dr. Deep Arvindbhai Patel",
    doctorId: input.doctorId || undefined,
    specialty: input.specialty?.trim() || "General Consultation",
    description: input.description?.trim() || "Dental Consultation Chair",
    colorTheme: (input.colorTheme || "blue") as ChairColorTheme,
    status: (input.status || "READY") as ChairOperationalStatus,
    isActive: input.isActive ?? true,
    isDefault: input.isDefault ?? (existingIndex === 0),
    sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : (existingIndex >= 0 ? current[existingIndex].sortOrder : current.length + 1),
    currentApptId: input.currentApptId ?? (existingIndex >= 0 ? current[existingIndex].currentApptId : null),
    currentPatient: input.currentPatient ?? (existingIndex >= 0 ? current[existingIndex].currentPatient : "Dental Chair Ready"),
    currentToken: input.currentToken ?? (existingIndex >= 0 ? current[existingIndex].currentToken : null),
    currentService: input.currentService ?? (existingIndex >= 0 ? current[existingIndex].currentService : "General Consultation"),
    seenCount: typeof input.seenCount === "number" ? input.seenCount : (existingIndex >= 0 ? current[existingIndex].seenCount : 0),
    createdAt: existingIndex >= 0 ? current[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    current[existingIndex] = {
      ...current[existingIndex],
      ...newRecord,
    };
  } else {
    current.push(newRecord);
  }

  saveChairsList(current);
  return newRecord;
}

export function deleteChair(id: string): { success: boolean; error?: string; remaining: DentalChair[] } {
  const current = getChairsList();
  if (current.length <= 1) {
    return {
      success: false,
      error: "Cannot delete the last remaining dental chair. Clinic must have at least one chair active.",
      remaining: current,
    };
  }

  const filtered = current.filter((c) => c.id !== id);
  if (filtered.length === current.length) {
    return {
      success: false,
      error: "Chair not found or already deleted.",
      remaining: current,
    };
  }

  // Ensure there is at least one default chair
  if (!filtered.some((c) => c.isDefault)) {
    filtered[0].isDefault = true;
  }

  saveChairsList(filtered);
  return {
    success: true,
    remaining: filtered,
  };
}

export function updateChairDoctor(chairId: string, doctorName: string, doctorId?: string): DentalChair | null {
  const current = getChairsList();
  const chair = current.find((c) => c.id === chairId);
  if (!chair) return null;

  chair.doctorName = doctorName.trim();
  if (doctorId) chair.doctorId = doctorId;
  chair.updatedAt = new Date().toISOString();

  saveChairsList(current);
  return chair;
}

export function updateChairStatus(
  chairId: string,
  status: ChairOperationalStatus,
  extra?: { currentPatient?: string; currentToken?: number | null; currentApptId?: string | null; currentService?: string }
): DentalChair | null {
  const current = getChairsList();
  const chair = current.find((c) => c.id === chairId);
  if (!chair) return null;

  chair.status = status;
  if (extra) {
    if (extra.currentPatient !== undefined) chair.currentPatient = extra.currentPatient;
    if (extra.currentToken !== undefined) chair.currentToken = extra.currentToken;
    if (extra.currentApptId !== undefined) chair.currentApptId = extra.currentApptId;
    if (extra.currentService !== undefined) chair.currentService = extra.currentService;
  }
  chair.updatedAt = new Date().toISOString();

  saveChairsList(current);
  return chair;
}
