import React from "react";
import { CheckCircle2, Clock, Sparkles, AlertCircle, ArrowDown } from "lucide-react";
import { AppointmentStatusBadge } from "./appointment-status-badge";

export interface TimelineSession {
  id?: string;
  sessionNumber: number;
  totalSessions: number;
  status: string;
  dateStr?: string;
  timeStr?: string;
  procedure?: string;
  amount?: number;
  paidAmount?: number;
  paymentStatus?: string;
  appointmentId?: string;
  isCurrent?: boolean;
}

interface SessionTimelineProps {
  treatmentTitle?: string;
  totalSessions: number;
  completedSessions: number;
  treatmentStatus?: string;
  sessions: TimelineSession[];
  onSelectSession?: (session: TimelineSession) => void;
  className?: string;
}

export function SessionTimeline({
  treatmentTitle = "Dental Treatment",
  totalSessions,
  completedSessions,
  treatmentStatus = "IN_PROGRESS",
  sessions = [],
  onSelectSession,
  className = "",
}: SessionTimelineProps) {
  // If fewer session records exist than totalSessions, generate stub placeholders
  const displaySessions: TimelineSession[] = [];
  const sessionCount = Math.max(totalSessions, sessions.length, 1);

  for (let num = 1; num <= sessionCount; num++) {
    const existing = sessions.find((s) => s.sessionNumber === num);
    if (existing) {
      displaySessions.push(existing);
    } else {
      displaySessions.push({
        sessionNumber: num,
        totalSessions: sessionCount,
        status: num <= completedSessions ? "TREATMENT_DONE" : "PENDING",
        procedure: `Planned Session ${num}`,
      });
    }
  }

  const isCompleted = treatmentStatus === "COMPLETED" || completedSessions >= totalSessions;

  return (
    <div className={`space-y-4 rounded-xl border border-brand-border bg-slate-50/50 p-4 ${className}`}>
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold text-brand-text">
              {treatmentTitle}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {isCompleted ? "Treatment Completed" : "Treatment In Progress"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">
            {completedSessions} of {totalSessions} planned sessions completed
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all ${
                isCompleted ? "bg-emerald-600" : "bg-brand-primary"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.round((completedSessions / Math.max(totalSessions, 1)) * 100)
                )}%`,
              }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-brand-text">
            {Math.round((completedSessions / Math.max(totalSessions, 1)) * 100)}%
          </span>
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
        {displaySessions.map((session, index) => {
          const isDone =
            session.status === "TREATMENT_DONE" || session.status === "COMPLETED";
          const isStarted =
            session.status === "TREATMENT_STARTED" || session.status === "IN_PROGRESS";
          const isCheckedIn = session.status === "CHECKED_IN";
          const isConfirmed = session.status === "CONFIRMED";
          const isUpcomingOrCurrent = isStarted || isCheckedIn || (isConfirmed && !isDone);

          return (
            <div
              key={`session-${session.sessionNumber}-${index}`}
              onClick={() => onSelectSession?.(session)}
              className={`relative rounded-lg border p-3 text-xs transition-all ${
                session.isCurrent
                  ? "border-brand-primary bg-white shadow-xs ring-1 ring-brand-primary/40"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50/40"
                  : isUpcomingOrCurrent
                  ? "border-blue-200 bg-blue-50/40"
                  : "border-slate-200 bg-white"
              } ${onSelectSession ? "cursor-pointer hover:border-brand-primary/60" : ""}`}
            >
              {/* Dot Icon indicator on vertical line */}
              <div
                className={`absolute -left-[30px] top-3.5 flex h-5 w-5 items-center justify-center rounded-full border bg-white shadow-2xs ${
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isUpcomingOrCurrent
                    ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-300"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3 w-3 fill-current" />
                ) : (
                  <span className="text-[10px] font-bold">{session.sessionNumber}</span>
                )}
              </div>

              {/* Session Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-text">
                    Session {session.sessionNumber} of {session.totalSessions || totalSessions}
                  </span>
                  {session.isCurrent && (
                    <span className="rounded bg-brand-primary/10 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-brand-primary">
                      Current
                    </span>
                  )}
                </div>
                <AppointmentStatusBadge status={session.status} size="sm" />
              </div>

              {/* Procedure & Notes */}
              {session.procedure && (
                <div className="mt-1 text-slate-700 font-medium">
                  {session.procedure}
                </div>
              )}

              {/* Date & Financial Info */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2 text-[11px] text-brand-muted">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-brand-primary" />
                  <span>
                    {session.dateStr
                      ? `${session.dateStr} ${session.timeStr ? `• ${session.timeStr}` : ""}`
                      : isDone
                      ? "Completed Session"
                      : "Date to be scheduled"}
                  </span>
                </div>

                {typeof session.paidAmount === "number" && session.paidAmount > 0 && (
                  <div className="font-semibold text-emerald-700">
                    ₹{session.paidAmount.toLocaleString()} paid
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
