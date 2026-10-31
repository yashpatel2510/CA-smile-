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

    const ext = path.extname(key).toLowerCase().replace(".", "");
    const mimeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      svg: "image/svg+xml",
      gif: "image/gif",
    };

    // 1. Try local public/images directory FIRST (instant 0ms response, zero DB overhead)
    try {
      const sanitizedKey = path.basename(key);
      const localFilePath = path.join(process.cwd(), "public", "images", sanitizedKey);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeMap[ext] || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (fsErr) {
      console.warn("Local media read error:", fsErr);
    }

    // 2. Try finding in database ClinicMedia table
    try {
      const media = await prisma.clinicMedia.findUnique({
        where: { key },
      });

      if (media && media.data) {
        // Strip data URI prefix if present
        const base64Data = media.data.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Cache to disk so subsequent requests serve immediately
        try {
          const sanitizedKey = path.basename(key);
          const localFilePath = path.join(process.cwd(), "public", "images", sanitizedKey);
          if (!fs.existsSync(localFilePath)) {
            fs.writeFile(localFilePath, buffer, () => {});
          }
        } catch {}

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": media.mimeType || mimeMap[ext] || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (dbErr) {
      console.warn("ClinicMedia lookup error:", dbErr);
    }

    // 3. Fallback checks for common alternative extensions or aliases
    try {
      const baseNameWithoutExt = key.replace(/\.[^/.]+$/, "");
      const possibleExtensions = ["jpg", "jpeg", "png", "webp"];
      for (const altExt of possibleExtensions) {
        const altFilePath = path.join(process.cwd(), "public", "images", `${baseNameWithoutExt}.${altExt}`);
        if (fs.existsSync(altFilePath)) {
          const fileBuffer = fs.readFileSync(altFilePath);
          return new NextResponse(fileBuffer, {
            headers: {
              "Content-Type": mimeMap[altExt] || "image/jpeg",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    } catch {}

    return new NextResponse("Media not found", { status: 404 });
  } catch (err: any) {
    console.error("GET /api/media/[key] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
