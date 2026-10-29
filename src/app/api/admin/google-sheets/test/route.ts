import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleSheetConnection } from "@/lib/google-sheets/google-sheet-sync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { webhookUrl } = body;
    const result = await verifyGoogleSheetConnection(webhookUrl);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, message: err.message || "Failed to test connection" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const result = await verifyGoogleSheetConnection();
  return NextResponse.json(result, { status: 200 });
}
