import fs from "fs";
import path from "path";

export interface HealthLogEntry {
  id: string;
  database: "clinic" | "primary" | "secondary";
  status:
    | "CONNECTED"
    | "TIMEOUT"
    | "AUTH_ERROR"
    | "CONNECTION_ERROR"
    | "PAUSED_OR_UNAVAILABLE"
    | "UNKNOWN_ERROR";
  response_time: number | null;
  error_type?: string | null;
  message?: string;
  checked_at: string;
}

const LOG_FILE_PATH = path.join(process.cwd(), "src", "data", "database-health-logs.json");
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_LOG_ENTRIES = 500;

function readLogsFromFile(): HealthLogEntry[] {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(LOG_FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[HealthLogger] Failed to read health logs:", err);
    return [];
  }
}

function writeLogsToFile(logs: HealthLogEntry[]) {
  try {
    const dir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("[HealthLogger] Failed to save health logs:", err);
  }
}

/**
 * Appends a health log and automatically prunes records older than 30 days.
 */
export function appendHealthLog(entry: Omit<HealthLogEntry, "id">): HealthLogEntry {
  const currentLogs = readLogsFromFile();
  const now = Date.now();
  const cutoff = now - THIRTY_DAYS_MS;

  // Filter out logs older than 30 days
  const validLogs = currentLogs.filter((log) => {
    const time = new Date(log.checked_at).getTime();
    return !isNaN(time) && time > cutoff;
  });

  const newEntry: HealthLogEntry = {
    id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...entry,
  };

  // Keep newest at front, capped at MAX_LOG_ENTRIES
  const updatedLogs = [newEntry, ...validLogs].slice(0, MAX_LOG_ENTRIES);
  writeLogsToFile(updatedLogs);

  return newEntry;
}

/**
 * Retrieves the most recent health logs (default: 25).
 */
export function getRecentHealthLogs(limit = 25): HealthLogEntry[] {
  const currentLogs = readLogsFromFile();
  const now = Date.now();
  const cutoff = now - THIRTY_DAYS_MS;

  return currentLogs
    .filter((log) => {
      const time = new Date(log.checked_at).getTime();
      return !isNaN(time) && time > cutoff;
    })
    .slice(0, limit);
}

/**
 * Clears old health logs (or all logs) without touching any clinic data.
 */
export function clearHealthLogs(): { clearedCount: number; remainingCount: number } {
  const currentLogs = readLogsFromFile();
  const count = currentLogs.length;
  writeLogsToFile([]);
  return { clearedCount: count, remainingCount: 0 };
}
