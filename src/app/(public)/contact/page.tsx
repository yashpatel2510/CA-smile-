import type { Metadata } from "next";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { SectionWrapper } from "@/components/design-system/section-wrapper";

export const metadata: Metadata = {
  title: "Book Appointment & Contact | PedioDent Dental Clinic",
  description:
    "Schedule your dental consultation online from our real-time medical calendar or get in touch with PedioDent Clinic coordinators for inquiries, operating hours, and location details.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Book Appointment & Contact - PedioDent Dental Clinic",
    description:
      "Craft your visit with our real-time dental calendar. Connect with clinic coordinators, review clinical hours, or call our direct reception line.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fbf9f5] py-8 sm:py-12">
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
          {/* FULL-PAGE REAL-TIME CALENDAR APPOINTMENT BOOKING */}
          <div id="booking-calendar" className="scroll-mt-24">
            <CalendarBookingExperience />
          </div>
      </SectionWrapper>
    </main>
  );
}
