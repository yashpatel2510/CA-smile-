"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ImageIcon,
  Eye,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Stethoscope,
  Filter,
  Type,
  RotateCcw,
  Gauge,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvailableClinicImage } from "@/lib/treatments-store";

interface TreatmentItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  category?: string;
  image: string;
  whatItIs?: string;
  howItWorks?: string;
  benefits?: string;
  procedure?: string[];
  result?: string;
  whatIfNotDone?: string;
  paragraphs: string[];
  isActive: boolean;
  order?: number;
}

export default function AdminServicesAndTreatmentsPage() {
  const [activeTab, setActiveTab] = useState<"treatments" | "diagnostics">("treatments");
  const [treatments, setTreatments] = useState<TreatmentItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<TreatmentItem[]>([]);
  const [availableImages, setAvailableImages] = useState<AvailableClinicImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagePickerModalOpen, setIsImagePickerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TreatmentItem | null>(null);

  // Form states for Add / Edit
  const [formType, setFormType] = useState<"treatments" | "diagnostics">("treatments");
  const [formId, setFormId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formImage, setFormImage] = useState("/images/treatments/teeth-whitening.jpg");
  const [formWhatItIs, setFormWhatItIs] = useState("");
  const [formHowItWorks, setFormHowItWorks] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formProcedure, setFormProcedure] = useState("");
  const [formResult, setFormResult] = useState("");
  const [formWhatIfNotDone, setFormWhatIfNotDone] = useState("");
  const [formParagraph1, setFormParagraph1] = useState("");
  const [formParagraph2, setFormParagraph2] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Image picker state
  const [selectedImageToApply, setSelectedImageToApply] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  const [showTreatments, setShowTreatments] = useState<boolean>(true);
  const [isTogglingTreatmentsVisibility, setIsTogglingTreatmentsVisibility] = useState(false);

  // Treatment and Diagnostic Section Heading & Subtitle states
  const [treatmentHeading, setTreatmentHeading] = useState("Treatment");
  const [treatmentSubtitle, setTreatmentSubtitle] = useState(
    "Each tailored treatment is an investment in your health and aesthetics. We deliver results that not only heal — but impress."
  );
  const [diagnosticHeading, setDiagnosticHeading] = useState("Diagnostic");
  const [diagnosticSubtitle, setDiagnosticSubtitle] = useState(
    "Diagnostic methods allow us to accurately assess the condition of teeth, detect issues at early stages, and develop a personalized treatment plan"
  );
  const [isSavingHeadings, setIsSavingHeadings] = useState(false);
  const [transitionSpeed, setTransitionSpeed] = useState<"slow" | "normal" | "fast">("slow");
  const [isSavingSpeed, setIsSavingSpeed] = useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/treatments");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          if (typeof data.settings.showDiagnostics === "boolean") {
            setShowDiagnostics(data.settings.showDiagnostics);
          }
          if (typeof data.settings.showTreatments === "boolean") {
            setShowTreatments(data.settings.showTreatments);
          }
          if (data.settings.treatmentHeading) {
            setTreatmentHeading(data.settings.treatmentHeading);
          }
          if (data.settings.treatmentSubtitle) {
            setTreatmentSubtitle(data.settings.treatmentSubtitle);
          }
          if (data.settings.diagnosticHeading) {
            setDiagnosticHeading(data.settings.diagnosticHeading);
          }
          if (data.settings.diagnosticSubtitle) {
            setDiagnosticSubtitle(data.settings.diagnosticSubtitle);
          }
          if (
            data.settings.transitionSpeed &&
            ["slow", "normal", "fast"].includes(data.settings.transitionSpeed)
          ) {
            setTransitionSpeed(data.settings.transitionSpeed);
          }
        }
        setTreatments(data.treatments || []);
        setDiagnostics(data.diagnostics || []);
        setAvailableImages(data.availableImages || []);
      } else {
        showStatus("error", "Failed to load treatments data");
      }
    } catch {
      showStatus("error", "Network error while loading treatments");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateTransitionSpeed = async (speed: "slow" | "normal" | "fast") => {
    setTransitionSpeed(speed);
    setIsSavingSpeed(true);
    try {
      const res = await fetch("/api/admin/treatments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transitionSpeed: speed }),
      });
      if (res.ok) {
        const speedLabel =
          speed === "slow"
            ? "Gentle & Slow (0.75s, 220ms buffer)"
            : speed === "normal"
            ? "Balanced Standard (0.48s, 150ms buffer)"
            : "Snappy & Fast (0.32s, 100ms buffer)";
        showStatus("success", `Hover transition speed set to ${speedLabel}`);
      } else {
        showStatus("error", "Failed to update transition speed");
      }
    } catch {
      showStatus("error", "Network error updating transition speed");
    } finally {
      setIsSavingSpeed(false);
    }
  };

  const handleToggleDiagnostics = async (enabled: boolean) => {
    setIsTogglingVisibility(true);
    try {
      const res = await fetch("/api/admin/treatments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showDiagnostics: enabled }),
      });
      if (res.ok) {
        setShowDiagnostics(enabled);
        showStatus(
          "success",
          enabled
            ? "Diagnostic section is now SHOWN on the public services showcase"
            : "Diagnostic section has been REMOVED from the public services showcase"
        );
      } else {
        showStatus("error", "Failed to update section visibility");
      }
    } catch {
      showStatus("error", "Network error updating visibility");
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleToggleTreatments = async (enabled: boolean) => {
    setIsTogglingTreatmentsVisibility(true);
    try {
      const res = await fetch("/api/admin/treatments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showTreatments: enabled }),
      });
      if (res.ok) {
        setShowTreatments(enabled);
        showStatus(
          "success",
          enabled
            ? "Treatment section is now SHOWN on the public services showcase"
            : "Treatment section has been REMOVED from the public services showcase"
        );
      } else {
        showStatus("error", "Failed to update treatment section visibility");
      }
    } catch {
      showStatus("error", "Network error updating visibility");
    } finally {
      setIsTogglingTreatmentsVisibility(false);
    }
  };

  const handleSaveHeadings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!treatmentHeading.trim() || !diagnosticHeading.trim()) {
      showStatus("error", "Section headings cannot be empty");
      return;
    }
    setIsSavingHeadings(true);
    try {
      const res = await fetch("/api/admin/treatments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treatmentHeading: treatmentHeading.trim(),
          treatmentSubtitle: treatmentSubtitle.trim(),
          diagnosticHeading: diagnosticHeading.trim(),
          diagnosticSubtitle: diagnosticSubtitle.trim(),
          transitionSpeed,
        }),
      });
      if (res.ok) {
        showStatus("success", "Section headings & transition settings saved successfully");
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        showStatus("error", err.message || "Failed to update section headings");
      }
    } catch {
      showStatus("error", "Network error saving section headings");
    } finally {
      setIsSavingHeadings(false);
    }
  };

  const handleResetHeadingsToDefault = () => {
    setTreatmentHeading("Treatment");
    setTreatmentSubtitle(
      "Each tailored treatment is an investment in your health and aesthetics. We deliver results that not only heal — but impress."
    );
    setDiagnosticHeading("Diagnostic");
    setDiagnosticSubtitle(
      "Diagnostic methods allow us to accurately assess the condition of teeth, detect issues at early stages, and develop a personalized treatment plan"
    );
    setTransitionSpeed("slow");
    showStatus("success", "Reset to original default headings & gentle slow speed. Click 'Save Headings' to apply.");
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const currentList = activeTab === "treatments" ? treatments : diagnostics;

  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      item.paragraphs.some((p) => p.toLowerCase().includes(q))
    );
  });

  const handleOpenAddModal = () => {
    setFormId(null);
    setFormType(activeTab);
    setFormTitle("");
    setFormSubtitle("");
    setFormCategory(activeTab === "treatments" ? "Cosmetic & Aesthetics" : "Digital Diagnostics");
    setFormImage("/images/treatments/teeth-whitening.jpg");
    setFormWhatItIs("");
    setFormHowItWorks("");
    setFormBenefits("");
    setFormProcedure("");
    setFormResult("");
    setFormWhatIfNotDone("");
    setFormParagraph1("");
    setFormParagraph2("");
    setFormIsActive(true);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: TreatmentItem) => {
    setFormId(item.id);
    setFormType(activeTab);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle || "");
    setFormCategory(item.category || "");
    setFormImage(item.image);
    setFormWhatItIs(item.whatItIs || item.paragraphs[0] || "");
    setFormHowItWorks(item.howItWorks || item.paragraphs[1] || "");
    setFormBenefits(item.benefits || "");
    setFormProcedure(Array.isArray(item.procedure) ? item.procedure.join("\n") : "");
    setFormResult(item.result || "");
    setFormWhatIfNotDone(item.whatIfNotDone || "");
    setFormParagraph1(item.paragraphs[0] || item.whatItIs || "");
    setFormParagraph2(item.paragraphs[1] || item.howItWorks || "");
    setFormIsActive(item.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleOpenImagePicker = (item: TreatmentItem) => {
    setSelectedItem(item);
    setSelectedImageToApply(item.image);
    setCustomImageUrl("");
    setIsImagePickerModalOpen(true);
  };

  const handleOpenDeleteModal = (item: TreatmentItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showStatus("error", "Treatment title is required");
      return;
    }

    setIsSaving(true);
    const procedure = formProcedure
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const paragraphs = [
      formWhatItIs.trim() || formParagraph1.trim(),
      formHowItWorks.trim() || formParagraph2.trim(),
    ].filter(Boolean);

    const payload = {
      type: formType,
      id: formId,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      category: formCategory.trim(),
      image: formImage.trim(),
      whatItIs: formWhatItIs.trim(),
      howItWorks: formHowItWorks.trim(),
      benefits: formBenefits.trim(),
      procedure,
      result: formResult.trim(),
      whatIfNotDone: formWhatIfNotDone.trim(),
      paragraphs,
      isActive: formIsActive,
    };

    try {
      if (formId) {
        // Update existing treatment
        const res = await fetch("/api/admin/treatments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showStatus("success", `Updated "${formTitle}" successfully`);
          setIsEditModalOpen(false);
          loadData();
        } else {
          const err = await res.json();
          showStatus("error", err.message || "Failed to update treatment");
        }
      } else {
        // Create new treatment
        const res = await fetch("/api/admin/treatments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          showStatus("success", `Created "${formTitle}" successfully`);
          setIsEditModalOpen(false);
          loadData();
        } else {
          const err = await res.json();
          showStatus("error", err.message || "Failed to create treatment");
        }
      }
    } catch {
      showStatus("error", "An unexpected error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyImageChange = async () => {
    if (!selectedItem) return;
    const finalImage = customImageUrl.trim() || selectedImageToApply;
    if (!finalImage) {
      showStatus("error", "Please select or input an image URL");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/treatments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          id: selectedItem.id,
          image: finalImage,
        }),
      });

      if (res.ok) {
        showStatus("success", `Image updated for "${selectedItem.title}"`);
        setIsImagePickerModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        showStatus("error", err.message || "Failed to update image");
      }
    } catch {
      showStatus("error", "Network error updating image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTreatment = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/admin/treatments?id=${encodeURIComponent(selectedItem.id)}&type=${activeTab}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        showStatus("success", `Removed "${selectedItem.title}" successfully`);
        setIsDeleteModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        showStatus("error", err.message || "Failed to delete treatment");
      }
    } catch {
      showStatus("error", "Network error deleting treatment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
              Services &amp; Treatments
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              Live Console
            </Badge>
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            Manage public treatments, diagnostics, clinical imagery, and procedures shown across the clinic website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Treatment</span>
          </Button>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-sm transition-all duration-200 ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-brand-border bg-brand-surface shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Total Treatments
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-text">
                  {treatments.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              {treatments.filter((t) => t.isActive !== false).length} active on live site
            </p>
          </CardContent>
        </Card>

        <Card className="border border-brand-border bg-brand-surface shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Diagnostic Services
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-text">
                  {diagnostics.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              {diagnostics.filter((d) => d.isActive !== false).length} active on live site
            </p>
          </CardContent>
        </Card>

        <Card className="border border-brand-border bg-brand-surface shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Clinical Imagery
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-text">
                  {availableImages.length}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              High-res studio photography assets
            </p>
          </CardContent>
        </Card>

        <Card className="border border-brand-border bg-brand-surface shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">
                  Showcase Display
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-text">
                  Clean Minimalist
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              Prices hidden &bull; Direct booking flow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Visibility Control Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Treatment Section Visibility */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                showTreatments
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-brand-text">
                  Treatment Section Visibility
                </h3>
                <Badge
                  variant={showTreatments ? "default" : "secondary"}
                  className={
                    showTreatments
                      ? "bg-brand-primary/15 text-brand-primary font-semibold border-brand-primary/20 text-[11px]"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 text-[11px]"
                  }
                >
                  {showTreatments ? "Visible on Website" : "Removed / Hidden"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-brand-muted">
                Choose whether the &ldquo;Treatment&rdquo; procedures section is shown or removed on the public website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isTogglingTreatmentsVisibility}
                checked={showTreatments}
                onChange={(e) => handleToggleTreatments(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-brand-primary"></div>
              <span className="ml-3 text-xs font-semibold text-brand-text whitespace-nowrap">
                {showTreatments ? "Section Enabled" : "Section Hidden"}
              </span>
            </label>
          </div>
        </div>

        {/* Diagnostic Section Visibility */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                showDiagnostics
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-500/10 text-zinc-400"
              }`}
            >
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-brand-text">
                  Diagnostic Section Visibility
                </h3>
                <Badge
                  variant={showDiagnostics ? "default" : "secondary"}
                  className={
                    showDiagnostics
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-500/20 text-[11px]"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 text-[11px]"
                  }
                >
                  {showDiagnostics ? "Visible on Website" : "Removed / Hidden"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-brand-muted">
                Choose whether the &ldquo;Diagnostic&rdquo; procedures section is shown or removed on the public website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isTogglingVisibility}
                checked={showDiagnostics}
                onChange={(e) => handleToggleDiagnostics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-xs font-semibold text-brand-text whitespace-nowrap">
                {showDiagnostics ? "Section Enabled" : "Section Hidden"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Treatment and Diagnostic Section Headings Customization Card */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-border/60">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-brand-text">
                  Treatment &amp; Diagnostic Headings
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium border-brand-border text-brand-muted"
                >
                  Customizable
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-brand-muted">
                Change the titles and subtitles for the Treatment and Diagnostic sections shown on the public site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetHeadingsToDefault}
              className="text-xs h-9 cursor-pointer"
              title="Reset both sections to original default text"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Defaults
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveHeadings}
              disabled={isSavingHeadings}
              className="text-xs h-9 bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 font-medium cursor-pointer"
            >
              {isSavingHeadings ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Save Section Headings
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatment Section Heading & Subtitle */}
          <div className="space-y-4 rounded-xl border border-brand-border/70 bg-brand-muted/5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-primary" />
                <h4 className="text-sm font-semibold text-brand-text">
                  Treatment Section
                </h4>
              </div>
              <Badge
                variant={showTreatments ? "default" : "secondary"}
                className={
                  showTreatments
                    ? "bg-brand-primary/15 text-brand-primary text-[10px]"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 text-[10px]"
                }
              >
                {showTreatments ? "Section Enabled" : "Section Hidden"}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-muted">
                Heading Text
              </label>
              <Input
                value={treatmentHeading}
                onChange={(e) => setTreatmentHeading(e.target.value)}
                placeholder="e.g. Treatment"
                className="bg-brand-surface text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-muted">
                Subtitle / Introductory Description
              </label>
              <textarea
                value={treatmentSubtitle}
                onChange={(e) => setTreatmentSubtitle(e.target.value)}
                placeholder="Enter description text shown next to the Treatment heading..."
                rows={3}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs sm:text-sm text-brand-text placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:border-brand-accent transition-all resize-y min-h-[76px]"
              />
            </div>
          </div>

          {/* Diagnostic Section Heading & Subtitle */}
          <div className="space-y-4 rounded-xl border border-brand-border/70 bg-brand-muted/5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                <h4 className="text-sm font-semibold text-brand-text">
                  Diagnostic Section
                </h4>
              </div>
              <Badge
                variant={showDiagnostics ? "default" : "secondary"}
                className={
                  showDiagnostics
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 text-[10px]"
                }
              >
                {showDiagnostics ? "Section Enabled" : "Section Hidden"}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-muted">
                Heading Text
              </label>
              <Input
                value={diagnosticHeading}
                onChange={(e) => setDiagnosticHeading(e.target.value)}
                placeholder="e.g. Diagnostic"
                className="bg-brand-surface text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-muted">
                Subtitle / Introductory Description
              </label>
              <textarea
                value={diagnosticSubtitle}
                onChange={(e) => setDiagnosticSubtitle(e.target.value)}
                placeholder="Enter description text shown next to the Diagnostic heading..."
                rows={3}
                className="w-full rounded-md border border-brand-border bg-brand-surface px-3 py-2 text-xs sm:text-sm text-brand-text placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/30 focus-visible:border-brand-accent transition-all resize-y min-h-[76px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hover Transition Speed & Animation Controls Card (Laptop & Tablet) */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-border/60">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-brand-text">
                  Hover Transition Speed (Laptop &amp; Tablet)
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold border ${
                    transitionSpeed === "slow"
                      ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30"
                      : transitionSpeed === "normal"
                      ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  }`}
                >
                  {transitionSpeed === "slow"
                    ? "GENTLE & SLOW (ACTIVE)"
                    : transitionSpeed === "normal"
                    ? "BALANCED (ACTIVE)"
                    : "SNAPPY & FAST (ACTIVE)"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-brand-muted">
                Controls the expansion speed and smoothness when hovering over treatment &amp; diagnostic procedures on laptop and tablet screens.
              </p>
            </div>
          </div>

          {isSavingSpeed && (
            <div className="flex items-center gap-1.5 text-xs text-brand-muted font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-primary" />
              <span>Applying speed live...</span>
            </div>
          )}
        </div>

        {/* 3 Speed Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Gentle & Slow (Recommended) */}
          <button
            type="button"
            onClick={() => handleUpdateTransitionSpeed("slow")}
            disabled={isSavingSpeed}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
              transitionSpeed === "slow"
                ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/20 shadow-xs"
                : "border-brand-border bg-brand-surface hover:border-brand-border/80 hover:bg-brand-muted/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-text">
                  Gentle &amp; Slow
                </span>
                <Badge className="bg-purple-600 text-white text-[9px] px-1.5 py-0 h-4 font-semibold">
                  Recommended
                </Badge>
              </div>
              {transitionSpeed === "slow" && (
                <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
              )}
            </div>
            <p className="text-xs text-brand-muted leading-relaxed font-normal">
              0.75s soft gradual glide, staggered text/image reveals, and relaxed 220ms mouse-leave buffer.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-purple-700 dark:text-purple-300 font-medium">
              <span>Duration: 750ms</span>
              <span>&bull;</span>
              <span>Buffer: 220ms</span>
            </div>
          </button>

          {/* Balanced / Normal */}
          <button
            type="button"
            onClick={() => handleUpdateTransitionSpeed("normal")}
            disabled={isSavingSpeed}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
              transitionSpeed === "normal"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-xs"
                : "border-brand-border bg-brand-surface hover:border-brand-border/80 hover:bg-brand-muted/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand-text">
                Balanced
              </span>
              {transitionSpeed === "normal" && (
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
              )}
            </div>
            <p className="text-xs text-brand-muted leading-relaxed font-normal">
              0.48s natural responsive slide with standard 150ms mouse-leave buffer.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              <span>Duration: 480ms</span>
              <span>&bull;</span>
              <span>Buffer: 150ms</span>
            </div>
          </button>

          {/* Snappy & Fast */}
          <button
            type="button"
            onClick={() => handleUpdateTransitionSpeed("fast")}
            disabled={isSavingSpeed}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer relative ${
              transitionSpeed === "fast"
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500/20 shadow-xs"
                : "border-brand-border bg-brand-surface hover:border-brand-border/80 hover:bg-brand-muted/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-brand-text">
                  Snappy &amp; Fast
                </span>
                <Zap className="h-3 w-3 text-amber-500" />
              </div>
              {transitionSpeed === "fast" && (
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
              )}
            </div>
            <p className="text-xs text-brand-muted leading-relaxed font-normal">
              0.32s rapid instant reveal with brisk 100ms mouse-leave buffer.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              <span>Duration: 320ms</span>
              <span>&bull;</span>
              <span>Buffer: 100ms</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-2 bg-brand-muted/10 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("treatments")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "treatments"
                ? "bg-brand-surface text-brand-text shadow-2xs font-semibold"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Treatments ({treatments.length})</span>
            <span
              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                showTreatments
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {showTreatments ? "Live" : "Hidden"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("diagnostics")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "diagnostics"
                ? "bg-brand-surface text-brand-text shadow-2xs font-semibold"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Diagnostics ({diagnostics.length})</span>
            <span
              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                showDiagnostics
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {showDiagnostics ? "Live" : "Hidden"}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search treatments or procedures..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Treatment Hidden Alert Banner */}
      {activeTab === "treatments" && !showTreatments && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-50/80 p-4 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              The <strong>Treatment section is currently removed/hidden from the public website</strong>. Patients visiting the services section will only see the Diagnostics showcase.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleTreatments(true)}
            disabled={isTogglingTreatmentsVisibility}
            className="h-8 border-amber-600/40 text-amber-800 hover:bg-amber-100 dark:text-amber-200 text-xs shrink-0 cursor-pointer"
          >
            Show on Website
          </Button>
        </div>
      )}

      {/* Diagnostic Hidden Alert Banner */}
      {activeTab === "diagnostics" && !showDiagnostics && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-50/80 p-4 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              The <strong>Diagnostic section is currently removed/hidden from the public website</strong>. Patients visiting the services section will only see the Treatments showcase.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleDiagnostics(true)}
            disabled={isTogglingVisibility}
            className="h-8 border-amber-600/40 text-amber-800 hover:bg-amber-100 dark:text-amber-200 text-xs shrink-0"
          >
            Show on Website
          </Button>
        </div>
      )}

      {/* Treatment Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border border-brand-border bg-brand-surface p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-brand-muted opacity-40" />
          <h3 className="mt-4 text-lg font-semibold text-brand-text">
            No items found
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            {searchQuery
              ? `No treatments match your search "${searchQuery}".`
              : "No treatments currently configured in this section."}
          </p>
          <Button
            onClick={handleOpenAddModal}
            className="mt-6 gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Treatment</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((item, idx) => {
            const num = String(idx + 1).padStart(2, "0");
            return (
            <Card
              key={item.id}
              className={`group overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                item.isActive !== false
                  ? "border-brand-border bg-brand-surface hover:border-brand-primary/40"
                  : "border-dashed border-zinc-300 bg-zinc-50/50 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/30"
              }`}
            >
              <div>
                {/* Image & Quick Image Changer */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Category Badge & Number */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold bg-black/85 text-white px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
                      #{num}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-zinc-900 backdrop-blur-xs font-semibold shadow-2xs dark:bg-black/80 dark:text-white"
                    >
                      {item.category || (activeTab === "treatments" ? "Treatment" : "Diagnostic")}
                    </Badge>
                  </div>

                  {/* Active / Inactive Badge */}
                  <div className="absolute right-3 top-3">
                    {item.isActive !== false ? (
                      <Badge className="bg-emerald-500/90 text-white backdrop-blur-xs">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-zinc-800/80 text-zinc-300">
                        Hidden
                      </Badge>
                    )}
                  </div>

                  {/* Change Image Hover Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenImagePicker(item)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-[2px]"
                  >
                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black shadow-lg">
                      <ImageIcon className="h-4 w-4" />
                      <span>Change Image</span>
                    </div>
                  </button>
                </div>

                {/* Card Content */}
                <CardContent className="p-5">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-brand-muted font-medium">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {/* What it is */}
                    <div className="text-[11px] leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-150">
                      <span className="font-bold text-teal-700 dark:text-teal-400 block mb-0.5 uppercase tracking-wider text-[10px]">
                        What It Is:
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {item.whatItIs || item.paragraphs[0]}
                      </p>
                    </div>

                    {/* How it works */}
                    <div className="text-[11px] leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-150">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400 block mb-0.5 uppercase tracking-wider text-[10px]">
                        How It Works:
                      </span>
                      <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {item.howItWorks || item.paragraphs[1] || item.paragraphs[0]}
                      </p>
                    </div>
                  </div>

                  {/* Indicators for timeline steps & full page info */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-brand-border/40">
                    <span>
                      {Array.isArray(item.procedure) && item.procedure.length > 0
                        ? `${item.procedure.length} Procedure Steps`
                        : "Procedure Steps ready"}
                    </span>
                    <a
                      href={`/treatments/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:underline font-medium flex items-center gap-1"
                    >
                      <span>Preview Page</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between border-t border-brand-border bg-brand-surface/60 px-5 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenImagePicker(item)}
                  className="gap-1.5 text-xs rounded-lg"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-brand-muted" />
                  <span>Image</span>
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(item)}
                    className="gap-1.5 text-xs text-brand-text hover:bg-brand-primary/10 hover:text-brand-primary rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeleteModal(item)}
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADD / EDIT TREATMENT MODAL                                             */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-brand-muted hover:bg-brand-muted/10 hover:text-brand-text transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                {formId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-text">
                  {formId ? "Edit Treatment Details" : "Add New Clinical Treatment"}
                </h2>
                <p className="text-xs text-brand-muted">
                  Update title, clinical category, image, and description paragraphs.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTreatment} className="mt-6 space-y-5">
              {/* Type Switcher (Treatment vs Diagnostic) */}
              <div>
                <label className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                  Classification
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType("treatments")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                      formType === "treatments"
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
                        : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Treatment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType("diagnostics")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                      formType === "diagnostics"
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold"
                        : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>Diagnostic Procedure</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-brand-text">
                    {formType === "treatments" ? "Treatment Title *" : "Diagnostic Title *"}
                  </label>
                  <Input
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={formType === "treatments" ? "e.g. Digital Smile Design" : "e.g. Computed tomography"}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text">
                    Subtitle / Tagline (Optional)
                  </label>
                  <Input
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder={formType === "treatments" ? "e.g. Computer Smile Planning" : "e.g. 3D Digital Scan"}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-brand-text">
                  Clinical Category
                </label>
                <Input
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Aesthetic Dentistry, Implantology, Orthodontics"
                  className="mt-1.5"
                />
              </div>

              {/* Image Selection / Preview */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-text">
                    Clinical Photo
                  </label>
                  <span className="text-[11px] text-brand-muted">
                    Click any thumbnail below or enter custom path
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-4">
                  {/* Current Selected Thumbnail */}
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-zinc-100 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formImage}
                      alt="Selected preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="w-full">
                    <Input
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/images/treatments/teeth-whitening.jpg"
                      className="text-xs font-mono"
                    />
                    <p className="mt-1 text-[11px] text-brand-muted">
                      Selected asset path from clinic media library
                    </p>
                  </div>
                </div>

                {/* Quick Photo Carousel / Chooser */}
                <div className="mt-3">
                  <p className="text-[11px] font-medium text-brand-muted mb-2">
                    Quick Pick from Clinic Image Library:
                  </p>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {availableImages.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setFormImage(img.url)}
                        className={`group relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                          formImage === img.url
                            ? "border-brand-primary ring-2 ring-brand-primary/40 scale-105"
                            : "border-brand-border opacity-70 hover:opacity-100"
                        }`}
                        title={img.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.name}
                          className="h-full w-full object-cover"
                        />
                        {formImage === img.url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/40">
                            <Check className="h-4 w-4 text-white drop-shadow-sm stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. What It Is (Home Card & Full Page) */}
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                    1. What It Is *
                  </label>
                  <Badge className="bg-teal-100 text-teal-800 text-[10px] font-semibold border-teal-200">
                    Home Card &amp; Full Timeline
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">
                  A simple, clear explanation for patients of what this treatment is.
                </p>
                <textarea
                  required
                  rows={2}
                  value={formWhatItIs}
                  onChange={(e) => setFormWhatItIs(e.target.value)}
                  placeholder="e.g. A modern computerized method that uses computer photos and scans to show you how your new smile will look before any treatment begins."
                  className="w-full rounded-xl border border-teal-200 bg-white p-3 text-xs leading-relaxed text-zinc-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* 2. How It Works (Home Card & Full Page) */}
              <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                    2. How It Works *
                  </label>
                  <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold border-indigo-200">
                    Home Card &amp; Full Timeline
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">
                  How the clinical mechanism, doctor technique, or technology operates.
                </p>
                <textarea
                  required
                  rows={2}
                  value={formHowItWorks}
                  onChange={(e) => setFormHowItWorks(e.target.value)}
                  placeholder="e.g. Advanced imaging software maps your face and tooth shape to create a virtual 3D preview of your final smile."
                  className="w-full rounded-xl border border-indigo-200 bg-white p-3 text-xs leading-relaxed text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* 3. Step-by-Step Procedure */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-900 inline-block" />
                    3. Step-by-Step Procedure (Timeline Steps)
                  </label>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    Full Timeline Only
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Enter each milestone step on a separate line. Displayed as a connected vertical timeline on the treatment page.
                </p>
                <textarea
                  rows={4}
                  value={formProcedure}
                  onChange={(e) => setFormProcedure(e.target.value)}
                  placeholder={`1. Taking initial photographs and digital scans.\n2. Processing images through specialized software.\n3. Reviewing the 3D computer simulation together.\n4. Using the finalized plan to guide treatment.`}
                  className="w-full font-mono rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-relaxed text-zinc-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* 4. Benefits */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    4. Benefits
                  </label>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold border-emerald-200">
                    Full Timeline Only
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Direct clinical, physical, and psychological advantages for the patient.
                </p>
                <textarea
                  rows={2}
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  placeholder="e.g. Gives you total clarity and lets you preview your results beforehand so you feel confident."
                  className="w-full rounded-xl border border-emerald-200 bg-white p-3 text-xs leading-relaxed text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* 5. Expected Result */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    5. Expected Result
                  </label>
                  <Badge className="bg-amber-100 text-amber-800 text-[10px] font-semibold border-amber-200">
                    Full Timeline Only
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">
                  The final smile and health transformation expected upon treatment completion.
                </p>
                <textarea
                  rows={2}
                  value={formResult}
                  onChange={(e) => setFormResult(e.target.value)}
                  placeholder="e.g. A predictable, beautifully balanced smile that matches your face."
                  className="w-full rounded-xl border border-amber-200 bg-white p-3 text-xs leading-relaxed text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* 6. What If It Is Not Done */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                    6. What If It Is Not Done? (Risk Advisory)
                  </label>
                  <Badge className="bg-rose-100 text-rose-800 text-[10px] font-semibold border-rose-200">
                    Full Timeline Only
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Dental health risks, tooth damage, or bone decay that will occur if untreated.
                </p>
                <textarea
                  rows={2}
                  value={formWhatIfNotDone}
                  onChange={(e) => setFormWhatIfNotDone(e.target.value)}
                  placeholder="e.g. You might undergo cosmetic dental treatments without knowing how the final outcome will look."
                  className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs leading-relaxed text-zinc-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-brand-border p-3.5 bg-brand-surface/60">
                <div>
                  <p className="text-xs font-semibold text-brand-text">
                    Publish to Public Website
                  </p>
                  <p className="text-[11px] text-brand-muted">
                    When enabled, this treatment is immediately visible in the public showcase.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-brand-border text-brand-primary focus:ring-brand-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="gap-2 bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{formId ? "Save Changes" : "Create Treatment"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHANGE IMAGE MODAL (Visual Gallery with 1-Click Swap)                  */}
      {/* ========================================================================= */}
      {isImagePickerModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsImagePickerModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-brand-muted hover:bg-brand-muted/10 hover:text-brand-text transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-text">
                  Change Photo for &ldquo;{selectedItem.title}&rdquo;
                </h2>
                <p className="text-xs text-brand-muted">
                  Select any high-resolution clinical image or paste a custom image URL.
                </p>
              </div>
            </div>

            {/* Gallery Grid of 20 Clinical Images */}
            <div className="mt-6">
              <label className="text-xs font-semibold text-brand-text uppercase tracking-wider">
                Clinic Media Library ({availableImages.length} available)
              </label>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 max-h-[380px] overflow-y-auto pr-1">
                {availableImages.map((img) => {
                  const isSelected = selectedImageToApply === img.url && !customImageUrl;

                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => {
                        setSelectedImageToApply(img.url);
                        setCustomImageUrl("");
                      }}
                      className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-brand-primary ring-2 ring-brand-primary/50 shadow-md scale-[1.02]"
                          : "border-brand-border hover:border-brand-primary/40 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-brand-surface">
                        <p className="truncate text-[11px] font-semibold text-brand-text">
                          {img.name}
                        </p>
                        <p className="text-[10px] text-brand-muted">
                          {img.category}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="mt-6 border-t border-brand-border pt-4">
              <label className="text-xs font-semibold text-brand-text">
                Or Enter Custom Image URL
              </label>
              <Input
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  if (e.target.value) {
                    setSelectedImageToApply(e.target.value);
                  }
                }}
                placeholder="https://example.com/custom-photo.jpg"
                className="mt-1.5 text-xs font-mono"
              />
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-brand-border pt-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customImageUrl || selectedImageToApply}
                    alt="Current selection"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xs text-brand-muted truncate max-w-[240px]">
                  {customImageUrl || selectedImageToApply}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImagePickerModalOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleApplyImageChange}
                  disabled={isSaving}
                  className="gap-2 bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Apply Photo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE TREATMENT CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/50">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-text">
                Remove Treatment?
              </h3>
            </div>

            <p className="mt-3 text-sm text-brand-muted leading-relaxed">
              Are you sure you want to delete <strong className="text-brand-text">&ldquo;{selectedItem.title}&rdquo;</strong>? This procedure will be permanently removed from the public website showcase.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Keep Treatment
              </Button>

              <Button
                variant="primary"
                disabled={isSaving}
                onClick={handleDeleteTreatment}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white border-transparent"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
