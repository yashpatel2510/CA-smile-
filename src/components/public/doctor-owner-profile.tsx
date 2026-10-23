"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Clock,
  Sparkles,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";
import { ClinicLogo } from "@/components/ui/clinic-logo";

export function DoctorOwnerProfile() {
  const { brandConfig, currentTheme } = useClinicTheme();

  const doctorName = brandConfig.doctorName || "Dr. Sankar";
  const doctorTitle =
    brandConfig.doctorTitle || "Chief Dental Surgeon & Clinic Founder";
  const doctorBio =
    brandConfig.doctorBio ||
    "Distinguished clinician with over 15 years of surgical excellence in implantology, painless endodontics, and restorative oral rehabilitation.";
  const doctorPhone =
    brandConfig.doctorPhone || brandConfig.phone || "+91 98470 12345";
  const ownerName =
    brandConfig.ownerName || `${doctorName} & Medical Associates`;
  const ownerTitle =
    brandConfig.ownerTitle || "Clinic Ownership & Managing Board";
  const ownerBio =
    brandConfig.ownerBio ||
    "Dedicated to clinical transparency, highest sterilization protocols, and empathetic patient care.";
  const address = brandConfig.address || "742 Evergreen Medical Way, Suite 400";
  const email = brandConfig.email || "contact@healthsphere.example.com";
  const workingHours =
    brandConfig.workingHours ||
    "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only";

  return (
    <div className="space-y-8">
      {/* Doctor & Founder Card */}
      <Card className="border-brand-primary/40 overflow-hidden border-2 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Avatar & Doctor Identity */}
          <div className="bg-brand-accent/20 flex flex-col items-center justify-center p-8 text-center md:col-span-4 md:border-r md:border-brand-border">
            <div className="relative">
              <div className="shadow-md flex h-28 w-28 items-center justify-center rounded-clinic bg-brand-primary font-heading text-4xl font-extrabold text-brand-primary-foreground sm:h-32 sm:w-32">
                <Stethoscope className="h-14 w-14" />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full border-2 border-brand-surface bg-brand-secondary p-1.5 text-brand-secondary-foreground shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <h3 className="mt-4 font-heading text-xl font-bold text-brand-text">
              {doctorName}
            </h3>
            <Badge variant="default" className="mt-1 text-xs">
              {doctorTitle}
            </Badge>

            <div className="mt-4 flex flex-col gap-2 text-xs text-brand-muted">
              <div className="flex items-center justify-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-brand-primary" />
                <span>BDS, MDS • Senior Consultant</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-semibold text-brand-text">
                <Phone className="h-3.5 w-3.5 text-brand-primary" />
                <a
                  href={`tel:${doctorPhone.replace(/\D/g, "")}`}
                  className="hover:underline"
                >
                  {doctorPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Biography & Qualifications */}
          <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Lead Clinical Director &amp; Founder
                </span>
              </div>

              <h4 className="font-heading text-xl font-bold text-brand-text sm:text-2xl">
                Compassionate Care Directed by {doctorName}
              </h4>

              <p className="text-sm leading-relaxed text-brand-muted">
                {doctorBio}
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
                  <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  <span>15+ Years Clinical Practice</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
                  <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  <span>Certified Infection &amp; Hygiene Standards</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
                  <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  <span>Personalized One-on-One Consultations</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-text">
                  <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  <span>Available for Emergency Triage</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-brand-border/60 pt-4">
              <div className="text-xs text-brand-muted">
                Clinic Phone:{" "}
                <strong className="text-brand-text">
                  <a
                    href={`tel:${doctorPhone.replace(/\D/g, "")}`}
                    className="hover:underline"
                  >
                    {doctorPhone}
                  </a>
                </strong>
              </div>
              <div className="flex items-center gap-3">
                <a href={`tel:${doctorPhone.replace(/\D/g, "")}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Clinic</span>
                  </Button>
                </a>
                <BookNowButton
                  href={`/contact?doctor=${encodeURIComponent(doctorName)}`}
                  text={`Consult ${doctorName}`}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Clinic Ownership & Operational Details Box */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="shadow-xs flex h-10 w-10 items-center justify-center rounded-clinic bg-brand-primary text-brand-primary-foreground">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                Clinic Ownership
              </span>
              <h4 className="font-heading text-base font-bold text-brand-text">
                {ownerName}
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-brand-muted">
            {ownerBio}
          </p>
          <div className="mt-4 border-t border-brand-border/60 pt-3 text-[11px] text-brand-muted">
            Role: <strong>{ownerTitle}</strong>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="shadow-xs flex h-10 w-10 items-center justify-center rounded-clinic bg-brand-primary text-brand-primary-foreground">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                Working Hours &amp; Location
              </span>
              <h4 className="font-heading text-base font-bold text-brand-text">
                Patient Consultations
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-brand-muted">
            {workingHours}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-brand-border/60 pt-3 text-[11px] text-brand-muted">
            <span className="truncate">{address}</span>
            <span className="font-mono text-brand-primary">Open Daily</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
