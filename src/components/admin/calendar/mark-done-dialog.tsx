import React, { useState } from "react";
import {
  Sparkles,
  X,
  Check,
  Calendar,
  Clock,
  User,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MarkDoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onConfirm: (data: {
    procedure: string;
    treatmentNotes: string;
    dentistNotes: string;
    paidAmount: number;
    paymentMethod: string;
    nextSessionRequired: boolean;
    nextSessionDate?: string;
    nextSessionTime?: string;
    nextSessionDoctor?: string;
    nextSessionNotes?: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function MarkDoneDialog({
  isOpen,
  onClose,
  appointment,
  onConfirm,
  loading = false,
}: MarkDoneDialogProps) {
  const currentSessionNum =
    appointment?.treatmentSession?.sessionNumber ||
    appointment?.sessionNumber ||
    1;
  const totalSessions =
    appointment?.treatment?.totalSessions ||
    appointment?.treatmentSession?.totalSessions ||
    appointment?.totalSessions ||
    1;

  const isFinalSession = currentSessionNum >= totalSessions;
  const nextSessionNum = currentSessionNum + 1;

  // Default values
  const [procedure, setProcedure] = useState(
    appointment?.service?.name || appointment?.reason || "Dental procedure completed"
  );
  const [treatmentNotes, setTreatmentNotes] = useState(
    "Procedure completed as planned. Hemostasis achieved. Post-op instructions given."
  );
  const [dentistNotes, setDentistNotes] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [nextSessionRequired, setNextSessionRequired] = useState(!isFinalSession);

  // Next session schedule fields
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7); // Default 1 week follow-up
  const [nextDate, setNextDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [nextTime, setNextTime] = useState("10:30:00");
  const [nextDoctor, setNextDoctor] = useState(
    appointment?.preferredDoctor || appointment?.doctor || "Dr. Sankar (Chief Dental Surgeon)"
  );
  const [nextNotes, setNextNotes] = useState(
    `Session ${nextSessionNum}/${totalSessions} Follow-up`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      procedure,
      treatmentNotes,
      dentistNotes,
      paidAmount: Number(paidAmount) || 0,
      paymentMethod,
      nextSessionRequired,
      nextSessionDate: nextSessionRequired ? nextDate : undefined,
      nextSessionTime: nextSessionRequired ? nextTime : undefined,
      nextSessionDoctor: nextSessionRequired ? nextDoctor : undefined,
      nextSessionNotes: nextSessionRequired ? nextNotes : undefined,
    });
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text">
                Complete Treatment Session
              </h3>
              <p className="text-xs text-brand-muted">
                Patient: <strong>{appointment.patientName || `${appointment.patient?.firstName || ""} ${appointment.patient?.lastName && appointment.patient?.lastName !== "Patient" ? appointment.patient.lastName : ""}`.trim() || "Valued Patient"}</strong> • {appointment.service?.name || appointment.service}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Session Indicator */}
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Active Treatment
            </span>
            <div className="font-bold text-emerald-950">
              {appointment.treatment?.title || appointment.service?.name || "Dental Treatment"}
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
              Session {currentSessionNum} of {totalSessions}
            </span>
            {isFinalSession && (
              <span className="block mt-0.5 text-[10px] font-bold text-emerald-800">
                ★ Final Session
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Procedure Completed */}
          <div className="space-y-1">
            <label className="font-semibold text-brand-text">
              Procedure / Treatment Completed *
            </label>
            <Input
              required
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g. Pulp extirpation, canal shaping, obturation..."
              className="text-xs h-9"
            />
          </div>

          {/* Treatment Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-brand-text">
              Clinical / Treatment Notes
            </label>
            <textarea
              rows={2}
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="Materials used, patient response, post-procedure instructions..."
              className="w-full rounded-md border border-brand-border p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Optional Dentist Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-brand-text">
              Attending Dentist Notes (Optional)
            </label>
            <Input
              value={dentistNotes}
              onChange={(e) => setDentistNotes(e.target.value)}
              placeholder="Doctor remarks or follow-up advisory..."
              className="text-xs h-9"
            />
          </div>

          {/* Financials / Payment Collection */}
          <div className="rounded-xl border border-brand-border bg-slate-50/70 p-3.5 space-y-3">
            <span className="font-bold text-brand-text flex items-center gap-1.5 text-xs">
              <CreditCard className="h-4 w-4 text-brand-primary" />
              <span>Session Payment Collection</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-brand-muted text-[11px] block mb-1">
                  Amount Collected (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="50"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="text-xs h-9 font-semibold bg-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="font-medium text-brand-muted text-[11px] block mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Next Session Required Toggle */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-blue-950 block">
                  Next Treatment Session Required?
                </span>
                <span className="text-[11px] text-blue-800">
                  {nextSessionRequired
                    ? `Prepares Session ${nextSessionNum}/${totalSessions} appointment`
                    : "No further sessions required. Treatment will be marked Completed."}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-blue-200">
                <button
                  type="button"
                  onClick={() => setNextSessionRequired(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    nextSessionRequired
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setNextSessionRequired(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    !nextSessionRequired
                      ? "bg-slate-800 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  NO
                </button>
              </div>
            </div>

            {/* If YES: Show Next Session Fields */}
            {nextSessionRequired && (
              <div className="space-y-3 pt-3 border-t border-blue-200/80 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900">
                    Next: Session {nextSessionNum} of {totalSessions}
                  </span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
                    Automatic Booking
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Next Appointment Date *
                    </label>
                    <Input
                      type="date"
                      required={nextSessionRequired}
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                      className="bg-white text-xs h-9"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Time Slot *
                    </label>
                    <Input
                      type="time"
                      required={nextSessionRequired}
                      value={nextTime}
                      onChange={(e) => setNextTime(e.target.value)}
                      className="bg-white text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Attending Dentist
                    </label>
                    <Input
                      value={nextDoctor}
                      onChange={(e) => setNextDoctor(e.target.value)}
                      className="bg-white text-xs h-9"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 block mb-1">
                      Session Procedure Note
                    </label>
                    <Input
                      value={nextNotes}
                      onChange={(e) => setNextNotes(e.target.value)}
                      className="bg-white text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? "Completing..." : "Save & Complete Session"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
