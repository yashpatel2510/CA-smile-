"use client";

import React from "react";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClinicMapSectionProps {
  showTitle?: boolean;
  className?: string;
}

export function ClinicMapSection({
  showTitle = true,
  className = "",
}: ClinicMapSectionProps) {
  const pathname = usePathname();
  const { brandConfig, currentTheme } = useClinicTheme();

  // Hide on contact page per user request
  if (pathname === "/contact") {
    return null;
  }

  const lat = brandConfig.latitude ?? 10.01586;
  const lng = brandConfig.longitude ?? 76.34186;
  const address = brandConfig.address || "742 Evergreen Medical Way, Suite 400";
  const phone = brandConfig.phone || "(800) 555-CLINIC";
  const clinicName = brandConfig.clinicName || "HealthSphere Medical Center";
  const hours =
    brandConfig.workingHours ||
    "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only";

  // Google Maps navigation link with exact lat/lng
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Embedded map URL without requiring client API key
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=${
    brandConfig.mapZoom || 15
  }&output=embed`;

  return (
    <section
      aria-label="Clinic Location and Directions"
      className={`border-t border-brand-border bg-brand-surface/40 py-12 transition-colors sm:py-16 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Visit Our Clinic</span>
                </Badge>
                <span className="text-[11px] font-mono text-brand-muted">
                  GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              </div>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
                Clinic Location &amp; Directions
              </h2>
              <p className="mt-1 text-xs text-brand-muted sm:text-sm">
                Easily accessible with dedicated patient parking, wheelchair
                ramps, and urgent walk-in triage.
              </p>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button
                variant="primary"
                size="md"
                className="shadow-xs gap-2 font-semibold"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Directions</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Button>
            </a>
          </div>
        )}

        {/* Map and Details Grid */}
        <div className="grid grid-cols-1 overflow-hidden rounded-clinic border border-brand-border bg-brand-surface shadow-md lg:grid-cols-12">
          {/* Interactive Map Embed */}
          <div className="relative min-h-[340px] bg-brand-background lg:col-span-8 lg:min-h-[440px]">
            <iframe
              title={`Interactive Map for ${clinicName}`}
              src={embedUrl}
              className="h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Quick Floating Direction Action on the Map */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-clinic border border-brand-border/80 bg-brand-surface/90 px-3.5 py-2 text-xs font-semibold text-brand-text shadow-lg backdrop-blur-md transition-transform hover:scale-105"
              >
                <Navigation className="h-4 w-4 text-brand-primary" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Location & Contact Information Card */}
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-4">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Official Facility
                </span>
                <h3 className="font-heading text-lg font-bold text-brand-text">
                  {clinicName}
                </h3>
                <p className="mt-0.5 text-xs text-brand-primary">
                  {brandConfig.doctorTitle || "Specialized Medical & Dental Care"}
                </p>
              </div>

              {/* Physical Address */}
              <div className="space-y-1.5 border-t border-brand-border/60 pt-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                  <div>
                    <div className="text-xs font-semibold text-brand-text">
                      Physical Address
                    </div>
                    <div className="text-xs leading-relaxed text-brand-muted">
                      {address}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5 border-t border-brand-border/60 pt-4">
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                  <div>
                    <div className="text-xs font-semibold text-brand-text">
                      Appointments &amp; Inquiries
                    </div>
                    <a
                      href={`tel:${phone.replace(/\D/g, "")}`}
                      className="text-xs font-bold text-brand-primary hover:underline"
                    >
                      {phone}
                    </a>
                    {brandConfig.doctorPhone && (
                      <div className="mt-0.5 text-[11px] text-brand-muted">
                        Direct:{" "}
                        <a
                          href={`tel:${brandConfig.doctorPhone.replace(/\D/g, "")}`}
                          className="hover:underline"
                        >
                          {brandConfig.doctorPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-1.5 border-t border-brand-border/60 pt-4">
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                  <div>
                    <div className="text-xs font-semibold text-brand-text">
                      Consultation Hours
                    </div>
                    <div className="text-xs leading-relaxed text-brand-muted">
                      {hours}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direction Button */}
            <div className="mt-6 border-t border-brand-border/60 pt-6">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full gap-2 font-semibold shadow-sm"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Navigate with Google Maps</span>
                </Button>
              </a>
              <div className="mt-2 text-center text-[10px] text-brand-muted">
                Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
