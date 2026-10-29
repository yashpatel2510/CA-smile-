"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Phone,
  Smartphone,
  Mail,
  MapPin,
  Clock,
  User,
  Shield,
  ArrowLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClinicSetupForm {
  clinicName: string;
  tagline: string;
  description: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  workingHours: string;
  doctorName: string;
  doctorTitle: string;
  doctorPhone: string;
  doctorBio: string;
  ownerName: string;
  ownerTitle: string;
}

const INITIAL_STATE: ClinicSetupForm = {
  clinicName: "Smile Dental Clinic",
  tagline: "Dental Clinic & Oral Healthcare",
  description:
    "Specialized Dental Surgery, Oral Restorations & Family Healthcare Center",
  phone: "+91 9664681536",
  emergencyPhone: "+91 9664681536",
  email: "contact@smiledental.example.com",
  address: "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321",
  city: "Bilimora",
  state: "Gujarat",
  postalCode: "396321",
  workingHours: "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only",
  doctorName: "Dr. Sankar",
  doctorTitle: "Chief Dental Surgeon & Clinic Founder",
  doctorPhone: "+91 98470 12345",
  doctorBio:
    "Distinguished clinician with over 15 years of surgical excellence in implantology, painless endodontics, and restorative oral rehabilitation.",
  ownerName: "Dr. Sankar & Associates",
  ownerTitle: "Clinic Owner & Managing Director",
};

export default function ClinicSetupPage() {
  const [form, setForm] = useState<ClinicSetupForm>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/setup/clinic-setup")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) {
          setForm((prev) => ({
            ...prev,
            ...json.data,
          }));
        }
      })
      .catch((err) => console.error("Failed to fetch clinic setup:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (toast) setToast(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/setup/clinic-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setToast({
          type: "success",
          message:
            "Clinic setup updated successfully! All clinic details are now live across the platform.",
        });
      } else {
        throw new Error(json.error || "Failed to update clinic info");
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Return to Setup Link */}
      <div className="mb-4">
        <Link
          href="/admin/setup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] transition-colors hover:text-[#0f172a]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>
      </div>

      {/* Top Header Bar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>CLINIC SETUP</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-100">
            Clinic Setup
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Manage clinic profile, identity, public contact numbers, location, and operational information.
          </p>
        </div>

        {/* Quick Save Button in Header */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`mb-6 flex items-center gap-2.5 rounded-2xl p-4 text-xs font-medium shadow-xs ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =================================================================== */}
        {/* CARD 1: CLINIC IDENTITY & BRANDING                                  */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-zinc-100">
                Clinic Identity &amp; Name
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Primary name and branding displayed across patient portal, header, and receipts.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Clinic Name */}
            <div>
              <label
                htmlFor="clinicName"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Clinic Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="clinicName"
                type="text"
                name="clinicName"
                required
                value={form.clinicName}
                onChange={handleChange}
                placeholder="Smile Dental Clinic"
                className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
              />
            </div>

            {/* Tagline & Owner Entity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tagline"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Clinic Tagline / Slogan
                </label>
                <input
                  id="tagline"
                  type="text"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="Dental Clinic & Oral Healthcare"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="ownerName"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Managing Entity / Owner Name
                </label>
                <input
                  id="ownerName"
                  type="text"
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="Dr. Sankar & Associates"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Clinic Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Clinic Summary / About
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                value={form.description}
                onChange={handleChange}
                placeholder="Specialized Dental Surgery, Oral Restorations & Family Healthcare Center"
                className="w-full resize-none rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 2: LOCATION & CLINIC ADDRESS                                   */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-zinc-100">
                Clinic Location &amp; Address
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Physical clinic address and navigational coordinates for patients.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Full Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Full Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                required
                value={form.address}
                onChange={handleChange}
                placeholder="1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321"
                className="w-full resize-none rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
              />
            </div>

            {/* City, State, Pin Code */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="city"
                    type="text"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Bilimora"
                    className="w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Gujarat"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  PIN / Postal Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="postalCode"
                  type="text"
                  name="postalCode"
                  required
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="396321"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 3: CONTACT NUMBERS & EMAIL                                     */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-zinc-100">
                Contact Numbers &amp; Channels
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Patient inquiry lines, emergency numbers, and official clinic email.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Primary Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Public Contact Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9664681536"
                  className="w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Emergency Phone */}
            <div>
              <label
                htmlFor="emergencyPhone"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Emergency / WhatsApp Line
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="emergencyPhone"
                  type="text"
                  name="emergencyPhone"
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+91 9664681536"
                  className="w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Official Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Official Clinic Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@smiledental.example.com"
                  className="w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 4: OPERATING HOURS                                             */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-zinc-100">
                Operating Hours
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Clinic schedule displayed in header, booking form, and footer.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="workingHours"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Working Hours Summary
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="workingHours"
                type="text"
                name="workingHours"
                value={form.workingHours}
                onChange={handleChange}
                placeholder="Mon - Sat: 9:00 AM - 8:00 PM | Sunday: Emergency Only"
                className="w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CARD 5: CHIEF SURGEON / DOCTOR PROFILE                              */}
        {/* =================================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900 dark:text-zinc-100">
                Lead Doctor / Chief Surgeon
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Featured doctor profile shown on homepage hero section and booking introductions.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="doctorName"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Doctor Name
                </label>
                <input
                  id="doctorName"
                  type="text"
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleChange}
                  placeholder="Dr. Sankar"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="doctorTitle"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Doctor Title / Speciality
                </label>
                <input
                  id="doctorTitle"
                  type="text"
                  name="doctorTitle"
                  value={form.doctorTitle}
                  onChange={handleChange}
                  placeholder="Chief Dental Surgeon & Clinic Founder"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>

              <div>
                <label
                  htmlFor="doctorPhone"
                  className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
                >
                  Doctor Direct Phone
                </label>
                <input
                  id="doctorPhone"
                  type="text"
                  name="doctorPhone"
                  value={form.doctorPhone}
                  onChange={handleChange}
                  placeholder="+91 98470 12345"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="doctorBio"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Doctor Bio &amp; Surgical Background
              </label>
              <textarea
                id="doctorBio"
                name="doctorBio"
                rows={2}
                value={form.doctorBio}
                onChange={handleChange}
                placeholder="Distinguished clinician with over 15 years of surgical excellence..."
                className="w-full resize-none rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM ACTION BAR                                                   */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Info className="h-4 w-4 text-blue-500" />
            <span>Updates are synced to the database, header, and patient booking forms immediately.</span>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                <span>Save All Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
