import React from "react";
import { Navbar } from "@/components/design-system/navbar";
import { Footer } from "@/components/design-system/footer";
import { ContactSection } from "@/components/public/contact-section";
import { ClinicMapSection } from "@/components/public/clinic-map-section";
import { FaqSection } from "@/components/public/faq-section";
import { ContactModalProvider } from "@/components/public/contact-modal";
import { getFaqsConfig } from "@/lib/faqs-store";
import { getBookingFormConfigAsync, getBookingFormConfig } from "@/lib/booking-form-store";
import { getBlogSectionConfig } from "@/lib/blog";

export default async function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let faqsConfig: import("@/lib/faqs-store").FaqsConfig | undefined;
  try {
    faqsConfig = getFaqsConfig();
  } catch {
    faqsConfig = undefined;
  }

  let bookingConfig;
  try {
    bookingConfig = await getBookingFormConfigAsync();
  } catch {
    bookingConfig = getBookingFormConfig();
  }

  let blogConfig;
  try {
    blogConfig = getBlogSectionConfig();
  } catch {
    blogConfig = { enabled: false, hideFromNavigation: true };
  }

  const isBlogHidden = blogConfig?.enabled === false;
  const hideNav = isBlogHidden || blogConfig?.hideFromNavigation === true;

  return (
    <ContactModalProvider initialConfig={bookingConfig}>
      <div className="flex min-h-screen flex-col bg-brand-background text-brand-text">
        <Navbar hideBlogNav={hideNav} initialThemeMode={bookingConfig?.themeMode || "light"} />
        <main className="flex-1">{children}</main>
        <ClinicMapSection />
        <FaqSection initialConfig={faqsConfig} hideOnFaqPage={true} />
        <ContactSection initialConfig={bookingConfig} />
        <Footer />
      </div>
    </ContactModalProvider>
  );
}
