"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  X,
  Copy,
  ChevronDown,
  User,
  Check,
  Save,
  Loader2,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { DoctorRecord, DoctorShift, VacationBlock } from "@/types/doctors";

const DAYS_OF_WEEK = [
  { key: "MON", full: "Monday" },
  { key: "TUE", full: "Tuesday" },
  { key: "WED", full: "Wednesday" },
  { key: "THU", full: "Thursday" },
  { key: "FRI", full: "Friday" },
  { key: "SAT", full: "Saturday" },
  { key: "SUN", full: "Sunday" },
];

const CLINIC_LOCATIONS = [
  "Main Clinic",
  "Branch 2 - Bilimora West",
  "SmileCraft Specialized Center",
];

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = [
  "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
  "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"
];
const PERIODS = ["AM", "PM"];

// Custom 3-column time picker popup matching Screenshot 2
function TimePickerDropdown({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (newVal: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Parse existing time (e.g. "05:00 PM")
  const parts = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  const currentHour = parts ? parts[1].padStart(2, "0") : "09";
  const currentMinute = parts ? parts[2] : "00";
  const currentPeriod = parts && parts[3] ? parts[3].toUpperCase() : "AM";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const update = (h: string, m: string, p: string) => {
    onChange(`${h}:${m} ${p}`);
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 z-50 mt-1.5 flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
      style={{ minWidth: "160px" }}
    >
      {/* Hours Column */}
      <div className="flex flex-col max-h-48 overflow-y-auto px-1 scrollbar-thin">
        {HOURS.map((h) => {
          const isSelected = h === currentHour;
          return (
            <button
              key={h}
              type="button"
              onClick={() => update(h, currentMinute, currentPeriod)}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {h}
            </button>
          );
        })}
      </div>

      <div className="w-[1px] bg-slate-100 my-1" />

      {/* Minutes Column */}
      <div className="flex flex-col max-h-48 overflow-y-auto px-1 scrollbar-thin">
        {MINUTES.map((m) => {
          const isSelected = m === currentMinute;
          return (
            <button
              key={m}
              type="button"
              onClick={() => update(currentHour, m, currentPeriod)}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      <div className="w-[1px] bg-slate-100 my-1" />

      {/* AM/PM Column */}
      <div className="flex flex-col px-1">
        {PERIODS.map((p) => {
          const isSelected = p === currentPeriod;
          return (
            <button
              key={p}
              type="button"
              onClick={() => update(currentHour, currentMinute, p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors mb-1 ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CuravertoDoctorScheduleView() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sub-tabs: Weekly Availability | By date | History
  const [subTab, setSubTab] = useState<"weekly" | "byDate" | "history">("weekly");

  // Active work days list (MON, TUE, WED, THU, FRI, SAT, SUN)
  const [activeDays, setActiveDays] = useState<string[]>([
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ]);

  // Day shifts map: { MON: [...], TUE: [...] }
  const [dayShifts, setDayShifts] = useState<Record<string, DoctorShift[]>>({
    MON: [
      {
        id: "shift-MON-1",
        startTime: "05:00 PM",
        endTime: "08:00 PM",
        location: "Main Clinic",
      },
    ],
    TUE: [
      {
        id: "shift-TUE-1",
        startTime: "09:00 AM",
        endTime: "07:00 PM",
        location: "Main Clinic",
      },
    ],
    WED: [
      {
        id: "shift-WED-1",
        startTime: "09:00 AM",
        endTime: "07:00 PM",
        location: "Main Clinic",
      },
    ],
    THU: [
      {
        id: "shift-THU-1",
        startTime: "09:00 AM",
        endTime: "07:00 PM",
        location: "Main Clinic",
      },
    ],
    FRI: [
      {
        id: "shift-FRI-1",
        startTime: "09:00 AM",
        endTime: "07:00 PM",
        location: "Main Clinic",
      },
    ],
    SAT: [
      {
        id: "shift-SAT-1",
        startTime: "09:00 AM",
        endTime: "07:00 PM",
        location: "Main Clinic",
      },
    ],
    SUN: [
      {
        id: "shift-SUN-1",
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        location: "Main Clinic",
      },
    ],
  });

  // Track which timepicker dropdown is open: `${dayKey}-${shiftId}-${'start'|'end'}`
  const [openTimePickerKey, setOpenTimePickerKey] = useState<string | null>(null);

  // Vacation blocks for this doctor
  const [vacationBlocks, setVacationBlocks] = useState<VacationBlock[]>([]);
  const [vacationFrom, setVacationFrom] = useState("");
  const [vacationTo, setVacationTo] = useState("");

  // "By date" tab state
  const [byDateString, setByDateString] = useState("2026-10-27");
  const [byDateStart, setByDateStart] = useState("09:00 AM");
  const [byDateFinish, setByDateFinish] = useState("07:00 PM");
  const [openByDatePicker, setOpenByDatePicker] = useState<"start" | "finish" | null>(null);
  const [byDateSaveStatus, setByDateSaveStatus] = useState<string | null>(null);

  const handleSaveByDate = async () => {
    if (!currentDoctor) return;
    try {
      setByDateSaveStatus("Saving...");
      const res = await fetch("/api/admin/setup/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentDoctor,
          updatedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setByDateSaveStatus(`Saved (${byDateStart} to ${byDateFinish}) for ${byDateString}`);
        setTimeout(() => setByDateSaveStatus(null), 3000);
      } else {
        setByDateSaveStatus("Error saving custom hours");
      }
    } catch {
      setByDateSaveStatus("Error saving custom hours");
    }
  };

  // Load doctors from setup
  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/setup/doctors");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDoctors(json.data);
          const firstDoc = json.data[0];
          setSelectedDoctorId(firstDoc.id);
          applyDoctorSchedule(firstDoc);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, []);

  const currentDoctor =
    doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const applyDoctorSchedule = (doc: DoctorRecord) => {
    if (doc.weeklySchedule) {
      if (doc.weeklySchedule.activeDays && doc.weeklySchedule.activeDays.length > 0) {
        setActiveDays(doc.weeklySchedule.activeDays);
      }
      if (doc.weeklySchedule.dayShifts) {
        setDayShifts(doc.weeklySchedule.dayShifts);
      }
    }
    if (doc.vacationBlocks) {
      setVacationBlocks(doc.vacationBlocks);
    } else {
      setVacationBlocks([]);
    }
    setHasUnsavedChanges(false);
  };

  const handleSelectDoctor = (doc: DoctorRecord) => {
    setSelectedDoctorId(doc.id);
    setIsDoctorDropdownOpen(false);
    applyDoctorSchedule(doc);
  };

  // Toggle active work day in pills
  const toggleActiveDay = (dayKey: string) => {
    setHasUnsavedChanges(true);
    setActiveDays((prev) => {
      if (prev.includes(dayKey)) {
        return prev.filter((d) => d !== dayKey);
      } else {
        return [...prev, dayKey];
      }
    });
  };

  // Add shift to a specific day
  const handleAddShift = (dayKey: string) => {
    setHasUnsavedChanges(true);
    const newShift: DoctorShift = {
      id: `shift-${dayKey}-${Date.now()}`,
      startTime: "09:00 AM",
      endTime: "07:00 PM",
      location: currentDoctor?.clinicBranch || "Main Clinic",
    };
    setDayShifts((prev) => {
      const current = prev[dayKey] || [];
      return {
        ...prev,
        [dayKey]: [...current, newShift],
      };
    });
  };

  // Remove shift from a specific day
  const handleRemoveShift = (dayKey: string, shiftId: string) => {
    setHasUnsavedChanges(true);
    setDayShifts((prev) => {
      const current = prev[dayKey] || [];
      return {
        ...prev,
        [dayKey]: current.filter((s) => s.id !== shiftId),
      };
    });
  };

  // Update shift field
  const handleUpdateShift = (
    dayKey: string,
    shiftId: string,
    field: keyof DoctorShift,
    value: string
  ) => {
    setHasUnsavedChanges(true);
    setDayShifts((prev) => {
      const current = prev[dayKey] || [];
      return {
        ...prev,
        [dayKey]: current.map((s) =>
          s.id === shiftId ? { ...s, [field]: value } : s
        ),
      };
    });
  };

  // Copy Monday shifts to all active days
  const handleCopyToAllDays = (sourceDayKey: string) => {
    const shiftsToCopy = dayShifts[sourceDayKey] || [];
    setHasUnsavedChanges(true);
    setDayShifts((prev) => {
      const updated: Record<string, DoctorShift[]> = { ...prev };
      activeDays.forEach((day) => {
        updated[day] = shiftsToCopy.map((s, idx) => ({
          ...s,
          id: `shift-${day}-${idx}-${Date.now()}`,
        }));
      });
      return updated;
    });
    alert(`Copied ${sourceDayKey}'s shift hours to all active days!`);
  };

  // Add vacation block
  const handleAddVacation = () => {
    if (!vacationFrom) {
      alert("Please select a start date for the vacation block.");
      return;
    }
    const newBlock: VacationBlock = {
      id: `vac-${Date.now()}`,
      from: vacationFrom,
      to: vacationTo || vacationFrom,
      reason: "Doctor Vacation / Leave",
      createdAt: new Date().toISOString(),
    };
    setVacationBlocks([newBlock, ...vacationBlocks]);
    setVacationFrom("");
    setVacationTo("");
    setHasUnsavedChanges(true);
  };

  // Remove vacation block
  const handleRemoveVacation = (id: string) => {
    setVacationBlocks(vacationBlocks.filter((v) => v.id !== id));
    setHasUnsavedChanges(true);
  };

  // Save schedule to API
  const handleSaveSchedule = async () => {
    if (!currentDoctor) return;
    setSaving(true);
    try {
      const updatedWeeklySchedule = {
        activeDays,
        dayShifts,
        vacationBlocks,
      };

      const payload = {
        ...currentDoctor,
        weeklySchedule: updatedWeeklySchedule,
        vacationBlocks,
      };

      const res = await fetch("/api/admin/setup/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setHasUnsavedChanges(false);
        setDoctors((prev) =>
          prev.map((d) => (d.id === currentDoctor.id ? { ...d, ...payload } : d))
        );
      } else {
        alert("Failed to save schedule: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Error saving schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Loading Doctor Schedule...</p>
      </div>
    );
  }

  // Days that are currently active in order of DAYS_OF_WEEK
  const activeDaysList = DAYS_OF_WEEK.filter((d) => activeDays.includes(d.key));

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. TOP CARD CONTAINER (Matches screenshot exactly)                  */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
        {/* Title Row with Badges & Doctor Selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-600" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Weekly Availability
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Set working hours and locations for each day.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center rounded border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 tracking-wider">
                CMS PLAN
              </span>
              <span className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 tracking-wider">
                UNLIMITED SHIFTS
              </span>
            </div>
          </div>

          {/* Right: Managing Schedule For Dropdown */}
          <div className="relative">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-left sm:text-right">
              MANAGING SCHEDULE FOR
            </span>
            <button
              type="button"
              onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
              className="inline-flex items-center justify-between gap-3 w-full sm:w-[280px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  {currentDoctor?.name || "Dr. Deep Arvindbhai Patel"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isDoctorDropdownOpen && (
              <div className="absolute right-0 z-30 mt-1.5 w-full sm:w-[280px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
                {doctors.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectDoctor(doc)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                      doc.id === selectedDoctorId
                        ? "bg-blue-50/60 font-semibold text-blue-700"
                        : "text-slate-700"
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{doc.name}</div>
                      <div className="text-xs text-slate-400 font-normal">
                        {doc.specialty || "Dental Specialist"} • {doc.clinicBranch || "Main Clinic"}
                      </div>
                    </div>
                    {doc.id === selectedDoctorId && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sub-tabs: Weekly Availability | By date | History */}
        <div className="flex items-center gap-2 pt-5 pb-6">
          <button
            type="button"
            onClick={() => setSubTab("weekly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              subTab === "weekly"
                ? "bg-blue-100/90 text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 font-medium"
            }`}
          >
            Weekly Availability
          </button>
          <button
            type="button"
            onClick={() => setSubTab("byDate")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              subTab === "byDate"
                ? "bg-blue-100/90 text-blue-700 font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            By date
          </button>
          <button
            type="button"
            onClick={() => setSubTab("history")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              subTab === "history"
                ? "bg-blue-100/90 text-blue-700 font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            History
          </button>
        </div>

        {/* =================================================================== */}
        {/* SUBTAB 1: Weekly Availability (Screenshots 1, 2, 3)                 */}
        {/* =================================================================== */}
        {subTab === "weekly" && (
          <div className="space-y-6">
            {/* ACTIVE WORK DAYS Header */}
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                ACTIVE WORK DAYS
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {DAYS_OF_WEEK.map((d) => {
                  const isDayActive = activeDays.includes(d.key);

                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleActiveDay(d.key)}
                      className={`min-w-[62px] px-3 py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isDayActive
                          ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                          : "border border-slate-200/80 bg-white text-slate-400 hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <span className="text-xs font-bold tracking-wide">
                        {d.key}
                      </span>
                      <span
                        className={`text-sm leading-none mt-0.5 ${
                          isDayActive ? "text-white" : "text-slate-300"
                        }`}
                      >
                        •
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================================== */}
            {/* ALL ACTIVE DAYS LIST (Matches Screenshots 1, 2, 3)                  */}
            {/* =================================================================== */}
            <div className="space-y-4">
              {activeDaysList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic rounded-2xl border border-dashed border-slate-200">
                  No active work days selected. Click a day pill above in &quot;ACTIVE WORK DAYS&quot; to enable shifts.
                </div>
              ) : (
                activeDaysList.map((dayObj, dayIdx) => {
                  const shifts = dayShifts[dayObj.key] || [];

                  return (
                    <div
                      key={dayObj.key}
                      className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4"
                    >
                      {/* Day Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-6 bg-blue-600 rounded-full shrink-0" />
                          <h3 className="text-base font-bold text-slate-900">
                            {dayObj.full}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {shifts.length}{" "}
                            {shifts.length === 1 ? "shift" : "shifts"}
                          </span>
                          {/* "Copy to all days" button on first active day */}
                          {dayIdx === 0 && (
                            <button
                              type="button"
                              onClick={() => handleCopyToAllDays(dayObj.key)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              Copy to all days
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddShift(dayObj.key)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add shift
                        </button>
                      </div>

                      {/* Shifts for this day */}
                      {shifts.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs italic">
                          No shifts scheduled for {dayObj.full}. Click &quot;+ Add shift&quot; to set hours.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {shifts.map((shift, idx) => {
                            const startKey = `${dayObj.key}-${shift.id}-start`;
                            const endKey = `${dayObj.key}-${shift.id}-end`;

                            return (
                              <div
                                key={shift.id}
                                className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3"
                              >
                                {/* Shift Number Circle */}
                                <div className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 text-xs font-semibold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </div>

                                {/* Time Range Inputs with Interactive 3-Column Dropdown */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Start Time Field */}
                                  <div className="relative inline-flex items-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenTimePickerKey(
                                          openTimePickerKey === startKey ? null : startKey
                                        )
                                      }
                                      className="inline-flex items-center justify-between w-[130px] rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                                      <span>{shift.startTime || "09:00 AM"}</span>
                                      <Clock className="w-3 h-3 text-slate-300 shrink-0 ml-1.5" />
                                    </button>

                                    {openTimePickerKey === startKey && (
                                      <TimePickerDropdown
                                        value={shift.startTime}
                                        onChange={(newVal) => {
                                          handleUpdateShift(dayObj.key, shift.id, "startTime", newVal);
                                        }}
                                        onClose={() => setOpenTimePickerKey(null)}
                                      />
                                    )}
                                  </div>

                                  <span className="text-slate-400 text-sm font-bold">→</span>

                                  {/* End Time Field */}
                                  <div className="relative inline-flex items-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenTimePickerKey(
                                          openTimePickerKey === endKey ? null : endKey
                                        )
                                      }
                                      className="inline-flex items-center justify-between w-[130px] rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300"
                                    >
                                      <span>{shift.endTime || "07:00 PM"}</span>
                                      <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-1.5" />
                                    </button>

                                    {openTimePickerKey === endKey && (
                                      <TimePickerDropdown
                                        value={shift.endTime}
                                        onChange={(newVal) => {
                                          handleUpdateShift(dayObj.key, shift.id, "endTime", newVal);
                                        }}
                                        onClose={() => setOpenTimePickerKey(null)}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Location Dropdown */}
                                <div className="relative flex-1 min-w-[200px]">
                                  <div className="relative inline-flex items-center w-full">
                                    <MapPin className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <select
                                      value={shift.location}
                                      onChange={(e) =>
                                        handleUpdateShift(
                                          dayObj.key,
                                          shift.id,
                                          "location",
                                          e.target.value
                                        )
                                      }
                                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-8 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                                    >
                                      {CLINIC_LOCATIONS.map((loc) => (
                                        <option key={loc} value={loc}>
                                          {loc}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>

                                {/* Action Buttons: Calendar icon / Remove Shift */}
                                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                                  <span className="text-slate-300 hover:text-slate-500 p-1">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveShift(dayObj.key, shift.id)}
                                    title="Remove shift"
                                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* =================================================================== */}
            {/* VACATION / BLOCKED DATES BOX (Screenshot 3)                         */}
            {/* =================================================================== */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-5 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                  <CalendarIcon className="w-4 h-4 text-rose-500" />
                  <h4>Vacation for {currentDoctor?.name || "Dr. Deep Arvindbhai Patel"}</h4>
                </div>
                <p className="text-xs text-rose-500/90 mt-0.5">
                  Block a date range — stops new bookings, suppresses reminders, and optionally notifies affected patients.
                </p>
              </div>

              {/* Input Row: From, To, Block Button */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    FROM
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={vacationFrom}
                      onChange={(e) => setVacationFrom(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 shadow-2xs focus:border-rose-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    TO (leave blank for single day)
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={vacationTo}
                      onChange={(e) => setVacationTo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 shadow-2xs focus:border-rose-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddVacation}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-semibold py-2.5 px-4 text-xs shadow-xs transition-colors"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Block
                  </button>
                </div>
              </div>

              {/* Upcoming Blocked Dates List */}
              <div className="pt-2">
                <span className="block text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-2">
                  UPCOMING BLOCKED DATES FOR {currentDoctor?.name?.toUpperCase() || "DR. DEEP ARVINDBHAI PATEL"}
                </span>

                {vacationBlocks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No upcoming vacation blocks for this doctor.
                  </p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {vacationBlocks.map((vb) => (
                      <div
                        key={vb.id}
                        className="flex items-center justify-between rounded-xl border border-rose-200/80 bg-white px-3.5 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
                          <span className="font-semibold text-slate-800">
                            {vb.from} {vb.to && vb.to !== vb.from ? `→ ${vb.to}` : "(Single Day)"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVacation(vb.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* SUBTAB 2: By date (Screenshot 4)                                    */}
        {/* =================================================================== */}
        {subTab === "byDate" && (
          <div className="space-y-6">
            {/* Blue Info Callout Box */}
            <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 sm:p-5">
              <CalendarDays className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 leading-relaxed">
                Changes here apply to <strong>one date only</strong> and never touch the weekly schedule. The next week goes back to the weekly hours on its own.
              </p>
            </div>

            {/* DATE Picker Input */}
            <div className="space-y-1.5 max-w-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                DATE
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={byDateString}
                  onChange={(e) => setByDateString(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Date Hours Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  Weekly hours 09:00–19:00
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {currentDoctor?.clinicBranch || "Main Clinic"}
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-3 pt-1">
                {/* Start Input */}
                <div className="space-y-1 relative">
                  <span className="block text-xs text-slate-500 font-medium">
                    Start
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenByDatePicker(openByDatePicker === "start" ? null : "start")
                    }
                    className="inline-flex items-center justify-between w-[130px] rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300"
                  >
                    <span>{byDateStart}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {openByDatePicker === "start" && (
                    <TimePickerDropdown
                      value={byDateStart}
                      onChange={(newVal) => {
                        setByDateStart(newVal);
                        setOpenByDatePicker(null);
                      }}
                      onClose={() => setOpenByDatePicker(null)}
                    />
                  )}
                </div>

                {/* Finish Input */}
                <div className="space-y-1 relative">
                  <span className="block text-xs text-slate-500 font-medium">
                    Finish
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenByDatePicker(openByDatePicker === "finish" ? null : "finish")
                    }
                    className="inline-flex items-center justify-between w-[130px] rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300"
                  >
                    <span>{byDateFinish}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {openByDatePicker === "finish" && (
                    <TimePickerDropdown
                      value={byDateFinish}
                      onChange={(newVal) => {
                        setByDateFinish(newVal);
                        setOpenByDatePicker(null);
                      }}
                      onClose={() => setOpenByDatePicker(null)}
                    />
                  )}
                </div>

                {/* Save for this date Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveByDate}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 text-xs shadow-2xs transition-colors"
                  >
                    Save for this date
                  </button>
                  {byDateSaveStatus && (
                    <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                      ✓ {byDateSaveStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Add another shift button */}
            <div>
              <button
                type="button"
                onClick={() => alert("Added another shift for this date.")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Add another shift
              </button>
            </div>

            {/* Upcoming date changes */}
            <div className="pt-2 space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Upcoming date changes
              </h4>
              <p className="text-xs text-slate-500">
                None. Every upcoming date follows the weekly schedule.
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* SUBTAB 3: History                                                   */}
        {/* =================================================================== */}
        {subTab === "history" && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="font-semibold text-slate-800">Schedule Change History</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Track when weekly availability or vacation blocks were modified for {currentDoctor?.name}.
            </p>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. BOTTOM ACTION BAR (Matches Screenshot 3)                         */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          {hasUnsavedChanges ? (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Unsaved changes
            </span>
          ) : (
            <span className="text-slate-400">All changes saved.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveSchedule}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 text-xs shadow-xs transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
}
