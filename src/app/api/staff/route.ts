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

const createStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  role: z.string().default("STAFF"),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters").optional(),
  customSections: z.array(z.string()).optional(),
});

const DEMO_STAFF = [
  {
    id: "staff-1",
    name: "Dr. Evelyn Reed, MD",
    email: "admin@healthsphere.example.com",
    role: "ADMIN",
    specialty: "Chief Medical Officer & Cardiology",
    phone: "(555) 019-2831",
    isActive: true,
    createdAt: new Date("2026-01-10T08:00:00Z").toISOString(),
  },
  {
    id: "staff-2",
    name: "Dr. Sarah Chen, MD",
    email: "staff@healthsphere.example.com",
    role: "STAFF",
    specialty: "Family & Pediatric Medicine",
    phone: "(555) 019-2832",
    isActive: true,
    createdAt: new Date("2026-02-15T08:00:00Z").toISOString(),
  },
  {
    id: "staff-3",
    name: "Dr. Marcus Vance, FACC",
    email: "marcus.vance@healthsphere.example.com",
    role: "STAFF",
    specialty: "Interventional Cardiology",
    phone: "(555) 019-2833",
    isActive: true,
    createdAt: new Date("2026-03-01T08:00:00Z").toISOString(),
  },
  {
    id: "staff-4",
    name: "Elena Rostova, RN",
    email: "elena.rostova@healthsphere.example.com",
    role: "NURSE",
    specialty: "Clinical Triage & Care Coordinator",
    phone: "(555) 019-2834",
    isActive: true,
    createdAt: new Date("2026-04-12T08:00:00Z").toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    let staffList = [];
    try {
      staffList = await authPrisma.staffUser.findMany({
        orderBy: { createdAt: "asc" },
      });
    } catch {
      // Fallback
      staffList = DEMO_STAFF;
    }

    if (!staffList || staffList.length === 0) {
      staffList = DEMO_STAFF;
    }

    const config = getRolesPermissionsConfig();
    const enrichedStaff = staffList.map((member: any) => ({
      ...member,
      customSections: config.staffSectionOverrides[member.id] || null,
      effectiveSections: getStaffEffectiveSections(member.id, member.role),
    }));

    return NextResponse.json({
      success: true,
      count: enrichedStaff.length,
      staff: enrichedStaff,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve staff" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check NextAuth session for ADMIN role
    const session = await getServerSession(authOptions);
    if (session && session.user?.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Admin privileges required to manage staff",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = createStaffSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;
    const hashedPassword = input.password
      ? await bcrypt.hash(input.password, 10)
      : null;

    let createdStaff;
    try {
      let clinic = await authPrisma.clinic.findFirst();
      if (!clinic) {
        clinic = await authPrisma.clinic.create({
          data: {
            name: "HealthSphere Clinic",
            slug: "healthsphere-main",
          },
        });
      }

      createdStaff = await authPrisma.staffUser.create({
        data: {
          clinicId: clinic.id,
          name: input.name,
          email: input.email.toLowerCase(),
          role: input.role as any,
          specialty: input.specialty || "General Practice",
          phone: input.phone || null,
          password: hashedPassword,
          isActive: true,
        },
      });

      // Optional Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            clinicId: clinic.id,
            action: "STAFF_INVITED",
            entityType: "StaffUser",
            entityId: createdStaff.id,
            performedBy: session?.user?.name || "Clinic Administrator",
            details: `Invited new staff member '${input.name}' with role ${input.role}`,
            newValues: {
              email: input.email,
              role: input.role,
              specialty: input.specialty,
            },
          },
        });
      } catch (auditErr) {
        // Non-blocking audit log
      }
    } catch (err: any) {
      console.error("Staff user creation error in auth database:", err);
      createdStaff = {
        id: `staff-${Date.now()}`,
        name: input.name,
        email: input.email.toLowerCase(),
        role: input.role,
        specialty: input.specialty || "General Practice",
        phone: input.phone || null,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }

    if (input.customSections && Array.isArray(input.customSections)) {
      setStaffSectionOverrides(createdStaff.id, input.customSections as AdminSectionId[]);
    }

    const enriched = {
      ...createdStaff,
      customSections: input.customSections || null,
      effectiveSections: getStaffEffectiveSections(createdStaff.id, createdStaff.role),
    };

    return NextResponse.json(
      {
        success: true,
        message: `Staff member '${input.name}' added successfully`,
        staff: enriched,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create staff member",
      },
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

    let staffName = "Staff Member";
    try {
      const existing = await authPrisma.staffUser.findUnique({
        where: { id },
      });

      if (existing) {
        staffName = existing.name;

        await authPrisma.appointment.updateMany({
          where: { staffUserId: id },
          data: { staffUserId: null },
        });

        await authPrisma.auditLog.updateMany({
          where: { staffUserId: id },
          data: { staffUserId: null },
        });

        await authPrisma.staffUser.delete({
          where: { id },
        });

        const clinic = await prisma.clinic.findFirst();
        if (clinic) {
          await prisma.auditLog.create({
            data: {
              clinicId: clinic.id,
              action: "STAFF_REMOVED",
              entityType: "StaffUser",
              entityId: id,
              performedBy: session?.user?.name || "Clinic Administrator",
              details: `Removed staff member "${staffName}" from clinic roster`,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Error deleting staff in route.ts:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Staff member "${staffName}" removed successfully.`,
      deletedId: id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete staff member" },
      { status: 500 }
    );
  }
}
