"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  List,
  Calendar as CalendarIcon,
  Plus,
  Zap,
  Ban,
  Clock,
  ChevronDown,
  Search,
  Pencil,
  User,
  Users,
  Printer,
  FileText,
  Eye,
  Activity,
  RotateCcw,
  CalendarDays,
  Package,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Check,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";

const CANCELLATION_REASONS = [
  "Patient Request",
  "Doctor Unavailable",
  "Scheduling Conflict",
  "Emergency",
  "Duplicate Booking",
  "Other",
];
import { CuravertoBookAppointmentModal } from "./curaverto-book-appointment-modal";
import { CuravertoQuickBillModal } from "./curaverto-quick-bill-modal";
import { CuravertoEditRxModal } from "./curaverto-edit-rx-modal";
import { CuravertoEditPatientModal, PatientEditData } from "./curaverto-edit-patient-modal";
import { DatabaseStatusBadge } from "@/components/admin/database-status-badge";
import { CuravertoEditDoctorServiceModal } from "./curaverto-edit-doctor-service-modal";
import { CuravertoScheduleFollowUpModal } from "./curaverto-schedule-followup-modal";
import { CuravertoRescheduleAppointmentModal } from "./curaverto-reschedule-appointment-modal";
import { CuravertoCalendarViews } from "./curaverto-calendar-views";
import { CuravertoDoctorScheduleView } from "./curaverto-doctor-schedule-view";
import { CuravertoQueueManagerView } from "./curaverto-queue-manager-view";
import {
  subscribeToAppointmentUpdates,
  notifyAppointmentUpdate,
} from "@/lib/client-appointment-sync";

// Module-level fast cache for zero-delay instant render on mount/tab-switch
let appointmentsRowsMemoryCache: AppointmentRow[] = [];

interface AppointmentRow {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  age: string;
  phone: string;
  tag: string;
  hasTreatmentCostBtn?: boolean;
  doctorName: string;
  service: string;
  status: string;
  rawDate?: string;
  rawStatus?: string;
  isRescheduled?: boolean;
  isFollowUp?: boolean;
  dateOfBirth?: string;
  gender?: string;
  sex?: string;
  patientType?: string;
  bloodGroup?: string;
}

const getTodayIsoString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const shortenDoctorName = (name?: string | null): string => {
  if (!name) return "Dr. Deep Patel";
  return name
    .replace(/Dr\.\s*Deep\s+Arvindbhai\s+Patel/gi, "Dr. Deep Patel")
    .replace(/Deep\s+Arvindbhai\s+Patel/gi, "Dr. Deep Patel")
    .trim() || "Dr. Deep Patel";
};

const KNOWN_PATIENT_AGES: Record<string, string> = {
  "ketan prajapati": "44 yrs",
  "yash patel": "28 yrs",
  "amit vora": "33 yrs",
  "rina chauhan": "39 yrs",
  "vipul joshi": "51 yrs",
  "chirag lad": "11 yrs",
  "anandi": "34 yrs",
  "anandi 5": "34 yrs",
  "nitin mehta": "46 yrs",
  "priya shah": "29 yrs",
  "meena patel": "52 yrs",
  "rajesh kumar": "38 yrs",
  "bhavna desai": "35 yrs",
  "hitesh patel": "41 yrs",
  "pooja sharma": "27 yrs",
};

export const computePatientAge = (apt: any): string => {
  // 1. If patient has an explicit dateOfBirth
  const dobRaw = apt.patient?.dateOfBirth || apt.dateOfBirth;
  if (dobRaw) {
    const d = new Date(dobRaw);
    if (!isNaN(d.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age >= 0 && age < 120) {
        return `${age} yrs`;
      }
    }
  }

  // 2. If appointment has explicit age (e.g. from modal edit or DB)
  const explicitAge = apt.patient?.age || apt.age;
  if (explicitAge && typeof explicitAge === "string") {
    const match = explicitAge.match(/\d+/);
    if (match) {
      return `${match[0]} yrs`;
    }
  } else if (typeof explicitAge === "number" && !isNaN(explicitAge)) {
    return `${explicitAge} yrs`;
  }

  // Do NOT fabricate fake ages if not entered
  return "";
};

export function CuravertoAppointmentsView() {
  // Navigation tabs (Appointments, Doctor View, Queue Manager)
  const [topTab, setTopTab] = useState<"appointments" | "doctor" | "queue">(
    "appointments"
  );
  // Doctor View sub-tab: Today's Consultation Queue vs Schedule & Shifts
  const [doctorSubTab, setDoctorSubTab] = useState<"queue" | "schedule">("queue");

  // View mode: List vs Calendar
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Patient scope: Admin view
  const [patientScope, setPatientScope] = useState<"my" | "admin">("admin");

  // Appointments data rows
  const [rows, setRows] = useState<AppointmentRow[]>(() => appointmentsRowsMemoryCache);
  const [loading, setLoading] = useState(() => appointmentsRowsMemoryCache.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoString);
  const [filterByDate, setFilterByDate] = useState<boolean>(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Active appointment row
  const [activeRowId, setActiveRowId] = useState<string>("");

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Status filter (Admin view)
  const [statusFilter, setStatusFilter] = useState("All");

  // Booked filter (Admin view)
  const [bookedFilter, setBookedFilter] = useState("All");

  // Metric filter
  const [metricFilter, setMetricFilter] = useState<string>("total");

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isQuickBillOpen, setIsQuickBillOpen] = useState(false);
  const [isEditRxOpen, setIsEditRxOpen] = useState(false);
  const [activeRxRow, setActiveRxRow] = useState<AppointmentRow | null>(null);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [activePatientData, setActivePatientData] = useState<PatientEditData | null>(null);
  const [isEditDoctorServiceOpen, setIsEditDoctorServiceOpen] = useState(false);
  const [activeDoctorServiceRow, setActiveDoctorServiceRow] = useState<AppointmentRow | null>(null);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canDelete = !userRole || userRole === "ADMIN" || userRole === "DOCTOR";

  // Deletion State
  const [deletingRow, setDeletingRow] = useState<AppointmentRow | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Cancellation Modal State (Matching Image 2)
  const [cancellingRow, setCancellingRow] = useState<AppointmentRow | null>(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>("Patient Request");
  const [customCancelReason, setCustomCancelReason] = useState<string>("");

  // Schedule Follow-Up Modal State (Matches uploaded mockups)
  const [followUpRow, setFollowUpRow] = useState<AppointmentRow | null>(null);

  // Reschedule Appointment Modal State (Matches uploaded mockups)
  const [rescheduleRow, setRescheduleRow] = useState<AppointmentRow | null>(null);

  // Calendar sub-view
  const [calendarSubView, setCalendarSubView] = useState<
    "day" | "week" | "schedule"
  >("schedule");

  // Checkbox state for rows (Admin view)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleDeleteAppointment = async (row: AppointmentRow) => {
    try {
      setIsDeletingSingle(true);
      const res = await fetch(`/api/appointments/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        setSelectedRowIds((prev) => prev.filter((id) => id !== row.id));
        setDeletingRow(null);
      } else {
        alert(data.message || "Failed to delete appointment");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting appointment");
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${selectedRowIds.length} selected appointments? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      const res = await fetch("/api/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRowIds }),
      });
      const data = await res.json();
      if (data.success) {
        const deletedSet = new Set(selectedRowIds);
        setRows((prev) => prev.filter((r) => !deletedSet.has(r.id)));
        setSelectedRowIds([]);
        setSelectAll(false);
      } else {
        alert(data.message || "Failed to delete selected appointments");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting selected appointments");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest?.(".actions-split-dropdown")) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live appointments from API
  const fetchAppointments = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/appointments?limit=250");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.appointments)) {
          const mapped: AppointmentRow[] = data.appointments.map((apt: any) => {
            const start = new Date(apt.startTime);
            const timeFormatted = !isNaN(start.getTime())
              ? start.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "10:00 AM";

            let patientName = apt.patientName || "Valued Patient";
            if (apt.patient) {
              const full = `${apt.patient.firstName || ""} ${apt.patient.lastName || ""}`.trim();
              if (full) patientName = full;
            }

            const rawDate = !isNaN(start.getTime())
              ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
              : "";

            const rawS = (apt.status || "").toUpperCase();
            const notesLower = (apt.notes || "").toLowerCase();
            const reasonLower = (apt.reason || "").toLowerCase();
            const serviceLower = (apt.service?.name || apt.reason || "").toLowerCase();

            const isRescheduled =
              Boolean(apt.isRescheduled) ||
              Boolean((apt as any).rescheduledAt) ||
              rawS === "RESCHEDULED" ||
              notesLower.includes("reschedul") ||
              reasonLower.includes("reschedul");

            const isFollowUp =
              Boolean(apt.isFollowUp) ||
              rawS === "FOLLOW_UP" ||
              rawS === "FOLLOW-UP" ||
              notesLower.includes("follow-up") ||
              notesLower.includes("follow up") ||
              notesLower.includes("followup") ||
              notesLower.includes("revisit") ||
              reasonLower.includes("follow-up") ||
              reasonLower.includes("follow up") ||
              serviceLower.includes("follow-up") ||
              serviceLower.includes("follow up");

            let displayStatus = "Confirmed";
            if (rawS === "CONFIRMED") displayStatus = "Confirmed";
            else if (rawS === "CHECKED_IN" || rawS === "IN-CLINIC" || rawS === "IN_CLINIC" || rawS === "WAITING") displayStatus = "In-Clinic";
            else if (rawS === "TREATMENT_STARTED" || rawS === "IN_PROGRESS" || rawS === "CONSULTING") displayStatus = "Consulting";
            else if (rawS === "TREATMENT_DONE" || rawS === "COMPLETED" || rawS === "DONE") displayStatus = "Done";
            else if (rawS === "CANCELLED" || rawS === "DECLINED") displayStatus = "Cancelled";
            else if (rawS === "NO_SHOW") displayStatus = "No Show";
            else if (rawS === "RESCHEDULED") displayStatus = "Rescheduled";
            else if (rawS === "FOLLOW_UP" || rawS === "FOLLOW-UP") displayStatus = "Follow-up";
            else if (rawS === "PENDING" || rawS === "BOOKED" || !rawS) {
              if (isFollowUp) displayStatus = "Follow-up";
              else if (isRescheduled) displayStatus = "Rescheduled";
              else displayStatus = "Booked";
            } else {
              if (isFollowUp) displayStatus = "Follow-up";
              else if (isRescheduled) displayStatus = "Rescheduled";
              else displayStatus = "Booked";
            }

            return {
              id: apt.id,
              time: timeFormatted,
              patientName,
              patientId: apt.patient?.patientCode
                ? `#${apt.patient.patientCode}`
                : apt.patientCode
                ? `#${apt.patientCode}`
                : apt.patient?.id
                ? `#${apt.patient.id.slice(-4).toUpperCase()}`
                : `#00${apt.id.slice(-2)}`,
              age: computePatientAge(apt),
              phone: apt.patient?.phone || apt.phone || "",
              tag: isFollowUp ? "FOLLOW-UP" : isRescheduled ? "RESCHEDULED" : apt.source === "WALK_IN" ? "WALK-IN" : apt.source === "WEBSITE" ? "WEBSITE" : "BOOKED",
              hasTreatmentCostBtn: Boolean(apt.treatment || apt.treatmentSession),
              doctorName: shortenDoctorName(apt.preferredDoctor),
              service: apt.service?.name || apt.reason || "General Consultation",
              status: displayStatus,
              rawDate,
              rawStatus: apt.status,
              isRescheduled,
              isFollowUp,
              dateOfBirth: apt.patient?.dateOfBirth ? apt.patient.dateOfBirth.toString().split("T")[0] : apt.dateOfBirth || "",
              gender: apt.patient?.gender || apt.gender || "",
              sex: apt.patient?.gender || apt.gender || "",
              patientType: apt.patientType || "",
              bloodGroup: apt.patient?.bloodGroup || apt.patient?.bloodType || "",
            };
          });

          // Chronological sort
          mapped.sort((a, b) => {
            const parseTime = (t: string) => {
              const parts = t.trim().split(" ");
              const timePart = parts[0] || "12:00";
              const modifier = (parts[1] || "AM").toUpperCase();
              const [hStr, mStr] = timePart.split(":");
              let hours = Number(hStr) || 12;
              const minutes = Number(mStr) || 0;
              if (modifier === "PM" && hours < 12) hours += 12;
              if (modifier === "AM" && hours === 12) hours = 0;
              return hours * 60 + minutes;
            };
            return parseTime(a.time) - parseTime(b.time);
          });

          appointmentsRowsMemoryCache = mapped;
          setRows(mapped);
          setActiveRowId((prev) => (!prev && mapped.length > 0 ? mapped[0].id : prev));
        }
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  }, []);

  // Initial load + 3s auto-polling + event synchronization for real-time live synchronization
  useEffect(() => {
    fetchAppointments();

    const handleSync = () => {
      fetchAppointments();
    };

    const unsubscribe = subscribeToAppointmentUpdates(handleSync);
    const interval = setInterval(handleSync, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchAppointments]);

  // Update status handler for rows
  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: string,
    reason?: string
  ) => {
    // Close any open status dropdown menu instantly
    setOpenDropdownId(null);

    const statusMap: Record<string, string> = {
      Confirmed: "CONFIRMED",
      "In-Clinic": "CHECKED_IN",
      Consulting: "TREATMENT_STARTED",
      Done: "TREATMENT_DONE",
      Cancelled: "CANCELLED",
      Booked: "PENDING",
      "Follow-up": "FOLLOW_UP",
      Rescheduled: "RESCHEDULED",
    };
    const backendStatus = statusMap[newStatus] || newStatus.toUpperCase();

    // Optimistic UI update
    setRows((prev) =>
      prev.map((r) =>
        r.id === appointmentId
          ? {
              ...r,
              status: newStatus,
              rawStatus: backendStatus,
              tag:
                newStatus === "Booked"
                  ? r.isFollowUp
                    ? "FOLLOW-UP"
                    : r.isRescheduled
                    ? "RESCHEDULED"
                    : "BOOKED"
                  : backendStatus,
            }
          : r
      )
    );

    try {
      await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: backendStatus,
          performedBy: "Clinic Admin",
          forceOverride: true,
          reason,
        }),
      });

      // Broadcast real-time sync event across all tabs & components (e.g. CA Smile board)
      notifyAppointmentUpdate({
        id: appointmentId,
        status: backendStatus,
        reason,
        action: "status_changed",
        source: "APPOINTMENTS",
      });

      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }
  };

  const handleBookingComplete = () => {
    fetchAppointments();
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRowIds([]);
      setSelectAll(false);
    } else {
      setSelectedRowIds(rows.map((r) => r.id));
      setSelectAll(true);
    }
  };

  const toggleSelectRow = (id: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((rowId) => rowId !== id));
      setSelectAll(false);
    } else {
      const next = [...selectedRowIds, id];
      setSelectedRowIds(next);
      if (next.length === rows.length) {
        setSelectAll(true);
      }
    }
  };

  // Step selected date backwards or forwards by 1 day
  const handleStepDate = (direction: -1 | 1) => {
    const current = new Date(selectedDate);
    if (isNaN(current.getTime())) return;
    current.setDate(current.getDate() + direction);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
    setFilterByDate(true);
  };

  // Bulk Operations State & Handlers
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedRowIds.length === 0) return;
    setIsBulkProcessing(true);

    const statusMap: Record<string, string> = {
      Confirmed: "CONFIRMED",
      "In-Clinic": "CHECKED_IN",
      Consulting: "TREATMENT_STARTED",
      Done: "TREATMENT_DONE",
      Cancelled: "CANCELLED",
      Booked: "PENDING",
      "Follow-up": "FOLLOW_UP",
    };
    const backendStatus = statusMap[newStatus] || newStatus.toUpperCase();

    // Optimistically update matching rows
    setRows((prev) =>
      prev.map((r) =>
        selectedRowIds.includes(r.id)
          ? { ...r, status: newStatus, tag: backendStatus }
          : r
      )
    );

    try {
      await Promise.all(
        selectedRowIds.map((id) =>
          fetch(`/api/appointments/${id}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: backendStatus,
              performedBy: "Clinic Admin (Bulk)",
              forceOverride: true,
            }),
          }).catch((err) => console.error("Error updating appointment status:", err))
        )
      );
      setSelectedRowIds([]);
      setSelectAll(false);

      notifyAppointmentUpdate({
        status: backendStatus,
        action: "bulk_status_changed",
        source: "APPOINTMENTS",
      });

      await fetchAppointments();
    } catch (err) {
      console.error("Bulk status update failed:", err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkCancel = async () => {
    if (
      !window.confirm(
        `Are you sure you want to cancel ${selectedRowIds.length} selected appointments?`
      )
    ) {
      return;
    }
    await handleBulkUpdateStatus("Cancelled");
  };

  // Open Edit Rx Modal
  const openEditRx = (row: AppointmentRow) => {
    setActiveRxRow(row);
    setIsEditRxOpen(true);
    setOpenDropdownId(null);
  };

  // Open Edit Doctor & Service Modal
  const openEditDoctorService = (row: AppointmentRow) => {
    setActiveDoctorServiceRow(row);
    setIsEditDoctorServiceOpen(true);
    setOpenDropdownId(null);
  };

  const handleDoctorServiceUpdated = (
    appointmentId: string,
    newDoctor: string,
    newService: string
  ) => {
    const safeDoctor = shortenDoctorName(newDoctor);
    setRows((prev) =>
      prev.map((r) =>
        r.id === appointmentId
          ? { ...r, doctorName: safeDoctor, service: newService }
          : r
      )
    );
  };

  const openEditPatient = (row: AppointmentRow) => {
    const numericAge = row.age ? parseInt(row.age, 10) : NaN;
    const isChild =
      (row.age && row.age.toLowerCase().includes("child")) ||
      (!isNaN(numericAge) && numericAge < 18);

    setActivePatientData({
      id: row.id,
      patientNumber: row.patientId?.replace("#", "") || "",
      patientId: row.patientId,
      patientName: row.patientName,
      fullName: row.patientName,
      phone: row.phone || "",
      dateOfBirth: row.dateOfBirth || "",
      patientType: row.patientType || (isChild ? "Child" : ""),
      age: row.age || "",
      sex: row.gender || row.sex || "",
      bloodGroup: row.bloodGroup || "",
      leadSource:
        row.tag === "WALK-IN"
          ? "Walk-in"
          : row.tag === "WEBSITE"
          ? "Website Booking"
          : "",
      addressLine: "",
      locality: "",
      city: "",
      state: "",
      pin: "",
      appointmentId: row.id,
      appointmentTime: row.time,
      appointmentDate: row.rawDate || getTodayIsoString(),
    });
    setIsEditPatientOpen(true);
    setOpenDropdownId(null);
  };

  const handlePatientSaved = (updated: PatientEditData) => {
    let savedAge = "";
    if (updated.dateOfBirth) {
      const d = new Date(updated.dateOfBirth);
      if (!isNaN(d.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        if (age >= 0 && age < 120) savedAge = `${age} yrs`;
      }
    }
    if (!savedAge && updated.age) {
      const match = updated.age.match(/\d+/);
      if (match) savedAge = `${match[0]} yrs`;
    }

    setRows((prev) =>
      prev.map((r) => {
        if (
          r.id === updated.id ||
          r.id === updated.appointmentId ||
          r.patientId === updated.patientId
        ) {
          return {
            ...r,
            patientName: updated.fullName || updated.patientName || r.patientName,
            phone: updated.phone || r.phone,
            patientId: updated.patientNumber ? `#${updated.patientNumber}` : r.patientId,
            age: savedAge || r.age || "",
            time: updated.appointmentTime || r.time,
            rawDate: updated.appointmentDate || r.rawDate,
          };
        }
        return r;
      })
    );
    fetchAppointments();
  };

  // Smart Lifecycle Status Action Helpers
  const getNextStatusAction = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "booked" || s === "pending") {
      return {
        label: "Confirm",
        nextStatus: "Confirmed",
        icon: Check,
        bgClass: "bg-emerald-600 hover:bg-emerald-700",
        borderClass: "border-emerald-500/50",
        canAdvance: true,
      };
    }
    if (s === "confirmed") {
      return {
        label: "In-Clinic",
        nextStatus: "In-Clinic",
        icon: Clock,
        bgClass: "bg-amber-600 hover:bg-amber-700",
        borderClass: "border-amber-500/50",
        canAdvance: true,
      };
    }
    if (s === "in-clinic" || s === "checked_in" || s === "in clinic") {
      return {
        label: "Consulting",
        nextStatus: "Consulting",
        icon: Stethoscope,
        bgClass: "bg-indigo-600 hover:bg-indigo-700",
        borderClass: "border-indigo-500/50",
        canAdvance: true,
      };
    }
    if (
      s === "consulting" ||
      s === "treatment_started" ||
      s === "in_progress" ||
      s === "in progress"
    ) {
      return {
        label: "Consulting",
        nextStatus: "Done",
        icon: Stethoscope,
        bgClass: "bg-blue-600 hover:bg-blue-700",
        borderClass: "border-blue-500/50",
        canAdvance: true,
      };
    }
    if (s === "done" || s === "treatment_done" || s === "completed") {
      return {
        label: "Done",
        nextStatus: null,
        icon: CheckCircle2,
        bgClass: "bg-emerald-50 text-emerald-700 border border-emerald-300",
        borderClass: "border-emerald-300",
        canAdvance: false,
      };
    }
    if (s === "cancelled" || s === "declined") {
      return {
        label: "Cancelled",
        nextStatus: null,
        icon: Ban,
        bgClass: "bg-rose-50 text-rose-700 border border-rose-200",
        borderClass: "border-rose-200",
        canAdvance: false,
      };
    }
    if (s === "follow-up" || s === "follow_up") {
      return {
        label: "Confirm",
        nextStatus: "Confirmed",
        icon: Check,
        bgClass: "bg-[#7e22ce] hover:bg-[#6b21a8]",
        borderClass: "border-purple-500/50",
        canAdvance: true,
      };
    }
    if (s === "rescheduled") {
      return {
        label: "Confirm",
        nextStatus: "Confirmed",
        icon: Check,
        bgClass: "bg-[#1e3a8a] hover:bg-[#172554]",
        borderClass: "border-blue-400/50",
        canAdvance: true,
      };
    }
    return {
      label: status,
      nextStatus: "Confirmed",
      icon: RotateCcw,
      bgClass: "bg-purple-600 hover:bg-purple-700",
      borderClass: "border-purple-500/50",
      canAdvance: true,
    };
  };

  const renderActionSplitButton = (row: AppointmentRow) => {
    const isMenuOpen = openDropdownId === row.id;
    const action = getNextStatusAction(row.status);

    return (
      <div className="relative inline-flex items-center rounded-xl shadow-2xs shrink-0 actions-split-dropdown">
        {/* Primary Action Button */}
        {action.canAdvance ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (action.nextStatus) {
                handleUpdateStatus(row.id, action.nextStatus);
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-l-xl ${action.bgClass} px-3.5 py-2 text-xs font-bold text-white transition-all whitespace-nowrap active:scale-[0.98]`}
            title={`Advance status to ${action.nextStatus}`}
          >
            <action.icon className="h-3.5 w-3.5 shrink-0" />
            <span>{action.label}</span>
          </button>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded-l-xl ${action.bgClass} px-3.5 py-2 text-xs font-bold whitespace-nowrap`}
          >
            <action.icon className="h-3.5 w-3.5 shrink-0" />
            <span>{action.label}</span>
          </span>
        )}

        {/* Side Arrow: Dropdown trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdownId(isMenuOpen ? null : row.id);
          }}
          className={`rounded-r-xl border-l ${action.borderClass} ${
            action.canAdvance
              ? action.bgClass
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          } px-2 py-2 text-white transition-colors`}
          title="More status options & actions"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 ${
              action.canAdvance ? "text-white" : "text-slate-600"
            } transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl transition-all"
          >
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Change Status
            </div>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                handleUpdateStatus(row.id, "Booked");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <span>Mark Booked</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                handleUpdateStatus(row.id, "Confirmed");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>Mark Confirmed</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                handleUpdateStatus(row.id, "In-Clinic");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Mark In-Clinic</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                handleUpdateStatus(row.id, "Consulting");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <Stethoscope className="h-3.5 w-3.5 text-indigo-600" />
              <span>Start Consulting</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                handleUpdateStatus(row.id, "Done");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Mark Done</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                setFollowUpRow(row);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-purple-600" />
              <span>Schedule Follow-up</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                setRescheduleRow(row);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>Reschedule Appointment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenDropdownId(null);
                setCancellingRow(row);
                setSelectedCancelReason("Patient Request");
                setCustomCancelReason("");
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <Ban className="h-3.5 w-3.5 text-rose-600" />
              <span>Cancel Appointment</span>
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  setOpenDropdownId(null);
                  setDeletingRow(row);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-1.5 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors border-t border-slate-100"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                <span>Delete Appointment</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Active scope rows for counters:
  // When filterByDate is true (TODAY or specific date), calculate exact real counts for that date.
  // When filterByDate is false (ALL dates), calculate counts across all appointments.
  const activeBaseRows = filterByDate
    ? rows.filter((r) => r.rawDate === selectedDate)
    : rows;

  const metricCounts = {
    total: activeBaseRows.length,
    booked: activeBaseRows.filter(
      (r) =>
        r.status === "Booked" ||
        r.rawStatus === "PENDING" ||
        r.rawStatus === "BOOKED" ||
        ((r.status === "Follow-up" || r.status === "Rescheduled") &&
          r.rawStatus !== "CONFIRMED" &&
          r.rawStatus !== "CHECKED_IN" &&
          r.rawStatus !== "TREATMENT_STARTED" &&
          r.rawStatus !== "TREATMENT_DONE" &&
          r.rawStatus !== "CANCELLED")
    ).length,
    confirmed: activeBaseRows.filter(
      (r) => r.status === "Confirmed" || r.rawStatus === "CONFIRMED"
    ).length,
    "in-clinic": activeBaseRows.filter(
      (r) =>
        r.status === "In-Clinic" ||
        r.rawStatus === "CHECKED_IN" ||
        r.rawStatus === "IN-CLINIC" ||
        r.rawStatus === "WAITING"
    ).length,
    done: activeBaseRows.filter(
      (r) =>
        r.status === "Done" ||
        r.rawStatus === "COMPLETED" ||
        r.rawStatus === "TREATMENT_DONE" ||
        r.rawStatus === "DONE"
    ).length,
    cancelled: activeBaseRows.filter(
      (r) =>
        r.status === "Cancelled" ||
        r.rawStatus === "DECLINED" ||
        r.rawStatus === "CANCELLED"
    ).length,
    "follow-up": activeBaseRows.filter(
      (r) =>
        r.status.toLowerCase() === "follow-up" ||
        r.rawStatus === "FOLLOW_UP" ||
        r.tag === "FOLLOW-UP" ||
        r.service?.toLowerCase().includes("follow")
    ).length,
  };

  // Formatted date string for display (DD/MM/YYYY)
  const displayDateFormatted = (() => {
    const [y, m, d] = selectedDate.split("-");
    if (d && m && y) return `${d}/${m}/${y}`;
    return selectedDate;
  })();

  // Live filter rows based on search, date, and status
  const filteredRows = rows.filter((row) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match =
        row.patientName.toLowerCase().includes(q) ||
        row.phone.includes(q) ||
        row.patientId.toLowerCase().includes(q) ||
        row.service.toLowerCase().includes(q) ||
        row.doctorName.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterByDate && row.rawDate) {
      if (row.rawDate !== selectedDate) {
        return false;
      }
    }

    if (statusFilter !== "All") {
      if (statusFilter === "Follow-up") {
        const isFollowUp =
          row.status.toLowerCase() === "follow-up" ||
          row.rawStatus === "FOLLOW_UP" ||
          row.tag === "FOLLOW-UP" ||
          row.service?.toLowerCase().includes("follow");
        if (!isFollowUp) return false;
      } else if (statusFilter === "Rescheduled") {
        const isRescheduled =
          row.status.toLowerCase() === "rescheduled" ||
          row.rawStatus === "RESCHEDULED" ||
          Boolean((row as any).rescheduledAt);
        if (!isRescheduled) return false;
      } else if (statusFilter.toLowerCase() === "booked") {
        const isBookedOrInitial =
          row.status.toLowerCase() === "booked" ||
          row.rawStatus === "PENDING" ||
          row.rawStatus === "BOOKED" ||
          ((row.status.toLowerCase() === "follow-up" || row.status.toLowerCase() === "rescheduled") &&
            row.rawStatus !== "CONFIRMED" &&
            row.rawStatus !== "CHECKED_IN" &&
            row.rawStatus !== "TREATMENT_STARTED" &&
            row.rawStatus !== "TREATMENT_DONE" &&
            row.rawStatus !== "CANCELLED");
        if (!isBookedOrInitial) return false;
      } else if (row.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
    }

    if (bookedFilter !== "All") {
      if (bookedFilter === "Walk-in" && row.tag !== "WALK-IN") return false;
      if (bookedFilter === "Website" && row.tag !== "WEBSITE") return false;
      if (bookedFilter === "Booked" && row.tag !== "BOOKED") return false;
    }

    return true;
  });

  // Today's Doctor Queue rows (In-Clinic and Counseling patients)
  const doctorQueueRows = rows.filter((row) => {
    const now = new Date();
    const todayDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
    const defaultDateStr = now.toISOString().split("T")[0];
    const isToday =
      row.rawDate === todayDateStr ||
      row.rawDate === defaultDateStr ||
      row.rawDate === selectedDate;
    if (!isToday) return false;

    const isInClinicOrCounseling =
      row.status === "In-Clinic" ||
      row.rawStatus === "CHECKED_IN" ||
      row.status === "Consulting" ||
      row.rawStatus === "TREATMENT_STARTED" ||
      row.rawStatus === "IN_TREATMENT" ||
      row.status === "Counseling";
    return isInClinicOrCounseling;
  });

  return (
    <div
      className="min-h-screen bg-[#f8fafc]/60 pb-16 font-sans text-slate-800 antialiased"
    >
      <div className="mx-auto max-w-[1520px] px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
        {/* =================================================================== */}
        {/* 1. TOP SUB-NAVIGATION TABS                                          */}
        {/* =================================================================== */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setTopTab("appointments")}
              className={`relative pb-3 text-sm font-semibold transition-colors ${
                topTab === "appointments"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              Appointments
              {topTab === "appointments" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTopTab("doctor")}
              className={`relative pb-3 text-sm transition-colors inline-flex items-center gap-1.5 ${
                topTab === "doctor"
                  ? "text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span>Doctor View</span>
              {topTab === "doctor" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTopTab("queue")}
              className={`relative pb-3 text-sm transition-colors ${
                topTab === "queue"
                  ? "text-slate-900 font-semibold"
                  : "text-slate-500 hover:text-slate-700 font-medium"
              }`}
            >
              Queue Manager
              {topTab === "queue" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
              )}
            </button>
          </nav>
        </div>

        {/* Tab 1: Appointments List & Calendar */}
        {topTab === "appointments" && (
          <>
            {/* =================================================================== */}
            {/* 2. TITLE ROW & ACTION BUTTONS                                       */}
            {/* =================================================================== */}
            <div className="mt-5 space-y-4">
          {/* Header Title with Live Badge & Dynamic Subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
                Appointments
              </h1>
              <DatabaseStatusBadge size="sm" />
              <button
                type="button"
                onClick={() => fetchAppointments(true)}
                title="Refresh Appointments"
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-slate-500">
              Manage today&apos;s patient flow, billing, and clinical notes.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Switcher: List / Calendar */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-[#0f172a] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`inline-flex items-center gap-1.5 border-l border-slate-200 px-3.5 py-2 text-xs font-semibold transition-colors ${
                  viewMode === "calendar"
                    ? "bg-[#0f172a] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            {/* + Book Button */}
            <button
              type="button"
              onClick={() => setIsBookModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#047857] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#065f46] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Book</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. SEARCH & FILTER CARD                                             */}
        {/* =================================================================== */}
        <div className="mt-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs p-4 sm:p-5 space-y-4">
          {/* Top Row: Search Input & Date Box */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, phone, doctor, or service..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Date Box: < | ALL | TODAY | Calendar Date Picker | > */}
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleStepDate(-1)}
                className="px-2 py-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200"
                title="Previous Day"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterByDate(false);
                }}
                className={`px-3 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                  !filterByDate
                    ? "bg-[#0f172a] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
                title="View all appointments across all dates"
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(getTodayIsoString());
                  setFilterByDate(true);
                }}
                className={`border-l border-slate-200 px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                  filterByDate && selectedDate === getTodayIsoString()
                    ? "bg-[#0f172a] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                TODAY
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = dateInputRef.current;
                  if (!input) return;
                  if (typeof (input as any).showPicker === "function") {
                    (input as any).showPicker();
                  } else {
                    input.focus();
                  }
                }}
                className={`border-l border-slate-200 px-3.5 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterByDate && selectedDate !== getTodayIsoString()
                    ? "bg-[#0f172a] text-white font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                title="Filter by specific date"
              >
                <span>{displayDateFormatted}</span>
                <CalendarIcon className={`h-3.5 w-3.5 ${filterByDate && selectedDate !== getTodayIsoString() ? "text-white" : "text-slate-400"}`} />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setFilterByDate(true);
                  }
                }}
                className="sr-only"
              />
              <button
                type="button"
                onClick={() => handleStepDate(1)}
                className="px-2 py-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors border-l border-slate-200"
                title="Next Day"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: STATUS Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[70px]">
                  STATUS:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All", count: activeBaseRows.length },
                    {
                      label: "Booked",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status === "Booked" ||
                          r.rawStatus === "PENDING" ||
                          r.rawStatus === "BOOKED" ||
                          ((r.status === "Follow-up" || r.status === "Rescheduled") &&
                            r.rawStatus !== "CONFIRMED" &&
                            r.rawStatus !== "CHECKED_IN" &&
                            r.rawStatus !== "TREATMENT_STARTED" &&
                            r.rawStatus !== "TREATMENT_DONE" &&
                            r.rawStatus !== "CANCELLED")
                      ).length,
                    },
                    {
                      label: "Confirmed",
                      count: activeBaseRows.filter(
                        (r) => r.status === "Confirmed" || r.rawStatus === "CONFIRMED"
                      ).length,
                    },
                    {
                      label: "In-Clinic",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status === "In-Clinic" ||
                          r.rawStatus === "CHECKED_IN" ||
                          r.rawStatus === "IN-CLINIC" ||
                          r.rawStatus === "WAITING"
                      ).length,
                    },
                    {
                      label: "Consulting",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status === "Consulting" ||
                          r.rawStatus === "TREATMENT_STARTED" ||
                          r.rawStatus === "IN_PROGRESS" ||
                          r.rawStatus === "CONSULTING"
                      ).length,
                    },
                    {
                      label: "Done",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status === "Done" ||
                          r.rawStatus === "COMPLETED" ||
                          r.rawStatus === "TREATMENT_DONE" ||
                          r.rawStatus === "DONE"
                      ).length,
                    },
                    {
                      label: "Cancelled",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status === "Cancelled" ||
                          r.rawStatus === "DECLINED" ||
                          r.rawStatus === "CANCELLED"
                      ).length,
                    },
                    {
                      label: "Follow-up",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status.toLowerCase() === "follow-up" ||
                          r.rawStatus === "FOLLOW_UP" ||
                          r.tag === "FOLLOW-UP" ||
                          r.service?.toLowerCase().includes("follow")
                      ).length,
                    },
                    {
                      label: "Rescheduled",
                      count: activeBaseRows.filter(
                        (r) =>
                          r.status.toLowerCase() === "rescheduled" ||
                          r.rawStatus === "RESCHEDULED" ||
                          Boolean((r as any).rescheduledAt)
                      ).length,
                    },
                  ].map((item) => {
                    const isActive = statusFilter === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setStatusFilter(item.label)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs transition-colors ${
                          isActive
                            ? "bg-[#0f172a] font-bold text-white shadow-2xs"
                            : "bg-slate-100 font-medium text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.count > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                              isActive
                                ? "bg-slate-800 text-white"
                                : "bg-slate-200/80 text-slate-600"
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
        </div>

        {/* =================================================================== */}
        {/* 5A. VIEW MODE: CALENDAR / SCHEDULE VIEW (DAY, WEEK, SCHEDULE)       */}
        {/* =================================================================== */}
        {viewMode === "calendar" && (
          <CuravertoCalendarViews
            appointments={filteredRows}
            selectedDate={selectedDate}
            onBookClick={() => setIsBookModalOpen(true)}
            onQuickBillClick={() => setIsQuickBillOpen(true)}
          />
        )}

        {/* =================================================================== */}
        {/* 5B. VIEW MODE: LIST VIEW                                            */}
        {/* =================================================================== */}
        {viewMode === "list" && (
          <div className="mt-5 overflow-visible rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            {/* Horizontal scroll container so table never gets squished on smaller screens */}
            <div className="overflow-x-auto">
              <div className="min-w-[960px]">
                  {/* Table Header Columns */}
                  <div className="grid grid-cols-[130px_minmax(280px,1.2fr)_minmax(220px,1fr)_120px_200px] items-center gap-4 border-b border-slate-200/80 bg-[#f8fafc] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>TIME</span>
                    </div>
                    <div>PATIENT</div>
                    <div>DOCTOR & SERVICE</div>
                    <div>STATUS</div>
                    <div className="text-right pr-4">ACTIONS</div>
                  </div>

                  {/* Subheader: Dynamic counts & active filters */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-2.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    <span>
                      {filterByDate && selectedDate === getTodayIsoString()
                        ? `TODAY'S APPOINTMENTS · ${filteredRows.length}`
                        : !filterByDate
                        ? `ALL APPOINTMENTS · ${filteredRows.length}`
                        : `APPOINTMENTS (${displayDateFormatted}) · ${filteredRows.length}`}
                      {statusFilter !== "All" && ` · STATUS: ${statusFilter.toUpperCase()}`}
                      {searchQuery && ` · SEARCH: "${searchQuery}"`}
                    </span>
                    {filteredRows.length > 0 && (
                      <span className="text-[10px] font-medium text-slate-400 lowercase tracking-normal hidden sm:inline">
                        synced with queue manager
                      </span>
                    )}
                  </div>

                  {/* Patient Rows for Admin View */}
                  <div className="divide-y divide-slate-100">
                    {filteredRows.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                          <CalendarIcon className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800">
                          No Appointments Found
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          {searchQuery || statusFilter !== "All" || bookedFilter !== "All"
                            ? "No appointments match your active search or filters. Click below to reset filters or schedule a new patient."
                            : "There are currently no patient appointments scheduled for this date. Click below to add one."}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          {(searchQuery || statusFilter !== "All" || bookedFilter !== "All" || !filterByDate || selectedDate !== getTodayIsoString()) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("All");
                                setBookedFilter("All");
                                setMetricFilter("total");
                                setSelectedDate(getTodayIsoString());
                                setFilterByDate(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                              <span>Reset Filters</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsBookModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#065f46] transition-all hover:scale-[1.02]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Book Appointment</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      filteredRows.map((row) => {
                        const isChecked = selectedRowIds.includes(row.id);
                        const isMenuOpen = openDropdownId === row.id;

                        const isReschedRow = Boolean(row.isRescheduled) || row.status.toLowerCase() === "rescheduled";
                        const isFollowUpRow = Boolean(row.isFollowUp) || row.status.toLowerCase() === "follow-up";

                        let rowBorderClass = "border-l-[3.5px] border-[#6366f1]";
                        let rowBgClass = "hover:bg-slate-50/60";

                        if (isFollowUpRow) {
                          rowBorderClass = "border-l-[5px] border-l-[#7e22ce]";
                          rowBgClass = "bg-purple-50/45 hover:bg-purple-100/50";
                        } else if (isReschedRow) {
                          rowBorderClass = "border-l-[5px] border-l-[#1e3a8a]";
                          rowBgClass = "bg-blue-50/45 hover:bg-blue-100/50";
                        }

                        return (
                          <div
                            key={row.id}
                            className={`relative grid grid-cols-[130px_minmax(280px,1.2fr)_minmax(220px,1fr)_120px_200px] items-center gap-4 ${rowBorderClass} px-6 py-4 transition-colors ${rowBgClass}`}
                          >
                            {/* Checkbox & Time Badge */}
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => toggleSelectRow(row.id, e)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="inline-block whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                {row.time}
                              </span>
                            </div>

                            {/* Patient Column */}
                            <div className="space-y-1">
                              {/* Line 1: Patient Name, ID, Age, Action Icons */}
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="font-bold text-sm text-slate-900 cursor-pointer hover:underline hover:text-blue-600 transition-colors whitespace-nowrap">
                                  {row.patientName}
                                </span>
                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                  {row.patientId}
                                </span>
                                {row.age ? (
                                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {row.age}
                                  </span>
                                ) : null}

                                {/* Edit Patient Icon */}
                                <button
                                  type="button"
                                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                                  title="Edit patient"
                                  onClick={() => openEditPatient(row)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Line 2: [Set treatment cost] + Phone + Tag */}
                              <div className="flex items-center gap-2 text-xs pt-0.5">
                                {row.hasTreatmentCostBtn && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveRxRow(row);
                                      setIsQuickBillOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-2xs"
                                  >
                                    <span>Set treatment cost</span>
                                  </button>
                                )}
                                <span className="font-mono text-slate-400">
                                  {row.phone}
                                </span>
                                <span
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                    isFollowUpRow
                                      ? "bg-[#7e22ce]/15 text-[#7e22ce] border border-purple-300"
                                      : isReschedRow
                                      ? "bg-[#1e3a8a]/15 text-[#1e3a8a] border border-blue-300"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {isFollowUpRow ? "FOLLOW-UP" : isReschedRow ? "RESCHEDULED" : row.tag}
                                </span>
                              </div>
                            </div>

                            {/* Doctor & Service Column (Clickable to Edit) */}
                            <div
                              onClick={() => openEditDoctorService(row)}
                              className="group cursor-pointer rounded-xl p-1.5 -m-1.5 hover:bg-blue-50/70 transition-colors"
                              title="Click to change Doctor & Service"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                  {row.doctorName}
                                </span>
                                <Pencil className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity group-hover:text-blue-600" />
                              </div>
                              <div className="mt-0.5 text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                                {row.service}
                              </div>
                            </div>

                            {/* Status Column */}
                            <div>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap transition-all ${
                                  row.status.toLowerCase() === "confirmed"
                                    ? "border-emerald-200/80 bg-[#e8f8f0] text-emerald-700"
                                    : row.status.toLowerCase() === "in-clinic"
                                    ? "border-amber-200/80 bg-amber-50 text-amber-700"
                                    : row.status.toLowerCase() === "done"
                                    ? "border-amber-200/80 bg-amber-50 text-amber-700"
                                    : row.status.toLowerCase() === "cancelled"
                                    ? "border-rose-200/80 bg-rose-50 text-rose-700"
                                    : row.status.toLowerCase() === "follow-up"
                                    ? "border-2 border-purple-500 bg-[#7e22ce] text-white shadow-xs font-black"
                                    : row.status.toLowerCase() === "rescheduled"
                                    ? "border-2 border-blue-500 bg-[#1e3a8a] text-white shadow-xs font-black cursor-pointer hover:bg-[#172554]"
                                    : "border-slate-300/80 bg-slate-50 text-slate-800"
                                }`}
                                onClick={() => setRescheduleRow(row)}
                                title="Click to reschedule appointment"
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    row.status.toLowerCase() === "confirmed"
                                      ? "bg-emerald-500"
                                      : row.status.toLowerCase() === "in-clinic"
                                      ? "bg-amber-500"
                                      : row.status.toLowerCase() === "done"
                                      ? "bg-amber-500"
                                      : row.status.toLowerCase() === "cancelled"
                                      ? "bg-rose-500"
                                      : row.status.toLowerCase() === "follow-up"
                                      ? "bg-white"
                                      : row.status.toLowerCase() === "rescheduled"
                                      ? "bg-white"
                                      : "bg-slate-600"
                                  }`}
                                />
                                {row.status}
                              </span>
                            </div>

                          {/* Actions Column: Smart Lifecycle Action Split Button ⌵ */}
                          <div
                            className="flex items-center justify-end pr-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {renderActionSplitButton(row)}
                          </div>
                        </div>
                      );
                    }))}
                  </div>
                </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Tab 2: Doctor View (Unified Single Place for Doctor Queue & Schedule) */}
        {topTab === "doctor" && (
          <div className="mt-5 space-y-5">
            {/* Header & Sub-tab switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Doctor View
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    <Stethoscope className="h-3 w-3" />
                    Clinical Hub
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  {doctorSubTab === "queue"
                    ? "Today's Consultation Queue: Showing in-clinic and counseling patients."
                    : "Doctor Schedule: Manage weekly shift availability, clinic locations, and vacations."}
                </p>
              </div>

              {/* Sub-tab toggle */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDoctorSubTab("queue")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    doctorSubTab === "queue"
                      ? "bg-[#0f172a] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Consultation Queue</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorSubTab("schedule")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    doctorSubTab === "schedule"
                      ? "bg-[#0f172a] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Schedule & Shifts</span>
                </button>
              </div>
            </div>

            {/* Sub-view 1: Consultation Queue (Doctor Section) */}
            {doctorSubTab === "queue" && (
              <div className="overflow-visible rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <div className="min-w-[880px]">
                    {/* Table Header: TIME | PATIENT | SERVICE | ACTIONS */}
                    <div className="grid grid-cols-[130px_minmax(300px,1.2fr)_minmax(220px,1fr)_200px] items-center gap-4 border-b border-slate-200/80 bg-[#f8fafc] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <div>TIME</div>
                      <div>PATIENT</div>
                      <div>SERVICE</div>
                      <div className="text-right pr-4">ACTIONS</div>
                    </div>

                    {/* Patient Rows for Consultation Queue */}
                    <div className="divide-y divide-slate-100">
                      {doctorQueueRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                          <h3 className="font-bold text-sm text-slate-800">
                            No Patients in Queue Right Now
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Patients checked in at reception (In-Clinic or Counseling) will appear here immediately for consultation.
                          </p>
                        </div>
                      ) : (
                        doctorQueueRows.map((row) => {
                          const isActiveRow = activeRowId === row.id;

                          return (
                            <div
                              key={row.id}
                              onClick={() => setActiveRowId(row.id)}
                              className={`group relative grid grid-cols-[130px_minmax(300px,1.2fr)_minmax(220px,1fr)_200px] items-center gap-4 px-6 py-4 transition-all cursor-pointer ${
                                isActiveRow
                                  ? "border-l-[3.5px] border-blue-600 bg-blue-50/15"
                                  : "border-l-[3.5px] border-transparent hover:border-slate-300 hover:bg-slate-50/60"
                              }`}
                            >
                              {/* 1. TIME */}
                              <div className="flex items-center gap-2">
                                <span className="inline-block whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 group-hover:bg-slate-200/70 transition-colors">
                                  {row.time}
                                </span>
                                {isActiveRow && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                )}
                              </div>

                              {/* 2. PATIENT */}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <span className="font-bold text-sm text-slate-900 cursor-pointer hover:underline hover:text-blue-600 transition-colors whitespace-nowrap">
                                    {row.patientName}
                                  </span>
                                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                    {row.patientId}
                                  </span>
                                  {row.age ? (
                                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                      {row.age}
                                    </span>
                                  ) : null}
                                  <button
                                    type="button"
                                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Edit patient"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditPatient(row);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs pt-0.5 text-slate-500">
                                  {row.hasTreatmentCostBtn && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsQuickBillOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-2xs hover:border-blue-400"
                                    >
                                      <span>Set treatment cost</span>
                                    </button>
                                  )}
                                  <span className="font-mono text-slate-400">
                                    {row.phone}
                                  </span>
                                  <span
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                      row.tag === "BOOKED"
                                        ? "bg-sky-50 text-sky-700 border border-sky-200/80 font-bold"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {row.tag}
                                  </span>
                                </div>
                              </div>

                              {/* 3. SERVICE */}
                              <div>
                                <span className="text-sm font-medium text-slate-800">
                                  {row.service}
                                </span>
                              </div>

                              {/* 4. ACTIONS */}
                              <div
                                className="flex items-center justify-end pr-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {renderActionSplitButton(row)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view 2: Doctor Schedule & Shifts */}
            {doctorSubTab === "schedule" && (
              <CuravertoDoctorScheduleView />
            )}
          </div>
        )}

        {/* Tab 3: Queue Manager (Live Queue & Waiting-room TVs) */}
        {topTab === "queue" && (
          <div className="mt-6">
            <CuravertoQueueManagerView />
          </div>
        )}

        {/* Book Appointment Modal Flow */}
        <CuravertoBookAppointmentModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          selectedDate={selectedDate}
          onBookingComplete={handleBookingComplete}
        />

        {/* Quick Bill Modal */}
        <CuravertoQuickBillModal
          isOpen={isQuickBillOpen}
          onClose={() => setIsQuickBillOpen(false)}
          patientName={activeRxRow?.patientName || "Ketan Prajapati"}
          service={activeRxRow?.service || "Root Canal Treatment: Molar"}
        />

        {/* Edit Rx Prescription Modal */}
        <CuravertoEditRxModal
          isOpen={isEditRxOpen}
          onClose={() => setIsEditRxOpen(false)}
          patientName={activeRxRow?.patientName || "Ketan Prajapati"}
          patientId={activeRxRow?.patientId || "#00013"}
          age={activeRxRow?.age || ""}
          service={activeRxRow?.service || "Root Canal Treatment: Molar"}
        />

        {/* Edit Patient Modal (Matches Screenshots 1 & 2) */}
        <CuravertoEditPatientModal
          isOpen={isEditPatientOpen}
          onClose={() => setIsEditPatientOpen(false)}
          patient={activePatientData}
          onSaved={handlePatientSaved}
        />

        {/* Change Doctor & Service Modal */}
        <CuravertoEditDoctorServiceModal
          isOpen={isEditDoctorServiceOpen}
          onClose={() => {
            setIsEditDoctorServiceOpen(false);
            setActiveDoctorServiceRow(null);
          }}
          appointment={activeDoctorServiceRow}
          onUpdated={handleDoctorServiceUpdated}
        />

        {/* Schedule Follow-Up Modal (Exact match to uploaded mockups) */}
        <CuravertoScheduleFollowUpModal
          isOpen={Boolean(followUpRow)}
          onClose={() => setFollowUpRow(null)}
          appointment={followUpRow}
          onBooked={(newAppointment, originalId) => {
            handleUpdateStatus(originalId, "Follow-up");
            fetchAppointments();
          }}
        />

        {/* Reschedule Appointment Modal (Exact match to uploaded mockups) */}
        <CuravertoRescheduleAppointmentModal
          isOpen={Boolean(rescheduleRow)}
          onClose={() => setRescheduleRow(null)}
          appointment={rescheduleRow}
          onRescheduled={(appointmentId, newDate, newTime, doctor) => {
            setRows((prev) =>
              prev.map((r) =>
                r.id === appointmentId
                  ? {
                      ...r,
                      status: "Rescheduled",
                      tag: "RESCHEDULED",
                      time: newTime,
                      doctorName: doctor,
                      date: newDate,
                    }
                  : r
              )
            );
            fetchAppointments();
          }}
        />

        {/* Cancel Appointment Modal (Exact match to Image 2) */}
        {cancellingRow && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={() => setCancellingRow(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-rose-500 shrink-0">
                    <Ban className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                      Cancel Appointment
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {cancellingRow.patientName} {cancellingRow.patientId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingRow(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-500 font-normal leading-relaxed">
                Select a reason for cancellation. This will be logged against the appointment.
              </p>

              {/* Reason Options (Matching Image 2 rounded buttons) */}
              <div className="mt-4 space-y-2.5">
                {CANCELLATION_REASONS.map((reason) => {
                  const isSelected = selectedCancelReason === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedCancelReason(reason)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-2 border-slate-800 bg-slate-50/80 text-slate-900 shadow-2xs"
                          : "border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}

                {/* Custom input for 'Other' */}
                {selectedCancelReason === "Other" && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={customCancelReason}
                      onChange={(e) => setCustomCancelReason(e.target.value)}
                      placeholder="Enter custom cancellation reason..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-all"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingRow(null)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs text-center"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const finalReason =
                      selectedCancelReason === "Other" && customCancelReason.trim()
                        ? `Other: ${customCancelReason.trim()}`
                        : selectedCancelReason;
                    await handleUpdateStatus(cancellingRow.id, "Cancelled", finalReason);
                    setCancellingRow(null);
                  }}
                  className="flex-1 rounded-2xl bg-[#f87171] hover:bg-rose-500 py-3 px-4 text-xs font-bold text-white transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Confirm Cancel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Bulk Action Bar (Visible when rows are selected) */}
        {topTab === "appointments" && selectedRowIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-150">
            <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold">
                {selectedRowIds.length}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Selected
              </span>
            </div>

            <button
              type="button"
              disabled={isBulkProcessing}
              onClick={() => handleBulkUpdateStatus("Confirmed")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Mark Confirmed</span>
            </button>

            <button
              type="button"
              disabled={isBulkProcessing}
              onClick={() => handleBulkUpdateStatus("In-Clinic")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Mark In-Clinic</span>
            </button>

            <button
              type="button"
              disabled={isBulkProcessing}
              onClick={() => handleBulkUpdateStatus("Done")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Done</span>
            </button>

            <button
              type="button"
              disabled={isBulkProcessing}
              onClick={handleBulkCancel}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>

            {canDelete && (
              <button
                type="button"
                disabled={isBulkProcessing || isBulkDeleting}
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                title="Permanently delete selected appointments"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isBulkDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedRowIds([]);
                setSelectAll(false);
              }}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors"
              title="Deselect all rows"
            >
              Deselect All
            </button>
          </div>
        )}

        {/* Delete Appointment Modal */}
        {deletingRow && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
            onClick={() => setDeletingRow(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Delete Appointment?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to permanently delete the appointment for{" "}
                    <span className="font-semibold text-slate-800">
                      {deletingRow.patientName}
                    </span>{" "}
                    on{" "}
                    <span className="font-semibold text-slate-800">
                      {deletingRow.rawDate || "scheduled date"} at {deletingRow.time}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeletingSingle}
                  onClick={() => setDeletingRow(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingSingle}
                  onClick={() => handleDeleteAppointment(deletingRow)}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isDeletingSingle ? "Deleting..." : "Confirm Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

