import React from "react";
import { Navbar } from "@/components/design-system/navbar";
import { Footer } from "@/components/design-system/footer";
import { ClinicMapSection } from "@/components/public/clinic-map-section";
import { FaqSection } from "@/components/public/faq-section";
import { getFaqsConfig } from "@/lib/faqs-store";
import { getBookingFormConfig } from "@/lib/booking-form-store";

export default function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqsConfig = getFaqsConfig();
  const bookingConfig = getBookingFormConfig();

  return (
    <div className="flex min-h-screen flex-col bg-brand-background text-brand-text">
      <Navbar initialThemeMode={bookingConfig.themeMode || "light"} />
      <main className="flex-1">{children}</main>
      <ClinicMapSection />
      <FaqSection initialConfig={faqsConfig} hideOnFaqPage={true} />
      <Footer />
    </div>
  );
}
