"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Phone,
  User,
  ExternalLink,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CalendarCheck,
  RotateCcw,
  Ban,
  CalendarDays,
  Plus,
  Eye,
  Activity,
  UserCheck,
  Stethoscope,
  Sparkles,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormattedAppointment {
  id: string;
  patientId?: string;
  patientType?: string;
  patientName: string;
  childName?: string;
  guardianName?: string;
  phone: string;
  email?: string;
  service: string;
  doctor: string;
  date: string;
  rawDate: string; // YYYY-MM-DD
  rawStartTime: string; // ISO
  time: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "TREATMENT_STARTED"
    | "TREATMENT_DONE"
    | "DECLINED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW"
    | string;
  source: string;
  contactMethod?: string;
  notes?: string;
  cancellationReason?: string;
  rescheduledReason?: string;
}

const COMMON_SERVICES = [
  "Root Canal Treatment (Endodontics)",
  "Orthodontics & Invisible Braces",
  "Pediatric Dentistry & Child Care",
  "Teeth Whitening & Bleaching",
  "Dental Implants & Prosthetics",
  "General Dental Consultation & Checkup",
  "Cosmetic Smile Design & Veneers",
  "Periodontal Gum Treatment & Scaling",
  "Wisdom Tooth Surgical Extraction",
];

const DOCTORS_LIST = [
  "Dr. Sankar (Chief Dental Surgeon)",
  "Dr. Evelyn Reed (Endodontic Specialist)",
  "Dr. Sarah Chen (Pediatric Dentist)",
  "Dr. Marcus Vance (Orthodontist & Implantologist)",
];

export default function AdminAppointmentsPage() {
  const { data: session } = useSession();
  const performedBy = session?.user?.name || "Clinic Staff";

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Horizontal Calendar State
  // Initial anchor date: Today
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(
    new Date()
  );
  // Selected date filter (null = "All Dates" so all bookings show by default)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(
    null
  );

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [targetAptForReschedule, setTargetAptForReschedule] =
    useState<FormattedAppointment | null>(null);
  const [rescheduleNewDate, setRescheduleNewDate] = useState("");
  const [rescheduleNewTime, setRescheduleNewTime] = useState("10:00 AM");
  const [rescheduleDoctor, setRescheduleDoctor] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetAptForCancel, setTargetAptForCancel] =
    useState<FormattedAppointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // View Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [targetAptForDetails, setTargetAptForDetails] =
    useState<FormattedAppointment | null>(null);

  // New Booking Modal State
  const [newBookingModalOpen, setNewBookingModalOpen] = useState(false);
  const [isSubmittingNewBooking, setIsSubmittingNewBooking] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    patientType: "ADULT",
    serviceName: "General Dental Consultation & Checkup",
    preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
    date: new Date().toISOString().split("T")[0],
    timeRange: "10:30 AM",
    source: "WALK_IN",
    notes: "",
  });

  // Fetch live appointments from database
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments?limit=200");
      const data = await res.json();
      if (data.success && data.appointments) {
        const formatted: FormattedAppointment[] = data.appointments.map(
          (apt: any) => {
            const startTime = new Date(apt.startTime);
            const rawDate = startTime.toISOString().split("T")[0];
            return {
              id: apt.id,
              patientId: apt.patientId || apt.patient?.id,
              patientType: apt.patientType || "ADULT",
              patientName:
                apt.patientName ||
                (apt.patientType === "CHILD" && apt.childName
                  ? `${apt.childName} (Child)`
                  : apt.patient
                    ? `${apt.patient.firstName || ""} ${apt.patient.lastName && apt.patient.lastName !== "Patient" ? apt.patient.lastName : ""}`.trim()
                    : apt.childName || "Valued Patient"),
              childName: apt.childName,
              guardianName: apt.guardianName,
              phone: apt.patient?.phone || apt.phone || "",
              email: apt.patient?.email || apt.email || undefined,
              service: apt.service?.name || apt.reason || "Dental Consultation",
              doctor: apt.preferredDoctor || "Dr. Sankar (Chief Dental Surgeon)",
              date: startTime.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              rawDate,
              rawStartTime: startTime.toISOString(),
              time:
                apt.timeRange ||
                startTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                }),
              status: apt.status || "PENDING",
              source: apt.source || "WEB_FORM",
              contactMethod: apt.contactMethod,
              notes: apt.notes,
              cancellationReason: apt.cancellationReason,
              rescheduledReason: apt.rescheduledReason,
            };
          }
        );
        setAppointments(formatted);
      }
    } catch (err) {
      console.warn("Could not load appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Compute 7 days for horizontal calendar strip
  const horizontalCalendarDays = useMemo(() => {
    const days = [];
    const base = new Date(calendarAnchorDate);
    for (let i = 0; i < 7; i++) {
      const current = new Date(base);
      current.setDate(base.getDate() + i);

      const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = current.getDate();
      const isoDateString = current.toISOString().split("T")[0];

      // Real count of bookings for this day
      const count = appointments.filter(
        (apt) => apt.rawDate === isoDateString
      ).length;

      days.push({
        date: current,
        dayName,
        dayNumber,
        isoDateString,
        count,
      });
    }
    return days;
  }, [calendarAnchorDate, appointments]);

  const handlePrevWeek = () => {
    setCalendarAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCalendarAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCalendarAnchorDate(today);
    setSelectedCalendarDate(today.toISOString().split("T")[0]);
  };

  // 1. UPDATE STATUS (CONFIRM, CHECK_IN, TREATMENT_STARTED, COMPLETED)
  const handleUpdateStatus = async (
    aptId: string,
    newStatus: string,
    customReason?: string
  ) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          performedBy,
          reason:
            customReason ||
            `Status updated to ${newStatus} by clinical coordinator.`,
          forceOverride: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(
          `Appointment ${aptId} status updated to ${newStatus} successfully!`
        );
        fetchAppointments();
      } else {
        setActionErrorMsg(data.message || "Failed to update appointment status.");
      }
      setTimeout(() => {
        setActionSuccessMsg(null);
        setActionErrorMsg(null);
      }, 5000);
    } catch {
      setActionErrorMsg("Network error while updating appointment status.");
      setTimeout(() => setActionErrorMsg(null), 5000);
    }
  };

  // 2. OPEN RESCHEDULE MODAL
  const handleOpenReschedule = (apt: FormattedAppointment) => {
    setTargetAptForReschedule(apt);
    setRescheduleNewDate(apt.rawDate);
    setRescheduleNewTime(apt.time || "10:00 AM");
    setRescheduleDoctor(apt.doctor || "Dr. Sankar (Chief Dental Surgeon)");
    setRescheduleReason("");
    setRescheduleModalOpen(true);
  };

  // SUBMIT RESCHEDULE
  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAptForReschedule || !rescheduleNewDate) return;

    setIsSubmittingReschedule(true);
    setActionErrorMsg(null);

    try {
      let hour = 10;
      let minute = 0;
      if (
        rescheduleNewTime.includes("PM") &&
        !rescheduleNewTime.includes("12:")
      ) {
        const hMatch = rescheduleNewTime.match(/(\d+):?(\d*)/);
        if (hMatch) hour = (parseInt(hMatch[1], 10) % 12) + 12;
      } else if (rescheduleNewTime.includes("AM")) {
        const hMatch = rescheduleNewTime.match(/(\d+):?(\d*)/);
        if (hMatch) hour = parseInt(hMatch[1], 10) % 12;
      }

      const newStart = new Date(
        `${rescheduleNewDate}T${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}:00.000Z`
      );
      const newEnd = new Date(newStart.getTime() + 45 * 60000);

      const res = await fetch(
        `/api/appointments/${targetAptForReschedule.id}/reschedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
            preferredDoctor: rescheduleDoctor,
            reason:
              rescheduleReason.trim() ||
              "Patient requested new appointment schedule.",
            performedBy,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(
          `Appointment ${targetAptForReschedule.id} rescheduled successfully to ${rescheduleNewDate}!`
        );
        setRescheduleModalOpen(false);
        fetchAppointments();
      } else {
        setActionErrorMsg(data.message || "Failed to reschedule appointment.");
      }
      setTimeout(() => {
        setActionSuccessMsg(null);
        setActionErrorMsg(null);
      }, 5000);
    } catch {
      setActionErrorMsg("Network error while rescheduling appointment.");
      setTimeout(() => setActionErrorMsg(null), 5000);
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // 3. OPEN CANCEL MODAL
  const handleOpenCancel = (apt: FormattedAppointment) => {
    setTargetAptForCancel(apt);
    setCancellationReason("");
    setCancelModalOpen(true);
  };

  // SUBMIT CANCEL
  const handleSaveCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAptForCancel) return;

    setIsSubmittingCancel(true);
    setActionErrorMsg(null);

    try {
      const res = await fetch(
        `/api/appointments/${targetAptForCancel.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "CANCELLED",
            reason:
              cancellationReason.trim() ||
              "Cancelled by clinical coordinator or patient request.",
            performedBy,
            forceOverride: true,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(
          `Appointment ${targetAptForCancel.id} cancelled and updated in database.`
        );
        setCancelModalOpen(false);
        fetchAppointments();
      } else {
        setActionErrorMsg(data.message || "Failed to cancel appointment.");
      }
      setTimeout(() => {
        setActionSuccessMsg(null);
        setActionErrorMsg(null);
      }, 5000);
    } catch {
      setActionErrorMsg("Network error while cancelling appointment.");
      setTimeout(() => setActionErrorMsg(null), 5000);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // 4. SUBMIT NEW BOOKING MODAL
  const handleCreateNewBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingForm.fullName.trim() || !newBookingForm.phone.trim()) {
      setActionErrorMsg("Patient name and phone number are required.");
      return;
    }

    setIsSubmittingNewBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newBookingForm.fullName.trim(),
          phone: newBookingForm.phone.trim(),
          email: newBookingForm.email.trim() || undefined,
          patientType: newBookingForm.patientType,
          treatment: newBookingForm.serviceName,
          serviceName: newBookingForm.serviceName,
          preferredDoctor: newBookingForm.preferredDoctor,
          date: newBookingForm.date,
          timeRange: newBookingForm.timeRange,
          source: newBookingForm.source,
          notes: newBookingForm.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(
          `New appointment booked for ${newBookingForm.fullName} successfully!`
        );
        setNewBookingModalOpen(false);
        setNewBookingForm({
          fullName: "",
          phone: "",
          email: "",
          patientType: "ADULT",
          serviceName: "General Dental Consultation & Checkup",
          preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
          date: new Date().toISOString().split("T")[0],
          timeRange: "10:30 AM",
          source: "WALK_IN",
          notes: "",
        });
        fetchAppointments();
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        setActionErrorMsg(data.message || "Failed to create appointment.");
        setTimeout(() => setActionErrorMsg(null), 5000);
      }
    } catch {
      setActionErrorMsg("Network error while creating appointment.");
      setTimeout(() => setActionErrorMsg(null), 5000);
    } finally {
      setIsSubmittingNewBooking(false);
    }
  };


  // WhatsApp quick helper
  const getWhatsAppChatUrl = (apt: FormattedAppointment) => {
    const cleanPhone = apt.phone.replace(/\D/g, "");
    const formattedPhone =
      cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${apt.patientName}, this is VS Multispeciality Dental Clinic regarding your appointment request for ${apt.service} scheduled for ${apt.date} at ${apt.time}.`
    );
    return `https://wa.me/${formattedPhone}?text=${msg}`;
  };

  // Filtered Appointments List
  const filteredList = useMemo(() => {
    return appointments.filter((apt) => {
      // 1. Calendar Date Filter
      const matchesCalendarDate =
        selectedCalendarDate === null || apt.rawDate === selectedCalendarDate;

      // 2. Status Filter
      const matchesStatus =
        statusFilter === "ALL" || apt.status === statusFilter;

      // 3. Source Filter
      const matchesSource =
        sourceFilter === "ALL" ||
        (sourceFilter === "WHATSAPP"
          ? apt.source === "WHATSAPP" || apt.contactMethod === "WHATSAPP"
          : sourceFilter === "WEB_FORM"
            ? apt.source === "WEB_FORM"
            : apt.source !== "WHATSAPP" && apt.source !== "WEB_FORM");

      // 4. Search Query
      const matchesSearch =
        searchQuery === "" ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.phone.includes(searchQuery) ||
        apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesCalendarDate && matchesStatus && matchesSource && matchesSearch
      );
    });
  }, [
    appointments,
    selectedCalendarDate,
    statusFilter,
    sourceFilter,
    searchQuery,
  ]);

  // KPI Overview calculations
  const kpiStats = useMemo(() => {
    const todayIso = new Date().toISOString().split("T")[0];
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "PENDING").length;
    const confirmed = appointments.filter(
      (a) =>
        a.status === "CONFIRMED" ||
        a.status === "CHECKED_IN" ||
        a.status === "TREATMENT_STARTED"
    ).length;
    const completed = appointments.filter(
      (a) => a.status === "COMPLETED" || a.status === "TREATMENT_DONE"
    ).length;
    const todayCount = appointments.filter((a) => a.rawDate === todayIso).length;

    return { total, pending, confirmed, completed, todayCount };
  }, [appointments]);

  return (
    <div className="space-y-6 pb-20">
      {/* =================================================================== */}
      {/* TOP HEADER & ACTIONS                                                */}
      {/* =================================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              All Patient Bookings &amp; Schedules
            </h1>
            {kpiStats.pending > 0 && (
              <Badge className="bg-amber-500 font-bold text-white hover:bg-amber-600 animate-pulse">
                {kpiStats.pending} Needs Confirmation
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Real-time management for website booking forms, WhatsApp leads, phone requests, and in-clinic treatments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAppointments}
            disabled={loading}
            className="gap-1.5 text-xs text-stone-700 shadow-2xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          {/* Jump to Today */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            className="text-xs font-semibold text-brand-primary border-brand-primary/30 hover:bg-brand-primary/5"
          >
            Today
          </Button>


          {/* + Book New Appointment */}
          <Button
            size="sm"
            onClick={() => setNewBookingModalOpen(true)}
            className="gap-1.5 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Book New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccessMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="font-bold text-emerald-700 hover:text-emerald-900 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-semibold text-red-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{actionErrorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionErrorMsg(null)}
            className="font-bold text-red-700 hover:text-red-900 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* KPI METRIC CARDS                                                    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Bookings */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "ALL"
              ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary shadow-xs"
              : "border-stone-200 bg-white hover:border-stone-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Total Bookings</span>
            <CalendarCheck className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {kpiStats.total}
          </div>
          <p className="mt-0.5 text-[11px] text-stone-400">All registered slots</p>
        </div>

        {/* Pending Confirmation */}
        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "PENDING"
              ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500 shadow-xs"
              : "border-stone-200 bg-white hover:border-stone-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Pending Confirmation</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800">
            {kpiStats.pending}
          </div>
          <p className="mt-0.5 text-[11px] text-amber-600">Requires coordinator call</p>
        </div>

        {/* Confirmed / Active */}
        <div
          onClick={() => setStatusFilter("CONFIRMED")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "CONFIRMED"
              ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-xs"
              : "border-stone-200 bg-white hover:border-stone-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Confirmed / Active</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">
            {kpiStats.confirmed}
          </div>
          <p className="mt-0.5 text-[11px] text-emerald-600">Scheduled & verified</p>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter("COMPLETED")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            statusFilter === "COMPLETED"
              ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-xs"
              : "border-stone-200 bg-white hover:border-stone-300 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-700 font-medium">
            <span>Completed Care</span>
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-800">
            {kpiStats.completed}
          </div>
          <p className="mt-0.5 text-[11px] text-blue-600">Finished procedures</p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* HORIZONTAL CALENDAR STRIP                                           */}
      {/* =================================================================== */}
      <Card className="border border-stone-200 bg-white p-5 shadow-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-stone-900 sm:text-lg">
                Interactive Schedule Calendar
              </h2>
              <p className="text-xs text-stone-500">
                Click any day to filter, or keep &quot;All Dates&quot; to see every booking
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCalendarDate === null
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                }`}
              >
                All Dates ({appointments.length})
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Day Cards Row */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
            {horizontalCalendarDays.map((day) => {
              const isSelected = selectedCalendarDate === day.isoDateString;

              return (
                <button
                  key={day.isoDateString}
                  type="button"
                  onClick={() =>
                    setSelectedCalendarDate(
                      isSelected ? null : day.isoDateString
                    )
                  }
                  className={`flex flex-col items-center justify-center rounded-xl p-3 transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-brand-primary bg-brand-primary/10 shadow-xs ring-1 ring-brand-primary"
                      : "border border-stone-200 bg-stone-50/80 hover:border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      isSelected
                        ? "font-semibold text-brand-primary"
                        : "text-stone-500"
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span
                    className={`text-lg font-bold sm:text-xl ${
                      isSelected ? "text-brand-primary" : "text-stone-800"
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Real database booking count indicator */}
                  <span
                    className={`mt-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                      isSelected
                        ? "bg-brand-primary text-white"
                        : day.count > 0
                          ? "bg-stone-200 text-stone-700"
                          : "text-stone-400"
                    }`}
                  >
                    {day.count} {day.count === 1 ? "apt" : "apts"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* =================================================================== */}
      {/* SEARCH AND FILTERS BAR                                              */}
      {/* =================================================================== */}
      <Card className="border border-stone-200 bg-white shadow-xs">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by patient name, phone, service, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs text-stone-800 placeholder:text-stone-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-2xs"
              />
            </div>

            {/* Source Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
                Source:
              </span>
              {[
                { id: "ALL", label: "All Sources" },
                { id: "WEB_FORM", label: "Web Forms" },
                { id: "WHATSAPP", label: "WhatsApp" },
                { id: "WALK_IN", label: "Direct/Desk" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSourceFilter(s.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    sourceFilter === s.id
                      ? "bg-brand-primary text-white"
                      : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Tabs Row */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {[
              "ALL",
              "PENDING",
              "CONFIRMED",
              "CHECKED_IN",
              "TREATMENT_STARTED",
              "COMPLETED",
              "CANCELLED",
            ].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {st === "ALL"
                  ? "All Statuses"
                  : st === "PENDING"
                    ? "Pending"
                    : st === "CONFIRMED"
                      ? "Confirmed"
                      : st === "CHECKED_IN"
                        ? "Checked In"
                        : st === "TREATMENT_STARTED"
                          ? "In Chair"
                          : st === "COMPLETED"
                            ? "Completed"
                            : "Cancelled"}
                {st === "PENDING" && kpiStats.pending > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[9px] text-white">
                    {kpiStats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Calendar Filter Notice (Appears only if a date was specifically clicked) */}
      {selectedCalendarDate && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
            <span>
              Showing appointments filtered for:{" "}
              <strong>{selectedCalendarDate}</strong> ({filteredList.length}{" "}
              found)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCalendarDate(null)}
            className="font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer text-xs"
          >
            Clear Date Filter (Show All)
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* BOOKINGS LIST                                                       */}
      {/* =================================================================== */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse p-5">
              <div className="bg-stone-200 mb-2 h-5 w-48 rounded" />
              <div className="bg-stone-100 h-4 w-72 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border border-stone-200 bg-white p-12 text-center shadow-xs">
          <CalendarIcon className="mx-auto h-12 w-12 text-stone-300" />
          <h3 className="font-heading mt-3 text-base font-bold text-stone-900">
            No bookings found
          </h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            {selectedCalendarDate
              ? `There are no scheduled appointments on ${selectedCalendarDate}. You can view all bookings or schedule a new one.`
              : "No appointments match your active filters or search terms."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {selectedCalendarDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCalendarDate(null)}
                className="text-xs"
              >
                View All Bookings
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setNewBookingModalOpen(true)}
              className="text-xs bg-brand-primary text-white"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Book Appointment Now
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((apt) => (
            <Card
              key={apt.id}
              className={`hover:border-stone-400 shadow-xs transition-all ${
                apt.status === "PENDING"
                  ? "border-amber-300 bg-amber-50/25"
                  : apt.status === "CANCELLED"
                    ? "border-red-200 bg-red-50/15 opacity-80"
                    : apt.status === "CONFIRMED"
                      ? "border-emerald-200 bg-emerald-50/15"
                      : "border-stone-200 bg-white"
              }`}
            >
              <CardContent className="space-y-3 p-4 sm:p-5">
                {/* Header Row */}
                <div className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-2xs ${
                        apt.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : apt.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : apt.status === "CHECKED_IN"
                              ? "bg-blue-100 text-blue-800"
                              : apt.status === "TREATMENT_STARTED"
                                ? "bg-purple-100 text-purple-800"
                                : apt.status === "COMPLETED"
                                  ? "bg-teal-100 text-teal-800"
                                  : apt.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {apt.patientName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-sm font-bold text-stone-900 sm:text-base">
                          {apt.patientName}
                        </span>

                        {apt.source === "WHATSAPP" ||
                        apt.contactMethod === "WHATSAPP" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </span>
                        ) : apt.source === "WEB_FORM" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            Web Form
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                            Direct Intake
                          </span>
                        )}

                        {apt.patientType === "CHILD" ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Child Patient
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                            Adult
                          </span>
                        )}

                        {/* Status Badge */}
                        <Badge
                          className={`text-[10px] font-bold ${
                            apt.status === "PENDING"
                              ? "border-amber-400 bg-amber-100 text-amber-900"
                              : apt.status === "CONFIRMED"
                                ? "bg-emerald-600 text-white"
                                : apt.status === "CHECKED_IN"
                                  ? "bg-blue-600 text-white"
                                  : apt.status === "TREATMENT_STARTED"
                                    ? "bg-purple-600 text-white"
                                    : apt.status === "COMPLETED"
                                      ? "bg-teal-600 text-white"
                                      : apt.status === "CANCELLED"
                                        ? "bg-red-600 text-white"
                                        : "bg-stone-600 text-white"
                          }`}
                        >
                          {apt.status === "PENDING"
                            ? "Pending Confirmation"
                            : apt.status === "CONFIRMED"
                              ? "Confirmed"
                              : apt.status === "CHECKED_IN"
                                ? "Checked In at Clinic"
                                : apt.status === "TREATMENT_STARTED"
                                  ? "Treatment in Chair"
                                  : apt.status === "COMPLETED"
                                    ? "Completed"
                                    : apt.status}
                        </Badge>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-stone-400" />
                          <a
                            href={`tel:${apt.phone}`}
                            className="hover:underline hover:text-blue-600"
                          >
                            {apt.phone}
                          </a>
                        </span>
                        {apt.guardianName && (
                          <span>• Parent: {apt.guardianName}</span>
                        )}
                        {apt.email && (
                          <span>
                            •{" "}
                            <a
                              href={`mailto:${apt.email}`}
                              className="hover:underline"
                            >
                              {apt.email}
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between sm:flex-col sm:justify-center">
                    <span className="font-mono text-xs font-bold text-stone-400">
                      {apt.id.slice(-8).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetAptForDetails(apt);
                        setDetailsModalOpen(true);
                      }}
                      className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Service, Slot & Doctor */}
                <div className="grid grid-cols-1 gap-2 rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs sm:grid-cols-3">
                  <div>
                    <span className="block font-semibold text-stone-700">
                      Service / Procedure:
                    </span>
                    <span className="font-medium text-brand-primary">
                      {apt.service}
                    </span>
                  </div>

                  <div>
                    <span className="block font-semibold text-stone-700">
                      Appointment Slot:
                    </span>
                    <span className="flex items-center gap-1 font-medium text-stone-800">
                      <CalendarIcon className="h-3.5 w-3.5 text-stone-400" />
                      <strong>{apt.date}</strong> • {apt.time}
                    </span>
                  </div>

                  <div>
                    <span className="block font-semibold text-stone-700">
                      Assigned Specialist:
                    </span>
                    <span className="text-stone-600 font-medium">
                      {apt.doctor}
                    </span>
                  </div>
                </div>

                {/* Notes and Custom Details */}
                {apt.notes && (
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-800">
                    <strong>Inquiry &amp; Patient Notes:</strong> {apt.notes}
                  </div>
                )}

                {apt.cancellationReason && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
                    <strong>Cancellation Reason:</strong>{" "}
                    {apt.cancellationReason}
                  </div>
                )}

                {apt.rescheduledReason && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-800">
                    <strong>Rescheduled Notes:</strong> {apt.rescheduledReason}
                  </div>
                )}

                {/* ACTION BAR: CLINICAL WORKFLOW */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
                  {/* WhatsApp contact option */}
                  <div className="flex items-center gap-2">
                    {apt.phone && (
                      <a
                        href={getWhatsAppChatUrl(apt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#20ba59]"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat WhatsApp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Operational Management Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* CONFIRM APPOINTMENT */}
                    {apt.status === "PENDING" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(
                            apt.id,
                            "CONFIRMED",
                            "Confirmed verbally with patient by clinical coordinator."
                          )
                        }
                        className="gap-1.5 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm Appointment</span>
                      </Button>
                    )}

                    {/* CHECK IN (Patient Arrived) */}
                    {apt.status === "CONFIRMED" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(
                            apt.id,
                            "CHECKED_IN",
                            "Patient reported in clinic reception lounge."
                          )
                        }
                        className="gap-1.5 border-blue-300 bg-blue-50/70 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>Check In Patient</span>
                      </Button>
                    )}

                    {/* START TREATMENT */}
                    {(apt.status === "CONFIRMED" ||
                      apt.status === "CHECKED_IN") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(
                            apt.id,
                            "TREATMENT_STARTED",
                            "Dentist commenced procedure in chair."
                          )
                        }
                        className="gap-1.5 border-purple-300 bg-purple-50 text-xs font-semibold text-purple-800 hover:bg-purple-100"
                      >
                        <Activity className="h-3.5 w-3.5 text-purple-600" />
                        <span>Start Treatment</span>
                      </Button>
                    )}

                    {/* MARK COMPLETED */}
                    {apt.status === "TREATMENT_STARTED" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          handleUpdateStatus(
                            apt.id,
                            "COMPLETED",
                            "Dental procedure successfully completed and documented."
                          )
                        }
                        className="gap-1.5 bg-teal-600 text-xs font-bold text-white hover:bg-teal-700 shadow-2xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Complete Procedure</span>
                      </Button>
                    )}

                    {/* RESCHEDULE APPOINTMENT */}
                    {apt.status !== "CANCELLED" &&
                      apt.status !== "COMPLETED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReschedule(apt)}
                          className="gap-1.5 border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                        >
                          <Clock className="h-3.5 w-3.5 text-stone-500" />
                          <span>Reschedule</span>
                        </Button>
                      )}

                    {/* CANCEL APPOINTMENT */}
                    {apt.status !== "CANCELLED" &&
                      apt.status !== "COMPLETED" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCancel(apt)}
                          className="gap-1.5 border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Ban className="h-3.5 w-3.5 text-red-500" />
                          <span>Cancel</span>
                        </Button>
                      )}

                    {/* Completed feedback */}
                    {apt.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                        <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                        <span>Care Completed</span>
                      </span>
                    )}

                    {/* Cancelled feedback */}
                    {apt.status === "CANCELLED" && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-800">
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: BOOK NEW APPOINTMENT MODAL                                 */}
      {/* =================================================================== */}
      {newBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Book New Patient Appointment
                </h3>
                <p className="text-xs text-stone-500">
                  Register appointment in clinic schedule and calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewBookingModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewBooking} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={newBookingForm.fullName}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={newBookingForm.phone}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={newBookingForm.email}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Patient Classification
                  </label>
                  <select
                    value={newBookingForm.patientType}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        patientType: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="ADULT">Adult</option>
                    <option value="CHILD">Child / Pediatric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Dental Service / Procedure *
                </label>
                <select
                  value={newBookingForm.serviceName}
                  onChange={(e) =>
                    setNewBookingForm({
                      ...newBookingForm,
                      serviceName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  {COMMON_SERVICES.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Dentist / Specialist Assigned
                </label>
                <select
                  value={newBookingForm.preferredDoctor}
                  onChange={(e) =>
                    setNewBookingForm({
                      ...newBookingForm,
                      preferredDoctor: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  {DOCTORS_LIST.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.date}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={newBookingForm.timeRange}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        timeRange: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="9:30 AM">Morning (9:30 AM)</option>
                    <option value="10:30 AM">Morning (10:30 AM)</option>
                    <option value="11:30 AM">Morning (11:30 AM)</option>
                    <option value="2:00 PM">Afternoon (2:00 PM)</option>
                    <option value="3:30 PM">Afternoon (3:30 PM)</option>
                    <option value="5:00 PM">Evening (5:00 PM)</option>
                    <option value="6:30 PM">Evening (6:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Intake Channel
                  </label>
                  <select
                    value={newBookingForm.source}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        source: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="WALK_IN">Clinic Desk Walk-in</option>
                    <option value="PHONE">Telephone Booking</option>
                    <option value="WHATSAPP">WhatsApp Request</option>
                    <option value="WEB_FORM">Website Intake</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Special Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Toothache on left molar"
                    value={newBookingForm.notes}
                    onChange={(e) =>
                      setNewBookingForm({
                        ...newBookingForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewBookingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingNewBooking}
                  className="bg-brand-primary text-white font-bold"
                >
                  {isSubmittingNewBooking
                    ? "Saving to Database..."
                    : "Confirm & Schedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: VIEW APPOINTMENT DETAILS DRAWER                            */}
      {/* =================================================================== */}
      {detailsModalOpen && targetAptForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">
                  APPOINTMENT #{targetAptForDetails.id.slice(-8).toUpperCase()}
                </span>
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  {targetAptForDetails.patientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-stone-50 rounded-xl p-3 border border-stone-100">
                <div>
                  <span className="text-stone-400 block font-medium">Status</span>
                  <Badge className="mt-1 font-bold">
                    {targetAptForDetails.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-stone-400 block font-medium">Intake Channel</span>
                  <span className="font-semibold text-stone-800 block mt-1">
                    {targetAptForDetails.source}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 block font-medium">Phone</span>
                  <a
                    href={`tel:${targetAptForDetails.phone}`}
                    className="font-semibold text-stone-800 hover:underline hover:text-blue-600 block mt-0.5"
                  >
                    {targetAptForDetails.phone}
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block font-medium">Email</span>
                  <span className="text-stone-800 block mt-0.5">
                    {targetAptForDetails.email || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-stone-400 block font-medium">Scheduled Date</span>
                  <span className="font-semibold text-stone-800 block mt-0.5">
                    {targetAptForDetails.date}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block font-medium">Time Slot</span>
                  <span className="font-semibold text-stone-800 block mt-0.5">
                    {targetAptForDetails.time}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block font-medium">Assigned Doctor</span>
                <span className="font-semibold text-brand-primary block mt-0.5">
                  {targetAptForDetails.doctor}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block font-medium">Service Procedure</span>
                <span className="font-medium text-stone-800 block mt-0.5">
                  {targetAptForDetails.service}
                </span>
              </div>

              {targetAptForDetails.notes && (
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500 font-semibold block mb-0.5">
                    Inquiry Notes:
                  </span>
                  <p className="text-stone-700">{targetAptForDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <a
                href={getWhatsAppChatUrl(targetAptForDetails)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#20ba59]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat WhatsApp</span>
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailsModalOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: RESCHEDULE APPOINTMENT                                     */}
      {/* =================================================================== */}
      {rescheduleModalOpen && targetAptForReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-stone-900">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-stone-500">
                  Patient: {targetAptForReschedule.patientName} (Ref:{" "}
                  {targetAptForReschedule.id.slice(-8).toUpperCase()})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveReschedule}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  New Appointment Date *
                </label>
                <Input
                  type="date"
                  required
                  value={rescheduleNewDate}
                  onChange={(e) => setRescheduleNewDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  New Preferred Time / Slot *
                </label>
                <select
                  value={rescheduleNewTime}
                  onChange={(e) => setRescheduleNewTime(e.target.value)}
                  className="h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-800"
                >
                  <option value="9:30 AM">Morning (9:30 AM)</option>
                  <option value="10:30 AM">Morning (10:30 AM)</option>
                  <option value="11:30 AM">Morning (11:30 AM)</option>
                  <option value="2:00 PM">Afternoon (2:00 PM)</option>
                  <option value="3:30 PM">Afternoon (3:30 PM)</option>
                  <option value="5:00 PM">Evening (5:00 PM)</option>
                  <option value="6:30 PM">Evening (6:30 PM)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  Doctor / Specialist
                </label>
                <Input
                  value={rescheduleDoctor}
                  onChange={(e) => setRescheduleDoctor(e.target.value)}
                  placeholder="e.g. Dr. Sankar (Chief Dental Surgeon)"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  Reschedule Reason
                </label>
                <Input
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Patient requested morning shift or clinical conflict"
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingReschedule}
                  className="bg-blue-600 font-bold text-white hover:bg-blue-700"
                >
                  {isSubmittingReschedule
                    ? "Updating Database..."
                    : "Save & Reschedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: CANCEL APPOINTMENT                                         */}
      {/* =================================================================== */}
      {cancelModalOpen && targetAptForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-red-600">
                  Cancel Appointment
                </h3>
                <p className="text-xs text-stone-500">
                  Patient: {targetAptForCancel.patientName} (Ref:{" "}
                  {targetAptForCancel.id.slice(-8).toUpperCase()})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCancel} className="space-y-3.5 text-xs">
              <p className="text-xs text-stone-600">
                Are you sure you want to cancel this appointment? This action
                will update the status to CANCELLED in the database.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  Cancellation Reason (Optional)
                </label>
                <Input
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Patient called to cancel, unable to reach patient..."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(false)}
                >
                  Go Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingCancel}
                  className="bg-red-600 font-bold text-white hover:bg-red-700"
                >
                  {isSubmittingCancel
                    ? "Updating Database..."
                    : "Confirm Cancellation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
