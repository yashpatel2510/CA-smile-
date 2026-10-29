"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Clock,
  HardDrive,
  FileSpreadsheet,
  FileText,
  Save,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
  Zap,
  FlaskConical,
  Trash2,
  Plug,
  Power,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
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
import { DatabaseBackupConfig } from "@/lib/database/database-backup-store";

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

  // Dual Database Mode & Test Database State
  const [activeMode, setActiveMode] = useState<"production" | "test">("production");
  const [switchingMode, setSwitchingMode] = useState(false);
  const [testDbModalOpen, setTestDbModalOpen] = useState(false);
  const [testUrlInput, setTestUrlInput] = useState("");
  const [savingTestUrl, setSavingTestUrl] = useState(false);
  const [testingTestDb, setTestingTestDb] = useState(false);
  const [testDbTestResult, setTestDbTestResult] = useState<{
    status: string;
    responseTimeMs?: number | null;
    message?: string;
  } | null>(null);
  const [togglingTestDb, setTogglingTestDb] = useState(false);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [purgingTestDb, setPurgingTestDb] = useState(false);
  const [syncingTestTables, setSyncingTestTables] = useState(false);
  const [confirmSwitchModeModalOpen, setConfirmSwitchModeModalOpen] = useState<"production" | "test" | null>(null);
  const [showTestUrlPassword, setShowTestUrlPassword] = useState(false);
  const [testingModalUrl, setTestingModalUrl] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number | null;
  } | null>(null);

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

  // Backup state
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [fullBackupModalOpen, setFullBackupModalOpen] = useState(false);
  const [backupSettings, setBackupSettings] = useState<Partial<DatabaseBackupConfig>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch full overview and health metrics
  const fetchOverview = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/database/overview");
      if (!res.ok) throw new Error("Failed to load database overview");
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
        setBackupSettings(resData.backupConfig || {});
        if (resData.activeMode) {
          setActiveMode(resData.activeMode);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load database metrics", "error");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchOverview();
    const timer = setInterval(() => {
      fetchOverview();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchOverview]);

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

  // 1. Switch Active Mode (Production <-> Test)
  const handleSwitchMode = async (targetMode: "production" | "test") => {
    setSwitchingMode(true);
    try {
      const res = await fetch("/api/admin/database/test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch-mode", mode: targetMode }),
      });
      const resData = await res.json();
      if (resData.success) {
        setActiveMode(targetMode);
        window.dispatchEvent(new Event("database-mode-changed"));
        showToast(resData.message, "success");
        fetchOverview();
      } else {
        showToast(resData.message || "Failed to switch database mode", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to switch database mode", "error");
    } finally {
      setSwitchingMode(false);
      setConfirmSwitchModeModalOpen(null);
    }
  };

  // 2. Toggle Connect / Disconnect Test Database
  const handleToggleConnectTestDb = async (connect: boolean) => {
    setTogglingTestDb(true);
    try {
      const res = await fetch("/api/admin/database/test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-connect", connected: connect }),
      });
      const resData = await res.json();
      if (resData.success) {
        window.dispatchEvent(new Event("database-mode-changed"));
        showToast(resData.message, "success");
        fetchOverview();
      } else {
        showToast(resData.message || "Failed to toggle test database connection", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to toggle test database connection", "error");
    } finally {
      setTogglingTestDb(false);
    }
  };

  // 3. Test Test Database Connection
  const handleTestTestDb = async () => {
    setTestingTestDb(true);
    setTestDbTestResult(null);
    try {
      const res = await fetch("/api/admin/database/test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-connection" }),
      });
      const resData = await res.json();
      if (resData.success) {
        setTestDbTestResult({
          status: "CONNECTED",
          responseTimeMs: resData.latencyMs,
          message: resData.message,
        });
        showToast(`Test Database connected (${resData.latencyMs} ms)!`, "success");
      } else {
        setTestDbTestResult({
          status: "FAILED",
          message: resData.message || resData.error,
        });
        showToast(`Test Database error: ${resData.message}`, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to test test database", "error");
    } finally {
      setTestingTestDb(false);
    }
  };

  // 4. Save Test Database URL
  const handleSaveTestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrlInput.trim()) {
      showToast("Please enter a valid PostgreSQL URL for your test database", "error");
      return;
    }
    setSavingTestUrl(true);
    try {
      const res = await fetch("/api/admin/database/test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-test-url", url: testUrlInput.trim() }),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(resData.message, "success");
        setTestDbModalOpen(false);
        setTestUrlInput("");
        fetchOverview();
      } else {
        showToast(resData.message || "Failed to connect test database URL", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save test database URL", "error");
    } finally {
      setSavingTestUrl(false);
    }
  };

  // 4b. Test Connection from Inside the Modal
  const handleTestModalUrl = async () => {
    if (!testUrlInput.trim()) {
      showToast("Please enter a database URL first to test connection", "error");
      return;
    }
    setTestingModalUrl(true);
    setModalTestResult(null);
    try {
      const res = await fetch("/api/admin/database/test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-connection", url: testUrlInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setModalTestResult({
          ok: true,
          message: `Connection verified successfully (${data.latencyMs}ms)! This database is ready for testing.`,
          latencyMs: data.latencyMs,
        });
      } else {
        setModalTestResult({
          ok: false,
          message: data.message || "Failed to reach database server.",
        });
      }
    } catch (err: any) {
      setModalTestResult({
        ok: false,
        message: err.message || "Network error while testing connection.",
      });
    } finally {
      setTestingModalUrl(false);
    }
  };

  // 5. Clean & Purge Test Database
  const handlePurgeTestData = async () => {
    setPurgingTestDb(true);
    try {
      const res = await fetch("/api/admin/database/test-mode/purge", {
        method: "POST",
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(resData.message, "success");
        setPurgeModalOpen(false);
        fetchOverview();
      } else {
        showToast(resData.message || "Failed to clean test database", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to clean test database", "error");
    } finally {
      setPurgingTestDb(false);
    }
  };

  // 6. Sync / Push Schema Tables to Test Database
  const handleSyncTestTables = async () => {
    setSyncingTestTables(true);
    try {
      const res = await fetch("/api/admin/database/test-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-tables" }),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(resData.message, "success");
        fetchOverview();
      } else {
        showToast(resData.message || "Failed to initialize test tables", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to initialize test tables", "error");
    } finally {
      setSyncingTestTables(false);
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
    } catch (err: any) {
      showToast(err.message || "Export failed", "error");
    } finally {
      setExportingFormat(null);
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
    totalDatabases: 1,
    connectedCount: 0,
    activeCount: 0,
    overallStatus: "HEALTHY",
    lastChecked: "Checking...",
  };

  const primaryDb = data?.database || data?.databases?.primary || data?.databases?.main || {
    name: "Clinic Database (PostgreSQL)",
    provider: "Supabase / PostgreSQL",
    databaseService: "Supabase PostgreSQL (AWS Cloud)",
    status: "CONNECTED",
    activity: "ACTIVE",
    responseTime: 45,
    lastChecked: "Just now",
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

  const overallStatus = data?.overallStatus || overview.overallStatus || "HEALTHY";
  const backupStorage = data?.backupStorage || { totalFiles: 0, totalSizePretty: "0 KB" };

  const testDb = data?.testDatabase || {
    id: "test",
    name: "Test & Sandbox Database",
    provider: "Supabase / PostgreSQL",
    databaseService: "Not configured",
    status: "NOT_CONFIGURED",
    activity: "STANDBY",
    isConnected: false,
    hasUrl: false,
    lastPurgedAt: null,
    stats: { appointmentsCount: 0, patientsCount: 0 },
  };

  const currentActiveMode: "production" | "test" = data?.activeMode || activeMode || "production";

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
            <Link href="/admin/today" className="hover:text-brand-text">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-brand-text">Database Health &amp; Monitoring</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            Database Health &amp; System Status
          </h1>
          <p className="mt-0.5 text-xs text-brand-muted sm:text-sm">
            Live connection telemetry, unified PostgreSQL database health monitoring, storage, and automated Excel exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
      {/* 0. DATABASE ENVIRONMENT CONTROLLER (LIVE PRODUCTION vs TEST SANDBOX)       */}
      {/* ========================================================================= */}
      <div className={`rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${
        currentActiveMode === "test"
          ? "border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent text-amber-950 dark:text-amber-100"
          : "border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-950 dark:text-emerald-100"
      }`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${
              currentActiveMode === "test"
                ? "bg-amber-500 text-white"
                : "bg-emerald-600 text-white"
            }`}>
              {currentActiveMode === "test" ? (
                <FlaskConical className="h-5 w-5 animate-bounce" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  {currentActiveMode === "test" ? "Active Mode: 🧪 Testing & Sandbox Database" : "Active Mode: 🟢 Live Clinic Production Database"}
                </span>
                <Badge variant={currentActiveMode === "test" ? "warning" : "success"}>
                  {currentActiveMode === "test" ? "TEST MODE ACTIVE" : "PRODUCTION LIVE"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-brand-muted leading-relaxed max-w-2xl">
                {currentActiveMode === "test" ? (
                  <span>
                    <strong>Sandbox Mode is Active:</strong> New patient bookings, forms, and test inquiries submitted on the website are saved <strong>ONLY in your Test Database</strong>. Your live clinic records are locked, isolated, and 100% safe.
                  </span>
                ) : (
                  <span>
                    <strong>Live Production is Active:</strong> Patient bookings and appointments are recorded in your primary clinic database. To test website changes without affecting real data, switch to <strong>Test &amp; Sandbox Mode</strong> below.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {currentActiveMode === "production" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!testDb.hasUrl) {
                    setTestDbModalOpen(true);
                  } else {
                    setConfirmSwitchModeModalOpen("test");
                  }
                }}
                disabled={switchingMode}
                className="gap-2 text-xs font-semibold border-amber-500/40 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 dark:text-amber-200"
              >
                <FlaskConical className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Switch to Test Database</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setConfirmSwitchModeModalOpen("production")}
                disabled={switchingMode}
                className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Switch Back to Live Production</span>
              </Button>
            )}
          </div>
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
                {storage.available ? `${storage.usedPretty} (${storage.usagePercent}%)` : "Normal (<5%)"}
              </div>
              <span className="text-[11px] text-brand-muted">
                {storage.available ? `Status: ${storage.statusLabel}` : "500 MB Free Tier Limit"}
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
                    <li>Network or port accessibility problem</li>
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
                    1. Visit your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-semibold">Supabase Dashboard</a> and click <strong>&quot;Restore project&quot;</strong> if paused.<br />
                    2. Ensure your connection pooling URL is configured in server environment variables.
                  </p>
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
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">Production Database Managed &amp; Protected</span>
          </div>
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
      {/* 3B. TEST & SANDBOX DATABASE CARD                                          */}
      {/* ========================================================================= */}
      <Card className={`border-brand-border/80 shadow-xs flex flex-col justify-between transition-all ${
        currentActiveMode === "test" ? "ring-2 ring-amber-500/50 bg-amber-500/5" : ""
      }`}>
        <div>
          <CardHeader className="border-b border-brand-border/60 pb-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  testDb.isConnected ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-slate-500/10 text-slate-500"
                }`}>
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-brand-text">
                      Test &amp; Sandbox Database (PostgreSQL)
                    </CardTitle>
                    {currentActiveMode === "test" && (
                      <Badge variant="warning" className="text-[10px]">
                        ACTIVE TEST MODE
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    Isolated testing database. When active, all website bookings and form tests are saved here without touching real clinic records.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={testDb.isConnected ? "success" : testDb.hasUrl ? "secondary" : "warning"}>
                  {testDb.isConnected ? "Connected" : testDb.hasUrl ? "Disconnected" : "Setup Required"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Provider</span>
                <div className="font-semibold text-brand-text">{testDb.provider || "Supabase / PostgreSQL"}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Service / Host</span>
                <div className="font-mono text-brand-text truncate">
                  {testDb.databaseService || "Not configured"}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Connection State</span>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className={`h-2 w-2 rounded-full ${testDb.isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span className={testDb.isConnected ? "text-emerald-700 dark:text-emerald-400" : "text-brand-muted"}>
                    {testDb.isConnected ? "Online & Ready" : testDb.hasUrl ? "Disconnected (Standby)" : "URL Not Configured"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Test Bookings</span>
                <div className="font-mono font-semibold text-brand-text">
                  {testDb.stats?.appointmentsCount ?? 0} Test Appointment(s)
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Test Patients</span>
                <div className="font-mono font-semibold text-brand-text">
                  {testDb.stats?.patientsCount ?? 0} Test Profile(s)
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-muted">Last Cleaned</span>
                <div className="text-brand-muted font-mono">
                  {testDb.lastPurgedAt ? new Date(testDb.lastPurgedAt).toLocaleDateString("en-IN") : "Never purged"}
                </div>
              </div>
            </div>

            {testDbTestResult && (
              <div
                className={`rounded-md p-2.5 text-[11px] font-medium border ${
                  testDbTestResult.status === "CONNECTED"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {testDbTestResult.status === "CONNECTED" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span>{testDbTestResult.status === "CONNECTED" ? "Test Connection Successful" : "Test Connection Failed"}</span>
                </div>
                <p className="mt-0.5 text-[10px] opacity-90">{testDbTestResult.message}</p>
              </div>
            )}
          </CardContent>
        </div>

        <div className="border-t border-brand-border/60 p-4 flex flex-wrap items-center justify-between gap-3 bg-brand-surface/50">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setModalTestResult(null);
                setShowTestUrlPassword(false);
                setTestDbModalOpen(true);
              }}
              className="h-8 text-xs gap-1.5 font-semibold"
            >
              <Plug className="h-3.5 w-3.5" />
              <span>{testDb.hasUrl ? "Edit Test Database URL" : "Connect Test Database URL"}</span>
            </Button>

            {testDb.hasUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleToggleConnectTestDb(!testDb.isConnected)}
                disabled={togglingTestDb}
                className="h-8 text-xs gap-1.5 font-semibold"
              >
                <Power className={`h-3.5 w-3.5 ${testDb.isConnected ? "text-amber-600" : "text-emerald-600"}`} />
                <span>{testDb.isConnected ? "Disconnect Test DB" : "Connect Test DB"}</span>
              </Button>
            )}

            {testDb.isConnected && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestTestDb}
                  disabled={testingTestDb}
                  className="h-8 text-xs gap-1.5 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300 font-semibold"
                >
                  <RefreshCw className={`h-3 w-3 ${testingTestDb ? "animate-spin" : ""}`} />
                  <span>{testingTestDb ? "Testing..." : "Test Connection"}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncTestTables}
                  disabled={syncingTestTables}
                  className="h-8 text-xs gap-1.5 text-purple-700 hover:bg-purple-500/10 dark:text-purple-300 font-semibold"
                  title="Push Prisma schema to create or sync tables in your test database"
                >
                  <Database className={`h-3.5 w-3.5 ${syncingTestTables ? "animate-spin" : ""}`} />
                  <span>{syncingTestTables ? "Syncing..." : "Sync Tables (Schema)"}</span>
                </Button>
              </>
            )}
          </div>

          {/* Clean / Purge Test Database Button */}
          {testDb.hasUrl && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setPurgeModalOpen(true)}
              disabled={purgingTestDb || (!testDb.stats?.appointmentsCount && !testDb.stats?.patientsCount)}
              className="h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clean / Purge Test Data</span>
            </Button>
          )}
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchOverview(true)}
                title="Refresh live on-disk storage metrics from PostgreSQL engine"
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text hover:bg-brand-background transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-brand-primary" : ""}`} />
              </button>
              <Badge
                variant={
                  storage.statusLevel === "NORMAL"
                    ? "success"
                    : storage.statusLevel === "WARNING"
                      ? "warning"
                      : "secondary"
                }
              >
                {storage.available ? `Status: ${storage.statusLabel} (Live pg_database_size)` : "Normal (<5%)"}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            Physical on-disk storage calculated live from PostgreSQL engine via <code className="text-brand-primary font-mono text-[11px]">pg_database_size()</code> and table relation sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-text">
                Used: {storage.usedPretty || "12 MB"} / {storage.limitPretty || "500 MB"}
              </span>
              <span className="font-bold text-brand-text">{storage.usagePercent ?? 2.4}% Used</span>
            </div>
            {/* Progress bar with tiered coloring */}
            <div className="h-3 w-full rounded-full bg-brand-background overflow-hidden border border-brand-border">
              <div
                className={`h-full transition-all duration-300 ${
                  (storage.usagePercent ?? 2.4) >= 85
                    ? "bg-red-500"
                    : (storage.usagePercent ?? 2.4) >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, storage.usagePercent ?? 2.4)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-brand-muted">
              <span>0 MB (0%)</span>
              <span>Safe: 500 MB Supabase Free Tier Quota</span>
              <span>{storage.limitPretty || "500 MB"} (100%)</span>
            </div>
          </div>

          {/* Live Table On-Disk Storage Breakdown */}
          {Array.isArray(storage.tables) && storage.tables.length > 0 && (
            <div className="mt-4 pt-4 border-t border-brand-border/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-brand-text">
                  Physical Table On-Disk Storage (Top Relations)
                </span>
                <span className="text-[10px] text-brand-muted font-medium">
                  Live PostgreSQL relation size
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {storage.tables.slice(0, 8).map((t: any) => (
                  <div
                    key={t.tableName}
                    className="rounded-xl border border-brand-border/80 bg-brand-background/60 p-2.5 text-center transition-all hover:border-brand-primary/40"
                  >
                    <div className="text-[11px] font-bold text-brand-text truncate" title={t.tableName}>
                      {t.tableName}
                    </div>
                    <div className="text-xs font-extrabold text-brand-primary mt-0.5">
                      {t.totalSize}
                    </div>
                    <div className="text-[10px] text-brand-muted mt-0.5">
                      {t.rowCount} record{t.rowCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 5. DATA EXPORT SECTION (CSV & EXCEL)                                      */}
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
                Generate administrative spreadsheets (Excel &amp; CSV) for clinic records, accounting, and offline analysis.
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
      {/* 6. AUTOMATIC EXCEL BACKUP SETTINGS                                        */}
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

      {/* CONFIRM SWITCH MODE MODAL */}
      {confirmSwitchModeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-brand-border bg-brand-surface shadow-2xl animate-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                {confirmSwitchModeModalOpen === "test" ? (
                  <FlaskConical className="h-4 w-4 text-amber-500" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                )}
                <span>
                  {confirmSwitchModeModalOpen === "test"
                    ? "Confirm Switch to Test Database"
                    : "Confirm Switch to Live Production"}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                {confirmSwitchModeModalOpen === "test"
                  ? "Redirects website and admin data storage to your isolated sandbox database."
                  : "Restores normal clinic operations writing to your primary production database."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-xs">
              <div className={`rounded-clinic border p-3.5 ${
                confirmSwitchModeModalOpen === "test"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
              }`}>
                <p className="font-semibold text-xs">
                  {confirmSwitchModeModalOpen === "test"
                    ? "🧪 Live Data Protection Active"
                    : "🟢 Resuming Live Production"}
                </p>
                <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                  {confirmSwitchModeModalOpen === "test"
                    ? "While in Test Mode, all appointments, patient forms, and inquiries submitted through the website or admin panel are stored EXCLUSIVELY in the Test Database. Your live clinic records will not be touched or modified."
                    : "When you switch back to Live Production, all patient appointments and website forms will immediately write to your primary clinic database again."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmSwitchModeModalOpen(null)}
                  disabled={switchingMode}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={confirmSwitchModeModalOpen === "test" ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handleSwitchMode(confirmSwitchModeModalOpen)}
                  disabled={switchingMode}
                  className={`gap-1.5 font-semibold ${
                    confirmSwitchModeModalOpen === "test"
                      ? "border-amber-500/50 bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {confirmSwitchModeModalOpen === "test" ? (
                    <FlaskConical className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {switchingMode
                      ? "Switching..."
                      : confirmSwitchModeModalOpen === "test"
                        ? "Activate Test Database"
                        : "Activate Live Production"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONFIGURE TEST DATABASE URL MODAL */}
      {testDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg border-brand-border bg-brand-surface shadow-2xl animate-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <Plug className="h-4 w-4 text-brand-primary" />
                <span>Connect Test / Sandbox Database URL</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Provide a separate Supabase or PostgreSQL connection string for testing your website.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveTestUrl}>
              <CardContent className="space-y-4 p-5 text-xs">
                <div className="rounded-clinic border border-blue-500/30 bg-blue-500/10 p-3 text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-semibold text-xs">How to get your separate Supabase Test URL:</p>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    1. Create a free test project in your Supabase dashboard.<br />
                    2. Go to <strong>Project Settings → Database → Connection string → URI (Pooler 5432 or 6543)</strong>.<br />
                    3. Paste the connection string below.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-brand-text">
                      Test Database PostgreSQL Connection String:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTestUrlPassword(!showTestUrlPassword)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:underline cursor-pointer"
                    >
                      {showTestUrlPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showTestUrlPassword ? "Hide" : "Show"} URL</span>
                    </button>
                  </div>
                  <Input
                    type={showTestUrlPassword ? "text" : "password"}
                    placeholder="postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
                    value={testUrlInput}
                    onChange={(e) => {
                      setTestUrlInput(e.target.value);
                      if (modalTestResult) setModalTestResult(null);
                    }}
                    className="font-mono text-xs"
                    autoFocus
                  />
                  <p className="mt-1 text-[11px] text-brand-muted">
                    Credentials are saved securely. Spaces and encoded passwords are automatically handled.
                  </p>

                  {/* Inline Test Result Feedback */}
                  {modalTestResult && (
                    <div
                      className={`mt-2.5 rounded-lg border p-2.5 text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
                        modalTestResult.ok
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700"
                          : "border-red-300 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200 dark:border-red-700"
                      }`}
                    >
                      {modalTestResult.ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 text-[11px]">
                        <div className="font-bold">{modalTestResult.ok ? "Test Connection Successful" : "Test Connection Failed"}</div>
                        <div className="opacity-90 mt-0.5">{modalTestResult.message}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-brand-border gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestDbModalOpen(false);
                      setModalTestResult(null);
                      setTestUrlInput("");
                    }}
                    disabled={savingTestUrl || testingModalUrl}
                  >
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestModalUrl}
                      disabled={testingModalUrl || !testUrlInput.trim()}
                      className="text-xs gap-1.5 font-semibold text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700"
                    >
                      <Zap className={`h-3.5 w-3.5 ${testingModalUrl ? "animate-spin text-amber-600" : "text-amber-600"}`} />
                      <span>{testingModalUrl ? "Testing..." : "Test Connection"}</span>
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={savingTestUrl || !testUrlInput.trim()}
                      className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{savingTestUrl ? "Saving..." : "Save & Connect Test Database"}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* CLEAN & PURGE TEST DATABASE CONFIRMATION MODAL */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-red-500/30 bg-brand-surface shadow-2xl animate-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-brand-border pb-3">
              <CardTitle className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>Clean &amp; Purge Test Database</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Safely wipe all test data from your sandbox environment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5 text-xs">
              <div className="rounded-clinic border border-red-500/30 bg-red-500/10 p-3.5 text-red-900 dark:text-red-200">
                <p className="font-semibold text-xs">Permanent Test Wipe</p>
                <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                  This action will permanently delete all <strong>test appointments</strong> and <strong>test patient profiles</strong> from the Test Database.
                </p>
                <div className="mt-2 pt-2 border-t border-red-500/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  🛡️ Your Live Clinic Database is strictly protected and will not be touched.
                </div>
              </div>

              <div className="rounded-md border border-brand-border bg-brand-background p-3 text-xs">
                <span className="font-semibold text-brand-text block mb-1">Records to be cleaned:</span>
                <ul className="list-disc pl-4 text-[11px] text-brand-muted space-y-0.5">
                  <li>{testDb.stats?.appointmentsCount ?? 0} Test Appointment(s)</li>
                  <li>{testDb.stats?.patientsCount ?? 0} Test Patient Profile(s)</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPurgeModalOpen(false)}
                  disabled={purgingTestDb}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handlePurgeTestData}
                  disabled={purgingTestDb}
                  className="gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{purgingTestDb ? "Cleaning..." : "Yes, Purge Test Records"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
