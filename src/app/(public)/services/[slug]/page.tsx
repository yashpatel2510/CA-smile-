import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTreatmentById } from "@/lib/treatments-store";
import {
  Clock,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Stethoscope,
  HelpCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { clinicalServices, getServiceBySlug } from "@/data/services-data";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return clinicalServices.map((svc) => ({
    slug: svc.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const treatment = getTreatmentById(params.slug);
  if (treatment) {
    return {
      title: `${treatment.title} | White Dental Clinic`,
      description: treatment.whatItIs || treatment.paragraphs[0],
    };
  }

  const service = getServiceBySlug(params.slug);
  if (!service) {
    return {
      title: "Service Not Found | HealthSphere Clinic",
    };
  }

  return {
    title: `${service.name} | HealthSphere Clinic Specialties`,
    description: `${service.summary} Learn what to expect, preparation instructions, and schedule your appointment with ${service.leadSpecialist.split(" (")[0]}.`,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.name} - HealthSphere Medical Clinic`,
      description: service.summary,
      url: `/services/${service.slug}`,
      type: "article",
    },
  };
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  const treatment = getTreatmentById(params.slug);
  if (treatment) {
    redirect(`/treatments/${params.slug}`);
  }

  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="py-12 sm:py-16">
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="space-y-10">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-brand-muted"
          >
            <Link
              href="/"
              className="transition-colors hover:text-brand-primary"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/services"
              className="transition-colors hover:text-brand-primary"
            >
              Services
            </Link>
            <span>/</span>
            <span className="truncate font-semibold text-brand-text">
              {service.name}
            </span>
          </nav>

          {/* Service Title Header & Quick Booking Callout */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="flex items-center gap-2">
                <Badge variant="default">{service.category}</Badge>
                <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                  <Clock
                    className="h-3.5 w-3.5 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span>{service.duration} clinical appointment</span>
                </div>
              </div>

              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl lg:text-5xl">
                {service.name}
              </h1>

              <p className="text-base leading-relaxed text-brand-muted sm:text-lg">
                {service.description}
              </p>
            </div>

            {/* Sticky Booking Summary Card */}
            <div className="lg:col-span-4">
              <Card className="border-brand-primary/30 sticky top-28 bg-brand-surface shadow-lg">
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-center justify-between border-b border-brand-border pb-4">
                    <div>
                      <span className="block text-xs text-brand-muted">
                        Clinical Department
                      </span>
                      <span className="font-heading text-lg font-bold text-brand-text">
                        {service.category}
                      </span>
                    </div>
                    <Badge variant="success">Accepting Patients</Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Stethoscope
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="block font-semibold text-brand-text">
                          Attending Lead
                        </span>
                        <span className="text-brand-muted">
                          {service.leadSpecialist}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="block font-semibold text-brand-text">
                          Duration
                        </span>
                        <span className="text-brand-muted">
                          {service.duration} one-on-one session
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <ShieldCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <span className="block font-semibold text-brand-text">
                          HSA / FSA Eligible
                        </span>
                        <span className="text-brand-muted">
                          Eligible for instant reimbursement receipts
                        </span>
                      </div>
                    </div>
                  </div>

                  <BookNowButton
                    href={`/contact?service=${encodeURIComponent(service.name)}`}
                    text="Book Now"
                    size="lg"
                    fullWidth
                  />

                  <div className="text-center">
                    <span className="text-[11px] text-brand-muted">
                      Same-day questions? Call{" "}
                      <a
                        href="tel:+917226098074"
                        className="font-medium text-brand-primary hover:underline"
                      >
                        +91 72260 98074
                      </a>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Clinical Sections */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-10 lg:col-span-8">
              {/* Indications */}
              <section className="space-y-4 rounded-clinic border border-brand-border bg-brand-surface p-6 sm:p-8">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-text">
                  <CheckCircle2
                    className="h-5 w-5 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span>Clinical Indications</span>
                </h2>
                <p className="text-xs leading-relaxed text-brand-muted sm:text-sm">
                  This consultation is recommended for patients experiencing or
                  managing any of the following:
                </p>
                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                  {service.indications.map((ind, i) => (
                    <div
                      key={i}
                      className="bg-brand-background/60 flex items-start gap-2.5 rounded-clinic border border-brand-border p-3 text-xs text-brand-text"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* What to Expect */}
              <section className="space-y-4 rounded-clinic border border-brand-border bg-brand-surface p-6 sm:p-8">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-text">
                  <Sparkles
                    className="h-5 w-5 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span>What to Expect During Your Appointment</span>
                </h2>
                <ol className="space-y-3 text-xs text-brand-muted sm:text-sm">
                  {service.whatToExpect.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary font-heading text-xs font-bold text-brand-primary-foreground">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed text-brand-text">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Preparation Instructions */}
              <section className="bg-brand-accent/20 space-y-4 rounded-clinic border border-brand-border p-6 sm:p-8">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-text">
                  <AlertCircle
                    className="h-5 w-5 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span>Patient Preparation Guidelines</span>
                </h2>
                <ul className="space-y-2 text-xs text-brand-muted sm:text-sm">
                  {service.preparation.map((prep, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                        aria-hidden="true"
                      />
                      <span className="text-brand-text">{prep}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Frequently Asked Questions */}
              <section className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-text">
                  <HelpCircle
                    className="h-5 w-5 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span>Frequently Asked Questions</span>
                </h2>
                <div className="space-y-3">
                  {service.faqs.map((faq, i) => (
                    <Card key={i}>
                      <CardContent className="space-y-2 p-5">
                        <h3 className="font-heading text-sm font-semibold text-brand-text">
                          {faq.question}
                        </h3>
                        <p className="text-xs leading-relaxed text-brand-muted">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Back navigation link */}
              <div className="pt-4">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to all clinical services</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
