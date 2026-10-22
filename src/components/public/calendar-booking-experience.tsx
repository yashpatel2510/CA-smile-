"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
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
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  BookingFormConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";
import { trackBookingFunnel } from "@/lib/analytics";

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

  // Today's date reference at midnight (e.g. Oct 9, 2026)
  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState<Date>(
    new Date(todayMidnight.getFullYear(), todayMidnight.getMonth(), 1)
  );

  // Selected date & slot: start as null so patient must select both
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Patient Details form fields
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [treatment, setTreatment] = useState(initialService || "");
  const [additionalMessage, setAdditionalMessage] = useState("");
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

  // Check if user can navigate to previous month (cannot go into past months)
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

    // Prevent selecting previous dates (e.g. today is 9 Oct, cannot select 8 Oct)
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

  // Available Slots: uses dynamic config time slots or defaults
  const availableSlots = useMemo(() => {
    if (config?.timeSlots && config.timeSlots.length > 0) {
      return config.timeSlots;
    }
    return [
      "3:00 PM",
      "3:30 PM",
      "4:00 PM",
      "4:30 PM",
      "5:00 PM",
      "5:30 PM",
      "6:00 PM",
      "6:30 PM",
      "7:00 PM",
      "7:30 PM",
      "8:00 PM",
      "8:30 PM",
    ];
  }, [config]);

  // Treatments: uses dynamic config treatments or defaults
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

      // Aggregate custom fields answers into notes
      const customNotesArr = Object.entries(customFieldValues)
        .filter(([_, val]) => Boolean(val && val.trim()))
        .map(([k, val]) => {
          const matchingField = config.fields.find((f) => f.id === k);
          return `[${matchingField?.label || k}]: ${val.trim()}`;
        });

      const allNotes = [
        additionalMessage.trim(),
        ...customNotesArr,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        fullName: fullName.trim(),
        firstName: fName,
        lastName: lName,
        phone: `${countryCode} ${mobileNumber.trim()}`,
        email: email.trim() || undefined,
        treatment: chosenTreatment,
        serviceName: chosenTreatment,
        reason: chosenTreatment,
        preferredDate: selectedDate?.toISOString().split("T")[0],
        timeRange: selectedSlot,
        startTime: formattedIsoDate,
        notes: allNotes || undefined,
        customFields: customFieldValues,
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

  const workingHours =
    brandConfig?.workingHours ||
    "Mon-Sat: 10am-9pm | Sun: 10:30am-6pm";

  return (
    <div className="relative w-full">
      {/* Outer Card Container Matching Reference Mock */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-[#fbf9f5] shadow-xl shadow-stone-900/5">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* =================================================================== */}
          {/* LEFT COLUMN: Summary & Craft Your Perfect Visit                    */}
          {/* =================================================================== */}
          <div className="flex flex-col justify-between border-b border-stone-200/80 bg-[#f9f7f2] p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-10">
            <div className="space-y-6">
              {/* Badge: BOOK YOUR SPOT */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f2583e]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e0533c]">
                <Sparkles className="h-3 w-3" />
                <span>BOOK YOUR SPOT</span>
              </div>

              {/* Main Elegant Headline */}
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-normal leading-[1.12] text-[#1c1917]">
                  Craft Your <br />
                  <span className="italic font-serif font-medium text-[#e0533c]">
                    Perfect
                  </span>{" "}
                  <br />
                  Visit.
                </h2>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-600">
                  Select a date from our real-time medical calendar. We ensure
                  ample time for your bespoke consultation.
                </p>
              </div>

              {/* Selected Summary Pill 1: DATE */}
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  selectedDate
                    ? "border-blue-400/80 bg-white shadow-xs"
                    : "border-stone-200 bg-white/70"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  SELECTED DATE
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-800">
                  <CalendarIcon className="h-4 w-4 text-[#2b6cb0]" />
                  <span>{selectedDateShortString}</span>
                </div>
              </div>

              {/* Selected Summary Pill 2: TIME SLOT */}
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  selectedSlot
                    ? "border-blue-400/80 bg-white shadow-xs"
                    : "border-stone-200 bg-white/70"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  TIME SLOT
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone-800">
                  <Clock className="h-4 w-4 text-[#2b6cb0]" />
                  <span>{selectedSlot || "Select a time"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Hours Note */}
            <div className="mt-8 flex items-center gap-2 border-t border-stone-200/80 pt-4 text-[11px] font-medium text-stone-500">
              <Clock className="h-3.5 w-3.5 text-[#e0533c]" />
              <span>{workingHours}</span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: STEP-BY-STEP WORKFLOW                                */}
          {/* =================================================================== */}
          <div className="bg-white p-6 sm:p-8 lg:col-span-7 lg:p-10">
            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 1: INTERACTIVE REAL-TIME CALENDAR & SLOTS                    */}
            {/* ----------------------------------------------------------------- */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Month & Year Navigation Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                    {MONTH_NAMES[month]} {year}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      disabled={!isCanPrevMonth}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        !isCanPrevMonth
                          ? "border-stone-100 text-stone-300 opacity-40 cursor-not-allowed select-none"
                          : "border-stone-200 text-stone-600 transition-colors hover:bg-stone-100 active:scale-95 cursor-pointer"
                      }`}
                      aria-label="Previous Month"
                      title={!isCanPrevMonth ? "Cannot view past months" : "Previous Month"}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition-colors hover:bg-stone-100 active:scale-95 cursor-pointer"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold tracking-wider text-stone-400">
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
                    <div key={`empty-${i}`} className="h-11 sm:h-14" />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const cellDate = new Date(year, month, day);
                    cellDate.setHours(0, 0, 0, 0);

                    const isPast = cellDate.getTime() < todayMidnight.getTime();
                    const isToday = cellDate.getTime() === todayMidnight.getTime();
                    const isSelected =
                      selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === month &&
                      selectedDate?.getFullYear() === year;

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleSelectDate(day)}
                        className={`relative flex h-11 sm:h-14 flex-col items-center justify-center rounded-2xl text-xs sm:text-sm transition-all ${
                          isPast
                            ? "cursor-not-allowed bg-stone-100/50 text-stone-300 opacity-40 line-through select-none"
                            : isSelected
                              ? "cursor-pointer bg-[#2b6cb0] font-bold text-white shadow-md scale-105 ring-2 ring-[#2b6cb0]/40"
                              : isToday
                                ? "cursor-pointer border-2 border-[#2b6cb0] bg-blue-50/70 font-bold text-[#2b6cb0] hover:bg-blue-100/70"
                                : "cursor-pointer bg-stone-50/70 text-stone-800 hover:bg-stone-100 active:scale-95"
                        }`}
                        title={
                          isPast
                            ? "Past dates cannot be selected"
                            : isToday
                              ? "Today"
                              : undefined
                        }
                      >
                        <span className={isPast ? "line-through text-stone-300" : ""}>{day}</span>
                        {isToday && !isSelected && (
                          <span className="text-[9px] font-bold tracking-tight text-[#2b6cb0] uppercase">
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Available Slots Section */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    AVAILABLE SLOTS
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                      const isSlotSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border py-2.5 px-3 text-center text-xs transition-all cursor-pointer ${
                            isSlotSelected
                              ? "border-2 border-[#2b6cb0] bg-blue-50/70 font-bold text-[#2b6cb0] shadow-xs"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Continue Action Button & Guidance */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-stone-100">
                  <div className="text-xs">
                    {!selectedDate ? (
                      <span className="inline-flex items-center gap-1.5 text-stone-500 font-medium">
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        Step 1: Select an upcoming date from the calendar
                      </span>
                    ) : !selectedSlot ? (
                      <span className="inline-flex items-center gap-1.5 text-stone-500 font-medium">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        Step 2: Choose an available time slot for {selectedDateShortString}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Selected: {selectedDateShortString} at {selectedSlot}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!selectedDate || !selectedSlot}
                    onClick={handleContinueToDetails}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all ${
                      !selectedDate || !selectedSlot
                        ? "cursor-not-allowed bg-stone-200 text-stone-400 opacity-60 shadow-none pointer-events-none select-none"
                        : "cursor-pointer bg-[#2b6cb0] text-white shadow-md hover:bg-[#23588f] active:scale-[0.99]"
                    }`}
                    title={
                      !selectedDate || !selectedSlot
                        ? "Please select both a date and a time slot to continue"
                        : "Continue to patient details"
                    }
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 2: PATIENT DETAILS FORM (DYNAMICALLY RENDERED FROM CONFIG)  */}
            {/* ----------------------------------------------------------------- */}
            {step === 2 && (
              <form
                onSubmit={handleConfirmBooking}
                className="space-y-5 rounded-2xl p-2 transition-colors"
                style={{
                  backgroundColor: config.formBgColor || undefined,
                  color: config.formTextColor || undefined,
                }}
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>BACK TO CALENDAR</span>
                </button>

                <div>
                  <h3 className="font-serif text-2xl font-normal text-stone-900">
                    {config.title || "Patient Details"}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Complete your details to submit your appointment request.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Dynamic rendering of all enabled fields */}
                  {config.fields
                    .filter((field) => field.enabled !== false)
                    .map((field) => {
                      const inputStyle = {
                        backgroundColor: field.bgColor || "#ffffff",
                        color: field.textColor || "#1e293b",
                        borderColor: "#e2e8f0",
                      };

                      if (field.id === "fullName") {
                        return (
                          <div key={field.id} className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              {field.label} {field.required && "*"}
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                              <input
                                type="text"
                                required={field.required}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={field.placeholder || "Your Full Name"}
                                style={inputStyle}
                                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                              />
                            </div>
                            {field.helpText && (
                              <p className="text-[10px] text-stone-400">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.id === "mobileNumber") {
                        return (
                          <div key={field.id} className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              {field.label} {field.required && "*"}
                            </label>
                            <div className="flex gap-2">
                              <div className="relative w-24 shrink-0">
                                <select
                                  value={countryCode}
                                  onChange={(e) => setCountryCode(e.target.value)}
                                  style={inputStyle}
                                  className="w-full appearance-none rounded-xl border py-2.5 pl-3 pr-7 text-xs font-semibold focus:border-[#2b6cb0] focus:outline-none"
                                >
                                  <option value="+91">+91</option>
                                  <option value="+1">+1</option>
                                  <option value="+44">+44</option>
                                  <option value="+971">+971</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                              </div>

                              <div className="relative flex-1">
                                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                <input
                                  type="tel"
                                  required={field.required}
                                  value={mobileNumber}
                                  onChange={(e) => setMobileNumber(e.target.value)}
                                  placeholder={field.placeholder || "10-digit mobile number"}
                                  style={inputStyle}
                                  className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                                />
                              </div>
                            </div>
                            {field.helpText && (
                              <p className="text-[10px] text-stone-400">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.id === "email") {
                        return (
                          <div key={field.id} className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              {field.label} {field.required ? "*" : "(OPTIONAL)"}
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                              <input
                                type="email"
                                required={field.required}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={field.placeholder || "name@example.com"}
                                style={inputStyle}
                                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                              />
                            </div>
                            {field.helpText && (
                              <p className="text-[10px] text-stone-400">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.id === "treatment") {
                        return (
                          <div key={field.id} className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              {field.label} {field.required && "*"}
                            </label>
                            <div className="relative">
                              <select
                                required={field.required}
                                value={treatment}
                                onChange={(e) => setTreatment(e.target.value)}
                                style={inputStyle}
                                className="w-full appearance-none rounded-xl border py-2.5 pl-4 pr-10 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none"
                              >
                                <option value="">Select Treatment Concern</option>
                                {treatmentsList.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            </div>
                            {field.helpText && (
                              <p className="text-[10px] text-stone-400">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.id === "notes") {
                        return (
                          <div key={field.id} className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              {field.label} {field.required && "*"}
                            </label>
                            <div className="relative">
                              <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                              <textarea
                                rows={3}
                                required={field.required}
                                value={additionalMessage}
                                onChange={(e) => setAdditionalMessage(e.target.value)}
                                placeholder={
                                  field.placeholder ||
                                  "Any specific concerns, symptoms, or medical notes..."
                                }
                                style={inputStyle}
                                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none"
                              />
                            </div>
                            {field.helpText && (
                              <p className="text-[10px] text-stone-400">{field.helpText}</p>
                            )}
                          </div>
                        );
                      }

                      if (field.id === "contactMethod") {
                        return (
                          <div key={field.id} className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              {field.label}
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="contactMethod"
                                  value="PHONE"
                                  defaultChecked
                                  className="text-[#2b6cb0]"
                                />
                                <span>Phone Call</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="contactMethod"
                                  value="WHATSAPP"
                                  className="text-[#2b6cb0]"
                                />
                                <span>WhatsApp</span>
                              </label>
                            </div>
                          </div>
                        );
                      }

                      // ANY CUSTOM FIELD OR ADDITIONAL FIELD
                      return (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                            {field.label} {field.required && "*"}
                          </label>

                          {field.type === "select" && field.options ? (
                            <div className="relative">
                              <select
                                required={field.required}
                                value={customFieldValues[field.id] || ""}
                                onChange={(e) =>
                                  setCustomFieldValues((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.value,
                                  }))
                                }
                                style={inputStyle}
                                className="w-full appearance-none rounded-xl border py-2.5 pl-4 pr-10 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none"
                              >
                                <option value="">
                                  {field.placeholder || `Select ${field.label}`}
                                </option>
                                {field.options.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                            </div>
                          ) : field.type === "textarea" ? (
                            <textarea
                              rows={2}
                              required={field.required}
                              value={customFieldValues[field.id] || ""}
                              onChange={(e) =>
                                setCustomFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder || `Enter ${field.label}...`}
                              style={inputStyle}
                              className="w-full rounded-xl border p-2.5 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none"
                            />
                          ) : field.type === "checkbox" ? (
                            <label className="flex items-center gap-2 pt-1 cursor-pointer">
                              <input
                                type="checkbox"
                                required={field.required}
                                checked={customFieldValues[field.id] === "Yes"}
                                onChange={(e) =>
                                  setCustomFieldValues((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.checked ? "Yes" : "No",
                                  }))
                                }
                                className="h-4 w-4 rounded border-stone-300 text-[#2b6cb0]"
                              />
                              <span className="text-xs text-stone-700">
                                {field.placeholder || field.label}
                              </span>
                            </label>
                          ) : (
                            <input
                              type={field.type || "text"}
                              required={field.required}
                              value={customFieldValues[field.id] || ""}
                              onChange={(e) =>
                                setCustomFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder || `Enter ${field.label}...`}
                              style={inputStyle}
                              className="w-full rounded-xl border py-2.5 px-4 text-xs sm:text-sm focus:border-[#2b6cb0] focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                            />
                          )}

                          {field.helpText && (
                            <p className="text-[10px] text-stone-400">{field.helpText}</p>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Confirm Booking Action Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: config.buttonBgColor || "#f2583e",
                      color: config.buttonTextColor || "#ffffff",
                    }}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <span>
                      {isSubmitting
                        ? "Confirming..."
                        : config.submitButtonText || "Confirm Booking"}
                    </span>
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 3: CONFIRMATION / THANK YOU (MATCHING SAMPLE IMAGE 2)       */}
            {/* ----------------------------------------------------------------- */}
            {step === 3 && confirmedData && (
              <div className="space-y-6">
                {/* Your Appointment Details Card with Coral Accent */}
                <div className="rounded-2xl border-l-4 border-l-[#f2583e] border border-stone-200 bg-[#fefaf6] p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-4">
                    <FileText className="h-4 w-4 text-[#e0533c]" />
                    <span>Your Appointment Details</span>
                  </div>

                  <div className="space-y-3.5">
                    {/* APPOINTMENT DATE */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2b6cb0] text-white">
                        <CalendarIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          APPOINTMENT DATE
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-stone-800">
                          {confirmedData.dateFormatted}
                        </div>
                      </div>
                    </div>

                    {/* TIME SLOT */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2b6cb0] text-white">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          TIME SLOT
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-stone-800">
                          {confirmedData.slot}
                        </div>
                      </div>
                    </div>

                    {/* CONFIRMATION EMAIL */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2b6cb0] text-white">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          CONFIRMATION EMAIL
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-stone-800">
                          {confirmedData.email}
                        </div>
                      </div>
                    </div>

                    {/* TREATMENT INTEREST */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#2b6cb0] text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          TREATMENT INTEREST
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-stone-800">
                          {confirmedData.treatment}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What Happens Next? Card */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>What Happens Next?</span>
                  </div>

                  <ol className="space-y-2 text-xs text-stone-600">
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2b6cb0] text-[10px] font-bold text-white">
                        1
                      </span>
                      <span>
                        You&apos;ll receive a confirmation communication at{" "}
                        <strong>{confirmedData.email}</strong> within the next
                        few minutes.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2b6cb0] text-[10px] font-bold text-white">
                        2
                      </span>
                      <span>
                        Our team will review your request and contact you to
                        confirm your schedule.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2b6cb0] text-[10px] font-bold text-white">
                        3
                      </span>
                      <span>
                        If you have any questions, feel free to reach out to us
                        directly at reception.
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f2583e] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#e0452b] transition-all cursor-pointer"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>Book Another Appointment</span>
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-stone-700 shadow-xs hover:bg-stone-50 transition-all"
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
          href="tel:+918590422464"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2b6cb0] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Call clinic"
        >
          <PhoneCall className="h-5 w-5" />
        </a>

        <a
          href="https://wa.me/918590422464?text=Hello%20PedioDent,%20I%20would%20like%20to%20book%20an%20appointment."
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Chat on WhatsApp"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.179-.536-1.528-.627-2.515-2.172-2.592-2.273-.076-.101-.617-.824-.617-1.571 0-.747.387-1.115.526-1.268.143-.153.313-.191.419-.191.106 0 .211.002.304.007.099.005.231-.038.361.275.134.321.46 1.119.5 1.2.04.082.067.177.013.284-.053.106-.08.172-.16.265-.079.095-.167.211-.238.284-.081.082-.165.172-.072.332.094.159.418.69 0.896 1.116.615.547 1.135.717 1.295.798.16.08.254.071.35-.041.095-.112.408-.475.517-.638.11-.164.218-.137.368-.082.15.054.954.45 1.118.532.164.081.273.123.313.191.04.068.04.394-.104.799zM12.045 2C6.505 2 2 6.506 2 12.047c0 1.973.57 3.815 1.558 5.378L2 22l4.743-1.517A9.977 9.977 0 0012.045 22c5.54 0 10.045-4.505 10.045-10.047C22.09 6.506 17.585 2 12.045 2z" />
          </svg>
        </a>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
