import React, { useState } from "react";
import { Plus, X, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NextSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: any;
  onConfirm: (data: {
    appointmentDate: string;
    startTime: string;
    preferredDoctor?: string;
    durationMinutes: number;
    notes?: string;
    procedure?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function NextSessionModal({
  isOpen,
  onClose,
  treatment,
  onConfirm,
  loading = false,
}: NextSessionModalProps) {
  const currentCount = treatment?.completedSessions || 0;
  const totalSessions = treatment?.totalSessions || 1;
  const nextSessionNumber = currentCount + 1;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);

  const [date, setDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [time, setTime] = useState("10:30:00");
  const [dentist, setDentist] = useState(
    treatment?.dentistName || "Dr. Sankar (Chief Dental Surgeon)"
  );
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState(
    `Session ${nextSessionNumber}/${totalSessions} Follow-up`
  );
  const [procedure, setProcedure] = useState(
    treatment?.title ? `${treatment.title} - Session ${nextSessionNumber}` : ""
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onConfirm({
        appointmentDate: date,
        startTime: time,
        preferredDoctor: dentist,
        durationMinutes: Number(duration) || 45,
        notes,
        procedure,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to schedule next session");
    }
  };

  if (!isOpen || !treatment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-brand-text">
                Schedule Next Treatment Session
              </h3>
              <p className="text-xs text-brand-muted">
                Links new visit to current treatment plan
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

        {/* Treatment Info Card */}
        <div className="rounded-lg border border-brand-primary/20 bg-brand-primary/5 p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-brand-muted text-[11px]">Treatment</span>
            <span className="font-bold text-brand-primary">{treatment.title}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
            <div>
              <span className="text-slate-500 block text-[10px]">Current Status</span>
              <strong className="text-brand-text">
                Session {currentCount} of {totalSessions} Done
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Scheduling</span>
              <strong className="text-emerald-700">
                Session {nextSessionNumber} of {Math.max(totalSessions, nextSessionNumber)}
              </strong>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Date *</label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Time Slot *</label>
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Dentist</label>
              <Input
                value={dentist}
                onChange={(e) => setDentist(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-brand-text">Planned Procedure</label>
            <Input
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g. Master cone obturation, Crown cementation..."
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-brand-text">Notes / Instructions</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              {loading ? "Scheduling..." : "Confirm & Schedule Session"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
