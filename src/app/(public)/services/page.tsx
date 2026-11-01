import type { Metadata } from "next";
import { WhiteDentalTreatmentShowcase } from "@/components/public/white-dental-treatment-showcase";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

export const metadata: Metadata = {
  title: "Diagnostics & Dental Treatments | CA Smile Dental Clinic Bilimora",
  description:
    "Explore our complete directory of clinical treatments, digital smile design, dental implants, single-visit root canals, and aesthetic dental medicine in Bilimora, Gujarat.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Diagnostics & Dental Treatments | CA Smile Dental Clinic",
    description:
      "Explore digital smile design, dental implants, single-visit root canal, and gentle dental treatments in Bilimora.",
    url: "/services",
  },
};

export const dynamic = "force-dynamic";

import Link from "next/link";

export default function ServicesPage() {
  const store = getTreatmentsStoreData();
  const showDiagnostics = store.settings?.showDiagnostics !== false;
  const showTreatments = store.settings?.showTreatments !== false;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("localhost") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("127.0.0.1") &&
    !process.env.NEXT_PUBLIC_APP_URL.includes("vercel.app")
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
      : "https://www.casmiledentalclinic.com";

  const allActiveItems = (store.treatments || []).filter((t) => t.isActive);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/services#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services & Diagnostics",
            item: `${baseUrl}/services`,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${baseUrl}/services#itemlist`,
        name: "CA Smile Dental Treatments & Diagnostic Services",
        itemListElement: allActiveItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          url: `${baseUrl}/treatments/${item.id}`,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Top Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-zinc-500 font-medium"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Services &amp; Diagnostics</span>
        </nav>
      </div>

      <WhiteDentalTreatmentShowcase
        mode="both"
        initialTreatments={store.treatments}
        initialDiagnostics={store.diagnostics}
        initialShowTreatments={showTreatments}
        initialShowDiagnostics={showDiagnostics}
        initialSettings={store.settings}
        allOpen={true}
      />
    </main>
  );
}

