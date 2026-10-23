"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { DEFAULT_HERO_CONFIG, HeroSectionConfig } from "@/types/branding";

export interface HeroProps {
  customConfig?: HeroSectionConfig;
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function Hero({ customConfig, previewMode }: HeroProps) {
  const { brandConfig } = useClinicTheme();
  const shouldReduceMotion = useReducedMotion();

  // Active configuration (custom override > brandConfig.hero > default factory baseline)
  const hero: HeroSectionConfig = {
    ...DEFAULT_HERO_CONFIG,
    ...(brandConfig?.hero || {}),
    ...(customConfig || {}),
  };

  const bgColor = hero.backgroundColor || "#ffffff";
  const doctorImg = hero.imageUrl || "/images/hero-doctor-dental-care.png";
  const mobileDoctorImg =
    hero.mobileImageUrl || hero.imageUrl || "/images/hero-doctor-mobile.png";
  const doctorAvatar =
    hero.doctorBoxPhotoUrl || hero.imageUrl || "/images/hero-doctor-dental-care.png";

  const isMobilePreview = previewMode === "mobile";
  const isTabletPreview = previewMode === "tablet";
  const minHeightVal = hero.heroMinHeight || "620px";

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
              <p
                className="text-[11px] sm:text-xs font-normal"
                style={{ color: topInfoLabelColor }}
              >
                {workingHoursLabel}
              </p>
              <p
                className="text-xs sm:text-sm font-semibold tracking-tight"
                style={{ color: topInfoTextColor }}
              >
                {workingHoursValue}
              </p>
            </div>

            {/* Right side: Location */}
            <div className="text-right space-y-0.5">
              <p
                className="text-[11px] sm:text-xs font-normal"
                style={{ color: topInfoLabelColor }}
              >
                {locationLabel}
              </p>
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
              className={`group relative inline-flex items-center font-medium shadow-lg transition-all duration-200 select-none hover:scale-[1.02] active:scale-[0.98] w-full max-w-[280px] sm:max-w-[300px] ${
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
              className="w-full max-w-[310px] mx-auto mt-5 sm:mt-6"
              style={{
                marginTop:
                  hero.doctorBoxMarginTop && hero.doctorBoxMarginTop !== "0px"
                    ? hero.doctorBoxMarginTop
                    : "22px",
                marginBottom: hero.doctorBoxMarginBottom || "0px",
              }}
            >
              <div
                className="flex items-center gap-3 p-3 shadow-lg backdrop-blur-md border border-white/30 dark:border-white/15 transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor:
                    hero.doctorBoxBgColor || "rgba(148, 153, 162, 0.92)",
                  color: hero.doctorBoxTextColor || "#ffffff",
                  borderRadius: hero.doctorBoxBorderRadius || "20px",
                }}
              >
                {/* Doctor Avatar Thumbnail */}
                {hero.doctorBoxShowPhoto !== false && (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doctorAvatar}
                      alt={hero.doctorBoxName || "Doctor Avatar"}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                )}

                {/* Doctor Text Information */}
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="font-heading text-xs sm:text-sm font-bold leading-snug tracking-tight text-white drop-shadow-xs truncate">
                    {hero.doctorBoxName || "Dr. Alex Mercer"}
                  </h4>

                  {hero.doctorBoxShowRole !== false && hero.doctorBoxRole && (
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-100/90 leading-tight truncate mt-0.5">
                      {hero.doctorBoxRole}
                    </p>
                  )}

                  {hero.doctorBoxShowExperience !== false &&
                    hero.doctorBoxExperience && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-normal text-slate-200/85">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300 shrink-0" />
                        <span className="truncate">
                          {hero.doctorBoxExperience}
                        </span>
                      </div>
                    )}
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
              <p
                className="text-xs sm:text-sm font-normal tracking-normal transition-colors"
                style={{
                  color: topInfoLabelColor,
                }}
              >
                {workingHoursLabel}
              </p>
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
              <p
                className="text-xs sm:text-sm font-normal tracking-normal transition-colors"
                style={{
                  color: topInfoLabelColor,
                }}
              >
                {locationLabel}
              </p>
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
                className={`group relative inline-flex items-center font-medium shadow-lg transition-all duration-200 select-none hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] ${
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
                  ? "shrink-0 max-w-[320px]"
                  : "w-full max-w-[340px] md:max-w-none md:col-span-5 lg:col-span-5 flex justify-center md:justify-end"
              }`}
              style={{
                marginTop: hero.doctorBoxMarginTop || "0px",
                marginBottom: hero.doctorBoxMarginBottom || "0px",
              }}
            >
              <div
                className="flex items-center gap-3.5 p-3.5 sm:p-4 shadow-xl backdrop-blur-md border border-white/30 dark:border-white/15 transition-transform hover:-translate-y-1 w-full"
                style={{
                  backgroundColor:
                    hero.doctorBoxBgColor || "rgba(148, 153, 162, 0.92)",
                  color: hero.doctorBoxTextColor || "#ffffff",
                  borderRadius: hero.doctorBoxBorderRadius || "20px",
                }}
              >
                {/* Doctor Avatar Thumbnail */}
                {hero.doctorBoxShowPhoto !== false && (
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-black/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doctorAvatar}
                      alt={hero.doctorBoxName || "Doctor Avatar"}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                )}

                {/* Doctor Text Information */}
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="font-heading text-sm sm:text-base font-bold leading-snug tracking-tight text-white drop-shadow-xs truncate">
                    {hero.doctorBoxName || "Dr. Alex Mercer"}
                  </h4>

                  {hero.doctorBoxShowRole !== false && hero.doctorBoxRole && (
                    <p className="text-[11px] sm:text-xs font-medium text-slate-100/90 leading-tight truncate mt-0.5">
                      {hero.doctorBoxRole}
                    </p>
                  )}

                  {hero.doctorBoxShowExperience !== false &&
                    hero.doctorBoxExperience && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] font-normal text-slate-200/85">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300 shrink-0" />
                        <span className="truncate">
                          {hero.doctorBoxExperience}
                        </span>
                      </div>
                    )}
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
