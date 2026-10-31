import type { Metadata } from "next";
import { WhiteDentalTreatmentShowcase } from "@/components/public/white-dental-treatment-showcase";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

export const metadata: Metadata = {
  title: "Diagnostics & Dental Treatments | White Dental Clinic",
  description:
    "Explore our complete directory of clinical treatments, computed tomography, precision diagnostics, and aesthetic dental medicine. Schedule your appointment online.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Diagnostics & Dental Treatments | White Dental Clinic",
    description:
      "Explore clinical computed tomography, digital radiography, veneers, and tailored dental treatments.",
    url: "/services",
  },
};

export const dynamic = "force-dynamic";

import Link from "next/link";

export default function ServicesPage() {
  const store = getTreatmentsStoreData();
  const showDiagnostics = store.settings?.showDiagnostics !== false;
  const showTreatments = store.settings?.showTreatments !== false;

  return (
    <main className="min-h-screen bg-white">
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

