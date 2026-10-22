import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentHealthLogs, clearHealthLogs } from "@/lib/database/health-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const logs = getRecentHealthLogs(50);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve logs" },
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
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may clear health logs" },
        { status: 403 }
      );
    }

    const res = clearHealthLogs();
    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${res.clearedCount} historical health check logs. Clinic patient records remain completely untouched.`,
      ...res,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to clear health logs" },
      { status: 500 }
    );
  }
}
