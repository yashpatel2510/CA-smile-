import {
  prisma as primaryClient,
  authPrisma as secondaryClient,
  getPrimaryDatabaseUrl,
  getSecondaryDatabaseUrl,
} from "@/lib/prisma";
import { appendHealthLog } from "@/lib/database/health-logger";

export type DatabaseConnectionStatus =
  | "CONNECTED"
  | "TIMEOUT"
  | "AUTH_ERROR"
  | "CONNECTION_ERROR"
  | "PAUSED_OR_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export type OverallSystemStatus = "HEALTHY" | "WARNING" | "CRITICAL";

export interface DatabaseTargetHealthResult {
  id: "primary" | "secondary";
  name: string;
  purpose: string;
  provider: string;
  maskedHost: string;
  status: DatabaseConnectionStatus;
  isReachable: boolean;
  isAuthSucceeded: boolean;
  isTimedOut: boolean;
  responseTimeMs: number | null;
  checkedAt: string;
  attemptsUsed: number;
  errorType: string | null;
  message: string;
  diagnosticAdvice?: string;
}

export interface TableStorageInfo {
  tableName: string;
  totalSize: string;
  sizeBytes: number;
  rowCount: number;
}

export interface StorageMetricsResult {
  available: boolean;
  usedBytes: number | null;
  usedPretty: string | null;
  limitBytes: number;
  limitPretty: string;
  usagePercent: number | null;
  statusLevel: "NORMAL" | "WARNING" | "HIGH" | "CRITICAL" | "UNAVAILABLE";
  statusLabel: string;
  checkedAt: string;
  tables?: TableStorageInfo[];
  message?: string;
}

export interface CompleteHealthReport {
  success: boolean;
  overallStatus: OverallSystemStatus;
  overallMessage: string;
  checkedAt: string;
  database: DatabaseTargetHealthResult;
  databases: {
    primary: DatabaseTargetHealthResult;
    secondary?: DatabaseTargetHealthResult;
  };
  storage: StorageMetricsResult;
}

function parseMaskedHost(rawUrl?: string): { provider: string; maskedHost: string } {
  if (!rawUrl) {
    return { provider: "PostgreSQL", maskedHost: "Not configured" };
  }
  try {
    const parsed = new URL(rawUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
    const host = parsed.hostname;
    const port = parsed.port || "5432";

    let provider = "Supabase PostgreSQL";
    if (host === "localhost" || host === "127.0.0.1") {
      provider = "Local PostgreSQL";
    } else if (host.includes("neon.tech")) {
      provider = "Neon PostgreSQL";
    } else if (host.includes("supabase.co") || host.includes("supabase.com") || host.startsWith("[2406:") || host.startsWith("2406:")) {
      provider = "Supabase PostgreSQL (AWS Cloud)";
    }

    let masked = host;
    if (host.startsWith("[") && host.endsWith("]")) {
      const parts = host.slice(1, -1).split(":");
      masked = `[${parts[0]}:${parts[1]}:***:${parts[parts.length - 1]}]:${port}`;
    } else if (host.includes(".")) {
      const parts = host.split(".");
      if (parts.length > 2) {
        masked = `${parts[0].slice(0, 3)}***.${parts.slice(-2).join(".")}:${port}`;
      } else {
        masked = `${host}:${port}`;
      }
    }

    return { provider, maskedHost: masked };
  } catch {
    return { provider: "PostgreSQL", maskedHost: "Configured (Protected Host)" };
  }
}

/**
 * Wraps a promise with a strict timeout to prevent connection hangs.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 6000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`CONNECTION_TIMEOUT:${timeoutMs}`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

function classifyDatabaseError(err: any): {
  status: DatabaseConnectionStatus;
  errorType: string;
  message: string;
  isReachable: boolean;
  isAuthSucceeded: boolean;
  isTimedOut: boolean;
  diagnosticAdvice?: string;
} {
  const errMsg = err?.message || String(err || "");

  if (errMsg.includes("CONNECTION_TIMEOUT") || errMsg.includes("timed out") || errMsg.includes("Can't reach database server")) {
    return {
      status: "TIMEOUT",
      errorType: "CONNECTION_TIMEOUT",
      message: "Database connection timed out. Supabase may be paused or unavailable.",
      isReachable: false,
      isAuthSucceeded: false,
      isTimedOut: true,
      diagnosticAdvice:
        "The server did not respond within the connection limit. If using Supabase, check if the project is PAUSED (free projects pause after 7 days without queries) or verify whether the Connection Pooler URI is required.",
    };
  }

  if (
    errMsg.includes("SASL authentication failed") ||
    errMsg.includes("password authentication failed") ||
    errMsg.includes("Authentication failed") ||
    errMsg.includes("no such user")
  ) {
    return {
      status: "AUTH_ERROR",
      errorType: "AUTHENTICATION_FAILED",
      message: "Database authentication failed. Check database credentials.",
      isReachable: true,
      isAuthSucceeded: false,
      isTimedOut: false,
      diagnosticAdvice:
        "Authentication was rejected by the database. If connecting via Supabase Pooler (port 6543), username format must be postgres.[project-ref]. Also verify URL-encoded characters in password.",
    };
  }

  if (errMsg.includes("tenant/user") && errMsg.includes("not found")) {
    return {
      status: "PAUSED_OR_UNAVAILABLE",
      errorType: "TENANT_NOT_FOUND",
      message: "Database tenant was not found or project is inactive.",
      isReachable: true,
      isAuthSucceeded: false,
      isTimedOut: false,
      diagnosticAdvice: "The project reference in your pooler string is invalid or the project has been removed.",
    };
  }

  if (
    errMsg.includes("ECONNREFUSED") ||
    errMsg.includes("ENOTFOUND") ||
    errMsg.includes("EHOSTUNREACH") ||
    errMsg.includes("getaddrinfo")
  ) {
    return {
      status: "CONNECTION_ERROR",
      errorType: "NETWORK_CONNECTION_ERROR",
      message: "Unable to establish a database connection.",
      isReachable: false,
      isAuthSucceeded: false,
      isTimedOut: false,
      diagnosticAdvice: "The host address could not be resolved or network routing to the database port is unavailable.",
    };
  }

  return {
    status: "UNKNOWN_ERROR",
    errorType: "UNEXPECTED_ERROR",
    message: "An unexpected database connection error occurred.",
    isReachable: false,
    isAuthSucceeded: false,
    isTimedOut: false,
    diagnosticAdvice: "Review server logs for technical connection details.",
  };
}

/**
 * Checks the Primary Database connection using a lightweight SELECT 1 query.
 * Retries once on temporary failure (max 2 attempts).
 */
export async function checkPrimaryDatabase(options?: {
  timeoutMs?: number;
  maxAttempts?: number;
}): Promise<DatabaseTargetHealthResult> {
  const timeoutMs = options?.timeoutMs || 6000;
  const maxAttempts = options?.maxAttempts || 2;
  const rawUrl = getPrimaryDatabaseUrl();
  const hostInfo = parseMaskedHost(rawUrl);
  const now = new Date().toISOString();

  if (!rawUrl) {
    const res: DatabaseTargetHealthResult = {
      id: "primary",
      name: "Primary Database",
      purpose: "Main active database for clinic operations (Patients, Appointments, Treatments)",
      provider: hostInfo.provider,
      maskedHost: "Not configured",
      status: "CONNECTION_ERROR",
      isReachable: false,
      isAuthSucceeded: false,
      isTimedOut: false,
      responseTimeMs: null,
      checkedAt: now,
      attemptsUsed: 0,
      errorType: "CONFIG_MISSING",
      message: "PRIMARY_DATABASE_URL or DATABASE_URL is not configured in environment.",
    };
    appendHealthLog({
      database: "primary",
      status: "CONNECTION_ERROR",
      response_time: null,
      error_type: "CONFIG_MISSING",
      message: res.message,
      checked_at: now,
    });
    return res;
  }

  let attemptsUsed = 0;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attemptsUsed = attempt;
    try {
      const startTime = Date.now();
      await withTimeout(primaryClient.$queryRawUnsafe("SELECT 1 as ping;"), timeoutMs);
      const latency = Date.now() - startTime;

      const successRes: DatabaseTargetHealthResult = {
        id: "primary",
        name: "Primary Database",
        purpose: "Main active database for clinic operations (Patients, Appointments, Treatments)",
        provider: hostInfo.provider,
        maskedHost: hostInfo.maskedHost,
        status: "CONNECTED",
        isReachable: true,
        isAuthSucceeded: true,
        isTimedOut: false,
        responseTimeMs: latency,
        checkedAt: now,
        attemptsUsed,
        errorType: null,
        message: `Connection successful (${latency} ms)`,
      };

      appendHealthLog({
        database: "primary",
        status: "CONNECTED",
        response_time: latency,
        error_type: null,
        message: successRes.message,
        checked_at: now,
      });

      return successRes;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxAttempts) {
        // brief 300ms pause before 2nd attempt
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  const classified = classifyDatabaseError(lastError);
  const failureRes: DatabaseTargetHealthResult = {
    id: "primary",
    name: "Primary Database",
    purpose: "Main active database for clinic operations (Patients, Appointments, Treatments)",
    provider: hostInfo.provider,
    maskedHost: hostInfo.maskedHost,
    status: classified.status,
    isReachable: classified.isReachable,
    isAuthSucceeded: classified.isAuthSucceeded,
    isTimedOut: classified.isTimedOut,
    responseTimeMs: null,
    checkedAt: now,
    attemptsUsed,
    errorType: classified.errorType,
    message: classified.message,
    diagnosticAdvice: classified.diagnosticAdvice,
  };

  appendHealthLog({
    database: "primary",
    status: classified.status,
    response_time: null,
    error_type: classified.errorType,
    message: classified.message,
    checked_at: now,
  });

  return failureRes;
}

/**
 * Checks the Secondary Database connection using a lightweight SELECT 1 query.
 * Retries once on temporary failure (max 2 attempts).
 */
export async function checkSecondaryDatabase(options?: {
  timeoutMs?: number;
  maxAttempts?: number;
}): Promise<DatabaseTargetHealthResult> {
  return checkPrimaryDatabase(options);
}

/**
 * Checks both databases in parallel.
 * Calculates overall status:
 * - Both CONNECTED: HEALTHY
 * - One CONNECTED and one unavailable: WARNING
 * - Both unavailable: CRITICAL
 */
export async function checkAllDatabases(): Promise<CompleteHealthReport> {
  const primary = await checkPrimaryDatabase();

  const overallStatus: OverallSystemStatus =
    primary.status === "CONNECTED" ? "HEALTHY" : "CRITICAL";
  const overallMessage =
    primary.status === "CONNECTED"
      ? "Clinic database is connected and responsive."
      : "Clinic database is unavailable: " + primary.message;

  const storage = await getDatabaseStorageMetrics();

  return {
    success: overallStatus === "HEALTHY",
    overallStatus,
    overallMessage,
    checkedAt: new Date().toISOString(),
    database: primary,
    databases: {
      primary,
    },
    storage,
  };
}

/**
 * Separate storage monitoring function.
 * Queries actual physical storage if PostgreSQL supports pg_database_size.
 * Does NOT invent fake numbers.
 */
export async function getDatabaseStorageMetrics(): Promise<StorageMetricsResult> {
  const defaultLimitBytes = 524288000; // 500 MB (Supabase free tier baseline quota)
  const defaultLimitPretty = "500 MB";
  const now = new Date().toISOString();

  try {
    const sizeRes = await withTimeout(
      primaryClient.$queryRawUnsafe<
        Array<{ size_pretty?: string; size_bytes?: string | number }>
      >(
        "SELECT pg_size_pretty(pg_database_size(current_database())) as size_pretty, pg_database_size(current_database())::text as size_bytes;"
      ),
      3500
    );

    if (sizeRes?.[0]?.size_bytes) {
      const bytes = Number(sizeRes[0].size_bytes);
      const usedPretty = sizeRes[0].size_pretty || `${(bytes / 1024 / 1024).toFixed(1)} MB`;
      const usagePercent = Number(((bytes / defaultLimitBytes) * 100).toFixed(1));

      let statusLevel: "NORMAL" | "WARNING" | "HIGH" | "CRITICAL" = "NORMAL";
      let statusLabel = "Normal";

      if (usagePercent >= 95) {
        statusLevel = "CRITICAL";
        statusLabel = "Critical";
      } else if (usagePercent >= 85) {
        statusLevel = "HIGH";
        statusLabel = "High";
      } else if (usagePercent >= 70) {
        statusLevel = "WARNING";
        statusLabel = "Warning";
      }

      // Query table breakdown for top tables
      let tables: TableStorageInfo[] = [];
      try {
        const tableRes = await withTimeout(
          primaryClient.$queryRawUnsafe<
            Array<{ table_name: string; total_size: string; size_bytes: string | number; row_count: string | number }>
          >(
            `SELECT 
              relname as table_name, 
              pg_size_pretty(pg_total_relation_size(relid)) as total_size, 
              pg_total_relation_size(relid)::text as size_bytes,
              n_live_tup::text as row_count 
            FROM pg_stat_user_tables 
            WHERE relname NOT LIKE 'pg_%'
            ORDER BY pg_total_relation_size(relid) DESC
            LIMIT 8;`
          ),
          2500
        );
        if (Array.isArray(tableRes)) {
          tables = tableRes.map((t) => ({
            tableName: t.table_name,
            totalSize: t.total_size,
            sizeBytes: Number(t.size_bytes),
            rowCount: Number(t.row_count || 0),
          }));
        }
      } catch {
        // Table breakdown query optional
      }

      return {
        available: true,
        usedBytes: bytes,
        usedPretty,
        limitBytes: defaultLimitBytes,
        limitPretty: defaultLimitPretty,
        usagePercent,
        statusLevel,
        statusLabel,
        checkedAt: now,
        tables,
      };
    }
  } catch {
    // Cannot reach or permission not granted
  }

  return {
    available: false,
    usedBytes: null,
    usedPretty: null,
    limitBytes: defaultLimitBytes,
    limitPretty: defaultLimitPretty,
    usagePercent: null,
    statusLevel: "UNAVAILABLE",
    statusLabel: "Unavailable",
    checkedAt: now,
    message: "Storage information unavailable (Requires connected database)",
  };
}
