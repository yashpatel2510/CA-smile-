import React, { useState } from "react";
import {
  AlertTriangle,
  Sparkles,
  Calendar,
  Clock,
  User,
  Plus,
  ArrowRight,
  CheckCircle2,
  Check,
  Search,
  RefreshCw,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionTimeline } from "./session-timeline";

interface TreatmentDashboardViewProps {
  treatments: any[];
  loading: boolean;
  onRefresh: () => void;
  onScheduleNextSession: (treatment: any) => void;
  onViewPatient: (patient: any) => void;
}

export function TreatmentDashboardView({
  treatments,
  loading,
  onRefresh,
  onScheduleNextSession,
  onViewPatient,
}: TreatmentDashboardViewProps) {
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "OVERDUE" | "COMPLETED" | "ALL">("ACTIVE");
  const [search, setSearch] = useState("");
  const [expandedTreatmentId, setExpandedTreatmentId] = useState<string | null>(null);

  // Overdue / Follow-up alerts (Requirement 19)
  const overdueTreatments = treatments.filter((t) => t.isOverdueFollowup);
  const activeTreatments = treatments.filter((t) => t.status === "IN_PROGRESS");
  const completedTreatments = treatments.filter((t) => t.status === "COMPLETED");

  const filtered = treatments.filter((t) => {
    if (filterTab === "OVERDUE" && !t.isOverdueFollowup) return false;
    if (filterTab === "ACTIVE" && t.status !== "IN_PROGRESS") return false;
    if (filterTab === "COMPLETED" && t.status !== "COMPLETED") return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const patientName = `${t.patient?.firstName || ""} ${t.patient?.lastName || ""}`.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      patientName.includes(q) ||
      t.treatmentType?.toLowerCase().includes(q) ||
      t.dentistName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Requirement 19: OVERDUE / MISSED SESSIONS ALERT BANNER */}
      {overdueTreatments.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-amber-950">
                  ⚠️ Follow-up Required: {overdueTreatments.length} Active Treatment{overdueTreatments.length > 1 ? "s" : ""} Without Next Session
                </h3>
                <p className="text-xs text-amber-800">
                  The previous treatment session was marked completed, but the patient has not been scheduled for their next required appointment.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterTab("OVERDUE")}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
            >
              Filter Overdue ({overdueTreatments.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {overdueTreatments.map((t) => (
              <div
                key={`overdue-${t.id}`}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-white p-3 text-xs shadow-2xs"
              >
                <div>
                  <div className="font-bold text-brand-text">
                    {t.patient?.firstName} {t.patient?.lastName}
                  </div>
                  <div className="text-[11px] text-amber-900 font-semibold">
                    {t.title} • Session {t.completedSessions}/{t.totalSessions} Done
                  </div>
                  <div className="text-[10px] text-brand-muted">
                    Next session not scheduled
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onScheduleNextSession(t)}
                  className="h-7 text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 shadow-2xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Schedule</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-clinic text-xs font-semibold">
          {[
            { id: "ACTIVE", label: `Active Treatments (${activeTreatments.length})` },
            { id: "OVERDUE", label: `Follow-up Required (${overdueTreatments.length})` },
            { id: "COMPLETED", label: `Completed (${completedTreatments.length})` },
            { id: "ALL", label: `All (${treatments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filterTab === tab.id
                  ? "bg-white text-brand-primary shadow-xs font-bold"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-muted" />
            <Input
              placeholder="Search treatments, patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Treatments List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-xs text-brand-muted">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30 text-brand-primary" />
          <p className="font-semibold text-sm text-brand-text">No Treatments Found</p>
          <p className="mt-1">All patient treatments matching your criteria are accounted for.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((treatment) => {
            const isExpanded = expandedTreatmentId === treatment.id;
            const patientName = `${treatment.patient?.firstName || ""} ${treatment.patient?.lastName || ""}`.trim() || "Patient";

            return (
              <Card
                key={treatment.id}
                className="overflow-hidden border-brand-border bg-white shadow-2xs hover:shadow-xs transition-all"
              >
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-base font-bold text-brand-text">
                          {treatment.title}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            treatment.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}
                        >
                          {treatment.status === "COMPLETED" ? "Completed" : "In Progress"}
                        </span>
                        {treatment.isOverdueFollowup && (
                          <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Next Session Needed</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                        <button
                          type="button"
                          onClick={() => onViewPatient(treatment.patient)}
                          className="font-bold text-brand-primary hover:underline flex items-center gap-1"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>{patientName}</span>
                        </button>
                        {treatment.patient?.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3" />
                            +{treatment.patient.phone}
                          </span>
                        )}
                        <span>• Doctor: {treatment.dentistName || "Chief Dental Surgeon"}</span>
                      </div>
                    </div>

                    {/* Progress Badge & Action */}
                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-brand-text">
                          Session {treatment.completedSessions} of {treatment.totalSessions}
                        </span>
                        <div className="text-[10px] text-brand-muted">
                          {treatment.completedSessions >= treatment.totalSessions
                            ? "All sessions completed"
                            : `${treatment.totalSessions - treatment.completedSessions} remaining`}
                        </div>
                      </div>

                      {treatment.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          onClick={() => onScheduleNextSession(treatment)}
                          className="h-8 text-xs font-bold bg-brand-primary text-white gap-1 shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Add Next Session</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedTreatmentId(isExpanded ? null : treatment.id)
                        }
                        className="h-8 text-xs"
                      >
                        {isExpanded ? "Hide Timeline" : "View Timeline"}
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Session Timeline */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-brand-border/60 animate-in fade-in duration-150">
                      <SessionTimeline
                        treatmentTitle={treatment.title}
                        totalSessions={treatment.totalSessions}
                        completedSessions={treatment.completedSessions}
                        treatmentStatus={treatment.status}
                        sessions={treatment.sessions || []}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
