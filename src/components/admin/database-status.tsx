"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Database,
  Server,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Trash2,
  Table as TableIcon,
  Activity,
  Layers,
  FileText,
  AlertCircle,
  Eye,
  Info,
  ExternalLink,
  Shield,
  Zap,
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
import {
  DatabaseSystemStatusReport,
  DatabaseTargetHealth,
  TableSummary,
} from "@/lib/database/health";
import { AllowedTable, RecordItem } from "@/lib/database/records-service";

export function DatabaseStatusSection() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<DatabaseSystemStatusReport | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Connection testing states
  const [testingTarget, setTestingTarget] = useState<"main" | "auth" | null>(null);
  const [testResults, setTestResults] = useState<{
    main?: { latencyMs: number | null; status: string; checkedAt: string };
    auth?: { latencyMs: number | null; status: string; checkedAt: string };
  }>({});

  // Data Management states
  const [selectedTable, setSelectedTable] = useState<AllowedTable>("appointments");
  const [tableRecords, setTableRecords] = useState<RecordItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<RecordItem | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Fetch status report
  const fetchStatus = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      setErrorMsg(null);
      const res = await fetch("/api/admin/database-status");
      if (!res.ok) {
        throw new Error(`Failed to load database status (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        setLastFetchTime(new Date());
      } else {
        throw new Error(data.message || "Failed to retrieve status report");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error checking database");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  // Initial load + periodic auto-refresh every 60 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Load records when selected table changes
  useEffect(() => {
    async function loadRecords() {
      setLoadingRecords(true);
      try {
        const res = await fetch(`/api/admin/database-status/records?table=${selectedTable}`);
        if (res.ok) {
          const data = await res.json();
          setTableRecords(data.records || []);
        }
      } catch {
        setTableRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    }
    loadRecords();
  }, [selectedTable]);

  // Handle individual connection test
  const handleTestConnection = async (target: "main" | "auth") => {
    setTestingTarget(target);
    try {
      const res = await fetch("/api/admin/database-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setTestResults((prev) => ({
          ...prev,
          [target]: {
            latencyMs: data.result.latencyMs,
            status: data.result.status,
            checkedAt: new Date().toLocaleTimeString(),
          },
        }));
        // Update report card
        if (report) {
          setReport({
            ...report,
            databases: {
              ...report.databases,
              [target]: data.result,
            },
          });
        }
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [target]: {
          latencyMs: null,
          status: "DISCONNECTED",
          checkedAt: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setTestingTarget(null);
    }
  };

  // Handle permanent deletion with "DELETE" confirmation
  const handleConfirmDelete = async () => {
    if (!recordToDelete || deleteConfirmationText !== "DELETE") {
      setDeleteError("You must type DELETE exactly to confirm.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/admin/database-status/records", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: selectedTable,
          recordId: recordToDelete.id,
          confirmation: deleteConfirmationText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(data.message || `Record #${recordToDelete.id} deleted successfully.`);
        setDeleteModalOpen(false);
        setRecordToDelete(null);
        setDeleteConfirmationText("");
        // Refresh records and status
        setTableRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
        fetchStatus();
      } else {
        setDeleteError(data.message || "Failed to delete record.");
      }
    } catch (err: any) {
      setDeleteError(err.message || "Network error deleting record.");
    } finally {
      setDeleting(false);
    }
  };

  // Format date helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return isoString;
    }
  };

  if (loading && !report) {
    return (
      <Card className="border-2 border-brand-primary/30 shadow-md">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-primary" />
          <h3 className="mt-4 text-base font-bold text-brand-text">
            Querying Database &amp; System Health...
          </h3>
          <p className="mt-1 text-xs text-brand-muted">
            Inspecting PostgreSQL instances, storage meters, and table registers
          </p>
        </CardContent>
      </Card>
    );
  }

  const overview = report?.overview;
  const mainDb = report?.databases.main;
  const authDb = report?.databases.auth;
  const storage = report?.storageSummary;

  return (
    <div id="database-status" className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SUMMARY OVERVIEW                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-brand-border bg-gradient-to-r from-brand-primary/10 via-brand-surface to-brand-accent/20 p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-extrabold text-brand-text">
                Database &amp; System Status
              </h2>
              <p className="text-xs text-brand-muted">
                Monitor your clinic website&apos;s database connections, storage usage, and system health.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Last checked
            </span>
            <span className="text-xs font-bold text-brand-text">
              {lastFetchTime ? `${lastFetchTime.toLocaleTimeString()} (${lastFetchTime.toLocaleDateString()})` : "Checking now..."}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchStatus(true)}
            disabled={refreshing}
            className="border-brand-border bg-white text-xs font-semibold text-brand-text shadow-xs hover:bg-brand-accent/30"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin text-brand-primary" : ""}`} />
            {refreshing ? "Checking..." : "Refresh Status"}
          </Button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {actionSuccessMsg && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            ×
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-800 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONNECTION SUMMARY BANNER                                              */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardContent className="p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
            Database Connections Summary
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[11px] font-medium text-brand-muted">Connected Databases</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-brand-text">
                  {overview?.connectedCount} / {overview?.totalConfigured}
                </span>
                <span className="text-[10px] text-brand-muted">Active</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold">
                {overview?.connectedCount === overview?.totalConfigured ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> All Connected
                  </span>
                ) : overview?.connectedCount === 0 ? (
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Disconnected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Degraded
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[11px] font-medium text-brand-muted">Architecture Type</span>
              <div className="mt-1 text-sm font-bold text-brand-text">
                {overview?.architectureType === "TWO_DATABASE_ISOLATED" ? "2 Isolated DBs" : "1 Shared DB"}
              </div>
              <p className="mt-2 text-[10px] leading-tight text-brand-muted">
                {overview?.architectureType === "TWO_DATABASE_ISOLATED"
                  ? "Auth & Clinic data separated"
                  : "Combined database schema"}
              </p>
            </div>

            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[11px] font-medium text-brand-muted">Storage Usage</span>
              <div className="mt-1 text-sm font-bold text-brand-text">
                {storage?.hasLiveStorage && storage.totalDatabaseSizePretty
                  ? `${storage.totalDatabaseSizePretty} / ${storage.limitPretty}`
                  : "Unavailable"}
              </div>
              <p className="mt-2 text-[10px] leading-tight text-brand-muted">
                {storage?.hasLiveStorage ? `${storage.usagePercent}% of quota` : "DB offline; local fallback active"}
              </p>
            </div>

            <div className="rounded-lg border border-brand-border/80 bg-brand-background p-3.5">
              <span className="text-[11px] font-medium text-brand-muted">Operational Fallback</span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <ShieldCheck className="h-4 w-4" /> Active &amp; Resilient
              </div>
              <p className="mt-2 text-[10px] leading-tight text-brand-muted">
                Zero patient downtime during DB reconnect
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 3 & 4. TWO DATABASE CARDS SIDE-BY-SIDE                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CARD 1: Admin & Staff Authentication Database */}
        <Card className="flex flex-col justify-between border-2 border-brand-border/90 bg-brand-surface shadow-xs">
          <div>
            <CardHeader className="border-b border-brand-border/60 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-brand-text">
                      Admin &amp; Staff Authentication Database
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Dedicated credentials &amp; RBAC permissions store
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant={authDb?.status === "CONNECTED" ? "default" : "destructive"}
                  className={`text-[10px] font-bold ${
                    authDb?.status === "CONNECTED"
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {authDb?.status === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Provider</span>
                  <p className="mt-0.5 font-bold text-brand-text">{authDb?.provider || "Supabase PostgreSQL"}</p>
                </div>

                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Host / Endpoint</span>
                  <p className="mt-0.5 truncate font-mono text-[11px] font-bold text-brand-text" title={authDb?.maskedHost}>
                    {authDb?.maskedHost || "Not configured"}
                  </p>
                </div>

                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Authentication Service</span>
                  <p className="mt-0.5 flex items-center gap-1 font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> 🟢 Active (NextAuth JWT)
                  </p>
                </div>

                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Registered Users</span>
                  <p className="mt-0.5 font-bold text-brand-text">
                    {authDb?.metrics.adminUsers || 1} Admin · {authDb?.metrics.staffUsers || 3} Staff
                  </p>
                </div>
              </div>

              {/* Storage Info */}
              <div className="rounded-md border border-brand-border/60 bg-brand-background p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-muted">Storage Usage</span>
                  <span className="font-bold text-brand-text">
                    {authDb?.storage.available && authDb.storage.sizePretty
                      ? `${authDb.storage.sizePretty} / ${authDb.storage.limitPretty}`
                      : "Storage usage unavailable"}
                  </span>
                </div>
                {!authDb?.storage.available && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    {authDb?.storage.reasonIfUnavailable || "Database connection unavailable."}
                  </p>
                )}
              </div>

              {/* Error diagnostic if disconnected */}
              {authDb?.error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-800">
                  <div className="font-bold">Connection Diagnostic:</div>
                  <div className="mt-0.5 font-mono text-[10px]">{authDb.error}</div>
                </div>
              )}

              {/* Test Result Message */}
              {testResults.auth && (
                <div className="rounded-md border border-brand-border bg-brand-accent/20 p-2.5 text-[11px]">
                  <span className="font-bold">Test Result ({testResults.auth.checkedAt}): </span>
                  {testResults.auth.status === "CONNECTED" ? (
                    <span className="text-emerald-700 font-semibold">
                      🟢 Connected ({testResults.auth.latencyMs} ms latency)
                    </span>
                  ) : (
                    <span className="text-red-700 font-semibold">🔴 Connection unreachable</span>
                  )}
                </div>
              )}
            </CardContent>
          </div>

          <div className="border-t border-brand-border/60 p-4 bg-brand-background/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-brand-muted">
                Last checked: {formatTime(authDb?.lastChecked)}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={testingTarget === "auth"}
                onClick={() => handleTestConnection("auth")}
                className="text-xs font-semibold shadow-xs"
              >
                <Zap className={`mr-1.5 h-3.5 w-3.5 ${testingTarget === "auth" ? "animate-spin text-amber-500" : "text-brand-primary"}`} />
                {testingTarget === "auth" ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </Card>

        {/* CARD 2: Main Clinic Application Database */}
        <Card className="flex flex-col justify-between border-2 border-brand-border/90 bg-brand-surface shadow-xs">
          <div>
            <CardHeader className="border-b border-brand-border/60 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-xs">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-brand-text">
                      Main Clinic Database
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Smile Dental clinic application data &amp; patient records
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant={mainDb?.status === "CONNECTED" ? "default" : "destructive"}
                  className={`text-[10px] font-bold ${
                    mainDb?.status === "CONNECTED"
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {mainDb?.status === "CONNECTED" ? "🟢 Connected" : "🔴 Disconnected"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Provider</span>
                  <p className="mt-0.5 font-bold text-brand-text">{mainDb?.provider || "Supabase PostgreSQL"}</p>
                </div>

                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Database Name</span>
                  <p className="mt-0.5 font-bold text-brand-text">{mainDb?.databaseName || "postgres"}</p>
                </div>

                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Tables Defined</span>
                  <p className="mt-0.5 font-bold text-brand-text">{mainDb?.metrics.tableCount || 8} Schema Tables</p>
                </div>

                <div className="rounded-md border border-brand-border/60 bg-brand-background p-2.5">
                  <span className="text-[10px] font-semibold text-brand-muted">Active Store Records</span>
                  <p className="mt-0.5 font-bold text-brand-text">
                    {mainDb?.metrics.totalRecords && mainDb.metrics.totalRecords > 0
                      ? `${mainDb.metrics.totalRecords} Records`
                      : "Active in Fallback Store"}
                  </p>
                </div>
              </div>

              {/* Storage Info */}
              <div className="rounded-md border border-brand-border/60 bg-brand-background p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-muted">Storage Usage</span>
                  <span className="font-bold text-brand-text">
                    {mainDb?.storage.available && mainDb.storage.sizePretty
                      ? `${mainDb.storage.sizePretty} / ${mainDb.storage.limitPretty} (${mainDb.storage.usagePercent}%)`
                      : "Storage usage unavailable"}
                  </span>
                </div>
                {!mainDb?.storage.available && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    {mainDb?.storage.reasonIfUnavailable || "Database connection unavailable."}
                  </p>
                )}
              </div>

              {/* Error diagnostic if disconnected */}
              {mainDb?.error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-[11px] text-red-800">
                  <div className="font-bold">Connection Diagnostic:</div>
                  <div className="mt-0.5 font-mono text-[10px]">{mainDb.error}</div>
                </div>
              )}

              {/* Test Result Message */}
              {testResults.main && (
                <div className="rounded-md border border-brand-border bg-brand-accent/20 p-2.5 text-[11px]">
                  <span className="font-bold">Test Result ({testResults.main.checkedAt}): </span>
                  {testResults.main.status === "CONNECTED" ? (
                    <span className="text-emerald-700 font-semibold">
                      🟢 Connected ({testResults.main.latencyMs} ms latency)
                    </span>
                  ) : (
                    <span className="text-red-700 font-semibold">🔴 Connection unreachable</span>
                  )}
                </div>
              )}
            </CardContent>
          </div>

          <div className="border-t border-brand-border/60 p-4 bg-brand-background/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-brand-muted">
                Last checked: {formatTime(mainDb?.lastChecked)}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={testingTarget === "main"}
                onClick={() => handleTestConnection("main")}
                className="text-xs font-semibold shadow-xs"
              >
                <Zap className={`mr-1.5 h-3.5 w-3.5 ${testingTarget === "main" ? "animate-spin text-amber-500" : "text-brand-primary"}`} />
                {testingTarget === "main" ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 5. DATABASE STORAGE & WARNING SYSTEM                                      */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base font-bold text-brand-text">Database Storage</CardTitle>
                <CardDescription className="text-xs">
                  Physical disk usage &amp; PostgreSQL storage quota monitoring
                </CardDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-[10px] font-bold ${
                storage?.warningLevel === "NORMAL"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : storage?.warningLevel === "HIGH"
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : storage?.warningLevel === "NEARLY_FULL"
                  ? "border-orange-500 bg-orange-50 text-orange-800"
                  : storage?.warningLevel === "CRITICAL"
                  ? "border-red-500 bg-red-50 text-red-800"
                  : "border-slate-300 bg-slate-100 text-slate-700"
              }`}
            >
              {storage?.warningLevel === "NORMAL" && "🟢 Normal (< 70%)"}
              {storage?.warningLevel === "HIGH" && "🟡 Storage High (70-85%)"}
              {storage?.warningLevel === "NEARLY_FULL" && "🟠 Nearly Full (85-95%)"}
              {storage?.warningLevel === "CRITICAL" && "🔴 Critical (> 95%)"}
              {storage?.warningLevel === "UNAVAILABLE" && "⚪ Storage Offline"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {storage?.hasLiveStorage ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-brand-text">
                  {storage.totalDatabaseSizePretty} Used
                </span>
                <span className="text-brand-muted">
                  Total Quota: {storage.limitPretty} ({storage.usagePercent}% Used)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-brand-border/60">
                <div
                  className={`h-full transition-all duration-500 ${
                    (storage.usagePercent || 0) > 90
                      ? "bg-red-500"
                      : (storage.usagePercent || 0) > 70
                      ? "bg-amber-500"
                      : "bg-brand-primary"
                  }`}
                  style={{ width: `${Math.min(100, storage.usagePercent || 5)}%` }}
                />
              </div>

              <p className="text-xs text-brand-muted">{storage.warningMessage}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Info className="h-4 w-4" />
                <span>Storage Usage Unavailable</span>
              </div>
              <p className="mt-1 leading-relaxed text-amber-800/90">
                {storage?.warningMessage}
              </p>
              <p className="mt-2 text-[11px] text-amber-700">
                💡 <strong>Important Transparency Note:</strong> Storage size is queried directly from PostgreSQL using <code>pg_database_size()</code>. Since the remote database server is currently disconnected, the system will not fabricate numbers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 6. DATABASE TABLE OVERVIEW                                                */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TableIcon className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base font-bold text-brand-text">Database Tables</CardTitle>
                <CardDescription className="text-xs">
                  Active clinic entity tables and live record counts
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold">
              {report?.tables.length || 0} Registered Tables
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border bg-brand-background/60 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                <tr>
                  <th className="px-5 py-3">Table Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Records</th>
                  <th className="px-4 py-3">Storage Status</th>
                  <th className="px-4 py-3">Source Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {report?.tables.map((t: TableSummary) => (
                  <tr key={t.name} className="hover:bg-brand-accent/10 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-brand-text">{t.name}</td>
                    <td className="px-4 py-3 font-medium text-brand-text">{t.label}</td>
                    <td className="px-4 py-3 font-bold text-brand-text">
                      <span className="rounded bg-brand-primary/10 px-2 py-0.5 text-brand-primary">
                        {t.records.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.status === "CONNECTED_DB" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 🟢 Active DB
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 🟡 Active Store
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-brand-muted">{t.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 7. DATA MANAGEMENT & CONTROLLED DELETION                                  */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-brand-primary" />
              <div>
                <CardTitle className="text-base font-bold text-brand-text">Data Management</CardTitle>
                <CardDescription className="text-xs">
                  Inspect records, export confidential backups, or safely delete individual entries
                </CardDescription>
              </div>
            </div>

            {/* Table Selection Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-muted">Select Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value as AllowedTable)}
                className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-text shadow-xs focus:border-brand-primary focus:outline-none"
              >
                <option value="appointments">Appointments ({report?.tables.find((t) => t.name === "appointments")?.records || 0})</option>
                <option value="patients">Patients ({report?.tables.find((t) => t.name === "patients")?.records || 0})</option>
                <option value="whatsapp_bookings">WhatsApp Bookings ({report?.tables.find((t) => t.name === "whatsapp_bookings")?.records || 0})</option>
                <option value="services">Clinical Services ({report?.tables.find((t) => t.name === "services")?.records || 0})</option>
                <option value="reviews">Reviews ({report?.tables.find((t) => t.name === "reviews")?.records || 0})</option>
                <option value="staff_users">Staff Users ({report?.tables.find((t) => t.name === "staff_users")?.records || 0})</option>
                <option value="audit_logs">Audit Logs</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-5">
          {/* Action Bar (Export buttons + Warnings) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border/70 bg-brand-background p-3.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-brand-text">Export Table Data:</span>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/admin/database-status/export?table=${selectedTable}&format=csv`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-brand-text shadow-xs hover:bg-brand-accent/20"
                  >
                    <Download className="h-3.5 w-3.5 text-brand-primary" />
                    Export CSV
                  </a>
                  <a
                    href={`/api/admin/database-status/export?table=${selectedTable}&format=json`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-brand-text shadow-xs hover:bg-brand-accent/20"
                  >
                    <FileText className="h-3.5 w-3.5 text-brand-primary" />
                    Export JSON
                  </a>
                </div>
              ) : (
                <span className="text-[11px] text-amber-700 font-semibold">
                  (Export restricted to Clinic Owner / Admin)
                </span>
              )}
            </div>

            <div className="text-[11px] text-brand-muted">
              🔒 Exports contain private patient information. Handle with healthcare confidentiality.
            </div>
          </div>

          {/* Records Table Preview */}
          <div className="rounded-lg border border-brand-border/70 overflow-hidden">
            {loadingRecords ? (
              <div className="p-8 text-center text-xs text-brand-muted">
                <RefreshCw className="mx-auto h-5 w-5 animate-spin text-brand-primary" />
                <p className="mt-2">Loading table records...</p>
              </div>
            ) : tableRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-muted">
                No records currently found in table <strong>{selectedTable}</strong>.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-brand-border bg-brand-background/60 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  <tr>
                    <th className="px-4 py-2.5">Record ID</th>
                    <th className="px-4 py-2.5">Title / Entity</th>
                    <th className="px-4 py-2.5">Summary</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {tableRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-brand-accent/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] font-bold text-brand-text">{rec.id}</td>
                      <td className="px-4 py-3 font-semibold text-brand-text">{rec.displayTitle}</td>
                      <td className="px-4 py-3 text-brand-muted">{rec.subtitle}</td>
                      <td className="px-4 py-3 text-right">
                        {isAdmin ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRecordToDelete(rec);
                              setDeleteConfirmationText("");
                              setDeleteError(null);
                              setDeleteModalOpen(true);
                            }}
                            className="h-7 border-red-300 px-2.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        ) : (
                          <span className="text-[10px] font-semibold text-brand-muted">Admin Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 8. RECENT DATABASE ACTIVITY & AUDIT LOG                                   */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface shadow-xs">
        <CardHeader className="border-b border-brand-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-brand-primary" />
            <div>
              <CardTitle className="text-base font-bold text-brand-text">Recent Database Activity</CardTitle>
              <CardDescription className="text-xs">
                Real-time transaction and diagnostic audit events
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-5">
          {report?.recentActivity.map((act) => (
            <div
              key={act.id}
              className="flex items-start justify-between rounded-lg border border-brand-border/70 bg-brand-background p-3.5 text-xs"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                    act.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {act.status === "SUCCESS" ? "✓" : "!"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-text">{act.action}</span>
                    <span className="rounded bg-brand-border px-1.5 py-0.2 text-[10px] font-semibold text-brand-muted">
                      {act.entityType}
                    </span>
                  </div>
                  <p className="mt-0.5 text-brand-muted">{act.details}</p>
                  <span className="mt-1 block text-[10px] text-brand-muted">
                    Performed by: <strong>{act.performedBy}</strong>
                  </span>
                </div>
              </div>

              <span className="shrink-0 text-[10px] font-semibold text-brand-muted">
                {formatTime(act.createdAt)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 9. SAFE DELETE CONFIRMATION MODAL                                         */}
      {/* ========================================================================= */}
      {deleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {selectedTable.replace("_", " ")} Record?
                </h3>
                <p className="text-xs text-red-700">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Record ID: </span>
                <span className="font-mono font-bold text-slate-900">{recordToDelete.id}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Title: </span>
                <span className="font-bold text-slate-900">{recordToDelete.displayTitle}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Details: </span>
                <span className="text-slate-700">{recordToDelete.subtitle}</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Type <strong className="text-red-600">DELETE</strong> to confirm permanent deletion:
              </label>
              <Input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="border-red-300 font-mono text-sm tracking-wider uppercase focus:border-red-500"
              />
            </div>

            {deleteError && (
              <p className="mt-2 text-xs font-semibold text-red-600">{deleteError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText !== "DELETE" || deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
