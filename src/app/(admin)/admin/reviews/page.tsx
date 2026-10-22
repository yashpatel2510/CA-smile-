"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Settings,
  Sun,
  Moon,
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
  ClinicReview,
  GoogleReviewsConfig,
  ReviewStatus,
  ReviewSource,
} from "@/types/reviews";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ClinicReview[]>([]);
  const [googleConfig, setGoogleConfig] = useState<GoogleReviewsConfig | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "ALL" | "APPROVED" | "PENDING" | "GOOGLE"
  >("ALL");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    authorName: "",
    rating: 5,
    treatment: "General Consultation",
    comment: "",
    source: "GOOGLE" as ReviewSource,
    status: "APPROVED" as ReviewStatus,
    clinicResponse: "",
  });

  // Google Profile Settings modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    businessName: "",
    googleMapsUrl: "",
    placeId: "",
    googleRating: 4.9,
    totalReviewsCount: 194,
    autoApprove: true,
    apiKey: "",
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [placeIdInput, setPlaceIdInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [updatingTheme, setUpdatingTheme] = useState(false);

  // Load reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.googleConfig) {
          setGoogleConfig(data.googleConfig);
          setPlaceIdInput(data.googleConfig.placeId || "");
        }
        setIsDarkMode(Boolean(data.darkMode ?? data.googleConfig?.darkMode ?? false));
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Toggle Review Section Dark Mode
  const handleToggleDarkMode = async () => {
    try {
      setUpdatingTheme(true);
      const newMode = !isDarkMode;
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode: newMode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsDarkMode(newMode);
        setStatusMessage({
          type: "success",
          text: `Review page theme updated to ${newMode ? "Dark Mode 🌙" : "Light Mode ☀️"}. Changes are live!`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to update review theme.",
        });
      }
    } catch (err) {
      console.error("Failed to toggle review dark mode:", err);
    } finally {
      setUpdatingTheme(false);
    }
  };

  // One-click Google Reviews Sync
  const handleSyncGoogleReviews = async () => {
    try {
      setSyncingGoogle(true);
      setStatusMessage(null);

      const res = await fetch("/api/reviews/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: placeIdInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text:
            data.message ||
            `Google Business reviews synchronized! ${data.syncedCount} new verified review(s) imported.`,
        });
        await fetchReviews();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to sync Google reviews.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Network error syncing Google reviews.",
      });
    } finally {
      setSyncingGoogle(false);
    }
  };

  // Open Google Config Modal
  const handleOpenConfigModal = () => {
    if (googleConfig) {
      setConfigForm({
        businessName: googleConfig.businessName || "Dr. Preeti Shah Dental Clinic",
        googleMapsUrl:
          googleConfig.googleMapsUrl || "https://share.google/KRr7QvSMEB4CjYaYN",
        placeId: googleConfig.placeId || "/g/11kqclnrjh",
        googleRating: googleConfig.googleRating || 4.9,
        totalReviewsCount: googleConfig.totalReviewsCount || 194,
        autoApprove: googleConfig.autoApproveGoogleReviews ?? true,
        apiKey: googleConfig.apiKey || "",
      });
    }
    setIsConfigModalOpen(true);
  };

  // Save Google Config
  const handleSaveGoogleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await fetch("/api/reviews/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: "Google Business profile updated and reviews synced successfully!",
        });
        if (data.googleConfig) {
          setGoogleConfig(data.googleConfig);
        }
        setIsConfigModalOpen(false);
        await fetchReviews();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to update Google profile settings.",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Network error updating Google settings.",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  // Toggle Approve / Unapprove
  const handleToggleApproval = async (review: ClinicReview) => {
    const newStatus: ReviewStatus =
      review.status === "APPROVED" ? "PENDING_APPROVAL" : "APPROVED";
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id ? { ...r, status: newStatus } : r
          )
        );
        setStatusMessage({
          type: "success",
          text: `Review by ${review.authorName} is now ${newStatus === "APPROVED" ? "Approved & Live on Website" : "Hidden (Pending Approval)"}.`,
        });
      }
    } catch (err) {
      console.error("Failed to toggle review approval:", err);
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: string, author: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the review by "${author}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setStatusMessage({
          type: "success",
          text: `Review by ${author} was deleted successfully.`,
        });
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (review: ClinicReview) => {
    setEditingReviewId(review.id);
    setFormState({
      authorName: review.authorName,
      rating: review.rating,
      treatment: review.treatment || "General Consultation",
      comment: review.comment,
      source: review.source,
      status: review.status,
      clinicResponse: review.clinicResponse || "",
    });
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingReviewId(null);
    setFormState({
      authorName: "",
      rating: 5,
      treatment: "General Dental Care",
      comment: "",
      source: "GOOGLE",
      status: "APPROVED",
      clinicResponse: "",
    });
    setIsModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.authorName || !formState.comment) return;

    try {
      if (editingReviewId) {
        // Update existing
        const res = await fetch(`/api/reviews/${editingReviewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState),
        });
        const data = await res.json();
        if (data.success) {
          setReviews((prev) =>
            prev.map((r) => (r.id === editingReviewId ? data.review : r))
          );
          setStatusMessage({
            type: "success",
            text: `Review by ${formState.authorName} updated successfully.`,
          });
          setIsModalOpen(false);
        }
      } else {
        // Create new
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formState),
        });
        const data = await res.json();
        if (data.success) {
          setReviews((prev) => [data.review, ...prev]);
          setStatusMessage({
            type: "success",
            text: `New review by ${formState.authorName} created successfully!`,
          });
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save review:", err);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.treatment &&
        r.treatment.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === "APPROVED") return r.status === "APPROVED";
    if (selectedFilter === "PENDING") return r.status === "PENDING_APPROVAL";
    if (selectedFilter === "GOOGLE") return r.source === "GOOGLE";
    return true;
  });

  const totalApproved = reviews.filter((r) => r.status === "APPROVED").length;
  const totalPending = reviews.filter(
    (r) => r.status === "PENDING_APPROVAL"
  ).length;
  const totalGoogle = reviews.filter((r) => r.source === "GOOGLE").length;
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
              Patient Reviews &amp; Google Reputation
            </h1>
            <Badge variant="default" className="text-xs">
              Clinic Owner
            </Badge>
          </div>
          <p className="mt-1 text-xs text-brand-muted sm:text-sm">
            Curate customer feedback, approve live testimonials on the website,
            and sync directly with Google Business Profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Review Page Dark Mode Toggle Button */}
          <div className="flex items-center gap-1 rounded-clinic border border-brand-border bg-brand-surface p-1 shadow-sm">
            <button
              type="button"
              onClick={handleToggleDarkMode}
              disabled={updatingTheme}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                isDarkMode
                  ? "bg-slate-900 text-amber-300 shadow-sm ring-1 ring-amber-400/30"
                  : "text-brand-muted hover:text-brand-text"
              }`}
              title="Review Section: Dark Mode"
            >
              <Moon className="h-3.5 w-3.5 text-amber-400" />
              <span>Dark Theme</span>
            </button>
            <button
              type="button"
              onClick={handleToggleDarkMode}
              disabled={updatingTheme}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                !isDarkMode
                  ? "bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-300"
                  : "text-brand-muted hover:text-brand-text"
              }`}
              title="Review Section: Light Mode"
            >
              <Sun className="h-3.5 w-3.5 text-amber-600" />
              <span>Light Theme</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncGoogleReviews}
            disabled={syncingGoogle}
            className="h-8 gap-1.5 border-blue-300 text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncingGoogle ? "animate-spin text-blue-600" : ""}`}
            />
            <span>
              {syncingGoogle ? "Syncing Google..." : "Sync from Google"}
            </span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Review</span>
          </Button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-clinic border p-3.5 text-xs ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-brand-muted hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs font-medium text-brand-muted">
            Average Rating
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold text-brand-text">
              {averageRating}
            </span>
            <div className="flex items-center text-amber-400">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600">
            Based on {reviews.length} total reviews
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium text-brand-muted">
            Live on Website
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-emerald-600">
            {totalApproved}
          </div>
          <div className="mt-1 text-[11px] text-brand-muted">
            Approved &amp; visible to patients
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium text-brand-muted">
            Awaiting Approval
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-amber-600">
            {totalPending}
          </div>
          <div className="mt-1 text-[11px] text-amber-700/80">
            Pending moderation
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium text-brand-muted">
            Google Business Reviews
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-blue-600">
            {totalGoogle}
          </div>
          <div className="mt-1 text-[11px] text-blue-600/80">
            Imported from Google Maps
          </div>
        </Card>
      </div>

      {/* Google Business Direct Integration Card */}
      <Card className="border-blue-500/30 bg-blue-50/20 dark:border-blue-900/40 dark:bg-blue-950/20">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {/* Google G Emblem */}
              <div className="shadow-xs flex h-10 w-10 shrink-0 items-center justify-center rounded-clinic border border-blue-200 bg-white dark:border-blue-800 dark:bg-zinc-900">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-brand-text">
                    {googleConfig?.businessName || "Google Business Profile"}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-300 bg-blue-100/50 text-[10px] text-blue-800 dark:border-blue-800 dark:text-blue-300"
                  >
                    Connected
                  </Badge>
                </div>
                <p className="text-xs text-brand-muted">
                  Direct Google integration imports authentic verified reviews,
                  ratings, and customer commentary into your clinic database.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-brand-muted">
                  <span>
                    Google Rating:{" "}
                    <strong>{googleConfig?.googleRating || 4.9} ★</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Total Google Reviews:{" "}
                    <strong>{googleConfig?.totalReviewsCount || 184}</strong>
                  </span>
                  {googleConfig?.lastSyncedAt && (
                    <>
                      <span>•</span>
                      <span>
                        Last Synced:{" "}
                        {new Date(
                          googleConfig.lastSyncedAt
                        ).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 pt-2 sm:pt-0">
              {googleConfig?.googleMapsUrl && (
                <a
                  href={googleConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-clinic border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Google Listing</span>
                </a>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenConfigModal}
                className="h-8 gap-1.5 text-xs text-brand-text"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Profile Settings</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSyncGoogleReviews}
                disabled={syncingGoogle}
                className="h-8 gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncingGoogle ? "animate-spin" : ""}`}
                />
                <span>Sync Live Reviews</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter("ALL")}
            className={`rounded-clinic px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedFilter === "ALL"
                ? "shadow-xs bg-brand-primary text-brand-primary-foreground"
                : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
            }`}
          >
            All Reviews ({reviews.length})
          </button>

          <button
            onClick={() => setSelectedFilter("APPROVED")}
            className={`rounded-clinic px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedFilter === "APPROVED"
                ? "shadow-xs bg-emerald-600 text-white"
                : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
            }`}
          >
            Published &amp; Approved ({totalApproved})
          </button>

          <button
            onClick={() => setSelectedFilter("PENDING")}
            className={`rounded-clinic px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedFilter === "PENDING"
                ? "shadow-xs bg-amber-600 text-white"
                : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
            }`}
          >
            Pending Review ({totalPending})
          </button>

          <button
            onClick={() => setSelectedFilter("GOOGLE")}
            className={`rounded-clinic px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedFilter === "GOOGLE"
                ? "shadow-xs bg-blue-600 text-white"
                : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
            }`}
          >
            Google Synced ({totalGoogle})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-muted" />
          <Input
            placeholder="Search reviews, patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Reviews Cards List */}
      {filteredReviews.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-brand-muted opacity-60" />
          <div className="mt-3 text-sm font-semibold text-brand-text">
            No reviews found
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            Try adjusting your search criteria or click &ldquo;Sync from
            Google&rdquo; to import reviews.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredReviews.map((review) => {
            const isApproved = review.status === "APPROVED";
            const isGoogle = review.source === "GOOGLE";

            return (
              <Card
                key={review.id}
                className={`flex flex-col justify-between border transition-all ${
                  isApproved
                    ? "border-brand-border bg-brand-surface"
                    : "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                }`}
              >
                <CardContent className="space-y-4 p-5">
                  {/* Review Header: Author, Source Badge, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="bg-brand-primary/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold text-brand-primary">
                        {review.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-sm font-bold text-brand-text">
                            {review.authorName}
                          </span>
                          {review.verifiedPatient && (
                            <span
                              title="Verified Patient Visit"
                              className="inline-flex items-center text-emerald-600 dark:text-emerald-400"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-brand-muted">
                          <span>
                            {review.treatment || "General Clinical Care"}
                          </span>
                          <span>•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Source & Status Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      {isGoogle ? (
                        <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                          <svg className="h-3 w-3" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>Google Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                          <MessageSquare className="h-3 w-3" />
                          <span>Website Form</span>
                        </span>
                      )}

                      {isApproved ? (
                        <Badge variant="success" className="text-[10px]">
                          Approved &amp; Live
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-current"
                            : "text-zinc-200 dark:text-zinc-700"
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 text-xs font-bold text-brand-text">
                      {review.rating}.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-xs italic leading-relaxed text-brand-text">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>

                  {/* Clinic Response if present */}
                  {review.clinicResponse && (
                    <div className="rounded-clinic border border-brand-border bg-brand-background p-2.5 text-[11px]">
                      <span className="font-semibold text-brand-primary">
                        Clinic Response:
                      </span>{" "}
                      <span className="text-brand-muted">
                        {review.clinicResponse}
                      </span>
                    </div>
                  )}
                </CardContent>

                {/* Card Action Footer */}
                <div className="border-brand-border/60 bg-brand-background/40 flex items-center justify-between border-t px-5 py-3">
                  <div className="flex items-center gap-2">
                    {/* One-click Approve / Unapprove button */}
                    <Button
                      type="button"
                      size="sm"
                      variant={isApproved ? "outline" : "primary"}
                      onClick={() => handleToggleApproval(review)}
                      className="h-7 gap-1 px-2.5 text-xs"
                    >
                      {isApproved ? (
                        <>
                          <EyeOff className="h-3 w-3 text-brand-muted" />
                          <span>Unapprove / Hide</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 text-white" />
                          <span>Approve &amp; Publish</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(review)}
                      className="h-7 gap-1 px-2 text-xs"
                      title="Edit Review"
                    >
                      <Edit3 className="h-3 w-3 text-brand-muted" />
                      <span>Edit</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleDeleteReview(review.id, review.authorName)
                    }
                    className="h-7 gap-1 px-2 text-xs text-brand-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    title="Delete Review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT REVIEW MODAL                                                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg space-y-5 rounded-clinic border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-heading text-lg font-bold text-brand-text">
                {editingReviewId ? "Edit Patient Review" : "Add New Review"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-brand-muted hover:text-brand-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Patient / Reviewer Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Margaret Sullivan"
                    value={formState.authorName}
                    onChange={(e) =>
                      setFormState({ ...formState, authorName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Rating (1 to 5 Stars) *
                  </label>
                  <select
                    value={formState.rating}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        rating: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Average)</option>
                    <option value={2}>⭐⭐ (2 - Below Average)</option>
                    <option value={1}>⭐ (1 - Unsatisfactory)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Treatment / Procedure
                  </label>
                  <Input
                    placeholder="e.g. Dental Scaling & Cleaning"
                    value={formState.treatment}
                    onChange={(e) =>
                      setFormState({ ...formState, treatment: e.target.value })
                    }
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      "Teeth Cleaning",
                      "Root Canal",
                      "Teeth Whitening",
                      "Dental Implants",
                      "Dental Consultation",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setFormState({ ...formState, treatment: tag })
                        }
                        className="rounded bg-brand-surface px-1.5 py-0.5 text-[10px] text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary border border-brand-border"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Review Source
                  </label>
                  <select
                    value={formState.source}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        source: e.target.value as ReviewSource,
                      })
                    }
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="GOOGLE">Google Business Review</option>
                    <option value="WEBSITE">Website Booking Form</option>
                    <option value="VERIFIED_PATIENT">
                      In-Clinic Verified Patient
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Review Comment / Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter patient testimony..."
                  value={formState.comment}
                  onChange={(e) =>
                    setFormState({ ...formState, comment: e.target.value })
                  }
                  className="w-full rounded-clinic border border-brand-border bg-brand-background p-3 text-xs text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Publication Status
                </label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      status: e.target.value as ReviewStatus,
                    })
                  }
                  className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="APPROVED">
                    Approved &amp; Live on Website
                  </option>
                  <option value="PENDING_APPROVAL">
                    Pending Approval (Hidden)
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Clinic Official Response (Optional)
                </label>
                <Input
                  placeholder="e.g. Thank you Margaret, we appreciate your trust!"
                  value={formState.clinicResponse}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      clinicResponse: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingReviewId ? "Save Changes" : "Create Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* GOOGLE BUSINESS PROFILE SETTINGS MODAL                                   */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg space-y-5 rounded-clinic border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-clinic border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-zinc-900">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-bold text-brand-text">
                  Google Business Profile Settings
                </h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="rounded p-1 text-brand-muted hover:text-brand-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoogleConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Clinic / Business Name on Google *
                </label>
                <Input
                  required
                  placeholder="e.g. Dr. Preeti Shah Dental Clinic"
                  value={configForm.businessName}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      businessName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Google Maps / Share Profile Link *
                </label>
                <Input
                  required
                  placeholder="e.g. https://share.google/KRr7QvSMEB4CjYaYN"
                  value={configForm.googleMapsUrl}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      googleMapsUrl: e.target.value,
                    })
                  }
                />
                <p className="text-[11px] text-brand-muted">
                  Patients clicking &ldquo;Read All Google Reviews&rdquo; on the
                  website will be directed straight to this link.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Google Place ID or Knowledge Graph ID
                  </label>
                  <Input
                    placeholder="e.g. /g/11kqclnrjh or Place ID"
                    value={configForm.placeId}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        placeId: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Overall Google Rating (1.0 - 5.0)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={configForm.googleRating}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        googleRating: parseFloat(e.target.value) || 5.0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-text">
                    Google Places API Key (Optional for Automatic Live Sync)
                  </label>
                  <span className="text-[10px] text-brand-muted">
                    or set GOOGLE_PLACES_API_KEY in .env
                  </span>
                </div>
                <Input
                  type="password"
                  placeholder="AIzaSy..."
                  value={configForm.apiKey}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      apiKey: e.target.value,
                    })
                  }
                />
                <p className="text-[11px] text-brand-muted">
                  Enables real-time queries to Google Places API every time you click &ldquo;Sync Live Reviews&rdquo;.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Total Reviews on Google
                </label>
                <Input
                  type="number"
                  min="0"
                  value={configForm.totalReviewsCount}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      totalReviewsCount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2.5 rounded-clinic border border-brand-border bg-brand-background p-3">
                <input
                  type="checkbox"
                  id="autoApproveCheck"
                  checked={configForm.autoApprove}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      autoApprove: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                />
                <label
                  htmlFor="autoApproveCheck"
                  className="text-xs font-medium text-brand-text cursor-pointer"
                >
                  Auto-publish synced Google reviews directly to website
                </label>
              </div>

              <div className="flex items-center justify-between rounded-clinic border border-brand-border bg-brand-background p-3.5">
                <div>
                  <div className="text-xs font-semibold text-brand-text flex items-center gap-1.5">
                    {isDarkMode ? (
                      <Moon className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-500" />
                    )}
                    <span>Review Section Dark Theme</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Render patient testimonials on the website in sleek dark mode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? "bg-purple-600" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfigModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingConfig}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {savingConfig ? "Saving..." : "Save & Sync"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
