import fs from "fs";
import path from "path";
import {
  BookingFormConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";

// Global reference for Next.js hot module reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __bookingFormConfig: BookingFormConfig | undefined;
}

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "booking-form-config.json"
);

function loadPersistedConfig(): BookingFormConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (parsed && Array.isArray(parsed.fields)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(
      "Failed to read booking form config file, using default:",
      err
    );
  }
  return defaultBookingFormConfig;
}

function persistConfigToFile(config: BookingFormConfig): void {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(config, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("Failed to persist booking form config to file:", err);
  }
}

export function getBookingFormConfig(): BookingFormConfig {
  const loaded = loadPersistedConfig();
  global.__bookingFormConfig = loaded;
  return loaded;
}

export function updateBookingFormConfig(
  newConfig: Partial<BookingFormConfig>
): BookingFormConfig {
  const current = getBookingFormConfig();
  const merged: BookingFormConfig = {
    ...current,
    ...newConfig,
    fields: newConfig.fields ? newConfig.fields : current.fields,
    treatments: newConfig.treatments
      ? newConfig.treatments
      : current.treatments,
    timeSlots: newConfig.timeSlots ? newConfig.timeSlots : current.timeSlots,
    doctors: newConfig.doctors ? newConfig.doctors : current.doctors,
  };

  global.__bookingFormConfig = merged;
  persistConfigToFile(merged);
  return merged;
}

export function resetBookingFormConfig(): BookingFormConfig {
  global.__bookingFormConfig = { ...defaultBookingFormConfig };
  persistConfigToFile(defaultBookingFormConfig);
  return global.__bookingFormConfig;
}
