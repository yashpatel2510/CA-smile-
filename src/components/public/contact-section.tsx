"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { CalendarBookingExperience } from "./calendar-booking-experience";
import { BookingFormConfig } from "@/data/booking-form-config";

interface ContactSectionProps {
  initialConfig?: BookingFormConfig;
  className?: string;
  hideOnContactPage?: boolean;
}

export function ContactSection({
  initialConfig,
  className = "",
  hideOnContactPage = true,
}: ContactSectionProps) {
  const pathname = usePathname();

  // Hide on standalone contact/booking page to avoid duplicate forms
  if (hideOnContactPage && (pathname === "/contact" || pathname === "/book")) {
    return null;
  }

  const isDark = (initialConfig?.themeMode || "light") === "dark";

  return (
    <section
      id="contact"
      aria-label="Contact and Appointment Booking"
      className={`relative w-full border-t transition-colors duration-200 py-6 sm:py-10 ${
        isDark
          ? "border-white/10 bg-[#0a0a0c] text-white"
          : "border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-50/60 text-slate-900"
      } ${className}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">


        {/* Interactive Booking & Contact Form */}
        <div className="relative">
          <CalendarBookingExperience initialConfig={initialConfig} />
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
