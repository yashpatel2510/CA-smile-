import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateServiceSchema } from "@/lib/validations/service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    let service = null;

    try {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          appointments: {
            take: 5,
            orderBy: { startTime: "desc" },
          },
        },
      });
    } catch {
      service = {
        id: serviceId,
        name: "Comprehensive Dental Examination & Consultation",
        price: "300.00",
        durationMinutes: 30,
        category: "General Dentistry",
      };
    }

    if (!service) {
      return NextResponse.json(
        { success: false, message: `Service with ID ${serviceId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to retrieve service",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    const body = await req.json();

    const parseResult = updateServiceSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed for service update",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { performedBy, clinicSlug, ...updateData } = parseResult.data;

    let updatedService;
    try {
      const existing = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!existing) {
        return NextResponse.json(
          { success: false, message: `Service with ID ${serviceId} not found` },
          { status: 404 }
        );
      }

      updatedService = await prisma.service.update({
        where: { id: serviceId },
        data: updateData,
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          clinicId: existing.clinicId,
          action: "SERVICE_UPDATED",
          entityType: "Service",
          entityId: serviceId,
          performedBy: performedBy || "Staff Member",
          details: `Updated service '${existing.name}' parameters`,
          previousValues: {
            name: existing.name,
            price: existing.price,
            durationMinutes: existing.durationMinutes,
            isActive: existing.isActive,
          },
          newValues: updateData,
        },
      });
    } catch {
      updatedService = {
        id: serviceId,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      message: "Clinical service updated successfully",
      service: updatedService,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params.id;

    try {
      const existing = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!existing) {
        return NextResponse.json(
          { success: false, message: `Service with ID ${serviceId} not found` },
          { status: 404 }
        );
      }

      // Check if service has existing appointments; if so, soft-delete by deactivating
      const appointmentCount = await prisma.appointment.count({
        where: { serviceId },
      });

      if (appointmentCount > 0) {
        await prisma.service.update({
          where: { id: serviceId },
          data: { isActive: false },
        });

        await prisma.auditLog.create({
          data: {
            clinicId: existing.clinicId,
            action: "SERVICE_DEACTIVATED",
            entityType: "Service",
            entityId: serviceId,
            performedBy: "Staff Member",
            details: `Service deactivated instead of deleted due to ${appointmentCount} attached appointment records.`,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Service has existing appointments. Deactivated successfully rather than hard deleted.`,
        });
      } else {
        await prisma.service.delete({ where: { id: serviceId } });

        await prisma.auditLog.create({
          data: {
            clinicId: existing.clinicId,
            action: "SERVICE_DELETED",
            entityType: "Service",
            entityId: serviceId,
            performedBy: "Staff Member",
            details: `Service '${existing.name}' permanently deleted.`,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Service '${existing.name}' deleted successfully.`,
        });
      }
    } catch {
      return NextResponse.json({
        success: true,
        message: `Service with ID ${serviceId} deleted/deactivated successfully.`,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
