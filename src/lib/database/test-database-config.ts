import fs from "fs";
import path from "path";

export type DatabaseMode = "production" | "test";

export interface DatabaseModeConfig {
  activeMode: DatabaseMode;
  testDatabaseUrl: string;
  testDatabaseConnected: boolean;
  lastPurgedAt: string | null;
}

const CONFIG_PATH = path.resolve(process.cwd(), "src/data/database-mode-config.json");

const DEFAULT_CONFIG: DatabaseModeConfig = {
  activeMode: "production",
  testDatabaseUrl: "",
  testDatabaseConnected: false,
  lastPurgedAt: null,
};

export function getDatabaseModeConfig(): DatabaseModeConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const testUrl = parsed.testDatabaseUrl || process.env.TEST_DATABASE_URL || "";
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        testDatabaseUrl: testUrl,
      };
    }
  } catch (err) {
    console.error("Error reading database mode config:", err);
  }
  return {
    ...DEFAULT_CONFIG,
    testDatabaseUrl: process.env.TEST_DATABASE_URL || "",
  };
}

export function saveDatabaseModeConfig(partial: Partial<DatabaseModeConfig>): DatabaseModeConfig {
  try {
    const current = getDatabaseModeConfig();
    const updated: DatabaseModeConfig = {
      ...current,
      ...partial,
    };
    // Security: Keep database passwords out of tracked JSON file;
    // TEST_DATABASE_URL is persisted in .env (which is gitignored).
    const safeForDisk = {
      ...updated,
      testDatabaseUrl: "",
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(safeForDisk, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.error("Error saving database mode config:", err);
    return getDatabaseModeConfig();
  }
}

export function isLocalEnvironment(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (!process.env.VERCEL && !process.env.VERCEL_ENV) return true;
  return false;
}

export function getActiveDatabaseMode(): DatabaseMode {
  const config = getDatabaseModeConfig();
  const testUrl = getTestDatabaseUrl();

  // Safety check: if test mode is selected but no test URL is available, fall back to production
  if (config.activeMode === "test" && !testUrl) {
    return "production";
  }
  return config.activeMode;
}

export function isTestModeActive(): boolean {
  return getActiveDatabaseMode() === "test";
}

export function getTestDatabaseUrl(): string | undefined {
  const config = getDatabaseModeConfig();
  const raw = config.testDatabaseUrl || process.env.TEST_DATABASE_URL || undefined;
  return raw ? normalizePostgresUrl(raw) : undefined;
}

export function normalizePostgresUrl(raw: string): string {
  let url = (raw || "").trim();
  url = url.replace(/^["']|["']$/g, "").trim();

  // Fix spaces after colon, e.g. "postgres: password"
  url = url.replace(/(postgres(?:ql)?:\/\/[^:]+:\s+)/i, (m) => m.replace(/\s+/g, ""));

  // Encode unencoded @ in password: postgresql://username:pass@word@host:port/database
  const match = url.match(/^(postgres(?:ql)?:\/\/)([^:]+):(.*)@([^@]+)$/);
  if (match) {
    const [, protocol, user, pass, hostAndRest] = match;
    const safePass = pass.replace(/@/g, "%40");
    url = `${protocol}${user}:${safePass}@${hostAndRest}`;
  }

  // Ensure sslmode=require for Supabase / remote cloud databases
  if (!url.includes("sslmode=")) {
    url += (url.includes("?") ? "&" : "?") + "sslmode=require";
  }

  // Normalize Supabase pooler: convert 5432 to 6543 and add pgbouncer=true for reliable pooler connection
  if (url.includes(".pooler.supabase.com:5432")) {
    url = url.replace(":5432", ":6543");
    if (!url.includes("pgbouncer=true")) {
      url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }

  return url;
}

export function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return "Not configured";
  try {
    const parsed = new URL(url.replace("postgresql://", "http://").replace("postgres://", "http://"));
    const host = parsed.hostname;
    const port = parsed.port || "5432";
    const db = parsed.pathname.replace("/", "") || "postgres";
    return `${host}:${port}/${db}`;
  } catch {
    return "postgresql://***@configured";
  }
}

