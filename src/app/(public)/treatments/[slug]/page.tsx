import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  Share2,
  Heart,
  MessageCircle,
  HelpCircle,
  Activity,
  Layers,
  Award,
} from "lucide-react";
import { getTreatmentsStoreDataAsync, getTreatmentByIdAsync } from "@/lib/treatments-store";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TreatmentPageProps {
  params: {
    slug: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TreatmentPageProps): Promise<Metadata> {
  const treatment = await getTreatmentByIdAsync(params.slug);
  if (!treatment) {
    return {
      title: "Treatment Not Found | White Dental Clinic",
    };
  }

  return {
    title: `${treatment.title} ${treatment.subtitle ? `(${treatment.subtitle})` : ""} | White Dental Clinic`,
    description: treatment.whatItIs || treatment.paragraphs[0] || "Advanced dental treatment.",
    alternates: {
      canonical: `/treatments/${treatment.id}`,
    },
    openGraph: {
      title: `${treatment.title} | White Dental Clinic`,
      description: treatment.whatItIs || treatment.paragraphs[0],
      images: treatment.image ? [{ url: treatment.image }] : undefined,
    },
  };
}

export default async function TreatmentDetailPage({ params }: TreatmentPageProps) {
  const treatment = await getTreatmentByIdAsync(params.slug);
  const store = await getTreatmentsStoreDataAsync();
  const allTreatments = store.treatments.filter((t) => t.isActive !== false);

  if (!treatment) {
    notFound();
  }

  // Filter other treatments for recommendation
  const otherTreatments = allTreatments
    .filter((t) => t.id !== treatment.id)
    .slice(0, 4);

  const treatmentIndex = allTreatments.findIndex((t) => t.id === treatment.id);
  const treatmentNum = treatmentIndex >= 0 ? String(treatmentIndex + 1).padStart(2, "0") : null;

  // Procedure steps array
  const steps = Array.isArray(treatment.procedure) && treatment.procedure.length > 0
    ? treatment.procedure
    : [
        "Diagnostic evaluation and digital 3D scans.",
        "Customized clinical treatment design.",
        "Minimally invasive clinical execution.",
        "Final polish, bite check, and longevity care guide.",
      ];

  return (
    <main className="min-h-screen bg-zinc-50/50 pb-20 pt-8 sm:pt-12 font-sans selection:bg-black selection:text-white">
      {/* Top Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-zinc-500 font-medium mb-8"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/#services-preview" className="hover:text-black transition-colors">
            Treatments
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {treatment.title}
          </span>
        </nav>
      </div>

      {/* Hero Header Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 mb-12 sm:mb-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-zinc-200/80 shadow-xs relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-50/60 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-50/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                {treatmentNum && (
                  <span className="font-mono text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200/90 px-3 py-1 rounded-full">
                    No. {treatmentNum}
                  </span>
                )}
                <Badge
                  variant="default"
                  className="bg-black text-white hover:bg-zinc-800 text-xs px-3 py-1 font-medium rounded-full"
                >
                  {treatment.category || "Clinical Treatment"}
                </Badge>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Accepting Patients
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 font-sans leading-tight">
                  {treatment.title}
                </h1>
                {treatment.subtitle && (
                  <p className="text-lg sm:text-xl font-normal text-zinc-500 mt-2">
                    {treatment.subtitle}
                  </p>
                )}
              </div>

              <p className="text-base sm:text-lg text-zinc-700 font-normal leading-relaxed">
                {treatment.whatItIs || treatment.paragraphs[0]}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href={`/book?treatment=${encodeURIComponent(treatment.title)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-7 py-3 text-sm font-semibold hover:bg-zinc-800 transition-all duration-150 active:scale-95 shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment Now</span>
                </Link>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hello, I would like to inquire about ${treatment.title} at your clinic.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-800 hover:border-black hover:text-black transition-all duration-150 active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp Doctor</span>
                </a>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-100 shadow-md border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] uppercase tracking-wider text-teal-300 font-semibold block">
                    Certified Clinical Procedure
                  </span>
                  <span className="text-sm font-medium text-white/90">
                    Comprehensive &amp; Safe Dental Care
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: The Complete Treatment Details in TIMELINE Format */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Main Timeline Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Section Heading */}
            <div className="border-b border-zinc-200 pb-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
                <Activity className="h-4 w-4" />
                <span>Complete Clinical Breakdown</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                Treatment Journey &amp; Step-by-Step Timeline
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Everything you need to know about this procedure, explained simply for patients &amp; families.
              </p>
            </div>

            {/* Interactive Timeline Container */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-zinc-200 space-y-12 my-6">
              {/* TIMELINE STAGE 1: What It Is */}
              <div className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[37px] sm:-left-[45px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/90 shadow-xs hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                      Stage 01 • Overview
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Concept &amp; Definition</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3">
                    What it is
                  </h3>
                  <p className="text-zinc-700 text-base sm:text-[16px] leading-relaxed font-normal">
                    {treatment.whatItIs || treatment.paragraphs[0]}
                  </p>
                </div>
              </div>

              {/* TIMELINE STAGE 2: How It Works */}
              <div className="relative group">
                <div className="absolute -left-[37px] sm:-left-[45px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/90 shadow-xs hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                      Stage 02 • Mechanism
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Technology &amp; Execution</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3">
                    How it works
                  </h3>
                  <p className="text-zinc-700 text-base sm:text-[16px] leading-relaxed font-normal">
                    {treatment.howItWorks || treatment.paragraphs[1] || treatment.paragraphs[0]}
                  </p>
                </div>
              </div>

              {/* TIMELINE STAGE 3: Step-by-Step Procedure */}
              <div className="relative group">
                <div className="absolute -left-[37px] sm:-left-[45px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-black text-white shadow-md group-hover:scale-110 transition-transform">
                  <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/90 shadow-xs hover:border-black/50 transition-colors">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md">
                      Stage 03 • Step-by-Step Procedure
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold">{steps.length} Key Steps</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-4">
                    Clinical Treatment Process
                  </h3>

                  {/* Sub-timeline for each step */}
                  <div className="space-y-4 pt-2">
                    {steps.map((stepText, idx) => {
                      // Remove leading number like "1. " if present
                      const cleanText = stepText.replace(/^\d+\.\s*/, "");
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-150 hover:bg-zinc-100/70 transition-colors"
                        >
                          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-black text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div className="text-zinc-800 text-sm sm:text-base leading-relaxed pt-0.5">
                            {cleanText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TIMELINE STAGE 4: Benefits */}
              {treatment.benefits && (
                <div className="relative group">
                  <div className="absolute -left-[37px] sm:-left-[45px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-md group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/90 shadow-xs hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        Stage 04 • Benefits
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">Patient Advantages</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3">
                      Benefits
                    </h3>
                    <p className="text-zinc-700 text-base sm:text-[16px] leading-relaxed font-normal">
                      {treatment.benefits}
                    </p>
                  </div>
                </div>
              )}

              {/* TIMELINE STAGE 5: Result */}
              {treatment.result && (
                <div className="relative group">
                  <div className="absolute -left-[37px] sm:-left-[45px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-md group-hover:scale-110 transition-transform">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/90 shadow-xs hover:border-amber-500/50 transition-colors">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                        Stage 05 • Transformation
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">Expected Clinical Outcome</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-3">
                      Result
                    </h3>
                    <p className="text-zinc-700 text-base sm:text-[16px] leading-relaxed font-normal">
                      {treatment.result}
                    </p>
                  </div>
                </div>
              )}

              {/* TIMELINE STAGE 6: What If It Is Not Done */}
              {treatment.whatIfNotDone && (
                <div className="relative group">
                  <div className="absolute -left-[37px] sm:-left-[45px] top-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-white bg-rose-600 text-white shadow-md group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  <div className="bg-rose-50/50 rounded-2xl p-6 sm:p-8 border border-rose-200/80 shadow-xs hover:border-rose-400 transition-colors">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
                        Stage 06 • Advisory
                      </span>
                      <span className="text-xs text-rose-500 font-semibold">Risk Analysis</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-rose-950 mb-3">
                      What if it is not done?
                    </h3>
                    <p className="text-rose-900/90 text-base sm:text-[16px] leading-relaxed font-normal">
                      {treatment.whatIfNotDone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Quick Actions, Doctor Consultation, and Other Treatments */}
          <div className="lg:col-span-4 space-y-8">
            {/* Booking Card */}
            <div className="sticky top-24 bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-5">
              <h4 className="text-lg font-bold text-zinc-900">
                Ready to schedule your visit?
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Consult with our dental specialists for personalized treatment planning and same-day digital scans.
              </p>

              <div className="space-y-2.5 pt-1">
                <Link
                  href={`/book?treatment=${encodeURIComponent(treatment.title)}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black text-white px-5 py-3 text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-xs"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment</span>
                </Link>

                <a
                  href="tel:+919876543210"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:border-black hover:text-black transition-colors"
                >
                  <Clock className="h-4 w-4 text-zinc-400" />
                  <span>Call Reception</span>
                </a>
              </div>

              {/* Guarantees Checklist */}
              <div className="pt-4 border-t border-zinc-150 space-y-2.5 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Digital 3D Simulation &amp; Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Gentle &amp; Pain-Free Clinical Protocols</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Hospital-Grade Sterilization Standards</span>
                </div>
              </div>

              {/* Other Treatments in this Clinic */}
              <div className="pt-5 border-t border-zinc-150 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Other Treatments
                  </h5>
                  <Link
                    href="/#services-preview"
                    className="text-xs font-medium text-black hover:underline"
                  >
                    View All on Home
                  </Link>
                </div>
                <div className="space-y-2">
                  {otherTreatments.map((ot) => (
                    <Link
                      key={ot.id}
                      href={`/treatments/${ot.id}`}
                      className="group flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-xs"
                    >
                      <span className="font-medium text-zinc-800 group-hover:text-black truncate pr-2">
                        {ot.title}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
