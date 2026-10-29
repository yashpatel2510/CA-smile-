import fs from "fs";
import path from "path";
import { ClinicBrandConfig, DEFAULT_CLINIC_BRANDING } from "@/types/branding";

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

/**
 * Loads the active clinic branding configuration.
 */
export function getClinicBrandingConfig(): ClinicBrandConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      const loadedConfig: ClinicBrandConfig = {
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
      global.__clinicBrandingCache = loadedConfig;
      return loadedConfig;
    }
  } catch (error) {
    console.warn(
      "Could not read clinic branding config file, using defaults:",
      error
    );
  }

  if (global.__clinicBrandingCache) {
    return global.__clinicBrandingCache;
  }

  global.__clinicBrandingCache = DEFAULT_CLINIC_BRANDING;
  return DEFAULT_CLINIC_BRANDING;
}

function persistBase64Image(dataUri?: string, prefix = "branding"): string | undefined {
  if (!dataUri || !dataUri.startsWith("data:image/")) return dataUri;
  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUri;
    const ext = matches[1].replace("+xml", "") || "png";
    const buffer = Buffer.from(matches[2], "base64");
    const uploadDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/images/${fileName}`;
  } catch (err) {
    console.error("Failed to persist base64 branding image:", err);
    return dataUri;
  }
}

/**
 * Updates the clinic branding configuration and persists it to disk.
 */
export function updateClinicBrandingConfig(
  newConfig: Partial<ClinicBrandConfig>
): ClinicBrandConfig {
  const current = getClinicBrandingConfig();

  // Ensure base64 images are persisted to disk to prevent JSON bloat
  const incomingHero = { ...(newConfig.hero || {}) } as Record<string, any>;
  if (incomingHero.imageUrl && typeof incomingHero.imageUrl === "string" && incomingHero.imageUrl.startsWith("data:image/")) {
    incomingHero.imageUrl = persistBase64Image(incomingHero.imageUrl, "hero-desktop");
  }
  if (incomingHero.mobileImageUrl && typeof incomingHero.mobileImageUrl === "string" && incomingHero.mobileImageUrl.startsWith("data:image/")) {
    incomingHero.mobileImageUrl = persistBase64Image(incomingHero.mobileImageUrl, "hero-mobile");
  }

  const incomingLogo = { ...(newConfig.logo || {}) } as Record<string, any>;
  if (incomingLogo.imageUrl && typeof incomingLogo.imageUrl === "string" && incomingLogo.imageUrl.startsWith("data:image/")) {
    incomingLogo.imageUrl = persistBase64Image(incomingLogo.imageUrl, "clinic-logo") || "";
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

  global.__clinicBrandingCache = updated;

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(updated, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to write clinic branding config to disk:", error);
  }

  return updated;
}

/**
 * Resets clinic branding configuration to default factory baseline.
 */
export function resetClinicBrandingConfig(): ClinicBrandConfig {
  return updateClinicBrandingConfig(DEFAULT_CLINIC_BRANDING);
}
