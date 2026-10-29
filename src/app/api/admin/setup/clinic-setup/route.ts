import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getClinicBrandingConfigAsync,
  updateClinicBrandingConfigAsync,
} from "@/lib/clinic-branding-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branding = await getClinicBrandingConfigAsync();
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

    // 2. Sync to branding store & PostgreSQL
    try {
      const branding = await getClinicBrandingConfigAsync();
      const partialUpdates: any = {};
      if (clinicName) partialUpdates.clinicName = clinicName;
      if (phone) partialUpdates.phone = phone;
      if (emergencyPhone) partialUpdates.emergencyPhone = emergencyPhone;
      if (email) partialUpdates.email = email;
      if (address) partialUpdates.address = address;
      if (city) partialUpdates.city = city;
      if (state) partialUpdates.state = state;
      if (postalCode) partialUpdates.postalCode = postalCode;
      if (workingHours) partialUpdates.workingHours = workingHours;
      if (doctorName) partialUpdates.doctorName = doctorName;
      if (doctorTitle) partialUpdates.doctorTitle = doctorTitle;
      if (doctorPhone) partialUpdates.doctorPhone = doctorPhone;
      if (doctorBio) partialUpdates.doctorBio = doctorBio;
      if (ownerName) partialUpdates.ownerName = ownerName;
      if (ownerTitle) partialUpdates.ownerTitle = ownerTitle;

      if (branding.logo || clinicName || tagline) {
        partialUpdates.logo = {
          ...(branding.logo || {}),
          ...(clinicName ? { clinicDisplayName: clinicName } : {}),
          ...(tagline ? { tagline } : {}),
        };
      }

      if (branding.hero || workingHours || city || address) {
        partialUpdates.hero = {
          ...(branding.hero || {}),
          ...(workingHours ? { topInfoWorkingHoursValue: workingHours } : {}),
          ...(city || address
            ? {
                topInfoLocationValue: city
                  ? `ABOVE HDFC BANK, ${city.toUpperCase()}`
                  : branding.hero?.topInfoLocationValue,
              }
            : {}),
        };
      }

      await updateClinicBrandingConfigAsync(partialUpdates);
    } catch (fsErr) {
      console.warn("Failed to sync branding config:", fsErr);
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
