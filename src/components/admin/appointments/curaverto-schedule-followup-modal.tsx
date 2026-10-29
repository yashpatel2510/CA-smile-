"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, CalendarCheck, Loader2, Check } from "lucide-react";
import { getTodayDateString } from "@/lib/booking-time-utils";

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
    phone?: string;
    doctorName?: string;
    service?: string;
    age?: string;
    gender?: string;
  } | null;
  onBooked?: (newAppointment: any, originalAppointmentId: string) => void;
}

const PAGE_1_SLOTS = [
  "9:00 AM", "9:15 AM", "9:30 AM", "9:45 AM",
  "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
  "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
  "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
];

const PAGE_2_SLOTS = [
  "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM",
  "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM",
  "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
  "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM",
];

const PAGE_3_SLOTS = [
  "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM",
  "6:00 PM", "6:15 PM", "6:30 PM", "6:45 PM",
];

const SLOTS_BY_PAGE = [PAGE_1_SLOTS, PAGE_2_SLOTS, PAGE_3_SLOTS];

export function CuravertoScheduleFollowUpModal({
  isOpen,
  onClose,
  appointment,
  onBooked,
}: ScheduleFollowUpModalProps) {
  // Default follow-up date to +7 days from today
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [date, setDate] = useState(getDefaultDate());
  const [selectedSlot, setSelectedSlot] = useState<string>("4:00 PM");
  const [page, setPage] = useState<number>(2); // Default to afternoon page or 1
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(getDefaultDate());
      setSelectedSlot("4:00 PM");
      setPage(2);
      setErrorMsg("");
      setSuccessMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  // Format date to DD/MM/YYYY for display
  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  const currentSlots = SLOTS_BY_PAGE[page - 1] || [];

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setErrorMsg("");
  };

  const handleBookFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot.");
      return;
    }
    if (!date) {
      setErrorMsg("Please choose a valid follow-up date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Parse slot time (e.g. "4:00 PM")
      const timeMatch = selectedSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = 16;
      let minutes = 0;
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
      }

      const dateObj = new Date(
        `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
      );
      const startTimeIso = !isNaN(dateObj.getTime())
        ? dateObj.toISOString()
        : new Date().toISOString();

      const serviceTitle = appointment.service
        ? `Follow-up: ${appointment.service.replace(/^Follow-up:\s*/i, "")}`
        : "Follow-up Consultation";

      // 1. Create the new Follow-Up appointment on that date & slot
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: appointment.patientName,
          phone: appointment.phone || "0000000000",
          patientId:
            appointment.patientId &&
            !appointment.patientId.startsWith("#") &&
            !appointment.patientId.startsWith("p")
              ? appointment.patientId
              : undefined,
          preferredDoctor: appointment.doctorName || "Dr. Deep Arvindbhai Patel",
          serviceName: serviceTitle,
          treatment: serviceTitle,
          preferredDate: date,
          startTime: startTimeIso,
          source: "ADMIN",
          status: "CONFIRMED",
          consentAgreed: true,
          notes: `Follow-up scheduled from appointment #${appointment.id}`,
        }),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok || resData?.success === false) {
        throw new Error(
          resData?.message || resData?.error || "Failed to schedule follow-up appointment."
        );
      }

      // 2. Also update current appointment status to "Follow-up"
      await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FOLLOW_UP" }),
      }).catch(() => {});

      setSuccessMsg("Follow-up appointment booked successfully!");

      const createdAppointment = resData.data || {
        id: `fu-${Date.now()}`,
        patientName: appointment.patientName,
        patientId: appointment.patientId,
        phone: appointment.phone,
        time: selectedSlot,
        date: date,
        doctorName: appointment.doctorName || "Dr. Deep Arvindbhai Patel",
        service: serviceTitle,
        status: "Confirmed",
        tag: "FOLLOW-UP",
      };

      if (onBooked) {
        onBooked(createdAppointment, appointment.id);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Error scheduling follow-up:", err);
      setErrorMsg(err.message || "Failed to schedule follow-up. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-emerald-600 shrink-0">
              <CalendarIcon className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                Schedule Follow-Up
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {appointment.patientName} {appointment.patientId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleBookFollowUp} className="mt-5 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Follow-up Date Field */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              FOLLOW-UP DATE
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs hover:border-slate-300 focus-within:border-slate-800 transition-colors">
              <span className="text-xs font-semibold text-slate-800 flex-1">
                {formatDisplayDate(date)}
              </span>
              <CalendarIcon className="h-4 w-4 text-slate-500 shrink-0" />
              <input
                type="date"
                min={getTodayDateString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                required
              />
            </div>
          </div>

          {/* Available Slots Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                AVAILABLE SLOTS
              </label>
              {selectedSlot && (
                <span className="text-[11px] font-bold text-slate-700">
                  Selected: <span className="text-slate-900 font-extrabold">{selectedSlot}</span>
                </span>
              )}
            </div>

            {/* 4-Column Grid of 15-min Slots */}
            <div className="grid grid-cols-4 gap-2">
              {currentSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`rounded-lg py-2 px-1 text-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border border-slate-900 bg-slate-900 font-bold text-white shadow-2xs scale-[1.02]"
                        : "border border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="mt-3.5 flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ← Prev
              </button>
              <span className="font-semibold text-slate-500">{page} / 3</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(3, p + 1))}
                disabled={page === 3}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlot}
              className="w-1/2 rounded-xl bg-slate-800 hover:bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4" />
                  <span>Book Follow-Up</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
