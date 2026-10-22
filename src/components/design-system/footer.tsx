"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Heart,
  Clock,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { ClinicLogo } from "@/components/ui/clinic-logo";

export function Footer() {
  const { currentTheme, brandConfig } = useClinicTheme();

  return (
    <footer className="border-t border-brand-border bg-brand-surface text-brand-text transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Clinic Brand & Tagline */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label={`${brandConfig?.logo?.clinicDisplayName || "HealthSphere"} Home`}
            >
              <div className="transition-transform group-hover:scale-105">
                <ClinicLogo size="md" />
              </div>
              <div>
                <span className="block font-heading text-lg font-bold text-brand-text">
                  {brandConfig?.logo?.clinicDisplayName || "HealthSphere"}
                </span>
                <span className="-mt-1 block text-xs text-brand-muted">
                  {brandConfig?.logo?.tagline ||
                    `${currentTheme.name} Medical Center`}
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-brand-muted">
              Compassionate, state-of-the-art healthcare tailored to your
              family&apos;s wellness. Delivering comprehensive primary
              diagnostics, specialty cardiology, and pediatric care.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-brand-muted">
              <ShieldCheck
                className="h-4 w-4 text-brand-primary"
                aria-hidden="true"
              />
              <span>Accredited Clinical Excellence & HIPAA Compliant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3.5 font-heading text-sm font-semibold tracking-wide text-brand-text">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-brand-muted">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-brand-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="transition-colors hover:text-brand-primary"
                >
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-brand-primary"
                >
                  About Our Clinic
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-brand-primary"
                >
                  Health Journal & Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-brand-primary"
                >
                  Contact & Locations
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-brand-primary"
                >
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="font-medium text-brand-primary transition-colors hover:text-brand-primary"
                >
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h3 className="mb-3.5 font-heading text-sm font-semibold tracking-wide text-brand-text">
              Operating Hours
            </h3>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <div>
                  <span className="block font-medium text-brand-text">
                    Monday – Friday
                  </span>
                  <span>8:00 AM – 7:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <div>
                  <span className="block font-medium text-brand-text">
                    Saturday
                  </span>
                  <span>9:00 AM – 4:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <div>
                  <span className="block font-medium text-brand-text">
                    Sunday
                  </span>
                  <span>Urgent Care: 10 AM – 2 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="mb-3.5 font-heading text-sm font-semibold tracking-wide text-brand-text">
              Contact Us
            </h3>
            <ul className="space-y-2.5 text-xs text-brand-muted">
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <span>
                  742 Evergreen Medical Way, Suite 400, Metro City, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="h-3.5 w-3.5 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <a
                  href="tel:8005552546"
                  className="font-medium hover:text-brand-primary"
                >
                  (800) 555-CLINIC
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="h-3.5 w-3.5 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <a
                  href="mailto:contact@healthsphere.example.com"
                  className="hover:text-brand-primary"
                >
                  contact@healthsphere.example.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-border pt-6 text-xs text-brand-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} VS Multispeciality Dental Clinic. All
            rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
