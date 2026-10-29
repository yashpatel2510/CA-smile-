"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  X,
  Calendar,
  Pencil,
  ChevronDown,
  ChevronUp,
  Users,
  Stethoscope,
  Loader2,
  Check,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";

export interface PatientEditData {
  id: string;
  patientNumber?: string;
  patientId?: string;
  patientName?: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  patientType?: "Adult" | "Child" | string;
  age?: string;
  sex?: "Male" | "Female" | "Other" | "N/A" | string;
  bloodGroup?: string;
  leadSource?: string;
  addressLine?: string;
  locality?: string;
  pin?: string;
  city?: string;
  state?: string;
  address?: string;
  // Medical notes & family
  allergies?: string;
  medicalConditions?: string;
  familyMembers?: { name: string; relation: string; phone: string }[];
  // Appointment schedule fields
  appointmentId?: string;
  appointmentTime?: string;
  appointmentDate?: string;
}

export const to24HourTime = (time12: string) => {
  if (!time12) return "09:30";
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return "09:30";
  let h = parseInt(match[1], 10);
  const m = match[2];
  const mod = (match[3] || "AM").toUpperCase();
  if (mod === "PM" && h < 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
};

export const to12HourTime = (time24: string) => {
  if (!time24) return "09:30 AM";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr || "9", 10);
  const m = mStr || "00";
  const mod = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${mod}`;
};

interface CuravertoEditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientEditData | null;
  onSaved?: (updated: PatientEditData) => void;
}

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

const SEX_OPTIONS = ["Male", "Female", "Other", "N/A"];

const LEAD_SOURCES = [
  "Not specified",
  "Walk-in",
  "Website Booking",
  "Google Search",
  "Patient Referral",
  "WhatsApp",
  "Social Media (Instagram/Facebook)",
  "Camp / Community Outreach",
  "Other",
];

export function CuravertoEditPatientModal({
  isOpen,
  onClose,
  patient,
  onSaved,
}: CuravertoEditPatientModalProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<"profile" | "family" | "medical">("profile");

  // Form Fields
  const [patientNumber, setPatientNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [patientType, setPatientType] = useState<"Adult" | "Child">("Adult");
  const [sex, setSex] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("B+");
  const [leadSource, setLeadSource] = useState("Not specified");

  // Address
  const [isAddressOpen, setIsAddressOpen] = useState(true);
  const [addressLine, setAddressLine] = useState("");
  const [locality, setLocality] = useState("");
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Family Tab
  const [familyMembers, setFamilyMembers] = useState<
    { name: string; relation: string; phone: string }[]
  >([]);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRelation, setNewFamilyRelation] = useState("Spouse");
  const [newFamilyPhone, setNewFamilyPhone] = useState("");

  // Medical Tab
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  // Appointment schedule state (when editing from appointment row)
  const [appointmentTime, setAppointmentTime] = useState("09:30");
  const [appointmentDate, setAppointmentDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Populate when patient changes
  useEffect(() => {
    if (patient) {
      const cleanNum = patient.patientNumber || patient.patientId?.replace("#", "") || "00023";
      setPatientNumber(cleanNum);

      const name = patient.fullName || patient.patientName || "Anita Rana";
      setFullName(name);

      setPhone(patient.phone || "0000000023");
      setDateOfBirth(patient.dateOfBirth || "1966-02-11");

      if (patient.patientType) {
        setPatientType(patient.patientType.toLowerCase() === "child" ? "Child" : "Adult");
      } else if (patient.age && (patient.age.toLowerCase().includes("child") || (parseInt(patient.age, 10) > 0 && parseInt(patient.age, 10) < 18))) {
        setPatientType("Child");
      } else if (patient.dateOfBirth) {
        const birthYear = new Date(patient.dateOfBirth).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - birthYear < 18) {
          setPatientType("Child");
        } else {
          setPatientType("Adult");
        }
      } else {
        setPatientType("Adult");
      }

      setSex(patient.sex || "Female");
      setBloodGroup(patient.bloodGroup || "B+");
      setLeadSource(patient.leadSource || "Not specified");

      // Address parsing if string
      if (patient.address && !patient.addressLine) {
        const parts = patient.address.split(",").map((s) => s.trim());
        setAddressLine(parts[0] || "");
        setLocality(parts[1] || "");
        setCity(parts[2] || "Bilimora");
        setState(parts[3] || "Gujarat");
        setPin(parts[4] || "396321");
      } else {
        setAddressLine(patient.addressLine || "");
        setLocality(patient.locality || "");
        setPin(patient.pin || "");
        setCity(patient.city || "");
        setState(patient.state || "");
      }

      setAllergies(patient.allergies || "");
      setMedicalConditions(patient.medicalConditions || "");
      setFamilyMembers(patient.familyMembers || []);

      if (patient.appointmentTime) {
        setAppointmentTime(to24HourTime(patient.appointmentTime));
      } else {
        setAppointmentTime("09:30");
      }
      if (patient.appointmentDate) {
        setAppointmentDate(patient.appointmentDate);
      } else {
        const d = new Date();
        setAppointmentDate(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        );
      }

      setErrorMsg("");
      setActiveTab("profile");
      setIsAddressOpen(true);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Patient name is mandatory.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      setErrorMsg("Contact number is mandatory.");
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg("Contact number must be exactly 10 numeric digits.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || null,
        patientType,
        sex,
        gender: sex,
        bloodGroup,
        bloodType: bloodGroup,
        leadSource,
        addressLine: addressLine.trim(),
        locality: locality.trim(),
        pin: pin.trim(),
        city: city.trim(),
        state: state.trim(),
        patientCode: patientNumber,
        allergies,
        medicalConditions,
      };

      const res = await fetch(`/api/patients/${encodeURIComponent(patient.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        // If opened from an appointment row, also update appointment time & date
        if (patient.appointmentId && appointmentTime) {
          try {
            const dateStr = appointmentDate || new Date().toISOString().split("T")[0];
            const newStart = new Date(`${dateStr}T${appointmentTime}:00`);
            const newEnd = new Date(newStart.getTime() + 45 * 60000);
            await fetch(`/api/appointments/${patient.appointmentId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                startTime: newStart.toISOString(),
                endTime: newEnd.toISOString(),
              }),
            });
          } catch (aptErr) {
            console.warn("Failed to update appointment schedule:", aptErr);
          }
        }

        if (onSaved) {
          onSaved({
            ...patient,
            fullName: fullName.trim(),
            patientName: fullName.trim(),
            phone: phone.trim(),
            dateOfBirth,
            patientType,
            sex,
            bloodGroup,
            leadSource,
            addressLine,
            locality,
            pin,
            city,
            state,
            patientNumber,
            appointmentTime: to12HourTime(appointmentTime),
            appointmentDate,
          });
        }
        onClose();
      } else {
        setErrorMsg(json.message || "Failed to update patient record.");
      }
    } catch (err: any) {
      console.error("Error saving patient:", err);
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFamilyMember = () => {
    if (!newFamilyName.trim()) return;
    setFamilyMembers((prev) => [
      ...prev,
      {
        name: newFamilyName.trim(),
        relation: newFamilyRelation,
        phone: newFamilyPhone.trim(),
      },
    ]);
    setNewFamilyName("");
    setNewFamilyPhone("");
  };

  const handleRemoveFamilyMember = (idx: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col my-8 overflow-hidden max-h-[92vh]">
        {/* ================================================================= */}
        {/* 1. HEADER (Matches Screenshot 1)                                  */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            {/* User Avatar Circle */}
            <div className="w-10 h-10 rounded-full border border-blue-200 text-blue-600 bg-blue-50/60 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Edit Patient
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {fullName || "Patient Details"}
              </p>
            </div>
          </div>

          {/* Close X Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. TABS: Profile, Family, Medical (Matches Screenshot 1)          */}
        {/* ================================================================= */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === "profile"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("family")}
            className={`inline-flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === "family"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Family</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("medical")}
            className={`inline-flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === "medical"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Medical</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* 3. TAB CONTENT (Scrollable Area)                                  */}
        {/* ================================================================= */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* TAB A: PROFILE (Matches Screenshot 1 & 2) */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* PATIENT # */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  PATIENT #
                </label>
                <input
                  type="text"
                  value={patientNumber}
                  onChange={(e) => setPatientNumber(e.target.value)}
                  placeholder="00023"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900 tracking-wide focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* FULL NAME & PHONE NUMBER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    FULL NAME <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anita Rana"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    CONTACT NO <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(digitsOnly);
                        if (errorMsg) setErrorMsg("");
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-9 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400 font-medium">
                    Only 10 numeric digits allowed ({phone.length}/10)
                  </p>
                </div>
              </div>

              {/* APPOINTMENT SCHEDULE (TIME & DATE) */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Appointment Schedule</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      APPOINTMENT TIME <span className="text-blue-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500 font-medium">
                      Display: {to12HourTime(appointmentTime)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      APPOINTMENT DATE
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DATE OF BIRTH & PATIENT TYPE (ADULT / CHILD) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    DATE OF BIRTH
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value);
                        if (e.target.value) {
                          const birth = new Date(e.target.value);
                          const now = new Date();
                          let age = now.getFullYear() - birth.getFullYear();
                          const m = now.getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
                          if (age < 18) setPatientType("Child");
                          else setPatientType("Adult");
                        }
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    PATIENT TYPE
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPatientType("Adult")}
                      className={`flex-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all text-center ${
                        patientType === "Adult"
                          ? "bg-[#2563eb] text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Adult
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientType("Child")}
                      className={`flex-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all text-center ${
                        patientType === "Child"
                          ? "bg-[#2563eb] text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Child
                    </button>
                  </div>
                </div>
              </div>

              {/* SEX */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  SEX
                </label>
                <div className="flex items-center gap-1.5">
                  {SEX_OPTIONS.map((opt) => {
                    const isSelected = sex.toLowerCase() === opt.toLowerCase();
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSex(opt)}
                        className={`flex-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-[#2563eb] text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BLOOD GROUP (Matches Screenshot 1) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  BLOOD GROUP
                </label>
                <div className="space-y-1.5">
                  {/* Row 1: A+, A-, B+, B-, AB+ */}
                  <div className="grid grid-cols-5 gap-2">
                    {BLOOD_GROUPS.slice(0, 5).map((bg) => {
                      const isSelected = bloodGroup === bg;
                      return (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBloodGroup(bg)}
                          className={`rounded-2xl py-2 text-xs font-bold transition-all text-center ${
                            isSelected
                              ? "bg-[#dc2626] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {bg}
                        </button>
                      );
                    })}
                  </div>

                  {/* Row 2: AB-, O+, O-, Unknown */}
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.slice(5).map((bg) => {
                      const isSelected = bloodGroup === bg;
                      return (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBloodGroup(bg)}
                          className={`rounded-2xl py-2 text-xs font-bold transition-all text-center ${
                            isSelected
                              ? "bg-[#dc2626] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {bg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Lead Source */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lead Source
                </label>
                <div className="relative">
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    {LEAD_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* ADDRESS COLLAPSIBLE SECTION (Matches Screenshot 2) */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsAddressOpen(!isAddressOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    ADDRESS
                  </span>
                  {isAddressOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {isAddressOpen && (
                  <div className="p-4 pt-1 space-y-3 border-t border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        ADDRESS LINE
                      </label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Flat / House no., Street"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        LOCALITY / AREA
                      </label>
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="Locality, Colony, Area"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          PIN
                        </label>
                        <input
                          type="text"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="6-digit"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          CITY
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          STATE
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB B: FAMILY */}
          {activeTab === "family" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Link family members or add emergency contact numbers for this patient.
              </p>

              {familyMembers.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {familyMembers.map((fm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{fm.name}</span>
                        <span className="text-slate-400 ml-2">({fm.relation})</span>
                        {fm.phone && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            {fm.phone}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFamilyMember(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No family members added yet.
                </div>
              )}

              {/* Add Member Form */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  + Add Family Contact
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="Name"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                  <select
                    value={newFamilyRelation}
                    onChange={(e) => setNewFamilyRelation(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    value={newFamilyPhone}
                    onChange={(e) => setNewFamilyPhone(e.target.value)}
                    placeholder="Phone"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFamilyMember}
                  className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </div>
          )}

          {/* TAB C: MEDICAL */}
          {activeTab === "medical" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Known Allergies
                </label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Latex, Local Anesthetics..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical Conditions & Dental History
                </label>
                <textarea
                  rows={3}
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Diabetes, Hypertension, Bleeding disorders, previous RCTs..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* 4. MODAL FOOTER BUTTONS (Matches Screenshot 1 & 2)              */}
          {/* =============================================================== */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-7 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-8 py-2.5 text-xs shadow-xs transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
