import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { TreatmentReviewsShowcase } from "@/components/public/treatment-reviews-showcase";

export const metadata: Metadata = {
  title: "Reviews & Patient Ratings | White Dental Clinic",
  description:
    "Read genuine reviews and success stories from patients who experienced our gentle dental care, implants, and smile transformations.",
  alternates: {
    canonical: "/review",
  },
  openGraph: {
    title: "Reviews & Patient Ratings | White Dental Clinic",
    description:
      "Verified patient experiences and ratings from Google Reviews and clinic consultations.",
    url: "/review",
  },
};

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-background">
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
