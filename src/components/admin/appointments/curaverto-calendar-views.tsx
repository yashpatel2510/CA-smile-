"use client";

import React from "react";
import { Plus, CalendarDays } from "lucide-react";

export interface CalendarAppointmentItem {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  age: string;
  phone: string;
  service: string;
  status: string;
  doctorName?: string;
}

interface CalendarViewsProps {
  appointments?: CalendarAppointmentItem[];
  selectedDate?: string;
  onBookClick?: () => void;
  onQuickBillClick?: () => void;
}

export function CuravertoCalendarViews({
  appointments = [],
  selectedDate,
  onBookClick,
  onQuickBillClick,
}: CalendarViewsProps) {
  // Parse date dynamically from selectedDate or today
  const targetDate = selectedDate ? new Date(selectedDate) : new Date();
  const dayAbbr = targetDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dayNum = targetDate.getDate();
  const fullDateStr = targetDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mt-5 space-y-4">
      {/* =================================================================== */}
      {/* SCHEDULE AGENDA VIEW                                                */}
      {/* =================================================================== */}
      <div className="space-y-4">
        {/* Dynamic Card: Reflects current selected date */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          {/* Header: Date Badge + Title + + Book button */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 px-6">
            <div className="flex items-center gap-3.5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 shadow-2xs min-w-[48px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {dayAbbr}
                </span>
                <span className="text-base font-bold text-slate-900">{dayNum}</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {fullDateStr}
                </h3>
                <span className="text-xs text-slate-400">
                  {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"}
                </span>
              </div>
            </div>

            {/* + Book Button */}
            <button
              type="button"
              onClick={onBookClick}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Book</span>
            </button>
          </div>

          {/* Doctor Section Header Strip */}
          <div className="flex items-center justify-between bg-indigo-50/40 px-6 py-2.5 border-b border-indigo-100/50">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span className="font-bold text-xs text-indigo-900">
                Dr. Deep Arvindbhai Patel
              </span>
              <span className="text-xs text-slate-400">· Dental Surgeon</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {appointments.length} {appointments.length === 1 ? "patient" : "patients"}
            </span>
          </div>

          {/* Appointment Rows */}
          <div className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2.5">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-700">
                  No Appointments Scheduled
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  No patients booked for this date. Click below to schedule a patient.
                </p>
                <button
                  type="button"
                  onClick={onBookClick}
                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#047857] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#065f46] transition-all hover:scale-[1.02]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Book Patient</span>
                </button>
              </div>
            ) : (
              appointments.map((appt, idx) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-xs font-bold text-slate-400 w-3 text-center">
                      {idx + 1}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {appt.time}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        <span>{appt.patientName}</span>
                        <span className="text-xs font-normal text-slate-400">
                          {appt.age}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {appt.service}
                      </div>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                      appt.status.toLowerCase() === "follow-up"
                        ? "border-2 border-purple-400 bg-[#7e22ce] text-white shadow-xs"
                        : appt.status.toLowerCase() === "rescheduled"
                        ? "border-2 border-blue-400 bg-[#1e3a8a] text-white shadow-xs"
                        : appt.status.toLowerCase() === "confirmed"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : appt.status.toLowerCase() === "in-clinic"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : appt.status.toLowerCase() === "consulting"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : "border-sky-200 bg-sky-50 text-sky-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        appt.status.toLowerCase() === "follow-up" || appt.status.toLowerCase() === "rescheduled"
                          ? "bg-white"
                          : appt.status.toLowerCase() === "confirmed"
                          ? "bg-emerald-500"
                          : appt.status.toLowerCase() === "in-clinic"
                          ? "bg-amber-500"
                          : appt.status.toLowerCase() === "consulting"
                          ? "bg-purple-500"
                          : "bg-sky-500"
                      }`}
                    />
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Tuesday, October 27, 2026 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="flex items-center justify-between p-4 px-6">
            <div className="flex items-center gap-3.5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  TUE
                </span>
                <span className="text-base font-bold text-slate-900">27</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  October 27, 2026
                </h3>
                <span className="text-xs text-slate-400">0 appointments</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBookClick}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
