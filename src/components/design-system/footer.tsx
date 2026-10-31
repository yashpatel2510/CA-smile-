"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { useContactModal } from "@/components/public/contact-modal";
import { FooterPolaroidsShowcase } from "@/components/public/footer-polaroids-showcase";

function WhatsAppLogo({ className = "h-5 w-5" }: { className?: string }) {
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

function InstagramLogo({ className = "h-5 w-5" }: { className?: string }) {
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

export function Footer() {
  const pathname = usePathname();
  const { brandConfig } = useClinicTheme();
  const { openContactModal } = useContactModal();

  // Hide footer on standalone contact page if needed
  if (pathname === "/contact") {
    return null;
  }

  const clinicName = brandConfig?.clinicName || "CA Smile Dental Clinic";
  const displayName = brandConfig?.logo?.clinicDisplayName || clinicName;
  const currentYear = new Date().getFullYear();

  const whatsappPhone = brandConfig?.whatsappPhone || brandConfig?.phone || "+91 72260 98074";
  const whatsappHref = whatsappPhone.startsWith("http")
    ? whatsappPhone
    : `https://wa.me/${whatsappPhone.replace(/\D/g, "")}`;
  const instagramUrl =
    brandConfig?.instagramUrl ||
    "https://www.instagram.com/ca_smile_bilimora?psln=c3Rhcmk3aHE4bjBw";
  const googleMapsUrl =
    brandConfig?.googleMapsUrl ||
    "https://www.google.com/maps/place/CA+Smile+Multispeciality+Dental+Clinic/data=!4m2!3m1!1s0x0:0x3a288255f324c8de?sa=X&ved=1t:2428&ictx=111";

  return (
    <footer className="relative w-full overflow-hidden bg-[#0d0e12] text-white selection:bg-white selection:text-black transition-colors">
      {/* ===================================================================== */}
      {/* 1. UPPER SECTION: CINEMATIC POLAROID SPACE GALLERY                    */}
      {/* 1:1 match to reference video:                                         */}
      {/* - "Drop by for a smile. / At anytime." headline                       */}
      {/* - Shared space clinic story                                           */}
      {/* - Dark address card + bird messenger mascot sticker                   */}
      {/* - 5 polaroid photos: resting submerged across baseline -> lifts way up*/}
      {/* ===================================================================== */}
      <FooterPolaroidsShowcase />

      {/* ===================================================================== */}
      {/* 2. LOWER SECTION: BRAND STATEMENT & NAVIGATION DIRECTORY               */}
      {/* Sits at z-20 with top border, masking the bottom half of resting      */}
      {/* polaroids until hovered                                               */}
      {/* ===================================================================== */}
      <div className="relative z-20 w-full bg-[#0d0e12] border-t border-white/10 pt-14 sm:pt-18 pb-8 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Row: Brand Statement (Left) + 3 Navigation Columns (Right) */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Official Logo + 3-line statement + Socials + Copyright */}
            <div className="space-y-6 lg:col-span-5">
              <Link
                href="/"
                prefetch={true}
                className="inline-block transition-opacity hover:opacity-85"
                aria-label={`${displayName} Home`}
              >
                {/* Clean Large CA Smile Official Logo (White on Dark) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/ca-smile-logo-white-solid.png"
                  alt={displayName}
                  className="h-12 sm:h-14 md:h-16 w-auto max-w-[260px] sm:max-w-[320px] object-contain object-left"
                />
              </Link>

              {/* 3-Line Punchy Typography matching reference video */}
              <div className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight leading-[1.18]">
                <p className="text-white">Painless. Modern.</p>
                <p className="text-white">Compassionate. Gentle.</p>
                <p className="text-zinc-500">Always CA Smile.</p>
              </div>

              {/* Instagram & WhatsApp Dark Frosted Buttons */}
              <div className="flex items-center gap-3 pt-1">
                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow CA Smile on Instagram"
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 border border-white/15 text-white shadow-md transition-all hover:scale-110 hover:border-white/40 hover:bg-zinc-800 active:scale-95"
                >
                  <InstagramLogo className="h-5 w-5 text-zinc-300 group-hover:text-white transition-colors" />
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with CA Smile on WhatsApp"
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 border border-white/15 text-white shadow-md transition-all hover:scale-110 hover:border-emerald-500/50 hover:bg-emerald-950/40 active:scale-95"
                >
                  <WhatsAppLogo className="h-5 w-5 text-emerald-400 group-hover:scale-105 transition-transform" />
                </a>
              </div>

              {/* Copyright & Location */}
              <div className="pt-1 text-xs sm:text-[13px] text-zinc-400 space-y-1">
                <p>&copy; {currentYear} {clinicName}. All rights reserved.</p>
                <p className="text-zinc-500">Station Road, Near Tower, Bilimora, Gujarat 396321</p>
              </div>
            </div>

            {/* Right Columns: 3 Columns (TREATMENTS, CLINIC, CONNECT) matching reference video */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 lg:col-span-6 lg:col-start-7">
              {/* Column 1: Treatments */}
              <div className="space-y-3.5">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Treatments
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
                  <li>
                    <Link
                      href="/services"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Dental Implants
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Root Canal (RCT)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Teeth Whitening
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Braces &amp; Aligners
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Smile Makeover
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Clinic */}
              <div className="space-y-3.5">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Clinic
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
                  <li>
                    <Link
                      href="/"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      prefetch={true}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Our Doctors
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openContactModal()}
                      className="text-left transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Book Appointment
                    </button>
                  </li>
                  <li>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Location &amp; Map
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Connect */}
              <div className="space-y-3.5 col-span-2 sm:col-span-1">
                <h4 className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Connect
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-emerald-400 hover:underline underline-offset-4"
                    >
                      WhatsApp Chat
                    </a>
                  </li>
                  <li>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${whatsappPhone.replace(/\D/g, "")}`}
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      {whatsappPhone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white hover:underline underline-offset-4"
                    >
                      Google Maps
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* GIANT WATERMARK TYPOGRAPHY (matching reference aesthetic at base) */}
          {/* ================================================================= */}
          <div className="relative mt-16 sm:mt-24 select-none pointer-events-none overflow-hidden">
            <div className="font-heading font-black tracking-tighter text-white/[0.04] uppercase leading-none text-[15vw] whitespace-nowrap text-left -mb-4 sm:-mb-8 sm:-ml-2">
              CA SMILE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
