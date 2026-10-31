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
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Loader2,
  CheckCircle,
  Smartphone,
  Monitor,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  WhyTrustUsSectionConfig,
  TrustFeatureItem,
  DEFAULT_WHY_TRUST_US_CONFIG,
  DEFAULT_TRUST_FEATURES,
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

export function WhyTrustUsSectionManager() {
  const { brandConfig, updateBrandConfig } = useClinicTheme();

  // Active configuration state
  const [config, setConfig] = useState<WhyTrustUsSectionConfig>(() => {
    return brandConfig?.whyTrustUsSection || DEFAULT_WHY_TRUST_US_CONFIG;
  });

  // Keep in sync when brandConfig changes
  useEffect(() => {
    if (brandConfig?.whyTrustUsSection) {
      setConfig({
        ...DEFAULT_WHY_TRUST_US_CONFIG,
        ...brandConfig.whyTrustUsSection,
      });
    }
  }, [brandConfig?.whyTrustUsSection]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // File Upload Ref
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Field updater
  const updateField = <K extends keyof WhyTrustUsSectionConfig>(
    field: K,
    value: WhyTrustUsSectionConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Image upload handler
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (typeof loadEvt.target?.result === "string") {
          updateField("backgroundImageUrl", loadEvt.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Feature Handlers
  const handleAddFeature = () => {
    const newFeature: TrustFeatureItem = {
      title: "New Safety Guarantee",
      description: "Explain your technology, equipment, sterilization, or patient assurance policy.",
    };
    setConfig((prev) => ({
      ...prev,
      features: [...(prev.features || []), newFeature],
    }));
  };

  const handleUpdateFeature = (
    index: number,
    field: keyof TrustFeatureItem,
    value: string
  ) => {
    setConfig((prev) => {
      const updated = [...(prev.features || [])];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return { ...prev, features: updated };
    });
  };

  const handleRemoveFeature = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleMoveFeature = (index: number, direction: "up" | "down") => {
    setConfig((prev) => {
      const list = [...(prev.features || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, features: list };
    });
  };

  const handleResetFeatures = () => {
    setConfig((prev) => ({
      ...prev,
      features: DEFAULT_TRUST_FEATURES,
    }));
  };

  const handleResetAll = () => {
    if (confirm("Reset Why Patients Trust Us section to factory defaults?")) {
      setConfig(DEFAULT_WHY_TRUST_US_CONFIG);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const ok = await updateBrandConfig({
        ...brandConfig,
        whyTrustUsSection: config,
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

  const features = config.features || DEFAULT_TRUST_FEATURES;

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Why Patients Trust Us Section
              <Badge variant="outline" className="text-[11px] font-normal">
                Cinematic Showcase
              </Badge>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize cinematic illuminated dental chair background, headings, and key trust feature blocks
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
            className="h-9 gap-1.5 text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : savedSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
          <span>Why Patients Trust Us section updated live across the website!</span>
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
          
          {/* Section Visibility & Headings */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                    Section Visibility &amp; Headings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Main 2-line title displayed on the cinematic dark background
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Heading Line 1
                  </label>
                  <Input
                    value={config.headingLine1 || ""}
                    onChange={(e) => updateField("headingLine1", e.target.value)}
                    placeholder="Why patients"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Heading Line 2
                  </label>
                  <Input
                    value={config.headingLine2 || ""}
                    onChange={(e) => updateField("headingLine2", e.target.value)}
                    placeholder="trust us?"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cinematic Background Image Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-zinc-500" />
                Cinematic Treatment Chair Background
              </CardTitle>
              <CardDescription className="text-xs">
                Upload image of illuminated dental chair and overhead surgical lamp or enter URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-zinc-900 text-white border border-zinc-800">
                <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-black border border-zinc-700 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.backgroundImageUrl || "/images/why-patients-trust-us-bg.jpg"}
                    alt="Background Preview"
                    className="w-full h-full object-cover object-left"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={bgFileInputRef}
                      onChange={handleBgImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="h-8 gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Background</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateField("backgroundImageUrl", "/images/why-patients-trust-us-bg.jpg")
                      }
                      className="h-8 text-xs text-zinc-400 hover:text-white"
                    >
                      Reset Image
                    </Button>
                  </div>
                  <Input
                    value={config.backgroundImageUrl || ""}
                    onChange={(e) => updateField("backgroundImageUrl", e.target.value)}
                    placeholder="/images/why-patients-trust-us-bg.jpg"
                    className="h-8 text-xs font-mono bg-zinc-950 border-zinc-700 text-zinc-200"
                  />
                  <p className="text-[11px] text-zinc-400">
                    High-resolution widescreen photo with dark tones on the right side for readable white text.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Feature Cards Manager */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-zinc-500" />
                    Trust &amp; Quality Features ({features.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Add, edit, reorder, or delete feature blocks (e.g. Treatment cycle, Safety guarantee, Digital technology)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFeatures}
                    className="h-8 text-xs text-zinc-500 hover:text-zinc-900"
                  >
                    Reset List
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddFeature}
                    className="h-8 gap-1 text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Feature</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-3">
                {features.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        Feature #{index + 1}: {item.title || "Untitled"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === 0}
                          onClick={() => handleMoveFeature(index, "up")}
                          className="h-7 w-7 p-0 text-zinc-500"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={index === features.length - 1}
                          onClick={() => handleMoveFeature(index, "down")}
                          className="h-7 w-7 p-0 text-zinc-500"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFeature(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete Feature"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500">Feature Title</label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleUpdateFeature(index, "title", e.target.value)}
                        placeholder="Feature Title (e.g. Safety guarantee)"
                        className="h-8 text-xs font-semibold mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-500">Feature Description</label>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => handleUpdateFeature(index, "description", e.target.value)}
                        placeholder="Describe the clinical protocol, warranty, or equipment..."
                        className="w-full mt-1 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Cinematic Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-md overflow-hidden bg-black text-white">
              <CardHeader className="bg-zinc-900/90 pb-3 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    Cinematic Preview
                  </CardTitle>
                  <div className="flex items-center gap-1 bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                        previewDevice === "desktop" ? "bg-zinc-700 text-white" : "text-zinc-400"
                      }`}
                    >
                      <Monitor className="h-3 w-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                        previewDevice === "mobile" ? "bg-zinc-700 text-white" : "text-zinc-400"
                      }`}
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-black">
                {previewDevice === "desktop" ? (
                  /* Desktop Preview */
                  <div className="relative w-full min-h-[360px] overflow-hidden p-4 flex flex-col justify-center">
                    {/* Background image on the left with black gradient fade to right */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.backgroundImageUrl || "/images/why-patients-trust-us-bg.jpg"}
                        alt="Preview Background"
                        className="w-full h-full object-cover object-left"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/80 to-black" />
                    </div>

                    <div className="relative z-10 pl-24 pr-2 space-y-4">
                      <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-white leading-tight">
                        {config.headingLine1 || "Why patients"}
                        <br />
                        {config.headingLine2 || "trust us?"}
                      </h3>

                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {features.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <h4 className="text-xs font-bold text-white tracking-wide">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mobile Preview */
                  <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
                    <div className="relative w-full h-28 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={config.backgroundImageUrl || "/images/why-patients-trust-us-bg.jpg"}
                        alt="Preview"
                        className="w-full h-full object-cover object-left"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black to-transparent" />
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {config.headingLine1 || "Why patients"}{" "}
                      {config.headingLine2 || "trust us?"}
                    </h3>
                    <div className="space-y-2.5">
                      {features.map((item, idx) => (
                        <div key={idx} className="border-l border-zinc-700 pl-2.5 space-y-0.5">
                          <h4 className="text-[11px] font-bold text-white">{item.title}</h4>
                          <p className="text-[10px] text-zinc-400 leading-normal">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
