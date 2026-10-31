import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setStaffSectionOverrides, getStaffEffectiveSections } from "@/lib/roles-permissions-store";
import { AdminSectionId } from "@/types/roles-permissions";
import { authPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { staffId, allowedSections } = body;

    if (!staffId) {
      return NextResponse.json(
        { success: false, message: "staffId is required" },
        { status: 400 }
      );
    }

    let memberRole = "STAFF";
    try {
      const member = await authPrisma.staffUser.findUnique({
        where: { id: staffId },
        select: { role: true },
      });
      if (member) memberRole = member.role;
    } catch {}

    const sections = Array.isArray(allowedSections)
      ? (allowedSections as AdminSectionId[])
      : null;

    setStaffSectionOverrides(staffId, sections);

    const effective = getStaffEffectiveSections(staffId, memberRole);

    return NextResponse.json({
      success: true,
      message: sections === null ? "Restored default role permissions" : "Custom section permissions saved",
      staffId,
      effectiveSections: effective,
      isCustom: sections !== null,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/roles/staff-permissions error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update staff permissions" },
      { status: 500 }
    );
  }
}
