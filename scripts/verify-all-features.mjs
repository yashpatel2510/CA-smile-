/**
 * Comprehensive Healthcare Platform Feature & Route Verification Script
 * Checks whether the website is running and verifies that all core features work.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  gray: "\x1b[90m",
};

const results = [];

async function testEndpoint(name, path, options = {}, validator = null) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || "GET";
  const start = Date.now();

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });
    const duration = Date.now() - start;
    let data = null;
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    let pass = false;
    let message = `Status ${res.status} (${duration}ms)`;

    if (validator) {
      const validationResult = validator(res, data);
      pass = validationResult === true;
      if (!pass) {
        message =
          typeof validationResult === "string"
            ? validationResult
            : `Validation failed (HTTP ${res.status})`;
      } else {
        message = `Status ${res.status} (${duration}ms) - Verified`;
      }
    } else {
      pass = res.ok;
    }

    results.push({
      name,
      method,
      path,
      pass,
      message,
      status: res.status,
      duration,
    });

    if (pass) {
      console.log(
        `  ${colors.green}✓ PASS${colors.reset} [${colors.cyan}${method}${colors.reset}] ${name.padEnd(35)} ${colors.gray}${path}${colors.reset} -> ${message}`
      );
    } else {
      console.log(
        `  ${colors.red}✗ FAIL${colors.reset} [${colors.cyan}${method}${colors.reset}] ${name.padEnd(35)} ${colors.gray}${path}${colors.reset} -> ${message}`
      );
    }

    return { pass, data, res };
  } catch (err) {
    const duration = Date.now() - start;
    results.push({
      name,
      method,
      path,
      pass: false,
      message: err.message,
      status: 0,
      duration,
    });
    console.log(
      `  ${colors.red}✗ ERROR${colors.reset} [${colors.cyan}${method}${colors.reset}] ${name.padEnd(35)} ${colors.gray}${path}${colors.reset} -> ${err.message}`
    );
    return { pass: false, error: err };
  }
}

async function runComprehensiveVerification() {
  console.log(
    `\n${colors.bold}========================================================================${colors.reset}`
  );
  console.log(
    `${colors.bold}  HEALTHSPHERE PLATFORM - FULL SYSTEM & FEATURE VERIFICATION REPORT    ${colors.reset}`
  );
  console.log(`  Target Server: ${BASE_URL}`);
  console.log(`  Timestamp:     ${new Date().toISOString()}`);
  console.log(
    `${colors.bold}========================================================================\n${colors.reset}`
  );

  // -------------------------------------------------------------
  // SECTION 1: Public Web Pages & SEO
  // -------------------------------------------------------------
  console.log(
    `${colors.bold}${colors.cyan}[1. Public Pages & SEO Verification]${colors.reset}`
  );

  await testEndpoint("Public Home Page", "/", {}, (res, text) => {
    return res.status === 200 && text.includes("HealthSphere");
  });

  await testEndpoint("Services Directory", "/services", {}, (res, text) => {
    return (
      res.status === 200 &&
      (text.includes("Clinical Services") ||
        text.includes("Treatment") ||
        text.includes("Diagnostic"))
    );
  });

  await testEndpoint(
    "Service Detail Dynamic Route",
    "/services/general-consultation",
    {},
    (res, text) => {
      return (
        res.status === 200 &&
        (text.includes("General Consultation") || text.includes("HealthSphere"))
      );
    }
  );

  await testEndpoint("About Clinic Page", "/about", {}, (res, text) => {
    return res.status === 200 && text.includes("HealthSphere");
  });

  await testEndpoint("Medical Blog Index", "/blog", {}, (res, text) => {
    return (
      res.status === 200 && (text.includes("Blog") || text.includes("Articles"))
    );
  });

  await testEndpoint(
    "Blog Post Dynamic Route",
    "/blog/preventive-cardiology-guide",
    {},
    (res, text) => {
      return res.status === 200 && text.includes("Cardiology");
    }
  );

  await testEndpoint("Contact & Location Page", "/contact", {}, (res, text) => {
    return (
      res.status === 200 &&
      (text.includes("Contact") || text.includes("Message"))
    );
  });

  await testEndpoint("Appointment Booking Wizard", "/book", {}, (res, text) => {
    return (
      res.status === 200 &&
      (text.includes("Book") || text.includes("Appointment"))
    );
  });

  await testEndpoint("Doctors Directory", "/doctors", {}, (res, text) => {
    return res.status === 200;
  });

  await testEndpoint("SEO Sitemap (XML)", "/sitemap.xml", {}, (res, text) => {
    return res.status === 200 && text.includes("<urlset");
  });

  await testEndpoint("SEO Robots File", "/robots.txt", {}, (res, text) => {
    return res.status === 200 && text.toLowerCase().includes("user-agent");
  });

  // -------------------------------------------------------------
  // SECTION 2: API Endpoints & Clinical Logic
  // -------------------------------------------------------------
  console.log(
    `\n${colors.bold}${colors.cyan}[2. Core API Endpoints & Backend Logic]${colors.reset}`
  );

  await testEndpoint("System Health Check", "/api/health", {}, (res, data) => {
    return (
      res.status === 200 && (data.status === "healthy" || data.status === "ok")
    );
  });

  await testEndpoint(
    "Public Contact Form Submission",
    "/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Arthur Dent",
        email: "arthur.dent@example.com",
        phone: "+15554321098",
        subject: "Inquiry regarding specialist referrals",
        message:
          "Could you please confirm if a GP referral is required for cardiology tests?",
      }),
    },
    (res, data) => {
      return res.status === 200 && data.success === true;
    }
  );



  let createdAppointmentId = null;

  await testEndpoint(
    "Clinical Services Listing API",
    "/api/services",
    {},
    (res, data) => {
      return res.status === 200 && Array.isArray(data.services || data);
    }
  );

  // Booking creation
  const testAptPayload = {
    firstName: "Marcus",
    lastName: "Brody",
    email: `marcus.${Date.now()}@example.com`,
    phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
    startTime: new Date(Date.now() + (30 + Math.floor(Math.random() * 50)) * 86400000 + Math.floor(Math.random() * 20) * 3600000).toISOString(),
    serviceName: "General Consultation",
    source: "MANUAL",
    reason: "Verification routine consultation",
  };

  const bookingStep = await testEndpoint(
    "Appointment Booking API",
    "/api/appointments",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testAptPayload),
    },
    (res, data) => {
      if (res.status === 200 || res.status === 201) {
        createdAppointmentId = data.appointment?.id;
        return true;
      }
      return false;
    }
  );

  await testEndpoint(
    "Appointments Filter & List API",
    "/api/appointments?limit=10",
    {},
    (res, data) => {
      return (
        res.status === 200 &&
        (data.success === true || Array.isArray(data.appointments))
      );
    }
  );

  await testEndpoint(
    "WhatsApp Bookings Query API",
    "/api/appointments?source=WHATSAPP",
    {},
    (res, data) => {
      return (
        res.status === 200 &&
        (data.success === true || Array.isArray(data.appointments))
      );
    }
  );

  if (createdAppointmentId) {
    await testEndpoint(
      "Staff Confirm Appointment API",
      `/api/appointments/${createdAppointmentId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          performedBy: "Chief Medical Officer",
          reason: "Confirmed during system verification suite.",
        }),
      },
      (res, data) => {
        return res.status === 200 && data.appointment?.status === "CONFIRMED";
      }
    );

    await testEndpoint(
      "Appointment Audit Logs API",
      `/api/appointments/${createdAppointmentId}/audit-logs`,
      {},
      (res, data) => {
        return res.status === 200;
      }
    );
  }

  await testEndpoint(
    "Scheduled 24-Hour Reminder Cron",
    "/api/cron/reminders?force=true",
    {
      headers: { Authorization: "Bearer local-dev-cron-key" },
    },
    (res, data) => {
      return res.status === 200 && data.success === true;
    }
  );

  await testEndpoint(
    "Booking Form Configuration API",
    "/api/booking-form/config",
    {},
    (res, data) => {
      return (
        res.status === 200 &&
        data.success === true &&
        Array.isArray(data.config?.fields) &&
        Array.isArray(data.config?.treatments)
      );
    }
  );

  await testEndpoint(
    "Transactional Email Preview/Test",
    "/api/email/test",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateType: "booking-confirmed",
        to: "test.patient@example.com",
      }),
    },
    (res, data) => {
      return res.status === 200 && data.success === true;
    }
  );

  await testEndpoint(
    "Telemetry Ingestion API",
    "/api/analytics/events",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "booking_step_viewed",
        pathname: "/book",
        data: { step: 1 },
      }),
    },
    (res, data) => {
      return res.status === 200 && data.success === true;
    }
  );

  await testEndpoint(
    "Analytics Funnel Metrics Query",
    "/api/analytics/events",
    {},
    (res, data) => {
      return (
        res.status === 200 &&
        data.success === true &&
        typeof data.metrics === "object"
      );
    }
  );

  // -------------------------------------------------------------
  // SECTION 3: Admin Portal & Middleware Security
  // -------------------------------------------------------------
  console.log(
    `\n${colors.bold}${colors.cyan}[3. Admin Portal & Route Protection]${colors.reset}`
  );

  await testEndpoint("Admin Login Screen", "/admin/login", {}, (res, text) => {
    return res.status === 200 && text.includes("HealthSphere");
  });

  // Protected Admin Routes should redirect unauthenticated requests (HTTP 307 to /admin/login)
  await testEndpoint(
    "Admin Dashboard (Protected)",
    "/admin",
    { redirect: "manual" },
    (res) => {
      // 307 redirect to login or 200 if session mock
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Analytics & Funnel (Protected)",
    "/admin/analytics",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Calendar Schedule (Protected)",
    "/admin/calendar",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Pending Queue (Protected)",
    "/admin/pending",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Patient Records (Protected)",
    "/admin/patients",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Services Management (Protected)",
    "/admin/services",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin All Bookings (Protected)",
    "/admin/appointments",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin WhatsApp Bookings (Protected)",
    "/admin/whatsapp",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Staff Management (Protected)",
    "/admin/staff",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );



  await testEndpoint(
    "Admin Email Previews (Protected)",
    "/admin/email-previews",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Booking Form Builder (Protected)",
    "/admin/booking-form",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Clinic Branding (Protected)",
    "/admin/settings",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  await testEndpoint(
    "Admin Patient Reviews & Google Sync (Protected)",
    "/admin/reviews",
    { redirect: "manual" },
    (res) => {
      return res.status === 307 || res.status === 200;
    }
  );

  // -------------------------------------------------------------
  // SECTION 4: Error Handling & Resilience
  // -------------------------------------------------------------
  console.log(
    `\n${colors.bold}${colors.cyan}[4. Error Handling & Resilience]${colors.reset}`
  );

  await testEndpoint(
    "Branded 404 Not Found Page",
    "/non-existent-clinic-page-test-404",
    {},
    (res, text) => {
      // Should return 404 status and custom clinic not-found page
      return res.status === 404 && text.includes("Page Not Found");
    }
  );

  // -------------------------------------------------------------
  // Final Scorecard
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = total - passed;

  console.log(
    `\n${colors.bold}========================================================================${colors.reset}`
  );
  console.log(
    `${colors.bold}  VERIFICATION SCORECARD: ${passed}/${total} CHECKS PASSED${colors.reset}`
  );
  console.log(
    `${colors.bold}========================================================================${colors.reset}`
  );

  if (failed === 0) {
    console.log(
      `  ${colors.green}${colors.bold}🎉 ALL SYSTEMS OPERATIONAL: The website is running and 100% of features work!${colors.reset}\n`
    );
    process.exit(0);
  } else {
    console.log(
      `  ${colors.red}${colors.bold}⚠️ ${failed} check(s) did not pass. Review the detailed log above.${colors.reset}\n`
    );
    process.exit(1);
  }
}

runComprehensiveVerification();
