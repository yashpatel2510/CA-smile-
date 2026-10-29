import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { persistMediaAsync } from "@/lib/media-storage";

export interface TreatmentItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  category?: string;
  image: string;
  whatItIs?: string;
  howItWorks?: string;
  benefits?: string;
  procedure?: string[];
  result?: string;
  whatIfNotDone?: string;
  paragraphs: string[];
  isActive: boolean;
  order?: number;
}

export interface TreatmentsSettings {
  showDiagnostics: boolean;
  showTreatments: boolean;
  treatmentHeading?: string;
  treatmentSubtitle?: string;
  diagnosticHeading?: string;
  diagnosticSubtitle?: string;
  transitionSpeed?: "slow" | "normal" | "fast";
}

export interface TreatmentsStoreData {
  settings?: TreatmentsSettings;
  treatments: TreatmentItem[];
  diagnostics: TreatmentItem[];
}

export interface AvailableClinicImage {
  name: string;
  url: string;
  category: string;
}

export const AVAILABLE_CLINIC_IMAGES: AvailableClinicImage[] = [
  {
    name: "Teeth Whitening Procedure",
    url: "/images/treatments/teeth-whitening.jpg",
    category: "Cosmetic",
  },
  {
    name: "Orthodontics & Clear Aligners",
    url: "/images/treatments/orthodontics.jpg",
    category: "Orthodontics",
  },
  {
    name: "Dental Implants Titanium",
    url: "/images/treatments/dental-implants.jpg",
    category: "Implants",
  },
  {
    name: "Porcelain Veneers & Lumineers",
    url: "/images/treatments/porcelain-veneers.jpg",
    category: "Aesthetics",
  },
  {
    name: "Microscope Root Canal",
    url: "/images/treatments/root-canal.jpg",
    category: "Endodontics",
  },
  {
    name: "Dental Crowns & Ceramic Bridges",
    url: "/images/treatments/dental-crowns.jpg",
    category: "Restorative",
  },
  {
    name: "Gentle Tooth Extraction",
    url: "/images/treatments/wisdom-tooth.jpg",
    category: "Surgery",
  },
  {
    name: "Laser Gum Treatment",
    url: "/images/treatments/gum-treatment.jpg",
    category: "Periodontics",
  },
  {
    name: "3D Computed Tomography (CBCT)",
    url: "/images/treatments/computed-tomography.jpg",
    category: "Diagnostic",
  },
  {
    name: "Digital Intraoral Radiography",
    url: "/images/treatments/digital-radiography.jpg",
    category: "Diagnostic",
  },
  {
    name: "Panoramic Radiological Exam",
    url: "/images/treatments/radiological-examination.jpg",
    category: "Diagnostic",
  },
  {
    name: "Periodontal Pocket Diagnostic",
    url: "/images/treatments/periodontal-examination.jpg",
    category: "Diagnostic",
  },
  {
    name: "Tooth Sensitivity Vitality Test",
    url: "/images/treatments/tooth-sensitivity.jpg",
    category: "Diagnostic",
  },
  {
    name: "Digital Occlusal TMJ Analysis",
    url: "/images/treatments/occlusal-analysis.jpg",
    category: "Diagnostic",
  },
  {
    name: "Optical Fluorescence Caries Exam",
    url: "/images/treatments/fluorescence-diagnostics.jpg",
    category: "Diagnostic",
  },
  {
    name: "Digital Smile Design Simulation",
    url: "/images/treatments/digital-smile-design.jpg",
    category: "Aesthetics",
  },
  {
    name: "Full Mouth Rehabilitation",
    url: "/images/treatments/full-mouth-rehab.jpg",
    category: "Restorative",
  },
  {
    name: "Pediatric & Children Dentistry",
    url: "/images/treatments/children-dentistry.jpg",
    category: "Pediatrics",
  },
  {
    name: "Invisible Tooth Fillings",
    url: "/images/treatments/tooth-fillings.jpg",
    category: "General",
  },
  {
    name: "Precision Complete Dentures",
    url: "/images/treatments/dentures.jpg",
    category: "Prosthetics",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __treatmentsStoreData: TreatmentsStoreData | undefined;
}

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "treatments-data.json"
);

function parseStoreData(parsed: any): TreatmentsStoreData {
  return {
    settings: {
      showDiagnostics:
        parsed.settings?.showDiagnostics !== undefined
          ? Boolean(parsed.settings.showDiagnostics)
          : true,
      showTreatments:
        parsed.settings?.showTreatments !== undefined
          ? Boolean(parsed.settings.showTreatments)
          : true,
      treatmentHeading: parsed.settings?.treatmentHeading || "Treatment",
      treatmentSubtitle:
        parsed.settings?.treatmentSubtitle ||
        "Each tailored treatment is an investment in your health and aesthetics. We deliver results that not only heal — but impress.",
      diagnosticHeading: parsed.settings?.diagnosticHeading || "Diagnostic",
      diagnosticSubtitle:
        parsed.settings?.diagnosticSubtitle ||
        "Diagnostic methods allow us to accurately assess the condition of teeth, detect issues at early stages, and develop a personalized treatment plan",
      transitionSpeed: parsed.settings?.transitionSpeed || "slow",
    },
    treatments: Array.isArray(parsed.treatments) ? parsed.treatments : [],
    diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [],
  };
}

/**
 * Loads treatments & diagnostics data asynchronously from Supabase PostgreSQL.
 * Falls back to local JSON file if DB query fails.
 */
export async function getTreatmentsStoreDataAsync(): Promise<TreatmentsStoreData> {
  // 1. Try reading from Supabase PostgreSQL (survives Vercel deployments)
  try {
    const clinic = await prisma.clinic.findFirst({
      select: { treatmentsData: true },
    });
    if (clinic && clinic.treatmentsData) {
      const loaded = parseStoreData(clinic.treatmentsData);
      global.__treatmentsStoreData = loaded;
      return loaded;
    }
  } catch (dbErr) {
    console.warn("Could not load treatments store data from database, falling back to disk:", dbErr);
  }

  // 2. Fallback to local JSON file
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.treatments)) {
        const storeData = parseStoreData(parsed);
        global.__treatmentsStoreData = storeData;
        return storeData;
      }
    }
  } catch (err) {
    console.warn("Failed to load treatments store data from file:", err);
  }

  if (global.__treatmentsStoreData) {
    return global.__treatmentsStoreData;
  }

  return {
    settings: {
      showDiagnostics: true,
      showTreatments: true,
      treatmentHeading: "Treatment",
      treatmentSubtitle:
        "Each tailored treatment is an investment in your health and aesthetics. We deliver results that not only heal — but impress.",
      diagnosticHeading: "Diagnostic",
      diagnosticSubtitle:
        "Diagnostic methods allow us to accurately assess the condition of teeth, detect issues at early stages, and develop a personalized treatment plan",
      transitionSpeed: "slow",
    },
    treatments: [],
    diagnostics: [],
  };
}

/**
 * Synchronous getter: returns in-memory cache or loads from disk.
 * Kicks off background DB sync.
 */
export function getTreatmentsStoreData(): TreatmentsStoreData {
  if (global.__treatmentsStoreData) {
    return global.__treatmentsStoreData;
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.treatments)) {
        const storeData = parseStoreData(parsed);
        global.__treatmentsStoreData = storeData;
        return storeData;
      }
    }
  } catch {
    // fallback
  }

  getTreatmentsStoreDataAsync().catch(() => {});

  return {
    settings: {
      showDiagnostics: true,
      showTreatments: true,
      treatmentHeading: "Treatment",
      treatmentSubtitle:
        "Each tailored treatment is an investment in your health and aesthetics.",
      diagnosticHeading: "Diagnostic",
      diagnosticSubtitle:
        "Diagnostic methods allow us to accurately assess the condition of teeth.",
      transitionSpeed: "slow",
    },
    treatments: [],
    diagnostics: [],
  };
}

/**
 * Persists treatments data to Supabase database (and local file if writable).
 */
export async function saveTreatmentsStoreDataAsync(data: TreatmentsStoreData): Promise<void> {
  global.__treatmentsStoreData = data;

  // 1. Persist to Supabase PostgreSQL
  try {
    const existing = await prisma.clinic.findFirst({ select: { id: true } });
    if (existing) {
      await prisma.clinic.update({
        where: { id: existing.id },
        data: {
          treatmentsData: data as any,
        },
      });
    } else {
      await prisma.clinic.create({
        data: {
          name: "CA Smile",
          slug: "pediodent-main",
          treatmentsData: data as any,
        },
      });
    }
  } catch (err) {
    console.error("Failed to persist treatments store data to Supabase database:", err);
  }

  // 2. Best-effort write to local file if writable
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem errors on Vercel
  }
}

export function saveTreatmentsStoreData(data: TreatmentsStoreData): void {
  saveTreatmentsStoreDataAsync(data).catch((err) => {
    console.error("Error in background saveTreatmentsStoreData:", err);
  });
}

/**
 * Updates treatments & diagnostics settings (e.g. showDiagnostics toggle)
 * Persisted to Supabase DB.
 */
export async function updateTreatmentsSettingsAsync(
  newSettings: Partial<TreatmentsSettings>
): Promise<TreatmentsSettings> {
  const store = await getTreatmentsStoreDataAsync();
  const current = store.settings || { showDiagnostics: true, showTreatments: true };
  const updatedSettings: TreatmentsSettings = {
    ...current,
    ...newSettings,
  };
  store.settings = updatedSettings;
  await saveTreatmentsStoreDataAsync(store);
  return updatedSettings;
}

export function updateTreatmentsSettings(
  newSettings: Partial<TreatmentsSettings>
): TreatmentsSettings {
  const store = getTreatmentsStoreData();
  const current = store.settings || { showDiagnostics: true, showTreatments: true };
  const updatedSettings: TreatmentsSettings = {
    ...current,
    ...newSettings,
  };
  store.settings = updatedSettings;
  saveTreatmentsStoreData(store);
  return updatedSettings;
}

export async function addTreatmentItemAsync(
  type: "treatments" | "diagnostics",
  item: Omit<TreatmentItem, "id"> & { id?: string }
): Promise<TreatmentItem> {
  const store = await getTreatmentsStoreDataAsync();
  const slug = item.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Persist base64 images to Supabase media table
  let imageUrl = item.image || "/images/treatments/teeth-whitening.jpg";
  if (imageUrl && imageUrl.startsWith("data:image/")) {
    imageUrl = (await persistMediaAsync(imageUrl, "treatment")) || imageUrl;
  }

  const newItem: TreatmentItem = {
    id: item.id || slug || `item-${Date.now()}`,
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    category: item.category || (type === "treatments" ? "Treatment" : "Diagnostic"),
    image: imageUrl,
    whatItIs: item.whatItIs || item.paragraphs?.[0] || "",
    howItWorks: item.howItWorks || item.paragraphs?.[1] || "",
    benefits: item.benefits || "",
    procedure: item.procedure || [],
    result: item.result || "",
    whatIfNotDone: item.whatIfNotDone || "",
    paragraphs:
      item.paragraphs && item.paragraphs.length > 0
        ? item.paragraphs
        : [item.whatItIs || "High-precision clinical care.", item.howItWorks || ""].filter(Boolean),
    isActive: item.isActive !== undefined ? item.isActive : true,
    order: (store[type]?.length || 0) + 1,
  };

  store[type] = [...store[type], newItem];
  await saveTreatmentsStoreDataAsync(store);
  return newItem;
}

export function addTreatmentItem(
  type: "treatments" | "diagnostics",
  item: Omit<TreatmentItem, "id"> & { id?: string }
): TreatmentItem {
  const store = getTreatmentsStoreData();
  const slug = item.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const newItem: TreatmentItem = {
    id: item.id || slug || `item-${Date.now()}`,
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    category: item.category || (type === "treatments" ? "Treatment" : "Diagnostic"),
    image: item.image || "/images/treatments/teeth-whitening.jpg",
    whatItIs: item.whatItIs || item.paragraphs?.[0] || "",
    howItWorks: item.howItWorks || item.paragraphs?.[1] || "",
    benefits: item.benefits || "",
    procedure: item.procedure || [],
    result: item.result || "",
    whatIfNotDone: item.whatIfNotDone || "",
    paragraphs:
      item.paragraphs && item.paragraphs.length > 0
        ? item.paragraphs
        : [item.whatItIs || "High-precision clinical care.", item.howItWorks || ""].filter(Boolean),
    isActive: item.isActive !== undefined ? item.isActive : true,
    order: (store[type]?.length || 0) + 1,
  };

  store[type] = [...store[type], newItem];
  saveTreatmentsStoreData(store);
  return newItem;
}

export async function updateTreatmentItemAsync(
  type: "treatments" | "diagnostics",
  id: string,
  updatedFields: Partial<TreatmentItem>
): Promise<TreatmentItem | null> {
  const store = await getTreatmentsStoreDataAsync();
  const index = store[type].findIndex((it) => it.id === id);
  if (index === -1) return null;

  const current = store[type][index];

  // Persist base64 images if updated
  let finalImage = updatedFields.image !== undefined ? updatedFields.image : current.image;
  if (finalImage && finalImage.startsWith("data:image/")) {
    finalImage = (await persistMediaAsync(finalImage, "treatment")) || finalImage;
  }

  const updated: TreatmentItem = {
    ...current,
    ...updatedFields,
    image: finalImage,
    id: current.id,
  };

  if (updatedFields.whatItIs || updatedFields.howItWorks) {
    updated.paragraphs = [
      updated.whatItIs || current.whatItIs || current.paragraphs[0] || "",
      updated.howItWorks || current.howItWorks || current.paragraphs[1] || "",
    ].filter(Boolean);
  }

  store[type][index] = updated;
  await saveTreatmentsStoreDataAsync(store);
  return updated;
}

export function updateTreatmentItem(
  type: "treatments" | "diagnostics",
  id: string,
  updatedFields: Partial<TreatmentItem>
): TreatmentItem | null {
  const store = getTreatmentsStoreData();
  const index = store[type].findIndex((it) => it.id === id);
  if (index === -1) return null;

  const current = store[type][index];
  const updated: TreatmentItem = {
    ...current,
    ...updatedFields,
    id: current.id,
  };

  if (updatedFields.whatItIs || updatedFields.howItWorks) {
    updated.paragraphs = [
      updated.whatItIs || current.whatItIs || current.paragraphs[0] || "",
      updated.howItWorks || current.howItWorks || current.paragraphs[1] || "",
    ].filter(Boolean);
  }

  store[type][index] = updated;
  saveTreatmentsStoreData(store);
  return updated;
}

export async function deleteTreatmentItemAsync(
  type: "treatments" | "diagnostics",
  id: string
): Promise<boolean> {
  const store = await getTreatmentsStoreDataAsync();
  const initialLen = store[type].length;
  store[type] = store[type].filter((it) => it.id !== id);
  if (store[type].length !== initialLen) {
    await saveTreatmentsStoreDataAsync(store);
    return true;
  }
  return false;
}

export function deleteTreatmentItem(
  type: "treatments" | "diagnostics",
  id: string
): boolean {
  const store = getTreatmentsStoreData();
  const initialLen = store[type].length;
  store[type] = store[type].filter((it) => it.id !== id);
  if (store[type].length !== initialLen) {
    saveTreatmentsStoreData(store);
    return true;
  }
  return false;
}

export async function getTreatmentByIdAsync(id: string): Promise<TreatmentItem | null> {
  const store = await getTreatmentsStoreDataAsync();
  const item = store.treatments.find((t) => t.id === id || t.id.toLowerCase() === id.toLowerCase());
  if (item) return item;
  const diag = store.diagnostics.find((d) => d.id === id || d.id.toLowerCase() === id.toLowerCase());
  return diag || null;
}

export function getTreatmentById(id: string): TreatmentItem | null {
  const store = getTreatmentsStoreData();
  const item = store.treatments.find((t) => t.id === id || t.id.toLowerCase() === id.toLowerCase());
  if (item) return item;
  const diag = store.diagnostics.find((d) => d.id === id || d.id.toLowerCase() === id.toLowerCase());
  return diag || null;
}
