import type { Metadata } from "next";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { getBookingFormConfigAsync } from "@/lib/booking-form-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Appointment & Contact | CA Smile Dental Clinic",
  description:
    "Schedule your dental consultation online with our modern dental booking experience or get in touch with our clinical coordinators. Let's make that smile shine!",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Book Appointment & Contact - CA Smile Dental Clinic",
    description:
      "Modern dental consultation booking and clinical coordinator contacts. Let's make that smile shine!",
    url: "/contact",
  },
};

export default async function ContactPage({
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
      className={`min-h-[calc(100vh-80px)] py-3 sm:py-5 lg:py-6 flex flex-col justify-center ${
        isDark ? "bg-[#0c0d0f]" : "bg-[#f8fafc]"
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <CalendarBookingExperience
          initialConfig={config}
          initialService={searchParams?.treatment || searchParams?.service}
          initialDoctor={searchParams?.doctor}
        />
      </div>
    </div>
  );
}
