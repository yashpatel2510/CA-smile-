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

// Fast in-memory cache to eliminate repetitive synchronous disk reads across requests
let memoryConfigCache: DatabaseModeConfig | null = null;
let memoryConfigTimestamp = 0;
const CACHE_TTL_MS = 1000;

export function invalidateDatabaseModeCache(): void {
  memoryConfigCache = null;
  memoryConfigTimestamp = 0;
}

/**
 * Safely extracts a database URL from process.env or falls back to reading .env directly
 */
export function readEnvDatabaseUrl(key: string): string {
  if (process.env[key] && process.env[key]!.trim()) {
    return process.env[key]!.trim();
  }
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=["']?([^"'\r\n]+)["']?`, "m"));
      if (match && match[1]) {
        const val = match[1].trim();
        process.env[key] = val;
        return val;
      }
    }
  } catch {}
  return "";
}

export function getDatabaseModeConfig(): DatabaseModeConfig {
  const now = Date.now();
  if (memoryConfigCache && now - memoryConfigTimestamp < CACHE_TTL_MS) {
    return memoryConfigCache;
  }

  const envTestUrl = readEnvDatabaseUrl("TEST_DATABASE_URL");

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const testUrl = parsed.testDatabaseUrl || envTestUrl || process.env.TEST_DATABASE_URL || "";
      const result: DatabaseModeConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        testDatabaseUrl: testUrl,
      };
      memoryConfigCache = result;
      memoryConfigTimestamp = now;
      return result;
    }
  } catch (err) {
    console.error("Error reading database mode config:", err);
  }

  const fallback: DatabaseModeConfig = {
    ...DEFAULT_CONFIG,
    testDatabaseUrl: envTestUrl || process.env.TEST_DATABASE_URL || "",
  };
  memoryConfigCache = fallback;
  memoryConfigTimestamp = now;
  return fallback;
}

export function saveDatabaseModeConfig(partial: Partial<DatabaseModeConfig>): DatabaseModeConfig {
  try {
    const current = getDatabaseModeConfig();
    const updated: DatabaseModeConfig = {
      ...current,
      ...partial,
    };

    // If a new testDatabaseUrl is provided or currently present, keep it accessible
    const finalTestUrl = updated.testDatabaseUrl || current.testDatabaseUrl || readEnvDatabaseUrl("TEST_DATABASE_URL");
    updated.testDatabaseUrl = finalTestUrl;

    // Security & tracking: Persist activeMode and state to disk
    const diskPayload: DatabaseModeConfig = {
      ...updated,
      testDatabaseUrl: finalTestUrl,
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(diskPayload, null, 2), "utf-8");

    memoryConfigCache = updated;
    memoryConfigTimestamp = Date.now();
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
  const raw = config.testDatabaseUrl || process.env.TEST_DATABASE_URL || readEnvDatabaseUrl("TEST_DATABASE_URL") || undefined;
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

  // Normalize Supabase pooler: convert 5432 to 6543
  if (url.includes(".pooler.supabase.com:5432")) {
    url = url.replace(":5432", ":6543");
  }

  // Transaction mode pooler on port 6543 requires pgbouncer=true for Prisma prepared statements
  if (url.includes(":6543") && !url.includes("pgbouncer=true")) {
    url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
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
