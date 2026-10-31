"use client";

import React from "react";
import { Check, ArrowRight, Phone } from "lucide-react";
import { useContactModal } from "@/components/public/contact-modal";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

interface SpecialityDetail {
  id?: string;
  title: string;
  subtitle: string;
  tag: string;
}

const SPECIALITY_DATA: SpecialityDetail[] = [
  {
    title: "Root Canal Treatment",
    subtitle: "Painless single-visit endodontics & tooth saving",
    tag: "Endodontics",
  },
  {
    title: "Digital Smile Designing",
    subtitle: "3D facial harmony & computer smile planning",
    tag: "Aesthetics",
  },
  {
    title: "Dental Implant",
    subtitle: "Permanent titanium implants & bone restoration",
    tag: "Implantology",
  },
  {
    title: "Dental Prosthesis (Crown, Bridge Etc.)",
    subtitle: "Zirconia crowns, durable bridges & aesthetic caps",
    tag: "Prosthodontics",
  },
  {
    title: "Orthodontics / Aligners",
    subtitle: "Invisible clear aligners & gentle tooth straightening",
    tag: "Orthodontics",
  },
];

interface DoctorIntroSectionProps {
  doctorName?: string;
  degree?: string;
  photoUrl?: string;
  className?: string;
}

export function DoctorIntroSection({
  doctorName: initialDoctorName,
  degree: initialDegree,
  photoUrl: initialPhotoUrl,
  className = "",
}: DoctorIntroSectionProps) {
  const { openContactModal } = useContactModal();
  const { brandConfig } = useClinicTheme();

  const introConfig = brandConfig?.doctorIntroSection;

  if (introConfig?.enabled === false) {
    return null;
  }

  const doctorName = introConfig?.doctorName || initialDoctorName || "Dr. DEEP A PATEL";
  const degree = introConfig?.degree || initialDegree || "BDS (DENTAL SURGEON)";
  const clinicTagline = introConfig?.clinicTagline ?? "CA Smile Bilimora";
  const photoUrl = introConfig?.photoUrl || initialPhotoUrl || "/images/dr-deep-patel-portrait.jpg";
  const specialityHeading = introConfig?.specialityHeading || "Speciality :";
  const specialities =
    Array.isArray(introConfig?.specialities) && introConfig.specialities.length > 0
      ? introConfig.specialities
      : SPECIALITY_DATA;

  // Adopt hero CTA button design & theme palette for visual unity
  const heroConfig = brandConfig?.hero;
  const btnBg = introConfig?.ctaButtonBgColor || heroConfig?.ctaButtonBgColor || "#9e0000";
  const btnTextColor = introConfig?.ctaButtonTextColor || heroConfig?.ctaButtonTextColor || "#ffffff";
  const btnBadgeBg = heroConfig?.ctaButtonBadgeBgColor || "#ffffff";
  const btnBadgeIconColor = heroConfig?.ctaButtonBadgeIconColor || btnBg;
  const btnRadius = heroConfig?.ctaButtonBorderRadius || "14px";
  const btnText = introConfig?.ctaButtonText || heroConfig?.ctaButtonText || "Book Your Appointment";
  
  const showPhone = introConfig?.showPhone !== false;
  const phone = introConfig?.phoneText || brandConfig?.phone || "+91 72260 98074";

  const handleBookAppointment = () => {
    if (typeof openContactModal === "function") {
      openContactModal({ doctor: doctorName });
    }
  };

  return (
    <section
      id="doctor-intro"
      className={`relative w-full pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-zinc-50/50 to-white dark:from-[#09090b] dark:via-zinc-950 dark:to-[#09090b] text-zinc-950 dark:text-zinc-50 transition-colors ${className}`}
      aria-label="Doctor Profile"
    >
      <div className="mx-auto max-w-6xl">
        
        {/* Aesthetic Minimalist Card Container */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-white dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xl shadow-zinc-200/40 dark:shadow-none p-6 sm:p-10 lg:p-12 transition-all duration-300">
          
          {/* Subtle Ambient Decorative Glows */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-zinc-100 dark:bg-zinc-800/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-zinc-100 dark:bg-zinc-800/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Clean Doctor Portrait (No Overlays, No Star Badges) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[360px] sm:max-w-[400px] lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-[24px] sm:rounded-[30px] overflow-hidden bg-zinc-900 shadow-xl ring-1 ring-black/10 dark:ring-white/10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={`${doctorName} - ${degree}`}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-102"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Clean Doctor Information (All Requested Clutter Removed) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7">
              
              {/* Doctor Name & Degree Heading */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-white font-sans leading-tight">
                  {doctorName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">
                    {degree}
                  </span>
                  {clinicTagline && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span>{clinicTagline}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Speciality Bento Micro-Cards Grid */}
              <div className="space-y-3.5 pt-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                  {specialityHeading}
                </h3>

                {/* 2-Column Responsive Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {specialities.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="group/card flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800/90 transition-all duration-200 shadow-2xs hover:shadow-xs"
                    >
                      {/* Black/White Minimalist Icon Badge */}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xs mt-0.5 group-hover/card:scale-105 transition-transform">
                        <Check className="h-3.5 w-3.5 stroke-[2.8]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Area: Hero-Style Appointment Button + Quick Call */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                {/* Hero-Style Button (Exact Match to Hero Section CTA) */}
                <button
                  type="button"
                  onClick={handleBookAppointment}
                  className="group relative inline-flex items-center font-medium shadow-md transition-all duration-200 select-none hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] cursor-pointer h-12 sm:h-13 pl-6 pr-2.5 gap-4 text-sm sm:text-base justify-between"
                  style={{
                    backgroundColor: btnBg,
                    color: btnTextColor,
                    borderRadius: btnRadius,
                  }}
                  aria-label={btnText}
                >
                  <span className="font-heading font-semibold tracking-wide">
                    {btnText}
                  </span>
                  <span
                    className="shadow-xs flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{
                      backgroundColor: btnBadgeBg,
                    }}
                    aria-hidden="true"
                  >
                    <ArrowRight
                      className="h-4 w-4 stroke-[2.4] transition-colors"
                      style={{
                        color: btnBadgeIconColor,
                      }}
                    />
                  </span>
                </button>

                {/* Direct Telephone Consultation Pill */}
                {showPhone && phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Call: {phone}</span>
                  </a>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
