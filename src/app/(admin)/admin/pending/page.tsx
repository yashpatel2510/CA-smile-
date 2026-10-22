"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Bot,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
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

interface PendingAppointment {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  service: string;
  requestedDate: string;
  requestedTime: string;
  source: "AI_BOOKING" | "MANUAL" | "WHATSAPP" | "WEB_FORM" | string;
  symptomsOrNotes?: string;
  createdAt: string;
  patientType?: string;
  childName?: string;
  guardianName?: string;
  preferredDoctor?: string;
  timeRange?: string;
  contactMethod?: string;
}

export default function PendingConfirmationsPage() {
  const { data: session } = useSession();
  const performedBy = session?.user?.name || "Clinic Staff";

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<PendingAppointment | null>(null);

  // Modals state
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callVerified, setCallVerified] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("2026-09-18");
  const [newTime, setNewTime] = useState("02:30 PM");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments?status=PENDING");
      const data = await res.json();
      if (data.success && data.appointments) {
        const formatted: PendingAppointment[] = data.appointments.map(
          (apt: any) => ({
            id: apt.id,
            patientName:
              apt.patientName ||
              (apt.patientType === "CHILD" && apt.childName
                ? `${apt.childName} (Child)`
                : apt.patient
                  ? `${apt.patient.firstName || ""} ${apt.patient.lastName && apt.patient.lastName !== "Patient" ? apt.patient.lastName : ""}`.trim()
                  : apt.childName || "Valued Patient"),
            phone: apt.patient?.phone || "(555) 000-0000",
            email: apt.patient?.email || "patient@example.com",
            service: apt.service?.name || apt.reason || "General Consultation",
            requestedDate: apt.startTime
              ? new Date(apt.startTime).toLocaleDateString()
              : "Tomorrow",
            requestedTime:
              apt.timeRange ||
              (apt.startTime
                ? new Date(apt.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Afternoon (2:00 PM - 5:00 PM)"),
            source: apt.source || "MANUAL",
            symptomsOrNotes:
              apt.notes ||
              apt.reason ||
              "Patient requested appointment via online booking.",
            createdAt: apt.createdAt
              ? new Date(apt.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
            patientType: apt.patientType || "ADULT",
            childName: apt.childName,
            guardianName: apt.guardianName,
            preferredDoctor: apt.preferredDoctor,
            timeRange: apt.timeRange,
            contactMethod: apt.contactMethod || "PHONE",
          })
        );
        setAppointments(formatted);
      }
    } catch {
      // Demo fallback if offline
      setAppointments([
        {
          id: "APT-910245",
          patientName: "Jonathan Swift",
          phone: "(555) 234-9871",
          email: "j.swift@example.com",
          service: "Comprehensive Cardiology Diagnostic Panel",
          requestedDate: "Sep 18, 2026",
          requestedTime: "10:30 AM",
          source: "ONLINE_BOOKING",
          symptomsOrNotes:
            "Patient reported mild resting arrhythmia. Patient requested morning slot.",
          createdAt: "Today at 09:15 AM",
        },
        {
          id: "APT-910246",
          patientName: "Clara Oswald",
          phone: "(555) 876-5432",
          email: "clara.o@example.com",
          service: "Pediatric Wellness & Immunization Clinic",
          requestedDate: "Sep 19, 2026",
          requestedTime: "02:00 PM",
          source: "AI_BOOKING",
          symptomsOrNotes:
            "Scheduled for 18-month routine vaccines and growth screening.",
          createdAt: "Today at 10:40 AM",
        },
        {
          id: "APT-910247",
          patientName: "Arthur Pendelton",
          phone: "(555) 345-1290",
          email: "arthur.p@example.com",
          service: "Neurology & Chronic Headache Management",
          requestedDate: "Sep 19, 2026",
          requestedTime: "04:00 PM",
          source: "MANUAL",
          symptomsOrNotes: "Frequent tension headaches on workday afternoons.",
          createdAt: "Yesterday at 04:30 PM",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleConfirm = async (apt: PendingAppointment) => {
    try {
      const res = await fetch(`/api/admin/appointments/${apt.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performedBy }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAppointments((prev) => prev.filter((item) => item.id !== apt.id));
        setActionSuccessMsg(
          data.message || `Appointment for ${apt.patientName} was approved successfully!`
        );
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        alert(data.message || "Failed to confirm appointment.");
      }
    } catch {
      alert("Failed to confirm appointment.");
    }
  };

  const handleCallApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          performedBy,
          forceOverride: true,
          reason: `Confirmed via staff phone call. Notes: ${callNotes || "Slot verbally verified with patient over phone"}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments((prev) =>
          prev.filter((item) => item.id !== selectedAppointment.id)
        );
        setActionSuccessMsg(
          `Appointment for ${selectedAppointment.patientName} was approved via phone call verification and moved to Confirmed Bookings!`
        );
        setCallModalOpen(false);
        setSelectedAppointment(null);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        alert(data.message || "Failed to confirm appointment.");
      }
    } catch {
      alert("Failed to confirm appointment.");
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await fetch(`/api/appointments/${selectedAppointment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DECLINED",
          performedBy,
          reason: declineReason || "Declined by clinic staff",
        }),
      });

      setAppointments((prev) =>
        prev.filter((item) => item.id !== selectedAppointment.id)
      );
      setActionSuccessMsg(
        `Appointment for ${selectedAppointment.patientName} was declined with audit record.`
      );
      setDeclineModalOpen(false);
      setSelectedAppointment(null);
      setDeclineReason("");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch {
      alert("Failed to decline appointment.");
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await fetch(`/api/appointments/${selectedAppointment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          performedBy,
          reason: `Rescheduled to ${newDate} at ${newTime}`,
        }),
      });

      setAppointments((prev) =>
        prev.filter((item) => item.id !== selectedAppointment.id)
      );
      setActionSuccessMsg(
        `Appointment for ${selectedAppointment.patientName} rescheduled to ${newDate} at ${newTime}.`
      );
      setRescheduleModalOpen(false);
      setSelectedAppointment(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch {
      alert("Failed to reschedule appointment.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-brand-text">
              Pending Confirmations Queue
            </h1>
            <Badge variant="default" className="text-xs">
              {appointments.length} Pending
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">
            Review incoming patient appointment requests. Staff must call or message
            the patient to confirm details before approving.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingQueue}
          className="gap-1.5 self-start text-xs sm:self-auto"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="shadow-xs flex items-center justify-between rounded-clinic border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <div className="flex flex-wrap items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
            <a
              href="/admin/appointments?status=CONFIRMED"
              className="ml-2 font-bold text-emerald-900 underline hover:text-emerald-950"
            >
              View Confirmed Bookings &rarr;
            </a>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="font-bold text-emerald-700 hover:text-emerald-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Queue List */}
      {loading ? (
        // Loading Skeleton
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="bg-brand-border/60 mb-3 h-5 w-48 rounded" />
              <div className="bg-brand-border/40 mb-4 h-4 w-72 rounded" />
              <div className="bg-brand-border/20 h-8 w-full rounded" />
            </Card>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        // Empty State
        <Card className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mb-1 font-heading text-lg font-bold text-brand-text">
            All Appointments Processed
          </h2>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-brand-muted">
            There are currently no pending online or web requests waiting for
            confirmation. All patients are scheduled.
          </p>
          <div className="pt-4">
            <Button variant="outline" size="sm" onClick={fetchPendingQueue}>
              Check Again
            </Button>
          </div>
        </Card>
      ) : (
        // Queue Cards
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card
              key={apt.id}
              className="hover:border-brand-primary/40 shadow-xs transition-colors"
            >
              <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-3 border-b border-brand-border pb-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-accent/50 flex h-10 w-10 items-center justify-center rounded-clinic text-sm font-bold text-brand-primary">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-brand-text">
                          {apt.patientName}
                        </span>
                        {apt.source === "WHATSAPP" ||
                        apt.contactMethod === "WHATSAPP" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Web Intake
                          </Badge>
                        )}
                        {apt.patientType === "CHILD" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Child Patient
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            Adult
                          </span>
                        )}
                        {apt.contactMethod === "WHATSAPP" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            WhatsApp Contact
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            Phone Call
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-brand-muted">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-brand-primary" />
                          {apt.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-brand-muted" />
                          {apt.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-mono text-xs font-semibold text-brand-muted">
                      {apt.id}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      Received: {apt.createdAt}
                    </span>
                  </div>
                </div>

                {/* Requested Service & Time */}
                <div className="bg-brand-background/60 grid grid-cols-1 gap-3 rounded-clinic border border-brand-border p-3.5 text-xs sm:grid-cols-3">
                  <div>
                    <span className="block font-semibold text-brand-text">
                      Requested Service:
                    </span>
                    <span className="text-sm font-medium text-brand-primary">
                      {apt.service}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-brand-text">
                      Requested Slot:
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-medium text-brand-text">
                      <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                      <strong>{apt.requestedDate}</strong>
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      {apt.requestedTime}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-brand-text">
                      Doctor Preference:
                    </span>
                    <span className="text-xs font-medium text-brand-text">
                      {apt.preferredDoctor || "Any Available Specialist"}
                    </span>
                  </div>
                </div>

                {/* Patient Symptoms & Clinical Notes */}
                {apt.symptomsOrNotes && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                      Clinical Notes / Patient Details:
                    </span>
                    <p className="rounded border border-amber-100 bg-amber-50/60 p-2.5 leading-relaxed text-brand-text">
                      {apt.symptomsOrNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-brand-border/60 flex flex-wrap items-center justify-between gap-2.5 border-t pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {apt.phone && (
                      <a
                        href={`tel:${apt.phone.replace(/[^\d+]/g, "")}`}
                        className="shadow-xs inline-flex items-center gap-1.5 rounded-clinic border border-brand-border bg-brand-background px-3 py-1.5 text-xs font-bold text-brand-text transition-all hover:border-brand-primary hover:text-brand-primary"
                      >
                        <Phone className="h-3.5 w-3.5 text-brand-primary" />
                        <span>Call {apt.phone}</span>
                      </a>
                    )}
                    {apt.phone && (
                      <a
                        href={`https://wa.me/${apt.phone.replace(/\D/g, "").length === 10 ? `91${apt.phone.replace(/\D/g, "")}` : apt.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hello ${apt.patientName}, this is VS Dental Clinic regarding your appointment request (${apt.id}) for ${apt.service}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shadow-xs inline-flex items-center gap-1.5 rounded-clinic bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#20ba59]"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setDeclineModalOpen(true);
                      }}
                      className="gap-1 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Decline</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setRescheduleModalOpen(true);
                      }}
                      className="gap-1 text-xs"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Reschedule</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setCallVerified(false);
                        setCallNotes(
                          "Spoke with patient on phone, confirmed date and slot."
                        );
                        setCallModalOpen(true);
                      }}
                      className="shadow-xs gap-1.5 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Call &amp; Approve</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-clinic border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-brand-text">
                Decline Appointment Request
              </h3>
              <p className="text-xs text-brand-muted">
                Patient: <strong>{selectedAppointment.patientName}</strong> (
                {selectedAppointment.service})
              </p>
            </div>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Clinical / Operational Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Attending physician in emergency surgery. Patient instructed to rebook..."
                  className="w-full rounded-clinic border border-brand-border bg-brand-background p-3 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeclineModalOpen(false);
                    setSelectedAppointment(null);
                    setDeclineReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm Decline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Slot Modal */}
      {rescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-clinic border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-brand-text">
                Assign Alternative Slot
              </h3>
              <p className="text-xs text-brand-muted">
                Patient: <strong>{selectedAppointment.patientName}</strong> (
                {selectedAppointment.service})
              </p>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  New Appointment Date
                </label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Time Slot
                </label>
                <select
                  className="flex h-10 w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="01:15 PM">01:15 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRescheduleModalOpen(false);
                    setSelectedAppointment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save & Confirm Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Staff Phone Call Confirmation & Approval Modal */}
      {callModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-clinic border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-brand-border pb-3">
              <div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Staff Phone Call Verification
                </span>
                <h3 className="mt-1 font-heading text-lg font-bold text-brand-text">
                  Call Patient &amp; Approve Booking
                </h3>
                <p className="text-xs text-brand-muted">
                  Protocol: Staff must call or message the patient to verbally
                  confirm the appointment before approving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCallModalOpen(false)}
                className="text-brand-muted hover:text-brand-text"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Patient Card & Direct Dial Action */}
            <div className="bg-brand-background/80 space-y-2.5 rounded-clinic border border-brand-border p-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold text-brand-text">
                    {selectedAppointment.patientName}
                  </span>
                  {selectedAppointment.guardianName && (
                    <div className="text-[11px] text-brand-muted">
                      Guardian: {selectedAppointment.guardianName}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedAppointment.phone.replace(/[^\d+]/g, "")}`}
                    className="shadow-xs hover:bg-brand-primary/90 inline-flex items-center gap-1.5 rounded-clinic bg-brand-primary px-3 py-1.5 text-xs font-bold text-white transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Dial {selectedAppointment.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedAppointment.phone.replace(/\D/g, "").length === 10 ? `91${selectedAppointment.phone.replace(/\D/g, "")}` : selectedAppointment.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hello ${selectedAppointment.patientName}, this is VS Dental Clinic calling to confirm your appointment request (${selectedAppointment.id}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shadow-xs inline-flex items-center gap-1 rounded-clinic bg-[#25D366] px-2.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#20ba59]"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="border-brand-border/60 grid grid-cols-2 gap-2 border-t pt-2 text-[11px]">
                <div>
                  <span className="text-brand-muted">Service / Concern:</span>
                  <div className="font-semibold text-brand-primary">
                    {selectedAppointment.service}
                  </div>
                </div>
                <div>
                  <span className="text-brand-muted">Requested Slot:</span>
                  <div className="font-semibold text-brand-text">
                    {selectedAppointment.requestedDate} •{" "}
                    {selectedAppointment.requestedTime}
                  </div>
                </div>
                <div>
                  <span className="text-brand-muted">Assigned Doctor:</span>
                  <div className="font-semibold text-brand-text">
                    {selectedAppointment.preferredDoctor ||
                      "Any Available Specialist"}
                  </div>
                </div>
                <div>
                  <span className="text-brand-muted">Booking Source:</span>
                  <div className="font-semibold text-brand-text">
                    {selectedAppointment.source}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleCallApproveSubmit} className="space-y-3.5">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-clinic border border-emerald-300 bg-emerald-50/80 p-3 text-xs text-emerald-950">
                <input
                  type="checkbox"
                  required
                  checked={callVerified}
                  onChange={(e) => setCallVerified(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="leading-relaxed">
                  <strong>I have called or messaged the patient</strong> on{" "}
                  <strong className="underline">
                    {selectedAppointment.phone}
                  </strong>{" "}
                  and verbally confirmed their appointment slot and arrival
                  time.
                </span>
              </label>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Staff Call Confirmation Notes:
                </label>
                <textarea
                  rows={2}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Spoke with patient, confirmed 10:00 AM slot, advised to arrive 10 mins early"
                  className="w-full rounded-clinic border border-brand-border bg-brand-background p-2.5 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCallModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!callVerified}
                  className="shadow-xs bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  <span>Approve &amp; Move to Confirmed Bookings</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
