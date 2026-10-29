import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getDentalDocumentBranding,
  saveDentalDocumentBranding,
} from "@/lib/dental-document-branding-store";
import { DentalDocumentBrandingConfig } from "@/types/dental-document-branding";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = getDentalDocumentBranding();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error("Error fetching dental document branding:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load branding" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Partial<DentalDocumentBrandingConfig> = await req.json();
    const current = getDentalDocumentBranding();

    const updatedConfig: DentalDocumentBrandingConfig = {
      master: {
        ...current.master,
        ...(body.master || {}),
      },
      layouts: {
        ...current.layouts,
        ...(body.layouts || {}),
      },
    };

    const saved = saveDentalDocumentBranding(updatedConfig);

    return NextResponse.json({
      success: true,
      message: "Dental document branding & letterhead calibration saved successfully",
      data: saved,
    });
  } catch (error: any) {
    console.error("Error saving dental document branding:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save branding" },
      { status: 500 }
    );
  }
}
