import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllRoles,
  createCustomRole,
  updateRole,
  deleteRole,
} from "@/lib/roles-permissions-store";
import { ADMIN_SECTIONS_CATALOG, RoleBadgeColor, AdminSectionId } from "@/types/roles-permissions";
import { authPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const roles = getAllRoles();

    // Query staff count per role from database
    let memberCounts: Record<string, number> = {};
    try {
      const staffMembers = await authPrisma.staffUser.findMany({
        select: { id: true, role: true },
      });
      for (const member of staffMembers) {
        const rKey = member.role.toUpperCase();
        memberCounts[rKey] = (memberCounts[rKey] || 0) + 1;
      }
    } catch {
      // Fallback
    }

    const rolesWithCounts = roles.map((role) => ({
      ...role,
      memberCount: memberCounts[role.key.toUpperCase()] || 0,
    }));

    return NextResponse.json({
      success: true,
      roles: rolesWithCounts,
      sections: ADMIN_SECTIONS_CATALOG,
    });
  } catch (error: any) {
    console.error("GET /api/admin/roles error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load roles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, badgeColor, description, allowedSections } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Role name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!Array.isArray(allowedSections)) {
      return NextResponse.json(
        { success: false, message: "allowedSections must be an array of section ids" },
        { status: 400 }
      );
    }

    const created = createCustomRole({
      name,
      badgeColor: (badgeColor as RoleBadgeColor) || "indigo",
      description,
      allowedSections: allowedSections as AdminSectionId[],
    });

    return NextResponse.json(
      {
        success: true,
        message: `Custom role '${created.name}' created successfully`,
        role: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/roles error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create role" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, badgeColor, description, allowedSections } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Role id or key is required" },
        { status: 400 }
      );
    }

    const updated = updateRole(id, {
      name,
      badgeColor,
      description,
      allowedSections,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role '${updated.name}' updated successfully`,
      role: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/roles error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'id' is required" },
        { status: 400 }
      );
    }

    const deleted = deleteRole(id);
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete built-in system roles (ADMIN, DOCTOR, RECEPTIONIST, etc.)",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Custom role deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/roles error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete role" },
      { status: 500 }
    );
  }
}
