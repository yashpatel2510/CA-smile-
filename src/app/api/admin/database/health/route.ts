import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkAllDatabases,
  checkPrimaryDatabase,
  checkSecondaryDatabase,
} from "@/lib/database/health-service";
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

    const report = await checkAllDatabases();
    const recentLogs = getRecentHealthLogs(15);

    return NextResponse.json({
      success: report.success,
      overallStatus: report.overallStatus,
      overallMessage: report.overallMessage,
      checkedAt: report.checkedAt,
      database: report.database,
      databases: report.databases,
      storage: report.storage,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve database health",
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

    const primaryRes = await checkPrimaryDatabase();
    return NextResponse.json({
      success: primaryRes.status === "CONNECTED",
      target: "primary",
      database: primaryRes,
      result: primaryRes,
      overallStatus: primaryRes.status === "CONNECTED" ? "HEALTHY" : "CRITICAL",
      overallMessage: primaryRes.message,
      recentLogs: getRecentHealthLogs(15),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to execute database connection test",
      },
      { status: 500 }
    );
  }
}
