"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, Calendar as CalendarIcon, ChevronDown, Loader2, Check } from "lucide-react";
import { getTodayDateString } from "@/lib/booking-time-utils";

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
}

const DEFAULT_DOCTORS: DoctorOption[] = [
  { id: "doc-1", name: "Dr. Deep Arvindbhai Patel", specialty: "Dental Surgeon" },
];

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
    time: string;
    date?: string;
    doctorName?: string;
    service?: string;
    phone?: string;
  } | null;
  onRescheduled?: (
    appointmentId: string,
    newDate: string,
    newTime: string,
    doctor: string
  ) => void;
}

const PAGE_1_SLOTS = [
  "9:15 AM", "9:30 AM", "9:45 AM", "10:00 AM",
  "10:15 AM", "10:30 AM", "10:45 AM", "11:00 AM",
  "11:15 AM", "11:30 AM", "11:45 AM", "12:00 PM",
  "12:15 PM", "12:30 PM", "12:45 PM", "1:00 PM",
];

const PAGE_2_SLOTS = [
  "1:15 PM", "1:30 PM", "1:45 PM", "2:00 PM",
  "2:15 PM", "2:30 PM", "2:45 PM", "3:00 PM",
  "3:15 PM", "3:30 PM", "3:45 PM", "4:00 PM",
  "4:15 PM", "4:30 PM", "4:45 PM", "5:00 PM",
];

const PAGE_3_SLOTS = [
  "5:15 PM", "5:30 PM", "5:45 PM", "6:00 PM",
  "6:15 PM", "6:30 PM", "6:45 PM", "7:00 PM",
];

const SLOTS_BY_PAGE = [PAGE_1_SLOTS, PAGE_2_SLOTS, PAGE_3_SLOTS];

export function CuravertoRescheduleAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onRescheduled,
}: RescheduleAppointmentModalProps) {
  // Default tomorrow's date
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Deep Arvindbhai Patel");
  const [doctorsList, setDoctorsList] = useState<DoctorOption[]>(DEFAULT_DOCTORS);
  const [date, setDate] = useState(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState<string>("10:00 AM");
  const [page, setPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isOpen || !appointment) return;

    setDate(getTomorrowDate());
    const initialSlot = appointment.time || "10:00 AM";
    setSelectedSlot(initialSlot);
    const pageIndex = SLOTS_BY_PAGE.findIndex((slots) => slots.includes(initialSlot));
    setPage(pageIndex !== -1 ? pageIndex + 1 : 1);
    setErrorMsg("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(false);

    // Fetch registered doctors from Setup
    fetch("/api/admin/setup/doctors")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const docs = res.data.map((d: any) => ({
            id: d.id || `doc-${d.name}`,
            name: d.name,
            specialty: d.specialty || d.department || d.postGraduateSpecialization || "Dental Surgeon",
          }));
          setDoctorsList(docs);

          // Match doctor or select primary setup doctor
          const currentDoc = (appointment.doctorName || "").toLowerCase();
          const matched = docs.find((d: any) => d.name.toLowerCase() === currentDoc);
          if (matched) {
            setSelectedDoctor(matched.name);
          } else {
            setSelectedDoctor(docs[0].name);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  // Format date to DD/MM/YYYY for display (matching screenshot "28/10/2026")
  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  const currentSlots = SLOTS_BY_PAGE[page - 1] || [];

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot.");
      return;
    }
    if (!date) {
      setErrorMsg("Please select a valid reschedule date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Parse slot time (e.g. "9:15 AM", "4:00 PM")
      const timeMatch = selectedSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = 10;
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
      const endTimeIso = new Date(dateObj.getTime() + 30 * 60000).toISOString();

      // Call reschedule endpoint
      let res = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: startTimeIso,
          endTime: endTimeIso,
          preferredDoctor: selectedDoctor,
          reason: "Patient requested rescheduled appointment time",
          performedBy: "Clinic Admin",
        }),
      });

      // Fallback to PATCH if reschedule endpoint returned non-200
      if (!res.ok) {
        res = await fetch(`/api/appointments/${appointment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: startTimeIso,
            endTime: endTimeIso,
            preferredDoctor: selectedDoctor,
            preferredDate: date,
            status: "RESCHEDULED",
            notes: `Rescheduled to ${date} ${selectedSlot}`,
          }),
        });
      }

      // Also ensure status is set to PENDING (booked) for the new rescheduled date/time
      await fetch(`/api/appointments/${appointment.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PENDING",
          performedBy: "Clinic Admin",
          forceOverride: true,
        }),
      }).catch(() => {});

      setSuccessMsg("Appointment successfully rescheduled!");

      if (onRescheduled) {
        onRescheduled(appointment.id, date, selectedSlot, selectedDoctor);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Error rescheduling appointment:", err);
      setErrorMsg(err.message || "Failed to reschedule appointment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const currentDateDisplay = appointment.date || getTodayDateString();

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header (matches screenshot: blue clock icon, Reschedule Appointment title, X button) */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="text-blue-500 shrink-0">
              <Clock className="h-5 w-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
              Reschedule Appointment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Patient Summary Card (matches screenshot light gray box) */}
        <div className="rounded-xl bg-slate-50 border border-slate-100/90 p-3.5 my-3.5 text-xs">
          <div className="font-bold text-slate-900 text-sm">
            {appointment.patientName}
          </div>
          <div className="text-slate-500 font-medium mt-0.5 text-xs">
            Currently {appointment.time} on {currentDateDisplay} · {appointment.doctorName || selectedDoctor}
          </div>
        </div>

        <form onSubmit={handleReschedule} className="space-y-4">
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

          {/* Doctor Field */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Doctor
            </label>
            <div className="relative">
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden shadow-2xs pr-9 cursor-pointer"
              >
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} {doc.specialty ? `(${doc.specialty})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* New Date Field */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              New Date
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs hover:border-slate-300 focus-within:border-blue-500 transition-colors">
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
              <label className="text-xs font-semibold text-slate-700 block">
                Available Slots
              </label>
              {selectedSlot && (
                <span className="text-[11px] font-bold text-blue-600">
                  Selected: {selectedSlot}
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
                    onClick={() => {
                      setSelectedSlot(slot);
                      setErrorMsg("");
                    }}
                    className={`rounded-lg py-2 px-1 text-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border border-blue-600 bg-blue-600 font-bold text-white shadow-2xs scale-[1.02]"
                        : "border border-slate-200 bg-white font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
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

          {/* Action Buttons (matches screenshot: white Cancel button and soft blue Reschedule button) */}
          <div className="mt-6 flex items-center justify-between gap-3 pt-1">
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
              className={`w-1/2 rounded-xl py-2.5 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                selectedSlot
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
                  : "bg-blue-300 opacity-60 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Reschedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
