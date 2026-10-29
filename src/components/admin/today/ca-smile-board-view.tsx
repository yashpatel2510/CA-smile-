"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  MessageCircle,
  Stethoscope,
  FileText,
  CheckCircle2,
  CheckCheck,
  Plus,
  Search,
  RefreshCw,
  X,
  Tag,
  Share2,
  AlertCircle,
  ArrowRight,
  Smile,
  Edit3,
  Save,
  Eye,
  Copy,
  Check,
  RotateCcw,
  CalendarCheck2,
  Ban,
} from "lucide-react";
import { CuravertoBookAppointmentModal } from "@/components/admin/appointments/curaverto-book-appointment-modal";
import { DatabaseStatusBadge } from "@/components/admin/database-status-badge";

export interface BoardAppointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  phone: string;
  email?: string;
  gender?: string;
  serviceId?: string;
  serviceName: string;
  doctor: string;
  timeSlot: string;
  startTime: string;
  status: string;
  source: string;
  notes?: string;
  reason?: string;
  checkedInAt?: string | null;
  treatmentStartedAt?: string | null;
  waitingMinutes: number;
  paidAmount?: string;
  totalAmount?: string;
  paymentStatus?: string;
  isRescheduled?: boolean;
  isFollowUp?: boolean;
}

export function getAppointmentVariant(apt: BoardAppointment): "RESCHEDULED" | "FOLLOW_UP" | "STANDARD" {
  const notesLower = (apt.notes || "").toLowerCase();
  const reasonLower = (apt.reason || "").toLowerCase();
  const serviceLower = (apt.serviceName || "").toLowerCase();
  const statusUpper = (apt.status || "").toUpperCase();

  if (
    apt.isRescheduled ||
    statusUpper === "RESCHEDULED" ||
    notesLower.includes("reschedul") ||
    reasonLower.includes("reschedul")
  ) {
    return "RESCHEDULED";
  }

  if (
    apt.isFollowUp ||
    statusUpper === "FOLLOW_UP" ||
    statusUpper === "FOLLOW-UP" ||
    notesLower.includes("follow-up") ||
    notesLower.includes("follow up") ||
    notesLower.includes("followup") ||
    notesLower.includes("revisit") ||
    reasonLower.includes("follow-up") ||
    reasonLower.includes("follow up") ||
    reasonLower.includes("followup") ||
    serviceLower.includes("follow-up") ||
    serviceLower.includes("follow up")
  ) {
    return "FOLLOW_UP";
  }

  return "STANDARD";
}

export type ColumnType = "BOOKED" | "CONFIRMED" | "IN_CLINIC" | "DONE";

export function CASmileBoardView() {
  // Today's ISO date string in YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [appointments, setAppointments] = useState<BoardAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Client mount tracking for portals
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Patient Details Modal State (Triggered on Card Click)
  const [activePatientDetails, setActivePatientDetails] = useState<BoardAppointment | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  // Drag and drop state
  const [draggedAptId, setDraggedAptId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnType | null>(null);
  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState<boolean>(false);

  // Book Appointment Modal state (Matches Appointment Book Section)
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);

  // Lock background body scroll when any modal is open
  useEffect(() => {
    if (activePatientDetails || isBookModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activePatientDetails, isBookModalOpen]);

  // Quick tag switcher for active appointment (Standard / Rescheduled / Follow-up)
  const handleSetAppointmentType = (aptId: string, type: "STANDARD" | "RESCHEDULED" | "FOLLOW_UP") => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === aptId) {
          let updatedNotes = apt.notes || "";
          updatedNotes = updatedNotes
            .replace(/\[Rescheduled\]\s*/gi, "")
            .replace(/\[Follow-Up\]\s*/gi, "");

          if (type === "RESCHEDULED") {
            updatedNotes = `[Rescheduled] ${updatedNotes}`.trim();
          } else if (type === "FOLLOW_UP") {
            updatedNotes = `[Follow-Up] ${updatedNotes}`.trim();
          }

          const updated: BoardAppointment = {
            ...apt,
            notes: updatedNotes,
            isRescheduled: type === "RESCHEDULED",
            isFollowUp: type === "FOLLOW_UP",
          };

          if (activePatientDetails && activePatientDetails.id === aptId) {
            setActivePatientDetails(updated);
          }
          return updated;
        }
        return apt;
      })
    );
  };

  // Notes editing inside Patient Details modal
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState<boolean>(false);

  // Calendar horizontal dates generation (spanning 14 days)
  const [calendarBaseDate, setCalendarBaseDate] = useState<Date>(() => new Date());

  const calendarDays = useMemo(() => {
    const days: { dateStr: string; dayName: string; dayNum: number; monthName: string; isToday: boolean }[] = [];
    const base = new Date(calendarBaseDate);
    // Start 4 days before base date to show previous days and upcoming days
    base.setDate(base.getDate() - 4);

    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });

      days.push({
        dateStr,
        dayName,
        dayNum: d.getDate(),
        monthName,
        isToday: dateStr === todayDateStr,
      });
    }
    return days;
  }, [calendarBaseDate, todayDateStr]);

  // Fetch appointments for selected date
  const fetchAppointments = useCallback(async (date: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/today?date=${date}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        // Safely sync active details modal only if it is CURRENTLY open; never re-open if closed!
        setActivePatientDetails((current) => {
          if (!current) return null;
          const fresh = data.appointments.find((a: BoardAppointment) => a.id === current.id);
          return fresh || current;
        });
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]);

  // Real-time synchronization: listeners for appointment updates from Appointments view and auto-refresh
  useEffect(() => {
    const handleSync = () => {
      fetchAppointments(selectedDate, true);
    };
    window.addEventListener("appointment-status-updated", handleSync);
    window.addEventListener("focus", handleSync);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "last_appointment_update") handleSync();
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      fetchAppointments(selectedDate, true);
    }, 10000);

    return () => {
      window.removeEventListener("appointment-status-updated", handleSync);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [selectedDate, fetchAppointments]);

  // Map appointment statuses into the columns
  const categorizeAppointment = (apt: BoardAppointment): ColumnType => {
    const status = apt.status?.toUpperCase() || "PENDING";
    // Treatment Done / Completed
    if (status === "COMPLETED" || status === "TREATMENT_DONE" || status === "DONE") {
      return "DONE";
    }
    // In-Clinic (Arrived / Checked-in / Waiting / In Chair Consultation)
    if (
      status === "CHECKED_IN" ||
      status === "IN-CLINIC" ||
      status === "IN_CLINIC" ||
      status === "WAITING" ||
      status === "TREATMENT_STARTED" ||
      status === "IN_PROGRESS" ||
      status === "CONSULTING"
    ) {
      return "IN_CLINIC";
    }
    // Confirmed & Scheduled
    if (status === "CONFIRMED" || status === "SCHEDULED") {
      return "CONFIRMED";
    }
    // Booked (Pending intake, Booked, Cancelled, Declined, No Show)
    return "BOOKED";
  };

  // Move appointment to a target column (optimistic update + API call + broadcast)
  const moveAppointment = async (appointmentId: string, targetColumn: ColumnType) => {
    let newStatus = "PENDING";
    if (targetColumn === "CONFIRMED") newStatus = "CONFIRMED";
    if (targetColumn === "IN_CLINIC") newStatus = "CHECKED_IN";
    if (targetColumn === "DONE") newStatus = "TREATMENT_DONE";

    // Optimistic UI update
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
    );

    if (activePatientDetails && activePatientDetails.id === appointmentId) {
      setActivePatientDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Call API to persist
    try {
      await fetch("/api/admin/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          appointmentId,
          status: newStatus,
          date: selectedDate,
        }),
      });

      // Broadcast event to Appointments section & other open windows
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("appointment-status-updated", {
            detail: { appointmentId, status: newStatus },
          })
        );
        localStorage.setItem("last_appointment_update", String(Date.now()));
      }
    } catch (err) {
      console.error("Failed to update status on server:", err);
      fetchAppointments(selectedDate, true);
    }
  };

  // Save notes from modal
  const handleSaveNotes = async () => {
    if (!activePatientDetails) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/api/admin/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NOTES",
          appointmentId: activePatientDetails.id,
          notes: editedNotes,
          date: selectedDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === activePatientDetails.id ? { ...apt, notes: editedNotes } : apt
          )
        );
        setActivePatientDetails((prev) => (prev ? { ...prev, notes: editedNotes } : null));
        setIsEditingNotes(false);
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Guard to prevent drag/drop actions from accidentally opening the patient details modal
  const dragEndTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    isDraggingRef.current = true;
    setIsCurrentlyDragging(true);
    setDraggedAptId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, col: ColumnType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== col) {
      setDragOverColumn(col);
    }
  };

  const handleDrop = (e: React.DragEvent, col: ColumnType) => {
    e.preventDefault();
    const aptId = e.dataTransfer.getData("text/plain") || draggedAptId;
    if (aptId) {
      moveAppointment(aptId, col);
    }
    setDraggedAptId(null);
    setDragOverColumn(null);
    dragEndTimeRef.current = Date.now();
    setTimeout(() => {
      isDraggingRef.current = false;
      setIsCurrentlyDragging(false);
    }, 400);
  };

  const handleDragEnd = () => {
    setDraggedAptId(null);
    setDragOverColumn(null);
    dragEndTimeRef.current = Date.now();
    setTimeout(() => {
      isDraggingRef.current = false;
      setIsCurrentlyDragging(false);
    }, 400);
  };

  // Timestamp when modal was explicitly closed to prevent click pass-through to underlying cards
  const justClosedModalTimeRef = useRef<number>(0);

  // Safe handler to close patient details modal
  const handleCloseDetails = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    justClosedModalTimeRef.current = Date.now();
    setActivePatientDetails(null);
    setIsEditingNotes(false);
  };

  // Safe handler to open patient details modal only on intentional user interaction
  const handleOpenPatientDetails = (apt: BoardAppointment) => {
    // If dragging or drag just ended recently (within 500ms), suppress auto-opening
    if (isDraggingRef.current || Date.now() - dragEndTimeRef.current < 500) {
      return;
    }
    // If modal was closed within the last 500ms, suppress underlying click
    if (Date.now() - justClosedModalTimeRef.current < 500) {
      return;
    }
    setActivePatientDetails(apt);
    setEditedNotes(apt.notes || "");
    setIsEditingNotes(false);
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseDetails();
      }
    };
    if (activePatientDetails) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePatientDetails]);

  const handleCopyPhone = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1800);
  };

  // Filtered appointments by search term
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q)) ||
        a.doctor.toLowerCase().includes(q)
    );
  }, [appointments, searchQuery]);

  // Group into columns
  const bookedAppointments = useMemo(
    () => filteredAppointments.filter((a) => categorizeAppointment(a) === "BOOKED"),
    [filteredAppointments]
  );
  const confirmedAppointments = useMemo(
    () => filteredAppointments.filter((a) => categorizeAppointment(a) === "CONFIRMED"),
    [filteredAppointments]
  );
  const inClinicAppointments = useMemo(
    () => filteredAppointments.filter((a) => categorizeAppointment(a) === "IN_CLINIC"),
    [filteredAppointments]
  );
  const doneAppointments = useMemo(
    () => filteredAppointments.filter((a) => categorizeAppointment(a) === "DONE"),
    [filteredAppointments]
  );
  const cancelledAppointmentsCount = useMemo(
    () =>
      bookedAppointments.filter((a) => {
        const s = (a.status || "").toUpperCase();
        return s === "CANCELLED" || s === "DECLINED";
      }).length,
    [bookedAppointments]
  );


  // Calendar Navigation
  const handlePrevDays = () => {
    setCalendarBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextDays = () => {
    setCalendarBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayDateStr);
    setCalendarBaseDate(new Date());
    setActivePatientDetails(null);
  };

  const formattedSelectedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ================================================================= */}
      {/* 1. TOP HEADER & CONTROLS                                          */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            {/* CA Smile Brand Logo */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-1 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ca-smile-logo-light.png"
                alt="CA Smile Logo"
                className="h-full w-full object-contain dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ca-smile-logo-dark.png"
                alt="CA Smile Logo"
                className="h-full w-full object-contain hidden dark:block"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  CA Smile
                </h1>
                <DatabaseStatusBadge size="sm" />
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-[#1e3a8a] text-white px-2 py-0.5 text-[10px] font-bold border border-blue-400 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                  Rescheduled
                </span>
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-[#7e22ce] text-white px-2 py-0.5 text-[10px] font-bold border border-purple-400 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                  Follow-Up
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {formattedSelectedDate} &bull; Click any card to view full patient details &bull; Click &amp; hold to drag across columns
              </p>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search box */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, phone, notes..."
              className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-brand-primary focus:outline-hidden dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Refresh */}
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchAppointments(selectedDate, true);
            }}
            title="Refresh Board"
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* Add Booking Button (Opens Curaverto Book Appointment Modal) */}
          <button
            type="button"
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add Booking</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. SLIM & AESTHETIC HORIZONTAL CALENDAR STRIP                     */}
      {/* ================================================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Interactive Horizontal Calendar
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              (Click any date to switch day)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick jump to Today button */}
            <button
              type="button"
              onClick={handleJumpToToday}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all shadow-2xs ${
                selectedDate === todayDateStr
                  ? "bg-red-500 text-white ring-2 ring-red-400 shadow-red-500/20"
                  : "border border-red-200 bg-red-50/70 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400 animate-ping" />
              <span>Jump to Today</span>
            </button>

            {/* Left & Right week scroll arrows */}
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={handlePrevDays}
                title="Previous days"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-all dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextDays}
                title="Next days"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-all dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scrollable date pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
          {calendarDays.map((day) => {
            const isSelected = selectedDate === day.dateStr;
            const isToday = day.isToday;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => {
                  setSelectedDate(day.dateStr);
                  setActivePatientDetails(null);
                }}
                className={`relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] h-[82px] rounded-2xl px-2 py-1.5 transition-all cursor-pointer ${
                  // CRITICAL USER REQUIREMENT:
                  // "whatwaware date are thair doday date calder secsan sjow date in rad coler highligt today"
                  isToday
                    ? isSelected
                      ? "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/30 border-2 border-red-600 ring-2 ring-red-400"
                      : "bg-white border-2 border-red-500 text-red-600 shadow-xs ring-2 ring-red-300/60 hover:bg-red-50/50 dark:bg-slate-900 dark:border-red-500"
                    : isSelected
                    ? "bg-slate-900 text-white shadow-md border-2 border-slate-900 ring-2 ring-slate-400 dark:bg-emerald-600 dark:border-emerald-600"
                    : "bg-slate-50/80 hover:bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                {/* Dedicated RED Badge for TODAY */}
                {isToday && (
                  <span
                    className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-2xs ${
                      isSelected
                        ? "bg-white text-red-600 border border-red-200"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    TODAY
                  </span>
                )}

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isToday
                      ? isSelected
                        ? "text-red-100"
                        : "text-red-600 font-black"
                      : isSelected
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {day.dayName}
                </span>

                <span
                  className={`text-lg sm:text-xl font-black leading-tight mt-0.5 ${
                    isToday
                      ? isSelected
                        ? "text-white"
                        : "text-red-600"
                      : isSelected
                      ? "text-white"
                      : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {day.dayNum}
                </span>

                <span
                  className={`text-[9px] font-semibold ${
                    isToday
                      ? isSelected
                        ? "text-red-100"
                        : "text-red-500"
                      : isSelected
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. FOUR VERTICAL KANBAN SECTIONS (COLUMNS)                        */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5 items-start">
        {/* =============================================================== */}
        {/* COLUMN 1: BOOKED APPOINTMENTS (SLATE / RED FOR CANCELLED)        */}
        {/* =============================================================== */}
        <div
          onDragOver={(e) => handleDragOver(e, "BOOKED")}
          onDrop={(e) => handleDrop(e, "BOOKED")}
          className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[550px] p-4 ${
            dragOverColumn === "BOOKED"
              ? "border-slate-600 bg-slate-100/70 ring-4 ring-slate-300/50 shadow-lg scale-[1.01]"
              : "border-slate-300/80 bg-slate-50/50 dark:bg-slate-900/30 dark:border-slate-800"
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm shadow-slate-700/25">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-950 dark:text-slate-100 tracking-tight">
                  Booked Appointments
                </h2>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  New / Intake &amp; Cancelled
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {cancelledAppointmentsCount > 0 && (
                <span
                  title={`${cancelledAppointmentsCount} Cancelled Appointment${cancelledAppointmentsCount > 1 ? "s" : ""}`}
                  className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs"
                >
                  <Ban className="h-2.5 w-2.5 stroke-[2.5]" />
                  <span>{cancelledAppointmentsCount}</span>
                </span>
              )}
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-700 px-2 text-xs font-black text-white shadow-2xs">
                {bookedAppointments.length}
              </span>
            </div>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-2.5">
            {bookedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-white/60 p-8 text-center dark:bg-slate-900/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  No Booked Appointments
                </p>
                <p className="text-[11px] text-slate-600/80 mt-1 max-w-[200px]">
                  Drag a patient card here or{" "}
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(true)}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    click here to add booking
                  </button>
                </p>
              </div>
            ) : (
              bookedAppointments.map((apt) => (
                <SmallPatientCard
                  key={apt.id}
                  appointment={apt}
                  columnType="BOOKED"
                  onDragStart={(e) => handleDragStart(e, apt.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedAptId === apt.id}
                  onOpenDetails={() => handleOpenPatientDetails(apt)}
                />
              ))
            )}
          </div>
        </div>

        {/* =============================================================== */}
        {/* COLUMN 2: CONFIRMED APPOINTMENTS (GREEN - MATCHING USER COLOR)   */}
        {/* =============================================================== */}
        <div
          onDragOver={(e) => handleDragOver(e, "CONFIRMED")}
          onDrop={(e) => handleDrop(e, "CONFIRMED")}
          className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[550px] p-4 ${
            dragOverColumn === "CONFIRMED"
              ? "border-emerald-500 bg-emerald-100/60 ring-4 ring-emerald-300/40 shadow-lg scale-[1.01]"
              : "border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/60"
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-emerald-200/70 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0b7857] text-white shadow-sm shadow-emerald-600/25">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-emerald-950 dark:text-emerald-200 tracking-tight">
                  Confirmed Appointments
                </h2>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Confirmed &amp; Scheduled
                </span>
              </div>
            </div>

            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#0b7857] px-2 text-xs font-black text-white shadow-2xs">
              {confirmedAppointments.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-2.5">
            {confirmedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200/90 bg-white/60 p-8 text-center dark:bg-slate-900/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  No Confirmed Appointments
                </p>
                <p className="text-[11px] text-emerald-700/80 mt-1 max-w-[200px]">
                  Drag patient from Booked to Confirmed when attendance is confirmed
                </p>
              </div>
            ) : (
              confirmedAppointments.map((apt) => (
                <SmallPatientCard
                  key={apt.id}
                  appointment={apt}
                  columnType="CONFIRMED"
                  onDragStart={(e) => handleDragStart(e, apt.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedAptId === apt.id}
                  onOpenDetails={() => handleOpenPatientDetails(apt)}
                />
              ))
            )}
          </div>
        </div>

        {/* =============================================================== */}
        {/* COLUMN 3: IN-CLINIC (AMBER / ORANGE - MATCHING USER COLOR)       */}
        {/* =============================================================== */}
        <div
          onDragOver={(e) => handleDragOver(e, "IN_CLINIC")}
          onDrop={(e) => handleDrop(e, "IN_CLINIC")}
          className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[550px] p-4 ${
            dragOverColumn === "IN_CLINIC"
              ? "border-amber-500 bg-amber-100/60 ring-4 ring-amber-300/40 shadow-lg scale-[1.01]"
              : "border-amber-200/80 bg-amber-50/30 dark:bg-amber-950/20 dark:border-amber-900/60"
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-amber-200/70 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#b4530a] text-white shadow-sm shadow-amber-600/25">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-amber-950 dark:text-amber-200 tracking-tight">
                  In-Clinic
                </h2>
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Arrived / In Consultation
                </span>
              </div>
            </div>

            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#b4530a] px-2 text-xs font-black text-white shadow-2xs">
              {inClinicAppointments.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-2.5">
            {inClinicAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-200/90 bg-white/60 p-8 text-center dark:bg-slate-900/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  No In-Clinic Appointments
                </p>
                <p className="text-[11px] text-amber-700/80 mt-1 max-w-[200px]">
                  Drag patient here when arrived or in clinic
                </p>
              </div>
            ) : (
              inClinicAppointments.map((apt) => (
                <SmallPatientCard
                  key={apt.id}
                  appointment={apt}
                  columnType="IN_CLINIC"
                  onDragStart={(e) => handleDragStart(e, apt.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedAptId === apt.id}
                  onOpenDetails={() => handleOpenPatientDetails(apt)}
                />
              ))
            )}
          </div>
        </div>

        {/* =============================================================== */}
        {/* COLUMN 4: TREATMENT DONE (TEAL / EMERALD)                         */}
        {/* =============================================================== */}
        <div
          onDragOver={(e) => handleDragOver(e, "DONE")}
          onDrop={(e) => handleDrop(e, "DONE")}
          className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[550px] p-4 ${
            dragOverColumn === "DONE"
              ? "border-teal-500 bg-teal-100/60 ring-4 ring-teal-300/40 shadow-lg scale-[1.01]"
              : "border-teal-200/80 bg-teal-50/30 dark:bg-teal-950/20 dark:border-teal-900/60"
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-teal-200/70 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#059669] text-white shadow-sm shadow-teal-600/25">
                <CheckCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-black text-teal-950 dark:text-teal-200 tracking-tight">
                  Treatment Done
                </h2>
                <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                  Completed Today
                </span>
              </div>
            </div>

            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#059669] px-2 text-xs font-black text-white shadow-2xs">
              {doneAppointments.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-2.5">
            {doneAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-teal-200/90 bg-white/60 p-8 text-center dark:bg-slate-900/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 mb-2">
                  <CheckCheck className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
                  No Completed Consultations
                </p>
                <p className="text-[11px] text-teal-700/80 mt-1 max-w-[200px]">
                  Drag patient here when treatment is finished
                </p>
              </div>
            ) : (
              doneAppointments.map((apt) => (
                <SmallPatientCard
                  key={apt.id}
                  appointment={apt}
                  columnType="DONE"
                  onDragStart={(e) => handleDragStart(e, apt.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedAptId === apt.id}
                  onOpenDetails={() => handleOpenPatientDetails(apt)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. PATIENT DETAILS MODAL (OPENED ON CARD CLICK)                   */}
      {/* ================================================================= */}
      {mounted && activePatientDetails && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            // Clicking outside modal content cleanly closes it
            if (e.target === e.currentTarget) {
              handleCloseDetails(e);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 dark:border-slate-800 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Modal Header */}
            {(() => {
              const isModalAptCancelled =
                (activePatientDetails.status || "").toUpperCase() === "CANCELLED" ||
                (activePatientDetails.status || "").toUpperCase() === "DECLINED";

              return (
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar with dynamic stage accent */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-lg shadow-sm border ${
                        isModalAptCancelled
                          ? "bg-red-600 text-white border-red-500 shadow-red-600/20"
                          : categorizeAppointment(activePatientDetails) === "BOOKED"
                          ? "bg-slate-700 text-white border-slate-600 shadow-slate-700/20"
                          : categorizeAppointment(activePatientDetails) === "CONFIRMED"
                          ? "bg-[#0b7857] text-white border-emerald-600 shadow-emerald-600/20"
                          : categorizeAppointment(activePatientDetails) === "IN_CLINIC"
                          ? "bg-[#b4530a] text-white border-amber-600 shadow-amber-600/20"
                          : "bg-[#059669] text-white border-teal-600 shadow-teal-600/20"
                      }`}
                    >
                      {activePatientDetails.patientName ? activePatientDetails.patientName.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white capitalize truncate">
                          {activePatientDetails.patientName}
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          #{String(activePatientDetails.tokenNumber).padStart(2, "0")}
                        </span>

                        {/* Stage status indicator pill */}
                        {isModalAptCancelled ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                            <Ban className="h-3 w-3 text-red-600 dark:text-red-400 stroke-[2.5]" />
                            <span>Cancelled</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              categorizeAppointment(activePatientDetails) === "BOOKED"
                                ? "bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                                : categorizeAppointment(activePatientDetails) === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                                : categorizeAppointment(activePatientDetails) === "IN_CLINIC"
                                ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                                : "bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                categorizeAppointment(activePatientDetails) === "BOOKED"
                                  ? "bg-slate-500 animate-pulse"
                                  : categorizeAppointment(activePatientDetails) === "CONFIRMED"
                                  ? "bg-emerald-500 animate-pulse"
                                  : categorizeAppointment(activePatientDetails) === "IN_CLINIC"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-teal-500 animate-pulse"
                              }`}
                            />
                            {categorizeAppointment(activePatientDetails) === "BOOKED"
                              ? "Booked"
                              : categorizeAppointment(activePatientDetails) === "CONFIRMED"
                              ? "Confirmed"
                              : categorizeAppointment(activePatientDetails) === "IN_CLINIC"
                              ? "In-Clinic"
                              : "Done"}
                          </span>
                        )}

                        {/* Rescheduled Pill if applicable */}
                        {getAppointmentVariant(activePatientDetails) === "RESCHEDULED" && (
                          <span className="rounded-full bg-[#1e3a8a] px-2.5 py-0.5 text-[11px] font-black text-white border border-blue-400 shadow-2xs inline-flex items-center gap-1">
                            <RotateCcw className="h-3 w-3 text-white" />
                            <span>Rescheduled</span>
                          </span>
                        )}

                        {/* Follow-up Pill if applicable */}
                        {getAppointmentVariant(activePatientDetails) === "FOLLOW_UP" && (
                          <span className="rounded-full bg-[#7e22ce] px-2.5 py-0.5 text-[11px] font-black text-white border border-purple-400 shadow-2xs inline-flex items-center gap-1">
                            <CalendarCheck2 className="h-3 w-3 text-white" />
                            <span>Follow-Up</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{formattedSelectedDate}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{activePatientDetails.timeSlot}</span>
                      </p>
                    </div>
                  </div>

                  {/* Explicit Close Button with stopPropagation */}
                  <button
                    type="button"
                    onClick={handleCloseDetails}
                    title="Close modal (Esc)"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer shadow-2xs"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })()}

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-0.5 scrollbar-thin">
              {/* Cancellation Alert Banner */}
              {((activePatientDetails.status || "").toUpperCase() === "CANCELLED" ||
                (activePatientDetails.status || "").toUpperCase() === "DECLINED") && (
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-2xs">
                      <Ban className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black">This appointment was cancelled</p>
                      <p className="text-[11px] text-red-700/90 dark:text-red-300 truncate">
                        {activePatientDetails.notes || "Cancelled from Appointments Desk"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => moveAppointment(activePatientDetails.id, "CONFIRMED")}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Re-Activate</span>
                  </button>
                </div>
              )}

              {/* Quick Column Stage Switcher */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Move Stage / Column:
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Click to update status live</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => moveAppointment(activePatientDetails.id, "BOOKED")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      categorizeAppointment(activePatientDetails) === "BOOKED" &&
                      (activePatientDetails.status || "").toUpperCase() !== "CANCELLED"
                        ? "bg-slate-800 text-white shadow-md shadow-slate-700/25 ring-2 ring-slate-500"
                        : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Booked</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveAppointment(activePatientDetails.id, "CONFIRMED")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      categorizeAppointment(activePatientDetails) === "CONFIRMED"
                        ? "bg-[#0b7857] text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400"
                        : "bg-white text-emerald-800 border border-emerald-200/90 hover:bg-emerald-50/70 hover:border-emerald-300 dark:bg-slate-800 dark:text-emerald-300 dark:border-emerald-900"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirmed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveAppointment(activePatientDetails.id, "IN_CLINIC")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      categorizeAppointment(activePatientDetails) === "IN_CLINIC"
                        ? "bg-[#b4530a] text-white shadow-md shadow-amber-600/25 ring-2 ring-amber-400"
                        : "bg-white text-amber-800 border border-amber-200/90 hover:bg-amber-50/70 hover:border-amber-300 dark:bg-slate-800 dark:text-amber-300 dark:border-amber-900"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>In-Clinic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveAppointment(activePatientDetails.id, "DONE")}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      categorizeAppointment(activePatientDetails) === "DONE"
                        ? "bg-[#059669] text-white shadow-md shadow-teal-600/25 ring-2 ring-teal-400"
                        : "bg-white text-teal-800 border border-teal-200/90 hover:bg-teal-50/70 hover:border-teal-300 dark:bg-slate-800 dark:text-teal-300 dark:border-teal-900"
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              </div>


              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Contact Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:bg-slate-850 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Contact Information
                    </span>
                    <a
                      href={`https://wa.me/${(activePatientDetails.phone || "").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200/90 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 transition-all hover:scale-105"
                    >
                      <MessageCircle className="h-3 w-3 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Phone className="h-4 w-4" />
                      </div>
                      <a
                        href={`tel:${activePatientDetails.phone}`}
                        className="text-xs sm:text-sm font-black text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors whitespace-nowrap select-all tracking-wide"
                      >
                        {activePatientDetails.phone || "No phone provided"}
                      </a>
                    </div>

                    {/* Copy Phone button */}
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(activePatientDetails.phone)}
                      title="Copy phone number"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedPhone ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {activePatientDetails.email && (
                    <p className="text-xs text-slate-500 mt-2 truncate pl-1">
                      {activePatientDetails.email}
                    </p>
                  )}
                </div>

                {/* Treatment & Doctor Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:bg-slate-850 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Treatment &amp; Doctor
                  </span>
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300">
                      <Tag className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {activePatientDetails.serviceName || "General Dental Consultation & Checkup"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pl-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{activePatientDetails.doctor || "Dr. Deep Arvindbhai Patel"}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info Row: Time & Source */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:bg-slate-850 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Time Slot
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {activePatientDetails.timeSlot}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:bg-slate-850 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Booking Source
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {activePatientDetails.source || "ADMIN"}
                  </span>
                </div>
              </div>

              {/* Full Clinical & Patient Notes Box */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 dark:bg-slate-850 dark:border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                      Clinical &amp; Patient Notes
                    </span>
                  </div>
                  {!isEditingNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditedNotes(activePatientDetails.notes || "");
                        setIsEditingNotes(true);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer px-2 py-0.5 rounded-lg hover:bg-amber-100/60 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Note</span>
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="mt-2.5 space-y-2.5">
                    {/* Quick suggestion chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">Quick add:</span>
                      {[
                        "Consultation completed",
                        "Follow-up in 7 days",
                        "Prescription given",
                        "Painless procedure requested",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setEditedNotes((prev) => (prev ? `${prev} | ${chip}` : chip));
                          }}
                          className="rounded-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-amber-50 cursor-pointer transition-colors"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={3}
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Enter patient symptoms, allergy notes, treatment progress..."
                      className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingNotes}
                        onClick={handleSaveNotes}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
                      >
                        {savingNotes ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        <span>Save Notes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    {activePatientDetails.notes ? (
                      `"${activePatientDetails.notes}"`
                    ) : (
                      <span className="text-slate-400 not-italic">
                        No clinical notes recorded yet. Click &quot;Edit Note&quot; to add symptoms or remarks.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer with explicit stopPropagation on Done */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activePatientDetails.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${(activePatientDetails.phone || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 hover:shadow-lg transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer shadow-md"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Done</span>
                <span className="text-[10px] opacity-60 font-mono">Esc</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================================================================= */}
      {/* 5. MODAL: BOOK APPOINTMENT (Same functionality as Appointment Section) */}
      {/* ================================================================= */}
      <CuravertoBookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        selectedDate={selectedDate}
        onBookingComplete={() => {
          setIsBookModalOpen(false);
          fetchAppointments(selectedDate, true);
        }}
      />
    </div>
  );
}

// ===========================================================================
// SMALL PATIENT CARD COMPONENT (MATCHING USER SCREENSHOT EXACTLY)
// ===========================================================================
interface SmallPatientCardProps {
  appointment: BoardAppointment;
  columnType: ColumnType;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onOpenDetails: () => void;
}

function SmallPatientCard({
  appointment,
  columnType,
  onDragStart,
  onDragEnd,
  isDragging,
  onOpenDetails,
}: SmallPatientCardProps) {
  // Track mouse down position to distinguish stationary clicks from click-and-drag gestures
  const mouseDownPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const wasDraggedRef = useRef<boolean>(false);

  const variant = getAppointmentVariant(appointment);

  const statusUpper = (appointment.status || "").toUpperCase();
  const isCancelled = statusUpper === "CANCELLED" || statusUpper === "DECLINED";

  // Column theme styling (Booked = Slate #334155, Confirmed = Green #0b7857, In-Clinic = Amber #b4530a, Done = Teal #059669)
  const columnStyles = {
    BOOKED: {
      cardBg:
        "bg-slate-50/90 border-slate-200/90 hover:border-slate-400 hover:bg-slate-100/70 text-slate-950 dark:bg-slate-800/60 dark:border-slate-700",
      avatarBg: "bg-white text-slate-800 border-slate-200/60 shadow-2xs",
      pill: "bg-white/95 text-slate-800 border-slate-200/70 shadow-2xs",
    },
    CONFIRMED: {
      cardBg:
        "bg-emerald-50/85 border-emerald-200/90 hover:border-emerald-400 hover:bg-emerald-100/70 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800",
      avatarBg: "bg-white text-emerald-800 border-emerald-200/60 shadow-2xs",
      pill: "bg-white/95 text-emerald-800 border-emerald-200/70 shadow-2xs",
    },
    IN_CLINIC: {
      cardBg:
        "bg-amber-50/85 border-amber-200/90 hover:border-amber-400 hover:bg-amber-100/70 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800",
      avatarBg: "bg-white text-amber-800 border-amber-200/60 shadow-2xs",
      pill: "bg-white/95 text-amber-800 border-amber-200/70 shadow-2xs",
    },
    DONE: {
      cardBg:
        "bg-teal-50/85 border-teal-200/90 hover:border-teal-400 hover:bg-teal-100/70 text-teal-950 dark:bg-teal-950/40 dark:border-teal-800",
      avatarBg: "bg-white text-teal-800 border-teal-200/60 shadow-2xs",
      pill: "bg-white/95 text-teal-800 border-teal-200/70 shadow-2xs",
    },
  }[columnType] || {
    cardBg: "bg-slate-50/90 border-slate-200/90 text-slate-950",
    avatarBg: "bg-white text-slate-800 border-slate-200 shadow-2xs",
    pill: "bg-white text-slate-800 border-slate-200 shadow-2xs",
  };

  // Specific appointment variant overrides:
  // Cancelled: User request "showed in book section in ca smile section with red box color"
  // Rescheduled: Dark Blue box
  // Follow-up: Purple box
  let effectiveCardBg = columnStyles.cardBg;
  let effectiveAvatarBg = columnStyles.avatarBg;

  if (isCancelled) {
    // RED BOX COLOR: User request
    effectiveCardBg =
      "bg-[#dc2626] border-2 border-red-500 hover:border-red-400 hover:bg-[#b91c1c] text-white shadow-lg ring-2 ring-red-400/40 dark:bg-red-950 dark:border-red-600";
    effectiveAvatarBg = "bg-white/20 text-white border-white/30 shadow-2xs backdrop-blur-xs";
  } else if (variant === "RESCHEDULED") {
    // Dark Blue Box
    effectiveCardBg =
      "bg-[#1e3a8a] border-2 border-blue-400 hover:border-blue-300 hover:bg-[#172554] text-white shadow-lg ring-2 ring-blue-400/40 dark:bg-blue-950 dark:border-blue-600";
    effectiveAvatarBg = "bg-white/20 text-white border-white/30 shadow-2xs backdrop-blur-xs";
  } else if (variant === "FOLLOW_UP") {
    // Purple Box
    effectiveCardBg =
      "bg-[#7e22ce] border-2 border-purple-400 hover:border-purple-300 hover:bg-[#6b21a8] text-white shadow-lg ring-2 ring-purple-300/40 dark:bg-purple-900 dark:border-purple-600";
    effectiveAvatarBg = "bg-white/20 text-white border-white/30 shadow-2xs backdrop-blur-xs";
  }

  const isSpecial = isCancelled || variant === "RESCHEDULED" || variant === "FOLLOW_UP";

  const cleanPhone = (appointment.phone || "").replace(/\D/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}`
    : null;

  const initialLetter = appointment.patientName
    ? appointment.patientName.trim().charAt(0).toLowerCase()
    : "p";

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only track primary (left) button
    if (e.button === 0) {
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      wasDraggedRef.current = false;
    }
  };

  const handleDragStartInternal = (e: React.DragEvent) => {
    wasDraggedRef.current = true;
    onDragStart(e);
  };

  const handleDragEndInternal = () => {
    wasDraggedRef.current = true;
    onDragEnd();
    // Keep wasDraggedRef true for 400ms to swallow any trailing synthetic click from drag-and-drop
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 400);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 1. If currently dragging or drag just finished, NEVER open details automatically!
    if (wasDraggedRef.current || isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 2. Check mouse movement distance between mousedown and click
    if (mouseDownPosRef.current) {
      const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
      if (dx > 5 || dy > 5) {
        // Drag or movement gesture detected, DO NOT open details
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    // 3. Clean stationary click on card body intentionally opens details
    onOpenDetails();
  };

  return (
    <div
      draggable
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onClick={handleCardClick}
      title="Click card to view full patient details, or drag to move column"
      className={`group relative rounded-xl border p-2.5 sm:p-3 shadow-2xs transition-all duration-200 cursor-pointer select-none ${
        effectiveCardBg
      } ${
        isDragging
          ? "opacity-35 scale-95 rotate-1 border-dashed shadow-none"
          : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Top Row: Avatar + Name on left, Time Badge on right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Avatar (compact 30px) */}
          <div
            className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg font-black text-xs uppercase border ${effectiveAvatarBg}`}
          >
            {initialLetter}
          </div>

          {/* Patient Name - Full space with no overlap */}
          <h3
            className={`font-bold text-sm leading-tight truncate ${
              isSpecial ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            {appointment.patientName}
          </h3>
        </div>

        {/* Time Badge - Compact top-right */}
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold shadow-2xs border shrink-0 ${
            isSpecial
              ? "bg-white/20 text-white border-white/25 backdrop-blur-xs"
              : "bg-white/95 text-slate-700 border-black/5 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Clock className={`h-2.5 w-2.5 ${isSpecial ? "text-white/80" : "text-slate-400"}`} />
          <span>{appointment.timeSlot}</span>
        </span>
      </div>

      {/* Middle Row: Phone + WhatsApp on left, Badges / Details link on right (Zero Overlap!) */}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        {/* Phone & WhatsApp */}
        <div className="flex items-center gap-1.5 min-w-0">
          <a
            href={`tel:${appointment.phone}`}
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors truncate ${
              isSpecial
                ? isCancelled
                  ? "text-red-100 hover:text-white"
                  : variant === "FOLLOW_UP"
                  ? "text-purple-100 hover:text-white"
                  : "text-blue-100 hover:text-white"
                : "text-slate-700 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            <Phone
              className={`h-3 w-3 shrink-0 ${
                isSpecial
                  ? isCancelled
                    ? "text-red-200"
                    : variant === "FOLLOW_UP"
                    ? "text-purple-200"
                    : "text-blue-200"
                  : "text-slate-400"
              }`}
            />
            <span className="truncate">{appointment.phone}</span>
          </a>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open WhatsApp chat"
              className={`inline-flex items-center shrink-0 transition-transform hover:scale-115 ${
                isSpecial ? "text-emerald-300 hover:text-emerald-100" : "text-emerald-600 hover:text-emerald-700"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Status Badge or Details Link on Right */}
        <div className="shrink-0 flex items-center gap-1">
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#dc2626] border border-red-200 shadow-2xs">
              <Ban className="h-2.5 w-2.5 text-[#dc2626] stroke-[2.5]" />
              <span>Cancelled</span>
            </span>
          ) : variant === "RESCHEDULED" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#1e3a8a] border border-blue-200 shadow-2xs">
              <RotateCcw className="h-2.5 w-2.5 text-[#1e3a8a]" />
              <span>Rescheduled</span>
            </span>
          ) : variant === "FOLLOW_UP" ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#7e22ce] border border-purple-200 shadow-2xs">
              <CalendarCheck2 className="h-2.5 w-2.5 text-[#7e22ce]" />
              <span>Follow-Up</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors"
            >
              <span>Details</span>
              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Treatment Tag + Doctor & Notes indicator (Essential info only) */}
      <div
        className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[11px] gap-2 ${
          isSpecial
            ? "border-white/15 text-white/90"
            : "border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400"
        }`}
      >
        {/* Treatment / Service */}
        <div className="flex items-center gap-1 min-w-0 max-w-[55%]">
          <Tag className="h-2.5 w-2.5 shrink-0 opacity-70" />
          <span className="truncate font-medium">
            {appointment.serviceName || "General Consultation"}
          </span>
        </div>

        {/* Doctor & Notes */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {appointment.notes && (
            <span
              title="Patient has clinical notes"
              className={`inline-flex items-center gap-0.5 text-[9.5px] font-semibold px-1 py-0.2 rounded border ${
                isSpecial ? "bg-white/20 text-white border-white/25" : "bg-white/60 text-slate-600 border-black/5"
              }`}
            >
              <FileText className="h-2 w-2" />
              <span>Note</span>
            </span>
          )}

          <div className="flex items-center gap-1 font-medium truncate max-w-[125px]">
            <Stethoscope className="h-2.5 w-2.5 shrink-0 opacity-70" />
            <span className="truncate">
              {appointment.doctor === "Any Available Specialist"
                ? "Any Doctor"
                : appointment.doctor || "Any Doctor"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
