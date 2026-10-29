import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getBookingFormConfig,
  updateBookingFormConfig,
  resetBookingFormConfig,
} from "@/lib/booking-form-store";

export async function GET() {
  try {
    // 1. Try reading from Supabase PostgreSQL database
    try {
      const clinic = await prisma.clinic.findFirst();
      if (clinic?.formConfig && typeof clinic.formConfig === "object") {
        return NextResponse.json({
          success: true,
          source: "database",
          config: clinic.formConfig,
        });
      }
    } catch (dbErr) {
      console.warn("Database form config fetch error:", dbErr);
    }

    // 2. Fallback to local config file
    const config = getBookingFormConfig();
    return NextResponse.json({
      success: true,
      source: "local-file",
      config,
    });
  } catch (error) {
    console.error("Error fetching booking form config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking form configuration." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check RBAC session: Only ADMIN (Clinic Owner) can alter form structure/fields
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: Clinic Owner (Admin) privileges are required to modify website structure and booking form fields. Staff members are restricted to operational views.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === "reset") {
      const resetConfig = resetBookingFormConfig();
      try {
        const clinic = await prisma.clinic.findFirst();
        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: { formConfig: resetConfig as any },
          });
        }
      } catch (dbResetErr) {
        console.warn("Could not reset formConfig in database:", dbResetErr);
      }
      return NextResponse.json({
        success: true,
        message: "Booking form configuration reset to clinic defaults in database.",
        config: resetConfig,
      });
    }

    // Validate structure
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid configuration payload." },
        { status: 400 }
      );
    }

    // 1. Update local cache
    const updatedConfig = updateBookingFormConfig(body);

    // 2. Persist to Supabase PostgreSQL Database (ensures live Vercel updates!)
    try {
      const clinic = await prisma.clinic.findFirst();
      if (clinic) {
        await prisma.clinic.update({
          where: { id: clinic.id },
          data: { formConfig: updatedConfig as any },
        });
      }
    } catch (dbErr) {
      console.warn("Could not persist formConfig to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Booking form configuration updated successfully in database and live website.",
      config: updatedConfig,
    });
  } catch (error) {
    console.error("Error updating booking form config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking form configuration." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
