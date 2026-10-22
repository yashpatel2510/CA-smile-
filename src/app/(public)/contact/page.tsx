import type { Metadata } from "next";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";

export const metadata: Metadata = {
  title: "Book Appointment & Contact | PedioDent Dental Clinic",
  description:
    "Schedule your dental consultation online with our black & white modern dental booking experience or get in touch with our clinical coordinators. Let's make that smile shine!",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Book Appointment & Contact - PedioDent Dental Clinic",
    description:
      "Modern dental consultation booking and clinical coordinator contacts. Let's make that smile shine!",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0c0d0f] py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CalendarBookingExperience />
      </div>
    </main>
  );
}
