"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { RefreshCw, Home, Phone, MapPin, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import brandConfig from "@/data/clinic-branding-config.json";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const retryAttemptedRef = useRef(false);

  useEffect(() => {
    // 1. Enforce strict noindex on error boundary so Googlebot NEVER caches error states
    try {
      document.title = "CA Smile Dental Clinic | Bilimora, Gujarat";
      let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.name = "robots";
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = "noindex, nofollow, noarchive, nosnippet";

      let googlebotMeta = document.querySelector('meta[name="googlebot"]') as HTMLMetaElement | null;
      if (!googlebotMeta) {
        googlebotMeta = document.createElement("meta");
        googlebotMeta.name = "googlebot";
        document.head.appendChild(googlebotMeta);
      }
      googlebotMeta.content = "noindex, nofollow, noarchive, nosnippet";
    } catch {
      // Safe no-op in non-browser environments
    }

    console.error("Root Application Error Caught:", error);

    // 2. Automatic Self-Healing: Auto-retry once for transient chunk/network errors
    try {
      const retryKey = "casmile_error_auto_retry";
      const hasRetried = sessionStorage.getItem(retryKey);
      if (!hasRetried && !retryAttemptedRef.current) {
        retryAttemptedRef.current = true;
        sessionStorage.setItem(retryKey, "true");
        // Clear flag after 15 seconds
        setTimeout(() => {
          try {
            sessionStorage.removeItem(retryKey);
          } catch {}
        }, 15000);
        // Instant reset attempt
        reset();
      }
    } catch {
      // Safe fallback
    }
  }, [error, reset]);

  const clinicName = brandConfig.clinicName || "CA Smile Dental Clinic";
  const phone = brandConfig.phone || "+91 72260 98074";
  const address =
    brandConfig.address ||
    "1st Floor, Labdhi Arcade, Convent Rd, above HDFC Bank/ Krishna Dairy, Kutchhi Friends Society, Bilimora, Gujarat 396321";
  const workingHours =
    brandConfig.workingHours || "Mon–Sun: 9:00 AM – 8:00 PM";
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet" />
      </head>

      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] px-4 py-12">
        <div className="w-full max-w-lg space-y-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121316] p-6 sm:p-8 text-center shadow-2xl">
          {/* Clinic Logo */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ca-smile-logo-light.png"
              alt={clinicName}
              className="h-10 sm:h-12 w-auto object-contain dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ca-smile-logo-dark.png"
              alt={clinicName}
              className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
            />
          </div>

          {/* Clinic Heading */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>CA Smile Dental Care • Bilimora</span>
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#18181b] dark:text-white">
              Dental Reception &amp; Appointments
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Dr. Deep A Patel • BDS Dental Surgeon. Reach our reception directly or reload the page below.
            </p>
          </div>

          {/* Clinic Contact & Address Card */}
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-teal-500/10 to-teal-500/5 p-4 sm:p-5 text-left space-y-3 shadow-sm">
            {/* Direct Phone / Contact No */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/30">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Direct Clinic Phone
                </p>
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-base sm:text-lg font-bold text-[#18181b] dark:text-white hover:text-teal-600 transition-colors"
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* Physical Address */}
            <div className="flex items-start gap-3 pt-1 border-t border-teal-500/10">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/30">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Clinic Location
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#18181b] dark:text-zinc-100 uppercase leading-snug">
                  {address}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-stone-600 dark:text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{workingHours}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Call Reception</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp Reception</span>
            </a>
          </div>

          {/* Secondary Navigation */}
          <div className="flex items-center justify-center gap-3 pt-1 text-xs">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 font-semibold text-stone-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors py-1 px-2 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reload Page</span>
            </button>
            <span className="text-stone-300 dark:text-zinc-700">•</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400 hover:underline py-1 px-2"
            >
              <Home className="h-3 w-3" />
              <span>Clinic Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
