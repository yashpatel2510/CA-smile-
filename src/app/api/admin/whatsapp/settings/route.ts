import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWhatsAppSettings, saveWhatsAppSettings } from "@/lib/whatsapp/settings-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId") || undefined;
    const settings = await getWhatsAppSettings(clinicId);

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const clinicId = body.clinicId || "default-clinic";
    const updated = await saveWhatsAppSettings(clinicId, body);

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
