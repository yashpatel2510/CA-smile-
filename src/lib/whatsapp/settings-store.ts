import { prisma } from "@/lib/prisma";

export interface ClinicWhatsAppSettings {
  id?: string;
  clinicId: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  webhookVerifyToken: string;
  accessToken: string;
  appSecret: string;
  flowPrivateKey: string;
  welcomeMessage: string;
  confirmationMessage: string;
  cancellationMessage: string;
  rescheduleMessage: string;
  activeBookingFlowId?: string;
  businessHours: {
    days: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
    startHour: number; // 9
    endHour: number; // 18
    slotDurationMinutes: number; // 30
    lunchBreakStartHour?: number; // 13
    lunchBreakEndHour?: number; // 14
    timezone: string; // "Asia/Kolkata"
  };
  appointmentRules: {
    preventDoubleBooking: boolean;
    minAdvanceHours: number; // 1 hour
    maxAdvanceDays: number; // 30 days
  };
  status: "CONNECTED" | "CONFIGURED" | "DISCONNECTED" | "ERROR";
  lastSyncAt?: string;
}

// Global in-memory fallback for local dev & testing
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryWhatsAppSettings: Map<string, ClinicWhatsAppSettings> | undefined;
}

if (!global.__inMemoryWhatsAppSettings) {
  global.__inMemoryWhatsAppSettings = new Map<string, ClinicWhatsAppSettings>();
}

export const DEFAULT_WHATSAPP_SETTINGS: Omit<ClinicWhatsAppSettings, "clinicId"> = {
  wabaId: process.env.WHATSAPP_WABA_ID || "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  displayPhoneNumber: "+1 555 0199",
  webhookVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "DENTAL_CLINIC_WEBHOOK_SECRET_2026",
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  appSecret: process.env.WHATSAPP_APP_SECRET || "",
  flowPrivateKey: process.env.WHATSAPP_FLOW_PRIVATE_KEY || "",
  welcomeMessage:
    "Welcome to our Dental Clinic! 👋\n\nHow can we help you today? Please choose an option below:",
  confirmationMessage:
    "Your appointment has been booked successfully! ✅\n\nAppointment ID: {APPOINTMENT_ID}\nPatient: {PATIENT_NAME}\nDate: {DATE}\nTime: {TIME}\nDoctor: {DOCTOR}\n\nPlease arrive 10 minutes prior to your scheduled time.\n\nThank you for choosing our clinic!",
  cancellationMessage:
    "Your appointment {APPOINTMENT_ID} has been cancelled. If you need to rebook, reply with 'Hi' at any time.",
  rescheduleMessage:
    "Your appointment {APPOINTMENT_ID} has been rescheduled to {DATE} at {TIME}.",
  businessHours: {
    days: [1, 2, 3, 4, 5, 6], // Mon-Sat
    startHour: 9,
    endHour: 18,
    slotDurationMinutes: 30,
    lunchBreakStartHour: 13,
    lunchBreakEndHour: 14,
    timezone: "Asia/Kolkata",
  },
  appointmentRules: {
    preventDoubleBooking: true,
    minAdvanceHours: 1,
    maxAdvanceDays: 30,
  },
  status: process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN ? "CONFIGURED" : "DISCONNECTED",
};

/**
 * Retrieve or initialize WhatsApp settings for a clinic.
 */
export async function getWhatsAppSettings(clinicId?: string): Promise<ClinicWhatsAppSettings> {
  const targetClinicId = clinicId || "default-clinic";

  // Check in-memory store first if previously updated in memory
  const memorySettings = global.__inMemoryWhatsAppSettings?.get(targetClinicId);

  try {
    const dbRecord = await prisma.whatsAppIntegrationSetting.findFirst({
      where: clinicId ? { clinicId } : undefined,
    });

    if (dbRecord) {
      return {
        id: dbRecord.id,
        clinicId: dbRecord.clinicId,
        wabaId: dbRecord.wabaId || DEFAULT_WHATSAPP_SETTINGS.wabaId,
        phoneNumberId: dbRecord.phoneNumberId || DEFAULT_WHATSAPP_SETTINGS.phoneNumberId,
        displayPhoneNumber: dbRecord.displayPhoneNumber || DEFAULT_WHATSAPP_SETTINGS.displayPhoneNumber,
        webhookVerifyToken: dbRecord.webhookVerifyToken || DEFAULT_WHATSAPP_SETTINGS.webhookVerifyToken,
        accessToken: dbRecord.accessToken || DEFAULT_WHATSAPP_SETTINGS.accessToken,
        appSecret: dbRecord.appSecret || DEFAULT_WHATSAPP_SETTINGS.appSecret,
        flowPrivateKey: dbRecord.flowPrivateKey || DEFAULT_WHATSAPP_SETTINGS.flowPrivateKey,
        welcomeMessage: dbRecord.welcomeMessage || DEFAULT_WHATSAPP_SETTINGS.welcomeMessage,
        confirmationMessage: dbRecord.confirmationMessage || DEFAULT_WHATSAPP_SETTINGS.confirmationMessage,
        cancellationMessage: dbRecord.cancellationMessage || DEFAULT_WHATSAPP_SETTINGS.cancellationMessage,
        rescheduleMessage: dbRecord.rescheduleMessage || DEFAULT_WHATSAPP_SETTINGS.rescheduleMessage,
        activeBookingFlowId: dbRecord.activeBookingFlowId || undefined,
        businessHours: (dbRecord.businessHours as any) || DEFAULT_WHATSAPP_SETTINGS.businessHours,
        appointmentRules: (dbRecord.appointmentRules as any) || DEFAULT_WHATSAPP_SETTINGS.appointmentRules,
        status: (dbRecord.status as any) || DEFAULT_WHATSAPP_SETTINGS.status,
        lastSyncAt: dbRecord.lastSyncAt ? dbRecord.lastSyncAt.toISOString() : undefined,
      };
    }
  } catch (err) {
    // Database fallback or not yet seeded
  }

  if (memorySettings) {
    return memorySettings;
  }

  const defaultInst: ClinicWhatsAppSettings = {
    clinicId: targetClinicId,
    ...DEFAULT_WHATSAPP_SETTINGS,
  };
  global.__inMemoryWhatsAppSettings?.set(targetClinicId, defaultInst);
  return defaultInst;
}

/**
 * Save or update WhatsApp settings for a clinic.
 */
export async function saveWhatsAppSettings(
  clinicId: string,
  updates: Partial<ClinicWhatsAppSettings>
): Promise<ClinicWhatsAppSettings> {
  const current = await getWhatsAppSettings(clinicId);
  const updated: ClinicWhatsAppSettings = {
    ...current,
    ...updates,
    clinicId,
  };

  // Cache in memory
  global.__inMemoryWhatsAppSettings?.set(clinicId, updated);

  try {
    // Resolve valid clinicId from DB if needed
    let validClinicId = clinicId;
    const clinicExists = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinicExists) {
      const anyClinic = await prisma.clinic.findFirst();
      if (anyClinic) {
        validClinicId = anyClinic.id;
      }
    }

    if (validClinicId) {
      await prisma.whatsAppIntegrationSetting.upsert({
        where: { clinicId: validClinicId },
        create: {
          clinicId: validClinicId,
          wabaId: updated.wabaId,
          phoneNumberId: updated.phoneNumberId,
          displayPhoneNumber: updated.displayPhoneNumber,
          webhookVerifyToken: updated.webhookVerifyToken,
          accessToken: updated.accessToken,
          appSecret: updated.appSecret,
          flowPrivateKey: updated.flowPrivateKey,
          welcomeMessage: updated.welcomeMessage,
          confirmationMessage: updated.confirmationMessage,
          cancellationMessage: updated.cancellationMessage,
          rescheduleMessage: updated.rescheduleMessage,
          activeBookingFlowId: updated.activeBookingFlowId,
          businessHours: updated.businessHours as any,
          appointmentRules: updated.appointmentRules as any,
          status: updated.status,
          lastSyncAt: updated.lastSyncAt ? new Date(updated.lastSyncAt) : undefined,
        },
        update: {
          wabaId: updated.wabaId,
          phoneNumberId: updated.phoneNumberId,
          displayPhoneNumber: updated.displayPhoneNumber,
          webhookVerifyToken: updated.webhookVerifyToken,
          accessToken: updated.accessToken,
          appSecret: updated.appSecret,
          flowPrivateKey: updated.flowPrivateKey,
          welcomeMessage: updated.welcomeMessage,
          confirmationMessage: updated.confirmationMessage,
          cancellationMessage: updated.cancellationMessage,
          rescheduleMessage: updated.rescheduleMessage,
          activeBookingFlowId: updated.activeBookingFlowId,
          businessHours: updated.businessHours as any,
          appointmentRules: updated.appointmentRules as any,
          status: updated.status,
          lastSyncAt: updated.lastSyncAt ? new Date(updated.lastSyncAt) : undefined,
        },
      });
    }
  } catch (err) {
    console.warn("Failed to persist WhatsApp settings to PostgreSQL, kept in memory:", err);
  }

  return updated;
}
