"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Calendar as CalendarIcon,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { trackFunnelStep } from "@/lib/analytics";
import {
  BookingFormConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";
import { BookNowButton } from "@/components/ui/book-now-button";

interface QuickBookingFormProps {
  className?: string;
  defaultService?: string;
  clinicName?: string;
  onSuccess?: (appointmentId: string) => void;
}

export function QuickBookingForm({
  className = "",
  defaultService = "General Dental Consultation & Checkup",
  clinicName = "VS Multispeciality Dental Clinic",
  onSuccess,
}: QuickBookingFormProps) {
  // Live Dynamic Config State
  const [formConfig, setFormConfig] = useState<BookingFormConfig>(
    defaultBookingFormConfig
  );

  // Form State
  const [patientType, setPatientType] = useState<"ADULT" | "CHILD">("ADULT");
  const [fullName, setFullName] = useState("");
  const [childName, setChildName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDoctor, setPreferredDoctor] = useState("Any Available Specialist");
  const [treatment, setTreatment] = useState(defaultService);

  // Date default to tomorrow in YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().split("T")[0];
  const [preferredDate, setPreferredDate] = useState(tomorrowIso);

  // Time range
  const [timeRange, setTimeRange] = useState("Afternoon (2:00 PM - 5:00 PM)");
  const [contactMethod, setContactMethod] = useState<"PHONE" | "WHATSAPP">("PHONE");
  const [notes, setNotes] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Dynamic custom questions answers
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    patientName: string;
    treatment: string;
    date: string;
    timeRange: string;
    contactMethod: string;
  } | null>(null);

  // Fetch dynamic booking form config from API
  useEffect(() => {
    fetch("/api/booking-form/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          setFormConfig(data.config);
          // Sync default treatment if valid
          if (
            data.config.treatments?.length > 0 &&
            !data.config.treatments.includes(defaultService)
          ) {
            setTreatment(data.config.treatments[0]);
          }
          if (data.config.timeSlots?.length > 0) {
            setTimeRange(data.config.timeSlots[0]);
          }
          if (data.config.doctors?.length > 0) {
            setPreferredDoctor(data.config.doctors[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch dynamic booking config, using fallback:", err);
      });
  }, [defaultService]);

  const isFieldEnabled = (id: string) =>
    formConfig.fields.find((f) => f.id === id)?.enabled ?? true;
  const isFieldRequired = (id: string) =>
    formConfig.fields.find((f) => f.id === id)?.required ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation for enabled required fields
    if (isFieldEnabled("patientType")) {
      if (patientType === "ADULT" && isFieldEnabled("fullName") && isFieldRequired("fullName") && !fullName.trim()) {
        setErrorMessage("Please enter the patient's full name.");
        return;
      }
      if (patientType === "CHILD") {
        if (isFieldEnabled("childName") && isFieldRequired("childName") && !childName.trim()) {
          setErrorMessage("Please enter the child's full name.");
          return;
        }
        if (isFieldEnabled("guardianName") && isFieldRequired("guardianName") && !guardianName.trim()) {
          setErrorMessage("Please enter the parent or guardian name.");
          return;
        }
      }
    } else if (isFieldEnabled("fullName") && isFieldRequired("fullName") && !fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (isFieldEnabled("mobileNumber") && isFieldRequired("mobileNumber")) {
      const cleanPhone = mobileNumber.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    if (isFieldEnabled("email") && isFieldRequired("email") && !email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    // Validate required custom fields
    for (const field of formConfig.fields.filter((f) => f.isCustom && f.enabled && f.required)) {
      if (!customFields[field.id] || customFields[field.id] === "") {
        setErrorMessage(`Please complete the required field: ${field.label}`);
        return;
      }
    }

    if (isFieldEnabled("consentAgreed") && isFieldRequired("consentAgreed") && !consentAgreed) {
      setErrorMessage("Please agree to the contact consent to submit your request.");
      return;
    }

    setIsSubmitting(true);

    try {
      const patientDisplayName = (
        patientType === "CHILD" && isFieldEnabled("childName")
          ? childName.trim()
          : fullName.trim()
      ) || "Valued Patient";
      const nameParts = patientDisplayName.split(/\s+/).filter(Boolean);
      const fName = nameParts[0] || patientDisplayName;
      const lName = nameParts.slice(1).join(" ") || "";

      // Append custom fields to clinical notes
      let compiledNotes = notes.trim();
      const customEntries = Object.entries(customFields);
      if (customEntries.length > 0) {
        const customDetails = customEntries
          .map(([k, v]) => {
            const fieldDef = formConfig.fields.find((f) => f.id === k);
            return `${fieldDef?.label || k}: ${v}`;
          })
          .join(" | ");
        compiledNotes = compiledNotes
          ? `${compiledNotes} [Custom Info: ${customDetails}]`
          : `[Custom Info: ${customDetails}]`;
      }

      const payload = {
        patientType: isFieldEnabled("patientType") ? patientType : "ADULT",
        fullName: patientDisplayName,
        childName:
          patientType === "CHILD" && isFieldEnabled("childName")
            ? childName.trim()
            : undefined,
        guardianName:
          patientType === "CHILD" && isFieldEnabled("guardianName")
            ? guardianName.trim()
            : undefined,
        firstName: fName,
        lastName: lName,
        phone: mobileNumber.trim() || "(555) 000-0000",
        email: email.trim() || undefined,
        preferredDoctor: isFieldEnabled("preferredDoctor") ? preferredDoctor : undefined,
        treatment: isFieldEnabled("treatment") ? treatment : "General Consultation",
        serviceName: isFieldEnabled("treatment") ? treatment : "General Consultation",
        preferredDate: isFieldEnabled("preferredDate") ? preferredDate : tomorrowIso,
        timeRange: isFieldEnabled("timeRange") ? timeRange : "Morning",
        contactMethod: isFieldEnabled("contactMethod") ? contactMethod : "PHONE",
        notes: compiledNotes || undefined,
        reason: isFieldEnabled("treatment") ? treatment : "General Consultation",
        consentAgreed,
        source: contactMethod === "WHATSAPP" ? "WHATSAPP" : "WEB_FORM",
      };

      trackFunnelStep("step_4_review_booking", {
        patientType,
        treatment,
        timeRange,
      });

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create appointment request.");
      }

      setSuccessData({
        id: data.appointment.id,
        patientName: patientDisplayName,
        treatment: isFieldEnabled("treatment") ? treatment : "General Consultation",
        date: isFieldEnabled("preferredDate") ? preferredDate : tomorrowIso,
        timeRange: isFieldEnabled("timeRange") ? timeRange : "Morning",
        contactMethod,
      });

      if (onSuccess) {
        onSuccess(data.appointment.id);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred while booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFullName("");
    setChildName("");
    setGuardianName("");
    setMobileNumber("");
    setEmail("");
    setNotes("");
    setCustomFields({});
    setErrorMessage(null);
  };

  return (
    <div
      id="quick-booking"
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg shadow-emerald-950/5 sm:p-7 ${className}`}
    >
      <AnimatePresence mode="wait">
        {successData ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="space-y-4 text-center"
          >
            {/* Success Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Booking Reference: #{successData.id}
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Appointment Request Received!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{successData.patientName}</strong>. Our clinical coordinators will contact you via{" "}
                <strong>{successData.contactMethod === "WHATSAPP" ? "WhatsApp" : "Phone Call"}</strong> to confirm your slot.
              </p>
            </div>

            {/* Summary Details */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-left space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Service / Treatment:</span>
                <span className="font-semibold text-slate-800">{successData.treatment}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Requested Date:</span>
                <span className="font-semibold text-slate-800">{successData.date}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Time Slot:</span>
                <span className="font-semibold text-slate-800">{successData.timeRange}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Verification Via:</span>
                <span className="font-bold text-[#059669] uppercase tracking-wider text-[11px]">
                  {successData.contactMethod}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={`https://wa.me/918590422464?text=${encodeURIComponent(
                  `Hello VS Dental Clinic, I just submitted an appointment request (Ref: ${successData.id}) for ${successData.treatment} on ${successData.date}. Please confirm my slot.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-md hover:bg-[#20ba59] transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message on WhatsApp with Ref #{successData.id}</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Submit Another Request</span>
              </button>

              <div className="border-t border-slate-100 pt-2 text-center">
                <a
                  href="/admin"
                  className="text-[11px] font-semibold text-brand-primary hover:underline"
                >
                  Staff Portal: View in Admin Dashboard &rarr;
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <form key="booking-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Header with Dynamic Badge and Title */}
            <div className="flex items-start justify-between">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#059669]">
                  {formConfig.headerBadge}
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {formConfig.title}
                </h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#f97316] shadow-xs">
                <Zap className="h-5 w-5 fill-[#f97316]" />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* PATIENT TYPE Segmented Control (if enabled by Admin) */}
            {isFieldEnabled("patientType") && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Patient Type {isFieldRequired("patientType") && <span className="text-red-500">*</span>}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPatientType("ADULT")}
                    className={`flex h-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      patientType === "ADULT"
                        ? "border-2 border-[#10b981] bg-[#f0fdf4] text-[#065f46] shadow-xs"
                        : "border border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Adult Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientType("CHILD")}
                    className={`flex h-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      patientType === "CHILD"
                        ? "border-2 border-[#10b981] bg-[#f0fdf4] text-[#065f46] shadow-xs"
                        : "border border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Child Patient
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Name Inputs based on Patient Type */}
            <AnimatePresence mode="wait">
              {patientType === "ADULT" || !isFieldEnabled("patientType") ? (
                isFieldEnabled("fullName") && (
                  <motion.div
                    key="adult-fields"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Full Name {isFieldRequired("fullName") && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={isFieldRequired("fullName")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Anish Kumar"
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    />
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="child-fields"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {isFieldEnabled("childName") && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Child&apos;s Full Name {isFieldRequired("childName") && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={isFieldRequired("childName")}
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="e.g. Aarav Kumar"
                        className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      />
                    </div>
                  )}

                  {isFieldEnabled("guardianName") && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Parent or Guardian Name {isFieldRequired("guardianName") && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={isFieldRequired("guardianName")}
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="e.g. Sunitha Kumar (Mother)"
                        className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Row: Mobile Number and Email */}
            {(isFieldEnabled("mobileNumber") || isFieldEnabled("email")) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isFieldEnabled("mobileNumber") && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Mobile Number {isFieldRequired("mobileNumber") && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="tel"
                      required={isFieldRequired("mobileNumber")}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    />
                  </div>
                )}

                {isFieldEnabled("email") && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Email {isFieldRequired("email") ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
                    </label>
                    <input
                      type="email"
                      required={isFieldRequired("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Row: Preferred Doctor & Treatment (Dynamic Options from Admin Config) */}
            {(isFieldEnabled("preferredDoctor") || isFieldEnabled("treatment")) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isFieldEnabled("preferredDoctor") && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Preferred Doctor {isFieldRequired("preferredDoctor") ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
                    </label>
                    <select
                      value={preferredDoctor}
                      onChange={(e) => setPreferredDoctor(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 text-xs text-slate-800 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    >
                      {formConfig.doctors.map((doc, idx) => (
                        <option key={idx} value={doc}>
                          {doc}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isFieldEnabled("treatment") && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Treatment or Concern {isFieldRequired("treatment") && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      required={isFieldRequired("treatment")}
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 text-xs text-slate-800 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    >
                      {formConfig.treatments.map((t, idx) => (
                        <option key={idx} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Row: Preferred Date & Preferred Time Range */}
            {(isFieldEnabled("preferredDate") || isFieldEnabled("timeRange")) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isFieldEnabled("preferredDate") && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Preferred Date {isFieldRequired("preferredDate") && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required={isFieldRequired("preferredDate")}
                        min={tomorrowIso}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {isFieldEnabled("timeRange") && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Preferred Time Range {isFieldRequired("timeRange") && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 text-xs text-slate-800 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    >
                      {formConfig.timeSlots.map((slot, idx) => (
                        <option key={idx} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Preferred Contact Method */}
            {isFieldEnabled("contactMethod") && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Preferred Contact Method {isFieldRequired("contactMethod") && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-6 text-xs text-slate-700">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="PHONE"
                      checked={contactMethod === "PHONE"}
                      onChange={() => setContactMethod("PHONE")}
                      className="h-4 w-4 text-[#10b981] border-slate-300 focus:ring-[#10b981]"
                    />
                    <span>Phone Call</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="WHATSAPP"
                      checked={contactMethod === "WHATSAPP"}
                      onChange={() => setContactMethod("WHATSAPP")}
                      className="h-4 w-4 text-[#10b981] border-slate-300 focus:ring-[#10b981]"
                    />
                    <span>WhatsApp</span>
                  </label>
                </div>
              </div>
            )}

            {/* Dynamic Custom Fields added by Admin */}
            {formConfig.fields
              .filter((f) => f.isCustom && f.enabled)
              .map((customField) => (
                <div key={customField.id} className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {customField.label}{" "}
                    {customField.required ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    )}
                  </label>

                  {customField.type === "select" && customField.options ? (
                    <select
                      required={customField.required}
                      value={customFields[customField.id] || ""}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          [customField.id]: e.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 text-xs text-slate-800 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    >
                      <option value="">Select an option...</option>
                      {customField.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : customField.type === "textarea" ? (
                    <textarea
                      rows={2}
                      required={customField.required}
                      placeholder={customField.placeholder}
                      value={customFields[customField.id] || ""}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          [customField.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                    />
                  ) : customField.type === "checkbox" ? (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required={customField.required}
                        checked={Boolean(customFields[customField.id])}
                        onChange={(e) =>
                          setCustomFields((prev) => ({
                            ...prev,
                            [customField.id]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded text-[#10b981] border-slate-300 focus:ring-[#10b981]"
                      />
                      <span className="text-xs text-slate-700">
                        {customField.placeholder || "Yes"}
                      </span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      required={customField.required}
                      placeholder={customField.placeholder}
                      value={customFields[customField.id] || ""}
                      onChange={(e) =>
                        setCustomFields((prev) => ({
                          ...prev,
                          [customField.id]: e.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/50 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    />
                  )}
                </div>
              ))}

            {/* Notes / Symptoms */}
            {isFieldEnabled("notes") && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Notes / Symptoms {isFieldRequired("notes") ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
                </label>
                <textarea
                  rows={2}
                  required={isFieldRequired("notes")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your concern or symptoms..."
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#10b981] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                />
              </div>
            )}

            {/* Consent Checkbox */}
            {isFieldEnabled("consentAgreed") && (
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required={isFieldRequired("consentAgreed")}
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#10b981] border-slate-300 focus:ring-[#10b981]"
                  />
                  <span className="text-[11px] leading-snug text-slate-600">
                    I agree to be contacted by {clinicName} regarding my appointment request.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button (Custom Book Now style matching image) */}
            <div className="pt-2">
              <BookNowButton
                type="submit"
                disabled={isSubmitting}
                text={
                  isSubmitting
                    ? "Submitting Request..."
                    : formConfig.submitButtonText || "Submit Appointment Request"
                }
                size="lg"
                fullWidth
              />
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
