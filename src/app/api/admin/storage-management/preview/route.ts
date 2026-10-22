import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  findEligibleRecords,
  ArchivableDataType,
} from "@/lib/database/archive-engine";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { dataType, fromDate, toDate, useConfigRetention } = body;

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
          message: "Patient records are strictly protected from automated archiving and deletion.",
        },
        { status: 400 }
      );
    }

    const candidates = await findEligibleRecords(
      dataType as ArchivableDataType,
      { fromDate, toDate, useConfigRetention }
    );

    const estimatedStorageMb = Number(((candidates.length * 1.8) / 1024).toFixed(2));

    return NextResponse.json({
      success: true,
      dataType,
      recordsFound: candidates.length,
      estimatedStorageMb,
      previewRecords: candidates.slice(0, 20), // Preview top 20 records
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to preview records",
      },
      { status: 500 }
    );
  }
}
