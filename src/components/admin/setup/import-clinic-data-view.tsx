"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Users,
  Calendar,
  BriefcaseMedical,
  Stethoscope,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Loader2,
  RefreshCw,
  Database,
  Sliders,
  Info,
} from "lucide-react";

type EntityType = "patients" | "appointments" | "services" | "doctors";
type DuplicateStrategy = "update" | "skip" | "create";

interface HistoryItem {
  id: string;
  date: string;
  fileName: string;
  entityType: string;
  recordsCount: number;
  status: string;
  performedBy: string;
}

export function ImportClinicDataView() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("patients");
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>("update");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  // History and stats
  const [stats, setStats] = useState({
    totalPatients: 45,
    totalServices: 10,
    totalAppointments: 40,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load stats and history on mount
  const fetchStats = () => {
    fetch("/api/admin/setup/import")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          if (json.data.stats) setStats(json.data.stats);
          if (json.data.history) setHistory(json.data.history);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // CSV Template download
  const handleDownloadTemplate = (type: EntityType) => {
    let csvContent = "";
    let fileName = "";

    if (type === "patients") {
      fileName = "patients_import_template.csv";
      csvContent =
        "name,phone,gender,age,notes,address,bloodPressure\n" +
        "Rohan Patel,9825100000,male,32y,Routine dental checkup,Bilimora West,120/80\n" +
        "Pooja Shah,9825100001,female,28y,Crown restoration follow-up,Station Road Bilimora,118/76\n" +
        "Aarav Mehta,9825100002,male,12y,Fluoride application,College Road,110/70";
    } else if (type === "appointments") {
      fileName = "appointments_import_template.csv";
      csvContent =
        "patientName,phone,date,time,service,doctor,status\n" +
        "Rohan Patel,9825100000,2026-10-28,10:30 AM,General Consultation,Dr. Deep Arvindbhai Patel,CONFIRMED\n" +
        "Pooja Shah,9825100001,2026-10-28,04:00 PM,Teeth Cleaning & Scaling,Dr. Deep Arvindbhai Patel,CONFIRMED";
    } else if (type === "services") {
      fileName = "services_pricing_template.csv";
      csvContent =
        "serviceName,price,duration,category\n" +
        "Dental Consultation,300,15m,General Consultation\n" +
        "Root Canal Treatment: Molar,6000,45m,Endodontics\n" +
        "Composite Restoration,1000,30m,Restorative";
    } else {
      fileName = "doctors_import_template.csv";
      csvContent =
        "doctorName,qualification,specialty,phone,dailySlots\n" +
        "Dr. Deep Arvindbhai Patel,BDS,Dental Surgeon,+91 9664681536,40";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV string into headers and rows
  const parseCsvText = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) {
      throw new Error("File must contain at least a header row and one record row.");
    }

    const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      if (row.length === 0 || row.every((c) => !c)) continue;
      const obj: any = {};
      rawHeaders.forEach((h, idx) => {
        obj[h] = row[idx] || "";
      });
      records.push(obj);
    }

    return { headers: rawHeaders, records };
  };

  // Handle file selection
  const handleFile = (selectedFile: File) => {
    setParseError("");
    setImportResult(null);
    setFile(selectedFile);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (selectedFile.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHeaders(Object.keys(parsed[0]));
            setParsedData(parsed);
          } else {
            throw new Error("JSON file must be an array of objects.");
          }
        } else {
          const { headers: parsedHeaders, records } = parseCsvText(text);
          setHeaders(parsedHeaders);
          setParsedData(records);
        }
      } catch (err: any) {
        console.error("File parse error:", err);
        setParseError(err.message || "Failed to parse file. Please verify CSV or JSON format.");
        setParsedData([]);
        setHeaders([]);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setParseError("Could not read file.");
      setIsParsing(false);
    };

    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setParseError("");
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Run bulk import API
  const handleExecuteImport = async () => {
    if (!file || parsedData.length === 0) return;

    setIsImporting(true);
    setImportProgress(20);

    try {
      setImportProgress(50);
      const res = await fetch("/api/admin/setup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: selectedEntity,
          duplicateStrategy,
          fileName: file.name,
          records: parsedData,
        }),
      });

      const resData = await res.json().catch(() => null);
      setImportProgress(100);

      if (!res.ok || resData?.success === false) {
        throw new Error(resData?.message || resData?.error || "Import failed.");
      }

      setImportResult({
        success: true,
        message: resData.message || `Successfully imported ${parsedData.length} records!`,
        count: resData.data?.importedCount || parsedData.length,
      });

      fetchStats();
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || "Failed to process import.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 font-sans">
      {/* Top Breadcrumb Navigation */}
      <div className="mb-6 flex flex-col gap-2">
        <Link
          href="/admin/setup"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/admin/setup" className="hover:text-slate-700">
            Setup
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>Clinic</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-800">Import Clinic Data</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Import Clinic Data
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Quickly bulk-import your clinic records (Patients, Appointments, Services & Price List)
            from Excel spreadsheets, CSV, or JSON exports into CA Smile Dental Clinic.
          </p>
        </div>

        {/* Live System Records Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs">
            👥 {stats.totalPatients} Patients
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs">
            📅 {stats.totalAppointments} Bookings
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-2xs">
            🩺 {stats.totalServices} Services
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="space-y-8">
        {/* Step 1: Select Entity Type */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                STEP 1
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Choose Data Type to Import
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadTemplate(selectedEntity)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
              title="Download sample CSV template"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Download {selectedEntity} template (.csv)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: "patients",
                name: "Patients & Charts",
                desc: "Names, phone, age, gender, medical history & notes",
                icon: Users,
                color: "text-blue-600 bg-blue-50 border-blue-200",
              },
              {
                id: "appointments",
                name: "Appointments",
                desc: "Booking date, timeslot, doctor, service & status",
                icon: Calendar,
                color: "text-emerald-600 bg-emerald-50 border-emerald-200",
              },
              {
                id: "services",
                name: "Services & Fees",
                desc: "Treatment catalog, categories, pricing & duration",
                icon: BriefcaseMedical,
                color: "text-purple-600 bg-purple-50 border-purple-200",
              },
              {
                id: "doctors",
                name: "Doctors & Staff",
                desc: "Specialist doctor profiles, degrees & timings",
                icon: Stethoscope,
                color: "text-amber-600 bg-amber-50 border-amber-200",
              },
            ].map((ent) => {
              const isSelected = selectedEntity === ent.id;
              const Icon = ent.icon;
              return (
                <button
                  key={ent.id}
                  type="button"
                  onClick={() => {
                    setSelectedEntity(ent.id as EntityType);
                    clearFile();
                  }}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${ent.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="font-bold text-xs text-slate-900">{ent.name}</span>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {ent.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Upload File Area */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              STEP 2
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Upload Your File (.csv, .xlsx, .json)
            </h2>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="sr-only"
            />

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3 shadow-2xs">
              <UploadCloud className="h-6 w-6 stroke-[2]" />
            </div>

            <div className="text-sm font-bold text-slate-900">
              Click to browse or drag & drop file here
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Supports CSV format (Excel Export), JSON data up to 25MB
            </p>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">{file.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB ·{" "}
                    {isParsing ? (
                      <span className="text-blue-600">Analyzing columns...</span>
                    ) : (
                      <span className="font-semibold text-emerald-700">
                        {parsedData.length} records detected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={clearFile}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {parseError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Step 3: Preview Data & Settings (Shown when file is parsed) */}
        {parsedData.length > 0 && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  STEP 3
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Data Preview & Duplicate Handling
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Ready to import {parsedData.length} records</span>
                </span>
              </div>
            </div>

            {/* Duplicate Handling Strategies */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs font-bold text-slate-800 mb-2">
                Duplicate Record Resolution:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  {
                    id: "update",
                    label: "Update existing records",
                    desc: "Overwrites matching phone/name with new data (Recommended)",
                  },
                  {
                    id: "skip",
                    label: "Skip duplicates",
                    desc: "Ignores records that already exist in database",
                  },
                  {
                    id: "create",
                    label: "Import all as new",
                    desc: "Creates new IDs for all uploaded rows",
                  },
                ].map((strat) => (
                  <label
                    key={strat.id}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      duplicateStrategy === strat.id
                        ? "border-blue-500 bg-white shadow-2xs"
                        : "border-slate-200 bg-white/60 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={duplicateStrategy === strat.id}
                      onChange={() => setDuplicateStrategy(strat.id as DuplicateStrategy)}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{strat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{strat.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview Table (First 5 records) */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    {headers.slice(0, 6).map((h) => (
                      <th key={h} className="py-2.5 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      {headers.slice(0, 6).map((h) => (
                        <td key={h} className="py-2.5 px-3 font-medium text-slate-800">
                          {row[h] || <span className="text-slate-300 italic">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 5 && (
                <div className="bg-slate-50 px-4 py-2 text-center text-[11px] font-semibold text-slate-500 border-t border-slate-200">
                  Showing 5 of {parsedData.length} records from uploaded file.
                </div>
              )}
            </div>

            {/* Action Buttons & Execution */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={clearFile}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel & Clear File
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Importing ({importProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Import {parsedData.length} {selectedEntity} Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Success Message Banner */}
            {importResult && (
              <div
                className={`mt-4 flex items-center justify-between rounded-xl p-4 text-xs font-semibold ${
                  importResult.success
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {importResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  )}
                  <span>{importResult.message}</span>
                </div>

                {importResult.success && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={
                        selectedEntity === "patients"
                          ? "/admin/patients"
                          : selectedEntity === "services"
                          ? "/admin/setup/services"
                          : "/admin/appointment"
                      }
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    >
                      View Live Records →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Recent Import History Log */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Import History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit trail of bulk data files processed into the clinic database.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchStats}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Refresh log"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">File Name</th>
                  <th className="py-2.5 px-4">Entity Type</th>
                  <th className="py-2.5 px-4">Records</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No previous imports found. Select a data type and upload a CSV or JSON file above to import records.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.fileName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {item.entityType}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.recordsCount}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Check className="h-3 w-3" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {item.performedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
