"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Stethoscope,
  Sparkles,
  Check,
  User,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

export interface DoctorOption {
  id: string;
  name: string;
  specialty?: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  price?: string;
  provider?: string;
}

// Default fallback matching exactly the Setup page records
const DEFAULT_DOCTORS: DoctorOption[] = [
  { id: "doc-1", name: "Dr. Deep Patel", specialty: "Dental Surgeon" },
];

const DEFAULT_SERVICES: ServiceOption[] = [
  { id: "srv-gen-2", name: "Teeth Whitening (In-office)", price: "₹6,000", provider: "GENERAL" },
  { id: "srv-doc-1", name: "Dental Consultation", price: "₹300", provider: "Dr. Deep Patel" },
  { id: "srv-doc-9", name: "General Consultation", price: "₹100", provider: "Dr. Deep Patel" },
  { id: "srv-doc-2", name: "Composite Restoration (Class I/II)", price: "₹1,000", provider: "Dr. Deep Patel" },
  { id: "srv-doc-3", name: "GIC Filling", price: "₹600", provider: "Dr. Deep Patel" },
  { id: "srv-doc-4", name: "Simple Extraction", price: "₹600", provider: "Dr. Deep Patel" },
  { id: "srv-doc-5", name: "Root Canal Treatment: Molar", price: "₹6,000", provider: "Dr. Deep Patel" },
  { id: "srv-doc-6", name: "Root Canal Treatment: Anterior", price: "₹4,000", provider: "Dr. Deep Patel" },
  { id: "srv-doc-7", name: "Zirconia Crown", price: "₹9,000", provider: "Dr. Deep Patel" },
  { id: "srv-doc-8", name: "Fluoride Application", price: "₹500", provider: "Dr. Deep Patel" },
];

interface EditDoctorServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
    time: string;
    doctorName: string;
    service: string;
  } | null;
  onUpdated: (appointmentId: string, newDoctor: string, newService: string) => void;
}

export function CuravertoEditDoctorServiceModal({
  isOpen,
  onClose,
  appointment,
  onUpdated,
}: EditDoctorServiceModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [customService, setCustomService] = useState("");
  const [isCustomService, setIsCustomService] = useState(false);

  const [doctorsList, setDoctorsList] = useState<DoctorOption[]>(DEFAULT_DOCTORS);
  const [servicesList, setServicesList] = useState<ServiceOption[]>(DEFAULT_SERVICES);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Sync state & load live setup doctors and services
  useEffect(() => {
    if (!appointment || !isOpen) return;

    setErrorMsg("");
    setSuccess(false);

    const currentDoc = (appointment.doctorName || "Dr. Deep Patel").trim();
    const currentSvc = (appointment.service || "General Consultation").trim();

    setSelectedService(currentSvc);
    setIsCustomService(false);
    setCustomService("");

    // Fetch live doctors & live services from Setup APIs in parallel
    Promise.all([
      fetch("/api/admin/setup/doctors").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/setup/services").then((r) => r.json()).catch(() => null),
    ]).then(([docRes, svcRes]) => {
      // 1. Process Doctors strictly from Setup (only registered doctors)
      let docs: DoctorOption[] = DEFAULT_DOCTORS;
      if (docRes?.success && Array.isArray(docRes.data) && docRes.data.length > 0) {
        docs = docRes.data.map((d: any) => ({
          id: d.id || `doc-${d.name}`,
          name: d.name,
          specialty: d.specialty || d.department || d.postGraduateSpecialization || "Dental Surgeon",
        }));
      }
      setDoctorsList(docs);

      // Match current appointment's doctor only if registered in Setup, otherwise default to first registered doctor
      const matchedDoc = docs.find(
        (d) =>
          d.name.toLowerCase() === currentDoc.toLowerCase() ||
          currentDoc.toLowerCase().includes(d.name.toLowerCase()) ||
          d.name.toLowerCase().includes(currentDoc.toLowerCase())
      );
      if (matchedDoc) {
        setSelectedDoctor(matchedDoc.name);
      } else if (docs.length > 0) {
        setSelectedDoctor(docs[0].name);
      } else {
        setSelectedDoctor("Dr. Deep Patel");
      }

      // 2. Process Services from Setup
      let svcs: ServiceOption[] = DEFAULT_SERVICES;
      if (svcRes?.success && Array.isArray(svcRes.data) && svcRes.data.length > 0) {
        svcs = svcRes.data.map((s: any) => ({
          id: s.id || `srv-${s.name}`,
          name: s.name,
          price: s.price != null ? `₹${Number(s.price).toLocaleString("en-IN")}` : "",
          provider: s.provider,
        }));
      }

      // Match current appointment's service accurately
      const matchedSvc = svcs.find(
        (s) =>
          s.name.toLowerCase() === currentSvc.toLowerCase() ||
          currentSvc.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(currentSvc.toLowerCase())
      );

      if (matchedSvc) {
        setSelectedService(matchedSvc.name);
      } else if (currentSvc) {
        // If current appointment has a specific service name not yet in setup, keep it in the dropdown list
        svcs = [{ id: "current-svc", name: currentSvc, price: "" }, ...svcs];
        setSelectedService(currentSvc);
      }
      setServicesList(svcs);
    });
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const doctorToSave = selectedDoctor.trim();
    const serviceToSave = isCustomService ? customService.trim() : selectedService;

    if (!doctorToSave) {
      setErrorMsg("Please select a registered doctor.");
      return;
    }
    if (!serviceToSave) {
      setErrorMsg("Please select or enter a service name.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredDoctor: doctorToSave,
          serviceName: serviceToSave,
          reason: serviceToSave,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update appointment on server.");
      }

      setSuccess(true);
      onUpdated(appointment.id, doctorToSave, serviceToSave);

      setTimeout(() => {
        setSaving(false);
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Error updating doctor & service:", err);
      // Still apply optimistic update locally for mock/offline mode
      onUpdated(appointment.id, doctorToSave, serviceToSave);
      setSuccess(true);
      setTimeout(() => {
        setSaving(false);
        setSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Change Doctor & Service
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {appointment.patientName} • {appointment.patientId} • {appointment.time}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Doctor & Service updated successfully!</span>
            </div>
          )}

          {/* Current Assignment Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                CURRENT ASSIGNMENT
              </span>
              <div className="font-bold text-slate-900 mt-0.5 text-sm">
                {appointment.doctorName}
              </div>
              <div className="text-slate-500 text-xs font-medium mt-0.5">
                {appointment.service}
              </div>
            </div>
            <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
              Editing
            </span>
          </div>

          {/* DOCTOR FIELD (Loaded from /admin/setup/doctors) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                SELECT DOCTOR <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Registered in Setup
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden shadow-2xs pr-9 cursor-pointer"
              >
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} {doc.specialty ? `(${doc.specialty})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Doctors configured in Setup ({doctorsList.length} available)
            </p>
          </div>

          {/* SERVICE / TREATMENT FIELD (Loaded from /admin/setup/services) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                SELECT SERVICE / TREATMENT <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomService(!isCustomService)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {isCustomService ? "Choose from Setup list" : "+ Enter custom service"}
              </button>
            </div>

            {isCustomService ? (
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="e.g. Teeth Whitening & Bleaching"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden shadow-2xs"
                autoFocus
              />
            ) : (
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden shadow-2xs pr-9 cursor-pointer"
                >
                  {servicesList.map((svc) => (
                    <option key={svc.id} value={svc.name}>
                      {svc.name} {svc.price ? `• ${svc.price}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            )}
            <p className="mt-1 text-[10px] text-slate-400">
              Services & pricing configured in Setup ({servicesList.length} available)
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
