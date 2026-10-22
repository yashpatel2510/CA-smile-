"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  HardDrive,
  Database,
  Activity,
  Code2,
  Table as TableIcon,
  Archive,
  Layers,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorageDashboard } from "@/components/admin/storage-dashboard";
import { DatabaseStatusSection } from "@/components/admin/database-status";

type DatabaseTab = "storage" | "status" | "all";

export function DatabaseHub() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as DatabaseTab | null;

  const [activeTab, setActiveTab] = useState<DatabaseTab>("storage");

  useEffect(() => {
    if (tabParam && ["storage", "status", "all"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (typeof window !== "undefined" && window.location.hash === "#database-status") {
      setActiveTab("status");
    }
  }, [tabParam]);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <Link href="/admin" className="hover:text-brand-primary">
              Admin Panel
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/settings" className="hover:text-brand-primary">
              Settings
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-brand-text">Database &amp; Storage</span>
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            Database &amp; Storage Center
          </h1>
          <p className="mt-0.5 text-xs text-brand-muted sm:text-sm">
            Complete database management: live PostgreSQL connections, storage limits, data retention, SQL query catalog, and table records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <span>Clinic Branding Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-border/80 bg-brand-surface/95 p-2 shadow-xs backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "storage"
              ? "bg-brand-primary text-white shadow-xs"
              : "border border-brand-border bg-white text-brand-text hover:border-brand-primary hover:bg-brand-primary/10"
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          <span>Storage &amp; Data Retention</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
            500 MB
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "status"
              ? "bg-brand-primary text-white shadow-xs"
              : "border border-brand-border bg-white text-brand-text hover:border-brand-primary hover:bg-brand-primary/10"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Connections &amp; System Health</span>
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
            2 DBs
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-brand-primary text-white shadow-xs"
              : "border border-brand-border bg-white text-brand-text hover:border-brand-primary hover:bg-brand-primary/10"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Database Information (Combined)</span>
        </button>
      </div>

      {/* TAB CONTENT: Storage & Retention */}
      {activeTab === "storage" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <StorageDashboard />
        </div>
      )}

      {/* TAB CONTENT: Connections & System Health */}
      {activeTab === "status" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <DatabaseStatusSection />
        </div>
      )}

      {/* TAB CONTENT: All Database Information Combined */}
      {activeTab === "all" && (
        <div className="space-y-10 animate-in fade-in-50 duration-200">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-brand-border pb-2">
              <h2 className="font-heading text-lg font-bold text-brand-text flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-brand-primary" />
                <span>Part 1: Storage Quota, Data Retention &amp; Queries</span>
              </h2>
              <Badge variant="default">Section 1</Badge>
            </div>
            <StorageDashboard />
          </div>

          <div className="pt-6 border-t-2 border-brand-border/80">
            <div className="mb-4 flex items-center justify-between border-b border-brand-border pb-2">
              <h2 className="font-heading text-lg font-bold text-brand-text flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-primary" />
                <span>Part 2: PostgreSQL Connections, System Health &amp; Table Records</span>
              </h2>
              <Badge variant="default">Section 2</Badge>
            </div>
            <DatabaseStatusSection />
          </div>
        </div>
      )}
    </div>
  );
}
