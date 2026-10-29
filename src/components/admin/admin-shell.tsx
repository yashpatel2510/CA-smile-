"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAdminSidebar } from "@/components/admin/admin-sidebar-context";
import { PanelLeftOpen, FlaskConical } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const { isCollapsed, toggleSidebar } = useAdminSidebar();
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkMode = async () => {
      try {
        const res = await fetch("/api/admin/database/test-mode");
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.success) {
            setIsTestMode(data.activeMode === "test");
          }
        }
      } catch {}
    };
    checkMode();
    const interval = setInterval(checkMode, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-brand-background text-brand-text">
      <AdminSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Global Test Mode Notification Banner */}
        {isTestMode && (
          <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b border-amber-600/60 shadow-xs z-30 shrink-0">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 animate-pulse" />
              <span>TEST DATABASE ACTIVE — Operations are isolated in the Sandbox Database. Live clinic records are safe.</span>
            </div>
            <Link href="/admin/database" className="underline hover:text-black">
              Switch in Database Panel
            </Link>
          </div>
        )}

        {/* Toggle button to open sidebar when collapsed */}
        {isCollapsed && (
          <div className="fixed top-3.5 left-3.5 z-50 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Open sidebar (Cmd/Ctrl + B)"
              aria-label="Open sidebar"
              className="group inline-flex items-center justify-center h-9 w-9 rounded-2xl border border-slate-200/90 bg-white/95 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 shadow-md backdrop-blur-xs transition-all cursor-pointer dark:bg-slate-900/95 dark:border-slate-700 dark:text-slate-200"
            >
              <PanelLeftOpen className="h-5 w-5 transition-transform group-hover:scale-105" />
            </button>
          </div>
        )}
        <main
          className={`flex-1 overflow-y-auto transition-[padding] duration-300 ${
            isCollapsed ? "pl-12 sm:pl-14" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}


