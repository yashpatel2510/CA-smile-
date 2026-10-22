"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Stethoscope,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Palette,
  Edit3,
  X,
  Copy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookingFormConfig,
  BookingFormFieldConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";

// Palette presets for rapid admin design
const PRESET_BG_COLORS = [
  { label: "Pure White", value: "#ffffff" },
  { label: "Warm Cream", value: "#fbf9f5" },
  { label: "Soft Pearl", value: "#f8fafc" },
  { label: "Cool Slate", value: "#f1f5f9" },
  { label: "Sky Tint", value: "#eff6ff" },
  { label: "Mint Tint", value: "#f0fdf4" },
  { label: "Amber Tint", value: "#fefce8" },
  { label: "Rose Tint", value: "#fff1f2" },
];

const PRESET_TEXT_COLORS = [
  { label: "Charcoal Black", value: "#1e293b" },
  { label: "Deep Navy", value: "#1e3a8a" },
  { label: "Pure Black", value: "#000000" },
  { label: "Slate Muted", value: "#475569" },
  { label: "Forest Green", value: "#065f46" },
  { label: "Royal Teal", value: "#0f766e" },
  { label: "Warm Coral", value: "#c2410c" },
  { label: "Crimson", value: "#991b1b" },
];

const PRESET_BTN_COLORS = [
  { label: "Coral Red", value: "#f2583e" },
  { label: "Ocean Blue", value: "#2563eb" },
  { label: "Emerald Teal", value: "#0d9488" },
  { label: "Midnight Slate", value: "#0f172a" },
  { label: "Forest Green", value: "#16a34a" },
  { label: "Purple Indigo", value: "#6366f1" },
];

export default function AdminBookingFormBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active configuration state
  const [config, setConfig] = useState<BookingFormConfig>(
    defaultBookingFormConfig
  );
  const [activeTab, setActiveTab] = useState<
    "fields" | "styling" | "treatments" | "slots" | "doctors" | "preview"
  >("fields");

  // New item input states
  const [newTreatment, setNewTreatment] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [newDoctor, setNewDoctor] = useState("");

  // Add Field Modal State
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<
    "text" | "tel" | "email" | "select" | "checkbox" | "textarea" | "date"
  >("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldBgColor, setNewFieldBgColor] = useState("#ffffff");
  const [newFieldTextColor, setNewFieldTextColor] = useState("#1e293b");
  const [newFieldHelpText, setNewFieldHelpText] = useState("");

  // Edit Field Modal State
  const [editingField, setEditingField] =
    useState<BookingFormFieldConfig | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editType, setEditType] = useState<any>("text");
  const [editRequired, setEditRequired] = useState(false);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editOptions, setEditOptions] = useState("");
  const [editBgColor, setEditBgColor] = useState("#ffffff");
  const [editTextColor, setEditTextColor] = useState("#1e293b");
  const [editHelpText, setEditHelpText] = useState("");

  // Fetch live configuration from API
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/booking-form/config");
      const data = await res.json();
      if (data.success && data.config) {
        setConfig({
          ...defaultBookingFormConfig,
          ...data.config,
        });
      }
    } catch {
      setErrorMsg("Failed to load booking form configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save updated config to API
  const handleSaveConfig = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/booking-form/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSuccessMsg(
          "Booking & Contact form configuration updated! All changes are live on the website."
        );
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(data.error || "Failed to save configuration.");
      }
    } catch {
      setErrorMsg("Network error saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all booking form fields, styling, treatments, and time slots to default clinic settings?"
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/booking-form/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setSuccessMsg("Reset to clinic default configuration successfully.");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch {
      setErrorMsg("Failed to reset configuration.");
    } finally {
      setSaving(false);
    }
  };

  // Field toggles
  const toggleFieldEnabled = (fieldId: string) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, enabled: !f.enabled } : f
      ),
    }));
  };

  const toggleFieldRequired = (fieldId: string) => {
    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === fieldId ? { ...f, required: !f.required } : f
      ),
    }));
  };

  // Delete ANY field (custom or standard)
  const handleDeleteField = (fieldId: string) => {
    const field = config.fields.find((f) => f.id === fieldId);
    if (!field) return;

    if (
      !confirm(
        `Are you sure you want to remove the field "${field.label}" from the booking form?`
      )
    ) {
      return;
    }

    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
    setSuccessMsg(`Field "${field.label}" removed from form.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Open Edit Modal for any field
  const handleOpenEditField = (field: BookingFormFieldConfig) => {
    setEditingField(field);
    setEditLabel(field.label);
    setEditPlaceholder(field.placeholder || "");
    setEditType(field.type);
    setEditRequired(field.required);
    setEditEnabled(field.enabled);
    setEditOptions(field.options?.join(", ") || "");
    setEditBgColor(field.bgColor || "#ffffff");
    setEditTextColor(field.textColor || "#1e293b");
    setEditHelpText(field.helpText || "");
  };

  // Save changes to edited field
  const handleSaveEditedField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !editLabel.trim()) return;

    const optionsArray =
      editType === "select" || editType === "radio" || editType === "segmented"
        ? editOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : editingField.options;

    setConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              label: editLabel.trim(),
              placeholder: editPlaceholder.trim() || undefined,
              type: editType,
              required: editRequired,
              enabled: editEnabled,
              bgColor: editBgColor || undefined,
              textColor: editTextColor || undefined,
              options: optionsArray,
              helpText: editHelpText.trim() || undefined,
            }
          : f
      ),
    }));

    setEditingField(null);
    setSuccessMsg(
      `Updated field "${editLabel}". Remember to click "Save & Apply Live"!`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Add New Field Submit
  const handleAddNewField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const newId = `field_${Date.now()}`;
    const optionsArray =
      newFieldType === "select"
        ? newFieldOptions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newField: BookingFormFieldConfig = {
      id: newId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      enabled: true,
      placeholder: newFieldPlaceholder.trim() || undefined,
      options: optionsArray,
      bgColor: newFieldBgColor || undefined,
      textColor: newFieldTextColor || undefined,
      isCustom: true,
      helpText: newFieldHelpText.trim() || "Custom field added by administrator",
    };

    setConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));

    // Reset modal form
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setNewFieldOptions("");
    setNewFieldPlaceholder("");
    setNewFieldBgColor("#ffffff");
    setNewFieldTextColor("#1e293b");
    setNewFieldHelpText("");
    setAddFieldModalOpen(false);
    setSuccessMsg(
      `Added field "${newField.label}". Remember to click "Save & Apply Live"!`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Treatments manager
  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatment.trim()) return;
    if (config.treatments.includes(newTreatment.trim())) {
      alert("This treatment option already exists.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      treatments: [...prev.treatments, newTreatment.trim()],
    }));
    setNewTreatment("");
  };

  const handleDeleteTreatment = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      treatments: prev.treatments.filter((_, idx) => idx !== index),
    }));
  };

  // Time slots manager
  const handleAddTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeSlot.trim()) return;
    if (config.timeSlots.includes(newTimeSlot.trim())) {
      alert("This time slot already exists.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newTimeSlot.trim()],
    }));
    setNewTimeSlot("");
  };

  const handleDeleteTimeSlot = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, idx) => idx !== index),
    }));
  };

  // Doctors manager
  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.trim()) return;
    if (config.doctors.includes(newDoctor.trim())) {
      alert("This doctor already exists.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      doctors: [...prev.doctors, newDoctor.trim()],
    }));
    setNewDoctor("");
  };

  const handleDeleteDoctor = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      doctors: prev.doctors.filter((_, idx) => idx !== index),
    }));
  };

  const enabledFieldsCount = config.fields.filter((f) => f.enabled).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Header with Save & Reset Buttons */}
      <div className="flex flex-col gap-4 border-b border-brand-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-brand-text">
              Booking Form Builder &amp; Field Settings
            </h1>
            <Badge
              variant="default"
              className="bg-emerald-600 text-xs text-white"
            >
              Admin Live Control
            </Badge>
          </div>
          <p className="mt-1 text-xs text-brand-muted sm:text-sm">
            Add or remove any field, edit labels, placeholders, background
            colors, text colors, and styling for the public contact &amp;
            booking form.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={saving}
            className="gap-1.5 text-xs text-brand-muted hover:text-brand-text"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveConfig}
            disabled={saving}
            className="shadow-xs gap-1.5 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Save className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} />
            <span>{saving ? "Saving Changes..." : "Save & Apply Live"}</span>
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="shadow-xs flex items-center justify-between rounded-clinic border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="ml-4 font-bold text-emerald-700 hover:text-emerald-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMsg && (
        <div className="shadow-xs flex items-center justify-between rounded-clinic border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="ml-4 font-bold text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Quick KPI Stat Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-brand-border bg-brand-surface p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
            Total Form Fields
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-text">
              {config.fields.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              ({enabledFieldsCount} active)
            </span>
          </div>
        </Card>

        <Card className="border-brand-border bg-brand-surface p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
            Treatments &amp; Concerns
          </div>
          <div className="mt-1 text-2xl font-bold text-brand-text">
            {config.treatments.length}
          </div>
        </Card>

        <Card className="border-brand-border bg-brand-surface p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
            Active Time Slots
          </div>
          <div className="mt-1 text-2xl font-bold text-brand-text">
            {config.timeSlots.length}
          </div>
        </Card>

        <Card className="border-brand-border bg-brand-surface p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
            Form Theme &amp; Style
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-stone-300"
              style={{ backgroundColor: config.buttonBgColor || "#f2583e" }}
            />
            <span className="text-xs font-bold text-brand-text">Custom Palette</span>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("fields")}
          className={`flex items-center gap-1.5 rounded-clinic px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "fields"
              ? "shadow-xs bg-brand-primary text-white"
              : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Form Fields &amp; Settings ({config.fields.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("styling")}
          className={`flex items-center gap-1.5 rounded-clinic px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "styling"
              ? "shadow-xs bg-brand-primary text-white"
              : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Colors &amp; Styling</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("treatments")}
          className={`flex items-center gap-1.5 rounded-clinic px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "treatments"
              ? "shadow-xs bg-brand-primary text-white"
              : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
          }`}
        >
          <Stethoscope className="h-3.5 w-3.5" />
          <span>Treatments ({config.treatments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("slots")}
          className={`flex items-center gap-1.5 rounded-clinic px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "slots"
              ? "shadow-xs bg-brand-primary text-white"
              : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Time Slots ({config.timeSlots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("doctors")}
          className={`flex items-center gap-1.5 rounded-clinic px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "doctors"
              ? "shadow-xs bg-brand-primary text-white"
              : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Doctors ({config.doctors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-1.5 rounded-clinic px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === "preview"
              ? "shadow-xs bg-brand-primary text-white"
              : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Live Form Preview</span>
        </button>
      </div>

      {/* TAB 1: FORM FIELDS & SETTINGS */}
      {activeTab === "fields" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-brand-text">
                Manage Booking Form Fields
              </h2>
              <p className="text-xs text-brand-muted">
                Add, remove, or customize any field&apos;s label, placeholder,
                background color, text color, and validation.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddFieldModalOpen(true)}
              className="border-brand-primary/40 hover:bg-brand-primary/10 gap-1.5 text-xs font-bold text-brand-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Field</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {config.fields.map((field) => (
              <Card
                key={field.id}
                className={`border p-4 transition-all ${
                  field.enabled
                    ? "shadow-xs border-brand-border bg-brand-surface"
                    : "border-dashed border-slate-300 bg-slate-50/70 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-brand-text">
                        {field.label}
                      </span>
                      {field.isCustom ? (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-800">
                          Custom
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                          Standard
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase text-brand-muted">
                        Type: {field.type}
                      </span>
                      {field.required ? (
                        <span className="rounded bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-800">
                          Required
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-600">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditField(field)}
                      className="rounded p-1 text-brand-primary hover:bg-brand-accent/20"
                      title="Edit field settings (label, placeholder, colors)"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(field.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                      title="Remove field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Field Appearance Preview */}
                <div className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5 text-[11px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Input Style Preview:
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div
                      className="truncate rounded border px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: field.bgColor || "#ffffff",
                        color: field.textColor || "#1e293b",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      {field.placeholder ||
                        field.label ||
                        "Enter value..."}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-stone-300"
                        style={{ backgroundColor: field.bgColor || "#ffffff" }}
                        title={`BG: ${field.bgColor || "#ffffff"}`}
                      />
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-stone-300"
                        style={{ backgroundColor: field.textColor || "#1e293b" }}
                        title={`Text: ${field.textColor || "#1e293b"}`}
                      />
                    </div>
                  </div>
                </div>

                {field.helpText && (
                  <p className="mt-2 text-[11px] leading-relaxed text-brand-muted">
                    {field.helpText}
                  </p>
                )}

                {/* Field Controls: Enabled Toggle & Required Toggle */}
                <div className="border-brand-border/60 mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
                  <label className="flex cursor-pointer select-none items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={() => toggleFieldEnabled(field.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="font-semibold text-brand-text">
                      {field.enabled ? (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Eye className="h-3 w-3" /> Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                    </span>
                  </label>

                  <label className="flex cursor-pointer select-none items-center gap-1.5 text-brand-muted hover:text-brand-text">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={() => toggleFieldRequired(field.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-[11px]">Mandatory</span>
                  </label>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COLORS & FORM STYLING */}
      {activeTab === "styling" && (
        <Card className="border-brand-border p-6">
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-brand-text">
                Form Appearance &amp; Color Scheme
              </h2>
              <p className="text-xs text-brand-muted">
                Customize the background, text, and button colors for the
                public appointment and contact form.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Form Container Background */}
              <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-text">
                    Form Card Background
                  </label>
                  <span className="font-mono text-xs text-brand-muted">
                    {config.formBgColor || "#ffffff"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.formBgColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        formBgColor: e.target.value,
                      }))
                    }
                    className="h-10 w-16 cursor-pointer rounded border border-brand-border bg-transparent p-1"
                  />
                  <Input
                    type="text"
                    value={config.formBgColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        formBgColor: e.target.value,
                      }))
                    }
                    className="h-9 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-brand-muted">
                    Quick Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BG_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            formBgColor: c.value,
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-100"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.value }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Text Color */}
              <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-text">
                    Form Primary Text Color
                  </label>
                  <span className="font-mono text-xs text-brand-muted">
                    {config.formTextColor || "#1c1917"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.formTextColor || "#1c1917"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        formTextColor: e.target.value,
                      }))
                    }
                    className="h-10 w-16 cursor-pointer rounded border border-brand-border bg-transparent p-1"
                  />
                  <Input
                    type="text"
                    value={config.formTextColor || "#1c1917"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        formTextColor: e.target.value,
                      }))
                    }
                    className="h-9 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-brand-muted">
                    Quick Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TEXT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            formTextColor: c.value,
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-100"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.value }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button Background */}
              <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-text">
                    Submit Button Color
                  </label>
                  <span className="font-mono text-xs text-brand-muted">
                    {config.buttonBgColor || "#f2583e"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.buttonBgColor || "#f2583e"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        buttonBgColor: e.target.value,
                      }))
                    }
                    className="h-10 w-16 cursor-pointer rounded border border-brand-border bg-transparent p-1"
                  />
                  <Input
                    type="text"
                    value={config.buttonBgColor || "#f2583e"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        buttonBgColor: e.target.value,
                      }))
                    }
                    className="h-9 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-brand-muted">
                    Quick Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BTN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            buttonBgColor: c.value,
                          }))
                        }
                        className="inline-flex items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-100"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.value }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button Text Color */}
              <div className="space-y-3 rounded-xl border border-brand-border bg-brand-surface p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-text">
                    Submit Button Text Color
                  </label>
                  <span className="font-mono text-xs text-brand-muted">
                    {config.buttonTextColor || "#ffffff"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.buttonTextColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        buttonTextColor: e.target.value,
                      }))
                    }
                    className="h-10 w-16 cursor-pointer rounded border border-brand-border bg-transparent p-1"
                  />
                  <Input
                    type="text"
                    value={config.buttonTextColor || "#ffffff"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        buttonTextColor: e.target.value,
                      }))
                    }
                    className="h-9 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-brand-muted">
                    Button Label:
                  </span>
                  <Input
                    type="text"
                    value={config.submitButtonText || "Confirm Booking"}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        submitButtonText: e.target.value,
                      }))
                    }
                    placeholder="e.g. Confirm Booking"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Form Title & Badge customization */}
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-brand-border bg-brand-surface p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text">
                  Header Badge Text
                </label>
                <Input
                  type="text"
                  value={config.headerBadge}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      headerBadge: e.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text">
                  Form Main Headline
                </label>
                <Input
                  type="text"
                  value={config.title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: TREATMENTS & CONCERNS */}
      {activeTab === "treatments" && (
        <Card className="border-brand-border p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-text">
                  Treatment Options on Booking Form
                </h2>
                <p className="text-xs text-brand-muted">
                  These treatments appear in the &quot;Treatment or
                  Concern&quot; dropdown on the public booking form.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {config.treatments.length} Options
              </Badge>
            </div>

            {/* Add New Treatment Form */}
            <form onSubmit={handleAddTreatment} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter new dental treatment or clinical procedure..."
                value={newTreatment}
                onChange={(e) => setNewTreatment(e.target.value)}
                className="text-xs"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-1 whitespace-nowrap font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Treatment</span>
              </Button>
            </form>

            {/* Treatments List */}
            <div className="divide-brand-border/60 divide-y rounded-clinic border border-brand-border bg-brand-surface">
              {config.treatments.map((treatment, idx) => (
                <div
                  key={idx}
                  className="hover:bg-brand-background/50 flex items-center justify-between p-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 font-mono text-xs text-brand-muted">
                      {idx + 1}.
                    </span>
                    <span className="font-medium text-brand-text">
                      {treatment}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTreatment(idx)}
                    className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    title="Remove treatment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: TIME SLOTS MANAGER */}
      {activeTab === "slots" && (
        <Card className="border-brand-border p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-text">
                  Time Slots &amp; Shift Schedule
                </h2>
                <p className="text-xs text-brand-muted">
                  Patients select from these available time slot ranges when
                  requesting their appointment.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {config.timeSlots.length} Slots
              </Badge>
            </div>

            {/* Add New Time Slot Form */}
            <form onSubmit={handleAddTimeSlot} className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. Early Morning (8:00 AM - 9:30 AM)..."
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="text-xs"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-1 whitespace-nowrap font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Time Slot</span>
              </Button>
            </form>

            {/* Time Slots List */}
            <div className="divide-brand-border/60 divide-y rounded-clinic border border-brand-border bg-brand-surface">
              {config.timeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="hover:bg-brand-background/50 flex items-center justify-between p-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-brand-primary" />
                    <span className="font-medium text-brand-text">{slot}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTimeSlot(idx)}
                    className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    title="Remove slot"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 5: DOCTORS ON BOOKING FORM */}
      {activeTab === "doctors" && (
        <Card className="border-brand-border p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-text">
                  Doctors Appearing in Booking Form
                </h2>
                <p className="text-xs text-brand-muted">
                  Doctors and specialists available for patients to pick in the
                  &quot;Preferred Doctor&quot; dropdown.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {config.doctors.length} Doctors
              </Badge>
            </div>

            {/* Add New Doctor Form */}
            <form onSubmit={handleAddDoctor} className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. Dr. Name, Degree (Specialty)..."
                value={newDoctor}
                onChange={(e) => setNewDoctor(e.target.value)}
                className="text-xs"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="gap-1 whitespace-nowrap font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Doctor</span>
              </Button>
            </form>

            {/* Doctors List */}
            <div className="divide-brand-border/60 divide-y rounded-clinic border border-brand-border bg-brand-surface">
              {config.doctors.map((doc, idx) => (
                <div
                  key={idx}
                  className="hover:bg-brand-background/50 flex items-center justify-between p-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-3.5 w-3.5 text-brand-primary" />
                    <span className="font-medium text-brand-text">{doc}</span>
                  </div>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDoctor(idx)}
                      className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      title="Remove doctor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: LIVE PREVIEW */}
      {activeTab === "preview" && (
        <Card className="border-brand-border p-6">
          <div className="space-y-4">
            <div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                Real-Time Public Preview
              </span>
              <h2 className="mt-1 font-heading text-lg font-bold text-brand-text">
                Live Preview of Patient Booking Form
              </h2>
              <p className="text-xs text-brand-muted">
                This shows exactly how the contact &amp; appointment form
                renders with your custom field styling, placeholders, and
                colors.
              </p>
            </div>

            {/* Mock Booking Form rendering current state */}
            <div
              className="mx-auto max-w-xl space-y-4 rounded-2xl border p-6 text-xs shadow-md transition-colors"
              style={{
                backgroundColor: config.formBgColor || "#ffffff",
                color: config.formTextColor || "#1c1917",
                borderColor: "#e2e8f0",
              }}
            >
              <div className="flex items-start justify-between border-b border-stone-200/60 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#e0533c]">
                    {config.headerBadge}
                  </span>
                  <h3 className="font-heading text-base font-bold">
                    {config.title}
                  </h3>
                </div>
                <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {config.clinicName}
                </div>
              </div>

              {/* Render enabled fields with dynamic styling */}
              <div className="space-y-3">
                {config.fields
                  .filter((f) => f.enabled)
                  .map((f) => (
                    <div key={f.id} className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider opacity-90">
                        {f.label}{" "}
                        {f.required ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="font-normal opacity-60">
                            (Optional)
                          </span>
                        )}
                      </label>

                      {f.id === "patientType" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-2 text-center font-bold text-emerald-800">
                            Adult Patient
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center text-slate-600">
                            Child Patient
                          </div>
                        </div>
                      ) : f.id === "treatment" ? (
                        <select
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs"
                          style={{
                            backgroundColor: f.bgColor || "#ffffff",
                            color: f.textColor || "#1e293b",
                          }}
                        >
                          {config.treatments.map((t, i) => (
                            <option key={i}>{t}</option>
                          ))}
                        </select>
                      ) : f.id === "preferredDoctor" ? (
                        <select
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs"
                          style={{
                            backgroundColor: f.bgColor || "#ffffff",
                            color: f.textColor || "#1e293b",
                          }}
                        >
                          {config.doctors.map((d, i) => (
                            <option key={i}>{d}</option>
                          ))}
                        </select>
                      ) : f.id === "timeRange" ? (
                        <select
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs"
                          style={{
                            backgroundColor: f.bgColor || "#ffffff",
                            color: f.textColor || "#1e293b",
                          }}
                        >
                          {config.timeSlots.map((s, i) => (
                            <option key={i}>{s}</option>
                          ))}
                        </select>
                      ) : f.id === "contactMethod" ? (
                        <div className="flex gap-4 pt-1">
                          <label className="flex items-center gap-1.5">
                            <input type="radio" checked readOnly />
                            <span>Phone Call</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <input type="radio" readOnly />
                            <span>Email</span>
                          </label>
                        </div>
                      ) : f.type === "textarea" ? (
                        <textarea
                          rows={2}
                          placeholder={f.placeholder}
                          className="w-full rounded-xl border border-slate-200 p-2 text-xs"
                          style={{
                            backgroundColor: f.bgColor || "#ffffff",
                            color: f.textColor || "#1e293b",
                          }}
                          readOnly
                        />
                      ) : f.type === "checkbox" ? (
                        <label className="flex items-center gap-2 pt-1">
                          <input type="checkbox" checked readOnly />
                          <span className="text-[11px] opacity-80">
                            {f.helpText || "I agree to clinic communication."}
                          </span>
                        </label>
                      ) : f.type === "select" && f.options ? (
                        <select
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs"
                          style={{
                            backgroundColor: f.bgColor || "#ffffff",
                            color: f.textColor || "#1e293b",
                          }}
                        >
                          {f.options.map((opt, i) => (
                            <option key={i}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs"
                          style={{
                            backgroundColor: f.bgColor || "#ffffff",
                            color: f.textColor || "#1e293b",
                          }}
                          readOnly
                        />
                      )}
                    </div>
                  ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="shadow-md flex h-11 w-full items-center justify-center gap-2 rounded-xl font-bold transition-all"
                  style={{
                    backgroundColor: config.buttonBgColor || "#f2583e",
                    color: config.buttonTextColor || "#ffffff",
                  }}
                >
                  <span>{config.submitButtonText || "Confirm Booking"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: ADD NEW FIELD */}
      {addFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-clinic border border-brand-border bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-text">
                  Add New Form Field
                </h3>
                <p className="text-xs text-brand-muted">
                  Create a custom question or field with custom styling and
                  placeholder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddFieldModalOpen(false)}
                className="text-base text-brand-muted hover:text-brand-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewField} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-text">
                    Field Label *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dental Insurance Provider or Preferred Branch"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-text">
                    Field Type
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="h-9 w-full rounded-clinic border border-brand-border bg-white px-3 text-xs text-brand-text"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="tel">Telephone / Mobile</option>
                    <option value="email">Email Address</option>
                    <option value="select">Dropdown Selection</option>
                    <option value="textarea">Multi-line Paragraph</option>
                    <option value="checkbox">Checkbox (Yes/No)</option>
                    <option value="date">Date Picker</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text">
                  Placeholder Text
                </label>
                <Input
                  placeholder="e.g. Enter provider name or policy ID..."
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  className="text-xs"
                />
              </div>

              {newFieldType === "select" && (
                <div className="space-y-1">
                  <label className="font-semibold text-brand-text">
                    Dropdown Options (comma-separated) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Cigna, MetLife, Aetna, Self-Pay"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    className="text-xs"
                  />
                </div>
              )}

              {/* Color Customization for the field */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-text">
                    Field Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFieldBgColor}
                      onChange={(e) => setNewFieldBgColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                    />
                    <Input
                      type="text"
                      value={newFieldBgColor}
                      onChange={(e) => setNewFieldBgColor(e.target.value)}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-text">
                    Field Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFieldTextColor}
                      onChange={(e) => setNewFieldTextColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                    />
                    <Input
                      type="text"
                      value={newFieldTextColor}
                      onChange={(e) => setNewFieldTextColor(e.target.value)}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text">
                  Help Text / Description (Optional)
                </label>
                <Input
                  placeholder="e.g. Helpful hint shown under the field"
                  value={newFieldHelpText}
                  onChange={(e) => setNewFieldHelpText(e.target.value)}
                  className="text-xs"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-primary"
                />
                <span className="font-semibold text-brand-text">
                  Mark this field as mandatory (Required)
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddFieldModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-brand-primary font-bold text-white"
                >
                  Add Field to Form
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FIELD SETTINGS */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-clinic border border-brand-border bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-text">
                  Edit Field: {editingField.label}
                </h3>
                <p className="text-xs text-brand-muted">
                  Update label, placeholder, background color, text color, and
                  visibility.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="text-base text-brand-muted hover:text-brand-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditedField}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-semibold text-brand-text">
                    Field Label *
                  </label>
                  <Input
                    required
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-brand-text">
                    Field Input Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="h-9 w-full rounded-clinic border border-brand-border bg-white px-3 text-xs text-brand-text"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="tel">Telephone / Mobile</option>
                    <option value="email">Email Address</option>
                    <option value="select">Dropdown Selection</option>
                    <option value="textarea">Multi-line Paragraph</option>
                    <option value="checkbox">Checkbox (Yes/No)</option>
                    <option value="date">Date Picker</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="segmented">Segmented Buttons</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text">
                  Placeholder Text
                </label>
                <Input
                  value={editPlaceholder}
                  onChange={(e) => setEditPlaceholder(e.target.value)}
                  placeholder="Placeholder shown inside input..."
                  className="text-xs"
                />
              </div>

              {(editType === "select" ||
                editType === "radio" ||
                editType === "segmented") && (
                <div className="space-y-1">
                  <label className="font-semibold text-brand-text">
                    Dropdown / Choice Options (comma-separated)
                  </label>
                  <Input
                    value={editOptions}
                    onChange={(e) => setEditOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="text-xs"
                  />
                </div>
              )}

              {/* Color Customization */}
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-text">
                    Input Background Color (bg)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editBgColor}
                      onChange={(e) => setEditBgColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                    />
                    <Input
                      type="text"
                      value={editBgColor}
                      onChange={(e) => setEditBgColor(e.target.value)}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-text">
                    Input Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editTextColor}
                      onChange={(e) => setEditTextColor(e.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                    />
                    <Input
                      type="text"
                      value={editTextColor}
                      onChange={(e) => setEditTextColor(e.target.value)}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-brand-text">
                  Help Text / Caption
                </label>
                <Input
                  value={editHelpText}
                  onChange={(e) => setEditHelpText(e.target.value)}
                  placeholder="Optional hint text shown below the field"
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editEnabled}
                    onChange={(e) => setEditEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-primary"
                  />
                  <span className="font-semibold text-brand-text">
                    Field is Visible on Website
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editRequired}
                    onChange={(e) => setEditRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-red-600"
                  />
                  <span className="font-semibold text-brand-text">
                    Mandatory (Required)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-brand-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDeleteField(editingField.id);
                    setEditingField(null);
                  }}
                  className="gap-1 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Field</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-brand-primary font-bold text-white"
                  >
                    Save Field Settings
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
