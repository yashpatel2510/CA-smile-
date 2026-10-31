import { PrismaClient } from "@prisma/client";
import {
  isTestModeActive,
  getTestDatabaseUrl,
  getActiveDatabaseMode,
  saveDatabaseModeConfig,
} from "@/lib/database/test-database-config";

const globalForPrisma = globalThis as unknown as {
  livePrisma: PrismaClient | undefined;
  testPrisma: PrismaClient | undefined;
  authPrisma: PrismaClient | undefined;
};

export function getPrimaryDatabaseUrl(): string | undefined {
  let url = process.env.PRIMARY_DATABASE_URL || process.env.DATABASE_URL;
  if (url && url.includes(".pooler.supabase.com:5432")) {
    url = url.replace(":5432", ":6543");
    if (!url.includes("pgbouncer=true")) {
      url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }
  return url;
}

export function getSecondaryDatabaseUrl(): string | undefined {
  let url = process.env.SECONDARY_DATABASE_URL || process.env.AUTH_DATABASE_URL;
  if (url && url.includes(".pooler.supabase.com:5432")) {
    url = url.replace(":5432", ":6543");
    if (!url.includes("pgbouncer=true")) {
      url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }
  return url;
}

/**
 * Live Production Database Client (Single source of truth for genuine clinic records)
 */
export function getLivePrismaClient(): PrismaClient {
  if (!globalForPrisma.livePrisma) {
    const primaryUrl = getPrimaryDatabaseUrl();
    globalForPrisma.livePrisma = new PrismaClient({
      datasources: primaryUrl ? { db: { url: primaryUrl } } : undefined,
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }
  return globalForPrisma.livePrisma;
}

/**
 * Test / Sandbox Database Client (Isolated database for testing website features)
 */
export function getTestPrismaClient(): PrismaClient | null {
  const testUrl = getTestDatabaseUrl();
  if (!testUrl || testUrl.trim() === "") {
    return null;
  }

  if (!globalForPrisma.testPrisma) {
    globalForPrisma.testPrisma = new PrismaClient({
      datasources: { db: { url: testUrl.trim() } },
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }
  return globalForPrisma.testPrisma;
}

/**
 * Returns the currently active Prisma client based on database mode:
 * - If Test Mode is ON & test database is connected -> returns Test Prisma
 * - Otherwise -> returns Live Production Prisma
 */
export function getActivePrismaClient(): PrismaClient {
  if (isTestModeActive()) {
    const testClient = getTestPrismaClient();
    if (testClient) {
      return testClient;
    }
  }
  return getLivePrismaClient();
}

/**
 * Transparent dynamic proxy for prisma.
 * Any existing code calling `prisma.appointment.create(...)` or `prisma.patient.findMany(...)`
 * automatically writes/reads from the selected active database!
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getActivePrismaClient() as any;
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Dedicated database client for Auth & Staff operations.
 * Always resolves from Live Database to guarantee clinic staff & doctors never get locked out.
 */
export const authPrisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getLivePrismaClient() as any;
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// Semantic aliases
export const primaryPrisma = prisma;
export const secondaryPrisma = authPrisma;

/**
 * Reloads both Prisma clients (useful when connection URLs change at runtime)
 */
export function reloadPrismaClients() {
  try {
    if (globalForPrisma.livePrisma) {
      globalForPrisma.livePrisma.$disconnect().catch(() => {});
    }
  } catch {}
  try {
    if (globalForPrisma.testPrisma) {
      globalForPrisma.testPrisma.$disconnect().catch(() => {});
    }
  } catch {}

  globalForPrisma.livePrisma = undefined;
  globalForPrisma.testPrisma = undefined;

  return {
    live: getLivePrismaClient(),
    test: getTestPrismaClient(),
  };
}

/**
 * Safely wipes all records ONLY from the Test Database.
 * Live database is strictly protected and never touched.
 */
export async function purgeTestDatabase(): Promise<{
  success: boolean;
  deletedCounts: Record<string, number>;
  error?: string;
}> {
  const testClient = getTestPrismaClient();
  if (!testClient) {
    return {
      success: false,
      deletedCounts: {},
      error: "Test database is not connected or configured.",
    };
  }

  try {
    // Delete test appointments
    const appointments = await testClient.appointment.deleteMany({});
    // Delete test patients
    const patients = await testClient.patient.deleteMany({});

    let triageCount = 0;
    try {
      const triage = await (testClient as any).triageAssessment?.deleteMany({});
      if (triage?.count) triageCount = triage.count;
    } catch {}

    saveDatabaseModeConfig({
      lastPurgedAt: new Date().toISOString(),
    });

    return {
      success: true,
      deletedCounts: {
        appointments: appointments.count,
        patients: patients.count,
        triageAssessments: triageCount,
      },
    };
  } catch (err: any) {
    console.error("Error purging test database:", err);
    return {
      success: false,
      deletedCounts: {},
      error: err.message || "Failed to purge test database",
    };
  }
}

/**
 * Retrieves record counts from the Test Database
 */
export async function getTestDatabaseStats(): Promise<{
  appointmentsCount: number;
  patientsCount: number;
}> {
  const testClient = getTestPrismaClient();
  if (!testClient) {
    return { appointmentsCount: 0, patientsCount: 0 };
  }
  try {
    const [appointmentsCount, patientsCount] = await Promise.all([
      testClient.appointment.count().catch(() => 0),
      testClient.patient.count().catch(() => 0),
    ]);
    return { appointmentsCount, patientsCount };
  } catch {
    return { appointmentsCount: 0, patientsCount: 0 };
  }
}

export default prisma;
