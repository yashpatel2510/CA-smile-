import fs from "fs";
import path from "path";
import {
  DentalDocumentBrandingConfig,
  DEFAULT_DENTAL_DOCUMENT_BRANDING,
  DentalDocumentType,
  DentalDocumentLayoutProfile,
  DentalClinicBrandingMaster,
} from "@/types/dental-document-branding";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "dental-document-branding.json"
);

declare global {
  // eslint-disable-next-line no-var
  var __dentalDocumentBrandingCache: DentalDocumentBrandingConfig | undefined;
}

function persistBase64Image(dataUri?: string, prefix = "doc-brand"): string | undefined {
  if (!dataUri || !dataUri.startsWith("data:image/")) return dataUri;
  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUri;
    const ext = matches[1].replace("+xml", "") || "png";
    const buffer = Buffer.from(matches[2], "base64");
    const uploadDir = path.join(process.cwd(), "public", "images", "branding");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return `/images/branding/${fileName}`;
  } catch (err) {
    console.error("Failed to persist base64 document branding image:", err);
    return dataUri;
  }
}

/**
 * Returns active dental document branding configuration, merging existing clinic metadata.
 */
export function getDentalDocumentBranding(): DentalDocumentBrandingConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      const config: DentalDocumentBrandingConfig = {
        master: {
          ...DEFAULT_DENTAL_DOCUMENT_BRANDING.master,
          ...(parsed.master || {}),
        },
        layouts: {
          ...DEFAULT_DENTAL_DOCUMENT_BRANDING.layouts,
          ...(parsed.layouts || {}),
        },
      };
      global.__dentalDocumentBrandingCache = config;
      return config;
    }
  } catch (err) {
    console.warn("Could not read dental document branding config file:", err);
  }

  if (global.__dentalDocumentBrandingCache) {
    return global.__dentalDocumentBrandingCache;
  }

  // Seed with active clinic branding data
  const clinicBranding = getClinicBrandingConfig();
  const seededConfig: DentalDocumentBrandingConfig = {
    master: {
      ...DEFAULT_DENTAL_DOCUMENT_BRANDING.master,
      clinic_name:
        clinicBranding.clinicName && clinicBranding.clinicName !== "PedioDent"
          ? clinicBranding.clinicName
          : DEFAULT_DENTAL_DOCUMENT_BRANDING.master.clinic_name,
      phone: clinicBranding.phone || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.phone,
      emergency_phone:
        clinicBranding.emergencyPhone || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.emergency_phone,
      email: clinicBranding.email || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.email,
      address: clinicBranding.address || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.address,
      city: clinicBranding.city || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.city,
      state: clinicBranding.state || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.state,
      postal_code: clinicBranding.postalCode || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.postal_code,
      doctor_name: clinicBranding.doctorName || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.doctor_name,
      doctor_qualification:
        clinicBranding.doctorTitle || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.doctor_qualification,
      logo_url:
        clinicBranding.logo?.imageUrl || DEFAULT_DENTAL_DOCUMENT_BRANDING.master.logo_url,
    },
    layouts: DEFAULT_DENTAL_DOCUMENT_BRANDING.layouts,
  };

  saveDentalDocumentBranding(seededConfig);
  return seededConfig;
}

/**
 * Persists dental document branding configuration to disk and updates in-memory cache.
 */
export function saveDentalDocumentBranding(
  config: DentalDocumentBrandingConfig
): DentalDocumentBrandingConfig {
  const master = { ...config.master };

  if (master.logo_url && master.logo_url.startsWith("data:image/")) {
    master.logo_url = persistBase64Image(master.logo_url, "clinic-logo") || master.logo_url;
  }
  if (master.signature_url && master.signature_url.startsWith("data:image/")) {
    master.signature_url =
      persistBase64Image(master.signature_url, "doctor-signature") || master.signature_url;
  }
  if (master.watermark_url && master.watermark_url.startsWith("data:image/")) {
    master.watermark_url =
      persistBase64Image(master.watermark_url, "doc-watermark") || master.watermark_url;
  }

  // Persist scan overlay files in layouts if any are base64
  const layouts = { ...config.layouts };
  for (const docKey of Object.keys(layouts) as DentalDocumentType[]) {
    const layout = { ...layouts[docKey] };
    if (layout.calibration_overlay_url && layout.calibration_overlay_url.startsWith("data:image/")) {
      layout.calibration_overlay_url =
        persistBase64Image(
          layout.calibration_overlay_url,
          `overlay-${docKey.toLowerCase()}`
        ) || layout.calibration_overlay_url;
    }
    layouts[docKey] = layout;
  }

  const updated: DentalDocumentBrandingConfig = {
    master,
    layouts,
  };

  global.__dentalDocumentBrandingCache = updated;

  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write dental document branding to disk:", err);
  }

  return updated;
}

/**
 * Resets document branding to standard dental clinical baseline.
 */
export function resetDentalDocumentBranding(): DentalDocumentBrandingConfig {
  return saveDentalDocumentBranding(DEFAULT_DENTAL_DOCUMENT_BRANDING);
}
