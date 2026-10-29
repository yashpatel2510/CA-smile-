import { encode } from "next-auth/jwt";

const secret =
  process.env.NEXTAUTH_SECRET ||
  "super-secret-clinic-auth-token-for-dev-session-key-32-chars-min";

const BASE_URL = "http://localhost:3000";

async function runDatabaseStatusTests() {
  console.log("===============================================================");
  console.log("  CLINIC BRANDING → DATABASE & SYSTEM STATUS TEST SUITE       ");
  console.log("===============================================================\n");

  // Tokens
  const adminToken = await encode({
    token: {
      id: "admin-owner-id",
      name: "Clinic Owner",
      email: process.env.OWNER_EMAILS?.split(",")[0] || "admin@casmile.com",
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

  // Test 1: Unauthorized access to status API
  console.log("[Test 1] Testing Unauthorized Access to Database Status API:");
  const unauthRes = await fetch(`${BASE_URL}/api/admin/database-status`);
  if (unauthRes.status === 401) {
    console.log("  ✓ REJECTED [UNAUTHORIZED] -> HTTP 401 (Authentication required)");
  } else {
    console.error(`  ✗ FAILED: Expected 401, got ${unauthRes.status}`);
    process.exit(1);
  }

  // Test 2: Staff view-only access
  console.log("\n[Test 2] Testing Staff User View Access to Database Status API:");
  const staffRes = await fetch(`${BASE_URL}/api/admin/database-status`, {
    headers: { Cookie: `next-auth.session-token=${staffToken}` },
  });
  const staffData = await staffRes.json();
  if (staffRes.status === 200 && staffData.success && staffData.role === "STAFF" && staffData.isAdmin === false) {
    console.log("  ✓ PERMITTED [STAFF VIEW-ONLY] -> HTTP 200 (role: STAFF, isAdmin: false)");
  } else {
    console.error(`  ✗ FAILED: Staff access error:`, staffData);
    process.exit(1);
  }

  // Test 3: Admin full report access
  console.log("\n[Test 3] Testing Admin Full System Status Report Access:");
  const adminRes = await fetch(`${BASE_URL}/api/admin/database-status`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const adminData = await adminRes.json();
  if (adminRes.status === 200 && adminData.success && adminData.isAdmin === true && adminData.report) {
    const r = adminData.report;
    console.log(`  ✓ PERMITTED [ADMIN] -> HTTP 200 OK`);
    console.log(`    - Architecture: ${r.overview.architectureType}`);
    console.log(`    - Configured DBs: ${r.overview.totalConfigured}`);
    console.log(`    - Connected DBs: ${r.overview.connectedCount} | Disconnected: ${r.overview.disconnectedCount}`);
    console.log(`    - Main DB Status: ${r.databases.main.status} (Provider: ${r.databases.main.provider})`);
    console.log(`    - Auth DB Status: ${r.databases.auth.status} (Provider: ${r.databases.auth.provider})`);
    console.log(`    - Storage Availability: ${r.storageSummary.hasLiveStorage ? "Live PostgreSQL" : "Unavailable (Reported transparently)"}`);
    console.log(`    - Registered Tables Count: ${r.tables.length}`);
  } else {
    console.error(`  ✗ FAILED: Admin report error:`, adminData);
    process.exit(1);
  }

  // Test 4: On-demand connection test
  console.log("\n[Test 4] Testing On-Demand Connection Test POST /api/admin/database-status:");
  const testPingRes = await fetch(`${BASE_URL}/api/admin/database-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({ target: "main" }),
  });
  const testPingData = await testPingRes.json();
  if (testPingRes.status === 200 && testPingData.success && testPingData.result) {
    console.log(`  ✓ CONNECTION TEST [MAIN DB] -> Returned status: "${testPingData.result.status}"`);
  } else {
    console.error("  ✗ FAILED: Connection ping error:", testPingData);
    process.exit(1);
  }

  // Test 5: Records listing
  console.log("\n[Test 5] Testing Records Query GET /api/admin/database-status/records:");
  const recRes = await fetch(`${BASE_URL}/api/admin/database-status/records?table=appointments`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const recData = await recRes.json();
  if (recRes.status === 200 && recData.success && Array.isArray(recData.records)) {
    console.log(`  ✓ RECORDS RETRIEVED -> ${recData.count} appointments loaded for table preview`);
  } else {
    console.error("  ✗ FAILED: Records fetch error:", recData);
    process.exit(1);
  }

  // Test 6: RBAC Export Protection - Staff should be rejected with 403
  console.log("\n[Test 6] Testing Export RBAC Enforcement (Staff Attempt):");
  const staffExportRes = await fetch(`${BASE_URL}/api/admin/database-status/export?table=patients&format=csv`, {
    headers: { Cookie: `next-auth.session-token=${staffToken}` },
  });
  if (staffExportRes.status === 403) {
    console.log("  ✓ BLOCKED [STAFF EXPORT] -> Rejected with HTTP 403 Forbidden");
  } else {
    console.error(`  ✗ FAILED: Expected 403, got ${staffExportRes.status}`);
    process.exit(1);
  }

  // Test 7: Export as Admin -> CSV with privacy warning header
  console.log("\n[Test 7] Testing Export by Clinic Owner (Admin):");
  const adminExportRes = await fetch(`${BASE_URL}/api/admin/database-status/export?table=patients&format=csv`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const privacyHeader = adminExportRes.headers.get("x-privacy-warning");
  const contentType = adminExportRes.headers.get("content-type");
  if (adminExportRes.status === 200 && contentType.includes("text/csv") && privacyHeader) {
    console.log(`  ✓ EXPORT GENERATED [ADMIN] -> HTTP 200 OK (Content-Type: ${contentType})`);
    console.log(`    - Privacy Header: "${privacyHeader}"`);
  } else {
    console.error(`  ✗ FAILED: Admin export error status: ${adminExportRes.status}`);
    process.exit(1);
  }

  // Test 8: Safeguard against accidental record deletion (must type DELETE)
  console.log("\n[Test 8] Testing Deletion Safeguard (Without 'DELETE' string):");
  const unsafeDelRes = await fetch(`${BASE_URL}/api/admin/database-status/records`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      table: "appointments",
      recordId: "APT-849101",
      confirmation: "CONFIRM_ACCIDENTAL",
    }),
  });
  const unsafeDelData = await unsafeDelRes.json();
  if (unsafeDelRes.status === 400 && unsafeDelData.success === false) {
    console.log(`  ✓ SAFEGUARD ENFORCED -> Rejected with HTTP 400: "${unsafeDelData.message}"`);
  } else {
    console.error("  ✗ FAILED: Deletion allowed without 'DELETE' keyword!", unsafeDelData);
    process.exit(1);
  }

  // Test 9: Staff attempting permanent deletion -> 403 Forbidden
  console.log("\n[Test 9] Testing Deletion RBAC (Staff Attempt):");
  const staffDelRes = await fetch(`${BASE_URL}/api/admin/database-status/records`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${staffToken}`,
    },
    body: JSON.stringify({
      table: "appointments",
      recordId: "APT-849101",
      confirmation: "DELETE",
    }),
  });
  const staffDelData = await staffDelRes.json();
  if (staffDelRes.status === 403 && staffDelData.success === false) {
    console.log(`  ✓ FORBIDDEN [STAFF DELETION] -> Rejected with HTTP 403: "${staffDelData.message}"`);
  } else {
    console.error("  ✗ FAILED: Expected 403 for staff deletion attempt", staffDelData);
    process.exit(1);
  }

  // Test 10: Admin controlled deletion of test appointment
  console.log("\n[Test 10] Testing Safe Controlled Deletion by Admin:");
  // First, create a temporary test appointment
  const createAptRes = await fetch(`${BASE_URL}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "TestDelete Patient",
      phone: "+91 99999 11111",
      email: "test.delete@example.com",
      preferredDate: "2026-09-30",
      timeRange: "Morning (9:30 AM - 1:00 PM)",
      notes: "Temporary test appointment for deletion verification",
    }),
  });
  const createAptData = await createAptRes.json();
  const testAptId = createAptData.appointment?.id;
  console.log(`  Created temporary test record: ID ${testAptId}`);

  if (testAptId) {
    const adminDelRes = await fetch(`${BASE_URL}/api/admin/database-status/records`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${adminToken}`,
      },
      body: JSON.stringify({
        table: "appointments",
        recordId: testAptId,
        confirmation: "DELETE",
      }),
    });
    const adminDelData = await adminDelRes.json();
    if (adminDelRes.status === 200 && adminDelData.success) {
      console.log(`  ✓ PERMANENTLY DELETED [ADMIN] -> ${adminDelData.message}`);
    } else {
      console.error("  ✗ FAILED to delete test appointment:", adminDelData);
      process.exit(1);
    }
  }

  // Test 11: Settings page renders with Database Status section
  console.log("\n[Test 11] Testing Settings Page Render with Database Status Section:");
  const settingsRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const settingsHtml = await settingsRes.text();
  if (settingsRes.status === 200 && settingsHtml.includes("database-status")) {
    console.log("  ✓ SETTINGS PAGE VERIFIED -> Section #database-status rendered in HTML");
  } else {
    console.error("  ✗ FAILED: Settings page did not include database-status section");
    process.exit(1);
  }

  console.log("\n===============================================================");
  console.log("  🎉 ALL 11 DATABASE & SYSTEM STATUS CHECKS PASSED (11/11)     ");
  console.log("===============================================================\n");
}

runDatabaseStatusTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
