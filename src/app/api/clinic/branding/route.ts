import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getClinicBrandingConfig,
  updateClinicBrandingConfig,
  resetClinicBrandingConfig,
} from "@/lib/clinic-branding-store";
import { ClinicBrandConfig, DEFAULT_CLINIC_BRANDING } from "@/types/branding";

/**
 * Helper to store base64 images into database ClinicMedia table
 * and return public /api/media/[key] URL so it works seamlessly on Vercel
 */
async function persistMediaToDatabase(
  dataUri?: string,
  prefix = "branding"
): Promise<string | undefined> {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:image/")) {
    return dataUri;
  }

  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return dataUri;

    const ext = matches[1].replace("+xml", "") || "png";
    const mimeType = `image/${ext === "svg" ? "svg+xml" : ext}`;
    const rawData = matches[2];
    const buffer = Buffer.from(rawData, "base64");
    const key = `${prefix}-${Date.now()}.${ext}`;

    // 1. Save directly to Supabase PostgreSQL ClinicMedia table
    await prisma.clinicMedia.upsert({
      where: { key },
      create: {
        key,
        data: rawData,
        mimeType,
        size: buffer.length,
      },
      update: {
        data: rawData,
        mimeType,
        size: buffer.length,
        updatedAt: new Date(),
      },
    });

    // 2. Return URL served by Next.js from database
    return `/api/media/${key}`;
  } catch (err) {
    console.warn("Failed to persist media to ClinicMedia table, keeping data URI:", err);
    return dataUri;
  }
}

export async function GET() {
  try {
    // 1. Try loading from Supabase PostgreSQL database (Live across Vercel)
    try {
      const clinic = await prisma.clinic.findFirst();
      if (clinic?.brandingConfig && typeof clinic.brandingConfig === "object") {
        const dbConfig = clinic.brandingConfig as any;
        const merged: ClinicBrandConfig = {
          ...DEFAULT_CLINIC_BRANDING,
          ...dbConfig,
          logo: {
            ...DEFAULT_CLINIC_BRANDING.logo,
            ...(dbConfig.logo || {}),
          },
          hero: {
            ...DEFAULT_CLINIC_BRANDING.hero!,
            ...(dbConfig.hero || {}),
          },
          aboutSection: {
            ...DEFAULT_CLINIC_BRANDING.aboutSection!,
            ...(dbConfig.aboutSection || {}),
          },
          gallery: {
            ...DEFAULT_CLINIC_BRANDING.gallery!,
            ...(dbConfig.gallery || {}),
            photos:
              Array.isArray(dbConfig.gallery?.photos) && dbConfig.gallery.photos.length > 0
                ? dbConfig.gallery.photos
                : DEFAULT_CLINIC_BRANDING.gallery!.photos,
          },
        };
        global.__clinicBrandingCache = merged;
        return NextResponse.json({
          success: true,
          source: "database",
          branding: merged,
        });
      }
    } catch (dbErr) {
      console.warn("Database branding fetch error, falling back to local file:", dbErr);
    }

    // 2. Fallback to local config file
    const branding = getClinicBrandingConfig();
    return NextResponse.json({
      success: true,
      source: "local-file",
      branding,
    });
  } catch (error) {
    console.error("Error retrieving clinic branding:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve clinic branding." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Only Clinic Owner (ADMIN) has authorization to change clinic branding/logo
    const session = await getServerSession(authOptions);
    if (session?.user && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Forbidden: Clinic Owner (Admin) privileges are required to change clinic logo and branding settings.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === "reset") {
      const resetConfig = resetClinicBrandingConfig();
      try {
        const clinic = await prisma.clinic.findFirst();
        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: {
              brandingConfig: resetConfig as any,
              themeKey: DEFAULT_CLINIC_BRANDING.themeKey,
            },
          });
        }
      } catch (dbResetErr) {
        console.warn("Could not reset database branding config:", dbResetErr);
      }
      return NextResponse.json({
        success: true,
        message: "Clinic branding reset to defaults in database and memory.",
        branding: resetConfig,
      });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    // 1. Process base64 images into database ClinicMedia table
    const incomingHero = { ...(body.hero || {}) } as Record<string, any>;
    if (incomingHero.imageUrl && typeof incomingHero.imageUrl === "string" && incomingHero.imageUrl.startsWith("data:image/")) {
      incomingHero.imageUrl = await persistMediaToDatabase(incomingHero.imageUrl, "hero-desktop");
    }
    if (incomingHero.mobileImageUrl && typeof incomingHero.mobileImageUrl === "string" && incomingHero.mobileImageUrl.startsWith("data:image/")) {
      incomingHero.mobileImageUrl = await persistMediaToDatabase(incomingHero.mobileImageUrl, "hero-mobile");
    }
    if (incomingHero.doctorBoxPhotoUrl && typeof incomingHero.doctorBoxPhotoUrl === "string" && incomingHero.doctorBoxPhotoUrl.startsWith("data:image/")) {
      incomingHero.doctorBoxPhotoUrl = await persistMediaToDatabase(incomingHero.doctorBoxPhotoUrl, "doctor-avatar");
    }

    const incomingLogo = { ...(body.logo || {}) } as Record<string, any>;
    if (incomingLogo.imageUrl && typeof incomingLogo.imageUrl === "string" && incomingLogo.imageUrl.startsWith("data:image/")) {
      incomingLogo.imageUrl = (await persistMediaToDatabase(incomingLogo.imageUrl, "clinic-logo")) || "";
    }

    const incomingGallery = { ...(body.gallery || {}) } as Record<string, any>;
    if (
      incomingGallery.centerLogoUrl &&
      typeof incomingGallery.centerLogoUrl === "string" &&
      incomingGallery.centerLogoUrl.startsWith("data:image/")
    ) {
      incomingGallery.centerLogoUrl =
        (await persistMediaToDatabase(incomingGallery.centerLogoUrl, "gallery-logo")) || "";
    }
    if (Array.isArray(incomingGallery.photos)) {
      const processedPhotos = [];
      for (let idx = 0; idx < incomingGallery.photos.length; idx++) {
        const photo = incomingGallery.photos[idx];
        if (photo && photo.src && typeof photo.src === "string" && photo.src.startsWith("data:image/")) {
          const persistedSrc = await persistMediaToDatabase(photo.src, `polaroid-${idx + 1}`);
          processedPhotos.push({
            ...photo,
            src: persistedSrc || photo.src,
          });
        } else {
          processedPhotos.push(photo);
        }
      }
      incomingGallery.photos = processedPhotos;
    }

    const processedPayload = {
      ...body,
      hero: {
        ...(body.hero || {}),
        ...incomingHero,
      },
      logo: {
        ...(body.logo || {}),
        ...incomingLogo,
      },
      gallery: {
        ...(body.gallery || {}),
        ...incomingGallery,
      },
    };

    // 2. Update local disk/memory cache
    const updated = updateClinicBrandingConfig(processedPayload);

    // 3. Persist permanently to Supabase PostgreSQL Database (ensures live Vercel updates!)
    try {
      const clinic = await prisma.clinic.findFirst();
      if (clinic) {
        await prisma.clinic.update({
          where: { id: clinic.id },
          data: {
            brandingConfig: updated as any,
            name: updated.clinicName || clinic.name,
            phone: updated.phone || clinic.phone,
            address: updated.address || clinic.address,
            city: updated.city || clinic.city,
            state: updated.state || clinic.state,
            postalCode: updated.postalCode || clinic.postalCode,
            themeKey: updated.themeKey || clinic.themeKey,
            logoUrl: updated.logo?.imageUrl || clinic.logoUrl,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Could not persist brandingConfig to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Clinic branding and logo updated successfully in database and live website.",
      branding: updated,
    });
  } catch (error) {
    console.error("Error updating clinic branding:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update clinic branding." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
