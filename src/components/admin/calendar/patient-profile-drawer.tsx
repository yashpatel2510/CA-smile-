import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  CreditCard,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "./appointment-status-badge";

interface PatientProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
  phone?: string;
  patientData?: any;
}

export function PatientProfileDrawer({
  isOpen,
  onClose,
  patientId,
  phone,
  patientData,
}: PatientProfileDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"TREATMENTS" | "APPOINTMENTS" | "PAYMENTS">("TREATMENTS");

  useEffect(() => {
    if (!isOpen) return;

    if (patientData) {
      setProfile(patientData);
      return;
    }

    const targetId = patientId || phone;
    if (!targetId) return;

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients/${encodeURIComponent(targetId)}`);
        const data = await res.json();
        if (data.success && data.patient) {
          setProfile(data.patient);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [isOpen, patientId, phone, patientData]);

  if (!isOpen) return null;

  const p = profile || {
    firstName: "Patient",
    lastName: "",
    phone: phone || "",
    email: "",
    appointments: [],
    treatments: [],
    activeTreatments: [],
    completedTreatments: [],
  };

  const displayName = p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient Profile";
  const appointments = p.appointments || [];
  const treatments = p.treatments || [];
  const activeTreatments = p.activeTreatments || treatments.filter((t: any) => t.status === "IN_PROGRESS");
  const completedTreatments = p.completedTreatments || treatments.filter((t: any) => t.status === "COMPLETED");

  const totalPaid = appointments.reduce((sum: number, a: any) => sum + Number(a.paidAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-brand-border bg-slate-50/50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg">
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-brand-text">
                  {displayName}
                </h3>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Active Patient
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3 w-3 text-brand-primary" />
                  {p.phone}
                </span>
                {p.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {p.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-brand-border bg-white px-6 text-xs font-semibold">
          {[
            { id: "TREATMENTS", label: `Treatments (${treatments.length})` },
            { id: "APPOINTMENTS", label: `Visits (${appointments.length})` },
            { id: "PAYMENTS", label: `Payments (₹${totalPaid.toLocaleString()})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 font-bold transition-all ${
                activeTab === tab.id
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-muted hover:text-brand-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Treatments */}
          {activeTab === "TREATMENTS" && (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Active Clinical Treatments ({activeTreatments.length})
                </span>
                {activeTreatments.length === 0 ? (
                  <div className="mt-2 rounded-lg border border-slate-200 p-6 text-center text-xs text-brand-muted">
                    No active treatments in progress.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2.5">
                    {activeTreatments.map((trt: any) => (
                      <div
                        key={trt.id}
                        className="rounded-xl border border-brand-border bg-white p-4 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-brand-text">
                              {trt.title}
                            </span>
                            <div className="text-[11px] text-brand-muted">
                              Doctor: {trt.dentistName || "Chief Dental Surgeon"}
                            </div>
                          </div>
                          <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                            In Progress
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                          <span>
                            Progress:{" "}
                            <strong>
                              Session {trt.completedSessions} of {trt.totalSessions}
                            </strong>
                          </span>
                          <span>
                            Paid: <strong>₹{(trt.paidAmount || 0).toLocaleString()}</strong>
                          </span>
                        </div>

                        {trt.notes && (
                          <div className="text-[11px] text-brand-muted italic">
                            Notes: {trt.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {completedTreatments.length > 0 && (
                <div className="pt-3 border-t border-brand-border">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                    Completed Treatments ({completedTreatments.length})
                  </span>
                  <div className="mt-2 space-y-2">
                    {completedTreatments.map((trt: any) => (
                      <div
                        key={trt.id}
                        className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-emerald-950">{trt.title}</div>
                          <div className="text-[11px] text-emerald-800">
                            {trt.totalSessions} sessions completed
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                          Completed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Appointments */}
          {activeTab === "APPOINTMENTS" && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="rounded-lg border border-slate-200 p-8 text-center text-xs text-brand-muted">
                  No appointment history recorded.
                </div>
              ) : (
                appointments.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="rounded-xl border border-brand-border bg-white p-3.5 shadow-2xs text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-brand-text">
                        <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                        <span>
                          {new Date(apt.startTime).toLocaleDateString()} at{" "}
                          {new Date(apt.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <AppointmentStatusBadge status={apt.status} size="sm" />
                    </div>

                    <div className="text-brand-muted flex items-center justify-between">
                      <span>{apt.service?.name || apt.reason || "Dental Visit"}</span>
                      <span className="font-mono text-[10px]">{apt.id}</span>
                    </div>

                    {apt.notes && (
                      <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-700">
                        {apt.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Payments */}
          {activeTab === "PAYMENTS" && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Total Collected From Patient
                </span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                  ₹{totalPaid.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl border border-brand-border bg-white overflow-hidden">
                <div className="p-3 border-b border-brand-border font-bold text-xs">
                  Session Payment Records
                </div>
                <div className="divide-y divide-brand-border">
                  {appointments
                    .filter((a: any) => Number(a.paidAmount) > 0)
                    .map((a: any) => (
                      <div
                        key={a.id}
                        className="p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-brand-text">
                            {a.service?.name || "Dental Treatment Session"}
                          </div>
                          <div className="text-[11px] text-brand-muted">
                            {new Date(a.startTime).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700">
                            ₹{Number(a.paidAmount).toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {a.paymentStatus || "PAID"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
