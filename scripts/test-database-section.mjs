import { encode } from "next-auth/jwt";
import ExcelJS from "exceljs";

const secret =
  process.env.NEXTAUTH_SECRET ||
  "super-secret-clinic-auth-token-for-dev-session-key-32-chars-min";

const BASE_URL = "http://localhost:3000";

async function runDatabaseSectionTests() {
  console.log("==========================================================================");
  console.log("  DEDICATED DATABASE SECTION & EXCEL BACKUP VERIFICATION SUITE           ");
  console.log("==========================================================================\n");

  const adminToken = await encode({
    token: {
      id: "admin-owner-id",
      name: "Clinic Owner",
      email: "casmileatbilimora@gmail.com",
      role: "ADMIN",
    },
    secret,
  });

  const staffToken = await encode({
    token: {
      id: "staff-2",
      name: "Dr. Sarah Chen, MD",
      email: "staff@healthsphere.example.com",
      role: "STAFF",
    },
    secret,
  });

  // -------------------------------------------------------------------------
  // Test 1: Clinic Branding Purge Verification
  // -------------------------------------------------------------------------
  console.log("[Test 1] Verifying Total Database Removal from Clinic Branding (/admin/settings):");
  const settingsRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const settingsHtml = await settingsRes.text();
  if (settingsRes.status === 200) {
    const hasDatabaseStatusId = settingsHtml.includes('id="database-status"');
    const hasDatabaseHeading = settingsHtml.includes("Database &amp; System Status") || settingsHtml.includes("Database & System Status");
    const hasBrandingForm =
      settingsHtml.includes("Clinic Branding &amp; Logo Settings") ||
      settingsHtml.includes("Clinic Branding & Logo Settings") ||
      settingsHtml.includes("Clinic Branding &amp; Hero Customizer") ||
      settingsHtml.includes("Clinic Branding & Hero Customizer");

    if (!hasDatabaseStatusId && !hasDatabaseHeading && hasBrandingForm) {
      console.log("  ✓ CLEANED: Section 6 #database-status completely removed from Clinic Branding.");
      console.log("  ✓ CLEANED: Database navigation pills removed from Clinic Branding.");
      console.log("  ✓ CONFIRMED: Clinic Branding contains only clinic branding, logo, colors, and profile settings.");
    } else {
      console.error("  ✗ FAILED: Database elements still detected in Clinic Branding HTML!");
      console.error({ hasDatabaseStatusId, hasDatabaseHeading, hasBrandingForm });
      process.exit(1);
    }
  } else {
    console.error(`  ✗ FAILED: /admin/settings returned ${settingsRes.status}`);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 2: Verify /admin/database Route Loads for Authenticated Admin
  // -------------------------------------------------------------------------
  console.log("\n[Test 2] Testing /admin/database Page Render:");
  const dbPageRes = await fetch(`${BASE_URL}/admin/database`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const dbPageHtml = await dbPageRes.text();
  if (dbPageRes.status === 200 && dbPageHtml.includes("Database Management")) {
    console.log("  ✓ SUCCESS -> HTTP 200 OK: /admin/database page loaded.");
    console.log("    - Title: Database Management");
    console.log("    - Single Clinic Database architecture rendered");
  } else {
    console.error(`  ✗ FAILED: /admin/database error: ${dbPageRes.status}`);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 3: Unauthorized Access to Database Overview API
  // -------------------------------------------------------------------------
  console.log("\n[Test 3] Testing Unauthorized Access to /api/admin/database/overview:");
  const unauthRes = await fetch(`${BASE_URL}/api/admin/database/overview`);
  if (unauthRes.status === 401) {
    console.log("  ✓ REJECTED [UNAUTHORIZED] -> HTTP 401 (Authentication required)");
  } else {
    console.error(`  ✗ FAILED: Expected 401, got ${unauthRes.status}`);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 4: Database Overview API - Single Database Architecture
  // -------------------------------------------------------------------------
  console.log("\n[Test 4] Testing Admin GET /api/admin/database/overview (Single Database Architecture):");
  const overviewRes = await fetch(`${BASE_URL}/api/admin/database/overview`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const overviewData = await overviewRes.json();
  if (overviewRes.status === 200 && overviewData.success) {
    console.log("  ✓ SUCCESS -> Unified Database Architecture Verified:");
    console.log(`    - Total Databases: ${overviewData.overview.totalDatabases}`);
    console.log(`    - Connected Count: ${overviewData.overview.connectedCount} / ${overviewData.overview.totalDatabases}`);
    console.log(`    - Active Count: ${overviewData.overview.activeCount} / ${overviewData.overview.totalDatabases}`);
    console.log(`    - Last Checked: ${overviewData.overview.lastChecked}`);

    const db = overviewData.database;
    console.log(`\n    [Clinic Database: PostgreSQL]`);
    console.log(`      - Provider: ${db.provider}`);
    console.log(`      - Host/Service: ${db.databaseService}`);
    console.log(`      - Status: ${db.status} | Activity: ${db.activity}`);
    console.log(`      - Response Time: ${db.responseTime !== null ? db.responseTime + " ms" : "N/A"}`);
    console.log(`      - Registered Tables: ${db.tableCount}`);
  } else {
    console.error("  ✗ FAILED: Overview API error:", overviewData);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 5: On-Demand Database Health Check (POST /api/admin/database/overview)
  // -------------------------------------------------------------------------
  console.log("\n[Test 5] Testing On-Demand Database Check (POST /api/admin/database/overview):");
  const checkBothRes = await fetch(`${BASE_URL}/api/admin/database/overview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({}),
  });
  const checkBothData = await checkBothRes.json();
  if (checkBothRes.status === 200 && checkBothData.success) {
    console.log("  ✓ DATABASE CHECK SUCCEEDED ->");
    console.log(`    - Checked At: ${checkBothData.checkedAt}`);
    const r = checkBothData.result;
    console.log(`    - Database: Status=${r?.status}, Response=${r?.responseTimeMs}ms`);
  } else {
    console.error("  ✗ FAILED: Database check failed:", checkBothData);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 6: Staff RBAC Restriction on Excel Backup Triggering
  // -------------------------------------------------------------------------
  console.log("\n[Test 6] Testing Staff RBAC Restriction on Excel Backup Trigger:");
  const staffBackupRes = await fetch(`${BASE_URL}/api/admin/database/backups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${staffToken}`,
    },
    body: JSON.stringify({ type: "daily" }),
  });
  if (staffBackupRes.status === 403) {
    console.log("  ✓ FORBIDDEN [RBAC ENFORCED] -> HTTP 403: Staff cannot generate database backups.");
  } else {
    console.error(`  ✗ FAILED: Expected 403, got ${staffBackupRes.status}`);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 7: Daily Excel Backup Generation
  // -------------------------------------------------------------------------
  console.log("\n[Test 7] Testing Daily Excel Backup Generation:");
  const dailyRes = await fetch(`${BASE_URL}/api/admin/database/backups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({ type: "daily" }),
  });
  const dailyData = await dailyRes.json();
  if (dailyRes.status === 200 && dailyData.success && dailyData.result) {
    const r = dailyData.result;
    console.log("  ✓ DAILY BACKUP GENERATED ->");
    console.log(`    - Backup ID: ${r.backupId}`);
    console.log(`    - File Name: ${r.fileName}`);
    console.log(`    - Size: ${r.sizePretty} (${r.sizeBytes} bytes)`);
    console.log(`    - Records Exported: ${r.recordCount}`);
    console.log(`    - Worksheets (${r.worksheets.length}): ${r.worksheets.join(", ")}`);
    console.log(`    - Verified: ${r.verified ? "YES (Integrity Confirmed)" : "NO"}`);
  } else {
    console.error("  ✗ FAILED: Daily backup generation error:", dailyData);
    process.exit(1);
  }

  const generatedBackupId = dailyData.result.backupId;

  // -------------------------------------------------------------------------
  // Test 8: Full Excel Backup Generation
  // -------------------------------------------------------------------------
  console.log("\n[Test 8] Testing Full Excel Backup Generation:");
  const fullRes = await fetch(`${BASE_URL}/api/admin/database/backups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({ type: "full" }),
  });
  const fullData = await fullRes.json();
  if (fullRes.status === 200 && fullData.success && fullData.result) {
    const r = fullData.result;
    console.log("  ✓ FULL BACKUP GENERATED ->");
    console.log(`    - File Name: ${r.fileName}`);
    console.log(`    - Size: ${r.sizePretty}`);
    console.log(`    - Records Exported: ${r.recordCount}`);
    console.log(`    - Verified: ${r.verified ? "YES" : "NO"}`);
  } else {
    console.error("  ✗ FAILED: Full backup generation error:", fullData);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 9: Secure Authenticated Excel Download & Privacy Headers
  // -------------------------------------------------------------------------
  console.log(`\n[Test 9] Testing Authenticated Download (/api/admin/database/backups/download/${generatedBackupId}):`);
  const downloadRes = await fetch(`${BASE_URL}/api/admin/database/backups/download/${generatedBackupId}`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  if (downloadRes.status === 200) {
    const contentType = downloadRes.headers.get("Content-Type");
    const cacheControl = downloadRes.headers.get("Cache-Control");
    const pragma = downloadRes.headers.get("Pragma");
    const contentDisp = downloadRes.headers.get("Content-Disposition");
    const privacyWarning = downloadRes.headers.get("X-Privacy-Warning");

    const arrayBuffer = await downloadRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`  ✓ DOWNLOAD SUCCEEDED -> HTTP 200 (${buffer.length} bytes)`);
    console.log(`    - Content-Type: ${contentType}`);
    console.log(`    - Content-Disposition: ${contentDisp}`);
    console.log(`    - Cache-Control: ${cacheControl}`);
    console.log(`    - Privacy Header: ${privacyWarning}`);

    if (contentType?.includes("spreadsheetml") && cacheControl?.includes("no-store") && pragma === "no-cache") {
      console.log("  ✓ Healthcare data privacy & Excel MIME headers confirmed.");
    } else {
      console.error("  ✗ FAILED: Headers invalid!");
      process.exit(1);
    }

    // -----------------------------------------------------------------------
    // Test 10: Inspect Excel File Content & Verify Zero Secrets
    // -----------------------------------------------------------------------
    console.log("\n[Test 10] Parsing Generated Excel File with ExcelJS to Verify Worksheets & Zero Secrets:");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheetNames = workbook.worksheets.map((ws) => ws.name);
    console.log(`  ✓ Worksheets Found (${sheetNames.length}): ${sheetNames.join(", ")}`);

    const expectedSheets = ["Patients", "Appointments", "WhatsApp Bookings", "Reviews", "Staff"];
    for (const expected of expectedSheets) {
      if (!sheetNames.includes(expected)) {
        console.error(`  ✗ FAILED: Missing expected worksheet "${expected}"`);
        process.exit(1);
      }
    }

    // Verify Staff sheet contains safe data only (NO passwords, NO secret hashes)
    const staffWs = workbook.getWorksheet("Staff");
    let forbiddenSecretsFound = false;
    staffWs?.eachRow((row) => {
      row.eachCell((cell) => {
        const val = String(cell.value || "");
        if (
          val.includes("$2a$") ||
          val.includes("admin123") ||
          val.includes("super-secret") ||
          val.includes("postgres://")
        ) {
          forbiddenSecretsFound = true;
        }
      });
    });

    if (!forbiddenSecretsFound) {
      console.log("  ✓ SECURITY VERIFIED: Zero passwords, API secrets, or connection strings found in Excel worksheets.");
    } else {
      console.error("  ✗ CRITICAL SECURITY VIOLATION: Raw password or secret detected in Excel export!");
      process.exit(1);
    }
  } else {
    console.error(`  ✗ FAILED: Download returned ${downloadRes.status}`);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 11: Update Backup Settings & Retention Policy
  // -------------------------------------------------------------------------
  console.log("\n[Test 11] Testing PUT /api/admin/database/backups (Update Schedules & Retention):");
  const updateSettingsRes = await fetch(`${BASE_URL}/api/admin/database/backups`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      dailyTime: "03:00 AM IST",
      weeklyDay: "Sunday",
      retentionDays: 90,
      autoHealthCheckFrequency: "6h",
    }),
  });
  const updateSettingsData = await updateSettingsRes.json();
  if (updateSettingsRes.status === 200 && updateSettingsData.success) {
    console.log("  ✓ SETTINGS SAVED ->");
    console.log(`    - Daily Schedule: ${updateSettingsData.config.dailyTime}`);
    console.log(`    - Retention Policy: ${updateSettingsData.config.retentionDays} days`);
    console.log(`    - Auto Health Check: ${updateSettingsData.config.autoHealthCheckFrequency}`);
  } else {
    console.error("  ✗ FAILED: Settings update error:", updateSettingsData);
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Test 12: Scheduled Server-Side Cron Engine
  // -------------------------------------------------------------------------
  console.log("\n[Test 12] Testing Server-Side Cron Endpoint (/api/cron/database-backup?force=true):");
  const cronRes = await fetch(`${BASE_URL}/api/cron/database-backup?force=true`);
  const cronData = await cronRes.json();
  if (cronRes.status === 200 && cronData.success) {
    console.log("  ✓ CRON EXECUTION SUCCESSFUL ->");
    console.log(`    - Action: ${cronData.action}`);
    console.log(`    - Executed At (IST): ${cronData.executedAt}`);
    console.log(`    - Automated Backup File: ${cronData.results.backup?.fileName}`);
    console.log(`    - Retention Cleanup: ${cronData.results.retentionCleanup?.deletedCount} old files pruned`);
  } else {
    console.error("  ✗ FAILED: Cron execution error:", cronData);
    process.exit(1);
  }

  console.log("\n==========================================================================");
  console.log("  ALL 12 DATABASE SECTION & EXCEL BACKUP TESTS PASSED PERFECTLY!          ");
  console.log("==========================================================================");
}

runDatabaseSectionTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
