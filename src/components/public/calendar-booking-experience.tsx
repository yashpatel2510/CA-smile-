"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
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
  MessageCircle,
  MapPin,
  CalendarDays,
  ExternalLink,
  Copy,
  CheckCheck,
  X,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  BookingFormConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";
import {
  isSlotInPast,
  isDateToday,
  isDateInPast,
  formatDateToYYYYMMDD,
  getSlotScheduledTime,
  getTodayDateString,
} from "@/lib/booking-time-utils";
import { trackBookingFunnel } from "@/lib/analytics";
import { BookNowButton } from "@/components/ui/book-now-button";

export interface CalendarBookingExperienceProps {
  initialService?: string;
  initialConfig?: BookingFormConfig;
  onSuccess?: (appointmentId: string) => void;
  isModal?: boolean;
  onClose?: () => void;
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
  initialConfig,
  onSuccess,
  isModal = false,
  onClose,
}: CalendarBookingExperienceProps) {
  const { brandConfig } = useClinicTheme();

  // Dynamic booking form configuration from admin panel (Booking Form Builder & Field Settings)
  const [config, setConfig] = useState<BookingFormConfig>(
    initialConfig || defaultBookingFormConfig
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

  // Selected date & slot
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    DEFAULT_TIME_RANGES[0]
  );

  // Patient Details form fields (matching Image 2 & config fields)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [treatment, setTreatment] = useState(initialService || "");
  const [preferredTime, setPreferredTime] = useState(DEFAULT_TIME_RANGES[0]);
  const [doctorPreference, setDoctorPreference] = useState("Any Available Specialist");
  const [notes, setNotes] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState(false);

  // Confirmation result
  const [confirmedData, setConfirmedData] = useState<{
    id: string;
    patientName: string;
    dateFormatted: string;
    slot: string;
    doctor: string;
  } | null>(null);

  // Fetch admin booking form configuration live from /api/booking-form/config
  useEffect(() => {
    fetch("/api/booking-form/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          setConfig(data.config);

          // Sync default slot from admin config
          if (data.config.timeSlots && data.config.timeSlots.length > 0) {
            setSelectedSlot(data.config.timeSlots[0]);
            setPreferredTime(data.config.timeSlots[0]);
          }

          // Sync default doctor from admin config
          if (data.config.doctors && data.config.doctors.length > 0) {
            setDoctorPreference(data.config.doctors[0]);
          }

          // Sync default treatment from admin config
          if (data.config.treatments && data.config.treatments.length > 0 && !treatment) {
            setTreatment(data.config.treatments[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic booking configuration:", err);
      });
  }, [treatment]);

  useEffect(() => {
    if (selectedSlot) {
      setPreferredTime(selectedSlot);
    }
  }, [selectedSlot]);

  // Dynamic field helper lookups from admin config
  const getField = (id: string) => config.fields?.find((f) => f.id === id);
  const isFieldEnabled = (id: string) => getField(id)?.enabled !== false;
  const isFieldRequired = (id: string) => getField(id)?.required === true;

  // Dynamic lists from admin panel configuration
  const availableSlots = useMemo(() => {
    if (config?.timeSlots && config.timeSlots.length > 0) {
      return config.timeSlots;
    }
    return DEFAULT_TIME_RANGES;
  }, [config.timeSlots]);

  // Sync selected slot with preferred time dropdown & auto-skip passed slots for today
  useEffect(() => {
    if (selectedDate && selectedSlot && isSlotInPast(selectedSlot, selectedDate)) {
      const nextValid = availableSlots.find((s) => !isSlotInPast(s, selectedDate));
      setSelectedSlot(nextValid || null);
    }
  }, [selectedDate, selectedSlot, availableSlots]);



  const doctorsList = useMemo(() => {
    if (config?.doctors && config.doctors.length > 0) {
      return config.doctors;
    }
    return [
      "Any Available Specialist",
      "Dr. Vidhyamol (Pediatric Specialist)",
      "Dr. Sankar (Chief Dental Surgeon)",
      "Dr. Sarah Vance, MD (Lead Physician)",
    ];
  }, [config.doctors]);

  const treatmentsList = useMemo(() => {
    if (config?.treatments && config.treatments.length > 0) {
      return config.treatments;
    }
    return [
      "General Dental Consultation & Checkup",
      "Pediatric Dentistry & Child Care",
      "Root Canal Treatment (Endodontics)",
      "Teeth Cleaning & Scaling (Prophylaxis)",
      "Orthodontics & Invisible Braces",
      "Dental Implants & Restoration",
      "Toothache & Emergency Dental Relief",
      "Cosmetic Dentistry & Smile Makeover",
    ];
  }, [config.treatments]);

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

  const handleContinueToDetails = () => {
    if (!selectedDate) {
      setErrorMsg("Please select a date on the calendar.");
      return;
    }
    if (isDateInPast(selectedDate)) {
      setErrorMsg("Past dates cannot be selected. Please choose today or an upcoming date.");
      return;
    }
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot.");
      return;
    }
    if (isSlotInPast(selectedSlot, selectedDate)) {
      setErrorMsg("The selected time slot has already passed for today. Please select an upcoming slot.");
      return;
    }
    setErrorMsg(null);
    trackBookingFunnel(2, "selected_date_and_slot");
    setStep(2);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isDateInPast(selectedDate)) {
      setErrorMsg("Past dates cannot be booked. Please choose an upcoming date.");
      return;
    }
    if (selectedDate && selectedSlot && isSlotInPast(selectedSlot, selectedDate)) {
      setErrorMsg("The selected time slot has already passed for today. Please select an upcoming slot.");
      return;
    }

    if (isFieldEnabled("fullName") && isFieldRequired("fullName") && !fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (isFieldEnabled("mobileNumber") && isFieldRequired("mobileNumber")) {
      const cleanMobile = phone.replace(/\D/g, "");
      if (cleanMobile.length !== 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number.");
        setIsSubmitting(false);
        return;
      }
    }

    if (isFieldEnabled("email") && isFieldRequired("email")) {
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
    }

    if (isFieldEnabled("consentAgreed") && isFieldRequired("consentAgreed") && !consentAgreed) {
      setErrorMsg("Please accept the contact agreement to proceed.");
      return;
    }

    if (isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
      const fName = nameParts[0] || fullName.trim() || "Valued";
      const lName = nameParts.slice(1).join(" ") || "Patient";

      const chosenDoctor = doctorPreference.replace(/^Doctor Preference:\s*/, "");
      const chosenTime = preferredTime.replace(/^Preferred Time:\s*/, "");
      const chosenTreatment = treatment || treatmentsList[0] || "General Dental Consultation";

      const preferredDateStr = selectedDate
        ? formatDateToYYYYMMDD(selectedDate)
        : getTodayDateString();

      const { startTime: calculatedStart, endTime: calculatedEnd } = getSlotScheduledTime(
        selectedDate || new Date(),
        chosenTime
      );

      // Append custom fields and extra notes
      const customNotesArr = Object.entries(customFieldValues)
        .filter(([_, val]) => Boolean(val && val.trim()))
        .map(([k, val]) => {
          const matchingField = config.fields.find((f) => f.id === k);
          return `[${matchingField?.label || k}]: ${val.trim()}`;
        });

      const allNotes = [
        `Doctor: ${chosenDoctor}`,
        `Time Slot: ${chosenTime}`,
        notes.trim(),
        ...customNotesArr,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        patientType: "ADULT",
        fullName: fullName.trim() || "Valued Patient",
        firstName: fName,
        lastName: lName,
        phone: phone.trim() || "0000000000",
        email: email.trim() || undefined,
        treatment: chosenTreatment,
        serviceName: chosenTreatment,
        reason: chosenTreatment,
        preferredDoctor: chosenDoctor,
        preferredDate: preferredDateStr,
        timeRange: chosenTime,
        startTime: calculatedStart.toISOString(),
        endTime: calculatedEnd.toISOString(),
        notes: allNotes || undefined,
        customFields: customFieldValues,
        consentAgreed: true,
        source: "WEB_FORM",
        forceOverride: true,
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
        patientName: fullName.trim() || "Valued Patient",
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
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setConfirmedData(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setCustomFieldValues({});
    setErrorMsg(null);
  };

  const handleCopyId = () => {
    if (confirmedData?.id) {
      navigator.clipboard.writeText(confirmedData.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  // Dynamic clinic details with fallback matching reference
  const clinicAddress =
    brandConfig?.address
      ? `${brandConfig.address}${brandConfig.city ? `, ${brandConfig.city}` : ""}${brandConfig.postalCode ? ` ${brandConfig.postalCode}` : ""}`
      : "742 Evergreen Medical Way, Suite 400, Springfield 97477";

  const clinicPhone = brandConfig?.phone || "(800) 555-CLINIC";
  const clinicEmail = brandConfig?.email || "contact@pediodent.example.com";

  const googleCalendarUrl = useMemo(() => {
    if (!confirmedData || !selectedDate) return "#";
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateFormatted = `${y}${m}${d}`;
    const clinicNameStr = config.clinicName || brandConfig?.clinicName || "PedioDent Dental Clinic";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Dental Consultation - ${clinicNameStr}`)}&dates=${dateFormatted}T100000Z/${dateFormatted}T104500Z&details=${encodeURIComponent(`Appointment ID: ${confirmedData.id}\nSpecialist: ${confirmedData.doctor}\nSlot: ${confirmedData.slot}`)}&location=${encodeURIComponent(clinicAddress)}`;
  }, [confirmedData, selectedDate, config.clinicName, brandConfig?.clinicName, clinicAddress]);

  // Dark Mode vs White / Light Mode
  const isDark = (config.themeMode || "light") === "dark";

  // Reusable input styling for Step 2 based on active theme mode
  const inputWrapperClass = `group relative rounded-xl border transition-all px-4 py-2.5 flex items-center justify-between ${
    isDark
      ? "bg-[#222227] hover:bg-[#26262d] focus-within:bg-[#26262d] border-white/10 focus-within:border-white/20"
      : "bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white border-slate-200 focus-within:border-slate-400"
  }`;
  const inputClass = `w-full bg-transparent text-xs sm:text-sm focus:outline-none ${
    isDark
      ? "text-white placeholder:text-zinc-500 [color-scheme:dark]"
      : "text-slate-900 placeholder:text-slate-400 [color-scheme:light]"
  }`;
  const iconClass = `h-4 w-4 shrink-0 pointer-events-none transition-colors ${
    isDark ? "text-zinc-500 group-hover:text-zinc-400" : "text-slate-400 group-hover:text-slate-600"
  }`;
  const selectOptionClass = isDark ? "bg-[#222227] text-white" : "bg-white text-slate-900";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`relative w-full overflow-hidden transition-colors duration-200 ${isDark ? "text-white" : "text-stone-900"}`}
    >
      {/* Outer Card: Compact styling so the whole section fits inside one screen properly */}
      {/* Outer Card: Compact styling matching Image 3 with internal scrolling if needed */}
      <div className={`overflow-hidden rounded-[24px] sm:rounded-[32px] border shadow-2xl transition-colors duration-200 ${
        isDark ? "border-white/10 bg-[#111215]" : "border-slate-300 bg-white"
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* =================================================================== */}
          {/* LEFT COLUMN: Customizable Headline + Contact Us + Brand Logo        */}
          {/* =================================================================== */}
          <div className={`flex flex-col justify-between border-b p-5 sm:p-6 lg:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:max-h-[640px] lg:overflow-y-auto custom-scrollbar transition-colors duration-200 ${
            isDark
              ? "border-white/10 bg-[#0e0f12] text-white"
              : "border-slate-200 bg-[#f8fafc] text-slate-900"
          }`}>
            <div>
              {/* Main Headline (Configurable via Admin) */}
              <h2 className={`font-heading text-2xl sm:text-3xl lg:text-[2.35rem] font-bold tracking-tight leading-[1.1] ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                {config.sideHeadingLine1 || "Let's Make That"}<br />
                <span className={isDark ? "text-white" : "text-slate-900"}>
                  {config.sideHeadingLine2 || "Smile Shine!"}
                </span>
              </h2>

              {/* Contact Us Block (Configurable via Admin) */}
              <div className={`mt-4 sm:mt-5 space-y-1.5 text-xs ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                <p className={`font-semibold text-xs tracking-wider uppercase ${isDark ? "text-white/90" : "text-slate-900"}`}>
                  Contact Us
                </p>
                <p className={`leading-relaxed max-w-xs ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                  {config.sideContactAddress || clinicAddress}
                </p>
                <p className={`pt-0.5 font-mono ${isDark ? "text-zinc-300" : "text-slate-800"}`}>
                  <a
                    href={`tel:${(config.sideContactPhone || clinicPhone).replace(/\D/g, "")}`}
                    className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-black font-semibold"}`}
                  >
                    {config.sideContactPhone || clinicPhone}
                  </a>
                </p>
                <p className={isDark ? "text-zinc-400" : "text-slate-600"}>
                  <a
                    href={`mailto:${config.sideContactEmail || clinicEmail}`}
                    className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-black font-semibold"}`}
                  >
                    {config.sideContactEmail || clinicEmail}
                  </a>
                </p>
              </div>

              {/* Quick Hotline Helpline Badge */}
              <div className={`mt-3 rounded-xl border p-2.5 flex items-center justify-between gap-2 text-xs transition-all ${
                isDark ? "border-white/10 bg-[#17181c]" : "border-slate-200 bg-slate-100/70"
              }`}>
                <div className="flex items-center gap-2">
                  <PhoneCall className={`h-3.5 w-3.5 ${isDark ? "text-zinc-400" : "text-slate-600"}`} />
                  <span className={`text-[11px] font-medium ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                    Need Instant Relief?
                  </span>
                </div>
                <a
                  href={`tel:${(config.sideContactPhone || clinicPhone).replace(/\D/g, "")}`}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1 transition-colors shadow-xs"
                >
                  Call Reception
                </a>
              </div>

              {/* Selected Summary Pills */}
              <div className="space-y-2 pt-3">
                {/* DATE PILL */}
                <div
                  className={`rounded-xl border p-2.5 sm:p-3 transition-all ${
                    isDark
                      ? selectedDate
                        ? "border-white/20 bg-[#1c1d22]"
                        : "border-white/5 bg-[#151619]"
                      : selectedDate
                      ? "border-slate-300 bg-white shadow-xs"
                      : "border-slate-200 bg-slate-100/70"
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                    SELECTED DATE
                  </div>
                  <div className={`mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    <CalendarIcon className={`h-3.5 w-3.5 ${isDark ? "text-zinc-300" : "text-slate-500"}`} />
                    <span>{selectedDateShortString}</span>
                  </div>
                </div>

                {/* TIME SLOT PILL */}
                <div
                  className={`rounded-xl border p-2.5 sm:p-3 transition-all ${
                    isDark
                      ? selectedSlot
                        ? "border-white/20 bg-[#1c1d22]"
                        : "border-white/5 bg-[#151619]"
                      : selectedSlot
                      ? "border-slate-300 bg-white shadow-xs"
                      : "border-slate-200 bg-slate-100/70"
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                    TIME SLOT
                  </div>
                  <div className={`mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    <Clock className={`h-3.5 w-3.5 ${isDark ? "text-zinc-300" : "text-slate-500"}`} />
                    <span className="truncate">{selectedSlot || "Select a time"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: CA Smile Logo (Replaced 'brighter' wordmark) + Follow Us */}
            <div className="mt-5 sm:mt-6 pt-2">
              <div className="mb-3 sm:mb-4 flex items-center">
                <img
                  src={
                    isDark
                      ? (config.logoDarkUrl || "/images/ca-smile-logo-dark.png")
                      : (config.logoLightUrl || "/images/ca-smile-logo-light.png")
                  }
                  alt={config.clinicName || "CA Smile Dental Clinic"}
                  className="h-16 sm:h-20 lg:h-24 w-auto max-w-[280px] sm:max-w-[340px] object-contain select-none transition-all duration-200"
                />
              </div>

              <div className={`flex flex-wrap items-center gap-2 text-[11px] font-medium ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                <span className={`font-semibold ${isDark ? "text-zinc-300" : "text-slate-900"}`}>
                  {config.sideFollowText || "Follow Us:"}
                </span>
                <a
                  href={config.facebookUrl || "https://facebook.com"}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-black font-semibold"}`}
                >
                  Facebook
                </a>
                <span className={isDark ? "text-zinc-600" : "text-slate-400"}>•</span>
                <a
                  href={config.linkedinUrl || "https://linkedin.com"}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-black font-semibold"}`}
                >
                  LinkedIn
                </a>
                <span className={isDark ? "text-zinc-600" : "text-slate-400"}>•</span>
                <a
                  href={config.instagramUrl || "https://instagram.com"}
                  target="_blank"
                  rel="noreferrer"
                  className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-black font-semibold"}`}
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: STEP 1 (Calendar) or STEP 2 (Image 2 Form Design)     */}
          {/* =================================================================== */}
          <div className={`p-5 sm:p-6 lg:p-8 lg:col-span-7 flex flex-col justify-between lg:max-h-[640px] lg:overflow-y-auto custom-scrollbar transition-colors duration-200 ${
            isDark ? "bg-[#18181c] text-white" : "bg-white text-slate-900"
          }`}>
            <div>
              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* =================================================================== */}
              {/* INTERACTIVE MULTI-STEP PROGRESS STEPPER                             */}
              {/* =================================================================== */}
              <div className={`mb-4 pb-3 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      step >= 1 ? (isDark ? "text-white" : "text-slate-900") : "text-stone-400"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                        step > 1
                          ? "bg-emerald-500 text-white shadow-xs"
                          : step === 1
                            ? "bg-[#881318] text-white ring-2 ring-red-400/40 shadow-xs"
                            : isDark
                              ? "bg-white/10 text-zinc-400"
                              : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {step > 1 ? "✓" : "1"}
                    </span>
                    <span>Date &amp; Slot</span>
                  </button>

                  <div
                    className={`h-[2px] flex-1 mx-2 sm:mx-3 rounded-full transition-all duration-300 ${
                      step >= 2 ? "bg-emerald-500" : isDark ? "bg-white/10" : "bg-slate-200"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDate && selectedSlot) setStep(2);
                    }}
                    disabled={!selectedDate || !selectedSlot}
                    className={`flex items-center gap-1.5 transition-colors ${
                      selectedDate && selectedSlot ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
                    } ${step >= 2 ? (isDark ? "text-white" : "text-slate-900") : "text-stone-400"}`}
                  >
                    <span
                      className={`flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                        step > 2
                          ? "bg-emerald-500 text-white shadow-xs"
                          : step === 2
                            ? "bg-[#881318] text-white ring-2 ring-red-400/40 shadow-xs"
                            : isDark
                              ? "bg-white/10 text-zinc-400"
                              : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {step > 2 ? "✓" : "2"}
                    </span>
                    <span>Patient Info</span>
                  </button>

                  <div
                    className={`h-[2px] flex-1 mx-2 sm:mx-3 rounded-full transition-all duration-300 ${
                      step === 3 ? "bg-emerald-500" : isDark ? "bg-white/10" : "bg-slate-200"
                    }`}
                  />

                  <div
                    className={`flex items-center gap-1.5 ${
                      step === 3 ? "text-emerald-500 font-bold" : "text-stone-400"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 sm:h-5.5 sm:w-5.5 items-center justify-center rounded-full text-[10px] font-bold ${
                        step === 3
                          ? "bg-emerald-500 text-white shadow-xs"
                          : isDark
                            ? "bg-white/10 text-zinc-400"
                            : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      3
                    </span>
                    <span>Confirmed</span>
                  </div>
                </div>
              </div>

              {/* =================================================================== */}
              {/* ANIMATED STEPS (FLUID HORIZONTAL SLIDE & FADE)                      */}
              {/* =================================================================== */}
              <AnimatePresence mode="wait">
                {/* ----------------------------------------------------------------- */}
                {/* STEP 1: COMPACT CALENDAR, QUICK CONCERNS & FILTERABLE TIME SLOTS   */}
                {/* ----------------------------------------------------------------- */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div>
                        <h3 className={`font-heading text-lg sm:text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                          {config.title || "Book Your Appointment"}
                        </h3>
                        <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                          Choose consultation treatment, calendar date &amp; slot.
                        </p>
                      </div>
                      {isModal && onClose && (
                        <button
                          type="button"
                          onClick={onClose}
                          className="sm:hidden self-end text-xs text-stone-400 hover:text-stone-700 underline"
                        >
                          Close
                        </button>
                      )}
                    </div>



                    {/* Month & Year Navigation Header */}
                    <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                      <h4 className={`font-heading text-sm sm:text-base font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        <CalendarIcon className="h-4 w-4 text-brand-primary" />
                        <span>{MONTH_NAMES[month]} {year}</span>
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          disabled={!isCanPrevMonth}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                            !isCanPrevMonth
                              ? isDark
                                ? "border-white/5 text-zinc-600 opacity-40 cursor-not-allowed select-none"
                                : "border-slate-200 text-slate-300 opacity-40 cursor-not-allowed select-none"
                              : isDark
                              ? "border-white/10 bg-[#222227] text-white hover:bg-[#2c2c34] active:scale-95 cursor-pointer"
                              : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 cursor-pointer"
                          }`}
                          aria-label="Previous Month"
                          title={!isCanPrevMonth ? "Cannot view past months" : "Previous Month"}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer active:scale-95 ${
                            isDark
                              ? "border-white/10 bg-[#222227] text-white hover:bg-[#2c2c34]"
                              : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }`}
                          aria-label="Next Month"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Days of week header */}
                    <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold tracking-wider ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
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
                                ? isDark
                                  ? "cursor-not-allowed text-zinc-600 bg-transparent select-none opacity-30"
                                  : "cursor-not-allowed text-slate-300 bg-transparent select-none opacity-40"
                                : isSelected
                                ? isDark
                                  ? "border-2 border-white bg-white text-black font-extrabold shadow-md scale-[1.05]"
                                  : "border-2 border-black bg-black text-white font-extrabold shadow-lg shadow-black/25 scale-[1.05]"
                                : isToday
                                ? isDark
                                  ? "border border-white/20 bg-[#25252c] text-white hover:bg-[#2d2d36]"
                                  : "border border-slate-400 bg-slate-100 text-slate-900 hover:bg-slate-200"
                                : isDark
                                ? "border border-white/5 bg-[#202025] text-zinc-300 hover:border-white/15 hover:bg-[#27272f]"
                                : "border border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            <span>{day}</span>
                            {isToday && !isSelected && (
                              <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isDark ? "bg-white" : "bg-slate-900"}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Available Time Slots Grid */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-semibold tracking-wider uppercase ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                          Available Slots
                        </span>

                        {selectedDate && (
                          <span className={isDark ? "text-zinc-400" : "text-slate-500"}>
                            For <strong className={isDark ? "text-white" : "text-slate-900"}>{selectedDateShortString}</strong>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                          const isSlotSelected = selectedSlot === slot;
                          const isPassed = isSlotInPast(slot, selectedDate);
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isPassed}
                              onClick={() => {
                                if (isPassed) return;
                                setSelectedSlot(slot);
                                setErrorMsg(null);
                              }}
                              className={`rounded-lg border py-2 px-2 text-center text-xs transition-all truncate ${
                                isPassed
                                  ? isDark
                                    ? "border-white/5 bg-[#17181c] text-zinc-600 opacity-40 cursor-not-allowed line-through"
                                    : "border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed line-through"
                                  : isSlotSelected
                                  ? isDark
                                    ? "border-2 border-white bg-white font-bold text-black shadow-sm scale-[1.02] cursor-pointer"
                                    : "border-2 border-slate-900 bg-slate-900 font-bold text-white shadow-sm scale-[1.02] cursor-pointer"
                                  : isDark
                                    ? "border-white/5 bg-[#202025] text-zinc-300 hover:border-white/15 hover:bg-[#26262d] cursor-pointer"
                                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100 cursor-pointer"
                              }`}
                              title={isPassed ? "This time slot has already passed for today" : slot}
                            >
                              <span>{slot}</span>
                              {isPassed && (
                                <span className="block text-[9px] no-underline font-normal text-rose-500">
                                  Passed
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {selectedDate && isDateToday(selectedDate) && availableSlots.every((s) => isSlotInPast(s, selectedDate)) && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 font-medium text-center">
                          All time slots for today have ended. Please choose tomorrow or an upcoming date.
                        </div>
                      )}
                    </div>

                    {/* Step 1 Bottom Row: Continue to Details */}
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-2 border-t ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}>
                      <div className={`text-[11px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                        {selectedDate && selectedSlot ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Selected: {selectedDateShortString} ({selectedSlot})
                          </span>
                        ) : (
                          <span>Please choose a date &amp; time slot to continue</span>
                        )}
                      </div>

                      <BookNowButton
                        type="button"
                        onClick={handleContinueToDetails}
                        size="sm"
                        text="Continue to Patient Info"
                        disabled={!selectedDate || !selectedSlot}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 2: PATIENT DETAILS WITH REAL-TIME FEEDBACK                   */}
                {/* ----------------------------------------------------------------- */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <form onSubmit={handleConfirmBooking} className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2 dark:border-white/10">
                        <div>
                          <h3 className={`font-heading text-lg sm:text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                            Patient Information
                          </h3>
                          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                            Slot reserved: <strong>{selectedDateShortString} ({selectedSlot})</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className={`text-xs font-semibold underline transition-colors cursor-pointer ${
                            isDark ? "text-zinc-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          &larr; Change Date / Time
                        </button>
                      </div>



                      {/* Field 1: Your Full Name */}
                      {isFieldEnabled("fullName") && (
                        <div className={inputWrapperClass}>
                          <input
                            type="text"
                            name="fullName"
                            required={isFieldRequired("fullName")}
                            placeholder={getField("fullName")?.placeholder || "e.g. Anish Kumar"}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClass}
                          />
                          <ChevronDown className={iconClass} />
                        </div>
                      )}

                      {/* Field 2: Phone Number with Live 10-digit feedback */}
                      {isFieldEnabled("mobileNumber") && (
                        <div className="space-y-1">
                          <div className={inputWrapperClass}>
                            <input
                              type="tel"
                              name="phone"
                              required={isFieldRequired("mobileNumber")}
                              placeholder={getField("mobileNumber")?.placeholder || "10-digit mobile number"}
                              value={phone}
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                                setPhone(numericValue);
                              }}
                              maxLength={10}
                              pattern="[0-9]{10}"
                              inputMode="numeric"
                              className={inputClass}
                            />
                            {phone.length === 10 ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 animate-in fade-in">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <ChevronDown className={iconClass} />
                            )}
                          </div>
                          {phone.length > 0 && phone.length < 10 && (
                            <p className="text-[10px] text-amber-500 px-1">
                              Please enter {10 - phone.length} more digit{10 - phone.length > 1 ? "s" : ""} (10 digits required)
                            </p>
                          )}
                        </div>
                      )}

                      {/* Field 3: Email Address */}
                      {isFieldEnabled("email") && (
                        <div className={inputWrapperClass}>
                          <input
                            type="email"
                            name="email"
                            required={isFieldRequired("email")}
                            placeholder={getField("email")?.placeholder || "Email Address (Optional)"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                          />
                          <ChevronDown className={iconClass} />
                        </div>
                      )}

                      {/* Field 4: Selected Date (with calendar icon) */}
                      {isFieldEnabled("preferredDate") && (
                        <div
                          onClick={() => setStep(1)}
                          className={`group relative rounded-xl border transition-all px-4 py-2.5 flex items-center justify-between cursor-pointer ${
                            isDark
                              ? "bg-[#222227] hover:bg-[#26262d] border-white/10"
                              : "bg-slate-50 hover:bg-slate-100/70 border-slate-200"
                          }`}
                          title="Click to change date on calendar"
                        >
                          <span className={`text-xs sm:text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {dateFormattedSlash || "Select Date"}
                          </span>
                          <CalendarIcon className={iconClass} />
                        </div>
                      )}

                      {/* Field 5: Treatment Dropdown */}
                      {isFieldEnabled("treatment") && (
                        <div className={inputWrapperClass}>
                          <select
                            name="treatment"
                            required={isFieldRequired("treatment")}
                            value={treatment}
                            onChange={(e) => setTreatment(e.target.value)}
                            className={inputClass}
                          >
                            <option value="" disabled className={selectOptionClass}>
                              {getField("treatment")?.placeholder || "Select Treatment / Consultation"}
                            </option>
                            {treatmentsList.map((t) => (
                              <option key={t} value={t} className={selectOptionClass}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={iconClass} />
                        </div>
                      )}

                      {/* Field 6: Preferred Doctor Dropdown */}
                      {isFieldEnabled("preferredDoctor") && (
                        <div className={inputWrapperClass}>
                          <select
                            name="preferredDoctor"
                            required={isFieldRequired("preferredDoctor")}
                            value={doctorPreference}
                            onChange={(e) => setDoctorPreference(e.target.value)}
                            className={inputClass}
                          >
                            {doctorsList.map((doc) => (
                              <option key={doc} value={doc} className={selectOptionClass}>
                                {doc}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={iconClass} />
                        </div>
                      )}

                      {/* Field 7: Preferred Time Range Dropdown */}
                      {isFieldEnabled("preferredTime") && (
                        <div className={inputWrapperClass}>
                          <select
                            name="preferredTime"
                            required={isFieldRequired("preferredTime")}
                            value={preferredTime}
                            onChange={(e) => setPreferredTime(e.target.value)}
                            className={inputClass}
                          >
                            {availableSlots.map((slot) => {
                              const isPassed = isSlotInPast(slot, selectedDate);
                              return (
                                <option
                                  key={slot}
                                  value={slot}
                                  disabled={isPassed}
                                  className={selectOptionClass}
                                >
                                  {slot}{isPassed ? " (Passed)" : ""}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className={iconClass} />
                        </div>
                      )}

                      {/* Field 8: Notes / Reason */}
                      {isFieldEnabled("notes") && (
                        <div className={inputWrapperClass}>
                          <input
                            type="text"
                            name="notes"
                            required={isFieldRequired("notes")}
                            placeholder={getField("notes")?.placeholder || "Special requests or symptoms (optional)"}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={inputClass}
                          />
                          <ChevronDown className={iconClass} />
                        </div>
                      )}

                      {/* Dynamic Custom Fields */}
                      {config.fields
                        ?.filter(
                          (f) =>
                            ![
                              "fullName",
                              "mobileNumber",
                              "email",
                              "preferredDate",
                              "treatment",
                              "preferredDoctor",
                              "preferredTime",
                              "notes",
                              "consentAgreed",
                            ].includes(f.id) && f.enabled !== false
                        )
                        .map((field) => (
                          <div key={field.id} className={inputWrapperClass}>
                            {field.type === "select" ? (
                              <select
                                required={field.required}
                                value={customFieldValues[field.id] || ""}
                                onChange={(e) =>
                                  setCustomFieldValues((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.value,
                                  }))
                                }
                                className={inputClass}
                              >
                                <option value="" disabled className={selectOptionClass}>
                                  {field.placeholder || `Select ${field.label}`}
                                </option>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt} className={selectOptionClass}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
                                required={field.required}
                                placeholder={field.placeholder || field.label}
                                value={customFieldValues[field.id] || ""}
                                onChange={(e) =>
                                  setCustomFieldValues((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            )}
                            <ChevronDown className={iconClass} />
                          </div>
                        ))}

                      {/* Checkbox: Agreement */}
                      {isFieldEnabled("consentAgreed") && (
                        <div className="pt-0.5">
                          <label className={`flex items-center gap-2.5 cursor-pointer text-xs select-none group ${
                            isDark ? "text-zinc-400" : "text-slate-600"
                          }`}>
                            <input
                              type="checkbox"
                              checked={consentAgreed}
                              onChange={(e) => setConsentAgreed(e.target.checked)}
                              className={`h-4 w-4 rounded cursor-pointer accent-[#881318] ${
                                isDark ? "border-zinc-700 bg-zinc-800 text-red-600" : "border-slate-300 bg-white text-red-600"
                              }`}
                            />
                            <span className={`transition-colors ${isDark ? "group-hover:text-zinc-300" : "group-hover:text-slate-900"}`}>
                              {getField("consentAgreed")?.label || getField("consentAgreed")?.helpText || "I agree to be contacted to confirm my appointment."}
                            </span>
                          </label>
                        </div>
                      )}

                      {/* Bottom Row: Calendar on LEFT side, Submit on RIGHT side */}
                      <div className={`pt-3 flex items-center justify-between w-full gap-3 border-t ${isDark ? "border-white/10" : "border-slate-200"}`}>
                        <div className="shrink-0 flex items-center justify-start">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <CalendarIcon className={`h-4 w-4 ${isDark ? "text-zinc-400" : "text-slate-600"}`} />
                            <span>View Calendar</span>
                          </button>
                        </div>

                        <div className="shrink-0 flex items-center justify-end ml-auto">
                          <BookNowButton
                            type="submit"
                            size="sm"
                            text={isSubmitting ? "Confirming..." : (config.submitButtonText || "Submit Appointment Request")}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                          />
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* STEP 3: CONFIRMATION / THANK YOU STATE                            */}
                {/* ----------------------------------------------------------------- */}
                {step === 3 && confirmedData && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="space-y-4 py-1"
                  >
                    <div className={`rounded-2xl border p-5 space-y-3.5 ${
                      isDark ? "border-white/10 bg-[#202025] text-white" : "border-slate-200 bg-slate-50 text-slate-900 shadow-sm"
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className={`font-heading text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                              Appointment Confirmed!
                            </h4>
                            <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                              Consultation slot successfully scheduled.
                            </p>
                          </div>
                        </div>

                        {/* 1-Click Copy Reference ID */}
                        <button
                          type="button"
                          onClick={handleCopyId}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                            copiedId
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : isDark
                                ? "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                                : "border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {copiedId ? (
                            <>
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className={`space-y-1.5 border-t pt-3 text-xs ${isDark ? "border-white/10 text-zinc-300" : "border-slate-200 text-slate-700"}`}>
                        <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/5" : "border-slate-200/60"}`}>
                          <span className={isDark ? "text-zinc-400" : "text-slate-500"}>Reference ID:</span>
                          <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{confirmedData.id}</span>
                        </div>
                        <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/5" : "border-slate-200/60"}`}>
                          <span className={isDark ? "text-zinc-400" : "text-slate-500"}>Patient Name:</span>
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{confirmedData.patientName}</span>
                        </div>
                        <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/5" : "border-slate-200/60"}`}>
                          <span className={isDark ? "text-zinc-400" : "text-slate-500"}>Scheduled Date:</span>
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{confirmedData.dateFormatted}</span>
                        </div>
                        <div className={`flex justify-between py-1 border-b ${isDark ? "border-white/5" : "border-slate-200/60"}`}>
                          <span className={isDark ? "text-zinc-400" : "text-slate-500"}>Time Window:</span>
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{confirmedData.slot}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className={isDark ? "text-zinc-400" : "text-slate-500"}>Specialist Doctor:</span>
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{confirmedData.doctor}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 text-xs font-semibold transition-all shadow-xs"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Add to Google Calendar</span>
                      </a>

                      <a
                        href={`https://wa.me/${((brandConfig as any)?.whatsappNumber || brandConfig?.phone || "919876543210").replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hello! I have booked an appointment on your website.\nReference ID: ${confirmedData.id}\nPatient: ${confirmedData.patientName}\nDate: ${confirmedData.dateFormatted}\nSlot: ${confirmedData.slot}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2 text-xs font-semibold transition-all shadow-xs"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp Confirmation</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleReset}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isDark ? "border-white/10 bg-white/10 hover:bg-white/15 text-white" : "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900"
                        }`}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Book Another</span>
                      </button>

                      {isModal && onClose && (
                        <button
                          type="button"
                          onClick={onClose}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-black text-white px-4 py-2 text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Done &amp; Close</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons Matching Reference Mock (Only on Standalone Page) */}
      {!isModal && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        <a
          href={`tel:${(config.sideContactPhone || clinicPhone).replace(/\D/g, "")}`}
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-xl transition-transform hover:scale-110 active:scale-95 ${
            isDark ? "bg-[#18181c] text-white border-white/20" : "bg-white text-stone-900 border-stone-300"
          }`}
          aria-label="Call clinic"
        >
          <PhoneCall className="h-4 w-4" />
        </a>

        <a
          href={`https://wa.me/${(config.sideContactPhone || clinicPhone).replace(/\D/g, "")}?text=Hello%20there,%20I%20would%20like%20to%20book%20an%20appointment.`}
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
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
            isDark ? "bg-[#18181c] text-white border-white/20" : "bg-white text-stone-900 border-stone-300"
          }`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
      )}
    </motion.div>
  );
}
