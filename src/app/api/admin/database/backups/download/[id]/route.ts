import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { getDatabaseBackupConfig } from "@/lib/database/database-backup-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    // Strict RBAC: Only ADMIN can download backup files
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) may download database backup files.",
        },
        { status: 403 }
      );
    }

    const backupId = params.id;
    const config = getDatabaseBackupConfig();
    const target = (config.history || []).find(
      (h) => h.id === backupId || h.fileName === backupId
    );

    const fileName = target?.fileName || (backupId.endsWith(".xlsx") ? backupId : `${backupId}.xlsx`);
    const filePath = path.join(process.cwd(), "src", "data", "backups", "excel", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "Excel backup file not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "X-Privacy-Warning":
          "CONFIDENTIAL CLINICAL EXCEL BACKUP: Handle in accordance with patient privacy regulations.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to download backup" },
      { status: 500 }
    );
  }
}
