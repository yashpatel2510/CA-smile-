import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTableRecords,
  deleteRecordSafely,
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

    const { searchParams } = new URL(req.url);
    const table = (searchParams.get("table") || "appointments") as AllowedTable;

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { success: false, message: `Invalid table: ${table}` },
        { status: 400 }
      );
    }

    const records = await getTableRecords(table);

    return NextResponse.json({
      success: true,
      table,
      count: records.length,
      records,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve records",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Role-based verification: Strictly ADMIN only
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) may perform permanent record deletions.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { table, recordId, confirmation } = body;

    if (!table || !recordId) {
      return NextResponse.json(
        { success: false, message: "Table and Record ID are required" },
        { status: 400 }
      );
    }

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        {
          success: false,
          message: "Security safeguard: You must type 'DELETE' in capital letters to confirm permanent deletion.",
        },
        { status: 400 }
      );
    }

    const result = await deleteRecordSafely(
      table as AllowedTable,
      recordId,
      session.user.name || "Clinic Owner"
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete record",
      },
      { status: 500 }
    );
  }
}
