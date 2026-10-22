import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTableRecords,
  formatRecordsToCsv,
  AllowedTable,
  ALLOWED_TABLES,
} from "@/lib/database/records-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Role-based protection: Only ADMIN can export data
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) may export clinic data.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const table = (searchParams.get("table") || "appointments") as AllowedTable;
    const format = searchParams.get("format") === "json" ? "json" : "csv";

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { success: false, message: `Invalid table: ${table}` },
        { status: 400 }
      );
    }

    const records = await getTableRecords(table, 500);
    const filename = `healthsphere-${table}-export-${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === "json") {
      return new NextResponse(JSON.stringify(records, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Privacy-Warning": "CONFIDENTIAL: Contains private clinic data.",
        },
      });
    }

    const csvContent = formatRecordsToCsv(records);
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Privacy-Warning": "CONFIDENTIAL: Contains private clinic data.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to export data",
      },
      { status: 500 }
    );
  }
}
