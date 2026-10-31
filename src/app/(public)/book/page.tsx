import type { Metadata } from "next";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { getBookingFormConfigAsync } from "@/lib/booking-form-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Appointment Online | CA Smile Dental Clinic",
  description:
    "Choose your consultation treatment, preferred calendar date, and time slot directly with instant confirmation. CA Smile Dental Clinic, Bilimora.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book Your Dental Appointment | CA Smile Dental Clinic",
    description:
      "Select your date & time slot directly online. Instant confirmation for all dental treatments and checkups.",
    url: "/book",
    siteName: "CA Smile Dental Clinic",
    type: "website",
    images: [
      {
        url: "/images/hero-desktop.jpg",
        width: 1200,
        height: 630,
        alt: "CA Smile Dental Clinic Booking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Your Dental Appointment | CA Smile Dental Clinic",
    description:
      "Select your date & time slot directly online. Instant confirmation for all dental treatments and checkups.",
    images: ["/images/hero-desktop.jpg"],
  },
};

export default async function BookAppointmentPage({
  searchParams,
}: {
  searchParams?: {
    treatment?: string;
    service?: string;
    doctor?: string;
  };
}) {
  const config = await getBookingFormConfigAsync();
  const isDark = config.themeMode === "dark";

  return (
    <div
      className={`min-h-[calc(100vh-80px)] py-4 sm:py-6 lg:py-8 flex flex-col justify-center ${
        isDark ? "bg-[#0c0d0f]" : "bg-[#f8fafc]"
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8">
        <CalendarBookingExperience
          initialConfig={config}
          initialService={searchParams?.treatment || searchParams?.service}
          initialDoctor={searchParams?.doctor}
        />
      </div>
    </div>
  );
}
