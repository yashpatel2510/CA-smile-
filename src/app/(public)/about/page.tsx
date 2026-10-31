import type { Metadata } from "next";
import { AboutVideoPlayer } from "@/components/public/about-video-player";
import { getClinicBrandingConfig } from "@/lib/clinic-branding-store";

export const metadata: Metadata = {
  title: "About Us | CA Smile Dental Clinic Bilimora",
  description:
    "Learn about CA Smile Multispeciality Dental Clinic in Bilimora. We deliver painless dental care, advanced diagnostics, and gentle treatment.",
  alternates: {
    canonical: "/about",
  },
};

export const dynamic = "force-dynamic";

import Link from "next/link";
import { DoctorIntroSection } from "@/components/public/doctor-intro-section";

export default function AboutPage() {
  const brandConfig = getClinicBrandingConfig();
  const aboutConfig = brandConfig?.aboutSection || {
    videoUrl: brandConfig?.aboutVideoUrl || "https://www.youtube.com/watch?v=mbBugyspbPE",
    videoTitle: "Take a Look Inside Our Clinic",
    videoSubtitle: "Clinic Tour & Experience",
    badgeText: "Autoplays on scroll • Interactive play & pause",
    autoplayOnScroll: true,
    videoSize: "max-w-4xl",
    defaultQuality: "hd1080",
    hideYouTubeBranding: true,
  };

  return (
    <div className="w-full bg-white dark:bg-[#09090b] text-[#18181b] dark:text-zinc-100 transition-colors">
      {/* Top Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-zinc-500 font-medium"
        >
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold">About Us</span>
        </nav>
      </div>

      {/* 1. Aesthetic Scroll-Controlled Video Player (Clean, No Upper Logo) */}
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className={`mx-auto ${aboutConfig.videoSize || "max-w-4xl sm:max-w-5xl"} space-y-6 sm:space-y-8`}>
          <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 space-y-3 sm:space-y-4">
            {/* Title in bold Treatment typography style */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white leading-[1.08] font-sans max-w-4xl">
              {aboutConfig.videoTitle || "Take a Look Inside Our Clinic"}
            </h1>
            {aboutConfig.videoSubtitle && (
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
                {aboutConfig.videoSubtitle}
              </p>
            )}
          </div>

          {/* Clean Aesthetic Video Player Container */}
          <AboutVideoPlayer config={aboutConfig} videoUrl={aboutConfig.videoUrl} />
        </div>
      </section>

      {/* 2. Doctor Introduction Section (Directly Downside of Video) */}
      <DoctorIntroSection />
    </div>
  );
}
