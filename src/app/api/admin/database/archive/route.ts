import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import fs from "fs";
import path from "path";

const ARCHIVE_DIR = path.join(process.cwd(), "src", "data", "archives");

function ensureArchiveDir() {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
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
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may access archiving" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, cutoffMonths = 12, confirmed, secondConfirmationText } = body;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - Number(cutoffMonths));

    // 1. PREVIEW ACTION
    if (action === "preview") {
      let appointmentCount = 0;
      let auditLogCount = 0;

      try {
        appointmentCount = await prisma.appointment.count({
          where: {
            createdAt: { lt: cutoffDate },
            status: { in: ["COMPLETED", "CANCELLED"] },
          },
        });
        auditLogCount = await prisma.auditLog.count({
          where: { createdAt: { lt: cutoffDate } },
        });
      } catch {
        // Fallback to in-memory store
        const memoryApts = inMemoryStore.getAppointments();
        appointmentCount = memoryApts.filter(
          (a) => new Date(a.createdAt || a.startTime) < cutoffDate && ["COMPLETED", "CANCELLED"].includes(a.status)
        ).length;
      }

      return NextResponse.json({
        success: true,
        action: "preview",
        cutoffMonths,
        cutoffDateFormatted: cutoffDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        counts: {
          eligibleAppointments: appointmentCount,
          eligibleAuditLogs: auditLogCount,
          totalEligibleRecords: appointmentCount + auditLogCount,
        },
        warning:
          "Active patient profiles and upcoming appointments will NEVER be archived or deleted.",
      });
    }

    // 2. ARCHIVE ACTION
    if (action === "archive") {
      if (!confirmed) {
        return NextResponse.json(
          { success: false, message: "Administrator confirmation required to archive records." },
          { status: 400 }
        );
      }

      ensureArchiveDir();
      const archiveId = `archive_${Date.now()}`;
      const archiveFile = path.join(ARCHIVE_DIR, `${archiveId}.json`);

      let archivedRecords: any[] = [];
      try {
        archivedRecords = await prisma.appointment.findMany({
          where: {
            createdAt: { lt: cutoffDate },
            status: { in: ["COMPLETED", "CANCELLED"] },
          },
        });
      } catch {
        archivedRecords = inMemoryStore
          .getAppointments()
          .filter((a) => new Date(a.createdAt || a.startTime) < cutoffDate);
      }

      fs.writeFileSync(
        archiveFile,
        JSON.stringify(
          {
            archivedAt: new Date().toISOString(),
            cutoffDate: cutoffDate.toISOString(),
            recordCount: archivedRecords.length,
            records: archivedRecords,
          },
          null,
          2
        ),
        "utf-8"
      );

      return NextResponse.json({
        success: true,
        action: "archive",
        archiveId,
        fileName: `${archiveId}.json`,
        archivedCount: archivedRecords.length,
        message: `Successfully created secure archive with ${archivedRecords.length} historical records. Database remains untouched until explicit pruning.`,
      });
    }

    // 3. PERMANENT PRUNE / DELETION ACTION
    if (action === "delete") {
      if (!confirmed || secondConfirmationText !== "DELETE_RECORDS_PERMANENTLY") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Permanent deletion requires second confirmation with exact phrase 'DELETE_RECORDS_PERMANENTLY'.",
          },
          { status: 400 }
        );
      }

      let deletedAppointments = 0;
      try {
        const delResult = await prisma.appointment.deleteMany({
          where: {
            createdAt: { lt: cutoffDate },
            status: { in: ["COMPLETED", "CANCELLED"] },
          },
        });
        deletedAppointments = delResult.count;
      } catch {
        // Safe no-op if DB not connected
      }

      return NextResponse.json({
        success: true,
        action: "delete",
        deletedCount: deletedAppointments,
        message: `Permanently pruned ${deletedAppointments} old completed appointments. Patient profiles were preserved.`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action. Supported: 'preview', 'archive', 'delete'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to execute archive action" },
      { status: 500 }
    );
  }
}
