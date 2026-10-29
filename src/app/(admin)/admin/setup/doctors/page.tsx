"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  Stethoscope,
  Trash2,
  Upload,
  Check,
  PenTool,
  Clock,
} from "lucide-react";
import {
  ConsultingSchedule,
  ConsultingTimeRange,
  formatPrescriptionSchedule,
} from "@/types/doctors";

interface Doctor {
  id: string;
  name: string;
  registrationNumber: string;
  personalMobile: string;
  personalEmail: string;
  clinicPhone?: string;
  titlePrefix?: string;
  qualification?: string;
  postGraduateSpecialization?: string;
  specialty?: string;
  department?: string;
  doctorType: "In-house Consultant" | "Visiting Consultant";
  dailySlots: number;
  clinicBranch: string;
  isActive: boolean;
  digitalSignatureUrl?: string;
  consultingSchedules?: ConsultingSchedule[];
}

const DEPARTMENTS = [
  "General Practice",
  "Gynaecology & OBG",
  "Paediatrics",
  "Dentistry",
  "Physiotherapy",
  "IVF & Fertility",
  "Dermatology",
  "Cardiology",
  "ENT",
  "Orthopaedics",
  "Neurology",
  "Pulmonology",
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const INITIAL_FORM: Omit<Doctor, "id"> = {
  name: "",
  registrationNumber: "DEMO-GJ-SMILE-0001",
  personalMobile: "",
  personalEmail: "",
  clinicPhone: "",
  titlePrefix: "BDS",
  qualification: "BDS",
  postGraduateSpecialization: "Dental Surgeon",
  specialty: "Dental Surgeon",
  department: "Dentistry",
  doctorType: "In-house Consultant",
  dailySlots: 40,
  clinicBranch: "Main Clinic",
  isActive: true,
  digitalSignatureUrl: "",
  consultingSchedules: [
    {
      id: "sch-1",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      timeRanges: [{ from: "09:00 AM", to: "01:00 PM" }],
    },
  ],
};

export default function DoctorsSetupPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Doctor, "id">>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch doctors list
  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/admin/setup/doctors");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDoctors(json.data);
      }
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenAdd = () => {
    setEditingDoctorId(null);
    setForm(INITIAL_FORM);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (doctor: Doctor) => {
    setEditingDoctorId(doctor.id);
    setForm({
      name: doctor.name,
      registrationNumber: doctor.registrationNumber || "",
      personalMobile: doctor.personalMobile || "",
      personalEmail: doctor.personalEmail || "",
      clinicPhone: doctor.clinicPhone || "",
      titlePrefix: doctor.titlePrefix || "",
      qualification: doctor.qualification || "",
      postGraduateSpecialization: doctor.postGraduateSpecialization || "",
      specialty: doctor.specialty || "",
      department: doctor.department || "Dentistry",
      doctorType: doctor.doctorType || "In-house Consultant",
      dailySlots: doctor.dailySlots || 40,
      clinicBranch: doctor.clinicBranch || "Main Clinic",
      isActive: doctor.isActive ?? true,
      digitalSignatureUrl: doctor.digitalSignatureUrl || "",
      consultingSchedules:
        doctor.consultingSchedules && doctor.consultingSchedules.length > 0
          ? doctor.consultingSchedules
          : [
              {
                id: `sch-${Date.now()}`,
                days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                timeRanges: [{ from: "09:00 AM", to: "01:00 PM" }],
              },
            ],
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/admin/setup/doctors?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDoctors((prev) => prev.filter((d) => d.id !== id));
        setToastMessage(`${name} removed successfully.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    }
  };

  // Handle signature file upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setForm((prev) => ({ ...prev, digitalSignatureUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Consulting hours helpers
  const toggleDay = (scheduleId: string, day: string) => {
    setForm((prev) => {
      const schedules = (prev.consultingSchedules || []).map((sch) => {
        if (sch.id !== scheduleId) return sch;
        const exists = sch.days.includes(day);
        const nextDays = exists
          ? sch.days.filter((d) => d !== day)
          : [...sch.days, day];
        return { ...sch, days: nextDays };
      });
      return { ...prev, consultingSchedules: schedules };
    });
  };

  const updateTimeRange = (
    scheduleId: string,
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    setForm((prev) => {
      const schedules = (prev.consultingSchedules || []).map((sch) => {
        if (sch.id !== scheduleId) return sch;
        const updatedRanges = [...sch.timeRanges];
        updatedRanges[index] = { ...updatedRanges[index], [field]: value };
        return { ...sch, timeRanges: updatedRanges };
      });
      return { ...prev, consultingSchedules: schedules };
    });
  };

  const addTimeRange = (scheduleId: string) => {
    setForm((prev) => {
      const schedules = (prev.consultingSchedules || []).map((sch) => {
        if (sch.id !== scheduleId) return sch;
        return {
          ...sch,
          timeRanges: [...sch.timeRanges, { from: "05:00 PM", to: "08:00 PM" }],
        };
      });
      return { ...prev, consultingSchedules: schedules };
    });
  };

  const removeAllHours = () => {
    setForm((prev) => ({ ...prev, consultingSchedules: [] }));
  };

  const addOtherHours = () => {
    setForm((prev) => {
      const current = prev.consultingSchedules || [];
      return {
        ...prev,
        consultingSchedules: [
          ...current,
          {
            id: `sch-${Date.now()}`,
            days: ["Sun"],
            timeRanges: [{ from: "10:00 AM", to: "01:00 PM" }],
          },
        ],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...(editingDoctorId ? { id: editingDoctorId } : {}),
        ...form,
      };
      const res = await fetch("/api/admin/setup/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(
          editingDoctorId ? "Doctor profile updated!" : "New doctor added successfully!"
        );
        setTimeout(() => setToastMessage(null), 3500);
        setIsDrawerOpen(false);
        fetchDoctors();
      }
    } catch (err) {
      console.error("Failed to save doctor:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 font-sans">
      {/* Top Left Navigation Link */}
      <div className="mb-4">
        <Link
          href="/admin/setup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Setup</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
          Doctors
        </h1>
      </div>

      {/* Doctors Counter Strip & + Add Doctor Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Stethoscope className="h-4 w-4" />
          <span>DOCTORS ({doctors.length}/INFINITY)</span>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4f46e5] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#4338ca] transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Main Clinic Pill */}
      <div className="mb-6">
        <span className="inline-block rounded-lg bg-[#005f40] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs">
          Main Clinic
        </span>
      </div>

      {/* Branch Section Header Strip */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-lg font-bold text-slate-900">Main Clinic</h2>
        <span className="text-xs text-slate-400 font-medium">
          {doctors.length} {doctors.length === 1 ? "doctors" : "doctors"}
        </span>
      </div>

      {/* Card with Doctors List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Card Header Strip */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <span className="text-sm font-bold text-slate-900">Doctors</span>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-xs font-bold text-[#005f40] hover:underline transition-colors"
          >
            + Add or assign
          </button>
        </div>

        {/* Doctor Rows */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No doctors assigned yet. Click &quot;+ Add Doctor&quot; to add one.
            </div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {doctor.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {doctor.specialty || doctor.postGraduateSpecialization || "Dental Surgeon"} ·{" "}
                    {doctor.dailySlots || 40}/day
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(doctor)}
                    className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer lowercase"
                  >
                    edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doctor.id, doctor.name)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors cursor-pointer lowercase"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* EDIT PROFILE / ADD DOCTOR DRAWER (Exact Match to Screenshots)       */}
      {/* =================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header: Edit Profile / Add Doctor */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingDoctorId ? "Edit Profile" : "Add Doctor"}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Form Body */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-left"
              >
                {/* 1. FULL NAME */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Deep Arvindbhai Patel"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                </div>

                {/* 2. REGISTRATION / LICENSE NO. */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    REGISTRATION / LICENSE NO. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.registrationNumber}
                    onChange={(e) =>
                      setForm({ ...form, registrationNumber: e.target.value })
                    }
                    placeholder="DEMO-GJ-SMILE-0001"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    MCI / State Medical Council registration number. Printed on prescriptions if set.
                  </p>
                </div>

                {/* ========================================================= */}
                {/* 3. DIGITAL SIGNATURE SECTION (Exact match to Screenshot 2) */}
                {/* ========================================================= */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    DIGITAL SIGNATURE
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Preview box */}
                    <div className="flex h-12 w-14 items-center justify-center rounded-xl border border-slate-200 bg-[#f8fafc] text-slate-400 overflow-hidden shadow-2xs">
                      {form.digitalSignatureUrl ? (
                        <img
                          src={form.digitalSignatureUrl}
                          alt="Doctor Signature"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <PenTool className="h-5 w-5 stroke-[1.5] text-slate-400" />
                      )}
                    </div>

                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Signature</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Printed on this doctor&apos;s prescriptions, certificates, referrals &amp; scan reports. Must be uploaded per doctor here — the clinic-wide signature (Settings &rarr; Branding) is not used on these documents.
                  </p>
                </div>

                {/* ========================================================= */}
                {/* 4. WHERE I CONSULT SECTION (Exact match to Screenshots 1 & 2) */}
                {/* ========================================================= */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Where I consult</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Printed at the foot of every prescription, one line per branch, so patients know where to find this doctor and when. Set it once; it stays the same on every prescription.
                    </p>
                  </div>

                  {(!form.consultingSchedules || form.consultingSchedules.length === 0) ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                      <p className="text-xs text-slate-500">
                        Nothing set here, so prescriptions currently print the booking hours from the Schedule tab.
                      </p>
                      <button
                        type="button"
                        onClick={addOtherHours}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                      >
                        + Configure consulting hours
                      </button>
                    </div>
                  ) : (
                    form.consultingSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3.5 shadow-2xs"
                      >
                        {/* Header: Consulting hours & Remove all */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Consulting hours
                          </span>
                          <button
                            type="button"
                            onClick={removeAllHours}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove all</span>
                          </button>
                        </div>

                        {/* Day Pills: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {DAYS_OF_WEEK.map((day) => {
                            const isSelected = schedule.days.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(schedule.id, day)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                                  isSelected
                                    ? "bg-[#2563eb] text-white"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>

                        {/* Time Range Selector(s) */}
                        <div className="space-y-2">
                          {schedule.timeRanges.map((tr, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {/* From time input */}
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={tr.from}
                                  onChange={(e) =>
                                    updateTimeRange(schedule.id, idx, "from", e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                                />
                                <Clock className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                              </div>

                              <span className="text-xs font-medium text-slate-400">to</span>

                              {/* To time input */}
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={tr.to}
                                  onChange={(e) =>
                                    updateTimeRange(schedule.id, idx, "to", e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                                />
                                <Clock className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Links */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => addTimeRange(schedule.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add another time range</span>
                          </button>
                          <button
                            type="button"
                            onClick={addOtherHours}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add other hours</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* What patients will read Preview Box */}
                  {form.consultingSchedules && form.consultingSchedules.length > 0 && (
                    <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3.5">
                      <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        What patients will read
                      </span>
                      <div className="mt-1 text-xs font-medium text-slate-800">
                        {formatPrescriptionSchedule(form.consultingSchedules)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subheader: DOCTOR IDENTITY — LOGIN RECOVERY */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    DOCTOR IDENTITY — LOGIN RECOVERY
                  </span>
                </div>

                {/* 5. PERSONAL MOBILE * */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    PERSONAL MOBILE <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.personalMobile}
                    onChange={(e) =>
                      setForm({ ...form, personalMobile: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    The doctor&apos;s own number — used to send OTP if login is forgotten.
                  </p>
                </div>

                {/* 6. PERSONAL EMAIL * */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    PERSONAL EMAIL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.personalEmail}
                    onChange={(e) =>
                      setForm({ ...form, personalEmail: e.target.value })
                    }
                    placeholder="doctor@personalemail.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Distinct from the clinic login email. Globally unique across all clinics.
                  </p>
                </div>

                {/* 7. CLINIC PHONE */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    CLINIC PHONE <span className="text-slate-400 font-normal lowercase">(optional — defaults to personal mobile)</span>
                  </label>
                  <input
                    type="text"
                    value={form.clinicPhone}
                    onChange={(e) =>
                      setForm({ ...form, clinicPhone: e.target.value })
                    }
                    placeholder="917226098074"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    For appointments &amp; patient calls. If empty, uses personal mobile above.
                  </p>
                </div>

                {/* 8. TITLE / PREFIX */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    TITLE / PREFIX <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.titlePrefix}
                    onChange={(e) =>
                      setForm({ ...form, titlePrefix: e.target.value })
                    }
                    placeholder="BDS"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Printed before the doctor&apos;s name on prescriptions.
                  </p>
                </div>

                {/* 9. QUALIFICATION */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    QUALIFICATION <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) =>
                      setForm({ ...form, qualification: e.target.value })
                    }
                    placeholder="e.g. MBBS, BDS"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Primary degree(s). Printed on prescriptions.
                  </p>
                </div>

                {/* 10. POST-GRADUATE / SPECIALIZATION */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    POST-GRADUATE / SPECIALIZATION <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.postGraduateSpecialization}
                    onChange={(e) =>
                      setForm({ ...form, postGraduateSpecialization: e.target.value })
                    }
                    placeholder="Dental Surgeon"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Post-grad degree(s). Printed on prescriptions.
                  </p>
                </div>

                {/* 11. SPECIALTY */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    SPECIALTY
                  </label>
                  <input
                    type="text"
                    value={form.specialty}
                    onChange={(e) =>
                      setForm({ ...form, specialty: e.target.value })
                    }
                    placeholder="Dental Surgeon"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                </div>

                {/* 12. DOCTOR TYPE */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    DOCTOR TYPE
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, doctorType: "In-house Consultant" })
                      }
                      className={`rounded-xl py-2.5 px-3 text-xs font-bold transition-all ${
                        form.doctorType === "In-house Consultant"
                          ? "bg-[#4f46e5] text-white shadow-2xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      In-house Consultant
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, doctorType: "Visiting Consultant" })
                      }
                      className={`rounded-xl py-2.5 px-3 text-xs font-bold transition-all ${
                        form.doctorType === "Visiting Consultant"
                          ? "bg-[#4f46e5] text-white shadow-2xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Visiting Consultant
                    </button>
                  </div>
                </div>

                {/* Department Selection */}
                <div className="relative space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    DEPARTMENT / CLINICAL CATEGORY
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 13. DAILY SLOTS */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    DAILY SLOTS
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={form.dailySlots}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dailySlots: parseInt(e.target.value, 10) || 40,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                </div>

                {/* Primary Save Button */}
                <div className="pt-4 pb-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-[#4f46e5] py-3 text-sm font-bold text-white shadow-md hover:bg-[#4338ca] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
