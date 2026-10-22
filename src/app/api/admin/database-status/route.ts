import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getCompleteSystemStatusReport,
  checkMainDatabaseHealth,
  checkAuthDatabaseHealth,
} from "@/lib/database/health";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin or Staff session required" },
        { status: 401 }
      );
    }

    const report = await getCompleteSystemStatusReport();

    return NextResponse.json({
      success: true,
      role: session.user.role || "STAFF",
      isAdmin: session.user.role === "ADMIN",
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve database system status",
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

    const body = await req.json().catch(() => ({}));
    const target = body.target || "main";

    if (target === "auth") {
      const authResult = await checkAuthDatabaseHealth();
      return NextResponse.json({
        success: true,
        target: "auth",
        result: authResult,
      });
    } else {
      const mainResult = await checkMainDatabaseHealth();
      return NextResponse.json({
        success: true,
        target: "main",
        result: mainResult,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to test database connection",
      },
      { status: 500 }
    );
  }
}
