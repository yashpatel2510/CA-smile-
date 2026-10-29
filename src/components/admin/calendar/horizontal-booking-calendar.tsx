"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface BookingCalendarItem {
  rawDate?: string; // YYYY-MM-DD
  startTime?: string; // ISO string or datetime
  date?: string;
  status: string;
}

export interface HorizontalBookingCalendarProps {
  /**
   * The currently selected ISO date string (YYYY-MM-DD), or null if "All Dates" is selected.
   */
  selectedDate: string | null;
  /**
   * Callback fired when a date card is selected, or null when "All Dates" is clicked.
   */
  onSelectDate: (dateStr: string | null) => void;
  /**
   * List of appointments used to automatically compute pending and confirmed booking counts.
   */
  appointments?: BookingCalendarItem[];
  /**
   * Optional manual precomputed counts map by ISO date (YYYY-MM-DD).
   */
  dateCounts?: Record<
    string,
    { pending: number; confirmed: number; total?: number }
  >;
  /**
   * Optional title override (default: "Horizontal calendar")
   */
  title?: string;
  /**
   * Optional subtitle override
   */
  subtitle?: string;
  /**
   * Whether to show the "All Dates" view button (default: true)
   */
  allowAllDates?: boolean;
  /**
   * Additional wrapper class name
   */
  className?: string;
}

/**
 * Realistic Horizontal Calendar Component
 * Designed specifically for clinic receptionists & booking desks.
 * Features:
 * - 7-day realistic tactile cards with smooth elevation and realistic border/shadow.
 * - Selected date turns solid deep black (bg-black / bg-zinc-950) with high contrast text.
 * - Real pending and confirmed booking counts badge inside every calendar day box.
 * - Week navigation (< Prev, Next >), Today quick jump, and native Date Picker jump.
 * - "All Dates" view toggle for comprehensive schedule oversight.
 */
export function HorizontalBookingCalendar({
  selectedDate,
  onSelectDate,
  appointments = [],
  dateCounts,
  title = "Horizontal calendar",
  subtitle = "Live schedule overview with pending & confirmed booking counts. Click any day to filter.",
  allowAllDates = true,
  className = "",
}: HorizontalBookingCalendarProps) {
  // Anchor date represents the first day of the currently viewed 7-day week
  const [anchorDate, setAnchorDate] = useState<Date>(() => {
    if (selectedDate) {
      const parsed = new Date(`${selectedDate}T00:00:00`);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const todayIso = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Compute 7 days from anchorDate
  const weekDays = useMemo(() => {
    const days = [];
    const base = new Date(anchorDate);
    base.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const current = new Date(base);
      current.setDate(base.getDate() + i);

      const year = current.getFullYear();
      const monthNum = String(current.getMonth() + 1).padStart(2, "0");
      const dayNum = String(current.getDate()).padStart(2, "0");
      const isoDateString = `${year}-${monthNum}-${dayNum}`;

      const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = current.toLocaleDateString("en-US", { month: "short" });
      const dayNumber = current.getDate();

      // Compute counts for this date
      let pendingCount = 0;
      let confirmedCount = 0;

      if (dateCounts && dateCounts[isoDateString]) {
        pendingCount = dateCounts[isoDateString].pending || 0;
        confirmedCount = dateCounts[isoDateString].confirmed || 0;
      } else {
        // Compute from appointments array
        for (const apt of appointments) {
          let aptIso = apt.rawDate;
          if (!aptIso && apt.startTime) {
            try {
              aptIso = new Date(apt.startTime).toISOString().split("T")[0];
            } catch {
              aptIso = "";
            }
          }
          if (aptIso === isoDateString) {
            const st = (apt.status || "").toUpperCase();
            if (st === "PENDING") {
              pendingCount++;
            } else if (
              st === "CONFIRMED" ||
              st === "CHECKED_IN" ||
              st === "TREATMENT_STARTED" ||
              st === "COMPLETED" ||
              st === "TREATMENT_DONE"
            ) {
              confirmedCount++;
            }
          }
        }
      }

      const isToday = isoDateString === todayIso;
      const isSelected = selectedDate === isoDateString;

      days.push({
        date: current,
        dayName,
        monthName,
        dayNumber,
        isoDateString,
        pendingCount,
        confirmedCount,
        totalBookings: pendingCount + confirmedCount,
        isToday,
        isSelected,
      });
    }
    return days;
  }, [anchorDate, appointments, dateCounts, selectedDate, todayIso]);

  // Month & year label for current window
  const currentWindowMonthYear = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0].date;
    const last = weekDays[weekDays.length - 1].date;
    const firstMonth = first.toLocaleDateString("en-US", { month: "short" });
    const lastMonth = last.toLocaleDateString("en-US", { month: "short" });
    const year = first.getFullYear();
    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    }
    return `${firstMonth} – ${lastMonth} ${year}`;
  }, [weekDays]);

  const handlePrevWeek = () => {
    setAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleJumpToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setAnchorDate(today);
    onSelectDate(todayIso);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const d = new Date(`${val}T00:00:00`);
      if (!isNaN(d.getTime())) {
        setAnchorDate(d);
        onSelectDate(val);
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: Title, Date Window, Navigation & Today Jump       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900">
              {title}
            </h2>
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
              {currentWindowMonthYear}
            </span>
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
          )}
        </div>

        {/* Controls Bar: Navigation, Today Button, All Dates, Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {allowAllDates && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                selectedDate === null
                  ? "bg-stone-900 text-white shadow-xs"
                  : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
              title="Show all bookings regardless of date"
            >
              All Dates
            </button>
          )}

          <button
            type="button"
            onClick={handleJumpToToday}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              selectedDate === todayIso
                ? "bg-teal-600 text-white shadow-xs"
                : "border border-teal-200 bg-teal-50/70 text-teal-800 hover:bg-teal-100"
            }`}
          >
            Today
          </button>

          {/* Previous & Next Week Arrows */}
          <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="rounded-md p-1 text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-xs transition-colors"
              title="Previous 7 Days"
              aria-label="Previous 7 Days"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="rounded-md p-1 text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-xs transition-colors"
              title="Next 7 Days"
              aria-label="Next 7 Days"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Date Picker jump */}
          <label className="relative flex items-center justify-center rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-50 cursor-pointer shadow-xs" title="Jump to specific date">
            <CalendarIcon className="h-4 w-4 text-stone-500" />
            <input
              type="date"
              value={selectedDate || ""}
              onChange={handleCustomDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HORIZONTAL CALENDAR ROW: 7 Realistic Tactile Date Boxes       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3">
        {weekDays.map((day) => {
          const isSelected = day.isSelected;

          return (
            <button
              key={day.isoDateString}
              type="button"
              onClick={() => onSelectDate(day.isoDateString)}
              className={`group relative flex flex-col items-center justify-between rounded-xl p-3 text-center transition-all duration-200 select-none ${
                isSelected
                  ? "bg-black text-white shadow-lg ring-2 ring-black shadow-black/25 transform scale-[1.02] border-transparent"
                  : "bg-white text-stone-800 border border-stone-200/90 shadow-xs hover:border-stone-400 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {/* "TODAY" micro badge indicator */}
              {day.isToday && (
                <span
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.2 text-[9px] font-black uppercase tracking-wider ${
                    isSelected
                      ? "bg-teal-400 text-stone-950 shadow-xs"
                      : "bg-teal-600 text-white shadow-xs"
                  }`}
                >
                  Today
                </span>
              )}

              {/* Day Name (Wed, Thu, Fri, etc.) */}
              <div
                className={`text-xs font-semibold tracking-wide uppercase transition-colors ${
                  isSelected ? "text-stone-300" : "text-stone-500 group-hover:text-stone-700"
                }`}
              >
                {day.dayName}
              </div>

              {/* Day Number (Big Bold: 7, 8, 9, etc.) */}
              <div className="my-1 flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors ${
                    isSelected ? "text-white" : "text-stone-900"
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span
                  className={`text-[10px] font-medium uppercase ${
                    isSelected ? "text-stone-400" : "text-stone-400"
                  }`}
                >
                  {day.monthName}
                </span>
              </div>

              {/* --------------------------------------------------------- */}
              {/* PENDING & CONFIRMED BOOKING COUNTS INSIDE CALENDAR BOX    */}
              {/* --------------------------------------------------------- */}
              <div className="w-full mt-1.5 flex flex-col gap-1">
                {/* Pending Bookings Pill */}
                <div
                  className={`flex items-center justify-between rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                    isSelected
                      ? day.pendingCount > 0
                        ? "bg-amber-400/25 text-amber-300 border border-amber-400/30"
                        : "bg-stone-900/80 text-stone-500"
                      : day.pendingCount > 0
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-stone-50 text-stone-400 border border-stone-100"
                  }`}
                  title={`${day.pendingCount} pending booking(s)`}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    <span>Pending</span>
                  </span>
                  <span
                    className={`font-bold ${
                      day.pendingCount > 0
                        ? isSelected
                          ? "text-amber-200"
                          : "text-amber-900"
                        : "opacity-60"
                    }`}
                  >
                    {day.pendingCount}
                  </span>
                </div>

                {/* Confirmed Bookings Pill */}
                <div
                  className={`flex items-center justify-between rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                    isSelected
                      ? day.confirmedCount > 0
                        ? "bg-emerald-400/25 text-emerald-300 border border-emerald-400/30"
                        : "bg-stone-900/80 text-stone-500"
                      : day.confirmedCount > 0
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-stone-50 text-stone-400 border border-stone-100"
                  }`}
                  title={`${day.confirmedCount} confirmed booking(s)`}
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                    <span>Confirmed</span>
                  </span>
                  <span
                    className={`font-bold ${
                      day.confirmedCount > 0
                        ? isSelected
                          ? "text-emerald-200"
                          : "text-emerald-900"
                        : "opacity-60"
                    }`}
                  >
                    {day.confirmedCount}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint for receptionist */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 pt-2.5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
            <span className="text-stone-600 font-medium">Pending: Action Required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-stone-600 font-medium">Confirmed: Scheduled</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-black inline-block" />
            <span className="text-stone-600 font-medium">Black Card: Active Filter</span>
          </span>
        </div>

        {selectedDate && (
          <div className="font-semibold text-stone-700">
            Filtering:{" "}
            <span className="text-black underline underline-offset-2">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
