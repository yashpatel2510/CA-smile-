import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import {
  getDatabaseModeConfig,
  saveDatabaseModeConfig,
  getActiveDatabaseMode,
  maskDatabaseUrl,
  normalizePostgresUrl,
} from "@/lib/database/test-database-config";
import {
  reloadPrismaClients,
  getTestDatabaseStats,
  getPrimaryDatabaseUrl,
} from "@/lib/prisma";
import fs from "fs";
import path from "path";

async function pingDatabase(url: string, timeoutMs = 4500): Promise<{ ok: boolean; latencyMs: number | null; error: string | null; diagnostic: string | null }> {
  let cleanUrl = normalizePostgresUrl(url);
  if (!cleanUrl.includes("connection_limit=")) {
    cleanUrl += (cleanUrl.includes("?") ? "&" : "?") + "connection_limit=1";
  }

  const client = new PrismaClient({
    datasources: { db: { url: cleanUrl } },
    log: ["error"],
  });

  try {
    const start = Date.now();
    const queryPromise = client.$queryRawUnsafe("SELECT 1 as connected;");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timed out after 4500ms")), timeoutMs)
    );
    await Promise.race([queryPromise, timeoutPromise]);
    const duration = Date.now() - start;
    await client.$disconnect();
    return { ok: true, latencyMs: duration, error: null, diagnostic: null };
  } catch (err: any) {
    await client.$disconnect().catch(() => {});
    const errMsg = err.message || String(err);
    let diagnostic = "Database server is not reachable.";

    if (errMsg.includes("timed out") || errMsg.includes("Can't reach database server")) {
      diagnostic = "Connection timed out. Verify network access and make sure your Supabase project is active (not paused).";
    } else if (errMsg.includes("SASL authentication failed") || errMsg.includes("password authentication failed")) {
      diagnostic = "Authentication failed. Verify your database username and password in the connection string.";
    } else if (errMsg.includes("tenant/user") && errMsg.includes("not found")) {
      diagnostic = "Project not found. Check the project reference ID in your Supabase connection string.";
    }

    return { ok: false, latencyMs: null, error: errMsg, diagnostic };
  }
}

/**
 * GET /api/admin/database/test-mode
 * Retrieves current database mode, test database config, health, and test statistics.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const config = getDatabaseModeConfig();
    const activeMode = getActiveDatabaseMode();
    const testStats = await getTestDatabaseStats();

    // Check test DB latency if connected
    let testLatencyMs: number | null = null;
    let testStatus = "NOT_CONFIGURED";

    if (config.testDatabaseUrl && config.testDatabaseConnected) {
      const pingResult = await pingDatabase(config.testDatabaseUrl, 3000);
      if (pingResult.ok) {
        testLatencyMs = pingResult.latencyMs;
        testStatus = "CONNECTED";
      } else {
        testStatus = "UNREACHABLE";
      }
    } else if (config.testDatabaseUrl && !config.testDatabaseConnected) {
      testStatus = "DISCONNECTED";
    }

    return NextResponse.json({
      success: true,
      activeMode,
      config: {
        activeMode: config.activeMode,
        testDatabaseUrlMasked: maskDatabaseUrl(config.testDatabaseUrl),
        testDatabaseConnected: config.testDatabaseConnected,
        hasTestUrl: Boolean(config.testDatabaseUrl),
        lastPurgedAt: config.lastPurgedAt,
      },
      testStatus,
      testLatencyMs,
      testStats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch test mode info" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/database/test-mode
 * Actions:
 * - "switch-mode": { mode: "production" | "test" }
 * - "save-test-url": { url: string }
 * - "toggle-connect": { connected: boolean }
 * - "test-connection": { url?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may change database settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    // 1. SWITCH MODE (Production ↔ Test)
    if (action === "switch-mode") {
      const targetMode = body.mode === "test" ? "test" : "production";
      const config = getDatabaseModeConfig();

      if (targetMode === "test" && (!config.testDatabaseUrl || !config.testDatabaseConnected)) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot switch to Test Mode: Test Database is not configured or not connected. Please connect a valid Test Database first.",
          },
          { status: 400 }
        );
      }

      saveDatabaseModeConfig({ activeMode: targetMode });
      reloadPrismaClients();

      return NextResponse.json({
        success: true,
        activeMode: targetMode,
        message:
          targetMode === "test"
            ? "Switched to Test Database (Sandbox Mode). All new bookings will be stored in the Test Database."
            : "Switched back to Live Clinic Database (Production Mode). Clinic operations are live.",
      });
    }

    // 2. SAVE TEST DATABASE URL
    if (action === "save-test-url") {
      const rawUrl = (body.url || "").trim();
      if (!rawUrl) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid PostgreSQL connection URL." },
          { status: 400 }
        );
      }
      const newUrl = normalizePostgresUrl(rawUrl);

      // Test connection first
      const ping = await pingDatabase(newUrl, 4500);
      if (!ping.ok) {
        return NextResponse.json(
          {
            success: false,
            message: `Could not connect to this database URL: ${ping.diagnostic || ping.error}`,
          },
          { status: 400 }
        );
      }

      // Save to config
      saveDatabaseModeConfig({
        testDatabaseUrl: newUrl,
        testDatabaseConnected: true,
      });

      // Also persist to .env as TEST_DATABASE_URL
      try {
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, "utf-8");
          if (/^TEST_DATABASE_URL=.*/m.test(envContent)) {
            envContent = envContent.replace(/^TEST_DATABASE_URL=.*/m, `TEST_DATABASE_URL="${newUrl}"`);
          } else {
            envContent += `\nTEST_DATABASE_URL="${newUrl}"\n`;
          }
          fs.writeFileSync(envPath, envContent, "utf-8");
        }
      } catch (envErr) {
        console.warn("Could not write TEST_DATABASE_URL to .env:", envErr);
      }

      process.env.TEST_DATABASE_URL = newUrl;
      reloadPrismaClients();

      return NextResponse.json({
        success: true,
        message: `Test Database connected successfully (${ping.latencyMs}ms)!`,
        latencyMs: ping.latencyMs,
        maskedUrl: maskDatabaseUrl(newUrl),
      });
    }

    // 3. TOGGLE CONNECT / DISCONNECT
    if (action === "toggle-connect") {
      const connected = Boolean(body.connected);
      const config = getDatabaseModeConfig();

      if (connected && !config.testDatabaseUrl) {
        return NextResponse.json(
          { success: false, message: "No Test Database URL is configured. Please enter a URL first." },
          { status: 400 }
        );
      }

      // If disconnecting while in test mode, safely switch activeMode to production first!
      if (!connected && config.activeMode === "test") {
        saveDatabaseModeConfig({
          activeMode: "production",
          testDatabaseConnected: false,
        });
      } else {
        saveDatabaseModeConfig({
          testDatabaseConnected: connected,
        });
      }

      reloadPrismaClients();

      return NextResponse.json({
        success: true,
        testDatabaseConnected: connected,
        activeMode: getActiveDatabaseMode(),
        message: connected
          ? "Test Database connected."
          : "Test Database disconnected. Active mode switched to Production.",
      });
    }

    // 4. TEST CONNECTION
    if (action === "test-connection") {
      const config = getDatabaseModeConfig();
      const rawTarget = (body.url || config.testDatabaseUrl || "").trim();
      const targetUrl = rawTarget ? normalizePostgresUrl(rawTarget) : "";

      if (!targetUrl) {
        return NextResponse.json(
          { success: false, message: "No database URL available to test." },
          { status: 400 }
        );
      }

      const ping = await pingDatabase(targetUrl, 4500);
      return NextResponse.json({
        success: ping.ok,
        latencyMs: ping.latencyMs,
        error: ping.error,
        diagnostic: ping.diagnostic,
        message: ping.ok
          ? `Connection verified successfully (${ping.latencyMs}ms)!`
          : `Connection test failed: ${ping.diagnostic || ping.error}`,
      });
    }

    // 5. SYNC / INITIALIZE TABLES IN TEST DATABASE
    if (action === "sync-tables") {
      const config = getDatabaseModeConfig();
      const targetUrl = (body.url || config.testDatabaseUrl || "").trim();

      if (!targetUrl) {
        return NextResponse.json(
          { success: false, message: "No Test Database URL configured to sync tables." },
          { status: 400 }
        );
      }

      try {
        const { execSync } = require("child_process");
        execSync(`npx prisma db push --skip-generate --accept-data-loss`, {
          env: {
            ...process.env,
            DATABASE_URL: targetUrl,
          },
          timeout: 45000,
        });

        return NextResponse.json({
          success: true,
          message: "Test Database tables successfully synchronized with clinic schema (8 tables initialized)!",
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            message: `Failed to initialize tables in test database: ${err.message || String(err)}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to execute test mode action" },
      { status: 500 }
    );
  }
}
