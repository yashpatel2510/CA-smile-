import { NextRequest, NextResponse } from "next/server";
import { getMediaByKey } from "@/lib/media-storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = params?.key;
    if (!key) {
      return new NextResponse("Media key is required", { status: 400 });
    }

    const media = await getMediaByKey(key);
    if (!media) {
      return new NextResponse("Media not found", { status: 404 });
    }

    return new Response(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": media.size.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("Error serving media:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
