import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  getDatabaseBackupConfig,
  saveDatabaseBackupConfig,
} from "@/lib/database/database-backup-store";
import {
  executeExcelBackup,
  cleanOldExcelBackups,
  ExcelBackupType,
} from "@/lib/database/excel-backup-engine";
import {
  checkMainDatabaseHealth,
  checkAuthDatabaseHealth,
} from "@/lib/database/health";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const typeParam = searchParams.get("type") as ExcelBackupType | null;

    const cronSecret = process.env.CRON_SECRET || env.CRON_SECRET;
    const isAuthorized =
      !cronSecret ||
      authHeader === `Bearer ${cronSecret}` ||
      env.isDevelopment ||
      force;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: "Unauthorized cron request" },
        { status: 401 }
      );
    }

    const config = getDatabaseBackupConfig();
    const now = new Date();
    // IST conversion
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    const isSunday = ist.getDay() === 0;
    const isFirstOfMonth = ist.getDate() === 1;

    const results: Record<string, any> = {};

    // 1. Run Automatic Health Check if configured
    if (config.autoHealthCheckFrequency !== "off" || force) {
      const [mainHealth, authHealth] = await Promise.all([
        checkMainDatabaseHealth(),
        checkAuthDatabaseHealth(),
      ]);
      results.healthCheck = {
        main: mainHealth.status,
        auth: authHealth.status,
        checkedAt: ist.toISOString(),
      };
      saveDatabaseBackupConfig({ lastAutoHealthCheck: ist.toISOString() });
    }

    // 2. Determine and execute appropriate backup
    let backupTypeToRun: ExcelBackupType = typeParam || "daily";
    if (!typeParam) {
      if (isFirstOfMonth && config.monthlyEnabled) {
        backupTypeToRun = "monthly";
      } else if (isSunday && config.weeklyEnabled) {
        backupTypeToRun = "weekly";
      } else if (config.dailyEnabled) {
        backupTypeToRun = "daily";
      }
    }

    const backupResult = await executeExcelBackup(
      backupTypeToRun,
      "Automated Server-Side Cron Engine"
    );
    results.backup = backupResult;

    // 3. Clean old backups per retention policy
    const cleanupResult = await cleanOldExcelBackups();
    results.retentionCleanup = cleanupResult;

    return NextResponse.json({
      success: true,
      action: "CRON_EXECUTED",
      executedAt: ist.toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Cron execution failed" },
      { status: 500 }
    );
  }
}
