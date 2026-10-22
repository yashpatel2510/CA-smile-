"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  ArrowUp,
  AlertCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  BookingFormConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";
import { trackBookingFunnel } from "@/lib/analytics";
import { BookNowButton } from "@/components/ui/book-now-button";

interface CalendarBookingExperienceProps {
  initialService?: string;
  onSuccess?: (appointmentId: string) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DEFAULT_TIME_RANGES = [
  "Morning (9:30 AM - 1:00 PM)",
  "Afternoon (2:00 PM - 5:00 PM)",
  "Evening (5:00 PM - 7:30 PM)",
];

export function CalendarBookingExperience({
  initialService,
  onSuccess,
}: CalendarBookingExperienceProps) {
  const { brandConfig } = useClinicTheme();

  // Dynamic booking form configuration from admin
  const [config, setConfig] = useState<BookingFormConfig>(
    defaultBookingFormConfig
  );

  // Booking Flow Steps: 1 = Calendar & Slot, 2 = Image 2 Form Design, 3 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Today's date reference at midnight
  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState<Date>(
    new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), 1)
  );

  // Default initial selected date: tomorrow
  const defaultDate = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Selected date & slot (pre-selected to tomorrow and morning for instant usability)
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    DEFAULT_TIME_RANGES[0]
  );

  // Patient Details form fields (matching Image 2)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredTime, setPreferredTime] = useState(DEFAULT_TIME_RANGES[0]);
  const [doctorPreference, setDoctorPreference] = useState(
    "Doctor Preference: Any Available Specialist"
  );
  const [consentAgreed, setConsentAgreed] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation result
  const [confirmedData, setConfirmedData] = useState<{
    id: string;
    patientName: string;
    dateFormatted: string;
    slot: string;
    doctor: string;
  } | null>(null);

  // Fetch admin booking form configuration
  useEffect(() => {
    fetch("/api/booking-form/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          setConfig(data.config);
          if (data.config.timeSlots && data.config.timeSlots.length > 0) {
            setSelectedSlot(data.config.timeSlots[0]);
            setPreferredTime(data.config.timeSlots[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic booking configuration:", err);
      });
  }, []);

  // Sync selected slot with preferred time dropdown
  useEffect(() => {
    if (selectedSlot) {
      setPreferredTime(selectedSlot);
    }
  }, [selectedSlot]);

  // Calendar dates computation
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Prevent past months navigation
  const isCanPrevMonth = useMemo(() => {
    const currentViewYear = viewDate.getFullYear();
    const currentViewMonth = viewDate.getMonth();
    const todayYear = todayMidnight.getFullYear();
    const todayMonth = todayMidnight.getMonth();

    if (currentViewYear > todayYear) return true;
    if (currentViewYear === todayYear && currentViewMonth > todayMonth) return true;
    return false;
  }, [viewDate, todayMidnight]);

  const handlePrevMonth = () => {
    if (!isCanPrevMonth) return;
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const chosen = new Date(year, month, day);
    chosen.setHours(0, 0, 0, 0);

    if (chosen < todayMidnight) {
      setErrorMsg("Past dates cannot be selected. Please choose today or an upcoming date.");
      return;
    }

    setSelectedDate(chosen);
    setErrorMsg(null);
  };

  // Formatted date string helpers
  const selectedDateShortString = useMemo(() => {
    if (!selectedDate) return "Choose a date";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  }, [selectedDate]);

  // Date format DD/MM/YYYY matching Image 2
  const dateFormattedSlash = useMemo(() => {
    if (!selectedDate) return "";
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = selectedDate.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [selectedDate]);

  // Available Slots
  const availableSlots = useMemo(() => {
    if (config?.timeSlots && config.timeSlots.length > 0) {
      return config.timeSlots;
    }
    return DEFAULT_TIME_RANGES;
  }, [config]);

  const handleContinueToDetails = () => {
    if (!selectedDate) {
      setErrorMsg("Please select a date on the calendar.");
      return;
    }
    if (selectedDate < todayMidnight) {
      setErrorMsg("Past dates cannot be selected. Please choose today or an upcoming date.");
      return;
    }
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot.");
      return;
    }
    setErrorMsg(null);
    trackBookingFunnel(2, "selected_date_and_slot");
    setStep(2);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const cleanMobile = phone.replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!consentAgreed) {
      setErrorMsg("Please accept the contact agreement to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
      const fName = nameParts[0] || fullName.trim();
      const lName = nameParts.slice(1).join(" ") || "";

      const formattedIsoDate = selectedDate
        ? new Date(
            Date.UTC(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
              10,
              0,
              0
            )
          ).toISOString()
        : new Date().toISOString();

      const chosenDoctor = doctorPreference.replace(/^Doctor Preference:\s*/, "");
      const chosenTime = preferredTime.replace(/^Preferred Time:\s*/, "");

      const payload = {
        patientType: "ADULT",
        fullName: fullName.trim(),
        firstName: fName,
        lastName: lName,
        phone: cleanMobile,
        email: email.trim(),
        treatment: initialService || "General Dental Consultation",
        serviceName: initialService || "General Dental Consultation",
        reason: initialService || "General Dental Consultation",
        preferredDoctor: chosenDoctor,
        preferredDate: selectedDate?.toISOString().split("T")[0],
        timeRange: chosenTime,
        startTime: formattedIsoDate,
        notes: `Doctor Preference: ${chosenDoctor} | Preferred Time: ${chosenTime}`,
        consentAgreed: true,
        source: "WEB_FORM",
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to confirm appointment.");
      }

      const appointmentId = data.appointment?.id || `APT-${Date.now()}`;

      setConfirmedData({
        id: appointmentId,
        patientName: fullName.trim(),
        dateFormatted: dateFormattedSlash || selectedDateShortString,
        slot: chosenTime,
        doctor: chosenDoctor,
      });

      trackBookingFunnel(4, "appointment_confirmed");
      setStep(3);

      if (onSuccess) {
        onSuccess(appointmentId);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setConfirmedData(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setErrorMsg(null);
  };

  // Dynamic clinic details with fallback matching reference
  const clinicAddress =
    brandConfig?.address
      ? `${brandConfig.address}${brandConfig.city ? `, ${brandConfig.city}` : ""}${brandConfig.postalCode ? ` ${brandConfig.postalCode}` : ""}`
      : "742 Evergreen Medical Way, Suite 400, Springfield 97477";

  const clinicPhone = brandConfig?.phone || "(800) 555-CLINIC";
  const clinicEmail = brandConfig?.email || "contact@pediodent.example.com";

  return (
    <div className="relative w-full overflow-hidden text-white">
      {/* Outer Card: Compact styling so the whole section fits inside one screen properly */}
      <div className="overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/10 bg-[#111215] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* =================================================================== */}
          {/* LEFT COLUMN: "Let's Make That Smile Shine!" + Contact Us + "brighter" */}
          {/* =================================================================== */}
          <div className="flex flex-col justify-between border-b border-white/10 bg-[#0e0f12] p-5 sm:p-6 lg:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:border-white/10">
            <div>
              {/* Main Headline */}
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-[2.35rem] font-bold text-white tracking-tight leading-[1.1]">
                Let&apos;s Make That<br />
                <span className="text-white">Smile Shine!</span>
              </h2>

              {/* Contact Us Block */}
              <div className="mt-4 sm:mt-5 space-y-1.5 text-xs text-zinc-400">
                <p className="font-semibold text-white/90 text-xs tracking-wider uppercase">
                  Contact Us
                </p>
                <p className="leading-relaxed max-w-xs text-zinc-400">
                  {clinicAddress}
                </p>
                <p className="pt-0.5 font-mono text-zinc-300">
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

              {/* Selected Summary Pills */}
              <div className="space-y-2 pt-3">
                {/* DATE PILL */}
                <div
                  className={`rounded-xl border p-2.5 sm:p-3 transition-all ${
                    selectedDate
                      ? "border-white/20 bg-[#1c1d22]"
                      : "border-white/5 bg-[#151619]"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    SELECTED DATE
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-300" />
                    <span>{selectedDateShortString}</span>
                  </div>
                </div>

                {/* TIME SLOT PILL */}
                <div
                  className={`rounded-xl border p-2.5 sm:p-3 transition-all ${
                    selectedSlot
                      ? "border-white/20 bg-[#1c1d22]"
                      : "border-white/5 bg-[#151619]"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    TIME SLOT
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
                    <Clock className="h-3.5 w-3.5 text-zinc-300" />
                    <span className="truncate">{selectedSlot || "Select a time"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: "brighter" typography + Follow Us */}
            <div className="mt-5 sm:mt-6 pt-2">
              <div className="select-none font-sans text-5xl sm:text-6xl lg:text-[4.75rem] font-black tracking-tight text-white/95 leading-none mb-3">
                brighter
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-medium">
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

          {/* =================================================================== */}
          {/* RIGHT COLUMN: STEP 1 (Calendar) or STEP 2 (Image 2 Form Design)     */}
          {/* =================================================================== */}
          <div className="bg-[#18181c] p-5 sm:p-6 lg:p-8 lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* STEP 1: COMPACT CALENDAR & TIME SLOTS (Fits screen cleanly)       */}
              {/* ----------------------------------------------------------------- */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white">
                    Book Your Appointment
                  </h3>

                  {/* Month & Year Navigation Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                      {MONTH_NAMES[month]} {year}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={!isCanPrevMonth}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                          !isCanPrevMonth
                            ? "border-white/5 text-zinc-600 opacity-40 cursor-not-allowed select-none"
                            : "border-white/10 bg-[#222227] text-white hover:bg-[#2c2c34] active:scale-95 cursor-pointer"
                        }`}
                        aria-label="Previous Month"
                        title={!isCanPrevMonth ? "Cannot view past months" : "Previous Month"}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#222227] text-white hover:bg-[#2c2c34] active:scale-95 cursor-pointer transition-colors"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Days of week header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold tracking-wider text-zinc-500">
                    {DAY_NAMES.map((d) => (
                      <div key={d} className="py-0.5">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days Grid: Compact h-8 / h-8.5 */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {/* Empty offset days */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8 sm:h-8.5" />
                    ))}

                    {/* Month days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(year, month, day);
                      dateObj.setHours(0, 0, 0, 0);

                      const isPast = dateObj < todayMidnight;
                      const isToday =
                        dateObj.toDateString() === todayMidnight.toDateString();
                      const isSelected =
                        selectedDate &&
                        dateObj.toDateString() === selectedDate.toDateString();

                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleSelectDate(day)}
                          className={`group relative flex h-8 sm:h-8.5 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                            isPast
                              ? "cursor-not-allowed text-zinc-600 bg-transparent select-none opacity-30"
                              : isSelected
                              ? "border-2 border-white bg-white text-black font-extrabold shadow-md scale-[1.04]"
                              : isToday
                              ? "border border-white/20 bg-[#25252c] text-white hover:bg-[#2d2d36]"
                              : "border border-white/5 bg-[#202025] text-zinc-300 hover:border-white/15 hover:bg-[#27272f]"
                          }`}
                        >
                          <span>{day}</span>
                          {isToday && !isSelected && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Available Time Slots Header & Grid */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold tracking-wider text-zinc-400 uppercase">
                        Available Time Slots
                      </span>
                      {selectedDate && (
                        <span className="text-zinc-400">
                          For <strong className="text-white">{selectedDateShortString}</strong>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {availableSlots.map((slot) => {
                        const isSlotSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setErrorMsg(null);
                            }}
                            className={`rounded-lg border py-2 px-2 text-center text-xs transition-all cursor-pointer truncate ${
                              isSlotSelected
                                ? "border-2 border-white bg-white font-bold text-black shadow-sm"
                                : "border-white/5 bg-[#202025] text-zinc-300 hover:border-white/15 hover:bg-[#26262d]"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* STEP 2: EXACT IMAGE 2 FORM DESIGN                                 */}
              {/* ----------------------------------------------------------------- */}
              {step === 2 && (
                <form onSubmit={handleConfirmBooking} className="space-y-3">
                  <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white mb-3">
                    Book Your Appointment
                  </h3>

                  {/* Field 1: Your Full Name */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-2.5 flex items-center justify-between">
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Your Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field 2: Phone Number */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-2.5 flex items-center justify-between">
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field 3: Email Address */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-2.5 flex items-center justify-between">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field 4: Selected Date (with calendar icon on right matching Image 2) */}
                  <div
                    onClick={() => setStep(1)}
                    className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] border border-white/10 transition-all px-4 py-2.5 flex items-center justify-between cursor-pointer"
                    title="Click to change date on calendar"
                  >
                    <span className="text-xs sm:text-sm text-white font-medium">
                      {dateFormattedSlash || "Select Date"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-zinc-400 shrink-0 pointer-events-none group-hover:text-white transition-colors" />
                  </div>

                  {/* Field 5: Preferred Time (Select dropdown matching Image 2) */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-2.5 flex items-center justify-between">
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      aria-label="Preferred Time"
                      className="w-full bg-transparent text-xs sm:text-sm text-white appearance-none focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="Morning (9:30 AM - 1:00 PM)" className="bg-[#222227] text-white">
                        Preferred Time: Morning (9:30 AM - 1:00 PM)
                      </option>
                      <option value="Afternoon (2:00 PM - 5:00 PM)" className="bg-[#222227] text-white">
                        Preferred Time: Afternoon (2:00 PM - 5:00 PM)
                      </option>
                      <option value="Evening (5:00 PM - 7:30 PM)" className="bg-[#222227] text-white">
                        Preferred Time: Evening (5:00 PM - 7:30 PM)
                      </option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field 6: Doctor Preference (Select dropdown matching Image 2) */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-2.5 flex items-center justify-between">
                    <select
                      value={doctorPreference}
                      onChange={(e) => setDoctorPreference(e.target.value)}
                      aria-label="Doctor Preference"
                      className="w-full bg-transparent text-xs sm:text-sm text-white appearance-none focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      <option value="Doctor Preference: Any Available Specialist" className="bg-[#222227] text-white">
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
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Checkbox: Agreement matching Image 2 */}
                  <div className="pt-0.5">
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

                  {/* Bottom Row: Small navbar Book Now Button + View Full Calendar link */}
                  <div className="pt-2 flex items-center justify-between">
                    <BookNowButton
                      type="submit"
                      size="sm"
                      text={isSubmitting ? "Submitting..." : "Book Now"}
                      disabled={isSubmitting}
                    />

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
                      <span>View Full Calendar</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* STEP 3: CONFIRMATION / THANK YOU STATE                            */}
              {/* ----------------------------------------------------------------- */}
              {step === 3 && confirmedData && (
                <div className="space-y-4 py-2">
                  <div className="rounded-2xl border border-white/10 bg-[#202025] p-5 text-white space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-heading text-base sm:text-lg font-bold text-white">
                          Appointment Confirmed!
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Reference: <span className="font-mono font-bold text-white">{confirmedData.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs text-zinc-300">
                      <div className="flex justify-between py-0.5 border-b border-white/5">
                        <span className="text-zinc-400">Patient:</span>
                        <span className="font-medium text-white">{confirmedData.patientName}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-white/5">
                        <span className="text-zinc-400">Scheduled Date:</span>
                        <span className="font-medium text-white">{confirmedData.dateFormatted}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-white/5">
                        <span className="text-zinc-400">Time Window:</span>
                        <span className="font-medium text-white">{confirmedData.slot}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-zinc-400">Specialist:</span>
                        <span className="font-medium text-white">{confirmedData.doctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Book Another Appointment</span>
                    </button>

                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#222227] px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#282830] transition-all"
                    >
                      <span>Back to Home</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row in Step 1: Continue Button with Selection Guidance */}
            {step === 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-3 border-t border-white/10">
                <div className="text-[11px] text-zinc-400">
                  {selectedDate && selectedSlot ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Selected: {selectedDateShortString} ({selectedSlot})
                    </span>
                  ) : (
                    <span>Please choose a date & time slot to continue</span>
                  )}
                </div>

                {/* Continue button: small navbar button style */}
                <BookNowButton
                  type="button"
                  onClick={handleContinueToDetails}
                  size="sm"
                  text="Continue"
                  disabled={!selectedDate || !selectedSlot}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Action Buttons Matching Reference Mock */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        <a
          href={`tel:${clinicPhone.replace(/\D/g, "")}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18181c] text-white border border-white/20 shadow-xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Call clinic"
        >
          <PhoneCall className="h-4 w-4" />
        </a>

        <a
          href={`https://wa.me/${clinicPhone.replace(/\D/g, "")}?text=Hello%20there,%20I%20would%20like%20to%20book%20an%20appointment.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Chat on WhatsApp"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.179-.536-1.528-.627-2.515-2.172-2.592-2.273-.076-.101-.617-.824-.617-1.571 0-.747.387-1.115.526-1.268.143-.153.313-.191.419-.191.106 0 .211.002.304.007.099.005.231-.038.361.275.134.321.46 1.119.5 1.2.04.082.067.177.013.284-.053.106-.08.172-.16.265-.079.095-.167.211-.238.284-.081.082-.165.172-.072.332.094.159.418.69 0.896 1.116.615.547 1.135.717 1.295.798.16.08.254.071.35-.041.095-.112.408-.475.517-.638.11-.164.218-.137.368-.082.15.054.954.45 1.118.532.164.081.273.123.313.191.04.068.04.394-.104.799zM12.045 2C6.505 2 2 6.506 2 12.047c0 1.973.57 3.815 1.558 5.378L2 22l4.743-1.517A9.977 9.977 0 0012.045 22c5.54 0 10.045-4.505 10.045-10.047C22.09 6.506 17.585 2 12.045 2z" />
          </svg>
        </a>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18181c] text-white border border-white/20 shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
