import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { purgeTestDatabase, getTestDatabaseStats } from "@/lib/prisma";

/**
 * POST /api/admin/database/test-mode/purge
 * Wipes test appointments, patients, and triage records from the Test Database ONLY.
 * The Live production database is strictly untouched and cannot be modified by this endpoint.
 */
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
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may purge test database" },
        { status: 403 }
      );
    }

    const result = await purgeTestDatabase();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to purge test database",
        },
        { status: 400 }
      );
    }

    const statsAfter = await getTestDatabaseStats();

    return NextResponse.json({
      success: true,
      message: `Test Database cleaned successfully! Deleted ${result.deletedCounts.appointments || 0} test appointment(s) and ${result.deletedCounts.patients || 0} test patient(s).`,
      deletedCounts: result.deletedCounts,
      statsAfter,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to purge test database",
      },
      { status: 500 }
    );
  }
}
