"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  MoveLeft,
  MoveRight,
  Copy,
  Eye,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  Loader2,
  Layers,
  MapPin,
  Phone,
  FileText,
  Palette,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import {
  GallerySectionConfig,
  PolaroidPhotoItem,
  DEFAULT_GALLERY_CONFIG,
  DEFAULT_GALLERY_PHOTOS,
} from "@/types/branding";
import { FooterPolaroidsShowcase } from "@/components/public/footer-polaroids-showcase";

const BG_PRESETS = [
  { label: "Night Carbon (Default)", value: "#0d0e12" },
  { label: "True Black", value: "#000000" },
  { label: "Dark Zinc", value: "#18181b" },
  { label: "Deep Slate", value: "#0f172a" },
  { label: "Dark Charcoal", value: "#111827" },
];

export function ClinicBrandingGalleryManager() {
  const { brandConfig, updateBrandConfig } = useClinicTheme();

  // Active configuration state
  const [config, setConfig] = useState<GallerySectionConfig>(() => {
    return brandConfig?.gallery || DEFAULT_GALLERY_CONFIG;
  });

  // Keep in sync when brandConfig changes from outside
  useEffect(() => {
    if (brandConfig?.gallery) {
      setConfig(brandConfig.gallery);
    }
  }, [brandConfig?.gallery]);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<"photos" | "text" | "address" | "logo" | "styling">("photos");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [expandedPhotoId, setExpandedPhotoId] = useState<string | null>(null);

  // New photo modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Partial<PolaroidPhotoItem>>({
    src: "",
    caption: "",
    date: "",
    alt: "",
    initialRotate: -4,
    hoverRotate: 0,
    restingY: 50,
    hoverY: -84,
  });
  const [newPhotoUploadError, setNewPhotoUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const ok = await updateBrandConfig({
        ...brandConfig,
        gallery: config,
      });

      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage("Failed to save changes. Please verify admin privileges.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default gallery config
  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the Space Gallery & Polaroids to factory defaults? All custom photos and text changes in this section will be restored to original values."
      )
    ) {
      setConfig({ ...DEFAULT_GALLERY_CONFIG });
      setSavedSuccess(false);
    }
  };

  // Move photo in array
  const movePhoto = (fromIndex: number, toIndex: number) => {
    const photos = [...(config.photos || [])];
    if (toIndex < 0 || toIndex >= photos.length) return;
    const [moved] = photos.splice(fromIndex, 1);
    photos.splice(toIndex, 0, moved);
    setConfig((prev) => ({ ...prev, photos }));
  };

  // Delete photo
  const deletePhoto = (id: string) => {
    const photos = config.photos || [];
    if (photos.length <= 1) {
      alert("At least one polaroid photo should remain in the showcase.");
      return;
    }
    if (window.confirm("Remove this photo from the showcase gallery?")) {
      setConfig((prev) => ({
        ...prev,
        photos: (prev.photos || []).filter((p) => p.id !== id),
      }));
    }
  };

  // Duplicate photo
  const duplicatePhoto = (photo: PolaroidPhotoItem) => {
    const copy: PolaroidPhotoItem = {
      ...photo,
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      caption: `${photo.caption} (Copy)`,
      initialRotate: -(photo.initialRotate || 4),
    };
    setConfig((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), copy],
    }));
  };

  // Update a single photo property
  const updatePhoto = (id: string, updates: Partial<PolaroidPhotoItem>) => {
    setConfig((prev) => ({
      ...prev,
      photos: (prev.photos || []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  // Handle image upload for a new photo
  const handleNewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNewPhotoUploadError("Please select an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setNewPhotoUploadError("File size exceeds 8MB. Please use a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewPhoto((prev) => ({
        ...prev,
        src: dataUrl,
        alt: prev.alt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      }));
      setNewPhotoUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload to replace an existing photo
  const handleReplacePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingPhotoId) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("File size exceeds 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updatePhoto(replacingPhotoId, { src: dataUrl });
      setReplacingPhotoId(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle center logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG or SVG recommended for transparency).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setConfig((prev) => ({ ...prev, centerLogoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Confirm add new photo
  const handleConfirmAddPhoto = () => {
    if (!newPhoto.src?.trim()) {
      setNewPhotoUploadError("Please upload an image or provide an image URL.");
      return;
    }

    const nextId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const count = (config.photos || []).length;
    const alternatingTilt = count % 2 === 0 ? -5 : 5;

    const created: PolaroidPhotoItem = {
      id: nextId,
      src: newPhoto.src.trim(),
      caption: newPhoto.caption?.trim() || "Clinic Showcase",
      date: newPhoto.date?.trim() || "CA Smile",
      alt: newPhoto.alt?.trim() || newPhoto.caption?.trim() || "CA Smile Clinic Space",
      initialRotate: typeof newPhoto.initialRotate === "number" ? newPhoto.initialRotate : alternatingTilt,
      hoverRotate: typeof newPhoto.hoverRotate === "number" ? newPhoto.hoverRotate : 0,
      restingY: typeof newPhoto.restingY === "number" ? newPhoto.restingY : 50,
      hoverY: typeof newPhoto.hoverY === "number" ? newPhoto.hoverY : -84,
      zIndex: 10 + count,
    };

    setConfig((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), created],
    }));

    // Reset modal form
    setNewPhoto({
      src: "",
      caption: "",
      date: "",
      alt: "",
      initialRotate: -4,
      hoverRotate: 0,
      restingY: 50,
      hoverY: -84,
    });
    setNewPhotoUploadError(null);
    setIsAddModalOpen(false);
  };

  // Sync address from general clinic info
  const handleSyncClinicAddress = () => {
    if (brandConfig) {
      setConfig((prev) => ({
        ...prev,
        addressLine1: brandConfig.address || prev.addressLine1,
        addressLine2: `${brandConfig.city || ""}, ${brandConfig.state || ""} ${brandConfig.postalCode || ""}`.trim() || prev.addressLine2,
        phone: brandConfig.phone || prev.phone,
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* =================================================================== */}
      {/* 1. TOP HEADER & PRIMARY ACTIONS                                     */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                  Clinic Space Gallery & Polaroids Showcase
                </h2>
                <p className="text-sm text-zinc-500">
                  Control the interactive footer gallery section. Add, remove, rotate photos, and edit all text, address details, and logos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition shadow-sm"
              title="Reset gallery section to default CA Smile layout"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Defaults
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Polaroid Photo
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-zinc-800 disabled:opacity-50 transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Live...
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Saved Live!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Gallery Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Toast Notifications */}
        {savedSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Gallery changes saved successfully! Live website and footer are updated in real-time.
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-900 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Global Section Enable Toggle */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-3">
            <input
              id="gallery-enabled-toggle"
              type="checkbox"
              checked={config.enabled !== false}
              onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <label htmlFor="gallery-enabled-toggle" className="cursor-pointer text-sm font-semibold text-zinc-900">
              Display Space Gallery & Polaroids on Website
            </label>
          </div>
          <span className="text-xs font-medium text-zinc-500">
            {config.photos?.length || 0} active photos in stack
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. SUB-NAVIGATION TABS                                              */}
      {/* =================================================================== */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("photos")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === "photos"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Polaroid Photos ({config.photos?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("text")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === "text"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          Headings & Story
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("address")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === "address"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Address Card & Mascot
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("logo")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === "logo"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Center Brand Logo
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("styling")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeSubTab === "styling"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Palette className="h-4 w-4" />
          Background & Styling
        </button>
      </div>

      {/* =================================================================== */}
      {/* 3. SUB-TAB CONTENT                                                  */}
      {/* =================================================================== */}

      {/* TAB A: POLAROID PHOTOS MANAGER */}
      {activeSubTab === "photos" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Manage Polaroid Photos Stack
              </h3>
              <p className="text-xs text-zinc-500">
                Reorder cards, replace or upload photos, set captions, location tags, and adjust resting tilt angles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
            >
              <Plus className="h-4 w-4" />
              Add Another Photo
            </button>
          </div>

          {/* Hidden replacement file input */}
          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplacePhotoUpload}
          />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(config.photos || []).map((photo, index) => {
              const isExpanded = expandedPhotoId === photo.id;

              return (
                <div
                  key={photo.id}
                  className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                >
                  {/* Photo Header & Order Controls */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-bold text-white">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-700 truncate max-w-[140px]">
                        {photo.caption || "Untitled Photo"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move Left / Up */}
                      <button
                        type="button"
                        onClick={() => movePhoto(index, index - 1)}
                        disabled={index === 0}
                        title="Move Left in stack"
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 transition"
                      >
                        <MoveLeft className="h-3.5 w-3.5" />
                      </button>

                      {/* Move Right / Down */}
                      <button
                        type="button"
                        onClick={() => movePhoto(index, index + 1)}
                        disabled={index === (config.photos || []).length - 1}
                        title="Move Right in stack"
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 transition"
                      >
                        <MoveRight className="h-3.5 w-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => duplicatePhoto(photo)}
                        title="Duplicate this photo"
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deletePhoto(photo.id)}
                        title="Delete photo"
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Photo Thumbnail + Replace Overlay */}
                  <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-900 group/img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt || photo.caption}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover/img:scale-105"
                    />

                    {/* Tilt Badge */}
                    <div className="absolute top-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur">
                      Tilt: {photo.initialRotate ?? 0}°
                    </div>

                    {/* Change Photo Overlay Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition duration-200">
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingPhotoId(photo.id);
                          replaceFileInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow hover:bg-zinc-100"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Replace Image
                      </button>
                    </div>
                  </div>

                  {/* Main Inputs: Caption & Subtitle / Tag */}
                  <div className="mt-3 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Caption / Title (displayed on chin)
                      </label>
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => updatePhoto(photo.id, { caption: e.target.value })}
                        placeholder="e.g. The Clinic Space"
                        className="w-full rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                          Location / Tag
                        </label>
                        <input
                          type="text"
                          value={photo.date || ""}
                          onChange={(e) => updatePhoto(photo.id, { date: e.target.value })}
                          placeholder="e.g. Bilimora"
                          className="w-full rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                          Alt Description
                        </label>
                        <input
                          type="text"
                          value={photo.alt || ""}
                          onChange={(e) => updatePhoto(photo.id, { alt: e.target.value })}
                          placeholder="e.g. Treatment Suite"
                          className="w-full rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                    </div>

                    {/* Direct Image URL input */}
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Direct Image URL or Path
                      </label>
                      <input
                        type="text"
                        value={photo.src}
                        onChange={(e) => updatePhoto(photo.id, { src: e.target.value })}
                        placeholder="/images/... or https://..."
                        className="w-full rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 font-mono focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 truncate"
                      />
                    </div>

                    {/* Collapsible Advanced Tilt & Height Physics */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedPhotoId(isExpanded ? null : photo.id)}
                        className="flex items-center justify-between w-full text-[11px] font-medium text-zinc-500 hover:text-zinc-900 py-1"
                      >
                        <span className="flex items-center gap-1">
                          <SlidersHorizontal className="h-3 w-3" />
                          Tilt & Spring Controls
                        </span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-3 rounded-xl bg-zinc-50 p-3 border border-zinc-200/70 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] text-zinc-600 mb-1">
                              <span>Resting Tilt Angle</span>
                              <span className="font-mono font-semibold">{photo.initialRotate ?? 0}°</span>
                            </div>
                            <input
                              type="range"
                              min="-15"
                              max="15"
                              step="1"
                              value={photo.initialRotate ?? 0}
                              onChange={(e) => updatePhoto(photo.id, { initialRotate: Number(e.target.value) })}
                              className="w-full accent-zinc-900 cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-zinc-600 mb-1">
                              <span>Hover Lift Angle</span>
                              <span className="font-mono font-semibold">{photo.hoverRotate ?? 0}°</span>
                            </div>
                            <input
                              type="range"
                              min="-10"
                              max="10"
                              step="1"
                              value={photo.hoverRotate ?? 0}
                              onChange={(e) => updatePhoto(photo.id, { hoverRotate: Number(e.target.value) })}
                              className="w-full accent-zinc-900 cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-zinc-600 mb-1">
                              <span>Resting Depth (Y offset)</span>
                              <span className="font-mono font-semibold">{photo.restingY ?? 50}px</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="80"
                              step="2"
                              value={photo.restingY ?? 50}
                              onChange={(e) => updatePhoto(photo.id, { restingY: Number(e.target.value) })}
                              className="w-full accent-zinc-900 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Prominent Add Card at the end */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center hover:border-zinc-400 hover:bg-zinc-100/50 transition cursor-pointer min-h-[280px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-zinc-200 text-zinc-800 mb-3">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-zinc-900">Add Another Polaroid</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                Upload from your device or paste a photo URL to extend the clinic gallery
              </p>
            </button>
          </div>
        </div>
      )}

      {/* TAB B: HEADINGS & STORY */}
      {activeSubTab === "text" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Headings & Shared Space Story
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customize the grand heading shown on the top-left and the narrative story on the top-right.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Headline Line 1
              </label>
              <input
                type="text"
                value={config.headingLine1 ?? ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, headingLine1: e.target.value }))}
                placeholder="Drop by for a smile."
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <p className="text-[11px] text-zinc-400 mt-1">First line of the grand title</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Headline Line 2
              </label>
              <input
                type="text"
                value={config.headingLine2 ?? ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, headingLine2: e.target.value }))}
                placeholder="At anytime."
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Second line of the grand title</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Shared Space Narrative Story (Right Paragraph)
            </label>
            <textarea
              rows={4}
              value={config.description ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="... more than that — it is what builds trust and comfort. A space where we welcome each patient with genuine warmth..."
              className="w-full rounded-xl border border-zinc-200 p-3.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 leading-relaxed"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Characters: {(config.description || "").length} • Displays on the right side of the section
            </p>
          </div>
        </div>
      )}

      {/* TAB C: ADDRESS CARD & MASCOT */}
      {activeSubTab === "address" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Floating Address Card & Bird Messenger Mascot
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure the dark translucent glass card centered above the photos, including clinic address, phone, and mascot sticker.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncClinicAddress}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition"
            >
              <MapPin className="h-3.5 w-3.5" />
              Sync from General Clinic Info
            </button>
          </div>

          {/* Visibility Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-zinc-100 py-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showAddressCard !== false}
                onChange={(e) => setConfig((prev) => ({ ...prev, showAddressCard: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs font-semibold text-zinc-900">
                Show Floating Address Card
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showMascot !== false}
                onChange={(e) => setConfig((prev) => ({ ...prev, showMascot: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs font-semibold text-zinc-900">
                Show Cute Bird Messenger Mascot Sticker
              </span>
            </label>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Address Line 1 (Bold Header)
              </label>
              <input
                type="text"
                value={config.addressLine1 ?? ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="1st Floor, Labdhi Arcade, Above HDFC Bank"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Address Line 2 (Sub-location & City)
              </label>
              <input
                type="text"
                value={config.addressLine2 ?? ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Convent Rd, Bilimora, Gujarat 396321"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Contact Phone Number (Click-to-Call)
              </label>
              <input
                type="text"
                value={config.phone ?? ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 72260 98074"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB D: CENTER BRAND LOGO */}
      {activeSubTab === "logo" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Center Brand Logo
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customize the clinic emblem positioned directly between the address card and the polaroid stack.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer border-b border-zinc-100 pb-4">
            <input
              type="checkbox"
              checked={config.showCenterLogo !== false}
              onChange={(e) => setConfig((prev) => ({ ...prev, showCenterLogo: e.target.checked }))}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span className="text-xs font-semibold text-zinc-900">
              Display Center Logo in Showcase
            </span>
          </label>

          {/* Hidden Logo Input */}
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Logo Preview on Dark Background */}
            <div className="rounded-2xl bg-[#0d0e12] p-8 border border-white/10 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
              {config.centerLogoUrl ? (
                <div className="relative inline-flex items-center justify-center">
                  {config.centerLogoGlow !== false && (
                    <>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-6 rounded-full blur-2xl animate-logo-halo"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(255,255,255,0.75) 0%, rgba(56,189,248,0.45) 30%, rgba(45,212,191,0.2) 60%, transparent 75%)",
                        }}
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-1 -right-2 z-20 animate-sparkle-glint"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-3.5 w-3.5 text-cyan-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                        >
                          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                        </svg>
                      </div>
                    </>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.centerLogoUrl}
                    alt={config.centerLogoAlt || "Center Logo"}
                    style={{ height: `${config.centerLogoHeight || 60}px` }}
                    className={`w-auto object-contain relative z-10 ${
                      config.centerLogoGlow !== false
                        ? "animate-logo-glow-breathe"
                        : "drop-shadow"
                    }`}
                  />
                </div>
              ) : (
                <span className="text-xs text-zinc-500">No logo specified</span>
              )}
              <span className="text-[10px] text-zinc-500 mt-4 relative z-10">
                Height: {config.centerLogoHeight || 60}px • Dark background preview {config.centerLogoGlow !== false ? "• Glow & Dim Loop Active" : ""}
              </span>
            </div>

            {/* Logo Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Upload Logo Image (PNG / SVG with White/Transparent Art)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 shadow-sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Select Logo File
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        centerLogoUrl: "/images/ca-smile-logo-white-solid.png",
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50"
                  >
                    Use CA Smile Official White Logo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Logo URL or Path
                </label>
                <input
                  type="text"
                  value={config.centerLogoUrl ?? ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, centerLogoUrl: e.target.value }))}
                  placeholder="/images/ca-smile-logo-white-solid.png"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-800 font-mono focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                  <span>Logo Height</span>
                  <span className="font-mono">{config.centerLogoHeight || 60}px</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="120"
                  step="2"
                  value={config.centerLogoHeight || 60}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, centerLogoHeight: Number(e.target.value) }))
                  }
                  className="w-full accent-zinc-900 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Logo Alt Description
                </label>
                <input
                  type="text"
                  value={config.centerLogoAlt ?? ""}
                  onChange={(e) => setConfig((prev) => ({ ...prev, centerLogoAlt: e.target.value }))}
                  placeholder="CA Smile Multispeciality Dental Clinic"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-800 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div>
                  <label className="text-xs font-semibold text-zinc-800 block">
                    Glow &amp; Dim Breathing Loop
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Smoothly animates the center logo with a luminous dental glow aura that brightens and dims in an endless loop
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.centerLogoGlow !== false}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, centerLogoGlow: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer accent-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: STYLING & COLORS */}
      {activeSubTab === "styling" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Section Background & Color Palette
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Customize the section background tone and headline typography colors.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Background Color Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, backgroundColor: preset.value }))}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                      config.backgroundColor === preset.value
                        ? "border-zinc-900 bg-zinc-900 text-white shadow"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.value }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Custom Background Hex Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor || "#0d0e12"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor || "#0d0e12"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-mono text-zinc-900 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Headline Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.textColor || "#ffffff"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.textColor || "#ffffff"}
                    onChange={(e) => setConfig((prev) => ({ ...prev, textColor: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-mono text-zinc-900 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. INTERACTIVE LIVE PREVIEW BOX                                     */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-3.5 gap-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-zinc-700" />
            <span className="text-xs font-bold text-zinc-900">
              Interactive Live Preview
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              Live Spring Physics Active
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Hover or click polaroid cards to test elevation</span>
            <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  previewDevice === "desktop"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition ${
                  previewDevice === "mobile"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Live Container with Responsive Frame */}
        <div className="p-4 sm:p-6 bg-zinc-950/90 flex justify-center overflow-x-auto">
          <div
            className={`w-full transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-[420px] rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl" : "max-w-full"
            }`}
          >
            <FooterPolaroidsShowcase previewConfig={config} />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. ADD NEW PHOTO MODAL DIALOG                                       */}
      {/* =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            {/* Hidden Input for Modal Image File */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleNewPhotoUpload}
            />

            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white">
                  <Plus className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  Add New Polaroid Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Photo Upload Zone / Preview */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Select Photo (from Computer) or Enter Image URL
                </label>

                {newPhoto.src ? (
                  <div className="relative aspect-[4/3] w-full max-w-xs mx-auto overflow-hidden rounded-xl bg-zinc-900 shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newPhoto.src}
                      alt={newPhoto.alt || "Preview"}
                      className="h-full w-full object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-semibold text-xs opacity-0 hover:opacity-100 transition"
                    >
                      Click to Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 p-8 text-center hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer transition"
                  >
                    <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                    <p className="text-xs font-bold text-zinc-800">
                      Click to choose an image from your computer
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      PNG, JPG, or WebP up to 8MB
                    </p>
                  </div>
                )}

                {newPhotoUploadError && (
                  <p className="text-xs font-medium text-rose-600 mt-2">
                    {newPhotoUploadError}
                  </p>
                )}
              </div>

              {/* Or Direct URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Or Paste Direct Image URL
                </label>
                <input
                  type="text"
                  value={newPhoto.src ?? ""}
                  onChange={(e) => setNewPhoto((prev) => ({ ...prev, src: e.target.value }))}
                  placeholder="https://... or /images/..."
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-800 font-mono focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Caption & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Photo Caption (Title on chin)
                  </label>
                  <input
                    type="text"
                    value={newPhoto.caption ?? ""}
                    onChange={(e) => setNewPhoto((prev) => ({ ...prev, caption: e.target.value }))}
                    placeholder="e.g. Modern Dental Suite"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Tag / Location
                  </label>
                  <input
                    type="text"
                    value={newPhoto.date ?? ""}
                    onChange={(e) => setNewPhoto((prev) => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. Bilimora"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={newPhoto.alt ?? ""}
                  onChange={(e) => setNewPhoto((prev) => ({ ...prev, alt: e.target.value }))}
                  placeholder="Describe what is visible in the photo"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Initial Rotation Tilt */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                  <span>Resting Tilt Angle</span>
                  <span className="font-mono">{newPhoto.initialRotate ?? -4}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  step="1"
                  value={newPhoto.initialRotate ?? -4}
                  onChange={(e) => setNewPhoto((prev) => ({ ...prev, initialRotate: Number(e.target.value) }))}
                  className="w-full accent-zinc-900 cursor-pointer"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAddPhoto}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Add to Showcase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicBrandingGalleryManager;
