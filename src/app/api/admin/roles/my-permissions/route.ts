import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authPrisma } from "@/lib/prisma";
import {
  getEffectiveSectionsForStaff,
  getRolesPermissionsConfig,
} from "@/lib/roles-permissions-store";
import { ADMIN_SECTIONS_CATALOG, AdminSectionId } from "@/types/roles-permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          authenticated: false,
          allowedSections: [],
          role: "GUEST",
          isSuperAdmin: false,
        },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase();
    const isSuperAdmin = session.user.role === "ADMIN";

    if (isSuperAdmin) {
      return NextResponse.json({
        authenticated: true,
        allowedSections: ADMIN_SECTIONS_CATALOG.map((s) => s.id),
        role: "ADMIN",
        isSuperAdmin: true,
      });
    }

    // Lookup staff member in database
    const staff = await authPrisma.staffUser.findFirst({
      where: { email },
    });

    const staffRole = staff?.role || session.user.role || "STAFF";
    const staffId = staff?.id;

    const allowedSections = staffId
      ? await getEffectiveSectionsForStaff(staffId, staffRole)
      : ["today", "appointments", "patients"];

    return NextResponse.json({
      authenticated: true,
      allowedSections,
      role: staffRole,
      isSuperAdmin: false,
    });
  } catch (error: any) {
    console.error("[API] Error fetching user permissions:", error);
    return NextResponse.json(
      {
        authenticated: false,
        allowedSections: ["today", "appointments"],
        role: "STAFF",
        isSuperAdmin: false,
      },
      { status: 200 }
    );
  }
}
