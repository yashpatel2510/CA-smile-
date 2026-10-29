import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "fee-schedule-config.json");

export interface ProcedureItem {
  id: string;
  name: string;
  sessions?: string;
  steps?: string[];
  typicalRange: string;
  clinicPrice?: number | null;
  isEnabled: boolean;
}

export interface FeeCategory {
  id: string;
  name: string;
  color: "purple" | "amber" | "emerald" | "rose" | "pink" | "indigo" | "blue" | "teal";
  items: ProcedureItem[];
}

function getFeeSchedule(): FeeCategory[] {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Failed to read fee schedule:", err);
  }
  return [];
}

function saveFeeSchedule(list: FeeCategory[]): void {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save fee schedule:", err);
  }
}

export async function GET() {
  try {
    const data = getFeeSchedule();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load fee schedule" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getFeeSchedule();

    // 1. Add Category
    if (body.action === "addCategory") {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ success: false, error: "Category name is required." }, { status: 400 });
      }

      const newCat: FeeCategory = {
        id: `cat-${Date.now()}`,
        name: body.name.trim(),
        color: body.color || "purple",
        items: [],
      };

      const updated = [...current, newCat];
      saveFeeSchedule(updated);
      return NextResponse.json({ success: true, data: updated, message: "Category added." });
    }

    // 2. Remove Category
    if (body.action === "removeCategory" && body.categoryId) {
      const updated = current.filter((c) => c.id !== body.categoryId);
      saveFeeSchedule(updated);
      return NextResponse.json({ success: true, data: updated, message: "Category removed." });
    }

    // 3. Add Procedure to Category
    if (body.action === "addProcedure" && body.categoryId) {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ success: false, error: "Procedure name is required." }, { status: 400 });
      }

      const newProc: ProcedureItem = {
        id: `proc-${Date.now()}`,
        name: body.name.trim(),
        sessions: body.sessions || undefined,
        steps: Array.isArray(body.steps) ? body.steps : undefined,
        typicalRange: body.typicalRange || "Custom",
        clinicPrice: body.clinicPrice !== undefined ? body.clinicPrice : null,
        isEnabled: true,
      };

      const updated = current.map((cat) => {
        if (cat.id === body.categoryId) {
          return {
            ...cat,
            items: [...cat.items, newProc],
          };
        }
        return cat;
      });

      saveFeeSchedule(updated);
      return NextResponse.json({ success: true, data: updated, message: "Procedure added." });
    }

    // 4. Update Procedure (Price or Details)
    if (body.action === "updateProcedure" && body.categoryId && body.procedureId) {
      const updated = current.map((cat) => {
        if (cat.id === body.categoryId) {
          return {
            ...cat,
            items: cat.items.map((item) =>
              item.id === body.procedureId
                ? {
                    ...item,
                    name: body.name !== undefined ? body.name : item.name,
                    clinicPrice: body.clinicPrice !== undefined ? body.clinicPrice : item.clinicPrice,
                    isEnabled: body.isEnabled !== undefined ? body.isEnabled : item.isEnabled,
                  }
                : item
            ),
          };
        }
        return cat;
      });

      saveFeeSchedule(updated);
      return NextResponse.json({ success: true, data: updated, message: "Procedure updated." });
    }

    // 5. Delete Procedure
    if (body.action === "deleteProcedure" && body.categoryId && body.procedureId) {
      const updated = current.map((cat) => {
        if (cat.id === body.categoryId) {
          return {
            ...cat,
            items: cat.items.filter((item) => item.id !== body.procedureId),
          };
        }
        return cat;
      });

      saveFeeSchedule(updated);
      return NextResponse.json({ success: true, data: updated, message: "Procedure deleted." });
    }

    // 6. Bulk Save (e.g. Save All Changes)
    if (Array.isArray(body.categories)) {
      saveFeeSchedule(body.categories);
      return NextResponse.json({ success: true, data: body.categories, message: "Fee schedule saved." });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to process" }, { status: 500 });
  }
}
