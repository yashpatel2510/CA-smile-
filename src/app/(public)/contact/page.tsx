import type { Metadata } from "next";
import { CalendarBookingExperience } from "@/components/public/calendar-booking-experience";
import { getBookingFormConfigAsync } from "@/lib/booking-form-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Appointment & Contact | CA Smile Dental Clinic Bilimora",
  description:
    "Contact CA Smile Dental Clinic in Bilimora or book your appointment online. Located at 1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank, Bilimora. Call +91 72260 98074.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Book Appointment & Contact | CA Smile Dental Clinic Bilimora",
    description:
      "Contact CA Smile Dental Clinic in Bilimora or book your appointment online. Located at 1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank, Bilimora. Call +91 72260 98074.",
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
