import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";
import fs from "fs";
import path from "path";

const CONFIG_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "clinic-branding-config.json"
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branding = getClinicBrandingConfig();
    const clinic = await prisma.clinic.findFirst().catch(() => null);

    const clinicName =
      branding.clinicName && branding.clinicName !== "PedioDent"
        ? branding.clinicName
        : clinic?.name || "Smile Dental Clinic";

    const phone =
      branding.phone && branding.phone !== "(800) 555-CLINIC"
        ? branding.phone
        : clinic?.phone || "+91 9664681536";

    const email =
      branding.email && branding.email !== "contact@pediodent.example.com"
        ? branding.email
        : clinic?.email || "contact@smiledental.example.com";

    const address =
      branding.address && !branding.address.includes("Evergreen Medical Way")
        ? branding.address
        : clinic?.address ||
          "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321";

    const city = branding.city || clinic?.city || "Bilimora";
    const state = branding.state || clinic?.state || "Gujarat";
    const postalCode = branding.postalCode || clinic?.postalCode || "396321";

    return NextResponse.json({
      success: true,
      data: {
        clinicName,
        tagline: branding.logo?.tagline || "Dental Clinic & Oral Healthcare",
        description:
          clinic?.description ||
          branding.ownerBio ||
          "Specialized Dental Surgery, Oral Restorations & Family Healthcare Center",
        phone,
        emergencyPhone: branding.emergencyPhone || phone,
        email,
        address,
        city,
        state,
        postalCode,
        workingHours:
          branding.workingHours ||
          "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only",
        doctorName: branding.doctorName || "Dr. Sankar",
        doctorTitle:
          branding.doctorTitle || "Chief Dental Surgeon & Clinic Founder",
        doctorPhone: branding.doctorPhone || "+91 98470 12345",
        doctorBio:
          branding.doctorBio ||
          "Distinguished clinician with over 15 years of surgical excellence in implantology, painless endodontics, and restorative oral rehabilitation.",
        ownerName: branding.ownerName || "Dr. Sankar & Associates",
        ownerTitle:
          branding.ownerTitle || "Clinic Owner & Managing Director",
      },
    });
  } catch (error: any) {
    console.error("Error fetching clinic setup:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load clinic info" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      clinicName,
      tagline,
      description,
      phone,
      emergencyPhone,
      email,
      address,
      city,
      state,
      postalCode,
      workingHours,
      doctorName,
      doctorTitle,
      doctorPhone,
      doctorBio,
      ownerName,
      ownerTitle,
    } = body;

    // 1. Update in PostgreSQL database
    let clinic = await prisma.clinic.findFirst().catch(() => null);
    if (clinic) {
      await prisma.clinic.update({
        where: { id: clinic.id },
        data: {
          name: clinicName || clinic.name,
          phone: phone || clinic.phone,
          email: email || clinic.email,
          address: address || clinic.address,
          city: city || clinic.city,
          state: state || clinic.state,
          postalCode: postalCode || clinic.postalCode,
          description: description || clinic.description,
        },
      });
    }

    // 2. Sync to JSON configuration file
    try {
      if (fs.existsSync(CONFIG_FILE_PATH)) {
        const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);

        if (clinicName) parsed.clinicName = clinicName;
        if (phone) parsed.phone = phone;
        if (emergencyPhone) parsed.emergencyPhone = emergencyPhone;
        if (email) parsed.email = email;
        if (address) parsed.address = address;
        if (city) parsed.city = city;
        if (state) parsed.state = state;
        if (postalCode) parsed.postalCode = postalCode;
        if (workingHours) parsed.workingHours = workingHours;
        if (doctorName) parsed.doctorName = doctorName;
        if (doctorTitle) parsed.doctorTitle = doctorTitle;
        if (doctorPhone) parsed.doctorPhone = doctorPhone;
        if (doctorBio) parsed.doctorBio = doctorBio;
        if (ownerName) parsed.ownerName = ownerName;
        if (ownerTitle) parsed.ownerTitle = ownerTitle;

        if (parsed.logo) {
          if (clinicName) {
            parsed.logo.clinicDisplayName = clinicName;
          }
          if (tagline) {
            parsed.logo.tagline = tagline;
          }
        }

        if (parsed.hero) {
          if (workingHours) {
            parsed.hero.topInfoWorkingHoursValue = workingHours;
          }
          if (city || address) {
            parsed.hero.topInfoLocationValue = city
              ? `ABOVE HDFC BANK, ${city.toUpperCase()}`
              : parsed.hero.topInfoLocationValue;
          }
        }

        fs.writeFileSync(
          CONFIG_FILE_PATH,
          JSON.stringify(parsed, null, 2),
          "utf-8"
        );

        if (global.__clinicBrandingCache) {
          global.__clinicBrandingCache = {
            ...global.__clinicBrandingCache,
            ...parsed,
          };
        }

        // Persist to database brandingConfig
        if (clinic) {
          await prisma.clinic.update({
            where: { id: clinic.id },
            data: {
              brandingConfig: parsed,
            },
          });
        }
      }
    } catch (fsErr) {
      console.warn("Failed to sync branding config json:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Clinic information updated successfully across system",
    });
  } catch (error: any) {
    console.error("Error updating clinic setup:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update clinic info" },
      { status: 500 }
    );
  }
}
