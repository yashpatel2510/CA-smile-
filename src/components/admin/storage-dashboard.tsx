"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  HardDrive,
  Database,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  Save,
  Download,
  Trash2,
  FileText,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  Archive,
  Info,
  Layers,
  Code2,
  Copy,
  Check,
  Play,
  History,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StorageRetentionConfig } from "@/lib/storage-retention-store";
import { DatabaseQueryItem } from "@/lib/database/query-catalog";

export function StorageDashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Settings form state
  const [retentionSettings, setRetentionSettings] = useState<Partial<StorageRetentionConfig>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Manual cleanup state
  const [manualType, setManualType] = useState<string>("whatsapp_bookings");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Modal delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [archiving, setArchiving] = useState(false);

  // Query Inspector state
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<DatabaseQueryItem | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/storage-management");
      if (!res.ok) throw new Error("Failed to load storage metrics");
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
        setRetentionSettings(resData.retentionConfig);
        if (resData.queriesCatalog?.length > 0 && !selectedQuery) {
          setSelectedQuery(resData.queriesCatalog[0]);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load metrics", "error");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [selectedQuery]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => fetchMetrics(), 60000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast("Only Clinic Owners (Admin) may save retention policies.", "error");
      return;
    }
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/storage-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retentionSettings),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("Storage retention policies saved successfully.");
        fetchMetrics();
      } else {
        showToast(resData.message || "Failed to save settings", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Preview
  const handlePreviewRecords = async () => {
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/storage-management/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataType: manualType,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setPreviewData(resData);
        showToast(`Found ${resData.recordsFound} eligible records.`);
      } else {
        showToast(resData.message || "Failed to preview records", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setPreviewing(false);
    }
  };

  // Handle Archive & Delete Execution
  const handleExecuteArchive = async (deleteAfter: boolean) => {
    if (deleteAfter && confirmInput !== "DELETE") {
      showToast("You must type DELETE in capital letters to confirm permanent cleanup.", "error");
      return;
    }
    setArchiving(true);
    try {
      const res = await fetch("/api/admin/storage-management/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataType: manualType,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          deleteAfterArchive: deleteAfter,
          confirmation: confirmInput,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message);
        setDeleteModalOpen(false);
        setConfirmInput("");
        setPreviewData(null);
        fetchMetrics();
      } else {
        showToast(resData.message || "Archive operation failed", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setArchiving(false);
    }
  };

  const copyQuerySql = (query: DatabaseQueryItem) => {
    navigator.clipboard.writeText(query.sql);
    setCopiedQueryId(query.id);
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  if (loading && !data) {
    return (
      <Card className="border border-brand-border bg-brand-surface shadow-md">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-primary" />
          <h3 className="mt-4 text-base font-bold text-brand-text">
            Loading Storage &amp; Retention Monitor...
          </h3>
          <p className="mt-1 text-xs text-brand-muted">
            Checking PostgreSQL storage quotas, retention triggers, and table statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.metrics;
  const retention = retentionSettings.retentionPolicies || data?.retentionConfig?.retentionPolicies;
  const forecast = data?.forecast;

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. HEADER & OVERVIEW BANNER                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-brand-border bg-gradient-to-r from-brand-primary/10 via-brand-surface to-brand-accent/20 p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-brand-text">
                Database Storage Management
              </h1>
              <p className="text-xs text-brand-muted sm:text-sm">
                Monitor database usage, archive older data, and manage storage safely.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="border-brand-border bg-white text-xs font-semibold shadow-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin text-brand-primary" : ""}`} />
            {refreshing ? "Checking..." : "Refresh Storage"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 text-xs font-medium ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-800"
              : "border-red-500/30 bg-red-50 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2 & 3. CURRENT DATABASE & STORAGE PROGRESS BAR                            */}
      {/* ========================================================================= */}
      <Card className="border-2 border-brand-border/90 bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-brand-text">
                Current Database Storage
              </CardTitle>
              <CardDescription className="text-xs">
                Physical disk quota on Supabase Free Tier (500 MB Limit)
              </CardDescription>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-bold ${
                metrics?.warningLevel === "NORMAL"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : metrics?.warningLevel === "WARNING"
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : metrics?.warningLevel === "HIGH"
                  ? "border-orange-500 bg-orange-50 text-orange-800"
                  : "border-red-500 bg-red-50 text-red-800"
              }`}
            >
              {metrics?.warningLevel === "NORMAL" && "🟢 Healthy (< 70%)"}
              {metrics?.warningLevel === "WARNING" && "🟡 Warning (70-79%)"}
              {metrics?.warningLevel === "HIGH" && "🟠 High Usage (80-89%)"}
              {metrics?.warningLevel === "CRITICAL" && "🔴 Critical (90-94%)"}
              {metrics?.warningLevel === "NEARLY_FULL" && "🔴 Database Nearly Full (95-100%)"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {/* Detailed Metric Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[10px] font-semibold text-brand-muted">Provider</span>
              <p className="mt-1 font-bold text-brand-text">{metrics?.provider || "Supabase"}</p>
              <span className="text-[10px] text-brand-muted">PostgreSQL Engine</span>
            </div>

            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[10px] font-semibold text-brand-muted">Connection</span>
              <p className="mt-1 font-bold text-emerald-600">
                {metrics?.connectionStatus === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected"}
              </p>
              <span className="text-[10px] text-brand-muted">
                {metrics?.connectionStatus === "CONNECTED" ? "Direct DB access" : "Local fallback active"}
              </span>
            </div>

            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[10px] font-semibold text-brand-muted">Storage Used</span>
              <p className="mt-1 text-base font-extrabold text-brand-text">
                {metrics?.storageUsedMb} MB
              </p>
              <span className="text-[10px] text-brand-muted">of {metrics?.storageLimitMb} MB Quota</span>
            </div>

            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[10px] font-semibold text-brand-muted">Storage Available</span>
              <p className="mt-1 text-base font-extrabold text-emerald-600">
                {metrics?.storageAvailableMb} MB
              </p>
              <span className="text-[10px] text-brand-muted">{100 - metrics?.usagePercent}% Free</span>
            </div>
          </div>

          {/* Visual Storage Progress Bar */}
          <div className="space-y-2 rounded-lg border border-brand-border/70 bg-brand-background p-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-brand-text">
                Database Storage: {metrics?.storageUsedMb} MB / {metrics?.storageLimitMb} MB
              </span>
              <span
                className={`${
                  metrics?.usagePercent >= 85
                    ? "text-red-600"
                    : metrics?.usagePercent >= 70
                    ? "text-amber-600"
                    : "text-brand-primary"
                }`}
              >
                {metrics?.usagePercent}% Used
              </span>
            </div>

            <div className="h-3.5 w-full overflow-hidden rounded-full bg-brand-border/60">
              <div
                className={`h-full transition-all duration-500 ${
                  metrics?.usagePercent >= 90
                    ? "bg-red-600"
                    : metrics?.usagePercent >= 80
                    ? "bg-orange-500"
                    : metrics?.usagePercent >= 70
                    ? "bg-amber-500"
                    : "bg-brand-primary"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, metrics?.usagePercent || 42))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-brand-muted">
              <span>Status: {metrics?.warningMessage}</span>
              <span>Last Checked: {new Date(metrics?.lastChecked).toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 4. AUTOMATIC DATA MANAGEMENT & RETENTION SETTINGS                         */}
      {/* ========================================================================= */}
      <form onSubmit={handleSaveSettings}>
        <Card className="border border-brand-border bg-brand-surface shadow-xs">
          <CardHeader className="border-b border-brand-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-brand-primary" />
                <div>
                  <CardTitle className="text-base font-bold text-brand-text">
                    Automatic Data Management &amp; Retention Policies
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure automated archiving thresholds, cleanup intervals, and table retention schedules
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold text-brand-primary">
                Configurable
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* Automatic Cleanup Switches */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-brand-border/80 bg-brand-background p-4">
                <div>
                  <span className="text-xs font-bold text-brand-text">Enable Automatic Archiving</span>
                  <p className="text-[11px] text-brand-muted">
                    Back up records before eligible cleanups occur
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRetentionSettings({
                      ...retentionSettings,
                      autoArchiveEnabled: !retentionSettings.autoArchiveEnabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    retentionSettings.autoArchiveEnabled ? "bg-brand-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      retentionSettings.autoArchiveEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-brand-border/80 bg-brand-background p-4">
                <div>
                  <span className="text-xs font-bold text-brand-text">Enable Automatic Cleanup</span>
                  <p className="text-[11px] text-brand-muted">
                    Prune verified archived records when quota threshold is reached
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRetentionSettings({
                      ...retentionSettings,
                      autoCleanupEnabled: !retentionSettings.autoCleanupEnabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    retentionSettings.autoCleanupEnabled ? "bg-brand-primary" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      retentionSettings.autoCleanupEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Threshold and Frequency Controls */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Run cleanup when storage reaches:
                </label>
                <select
                  value={retentionSettings.thresholdPercent || 85}
                  onChange={(e) =>
                    setRetentionSettings({
                      ...retentionSettings,
                      thresholdPercent: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-brand-border bg-white p-2.5 text-xs text-brand-text shadow-xs"
                >
                  <option value={70}>70% Capacity (Proactive)</option>
                  <option value={80}>80% Capacity</option>
                  <option value={85}>85% Capacity (Recommended Default)</option>
                  <option value={90}>90% Capacity (High)</option>
                  <option value={95}>95% Capacity (Critical)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Cleanup Frequency:
                </label>
                <select
                  value={retentionSettings.cleanupFrequency || "weekly"}
                  onChange={(e) =>
                    setRetentionSettings({
                      ...retentionSettings,
                      cleanupFrequency: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-brand-border bg-white p-2.5 text-xs text-brand-text shadow-xs"
                >
                  <option value="daily">Daily Cron Check</option>
                  <option value="weekly">Weekly Check (Default)</option>
                  <option value="monthly">Monthly Check</option>
                </select>
              </div>
            </div>

            {/* Entity Retention Rules */}
            <div className="rounded-lg border border-brand-border/70 bg-brand-background p-4 space-y-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-brand-text">
                Data Retention Rules by Category
              </span>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-text">
                    Keep Completed Appointments For:
                  </label>
                  <select
                    value={retention?.appointments || "1_YEAR"}
                    onChange={(e) =>
                      setRetentionSettings({
                        ...retentionSettings,
                        retentionPolicies: {
                          ...retentionSettings.retentionPolicies!,
                          appointments: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-brand-border bg-white p-2 text-xs text-brand-text"
                  >
                    <option value="90_DAYS">90 Days</option>
                    <option value="6_MONTHS">6 Months</option>
                    <option value="1_YEAR">1 Year (Recommended)</option>
                    <option value="2_YEARS">2 Years</option>
                    <option value="FOREVER">Forever (Do not archive)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-text">
                    Keep WhatsApp Intake Messages:
                  </label>
                  <select
                    value={retention?.whatsapp_bookings || "90_DAYS"}
                    onChange={(e) =>
                      setRetentionSettings({
                        ...retentionSettings,
                        retentionPolicies: {
                          ...retentionSettings.retentionPolicies!,
                          whatsapp_bookings: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-brand-border bg-white p-2 text-xs text-brand-text"
                  >
                    <option value="30_DAYS">30 Days</option>
                    <option value="60_DAYS">60 Days</option>
                    <option value="90_DAYS">90 Days (Recommended)</option>
                    <option value="6_MONTHS">6 Months</option>
                    <option value="1_YEAR">1 Year</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-text">
                    Keep System Audit Logs For:
                  </label>
                  <select
                    value={retention?.system_logs || "30_DAYS"}
                    onChange={(e) =>
                      setRetentionSettings({
                        ...retentionSettings,
                        retentionPolicies: {
                          ...retentionSettings.retentionPolicies!,
                          system_logs: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-lg border border-brand-border bg-white p-2 text-xs text-brand-text"
                  >
                    <option value="7_DAYS">7 Days</option>
                    <option value="30_DAYS">30 Days (Recommended)</option>
                    <option value="60_DAYS">60 Days</option>
                    <option value="90_DAYS">90 Days</option>
                    <option value="1_YEAR">1 Year</option>
                  </select>
                </div>
              </div>

              {/* Patient Protection Notice */}
              <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900">
                <Lock className="h-4 w-4 shrink-0 text-blue-700" />
                <span>
                  <strong>🔒 Patient Records &amp; Clinical Notes are Strictly Protected:</strong> Patient demographics, medical histories, and clinical services are locked from automated deletion. Clinical retention complies with healthcare legal record standards.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-brand-border/60 pt-4">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={savingSettings || !isAdmin}
                className="gap-2 font-semibold shadow-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{savingSettings ? "Saving..." : "Save Storage Settings"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* ========================================================================= */}
      {/* 5. MANUAL CLEANUP & ARCHIVE INTERFACE                                     */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Archive className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base font-bold text-brand-text">Manual Cleanup &amp; Archive</CardTitle>
                <CardDescription className="text-xs">
                  Filter by date range, preview candidate records, and create verified backups prior to deletion
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-brand-muted">
              Atomic: Backup → Verify → Delete
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text">Data Category:</label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white p-2.5 text-xs text-brand-text shadow-xs"
              >
                <option value="whatsapp_bookings">WhatsApp Booking Records</option>
                <option value="appointments">Completed / Cancelled Appointments</option>
                <option value="system_logs">System &amp; Audit Logs</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text">From Date (Optional):</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text">Cutoff Date (To Date):</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border/70 bg-brand-background p-3.5">
            <div className="text-xs">
              {previewData ? (
                <span>
                  Candidates Found: <strong>{previewData.recordsFound} records</strong> (~{previewData.estimatedStorageMb} MB estimated)
                </span>
              ) : (
                <span className="text-brand-muted">Click preview to inspect matching records</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviewRecords}
                disabled={previewing}
                className="text-xs"
              >
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                {previewing ? "Scanning..." : "Preview Records"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleExecuteArchive(false)}
                disabled={archiving || !isAdmin}
                className="text-xs border-brand-primary/50 text-brand-primary"
              >
                <Archive className="mr-1.5 h-3.5 w-3.5" />
                {archiving ? "Archiving..." : "Archive Only (Keep DB)"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmInput("");
                  setDeleteModalOpen(true);
                }}
                disabled={archiving || !isAdmin}
                className="border-red-300 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Archive &amp; Delete
              </Button>
            </div>
          </div>

          {/* Records Preview Table */}
          {previewData?.previewRecords && (
            <div className="rounded-lg border border-brand-border/70 overflow-hidden">
              <div className="bg-brand-background/60 p-2.5 text-[11px] font-bold text-brand-text border-b border-brand-border">
                Showing {previewData.previewRecords.length} of {previewData.recordsFound} Candidate Records
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-background/40 text-[10px] uppercase text-brand-muted border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-2">Record ID</th>
                    <th className="px-4 py-2">Created Date</th>
                    <th className="px-4 py-2">Payload Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {previewData.previewRecords.map((r: any) => (
                    <tr key={r.id} className="hover:bg-brand-accent/10">
                      <td className="px-4 py-2 font-mono text-[11px] font-bold">{r.id}</td>
                      <td className="px-4 py-2 text-brand-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-brand-text truncate max-w-xs">{JSON.stringify(r.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 6. TABLE STORAGE BREAKDOWN                                                */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base font-bold text-brand-text">
                  Table Storage Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Storage distribution across schema models and configured retention status
                </CardDescription>
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-muted">5 Primary Tables</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border bg-brand-background/60 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <tr>
                  <th className="px-5 py-3">Table Name</th>
                  <th className="px-4 py-3">Estimated Size</th>
                  <th className="px-4 py-3">Active Records</th>
                  <th className="px-4 py-3">Retention Policy</th>
                  <th className="px-4 py-3">Auto Cleanup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {data?.tableBreakdown?.map((tb: any) => (
                  <tr key={tb.table} className="hover:bg-brand-accent/10 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono font-bold text-brand-text">{tb.table}</div>
                      <div className="text-[10px] text-brand-muted">{tb.name}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-brand-text">
                      <div className="flex items-center gap-2">
                        <span>{tb.sizeMb} MB</span>
                        <div className="h-1.5 w-16 rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-brand-primary"
                            style={{ width: `${Math.min(100, (tb.sizeMb / 150) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-text">{tb.records}</td>
                    <td className="px-4 py-3">
                      {tb.isProtected ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                          <Lock className="h-3 w-3" /> Forever (Protected)
                        </span>
                      ) : (
                        <span className="font-medium text-brand-text">{tb.retention}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tb.autoCleanup ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          OFF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 7. DATABASE QUERIES & DIAGNOSTICS INSPECTOR                               */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Code2 className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base font-bold text-brand-text">
                  Database Queries &amp; Diagnostics Inspector
                </CardTitle>
                <CardDescription className="text-xs">
                  Complete library of SQL queries used by the Smile Dental Clinic platform
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-semibold">
              {data?.queriesCatalog?.length || 0} SQL Queries
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {/* Query Selector Tabs */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {data?.queriesCatalog?.map((q: DatabaseQueryItem) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedQuery(q)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selectedQuery?.id === q.id
                    ? "border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary"
                    : "border-brand-border bg-brand-background hover:border-brand-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-primary">
                    {q.category.replace("_", " ")}
                  </span>
                  <Badge variant="outline" className="text-[9px] py-0">
                    {q.safetyLevel === "SAFE_READONLY" ? "Read-Only" : "Admin"}
                  </Badge>
                </div>
                <div className="mt-1 font-bold text-xs text-brand-text truncate">{q.title}</div>
              </button>
            ))}
          </div>

          {/* Active Query Details */}
          {selectedQuery && (
            <div className="space-y-3 rounded-lg border border-brand-border bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Target: {selectedQuery.targetDatabase}
                  </span>
                  <h4 className="font-heading text-sm font-bold text-white">{selectedQuery.title}</h4>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyQuerySql(selectedQuery)}
                  className="border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
                >
                  {copiedQueryId === selectedQuery.id ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy SQL
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-slate-300">{selectedQuery.description}</p>

              <pre className="overflow-x-auto rounded bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
                {selectedQuery.sql}
              </pre>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Expected Result: {selectedQuery.expectedResult}</span>
                <span className="font-semibold text-emerald-400">Verified Compatible</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 8. STORAGE FORECAST & CLEANUP HISTORY                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Storage Forecast Card */}
        <Card className="border border-brand-border bg-brand-surface shadow-xs">
          <CardHeader className="border-b border-brand-border/60 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-primary" />
              <CardTitle className="text-sm font-bold">Storage Forecast &amp; Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-brand-border bg-brand-background p-3">
                <span className="text-[10px] text-brand-muted font-semibold">Monthly Growth</span>
                <p className="mt-1 text-sm font-extrabold text-brand-text">
                  {forecast?.hasForecast ? `+${forecast.monthlyGrowthMb} MB / mo` : "Baseline"}
                </p>
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-background p-3">
                <span className="text-[10px] text-brand-muted font-semibold">Estimated Headroom</span>
                <p className="mt-1 text-sm font-extrabold text-emerald-600">
                  {forecast?.hasForecast ? `~${forecast.monthsUntilLimit} Months` : "Ample"}
                </p>
              </div>
            </div>

            <p className="text-brand-muted text-[11px] leading-relaxed">{forecast?.message}</p>

            {/* Storage History Data Points */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase text-brand-muted">Recent Snapshots</span>
              <div className="divide-y divide-brand-border/60 rounded border border-brand-border">
                {data?.retentionConfig?.storageHistory?.map((snap: any) => (
                  <div key={snap.date} className="flex items-center justify-between p-2 text-[11px]">
                    <span className="text-brand-muted">{snap.date}</span>
                    <span className="font-bold text-brand-text">
                      {snap.storageMb} MB ({snap.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Archives & Cleanup History */}
        <Card className="border border-brand-border bg-brand-surface shadow-xs">
          <CardHeader className="border-b border-brand-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-brand-primary" />
                <CardTitle className="text-sm font-bold">Archived Data Vault</CardTitle>
              </div>
              <span className="text-[10px] text-brand-muted">{data?.savedArchives?.length || 0} Files</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            {data?.savedArchives && data.savedArchives.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.savedArchives.map((arc: any) => (
                  <div
                    key={arc.id}
                    className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-background p-3"
                  >
                    <div>
                      <div className="font-bold text-brand-text truncate max-w-xs">{arc.fileName}</div>
                      <div className="text-[10px] text-brand-muted">
                        Size: {arc.sizePretty} · Created: {new Date(arc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/api/admin/storage-management/download/${arc.id}?format=json`}
                        download
                        className="rounded border border-brand-border bg-white px-2 py-1 text-[10px] font-semibold text-brand-text shadow-xs hover:bg-brand-accent/20"
                      >
                        JSON
                      </a>
                      <a
                        href={`/api/admin/storage-management/download/${arc.id}?format=csv`}
                        download
                        className="rounded border border-brand-border bg-white px-2 py-1 text-[10px] font-semibold text-brand-text shadow-xs hover:bg-brand-accent/20"
                      >
                        CSV
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-brand-border p-6 text-center text-brand-muted text-xs">
                No offline archives generated yet. Use manual cleanup above to create verified backups.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 9. PERMANENT DELETE CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Permanently Archive &amp; Delete Data?
                </h3>
                <p className="text-xs text-red-700">Atomic Workflow: Backup → Verify → Delete</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div>
                <span className="font-semibold text-slate-600">Data Category: </span>
                <span className="font-bold text-slate-900">{manualType}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Action: </span>
                <span className="text-slate-800">
                  Create verified archive file on server disk, then permanently remove active records from PostgreSQL.
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Type <strong className="text-red-600">DELETE</strong> to confirm permanent deletion:
              </label>
              <Input
                type="text"
                placeholder="DELETE"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="border-red-300 font-mono text-sm tracking-wider uppercase focus:border-red-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={archiving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleExecuteArchive(true)}
                disabled={confirmInput !== "DELETE" || archiving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {archiving ? "Archiving & Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
