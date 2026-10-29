"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  DentalDocumentBrandingConfig,
  DentalDocumentType,
  PaperSize,
  DefaultPaperType,
  DEFAULT_DENTAL_DOCUMENT_BRANDING,
} from "@/types/dental-document-branding";
import { DentalBrandingCanvas } from "./dental-branding-canvas";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Share2,
  Save,
  RotateCcw,
  Sliders,
  FileText,
  Building2,
  Stethoscope,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Layers,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Eye,
  Info,
  X,
  FileDown,
  Check,
  FileCheck2,
  Receipt,
} from "lucide-react";

export function DentalDocumentBrandingView() {
  const [config, setConfig] = useState<DentalDocumentBrandingConfig>(
    DEFAULT_DENTAL_DOCUMENT_BRANDING
  );
  const [activeDoc, setActiveDoc] = useState<DentalDocumentType>("PRESCRIPTION");
  const [previewMode, setPreviewMode] = useState<"pad" | "blank">("pad");
  const [showScanOverlay, setShowScanOverlay] = useState<boolean>(true);
  const [controlTab, setControlTab] = useState<"margins" | "scan" | "master">("margins");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  // File upload input refs
  const scanInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Fetch persisted config on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/setup/branding")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.data) {
          setConfig(json.data);
          // Set preview mode according to active doc default
          if (json.data.layouts?.[activeDoc]?.default_paper_type) {
            setPreviewMode(json.data.layouts[activeDoc].default_paper_type);
          }
        }
      })
      .catch((err) => console.error("Failed to load dental branding:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentLayout = config.layouts[activeDoc];

  // Helper to update active layout profile
  const updateLayout = (field: keyof typeof currentLayout, value: any) => {
    setConfig((prev) => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [activeDoc]: {
          ...prev.layouts[activeDoc],
          [field]: value,
        },
      },
    }));
    if (toast) setToast(null);
  };

  // Helper to update master branding
  const updateMaster = (field: keyof typeof config.master, value: any) => {
    setConfig((prev) => ({
      ...prev,
      master: {
        ...prev.master,
        [field]: value,
      },
    }));
    if (toast) setToast(null);
  };

  // Handle Scan overlay upload
  const handleScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateLayout("calibration_overlay_url", reader.result);
          setShowScanOverlay(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateMaster("logo_url", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateMaster("signature_url", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/setup/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setToast({
          type: "success",
          message:
            "Document branding & letterhead calibration saved successfully! Printable safe zones updated.",
        });
      } else {
        throw new Error(json.error || "Failed to save configuration");
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

  // Reset to factory defaults
  const handleReset = async () => {
    if (
      !confirm(
        "Reset all dental document branding & pad calibration margins to factory clinical defaults?"
      )
    ) {
      return;
    }
    setResetting(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/setup/branding/reset", {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setConfig(json.data);
        setToast({
          type: "success",
          message: "All document branding margins reset to clinical factory standards.",
        });
      } else {
        throw new Error(json.error || "Failed to reset");
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Could not reset configuration.",
      });
    } finally {
      setResetting(false);
    }
  };

  // Browser Print Trigger with Millimeter Margins
  const handlePrintTest = () => {
    const printContent = document.getElementById("dental-printable-sheet");
    if (!printContent) return;

    // Inject temporary print style with exact millimeter margins
    const styleId = "dental-print-test-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const pageSizeCss =
      currentLayout.paper_size === "a5"
        ? "size: A5 portrait;"
        : currentLayout.paper_size === "thermal_80"
        ? "size: 80mm auto;"
        : "size: A4 portrait;";

    styleEl.innerHTML = `
      @media print {
        @page {
          ${pageSizeCss}
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden !important;
        }
        #dental-printable-sheet, #dental-printable-sheet * {
          visibility: visible !important;
        }
        #dental-printable-sheet {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-pad-notice,
        .print-guide-marker,
        .print-hidden,
        .no-print {
          display: none !important;
          visibility: hidden !important;
        }
      }
    `;

    window.print();
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Return to Setup Link */}
      <div className="mb-4">
        <Link
          href="/admin/setup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>
      </div>

      {/* Top Header Bar */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <Building2 className="h-4 w-4" />
            <span>CLINIC SETUP &bull; DUAL-PAPER DUAL-DELIVERY ENGINE</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-100">
            Document Branding &amp; Letterhead Calibration
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
            Calibrate millimeter margins for physical pre-printed dental pads at the chairside, and
            customize digital letterheads for patient WhatsApp dispatch &amp; PDF exports.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={resetting || saving}
            className="rounded-xl border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            <span>Reset Standards</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handlePrintTest}
            className="rounded-xl border-teal-600/30 bg-teal-50 text-xs font-bold text-teal-800 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-300"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Test Print</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setWhatsAppModalOpen(true)}
            className="rounded-xl border-emerald-600/30 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp PDF</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                <span>Save Calibration</span>
              </>
            )}
          </Button>
        </div>
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

      {/* =============================================================== */}
      {/* 4 SPECIALIZED DENTAL DOCUMENT PROFILE SELECTOR TABS             */}
      {/* =============================================================== */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max rounded-2xl bg-slate-100 p-1.5 dark:bg-zinc-800/60">
          {(
            [
              {
                id: "PRESCRIPTION",
                label: "Dental Prescription (Rx)",
                badge: "Pad Standard A5",
                icon: Stethoscope,
              },
              {
                id: "TREATMENT_PLAN",
                label: "Odontogram & Estimates",
                badge: "A4 Multi-Sitting",
                icon: FileText,
              },
              {
                id: "CONSENT_FORM",
                label: "Surgical Consent Form",
                badge: "Legal & Witness",
                icon: FileCheck2,
              },
              {
                id: "INVOICE",
                label: "Dental Tax Bill & Receipt",
                badge: "SAC 999312",
                icon: Receipt,
              },
            ] as const
          ).map((doc) => {
            const Icon = doc.icon;
            const isSelected = activeDoc === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setActiveDoc(doc.id);
                  setPreviewMode(config.layouts[doc.id].default_paper_type);
                }}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-400"
                  }`}
                />
                <span>{doc.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                    isSelected
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      : "bg-slate-200/80 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {doc.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =============================================================== */}
      {/* MAIN TWO-COLUMN SPLIT: CONTROLS & VISUAL CALIBRATION CANVAS    */}
      {/* =============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================= */}
        {/* LEFT COLUMN: CONFIGURATION CONTROLS (5 Cols)                  */}
        {/* ============================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dual-Delivery Mode Selector Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Active Output Simulation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode("pad")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center border transition-all ${
                  previewMode === "pad"
                    ? "border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs dark:bg-amber-950/30 dark:text-amber-300"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300"
                }`}
              >
                <Printer className="h-5 w-5 mb-1 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold">Physical Pad Mode</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Leaves header &amp; footer blank
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewMode("blank")}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center border transition-all ${
                  previewMode === "blank"
                    ? "border-teal-500 bg-teal-50/70 text-teal-900 shadow-xs dark:bg-teal-950/30 dark:text-teal-300"
                    : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300"
                }`}
              >
                <Share2 className="h-5 w-5 mb-1 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-bold">Digital Mode</span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Full logo, doctor &amp; WhatsApp PDF
                </span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs for Controls */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setControlTab("margins")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                controlTab === "margins"
                  ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Pad Margins</span>
            </button>
            <button
              type="button"
              onClick={() => setControlTab("scan")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                controlTab === "scan"
                  ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Scan Pad Overlay</span>
            </button>
            <button
              type="button"
              onClick={() => setControlTab("master")}
              className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors ${
                controlTab === "master"
                  ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Clinic Master Crest</span>
            </button>
          </div>

          {/* =========================================================== */}
          {/* TAB 1: MARGIN CALIBRATION & LAYOUT PARAMETERS               */}
          {/* =========================================================== */}
          {controlTab === "margins" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 dark:border-zinc-800 dark:bg-zinc-900">
              {/* Paper Size & Default Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Stationery Size
                  </label>
                  <select
                    value={currentLayout.paper_size}
                    onChange={(e) => updateLayout("paper_size", e.target.value as PaperSize)}
                    className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="a5">A5 Dental Pad (148 × 210 mm)</option>
                    <option value="a4">A4 Full Sheet (210 × 297 mm)</option>
                    <option value="thermal_80">80mm Thermal Slip Roll</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Default Paper Target
                  </label>
                  <select
                    value={currentLayout.default_paper_type}
                    onChange={(e) =>
                      updateLayout("default_paper_type", e.target.value as DefaultPaperType)
                    }
                    className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="pad">Pre-printed Pad (Leave Margins)</option>
                    <option value="blank">Plain Sheet (Full Digital Logo)</option>
                  </select>
                </div>
              </div>

              {/* Top Header Margin Range Slider */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    Top Clearance Margin (Pre-printed Header)
                  </span>
                  <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                    {currentLayout.header_height_mm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="1"
                  value={currentLayout.header_height_mm}
                  onChange={(e) => updateLayout("header_height_mm", parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                  Prevents digital text from overlapping your printed doctor degrees &amp; clinic
                  crest.
                </p>
              </div>

              {/* Bottom Footer Margin Range Slider */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    Bottom Clearance Margin (Pre-printed Footer)
                  </span>
                  <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                    {currentLayout.footer_height_mm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={currentLayout.footer_height_mm}
                  onChange={(e) => updateLayout("footer_height_mm", parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                  Protects pre-printed hospital address, emergency contacts, and accreditation
                  logos.
                </p>
              </div>

              {/* Font Scaling Slider */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    Content Font Scale (1-Page Fitter)
                  </span>
                  <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                    {currentLayout.font_scale.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={currentLayout.font_scale}
                  onChange={(e) => updateLayout("font_scale", parseFloat(e.target.value) || 1.0)}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                  Condenses complex multi-sitting treatment plans to ensure zero spill onto Page 2.
                </p>
              </div>

              {/* Clinical Elements Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Show FDI Tooth Tag &amp; Odontogram
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Renders tooth numbering badges (e.g. Tooth #46)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentLayout.show_tooth_diagram}
                    onChange={(e) => updateLayout("show_tooth_diagram", e.target.checked)}
                    className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Show Doctor Digital Signature
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Appends registered medical signature to safe zone
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentLayout.show_doctor_signature}
                    onChange={(e) => updateLayout("show_doctor_signature", e.target.checked)}
                    className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Dot-Matrix / Impact Mode
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Optimizes for Epson/TVS 9-pin/24-pin: Monospace, ₹ &rarr; Rs., disables images
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.master.dot_matrix_mode}
                    onChange={(e) => updateMaster("dot_matrix_mode", e.target.checked)}
                    className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* =========================================================== */}
          {/* TAB 2: SCAN PHYSICAL PAD WATERMARK OVERLAY                  */}
          {/* =========================================================== */}
          {controlTab === "scan" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Sub-Millimeter Scan Calibration
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Upload a photo or flatbed scan of your printed stationery pad. It will appear as an
                  underlying watermark behind the canvas so you can drag margins into 100% exact
                  alignment!
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => scanInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-teal-500/50 bg-teal-50/30 p-6 text-center transition-all hover:bg-teal-50/60 dark:border-teal-500/30 dark:bg-teal-950/20"
              >
                <Upload className="mx-auto h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                  {currentLayout.calibration_overlay_url
                    ? "Replace Scan Photo"
                    : "Snap or Upload Letterhead Photo"}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  JPG, PNG or PDF scan of your A5 / A4 stationery
                </span>
                <input
                  ref={scanInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScanUpload}
                  className="hidden"
                />
              </div>

              {/* Overlay Controls */}
              {currentLayout.calibration_overlay_url && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={showScanOverlay}
                        onChange={(e) => setShowScanOverlay(e.target.checked)}
                        className="h-4 w-4 rounded accent-teal-600"
                      />
                      <span>Show Underlying Scan in Preview</span>
                    </label>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateLayout("calibration_overlay_url", "")}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      Remove Photo
                    </Button>
                  </div>

                  {showScanOverlay && (
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 dark:bg-zinc-800/40">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          Watermark Opacity
                        </span>
                        <span className="font-mono font-bold text-teal-600">
                          {currentLayout.overlay_opacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={currentLayout.overlay_opacity}
                        onChange={(e) =>
                          updateLayout("overlay_opacity", parseInt(e.target.value) || 40)
                        }
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================== */}
          {/* TAB 3: MASTER CLINIC & DOCTOR CREDENTIALS                   */}
          {/* =========================================================== */}
          {controlTab === "master" && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Clinic Header Name
                </label>
                <input
                  type="text"
                  value={config.master.clinic_name}
                  onChange={(e) => updateMaster("clinic_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Tagline / Speciality Subtitle
                </label>
                <input
                  type="text"
                  value={config.master.tagline}
                  onChange={(e) => updateMaster("tagline", e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Lead Doctor Name
                  </label>
                  <input
                    type="text"
                    value={config.master.doctor_name}
                    onChange={(e) => updateMaster("doctor_name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Degrees / Qualifications
                  </label>
                  <input
                    type="text"
                    value={config.master.doctor_qualification}
                    onChange={(e) => updateMaster("doctor_qualification", e.target.value)}
                    placeholder="BDS, MDS"
                    className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  DCI / State Dental Council Registration No.
                </label>
                <input
                  type="text"
                  value={config.master.doctor_reg_no}
                  onChange={(e) => updateMaster("doctor_reg_no", e.target.value)}
                  placeholder="DCI / GDC Reg. A-14920"
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Logo & Signature Upload Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
                    Digital Clinic Crest
                  </span>
                  {config.master.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={config.master.logo_url}
                      alt="Logo"
                      className="h-10 mx-auto object-contain mb-2 rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 mx-auto bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-2">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full text-[10px] h-7"
                  >
                    Upload Logo
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
                    Doctor Signature
                  </span>
                  {config.master.signature_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={config.master.signature_url}
                      alt="Signature"
                      className="h-10 mx-auto object-contain mb-2"
                    />
                  ) : (
                    <div className="h-10 w-24 mx-auto border-b border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 mb-2">
                      No Signature
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => signatureInputRef.current?.click()}
                    className="w-full text-[10px] h-7"
                  >
                    Upload Signature
                  </Button>
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Letterhead Footer Information Strip
                </label>
                <textarea
                  rows={2}
                  value={config.master.footer_text}
                  onChange={(e) => updateMaster("footer_text", e.target.value)}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE VISUAL CALIBRATION CANVAS (7 Cols)  */}
        {/* ============================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <DentalBrandingCanvas
            layout={currentLayout}
            master={config.master}
            activeDoc={activeDoc}
            previewMode={previewMode}
            showScanOverlay={showScanOverlay}
            scanOverlayUrl={currentLayout.calibration_overlay_url}
            overlayOpacity={currentLayout.overlay_opacity}
          />
        </div>
      </div>

      {/* =============================================================== */}
      {/* WHATSAPP DIGITAL PDF DISPATCH SIMULATION MODAL                   */}
      {/* =============================================================== */}
      {whatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 p-6 text-white shadow-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setWhatsAppModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* WhatsApp Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-white">
                  WhatsApp Cloud Delivery Engine
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Instant High-Res Digital Copy Dispatch
                </p>
              </div>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="my-5 rounded-2xl bg-[#0b141a] p-4 text-xs space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-[#005c4b] p-3 text-slate-100 shadow-sm space-y-2">
                <p>
                  Dear <strong>Anjali Sharma</strong>,
                </p>
                <p className="text-[11px] text-slate-200">
                  Here is your official consultation copy from{" "}
                  <strong>{config.master.clinic_name}</strong> by {config.master.doctor_name}.
                </p>

                {/* PDF Document Attachment Card */}
                <div className="flex items-center gap-3 rounded-xl bg-[#025143] p-2.5 border border-emerald-500/20">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-[10px]">
                    PDF
                  </div>
                  <div className="truncate flex-1">
                    <p className="font-bold text-white text-[11px] truncate">
                      {activeDoc === "PRESCRIPTION"
                        ? "Rx_Anjali_Sharma_CA2026.pdf"
                        : activeDoc === "TREATMENT_PLAN"
                        ? "Dental_Estimate_Plan_CA2026.pdf"
                        : "Dental_Clinical_Doc.pdf"}
                    </p>
                    <p className="text-[9px] text-emerald-300">148 KB &bull; Verified Medico-Legal</p>
                  </div>
                  <FileDown className="h-4 w-4 text-emerald-300 shrink-0" />
                </div>

                <div className="text-right text-[9px] text-emerald-200/80">15:04 &bull; Delivered ✓✓</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setPreviewMode("blank");
                  setWhatsAppModalOpen(false);
                  setTimeout(() => handlePrintTest(), 300);
                }}
                className="flex-1 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                <span>Download / Print Digital PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
