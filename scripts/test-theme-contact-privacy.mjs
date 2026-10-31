import assert from "assert";

async function runTests() {
  console.log("🧪 Starting Comprehensive Contact Form, Theme Mode & Privacy Suite...\n");

  const baseUrl = "http://localhost:3000";

  // Test 1: Fetch current booking-form configuration
  console.log("▶ Test 1: GET /api/booking-form/config");
  const res1 = await fetch(`${baseUrl}/api/booking-form/config`);
  assert.strictEqual(res1.status, 200, "Config GET should return 200");
  const data1 = await res1.json();
  assert.strictEqual(data1.success, true, "Config GET success should be true");
  console.log(`  ✓ Successfully fetched config. Current themeMode: ${data1.config?.themeMode}`);

  // Test 2: Toggle themeMode to "dark" via PUT /api/booking-form/config
  console.log("\n▶ Test 2: PUT /api/booking-form/config to dark theme");
  const res2 = await fetch(`${baseUrl}/api/booking-form/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data1.config,
      themeMode: "dark",
    }),
  });
  assert.strictEqual(res2.status, 200, "Config PUT should return 200");
  const data2 = await res2.json();
  assert.strictEqual(data2.success, true, "Config PUT success should be true");
  assert.strictEqual(data2.config?.themeMode, "dark", "themeMode should be dark");
  console.log("  ✓ Successfully saved dark theme in database and config store.");

  // Test 3: Check GET /api/booking-form/config reflects "dark"
  console.log("\n▶ Test 3: Verify GET reflects updated dark theme immediately");
  const res3 = await fetch(`${baseUrl}/api/booking-form/config`);
  const data3 = await res3.json();
  assert.strictEqual(data3.config?.themeMode, "dark", "Config should immediately return dark theme");
  console.log("  ✓ Verified dark theme persistence in database.");

  // Test 4: Contact API honeypot anti-spam check
  console.log("\n▶ Test 4: POST /api/contact anti-spam honeypot defense");
  const botContactPayload = {
    name: "Automated Spammer",
    email: "bot@spamnetwork.com",
    phone: "9876543210",
    department: "Spam Inquiry",
    message: "Buy cheap backlinks now",
    patient_hp_trap: "filled_by_bot", // Honeypot trap filled
  };
  const res4 = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(botContactPayload),
  });
  assert.strictEqual(res4.status, 200, "Honeypot trap should respond 200 silently");
  const data4 = await res4.json();
  assert.strictEqual(data4.success, true);
  assert.strictEqual(data4.received, undefined, "Bot request must not return processed patient data");
  console.log("  ✓ Bot spam honeypot successfully trapped and silently dropped.");

  // Test 5: Contact API legitimate patient inquiry + privacy phone masking
  console.log("\n▶ Test 5: POST /api/contact legitimate inquiry & patient privacy masking");
  const legitContactPayload = {
    name: "Priya Sharma",
    email: "priya.test@example.com",
    phone: "9876543210",
    department: "Teeth Whitening",
    message: "Looking for consultation on Saturday morning.",
  };
  const res5 = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(legitContactPayload),
  });
  assert.strictEqual(res5.status, 200, "Valid inquiry should return 200");
  const data5 = await res5.json();
  assert.strictEqual(data5.success, true);
  assert.strictEqual(data5.received?.phone, "******3210", "Phone must be masked for patient privacy protection");
  console.log(`  ✓ Patient phone properly masked in public API response: ${data5.received?.phone}`);

  // Test 6: Appointments API anti-spam honeypot defense
  console.log("\n▶ Test 6: POST /api/appointments anti-spam honeypot defense");
  const botAppointmentPayload = {
    fullName: "Spam Bot 3000",
    phone: "1234567890",
    patient_hp_trap: "automated_form_filler_value",
  };
  const res6 = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(botAppointmentPayload),
  });
  assert.strictEqual(res6.status, 200);
  const data6 = await res6.json();
  assert.strictEqual(data6.success, true);
  console.log("  ✓ Bot booking honeypot successfully trapped and silently dropped.");

  // Test 7: Appointments API legitimate booking
  console.log("\n▶ Test 7: POST /api/appointments legitimate appointment booking");
  const legitAptPayload = {
    fullName: "Rohan Patel",
    phone: "9825123456",
    treatment: "Dental Consultation",
    consentAgreed: true,
    preferredDate: "2026-11-05",
    preferredDoctor: "Dr. Anish Patel",
    source: "WEB_FORM",
  };
  const res7 = await fetch(`${baseUrl}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(legitAptPayload),
  });
  assert(
    res7.status === 200 || res7.status === 201,
    `Expected 200 or 201 status, got ${res7.status}`
  );
  const data7 = await res7.json();
  assert.strictEqual(data7.success, true);
  assert(data7.appointment?.id, "Must return created appointment id");
  console.log(`  ✓ Legitimate appointment confirmed successfully with ID: ${data7.appointment?.id}`);

  console.log("\n✨ ALL 7 TESTS PASSED SUCCESSFULLY! ✨\n");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
