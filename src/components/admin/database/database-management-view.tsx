"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Database,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  HardDrive,
  FileSpreadsheet,
  FileText,
  Save,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  Zap,
  Trash2,
  Settings,
  AlertCircle,
  Archive,
  Wrench,
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
import { BackupHistoryItem, DatabaseBackupConfig } from "@/lib/database/database-backup-store";
import { HealthLogEntry } from "@/lib/database/health-logger";

export function DatabaseManagementView() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Database Connection Test State
  const [testingPrimary, setTestingPrimary] = useState(false);
  const [primaryTestResult, setPrimaryTestResult] = useState<{
    status: string;
    responseTimeMs?: number | null;
    message?: string;
  } | null>(null);

  // Health Logs State
  const [healthLogs, setHealthLogs] = useState<HealthLogEntry[]>([]);
  const [clearingLogs, setClearingLogs] = useState(false);

  // Export State
  const [exportPeriod, setExportPeriod] = useState<"daily" | "weekly" | "monthly" | "custom" | "all">("daily");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportEntities, setExportEntities] = useState<Record<string, boolean>>({
    patients: true,
    appointments: true,
    treatments: true,
    staff: true,
    reviews: true,
    whatsapp: true,
  });
  const [exportingFormat, setExportingFormat] = useState<"xlsx" | "csv" | null>(null);

  // Archiving State
  const [archiveCutoffMonths, setArchiveCutoffMonths] = useState(12);
  const [archivePreviewData, setArchivePreviewData] = useState<any>(null);
  const [previewingArchive, setPreviewingArchive] = useState(false);
  const [archivingModalOpen, setArchivingModalOpen] = useState(false);
  const [archivingNow, setArchivingNow] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Maintenance State
  const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [cleanLogsOption, setCleanLogsOption] = useState(true);
  const [cleanExportsOption, setCleanExportsOption] = useState(true);
  const [runningMaintenance, setRunningMaintenance] = useState(false);

  // Backup state
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [fullBackupModalOpen, setFullBackupModalOpen] = useState(false);
  const [backupSettings, setBackupSettings] = useState<Partial<DatabaseBackupConfig>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Database Connection Configuration modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [mainUrlInput, setMainUrlInput] = useState("");
  const [testingTarget, setTestingTarget] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{
    main?: { success: boolean; message: string; latency?: number; diagnostic?: string };
  }>({});
  const [savingConfig, setSavingConfig] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch full overview and health logs
  const fetchOverview = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/database/overview");
      if (!res.ok) throw new Error("Failed to load database overview");
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
        setBackupSettings(resData.backupConfig || {});
        if (resData.recentLogs) {
          setHealthLogs(resData.recentLogs);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load database metrics", "error");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  // Fetch maintenance stats
  const fetchMaintenanceStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/database/maintenance");
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMaintenanceStats(resData.maintenanceStats);
      }
    } catch {}
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchOverview();
    fetchMaintenanceStats();
    const timer = setInterval(() => {
      fetchOverview();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchOverview, fetchMaintenanceStats]);

  // Test Primary Database
  // Test Clinic Database
  const handleTestPrimary = async () => {
    setTestingPrimary(true);
    setPrimaryTestResult(null);
    try {
      const res = await fetch("/api/admin/database/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "primary" }),
      });
      const resData = await res.json();
      if (resData.result) {
        setPrimaryTestResult({
          status: resData.result.status,
          responseTimeMs: resData.result.responseTimeMs,
          message: resData.result.message,
        });
        showToast(
          resData.result.status === "CONNECTED"
            ? `Clinic Database connected (${resData.result.responseTimeMs} ms)!`
            : `Clinic Database: ${resData.result.message}`,
          resData.result.status === "CONNECTED" ? "success" : "error"
        );
        fetchOverview();
      }
    } catch (err: any) {
      showToast(err.message || "Connection test failed", "error");
    } finally {
      setTestingPrimary(false);
    }
  };

  // Clear Health Logs
  const handleClearHealthLogs = async () => {
    if (!isAdmin) return;
    setClearingLogs(true);
    try {
      const res = await fetch("/api/admin/database/health/logs", {
        method: "DELETE",
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Health logs cleared successfully.", "success");
        setHealthLogs([]);
        fetchMaintenanceStats();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to clear logs", "error");
    } finally {
      setClearingLogs(false);
    }
  };

  // Export Data (Excel or CSV)
  const handleExportData = async (format: "xlsx" | "csv") => {
    setExportingFormat(format);
    const selectedEntities = Object.keys(exportEntities).filter((k) => exportEntities[k]);
    if (selectedEntities.length === 0) {
      showToast("Please select at least one record type to export.", "error");
      setExportingFormat(null);
      return;
    }

    try {
      const res = await fetch("/api/admin/database/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          period: exportPeriod,
          startDate: exportStartDate || undefined,
          endDate: exportEndDate || undefined,
          entities: selectedEntities,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to generate export file");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smile-dental-${exportPeriod}-export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast(`Exported ${format.toUpperCase()} successfully!`, "success");
      fetchMaintenanceStats();
    } catch (err: any) {
      showToast(err.message || "Export failed", "error");
    } finally {
      setExportingFormat(null);
    }
  };

  // Preview Archive
  const handlePreviewArchive = async () => {
    setPreviewingArchive(true);
    try {
      const res = await fetch("/api/admin/database/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", cutoffMonths: archiveCutoffMonths }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setArchivePreviewData(resData);
      }
    } catch (err: any) {
      showToast(err.message || "Archive preview failed", "error");
    } finally {
      setPreviewingArchive(false);
    }
  };

  // Execute Archive
  const handleExecuteArchive = async () => {
    setArchivingNow(true);
    try {
      const res = await fetch("/api/admin/database/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive",
          cutoffMonths: archiveCutoffMonths,
          confirmed: true,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Records archived successfully!", "success");
        setArchivingModalOpen(false);
        setArchivePreviewData(null);
      }
    } catch (err: any) {
      showToast(err.message || "Archiving failed", "error");
    } finally {
      setArchivingNow(false);
    }
  };

  // Run Safe Maintenance
  const handleRunMaintenance = async () => {
    setRunningMaintenance(true);
    try {
      const res = await fetch("/api/admin/database/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleanHealthLogs: cleanLogsOption,
          cleanExportFiles: cleanExportsOption,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Maintenance completed safely!", "success");
        fetchMaintenanceStats();
        fetchOverview();
      }
    } catch (err: any) {
      showToast(err.message || "Maintenance failed", "error");
    } finally {
      setRunningMaintenance(false);
    }
  };

  // Handle Testing Candidate Database URL
  const handleTestCandidateUrl = async () => {
    if (!mainUrlInput.trim()) {
      showToast("Please enter a valid PostgreSQL URL for clinic database", "error");
      return;
    }
    setTestingTarget("main");
    try {
      const res = await fetch("/api/admin/database/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", target: "main", url: mainUrlInput.trim() }),
      });
      const resData = await res.json();
      setTestResults((prev) => ({
        ...prev,
        main: {
          success: resData.success,
          message: resData.message,
          latency: resData.latencyMs,
          diagnostic: resData.diagnostic,
        },
      }));
      if (resData.success) {
        showToast(`Connected successfully in ${resData.latencyMs}ms!`, "success");
      } else {
        showToast(resData.diagnostic || resData.message || "Connection failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to test connection", "error");
    } finally {
      setTestingTarget(null);
    }
  };

  // Handle Saving Database Configuration to .env
  const handleSaveConnectionConfig = async () => {
    if (!mainUrlInput.trim()) {
      showToast("Please enter a connection URL to update.", "error");
      return;
    }
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/database/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          mainDatabaseUrl: mainUrlInput.trim(),
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Database connection updated and applied!", "success");
        setIsConfigModalOpen(false);
        setMainUrlInput("");
        setTestResults({});
        fetchOverview(true);
      } else {
        throw new Error(resData.message || "Failed to save configuration");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save configuration", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle Save Backup Settings
  const handleSaveBackupSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/database/backups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupSettings),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("Backup settings saved successfully!", "success");
        fetchOverview();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Trigger Excel snapshot backup
  const handleTriggerBackup = async (type: "daily" | "weekly" | "monthly" | "full") => {
    if (!isAdmin) return;
    setExportingType(type);
    try {
      const res = await fetch("/api/admin/database/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || `Successfully created ${type.toUpperCase()} Excel backup!`, "success");
        fetchOverview();
      }
    } catch (err: any) {
      showToast(err.message || "Backup failed", "error");
    } finally {
      setExportingType(null);
      setFullBackupModalOpen(false);
    }
  };

  const overview = data?.overview || {
    totalDatabases: 2,
    connectedCount: 0,
    activeCount: 0,
    overallStatus: "CRITICAL",
    lastChecked: "Not checked yet",
  };

  const primaryDb = data?.database || data?.databases?.primary || data?.databases?.main || {
    name: "Clinic Database (PostgreSQL)",
    provider: "Supabase / PostgreSQL",
    databaseService: "Supabase PostgreSQL (AWS Cloud)",
    status: "DISCONNECTED",
    activity: "INACTIVE",
    responseTime: null,
    lastChecked: "Unavailable",
    tableCount: 8,
  };

  const storage = data?.storage || {
    available: false,
    usedPretty: null,
    limitPretty: "500 MB",
    usagePercent: null,
    statusLevel: "UNAVAILABLE",
    statusLabel: "Unavailable",
  };

  const overallStatus = data?.overallStatus || overview.overallStatus || "CRITICAL";
  const backupStorage = data?.backupStorage || { totalFiles: 0, totalSizePretty: "0 KB" };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-xs font-medium shadow-lg animate-in slide-in-from-bottom-3 ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
              : notification.type === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200"
                : "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : notification.type === "error" ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <Info className="h-4 w-4 text-blue-500" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <Link href="/admin" className="hover:text-brand-text">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-brand-text">Database Health &amp; Monitoring</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            Database Health &amp; System Status
          </h1>
          <p className="mt-0.5 text-xs text-brand-muted sm:text-sm">
            Live connection telemetry, unified PostgreSQL database health monitoring, storage, data export, and archiving.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfigModalOpen(true)}
              className="h-8 gap-1.5 text-xs border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Configure Connection</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestPrimary}
            disabled={testingPrimary}
            className="h-8 gap-1.5 text-xs border-brand-border bg-brand-surface font-semibold"
          >
            <Zap className={`h-3.5 w-3.5 text-brand-primary ${testingPrimary ? "animate-pulse" : ""}`} />
            <span>{testingPrimary ? "Testing..." : "Test Connection"}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchOverview(true)}
            disabled={refreshing}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Checking..." : "Refresh Now"}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DATABASE SYSTEM STATUS OVERVIEW BANNER                                  */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 bg-gradient-to-br from-brand-surface via-brand-surface to-brand-primary/5 shadow-sm">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-primary" />
                <span>Clinic Database Status</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Unified production PostgreSQL database with 60-second periodic auto-refresh
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-brand-muted">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-refresh: 60s active
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{overview.lastChecked}</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* Overall System Status */}
            <div className="rounded-clinic border border-brand-border bg-brand-background p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                Overall Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    overallStatus === "HEALTHY"
                      ? "bg-emerald-500 animate-pulse"
                      : overallStatus === "WARNING"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-xl font-bold tracking-tight ${
                    overallStatus === "HEALTHY"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : overallStatus === "WARNING"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {overallStatus}
                </span>
              </div>
              <span className="text-[11px] text-brand-muted">
                {overallStatus === "HEALTHY"
                  ? "Database online & healthy"
                  : "Action required"}
              </span>
            </div>

            {/* Database Status */}
            <div className="rounded-clinic border border-brand-border bg-brand-background p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                Database Connectivity
              </span>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-sm text-brand-text">
                <span
                  className={`h-2 w-2 rounded-full ${
                    primaryDb.status === "CONNECTED" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span>{primaryDb.status === "CONNECTED" ? "Connected" : "Timeout / Offline"}</span>
              </div>
              <span className="text-[11px] font-mono text-brand-muted">
                {primaryDb.responseTime !== null ? `${primaryDb.responseTime} ms latency` : "Not reachable"}
              </span>
            </div>

            {/* Architecture / Table Count */}
            <div className="rounded-clinic border border-brand-border bg-brand-background p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                Database Engine
              </span>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-sm text-brand-text">
                <Database className="h-4 w-4 text-brand-primary" />
                <span>Single Database</span>
              </div>
              <span className="text-[11px] font-mono text-brand-muted">
                8 Registered Tables
              </span>
            </div>

            {/* Storage Metric */}
            <div className="rounded-clinic border border-brand-border bg-brand-background p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                Storage Status
              </span>
              <div className="mt-1 text-base font-bold text-brand-text">
                {storage.available ? `${storage.usedPretty} (${storage.usagePercent}%)` : "Unavailable"}
              </div>
              <span className="text-[11px] text-brand-muted">
                {storage.available ? `Status: ${storage.statusLabel}` : "Requires connected database"}
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/60 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-text">Live Telemetry:</span>
              <Badge variant={primaryDb.status === "CONNECTED" ? "success" : "secondary"}>
                Clinic Database: {primaryDb.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="#data-export-section"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
              >
                <Download className="h-3 w-3" />
                <span>Jump to Data Export</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. DIAGNOSTIC ALERT BANNER (IF DB IS NOT CONNECTED)                        */}
      {/* ========================================================================= */}
      {primaryDb.status !== "CONNECTED" && (
        <Card className="border-amber-500/40 bg-amber-500/5 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-bold text-sm text-brand-text">
                  ⚠️ Database Unavailable: Connection timed out or unreachable
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleTestPrimary}
                    disabled={testingPrimary}
                    className="h-7 text-xs gap-1 border-amber-600/40 text-amber-700 dark:text-amber-300"
                  >
                    <RefreshCw className={`h-3 w-3 ${testingPrimary ? "animate-spin" : ""}`} />
                    <span>Test Again</span>
                  </Button>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    <span>Open Supabase Dashboard</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">
                Connection timed out. Supabase may be paused or unavailable. The application did not receive a response within the 6-second health limit.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-lg border border-brand-border bg-brand-surface p-3 space-y-1.5">
                  <div className="font-semibold text-brand-text flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">1</span>
                      <span>Possible Causes</span>
                    </span>
                  </div>
                  <ul className="list-disc pl-4 text-[11px] text-brand-muted space-y-0.5">
                    <li>Supabase project may be paused (free tier automatically pauses after 7 days)</li>
                    <li>Database may be temporarily unavailable or restarting</li>
                    <li>Incorrect database configuration or expired password</li>
                    <li>Network or port accessibility problem (direct port 5432)</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-brand-border bg-brand-surface p-3 space-y-1.5">
                  <div className="font-semibold text-brand-text flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold">2</span>
                      <span>Recommended Actions</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    1. Visit your Supabase Dashboard and click <strong>&quot;Restore project&quot;</strong> if paused.<br />
                    2. Use the <strong>Connection Pooler URI (port 6543)</strong> with username <code className="font-mono text-[10px] bg-brand-background px-1 py-0.5 rounded">postgres.[project-ref]</code>.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline pt-1"
                    >
                      <span>Update Connection Strings</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. UNIFIED CLINIC DATABASE CARD                                           */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 shadow-xs flex flex-col justify-between">
        <div>
          <CardHeader className="border-b border-brand-border/60 pb-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-brand-text">
                    Clinic Database (PostgreSQL)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Unified database for clinical operations, staff credentials, appointments, and care records
                  </CardDescription>
                </div>
              </div>
              <Badge variant={primaryDb.status === "CONNECTED" ? "success" : "secondary"}>
                {primaryDb.status === "CONNECTED" ? "Connected" : "Timeout / Offline"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Provider</span>
                <div className="font-semibold text-brand-text">{primaryDb.provider}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Service / Host</span>
                <div className="font-mono text-brand-text truncate">{primaryDb.databaseService}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Connection Status</span>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className={`h-2 w-2 rounded-full ${primaryDb.status === "CONNECTED" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span className={primaryDb.status === "CONNECTED" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
                    {primaryDb.status === "CONNECTED" ? "Connected" : "Connection Timeout"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Response Latency</span>
                <div className="font-mono font-semibold text-brand-text">
                  {primaryDb.responseTime !== null ? `${primaryDb.responseTime} ms` : "Not available"}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Last Checked</span>
                <div className="text-brand-muted font-mono">{primaryDb.lastChecked}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Active Tables</span>
                <div className="font-semibold text-brand-text">8 Tables (EMR &amp; Clinic Operations)</div>
              </div>
            </div>

            {primaryTestResult && (
              <div
                className={`rounded-md p-2.5 text-[11px] font-medium border ${
                  primaryTestResult.status === "CONNECTED"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {primaryTestResult.status === "CONNECTED" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span>{primaryTestResult.status === "CONNECTED" ? "Connection verified successfully" : "Connection timed out"}</span>
                </div>
                <p className="mt-0.5 text-[10px] opacity-90">{primaryTestResult.message}</p>
              </div>
            )}
          </CardContent>
        </div>

        <div className="border-t border-brand-border/60 p-4 flex items-center justify-between bg-brand-surface/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMainUrlInput("");
              setIsConfigModalOpen(true);
            }}
            className="h-7 text-xs gap-1 text-brand-muted hover:text-brand-text"
          >
            <Settings className="h-3 w-3" />
            <span>Configure URI</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestPrimary}
            disabled={testingPrimary}
            className="h-8 text-xs gap-1.5 border-blue-500/40 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300 font-semibold"
          >
            <RefreshCw className={`h-3 w-3 ${testingPrimary ? "animate-spin" : ""}`} />
            <span>{testingPrimary ? "Testing connection..." : "Test Database Connection"}</span>
          </Button>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* 4. DATABASE STORAGE MONITORING                                            */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-brand-primary" />
              <span>Database Storage Monitoring</span>
            </CardTitle>
            <Badge
              variant={
                storage.statusLevel === "NORMAL"
                  ? "success"
                  : storage.statusLevel === "WARNING"
                    ? "warning"
                    : "secondary"
              }
            >
              {storage.available ? `Status: ${storage.statusLabel}` : "Storage Info Unavailable"}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Physical on-disk storage calculation based on connected database engine
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {storage.available ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-text">
                  Used: {storage.usedPretty} / {storage.limitPretty}
                </span>
                <span className="font-bold text-brand-text">{storage.usagePercent}% Used</span>
              </div>
              {/* Progress bar with tiered coloring */}
              <div className="h-3 w-full rounded-full bg-brand-background overflow-hidden border border-brand-border">
                <div
                  className={`h-full transition-all duration-300 ${
                    storage.statusLevel === "NORMAL"
                      ? "bg-emerald-500"
                      : storage.statusLevel === "WARNING"
                        ? "bg-amber-500"
                        : storage.statusLevel === "HIGH"
                          ? "bg-orange-500"
                          : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, storage.usagePercent || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-brand-muted">
                <span>0 MB (0%)</span>
                <span>Threshold: 70% Normal | 85% High | 95% Critical</span>
                <span>{storage.limitPretty} (100%)</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-brand-border bg-brand-background p-4 text-xs text-brand-muted flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-brand-muted" />
                <span>Storage information unavailable — Requires an active database connection to compute physical disk usage.</span>
              </div>
              <Badge variant="outline">Supabase Free Tier (500 MB Limit)</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 5. RECENT CONNECTION HEALTH LOGS (30-DAY RETENTION)                       */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-primary" />
                <span>Recent Connection Health Logs</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Lightweight health telemetry records. Kept for 30 days and automatically pruned.
              </CardDescription>
            </div>
            {isAdmin && healthLogs.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearHealthLogs}
                disabled={clearingLogs}
                className="h-7 text-xs gap-1 border-brand-border text-brand-muted hover:text-brand-text"
              >
                <Trash2 className="h-3 w-3" />
                <span>{clearingLogs ? "Clearing..." : "Clear Old Logs"}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {healthLogs.length === 0 ? (
            <div className="p-6 text-center text-xs text-brand-muted">
              No health check logs recorded yet. Click &quot;Test Database Connection&quot; above to generate live logs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-brand-border bg-brand-background text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  <tr>
                    <th className="px-4 py-2.5">Database</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Response Time</th>
                    <th className="px-4 py-2.5">Timestamp</th>
                    <th className="px-4 py-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {healthLogs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-brand-background/40">
                      <td className="px-4 py-2 font-semibold capitalize text-brand-text">
                        Clinic Database
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            log.status === "CONNECTED"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              log.status === "CONNECTED" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {log.status === "CONNECTED" ? "Connected" : "Timeout"}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-brand-text">
                        {log.response_time !== null ? `${log.response_time} ms` : "—"}
                      </td>
                      <td className="px-4 py-2 font-mono text-brand-muted text-[11px]">
                        {new Date(log.checked_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="px-4 py-2 text-brand-muted text-[11px] truncate max-w-[200px]">
                        {log.message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 6. DATA EXPORT SECTION (CSV & EXCEL)                                      */}
      {/* ========================================================================= */}
      <Card id="data-export-section" className="border-brand-border/80 shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                <span>Export Clinic Data</span>
              </CardTitle>
              <CardDescription className="text-xs">
                DATA EXPORT: Creates administrative spreadsheets (Excel &amp; CSV). Clearly separated from Database Backup.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {/* Period Selector */}
          <div>
            <label className="text-xs font-semibold text-brand-text block mb-1.5">
              Select Export Period
            </label>
            <div className="flex flex-wrap gap-2">
              {(["daily", "weekly", "monthly", "all", "custom"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setExportPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    exportPeriod === p
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {p === "daily" ? "Daily (24h)" : p === "weekly" ? "Weekly (7d)" : p === "monthly" ? "Monthly (30d)" : p === "all" ? "All Time" : "Custom Range"}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs if selected */}
          {exportPeriod === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-brand-border bg-brand-background">
              <div>
                <label className="text-[11px] font-semibold text-brand-muted block mb-1">Start Date</label>
                <Input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-brand-muted block mb-1">End Date</label>
                <Input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Record Selection Checkboxes */}
          <div>
            <label className="text-xs font-semibold text-brand-text block mb-2">
              Include Data Entities:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { key: "patients", label: "Patients & Profiles" },
                { key: "appointments", label: "Appointments" },
                { key: "treatments", label: "Treatments & Catalog" },
                { key: "staff", label: "Staff Roster" },
                { key: "reviews", label: "Reviews & Ratings" },
                { key: "whatsapp", label: "WhatsApp Bookings" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded border border-brand-border bg-brand-surface hover:bg-brand-background cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={exportEntities[key] || false}
                    onChange={(e) =>
                      setExportEntities({
                        ...exportEntities,
                        [key]: e.target.checked,
                      })
                    }
                    className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-brand-text font-medium text-[11px]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-brand-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExportData("csv")}
              disabled={exportingFormat !== null}
              className="gap-1.5 text-xs font-semibold"
            >
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>{exportingFormat === "csv" ? "Exporting CSV..." : "Export CSV"}</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleExportData("xlsx")}
              disabled={exportingFormat !== null}
              className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{exportingFormat === "xlsx" ? "Generating Excel..." : "Export Excel (.xlsx)"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 7. SAFE DATA ARCHIVING WORKFLOW                                           */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
            <Archive className="h-4 w-4 text-purple-600" />
            <span>Data Archiving Workflow</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Compress and archive historical records to prevent database bloat. Active patient profiles are strictly protected.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-brand-muted block text-[11px] mb-1 font-semibold">
                Archive Completed Records Older Than:
              </label>
              <select
                value={archiveCutoffMonths}
                onChange={(e) => {
                  setArchiveCutoffMonths(Number(e.target.value));
                  setArchivePreviewData(null);
                }}
                className="h-8 rounded-lg border border-brand-border bg-brand-surface px-3 text-xs"
              >
                <option value={6}>6 Months</option>
                <option value={12}>12 Months (Recommended)</option>
                <option value={24}>24 Months</option>
                <option value={36}>36 Months</option>
              </select>
            </div>
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviewArchive}
                disabled={previewingArchive}
                className="h-8 gap-1 text-xs"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{previewingArchive ? "Scanning..." : "Preview Eligible Records"}</span>
              </Button>
            </div>
          </div>

          {archivePreviewData && (
            <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-2">
              <div className="flex items-center justify-between font-bold text-purple-950 dark:text-purple-200">
                <span>Cutoff Date: Older than {archivePreviewData.cutoffDateFormatted}</span>
                <span>Records Found: {archivePreviewData.counts.totalEligibleRecords}</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Eligible for archival: {archivePreviewData.counts.eligibleAppointments} past completed appointments, {archivePreviewData.counts.eligibleAuditLogs} system logs.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportData("xlsx")}
                  className="h-7 text-xs gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Export First</span>
                </Button>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setArchivingModalOpen(true)}
                    className="h-7 text-xs gap-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Archive className="h-3 w-3" />
                    <span>Archive Records</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 8. DATABASE MAINTENANCE                                                   */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
            <Wrench className="h-4 w-4 text-brand-primary" />
            <span>Database Maintenance &amp; Temporary Cleanup</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Clean temporary files, old health logs, and export scratch space. Clinical data is strictly protected.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-brand-border bg-brand-surface cursor-pointer">
              <input
                type="checkbox"
                checked={cleanLogsOption}
                onChange={(e) => setCleanLogsOption(e.target.checked)}
                className="mt-0.5 rounded border-brand-border text-brand-primary"
              />
              <div>
                <div className="font-semibold text-brand-text">Prune Health Check Logs</div>
                <div className="text-[11px] text-brand-muted">
                  Current logs: {maintenanceStats?.healthLogsCount ?? healthLogs.length} entries. Deletes only connection telemetry.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-brand-border bg-brand-surface cursor-pointer">
              <input
                type="checkbox"
                checked={cleanExportsOption}
                onChange={(e) => setCleanExportsOption(e.target.checked)}
                className="mt-0.5 rounded border-brand-border text-brand-primary"
              />
              <div>
                <div className="font-semibold text-brand-text">Clean Export Files</div>
                <div className="text-[11px] text-brand-muted">
                  Old files: {maintenanceStats?.exportFilesCount ?? 0} files ({maintenanceStats?.exportFilesTotalSize ?? "0 MB"}).
                </div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-brand-border">
            <span className="text-[11px] text-brand-muted flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Safe routine: Patients, appointments, and medical records are NEVER touched.</span>
            </span>
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRunMaintenance}
                disabled={runningMaintenance || (!cleanLogsOption && !cleanExportsOption)}
                className="text-xs font-semibold gap-1.5"
              >
                <Wrench className={`h-3.5 w-3.5 ${runningMaintenance ? "animate-spin" : ""}`} />
                <span>{runningMaintenance ? "Cleaning..." : "Run Safe Maintenance"}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 9. AUTOMATIC EXCEL BACKUP SETTINGS                                        */}
      {/* ========================================================================= */}
      <Card className="border-brand-border/80 shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-3.5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Automatic Excel Backups</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Scheduled server-side Excel snapshots (Daily 02:00 AM, Weekly Sunday, Monthly 1st)
              </CardDescription>
            </div>
            <Badge variant="outline">{backupStorage.totalFiles} Files Stored ({backupStorage.totalSizePretty})</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSaveBackupSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 rounded border border-brand-border bg-brand-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupSettings.dailyEnabled ?? true}
                  onChange={(e) => setBackupSettings({ ...backupSettings, dailyEnabled: e.target.checked })}
                  className="rounded border-brand-border text-brand-primary"
                />
                <span className="font-semibold text-brand-text">Daily Backup (02:00 AM)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded border border-brand-border bg-brand-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupSettings.weeklyEnabled ?? true}
                  onChange={(e) => setBackupSettings({ ...backupSettings, weeklyEnabled: e.target.checked })}
                  className="rounded border-brand-border text-brand-primary"
                />
                <span className="font-semibold text-brand-text">Weekly Backup (Sunday)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded border border-brand-border bg-brand-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupSettings.monthlyEnabled ?? true}
                  onChange={(e) => setBackupSettings({ ...backupSettings, monthlyEnabled: e.target.checked })}
                  className="rounded border-brand-border text-brand-primary"
                />
                <span className="font-semibold text-brand-text">Monthly Backup (1st)</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-brand-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFullBackupModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Create Full Snapshot Now</span>
              </Button>

              {isAdmin && (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingSettings}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingSettings ? "Saving..." : "Save Backup Settings"}</span>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* CONFIGURE DATABASE CONNECTIONS MODAL                                      */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-2xl border-brand-border bg-brand-surface shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-brand-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                  <Database className="h-4 w-4 text-brand-primary" />
                  <span>Configure Database Connections</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="rounded-md p-1 text-brand-muted hover:text-brand-text"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <CardDescription className="text-xs">
                Update connection string for your unified clinic database. Credentials are safe on the server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5 text-xs">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-blue-900 dark:text-blue-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>How to connect your Supabase Database:</span>
                </div>
                <ul className="list-disc pl-5 text-[11px] space-y-0.5 text-blue-800/90 dark:text-blue-300/90">
                  <li>
                    <strong>Check Project Status:</strong> Make sure your project is active (not paused) in <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-bold">Supabase Dashboard</a>.
                  </li>
                  <li>
                    <strong>Recommended URI:</strong> In Supabase, go to <em>Project Settings → Database → Connection String</em> and copy the <strong>Pooler (port 5432 or 6543)</strong> URI.
                  </li>
                  <li>
                    <strong>Password Escaping:</strong> If your password has special characters like <code>@</code>, encode them as <code>%40</code>.
                  </li>
                </ul>
              </div>

              {/* Database Input */}
              <div className="space-y-2 rounded-lg border border-brand-border p-3.5 bg-brand-background">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-brand-text flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-blue-500" />
                    <span>Clinic Database URL (DATABASE_URL)</span>
                  </label>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Current: {primaryDb.databaseService}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
                    value={mainUrlInput}
                    onChange={(e) => setMainUrlInput(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestCandidateUrl}
                    disabled={testingTarget === "main" || !mainUrlInput.trim()}
                    className="h-8 shrink-0 text-xs gap-1 border-blue-500/40 text-blue-600 hover:bg-blue-500/10"
                  >
                    <RefreshCw className={`h-3 w-3 ${testingTarget === "main" ? "animate-spin" : ""}`} />
                    <span>{testingTarget === "main" ? "Testing..." : "Test"}</span>
                  </Button>
                </div>
                {testResults.main && (
                  <div className={`rounded p-2 text-[11px] font-medium ${testResults.main.success ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30"}`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {testResults.main.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      <span>{testResults.main.message}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfigModalOpen(false)}
                  disabled={savingConfig}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveConnectionConfig}
                  disabled={savingConfig || !mainUrlInput.trim()}
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingConfig ? "Saving..." : "Save & Connect"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONFIRM ARCHIVE MODAL */}
      {archivingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-2xl animate-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <Archive className="h-4 w-4 text-purple-600" />
                <span>Confirm Data Archival</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Historical records older than {archiveCutoffMonths} months will be safely packaged into a compressed archive file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-xs">
              <div className="rounded border border-purple-500/30 bg-purple-500/10 p-3 text-purple-900 dark:text-purple-200">
                <p className="font-semibold">Notice: Active patient profiles are never archived.</p>
                <p className="mt-1 text-[11px] opacity-90">
                  Only past completed/cancelled appointments and historical audit logs will be archived. We recommend exporting data before archiving.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setArchivingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleExecuteArchive}
                  disabled={archivingNow}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <span>{archivingNow ? "Archiving..." : "Confirm Archival"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FULL BACKUP CONFIRMATION MODAL */}
      {fullBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-2xl animate-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Confirm Full Database Excel Snapshot</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Exports all historical non-sensitive records into a multi-worksheet spreadsheet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-xs">
              <div className="rounded-clinic border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200">
                <p className="text-xs font-semibold">Notice: Server snapshot</p>
                <p className="mt-1 text-[11px] opacity-90">
                  Creates an Excel workbook on the server with 5 worksheets. Passwords and secret keys are never exported.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFullBackupModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleTriggerBackup("full")}
                  disabled={exportingType === "full"}
                  className="gap-1.5"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>{exportingType === "full" ? "Generating..." : "Create Full Excel Backup"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
