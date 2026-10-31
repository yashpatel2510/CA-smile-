import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getChairsList,
  saveOrUpdateChair,
  deleteChair,
  updateChairDoctor,
  updateChairStatus,
} from "@/lib/chairs-store";
import { getDoctorsList } from "@/lib/doctors-store";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Helper to verify Admin or Owner privileges
 */
async function verifyAdminOrOwner(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required. Please sign in as Clinic Admin or Owner.",
    };
  }

  const role = (session.user as any).role;
  const email = session.user.email?.toLowerCase().trim();
  const ownerEmails = (process.env.OWNER_EMAILS || "casmileatbilimora@gmail.com,applei74740@gmail.com")
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const isOwner = email && ownerEmails.includes(email);
  const isAdmin = role === "ADMIN";

  if (!isAdmin && !isOwner) {
    return {
      authorized: false,
      status: 403,
      error: "Access denied. Only Clinic Admin or Owner account can add, edit, or delete dental chairs.",
    };
  }

  return { authorized: true, user: session.user };
}

/**
 * Collect all available doctors from database, store, and configs
 */
async function getAllAvailableDoctors(): Promise<string[]> {
  const doctorsSet = new Set<string>();

  // 1. Primary Clinic Doctor
  doctorsSet.add("Dr. Deep Arvindbhai Patel");
  doctorsSet.add("Dr. Deep Patel");
  doctorsSet.add("Dr. Sankar (Chief Dental Surgeon)");

  // 2. From doctors-store
  try {
    const list = getDoctorsList();
    for (const d of list) {
      if (d.name) doctorsSet.add(d.name.trim());
    }
  } catch (err) {
    console.warn("Could not read doctors list:", err);
  }

  // 3. From booking-form-config.json
  try {
    const bookingPath = path.join(process.cwd(), "src", "data", "booking-form-config.json");
    if (fs.existsSync(bookingPath)) {
      const raw = fs.readFileSync(bookingPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.doctors)) {
        for (const doc of parsed.doctors) {
          if (doc && doc !== "Any Available Specialist") {
            doctorsSet.add(doc.trim());
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not read booking form config:", err);
  }

  // 4. From Database Staff Users (Doctors & Admins)
  try {
    const staffDocs = await prisma.staffUser.findMany({
      where: {
        isActive: true,
        role: { in: ["DOCTOR", "ADMIN"] },
      },
      select: { name: true, specialty: true },
    });
    for (const s of staffDocs) {
      if (s.name) doctorsSet.add(s.name.trim());
    }
  } catch (dbErr) {
    // Database fallback
  }

  return Array.from(doctorsSet).sort();
}

/**
 * GET /api/admin/queue/chairs
 * Fetch all configured chairs and list of available clinic doctors
 */
export async function GET() {
  try {
    const chairs = getChairsList();
    const availableDoctors = await getAllAvailableDoctors();

    return NextResponse.json({
      success: true,
      chairs,
      availableDoctors,
    });
  } catch (err: any) {
    console.error("Error fetching chairs:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load chairs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/queue/chairs
 * Create a new dental chair (Restricted to Admin / Owner)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminOrOwner(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Chair Name is required (e.g., 'Dental Chair 3')." },
        { status: 400 }
      );
    }

    if (!body.doctorName || !body.doctorName.trim()) {
      return NextResponse.json(
        { success: false, error: "Doctor Name is required." },
        { status: 400 }
      );
    }

    const newChair = saveOrUpdateChair({
      name: body.name.trim(),
      room: body.room?.trim() || `ROOM ${body.name.trim().toUpperCase()}`,
      doctorName: body.doctorName.trim(),
      doctorId: body.doctorId,
      specialty: body.specialty?.trim() || "General Consultation",
      description: body.description?.trim() || "Consultation Chair",
      colorTheme: body.colorTheme || "purple",
      status: body.status || "READY",
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({
      success: true,
      message: `Chair "${newChair.name}" created successfully.`,
      chair: newChair,
      chairs: getChairsList(),
    });
  } catch (err: any) {
    console.error("Error creating chair:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create chair" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/queue/chairs
 * Update an existing chair or change assigned doctor (Restricted to Admin / Owner)
 */
export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminOrOwner(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { id, action, doctorName, doctorId, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Chair ID is required." },
        { status: 400 }
      );
    }

    // Quick Doctor Update action
    if (action === "change_doctor") {
      if (!doctorName || !doctorName.trim()) {
        return NextResponse.json(
          { success: false, error: "Doctor name cannot be empty." },
          { status: 400 }
        );
      }
      const updated = updateChairDoctor(id, doctorName.trim(), doctorId);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Chair not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Doctor updated to "${updated.doctorName}" for ${updated.name}.`,
        chair: updated,
        chairs: getChairsList(),
      });
    }

    // Quick Status Update action
    if (action === "change_status" && status) {
      const updated = updateChairStatus(id, status);
      return NextResponse.json({
        success: true,
        message: `Status updated to ${status}.`,
        chair: updated,
        chairs: getChairsList(),
      });
    }

    // Full chair update
    const updated = saveOrUpdateChair({
      id,
      name: body.name?.trim(),
      room: body.room?.trim(),
      doctorName: body.doctorName?.trim(),
      doctorId: body.doctorId,
      specialty: body.specialty?.trim(),
      description: body.description?.trim(),
      colorTheme: body.colorTheme,
      status: body.status,
      isActive: body.isActive,
    });

    return NextResponse.json({
      success: true,
      message: `Chair "${updated.name}" updated successfully.`,
      chair: updated,
      chairs: getChairsList(),
    });
  } catch (err: any) {
    console.error("Error updating chair:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update chair" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/queue/chairs
 * Delete a dental chair (Restricted to Admin / Owner)
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminOrOwner(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Chair ID is required." },
        { status: 400 }
      );
    }

    const result = deleteChair(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Cannot delete chair." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chair removed successfully.",
      chairs: result.remaining,
    });
  } catch (err: any) {
    console.error("Error deleting chair:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete chair" },
      { status: 500 }
    );
  }
}
