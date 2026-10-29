import type { Metadata } from "next";
import { AboutVideoPlayer } from "@/components/public/about-video-player";
import { getClinicBrandingConfigAsync } from "@/lib/clinic-branding-store";

export const metadata: Metadata = {
  title: "About Us | CA Smile Dental Clinic Bilimora",
  description:
    "Learn about CA Smile Multispeciality Dental Clinic in Bilimora. We deliver painless dental care, advanced diagnostics, and gentle treatment.",
  alternates: {
    canonical: "/about",
  },
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const brandConfig = await getClinicBrandingConfigAsync();
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
      {/* 1. Aesthetic Scroll-Controlled Video Player */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className={`mx-auto ${aboutConfig.videoSize || "max-w-4xl sm:max-w-5xl"} space-y-6`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-1 sm:px-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                {aboutConfig.videoSubtitle || "Clinic Tour & Experience"}
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#18181b] dark:text-white">
                {aboutConfig.videoTitle || "Take a Look Inside Our Clinic"}
              </h1>
            </div>
            <div className="text-xs text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span>{aboutConfig.badgeText || "Autoplays on scroll • Interactive play & pause"}</span>
            </div>
          </div>

          {/* Clean Aesthetic Video Player Container */}
          <AboutVideoPlayer config={aboutConfig} videoUrl={aboutConfig.videoUrl} />
        </div>
      </section>
    </div>
  );
}
