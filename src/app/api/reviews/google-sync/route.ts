import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  syncGoogleBusinessReviews,
  updateGoogleConfig,
} from "@/lib/reviews-store";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: Clinic Owner (Admin) privileges are required to sync Google Business reviews.",
        },
        { status: 403 }
      );
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body optional
    }

    const {
      placeId,
      businessName,
      googleMapsUrl,
      googleRating,
      totalReviewsCount,
      autoApprove,
      apiKey,
      showEmptyReviewCard,
    } = body as any;

    let updatedConfig;
    if (
      placeId ||
      businessName ||
      googleMapsUrl ||
      googleRating !== undefined ||
      totalReviewsCount !== undefined ||
      typeof autoApprove === "boolean" ||
      typeof apiKey === "string" ||
      typeof showEmptyReviewCard === "boolean"
    ) {
      updatedConfig = updateGoogleConfig({
        ...(placeId ? { placeId } : {}),
        ...(businessName ? { businessName } : {}),
        ...(googleMapsUrl ? { googleMapsUrl } : {}),
        ...(googleRating !== undefined ? { googleRating: Number(googleRating) } : {}),
        ...(totalReviewsCount !== undefined
          ? { totalReviewsCount: Number(totalReviewsCount) }
          : {}),
        ...(typeof autoApprove === "boolean"
          ? { autoApproveGoogleReviews: autoApprove }
          : {}),
        ...(typeof apiKey === "string" ? { apiKey: apiKey.trim() } : {}),
        ...(typeof showEmptyReviewCard === "boolean" ? { showEmptyReviewCard } : {}),
      });
    }

    const syncResult = await syncGoogleBusinessReviews(placeId);

    return NextResponse.json({
      success: true,
      message: syncResult.isLiveApi
        ? `Connected to Google Places API! ${syncResult.message}`
        : syncResult.syncedCount > 0
        ? `Google Business reviews sync completed. ${syncResult.syncedCount} new review(s) imported.`
        : `Google reviews synchronized. All existing reviews are up-to-date.`,
      syncedCount: syncResult.syncedCount,
      newReviews: syncResult.newReviews,
      googleConfig: updatedConfig,
      isLiveApi: syncResult.isLiveApi,
    });
  } catch (error) {
    console.error("Error syncing Google Business reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync Google Business reviews." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: Clinic Owner (Admin) privileges are required to update review settings.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      placeId,
      businessName,
      googleMapsUrl,
      googleRating,
      totalReviewsCount,
      autoApprove,
      apiKey,
      showEmptyReviewCard,
      darkMode,
    } = body as any;

    const updatedConfig = updateGoogleConfig({
      ...(placeId ? { placeId } : {}),
      ...(businessName ? { businessName } : {}),
      ...(googleMapsUrl ? { googleMapsUrl } : {}),
      ...(googleRating !== undefined ? { googleRating: Number(googleRating) } : {}),
      ...(totalReviewsCount !== undefined
        ? { totalReviewsCount: Number(totalReviewsCount) }
        : {}),
      ...(typeof autoApprove === "boolean"
        ? { autoApproveGoogleReviews: autoApprove }
        : {}),
      ...(typeof apiKey === "string" ? { apiKey: apiKey.trim() } : {}),
      ...(typeof showEmptyReviewCard === "boolean" ? { showEmptyReviewCard } : {}),
      ...(typeof darkMode === "boolean" ? { darkMode } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Review settings updated successfully.",
      googleConfig: updatedConfig,
    });
  } catch (error) {
    console.error("Error updating review settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review settings." },
      { status: 500 }
    );
  }
}

