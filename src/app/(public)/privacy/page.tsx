import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { SectionWrapper } from "@/components/design-system/section-wrapper";

export const metadata: Metadata = {
  title: "Privacy Policy | CA Smile Dental Clinic Bilimora",
  description:
    "Privacy Policy for CA Smile Dental Clinic in Bilimora, Gujarat. How we protect and manage patient health information, consultations, and appointment records.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-brand-muted">
              Last updated: November 2026 • CA Smile Dental Clinic, Bilimora
            </p>
          </div>
        </div>

        <div className="prose prose-teal dark:prose-invert max-w-none space-y-6 text-brand-muted leading-relaxed">
          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">1. Information We Collect</h2>
            <p>
              When you book an appointment, submit an inquiry, or visit CA Smile Dental Clinic in Bilimora,
              we may collect personal and clinical health information including your name, phone number,
              email address, date of birth, relevant dental and medical history, and clinical X-rays or diagnostic scans.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">2. How We Use Your Information</h2>
            <p>
              Your personal information is used exclusively to deliver personalized dental care, schedule and confirm appointments,
              send appointment reminders via SMS/WhatsApp, maintain dental records in accordance with Indian healthcare regulations,
              and process treatment plans.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">3. Confidentiality and Medical Data Protection</h2>
            <p>
              Patient confidentiality is paramount. We do not sell, rent, or trade your personal or clinical information
              to third-party advertisers. Information is only shared with authorized clinical staff and diagnostic laboratories
              strictly necessary for your dental treatment (such as crown fabrication or 3D scan milling).
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">4. Security of Clinical Records</h2>
            <p>
              We implement industry-standard administrative, physical, and digital safeguards to protect your personal data
              against unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section className="bg-brand-surface p-6 rounded-2xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text mb-3">5. Contact Clinic Officer</h2>
            <p>
              If you have any questions regarding your health information or wish to update your records, please contact:
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
