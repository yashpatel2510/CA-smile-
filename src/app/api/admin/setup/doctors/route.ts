import { NextResponse } from "next/server";
import {
  getDoctorsList,
  saveOrUpdateDoctor,
  deleteDoctor,
} from "@/lib/doctors-store";

export async function GET() {
  try {
    const doctors = getDoctorsList();
    return NextResponse.json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load doctors" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Doctor name is required." },
        { status: 400 }
      );
    }

    const saved = saveOrUpdateDoctor(body);
    return NextResponse.json({
      success: true,
      message: "Doctor profile saved successfully.",
      data: saved,
    });
  } catch (error: any) {
    console.error("Error saving doctor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save doctor profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Doctor ID is required." },
        { status: 400 }
      );
    }

    const removed = deleteDoctor(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: "Doctor not found or already removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Doctor removed successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete doctor" },
      { status: 500 }
    );
  }
}
