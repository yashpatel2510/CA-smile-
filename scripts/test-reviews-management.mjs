import { encode } from "next-auth/jwt";

const secret =
  process.env.NEXTAUTH_SECRET ||
  "super-secret-clinic-auth-token-for-dev-session-key-32-chars-min";

const BASE_URL = "http://localhost:3000";

async function runReviewsTests() {
  console.log("=================================================");
  console.log("  PATIENT REVIEWS & GOOGLE SYNC TEST SUITE      ");
  console.log("=================================================\n");

  const adminToken = await encode({
    token: {
      id: "staff-1",
      name: "Dr. Evelyn Reed, MD",
      email: "admin@healthsphere.example.com",
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

  // 1. Test Public Approved Reviews API
  console.log(
    "[Test 1] Testing Public Approved Reviews Endpoint (?public=true):"
  );
  const publicRes = await fetch(`${BASE_URL}/api/reviews?public=true`);
  const publicData = await publicRes.json();
  if (
    publicRes.status === 200 &&
    publicData.success &&
    Array.isArray(publicData.reviews)
  ) {
    const allApproved = publicData.reviews.every(
      (r) => r.status === "APPROVED"
    );
    if (allApproved) {
      console.log(
        `  ✓ PASSED -> Returned ${publicData.reviews.length} approved public reviews.`
      );
    } else {
      console.error(
        "  ✗ FAILED -> Non-approved reviews leaked into public API!"
      );
      process.exit(1);
    }
  } else {
    console.error("  ✗ FAILED -> Public reviews API error:", publicData);
    process.exit(1);
  }

  // 2. Test Admin Reviews Listing & Metrics
  console.log("\n[Test 2] Testing Admin Reviews Listing Endpoint:");
  const adminRes = await fetch(`${BASE_URL}/api/reviews`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const adminData = await adminRes.json();
  if (adminRes.status === 200 && adminData.success && adminData.metrics) {
    console.log(
      `  ✓ PASSED -> Total: ${adminData.metrics.total}, Approved: ${adminData.metrics.approved}, Pending: ${adminData.metrics.pending}, Google: ${adminData.metrics.google}, Avg: ${adminData.metrics.averageRating}★`
    );
  } else {
    console.error("  ✗ FAILED -> Admin reviews listing error:", adminData);
    process.exit(1);
  }

  // 3. Test Adding a New Review
  console.log("\n[Test 3] Testing Add New Review (POST /api/reviews):");
  const newReviewRes = await fetch(`${BASE_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      authorName: "Rohan V. Mehta",
      rating: 5,
      comment:
        "Superb dental cleaning and whitening experience. Gentle handling and very transparent pricing!",
      treatment: "Teeth Cleaning & Scaling",
      source: "GOOGLE",
      status: "APPROVED",
    }),
  });
  const newReviewData = await newReviewRes.json();
  let createdReviewId = null;
  if (
    newReviewRes.status === 201 &&
    newReviewData.success &&
    newReviewData.review
  ) {
    createdReviewId = newReviewData.review.id;
    console.log(
      `  ✓ PASSED -> Created review ID: ${createdReviewId} for ${newReviewData.review.authorName}`
    );
  } else {
    console.error("  ✗ FAILED -> Adding review error:", newReviewData);
    process.exit(1);
  }

  // 4. Test Updating and Approving / Unapproving Review
  console.log(
    "\n[Test 4] Testing Review Status Toggle (PUT /api/reviews/[id]):"
  );
  const updateRes = await fetch(`${BASE_URL}/api/reviews/${createdReviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      status: "PENDING_APPROVAL",
      clinicResponse: "Thank you Rohan! Glad you had a great experience.",
    }),
  });
  const updateData = await updateRes.json();
  if (
    updateRes.status === 200 &&
    updateData.success &&
    updateData.review.status === "PENDING_APPROVAL"
  ) {
    console.log(
      `  ✓ PASSED -> Successfully updated review status to PENDING_APPROVAL and added clinic response.`
    );
  } else {
    console.error("  ✗ FAILED -> Updating review error:", updateData);
    process.exit(1);
  }

  // 5. Test Staff Role Restriction (Staff cannot modify/approve reviews)
  console.log("\n[Test 5] Testing RBAC: Staff Attempt to Modify Review:");
  const staffPutRes = await fetch(
    `${BASE_URL}/api/reviews/${createdReviewId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${staffToken}`,
      },
      body: JSON.stringify({ status: "APPROVED" }),
    }
  );
  const staffPutData = await staffPutRes.json();
  if (staffPutRes.status === 403 && staffPutData.success === false) {
    console.log(
      `  ✓ FORBIDDEN [STAFF] -> Rejected with HTTP 403: "${staffPutData.error}"`
    );
  } else {
    console.error("  ✗ FAILED -> Staff was not rejected!", staffPutData);
    process.exit(1);
  }

  // 6. Test Direct Google Business Reviews Sync
  console.log(
    "\n[Test 6] Testing Direct Google Business Reviews Sync (POST /api/reviews/google-sync):"
  );
  const googleSyncRes = await fetch(`${BASE_URL}/api/reviews/google-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${adminToken}`,
    },
    body: JSON.stringify({
      placeId: "0x3be0ef543648830b:0x3a288255f324c8de",
      businessName: "CA Smile Dental Clinic",
    }),
  });
  const googleSyncData = await googleSyncRes.json();
  if (googleSyncRes.status === 200 && googleSyncData.success) {
    console.log(
      `  ✓ PASSED -> Google Business sync completed. ${googleSyncData.syncedCount} new review(s) imported.`
    );
  } else {
    console.error("  ✗ FAILED -> Google sync error:", googleSyncData);
    process.exit(1);
  }

  // 7. Test Deleting Review
  console.log("\n[Test 7] Testing Delete Review (DELETE /api/reviews/[id]):");
  const deleteRes = await fetch(`${BASE_URL}/api/reviews/${createdReviewId}`, {
    method: "DELETE",
    headers: {
      Cookie: `next-auth.session-token=${adminToken}`,
    },
  });
  const deleteData = await deleteRes.json();
  if (deleteRes.status === 200 && deleteData.success) {
    console.log(
      `  ✓ PASSED -> Review ${createdReviewId} deleted successfully.`
    );
  } else {
    console.error("  ✗ FAILED -> Deleting review error:", deleteData);
    process.exit(1);
  }

  // Cleanup: Delete any synced test reviews to maintain 0 reviews for the new clinic
  const remainingRes = await fetch(`${BASE_URL}/api/reviews`, {
    headers: { Cookie: `next-auth.session-token=${adminToken}` },
  });
  const remainingData = await remainingRes.json();
  if (remainingData.reviews && remainingData.reviews.length > 0) {
    for (const rev of remainingData.reviews) {
      await fetch(`${BASE_URL}/api/reviews/${rev.id}`, {
        method: "DELETE",
        headers: { Cookie: `next-auth.session-token=${adminToken}` },
      });
    }
    // Reset config totalReviewsCount back to 0
    await fetch(`${BASE_URL}/api/reviews/google-sync`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${adminToken}`,
      },
      body: JSON.stringify({
        totalReviewsCount: 0,
        googleRating: 5.0,
      }),
    });
  }

  // 8. Test Middleware Route Protection for /admin/reviews
  console.log(
    "\n[Test 8] Testing Route Protection: Staff Attempt to Access /admin/reviews:"
  );
  const staffPageRes = await fetch(`${BASE_URL}/admin/reviews`, {
    headers: { Cookie: `next-auth.session-token=${staffToken}` },
    redirect: "manual",
  });
  const location = staffPageRes.headers.get("location") || "";
  if (
    staffPageRes.status === 307 &&
    location.includes("error=admin_only")
  ) {
    console.log(
      `  ✓ BLOCKED [STAFF] -> /admin/reviews redirected to /admin?error=admin_only`
    );
  } else {
    console.error(
      `  ✗ FAILED -> Expected 307 redirect, got ${staffPageRes.status} to ${location}`
    );
    process.exit(1);
  }

  console.log("\n=================================================");
  console.log("  🎉 ALL 8 PATIENT REVIEWS & GOOGLE TESTS PASSED! ");
  console.log("=================================================\n");
}

runReviewsTests().catch((err) => {
  console.error("Reviews test failed:", err);
  process.exit(1);
});
