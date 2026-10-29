import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface StoredMedia {
  key: string;
  data: Buffer;
  mimeType: string;
  size: number;
}

/**
 * Persists a base64 image into Supabase PostgreSQL (ClinicMedia table)
 * and returns a public URL: /api/media/{key}
 *
 * If the input is already a normal URL or path, it returns it unchanged.
 */
export async function persistMediaAsync(
  dataUri?: string,
  prefix = "media"
): Promise<string | undefined> {
  if (!dataUri || typeof dataUri !== "string") return dataUri;
  if (!dataUri.startsWith("data:image/")) return dataUri;

  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUri;

    const ext = matches[1].replace("+xml", "") || "png";
    const mimeType = `image/${matches[1]}`;
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const key = `${prefix}-${Date.now()}.${ext}`;

    // 1. Persist to Supabase Database (survives Vercel serverless deployments)
    try {
      await (prisma as any).clinicMedia.upsert({
        where: { key },
        update: {
          data: base64Data,
          mimeType,
          size: buffer.length,
          updatedAt: new Date(),
        },
        create: {
          key,
          data: base64Data,
          mimeType,
          size: buffer.length,
        },
      });
    } catch (dbErr) {
      console.error("Failed to persist media to database, fallback to local:", dbErr);
    }

    // 2. Best-effort write to local filesystem if writable (development convenience)
    try {
      const uploadDir = path.join(process.cwd(), "public", "images");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, key), buffer);
    } catch {
      // Ignore read-only filesystem errors on Vercel
    }

    return `/api/media/${key}`;
  } catch (err) {
    console.error("Failed to process media storage:", err);
    return dataUri;
  }
}

/**
 * Synchronous fallback for legacy functions
 */
export function persistMediaSync(dataUri?: string, prefix = "media"): string | undefined {
  if (!dataUri || !dataUri.startsWith("data:image/")) return dataUri;
  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUri;
    const ext = matches[1].replace("+xml", "") || "png";
    const buffer = Buffer.from(matches[2], "base64");
    const key = `${prefix}-${Date.now()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, key), buffer);
    return `/images/${key}`;
  } catch {
    return dataUri;
  }
}

/**
 * Retrieves media by key from Supabase DB or local disk
 */
export async function getMediaByKey(key: string): Promise<StoredMedia | null> {
  // 1. Try Supabase database first
  try {
    const record = await (prisma as any).clinicMedia.findUnique({
      where: { key },
    });
    if (record && record.data) {
      return {
        key: record.key,
        data: Buffer.from(record.data, "base64"),
        mimeType: record.mimeType || "image/png",
        size: record.size || 0,
      };
    }
  } catch (err) {
    console.warn("Could not retrieve media from database:", err);
  }

  // 2. Try local filesystem fallback
  try {
    const localPath = path.join(process.cwd(), "public", "images", key);
    if (fs.existsSync(localPath)) {
      const data = fs.readFileSync(localPath);
      const ext = path.extname(key).replace(".", "").toLowerCase();
      const mimeMap: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        svg: "image/svg+xml",
        gif: "image/gif",
      };
      return {
        key,
        data,
        mimeType: mimeMap[ext] || "application/octet-stream",
        size: data.length,
      };
    }
  } catch {
    // ignore
  }

  return null;
}
