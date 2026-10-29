import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resetDentalDocumentBranding } from "@/lib/dental-document-branding-store";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resetData = resetDentalDocumentBranding();

    return NextResponse.json({
      success: true,
      message: "Dental document branding reset to factory clinical defaults",
      data: resetData,
    });
  } catch (error: any) {
    console.error("Error resetting dental document branding:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset branding" },
      { status: 500 }
    );
  }
}
