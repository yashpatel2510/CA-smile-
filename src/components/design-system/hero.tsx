"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  Smile,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { useContactModal } from "@/components/public/contact-modal";
import { DEFAULT_HERO_CONFIG, HeroSectionConfig } from "@/types/branding";
import { BlankHeroOne } from "@/components/public/heroes/blank-hero-one";
import { BlankHeroTwo } from "@/components/public/heroes/blank-hero-two";

export { BlankHeroOne, BlankHeroTwo };

export interface HeroProps {
  customConfig?: HeroSectionConfig;
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function Hero({ customConfig, previewMode }: HeroProps) {
  const { brandConfig } = useClinicTheme();
  const { openContactModal } = useContactModal();
  const shouldReduceMotion = useReducedMotion();

  // Active configuration (custom override > brandConfig.hero > default factory baseline)
  const hero: HeroSectionConfig = {
    ...DEFAULT_HERO_CONFIG,
    ...(brandConfig?.hero || {}),
    ...(customConfig || {}),
  };

  // Render Alternate Hero Variants if selected
  if (hero.heroVariant === "blank1") {
    return <BlankHeroOne hero={hero} previewMode={previewMode} />;
  }

  if (hero.heroVariant === "blank2") {
    return <BlankHeroTwo hero={hero} previewMode={previewMode} />;
  }

  const bgColor = hero.backgroundColor || "#ffffff";
  const doctorImg = hero.imageUrl || "/images/hero-doctor-dental-care.png";
  const mobileDoctorImg =
    hero.mobileImageUrl || hero.imageUrl || "/images/hero-doctor-mobile.png";
  const doctorAvatar =
    hero.doctorBoxPhotoUrl || hero.imageUrl || "/images/hero-doctor-dental-care.png";

  const isMobilePreview = previewMode === "mobile";
  const isTabletPreview = previewMode === "tablet";
  const minHeightVal = hero.heroMinHeight || "620px";

  const isDefaultDarkGlassBg =
    !hero.doctorBoxBgColor ||
    hero.doctorBoxBgColor === "rgba(148, 153, 162, 0.92)" ||
    hero.doctorBoxBgColor === "rgba(15, 23, 42, 0.88)";

  const resolvedBoxBg = isDefaultDarkGlassBg
    ? "linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%)"
    : hero.doctorBoxBgColor;

  // Top information row colors and values
  const isDarkBg =
    bgColor.toLowerCase() === "#000000" ||
    bgColor.toLowerCase() === "#050505" ||
    bgColor.toLowerCase() === "#18181b" ||
    bgColor.toLowerCase() === "#0f172a" ||
    bgColor.toLowerCase() === "#111827" ||
    (hero.imageOverlayOpacity ?? 0) >= 0.25;

  const defaultTopInfoLabelColor = isDarkBg
    ? "rgba(255, 255, 255, 0.75)"
    : "#64748b";
  const defaultTopInfoTextColor = isDarkBg ? "#ffffff" : "#18181b";

  const topInfoLabelColor =
    hero.topInfoLabelColor || defaultTopInfoLabelColor;
  const topInfoTextColor =
    hero.topInfoTextColor || defaultTopInfoTextColor;

  const workingHoursLabel = hero.topInfoWorkingHoursLabel || "Working hours";
  const workingHoursValue = hero.topInfoWorkingHoursValue || "Mon - Sat 8:00-20:00";
  const locationLabel = hero.topInfoLocationLabel || "Location";
  const locationValue = hero.topInfoLocationValue || "12 Shevchenko Street, Kyiv";

  // =========================================================================
  // 1. MOBILE VIEW LAYOUT (Full Hero Image Canvas Spanning Behind Navbar)
  // =========================================================================
  // 1. MOBILE VIEW LAYOUT (Image first, content AFTER the image)
  // =========================================================================
  const renderMobileLayout = (isContainerPreview: boolean) => {
    const mobileSubtitleColor =
      hero.subtitleTextColor &&
      hero.subtitleTextColor.toLowerCase() !== "#ffffff" &&
      hero.subtitleTextColor.toLowerCase() !== "#fff"
        ? hero.subtitleTextColor
        : "#475569";

    const mobileImageFit = hero.mobileImageFit || "cover";
    const mobileImageHeight = hero.mobileImageHeight || "440px";
    const isMobileCover = mobileImageFit === "cover";
    const isMobileFill = mobileImageFit === "fill";
    const isFullWidth = hero.mobileImageFullWidth !== false;
    const mobileBorderRadius = hero.mobileImageBorderRadius || hero.imageBorderRadius || "0px";
    const mobileMaxWidth = isFullWidth ? "100%" : (hero.mobileImageWidth || "380px");

    return (
      <section
        className={`relative w-full overflow-hidden transition-all ${
          isContainerPreview
            ? "rounded-b-2xl -mt-[56px] pt-[56px] pb-8"
            : "-mt-[76px] pt-[76px] pb-8"
        } flex flex-col items-center text-center`}
        style={{
          backgroundColor: bgColor,
        }}
      >
        {/* 1. TOP GRAND TITLE: "DENTAL CARE" (if explicitly enabled) */}
        {hero.showUpperText && (
          <motion.h1
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-heading font-light tracking-[0.24em] text-2xl uppercase select-none mt-2 mb-2 px-4"
            style={{
              color: hero.upperTextColor || "#000000",
              letterSpacing: hero.upperTextLetterSpacing || "0.20em",
            }}
          >
            {hero.upperText || "DENTAL CARE"}
          </motion.h1>
        )}

        {/* 2. MOBILE HERO IMAGE (CUSTOMIZABLE FIT & SIZE: COVER / CONTAIN / FILL) */}
        {mobileDoctorImg && (
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative w-full ${
              isFullWidth
                ? "max-w-none px-0"
                : "max-w-[340px] sm:max-w-[380px] px-4"
            } mx-auto flex justify-center items-center overflow-hidden`}
            style={{
              height: isMobileCover || isMobileFill ? mobileImageHeight : undefined,
              maxHeight: mobileImageHeight === "auto" ? "none" : mobileImageHeight,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mobileDoctorImg}
              alt={hero.imageAltText || "Dental Care Specialist Doctor"}
              loading="eager"
              fetchPriority="high"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallbackApplied) {
                  target.dataset.fallbackApplied = "true";
                  target.src = "/images/hero-mobile.jpg";
                }
              }}
              className={`w-full select-none transition-all duration-300 drop-shadow-xs ${
                isMobileCover
                  ? "h-full object-cover object-center"
                  : isMobileFill
                  ? "h-full object-fill"
                  : "h-auto object-contain"
              }`}
              style={{
                borderRadius: mobileBorderRadius,
                maxWidth: mobileMaxWidth,
                maxHeight: mobileImageHeight === "auto" ? "none" : mobileImageHeight,
              }}
            />

            {/* Contrast overlay / dimming if configured */}
            {(hero.imageOverlayOpacity ?? 0) > 0 && (
              <div
                className={`absolute inset-0 bg-black pointer-events-none ${
                  isFullWidth ? "" : "rounded-xl"
                }`}
                style={{ opacity: hero.imageOverlayOpacity }}
              />
            )}

            {/* Bottom Torso / Canvas Gradient Fade on Mobile */}
            {hero.mobileImageBottomFade !== false && isFullWidth && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24"
                style={{
                  background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}ea 35%, transparent 100%)`,
                }}
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}

        {/* TOP INFO ROW: Rendered after image is completed in mobile view */}
        {hero.topInfoEnabled !== false && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-full max-w-[340px] sm:max-w-[380px] px-4 flex items-start justify-between gap-4 mt-3 mb-1"
            style={{
              marginTop:
                hero.topInfoMarginTop && hero.topInfoMarginTop !== "0px"
                  ? hero.topInfoMarginTop
                  : "12px",
            }}
          >
            {/* Left side: Working hours */}
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock
                  className="h-3 w-3 shrink-0"
                  style={{ color: topInfoLabelColor }}
                />
                <p
                  className="text-[11px] sm:text-xs font-normal"
                  style={{ color: topInfoLabelColor }}
                >
                  {workingHoursLabel}
                </p>
              </div>
              <p
                className="text-xs sm:text-sm font-semibold tracking-tight"
                style={{ color: topInfoTextColor }}
              >
                {workingHoursValue}
              </p>
            </div>

            {/* Right side: Location */}
            <div className="text-right space-y-0.5">
              <div className="flex items-center justify-end gap-1.5">
                <MapPin
                  className="h-3 w-3 shrink-0"
                  style={{ color: topInfoLabelColor }}
                />
                <p
                  className="text-[11px] sm:text-xs font-normal"
                  style={{ color: topInfoLabelColor }}
                >
                  {locationLabel}
                </p>
              </div>
              <p
                className="text-xs sm:text-sm font-semibold tracking-tight"
                style={{ color: topInfoTextColor }}
              >
                {locationValue}
              </p>
            </div>
          </motion.div>
        )}

        {/* 3. CONTENT SECTION: RENDERED AFTER (BELOW) THE IMAGE */}
        <div className="w-full px-4 pt-3 flex flex-col items-center text-center max-w-sm mx-auto space-y-3">
          {/* A. Subtitle Description Text */}
          {hero.subtitleText && (
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-xs sm:text-sm text-center leading-relaxed font-normal max-w-[320px] mx-auto px-2"
              style={{
                color: mobileSubtitleColor,
                marginTop: hero.subtitleBoxMarginTop || "0px",
                marginBottom: hero.subtitleBoxMarginBottom || "0px",
              }}
            >
              {hero.subtitleText}
            </motion.p>
          )}

          {/* B. Appointment CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="w-full flex justify-center mb-1"
          >
            <Link
              href={hero.ctaButtonUrl || "/contact"}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!hero.ctaButtonUrl || hero.ctaButtonUrl === "/contact") {
                  e.preventDefault();
                  openContactModal();
                }
              }}
              className={`group relative inline-flex items-center font-medium shadow-lg transition-all duration-200 select-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full max-w-[280px] sm:max-w-[300px] ${
                hero.ctaButtonStyle !== "classic"
                  ? "h-11 sm:h-12 pl-5 pr-2 gap-3.5 text-xs sm:text-sm justify-between"
                  : "py-3.5 px-6 gap-2 text-sm justify-center"
              }`}
              style={{
                backgroundColor: hero.ctaButtonBgColor || "#850000",
                color: hero.ctaButtonTextColor || "#ffffff",
                borderRadius: hero.ctaButtonBorderRadius || "14px",
              }}
            >
              <span className="font-heading font-semibold tracking-wide">
                {hero.ctaButtonText || "Book Your Appointment"}
              </span>
              {hero.ctaButtonShowIcon !== false && (
                hero.ctaButtonStyle !== "classic" ? (
                  <span
                    className="shadow-xs flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{
                      backgroundColor: hero.ctaButtonBadgeBgColor || "#ffffff",
                    }}
                    aria-hidden="true"
                  >
                    <ArrowRight
                      className="h-4 w-4 stroke-[2.2] transition-colors"
                      style={{
                        color:
                          hero.ctaButtonBadgeIconColor ||
                          hero.ctaButtonBgColor ||
                          "#881318",
                      }}
                    />
                  </span>
                ) : (
                  <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )
              )}
            </Link>
          </motion.div>

          {/* C. Floating Doctor Information Card */}
          {hero.doctorBoxEnabled !== false && (
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full max-w-[360px] mx-auto mt-5 sm:mt-6"
              style={{
                marginTop:
                  hero.doctorBoxMarginTop && hero.doctorBoxMarginTop !== "0px"
                    ? hero.doctorBoxMarginTop
                    : "22px",
                marginBottom: hero.doctorBoxMarginBottom || "0px",
              }}
            >
              <div
                className="group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-white/20 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: resolvedBoxBg,
                  color: hero.doctorBoxTextColor || "#ffffff",
                  borderRadius: hero.doctorBoxBorderRadius || "22px",
                }}
              >
                {/* Doctor Avatar Thumbnail with Active Beacon */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {hero.doctorBoxShowPhoto !== false && (
                    <div className="relative shrink-0">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-2 ring-emerald-400/50 shadow-md border border-white/25 bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={doctorAvatar}
                          alt={hero.doctorBoxName || "Dr. DEEP A PATEL"}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallbackApplied) {
                              target.dataset.fallbackApplied = "true";
                              target.src = "/images/doctor-avatar-uploaded.jpeg";
                            }
                          }}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center"
                        title="Available in Clinic"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-slate-900"></span>
                      </span>
                    </div>
                  )}

                  {/* Doctor Text Information */}
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1">
                      <h4 className="font-heading text-xs sm:text-sm font-extrabold leading-snug tracking-tight text-white drop-shadow-xs truncate">
                        {hero.doctorBoxName || "Dr. DEEP A PATEL"}
                      </h4>
                      <CheckCircle2 className="h-3 w-3 text-sky-400 shrink-0" />
                    </div>

                    {hero.doctorBoxShowRole !== false && hero.doctorBoxRole && (
                      <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-400/95 leading-tight truncate mt-0.5 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                        <span>{hero.doctorBoxRole.trim()}</span>
                      </p>
                    )}

                    <div className="mt-0.5 flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-slate-300/85">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                      <span>BDS (Dental Surgeon)</span>
                    </div>
                  </div>
                </div>

                {/* Right: CA Smile Clinic Badge */}
                <div className="shrink-0 flex items-center pl-2.5 border-l border-white/15">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                    <Smile className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>CA Smile</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    );
  };

  // =========================================================================
  // 2. DESKTOP / TABLET VIEW LAYOUT (Full Banner Spanning Behind Navbar)
  // =========================================================================
  const renderDesktopLayout = (isContainerPreview: boolean) => (
    <section
      className={`relative w-full overflow-hidden transition-all ${
        isContainerPreview
          ? "rounded-b-2xl -mt-[56px] sm:-mt-[64px] pt-[56px] sm:pt-[64px]"
          : "-mt-[76px] sm:-mt-[92px] pt-[76px] sm:pt-[92px]"
      }`}
      style={{
        backgroundColor: bgColor,
        minHeight: isTabletPreview ? "580px" : minHeightVal,
      }}
    >
      {/* 1. FULL HERO IMAGE (FILLS/CONTAINS ENTIRE HERO SECTION + BEHIND NAVBAR) */}
      {doctorImg && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doctorImg}
            alt={hero.imageAltText || "Dental Care Specialist"}
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = "true";
                target.src = "/images/hero-desktop.jpg";
              }
            }}
            className={`w-full h-full select-none transition-all duration-300 ${
              hero.imageFit === "contain"
                ? "object-contain object-bottom sm:object-center"
                : "object-cover object-center"
            }`}
            style={{
              borderRadius: hero.imageBorderRadius || "0px",
            }}
          />

          {/* Contrast overlay / dimming if configured */}
          {(hero.imageOverlayOpacity ?? 0) > 0 && (
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: hero.imageOverlayOpacity }}
            />
          )}

          {/* Bottom Torso / Canvas Gradient Fade */}
          {hero.imageBottomFade !== false && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 sm:h-36 lg:h-44"
              style={{
                background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor}ea 35%, transparent 100%)`,
              }}
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* 2. OVERLAY CONTENT LAYER (ON TOP OF THE IMAGE: BUTTON & DOCTOR BADGE BOX) */}
      <div
        className={`relative z-20 mx-auto flex flex-col justify-between w-full h-full ${
          isTabletPreview
            ? "max-w-3xl px-6 pt-16 pb-8 min-h-[520px]"
            : "max-w-7xl px-4 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-8 sm:pb-12 min-h-[540px] sm:min-h-[580px] lg:min-h-[620px]"
        }`}
      >
        {/* --- TOP ROW: WORKING HOURS (LEFT) & LOCATION (RIGHT) ON TOP OF HERO IMAGE --- */}
        {hero.topInfoEnabled !== false && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="w-full flex items-start justify-between gap-6 pt-2 sm:pt-4 mb-auto"
            style={{
              marginTop: hero.topInfoMarginTop || "0px",
            }}
          >
            {/* Left side: Working hours */}
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Clock
                  className="h-3.5 w-3.5 shrink-0 transition-colors"
                  style={{ color: topInfoLabelColor }}
                />
                <p
                  className="text-xs sm:text-sm font-normal tracking-normal transition-colors"
                  style={{
                    color: topInfoLabelColor,
                  }}
                >
                  {workingHoursLabel}
                </p>
              </div>
              <p
                className="text-sm sm:text-base font-semibold tracking-tight transition-colors"
                style={{
                  color: topInfoTextColor,
                }}
              >
                {workingHoursValue}
              </p>
            </div>

            {/* Right side: Location */}
            <div className="text-right sm:text-left space-y-0.5">
              <div className="flex items-center justify-end sm:justify-start gap-1.5">
                <MapPin
                  className="h-3.5 w-3.5 shrink-0 transition-colors"
                  style={{ color: topInfoLabelColor }}
                />
                <p
                  className="text-xs sm:text-sm font-normal tracking-normal transition-colors"
                  style={{
                    color: topInfoLabelColor,
                  }}
                >
                  {locationLabel}
                </p>
              </div>
              <p
                className="text-sm sm:text-base font-semibold tracking-tight transition-colors"
                style={{
                  color: topInfoTextColor,
                }}
              >
                {locationValue}
              </p>
            </div>
          </motion.div>
        )}

        {/* --- BOTTOM ROW: SUBTITLE & APPOINTMENT CTA BUTTON (LEFT) AND DOCTOR CARD (RIGHT) --- */}
        <div
          className={`w-full mt-auto pt-8 ${
            isTabletPreview
              ? "flex flex-col sm:flex-row items-end justify-between gap-6"
              : "flex flex-col items-center text-center md:grid md:grid-cols-12 md:items-end md:text-left gap-6"
          }`}
        >
          {/* --- LEFT SECTION: SUBTITLE & APPOINTMENT CTA BUTTON ON THE IMAGE --- */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${
              isTabletPreview
                ? "space-y-3.5 max-w-[340px]"
                : "w-full max-w-xs md:max-w-[380px] space-y-3.5 md:space-y-4 md:col-span-6 lg:col-span-5 flex flex-col items-center md:items-start"
            }`}
            style={{
              marginTop: hero.subtitleBoxMarginTop || "0px",
              marginBottom: hero.subtitleBoxMarginBottom || "0px",
            }}
          >
            {/* Subtitle Description Text */}
            <p
              className={`leading-relaxed font-normal ${
                isTabletPreview
                  ? "text-xs sm:text-sm text-left drop-shadow-xs"
                  : "text-xs sm:text-sm lg:text-[15px] text-center md:text-left drop-shadow-xs"
              }`}
              style={{
                color: hero.subtitleTextColor || "#475569",
              }}
            >
              {hero.subtitleText ||
                "Discover advanced care, personalized treatments, and trusted experts in a gentle, modern environment"}
            </p>

            {/* Appointment CTA Button (Placed ON the image) */}
            <div className="w-full flex justify-center md:justify-start">
              <Link
                href={hero.ctaButtonUrl || "/contact"}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (!hero.ctaButtonUrl || hero.ctaButtonUrl === "/contact") {
                    e.preventDefault();
                    openContactModal();
                  }
                }}
                className={`group relative inline-flex items-center font-medium shadow-lg transition-all duration-200 select-none hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] cursor-pointer ${
                  hero.ctaButtonStyle !== "classic"
                    ? "h-11 sm:h-12 pl-5 pr-2 gap-3.5 text-xs sm:text-sm justify-between"
                    : "py-3 px-6 gap-2 text-xs sm:text-sm justify-center"
                }`}
                style={{
                  backgroundColor: hero.ctaButtonBgColor || "#050505",
                  color: hero.ctaButtonTextColor || "#ffffff",
                  borderRadius: hero.ctaButtonBorderRadius || "14px",
                }}
              >
                <span className="font-heading font-semibold tracking-wide">
                  {hero.ctaButtonText || "Book Your Appointment"}
                </span>
                {hero.ctaButtonShowIcon !== false && (
                  hero.ctaButtonStyle !== "classic" ? (
                    <span
                      className="shadow-xs flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:translate-x-0.5"
                      style={{
                        backgroundColor: hero.ctaButtonBadgeBgColor || "#ffffff",
                      }}
                      aria-hidden="true"
                    >
                      <ArrowRight
                        className="h-4 w-4 stroke-[2.2] transition-colors"
                        style={{
                          color:
                            hero.ctaButtonBadgeIconColor ||
                            hero.ctaButtonBgColor ||
                            "#881318",
                        }}
                      />
                    </span>
                  ) : (
                    <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )
                )}
              </Link>
            </div>
          </motion.div>

          {/* Spacer for desktop layout */}
          {!isTabletPreview && (
            <div className="hidden md:block md:col-span-1 lg:col-span-2" />
          )}

          {/* --- RIGHT SECTION: FLOATING DOCTOR BADGE BOX ON THE IMAGE --- */}
          {hero.doctorBoxEnabled !== false && (
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${
                isTabletPreview
                  ? "shrink-0 max-w-[340px]"
                  : "w-full max-w-[420px] md:col-span-5 lg:col-span-5 flex justify-center md:justify-end"
              }`}
              style={{
                marginTop: hero.doctorBoxMarginTop || "0px",
                marginBottom: hero.doctorBoxMarginBottom || "0px",
              }}
            >
              <div
                className="group relative flex items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl border border-white/25 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.48)] w-full"
                style={{
                  background: resolvedBoxBg,
                  color: hero.doctorBoxTextColor || "#ffffff",
                  borderRadius: hero.doctorBoxBorderRadius || "24px",
                }}
              >
                {/* Left: Avatar with glowing emerald ring & live status pulse */}
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {hero.doctorBoxShowPhoto !== false && (
                    <div className="relative shrink-0">
                      <div className="relative h-13 w-13 sm:h-14 sm:w-14 overflow-hidden rounded-2xl ring-2 ring-emerald-400/50 shadow-md border border-white/30 bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={doctorAvatar}
                          alt={hero.doctorBoxName || "Dr. DEEP A PATEL"}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallbackApplied) {
                              target.dataset.fallbackApplied = "true";
                              target.src = "/images/doctor-avatar-uploaded.jpeg";
                            }
                          }}
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {/* Active In-Clinic Pulse Beacon */}
                      <span
                        className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center"
                        title="Available in Clinic"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-900"></span>
                      </span>
                    </div>
                  )}

                  {/* Doctor Text Information */}
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-heading text-sm sm:text-base font-extrabold leading-tight tracking-tight text-white drop-shadow-md truncate">
                        {hero.doctorBoxName || "Dr. DEEP A PATEL"}
                      </h4>
                      <span title="Verified Specialist" className="inline-flex items-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      </span>
                    </div>

                    {hero.doctorBoxShowRole !== false && hero.doctorBoxRole && (
                      <p className="text-[11px] sm:text-xs font-semibold text-emerald-400/95 leading-tight truncate mt-0.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{hero.doctorBoxRole.trim()}</span>
                      </p>
                    )}

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-medium text-slate-300/90 truncate">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                      <span className="truncate">BDS (Dental Surgeon)</span>
                    </div>
                  </div>
                </div>

                {/* Right: CA Smile Clinic Badge */}
                <div className="shrink-0 flex items-center pl-3 sm:pl-3.5 border-l border-white/15">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] sm:text-xs font-bold text-emerald-300 shadow-2xs tracking-tight">
                    <Smile className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>CA Smile</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );

  // Return mode-specific or fully responsive dual-layer
  if (isMobilePreview) {
    return renderMobileLayout(true);
  }

  if (isTabletPreview) {
    return renderDesktopLayout(true);
  }

  if (previewMode === "desktop") {
    return renderDesktopLayout(true);
  }

  // Public website mode: automatically responsive
  return (
    <>
      <div className="block md:hidden">{renderMobileLayout(false)}</div>
      <div className="hidden md:block">{renderDesktopLayout(false)}</div>
    </>
  );
}
