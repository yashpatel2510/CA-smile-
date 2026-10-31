import assert from "node:assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("==================================================");
  console.log("TESTING PATIENTS ENDPOINT & FLOW RELIABILITY");
  console.log("==================================================");

  // 1. Initial GET /api/patients
  console.log("\n[1/6] Fetching all patients...");
  const t0 = Date.now();
  const res1 = await fetch(`${BASE_URL}/api/patients`);
  const elapsed1 = Date.now() - t0;
  assert.strictEqual(res1.status, 200, `Expected 200, got ${res1.status}`);
  const data1 = await res1.json();
  assert.strictEqual(data1.success, true, "Expected success to be true");
  assert(Array.isArray(data1.patients), "Expected patients array");
  const initialCount = data1.count;
  console.log(`✓ Fetched ${initialCount} patients in ${elapsed1}ms`);
  assert(initialCount >= 20, `Expected at least 20 patients in database, found ${initialCount}`);

  // Check structure of first patient
  const p0 = data1.patients[0];
  assert(p0.id, "Patient missing id");
  assert(p0.name, "Patient missing name");
  assert(p0.phone, "Patient missing phone");
  assert(p0.patientCode, "Patient missing patientCode");
  console.log(`✓ First patient sample: ${p0.name} (${p0.phone}, #${p0.patientCode})`);

  // 2. Rapid succession calls to test count stability (no count decrease)
  console.log("\n[2/6] Testing count stability across 10 rapid queries...");
  for (let i = 1; i <= 10; i++) {
    const r = await fetch(`${BASE_URL}/api/patients`);
    const d = await r.json();
    assert.strictEqual(d.count, initialCount, `Query ${i}: Count changed from ${initialCount} to ${d.count}!`);
  }
  console.log(`✓ All 10 rapid queries returned exact same stable count: ${initialCount} patients`);

  // 3. Search query test
  console.log("\n[3/6] Testing search query filter...");
  const searchName = p0.name.split(" ")[0];
  const resSearch = await fetch(`${BASE_URL}/api/patients?search=${encodeURIComponent(searchName)}`);
  const dataSearch = await resSearch.json();
  assert(dataSearch.count > 0, "Expected search results");
  const match = dataSearch.patients.some(p => p.id === p0.id);
  assert(match, `Expected to find patient ${p0.id} in search results for "${searchName}"`);
  console.log(`✓ Search for "${searchName}" returned ${dataSearch.count} matching records`);

  // 4. Create new patient via POST /api/patients
  console.log("\n[4/6] Creating new test patient...");
  const testPhone = `99999${Math.floor(10000 + Math.random() * 90000)}`;
  const testPatientPayload = {
    firstName: "Automation",
    lastName: "Tester",
    phone: testPhone,
    gender: "female",
    dateOfBirth: "1994-06-15",
    bloodType: "O+",
    address: "Station Road, Bilimora",
    medicalNotes: "Routine dental test patient",
    source: "ADMIN"
  };

  const resPost = await fetch(`${BASE_URL}/api/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPatientPayload)
  });
  assert.strictEqual(resPost.status, 200, `POST failed with status ${resPost.status}`);
  const dataPost = await resPost.json();
  assert.strictEqual(dataPost.success, true);
  const createdPatient = dataPost.patient;
  assert(createdPatient?.id, "Created patient missing id");
  console.log(`✓ Created patient: ${createdPatient.firstName} ${createdPatient.lastName} (ID: ${createdPatient.id}, Phone: ${createdPatient.phone})`);

  // Verify total count increased by 1 and patient is present
  const resAfterAdd = await fetch(`${BASE_URL}/api/patients`);
  const dataAfterAdd = await resAfterAdd.json();
  assert.strictEqual(dataAfterAdd.count, initialCount + 1, `Expected count ${initialCount + 1}, got ${dataAfterAdd.count}`);
  const foundCreated = dataAfterAdd.patients.find(p => p.id === createdPatient.id || p.phone === testPhone);
  assert(foundCreated, "Newly created patient not found in /api/patients list!");
  console.log(`✓ Total patient count updated cleanly from ${initialCount} -> ${dataAfterAdd.count}`);

  // 5. Test PATCH /api/patients/:id
  console.log("\n[5/6] Updating patient via PATCH /api/patients/:id...");
  const resPatch = await fetch(`${BASE_URL}/api/patients/${encodeURIComponent(createdPatient.id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Automation Tester Updated",
      gender: "Female",
      bloodGroup: "AB+",
      medicalNotes: "Updated clinical test notes",
      patientType: "Adult"
    })
  });
  assert.strictEqual(resPatch.status, 200, `PATCH failed with status ${resPatch.status}`);
  const dataPatch = await resPatch.json();
  assert.strictEqual(dataPatch.success, true);
  console.log(`✓ Successfully updated patient: ${dataPatch.message}`);

  // 6. Cleanup test patient via DELETE /api/patients/:id
  console.log("\n[6/6] Cleaning up test patient...");
  const resDel = await fetch(`${BASE_URL}/api/patients/${encodeURIComponent(createdPatient.id)}`, {
    method: "DELETE"
  });
  assert.strictEqual(resDel.status, 200, `DELETE failed with status ${resDel.status}`);
  const dataDel = await resDel.json();
  assert.strictEqual(dataDel.success, true);
  console.log(`✓ Cleaned up test patient ${createdPatient.id}`);

  // Final check: count should return to original initialCount
  const resFinal = await fetch(`${BASE_URL}/api/patients`);
  const dataFinal = await resFinal.json();
  assert.strictEqual(dataFinal.count, initialCount, `Expected count to return to ${initialCount}, got ${dataFinal.count}`);
  console.log(`✓ Final verified patient count: ${dataFinal.count} (100% stable)`);

  console.log("\n==================================================");
  console.log("ALL PATIENT RELIABILITY TESTS PASSED WITH ZERO ERRORS!");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("\nTEST FAILED:", err);
  process.exit(1);
});
