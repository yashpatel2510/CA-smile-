import React from "react";
import { AboutVideoPlayer } from "@/components/public/about-video-player";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";
import { DEFAULT_ABOUT_CONFIG } from "@/types/branding";

interface ClinicVideoShowcaseSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function ClinicVideoShowcaseSection({
  title,
  subtitle,
  badge,
  className = "",
}: ClinicVideoShowcaseSectionProps) {
  const brandConfig = getClinicBrandingConfig();
  const aboutConfig = brandConfig?.aboutSection || {
    ...DEFAULT_ABOUT_CONFIG,
    videoUrl: brandConfig?.aboutVideoUrl || DEFAULT_ABOUT_CONFIG.videoUrl,
  };

  const customLogo = brandConfig?.logo?.imageUrl;
  const isDefaultLight =
    !customLogo || customLogo === "/images/ca-smile-logo-light.png";
  const logoLightUrl = customLogo || "/images/ca-smile-logo-light.png";
  const logoDarkUrl = isDefaultLight
    ? "/images/ca-smile-logo-dark.png"
    : logoLightUrl;

  const displayTitle =
    title || aboutConfig.videoTitle || "Take a Look Inside Our Clinic";
  const displaySubtitle =
    subtitle ||
    aboutConfig.videoSubtitle ||
    "Explore our modern clinical spaces, advanced digital diagnostic suites, and patient comfort facilities.";
  const displayBadge =
    badge || aboutConfig.badgeText || "CLINIC TOUR & EXPERIENCE";

  return (
    <section
      id="clinic-video"
      className={`relative w-full pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 bg-brand-background text-brand-text scroll-mt-24 transition-colors ${className}`}
      aria-label="Clinic Tour Video"
    >
      <div
        className={`mx-auto ${
          aboutConfig.videoSize || "max-w-4xl sm:max-w-5xl"
        } space-y-6 sm:space-y-8`}
      >
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center px-2 space-y-3 sm:space-y-4">
          {/* Clinic Logo */}
          <div className="inline-flex items-center justify-center pt-1 transition-transform duration-300 hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoLightUrl}
              alt={
                brandConfig?.logo?.altText ||
                brandConfig?.clinicName ||
                "CA Smile Dental Clinic"
              }
              width={60}
              height={40}
              loading="lazy"
              decoding="async"
              className="h-9 sm:h-11 md:h-12 w-auto object-contain dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDarkUrl}
              alt={
                brandConfig?.logo?.altText ||
                brandConfig?.clinicName ||
                "CA Smile Dental Clinic"
              }
              width={60}
              height={40}
              loading="lazy"
              decoding="async"
              className="h-9 sm:h-11 md:h-12 w-auto object-contain hidden dark:block"
            />
          </div>

          {/* Badge Pill */}
          {displayBadge && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 dark:bg-teal-950/40 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>{displayBadge}</span>
            </div>
          )}

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-brand-text leading-[1.12] font-sans max-w-3xl">
            {displayTitle}
          </h2>

          {/* Subtitle */}
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-brand-muted max-w-xl leading-relaxed">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Video Player Container */}
        <div className="w-full">
          <AboutVideoPlayer
            config={aboutConfig}
            videoUrl={aboutConfig.videoUrl}
          />
        </div>
      </div>
    </section>
  );
}
