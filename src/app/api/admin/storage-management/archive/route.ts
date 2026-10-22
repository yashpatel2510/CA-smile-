import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  executeArchiveAndCleanup,
  ArchivableDataType,
} from "@/lib/database/archive-engine";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Session required" },
        { status: 401 }
      );
    }

    // Strict RBAC: Only ADMIN can perform archive and cleanup
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) may execute archive and cleanup operations.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      dataType,
      fromDate,
      toDate,
      useConfigRetention,
      deleteAfterArchive = true,
      confirmation,
    } = body;

    if (!dataType) {
      return NextResponse.json(
        { success: false, message: "Data type is required" },
        { status: 400 }
      );
    }

    if (dataType === "patients" || dataType === "clinical_services") {
      return NextResponse.json(
        {
          success: false,
          message: "Patient records and clinical services are strictly protected from automated archiving and deletion.",
        },
        { status: 400 }
      );
    }

    // Safety safeguard: typing "DELETE" is required if deletion is requested
    if (deleteAfterArchive && confirmation !== "DELETE") {
      return NextResponse.json(
        {
          success: false,
          message: "Security safeguard: You must type 'DELETE' in capital letters to confirm permanent cleanup.",
        },
        { status: 400 }
      );
    }

    const result = await executeArchiveAndCleanup(
      dataType as ArchivableDataType,
      session.user.name || "Clinic Owner",
      {
        fromDate,
        toDate,
        useConfigRetention,
        deleteAfterArchive,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to execute archive operation",
      },
      { status: 500 }
    );
  }
}
