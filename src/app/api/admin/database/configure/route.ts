import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { reloadPrismaClients } from "@/lib/prisma";
import { checkMainDatabaseHealth, checkAuthDatabaseHealth } from "@/lib/database/health";
import fs from "fs";
import path from "path";

async function testSingleConnection(url: string, timeoutMs = 4500): Promise<{ ok: boolean; latencyMs: number | null; error: string | null; diagnostic: string | null }> {
  const client = new PrismaClient({
    datasources: { db: { url } },
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
      diagnostic = "Connection timed out. If using Supabase, check if the project is Paused in your Supabase dashboard (supabase.com/dashboard) and click 'Restore project', or verify port accessibility.";
    } else if (errMsg.includes("SASL authentication failed") || errMsg.includes("password authentication failed")) {
      diagnostic = "Authentication failed. For Supabase Pooler (port 6543), the username must be postgres.[PROJECT-REF]. Also check if your password contains special characters that need URL encoding.";
    } else if (errMsg.includes("tenant/user") && errMsg.includes("not found")) {
      diagnostic = "Tenant/User not found. The project reference ID in your connection string does not match any active project.";
    }

    return { ok: false, latencyMs: null, error: errMsg, diagnostic };
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Clinic Owners (Admin) may configure databases" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, target, url, mainDatabaseUrl, authDatabaseUrl } = body;

    // 1. ACTION: TEST A CANDIDATE URL
    if (action === "test") {
      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { success: false, message: "A valid connection URL is required for testing." },
          { status: 400 }
        );
      }

      const testResult = await testSingleConnection(url.trim());
      return NextResponse.json({
        success: testResult.ok,
        target: target || "database",
        latencyMs: testResult.latencyMs,
        error: testResult.error,
        diagnostic: testResult.diagnostic,
        message: testResult.ok
          ? `Connection verified successfully (${testResult.latencyMs}ms)!`
          : `Connection test failed: ${testResult.diagnostic || testResult.error}`,
      });
    }

    // 2. ACTION: SAVE CONFIGURATION TO .ENV
    if (action === "save") {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContent = "";
      try {
        envContent = fs.readFileSync(envPath, "utf-8");
      } catch (readErr) {
        return NextResponse.json(
          { success: false, message: "Could not read .env file on server" },
          { status: 500 }
        );
      }

      let updatedContent = envContent;
      let updatedMain = false;
      let updatedAuth = false;

      if (mainDatabaseUrl && typeof mainDatabaseUrl === "string" && mainDatabaseUrl.trim()) {
        const cleanMain = mainDatabaseUrl.trim();
        process.env.DATABASE_URL = cleanMain;
        if (/^DATABASE_URL=.*/m.test(updatedContent)) {
          updatedContent = updatedContent.replace(/^DATABASE_URL=.*/m, `DATABASE_URL="${cleanMain}"`);
        } else {
          updatedContent += `\nDATABASE_URL="${cleanMain}"\n`;
        }
        updatedMain = true;
      }

      // Ensure secondary AUTH_DATABASE_URL is removed if present
      if (/^AUTH_DATABASE_URL=.*/m.test(updatedContent)) {
        updatedContent = updatedContent.replace(/^AUTH_DATABASE_URL=.*\n?/m, "");
      }
      delete process.env.AUTH_DATABASE_URL;

      fs.writeFileSync(envPath, updatedContent, "utf-8");

      // Reload Prisma clients dynamically
      reloadPrismaClients();

      // Immediately run health checks
      const mainDb = await checkMainDatabaseHealth();

      return NextResponse.json({
        success: true,
        message: "Database connection URL saved and reloaded successfully!",
        updated: { main: updatedMain },
        health: {
          main: {
            status: mainDb.status,
            latencyMs: mainDb.latencyMs,
            error: mainDb.error,
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action. Supported actions: 'test', 'save'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to configure database" },
      { status: 500 }
    );
  }
}
