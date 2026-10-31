"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  GallerySectionConfig,
  PolaroidPhotoItem,
  DEFAULT_GALLERY_CONFIG,
} from "@/types/branding";

export type PolaroidPhoto = PolaroidPhotoItem;

// Cute Die-Cut Mascot Sticker: White bird creature holding a letter envelope (compact & cute)
function LetterBirdMascotSticker({ className = "h-11 sm:h-13 w-auto" }: { className?: string }) {
  return (
    <div
      className={`relative inline-block select-none filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-110 hover:-rotate-3 cursor-pointer ${className}`}
      title="CA Smile Messenger"
    >
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {/* Die-cut thick white sticker border layer */}
        <g stroke="#ffffff" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
          {/* Main Body Contour */}
          <path
            d="M 68 20 C 50 18 36 34 38 52 C 39 65 37 85 36 112 C 36 122 41 125 46 118 C 50 112 52 118 56 125 C 60 131 65 125 68 118 C 72 112 75 120 80 126 C 85 131 90 122 90 114 C 91 85 95 48 88 32 C 84 24 76 21 68 20 Z"
            fill="#ffffff"
          />
          {/* Head cap / crest */}
          <ellipse cx="68" cy="18" rx="14" ry="7" fill="#ffffff" />
          {/* Letter Envelope Contour */}
          <rect x="8" y="58" width="48" height="34" rx="4" fill="#ffffff" transform="rotate(-12 32 75)" />
        </g>

        {/* Outer dark stroke on body */}
        <path
          d="M 68 20 C 50 18 36 34 38 52 C 39 65 37 85 36 112 C 36 120 41 123 45 117 C 49 111 52 117 56 123 C 60 129 64 123 68 117 C 72 111 75 118 80 124 C 84 129 89 121 89 113 C 90 85 94 48 87 32 C 83 24 76 21 68 20 Z"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Yellow Beak */}
        <polygon
          points="46,46 32,56 47,59"
          fill="#F59E0B"
          stroke="#18181b"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Head Crest cap */}
        <path
          d="M 58 17 C 62 10 74 10 78 17"
          fill="none"
          stroke="#18181b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="76" cy="14" r="3" fill="#F59E0B" stroke="#18181b" strokeWidth="2" />

        {/* Big Expressive Cartoon Eye */}
        <ellipse cx="56" cy="42" rx="7.5" ry="9.5" fill="#18181b" />
        <circle cx="54" cy="39" r="3" fill="#ffffff" />
        <circle cx="58" cy="46" r="1.2" fill="#ffffff" />

        {/* Envelope with letter fold */}
        <g transform="rotate(-12 32 75)">
          <rect
            x="8"
            y="58"
            width="46"
            height="32"
            rx="3"
            fill="#ffffff"
            stroke="#18181b"
            strokeWidth="3.2"
          />
          <line x1="8" y1="58" x2="31" y2="76" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="54" y1="58" x2="31" y2="76" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="90" x2="23" y2="74" stroke="#71717a" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="54" y1="90" x2="39" y2="74" stroke="#71717a" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="31" cy="76" r="3.5" fill="#DC2626" />
        </g>

        {/* Hand/wing */}
        <path
          d="M 45 68 C 42 66 38 68 40 73 C 42 77 46 76 48 72 Z"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="2.8"
        />

        {/* Feet lines */}
        <line x1="49" y1="104" x2="49" y2="117" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="62" y1="104" x2="62" y2="120" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="75" y1="104" x2="75" y2="118" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 6 Curated Authentic Clinic Photos (Compact resting coordinates to remove unwanted blank space)
const SIX_POLAROIDS: PolaroidPhoto[] = [
  {
    id: "p1",
    src: "/images/ca-smile-clinic-building.jpg",
    alt: "CA Smile Dental Clinic Exterior Space",
    caption: "The Clinic Space",
    date: "Bilimora",
    initialRotate: -6,
    hoverRotate: -1,
    restingY: 56,
    hoverY: -80,
    zIndex: 11,
  },
  {
    id: "p2",
    src: "/images/why-trust-us-chair.jpg",
    alt: "Precision Treatment Suite with Illumination",
    caption: "Treatment Suite",
    date: "Operatory 01",
    initialRotate: 6,
    hoverRotate: 1,
    restingY: 50,
    hoverY: -86,
    zIndex: 12,
  },
  {
    id: "p3",
    src: "/images/treatments/digital-smile-design.jpg",
    alt: "Digital Smile Design Consultation and Diagnostics",
    caption: "Smile Design Lab",
    date: "3D Digital Scan",
    initialRotate: -5,
    hoverRotate: 0,
    restingY: 54,
    hoverY: -82,
    zIndex: 13,
  },
  {
    id: "p4",
    src: "/images/dr-deep-patel.jpg",
    alt: "Dr. Deep Patel - Chief Dental Surgeon",
    caption: "Dr. Deep Patel",
    date: "Chief Surgeon",
    initialRotate: 4,
    hoverRotate: -1,
    restingY: 48,
    hoverY: -88,
    zIndex: 14,
  },
  {
    id: "p5",
    src: "/images/hero-desktop.jpg",
    alt: "CA Smile Clinical Specialists & Team",
    caption: "Dedicated Team",
    date: "Together",
    initialRotate: -4,
    hoverRotate: 0,
    restingY: 52,
    hoverY: -84,
    zIndex: 15,
  },
  {
    id: "p6",
    src: "/images/hero-doctor-dental-care.png",
    alt: "Gentle and Painless Dental Treatment",
    caption: "Painless Dental Care",
    date: "Gentle Touch",
    initialRotate: 6,
    hoverRotate: 1,
    restingY: 46,
    hoverY: -86,
    zIndex: 16,
  },
];

export interface FooterPolaroidsShowcaseProps {
  previewConfig?: GallerySectionConfig;
  className?: string;
}

export function FooterPolaroidsShowcase({
  previewConfig,
  className = "",
}: FooterPolaroidsShowcaseProps = {}) {
  const { brandConfig } = useClinicTheme();
  const shouldReduceMotion = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const galleryConfig = previewConfig || brandConfig?.gallery || DEFAULT_GALLERY_CONFIG;

  if (galleryConfig.enabled === false && !previewConfig) {
    return null;
  }

  const headingLine1 = galleryConfig.headingLine1 ?? "Drop by for a smile.";
  const headingLine2 = galleryConfig.headingLine2 ?? "At anytime.";
  const description =
    galleryConfig.description ??
    "... more than that — it is what builds trust and comfort. A space where we welcome each patient with genuine warmth, deliver painless advanced care, and craft healthy, confident smiles. This sense of togetherness is born and nurtured out of our shared space, the clinic.";

  const showAddressCard = galleryConfig.showAddressCard !== false;
  const addressLine1 =
    galleryConfig.addressLine1 ||
    brandConfig?.address ||
    "1st Floor, Labdhi Arcade, Above HDFC Bank";
  const addressLine2 =
    galleryConfig.addressLine2 ||
    `${brandConfig?.city || "Bilimora"}, ${brandConfig?.state || "Gujarat"} ${brandConfig?.postalCode || "396321"}`;
  const clinicPhone =
    galleryConfig.phone || brandConfig?.phone || "+91 72260 98074";
  const showMascot = galleryConfig.showMascot !== false;

  const showCenterLogo = galleryConfig.showCenterLogo !== false;
  const centerLogoUrl =
    galleryConfig.centerLogoUrl || "/images/ca-smile-logo-white-solid.png";
  const centerLogoAlt =
    galleryConfig.centerLogoAlt || "CA Smile Multispeciality Dental Clinic";
  const centerLogoHeight = galleryConfig.centerLogoHeight || 60;
  const centerLogoGlow = galleryConfig.centerLogoGlow !== false;

  const backgroundColor = galleryConfig.backgroundColor || "#0d0e12";
  const textColor = galleryConfig.textColor || "#ffffff";

  const rawPhotos =
    galleryConfig.photos && galleryConfig.photos.length > 0
      ? galleryConfig.photos
      : SIX_POLAROIDS;

  const photos = rawPhotos.map((photo, index) => {
    const defaultInitialRotate = index % 2 === 0 ? -5 : 5;
    return {
      ...photo,
      initialRotate:
        typeof photo.initialRotate === "number" ? photo.initialRotate : defaultInitialRotate,
      hoverRotate: typeof photo.hoverRotate === "number" ? photo.hoverRotate : 0,
      restingY: typeof photo.restingY === "number" ? photo.restingY : 50,
      hoverY: typeof photo.hoverY === "number" ? photo.hoverY : -84,
      zIndex: typeof photo.zIndex === "number" ? photo.zIndex : 10 + index,
    };
  });

  // Buttery-smooth spring physics (eliminates jitter and sudden jerk)
  const smoothSpring = {
    type: "spring" as const,
    stiffness: 150,
    damping: 22,
    mass: 0.9,
  };

  return (
    <div
      aria-label="Clinic Space Photo Gallery"
      style={{ backgroundColor, color: textColor }}
      className={`relative w-full pt-8 sm:pt-12 lg:pt-14 select-none overflow-visible transition-colors duration-300 ${className}`}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =================================================================== */}
        {/* 1. TOP ROW: BOLD HEADLINE (LEFT) & DESCRIPTIVE PARAGRAPH (RIGHT)     */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start mb-2 sm:mb-3">
          {/* Top-Left: Grand Headline */}
          <div className="md:col-span-6 lg:col-span-6">
            <h3
              className="font-heading text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-[1.1]"
              style={{ color: textColor }}
            >
              {headingLine1}
              {headingLine2 && (
                <>
                  <br />
                  {headingLine2}
                </>
              )}
            </h3>
          </div>

          {/* Top-Right: Warm Shared Space Story */}
          <div className="md:col-span-6 lg:col-span-6 flex md:justify-end">
            <p className="text-xs sm:text-[13px] text-zinc-400 font-normal leading-relaxed max-w-sm sm:max-w-md text-left md:text-right whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. CENTER SPACE: FLOATING ADDRESS CARD + COMPACT MASCOT STICKER     */}
        {/* Centered with tight, elegant margins to remove unwanted blank space */}
        {/* =================================================================== */}
        {showAddressCard && (
          <div className="relative z-10 flex items-center justify-center mt-3 sm:mt-4 mb-2 sm:mb-2.5">
            <div className="relative inline-flex items-center">
              {/* Dark Translucent Glass Card with Full Address & ample right padding */}
              <div className="rounded-2xl bg-[#18191d]/95 border border-white/10 px-5 sm:px-6 py-3 sm:py-3.5 pr-11 sm:pr-13 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)] max-w-xs sm:max-w-md">
                <div className="font-mono text-[11.5px] sm:text-xs leading-relaxed text-zinc-200 space-y-0.5 tracking-tight text-left">
                  <p className="font-semibold text-white tracking-wide">
                    {addressLine1}
                  </p>
                  {addressLine2 && (
                    <p className="text-zinc-400">
                      {addressLine2}
                    </p>
                  )}
                  <p className="pt-0.5 text-white font-semibold flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <a
                      href={`tel:${clinicPhone.replace(/\D/g, "")}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {clinicPhone}
                    </a>
                  </p>
                </div>
              </div>

              {/* Compact Cute Mascot Bird Sticker Perched on Top-Right Edge */}
              {showMascot && (
                <div className="absolute -right-3 -top-5 z-20 pointer-events-auto">
                  <LetterBirdMascotSticker className="h-11 sm:h-13 w-auto" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. CENTER BRAND LOGO: CA SMILE LOGO WITH GLOW & DIM BREATHING LOOP */}
        {/* Perfectly seated between address card and photos with zero excess gap*/}
        {/* =================================================================== */}
        {showCenterLogo && centerLogoUrl && (
          <div className="relative z-10 flex items-center justify-center my-1 sm:my-1.5 select-none pointer-events-auto">
            <div className="group relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-105 cursor-pointer">
              {centerLogoGlow && (
                <>
                  {/* Outer Ambient Radial Halo Pulsing in Sync (Dim -> Radiant Glow -> Dim) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-6 sm:-inset-8 rounded-full blur-2xl sm:blur-3xl animate-logo-halo"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, rgba(255,255,255,0.75) 0%, rgba(56,189,248,0.45) 30%, rgba(45,212,191,0.2) 60%, transparent 75%)",
                    }}
                  />

                  {/* Inner Concentrated Dental Core Aura */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-2 rounded-full blur-lg sm:blur-xl animate-logo-core-aura"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(56,189,248,0.35) 45%, transparent 70%)",
                    }}
                  />

                  {/* Dental Twinkle Sparkle Star on Top-Right Corner */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-1 sm:-top-2 -right-2 sm:-right-3 z-20 animate-sparkle-glint"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-cyan-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                    >
                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                    </svg>
                  </div>
                </>
              )}

              {/* Center Logo with Breathing Glow & Dim Filter */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={centerLogoUrl}
                alt={centerLogoAlt}
                width={Math.round(centerLogoHeight * 1.5)}
                height={centerLogoHeight}
                loading="lazy"
                decoding="async"
                style={{ height: `${centerLogoHeight}px` }}
                className={`w-auto max-w-[200px] sm:max-w-[260px] md:max-w-[320px] object-contain relative z-10 transition-all duration-300 ${
                  centerLogoGlow
                    ? "animate-logo-glow-breathe"
                    : "drop-shadow-[0_4px_20px_rgba(255,255,255,0.07)] opacity-95"
                }`}
              />
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. BOTTOM ROW: THE OVERLAPPING POLAROIDS (COMPACT TIGHT HEIGHT)     */}
        {/* Sits right beneath the logo, eliminating all unwanted blank space   */}
        {/* =================================================================== */}
        <div className="relative w-full flex items-end justify-center overflow-visible pt-0 pb-0 -mt-2 sm:-mt-3">
          <div className="flex items-end justify-start md:justify-center -space-x-6 sm:-space-x-8 md:-space-x-10 lg:-space-x-12 px-3 sm:px-0 w-max md:w-full max-w-7xl mx-auto overflow-x-auto md:overflow-visible scrollbar-none pb-2">
            {photos.map((photo) => {
              const isHovered = hoveredId === photo.id;
              const restingY = isMobile ? Math.round(photo.restingY * 0.72) : photo.restingY;
              const hoverY = isMobile ? Math.round(photo.hoverY * 0.65) : photo.hoverY;

              return (
                <div
                  key={photo.id}
                  className="relative shrink-0 flex items-end justify-center pointer-events-auto"
                  style={{
                    width: "clamp(142px, 15vw, 215px)",
                    height: "220px", // Compact hit-box removes unnecessary empty vertical space!
                  }}
                  onPointerEnter={() => setHoveredId(photo.id)}
                  onPointerLeave={() =>
                    setHoveredId((current) => (current === photo.id ? null : current))
                  }
                  onClick={() => setHoveredId(isHovered ? null : photo.id)}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      y: isHovered
                        ? hoverY
                        : shouldReduceMotion
                        ? restingY
                        : restingY,
                      rotate: isHovered ? photo.hoverRotate : photo.initialRotate,
                      scale: isHovered ? 1.07 : 1,
                      zIndex: isHovered ? 50 : photo.zIndex,
                    }}
                    transition={smoothSpring}
                    style={{ transformOrigin: "bottom center" }}
                    className="relative cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`${photo.caption} - click or hover to elevate`}
                  >
                    {/* Authentic White Polaroid Card (Landscape 4:3 format matching reference) */}
                    <div
                      className={`rounded-[3px] bg-white p-2 sm:p-2.5 pb-6 sm:pb-7 transition-shadow duration-300 ${
                        isHovered
                          ? "shadow-[0_28px_65px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.4)] ring-2 ring-white/60"
                          : "shadow-[0_10px_24px_rgba(0,0,0,0.65)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.8)]"
                      }`}
                      style={{
                        width: "clamp(142px, 15vw, 215px)",
                      }}
                    >
                      {/* Inner Landscape Photo */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 rounded-[1px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/15" />
                      </div>

                      {/* Polaroid Chin: Caption & Tag */}
                      <div className="mt-2 flex items-center justify-between px-0.5 text-zinc-800">
                        <span className="font-sans text-[10.5px] sm:text-[11.5px] font-semibold tracking-tight truncate">
                          {photo.caption}
                        </span>
                        {photo.date && (
                          <span className="font-mono text-[8.5px] sm:text-[9.5px] text-zinc-400 shrink-0">
                            {photo.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterPolaroidsShowcase;
