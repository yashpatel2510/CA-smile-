import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import {
  getDatabaseBackupConfig,
  saveDatabaseBackupConfig,
  removeBackupHistoryItem,
} from "@/lib/database/database-backup-store";
import {
  executeExcelBackup,
  getExcelBackupStorageStats,
  cleanOldExcelBackups,
  ExcelBackupType,
} from "@/lib/database/excel-backup-engine";

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
    const config = getDatabaseBackupConfig();
    const storage = getExcelBackupStorageStats();

    return NextResponse.json({
      success: true,
      isAdmin,
      role: session.user.role,
      config,
      storage,
      history: config.history || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load backups" },
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

    // Strict RBAC: Only ADMIN can trigger backups
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) may trigger database backups.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const type: ExcelBackupType = body.type || "daily";

    if (!["daily", "weekly", "monthly", "full"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid backup type. Must be daily, weekly, monthly, or full." },
        { status: 400 }
      );
    }

    const result = await executeExcelBackup(type, session.user.name || "Clinic Owner");

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
          result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute backup" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may update backup settings." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = saveDatabaseBackupConfig(body);

    // If retention policy changed, run cleanup immediately
    if (body.retentionDays !== undefined) {
      await cleanOldExcelBackups();
    }

    return NextResponse.json({
      success: true,
      message: "Backup settings saved successfully.",
      config: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may delete backup files." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const fileName = searchParams.get("file");

    if (!id && !fileName) {
      return NextResponse.json(
        { success: false, message: "Backup ID or filename required" },
        { status: 400 }
      );
    }

    const config = getDatabaseBackupConfig();
    const target = (config.history || []).find((h) => h.id === id || h.fileName === fileName);

    if (target) {
      removeBackupHistoryItem(target.id);
      const filePath = path.join(process.cwd(), "src", "data", "backups", "excel", target.fileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      message: `Backup file ${fileName || id} deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete backup" },
      { status: 500 }
    );
  }
}
