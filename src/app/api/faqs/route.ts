import { NextRequest, NextResponse } from "next/server";
import { getFaqsConfig, saveFaqsConfig } from "@/lib/faqs-store";

export async function GET() {
  try {
    const config = getFaqsConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch FAQs", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.faqs)) {
      return NextResponse.json(
        { error: "Invalid payload: 'faqs' array is required." },
        { status: 400 }
      );
    }

    const current = getFaqsConfig();
    const updated = {
      tag: body.tag || current.tag || "• FAQS",
      headingLine1: body.headingLine1 || current.headingLine1 || "QUESTIONS,",
      headingLine2: body.headingLine2 || current.headingLine2 || "ANSWERED",
      subtitle: body.subtitle || current.subtitle,
      themeMode: (body.themeMode === "dark" || current.themeMode === "dark" ? "dark" : "light") as "light" | "dark",
      faqs: body.faqs,
    };

    const success = saveFaqsConfig(updated);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to save FAQ configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update FAQs", details: err?.message },
      { status: 500 }
    );
  }
}
