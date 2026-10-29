import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "waiting-room-tvs-config.json");

interface WaitingRoomTv {
  id: string;
  name: string;
  shows: string;
  lastSeen: string;
  status: "Active" | "Revoked";
  token: string;
  createdAt: string;
}

const DEFAULT_TVS: WaitingRoomTv[] = [
  {
    id: "tv-1",
    name: "yash",
    shows: "Dr. Deep Arvindbhai Patel",
    lastSeen: "Just now",
    status: "Revoked",
    token: "InZJQCW8KOoPM11oyJTniz8-KLBnjf910OfFKuCgBMI",
    createdAt: "2026-10-27T11:00:00.000Z",
  },
  {
    id: "tv-2",
    name: "HI",
    shows: "The clinic queue",
    lastSeen: "21 min ago",
    status: "Revoked",
    token: "Tv9xKLMn728QpWsA120938-ZbcQ18290PLaKMns",
    createdAt: "2026-10-27T10:30:00.000Z",
  },
];

function getTvsList(): WaitingRoomTv[] {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Failed to read TVs config:", err);
  }
  return DEFAULT_TVS;
}

function saveTvsList(list: WaitingRoomTv[]): void {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write TVs config:", err);
  }
}

export async function GET() {
  try {
    const tvs = getTvsList();
    return NextResponse.json({ success: true, data: tvs });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load TVs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getTvsList();

    // Revoke action
    if (body.action === "revoke" && body.id) {
      const updated = current.map((tv) =>
        tv.id === body.id ? { ...tv, status: "Revoked" as const } : tv
      );
      saveTvsList(updated);
      return NextResponse.json({ success: true, message: "TV access revoked.", data: updated });
    }

    // Delete single TV action
    if (body.action === "delete" && body.id) {
      const updated = current.filter((tv) => tv.id !== body.id);
      saveTvsList(updated);
      return NextResponse.json({ success: true, message: "TV removed successfully.", data: updated });
    }

    // Clear all revoked TVs action
    if (body.action === "clear_revoked") {
      const updated = current.filter((tv) => tv.status !== "Revoked");
      saveTvsList(updated);
      return NextResponse.json({ success: true, message: "All revoked TVs cleared.", data: updated });
    }

    // Create action
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "TV name is required." },
        { status: 400 }
      );
    }

    const randomSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const token = `InZJQCW${randomSuffix}`;

    const newTv: WaitingRoomTv = {
      id: `tv-${Date.now()}`,
      name: body.name.trim(),
      shows: body.shows || "The clinic queue",
      lastSeen: "Never",
      status: "Active",
      token,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTv, ...current];
    saveTvsList(updated);

    return NextResponse.json({
      success: true,
      message: "TV link created successfully.",
      data: newTv,
      allTvs: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearRevoked = searchParams.get("clearRevoked") === "true";
    const current = getTvsList();

    let updated = current;
    if (clearRevoked) {
      updated = current.filter((tv) => tv.status !== "Revoked");
    } else if (id) {
      updated = current.filter((tv) => tv.id !== id);
    } else {
      return NextResponse.json(
        { success: false, error: "Missing TV id or clearRevoked parameter" },
        { status: 400 }
      );
    }

    saveTvsList(updated);
    return NextResponse.json({ success: true, message: "TV deleted successfully", data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete TV" },
      { status: 500 }
    );
  }
}

