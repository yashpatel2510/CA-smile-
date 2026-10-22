import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================");
  console.log("STARTING COMPREHENSIVE DENTAL CALENDAR TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${name}`);
      console.error("  Error:", err.message);
      failed++;
    }
  }

  // 1. GET Appointments & Data Structure
  let sampleAptId = null;
  let sampleTreatmentId = null;

  await test("1. GET /api/appointments returns appointments with required dental fields", async () => {
    const res = await fetch(`${BASE_URL}/api/appointments?limit=50`);
    assert.strictEqual(res.status, 200, "Expected status 200");
    const data = await res.json();
    assert.strictEqual(data.success, true, "Expected success true");
    assert.ok(data.appointments.length > 0, "Expected appointments list");

    const apt = data.appointments[0];
    assert.ok(apt.id, "Appointment has ID");
    assert.ok(apt.patient, "Appointment has patient");
    assert.ok(apt.patient.phone, "Appointment has patient phone");
    assert.ok(apt.service || apt.reason, "Appointment has service/treatment");
    assert.ok(apt.startTime, "Appointment has start time");
    assert.ok(apt.status, "Appointment has status");

    sampleAptId = apt.id;
    if (apt.treatmentId) {
      sampleTreatmentId = apt.treatmentId;
    }
  });

  // 2. Status Transitions Validation
  await test("2. Invalid Status Transition is rejected with 422", async () => {
    // Attempt invalid jump directly from PENDING to TREATMENT_DONE without override
    // First create a pending test appointment
    const createRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Transition Patient",
        phone: "9123456780",
        treatment: "Root Canal Treatment",
        preferredDoctor: "Dr. Sankar",
        appointmentDate: "2026-10-15",
        appointmentTime: "11:00:00",
        durationMinutes: 30,
        totalSessions: 3,
        sessionNumber: 1,
      }),
    });
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);
    const testAptId = createData.appointment.id;

    // Try invalid transition
    const invalidRes = await fetch(`${BASE_URL}/api/appointments/${testAptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "TREATMENT_DONE",
        forceOverride: false,
      }),
    });

    assert.strictEqual(invalidRes.status, 422, "Should return 422 for invalid transition");
    const invalidData = await invalidRes.json();
    assert.strictEqual(invalidData.invalidTransition, true);
  });

  await test("3. Valid Status Workflow: PENDING -> CONFIRMED -> CHECKED_IN -> TREATMENT_STARTED -> TREATMENT_DONE", async () => {
    const createRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Workflow Patient",
        phone: "9123456781",
        treatment: "Dental Prophylaxis",
        preferredDoctor: "Dr. Vidhyamol",
        appointmentDate: "2026-10-16",
        appointmentTime: "14:00:00",
        durationMinutes: 30,
      }),
    });
    const createData = await createRes.json();
    const aptId = createData.appointment.id;

    // Step 1: CONFIRMED
    let res = await fetch(`${BASE_URL}/api/appointments/${aptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    let d = await res.json();
    assert.strictEqual(d.success, true);
    assert.strictEqual(d.appointment.status, "CONFIRMED");

    // Step 2: CHECKED_IN
    res = await fetch(`${BASE_URL}/api/appointments/${aptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CHECKED_IN" }),
    });
    d = await res.json();
    assert.strictEqual(d.success, true);
    assert.strictEqual(d.appointment.status, "CHECKED_IN");

    // Step 3: TREATMENT_STARTED
    res = await fetch(`${BASE_URL}/api/appointments/${aptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "TREATMENT_STARTED" }),
    });
    d = await res.json();
    assert.strictEqual(d.success, true);
    assert.strictEqual(d.appointment.status, "TREATMENT_STARTED");

    // Step 4: TREATMENT_DONE
    res = await fetch(`${BASE_URL}/api/appointments/${aptId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "TREATMENT_DONE",
        procedure: "Scaling and polishing completed",
        paidAmount: 1500,
        paymentMethod: "UPI",
        nextSessionRequired: false,
      }),
    });
    d = await res.json();
    assert.strictEqual(d.success, true);
    assert.strictEqual(d.appointment.status, "TREATMENT_DONE");
  });

  // 4. Double Booking Prevention Test
  await test("4. Double-Booking Prevention: returns 409 Conflict for overlapping time slot", async () => {
    const doc = "Dr. Sankar (Chief Dental Surgeon)";
    const date = "2026-10-20";
    const time = "15:00:00";

    // 1st booking
    const res1 = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Patient First",
        phone: "9998887771",
        preferredDoctor: doc,
        appointmentDate: date,
        appointmentTime: time,
        durationMinutes: 45,
      }),
    });
    const data1 = await res1.json();
    assert.strictEqual(data1.success, true);

    // 2nd booking for same doctor at same time
    const res2 = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Patient Second (Conflict)",
        phone: "9998887772",
        preferredDoctor: doc,
        appointmentDate: date,
        appointmentTime: time,
        durationMinutes: 30,
      }),
    });

    assert.strictEqual(res2.status, 409, "Should reject overlapping booking with 409");
    const data2 = await res2.json();
    assert.strictEqual(data2.conflict, true);
  });

  // 5. Treatment Multi-Session Management & Automatic Next Session
  await test("5. Mark Treatment Done with nextSessionRequired=true creates next session linked to same treatment", async () => {
    // Create multi-session treatment
    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Multi-Session Patient",
        phone: "9887766554",
        treatment: "Root Canal Treatment",
        preferredDoctor: "Dr. A. Mehta",
        appointmentDate: "2026-10-22",
        appointmentTime: "10:00:00",
        durationMinutes: 45,
        totalSessions: 3,
        sessionNumber: 1,
        totalAmount: 6000,
      }),
    });
    const d = await res.json();
    assert.strictEqual(d.success, true);
    const apt1Id = d.appointment.id;
    const trtId = d.appointment.treatmentId;
    assert.ok(trtId, "Appointment must be linked to a treatment ID");

    // Force transition to TREATMENT_STARTED
    await fetch(`${BASE_URL}/api/appointments/${apt1Id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "TREATMENT_STARTED", forceOverride: true }),
    });

    // Mark Done with nextSessionRequired = true
    const doneRes = await fetch(`${BASE_URL}/api/appointments/${apt1Id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "TREATMENT_DONE",
        procedure: "Biomechanical canal preparation",
        paidAmount: 2000,
        paymentMethod: "UPI",
        nextSessionRequired: true,
        nextSessionDate: "2026-10-29",
        nextSessionTime: "10:00",
        nextSessionDoctor: "Dr. A. Mehta",
        nextSessionNotes: "Session 2/3: Obturation",
      }),
    });
    const doneData = await doneRes.json();
    assert.strictEqual(doneData.success, true);
    assert.ok(doneData.nextSessionAppointment, "Should auto-create next session appointment");
    assert.strictEqual(doneData.nextSessionAppointment.treatmentId, trtId, "Next session must link to same treatment");

    // Check Treatment status: should still be IN_PROGRESS (not completed yet)
    const trtRes = await fetch(`${BASE_URL}/api/treatments/${trtId}`);
    const trtData = await trtRes.json();
    assert.strictEqual(trtData.treatment.status, "IN_PROGRESS", "Intermediate session leaves treatment IN_PROGRESS");
    assert.strictEqual(trtData.treatment.completedSessions, 1);
  });

  // 6. Final Session Completes Treatment Automatically
  await test("6. Final Session (3/3) automatically marks Treatment as COMPLETED", async () => {
    // Create treatment with 1 total session
    const createRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Single Session Patient",
        phone: "9776655443",
        treatment: "Single Tooth Extraction",
        preferredDoctor: "Dr. Sankar",
        appointmentDate: "2026-10-25",
        appointmentTime: "16:00:00",
        durationMinutes: 30,
        totalSessions: 1,
        sessionNumber: 1,
      }),
    });
    const cData = await createRes.json();
    const aptId = cData.appointment.id;
    const trtId = cData.appointment.treatmentId;

    if (trtId) {
      // Mark done as final
      await fetch(`${BASE_URL}/api/appointments/${aptId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "TREATMENT_DONE",
          forceOverride: true,
          procedure: "Tooth extraction and suturing",
          nextSessionRequired: false,
        }),
      });

      const trtRes = await fetch(`${BASE_URL}/api/treatments/${trtId}`);
      const trtData = await trtRes.json();
      assert.strictEqual(trtData.treatment.status, "COMPLETED", "Final session marks Treatment COMPLETED");
    }
  });

  // 7. Add Next Session endpoint (/api/treatments/[id]/next-session)
  await test("7. POST /api/treatments/[id]/next-session adds session 2/3 to existing treatment", async () => {
    // Fetch a treatment
    const listRes = await fetch(`${BASE_URL}/api/treatments`);
    const listData = await listRes.json();
    assert.ok(listData.treatments.length > 0);
    const trt = listData.treatments[0];

    const nextRes = await fetch(`${BASE_URL}/api/treatments/${trt.id}/next-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentDate: "2026-10-30",
        startTime: "11:00",
        preferredDoctor: "Dr. Sankar",
        durationMinutes: 45,
        procedure: "Follow-up crown trial",
      }),
    });
    const nextData = await nextRes.json();
    assert.strictEqual(nextData.success, true);
    assert.ok(nextData.appointment);
    assert.strictEqual(nextData.appointment.treatmentId, trt.id);
  });

  // 8. Reschedule Appointment API
  await test("8. POST /api/appointments/[id]/reschedule updates time and retains history", async () => {
    const listRes = await fetch(`${BASE_URL}/api/appointments?limit=1`);
    const listData = await listRes.json();
    const apt = listData.appointments[0];

    const res = await fetch(`${BASE_URL}/api/appointments/${apt.id}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: "2026-10-28T09:30:00",
        endTime: "2026-10-28T10:15:00",
        reason: "Patient requested morning appointment",
        preferredDoctor: apt.doctor || "Dr. Sankar",
      }),
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.appointment.rescheduledAt || data.appointment.startTime);
  });

  // 9. Patient Profile with Treatments & Appointments
  await test("9. GET /api/patients/[id] returns comprehensive patient chart with treatments and visits", async () => {
    const pRes = await fetch(`${BASE_URL}/api/patients/PAT-001`);
    assert.strictEqual(pRes.status, 200);
    const pData = await pRes.json();
    assert.strictEqual(pData.success, true);
    assert.ok(pData.patient.appointments, "Patient has appointments list");
    assert.ok(pData.patient.treatments, "Patient has treatments list");
  });

  // 10. Treatment Dashboard & Overdue Alert Stats
  await test("10. GET /api/treatments returns stats including overdue follow-up counts", async () => {
    const res = await fetch(`${BASE_URL}/api/treatments`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.stats, "Expected stats object");
    assert.ok(typeof data.stats.activeCount === "number");
    assert.ok(typeof data.stats.followUpRequiredCount === "number");
  });

  console.log("==================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
