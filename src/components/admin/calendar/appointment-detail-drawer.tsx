import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  XCircle,
  UserX,
  RotateCw,
  MessageSquare,
  ExternalLink,
  Plus,
  CreditCard,
  FileText,
  History,
  ShieldCheck,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { SessionTimeline } from "./session-timeline";

interface AppointmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onUpdateStatus: (newStatus: string, reason?: string, forceOverride?: boolean) => Promise<void>;
  onOpenMarkDone: () => void;
  onOpenReschedule: () => void;
  onOpenNextSession: () => void;
  onOpenPatientProfile: () => void;
  onSendWhatsAppReminder: () => void;
  updatingStatus?: boolean;
}

export function AppointmentDetailDrawer({
  isOpen,
  onClose,
  appointment,
  onUpdateStatus,
  onOpenMarkDone,
  onOpenReschedule,
  onOpenNextSession,
  onOpenPatientProfile,
  onSendWhatsAppReminder,
  updatingStatus = false,
}: AppointmentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"DETAILS" | "TIMELINE" | "HISTORY">("DETAILS");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!isOpen || !appointment) return null;

  const patientName =
    appointment.patientName ||
    (appointment.patientType === "CHILD" && appointment.childName
      ? `${appointment.childName} (Child)`
      : appointment.patient
        ? `${appointment.patient.firstName || ""} ${appointment.patient.lastName && appointment.patient.lastName !== "Patient" ? appointment.patient.lastName : ""}`.trim()
        : appointment.childName || "Valued Patient");

  const currentStatus = (appointment.status || "PENDING").toUpperCase();

  // Financial calculations
  const totalAmount = Number(
    appointment.totalAmount ||
      appointment.treatment?.totalAmount ||
      appointment.service?.price ||
      0
  );
  const amountPaid = Number(
    appointment.paidAmount ||
      appointment.treatment?.paidAmount ||
      0
  );
  const remainingAmount = Math.max(0, totalAmount - amountPaid);
  const paymentStatus =
    amountPaid >= totalAmount && totalAmount > 0
      ? "PAID"
      : amountPaid > 0
      ? "PARTIAL"
      : "PENDING";

  // Treatment Sessions
  const sessionNumber =
    appointment.treatmentSession?.sessionNumber ||
    appointment.sessionNumber ||
    1;
  const totalSessions =
    appointment.treatment?.totalSessions ||
    appointment.treatmentSession?.totalSessions ||
    appointment.totalSessions ||
    1;

  // Allowed next steps
  const canConfirm = currentStatus === "PENDING" || currentStatus === "DECLINED";
  const canCheckIn = currentStatus === "CONFIRMED";
  const canStartTreatment = currentStatus === "CHECKED_IN";
  const canMarkDone = currentStatus === "TREATMENT_STARTED" || currentStatus === "IN_PROGRESS";
  const canCancel = currentStatus !== "CANCELLED" && currentStatus !== "TREATMENT_DONE" && currentStatus !== "COMPLETED";
  const canNoShow = currentStatus === "CONFIRMED" || currentStatus === "CHECKED_IN";

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateStatus("CANCELLED", cancelReason || "Cancelled by clinic staff");
    setCancelModalOpen(false);
    setCancelReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-brand-border bg-slate-50/70 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-brand-text">
                Appointment Details
              </h3>
              <AppointmentStatusBadge status={currentStatus} />
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-muted font-mono">
              <span>ID: {appointment.id}</span>
              <span>•</span>
              <span className="capitalize">
                Source: {appointment.source || "Web"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar (Prominent quick workflow buttons) */}
        <div className="p-3 bg-white border-b border-brand-border flex items-center flex-wrap gap-1.5 shadow-2xs">
          {canConfirm && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus("CONFIRMED")}
              disabled={updatingStatus}
              className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Confirm Appointment</span>
            </Button>
          )}

          {canCheckIn && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus("CHECKED_IN")}
              disabled={updatingStatus}
              className="h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white gap-1 shadow-2xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Check In Patient</span>
            </Button>
          )}

          {canStartTreatment && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus("TREATMENT_STARTED")}
              disabled={updatingStatus}
              className="h-8 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white gap-1 shadow-2xs"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Start Treatment</span>
            </Button>
          )}

          {canMarkDone && (
            <Button
              size="sm"
              onClick={onOpenMarkDone}
              disabled={updatingStatus}
              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mark Treatment Done</span>
            </Button>
          )}

          {/* Reschedule Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenReschedule}
            disabled={updatingStatus}
            className="h-8 text-xs font-medium gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Reschedule</span>
          </Button>

          {/* Add Next Session */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNextSession}
            disabled={updatingStatus}
            className="h-8 text-xs font-medium gap-1 text-emerald-700 hover:bg-emerald-50 border-emerald-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Next Session</span>
          </Button>

          {/* WhatsApp Reminder */}
          {appointment.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendWhatsAppReminder}
              className="h-8 text-xs font-bold text-[#128C7E] border-emerald-300 hover:bg-emerald-50 gap-1"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </Button>
          )}

          {canNoShow && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus("NO_SHOW", "Marked as no show")}
              disabled={updatingStatus}
              className="h-8 text-xs text-slate-600 hover:bg-slate-100"
            >
              <UserX className="h-3.5 w-3.5 mr-1" />
              <span>No Show</span>
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              disabled={updatingStatus}
              className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-brand-border bg-white px-5 text-xs font-semibold">
          {[
            { id: "DETAILS", label: "Appointment Details" },
            { id: "TIMELINE", label: `Session Timeline (${sessionNumber}/${totalSessions})` },
            { id: "HISTORY", label: "Activity History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-bold transition-all ${
                activeTab === tab.id
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-muted hover:text-brand-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: DETAILS */}
          {activeTab === "DETAILS" && (
            <div className="space-y-4">
              {/* 1. PATIENT INFORMATION */}
              <div className="rounded-xl border border-brand-border bg-slate-50/50 p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brand-primary" />
                    <span>Patient Information</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenPatientProfile}
                    className="h-6 text-[10px] font-bold text-brand-primary border-brand-primary/30 hover:bg-brand-primary/10 gap-1"
                  >
                    <span>View Patient Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                  <div>
                    <span className="text-[10px] text-brand-muted block">Name:</span>
                    <span className="font-bold text-sm text-brand-text">{patientName}</span>
                    {appointment.patientType === "CHILD" && (
                      <span className="block text-[10px] text-amber-700">
                        Minor Child {appointment.guardianName ? `(Guardian: ${appointment.guardianName})` : ""}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-muted block">Mobile Number:</span>
                    <a
                      href={`tel:${appointment.phone}`}
                      className="font-mono text-brand-primary hover:underline font-bold"
                    >
                      +{appointment.phone}
                    </a>
                  </div>

                  {appointment.email && (
                    <div>
                      <span className="text-[10px] text-brand-muted block">Email:</span>
                      <span className="text-brand-text">{appointment.email}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-brand-muted block">Patient ID:</span>
                    <span className="font-mono text-brand-muted">
                      {appointment.patientId || appointment.patient?.id || "PAT-001"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. APPOINTMENT INFORMATION */}
              <div className="rounded-xl border border-brand-border bg-white p-4 text-xs space-y-2.5 shadow-2xs">
                <span className="font-bold text-[11px] uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Appointment Schedule</span>
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-brand-muted block">Date &amp; Time:</span>
                    <strong className="text-brand-text">
                      {appointment.dateStr || "Scheduled Date"}
                    </strong>
                    <div className="text-brand-muted">
                      {appointment.timeStr || "Time Slot"}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-muted block">Attending Dentist:</span>
                    <strong className="text-brand-text">
                      {appointment.doctor || appointment.preferredDoctor || "Dr. Sankar (Specialist)"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-muted block">Booking Source:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <span>{appointment.source || "WEB_FORM"}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-muted block">Status:</span>
                    <AppointmentStatusBadge status={currentStatus} size="sm" />
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-2 rounded bg-slate-50 p-2.5 border border-slate-200 text-slate-700">
                    <span className="font-semibold block text-[10px] text-slate-500 uppercase">
                      Intake / Clinical Notes:
                    </span>
                    {appointment.notes}
                  </div>
                )}
              </div>

              {/* 3. TREATMENT & SESSION INFORMATION */}
              <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Treatment Session Management</span>
                  </span>
                  <span className="font-extrabold text-brand-primary text-xs bg-white px-2.5 py-0.5 rounded-full border border-brand-primary/30">
                    Session {sessionNumber} of {totalSessions}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                  <div>
                    <span className="text-[10px] text-brand-muted block">Treatment Title:</span>
                    <strong className="text-brand-text">
                      {appointment.treatment?.title || appointment.service?.name || appointment.service || "Root Canal Treatment"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-muted block">Current Plan Status:</span>
                    <span className="font-bold text-blue-900">
                      {appointment.treatment?.status || "IN_PROGRESS"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("TIMELINE")}
                  className="w-full text-xs h-7 font-bold border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10"
                >
                  Inspect Full Multi-Session Timeline &rarr;
                </Button>
              </div>

              {/* 4. PAYMENT INFORMATION */}
              <div className="rounded-xl border border-brand-border bg-white p-4 text-xs space-y-2.5 shadow-2xs">
                <span className="font-bold text-[11px] uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Payment &amp; Billing</span>
                </span>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                    <span className="text-[10px] text-brand-muted block">Total Fee</span>
                    <span className="font-bold text-sm text-brand-text">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-2 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block">Amount Paid</span>
                    <span className="font-bold text-sm text-emerald-700">
                      ₹{amountPaid.toLocaleString()}
                    </span>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-2 border border-amber-200">
                    <span className="text-[10px] text-amber-800 block">Remaining</span>
                    <span className="font-bold text-sm text-amber-700">
                      ₹{remainingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSION TIMELINE */}
          {activeTab === "TIMELINE" && (
            <div className="space-y-4">
              <SessionTimeline
                treatmentTitle={
                  appointment.treatment?.title ||
                  appointment.service?.name ||
                  "Dental Treatment Plan"
                }
                totalSessions={totalSessions}
                completedSessions={
                  currentStatus === "TREATMENT_DONE"
                    ? sessionNumber
                    : Math.max(0, sessionNumber - 1)
                }
                treatmentStatus={
                  currentStatus === "TREATMENT_DONE" && sessionNumber >= totalSessions
                    ? "COMPLETED"
                    : "IN_PROGRESS"
                }
                sessions={
                  appointment.treatment?.sessions?.map((s: any) => ({
                    ...s,
                    isCurrent: s.sessionNumber === sessionNumber,
                  })) || [
                    {
                      sessionNumber,
                      totalSessions,
                      status: currentStatus,
                      dateStr: appointment.dateStr,
                      timeStr: appointment.timeStr,
                      procedure: appointment.service?.name,
                      paidAmount: amountPaid,
                      isCurrent: true,
                    },
                  ]
                }
              />

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={onOpenNextSession}
                  className="bg-brand-primary text-white font-bold text-xs gap-1.5 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Next Session Appointment</span>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY (Requirement 16) */}
          {activeTab === "HISTORY" && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-brand-primary" />
                <span>Appointment Audit &amp; Activity Log</span>
              </span>

              {appointment.auditLogs && appointment.auditLogs.length > 0 ? (
                <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
                  {appointment.auditLogs.map((log: any, idx: number) => (
                    <div
                      key={log.id || idx}
                      className="relative rounded-lg border border-slate-200 bg-white p-3 space-y-1 shadow-2xs"
                    >
                      <div className="absolute -left-[27px] top-3 h-3 w-3 rounded-full bg-brand-primary border-2 border-white ring-1 ring-slate-300" />
                      <div className="flex items-center justify-between font-bold text-brand-text">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-brand-muted font-normal font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {log.details || "Activity performed on booking"}
                      </div>
                      <div className="text-[10px] text-brand-muted">
                        By: <strong>{log.performedBy || "Staff User"}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-brand-muted">
                  No recorded activity entries yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close Panel
          </Button>

          {canMarkDone && (
            <Button
              size="sm"
              onClick={onOpenMarkDone}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mark Done</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-rose-950">
                  Cancel Appointment
                </h4>
                <p className="text-xs text-rose-700">
                  Confirm cancellation for {patientName}
                </p>
              </div>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={2}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Patient emergency, called to cancel..."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(false)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Confirm Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
