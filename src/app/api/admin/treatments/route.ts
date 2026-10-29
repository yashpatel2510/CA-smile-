import { NextRequest, NextResponse } from "next/server";
import {
  getTreatmentsStoreDataAsync,
  addTreatmentItemAsync,
  updateTreatmentItemAsync,
  deleteTreatmentItemAsync,
  updateTreatmentsSettingsAsync,
  AVAILABLE_CLINIC_IMAGES,
} from "@/lib/treatments-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getTreatmentsStoreDataAsync();
    return NextResponse.json({
      success: true,
      settings: data.settings || { showDiagnostics: true, showTreatments: true },
      treatments: data.treatments,
      diagnostics: data.diagnostics,
      availableImages: AVAILABLE_CLINIC_IMAGES,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load treatments" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      showDiagnostics,
      showTreatments,
      treatmentHeading,
      treatmentSubtitle,
      diagnosticHeading,
      diagnosticSubtitle,
      transitionSpeed,
    } = body;

    const newSettings: any = {};
    if (typeof showDiagnostics === "boolean") {
      newSettings.showDiagnostics = showDiagnostics;
    }
    if (typeof showTreatments === "boolean") {
      newSettings.showTreatments = showTreatments;
    }
    if (typeof treatmentHeading === "string") {
      newSettings.treatmentHeading = treatmentHeading.trim();
    }
    if (typeof treatmentSubtitle === "string") {
      newSettings.treatmentSubtitle = treatmentSubtitle.trim();
    }
    if (typeof diagnosticHeading === "string") {
      newSettings.diagnosticHeading = diagnosticHeading.trim();
    }
    if (typeof diagnosticSubtitle === "string") {
      newSettings.diagnosticSubtitle = diagnosticSubtitle.trim();
    }
    if (
      typeof transitionSpeed === "string" &&
      ["slow", "normal", "fast"].includes(transitionSpeed)
    ) {
      newSettings.transitionSpeed = transitionSpeed;
    }

    const updated = await updateTreatmentsSettingsAsync(newSettings);

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "treatments",
      title,
      subtitle,
      price,
      category,
      image,
      whatItIs,
      howItWorks,
      benefits,
      procedure,
      result,
      whatIfNotDone,
      paragraphs,
      isActive,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Treatment title is required" },
        { status: 400 }
      );
    }

    const item = await addTreatmentItemAsync(type === "diagnostics" ? "diagnostics" : "treatments", {
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : undefined,
      price: price ? price.trim() : undefined,
      category: category?.trim(),
      image: image?.trim() || "/images/treatments/teeth-whitening.jpg",
      whatItIs: whatItIs ? whatItIs.trim() : undefined,
      howItWorks: howItWorks ? howItWorks.trim() : undefined,
      benefits: benefits ? benefits.trim() : undefined,
      procedure: Array.isArray(procedure)
        ? procedure.map((s: string) => s.trim()).filter(Boolean)
        : typeof procedure === "string"
        ? procedure.split("\n").map((s) => s.trim()).filter(Boolean)
        : undefined,
      result: result ? result.trim() : undefined,
      whatIfNotDone: whatIfNotDone ? whatIfNotDone.trim() : undefined,
      paragraphs: Array.isArray(paragraphs) && paragraphs.length > 0
        ? paragraphs.filter((p: string) => p && p.trim())
        : [whatItIs || "State-of-the-art procedure delivered by certified dental specialists.", howItWorks || ""].filter(Boolean),
      isActive: isActive !== false,
    });

    return NextResponse.json({
      success: true,
      message: "Treatment created successfully",
      item,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create treatment" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "treatments",
      id,
      title,
      subtitle,
      price,
      category,
      image,
      whatItIs,
      howItWorks,
      benefits,
      procedure,
      result,
      whatIfNotDone,
      paragraphs,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Treatment ID is required for updating" },
        { status: 400 }
      );
    }

    const updated = await updateTreatmentItemAsync(
      type === "diagnostics" ? "diagnostics" : "treatments",
      id,
      {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(subtitle !== undefined ? { subtitle: subtitle.trim() } : {}),
        ...(price !== undefined ? { price: price.trim() } : {}),
        ...(category !== undefined ? { category: category.trim() } : {}),
        ...(image !== undefined ? { image: image.trim() } : {}),
        ...(whatItIs !== undefined ? { whatItIs: whatItIs.trim() } : {}),
        ...(howItWorks !== undefined ? { howItWorks: howItWorks.trim() } : {}),
        ...(benefits !== undefined ? { benefits: benefits.trim() } : {}),
        ...(procedure !== undefined
          ? {
              procedure: Array.isArray(procedure)
                ? procedure.map((s: string) => s.trim()).filter(Boolean)
                : typeof procedure === "string"
                ? procedure.split("\n").map((s) => s.trim()).filter(Boolean)
                : [],
            }
          : {}),
        ...(result !== undefined ? { result: result.trim() } : {}),
        ...(whatIfNotDone !== undefined ? { whatIfNotDone: whatIfNotDone.trim() } : {}),
        ...(Array.isArray(paragraphs) ? { paragraphs: paragraphs.filter((p: string) => p && p.trim()) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Item with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Treatment updated successfully",
      item: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update treatment" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") === "diagnostics" ? "diagnostics" : "treatments";

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Treatment ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteTreatmentItemAsync(type, id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `Item with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Treatment removed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete treatment" },
      { status: 500 }
    );
  }
}
