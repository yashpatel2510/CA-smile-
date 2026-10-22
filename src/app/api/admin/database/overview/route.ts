import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkAllDatabases,
  checkPrimaryDatabase,
} from "@/lib/database/health-service";
import {
  getDatabaseBackupConfig,
} from "@/lib/database/database-backup-store";
import { getExcelBackupStorageStats } from "@/lib/database/excel-backup-engine";
import { getRecentHealthLogs } from "@/lib/database/health-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";

    // Run health check for the unified database via centralized health service
    const healthReport = await checkAllDatabases();
    const primaryDb = healthReport.databases.primary;

    const connectedCount = primaryDb.status === "CONNECTED" ? 1 : 0;
    const activeCount =
      primaryDb.status === "CONNECTED" && primaryDb.responseTimeMs !== null ? 1 : 0;

    const now = new Date();
    const lastCheckedFormatted =
      now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST";

    const backupConfig = getDatabaseBackupConfig();
    const backupStorage = getExcelBackupStorageStats();
    const recentLogs = getRecentHealthLogs(15);

    // Unified Database data object
    const databaseObj = {
      id: "primary",
      name: "Clinic Database (PostgreSQL)",
      purpose: "Unified clinical & administration database (Patients, Appointments, Staff, Auth, WhatsApp, Reviews)",
      provider: primaryDb.provider,
      databaseService: primaryDb.maskedHost,
      databaseName: "postgres",
      status: primaryDb.status,
      activity: primaryDb.status === "CONNECTED" ? "ACTIVE" : "INACTIVE",
      responseTime: primaryDb.responseTimeMs,
      lastChecked: lastCheckedFormatted,
      tableCount: 8,
      attemptsUsed: primaryDb.attemptsUsed,
      error: primaryDb.errorType,
      message: primaryDb.message,
      diagnosticTip: primaryDb.diagnosticAdvice,
    };

    return NextResponse.json({
      success: true,
      isAdmin,
      role: session.user.role,
      overallStatus: primaryDb.status === "CONNECTED" ? "HEALTHY" : "CRITICAL",
      overallMessage:
        primaryDb.status === "CONNECTED"
          ? "Clinic PostgreSQL database connected and healthy"
          : primaryDb.message,
      overview: {
        totalDatabases: 1,
        connectedCount,
        activeCount,
        overallStatus: primaryDb.status === "CONNECTED" ? "HEALTHY" : "CRITICAL",
        lastChecked: lastCheckedFormatted,
        lastCheckedIso: now.toISOString(),
      },
      database: databaseObj,
      databases: {
        primary: databaseObj,
        main: databaseObj,
      },
      storage: healthReport.storage,
      recentLogs,
      backupConfig,
      backupStorage,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve database overview",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const now = new Date();
    const timeFormatted =
      now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST";

    const res = await checkPrimaryDatabase();
    return NextResponse.json({
      success: res.status === "CONNECTED",
      target: "primary",
      checkedAt: timeFormatted,
      overallStatus: res.status === "CONNECTED" ? "HEALTHY" : "CRITICAL",
      result: res,
      database: res,
      databases: {
        primary: res,
        main: res,
      },
      storage: {
        available: true,
        statusLabel: "Normal",
      },
      recentLogs: getRecentHealthLogs(15),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Connection check failed" },
      { status: 500 }
    );
  }
}
