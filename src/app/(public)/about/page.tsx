import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Award,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import { SectionWrapper } from "@/components/design-system/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";

import { DoctorOwnerProfile } from "@/components/public/doctor-owner-profile";

export const metadata: Metadata = {
  title: "About HealthSphere Clinic | Medical Leadership & Mission",
  description:
    "Learn about HealthSphere Clinic's leadership, physician founder, clinic ownership, patient-centered care philosophy, and modern facilities.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About HealthSphere Medical Clinic - Doctor & Founder Profile",
    description:
      "Founded by experienced physicians to provide compassionate care, advanced diagnostics, and surgical precision.",
    url: "/about",
  },
};

export default function AboutPage() {
  const leadership = [
    {
      name: "Dr. Sarah Vance, MD",
      role: "Chief Medical Officer & Founder",
      credentials: "Harvard Medical School • 14 Years Clinical Practice",
      bio: "Dr. Vance founded HealthSphere to create an outpatient care model prioritizing preventative medicine and unhurried patient conversations.",
      specialty: "Family & Internal Medicine",
    },
    {
      name: "Dr. Marcus Chen, MD, FACC",
      role: "Director of Cardiovascular Health",
      credentials: "Johns Hopkins • Fellow American College of Cardiology",
      bio: "Pioneer in non-invasive atherogenic risk profiling and community hypertensive intervention programs.",
      specialty: "Preventive Cardiology",
    },
    {
      name: "Dr. Elena Rostova, MD",
      role: "Head of Pediatric Medicine",
      credentials: "Stanford University School of Medicine",
      bio: "Dedicated to gentle, stress-free child health experiences, newborn developmental screening, and pediatric immunology.",
      specialty: "Pediatrics & Adolescent Medicine",
    },
    {
      name: "Dr. David Kim, DDS",
      role: "Director of Dental Surgery",
      credentials: "Columbia University College of Dental Medicine",
      bio: "Champion of oral-systemic health protocols, gentle restorative dentistry, and periodontal disease prevention.",
      specialty: "Restorative Dentistry",
    },
  ];

  const values = [
    {
      title: "Evidence-Based Rigor",
      desc: "Every clinical protocol, screening test, and prescription follows peer-reviewed clinical guidelines.",
      icon: Award,
    },
    {
      title: "Patient Dignity & Transparency",
      desc: "No surprise medical bills. We publish straightforward fees, duration estimates, and clinical rationale upfront.",
      icon: Heart,
    },
    {
      title: "Preventive-First Philosophy",
      desc: "We prioritize early biomarker detection to intervene years before chronic disease symptoms manifest.",
      icon: Sparkles,
    },
    {
      title: "Modern Accessibility",
      desc: "Same-day appointments, encrypted patient charts, and immediate electronic prescription delivery.",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="space-y-16 py-12 sm:py-16">
      {/* Intro Hero */}
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="max-w-3xl space-y-4">
          <Badge variant="default">Our Story &amp; Care Philosophy</Badge>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl lg:text-5xl">
            Re-architecting Outpatient Healthcare Around the Patient
          </h1>
          <p className="text-base leading-relaxed text-brand-muted sm:text-lg">
            HealthSphere was founded with a singular conviction: medicine is
            most effective when physicians have the time to listen, diagnostics
            are immediate, and patient care is treated as a lasting partnership.
          </p>
        </div>
      </SectionWrapper>

      {/* Doctor & Owner Spotlight Section */}
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1.5 text-xs">
              <Stethoscope className="h-3.5 w-3.5 text-brand-primary" />
              <span>Physician &amp; Ownership Profile</span>
            </Badge>
          </div>
          <DoctorOwnerProfile />
        </div>
      </SectionWrapper>

      {/* Story & Mission Section */}
      <SectionWrapper variant="surface" className="py-12 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 className="font-heading text-2xl font-bold text-brand-text sm:text-3xl">
              From Traditional Frustrations to Clinical Innovation
            </h2>
            <p className="text-sm leading-relaxed text-brand-muted">
              For decades, outpatient clinics have suffered from systemic
              congestion: rushed 7-minute visits, impersonal waiting rooms, and
              opaque diagnostic bills that arrive months later.
            </p>
            <p className="text-sm leading-relaxed text-brand-muted">
              In 2021, our physician founders designed HealthSphere from
              scratch. We eliminated arbitrary waiting rooms through automated
              digital intake, integrated on-site diagnostic panels, and
              established extended 30-to-60 minute clinical consultations.
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-text">
                <CheckCircle2
                  className="h-4 w-4 text-brand-primary"
                  aria-hidden="true"
                />
                <span>Full Facility Accreditation</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-text">
                <CheckCircle2
                  className="h-4 w-4 text-brand-primary"
                  aria-hidden="true"
                />
                <span>Board-Certified Physicians Only</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-accent/20 space-y-6 rounded-clinic border border-brand-border p-8">
            <div className="font-heading text-xl font-bold text-brand-text">
              Our Clinic by the Numbers
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="font-heading text-3xl font-extrabold text-brand-primary">
                  15,000+
                </div>
                <div className="mt-1 text-xs text-brand-muted">
                  Community Patients Served
                </div>
              </div>
              <div>
                <div className="font-heading text-3xl font-extrabold text-brand-primary">
                  99.4%
                </div>
                <div className="mt-1 text-xs text-brand-muted">
                  Patient Satisfaction Rating
                </div>
              </div>
              <div>
                <div className="font-heading text-3xl font-extrabold text-brand-primary">
                  &lt; 15 min
                </div>
                <div className="mt-1 text-xs text-brand-muted">
                  Average Wait Time
                </div>
              </div>
              <div>
                <div className="font-heading text-3xl font-extrabold text-brand-primary">
                  24 / 7
                </div>
                <div className="mt-1 text-xs text-brand-muted">
                  Urgent Care Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Core Values */}
      <SectionWrapper containerSize="default" className="py-0 sm:py-0 lg:py-0">
        <div className="space-y-10">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <Badge variant="default">Core Commitments</Badge>
            <h2 className="font-heading text-2xl font-bold text-brand-text sm:text-3xl">
              The Principles That Guide Every Treatment
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <Card key={idx} className="space-y-3 p-6">
                  <div className="bg-brand-accent/50 flex h-10 w-10 items-center justify-center rounded-clinic text-brand-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-brand-text">
                    {val.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-brand-muted">
                    {val.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* Medical Leadership */}
      <SectionWrapper variant="surface" className="py-12 sm:py-16">
        <div className="space-y-10">
          <div className="max-w-2xl space-y-3">
            <Badge variant="default">Clinical Leadership</Badge>
            <h2 className="font-heading text-2xl font-bold text-brand-text sm:text-3xl">
              Meet Our Directing Physicians
            </h2>
            <p className="text-sm text-brand-muted">
              Our clinical directors actively see patients daily and lead
              ongoing research in preventive longevity and cardiology.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {leadership.map((physician, idx) => (
              <Card key={idx} className="space-y-4 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-clinic bg-brand-primary font-heading text-xl font-bold text-brand-primary-foreground">
                    {physician.name.split(" ")[1]?.charAt(0) || "D"}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-text">
                      {physician.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-primary">
                      {physician.role}
                    </p>
                    <div className="flex items-center gap-1 pt-1 text-[11px] text-brand-muted">
                      <GraduationCap
                        className="h-3 w-3 text-brand-primary"
                        aria-hidden="true"
                      />
                      <span>{physician.credentials}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-brand-muted">
                  {physician.bio}
                </p>

                <div className="border-brand-border/60 flex items-center justify-between border-t pt-3">
                  <span className="text-xs font-medium text-brand-text">
                    Focus: {physician.specialty}
                  </span>
                  <BookNowButton
                    href={`/book?doctor=${encodeURIComponent(physician.name)}`}
                    text="Book Now"
                    size="sm"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
