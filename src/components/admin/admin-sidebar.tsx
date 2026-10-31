"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Calendar,
  CalendarCheck,
  Clock,
  BriefcaseMedical,
  UserCog,
  Settings,
  ArrowUpRight,
  Shield,
  Stethoscope,
  SlidersHorizontal,
  Star,
  Database,
  Users,
  HelpCircle,
  FileSpreadsheet,
  Cog,
  Smile,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { ClinicLogo } from "@/components/ui/clinic-logo";
import { useAdminSidebar } from "@/components/admin/admin-sidebar-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { currentTheme, brandConfig } = useClinicTheme();
  const { isCollapsed, toggleSidebar } = useAdminSidebar();
  const isAdmin = session?.user?.role === "ADMIN";

  const [dbStatus, setDbStatus] = useState<"ONLINE" | "OFFLINE" | "TEST">("ONLINE");
  const [userPermissions, setUserPermissions] = useState<{
    allowedSections: string[];
    role: string;
    isSuperAdmin: boolean;
  }>({
    allowedSections: [
      "today",
      "appointments",
      "patients",
      "doctor",
      "services",
      "billing",
      "whatsapp",
      "reviews",
      "faqs",
      "database",
      "setup",
      "staff",
    ],
    role: isAdmin ? "ADMIN" : "STAFF",
    isSuperAdmin: isAdmin,
  });

  useEffect(() => {
    let mounted = true;
    const fetchPerms = async () => {
      try {
        const res = await fetch("/api/admin/roles/my-permissions");
        if (res.ok) {
          const data = await res.json();
          if (mounted && data) {
            setUserPermissions(data);
          }
        }
      } catch {}
    };
    fetchPerms();
    return () => {
      mounted = false;
    };
  }, [session, isAdmin]);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/admin/database/status");
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.status) {
            setDbStatus(data.status);
          }
        }
      } catch {}
    };
    checkStatus();
    const handleModeSwitch = () => checkStatus();
    window.addEventListener("database-mode-changed", handleModeSwitch);
    window.addEventListener("focus", handleModeSwitch);
    window.addEventListener("storage", handleModeSwitch);
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      window.removeEventListener("database-mode-changed", handleModeSwitch);
      window.removeEventListener("focus", handleModeSwitch);
      window.removeEventListener("storage", handleModeSwitch);
      clearInterval(interval);
    };
  }, []);

  // 1. Daily Clinical Operations (Visible to both Staff and Admin based on permissions)
  const operationalNav = [
    {
      name: "Appointments",
      href: "/admin/appointment",
      icon: Calendar,
      sectionId: "appointments",
      badge: dbStatus === "TEST" ? "Test" : dbStatus === "ONLINE" ? "Online" : "Offline",
      isDbBadge: true,
    },
    {
      name: "CA Smile",
      href: "/admin/today",
      icon: Smile,
      sectionId: "today",
    },
    {
      name: "Doctor",
      href: "/admin/doctor",
      icon: Stethoscope,
      sectionId: "doctor",
    },
    {
      name: "Patients",
      href: "/admin/patients",
      icon: Users,
      sectionId: "patients",
    },
    {
      name: "Google Sheets",
      href: "/admin/google-sheets",
      icon: FileSpreadsheet,
      sectionId: "setup",
      badge: "Live",
    },
  ];

  // 2. Clinic Owner & Structural Controls (Filtered by section permissions for non-admins)
  const ownerAdminNav = [
    {
      name: "Booking Form Config",
      href: "/admin/booking-form",
      icon: SlidersHorizontal,
      sectionId: "setup",
      badge: "Builder",
    },
    { name: "Clinic Branding", href: "/admin/settings", icon: Settings, sectionId: "setup" },
    {
      name: "Services & Treatments",
      href: "/admin/services",
      icon: BriefcaseMedical,
      sectionId: "services",
    },
    {
      name: "Staff Management",
      href: "/admin/staff",
      icon: UserCog,
      sectionId: "staff",
    },
    {
      name: "Patient Reviews",
      href: "/admin/reviews",
      icon: Star,
      sectionId: "reviews",
      badge: "Google",
    },
    {
      name: "Q&A Management",
      href: "/admin/faqs",
      icon: HelpCircle,
      sectionId: "faqs",
      badge: "Live",
    },
    {
      name: "Database",
      href: "/admin/database",
      icon: Database,
      sectionId: "database",
      badge: "Active",
    },
    {
      name: "Setup",
      href: "/admin/setup",
      icon: Cog,
      sectionId: "setup",
    },
  ];

  const visibleOperationalNav = isAdmin
    ? operationalNav
    : operationalNav.filter((item) =>
        userPermissions.allowedSections.includes(item.sectionId)
      );

  const permittedManagementNav = ownerAdminNav.filter((item) =>
    userPermissions.allowedSections.includes(item.sectionId)
  );

  return (
    <aside
      className={`flex shrink-0 flex-col justify-between border-brand-border bg-brand-surface transition-[width,opacity] duration-300 ease-in-out overflow-hidden ${
        isCollapsed
          ? "w-0 border-r-0 opacity-0 pointer-events-none"
          : "w-64 border-r opacity-100"
      }`}
      aria-hidden={isCollapsed}
    >
      <div className="flex h-full w-64 flex-col justify-between">
        <div className="overflow-y-auto">
          {/* Clinic Admin Brand & Collapse Toggle */}
          <div className="border-b border-brand-border p-4">
            <div className="flex items-center justify-between gap-2">
              <Link href="/admin/today" className="group flex items-center gap-2.5 min-w-0">
                <ClinicLogo size="sm" />
                <div className="min-w-0">
                  <div className="font-heading text-sm font-bold text-brand-text truncate">
                    {brandConfig?.logo?.clinicDisplayName || "HealthSphere"}
                  </div>
                  <div className="text-[11px] text-brand-muted truncate">
                    {brandConfig?.logo?.tagline || "Clinical Portal"}
                  </div>
                </div>
              </Link>

              {/* Sidebar Collapse Toggle Button */}
              <button
                type="button"
                onClick={toggleSidebar}
                title="Hide sidebar (Cmd/Ctrl + B)"
                aria-label="Hide sidebar"
                className="group inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-2xl border border-slate-200/90 bg-slate-50/90 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 shadow-2xs transition-all cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <PanelLeftClose className="h-5 w-5 transition-transform group-hover:scale-105" />
              </button>
            </div>

            <div className="bg-brand-accent/30 border-brand-border/60 mt-3 flex items-center justify-between rounded-clinic border px-2.5 py-1.5 text-[11px] font-medium text-brand-primary">
              <span className="truncate font-semibold capitalize">
                {isAdmin
                  ? "Role: Clinic Owner (Admin)"
                  : `Role: ${userPermissions.role.replace(/_/g, " ").toLowerCase()}`}
              </span>
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isAdmin ? "animate-pulse bg-emerald-500" : "bg-blue-500"
                }`}
              />
            </div>
          </div>

        {/* Operational Navigation (Filtered by section permissions) */}
        <nav className="space-y-1 p-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
            Daily Clinical Desk
          </div>
          {visibleOperationalNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-clinic px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "shadow-xs bg-brand-primary font-semibold text-brand-primary-foreground"
                    : "hover:bg-brand-accent/20 text-brand-muted hover:text-brand-text"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.name === "CA Smile" ? (
                    <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/ca-smile-logo-light.png"
                        alt="CA Smile"
                        className={`h-3.5 w-3.5 object-contain ${
                          isActive ? "brightness-0 invert" : ""
                        }`}
                      />
                    </div>
                  ) : (
                    <Icon className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  (item as any).isDbBadge ? (
                    dbStatus === "TEST" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 text-[9px] font-bold dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 shadow-2xs">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                        </span>
                        Test
                      </span>
                    ) : dbStatus === "ONLINE" ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 text-[9px] font-bold dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Offline
                      </span>
                    )
                  ) : (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                )}
              </Link>
            );
          })}

          {/* Owner-Only Section: Strictly rendered when isAdmin === true */}
          {isAdmin ? (
            <div className="border-brand-border/60 mt-3 border-t pt-4">
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Clinic Owner Settings
                </span>
                <span className="py-0.2 rounded bg-purple-100 px-1.5 text-[9px] font-extrabold text-purple-800">
                  Admin
                </span>
              </div>
              <div className="space-y-1">
                {ownerAdminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  const isSetup = item.href === "/admin/setup";
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between rounded-clinic px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? "shadow-xs bg-emerald-600 font-semibold text-white dark:bg-emerald-600"
                          : isSetup
                            ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/90 hover:bg-emerald-100/90 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60"
                            : "hover:bg-brand-accent/20 text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isSetup && !isActive
                              ? "text-emerald-700 dark:text-emerald-400"
                              : ""
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            isActive
                              ? "bg-white/20 text-white"
                              : isSetup
                                ? "bg-emerald-200 text-emerald-950"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : permittedManagementNav.length > 0 ? (
            /* Staff Mode With Permitted Management Modules */
            <div className="border-brand-border/60 mt-3 border-t pt-4">
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                  Authorized Management
                </span>
                <span className="py-0.2 rounded bg-blue-100 px-1.5 text-[9px] font-extrabold text-blue-800">
                  Access
                </span>
              </div>
              <div className="space-y-1">
                {permittedManagementNav.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between rounded-clinic px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? "shadow-xs bg-brand-primary font-semibold text-brand-primary-foreground"
                          : "hover:bg-brand-accent/20 text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Staff Mode Explanatory Notice */
            <div className="shadow-xs mx-1 mt-4 space-y-1 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-[11px] text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Shield className="h-3.5 w-3.5" />
                <span>Staff Access Active</span>
              </div>
              <p className="text-[10px] leading-tight text-amber-700">
                Operational desk access is active. Sections are customized based on your clinic role and privileges.
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section: Only Log Out */}
      <div className="border-t border-brand-border/80 p-3 bg-white dark:bg-slate-900">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 dark:text-slate-300 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs"
          title="Log out of clinic admin"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
      </div>
    </aside>
  );
}
