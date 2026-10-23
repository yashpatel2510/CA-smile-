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
import { BookNowButton } from "@/components/ui/book-now-button";
import { ClinicJsonLd } from "@/components/seo/clinic-json-ld";
import { getAllPosts } from "@/lib/blog";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

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

export const dynamic = "force-dynamic";

export default function HomePage() {
  const featuredPosts = getAllPosts().slice(0, 3);
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
            initialShowTreatments={showTreatments}
            initialShowDiagnostics={showDiagnostics}
            initialSettings={store.settings}
          />
        </div>



        {/* Patient Testimonials Section (Live Animated 3-Column Marquee) */}
        <TreatmentReviewsShowcase />

        {/* Featured Dental Blog Section */}
        <SectionWrapper variant="default" id="blog">
          <div className="space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge variant="default">Dental Knowledge &amp; Insights</Badge>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl">
                  Latest Dental Health Articles
                </h2>
                <p className="text-base text-brand-muted">
                  Doctor-authored guides on kids dentistry, invisible aligners, pain-free implants, and everyday oral hygiene.
                </p>
              </div>
              <Link href="/blog">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold">
                  <span>Explore All Articles</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="group flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-surface p-6 transition-all duration-200 hover:border-brand-primary/40 hover:shadow-lg"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[11px] font-semibold">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-brand-muted font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-brand-text transition-colors group-hover:text-brand-primary line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="line-clamp-3 text-xs leading-relaxed text-brand-muted sm:text-sm">
                      {post.summary}
                    </p>
                  </div>

                  <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between">
                    <div>
                      <div className="font-heading text-xs font-semibold text-brand-text">
                        {post.author.name}
                      </div>
                      <div className="text-[11px] text-brand-muted line-clamp-1">
                        {post.author.role}
                      </div>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* Final High-Converting CTA Banner */}
        <section className="relative overflow-hidden bg-brand-primary py-16 text-brand-primary-foreground sm:py-20">
          <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Ready for a Better Healthcare Experience?
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed opacity-90 sm:text-lg">
              Schedule your consultation online in under 2 minutes, or call our
              24/7 clinical care team for immediate guidance.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <BookNowButton href="/contact" text="Book Now" size="lg" />
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 px-6 text-white hover:bg-white/10"
                >
                  <span>Contact Clinic Coordinator</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
