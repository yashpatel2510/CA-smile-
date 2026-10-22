"use client";

import React, { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, RefreshCw, Calendar as CalendarIcon, MessageCircle } from "lucide-react";
import { BookNowButton } from "@/components/ui/book-now-button";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

interface DarkContactSectionProps {
  className?: string;
  onSuccess?: (appointmentId: string) => void;
  showCalendarLink?: boolean;
}

export function DarkContactSection({
  className = "",
  onSuccess,
  showCalendarLink = true,
}: DarkContactSectionProps) {
  const { brandConfig } = useClinicTheme();

  // Tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().split("T")[0];

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState(tomorrowIso);
  const [preferredTime, setPreferredTime] = useState("Morning (9:00 AM - 12:00 PM)");
  const [doctorPreference, setDoctorPreference] = useState("Any Available Specialist");
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
    doctor: string;
  } | null>(null);

  // Clinic dynamic details with fallbacks matching reference
  const clinicAddress =
    brandConfig?.address
      ? `${brandConfig.address}${brandConfig.city ? `, ${brandConfig.city}` : ""}${brandConfig.postalCode ? ` ${brandConfig.postalCode}` : ""}`
      : "5670 Greenwood Plaza Blvd Suite 404, Greenwood Village, CO 80111";

  const clinicPhone = brandConfig?.phone || "(720) 620-5348";
  const clinicEmail = brandConfig?.email || "info@brightdental.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please provide a valid 10-digit mobile phone number.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!consentAgreed) {
      setErrorMessage("Please accept the contact agreement to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || fullName.trim();
      const lastName = nameParts.slice(1).join(" ") || "";

      const payload = {
        patientType: "ADULT",
        fullName: fullName.trim(),
        firstName,
        lastName,
        phone: cleanPhone,
        email: email.trim(),
        preferredDate,
        timeRange: preferredTime,
        preferredDoctor: doctorPreference,
        reason: "Dental Consultation & Appointment",
        serviceName: "Dental Consultation & Checkup",
        treatment: "Dental Consultation & Checkup",
        consentAgreed,
        source: "WEB_FORM",
        notes: `Doctor Preference: ${doctorPreference} | Preferred Time: ${preferredTime}`,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to confirm appointment request.");
      }

      setSuccessData({
        id: data.appointment?.id || `APT-${Math.floor(100000 + Math.random() * 900000)}`,
        patientName: fullName.trim(),
        date: preferredDate,
        time: preferredTime,
        doctor: doctorPreference,
      });

      if (onSuccess) {
        onSuccess(data.appointment?.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setErrorMessage(null);
  };

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#0c0d0f] py-12 sm:py-16 lg:py-20 text-white ${className}`}
      id="contact-booking"
    >
      {/* Background Ambient Dark Waves / Atmospheric Glow */}
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-30">
        <svg
          className="absolute -right-20 top-0 h-full w-[800px] text-zinc-800/40"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M800 100C600 250 550 500 800 700"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <path
            d="M750 0C550 200 500 600 750 800"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <path
            d="M850 200C650 350 600 650 850 850"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.15"
          />
        </svg>
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-zinc-800/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Card Container */}
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#111215] border border-white/5 shadow-2xl p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Heading + Contact Info + "brighter" + Follow Us */}
            <div className="lg:col-span-6 flex flex-col justify-between min-h-[500px]">
              <div>
                {/* Main Headline */}
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white leading-[1.08]">
                  Let&apos;s Make That<br />
                  Smile Shine!
                </h2>

                {/* Contact Us Block */}
                <div className="mt-8 sm:mt-10 space-y-2 text-xs sm:text-sm text-zinc-400">
                  <p className="font-semibold text-white/90 text-xs tracking-wider">
                    Contact Us
                  </p>
                  <p className="leading-relaxed max-w-xs text-zinc-400">
                    {clinicAddress}
                  </p>
                  <p className="pt-1 font-mono text-zinc-300">
                    <a href={`tel:${clinicPhone.replace(/\D/g, "")}`} className="hover:text-white transition-colors">
                      {clinicPhone}
                    </a>
                  </p>
                  <p className="text-zinc-400">
                    <a href={`mailto:${clinicEmail}`} className="hover:text-white transition-colors">
                      {clinicEmail}
                    </a>
                  </p>
                </div>
              </div>

              {/* Bottom Area: Massive "brighter" typography + Social Row */}
              <div className="mt-12 sm:mt-16 lg:mt-20">
                <div className="select-none font-sans text-6xl sm:text-7xl md:text-8xl lg:text-[7.2rem] font-black tracking-tight text-white/95 leading-none mb-6">
                  brighter
                </div>

                {/* Follow Us Row */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 font-medium">
                  <span className="text-zinc-300 font-semibold">Follow Us:</span>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Facebook
                  </a>
                  <span className="text-zinc-600">•</span>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                  <span className="text-zinc-600">•</span>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: "Book Your Appointment" Dark Form Card */}
            <div className="lg:col-span-6 w-full">
              <div className="relative rounded-2xl sm:rounded-3xl bg-[#18181c] border border-white/10 p-6 sm:p-8 lg:p-9 shadow-2xl">
                
                {successData ? (
                  /* Success Confirmation State */
                  <div className="py-6 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                        Appointment Requested!
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                        Thank you, <span className="text-white font-medium">{successData.patientName}</span>.
                        Our patient coordinator will contact you shortly to confirm your visit.
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#222227] border border-white/5 p-4 text-left text-xs space-y-1.5 text-zinc-300">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-400">Reference ID:</span>
                        <span className="font-mono font-bold text-white">{successData.id}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-400">Scheduled Date:</span>
                        <span className="font-medium text-white">{successData.date}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-400">Time Window:</span>
                        <span className="font-medium text-white">{successData.time}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">Specialist:</span>
                        <span className="font-medium text-white">{successData.doctor}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Book Another Appointment</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Main Appointment Form */
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight mb-5">
                      Book Your Appointment
                    </h3>

                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Field 1: Your Full Name */}
                    <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/5 focus-within:border-white/20 transition-all duration-200 px-4 py-3 flex items-center justify-between">
                      <input
                        type="text"
                        name="fullName"
                        autoComplete="name"
                        placeholder="Your Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                    </div>

                    {/* Field 2: Phone Number */}
                    <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/5 focus-within:border-white/20 transition-all duration-200 px-4 py-3 flex items-center justify-between">
                      <input
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                    </div>

                    {/* Field 3: Email Address */}
                    <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/5 focus-within:border-white/20 transition-all duration-200 px-4 py-3 flex items-center justify-between">
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                    </div>

                    {/* Field 4: Preferred Date */}
                    <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/5 focus-within:border-white/20 transition-all duration-200 px-4 py-3 flex items-center justify-between">
                      <input
                        type="date"
                        name="preferredDate"
                        min={tomorrowIso}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                        aria-label="Preferred Date"
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none [color-scheme:dark]"
                      />
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                    </div>

                    {/* Field 5: Preferred Time */}
                    <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/5 focus-within:border-white/20 transition-all duration-200 px-4 py-3 flex items-center justify-between">
                      <select
                        name="preferredTime"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        aria-label="Preferred Time"
                        className="w-full bg-transparent text-sm text-white appearance-none focus:outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="Morning (9:00 AM - 12:00 PM)" className="bg-[#222227] text-white">
                          Preferred Time: Morning (9:00 AM - 12:00 PM)
                        </option>
                        <option value="Afternoon (1:00 PM - 5:00 PM)" className="bg-[#222227] text-white">
                          Preferred Time: Afternoon (1:00 PM - 5:00 PM)
                        </option>
                        <option value="Evening (5:00 PM - 8:00 PM)" className="bg-[#222227] text-white">
                          Preferred Time: Evening (5:00 PM - 8:00 PM)
                        </option>
                      </select>
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                    </div>

                    {/* Field 6: Doctor Preference */}
                    <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/5 focus-within:border-white/20 transition-all duration-200 px-4 py-3 flex items-center justify-between">
                      <select
                        name="doctorPreference"
                        value={doctorPreference}
                        onChange={(e) => setDoctorPreference(e.target.value)}
                        aria-label="Doctor Preference"
                        className="w-full bg-transparent text-sm text-white appearance-none focus:outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="Any Available Specialist" className="bg-[#222227] text-white">
                          Doctor Preference: Any Available Specialist
                        </option>
                        <option value="Dr. Sankar (Chief Dental Surgeon)" className="bg-[#222227] text-white">
                          Dr. Sankar (Chief Dental Surgeon)
                        </option>
                        <option value="Dr. Meera (Pediatric Specialist)" className="bg-[#222227] text-white">
                          Dr. Meera (Pediatric Specialist)
                        </option>
                        <option value="Dr. Arjun (Orthodontics & Aligners)" className="bg-[#222227] text-white">
                          Dr. Arjun (Orthodontics & Aligners)
                        </option>
                      </select>
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                    </div>

                    {/* Checkbox: Agreement */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-400 select-none group">
                        <input
                          type="checkbox"
                          checked={consentAgreed}
                          onChange={(e) => setConsentAgreed(e.target.checked)}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#881318]"
                        />
                        <span className="group-hover:text-zinc-300 transition-colors">
                          I agree to be contacted to confirm my appointment.
                        </span>
                      </label>
                    </div>

                    {/* Button: Same button as navbar in size small */}
                    <div className="pt-3 flex items-center justify-between">
                      <BookNowButton
                        type="submit"
                        size="sm"
                        text={isSubmitting ? "Submitting..." : "Book Now"}
                        disabled={isSubmitting}
                      />

                      {showCalendarLink && (
                        <a
                          href="#booking-calendar"
                          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>View Full Calendar</span>
                        </a>
                      )}
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
