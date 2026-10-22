import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getFaqsConfig,
  updateFaqSettings,
  addFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItems,
  saveFaqsConfig,
  DEFAULT_CONFIG,
} from "@/lib/faqs-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getFaqsConfig();
    const sortedFaqs = [...(config.faqs || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    return NextResponse.json({
      config: {
        tag: config.tag,
        headingLine1: config.headingLine1,
        headingLine2: config.headingLine2,
        subtitle: config.subtitle,
        themeMode: config.themeMode || "light",
      },
      faqs: sortedFaqs,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/faqs:", error);
    return NextResponse.json(
      { error: "Failed to load FAQ configuration", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Allow in local dev or if admin
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Update Section Settings (Headings, Subtitle, and Theme Mode)
    if (action === "update-settings") {
      const { settings } = body;
      if (!settings) {
        return NextResponse.json({ error: "Settings payload required" }, { status: 400 });
      }

      const updated = updateFaqSettings({
        tag: settings.tag,
        headingLine1: settings.headingLine1,
        headingLine2: settings.headingLine2,
        subtitle: settings.subtitle,
        themeMode: settings.themeMode === "dark" ? "dark" : "light",
      });

      return NextResponse.json({ success: true, config: updated });
    }

    // 2. Add New Question
    if (action === "add-item") {
      const { question, answer, category, isActive, isFeatured, order } = body;
      if (!question || !answer) {
        return NextResponse.json(
          { error: "Question and Answer are required" },
          { status: 400 }
        );
      }

      const newItem = addFaqItem({
        question,
        answer,
        category: category || "General",
        isActive: isActive !== false,
        isFeatured: isFeatured !== false,
        order,
      });

      return NextResponse.json({ success: true, item: newItem });
    }

    // 3. Update Existing Question
    if (action === "update-item") {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json(
          { error: "Item ID and updates required" },
          { status: 400 }
        );
      }

      const updatedItem = updateFaqItem(id, updates);
      if (!updatedItem) {
        return NextResponse.json({ error: "FAQ item not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, item: updatedItem });
    }

    // 4. Delete Question
    if (action === "delete-item") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
      }

      const deleted = deleteFaqItem(id);
      return NextResponse.json({ success: deleted });
    }

    // 5. Reorder Questions
    if (action === "reorder-items") {
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) {
        return NextResponse.json(
          { error: "orderedIds array is required" },
          { status: 400 }
        );
      }

      const reordered = reorderFaqItems(orderedIds);
      return NextResponse.json({ success: true, faqs: reordered });
    }

    // 6. Reset to Defaults
    if (action === "reset-defaults") {
      saveFaqsConfig(DEFAULT_CONFIG);
      return NextResponse.json({
        success: true,
        config: DEFAULT_CONFIG,
        faqs: DEFAULT_CONFIG.faqs,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/faqs:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
