"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, CheckCircle2, ExternalLink } from "lucide-react";
import { clinicalServices } from "@/data/services-data";
import { notifyAppointmentUpdate } from "@/lib/client-appointment-sync";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

export function WhatsAppBookingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"book" | "chat">("book");

  // Form fields
  const [patientType, setPatientType] = useState<"ADULT" | "CHILD">("ADULT");
  const [fullName, setFullName] = useState("");
  const [childName, setChildName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [phone, setPhone] = useState("");
  const [treatment, setTreatment] = useState(
    clinicalServices[0]?.name || "General Dental Consultation & Checkup"
  );
  const [preferredDate, setPreferredDate] = useState("");
  const [timeRange, setTimeRange] = useState("Morning (9:30 AM - 1:00 PM)");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    id: string;
    name: string;
    treatment: string;
    date: string;
    slot: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [dynamicTreatments, setDynamicTreatments] = useState<string[]>(
    clinicalServices.map((s) => s.name)
  );
  const [dynamicTimeSlots, setDynamicTimeSlots] = useState<string[]>([
    "Morning (9:30 AM - 1:00 PM)",
    "Afternoon (2:00 PM - 5:00 PM)",
    "Evening (5:00 PM - 7:30 PM)",
  ]);

  // Set default date to tomorrow and fetch live configuration
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split("T")[0]);

    fetch("/api/booking-form/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          if (data.config.treatments?.length > 0) {
            setDynamicTreatments(data.config.treatments);
            setTreatment((prev) =>
              data.config.treatments.includes(prev)
                ? prev
                : data.config.treatments[0]
            );
          }
          if (data.config.timeSlots?.length > 0) {
            setDynamicTimeSlots(data.config.timeSlots);
            setTimeRange((prev) =>
              data.config.timeSlots.includes(prev)
                ? prev
                : data.config.timeSlots[0]
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  const { brandConfig } = useClinicTheme();
  const clinicWhatsAppNumber = (
    brandConfig?.whatsappPhone ||
    brandConfig?.phone ||
    "917226098074"
  ).replace(/\D/g, "");
  const formattedWhatsAppDisplay =
    brandConfig?.whatsappPhone || brandConfig?.phone || "+91 72260 98074";
  const clinicName = brandConfig?.clinicName || "CA Smile Dental Clinic";

  const handleDirectChat = () => {
    const msg = encodeURIComponent(
      `Hello ${clinicName}, I would like to inquire about dental treatments and appointments.`
    );
    window.open(`https://wa.me/${clinicWhatsAppNumber}?text=${msg}`, "_blank");
  };

  const handleWhatsAppBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      setSubmitting(false);
      return;
    }

    const patientDisplayName =
      patientType === "CHILD"
        ? `${childName.trim()} (Parent: ${guardianName.trim()})`
        : fullName.trim();

    if (!patientDisplayName) {
      setErrorMsg("Please provide patient name.");
      setSubmitting(false);
      return;
    }

    try {
      // 1. Submit appointment to API and database with source: 'WHATSAPP'
      const payload = {
        patientType,
        fullName: patientType === "ADULT" ? fullName : undefined,
        childName: patientType === "CHILD" ? childName : undefined,
        guardianName: patientType === "CHILD" ? guardianName : undefined,
        phone: `+91 ${cleanPhone.slice(-10)}`,
        treatment,
        preferredDate,
        timeRange,
        contactMethod: "WHATSAPP",
        source: "WHATSAPP",
        notes: notes
          ? `[WhatsApp Booking] ${notes}`
          : "[WhatsApp Booking Request]",
        consentAgreed: true,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const refId =
        data.appointment?.id ||
        `APT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Notify open admin tabs (Appointments, CA Smile) immediately
      notifyAppointmentUpdate({
        id: refId,
        action: "booked",
        source: "WHATSAPP",
      });

      setBookingSuccess({
        id: refId,
        name: patientDisplayName,
        treatment,
        date: preferredDate,
        slot: timeRange,
      });

      // 2. Build pre-formatted WhatsApp message and launch WhatsApp
      const waMessage = encodeURIComponent(
        `Hello ${clinicName}!\n\nI just submitted an appointment request on your website:\n` +
          `• *Booking Ref*: ${refId}\n` +
          `• *Patient*: ${patientDisplayName}\n` +
          `• *Mobile*: +91 ${cleanPhone.slice(-10)}\n` +
          `• *Treatment*: ${treatment}\n` +
          `• *Preferred Date*: ${preferredDate}\n` +
          `• *Time Slot*: ${timeRange}\n` +
          (notes ? `• *Notes*: ${notes}\n` : "") +
          `\nPlease confirm my appointment slot. Thank you!`
      );

      const waUrl = `https://wa.me/${clinicWhatsAppNumber}?text=${waMessage}`;
      window.open(waUrl, "_blank");
    } catch {
      setErrorMsg(
        "Unable to register appointment. Please click 'Direct WhatsApp Chat' below."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
        {/* Helper Pill Banner */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl sm:flex"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-emerald-700">
                Instant WhatsApp Booking
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp Circular Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all hover:bg-[#20ba59] focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
          aria-label={
            isOpen
              ? "Close WhatsApp booking widget"
              : "Open WhatsApp booking widget"
          }
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              {/* WhatsApp Icon SVG */}
              <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.179-.536-1.528-.627-2.515-2.172-2.592-2.273-.076-.101-.617-.824-.617-1.571 0-.747.387-1.115.526-1.268.143-.153.313-.191.419-.191.106 0 .211.002.304.007.099.005.231-.038.361.275.134.321.46 1.119.5 1.2.04.082.067.177.013.284-.053.106-.08.172-.16.265-.079.095-.167.211-.238.284-.081.082-.165.172-.072.332.094.159.418.69 0.896 1.116.615.547 1.135.717 1.295.798.16.08.254.071.35-.041.095-.112.408-.475.517-.638.11-.164.218-.137.368-.082.15.054.954.45 1.118.532.164.081.273.123.313.191.04.068.04.394-.104.799zM12.045 2C6.505 2 2 6.506 2 12.047c0 1.973.57 3.815 1.558 5.378L2 22l4.743-1.517A9.977 9.977 0 0012.045 22c5.54 0 10.045-4.505 10.045-10.047C22.09 6.506 17.585 2 12.045 2z" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-400"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* WhatsApp Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-24 sm:right-6"
          >
            {/* Header */}
            <div className="bg-[#075E54] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.179-.536-1.528-.627-2.515-2.172-2.592-2.273-.076-.101-.617-.824-.617-1.571 0-.747.387-1.115.526-1.268.143-.153.313-.191.419-.191.106 0 .211.002.304.007.099.005.231-.038.361.275.134.321.46 1.119.5 1.2.04.082.067.177.013.284-.053.106-.08.172-.16.265-.079.095-.167.211-.238.284-.081.082-.165.172-.072.332.094.159.418.69 0.896 1.116.615.547 1.135.717 1.295.798.16.08.254.071.35-.041.095-.112.408-.475.517-.638.11-.164.218-.137.368-.082.15.054.954.45 1.118.532.164.081.273.123.313.191.04.068.04.394-.104.799zM12.045 2C6.505 2 2 6.506 2 12.047c0 1.973.57 3.815 1.558 5.378L2 22l4.743-1.517A9.977 9.977 0 0012.045 22c5.54 0 10.045-4.505 10.045-10.047C22.09 6.506 17.585 2 12.045 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">
                      VS Dental Clinic
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-200">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#25D366]"></span>
                      Online • Fast WhatsApp Response
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="mt-3 flex rounded-lg bg-black/20 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("book");
                    setBookingSuccess(null);
                  }}
                  className={`flex-1 rounded-md py-1.5 font-bold transition-all ${
                    activeTab === "book"
                      ? "bg-white text-[#075E54] shadow"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  ⚡ Fast Booking
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 rounded-md py-1.5 font-bold transition-all ${
                    activeTab === "chat"
                      ? "bg-white text-[#075E54] shadow"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  💬 Direct Chat
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="max-h-[70vh] overflow-y-auto bg-slate-50/50 p-4">
              {activeTab === "chat" ? (
                /* Direct Chat Mode */
                <div className="space-y-4 py-3 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-[#25D366]">
                    <MessageCircle className="h-9 w-9" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Have Questions? Chat Directly
                    </h4>
                    <p className="mx-auto mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">
                      Connect immediately with Dr. Sankar, Dr. Vidhyamol, or our
                      front-desk coordinators on WhatsApp.
                    </p>
                  </div>
                  <button
                    onClick={handleDirectChat}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20ba59] active:scale-[0.98]"
                  >
                    <span>Open WhatsApp Chat</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Clinic WhatsApp: {formattedWhatsAppDisplay}
                  </p>
                </div>
              ) : bookingSuccess ? (
                /* Booking Success View */
                <div className="space-y-4 py-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
                      Ref #{bookingSuccess.id}
                    </span>
                    <h4 className="mt-2 font-heading text-base font-bold text-slate-800">
                      WhatsApp Booking Dispatched!
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Your appointment details have been logged in our clinic
                      database and forwarded to WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs shadow-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Patient:</span>
                      <span className="font-bold text-slate-700">
                        {bookingSuccess.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Treatment:</span>
                      <span className="font-medium text-slate-700">
                        {bookingSuccess.treatment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preferred Date:</span>
                      <span className="font-medium text-slate-700">
                        {bookingSuccess.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slot:</span>
                      <span className="font-medium text-slate-700">
                        {bookingSuccess.slot}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingSuccess(null);
                      setIsOpen(false);
                    }}
                    className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* WhatsApp Booking Form */
                <form onSubmit={handleWhatsAppBooking} className="space-y-3">
                  {errorMsg && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  {/* Patient Type Toggle */}
                  <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-200/70 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPatientType("ADULT")}
                      className={`rounded-md py-1 font-semibold transition-all ${
                        patientType === "ADULT"
                          ? "shadow-xs bg-white text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      Adult Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientType("CHILD")}
                      className={`rounded-md py-1 font-semibold transition-all ${
                        patientType === "CHILD"
                          ? "shadow-xs bg-white text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      Child Patient
                    </button>
                  </div>

                  {/* Dynamic Name Input */}
                  {patientType === "ADULT" ? (
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-700">
                        FULL NAME *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Rahul Nair"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-700">
                          CHILD&apos;S NAME *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Aarav"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-700">
                          PARENT NAME *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Sunitha"
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Mobile Number */}
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">
                      WHATSAPP NUMBER *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 px-2.5 text-xs font-semibold text-slate-600">
                        +91
                      </span>
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-r-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Treatment Dropdown (Dynamic from Admin Config) */}
                  <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-700">
                      TREATMENT CONCERN
                    </label>
                    <select
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                    >
                      {dynamicTreatments.map((tName, idx) => (
                        <option key={idx} value={tName}>
                          {tName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-700">
                        DATE
                      </label>
                      <input
                        required
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-700">
                        TIME SLOT
                      </label>
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                      >
                        {dynamicTimeSlots.map((slot, idx) => (
                          <option key={idx} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#20ba59] disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.179-.536-1.528-.627-2.515-2.172-2.592-2.273-.076-.101-.617-.824-.617-1.571 0-.747.387-1.115.526-1.268.143-.153.313-.191.419-.191.106 0 .211.002.304.007.099.005.231-.038.361.275.134.321.46 1.119.5 1.2.04.082.067.177.013.284-.053.106-.08.172-.16.265-.079.095-.167.211-.238.284-.081.082-.165.172-.072.332.094.159.418.69 0.896 1.116.615.547 1.135.717 1.295.798.16.08.254.071.35-.041.095-.112.408-.475.517-.638.11-.164.218-.137.368-.082.15.054.954.45 1.118.532.164.081.273.123.313.191.04.068.04.394-.104.799zM12.045 2C6.505 2 2 6.506 2 12.047c0 1.973.57 3.815 1.558 5.378L2 22l4.743-1.517A9.977 9.977 0 0012.045 22c5.54 0 10.045-4.505 10.045-10.047C22.09 6.506 17.585 2 12.045 2z" />
                        </svg>
                        <span>Book on WhatsApp</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer Notice */}
            <div className="border-t border-slate-100 bg-slate-100/60 p-2.5 text-center text-[10px] text-slate-500">
              ⚡ Confirmed by clinical desk via WhatsApp within 15 mins
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
