import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { WhiteDentalTreatmentShowcase } from "@/components/public/white-dental-treatment-showcase";
import { getTreatmentsStoreData } from "@/lib/treatments-store";

export const metadata: Metadata = {
  title: "Clinical Dental Treatments & 3D Diagnostics | Smile Dental Clinic",
  description:
    "Explore our complete directory of clinical dental treatments, 3D CBCT computed tomography, root canals, implants, veneers, and pain-free preventative dentistry. Book your consultation online.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Clinical Dental Treatments & 3D Diagnostics | Smile Dental Clinic",
    description:
      "Explore clinical computed tomography, digital radiography, veneers, implants, and tailored dental medicine.",
    url: "/services",
  },
};

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  const store = getTreatmentsStoreData();
  const showDiagnostics = store.settings?.showDiagnostics !== false;
  const showTreatments = store.settings?.showTreatments !== false;

  const faqs = [
    {
      q: "How do I know whether I need a diagnostic scan or direct treatment?",
      a: "Every new patient begins with a gentle diagnostic evaluation (such as digital intraoral radiography or 3D CBCT scan). This ensures we identify the root cause of symptoms rather than guessing, allowing for conservative and long-lasting treatment.",
    },
    {
      q: "Are low-dose digital dental X-rays and 3D CBCT scans safe?",
      a: "Yes, absolutely. Our clinic utilizes advanced ultra-low-dose digital sensors and cone-beam scanners that reduce radiation exposure by up to 90% compared to traditional film X-rays, making them safe even for frequent monitoring.",
    },
    {
      q: "Are procedures like root canals and implants painful?",
      a: "No. We utilize computerized local anesthesia, gentle rotary endodontics, and minimally invasive techniques. Most patients report feeling zero pain during the procedure, experiencing only mild pressure.",
    },
    {
      q: "Will I receive a clear cost estimate before treatment starts?",
      a: "Yes. Following your diagnostic scan, our dental surgeon provides a transparent, itemized treatment breakdown detailing costs, sessions, and recovery steps with zero hidden surprises.",
    },
  ];

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
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Treatments &amp; Diagnostics</span>
        </nav>
      </div>

      {/* Hero Introduction Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-4">
        <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-teal-50/40 p-8 sm:p-12 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/70 border border-teal-200 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              <span>Full Clinical Spectrum</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 font-sans leading-tight">
              Evidence-Based Treatments &amp; Advanced 3D Diagnostics
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
              We combine modern 3D cone-beam volumetric imaging, computerized dental planning, and gentle microscopic techniques.
              Explore all clinical solutions unified in the interactive directory below.
            </p>
          </div>
        </div>
      </section>

      {/* ONE UNIFIED SECTION: Treatments & Diagnostics */}
      <WhiteDentalTreatmentShowcase
        mode="both"
        initialShowTreatments={showTreatments}
        initialShowDiagnostics={showDiagnostics}
        initialSettings={store.settings}
        allOpen={false}
      />

      {/* Patient Frequently Asked Questions */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-zinc-200">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
            <HelpCircle className="h-4 w-4" />
            <span>Patient Guidance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Common questions regarding our diagnostic protocols, comfort measures, and consultation fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 sm:p-7 hover:border-zinc-300 transition-colors shadow-2xs"
            >
              <h3 className="text-base font-bold text-zinc-900 mb-2.5 flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-mono font-bold mt-0.5">
                  Q
                </span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
