import fs from "fs";
import path from "path";

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

export function getTreatmentsStoreData(): TreatmentsStoreData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.treatments)) {
        const storeData: TreatmentsStoreData = {
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
          treatments: parsed.treatments,
          diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [],
        };
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

export function saveTreatmentsStoreData(data: TreatmentsStoreData): void {
  global.__treatmentsStoreData = data;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist treatments store data to file:", err);
  }
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
    paragraphs: item.paragraphs && item.paragraphs.length > 0
      ? item.paragraphs
      : [item.whatItIs || "High-precision clinical care delivered with advanced dental technology.", item.howItWorks || ""].filter(Boolean),
    isActive: item.isActive !== undefined ? item.isActive : true,
    order: (store[type]?.length || 0) + 1,
  };

  store[type] = [...store[type], newItem];
  saveTreatmentsStoreData(store);
  return newItem;
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
    id: current.id, // Immutable ID for routing integrity
  };

  // Keep paragraphs synced if whatItIs or howItWorks is updated
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

export function getTreatmentById(id: string): TreatmentItem | null {
  const store = getTreatmentsStoreData();
  const item = store.treatments.find((t) => t.id === id || t.id.toLowerCase() === id.toLowerCase());
  if (item) return item;
  // Fallback to check diagnostics as well if queried
  const diag = store.diagnostics.find((d) => d.id === id || d.id.toLowerCase() === id.toLowerCase());
  return diag || null;
}
