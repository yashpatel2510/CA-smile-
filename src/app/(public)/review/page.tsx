import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { TreatmentReviewsShowcase } from "@/components/public/treatment-reviews-showcase";

export const metadata: Metadata = {
  title: "Reviews & Patient Ratings | CA Smile Dental Clinic Bilimora",
  description:
    "Read genuine reviews and success stories from patients who experienced our gentle dental care, root canals, implants, and smile transformations at CA Smile Dental Clinic, Bilimora.",
  alternates: {
    canonical: "/review",
  },
  openGraph: {
    title: "Reviews & Patient Ratings | CA Smile Dental Clinic Bilimora",
    description:
      "Verified patient experiences and ratings from Google Reviews and clinic consultations.",
    url: "/review",
  },
};

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DentalClinic",
    name: "CA Smile Dental Clinic",
    url: "https://www.casmiledentalclinic.com",
    telephone: "+91 72260 98074",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/60 bg-surface/50 py-4">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 flex items-center gap-2 text-xs sm:text-sm text-brand-muted">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-brand-text transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-brand-text">Reviews</span>
        </div>
      </div>

      <TreatmentReviewsShowcase
        title="What Our Patients Say"
      />
    </div>
  );
}
