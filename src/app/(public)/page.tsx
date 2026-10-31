import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Star } from "lucide-react";
import { Hero } from "@/components/design-system/hero";
import { WhyPatientsTrustUs } from "@/components/public/why-patients-trust-us";
import { WhiteDentalTreatmentShowcase } from "@/components/public/white-dental-treatment-showcase";
import { TreatmentReviewsShowcase } from "@/components/public/treatment-reviews-showcase";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClinicJsonLd } from "@/components/seo/clinic-json-ld";
import { getAllPosts, getBlogSectionConfig } from "@/lib/blog";
import { getTreatmentsStoreData } from "@/lib/treatments-store";
import { BlogResponsiveShowcase } from "@/components/public/blog-responsive-showcase";
import { ClinicVideoShowcaseSection } from "@/components/public/clinic-video-showcase-section";

export const metadata: Metadata = {
  title: "HealthSphere Clinic | Board-Certified Physicians & Same-Day Care",
  description:
    "Experience comprehensive clinical care, preventive cardiology, pediatric wellness, and gentle dental medicine. Schedule your appointment online with instant confirmation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HealthSphere Medical Clinic - Patient-First Healthcare",
    description:
      "Modern clinical diagnostics, trusted specialists, and seamless online scheduling. Serving families with compassionate care.",
    url: "/",
    siteName: "HealthSphere Clinic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthSphere Clinic | Modern Healthcare Centered Around You",
    description:
      "Book an appointment with board-certified physicians in primary care, cardiology, pediatrics, and dental medicine.",
  },
};

export const revalidate = 10;

export default function HomePage() {
  const blogConfig = getBlogSectionConfig();
  const allBlogPosts = getAllPosts();
  const featuredPosts = allBlogPosts
    .filter((p) => p.featured)
    .concat(allBlogPosts.filter((p) => !p.featured))
    .slice(0, blogConfig.maxFeaturedCount || 3);
  const store = getTreatmentsStoreData();
  const showDiagnostics = store.settings?.showDiagnostics !== false;
  const showTreatments = store.settings?.showTreatments !== false;

  return (
    <>
      <ClinicJsonLd />

      <main className="flex flex-col">
        {/* Animated Hero Component */}
        <Hero />

        {/* Why Patients Trust Us (Cinematic Studio Section) */}
        <WhyPatientsTrustUs />

        {/* White Dental Treatment Showcase Section */}
        <div id="services-preview">
          <WhiteDentalTreatmentShowcase
            mode="both"
            initialTreatments={store.treatments}
            initialDiagnostics={store.diagnostics}
            initialShowTreatments={showTreatments}
            initialShowDiagnostics={showDiagnostics}
            initialSettings={store.settings}
          />
        </div>

        {/* Clinic Tour / About Us Video Showcase Section (Directly After Treatments) */}
        <ClinicVideoShowcaseSection />

        {/* Patient Testimonials Section (Live Animated 3-Column Marquee) */}
        <TreatmentReviewsShowcase />

        {/* Featured Dental Blog Section */}
        {blogConfig.enabled !== false && (
          <SectionWrapper variant="default" id="blog">
            <div className="space-y-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl space-y-3">
                  {blogConfig.badgeText && (
                    <span className="inline-block rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      {blogConfig.badgeText}
                    </span>
                  )}
                  <h2 className="font-heading text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                    {blogConfig.sectionTitle || "Latest Dental Health Articles"}
                  </h2>
                  <p className="text-base text-zinc-600 dark:text-zinc-400">
                    {blogConfig.sectionSubtitle || "Doctor-authored guides on kids dentistry, invisible aligners, pain-free implants, and everyday oral hygiene."}
                  </p>
                </div>
                <Link href="/blog" prefetch={true}>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold border-black/20 text-black hover:bg-black hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <span>View All Blogs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <BlogResponsiveShowcase posts={featuredPosts} desktopGridClassName="hidden md:grid md:grid-cols-3 gap-6" />

              {/* Mobile View All Blogs CTA button */}
              <div className="flex justify-center md:hidden pt-1">
                <Link href="/blog" prefetch={true} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-2xl py-3 text-xs font-bold border-black/20 text-black hover:bg-black hover:text-white dark:border-white/20 dark:text-white shadow-xs"
                  >
                    <span>View All Blogs ({allBlogPosts.length})</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </SectionWrapper>
        )}
      </main>
    </>
  );
}
