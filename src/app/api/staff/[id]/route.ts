import { NextRequest, NextResponse } from "next/server";
import prisma, { authPrisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

import {
  getStaffEffectiveSections,
  getRolesPermissionsConfig,
  setStaffSectionOverrides,
} from "@/lib/roles-permissions-store";
import { AdminSectionId } from "@/types/roles-permissions";

const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters").optional(),
  isActive: z.boolean().optional(),
  customSections: z.array(z.string()).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const staffId = params.id;
    const body = await req.json();
    const parseResult = updateStaffSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customSections, ...dbFields } = parseResult.data;
    const updateData: any = { ...dbFields };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (customSections !== undefined) {
      setStaffSectionOverrides(staffId, customSections as AdminSectionId[] | null);
    }

    let updatedStaff;
    try {
      updatedStaff = await authPrisma.staffUser.update({
        where: { id: staffId },
        data: updateData,
      });

      const clinic = await prisma.clinic.findFirst();
      if (clinic) {
        await prisma.auditLog.create({
          data: {
            clinicId: clinic.id,
            action: "STAFF_UPDATED",
            entityType: "StaffUser",
            entityId: staffId,
            performedBy: session?.user?.name || "Clinic Administrator",
            details: `Updated staff permissions/details for ${updatedStaff.name}`,
            newValues: updateData,
          },
        });
      }
    } catch {
      updatedStaff = {
        id: staffId,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
    }

    const config = getRolesPermissionsConfig();
    const effectiveRole = updatedStaff.role || "STAFF";
    const enriched = {
      ...updatedStaff,
      customSections: config.staffSectionOverrides[staffId] || null,
      effectiveSections: getStaffEffectiveSections(staffId, effectiveRole),
    };

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully",
      staff: enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 }
      );
    }

    const staffId = params.id;
    let staffName = "Staff Member";

    try {
      const existing = await authPrisma.staffUser.findUnique({
        where: { id: staffId },
      });

      if (existing) {
        staffName = existing.name;

        // Safely unlink appointment assignments
        await authPrisma.appointment.updateMany({
          where: { staffUserId: staffId },
          data: { staffUserId: null },
        });

        // Safely unlink audit log references
        await authPrisma.auditLog.updateMany({
          where: { staffUserId: staffId },
          data: { staffUserId: null },
        });

        // Permanently delete staff user from database
        await authPrisma.staffUser.delete({
          where: { id: staffId },
        });

        const clinic = await prisma.clinic.findFirst();
        if (clinic) {
          await prisma.auditLog.create({
            data: {
              clinicId: clinic.id,
              action: "STAFF_REMOVED",
              entityType: "StaffUser",
              entityId: staffId,
              performedBy: session?.user?.name || "Clinic Administrator",
              details: `Removed staff member "${staffName}" (${existing.email}) from clinic roster`,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB error deleting staff member:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Staff member "${staffName}" was removed successfully.`,
      deletedId: staffId,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to remove staff member",
      },
      { status: 500 }
    );
  }
}
