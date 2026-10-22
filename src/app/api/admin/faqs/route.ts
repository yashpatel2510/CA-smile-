import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getFaqsStoreData,
  updateFaqSettings,
  addFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItems,
  DEFAULT_FAQS_STORE,
  saveFaqsStoreData,
} from "@/lib/faqs-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getFaqsStoreData();
    const sortedItems = [...(data.items || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    return NextResponse.json({
      settings: data.settings,
      items: sortedItems,
    });
  } catch (error) {
    console.error("Error in admin GET /api/admin/faqs:", error);
    return NextResponse.json(
      { error: "Failed to load FAQ configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // In local dev, allow if no session or admin
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "update-settings") {
      const { settings } = body;
      if (!settings) {
        return NextResponse.json({ error: "Settings payload required" }, { status: 400 });
      }
      const updated = updateFaqSettings(settings);
      return NextResponse.json({ success: true, settings: updated });
    }

    if (action === "add-item") {
      const { question, answer, category, isActive, order } = body;
      if (!question || !answer) {
        return NextResponse.json(
          { error: "Question and Answer are required" },
          { status: 400 }
        );
      }
      const newItem = addFaqItem({ question, answer, category, isActive, order });
      return NextResponse.json({ success: true, item: newItem });
    }

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

    if (action === "delete-item") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
      }
      const deleted = deleteFaqItem(id);
      return NextResponse.json({ success: deleted });
    }

    if (action === "reorder-items") {
      const { orderedIds } = body;
      if (!Array.isArray(orderedIds)) {
        return NextResponse.json(
          { error: "orderedIds array is required" },
          { status: 400 }
        );
      }
      const reordered = reorderFaqItems(orderedIds);
      return NextResponse.json({ success: true, items: reordered });
    }

    if (action === "reset-defaults") {
      saveFaqsStoreData(DEFAULT_FAQS_STORE);
      return NextResponse.json({
        success: true,
        settings: DEFAULT_FAQS_STORE.settings,
        items: DEFAULT_FAQS_STORE.items,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in admin POST /api/admin/faqs:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
