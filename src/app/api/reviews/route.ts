import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getReviewsStoreData,
  getPublicApprovedReviews,
  addReview,
  updateReviewsDarkMode,
} from "@/lib/reviews-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get("public") === "true";

    if (isPublic) {
      const store = getReviewsStoreData();
      const publicReviews = getPublicApprovedReviews();
      return NextResponse.json({
        success: true,
        reviews: publicReviews,
        count: publicReviews.length,
        darkMode: Boolean(store.darkMode ?? store.googleConfig?.darkMode ?? false),
        googleConfig: store.googleConfig,
      });
    }

    // Admin view
    const store = getReviewsStoreData();
    return NextResponse.json({
      success: true,
      googleConfig: store.googleConfig,
      darkMode: Boolean(store.darkMode ?? store.googleConfig?.darkMode ?? false),
      reviews: store.reviews,
      metrics: {
        total: store.reviews.length,
        approved: store.reviews.filter((r) => r.status === "APPROVED").length,
        pending: store.reviews.filter((r) => r.status === "PENDING_APPROVAL")
          .length,
        google: store.reviews.filter((r) => r.source === "GOOGLE").length,
        averageRating:
          store.reviews.length > 0
            ? (
                store.reviews.reduce((acc, r) => acc + r.rating, 0) /
                store.reviews.length
              ).toFixed(1)
            : "5.0",
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!body.authorName || !body.comment || !body.rating) {
      return NextResponse.json(
        {
          success: false,
          error: "Author name, rating, and review comment are required.",
        },
        { status: 400 }
      );
    }

    const isAdmin = session?.user?.role === "ADMIN";

    const newReview = addReview({
      authorName: body.authorName.trim(),
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      comment: body.comment.trim(),
      treatment: body.treatment?.trim() || "General Consultation",
      date: body.date || "Just now",
      source: body.source || "WEBSITE",
      // If added by admin, allow immediate approval if specified; otherwise pending approval
      status: isAdmin && body.status ? body.status : "APPROVED",
      authorPhotoUrl: body.authorPhotoUrl || "",
      verifiedPatient: Boolean(body.verifiedPatient ?? true),
      clinicResponse: body.clinicResponse || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review added successfully.",
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }
    const body = await req.json();
    if (typeof body.darkMode === "boolean") {
      const updated = updateReviewsDarkMode(body.darkMode);
      return NextResponse.json({
        success: true,
        message: `Review section theme updated to ${updated ? "Dark" : "Light"} mode.`,
        darkMode: updated,
      });
    }
    return NextResponse.json(
      { success: false, error: "Invalid payload: darkMode boolean expected." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating review theme:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review theme." },
      { status: 500 }
    );
  }
}

