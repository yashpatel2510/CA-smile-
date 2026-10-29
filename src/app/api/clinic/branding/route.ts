import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getClinicBrandingConfig,
  updateClinicBrandingConfig,
  resetClinicBrandingConfig,
} from "@/lib/clinic-branding-store";

export async function GET() {
  try {
    const branding = getClinicBrandingConfig();
    return NextResponse.json({
      success: true,
      branding,
    });
  } catch (error) {
    console.error("Error retrieving clinic branding:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve clinic branding." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Only Clinic Owner (ADMIN) has authorization to change clinic branding/logo
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: Clinic Owner (Admin) privileges are required to change clinic logo and branding settings.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === "reset") {
      const resetConfig = resetClinicBrandingConfig();
      return NextResponse.json({
        success: true,
        message: "Clinic branding reset to defaults.",
        branding: resetConfig,
      });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    const updated = updateClinicBrandingConfig(body);

    return NextResponse.json({
      success: true,
      message: "Clinic branding and logo updated successfully.",
      branding: updated,
    });
  } catch (error) {
    console.error("Error updating clinic branding:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update clinic branding." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
