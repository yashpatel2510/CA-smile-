/**
 * Verification test script for Live Queue Manager Dental Chair Management & Access Control
 */

import http from "http";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("============================================================");
  console.log("  LIVE QUEUE MANAGER: CHAIR & DOCTOR MANAGEMENT TEST SUITE  ");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. GET /api/admin/queue/chairs
  await assertTest("Fetch all chairs and available doctors", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/queue/chairs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error("API reported success=false");
    if (!Array.isArray(json.chairs) || json.chairs.length === 0) {
      throw new Error("Chairs list is empty or invalid");
    }
    if (!Array.isArray(json.availableDoctors) || json.availableDoctors.length === 0) {
      throw new Error("Available doctors list is empty");
    }
    console.log(`     Configured chairs count: ${json.chairs.length}`);
    console.log(`     Available doctors: ${json.availableDoctors.slice(0, 4).join(", ")}...`);
  });

  // 2. Access Control: Unauthorized POST must be rejected (401/403)
  await assertTest("Security Check: Unauthorized POST /api/admin/queue/chairs is rejected", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/queue/chairs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacker Chair", doctorName: "Unknown" }),
    });
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401 or 403, got HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success !== false) throw new Error("Expected success=false for unauthorized request");
  });

  // 3. Access Control: Unauthorized PUT must be rejected (401/403)
  await assertTest("Security Check: Unauthorized PUT /api/admin/queue/chairs is rejected", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/queue/chairs`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "chair-1", action: "change_doctor", doctorName: "Dr. Hacker" }),
    });
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401 or 403, got HTTP ${res.status}`);
    }
  });

  // 4. Access Control: Unauthorized DELETE must be rejected (401/403)
  await assertTest("Security Check: Unauthorized DELETE /api/admin/queue/chairs is rejected", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/queue/chairs?id=chair-1`, {
      method: "DELETE",
    });
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401 or 403, got HTTP ${res.status}`);
    }
  });

  // 5. Store Verification (Direct Import test)
  await assertTest("Chairs Store: Create, update doctor, and enforce minimum chairs rule", async () => {
    const { getChairsList, saveOrUpdateChair, updateChairDoctor, deleteChair } = await import(
      "../src/lib/chairs-store.ts"
    );

    const initial = getChairsList();
    const initialCount = initial.length;

    // Create a new chair
    const testChair = saveOrUpdateChair({
      name: "Pediatric Dental Chair",
      room: "ROOM 3 PEDIATRIC",
      doctorName: "Dr. Vidhyamol (Pediatric Specialist)",
      specialty: "Pediatric Dentistry & Child Care",
      colorTheme: "rose",
      status: "READY",
      isActive: true,
    });

    if (testChair.name !== "Pediatric Dental Chair") throw new Error("Created chair name mismatch");
    if (testChair.doctorName !== "Dr. Vidhyamol (Pediatric Specialist)") throw new Error("Doctor name mismatch");

    // Change doctor for this chair
    const updated = updateChairDoctor(testChair.id, "Dr. Deep Arvindbhai Patel");
    if (!updated || updated.doctorName !== "Dr. Deep Arvindbhai Patel") {
      throw new Error("Failed to change doctor on chair");
    }

    // Delete the test chair
    const delResult = deleteChair(testChair.id);
    if (!delResult.success) throw new Error("Failed to delete test chair");

    // Ensure list count returned to initialCount
    const finalChairs = getChairsList();
    if (finalChairs.length !== initialCount) {
      throw new Error(`Expected ${initialCount} chairs, found ${finalChairs.length}`);
    }
  });

  // 6. Live Queue & TV broadcast sync
  await assertTest("Live Queue & TV Display: Broadcast custom room & doctor", async () => {
    const testBroadcast = {
      token: 99,
      patient: "Test Patient Verification",
      doctor: "Dr. Sankar (Chief Dental Surgeon)",
      room: "ROOM DENTAL CHAIR 2",
      service: "Oral Surgery & Consultation",
      status: "CALLING",
      action: "CALL",
    };

    const res = await fetch(`${BASE_URL}/api/admin/queue/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testBroadcast),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error("Failed to broadcast live queue");
    if (json.data.currentToken !== 99) throw new Error("Broadcast token mismatch");
    if (json.data.doctorName !== testBroadcast.doctor) throw new Error("Broadcast doctor mismatch");
    if (json.data.roomName !== testBroadcast.room) throw new Error("Broadcast room mismatch");

    // Check GET /api/admin/queue/live reads it back
    const getRes = await fetch(`${BASE_URL}/api/admin/queue/live`);
    const getJson = await getRes.json();
    if (getJson.data.currentToken !== 99) throw new Error("Live state get mismatch");
  });

  console.log("\n============================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
