import { encode } from "next-auth/jwt";

const secret =
  process.env.NEXTAUTH_SECRET ||
  "super-secret-clinic-auth-token-for-dev-session-key-32-chars-min";

const BASE_URL = "http://localhost:3000";

async function runStorageManagementTests() {
  console.log("==========================================================================");
  console.log("  DATABASE STORAGE MANAGEMENT & DATA RETENTION VERIFICATION SUITE       ");
  console.log("==========================================================================\n");

  const adminToken = await encode({
    token: {
      id: "admin-owner-id",
      name: "Clinic Owner",
      email: "applei74740@gmail.com",
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

  // Test 1: Unauthorized access
  console.log("[Test 1] Testing Unauthorized Access to Storage Management API:");
  const unauthRes = await fetch(`${BASE_URL}/api/admin/storage-management`);
  if (unauthRes.status === 401) {
    console.log("  ✓ REJECTED [UNAUTHORIZED] -> HTTP 401 (Authentication required)");
  } else {
    console.error(`  ✗ FAILED: Expected 401, got ${unauthRes.status}`);
    process.exit(1);
  }

  // Test 2: Staff view access
  console.log("\n[Test 2] Testing Staff Access to GET /api/admin/storage-management:");
  const staffGetRes = await fetch(`${BASE_URL}/api/admin/storage-management`, {
    headers: { Cookie: `next-auth.session-token=${staffToken}` },
  });
  const staffGetData = await staffGetRes.json();
  if (
    staffGetRes.status === 200 &&
    staffGetData.success &&
    staffGetData.role === "STAFF" &&
    staffGetData.isAdmin === false
  ) {
    console.log("  ✓ PERMITTED [STAFF VIEW-ONLY] -> HTTP 200 (role: STAFF, isAdmin: false)");
    console.log(`    - Storage used: ${staffGetData.metrics.storageUsedMb} MB / ${staffGetData.metrics.storageLimitMb} MB (${staffGetData.metrics.usagePercent}%)`);
    console.log(`    - Warning level: ${staffGetData.metrics.warningLevel} (${staffGetData.metrics.warningMessage})`);
  } else {
    console.error("  ✗ FAILED: Staff access error:", staffGetData);
    process.exit(1);
  }

  // Test 3: Staff forbidden from modifying settings
  console.log("\n[Test 3] Testing Staff Access to POST /api/admin/storage-management (Settings Change):");
  const staffPostRes = await fetch(`${BASE_URL}/api/admin/storage-management`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${staffToken}`,
    },
    body: JSON.stringify({
      autoArchiveEnabled: true,
      thresholdPercent: 80,
    }),
  });
  if (staffPostRes.status === 403) {
    console.log("  ✓ FORBIDDEN [RBAC ENFORCED] -> HTTP 403 (Staff cannot modify storage retention settings)");
  } else {
    console.error(`  ✗ FAILED: Expected 403, got ${staffPostRes.status}`);
    process.exit(1);
  }

  // Test 4: Admin full access to metrics, config, tables, and query catalog
  console.log("\n[Test 4] Testing Admin GET /api/admin/storage-management:");
  const adminGetRes = await fetch(`${BASE_URL}/api/admin/storage-management`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const adminGetData = await adminGetRes.json();
  if (adminGetRes.status === 200 && adminGetData.success && adminGetData.isAdmin === true) {
    console.log("  ✓ PERMITTED [ADMIN FULL ACCESS] -> HTTP 200 OK");
    console.log(`    - Storage: ${adminGetData.metrics.storageUsedMb} MB used / ${adminGetData.metrics.storageLimitMb} MB quota`);
    console.log(`    - Status: ${adminGetData.metrics.warningLevel} (${adminGetData.metrics.warningMessage})`);
    console.log(`    - Tables reported: ${adminGetData.tableBreakdown.length} tables`);
    console.log(`    - Queries in catalog: ${adminGetData.queriesCatalog.length} database queries`);
    console.log(`    - Forecast: ${adminGetData.forecast.hasForecast ? adminGetData.forecast.monthsUntilLimit + " months until limit" : adminGetData.forecast.message}`);
  } else {
    console.error("  ✗ FAILED: Admin get error:", adminGetData);
    process.exit(1);
  }

  // Test 5: Verify Query Catalog contains critical production queries
  console.log("\n[Test 5] Verifying Query Catalog ('show all database related quary'):");
  adminGetData.queriesCatalog.forEach((q, i) => {
    console.log(`    ${i + 1}. [${q.safetyLevel.toUpperCase()}] ${q.title} (${q.category})`);
  });
  if (adminGetData.queriesCatalog.length >= 8) {
    console.log(`  ✓ Complete query catalog available (${adminGetData.queriesCatalog.length} queries) for admin inspection and auditing`);
  } else {
    console.error("  ✗ FAILED: Query catalog missing expected queries");
    process.exit(1);
  }

  // Test 6: Verify Patient Records Protection rule
  console.log("\n[Test 6] Verifying Patient Protection Rule (Cannot auto-prune patients):");
  const patientTable = adminGetData.tableBreakdown.find((t) => t.table === "patients");
  if (patientTable && patientTable.isProtected && patientTable.retention.includes("Protected")) {
    console.log("  ✓ PROTECTED: Patient table marked 'Forever (Protected)', Auto Cleanup OFF, locked from automated deletion");
  } else {
    console.error("  ✗ FAILED: Patient table is not protected:", patientTable);
    process.exit(1);
  }

  // Test 7: Preview candidate records for cleanup
  console.log("\n[Test 7] Testing POST /api/admin/storage-management/preview:");
  const previewRes = await fetch(`${BASE_URL}/api/admin/storage-management/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      dataType: "appointments",
      useConfigRetention: true,
    }),
  });
  const previewData = await previewRes.json();
  if (previewRes.status === 200 && previewData.success) {
    console.log(`  ✓ PREVIEW SUCCEEDED -> Found ${previewData.recordsFound} eligible records`);
    console.log(`    - Estimated storage: ${previewData.estimatedStorageMb} MB`);
    console.log(`    - Sample records returned: ${previewData.previewRecords.length}`);
  } else {
    console.error("  ✗ FAILED: Preview error:", previewData);
    process.exit(1);
  }

  // Test 8: Attempt Deletion without typing 'DELETE'
  console.log("\n[Test 8] Testing Archive & Delete safety guard (Without 'DELETE' confirmation):");
  const badDeleteRes = await fetch(`${BASE_URL}/api/admin/storage-management/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      dataType: "whatsapp_bookings",
      deleteAfterArchive: true,
      confirmation: "YES", // Invalid! Must be exact "DELETE"
    }),
  });
  const badDeleteData = await badDeleteRes.json();
  if (badDeleteRes.status === 400 && badDeleteData.message?.includes("DELETE")) {
    console.log("  ✓ BLOCKED [SAFETY ENFORCED] -> Refused deletion without exact 'DELETE' confirmation keyword");
  } else {
    console.error("  ✗ FAILED: Expected rejection without 'DELETE':", badDeleteData);
    process.exit(1);
  }

  // Test 9: Atomic Archive Execution: BACKUP -> VERIFY -> PRUNE -> AUDIT
  console.log("\n[Test 9] Testing Atomic Archive & Safe Cleanup (BACKUP -> VERIFY -> PRUNE):");
  const archiveRes = await fetch(`${BASE_URL}/api/admin/storage-management/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      dataType: "whatsapp_bookings",
      deleteAfterArchive: false, // create and verify archive without hard purge in test
      confirmation: "DELETE",
    }),
  });
  const archiveData = await archiveRes.json();
  if (archiveRes.status === 200 && archiveData.success && archiveData.result) {
    const r = archiveData.result;
    console.log("  ✓ ARCHIVE SUCCEEDED ->");
    console.log(`    - Archive ID: ${r.archiveId}`);
    console.log(`    - Records Archived: ${r.recordsArchived}`);
    console.log(`    - Verification Status: ${r.verified ? "VERIFIED (Checksum & Size Valid)" : "UNVERIFIED"}`);
    console.log(`    - Records Deleted: ${r.recordsDeleted}`);
    console.log(`    - Status: ${r.status}`);
  } else {
    console.error("  ✗ FAILED: Archive creation error:", archiveData);
    process.exit(1);
  }

  const createdArchiveId = archiveData.result.archiveId;

  // Test 10: Secure Download with Healthcare Data Privacy Headers
  console.log(`\n[Test 10] Testing Archive Download /api/admin/storage-management/download/${createdArchiveId}:`);
  const downloadRes = await fetch(`${BASE_URL}/api/admin/storage-management/download/${createdArchiveId}?format=json`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  if (downloadRes.status === 200) {
    const cacheControl = downloadRes.headers.get("Cache-Control");
    const pragma = downloadRes.headers.get("Pragma");
    const contentDisp = downloadRes.headers.get("Content-Disposition");
    const fileContent = await downloadRes.text();
    console.log(`  ✓ DOWNLOAD SUCCEEDED -> Status 200`);
    console.log(`    - Cache-Control: ${cacheControl}`);
    console.log(`    - Pragma: ${pragma}`);
    console.log(`    - Content-Disposition: ${contentDisp}`);
    console.log(`    - File size: ${fileContent.length} bytes`);
    if (cacheControl?.includes("no-store") && pragma === "no-cache") {
      console.log("  ✓ Healthcare data privacy protection headers verified (no-store, no-cache)");
    } else {
      console.error("  ✗ FAILED: Missing privacy headers");
      process.exit(1);
    }
  } else {
    console.error(`  ✗ FAILED: Download returned ${downloadRes.status}`);
    process.exit(1);
  }

  // Test 11: Scheduled Cron Endpoint /api/cron/storage-cleanup
  console.log("\n[Test 11] Testing Scheduled Cron /api/cron/storage-cleanup:");
  const cronRes = await fetch(`${BASE_URL}/api/cron/storage-cleanup`);
  const cronData = await cronRes.json();
  if (cronRes.status === 200 && cronData.success) {
    console.log("  ✓ CRON COMPLETED -> Status 200 OK");
    console.log(`    - Action: ${cronData.action}`);
    console.log(`    - Storage Usage: ${cronData.usagePercent}% (Threshold: ${cronData.thresholdPercent}%)`);
    console.log(`    - Reason / Status: ${cronData.reason || cronData.action}`);
  } else {
    console.error("  ✗ FAILED: Cron error:", cronData);
    process.exit(1);
  }

  // Test 12: Admin Updates Retention Settings
  console.log("\n[Test 12] Testing Admin POST /api/admin/storage-management (Save Retention Settings):");
  const saveRes = await fetch(`${BASE_URL}/api/admin/storage-management`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      autoArchiveEnabled: true,
      autoCleanupEnabled: false,
      thresholdPercent: 85,
      cleanupFrequency: "weekly",
      retentionPolicies: {
        appointments: "1_YEAR",
        whatsapp_bookings: "60_DAYS",
        system_logs: "30_DAYS",
      },
    }),
  });
  const saveData = await saveRes.json();
  if (saveRes.status === 200 && saveData.success && saveData.config) {
    console.log("  ✓ SETTINGS SAVED -> HTTP 200 OK");
    console.log(`    - Auto Archive: ${saveData.config.autoArchiveEnabled}`);
    console.log(`    - Threshold: ${saveData.config.thresholdPercent}%`);
    console.log(`    - Appointments Retention: ${saveData.config.retentionPolicies.appointments}`);
  } else {
    console.error("  ✗ FAILED: Save settings error:", saveData);
    process.exit(1);
  }

  // Test 13: Protected Patients Cannot Be Targeted For Deletion
  console.log("\n[Test 13] Testing Rejection of Patient Table Deletion Attempt:");
  const patientDeleteRes = await fetch(`${BASE_URL}/api/admin/storage-management/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      dataType: "patients",
      deleteAfterArchive: true,
      confirmation: "DELETE",
    }),
  });
  const patientDeleteData = await patientDeleteRes.json();
  if (patientDeleteRes.status === 400 && patientDeleteData.message?.toLowerCase().includes("patient")) {
    console.log("  ✓ BLOCKED [PATIENT DATA PROTECTED] -> System refused automated deletion of patient records");
    console.log(`    - Guard Message: "${patientDeleteData.message}"`);
  } else {
    console.error("  ✗ FAILED: Patient deletion was not rejected properly:", patientDeleteData);
    process.exit(1);
  }

  console.log("\n==========================================================================");
  console.log("  ALL 13 STORAGE MANAGEMENT & RETENTION TESTS PASSED PERFECTLY!            ");
  console.log("==========================================================================");
}

runStorageManagementTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
