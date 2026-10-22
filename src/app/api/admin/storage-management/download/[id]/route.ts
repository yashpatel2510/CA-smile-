import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only Clinic Owners (Admin) may download archive files.",
        },
        { status: 403 }
      );
    }

    const archiveId = params.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") === "csv" ? "csv" : "json";

    const fileName = `${archiveId}.${format}`;
    const filePath = path.join(process.cwd(), "src", "data", "archives", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "Archive file not found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const contentType = format === "csv" ? "text/csv; charset=utf-8" : "application/json";

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "X-Privacy-Warning": "CONFIDENTIAL: Contains archived healthcare records. Handle in accordance with clinical privacy rules.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to download archive" },
      { status: 500 }
    );
  }
}
