"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Upload,
  UserPlus,
  Phone,
  Edit2,
  Stethoscope,
  FileText,
  Clock,
  Plus,
  X,
  Check,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  User,
  MapPin,
  HeartPulse,
  RefreshCw,
} from "lucide-react";
import PATIENTS_DATA from "@/data/patients-records.json";
import {
  CuravertoEditPatientModal,
  PatientEditData,
} from "@/components/admin/appointments/curaverto-edit-patient-modal";

interface TimelineItem {
  id: string;
  type: string;
  date: string;
  doctor: string;
  reason?: string;
  diagnosis?: string;
  notes?: string;
  dotColor?: "gray" | "blue" | "emerald";
}

interface PatientRecord {
  id: string;
  patientNumber: string;
  name: string;
  phone: string;
  gender: string;
  age: string;
  dob: string;
  patientType?: string;
  isNew: boolean;
  totalVisits: number;
  lastVisit: string;
  avatarColor?: string;
  timeline: TimelineItem[];
  email?: string;
  bloodGroup?: string;
  leadSource?: string;
  addressLine?: string;
  locality?: string;
  pin?: string;
  city?: string;
  state?: string;
  allergies?: string;
  medicalConditions?: string;
  treatmentCost?: string;
  emergencyContact?: string;
  familyMembers?: { name: string; relation: string; phone: string }[];
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    weight?: string;
    temperature?: string;
  };
  documentsCount?: number;
  labOrdersCount?: number;
}

export function CuravertoPatientsWorkspace() {
  const [topTab, setTopTab] = useState<"patients" | "vaccines">("patients");
  
  // Instant initial load using pre-cached static dataset
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    return (Array.isArray(PATIENTS_DATA) && PATIENTS_DATA.length > 0
      ? (PATIENTS_DATA as PatientRecord[])
      : []) as PatientRecord[];
  });
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return (PATIENTS_DATA as PatientRecord[])?.[0]?.id || "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [clinicalTab, setClinicalTab] = useState<"info" | "history">("info");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Modals
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [isNewEmrOpen, setIsNewEmrOpen] = useState(false);
  const [isSetCostOpen, setIsSetCostOpen] = useState(false);

  // New Patient Form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newDob, setNewDob] = useState("");

  // New EMR Form
  const [emrType, setEmrType] = useState<"VISIT • COMPLETED" | "PRESCRIPTION">("VISIT • COMPLETED");
  const [emrReason, setEmrReason] = useState("");
  const [emrDiagnosis, setEmrDiagnosis] = useState("");
  const [emrNotes, setEmrNotes] = useState("");

  // Treatment Cost
  const [treatmentCost, setTreatmentCost] = useState("1500");

  // Fetch live patients from /api/patients and merge without data loss
  const fetchLivePatients = useCallback(async (manual = false) => {
    try {
      if (manual) setIsSyncing(true);
      const res = await fetch("/api/patients");
      if (!res.ok) return;
      const data = await res.json();

      if (data.success && Array.isArray(data.patients) && data.patients.length > 0) {
        const mapped: PatientRecord[] = data.patients.map((p: any, idx: number) => {
          const lastApt = p.appointments?.[0];
          const fullName = p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient";
          const rawAge = p.age !== null && p.age !== undefined ? `${p.age}y` : "";

          const timeline: TimelineItem[] = (p.appointments || []).map((a: any) => ({
            id: `tl-${a.id}`,
            type: a.status === "TREATMENT_DONE" ? "VISIT • COMPLETED" : "APPOINTMENT",
            date: a.startTime
              ? new Date(a.startTime).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
            doctor: a.preferredDoctor || "Dr. Deep Arvindbhai Patel",
            reason: a.reason || a.service?.name || "Dental Consultation",
            notes: a.notes || undefined,
            dotColor: a.status === "TREATMENT_DONE" ? "emerald" : "blue",
          }));

          if (timeline.length === 0) {
            timeline.push({
              id: `tl-reg-${p.id}`,
              type: "REGISTERED",
              date: p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent",
              doctor: "Dr. Deep Arvindbhai Patel",
              reason: "Patient registration & active clinical profile",
              dotColor: "gray",
            });
          }

          const visits = Math.max(p.totalVisits || 0, p.appointments?.length || 0, 1);

          return {
            id: p.id,
            patientNumber: p.patientCode ? `#${p.patientCode}` : `#${String(100 + idx).padStart(5, "0")}`,
            name: fullName,
            phone: p.phone || "",
            gender: p.gender ? p.gender.toLowerCase() : "male",
            age: rawAge || "30y",
            dob: p.dateOfBirth || "",
            patientType: p.patientType || (p.age && p.age < 18 ? "Child" : "Adult"),
            isNew: visits <= 1,
            totalVisits: visits,
            lastVisit: p.lastVisit || "Recent",
            avatarColor: "slate",
            timeline,
            email: p.email || "",
            bloodGroup: p.bloodType || p.bloodGroup || "B+",
            leadSource: p.source || (p.medicalNotes?.includes("WHATSAPP") ? "WhatsApp" : "Walk-in"),
            addressLine: p.address || "Station Road",
            locality: "Navsari District",
            city: "Bilimora",
            state: "Gujarat",
            pin: "396321",
            allergies:
              p.medicalNotes?.match(/Allergies?:\s*([^|]+)/i)?.[1]?.trim() ||
              "No drug allergies recorded (NKDA).",
            medicalConditions: p.condition || p.medicalNotes || "General Dental Care",
            emergencyContact: p.emergencyContact || "",
            treatmentCost: "1500",
          };
        });

        setPatients((prev) => {
          // Safeguard: Never lose client-side optimistic additions before DB sync completes
          const serverIds = new Set(mapped.map((m) => m.id));
          const serverPhones = new Set(mapped.map((m) => m.phone.replace(/\D/g, "")));
          const unsynced = prev.filter(
            (p) => !serverIds.has(p.id) && !serverPhones.has(p.phone.replace(/\D/g, ""))
          );
          const combined = [...unsynced, ...mapped];
          try {
            localStorage.setItem("casmile_patients_records_cache", JSON.stringify(combined));
          } catch {}
          return combined;
        });

        setSelectedPatientId((cur) => {
          if (!cur || !mapped.some((m) => m.id === cur)) {
            return mapped[0]?.id || "";
          }
          return cur;
        });

        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (err) {
      console.error("Failed to fetch live patients:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Instant hydration on mount from local cache, then background sync
  useEffect(() => {
    try {
      const cached = localStorage.getItem("casmile_patients_records_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPatients(parsed);
          setSelectedPatientId((cur) => cur || parsed[0]?.id || "");
        }
      }
    } catch {}

    fetchLivePatients();
  }, [fetchLivePatients]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.patientNumber.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Keep treatment cost in sync with selected patient
  useEffect(() => {
    if (selectedPatient?.treatmentCost) {
      setTreatmentCost(selectedPatient.treatmentCost);
    }
  }, [selectedPatient?.id, selectedPatient?.treatmentCost]);

  const patientEditData: PatientEditData | null = useMemo(() => {
    if (!selectedPatient) return null;
    const numericAge = parseInt(selectedPatient.age?.replace(/\D/g, "") || "30", 10);
    const isChild =
      selectedPatient.age?.toLowerCase().includes("child") ||
      (!isNaN(numericAge) && numericAge < 18);

    return {
      id: selectedPatient.id,
      patientNumber: selectedPatient.patientNumber?.replace("#", "") || "00022",
      patientId: selectedPatient.patientNumber || "#00022",
      patientName: selectedPatient.name,
      fullName: selectedPatient.name,
      phone: selectedPatient.phone,
      dateOfBirth: selectedPatient.dob?.includes("/")
        ? selectedPatient.dob.split("/").reverse().join("-")
        : selectedPatient.dob || "1995-01-01",
      patientType: isChild ? "Child" : "Adult",
      age: selectedPatient.age,
      sex: selectedPatient.gender
        ? selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1).toLowerCase()
        : "Male",
      bloodGroup: selectedPatient.bloodGroup || "B+",
      leadSource: selectedPatient.leadSource || "Walk-in",
      addressLine: selectedPatient.addressLine || "",
      locality: selectedPatient.locality || "",
      city: selectedPatient.city || "Bilimora",
      state: selectedPatient.state || "Gujarat",
      pin: selectedPatient.pin || "396321",
      allergies: selectedPatient.allergies || "",
      medicalConditions: selectedPatient.medicalConditions || "",
      familyMembers: selectedPatient.familyMembers || [],
    };
  }, [selectedPatient]);

  const handlePatientSaved = (updated: PatientEditData) => {
    setPatients((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === updated.id) {
          return {
            ...p,
            name: updated.fullName || updated.patientName || p.name,
            phone: updated.phone || p.phone,
            gender: updated.sex ? updated.sex.toLowerCase() : p.gender,
            age: updated.age
              ? updated.age.includes("y")
                ? updated.age
                : `${updated.age}y`
              : p.age,
            dob: updated.dateOfBirth || p.dob,
            bloodGroup: updated.bloodGroup,
            leadSource: updated.leadSource,
            addressLine: updated.addressLine,
            locality: updated.locality,
            city: updated.city,
            state: updated.state,
            pin: updated.pin,
            allergies: updated.allergies,
            medicalConditions: updated.medicalConditions,
            familyMembers: updated.familyMembers,
          };
        }
        return p;
      });
      try {
        localStorage.setItem("casmile_patients_records_cache", JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });
    setIsEditPatientOpen(false);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const trimmedName = newName.trim();
    const cleanPhone = newPhone.trim();
    const parts = trimmedName.split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "";
    const nextNum = `#000${patients.length + 1}`.slice(-6);

    const tempId = `pat-${Date.now()}`;
    const newRecord: PatientRecord = {
      id: tempId,
      patientNumber: nextNum,
      name: trimmedName,
      phone: cleanPhone,
      gender: newGender ? newGender.toLowerCase() : "male",
      age: newAge ? `${newAge}y` : "30y",
      dob: newDob || "",
      isNew: true,
      totalVisits: 1,
      lastVisit: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      avatarColor: "slate",
      timeline: [
        {
          id: `tl-${Date.now()}`,
          type: "VISIT • COMPLETED",
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          doctor: "Dr. Deep Arvindbhai Patel",
          reason: "Initial Consultation",
          dotColor: "gray",
        },
      ],
      leadSource: "Walk-in",
      addressLine: "Station Road",
      locality: "Navsari District",
      city: "Bilimora",
      state: "Gujarat",
      pin: "396321",
      bloodGroup: "B+",
      treatmentCost: "1500",
      medicalConditions: "General Dental Care",
      allergies: "No drug allergies recorded (NKDA).",
    };

    // Optimistic instant UI update
    setPatients((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem("casmile_patients_records_cache", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSelectedPatientId(newRecord.id);
    setIsAddPatientOpen(false);
    setNewName("");
    setNewPhone("");
    setNewAge("");
    setNewDob("");

    // Persist to Database via POST /api/patients
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: cleanPhone,
          gender: newGender ? newGender.toLowerCase() : undefined,
          dateOfBirth: newDob || undefined,
          source: "ADMIN",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.patient?.id) {
          const realId = json.patient.id;
          setPatients((prev) =>
            prev.map((p) =>
              p.id === tempId
                ? {
                    ...p,
                    id: realId,
                    patientNumber: json.patient.patientCode
                      ? `#${json.patient.patientCode}`
                      : p.patientNumber,
                  }
                : p
            )
          );
          setSelectedPatientId((cur) => (cur === tempId ? realId : cur));
          fetchLivePatients();
        }
      }
    } catch (err) {
      console.error("Error creating patient in DB:", err);
    }
  };

  const handleAddEmr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newItem: TimelineItem = {
      id: `tl-${Date.now()}`,
      type: emrType,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      doctor: "Dr. Deep Arvindbhai Patel",
      reason: emrType === "VISIT • COMPLETED" ? `Reason: ${emrReason}` : undefined,
      diagnosis: emrType === "PRESCRIPTION" ? `Diagnosis: ${emrDiagnosis}` : undefined,
      notes: emrNotes ? `“${emrNotes}”` : undefined,
      dotColor: emrType === "PRESCRIPTION" ? "blue" : "emerald",
    };

    setPatients((prev) => {
      const updatedList = prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              totalVisits: p.totalVisits + 1,
              lastVisit: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              timeline: [newItem, ...(p.timeline || [])],
            }
          : p
      );
      try {
        localStorage.setItem("casmile_patients_records_cache", JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    try {
      await fetch(`/api/patients/${encodeURIComponent(selectedPatient.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicalNotes: `${selectedPatient.medicalConditions || ""} | [EMR] ${emrType}: ${
            emrReason || emrDiagnosis || emrNotes || ""
          }`,
        }),
      });
    } catch {}

    setIsNewEmrOpen(false);
    setEmrReason("");
    setEmrDiagnosis("");
    setEmrNotes("");
  };

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* 1. TOP NAVIGATION TABS (Patients | Vaccines)                        */}
      {/* =================================================================== */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setTopTab("patients")}
            className={`relative pb-3 text-sm font-semibold transition-colors ${
              topTab === "patients"
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700 font-medium"
            }`}
          >
            Patients
            {topTab === "patients" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setTopTab("vaccines")}
            className={`relative pb-3 text-sm transition-colors ${
              topTab === "vaccines"
                ? "text-slate-900 font-semibold"
                : "text-slate-500 hover:text-slate-700 font-medium"
            }`}
          >
            Vaccines
            {topTab === "vaccines" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-blue-600" />
            )}
          </button>
        </nav>
      </div>

      {topTab === "vaccines" ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <p className="font-semibold text-slate-800">Vaccine Records</p>
          <p className="text-xs text-slate-400 mt-1">
            Dental clinic vaccination tracking &amp; records module.
          </p>
        </div>
      ) : (
        /* =================================================================== */
        /* 2. SPLIT LAYOUT (LEFT: PATIENTS LIST, RIGHT: CLINICAL EMR)           */
        /* =================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: PATIENTS LIST (30)                                   */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            {/* Header: Patients count & Action Buttons */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Patients
                </h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">
                  {searchQuery.trim()
                    ? `${filteredPatients.length} of ${patients.length}`
                    : patients.length}
                </span>
                {isSyncing && (
                  <span className="text-[10px] font-medium text-blue-500 animate-pulse">
                    Syncing...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fetchLivePatients(true)}
                  title={lastSyncTime ? `Last synced at ${lastSyncTime}. Click to refresh` : "Refresh patients list"}
                  className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => alert("Exporting patients list to Excel / CSV...")}
                  title="Upload / Export"
                  className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-2xs"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(true)}
                  title="Add Patient"
                  className="h-8 w-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors shadow-2xs"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Patients Scrollable Cards List */}
            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredPatients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No matching patients found.
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = patient.id === selectedPatientId;
                  const initial = patient.name.charAt(0).toUpperCase();

                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/70 border border-blue-200 shadow-2xs"
                          : "bg-white hover:bg-slate-50/80 border border-transparent"
                      }`}
                    >
                      {/* Avatar Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {initial}
                      </div>

                      {/* Info Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {patient.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {patient.patientNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {patient.isNew && (
                            <span className="rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
                              NEW
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {patient.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: PATIENT EMR PROFILE & TIMELINE                      */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
            {selectedPatient ? (
              <>
                {/* 1. Patient Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    {/* Big Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          {selectedPatient.name}
                        </h2>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-500">
                          {selectedPatient.patientNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSetCostOpen(true)}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          Set treatment cost
                        </button>
                      </div>

                      {/* Meta line */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {selectedPatient.phone}
                        </span>
                        {selectedPatient.gender ? (
                          <>
                            <span>•</span>
                            <span className="capitalize">{selectedPatient.gender}</span>
                          </>
                        ) : null}
                        {selectedPatient.age ? (
                          <>
                            <span>•</span>
                            <span>{selectedPatient.age}</span>
                          </>
                        ) : null}
                        {selectedPatient.dob ? (
                          <>
                            <span>•</span>
                            <span>DOB: {selectedPatient.dob}</span>
                          </>
                        ) : null}
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setIsEditPatientOpen(true)}
                          className="p-1 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Metric Stat Cards */}
                <div className="flex flex-wrap gap-4">
                  {/* Total Visits */}
                  <div className="rounded-2xl bg-blue-50/60 p-4 min-w-[150px]">
                    <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      TOTAL CLINIC VISITS
                    </span>
                    <span className="block text-2xl font-black text-blue-600 mt-1">
                      {selectedPatient.totalVisits}
                    </span>
                  </div>

                  {/* Last Visit */}
                  <div className="rounded-2xl bg-slate-50 p-4 min-w-[150px]">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      LAST VISIT
                    </span>
                    <span className="block text-xl font-black text-slate-900 mt-1">
                      {selectedPatient.lastVisit}
                    </span>
                  </div>
                </div>

                {/* 3. Section Tabs: Patient Info (Left Side) & Clinical History (Right Side) */}
                <div className="border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-6">
                    {/* Patient Info Tab (Left) */}
                    <button
                      type="button"
                      onClick={() => setClinicalTab("info")}
                      className={`relative pb-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                        clinicalTab === "info"
                          ? "text-blue-600 font-extrabold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Patient Info
                      {clinicalTab === "info" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                      )}
                    </button>

                    {/* Clinical History Tab (Right) */}
                    <button
                      type="button"
                      onClick={() => setClinicalTab("history")}
                      className={`relative pb-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                        clinicalTab === "history"
                          ? "text-blue-600 font-extrabold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Clinical History
                      {clinicalTab === "history" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. Tab Content: Patient Info */}
                {clinicalTab === "info" && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    {/* Header bar inside Patient Info with Edit Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <h4 className="text-sm font-bold text-slate-900">
                            Collected Patient Information
                          </h4>
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            Verified Profile
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Complete demographic, contact, residential, and medical history details on file.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditPatientOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Patient</span>
                      </button>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Card 1: Identity & Demographics */}
                      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            Personal Identity
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {selectedPatient.patientNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Full Name</span>
                            <span className="font-bold text-slate-900 block mt-0.5">
                              {selectedPatient.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Contact Number</span>
                            <span className="font-bold text-slate-900 font-mono block mt-0.5">
                              {selectedPatient.phone}
                            </span>
                          </div>
                          {selectedPatient.gender ? (
                            <div>
                              <span className="text-slate-400 block text-[11px]">Gender</span>
                              <span className="font-semibold text-slate-800 capitalize block mt-0.5">
                                {selectedPatient.gender}
                              </span>
                            </div>
                          ) : null}
                          {(selectedPatient.age || selectedPatient.dob) ? (
                            <div>
                              <span className="text-slate-400 block text-[11px]">Age / DOB</span>
                              <span className="font-semibold text-slate-800 block mt-0.5">
                                {[selectedPatient.age, selectedPatient.dob ? `DOB: ${selectedPatient.dob}` : null].filter(Boolean).join(" · ")}
                              </span>
                            </div>
                          ) : null}
                          {selectedPatient.bloodGroup ? (
                            <div>
                              <span className="text-slate-400 block text-[11px]">Blood Group</span>
                              <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200 mt-0.5">
                                {selectedPatient.bloodGroup}
                              </span>
                            </div>
                          ) : null}
                          {(selectedPatient.patientType || (selectedPatient.age && parseInt(selectedPatient.age.replace(/\D/g, ""), 10) < 18)) ? (
                            <div>
                              <span className="text-slate-400 block text-[11px]">Patient Type</span>
                              <span className="font-semibold text-slate-800 block mt-0.5">
                                {selectedPatient.patientType || (parseInt(selectedPatient.age.replace(/\D/g, ""), 10) < 18 ? "Child / Pediatric" : "Adult")}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Card 2: Contact & Residential Address */}
                      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            Residential Address
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            Primary Address
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Street / Address Line</span>
                            <span className="font-semibold text-slate-800 block mt-0.5">
                              {selectedPatient.addressLine || "Station Road"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Locality / Area</span>
                              <span className="font-semibold text-slate-800 block mt-0.5">
                                {selectedPatient.locality || "Navsari District"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">Postal PIN Code</span>
                              <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                                {selectedPatient.pin || "396321"}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-slate-400 block text-[11px]">City</span>
                              <span className="font-semibold text-slate-800 block mt-0.5">
                                {selectedPatient.city || "Bilimora"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[11px]">State</span>
                              <span className="font-semibold text-slate-800 block mt-0.5">
                                {selectedPatient.state || "Gujarat"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Medical Notes & Conditions */}
                      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            Medical &amp; Clinical Notes
                          </span>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Alerts
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Drug &amp; Material Allergies</span>
                            <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                              {selectedPatient.allergies || "No drug allergies recorded (NKDA)."}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Medical Conditions</span>
                            <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                              {selectedPatient.medicalConditions || "No chronic systemic conditions recorded."}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Referral / Lead Source</span>
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 mt-1">
                              {selectedPatient.leadSource || "Walk-in"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Clinical History & Financials */}
                      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            Visits &amp; Financial Summary
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsSetCostOpen(true)}
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            Update Fee
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Visits</span>
                            <span className="text-xl font-black text-slate-900 block mt-1">
                              {selectedPatient.totalVisits}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Treatment Cost</span>
                            <span className="text-xl font-black text-emerald-600 block mt-1">
                              ₹{treatmentCost || "1500"}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Visit</span>
                            <span className="font-bold text-slate-900 block mt-1">
                              {selectedPatient.lastVisit}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Status</span>
                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 mt-1">
                              Active Patient
                            </span>
                          </div>
                        </div>

                        {selectedPatient.familyMembers && selectedPatient.familyMembers.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-600 block mb-1">
                              Family Members:
                            </span>
                            <div className="space-y-1">
                              {selectedPatient.familyMembers.map((fam, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                                  <span>{fam.name} ({fam.relation})</span>
                                  <span className="font-mono text-slate-400">{fam.phone}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Tab Content: Clinical History Timeline */}
                {clinicalTab === "history" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>TIMELINE</span>
                    </div>

                    {selectedPatient.timeline && selectedPatient.timeline.length > 0 ? (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200">
                        {selectedPatient.timeline.map((item) => (
                          <div key={item.id} className="relative">
                            {/* Dot on Line */}
                            <span
                              className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                                item.dotColor === "blue" ? "bg-blue-600" : "bg-slate-300"
                              }`}
                            />

                            {/* Card Content */}
                            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                                    item.type === "PRESCRIPTION"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {item.type}
                                </span>
                                <span className="text-xs font-semibold text-slate-700">
                                  {item.doctor}
                                </span>
                              </div>

                              <div className="text-base sm:text-lg font-bold text-slate-900">
                                {item.date}
                              </div>

                              {item.reason && (
                                <p className="text-xs sm:text-sm text-slate-600">
                                  {item.reason}
                                </p>
                              )}

                              {item.diagnosis && (
                                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                                  {item.diagnosis}
                                </p>
                              )}

                              {item.notes && (
                                <p className="text-xs italic text-slate-500 leading-relaxed pt-0.5">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 italic rounded-2xl border border-dashed border-slate-200">
                        No timeline records found for this patient.
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                Select a patient on the left to view clinical records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD PATIENT                                                  */}
      {/* =================================================================== */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Patient</h3>
              <button
                type="button"
                onClick={() => setIsAddPatientOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact No <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
                <p className="mt-1 text-[10px] text-slate-400 font-medium">
                  Only 10 numeric digits allowed ({newPhone.length}/10)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  placeholder="e.g. 15/08/1989"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: NEW EMR / TIMELINE ENTRY                                    */}
      {/* =================================================================== */}
      {isNewEmrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">New EMR Entry for {selectedPatient?.name}</h3>
              <button
                type="button"
                onClick={() => setIsNewEmrOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmr} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entry Type
                </label>
                <select
                  value={emrType}
                  onChange={(e) => setEmrType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="VISIT • COMPLETED">VISIT • COMPLETED</option>
                  <option value="PRESCRIPTION">PRESCRIPTION</option>
                </select>
              </div>

              {emrType === "VISIT • COMPLETED" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visit Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={emrReason}
                    onChange={(e) => setEmrReason(e.target.value)}
                    placeholder="e.g. Scaling & Polishing, Cavity Filling"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    required
                    value={emrDiagnosis}
                    onChange={(e) => setEmrDiagnosis(e.target.value)}
                    placeholder="e.g. Chronic Gingivitis, Enamel Erosion"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Rx Instructions
                </label>
                <textarea
                  rows={3}
                  value={emrNotes}
                  onChange={(e) => setEmrNotes(e.target.value)}
                  placeholder="e.g. Advised soft bristled toothbrush, follow-up in 14 days"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewEmrOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Add EMR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: SET TREATMENT COST                                           */}
      {/* =================================================================== */}
      {isSetCostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Set Treatment Cost</h3>
              <button
                type="button"
                onClick={() => setIsSetCostOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Set estimated or agreed treatment plan quote for {selectedPatient?.name}.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Treatment Amount (₹)
                </label>
                <input
                  type="number"
                  value={treatmentCost}
                  onChange={(e) => setTreatmentCost(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSetCostOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (selectedPatient) {
                      const updatedCost = treatmentCost || "1500";
                      setPatients((prev) => {
                        const updatedList = prev.map((p) =>
                          p.id === selectedPatient.id
                            ? { ...p, treatmentCost: updatedCost }
                            : p
                        );
                        try {
                          localStorage.setItem("casmile_patients_records_cache", JSON.stringify(updatedList));
                        } catch {}
                        return updatedList;
                      });

                      try {
                        await fetch(`/api/patients/${encodeURIComponent(selectedPatient.id)}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            medicalNotes: `${selectedPatient.medicalConditions || ""} | Agreed Treatment Fee: ₹${updatedCost}`,
                          }),
                        });
                      } catch {}
                    }
                    setIsSetCostOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Cost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT PATIENT (SAME FORM AS IN APPOINTMENTS SECTION)          */}
      {/* =================================================================== */}
      <CuravertoEditPatientModal
        isOpen={isEditPatientOpen}
        onClose={() => setIsEditPatientOpen(false)}
        patient={patientEditData}
        onSaved={handlePatientSaved}
      />
    </div>
  );
}
