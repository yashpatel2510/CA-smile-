import { NextRequest, NextResponse } from "next/server";
import { getActiveDatabaseMode, isTestModeActive } from "@/lib/database/test-database-config";
import { prisma } from "@/lib/prisma";
import { getStatusPingCache, setStatusPingCache } from "@/lib/database/status-cache";

export async function GET(req: NextRequest) {
  try {
    const activeMode = getActiveDatabaseMode();
    const now = Date.now();
    const isFreshRequested = req.nextUrl.searchParams.get("fresh") === "true";

    const { lastPingTime, lastPingSuccess, lastPingLatency } = getStatusPingCache();
    let currentSuccess = lastPingSuccess;
    let currentLatency = lastPingLatency;

    // Re-check database reachability at most once every 5 seconds (or immediately if fresh requested)
    if (isFreshRequested || now - lastPingTime > 5000) {
      try {
        const start = Date.now();
        const pingPromise = prisma.$queryRawUnsafe("SELECT 1 as connected;");
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database connection timeout")), 4500)
        );
        await Promise.race([pingPromise, timeoutPromise]);
        currentLatency = Date.now() - start;
        currentSuccess = true;
        setStatusPingCache(true, currentLatency);
      } catch (pingErr) {
        console.warn("Database status ping error:", pingErr);
        currentSuccess = false;
        currentLatency = null;
        setStatusPingCache(false, null);
      }
    }

    // Determine user-facing status:
    // 1. If in Test Mode and connected -> "TEST"
    // 2. If in Production Mode and connected -> "ONLINE"
    // 3. If disconnected or unreachable -> "OFFLINE"
    let status: "ONLINE" | "OFFLINE" | "TEST" = "ONLINE";
    if (!currentSuccess) {
      status = "OFFLINE";
    } else if (activeMode === "test") {
      status = "TEST";
    } else {
      status = "ONLINE";
    }

    return NextResponse.json({
      success: true,
      status, // "ONLINE" | "OFFLINE" | "TEST"
      mode: activeMode, // "production" | "test"
      isOnline: currentSuccess,
      isTestMode: activeMode === "test",
      latencyMs: currentLatency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      status: "OFFLINE",
      mode: "production",
      isOnline: false,
      isTestMode: false,
      error: err.message,
    });
  }
}
