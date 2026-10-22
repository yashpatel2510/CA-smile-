import React, { useState } from "react";
import { Clock, Calendar, User, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onConfirm: (data: {
    startTime: string;
    preferredDoctor?: string;
    reason?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onConfirm,
  loading = false,
}: RescheduleModalProps) {
  const currentStartDate = appointment?.startTimeRaw
    ? new Date(appointment.startTimeRaw)
    : appointment?.dateStr
    ? new Date(`${appointment.dateStr}T10:00:00`)
    : new Date();

  const [date, setDate] = useState(
    appointment?.dateStr || currentStartDate.toISOString().split("T")[0]
  );
  const [time, setTime] = useState(
    currentStartDate.toTimeString().slice(0, 5) || "10:30"
  );
  const [dentist, setDentist] = useState(
    appointment?.doctor || appointment?.preferredDoctor || "Dr. Sankar"
  );
  const [reason, setReason] = useState("Patient requested rescheduled appointment time");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const scheduledIso = `${date}T${time}:00`;
      await onConfirm({
        startTime: scheduledIso,
        preferredDoctor: dentist,
        reason,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reschedule appointment.");
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-brand-text">
                Reschedule Appointment
              </h3>
              <p className="text-xs text-brand-muted">
                {appointment.patientName} • {appointment.service}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Schedule Summary */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Current Booking
          </span>
          <div className="flex items-center justify-between font-semibold text-brand-text">
            <span>
              {appointment.dateStr || "Today"} at {appointment.timeStr || "Scheduled"}
            </span>
            <span className="text-brand-muted">{appointment.doctor}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">
                New Date *
              </label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">
                New Time *
              </label>
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-brand-text">
              Attending Dentist
            </label>
            <Input
              value={dentist}
              onChange={(e) => setDentist(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-brand-text">
              Reason for Reschedule *
            </label>
            <Input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Patient requested morning slot, doctor unavailable..."
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-brand-primary text-white font-bold text-xs"
            >
              {loading ? "Rescheduling..." : "Save Reschedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
