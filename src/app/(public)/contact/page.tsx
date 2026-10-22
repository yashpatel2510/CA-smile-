import type { Metadata } from "next";
import { DarkContactSection } from "@/components/public/dark-contact-section";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";

export const metadata: Metadata = {
  title: "Contact Us & Book Appointment | PedioDent Dental Clinic",
  description:
    "Schedule your dental consultation or get in touch with our clinical coordinators. Black & white modern dental booking experience with instant confirmation.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Book Appointment - PedioDent Dental Clinic",
    description:
      "Modern dental consultation booking and clinical coordinator contacts. Let's make that smile shine!",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0c0d0f]">
      {/* Primary Hero: Dribbble-inspired Black & White Theme Contact Form */}
      <DarkContactSection showCalendarLink={true} />

      {/* Secondary: Full Real-Time Interactive Calendar */}
      <section
        id="booking-calendar"
        className="scroll-mt-16 bg-[#0c0d0f] border-t border-white/5 py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Interactive Chair Schedule
            </span>
            <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Prefer Specific Chair-Time Slots?
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Pick your exact 30-minute consultation window from our live doctor schedule below.
            </p>
          </div>

          <CalendarBookingExperience />
        </div>
      </section>
    </main>
  );
}
