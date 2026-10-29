import fs from "fs";
import path from "path";

export interface PatientNumberingConfig {
  enableCustomFormat: boolean;
  prefix: string;
  includeYear: boolean;
  yearType: "calendar" | "fiscal";
  resetEachYear: boolean;
  digitWidth: number;
  separator: string;
  startingNumber: number;
  currentCounter: number;
  lastYearReset?: string;
  patientCodeMap: Record<string, string>;
}

const CONFIG_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "patient-numbering-config.json"
);

const DEFAULT_CONFIG: PatientNumberingConfig = {
  enableCustomFormat: true,
  prefix: "",
  includeYear: false,
  yearType: "calendar",
  resetEachYear: false,
  digitWidth: 5,
  separator: "Dash ( - )",
  startingNumber: 1,
  currentCounter: 1,
  lastYearReset: "2026",
  patientCodeMap: {},
};

let memoryCache: PatientNumberingConfig | null = null;

export function getPatientNumberingConfig(): PatientNumberingConfig {
  if (memoryCache) return memoryCache;

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      memoryCache = {
        ...DEFAULT_CONFIG,
        ...parsed,
        patientCodeMap: parsed.patientCodeMap || {},
      };
      return memoryCache!;
    }
  } catch (err) {
    console.error("Failed to read patient numbering config:", err);
  }

  memoryCache = { ...DEFAULT_CONFIG };
  return memoryCache;
}

export function savePatientNumberingConfig(
  updates: Partial<PatientNumberingConfig>
): PatientNumberingConfig {
  const current = getPatientNumberingConfig();

  const startingNum =
    typeof updates.startingNumber === "number"
      ? Math.max(1, updates.startingNumber)
      : current.startingNumber;

  let currentCounter = current.currentCounter;
  if (typeof updates.startingNumber === "number" && updates.startingNumber > currentCounter) {
    currentCounter = updates.startingNumber;
  }
  if (typeof updates.currentCounter === "number") {
    currentCounter = Math.max(currentCounter, updates.currentCounter);
  }

  const merged: PatientNumberingConfig = {
    ...current,
    ...updates,
    startingNumber: startingNum,
    currentCounter,
  };

  memoryCache = merged;

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save patient numbering config to disk:", err);
  }

  return merged;
}

export function getFiscalYearString(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 3 = April
  // Fiscal year in India starts in April
  if (month >= 3) {
    const startYY = String(year).slice(-2);
    const endYY = String(year + 1).slice(-2);
    return `${startYY}-${endYY}`;
  } else {
    const startYY = String(year - 1).slice(-2);
    const endYY = String(year).slice(-2);
    return `${startYY}-${endYY}`;
  }
}

export function formatPatientCode(
  counter: number,
  config = getPatientNumberingConfig(),
  referenceDate = new Date()
): string {
  if (!config.enableCustomFormat) {
    return `PT${String(counter).padStart(5, "0")}`;
  }

  // Determine separator character
  let sep = "-";
  if (config.separator === "Slash ( / )") sep = "/";
  else if (config.separator === "Dot ( . )") sep = ".";
  else if (config.separator === "None") sep = "";
  else if (config.separator === "Dash ( - )") sep = "-";

  const numPart = String(counter).padStart(config.digitWidth || 5, "0");
  const parts: string[] = [];

  // Prefix
  const trimmedPrefix = (config.prefix || "").trim();
  if (trimmedPrefix) {
    parts.push(trimmedPrefix);
  }

  // Year
  if (config.includeYear) {
    if (config.yearType === "fiscal") {
      parts.push(getFiscalYearString(referenceDate));
    } else {
      parts.push(String(referenceDate.getFullYear()));
    }
  }

  // Number
  parts.push(numPart);

  return parts.join(sep);
}

export function getNextPatientCode(config = getPatientNumberingConfig()): string {
  return formatPatientCode(config.currentCounter, config);
}

export function assignPatientCode(patientId: string, createdAt?: Date | string): string {
  const config = getPatientNumberingConfig();

  if (config.patientCodeMap && config.patientCodeMap[patientId]) {
    return config.patientCodeMap[patientId];
  }

  const dateObj = createdAt ? new Date(createdAt) : new Date();
  const currentYearStr = String(dateObj.getFullYear());

  // Check yearly reset condition
  let counter = config.currentCounter;
  let lastYear = config.lastYearReset || currentYearStr;

  if (config.includeYear && config.resetEachYear && lastYear !== currentYearStr) {
    counter = config.startingNumber || 1;
    lastYear = currentYearStr;
  }

  const newCode = formatPatientCode(counter, config, dateObj);

  config.patientCodeMap[patientId] = newCode;
  config.currentCounter = counter + 1;
  config.lastYearReset = lastYear;

  savePatientNumberingConfig({
    currentCounter: config.currentCounter,
    lastYearReset: config.lastYearReset,
    patientCodeMap: config.patientCodeMap,
  });

  return newCode;
}

export function getPatientCode(patientId: string, createdAt?: Date | string): string {
  const config = getPatientNumberingConfig();
  if (config.patientCodeMap && config.patientCodeMap[patientId]) {
    return config.patientCodeMap[patientId];
  }
  return assignPatientCode(patientId, createdAt);
}
