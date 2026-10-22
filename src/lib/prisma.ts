import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  authPrisma: PrismaClient | undefined;
};

export function getPrimaryDatabaseUrl(): string | undefined {
  return process.env.PRIMARY_DATABASE_URL || process.env.DATABASE_URL;
}

export function getSecondaryDatabaseUrl(): string | undefined {
  return process.env.SECONDARY_DATABASE_URL || process.env.AUTH_DATABASE_URL;
}

const primaryUrl = getPrimaryDatabaseUrl();
const secondaryUrl = getSecondaryDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: primaryUrl ? { db: { url: primaryUrl } } : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

/**
 * Dedicated database client for Secondary / Auth & Staff operations.
 * When SECONDARY_DATABASE_URL or AUTH_DATABASE_URL is provided,
 * secondary records run on that isolated database!
 */
export const authPrisma =
  globalForPrisma.authPrisma ??
  (secondaryUrl
    ? new PrismaClient({
        datasources: {
          db: {
            url: secondaryUrl,
          },
        },
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      })
    : prisma);

// Semantic aliases
export const primaryPrisma = prisma;
export const secondaryPrisma = authPrisma;

export function reloadPrismaClients() {
  try {
    if (globalForPrisma.prisma) {
      globalForPrisma.prisma.$disconnect().catch(() => {});
    }
  } catch {}
  try {
    if (globalForPrisma.authPrisma && globalForPrisma.authPrisma !== globalForPrisma.prisma) {
      globalForPrisma.authPrisma.$disconnect().catch(() => {});
    }
  } catch {}

  const newPrimary = getPrimaryDatabaseUrl();
  const newSecondary = getSecondaryDatabaseUrl();

  globalForPrisma.prisma = new PrismaClient({
    datasources: newPrimary ? { db: { url: newPrimary } } : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  globalForPrisma.authPrisma = newSecondary
    ? new PrismaClient({
        datasources: {
          db: {
            url: newSecondary,
          },
        },
        log:
          process.env.NODE_ENV === "development"
            ? ["error", "warn"]
            : ["error"],
      })
    : globalForPrisma.prisma;

  return { prisma: globalForPrisma.prisma, authPrisma: globalForPrisma.authPrisma };
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.authPrisma = authPrisma;
}

export default prisma;

