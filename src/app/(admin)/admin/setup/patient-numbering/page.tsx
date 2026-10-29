"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Check, Loader2, Sparkles } from "lucide-react";

interface PatientNumberingState {
  enableCustomFormat: boolean;
  prefix: string;
  includeYear: boolean;
  yearType: "calendar" | "fiscal";
  resetEachYear: boolean;
  digitWidth: number;
  separator: string;
  startingNumber: number;
  currentCounter: number;
  nextCode?: string;
}

export default function PatientNumberingPage() {
  const [form, setForm] = useState<PatientNumberingState>({
    enableCustomFormat: true,
    prefix: "",
    includeYear: false,
    yearType: "calendar",
    resetEachYear: false,
    digitWidth: 5,
    separator: "Dash ( - )",
    startingNumber: 1,
    currentCounter: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Year computation
  const currentYear = new Date().getFullYear();
  const fiscalYearString = (() => {
    const month = new Date().getMonth();
    if (month >= 3) {
      return `${String(currentYear).slice(-2)}-${String(currentYear + 1).slice(-2)}`;
    } else {
      return `${String(currentYear - 1).slice(-2)}-${String(currentYear).slice(-2)}`;
    }
  })();

  // Fetch initial configuration from API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/setup/patient-numbering")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) {
          setForm({
            enableCustomFormat: json.data.enableCustomFormat ?? true,
            prefix: json.data.prefix ?? "",
            includeYear: json.data.includeYear ?? false,
            yearType: json.data.yearType ?? "calendar",
            resetEachYear: json.data.resetEachYear ?? false,
            digitWidth: json.data.digitWidth ?? 5,
            separator: json.data.separator ?? "Dash ( - )",
            startingNumber: json.data.startingNumber ?? 1,
            currentCounter: json.data.currentCounter ?? 1,
          });
        }
      })
      .catch((err) => console.error("Failed to load patient numbering:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live Preview Code in real-time
  const computedNextCode = (() => {
    if (!form.enableCustomFormat) {
      return `PT${String(form.currentCounter).padStart(5, "0")}`;
    }

    let sep = "-";
    if (form.separator === "Slash ( / )") sep = "/";
    else if (form.separator === "Dot ( . )") sep = ".";
    else if (form.separator === "None") sep = "";
    else if (form.separator === "Dash ( - )") sep = "-";

    const numPart = String(form.currentCounter || 1).padStart(form.digitWidth || 5, "0");
    const parts: string[] = [];

    // Prefix
    const trimmedPrefix = form.prefix.trim();
    if (trimmedPrefix) {
      parts.push(trimmedPrefix);
    }

    // Year
    if (form.includeYear) {
      if (form.yearType === "fiscal") {
        parts.push(fiscalYearString);
      } else {
        parts.push(String(currentYear));
      }
    }

    // Number
    parts.push(numPart);

    return parts.join(sep);
  })();

  const handleSave = async () => {
    setSaving(true);
    setToastMessage(null);
    try {
      const res = await fetch("/api/admin/setup/patient-numbering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage("Settings saved successfully!");
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        setToastMessage(data.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Save error:", err);
      setToastMessage("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 font-sans">
      {/* Top Navigation & Breadcrumb */}
      <div className="mb-6 flex flex-col gap-3">
        <Link
          href="/admin/setup"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/admin/setup" className="hover:text-slate-600">
            Setup
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>Clinic</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-700">Patient Numbering</span>
        </div>
      </div>

      {/* Main Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Patient Numbering
        </h1>
      </div>

      {/* Main Configuration Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Section Header */}
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-900">Patient Numbering</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Configure the format of auto-generated patient codes for your clinic. Existing patients
            are never renumbered.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Enable custom format Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.enableCustomFormat}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, enableCustomFormat: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-800">
                Enable custom format
              </span>
            </label>

            {/* 2. PREFIX Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                PREFIX
              </label>
              <input
                type="text"
                value={form.prefix}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, prefix: e.target.value.toUpperCase() }))
                }
                placeholder="PT"
                disabled={!form.enableCustomFormat}
                className="w-full max-w-xs rounded-xl border border-blue-400 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 transition-colors"
              />
            </div>

            {/* 3. Include year Checkbox & Pill Controls */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.includeYear}
                  disabled={!form.enableCustomFormat}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      includeYear: e.target.checked,
                      resetEachYear: e.target.checked ? prev.resetEachYear : false,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                />
                <span className="text-sm font-semibold text-slate-700">Include year</span>
              </label>

              {/* Year Type Pills (Calendar vs Fiscal) */}
              {form.includeYear && (
                <div className="ml-7 flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, yearType: "calendar" }))}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-2xs ${
                      form.yearType === "calendar"
                        ? "bg-[#2563eb] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Calendar ({currentYear})
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, yearType: "fiscal" }))}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-2xs ${
                      form.yearType === "fiscal"
                        ? "bg-[#2563eb] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Fiscal ({fiscalYearString})
                  </button>
                </div>
              )}
            </div>

            {/* 4. Reset numbering each year Checkbox */}
            <div>
              <label
                className={`flex items-center gap-3 select-none ${
                  form.includeYear && form.enableCustomFormat
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.resetEachYear}
                  disabled={!form.includeYear || !form.enableCustomFormat}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, resetEachYear: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="text-sm font-semibold text-slate-600">
                  Reset numbering each year
                </span>
              </label>
            </div>

            {/* 5. DIGIT WIDTH & SEPARATOR (Two Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm">
              {/* Digit Width */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  DIGIT WIDTH
                </label>
                <select
                  value={form.digitWidth}
                  disabled={!form.enableCustomFormat}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, digitWidth: Number(e.target.value) }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                >
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                </select>
              </div>

              {/* Separator */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  SEPARATOR
                </label>
                <select
                  value={form.separator}
                  disabled={!form.enableCustomFormat}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, separator: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                >
                  <option value="Dash ( - )">Dash ( - )</option>
                  <option value="Slash ( / )">Slash ( / )</option>
                  <option value="Dot ( . )">Dot ( . )</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            {/* 6. STARTING NUMBER */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                STARTING NUMBER
              </label>
              <input
                type="number"
                min={1}
                value={form.startingNumber}
                disabled={!form.enableCustomFormat}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setForm((prev) => ({
                    ...prev,
                    startingNumber: val,
                    currentCounter: Math.max(prev.currentCounter, val),
                  }));
                }}
                className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
              />
              <p className="text-xs text-slate-400">
                Current counter: {form.currentCounter} · You can only move it forward.
              </p>
            </div>

            {/* 7. NEXT CODE Preview Card (Matches Screenshots) */}
            <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                NEXT CODE
              </span>
              <div className="mt-1 font-mono text-2xl font-black tracking-tight text-slate-900">
                {computedNextCode}
              </div>
            </div>

            {/* Toast feedback */}
            {toastMessage && (
              <div
                className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                  toastMessage.includes("success")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                <Check className="h-4 w-4" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* 8. Save Button */}
            <div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-7 py-2.5 text-sm font-bold text-white shadow-2xs hover:bg-blue-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
