import fs from "fs";
import path from "path";

export interface BackupHistoryItem {
  id: string;
  type: "daily" | "weekly" | "monthly" | "full";
  fileName: string;
  recordCount: number;
  sizeBytes: number;
  sizePretty: string;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  executedBy: string;
  verified: boolean;
  worksheets: string[];
  error?: string | null;
}

export interface DatabaseBackupConfig {
  dailyEnabled: boolean;
  dailyTime: string; // e.g. "02:00 AM"
  dailyType: "incremental" | "full";
  weeklyEnabled: boolean;
  weeklyDay: string; // e.g. "Sunday"
  weeklyTime: string;
  weeklyType: "incremental" | "full";
  monthlyEnabled: boolean;
  monthlyDay: string; // e.g. "1st"
  monthlyTime: string;
  monthlyType: "incremental" | "full";
  retentionDays: number; // 7, 30, 90, 180, 365, or 0 (forever)
  autoHealthCheckFrequency: "off" | "1h" | "6h" | "24h";
  lastAutoHealthCheck?: string;
  history: BackupHistoryItem[];
  lastUpdated: string;
}

const CONFIG_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "database-backup-config.json"
);

const DEFAULT_CONFIG: DatabaseBackupConfig = {
  dailyEnabled: true,
  dailyTime: "02:00 AM IST",
  dailyType: "incremental",
  weeklyEnabled: true,
  weeklyDay: "Sunday",
  weeklyTime: "02:00 AM IST",
  weeklyType: "incremental",
  monthlyEnabled: true,
  monthlyDay: "1st",
  monthlyTime: "02:00 AM IST",
  monthlyType: "incremental",
  retentionDays: 90,
  autoHealthCheckFrequency: "off",
  history: [],
  lastUpdated: new Date().toISOString(),
};

declare global {
  var __databaseBackupConfigCache: DatabaseBackupConfig | undefined;
}

export function getDatabaseBackupConfig(): DatabaseBackupConfig {
  const cached = global.__databaseBackupConfigCache;
  if (cached) {
    return cached;
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const loaded: DatabaseBackupConfig = { ...DEFAULT_CONFIG, ...parsed };
      global.__databaseBackupConfigCache = loaded;
      return loaded;
    }
  } catch (err) {
    console.error("Error reading database backup config:", err);
  }

  const fallback: DatabaseBackupConfig = { ...DEFAULT_CONFIG };
  global.__databaseBackupConfigCache = fallback;
  return fallback;
}

export function saveDatabaseBackupConfig(
  updates: Partial<DatabaseBackupConfig>
): DatabaseBackupConfig {
  const current = getDatabaseBackupConfig();
  const updated: DatabaseBackupConfig = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  global.__databaseBackupConfigCache = updated;

  try {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database backup config:", err);
  }

  return updated;
}

export function addBackupHistoryItem(item: Omit<BackupHistoryItem, "id">): BackupHistoryItem {
  const config = getDatabaseBackupConfig();
  const newItem: BackupHistoryItem = {
    ...item,
    id: `bkp-${item.type}-${Date.now()}`,
  };

  const updatedHistory = [newItem, ...(config.history || [])].slice(0, 100);
  saveDatabaseBackupConfig({ history: updatedHistory });

  return newItem;
}

export function removeBackupHistoryItem(id: string): boolean {
  const config = getDatabaseBackupConfig();
  const filtered = (config.history || []).filter((h) => h.id !== id);
  saveDatabaseBackupConfig({ history: filtered });
  return true;
}
