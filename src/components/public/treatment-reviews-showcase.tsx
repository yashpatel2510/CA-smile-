import React from "react";
import {
  TestimonialsSection as Testimonials,
  Testimonial,
} from "@/components/ui/testimonial-v2";
import {
  getPublicApprovedReviews,
  getReviewsStoreData,
} from "@/lib/reviews-store";

interface TreatmentReviewsShowcaseProps {
  title?: string;
  defaultDark?: boolean;
}

export function TreatmentReviewsShowcase({
  title = "What Our Patients Say",
  defaultDark,
}: TreatmentReviewsShowcaseProps) {
  const storeData = getReviewsStoreData();
  const approvedReviews = getPublicApprovedReviews();
  const googleConfig = storeData.googleConfig;

  // Read dark mode preference from admin review settings
  const isDarkMode =
    defaultDark !== undefined
      ? defaultDark
      : Boolean(storeData.darkMode ?? storeData.googleConfig?.darkMode ?? false);

  // Map admin-managed reviews to the animated 3-column testimonials style
  const testimonialsList: Testimonial[] = approvedReviews.map((rev) => ({
    text: rev.comment,
    name: rev.authorName,
    role: rev.treatment || "Verified Patient",
    image: rev.authorPhotoUrl || undefined,
    rating: rev.rating || 5,
    source: rev.source,
  }));

  return (
    <div id="patient-reviews" className="w-full">
      <Testimonials
        testimonialsList={testimonialsList}
        title={title}
        googleMapsUrl={googleConfig.googleMapsUrl}
        defaultDark={isDarkMode}
        showToggle={false}
      />
    </div>
  );
}
