"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import brandConfig from "@/data/clinic-branding-config.json";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public Route Error:", error);
  }, [error]);

  const clinicName = brandConfig.clinicName || "CA Smile Dental Clinic";
  const phone = brandConfig.phone || "+91 72260 98074";
  const address =
    brandConfig.address ||
    "1ST FLOOR LABDHI ARCADE, ABOVE HDFC BANK, BILIMORA, GUJARAT 396321";
  const workingHours =
    brandConfig.workingHours ||
    "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only";
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121316] p-6 sm:p-8 text-center shadow-2xl">
        {/* Clinic Logo */}
        <div className="flex justify-center">
          <img
            src="/images/ca-smile-logo-light.png"
            alt={clinicName}
            className="h-10 sm:h-12 w-auto object-contain dark:hidden"
          />
          <img
            src="/images/ca-smile-logo-dark.png"
            alt={clinicName}
            className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
          />
        </div>

        {/* Friendly Message */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#18181b] dark:text-white">
            We&apos;re Here to Help
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            This page took a quick pause. You can refresh or visit our clinic homepage, or contact us directly below.
          </p>
        </div>

        {/* Flashed Address & Contact Card */}
        <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-teal-500/10 to-teal-500/5 p-4 sm:p-5 text-left space-y-3 shadow-sm">
          {/* Direct Phone / Contact No */}
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/30">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Contact Number
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
                Clinic Address
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
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Secondary Navigation */}
        <div className="flex items-center justify-center gap-3 pt-1 text-xs">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 font-semibold text-stone-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors py-1 px-2"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh Page</span>
          </button>
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400 hover:underline py-1 px-2"
          >
            <Home className="h-3 w-3" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
