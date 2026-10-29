"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

interface ClinicMapSectionProps {
  className?: string;
}

const CLINIC_MAP_URL =
  "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111";

// Exact full clinic address to stick the map to
const STUCK_LOCATION_ADDRESS =
  "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321";

function TeardropPin({
  className = "w-8 h-10",
  color = "#E53935",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z"
        fill={color}
      />
      <circle cx="12" cy="11" r="4.5" fill="#FFFFFF" />
    </svg>
  );
}

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ClinicMapSection({ className = "" }: ClinicMapSectionProps) {
  const pathname = usePathname();
  const { brandConfig } = useClinicTheme();

  // Hide on contact page per user request
  if (pathname === "/contact") {
    return null;
  }

  // Dynamic Clinic Details from Admin Panel Config
  const sectionBgColor = brandConfig.mapSectionBgColor || "#ffffff";
  const mapStyle = brandConfig.mapStyle || "dark";
  const clinicName = brandConfig.mapCardTitle || brandConfig.clinicName || "CA Smile Dental Clinic";
  const displayAddress =
    brandConfig.address || "1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA";
  const exactAddress = brandConfig.mapExactAddress || STUCK_LOCATION_ADDRESS;
  const email = brandConfig.email || "casmileatbilimora@gmail.com";
  const phone = brandConfig.phone || "+91 72260 98074";
  const sectionTitle = brandConfig.mapSectionTitle || "ADDRESS";
  const cardImage = brandConfig.mapCardImage || "/images/ca-smile-clinic-building.jpg";
  const pinPulse = brandConfig.mapPinPulse !== false;
  const pinColor = brandConfig.mapPinColor || "#E53935";

  // Social Links
  const instagramUrl = brandConfig.instagramUrl || "https://instagram.com";
  const rawWhatsapp = brandConfig.whatsappPhone || phone;
  const whatsappHref = rawWhatsapp.startsWith("http")
    ? rawWhatsapp
    : `https://wa.me/${rawWhatsapp.replace(/\D/g, "")}`;
  const clinicMapUrl = brandConfig.googleMapsUrl || CLINIC_MAP_URL;

  // Google Maps embed URL stuck to the exact user location address without extra overlays
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    exactAddress
  )}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  // Styling based on mapStyle
  const mapFilter =
    mapStyle === "dark"
      ? "invert(90%) hue-rotate(180deg) contrast(115%) saturate(15%) brightness(88%)"
      : "contrast(102%) saturate(100%) brightness(100%)";
  const mapContainerBg = mapStyle === "dark" ? "#2b2d30" : "#e2e8f0";

  return (
    <section
      aria-label="Clinic Address & Location Map"
      className={`relative w-full py-12 sm:py-16 transition-colors ${className}`}
      style={{ backgroundColor: sectionBgColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* items-stretch locks the right map card height to match the left column from ADDRESS down to Get Directions */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ============================================================= */}
          {/* LEFT COLUMN: Starts with ADDRESS and ends with Get Directions */}
          {/* ============================================================= */}
          <div className="flex flex-col justify-between space-y-5 lg:col-span-5">
            <div className="space-y-3.5">
              {/* Section Header: ADDRESS (Start point of the section) */}
              <div>
                <h2 className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#18181b] uppercase">
                  {sectionTitle}
                </h2>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 text-sm sm:text-base text-[#18181b]/90">
                {/* Email */}
                <div>
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-[#27272a] hover:text-black hover:underline transition-colors"
                  >
                    {email}
                  </a>
                </div>

                {/* Physical Address */}
                <div className="font-bold uppercase tracking-wide text-[#18181b] leading-snug max-w-md">
                  {displayAddress}
                </div>

                {/* Phone Number */}
                <div className="pt-0.5">
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="font-bold text-[#18181b] hover:text-black transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              {/* Social Action Icon Buttons */}
              <div className="flex items-center gap-3 pt-1">
                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18181b] text-white shadow-md transition-all hover:scale-110 hover:bg-black"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18181b] text-white shadow-md transition-all hover:scale-110 hover:bg-black"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Small CA Smile Logo between Social Buttons and Get Directions */}
            <div className="my-auto py-2">
              <img
                src={
                  sectionBgColor === "#18181b" || sectionBgColor === "#000000"
                    ? "/images/ca-smile-logo-dark.png"
                    : (brandConfig.logo?.imageUrl || "/images/ca-smile-logo-light.png")
                }
                alt={clinicName}
                className="h-8 sm:h-9 w-auto max-w-[130px] object-contain transition-transform duration-200 hover:scale-105"
              />
            </div>

            {/* End Point: Get Directions Button */}
            <div className="pt-2">
              <a
                href={clinicMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-full border-2 border-[#18181b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#18181b] transition-all hover:bg-[#18181b] hover:text-white"
              >
                <span>Get Directions</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT COLUMN: Height matches left content (No zoom buttons)   */}
          {/* ============================================================= */}
          <div className="flex items-stretch lg:col-span-7">
            {/* Map Card sized to match left column */}
            <div
              className="relative w-full h-full min-h-[300px] sm:min-h-[340px] overflow-hidden rounded-[24px] sm:rounded-[30px] border border-black/15 shadow-xl"
              style={{ backgroundColor: mapContainerBg }}
            >
              {/* Floating Top Info Bar */}
              <div className="absolute top-3.5 left-3.5 right-3.5 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-3 rounded-full bg-white/95 px-4 py-2 sm:px-5 sm:py-2.5 shadow-md backdrop-blur-md border border-black/5">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <MapPin
                    className="h-4 w-4 shrink-0"
                    style={{ color: pinColor, fill: pinColor }}
                  />
                  <span className="truncate text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                    {displayAddress}
                  </span>
                </div>

                <a
                  href={clinicMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0891b2] hover:text-[#0e7490] transition-colors"
                >
                  <span>OPEN MAP</span>
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.8]" />
                </a>
              </div>

              {/* Road Map Canvas stuck to the location */}
              <div
                className="relative h-full w-full"
                style={{ backgroundColor: mapContainerBg }}
              >
                <iframe
                  title={`${clinicName} Map`}
                  src={embedUrl}
                  className="h-full w-full border-0"
                  style={{ filter: mapFilter }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* ======================================================= */}
                {/* FLOATING ADDRESS CARD + TEARDROP PIN                   */}
                {/* ======================================================= */}
                <div className="absolute left-[52%] top-[68%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
                  {/* Floating Speech-Bubble Clinic Address Card */}
                  <a
                    href={clinicMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block w-[84vw] max-w-[310px] sm:max-w-[360px] rounded-[18px] bg-white p-2.5 sm:p-3 shadow-xl border border-black/10 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Clinic Storefront Entrance Thumbnail */}
                      <div className="relative h-14 w-16 sm:h-16 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-stone-200/90 bg-stone-100 shadow-2xs">
                        <Image
                          src={cardImage}
                          alt={`${clinicName} Entrance`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Clinic Name & Full Address Details */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-start justify-between gap-1">
                          <h3
                            className="font-heading text-xs sm:text-sm font-bold leading-snug group-hover:underline"
                            style={{ color: pinColor }}
                          >
                            {clinicName}
                          </h3>
                          <ExternalLink
                            className="h-3.5 w-3.5 shrink-0 mt-0.5"
                            style={{ color: pinColor }}
                          />
                        </div>

                        <div className="flex items-start gap-1 text-[10px] sm:text-[11px] leading-snug text-stone-600 pt-0.5">
                          <MapPin
                            className="h-3 w-3 shrink-0 mt-0.5"
                            style={{ color: pinColor, fill: pinColor }}
                          />
                          <span className="line-clamp-2">
                            {exactAddress}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Downward pointer triangle */}
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0 w-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-white drop-shadow-2xs"
                      aria-hidden="true"
                    />
                  </a>

                  {/* Teardrop Pin with White Circle Center */}
                  <div className="relative mt-4 sm:mt-5 flex flex-col items-center">
                    {/* Pulsing halo disk */}
                    {pinPulse && (
                      <div className="pointer-events-none absolute left-1/2 top-2.5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <span
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full animate-ping absolute opacity-30"
                          style={{ backgroundColor: pinColor }}
                        />
                        <span
                          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full animate-pulse absolute opacity-40"
                          style={{ backgroundColor: pinColor }}
                        />
                      </div>
                    )}

                    {/* Teardrop Pin */}
                    <div className="relative drop-shadow-xl transition-transform duration-300 hover:scale-110">
                      <TeardropPin className="w-7 h-9" color={pinColor} />
                    </div>

                    {/* Ground shadow beneath the pin tip */}
                    <div className="mt-0.5 h-1 w-4 rounded-full bg-black/40 blur-[1px]" />
                  </div>
                </div>
              </div>

              {/* Note: Zoom in / zoom out controls (+ / -) are turned OFF per request */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
