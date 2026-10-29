import { NextRequest, NextResponse } from "next/server";
import { getActiveDatabaseMode, isTestModeActive } from "@/lib/database/test-database-config";
import { prisma } from "@/lib/prisma";

// Lightweight 5-second in-memory ping cache to avoid exhausting Supabase pool connections
let lastPingTime = 0;
let lastPingSuccess = true;
let lastPingLatency: number | null = 50;

export async function GET(req: NextRequest) {
  try {
    const activeMode = getActiveDatabaseMode();
    const now = Date.now();

    // Re-check database reachability at most once every 5 seconds
    if (now - lastPingTime > 5000) {
      lastPingTime = now;
      try {
        const start = Date.now();
        const pingPromise = prisma.$queryRawUnsafe("SELECT 1 as connected;");
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database connection timeout")), 3500)
        );
        await Promise.race([pingPromise, timeoutPromise]);
        lastPingLatency = Date.now() - start;
        lastPingSuccess = true;
      } catch (pingErr) {
        console.warn("Database status ping error:", pingErr);
        lastPingSuccess = false;
        lastPingLatency = null;
      }
    }

    // Determine user-facing status:
    // 1. If in Test Mode and connected -> "TEST"
    // 2. If in Production Mode and connected -> "ONLINE"
    // 3. If disconnected or unreachable -> "OFFLINE"
    let status: "ONLINE" | "OFFLINE" | "TEST" = "ONLINE";
    if (!lastPingSuccess) {
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
      isOnline: lastPingSuccess,
      isTestMode: activeMode === "test",
      latencyMs: lastPingLatency,
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
