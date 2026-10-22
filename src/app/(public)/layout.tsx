import React from "react";
import { Navbar } from "@/components/design-system/navbar";
import { Footer } from "@/components/design-system/footer";
import { ClinicMapSection } from "@/components/public/clinic-map-section";
import { ClinicFaqSection } from "@/components/public/clinic-faq-section";

export default function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-background text-brand-text">
      <Navbar />
      <main className="flex-1">{children}</main>
      <ClinicMapSection />
      <ClinicFaqSection />
      <Footer />
    </div>
  );
}
