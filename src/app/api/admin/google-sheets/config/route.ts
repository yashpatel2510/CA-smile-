import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleSheetConfig,
  saveGoogleSheetConfig,
  GOOGLE_APPS_SCRIPT_CODE,
} from "@/lib/google-sheets/google-sheet-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getGoogleSheetConfig();
  return NextResponse.json({
    success: true,
    config,
    appsScriptCode: GOOGLE_APPS_SCRIPT_CODE,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, spreadsheetUrl, autoSyncOnBooking } = body;

    const updated = saveGoogleSheetConfig({
      webhookUrl: typeof webhookUrl === "string" ? webhookUrl.trim() : undefined,
      spreadsheetUrl: typeof spreadsheetUrl === "string" ? spreadsheetUrl.trim() : undefined,
      autoSyncOnBooking: typeof autoSyncOnBooking === "boolean" ? autoSyncOnBooking : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Google Sheet connection settings saved successfully!",
      config: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save configuration" },
      { status: 500 }
    );
  }
}
