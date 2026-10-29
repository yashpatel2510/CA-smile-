"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CalendarCheck,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Phone,
  MessageCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
  Globe,
  Sparkles,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  ChevronDown,
  AlertTriangle,
  Bell,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface TodayAppointment {
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
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "TREATMENT_STARTED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | string;
  source: "WEBSITE" | "WHATSAPP" | "WALK_IN" | "PHONE" | "WEB_FORM" | string;
  notes?: string;
  reason?: string;
  checkedInAt?: string | null;
  treatmentStartedAt?: string | null;
  waitingMinutes: number;
  paidAmount: string;
  totalAmount: string;
  paymentStatus: string;
}

interface ExistingPatient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  condition?: string;
  totalVisits?: number;
}

interface TodayMetrics {
  total: number;
  website: number;
  whatsapp: number;
  walkIn: number;
  waiting: number;
  inChair: number;
  completed: number;
  pending: number;
  notThere?: number;
  confirmed?: number;
}

const COMMON_SERVICES = [
  "General Dental Consultation & Checkup",
  "Root Canal Treatment (Endodontics)",
  "Teeth Cleaning & Scaling (Prophylaxis)",
  "Orthodontics & Invisible Braces",
  "Pediatric Dentistry & Child Care",
  "Teeth Whitening & Bleaching",
  "Dental Implants & Prosthetics",
  "Emergency Toothache Relief",
  "Periodontal Gum Treatment & Scaling",
];

const DOCTORS_LIST = [
  "Dr. Sankar (Chief Dental Surgeon)",
  "Dr. Evelyn Reed (Endodontic Specialist)",
  "Dr. Sarah Chen (Pediatric Dentist)",
  "Dr. Marcus Vance (Orthodontist & Implantologist)",
  "Any Available Specialist",
];

export function TodayBookingsDesk() {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [metrics, setMetrics] = useState<TodayMetrics>({
    total: 0,
    website: 0,
    whatsapp: 0,
    walkIn: 0,
    waiting: 0,
    inChair: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Reordering Drag & Drop State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    appointment: TodayAppointment | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    appointment: null,
  });

  // Modal: Add New Booking / Existing Patient
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patientMode, setPatientMode] = useState<"EXISTING" | "NEW">("EXISTING");
  const [existingPatients, setExistingPatients] = useState<ExistingPatient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<ExistingPatient | null>(null);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    serviceName: COMMON_SERVICES[0],
    doctor: DOCTORS_LIST[0],
    source: "WALK_IN", // "WALK_IN" | "WHATSAPP" | "WEBSITE" | "PHONE"
    status: "CHECKED_IN", // Defaults to Waiting in Lounge
    position: "bottom", // "top" or "bottom"
    notes: "",
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status dropdown toggle for patient cards (Lounge, Chair, Done, Confirmed, Not There)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Revisit / Follow-up Booking Modal State (Opens when receptionist marks patient as Done)
  const [revisitModal, setRevisitModal] = useState<{
    isOpen: boolean;
    appointment: TodayAppointment | null;
  }>({
    isOpen: false,
    appointment: null,
  });

  const [revisitForm, setRevisitForm] = useState({
    date: "",
    timeSlot: "11:00 AM",
    serviceName: "",
    doctor: "",
    notes: "",
    submitting: false,
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Submit Revisit Booking
  const handleBookRevisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisitModal.appointment) return;
    setRevisitForm((prev) => ({ ...prev, submitting: true }));

    try {
      const apt = revisitModal.appointment;
      const payload = {
        patientId: apt.patientId,
        firstName: apt.patientName.split(" ")[0],
        lastName: apt.patientName.split(" ").slice(1).join(" ") || "",
        phone: apt.phone,
        email: apt.email,
        serviceName: revisitForm.serviceName || `${apt.serviceName} (Revisit)`,
        doctor: revisitForm.doctor || apt.doctor,
        targetDate: revisitForm.date,
        timeSlot: revisitForm.timeSlot,
        status: "CONFIRMED",
        source: "WALK_IN",
        notes: `Revisit / Follow-up booked from Reception Desk for visit on ${selectedDate}. ${revisitForm.notes}`,
      };

      const res = await fetch("/api/admin/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to book revisit appointment");
      }

      showToast(`Revisit confirmed for ${apt.patientName} on ${revisitForm.date}!`, "success");
      setRevisitModal({ isOpen: false, appointment: null });
    } catch (err: any) {
      showToast(err.message || "Failed to book revisit", "error");
    } finally {
      setRevisitForm((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Close context menu & status dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
      setOpenDropdownId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu.visible]);

  // 1. Fetch Today Appointments
  const fetchTodayAppointments = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/today?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const list: TodayAppointment[] = data.appointments || [];
          setAppointments(list);
          if (data.metrics) setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load today appointments:", err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 300);
      }
    }
  }, [selectedDate]);

  // Fetch all appointments for Horizontal Calendar day counts
  const [calendarAppointments, setCalendarAppointments] = useState<any[]>([]);

  const fetchCalendarAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments?limit=250");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.appointments)) {
          setCalendarAppointments(data.appointments);
        }
      }
    } catch {
      // Safe fail
    }
  }, []);

  useEffect(() => {
    fetchTodayAppointments();
    fetchCalendarAppointments();
    // Auto-refresh queue every 15 seconds
    const interval = setInterval(() => {
      fetchTodayAppointments();
      fetchCalendarAppointments();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchTodayAppointments, fetchCalendarAppointments]);

  // 2. Fetch Existing Patients List when search modal opens
  const fetchExistingPatients = useCallback(async (searchQuery = "") => {
    setSearchingPatients(true);
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.patients || [];
        setExistingPatients(list);
      }
    } catch (err) {
      console.error("Error fetching existing patients:", err);
    } finally {
      setSearchingPatients(false);
    }
  }, []);

  useEffect(() => {
    if (isAddModalOpen && patientMode === "EXISTING") {
      fetchExistingPatients(patientSearchTerm);
    }
  }, [isAddModalOpen, patientMode, patientSearchTerm, fetchExistingPatients]);

  // 3. Move Patient in Queue (Action: MOVE_UP, MOVE_DOWN, MOVE_TOP, MOVE_BOTTOM)
  const handleMoveQueue = async (appointmentId: string, action: "MOVE_UP" | "MOVE_DOWN" | "MOVE_TOP" | "MOVE_BOTTOM") => {
    // Optimistic UI reordering
    setAppointments((prev) => {
      const list = [...prev];
      const idx = list.findIndex((a) => a.id === appointmentId);
      if (idx === -1) return prev;

      if (action === "MOVE_UP" && idx > 0) {
        const temp = list[idx - 1];
        list[idx - 1] = list[idx];
        list[idx] = temp;
      } else if (action === "MOVE_DOWN" && idx < list.length - 1) {
        const temp = list[idx + 1];
        list[idx + 1] = list[idx];
        list[idx] = temp;
      } else if (action === "MOVE_TOP") {
        const [item] = list.splice(idx, 1);
        list.unshift(item);
      } else if (action === "MOVE_BOTTOM") {
        const [item] = list.splice(idx, 1);
        list.push(item);
      }
      return list.map((item, index) => ({ ...item, tokenNumber: index + 1 }));
    });

    try {
      const res = await fetch("/api/admin/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          appointmentId,
          date: selectedDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to reorder queue");
      showToast("Queue priority updated!", "success");
    } catch (err: any) {
      console.error(err);
      fetchTodayAppointments();
    }
  };

  // 4. Update Appointment Status
  const handleUpdateStatus = async (appointmentId: string, status: string, openRevisitIfDone = false) => {
    const targetApt = appointments.find((a) => a.id === appointmentId);

    // Instant optimistic update for live appointments
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );

    // Instant optimistic update for horizontal calendar strip
    setCalendarAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );

    // Instant optimistic update for metrics counters
    setMetrics((prev) => {
      const isCurrentlyPending = targetApt?.status === "PENDING";
      const isTargetConfirmed = status === "CONFIRMED";
      return {
        ...prev,
        pending: isCurrentlyPending && isTargetConfirmed ? Math.max(0, prev.pending - 1) : prev.pending,
        confirmed: isCurrentlyPending && isTargetConfirmed ? (prev.confirmed || 0) + 1 : prev.confirmed,
      };
    });

    try {
      const res = await fetch("/api/admin/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          appointmentId,
          status,
          date: selectedDate,
        }),
      });
      if (res.ok) {
        if (status === "NO_SHOW") {
          showToast(`Marked ${targetApt?.patientName || "patient"} as Not There (No-Show)`, "error");
        } else {
          showToast(`Status updated to ${status.replace("_", " ")}!`, "success");
        }
        fetchTodayAppointments();

        // If marked Done (COMPLETED), open the Revisit / Follow-up Booking modal!
        if (status === "COMPLETED" && openRevisitIfDone && targetApt) {
          const defaultRevisit = new Date();
          defaultRevisit.setDate(defaultRevisit.getDate() + 7);
          const defaultRevisitStr = defaultRevisit.toISOString().split("T")[0];

          setRevisitForm({
            date: defaultRevisitStr,
            timeSlot: targetApt.timeSlot || "11:00 AM",
            serviceName: `${targetApt.serviceName} (Revisit / Sitting 2)`,
            doctor: targetApt.doctor,
            notes: `Follow-up after visit on ${selectedDate}`,
            submitting: false,
          });
          setRevisitModal({
            isOpen: true,
            appointment: targetApt,
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      fetchTodayAppointments();
    }
  };

  // 5. Drag & Drop Reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragOverId) setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentList = [...appointments];
    const fromIndex = currentList.findIndex((a) => a.id === draggedId);
    const toIndex = currentList.findIndex((a) => a.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedItem] = currentList.splice(fromIndex, 1);
      currentList.splice(toIndex, 0, movedItem);

      const updatedList = currentList.map((item, idx) => ({
        ...item,
        tokenNumber: idx + 1,
      }));
      setAppointments(updatedList);

      const newOrder = updatedList.map((a) => a.id);
      try {
        await fetch("/api/admin/today", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "REORDER",
            newOrder,
            date: selectedDate,
          }),
        });
        showToast("Queue arrival order saved!", "success");
      } catch (err) {
        console.error(err);
      }
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  // 6. Handle Right-Click Context Menu ("wising hold mous right buttone")
  const handleContextMenu = (e: React.MouseEvent, apt: TodayAppointment) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 240),
      y: Math.min(e.clientY, window.innerHeight - 300),
      appointment: apt,
    });
  };

  // 7. Submit Add Booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBooking(true);

    try {
      const payload: any = {
        source: newBooking.source,
        status: newBooking.status,
        serviceName: newBooking.serviceName,
        doctor: newBooking.doctor,
        position: newBooking.position,
        targetDate: selectedDate,
        notes: newBooking.notes,
      };

      if (patientMode === "EXISTING" && selectedExistingPatient) {
        payload.patientId = selectedExistingPatient.id;
        payload.firstName = selectedExistingPatient.firstName;
        payload.lastName = selectedExistingPatient.lastName;
        payload.phone = selectedExistingPatient.phone;
        payload.email = selectedExistingPatient.email;
      } else {
        if (!newBooking.firstName || !newBooking.phone) {
          throw new Error("Patient name and phone number are required.");
        }
        payload.firstName = newBooking.firstName;
        payload.lastName = newBooking.lastName;
        payload.phone = newBooking.phone;
        payload.email = newBooking.email;
      }

      const res = await fetch("/api/admin/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add booking");
      }

      showToast(`Added ${payload.firstName} to Today's Queue!`, "success");
      setIsAddModalOpen(false);
      setSelectedExistingPatient(null);
      setNewBooking({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        serviceName: COMMON_SERVICES[0],
        doctor: DOCTORS_LIST[0],
        source: "WALK_IN",
        status: "CHECKED_IN",
        position: "bottom",
        notes: "",
      });
      fetchTodayAppointments();
    } catch (err: any) {
      showToast(err.message || "Failed to add patient", "error");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Separate pending vs confirmed appointments (Pending shown in Red Pop-Up, Confirmed in today queue)
  const pendingAppointments = appointments.filter((apt) => apt.status === "PENDING");
  const confirmedAppointments = appointments.filter((apt) => apt.status !== "PENDING");

  // Filter confirmed appointments for today's live queue list
  const filteredAppointments = confirmedAppointments.filter((apt) => {
    const matchesSearch =
      searchTerm === "" ||
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `#${apt.tokenNumber}`.includes(searchTerm);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CONFIRMED" && apt.status === "CONFIRMED") ||
      (statusFilter === "WAITING" && apt.status === "CHECKED_IN") ||
      (statusFilter === "IN_CHAIR" && (apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS")) ||
      (statusFilter === "COMPLETED" && (apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE")) ||
      (statusFilter === "NO_SHOW" && apt.status === "NO_SHOW");

    return matchesSearch && matchesStatus;
  });

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Today&apos;s Bookings &amp; Reception Desk
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Queue
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Receptionist Desk • Live patient arrival order, WhatsApp/Website bookings &amp; queue management
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs text-xs">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent px-2.5 py-1 font-semibold text-slate-700 outline-none cursor-pointer"
            />
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
              >
                Go to Today
              </button>
            )}
          </div>

          {/* Refresh Queue */}
          <button
            type="button"
            onClick={() => fetchTodayAppointments(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            title="Refresh queue"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Google Sheets Link */}
          <Link
            href="/admin/google-sheets"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Google Sheet</span>
          </Link>

          {/* Add New Booking Button */}
          <button
            type="button"
            onClick={() => {
              setPatientMode("EXISTING");
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Booking / Walk-In</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
        {/* Confirmed Queue Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Confirmed Queue</div>
          <div className="mt-1 text-3xl font-black text-slate-900">{confirmedAppointments.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-400">Active today appointments</div>
        </div>

        {/* Waiting in Lounge */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>In Lounge</span>
          </div>
          <div className="mt-1 text-3xl font-black text-amber-900">{metrics.waiting}</div>
          <div className="mt-0.5 text-[11px] text-amber-700 font-medium">Checked-in &amp; waiting</div>
        </div>

        {/* In Chair */}
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800">
            <Stethoscope className="h-4 w-4 text-cyan-600" />
            <span>In Dental Chair</span>
          </div>
          <div className="mt-1 text-3xl font-black text-cyan-900">{metrics.inChair}</div>
          <div className="mt-0.5 text-[11px] text-cyan-700 font-medium">Currently with Doctor</div>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Completed Today</span>
          </div>
          <div className="mt-1 text-3xl font-black text-emerald-900">{metrics.completed}</div>
          <div className="mt-0.5 text-[11px] text-emerald-700 font-medium">Treatments finished</div>
        </div>

        {/* Not There (No-Show) */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
            <XCircle className="h-4 w-4 text-rose-600" />
            <span>Not There</span>
          </div>
          <div className="mt-1 text-3xl font-black text-rose-900">{metrics.notThere || 0}</div>
          <div className="mt-0.5 text-[11px] text-rose-700 font-medium">Patients no-show</div>
        </div>
      </div>

      {/* RED POP-UP / ALERT SECTION: Strictly for Today's Pending Appointments (Inline inside Today Section) */}
      {pendingAppointments.length > 0 && (
        <div className="overflow-hidden rounded-2xl border-2 border-red-500 bg-white shadow-xl shadow-red-500/10 animate-in fade-in">
          {/* Red Header Bar */}
          <div className="flex flex-col gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs ring-2 ring-white/20 animate-pulse">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight sm:text-base">
                    🚨 Today&apos;s Pending Appointments ({pendingAppointments.length})
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black uppercase text-red-700">
                    Awaiting Confirmation
                  </span>
                </div>
                <p className="text-[11px] text-red-100 font-medium">
                  Confirm to automatically admit patient directly into Today&apos;s Lounge queue
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] font-semibold text-red-100">
              Only showing today&apos;s pending requests
            </div>
          </div>

          {/* Pending Patients Cards List */}
          <div className="divide-y divide-red-100 bg-red-50/20 p-3 sm:p-4 space-y-2.5">
            {pendingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col gap-3 rounded-xl border border-red-200 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between hover:border-red-400 transition"
              >
                {/* Patient Primary Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{apt.patientName}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                      Pending
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                      {apt.source}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">📞 {apt.phone}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ⏰ {apt.timeSlot}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-800">🩺 {apt.serviceName}</span>
                    <span>•</span>
                    <span className="text-slate-600">👨‍⚕️ {apt.doctor.split("(")[0]}</span>
                  </div>

                  {apt.notes && (
                    <div className="mt-1 text-[11px] text-slate-600 italic bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-0.5">
                      📝 Notes: {apt.notes}
                    </div>
                  )}
                </div>

                {/* Actions: Decline, Confirm Only, Confirm & Admit to Lounge */}
                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0">
                  {apt.phone && (
                    <a
                      href={`https://wa.me/${apt.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      await handleUpdateStatus(apt.id, "DECLINED");
                      showToast(`Declined appointment for ${apt.patientName}`, "error");
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    Decline
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await handleUpdateStatus(apt.id, "CONFIRMED");
                      showToast(`Confirmed! ${apt.patientName} added to today's queue`, "success");
                    }}
                    className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition cursor-pointer"
                  >
                    Confirm Only
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await handleUpdateStatus(apt.id, "CHECKED_IN");
                      showToast(`Confirmed! ${apt.patientName} admitted to Lounge ⏳`, "success");
                    }}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm &amp; Admit to Lounge ⏳</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receptionist Quick Tip Banner */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
            💡
          </span>
          <div>
            <span className="font-bold text-emerald-900">Queue Priority Control:</span>{" "}
            <span className="text-emerald-800">
              Hold the mouse or <strong>Right-Click</strong> on any patient row to move them up/down based on who arrived first!
            </span>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
          Showing: {filteredAppointments.length} Confirmed Patients
        </span>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search today's queue by patient name, phone, doctor, or token #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>


        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Status:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "CONFIRMED", label: "📅 Confirmed" },
            { id: "WAITING", label: "⏳ Lounge" },
            { id: "IN_CHAIR", label: "💺 In Chair" },
            { id: "COMPLETED", label: "✅ Done" },
            { id: "NO_SHOW", label: "❌ Not There" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                statusFilter === pill.id
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Queue Patient Cards / Table */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading today&apos;s queue...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-800">No Bookings Found for this Filter</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            There are no appointments matching your filter for {selectedDate}. Click &quot;Add Booking / Walk-In&quot; to queue a patient now!
          </p>
          <button
            type="button"
            onClick={() => {
              setPatientMode("EXISTING");
              setIsAddModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Walk-In Patient Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAppointments.map((apt, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredAppointments.length - 1;
            const isDragging = draggedId === apt.id;
            const isOver = dragOverId === apt.id;

            return (
              <div
                key={apt.id}
                draggable
                onDragStart={(e) => handleDragStart(e, apt.id)}
                onDragOver={(e) => handleDragOver(e, apt.id)}
                onDrop={(e) => handleDrop(e, apt.id)}
                onContextMenu={(e) => handleContextMenu(e, apt)}
                className={`group relative flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-2xs transition-all sm:flex-row sm:items-center sm:justify-between ${
                  isDragging ? "opacity-40 border-dashed border-emerald-400" : ""
                } ${
                  isOver ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200 hover:border-slate-300"
                } ${
                  apt.status === "TREATMENT_STARTED"
                    ? "bg-cyan-50/30 border-cyan-200"
                    : apt.status === "CHECKED_IN"
                    ? "bg-amber-50/20 border-amber-200"
                    : ""
                }`}
              >
                {/* Left Side: Drag Handle, Token Number & Patient Info */}
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div
                    className="flex flex-col items-center justify-center p-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing"
                    title="Drag and drop to reorder patient arrival priority"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Token Number Badge */}
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black shadow-2xs ${
                        isFirst
                          ? "bg-emerald-600 text-white shadow-emerald-600/30"
                          : apt.status === "TREATMENT_STARTED"
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      #{apt.tokenNumber}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                      {isFirst ? "Next In" : "Token"}
                    </span>
                  </div>

                  {/* Move Up/Down Quick Buttons */}
                  <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMoveQueue(apt.id, "MOVE_UP")}
                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Up (Came Earlier)"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMoveQueue(apt.id, "MOVE_DOWN")}
                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Patient Primary Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{apt.patientName}</span>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS"
                            ? "bg-cyan-100 text-cyan-800 animate-pulse"
                            : apt.status === "CHECKED_IN"
                            ? "bg-amber-100 text-amber-800"
                            : apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE"
                            ? "bg-emerald-100 text-emerald-800"
                            : apt.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : apt.status === "NO_SHOW"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS"
                          ? "💺 In Dental Chair"
                          : apt.status === "CHECKED_IN"
                          ? "⏳ In Lounge"
                          : apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE"
                          ? "✅ Completed"
                          : apt.status === "CONFIRMED"
                          ? "📅 Confirmed"
                          : apt.status === "NO_SHOW"
                          ? "❌ Not There"
                          : apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {apt.phone}
                      </span>
                      <span>•</span>
                      <span className="text-slate-800 font-medium">{apt.serviceName}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Stethoscope className="h-3 w-3 text-slate-400" />
                        {apt.doctor.split("(")[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Arrival Time, Waiting Timer & Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0">
                  {/* Slot / Wait Time */}
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">{apt.timeSlot}</div>
                    <div className="text-[11px] text-slate-400">
                      {apt.status === "CHECKED_IN" ? (
                        <span className="text-amber-700 font-semibold">
                          Waiting {apt.waitingMinutes}m
                        </span>
                      ) : apt.status === "TREATMENT_STARTED" ? (
                        <span className="text-cyan-700 font-semibold">In Chair</span>
                      ) : (
                        <span>Scheduled</span>
                      )}
                    </div>
                  </div>

                  {/* Actions & WhatsApp Wrapper */}
                  <div className="flex items-center gap-2">
                    {/* Status Dropdown Menu (Confirmed, Lounge, Chair, Done, Not There) */}
                    <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === apt.id ? null : apt.id);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                        apt.status === "CHECKED_IN"
                          ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          : apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS"
                          ? "border-cyan-400 bg-cyan-600 text-white hover:bg-cyan-700"
                          : apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE"
                          ? "border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-700"
                          : apt.status === "NO_SHOW"
                          ? "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
                          : "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100"
                      }`}
                      title="Click to select stage: Confirmed, Lounge, Chair, Done, or Not There"
                    >
                      {apt.status === "CONFIRMED" && (
                        <>
                          <span>📅 Confirmed</span>
                          <ChevronDown className="h-3.5 w-3.5 text-blue-700" />
                        </>
                      )}
                      {apt.status === "CHECKED_IN" && (
                        <>
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>⏳ Lounge</span>
                          <ChevronDown className="h-3.5 w-3.5 text-amber-700" />
                        </>
                      )}
                      {(apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS") && (
                        <>
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          <span>💺 Chair</span>
                          <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                        </>
                      )}
                      {(apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE") && (
                        <>
                          <span>✅ Done</span>
                          <ChevronDown className="h-3.5 w-3.5 text-white/80" />
                        </>
                      )}
                      {apt.status === "NO_SHOW" && (
                        <>
                          <span>❌ Not There</span>
                          <ChevronDown className="h-3.5 w-3.5 text-rose-700" />
                        </>
                      )}
                      {apt.status !== "CONFIRMED" &&
                        apt.status !== "CHECKED_IN" &&
                        apt.status !== "TREATMENT_STARTED" &&
                        apt.status !== "IN_PROGRESS" &&
                        apt.status !== "COMPLETED" &&
                        apt.status !== "TREATMENT_DONE" &&
                        apt.status !== "NO_SHOW" && (
                          <>
                            <span>📅 Confirmed</span>
                            <ChevronDown className="h-3.5 w-3.5 text-blue-700" />
                          </>
                        )}
                    </button>

                    {/* Dropdown Menu Popup (5 Stages in Clinical Order) */}
                    {openDropdownId === apt.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 z-40 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95"
                      >
                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Select Stage (Tick One)
                        </div>

                        {/* Option 1: Confirmed */}
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStatus(apt.id, "CONFIRMED");
                            setOpenDropdownId(null);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                            apt.status === "CONFIRMED"
                              ? "bg-blue-50 font-bold text-blue-900 border border-blue-300"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <div>
                              <div className="font-bold">Confirmed</div>
                              <div className="text-[10px] text-slate-400 font-normal">Scheduled in queue</div>
                            </div>
                          </div>
                          {apt.status === "CONFIRMED" && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>

                        {/* Option 2: Lounge */}
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStatus(apt.id, "CHECKED_IN");
                            setOpenDropdownId(null);
                          }}
                          className={`mt-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                            apt.status === "CHECKED_IN"
                              ? "bg-amber-50 font-bold text-amber-900 border border-amber-300"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">⏳</span>
                            <div>
                              <div className="font-bold">Lounge</div>
                              <div className="text-[10px] text-slate-400 font-normal">Waiting in lounge</div>
                            </div>
                          </div>
                          {apt.status === "CHECKED_IN" && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[11px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>

                        {/* Option 3: Chair */}
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStatus(apt.id, "TREATMENT_STARTED");
                            setOpenDropdownId(null);
                          }}
                          className={`mt-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                            apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS"
                              ? "bg-cyan-50 font-bold text-cyan-900 border border-cyan-300"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">💺</span>
                            <div>
                              <div className="font-bold">Chair</div>
                              <div className="text-[10px] text-slate-400 font-normal">In dental chair</div>
                            </div>
                          </div>
                          {(apt.status === "TREATMENT_STARTED" || apt.status === "IN_PROGRESS") && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-white text-[11px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>

                        {/* Option 4: Done (Opens Revisit Modal) */}
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStatus(apt.id, "COMPLETED", true);
                            setOpenDropdownId(null);
                          }}
                          className={`mt-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                            apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE"
                              ? "bg-emerald-50 font-bold text-emerald-900 border border-emerald-300"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">✅</span>
                            <div>
                              <div className="font-bold">Done</div>
                              <div className="text-[10px] text-slate-400 font-normal">Treatment finished (Book revisit)</div>
                            </div>
                          </div>
                          {(apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE") && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>

                        {/* Option 5: Not There (Patient No-Show) */}
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStatus(apt.id, "NO_SHOW");
                            setOpenDropdownId(null);
                          }}
                          className={`mt-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                            apt.status === "NO_SHOW"
                              ? "bg-rose-50 font-bold text-rose-900 border border-rose-300"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">❌</span>
                            <div>
                              <div className="font-bold">Not There</div>
                              <div className="text-[10px] text-slate-400 font-normal">Patient did not show up</div>
                            </div>
                          </div>
                          {apt.status === "NO_SHOW" && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[11px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                    {/* WhatsApp Quick Chat */}
                    {apt.phone && (
                      <a
                        href={`https://wa.me/${apt.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Right-Click Context Menu ("wising hold mous right buttone") */}
      {contextMenu.visible && contextMenu.appointment && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in fade-in zoom-in-95 text-xs font-semibold text-slate-700"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            {contextMenu.appointment.patientName} (#{contextMenu.appointment.tokenNumber})
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleMoveQueue(contextMenu.appointment.id, "MOVE_TOP");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
            >
              <ArrowUpToLine className="h-3.5 w-3.5 text-emerald-600" />
              <span>Move to #1 (Came First / Urgent)</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleMoveQueue(contextMenu.appointment.id, "MOVE_UP");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
              <span>Move Up 1 Position</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleMoveQueue(contextMenu.appointment.id, "MOVE_DOWN");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
              <span>Move Down 1 Position</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleMoveQueue(contextMenu.appointment.id, "MOVE_BOTTOM");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-100 transition cursor-pointer"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-slate-400" />
              <span>Move to Bottom</span>
            </button>
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleUpdateStatus(contextMenu.appointment.id, "CONFIRMED");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-800 transition cursor-pointer"
            >
              <span className="text-sm">📅</span>
              <span>Confirmed (Scheduled)</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleUpdateStatus(contextMenu.appointment.id, "CHECKED_IN");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-amber-50 hover:text-amber-800 transition cursor-pointer"
            >
              <span className="text-sm">⏳</span>
              <span>Lounge (Reception Lounge)</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleUpdateStatus(contextMenu.appointment.id, "TREATMENT_STARTED");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-cyan-50 hover:text-cyan-800 transition cursor-pointer"
            >
              <span className="text-sm">💺</span>
              <span>Chair (Dental Chair)</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleUpdateStatus(contextMenu.appointment.id, "COMPLETED", true);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
            >
              <span className="text-sm">✅</span>
              <span>Done (Book Revisit)</span>
            </button>

            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  handleUpdateStatus(contextMenu.appointment.id, "NO_SHOW");
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-rose-50 hover:text-rose-800 transition cursor-pointer"
            >
              <span className="text-sm">❌</span>
              <span>Not There (Patient No-Show)</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <a
              href={`https://wa.me/${contextMenu.appointment.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-emerald-50 text-emerald-700 transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW BOOKING / SEARCH EXISTING PATIENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add to Today&apos;s Queue</h3>
                  <p className="text-xs text-slate-500">Book walk-in, phone, or existing patient for today</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Patient Mode Tabs: Search Existing vs New Patient */}
            <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPatientMode("EXISTING")}
                className={`flex-1 rounded-lg py-2 transition cursor-pointer ${
                  patientMode === "EXISTING"
                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🔍 Search Existing Patient
              </button>
              <button
                type="button"
                onClick={() => setPatientMode("NEW")}
                className={`flex-1 rounded-lg py-2 transition cursor-pointer ${
                  patientMode === "NEW"
                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ➕ Register New Walk-In
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-4 space-y-4 text-xs">
              {/* Option A: Search Existing Patient */}
              {patientMode === "EXISTING" && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Search Registered Patient from Patient List:
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type patient name, phone (e.g. 98251...), or ID..."
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  {/* Selected Existing Patient Card */}
                  {selectedExistingPatient && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 text-emerald-950">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span>{selectedExistingPatient.name}</span>
                          <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 text-[10px] text-emerald-900 font-mono">
                            Existing Patient
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-emerald-700">
                          📞 {selectedExistingPatient.phone} • {selectedExistingPatient.condition || "General Patient"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedExistingPatient(null)}
                        className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                        title="Deselect patient"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Patient Search Results Dropdown */}
                  {!selectedExistingPatient && (
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-inner">
                      {searchingPatients ? (
                        <div className="p-3 text-center text-slate-400 text-xs">Searching patients...</div>
                      ) : existingPatients.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          No matching patient found. Switch to &quot;Register New Walk-In&quot; tab.
                        </div>
                      ) : (
                        existingPatients.slice(0, 8).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedExistingPatient(p);
                              setPatientSearchTerm("");
                            }}
                            className="flex items-center justify-between p-2.5 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                          >
                            <div>
                              <div className="font-bold text-slate-800">{p.name || `${p.firstName} ${p.lastName}`}</div>
                              <div className="text-[11px] text-slate-400">📞 {p.phone}</div>
                            </div>
                            <button
                              type="button"
                              className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
                            >
                              Select &rarr;
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Option B: Register New Walk-in Patient */}
              {patientMode === "NEW" && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul"
                        value={newBooking.firstName}
                        onChange={(e) => setNewBooking((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Shah"
                        value={newBooking.lastName}
                        onChange={(e) => setNewBooking((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98250 12345"
                        value={newBooking.phone}
                        onChange={(e) => setNewBooking((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="patient@gmail.com"
                        value={newBooking.email}
                        onChange={(e) => setNewBooking((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Service & Doctor Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treatment / Reason</label>
                  <select
                    value={newBooking.serviceName}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, serviceName: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white cursor-pointer"
                  >
                    {COMMON_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Doctor</label>
                  <select
                    value={newBooking.doctor}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, doctor: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white cursor-pointer"
                  >
                    {DOCTORS_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Queue Arrival Priority */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Arrival Queue Priority</label>
                <select
                  value={newBooking.position}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, position: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="bottom">🔻 Place at End of Queue</option>
                  <option value="top">🔝 Place at Top #1 (Came First / Urgent)</option>
                </select>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                <div className="flex gap-2">
                  {[
                    { id: "CHECKED_IN", label: "⏳ In Lounge (Waiting)" },
                    { id: "TREATMENT_STARTED", label: "💺 In Chair (With Doctor)" },
                    { id: "CONFIRMED", label: "📅 Scheduled" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewBooking((prev) => ({ ...prev, status: s.id }))}
                      className={`flex-1 rounded-xl border p-2 text-center text-xs font-semibold transition cursor-pointer ${
                        newBooking.status === s.id
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reception Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Tooth sensitivity, referred by friend, etc."
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking || (patientMode === "EXISTING" && !selectedExistingPatient)}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                >
                  {submittingBooking ? "Adding to Queue..." : "Add to Today's Queue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVISIT / NEXT SITTING BOOKING (Triggered when marked 'Done') */}
      {revisitModal.isOpen && revisitModal.appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 ring-4 ring-emerald-50">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>📅 Book Patient Revisit / Follow-up</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Done Stage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select confirmed date &amp; time in calendar for next sitting
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevisitModal({ isOpen: false, appointment: null })}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Patient Info Card (Auto-filled) */}
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Patient Details
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {revisitModal.appointment.patientName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-emerald-800">
                    📞 {revisitModal.appointment.phone}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Today&apos;s Token #{revisitModal.appointment.tokenNumber}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-emerald-200/60 pt-2 text-xs text-emerald-950">
                <span className="font-semibold">Completed:</span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-800 border border-emerald-200">
                  {revisitModal.appointment.serviceName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">👨‍⚕️ {revisitModal.appointment.doctor.split("(")[0]}</span>
              </div>
            </div>

            {/* Revisit Booking Form */}
            <form onSubmit={handleBookRevisit} className="mt-4 space-y-4 text-xs">
              {/* Calendar Date Picker + Quick Day Shortcuts */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>📅 Next Appointment Date in Calendar *</span>
                  <span className="text-[11px] font-medium text-emerald-700">Quick Pick:</span>
                </label>

                {/* Quick Date Shortcuts */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[
                    { label: "+3 Days", days: 3 },
                    { label: "+1 Week", days: 7 },
                    { label: "+2 Weeks", days: 14 },
                    { label: "+1 Month", days: 30 },
                  ].map((s) => {
                    const target = new Date();
                    target.setDate(target.getDate() + s.days);
                    const targetStr = target.toISOString().split("T")[0];
                    const isSelected = revisitForm.date === targetStr;

                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() =>
                          setRevisitForm((prev) => ({
                            ...prev,
                            date: targetStr,
                          }))
                        }
                        className={`rounded-xl border py-1.5 text-center text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={revisitForm.date}
                  onChange={(e) => setRevisitForm((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white font-medium cursor-pointer"
                />
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  ⏰ Revisit Time Slot *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    "10:00 AM",
                    "11:00 AM",
                    "12:00 PM",
                    "02:00 PM",
                    "04:00 PM",
                    "05:00 PM",
                    "06:00 PM",
                    "07:00 PM",
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setRevisitForm((prev) => ({ ...prev, timeSlot: slot }))}
                      className={`rounded-xl border py-1.5 text-center text-xs font-semibold transition cursor-pointer ${
                        revisitForm.timeSlot === slot
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Treatment / Sitting Reason */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  🩺 Revisit Reason / Next Sitting
                </label>
                <input
                  type="text"
                  required
                  value={revisitForm.serviceName}
                  onChange={(e) => setRevisitForm((prev) => ({ ...prev, serviceName: e.target.value }))}
                  placeholder="e.g. Root Canal Treatment - Sitting 2 (Crown fitting)"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                />
              </div>

              {/* Assigned Doctor */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  👨‍⚕️ Assigned Doctor
                </label>
                <select
                  value={revisitForm.doctor}
                  onChange={(e) => setRevisitForm((prev) => ({ ...prev, doctor: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white cursor-pointer"
                >
                  {DOCTORS_LIST.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reception / Follow-up Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  📝 Doctor / Follow-up Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take x-ray before sitting, stitches removal"
                  value={revisitForm.notes}
                  onChange={(e) => setRevisitForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none bg-white"
                />
              </div>

              {/* Modal Footer: Done Only vs Confirm Revisit */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRevisitModal({ isOpen: false, appointment: null });
                    showToast("Treatment marked Done. No revisit scheduled.", "success");
                  }}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  No Revisit Needed (Done Only)
                </button>

                <button
                  type="submit"
                  disabled={revisitForm.submitting}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="h-4 w-4" />
                  <span>
                    {revisitForm.submitting
                      ? "Booking Revisit..."
                      : `Confirm Revisit for ${revisitForm.date}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
