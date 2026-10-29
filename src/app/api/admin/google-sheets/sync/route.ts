import { NextRequest, NextResponse } from "next/server";
import { syncAllToGoogleSheet } from "@/lib/google-sheets/google-sheet-sync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const result = await syncAllToGoogleSheet();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to trigger live Google Sheet sync" },
      { status: 500 }
    );
  }
}
