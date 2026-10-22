import type { Metadata } from "next";
import { getFaqsConfig } from "@/lib/faqs-store";
import { FaqPageClient } from "./faq-page-client";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Questions, Answered",
  description:
    "Explore commonly asked questions about our clinical specialties, painless treatments, appointment booking, pricing, and ongoing care.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | PedioDent & Smile Dental Clinic",
    description:
      "Clear, transparent answers to the most common questions before starting your dental care or treatment.",
    url: "/faq",
  },
};

export const dynamic = "force-dynamic";

export default function FaqPage() {
  const config = getFaqsConfig();

  // JSON-LD structured data for FAQPage schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (config.faqs || []).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqPageClient initialConfig={config} />
    </>
  );
}
