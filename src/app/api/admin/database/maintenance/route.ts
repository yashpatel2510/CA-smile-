import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentHealthLogs, clearHealthLogs } from "@/lib/database/health-logger";
import fs from "fs";
import path from "path";

const EXPORT_DIR = path.join(process.cwd(), "src", "data", "backups", "excel");

function getExportFileStats(): { count: number; totalSizeBytes: number; files: Array<{ name: string; sizeBytes: number; created: string }> } {
  try {
    if (!fs.existsSync(EXPORT_DIR)) {
      return { count: 0, totalSizeBytes: 0, files: [] };
    }
    const items = fs.readdirSync(EXPORT_DIR);
    let totalSize = 0;
    const files: Array<{ name: string; sizeBytes: number; created: string }> = [];

    for (const item of items) {
      if (item.endsWith(".xlsx") || item.endsWith(".csv")) {
        const fullPath = path.join(EXPORT_DIR, item);
        const stat = fs.statSync(fullPath);
        totalSize += stat.size;
        files.push({
          name: item,
          sizeBytes: stat.size,
          created: stat.mtime.toISOString(),
        });
      }
    }

    return { count: files.length, totalSizeBytes: totalSize, files };
  } catch {
    return { count: 0, totalSizeBytes: 0, files: [] };
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const healthLogs = getRecentHealthLogs(200);
    const exportStats = getExportFileStats();

    return NextResponse.json({
      success: true,
      maintenanceStats: {
        healthLogsCount: healthLogs.length,
        exportFilesCount: exportStats.count,
        exportFilesTotalSize: `${(exportStats.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`,
        safeItems: [
          { key: "healthLogs", label: "Health Check Logs (30-day retention)", count: healthLogs.length },
          { key: "exportFiles", label: "Exported Spreadsheet Files", count: exportStats.count },
        ],
        clinicalDataProtected: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load maintenance stats" },
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may run database maintenance" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { cleanHealthLogs: doCleanLogs, cleanExportFiles: doCleanExports } = body;

    const summary: string[] = [];

    if (doCleanLogs) {
      const res = clearHealthLogs();
      summary.push(`Cleared ${res.clearedCount} historical health check logs.`);
    }

    if (doCleanExports && fs.existsSync(EXPORT_DIR)) {
      const items = fs.readdirSync(EXPORT_DIR);
      let removedCount = 0;
      for (const item of items) {
        if (item.endsWith(".xlsx") || item.endsWith(".csv")) {
          try {
            fs.unlinkSync(path.join(EXPORT_DIR, item));
            removedCount++;
          } catch {}
        }
      }
      summary.push(`Removed ${removedCount} temporary export files.`);
    }

    return NextResponse.json({
      success: true,
      message: summary.length > 0 ? summary.join(" ") : "No maintenance items selected.",
      clinicalRecordsIntact: true,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute maintenance" },
      { status: 500 }
    );
  }
}
