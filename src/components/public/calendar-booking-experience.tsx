"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  ArrowUp,
  FileText,
  AlertCircle,
  ChevronDown,
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

export function CalendarBookingExperience({
  initialService,
  onSuccess,
}: CalendarBookingExperienceProps) {
  const { brandConfig } = useClinicTheme();

  // Dynamic booking form configuration from admin
  const [config, setConfig] = useState<BookingFormConfig>(
    defaultBookingFormConfig
  );

  // Booking Flow Steps: 1 = Calendar & Slot, 2 = Patient Details, 3 = Confirmation
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

  // Selected date & slot
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Patient Details form fields
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [treatment, setTreatment] = useState(initialService || "");
  const [doctorPreference, setDoctorPreference] = useState("Any Available Specialist");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation result
  const [confirmedData, setConfirmedData] = useState<{
    id: string;
    dateFormatted: string;
    slot: string;
    email: string;
    treatment: string;
  } | null>(null);

  // Fetch admin booking form configuration
  useEffect(() => {
    fetch("/api/booking-form/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          setConfig(data.config);
          if (!treatment && data.config.treatments?.length > 0) {
            setTreatment(data.config.treatments[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic booking configuration:", err);
      });
  }, [treatment]);

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

  const selectedDateLongString = useMemo(() => {
    if (!selectedDate) return "";
    const fullDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `${fullDays[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  }, [selectedDate]);

  // Available Slots
  const availableSlots = useMemo(() => {
    if (config?.timeSlots && config.timeSlots.length > 0) {
      return config.timeSlots;
    }
    return [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
    ];
  }, [config]);

  // Treatments
  const treatmentsList = useMemo(() => {
    if (config?.treatments && config.treatments.length > 0) {
      return config.treatments;
    }
    return [
      "General Dental Consultation",
      "Pediatric Dentistry & Child Care",
      "Dental Implants & Restoration",
      "Orthodontics & Clear Aligners",
      "Root Canal Treatment",
      "Teeth Cleaning & Scaling",
      "Teeth Whitening & Aesthetics",
      "Emergency Toothache Relief",
    ];
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

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (cleanMobile.length < 7) {
      setErrorMsg("Please enter a valid phone number.");
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

      const chosenTreatment = treatment || treatmentsList[0];

      // Custom fields in notes
      const customNotesArr = Object.entries(customFieldValues)
        .filter(([_, val]) => Boolean(val && val.trim()))
        .map(([k, val]) => {
          const matchingField = config.fields.find((f) => f.id === k);
          return `[${matchingField?.label || k}]: ${val.trim()}`;
        });

      const allNotes = [
        `Doctor: ${doctorPreference}`,
        additionalMessage.trim(),
        ...customNotesArr,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        patientType: "ADULT",
        fullName: fullName.trim(),
        firstName: fName,
        lastName: lName,
        phone: `${countryCode} ${mobileNumber.trim()}`,
        email: email.trim() || undefined,
        treatment: chosenTreatment,
        serviceName: chosenTreatment,
        reason: chosenTreatment,
        preferredDoctor: doctorPreference,
        preferredDate: selectedDate?.toISOString().split("T")[0],
        timeRange: selectedSlot,
        startTime: formattedIsoDate,
        notes: allNotes || undefined,
        customFields: customFieldValues,
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
        dateFormatted: selectedDateLongString,
        slot: selectedSlot || "Confirmed Slot",
        email: email.trim() || "Not provided",
        treatment: chosenTreatment,
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
    setMobileNumber("");
    setEmail("");
    setAdditionalMessage("");
    setErrorMsg(null);
  };

  // Dynamic clinic details with fallback matching reference image
  const clinicAddress =
    brandConfig?.address
      ? `${brandConfig.address}${brandConfig.city ? `, ${brandConfig.city}` : ""}`
      : "5670 Greenwood Plaza Blvd Suite 404, Greenwood Village, CO 80111";

  const clinicPhone = brandConfig?.phone || "(720) 620-5348";
  const clinicEmail = brandConfig?.email || "info@brightdental.com";

  return (
    <div className="relative w-full overflow-hidden text-white">
      {/* Outer Card Container Matching Reference Dribbble Mock */}
      <div className="overflow-hidden rounded-[28px] sm:rounded-[36px] border border-white/10 bg-[#111215] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* =================================================================== */}
          {/* LEFT COLUMN: "Let's Make That Smile Shine!" + Contact Us + "brighter" */}
          {/* =================================================================== */}
          <div className="flex flex-col justify-between border-b border-white/10 bg-[#0e0f12] p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-10">
            <div className="space-y-6">
              {/* Main Elegant Headline */}
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.08]">
                  Let&apos;s Make That<br />
                  <span className="text-white">Smile Shine!</span>
                </h2>

                {/* Contact Us Block */}
                <div className="mt-6 sm:mt-8 space-y-2 text-xs sm:text-sm text-zinc-400">
                  <p className="font-semibold text-white/90 text-xs tracking-wider uppercase">
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

              {/* Selected Summary Pills */}
              <div className="space-y-3 pt-2">
                {/* DATE PILL */}
                <div
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
                    selectedDate
                      ? "border-white/30 bg-[#1d1e24] shadow-md"
                      : "border-white/5 bg-[#16171b]"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    SELECTED DATE
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
                    <CalendarIcon className="h-4 w-4 text-zinc-300" />
                    <span>{selectedDateShortString}</span>
                  </div>
                </div>

                {/* TIME SLOT PILL */}
                <div
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
                    selectedSlot
                      ? "border-white/30 bg-[#1d1e24] shadow-md"
                      : "border-white/5 bg-[#16171b]"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    TIME SLOT
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
                    <Clock className="h-4 w-4 text-zinc-300" />
                    <span>{selectedSlot || "Select a time"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Massive "brighter" typography + Follow Us */}
            <div className="mt-8 sm:mt-12 pt-4">
              <div className="select-none font-sans text-6xl sm:text-7xl lg:text-[6.5rem] font-black tracking-tight text-white/95 leading-none mb-6">
                brighter
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
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
          {/* RIGHT COLUMN: "Book Your Appointment" Dark Elevated Card           */}
          {/* =================================================================== */}
          <div className="bg-[#18181c] p-6 sm:p-8 lg:col-span-7 lg:p-10">
            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 1: INTERACTIVE REAL-TIME CALENDAR & SLOTS                    */}
            {/* ----------------------------------------------------------------- */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Book Your Appointment
                </h3>

                {/* Month & Year Navigation Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-heading text-base sm:text-lg font-bold text-white">
                    {MONTH_NAMES[month]} {year}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={!isCanPrevMonth}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        !isCanPrevMonth
                          ? "border-white/5 text-zinc-600 opacity-40 cursor-not-allowed select-none"
                          : "border-white/10 bg-[#222227] text-white hover:bg-[#2c2c34] active:scale-95 cursor-pointer"
                      }`}
                      aria-label="Previous Month"
                      title={!isCanPrevMonth ? "Cannot view past months" : "Previous Month"}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#222227] text-white hover:bg-[#2c2c34] active:scale-95 cursor-pointer transition-colors"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold tracking-wider text-zinc-500">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {/* Empty offset days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10 sm:h-12" />
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
                        className={`group relative flex h-10 sm:h-12 items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          isPast
                            ? "cursor-not-allowed text-zinc-600 bg-transparent select-none opacity-40"
                            : isSelected
                            ? "border-2 border-white bg-white text-black font-extrabold shadow-lg scale-[1.03]"
                            : isToday
                            ? "border border-white/20 bg-[#25252c] text-white hover:bg-[#2d2d36]"
                            : "border border-white/5 bg-[#202025] text-zinc-300 hover:border-white/15 hover:bg-[#27272f]"
                        }`}
                      >
                        <span>{day}</span>
                        {isToday && !isSelected && (
                          <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Available Time Slots Header & Grid */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Available Time Slots
                    </span>
                    {selectedDate && (
                      <span className="text-xs text-zinc-400">
                        For <strong className="text-white">{selectedDateShortString}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                          className={`rounded-xl border py-2.5 px-3 text-center text-xs transition-all cursor-pointer ${
                            isSlotSelected
                              ? "border-2 border-white bg-white font-extrabold text-black shadow-md"
                              : "border-white/5 bg-[#202025] text-zinc-300 hover:border-white/15 hover:bg-[#26262d]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Continue Action Button matching navbar button in small size */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-zinc-400">
                    {!selectedDate ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        Step 1: Pick a date on the calendar
                      </span>
                    ) : !selectedSlot ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        Step 2: Choose a time slot for {selectedDateShortString}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Selected: {selectedDateShortString} at {selectedSlot}
                      </span>
                    )}
                  </div>

                  {/* Button matching navbar button in small size */}
                  <BookNowButton
                    type="button"
                    onClick={handleContinueToDetails}
                    size="sm"
                    text="Continue"
                    disabled={!selectedDate || !selectedSlot}
                  />
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 2: PATIENT DETAILS FORM (MATCHING DRIBBLE INPUT STYLING)     */}
            {/* ----------------------------------------------------------------- */}
            {step === 2 && (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>BACK TO CALENDAR</span>
                </button>

                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Book Your Appointment
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Provide your contact details to lock in your consultation.
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Field: Full Name */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-3 flex items-center justify-between">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field: Phone Number */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 w-full">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent text-xs sm:text-sm font-semibold text-zinc-300 focus:outline-none cursor-pointer [color-scheme:dark]"
                      >
                        <option value="+91" className="bg-[#222227] text-white">+91</option>
                        <option value="+1" className="bg-[#222227] text-white">+1</option>
                        <option value="+44" className="bg-[#222227] text-white">+44</option>
                        <option value="+971" className="bg-[#222227] text-white">+971</option>
                      </select>
                      <span className="text-zinc-600">|</span>
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                    </div>
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field: Email Address */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-3 flex items-center justify-between">
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                    />
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field: Treatment or Doctor Preference */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-3 flex items-center justify-between">
                    <select
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      aria-label="Treatment Category"
                      className="w-full bg-transparent text-sm text-white appearance-none focus:outline-none cursor-pointer [color-scheme:dark]"
                    >
                      {treatmentsList.map((t, idx) => (
                        <option key={idx} value={t} className="bg-[#222227] text-white">
                          Treatment: {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
                  </div>

                  {/* Field: Doctor Preference */}
                  <div className="group relative rounded-xl bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border border-white/10 focus-within:border-white/20 transition-all px-4 py-3 flex items-center justify-between">
                    <select
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
                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0 pointer-events-none group-hover:text-zinc-400" />
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
                </div>

                {/* Submit button: navbar button in small size */}
                <div className="pt-3 flex items-center justify-between">
                  <BookNowButton
                    type="submit"
                    size="sm"
                    text={isSubmitting ? "Confirming..." : (config.submitButtonText || "Book Now")}
                    disabled={isSubmitting}
                  />

                  <span className="text-xs text-zinc-500">
                    Selected: {selectedDateShortString} ({selectedSlot})
                  </span>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 3: CONFIRMATION / THANK YOU STATE                            */}
            {/* ----------------------------------------------------------------- */}
            {step === 3 && confirmedData && (
              <div className="space-y-6 py-4">
                <div className="rounded-2xl border border-white/10 bg-[#222227] p-6 text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-bold text-white">
                        Appointment Confirmed!
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Reference: <span className="font-mono font-bold text-white">{confirmedData.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-zinc-300">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Scheduled Date:</span>
                      <span className="font-medium text-white">{confirmedData.dateFormatted}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Chair Time:</span>
                      <span className="font-medium text-white">{confirmedData.slot}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-400">Treatment:</span>
                      <span className="font-medium text-white">{confirmedData.treatment}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Email:</span>
                      <span className="font-medium text-white">{confirmedData.email}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Book Another Appointment</span>
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#222227] px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#282830] transition-all"
                  >
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Action Buttons Matching Reference Mock (Phone, WhatsApp, Scroll to Top) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        <a
          href={`tel:${clinicPhone.replace(/\D/g, "")}`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#18181c] text-white border border-white/20 shadow-xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Call clinic"
        >
          <PhoneCall className="h-5 w-5" />
        </a>

        <a
          href={`https://wa.me/${clinicPhone.replace(/\D/g, "")}?text=Hello%20there,%20I%20would%20like%20to%20book%20an%20appointment.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Chat on WhatsApp"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.179-.536-1.528-.627-2.515-2.172-2.592-2.273-.076-.101-.617-.824-.617-1.571 0-.747.387-1.115.526-1.268.143-.153.313-.191.419-.191.106 0 .211.002.304.007.099.005.231-.038.361.275.134.321.46 1.119.5 1.2.04.082.067.177.013.284-.053.106-.08.172-.16.265-.079.095-.167.211-.238.284-.081.082-.165.172-.072.332.094.159.418.69 0.896 1.116.615.547 1.135.717 1.295.798.16.08.254.071.35-.041.095-.112.408-.475.517-.638.11-.164.218-.137.368-.082.15.054.954.45 1.118.532.164.081.273.123.313.191.04.068.04.394-.104.799zM12.045 2C6.505 2 2 6.506 2 12.047c0 1.973.57 3.815 1.558 5.378L2 22l4.743-1.517A9.977 9.977 0 0012.045 22c5.54 0 10.045-4.505 10.045-10.047C22.09 6.506 17.585 2 12.045 2z" />
          </svg>
        </a>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#18181c] text-white border border-white/20 shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
