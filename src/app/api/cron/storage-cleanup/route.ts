import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStorageRetentionConfig } from "@/lib/storage-retention-store";
import { checkMainDatabaseHealth } from "@/lib/database/health";
import { executeArchiveAndCleanup } from "@/lib/database/archive-engine";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const cronSecret = process.env.CRON_SECRET || env.CRON_SECRET;
    const isAuthorized =
      !cronSecret ||
      authHeader === `Bearer ${cronSecret}` ||
      env.isDevelopment ||
      force;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized cron execution" },
        { status: 401 }
      );
    }

    const config = getStorageRetentionConfig();
    const mainDb = await checkMainDatabaseHealth();

    const currentStorageMb = mainDb.storage.available && mainDb.storage.sizeBytes
      ? Number((mainDb.storage.sizeBytes / 1024 / 1024).toFixed(1))
      : 210;
    const usagePercent = (currentStorageMb / 500) * 100;

    // Check if auto cleanup is disabled or storage is below threshold
    if (!force && (!config.autoCleanupEnabled || usagePercent < config.thresholdPercent)) {
      return NextResponse.json({
        success: true,
        action: "SKIPPED",
        reason: !config.autoCleanupEnabled
          ? "Automatic cleanup is currently toggled OFF in settings"
          : `Storage (${usagePercent.toFixed(1)}%) is below configured threshold (${config.thresholdPercent}%)`,
        currentStorageMb,
        usagePercent: Number(usagePercent.toFixed(1)),
        thresholdPercent: config.thresholdPercent,
      });
    }

    // Run safe cleanup for WhatsApp bookings and completed appointments
    const whatsappResult = await executeArchiveAndCleanup(
      "whatsapp_bookings",
      "Automated Scheduled Cron Engine",
      { useConfigRetention: true, deleteAfterArchive: true }
    );

    const appointmentsResult = await executeArchiveAndCleanup(
      "appointments",
      "Automated Scheduled Cron Engine",
      { useConfigRetention: true, deleteAfterArchive: true }
    );

    return NextResponse.json({
      success: true,
      action: "CLEANUP_PROCESSED",
      timestamp: new Date().toISOString(),
      currentStorageMb,
      usagePercent: Number(usagePercent.toFixed(1)),
      results: {
        whatsapp: whatsappResult,
        appointments: appointmentsResult,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to execute scheduled storage cleanup",
      },
      { status: 500 }
    );
  }
}
