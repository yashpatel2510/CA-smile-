import { NextResponse } from "next/server";
import { getFaqsStoreData } from "@/lib/faqs-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getFaqsStoreData();
    const activeItems = (data.items || [])
      .filter((item) => item.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({
      settings: data.settings,
      items: activeItems,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
