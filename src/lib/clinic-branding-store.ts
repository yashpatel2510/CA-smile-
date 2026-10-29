import fs from "fs";
import path from "path";
import { ClinicBrandConfig, DEFAULT_CLINIC_BRANDING } from "@/types/branding";
import { prisma } from "@/lib/prisma";
import { persistMediaAsync } from "@/lib/media-storage";

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "clinic-branding-config.json"
);

// Global in-memory cache to ensure state is shared across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __clinicBrandingCache: ClinicBrandConfig | undefined;
}

function parseBrandingData(parsed: any): ClinicBrandConfig {
  return {
    ...DEFAULT_CLINIC_BRANDING,
    ...parsed,
    logo: {
      ...DEFAULT_CLINIC_BRANDING.logo,
      ...(parsed.logo || {}),
    },
    hero: {
      ...DEFAULT_CLINIC_BRANDING.hero!,
      ...(parsed.hero || {}),
    },
    aboutSection: {
      ...DEFAULT_CLINIC_BRANDING.aboutSection!,
      ...(parsed.aboutSection || {}),
    },
  };
}

/**
 * Loads the active clinic branding configuration asynchronously from Supabase DB.
 * Falls back to local JSON file if DB query fails.
 */
export async function getClinicBrandingConfigAsync(): Promise<ClinicBrandConfig> {
  // 1. Try reading from Supabase PostgreSQL first (persistent across all Vercel instances)
  try {
    const clinic = await prisma.clinic.findFirst({
      select: { brandingConfig: true },
    });
    if (clinic && clinic.brandingConfig) {
      const loaded = parseBrandingData(clinic.brandingConfig);
      global.__clinicBrandingCache = loaded;
      return loaded;
    }
  } catch (dbErr) {
    console.warn("Could not load clinic branding from database, falling back to disk:", dbErr);
  }

  // 2. Fallback to local JSON file if present
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      const loadedConfig = parseBrandingData(parsed);
      global.__clinicBrandingCache = loadedConfig;
      return loadedConfig;
    }
  } catch (error) {
    console.warn("Could not read clinic branding config file, using defaults:", error);
  }

  if (global.__clinicBrandingCache) {
    return global.__clinicBrandingCache;
  }

  global.__clinicBrandingCache = DEFAULT_CLINIC_BRANDING;
  return DEFAULT_CLINIC_BRANDING;
}

/**
 * Synchronous getter: returns cached config immediately or loads from disk.
 * Kicks off background DB refresh to keep memory fresh.
 */
export function getClinicBrandingConfig(): ClinicBrandConfig {
  if (global.__clinicBrandingCache) {
    return global.__clinicBrandingCache;
  }

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      const loadedConfig = parseBrandingData(parsed);
      global.__clinicBrandingCache = loadedConfig;
      return loadedConfig;
    }
  } catch {
    // fallback
  }

  // Kick off background DB sync
  getClinicBrandingConfigAsync().catch(() => {});

  global.__clinicBrandingCache = DEFAULT_CLINIC_BRANDING;
  return DEFAULT_CLINIC_BRANDING;
}

/**
 * Updates clinic branding configuration, saves images to ClinicMedia in Supabase,
 * and persists configuration to Supabase database so changes reflect immediately on Vercel.
 */
export async function updateClinicBrandingConfigAsync(
  newConfig: Partial<ClinicBrandConfig>
): Promise<ClinicBrandConfig> {
  const current = await getClinicBrandingConfigAsync();

  // 1. Persist base64 images into Supabase database (ClinicMedia table)
  const incomingHero = { ...(newConfig.hero || {}) } as Record<string, any>;
  if (
    incomingHero.imageUrl &&
    typeof incomingHero.imageUrl === "string" &&
    incomingHero.imageUrl.startsWith("data:image/")
  ) {
    incomingHero.imageUrl = await persistMediaAsync(incomingHero.imageUrl, "hero-desktop");
  }
  if (
    incomingHero.mobileImageUrl &&
    typeof incomingHero.mobileImageUrl === "string" &&
    incomingHero.mobileImageUrl.startsWith("data:image/")
  ) {
    incomingHero.mobileImageUrl = await persistMediaAsync(
      incomingHero.mobileImageUrl,
      "hero-mobile"
    );
  }
  if (
    incomingHero.doctorBoxPhotoUrl &&
    typeof incomingHero.doctorBoxPhotoUrl === "string" &&
    incomingHero.doctorBoxPhotoUrl.startsWith("data:image/")
  ) {
    incomingHero.doctorBoxPhotoUrl = await persistMediaAsync(
      incomingHero.doctorBoxPhotoUrl,
      "doctor-photo"
    );
  }

  const incomingLogo = { ...(newConfig.logo || {}) } as Record<string, any>;
  if (
    incomingLogo.imageUrl &&
    typeof incomingLogo.imageUrl === "string" &&
    incomingLogo.imageUrl.startsWith("data:image/")
  ) {
    incomingLogo.imageUrl =
      (await persistMediaAsync(incomingLogo.imageUrl, "clinic-logo")) || "";
  }

  const updated: ClinicBrandConfig = {
    ...current,
    ...newConfig,
    logo: {
      ...current.logo,
      ...incomingLogo,
    },
    hero: {
      ...(current.hero || DEFAULT_CLINIC_BRANDING.hero!),
      ...incomingHero,
    },
    aboutSection: {
      ...(current.aboutSection || DEFAULT_CLINIC_BRANDING.aboutSection!),
      ...(newConfig.aboutSection || {}),
    },
  };

  // 2. Update global memory cache
  global.__clinicBrandingCache = updated;

  // 3. Persist to Supabase PostgreSQL (survives all Vercel serverless deployments)
  try {
    const existing = await prisma.clinic.findFirst({ select: { id: true } });
    if (existing) {
      await prisma.clinic.update({
        where: { id: existing.id },
        data: {
          name: updated.clinicName || "CA Smile",
          brandingConfig: updated as any,
          themeKey: updated.themeKey || "teal-serenity",
          phone: updated.phone,
          email: updated.email,
          address: updated.address,
        },
      });
    } else {
      await prisma.clinic.create({
        data: {
          name: updated.clinicName || "CA Smile",
          slug: updated.slug || "pediodent-main",
          brandingConfig: updated as any,
          themeKey: updated.themeKey || "teal-serenity",
          phone: updated.phone,
          email: updated.email,
          address: updated.address,
        },
      });
    }
  } catch (dbError) {
    console.error("Failed to persist branding config to Supabase database:", dbError);
  }

  // 4. Best-effort write to local filesystem if writable (development convenience)
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem errors on Vercel
  }

  return updated;
}

/**
 * Synchronous wrapper for backwards compatibility
 */
export function updateClinicBrandingConfig(
  newConfig: Partial<ClinicBrandConfig>
): ClinicBrandConfig {
  updateClinicBrandingConfigAsync(newConfig).catch((err) => {
    console.error("Error in background branding update:", err);
  });

  const current = getClinicBrandingConfig();
  const updated = { ...current, ...newConfig };
  global.__clinicBrandingCache = updated;
  return updated;
}

/**
 * Resets clinic branding configuration to default factory baseline.
 */
export async function resetClinicBrandingConfig(): Promise<ClinicBrandConfig> {
  return updateClinicBrandingConfigAsync(DEFAULT_CLINIC_BRANDING);
}
