"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  RefreshCw,
  Database,
  Sparkles,
  CheckCircle2,
  Table as TableIcon,
  ExternalLink,
  Settings,
  Link as LinkIcon,
  Copy,
  Check,
  AlertCircle,
  X,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";

type ActiveTab = "contacts" | "bookings";

interface ContactRow {
  rowNumber: number;
  id: string;
  patientNumber?: number;
  fullName: string;
  whatsappPhone: string;
  email: string;
  visits: number;
}

interface BookingRow {
  rowNumber: number;
  id: string;
  patientNo: string;
  patientName: string;
  phone: string;
  service: string;
  dateTime: string;
  doctor: string;
  status: string;
  source: string;
}

interface FeedbackRow {
  rowNumber: number;
  id: string;
  feedbackId: string;
  authorName: string;
  rating: string;
  comment: string;
  treatment: string;
  source: string;
  date: string;
  status: string;
}

interface GatewayData {
  clinicName: string;
  lastEditTime: string;
  stats: {
    contactsCount: number;
    bookingsCount: number;
    feedbackCount: number;
  };
  contacts: ContactRow[];
  bookings: BookingRow[];
  feedback: FeedbackRow[];
}

interface GoogleSheetConfig {
  webhookUrl: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  autoSyncOnBooking: boolean;
  syncStatus: "CONNECTED" | "DISCONNECTED" | "SYNCING" | "ERROR";
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  totalRowsSynced: number;
}

export function GoogleSheetsGateway() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("contacts");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<GatewayData>({
    clinicName: "SmileCraft Dental Studio",
    lastEditTime: "Just now",
    stats: { contactsCount: 0, bookingsCount: 0, feedbackCount: 0 },
    contacts: [],
    bookings: [],
    feedback: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>("Just now");

  // Google Sheet Live Connection State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"autosync" | "settings">("autosync");
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>({
    webhookUrl: "",
    spreadsheetUrl: "",
    spreadsheetId: "",
    autoSyncOnBooking: true,
    syncStatus: "DISCONNECTED",
    lastSyncedAt: null,
    lastSyncError: null,
    totalRowsSynced: 0,
  });
  const [appsScriptCode, setAppsScriptCode] = useState<string>("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingSync, setTestingSync] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Fetch Local Gateway Data
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/google-sheets");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
          setLastSyncTimestamp("Just now");
        }
      }
    } catch (err) {
      console.error("Failed to load Google Sheets gateway data:", err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  }, []);

  // 2. Fetch Google Sheet Webhook Configuration
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/google-sheets/config");
      if (res.ok) {
        const json = await res.json();
        if (json.config) setSheetConfig(json.config);
        if (json.appsScriptCode) setAppsScriptCode(json.appsScriptCode);
      }
    } catch (err) {
      console.error("Failed to fetch Google Sheet config:", err);
    }
  }, []);

  // Initial fetch and auto-refresh every 12 seconds
  useEffect(() => {
    fetchData();
    fetchConfig();
    const interval = setInterval(() => {
      fetchData();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchData, fetchConfig]);

  // Handle Test Webhook Connection
  const handleTestConnection = async (targetUrl?: string) => {
    setTestingSync(true);
    try {
      const urlToTest = targetUrl || sheetConfig.webhookUrl;
      const res = await fetch("/api/admin/google-sheets/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: urlToTest }),
      });
      const data = await res.json();
      if (data.connected) {
        showToast("Google Sheet connected successfully! Live sync is active.", "success");
      } else {
        showToast(data.message || "Google Sheet is disconnected. Please check deployment.", "error");
      }
      await fetchConfig();
    } catch (err: any) {
      showToast("Could not test connection: " + (err.message || "Error"), "error");
    } finally {
      setTestingSync(false);
    }
  };

  // Handle Save Google Sheet Configuration
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/google-sheets/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetConfig),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSheetConfig(resData.config);
        showToast("Google Sheet connection settings saved!", "success");
        if (resData.config.webhookUrl) {
          handleTestConnection(resData.config.webhookUrl);
        }
      } else {
        throw new Error(resData.message || "Failed to save settings");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save configuration", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle Full Live Sync to External Google Sheet
  const handleLiveSync = async () => {
    setTestingSync(true);
    try {
      const res = await fetch("/api/admin/google-sheets/sync", {
        method: "POST",
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Live sync completed successfully!", "success");
        fetchConfig();
        fetchData();
      } else {
        throw new Error(resData.message || "Failed to sync to Google Sheet");
      }
    } catch (err: any) {
      showToast(err.message || "Sync failed. Check Webhook URL.", "error");
    } finally {
      setTestingSync(false);
    }
  };

  // Sync Now Button (Syncs local database & Google Sheet Webhook if connected)
  const handleSyncNow = async () => {
    await fetchData(true);
    if (sheetConfig.webhookUrl && sheetConfig.webhookUrl.startsWith("http")) {
      handleLiveSync();
    } else {
      showToast("Data refreshed from database! (Connect Google Sheet to sync externally)", "success");
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open(`/api/admin/google-sheets/export?tab=${activeTab}`, "_blank");
  };

  // Copy Google Apps Script code to clipboard
  const handleCopyScript = () => {
    if (!appsScriptCode) return;
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const isLiveConnected =
    sheetConfig.syncStatus === "CONNECTED" &&
    Boolean(sheetConfig.webhookUrl && sheetConfig.webhookUrl.startsWith("http"));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xl transition-all animate-in slide-in-from-bottom-4 ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-50 text-emerald-900"
              : "border-red-500/40 bg-red-50 text-red-900"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER: Google Sheets & Spreadsheet Gateway                 */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Title & Icon */}
          <div className="flex items-center gap-3.5">
            {/* Google Sheets Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F9D58] text-white shadow-xs">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                  fill="white"
                  fillOpacity="0.25"
                />
                <path
                  d="M14 2V8H20"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 13H16M8 17H16M11 10H13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Google Sheets &amp; Spreadsheet Gateway
                </h1>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                  CSV Export &amp; SQLite Active
                </span>
                {isLiveConnected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Google Sheet Live</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 shadow-2xs">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    <span>Disconnected</span>
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                1-Click Export &amp; Webhook Sync for{" "}
                <span className="font-medium text-slate-700">Google Sheets</span>,{" "}
                <span className="font-medium text-slate-700">Microsoft Excel</span>, and Clinic Reporting
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Webhook Auto-Sync Badge */}
            {isLiveConnected ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                <span>Real-time Webhook Auto-Sync</span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/70 px-3.5 py-1.5 text-xs font-semibold text-red-700 shadow-2xs">
                <span>Webhook Disconnected</span>
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
              </div>
            )}

            {/* Connect / Open Live Google Sheet Button */}
            {isLiveConnected ? (
              <div className="flex items-center gap-1.5">
                {sheetConfig.spreadsheetUrl && (
                  <a
                    href={sheetConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(true)}
                  title="Configure Google Sheet Sync"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 transition shadow-2xs cursor-pointer"
                >
                  <LinkIcon className="h-3.5 w-3.5 text-red-600" />
                  <span>Connect Google Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={testingSync}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${testingSync ? "animate-spin" : ""}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            )}

            {/* Sync Now Button */}
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={refreshing || testingSync}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00897B] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#00796B] active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing || testingSync ? "animate-spin" : ""}`} />
              <span>{testingSync ? "Syncing..." : "Sync Now"}</span>
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Disconnected Alert Notice */}
        {!isLiveConnected && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-900 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Google Sheet is currently Disconnected</p>
                <p className="mt-0.5 text-red-700 text-[11px] leading-relaxed">
                  {sheetConfig.lastSyncError ||
                    "Webhook is not responding. Please make sure Google Apps Script is deployed as Web App with 'Who has access: Anyone' and a New version."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfigModalOpen(true)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-xs cursor-pointer"
              >
                Fix Connection
              </button>
              <button
                type="button"
                onClick={() => handleTestConnection()}
                disabled={testingSync}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {testingSync ? "Testing..." : "Test Connection"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO TAB OVERVIEW METRIC CARDS                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* TAB 1: CONTACTS CARD */}
        <div
          onClick={() => setActiveTab("contacts")}
          className={`cursor-pointer rounded-2xl p-5 transition-all shadow-xs ${
            activeTab === "contacts"
              ? "border-2 border-emerald-500 bg-white ring-4 ring-emerald-500/10"
              : "border border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TAB 1: CONTACTS
            </span>
            <Database className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {loading ? "..." : `${data.stats.contactsCount} Rows`}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Patient profiles, numbering, phone &amp; visits
          </p>
        </div>

        {/* TAB 2: BOOKINGS CARD */}
        <div
          onClick={() => setActiveTab("bookings")}
          className={`cursor-pointer rounded-2xl p-5 transition-all shadow-xs ${
            activeTab === "bookings"
              ? "border-2 border-emerald-500 bg-white ring-4 ring-emerald-500/10"
              : "border border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TAB 2: BOOKINGS
            </span>
            <TableIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {loading ? "..." : `${data.stats.bookingsCount} Rows`}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            All scheduled, pending &amp; past visits
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GOOGLE SHEET MASTER CONTAINER                                          */}
      {/* ========================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Top Header of Master Sheet */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-900 sm:text-sm">
              SmileCraft Dental Studio — Master Sheet
            </span>
            <span className="text-[11px] text-slate-400">
              Last edit was {lastSyncTimestamp}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isLiveConnected ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Auto-appending via WhatsApp Webhook</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Google Sheet Sync Paused (Disconnected)</span>
              </div>
            )}
          </div>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="overflow-x-auto min-h-[340px]">
          {/* TAB 1: CONTACTS TABLE */}
          {activeTab === "contacts" && (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-600 select-none">
                  <th className="w-12 border-r border-slate-200 px-3 py-2.5 text-center text-slate-400">
                    #
                  </th>
                  <th className="border-r border-slate-200 px-4 py-2.5">A: Patient No.</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">B: Full Name</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">C: WhatsApp Phone</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">D: Email</th>
                  <th className="px-4 py-2.5 text-center">E: Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {data.contacts.length === 0 ? (
                  <>
                    {[1, 2, 3, 4, 5].map((rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50">
                        <td className="w-12 border-r border-slate-200 bg-slate-50/50 py-2.5 text-center font-mono text-slate-400">
                          {rowIdx}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300">
                          {rowIdx === 1 ? (loading ? "Loading..." : "Waiting for auto-sync...") : ""}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="px-4 py-2.5 text-slate-300" />
                      </tr>
                    ))}
                  </>
                ) : (
                  data.contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-emerald-50/30 group"
                    >
                      <td className="w-12 border-r border-slate-200 bg-slate-50/60 py-2.5 text-center font-mono text-[11px] text-slate-400">
                        {c.rowNumber}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 font-mono text-xs font-semibold text-slate-700">
                        #{c.patientNumber ?? c.rowNumber}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 font-medium text-slate-900">
                        {c.fullName}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 font-mono text-slate-700">
                        {c.whatsappPhone}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 text-slate-600">
                        {c.email}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-slate-800">
                        {c.visits}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: BOOKINGS TABLE */}
          {activeTab === "bookings" && (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-600 select-none">
                  <th className="w-12 border-r border-slate-200 px-3 py-2.5 text-center text-slate-400">
                    #
                  </th>
                  <th className="border-r border-slate-200 px-4 py-2.5">A: Patient No.</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">B: Full Name</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">C: WhatsApp Phone</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">D: Service</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">E: Date &amp; Slot</th>
                  <th className="border-r border-slate-200 px-4 py-2.5">F: Doctor</th>
                  <th className="px-4 py-2.5">G: Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {data.bookings.length === 0 ? (
                  <>
                    {[1, 2, 3, 4, 5].map((rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50">
                        <td className="w-12 border-r border-slate-200 bg-slate-50/50 py-2.5 text-center font-mono text-slate-400">
                          {rowIdx}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300">
                          {rowIdx === 1 ? "No bookings recorded yet" : ""}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="border-r border-slate-100 px-4 py-2.5 text-slate-300" />
                        <td className="px-4 py-2.5 text-slate-300" />
                      </tr>
                    ))}
                  </>
                ) : (
                  data.bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="transition-colors hover:bg-emerald-50/30 group"
                    >
                      <td className="w-12 border-r border-slate-200 bg-slate-50/60 py-2.5 text-center font-mono text-[11px] text-slate-400">
                        {b.rowNumber}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 font-mono text-xs font-semibold text-slate-700">
                        {b.patientNo}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 font-medium text-slate-900">
                        {b.patientName}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 font-mono text-slate-700">
                        {b.phone}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 text-slate-800 font-medium">
                        {b.service}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 text-slate-600">
                        {b.dateTime}
                      </td>
                      <td className="border-r border-slate-100 px-4 py-2.5 text-slate-700">
                        {b.doctor}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM SHEET TABS BAR (Exact Google Sheets Style)                      */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-2.5">
          {/* Tab 1: Contacts */}
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`rounded-lg px-4 py-1 text-xs transition-all cursor-pointer ${
              activeTab === "contacts"
                ? "border-2 border-blue-600 bg-white font-bold text-blue-600 shadow-2xs"
                : "font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            Contacts
          </button>

          {/* Tab 2: Bookings */}
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`rounded-lg px-4 py-1 text-xs transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "border-2 border-blue-600 bg-white font-bold text-blue-600 shadow-2xs"
                : "font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            Bookings
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CONNECT LIVE GOOGLE SHEET MODAL                                        */}
      {/* ========================================================================= */}
      {configModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F9D58] text-white">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Connect Live Google Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automatically sync and store all patient data live into your personal Google Sheet.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfigModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab("autosync")}
                className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
                  modalTab === "autosync"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                ⚡ Automatic 1-Minute Live Scanner
              </button>
              <button
                type="button"
                onClick={() => setModalTab("settings")}
                className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
                  modalTab === "settings"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                ⚙️ Webhook & Link Settings
              </button>
            </div>

            {/* Tab 1: Automatic Live Scanner (Zero Formulas Required) */}
            {modalTab === "autosync" && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>⚡ Continuous Automatic Background Scanner</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Zero formulas required! Once enabled, this Google Apps Script runs continuously in the background, automatically scanning and updating all <strong>Contacts</strong> and <strong>Bookings</strong> every 1 minute 24/7.
                  </p>
                </div>

                <div className="space-y-2 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-slate-800">
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>⚡ Quick 30-Second Setup:</span>
                    {sheetConfig.spreadsheetUrl && (
                      <a
                        href={sheetConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        <span>Open Your Google Sheet</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <ol className="list-decimal pl-4 text-[11px] space-y-1.5 text-slate-700">
                    <li>
                      In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong> in the top menu.
                    </li>
                    <li>
                      Select all existing code in the editor, press <strong>Delete</strong>, and paste the script below.
                    </li>
                    <li>
                      In the top toolbar function dropdown, select <strong>populateSheetNow</strong> and click <strong>Run (▶️)</strong>.
                    </li>
                    <li className="text-emerald-800 font-semibold">
                      Accept Google permissions once (Review Permissions &gt; Advanced &gt; Go to Untitled project &gt; Allow). Done! All 3 tabs will populate immediately with styled green headers!
                    </li>
                  </ol>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">Google Apps Script Auto-Scanner Code</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                        v2.0 Auto-Scanner
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Script Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="max-h-52 overflow-y-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-100 border border-slate-800 leading-relaxed select-all">
                    {appsScriptCode || "// Loading script code..."}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    💡 Also adds a <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">🏥 Clinic Live Sync</code> menu directly in your Google Sheet!
                  </span>

                  <button
                    type="button"
                    onClick={() => setModalTab("settings")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Webhook Settings &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Connection Settings */}
            {modalTab === "settings" && (
              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Sheets Webhook URL (from Apps Script)
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={sheetConfig.webhookUrl}
                    onChange={(e) =>
                      setSheetConfig((prev) => ({ ...prev, webhookUrl: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Deployed Google Apps Script Web App URL ending with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/exec</code>.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Google Spreadsheet Public/View Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit"
                    value={sheetConfig.spreadsheetUrl}
                    onChange={(e) =>
                      setSheetConfig((prev) => ({ ...prev, spreadsheetUrl: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct browser link so you can click &quot;Open in Google Sheets&quot; anytime.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <input
                    type="checkbox"
                    id="autoSyncCheck"
                    checked={sheetConfig.autoSyncOnBooking}
                    onChange={(e) =>
                      setSheetConfig((prev) => ({ ...prev, autoSyncOnBooking: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="autoSyncCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Automatically append new patient bookings to Google Sheet in real time
                  </label>
                </div>

                {/* Connection Status Box */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Status: </span>
                      <span
                        className={`font-bold ${
                          isLiveConnected ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {isLiveConnected ? "CONNECTED (Google Sheet Live)" : "DISCONNECTED"}
                      </span>
                    </div>
                    {sheetConfig.lastSyncError && (
                      <p className="text-[11px] text-red-600 mt-1 max-w-md leading-relaxed">
                        {sheetConfig.lastSyncError}
                      </p>
                    )}
                    {sheetConfig.lastSyncedAt && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Last synced: {new Date(sheetConfig.lastSyncedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTestConnection()}
                      disabled={testingSync}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${testingSync ? "animate-spin" : ""}`} />
                      <span>{testingSync ? "Testing..." : "Test Connection"}</span>
                    </button>
                    {isLiveConnected && (
                      <button
                        type="button"
                        onClick={handleLiveSync}
                        disabled={testingSync}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>{testingSync ? "Syncing..." : "Push All Data Now"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConfigModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="rounded-xl bg-[#0F9D58] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b8043] disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {savingConfig ? "Saving..." : "Save Connection"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
