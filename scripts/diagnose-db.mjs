import net from "net";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Read .env directly
function parseEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

function extractHost(urlStr) {
  if (!urlStr) return null;
  try {
    const fixed = urlStr.replace("postgresql://", "http://").replace("postgres://", "http://");
    const u = new URL(fixed);
    return u.hostname;
  } catch {
    return null;
  }
}

function checkTcp(host, port, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const cleanHost = host.replace(/^\[|\]$/g, "");
    const start = Date.now();
    const socket = net.createConnection({ host: cleanHost, port, timeout: timeoutMs });
    socket.on("connect", () => {
      const duration = Date.now() - start;
      socket.destroy();
      resolve({ open: true, duration, error: null });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ open: false, duration: Date.now() - start, error: "TIMEOUT" });
    });
    socket.on("error", (err) => {
      resolve({ open: false, duration: Date.now() - start, error: err.message });
    });
  });
}

async function testPrisma(url, timeoutMs = 5000) {
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ["error"],
  });
  const start = Date.now();
  try {
    const qPromise = client.$queryRawUnsafe("SELECT 1 as ping;");
    const tPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("CLIENT_TIMEOUT")), timeoutMs)
    );
    await Promise.race([qPromise, tPromise]);
    const duration = Date.now() - start;
    await client.$disconnect();
    return { ok: true, duration, error: null };
  } catch (err) {
    await client.$disconnect().catch(() => {});
    return { ok: false, duration: Date.now() - start, error: err.message || String(err) };
  }
}

async function runDiagnostic() {
  const env = parseEnv();
  console.log("==================================================");
  console.log("DATABASE CONNECTION DIAGNOSTIC REPORT");
  console.log("Timestamp:", new Date().toISOString());
  console.log("==================================================");

  const targets = [
    {
      name: "Primary Clinic Database (DATABASE_URL)",
      url: env.PRIMARY_DATABASE_URL || env.DATABASE_URL,
    },
    {
      name: "Secondary Auth/Staff Database (AUTH_DATABASE_URL)",
      url: env.SECONDARY_DATABASE_URL || env.AUTH_DATABASE_URL,
    },
  ];

  for (const t of targets) {
    console.log(`\n>>> Inspecting: ${t.name}`);
    if (!t.url) {
      console.log("    STATUS: NOT CONFIGURED");
      continue;
    }

    const host = extractHost(t.url);
    console.log(`    Host: ${host}`);

    if (host) {
      console.log("    --- Socket Probes ---");
      const p5432 = await checkTcp(host, 5432);
      console.log(`    Port 5432 (Direct PostgreSQL): ${p5432.open ? `OPEN (${p5432.duration}ms)` : `FAILED (${p5432.error})`}`);

      const p6543 = await checkTcp(host, 6543);
      console.log(`    Port 6543 (Supabase Pooler):   ${p6543.open ? `OPEN (${p6543.duration}ms)` : `FAILED (${p6543.error})`}`);

      const p443 = await checkTcp(host, 443);
      console.log(`    Port 443  (HTTPS Gateway):     ${p443.open ? `OPEN (${p443.duration}ms)` : `FAILED (${p443.error})`}`);
    }

    console.log("    --- Database Query Test (Prisma SELECT 1) ---");
    const res = await testPrisma(t.url, 6000);
    console.log(`    Result: ${res.ok ? `SUCCESS (${res.duration}ms) - CONNECTED` : `FAILED (${res.error})`}`);
  }

  console.log("\n==================================================");
  console.log("DIAGNOSTIC COMPLETE");
  console.log("==================================================");
}

runDiagnostic();
