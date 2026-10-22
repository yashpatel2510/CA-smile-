import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { getBookingFormConfig } from "@/lib/booking-form-store";

export const dynamic = "force-dynamic";

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
  const config = getBookingFormConfig();
  const isDark = (config.themeMode || "dark") === "dark";

  return (
    <main
      className={`min-h-[85vh] py-8 sm:py-12 transition-colors duration-200 ${
        isDark ? "bg-[#0c0d0f]" : "bg-[#f4f2ee]"
      }`}
    >
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                isDark ? "text-zinc-400 hover:text-white" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="w-full">
            <CalendarBookingExperience initialConfig={config} />
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
