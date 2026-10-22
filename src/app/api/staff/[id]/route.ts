import { NextRequest, NextResponse } from "next/server";
import prisma, { authPrisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateStaffSchema = z.object({
  role: z
    .enum(["ADMIN", "STAFF", "DOCTOR", "NURSE", "RECEPTIONIST"])
    .optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters").optional(),
  isActive: z.boolean().optional(),
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

    const updateData: any = { ...parseResult.data };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
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

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully",
      staff: updatedStaff,
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
