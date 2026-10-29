"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Stethoscope,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Bell,
  CheckCheck,
  FileText,
  AlertCircle,
  Users,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface DoctorPatient {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  phone: string;
  email?: string;
  gender?: string;
  age?: string;
  serviceId?: string;
  serviceName: string;
  doctor: string;
  timeSlot: string;
  startTime: string;
  status: string;
  source: string;
  notes?: string;
  reason?: string;
  checkedInAt?: string | null;
  treatmentStartedAt?: string | null;
  waitingMinutes: number;
}

export function CuravertoDoctorConsultationView() {
  const [appointments, setAppointments] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("All Doctors");
  const [doctorsList, setDoctorsList] = useState<string[]>([
    "Dr. Deep Patel",
    "Dr. Sankar",
  ]);

  // Clinical Notes Modal
  const [activeNotesPatient, setActiveNotesPatient] = useState<DoctorPatient | null>(null);
  const [clinicalNotesText, setClinicalNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Load doctors from API
  useEffect(() => {
    fetch("/api/admin/setup/doctors")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDoctorsList(json.data.map((d: any) => d.name));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch today appointments strictly filtered for In-Clinic and Counseling
  const fetchDoctorQueue = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      const res = await fetch("/api/admin/today");
      const json = await res.json();
      if (json.success && Array.isArray(json.appointments)) {
        // STRICT REQUIREMENT: Only show TODAY patients who are:
        // 1. IN-CLINIC (CHECKED_IN / WAITING / IN-CLINIC)
        // 2. START COUNSELING / CONSULTING (TREATMENT_STARTED / CONSULTING / IN_TREATMENT)
        const relevant = json.appointments.filter((a: any) => {
          const s = a.status?.toUpperCase() || "";
          return (
            s === "CHECKED_IN" ||
            s === "IN-CLINIC" ||
            s === "WAITING" ||
            s === "TREATMENT_STARTED" ||
            s === "CONSULTING" ||
            s === "IN_TREATMENT"
          );
        });
        setAppointments(relevant);
      }
    } catch (err) {
      console.error("Failed to fetch doctor queue:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();
    const interval = setInterval(() => fetchDoctorQueue(true), 6000);
    return () => clearInterval(interval);
  }, []);

  // Filter by selected doctor
  const filteredPatients = appointments.filter((a) => {
    if (selectedDoctor === "All Doctors") return true;
    return a.doctor?.toLowerCase().includes(selectedDoctor.toLowerCase());
  });

  // Separate into:
  // 1. Active Consultation (Start Counseling / In-Chair)
  const inConsultationPatients = filteredPatients.filter((a) => {
    const s = a.status?.toUpperCase() || "";
    return s === "TREATMENT_STARTED" || s === "CONSULTING" || s === "IN_TREATMENT";
  });

  // 2. In Clinic (Arrived & Waiting in Lounge for Doctor)
  const inClinicPatients = filteredPatients.filter((a) => {
    const s = a.status?.toUpperCase() || "";
    return s === "CHECKED_IN" || s === "IN-CLINIC" || s === "WAITING";
  });

  // Action: Doctor clicks "Start Counseling"
  const handleStartCounseling = async (patient: DoctorPatient) => {
    try {
      // Broadcast live calling state to reception TV
      try {
        await fetch("/api/admin/queue/live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: patient.tokenNumber,
            patient: patient.patientName,
            doctor: patient.doctor || "Dr. CA Smile",
            service: patient.serviceName || "Consultation",
            room: "Consultation Room 1",
            status: "CALLING",
            action: "CALL",
          }),
        });
      } catch {}

      await fetch(`/api/appointments/${patient.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "TREATMENT_STARTED",
          forceOverride: true,
          performedBy: "Doctor Console",
        }),
      });

      await fetchDoctorQueue(true);
    } catch (err) {
      console.error("Error starting counseling:", err);
    }
  };

  // Action: Doctor clicks "Complete Consultation / Done"
  const handleCompleteConsultation = async (patient: DoctorPatient) => {
    try {
      await fetch(`/api/appointments/${patient.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "TREATMENT_DONE",
          forceOverride: true,
          performedBy: "Doctor Console",
        }),
      });

      // Broadcast completed state to reception TV if no more waiting patients
      if (inClinicPatients.length <= 1) {
        try {
          await fetch("/api/admin/queue/live", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: patient.tokenNumber,
              patient: "All Consultations Completed",
              doctor: patient.doctor || "Dr. CA Smile",
              status: "COMPLETED",
              action: "FINISH",
            }),
          });
        } catch {}
      }

      await fetchDoctorQueue(true);
    } catch (err) {
      console.error("Error completing consultation:", err);
    }
  };

  // Action: Save clinical notes
  const handleSaveNotes = async () => {
    if (!activeNotesPatient) return;
    setSavingNotes(true);
    try {
      await fetch(`/api/appointments/${activeNotesPatient.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: activeNotesPatient.status,
          treatmentNotes: clinicalNotesText,
          forceOverride: true,
          performedBy: "Doctor Console",
        }),
      });
      setActiveNotesPatient(null);
      setClinicalNotesText("");
      await fetchDoctorQueue(true);
    } catch (err) {
      console.error("Error saving clinical notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Today Date formatted string
  const todayDisplay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f8fafc]/80 pb-16 font-sans text-slate-800 antialiased">
      <div className="mx-auto max-w-[1520px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 space-y-6">
        {/* ================================================================= */}
        {/* 1. TOP HEADER & DOCTOR SELECTION                                  */}
        {/* ================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Doctor Section
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Today Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing <strong className="text-slate-800">Only Today&apos;s Patients</strong> who are{" "}
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                    In-Clinic
                  </span>{" "}
                  or{" "}
                  <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded">
                    In Counseling
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Today Date Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{todayDisplay}</span>
            </div>

            {/* Doctor Filter Dropdown */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Doctor:
              </span>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="All Doctors">All Doctors</option>
                {doctorsList.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchDoctorQueue()}
              title="Refresh Queue"
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. STATS CARDS                                                    */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                In Clinic (Waiting for Doctor)
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                {inClinicPatients.length}
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">
              {inClinicPatients.length} Patients
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Arrived &amp; seated in reception lounge
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                In Counseling (Dental Chair)
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                {inConsultationPatients.length}
              </span>
            </div>
            <p className="text-2xl font-black text-blue-950 mt-1 font-mono">
              {inConsultationPatients.length} Active
            </p>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">
              Currently inside consultation room
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Today Active
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                {filteredPatients.length}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {filteredPatients.length} Total
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Today&apos;s physical clinic flow
            </p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. SECTION A: CURRENTLY IN COUNSELING (ACTIVE CHAIR)              */}
        {/* ================================================================= */}
        <div className="rounded-2xl border border-blue-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">
                Currently in Counseling / Active Dental Chair
              </h2>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {inConsultationPatients.length} Active in Chair
            </span>
          </div>

          {inConsultationPatients.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 p-6 space-y-1">
              <p className="text-sm font-bold text-slate-700">
                Dental Chair is Currently Empty
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No patient is currently in counseling. Choose a patient from the &quot;In-Clinic Patients Queue&quot; below and click <strong className="text-blue-600 font-semibold">&quot;Start Counseling&quot;</strong> to call them into the chair.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inConsultationPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="rounded-2xl border-2 border-blue-500/60 bg-blue-50/20 p-4 sm:p-5 shadow-xs space-y-3.5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-mono text-xs font-black text-white">
                          #{patient.tokenNumber}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900">
                          {patient.patientName}
                        </h3>
                      </div>
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                        <span className="font-mono text-slate-400">{patient.phone}</span>
                        <span>·</span>
                        <span className="text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {patient.serviceName}
                        </span>
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider shadow-2xs">
                      <Stethoscope className="w-3 h-3" />
                      In Counseling
                    </span>
                  </div>

                  {/* Doctor & Reason info */}
                  <div className="rounded-xl bg-white border border-blue-100 p-3 space-y-1 text-xs">
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Doctor:</strong> {patient.doctor}
                    </p>
                    {patient.reason && (
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Reason / Complaint:</strong> {patient.reason}
                      </p>
                    )}
                    {patient.notes && (
                      <p className="text-slate-500 italic">
                        &quot;{patient.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-100">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveNotesPatient(patient);
                        setClinicalNotesText(patient.notes || "");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Clinical Notes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompleteConsultation(patient)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Complete &amp; Done</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 4. SECTION B: IN-CLINIC PATIENTS QUEUE (READY FOR DOCTOR)         */}
        {/* ================================================================= */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              <h2 className="text-base font-bold text-slate-900">
                In-Clinic Patients Queue (Arrived &amp; Waiting)
              </h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {inClinicPatients.length} Waiting in Lounge
            </span>
          </div>

          {inClinicPatients.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-6 space-y-1">
              <p className="text-sm font-bold text-slate-700">
                No Patients Currently Waiting In Clinic
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                When reception marks a patient as &quot;In-Clinic&quot; or when a walk-in arrives today, they will instantly appear here ready for counseling.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inClinicPatients.map((patient, idx) => (
                <div
                  key={patient.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-mono text-xs font-black text-emerald-800">
                      #{patient.tokenNumber}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {patient.patientName}
                        </p>
                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                          🟢 In-Clinic
                        </span>
                        {patient.timeSlot && (
                          <span className="rounded bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5">
                            {patient.timeSlot}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        <span className="font-semibold text-slate-700">{patient.serviceName}</span>
                        {" · "}
                        <span className="text-slate-400">Doctor: {patient.doctor}</span>
                        {patient.waitingMinutes > 0 && (
                          <span className="text-amber-600 font-semibold ml-1.5">
                            (Waiting {patient.waitingMinutes}m)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartCounseling(patient)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Start Counseling</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* 5. CLINICAL NOTES MODAL                                            */}
        {/* ================================================================= */}
        {activeNotesPatient && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={() => setActiveNotesPatient(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Clinical &amp; Counseling Notes
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeNotesPatient.patientName} (Token #{activeNotesPatient.tokenNumber})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNotesPatient(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Doctor Diagnosis / Treatment Notes
                </label>
                <textarea
                  rows={4}
                  value={clinicalNotesText}
                  onChange={(e) => setClinicalNotesText(e.target.value)}
                  placeholder="Enter diagnosis, clinical observations, or advice given during counseling..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveNotesPatient(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
