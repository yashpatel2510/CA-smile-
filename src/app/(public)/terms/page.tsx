import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { SectionWrapper } from "@/components/design-system/section-wrapper";

export const metadata: Metadata = {
  title: "Terms of Service | CA Smile Dental Clinic Bilimora",
  description:
    "Terms of Service for CA Smile Dental Clinic in Bilimora, Gujarat. Guidelines for appointments, treatment consultations, cancellations, and clinical care.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <SectionWrapper className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-brand-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-teal-600 dark:text-teal-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-brand-muted">
              Last updated: November 2026 • CA Smile Dental Clinic, Bilimora
            </p>
          </div>
        </div>

        <div className="prose prose-teal dark:prose-invert max-w-none space-y-6 text-brand-muted leading-relaxed">
          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">1. Clinical Consultations & Appointments</h2>
            <p>
              Appointments booked online through our website are subject to clinic verification and confirmation.
              While we make every effort to honor scheduled appointment times, dental emergencies may occasionally cause
              unavoidable schedule adjustments.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">2. Medical Information & Informed Consent</h2>
            <p>
              Patients are required to provide accurate and complete medical and dental health history prior to treatment.
              Before any major procedure (such as root canal treatment, dental implants, surgical extractions, or anesthesia),
              our clinical staff will discuss the treatment plan, benefits, and risks to obtain informed consent.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">3. Cancellations & Rescheduling</h2>
            <p>
              If you need to reschedule or cancel an appointment, we kindly request at least 24 hours prior notice
              so that the appointment slot can be made available to other patients requiring dental care.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">4. Transparent Pricing & Payments</h2>
            <p>
              Treatment costs will be clearly communicated before commencing clinical work. Payment is due upon completion
              of the clinical service or according to the agreed multi-stage payment plan for long-term treatments like implants or braces.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">5. Contact Information</h2>
            <p>
              For questions regarding these terms, please contact:
            </p>
            <div className="mt-3 p-4 bg-brand-background rounded-xl text-sm border border-brand-border">
              <p className="font-semibold text-brand-text">CA Smile Dental Clinic</p>
              <p>Convent Rd, Bilimora, Gujarat 396321</p>
              <p>Phone: +91 72260 98074</p>
              <p>Email: casmileatbilimora@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}
