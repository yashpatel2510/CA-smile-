import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    if (!key) {
      return new NextResponse("Key required", { status: 400 });
    }

    // 1. Try finding in database ClinicMedia table
    try {
      const media = await prisma.clinicMedia.findUnique({
        where: { key },
      });

      if (media && media.data) {
        // Strip data URI prefix if present
        const base64Data = media.data.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": media.mimeType || "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (dbErr) {
      console.warn("ClinicMedia lookup error:", dbErr);
    }

    // 2. Fallback to local public/images directory if available
    try {
      const localFilePath = path.join(process.cwd(), "public", "images", key);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const ext = path.extname(key).toLowerCase().replace(".", "");
        const mimeMap: Record<string, string> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          svg: "image/svg+xml",
        };
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeMap[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    } catch {
      // ignore
    }

    return new NextResponse("Media not found", { status: 404 });
  } catch (err: any) {
    console.error("GET /api/media/[key] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
