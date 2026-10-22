import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Book an Appointment Online | PedioDent Dental Clinic",
  description:
    "Schedule your dental consultation, pediatric dental checkup, root canal, or orthodontic visit online. Select date & time slot with instant confirmation.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book Dental Appointment - PedioDent Dental Clinic",
    description:
      "Real-time medical calendar appointment booking with instant verification.",
    url: "/book",
  },
};

export default function BookAppointmentPage() {
  return (
    <main className="min-h-[85vh] bg-[#fbf9f5] py-8 sm:py-12">
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="w-full">
            <CalendarBookingExperience />
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
