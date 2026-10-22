import fs from "fs";
import path from "path";

export type RetentionDuration =
  | "7_DAYS"
  | "30_DAYS"
  | "60_DAYS"
  | "90_DAYS"
  | "6_MONTHS"
  | "1_YEAR"
  | "2_YEARS"
  | "FOREVER";

export interface CleanupHistoryItem {
  id: string;
  date: string;
  action: string;
  dataType: string;
  recordsCount: number;
  storageFreedMb: number;
  admin: string;
  status: "SUCCESS" | "FAILED" | "ABORTED";
  archiveFileId?: string | null;
  notes?: string;
}

export interface StorageSnapshot {
  date: string;
  storageMb: number;
  percent: number;
}

export interface StorageRetentionConfig {
  autoArchiveEnabled: boolean;
  autoCleanupEnabled: boolean;
  thresholdPercent: number; // e.g. 70, 80, 85, 90, 95
  cleanupFrequency: "daily" | "weekly" | "monthly";
  retentionPolicies: {
    appointments: RetentionDuration;
    whatsapp_bookings: RetentionDuration;
    system_logs: RetentionDuration;
    patients: "FOREVER"; // Strictly locked
    clinical_services: "FOREVER";
  };
  cleanupHistory: CleanupHistoryItem[];
  storageHistory: StorageSnapshot[];
  lastUpdated: string;
}

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "storage-retention-config.json"
);

const DEFAULT_CONFIG: StorageRetentionConfig = {
  autoArchiveEnabled: false,
  autoCleanupEnabled: false,
  thresholdPercent: 85,
  cleanupFrequency: "weekly",
  retentionPolicies: {
    appointments: "1_YEAR",
    whatsapp_bookings: "90_DAYS",
    system_logs: "30_DAYS",
    patients: "FOREVER",
    clinical_services: "FOREVER",
  },
  cleanupHistory: [
    {
      id: "cln-initial-001",
      date: new Date().toISOString(),
      action: "POLICY_CHECK",
      dataType: "System Initialisation",
      recordsCount: 0,
      storageFreedMb: 0,
      admin: "System Engine",
      status: "SUCCESS",
      archiveFileId: null,
      notes: "Default storage retention configuration active",
    },
  ],
  storageHistory: [
    { date: "2026-09-01", storageMb: 185, percent: 37 },
    { date: "2026-09-08", storageMb: 194, percent: 38.8 },
    { date: "2026-09-15", storageMb: 202, percent: 40.4 },
    { date: "2026-09-22", storageMb: 210, percent: 42 },
  ],
  lastUpdated: new Date().toISOString(),
};

// Global in-memory cache for HMR preservation
declare global {
  // eslint-disable-next-line no-var
  var __retentionConfigCache: StorageRetentionConfig | undefined;
}

export function getStorageRetentionConfig(): StorageRetentionConfig {
  if (global.__retentionConfigCache) {
    return global.__retentionConfigCache;
  }

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      // Ensure protected policies remain strictly locked
      parsed.retentionPolicies.patients = "FOREVER";
      parsed.retentionPolicies.clinical_services = "FOREVER";
      global.__retentionConfigCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read storage retention config, using default:", err);
  }

  global.__retentionConfigCache = { ...DEFAULT_CONFIG };
  return global.__retentionConfigCache;
}

export function saveStorageRetentionConfig(
  newConfig: Partial<StorageRetentionConfig>
): StorageRetentionConfig {
  const current = getStorageRetentionConfig();

  const updated: StorageRetentionConfig = {
    ...current,
    ...newConfig,
    retentionPolicies: {
      ...current.retentionPolicies,
      ...(newConfig.retentionPolicies || {}),
      // Safeguard: Patient and clinical records can never be set to auto-clean
      patients: "FOREVER",
      clinical_services: "FOREVER",
    },
    lastUpdated: new Date().toISOString(),
  };

  global.__retentionConfigCache = updated;

  try {
    fs.mkdirSync(path.dirname(CONFIG_FILE_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save storage retention config to disk:", err);
  }

  return updated;
}

export function addCleanupHistoryItem(
  item: Omit<CleanupHistoryItem, "id" | "date">
): CleanupHistoryItem {
  const config = getStorageRetentionConfig();
  const newItem: CleanupHistoryItem = {
    ...item,
    id: `cln-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
  };

  const updatedHistory = [newItem, ...(config.cleanupHistory || [])].slice(0, 100);
  saveStorageRetentionConfig({ cleanupHistory: updatedHistory });

  return newItem;
}

export function calculateForecast(
  currentStorageMb: number,
  limitMb = 500
): {
  hasForecast: boolean;
  monthlyGrowthMb: number | null;
  remainingMb: number;
  monthsUntilLimit: number | null;
  message: string;
} {
  const config = getStorageRetentionConfig();
  const history = config.storageHistory || [];

  if (history.length < 3) {
    return {
      hasForecast: false,
      monthlyGrowthMb: null,
      remainingMb: Math.max(0, limitMb - currentStorageMb),
      monthsUntilLimit: null,
      message: "Not enough historical data for an accurate forecast.",
    };
  }

  // Calculate average growth rate between first and last snapshots
  const first = history[0];
  const last = history[history.length - 1];
  const growth = Math.max(1, last.storageMb - first.storageMb);
  const daysDiff = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 3600 * 24));
  const monthlyRate = Number(((growth / daysDiff) * 30).toFixed(1));

  const remainingMb = Math.max(0, limitMb - currentStorageMb);
  const monthsUntilLimit = monthlyRate > 0 ? Math.round(remainingMb / monthlyRate) : null;

  return {
    hasForecast: true,
    monthlyGrowthMb: monthlyRate,
    remainingMb,
    monthsUntilLimit,
    message: monthsUntilLimit
      ? `Approximately ${monthsUntilLimit} months until storage limit at current growth rate (+${monthlyRate} MB/month).`
      : "Storage growth rate is stable.",
  };
}
