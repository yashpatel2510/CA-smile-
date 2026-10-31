"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  RotateCcw,
  Upload,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  UserCheck,
  Image as ImageIcon,
  Phone,
  Sparkles,
  Eye,
  Loader2,
  Check,
  CheckCircle,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  DoctorIntroSectionConfig,
  DoctorSpecialityItem,
  DEFAULT_DOCTOR_INTRO_CONFIG,
  DEFAULT_DOCTOR_SPECIALITIES,
} from "@/types/branding";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DoctorIntroSectionManager() {
  const { brandConfig, updateBrandConfig } = useClinicTheme();

  // Active configuration state
  const [config, setConfig] = useState<DoctorIntroSectionConfig>(() => {
    return brandConfig?.doctorIntroSection || DEFAULT_DOCTOR_INTRO_CONFIG;
  });

  // Keep in sync when brandConfig changes
  useEffect(() => {
    if (brandConfig?.doctorIntroSection) {
      setConfig({
        ...DEFAULT_DOCTOR_INTRO_CONFIG,
        ...brandConfig.doctorIntroSection,
      });
    }
  }, [brandConfig?.doctorIntroSection]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers for Form Changes
  const updateField = <K extends keyof DoctorIntroSectionConfig>(
    field: K,
    value: DoctorIntroSectionConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (typeof loadEvt.target?.result === "string") {
          updateField("photoUrl", loadEvt.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Speciality Item Handlers
  const handleAddSpeciality = () => {
    const newItem: DoctorSpecialityItem = {
      title: "New Speciality",
      subtitle: "Brief description of procedure or technology",
      tag: "Speciality",
    };
    setConfig((prev) => ({
      ...prev,
      specialities: [...(prev.specialities || []), newItem],
    }));
  };

  const handleUpdateSpeciality = (
    index: number,
    field: keyof DoctorSpecialityItem,
    value: string
  ) => {
    setConfig((prev) => {
      const updated = [...(prev.specialities || [])];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return { ...prev, specialities: updated };
    });
  };

  const handleRemoveSpeciality = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      specialities: (prev.specialities || []).filter((_, i) => i !== index),
    }));
  };

  const handleMoveSpeciality = (index: number, direction: "up" | "down") => {
    setConfig((prev) => {
      const list = [...(prev.specialities || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, specialities: list };
    });
  };

  const handleResetSpecialities = () => {
    setConfig((prev) => ({
      ...prev,
      specialities: DEFAULT_DOCTOR_SPECIALITIES,
    }));
  };

  // Reset All to Factory Reference
  const handleResetAll = () => {
    if (confirm("Reset Doctor Introduction Section to default settings?")) {
      setConfig(DEFAULT_DOCTOR_INTRO_CONFIG);
    }
  };

  // Save to Server & Live Website
  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const ok = await updateBrandConfig({
        ...brandConfig,
        doctorIntroSection: config,
      });
      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage("Failed to save changes. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const specialities = config.specialities || DEFAULT_DOCTOR_SPECIALITIES;

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Doctor Profile &amp; Specialties Section
              <Badge variant="outline" className="text-[11px] font-normal">
                Homepage
              </Badge>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize doctor photo, name, degree, specialities bento cards, and appointment actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            disabled={saving}
            className="h-9 gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-9 gap-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Saving..." : savedSuccess ? "Saved Successfully!" : "Save Section"}</span>
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Doctor Intro section updated live across the website!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Grid of Customization Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Visibility & Basic Info */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                    Section Visibility &amp; Doctor Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Display doctor headline, credentials, and clinic affiliation
                  </CardDescription>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled !== false}
                    onChange={(e) => updateField("enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {config.enabled !== false ? "Visible" : "Hidden"}
                  </span>
                </label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Doctor Name
                </label>
                <Input
                  value={config.doctorName || ""}
                  onChange={(e) => updateField("doctorName", e.target.value)}
                  placeholder="e.g. Dr. DEEP A PATEL"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Degree / Qualifications
                  </label>
                  <Input
                    value={config.degree || ""}
                    onChange={(e) => updateField("degree", e.target.value)}
                    placeholder="e.g. BDS (DENTAL SURGEON)"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Clinic Tagline / Affiliation
                  </label>
                  <Input
                    value={config.clinicTagline || ""}
                    onChange={(e) => updateField("clinicTagline", e.target.value)}
                    placeholder="e.g. CA SMILE BILIMORA"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Portrait Image Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-zinc-500" />
                Doctor Portrait Photo
              </CardTitle>
              <CardDescription className="text-xs">
                Upload a high-resolution portrait or specify an image URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div className="relative w-24 h-28 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.photoUrl || "/images/dr-deep-patel-portrait.jpg"}
                    alt="Doctor Portrait Preview"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Portrait</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateField("photoUrl", "/images/dr-deep-patel-portrait.jpg")}
                      className="h-8 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    >
                      Reset Image
                    </Button>
                  </div>
                  <Input
                    value={config.photoUrl || ""}
                    onChange={(e) => updateField("photoUrl", e.target.value)}
                    placeholder="/images/dr-deep-patel-portrait.jpg or https://..."
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Recommended: 4:5 vertical aspect ratio with transparent or dark clean background.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialities Bento Cards Manager */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-zinc-500" />
                    Speciality Bento Cards ({specialities.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Add, edit, reorder, or remove speciality cards shown in the 2-column grid
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetSpecialities}
                    className="h-8 text-xs text-zinc-500 hover:text-zinc-900"
                  >
                    Reset List
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSpeciality}
                    className="h-8 gap-1 text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Speciality</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Section Subheading
                </label>
                <Input
                  value={config.specialityHeading || ""}
                  onChange={(e) => updateField("specialityHeading", e.target.value)}
                  placeholder="Speciality :"
                  className="h-9 text-xs max-w-xs"
                />
              </div>

              <div className="space-y-3">
                {specialities.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        Card #{index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => handleMoveSpeciality(index, "up")}
                          className="h-7 w-7 p-0 text-zinc-500"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === specialities.length - 1}
                          onClick={() => handleMoveSpeciality(index, "down")}
                          className="h-7 w-7 p-0 text-zinc-500"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSpeciality(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete Card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-7">
                        <Input
                          value={item.title}
                          onChange={(e) => handleUpdateSpeciality(index, "title", e.target.value)}
                          placeholder="Speciality Title (e.g. Root Canal Treatment)"
                          className="h-8 text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <Input
                          value={item.tag || ""}
                          onChange={(e) => handleUpdateSpeciality(index, "tag", e.target.value)}
                          placeholder="Tag (e.g. Endodontics)"
                          className="h-8 text-xs text-zinc-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Input
                        value={item.subtitle}
                        onChange={(e) => handleUpdateSpeciality(index, "subtitle", e.target.value)}
                        placeholder="Description (e.g. Painless single-visit endodontics & tooth saving)"
                        className="h-8 text-xs text-zinc-600 dark:text-zinc-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Button & Call Pill Settings */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-500" />
                Appointment Button &amp; Consultation Phone
              </CardTitle>
              <CardDescription className="text-xs">
                Configure appointment CTA and instant telephone consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Button Text
                  </label>
                  <Input
                    value={config.appointmentButtonText || config.ctaButtonText || ""}
                    onChange={(e) => {
                      updateField("appointmentButtonText", e.target.value);
                      updateField("ctaButtonText", e.target.value);
                    }}
                    placeholder="Book Your Appointment"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Button Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.ctaButtonBgColor || "#9e0000"}
                      onChange={(e) => updateField("ctaButtonBgColor", e.target.value)}
                      className="h-9 w-9 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    />
                    <Input
                      value={config.ctaButtonBgColor || "#9e0000"}
                      onChange={(e) => updateField("ctaButtonBgColor", e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Show Direct Call Pill
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showPhone !== false && config.showPhoneCall !== false}
                      onChange={(e) => {
                        updateField("showPhone", e.target.checked);
                        updateField("showPhoneCall", e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {(config.showPhone !== false && config.showPhoneCall !== false) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Consultation Telephone Number
                    </label>
                    <Input
                      value={config.phone || config.phoneText || ""}
                      onChange={(e) => {
                        updateField("phone", e.target.value);
                        updateField("phoneText", e.target.value);
                      }}
                      placeholder="+91 72260 98074"
                      className="h-9 text-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-md overflow-hidden">
              <CardHeader className="bg-zinc-50 dark:bg-zinc-800/60 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-red-500" />
                    Live Card Preview
                  </CardTitle>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Instant rendering
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 bg-white dark:bg-zinc-950">
                {/* Scaled Preview of Doctor Card */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-4">
                  {/* Portrait & Names */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-900 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.photoUrl || "/images/dr-deep-patel-portrait.jpg"}
                        alt="Preview"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-base font-black text-zinc-900 dark:text-white leading-tight">
                        {config.doctorName || "Dr. DEEP A PATEL"}
                      </h4>
                      <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        {config.degree || "BDS (DENTAL SURGEON)"}
                      </p>
                      {config.clinicTagline && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          • {config.clinicTagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Specialities Preview */}
                  <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      {config.specialityHeading || "Speciality :"}
                    </p>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {specialities.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 mt-0.5">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 leading-snug">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA button preview */}
                  <div className="pt-2 flex flex-col gap-2">
                    <div
                      className="w-full py-2 px-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-sm"
                      style={{
                        backgroundColor: config.ctaButtonBgColor || "#9e0000",
                        color: config.ctaButtonTextColor || "#ffffff",
                      }}
                    >
                      <span>{config.appointmentButtonText || config.ctaButtonText || "Book Your Appointment"}</span>
                      <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white">
                        →
                      </span>
                    </div>

                    {(config.showPhone !== false && config.showPhoneCall !== false) && (
                      <div className="text-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 py-1">
                        Call: {config.phone || config.phoneText || "+91 72260 98074"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    ✓ Clean Aesthetics Applied
                  </p>
                  All 5-star ratings and cluttered badges have been removed as requested, leaving an elegant modern medical profile.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
