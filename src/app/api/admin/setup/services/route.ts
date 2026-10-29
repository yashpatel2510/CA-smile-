import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "services-pricing-config.json");

export interface ServiceItem {
  id: string;
  name: string;
  provider: string; // "GENERAL" or doctor name
  providerName: string;
  price: number;
  duration: string; // e.g. "30m", "15m"
  isConsult?: boolean;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "srv-gen-1",
    name: "Scaling & Polishing",
    provider: "GENERAL",
    providerName: "General (All Doctors)",
    price: 1200,
    duration: "30m",
    isConsult: true,
  },
  {
    id: "srv-gen-2",
    name: "Teeth Whitening (In-office)",
    provider: "GENERAL",
    providerName: "General (All Doctors)",
    price: 6000,
    duration: "60m",
    isConsult: true,
  },
  {
    id: "srv-doc-1",
    name: "Dental Consultation",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 300,
    duration: "15m",
    isConsult: true,
  },
  {
    id: "srv-doc-2",
    name: "Composite Restoration (Class I/II)",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 1000,
    duration: "30m",
    isConsult: true,
  },
  {
    id: "srv-doc-3",
    name: "GIC Filling",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 600,
    duration: "20m",
    isConsult: true,
  },
  {
    id: "srv-doc-4",
    name: "Simple Extraction",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 600,
    duration: "20m",
    isConsult: true,
  },
  {
    id: "srv-doc-5",
    name: "Root Canal Treatment: Molar",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 6000,
    duration: "45m",
    isConsult: true,
  },
  {
    id: "srv-doc-6",
    name: "Root Canal Treatment: Anterior",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 4000,
    duration: "45m",
    isConsult: true,
  },
  {
    id: "srv-doc-7",
    name: "Zirconia Crown",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 9000,
    duration: "30m",
    isConsult: true,
  },
  {
    id: "srv-doc-8",
    name: "Fluoride Application",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 500,
    duration: "15m",
    isConsult: true,
  },
  {
    id: "srv-doc-9",
    name: "General Consultation",
    provider: "Dr. Deep Arvindbhai Patel",
    providerName: "Dr. Deep Arvindbhai Patel",
    price: 100,
    duration: "0",
    isConsult: true,
  },
];

function getServicesList(): ServiceItem[] {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to read services pricing config:", err);
  }
  return DEFAULT_SERVICES;
}

function saveServicesList(list: ServiceItem[]): void {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write services pricing config:", err);
  }
}

export async function GET() {
  try {
    const services = getServicesList();
    return NextResponse.json({ success: true, data: services });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load services" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getServicesList();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Service name is required." },
        { status: 400 }
      );
    }

    const id = body.id || `srv-${Date.now()}`;
    const existingIdx = current.findIndex((s) => s.id === id);

    const newItem: ServiceItem = {
      id,
      name: body.name.trim(),
      provider: body.provider || "GENERAL",
      providerName:
        body.provider === "GENERAL"
          ? "General (All Doctors)"
          : body.provider || "Dr. Deep Arvindbhai Patel",
      price: Number(body.price) || 0,
      duration: body.duration ? String(body.duration) : "30m",
      isConsult: body.isConsult ?? true,
    };

    let updated: ServiceItem[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = newItem;
    } else {
      updated = [newItem, ...current];
    }

    saveServicesList(updated);
    return NextResponse.json({
      success: true,
      message: "Service saved successfully.",
      data: newItem,
      allServices: updated,
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
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const current = getServicesList();
    const filtered = current.filter((s) => s.id !== id);
    saveServicesList(filtered);

    return NextResponse.json({ success: true, message: "Service deleted successfully.", allServices: filtered });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
