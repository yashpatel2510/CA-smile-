"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
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
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { ClinicLogo } from "@/components/ui/clinic-logo";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { currentTheme, brandConfig } = useClinicTheme();
  const isAdmin = session?.user?.role === "ADMIN";

  // 1. Daily Clinical Operations (Visible to both Staff and Admin)
  const operationalNav = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Pending Confirmations",
      href: "/admin/pending",
      icon: Clock,
      badge: "Queue",
    },
    {
      name: "All Bookings",
      href: "/admin/appointments",
      icon: CalendarDays,
    },
    {
      name: "Patients",
      href: "/admin/patients",
      icon: Users,
    },
  ];

  // 2. Clinic Owner & Structural Controls (EXCLUSIVELY for Admin/Owner)
  const ownerAdminNav = [
    {
      name: "Booking Form Config",
      href: "/admin/booking-form",
      icon: SlidersHorizontal,
      badge: "Builder",
    },
    { name: "Clinic Branding", href: "/admin/settings", icon: Settings },
    {
      name: "Services & Treatments",
      href: "/admin/services",
      icon: BriefcaseMedical,
    },
    {
      name: "Staff Management",
      href: "/admin/staff",
      icon: UserCog,
    },
    {
      name: "Patient Reviews",
      href: "/admin/reviews",
      icon: Star,
      badge: "Google",
    },
    {
      name: "Q&A Management",
      href: "/admin/faqs",
      icon: HelpCircle,
      badge: "Live",
    },
    {
      name: "Database",
      href: "/admin/database",
      icon: Database,
      badge: "Active",
    },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-brand-border bg-brand-surface transition-colors">
      <div className="overflow-y-auto">
        {/* Clinic Admin Brand */}
        <div className="border-b border-brand-border p-6">
          <Link href="/admin" className="group flex items-center gap-3">
            <ClinicLogo size="sm" />
            <div>
              <div className="font-heading text-sm font-bold text-brand-text">
                {brandConfig?.logo?.clinicDisplayName || "HealthSphere"}
              </div>
              <div className="text-[11px] text-brand-muted">
                {brandConfig?.logo?.tagline || "Clinical Portal"}
              </div>
            </div>
          </Link>

          <div className="bg-brand-accent/30 border-brand-border/60 mt-3 flex items-center justify-between rounded-clinic border px-2.5 py-1.5 text-[11px] font-medium text-brand-primary">
            <span className="truncate font-semibold">
              {isAdmin ? "Role: Clinic Owner (Admin)" : "Role: Clinical Staff"}
            </span>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                isAdmin ? "animate-pulse bg-emerald-500" : "bg-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Operational Navigation (For All Staff & Admin) */}
        <nav className="space-y-1 p-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
            Daily Clinical Desk
          </div>
          {operationalNav.map((item) => {
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
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.badge}
                  </span>
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
          ) : (
            /* Staff Mode Explanatory Notice */
            <div className="shadow-xs mx-1 mt-4 space-y-1 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-[11px] text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Shield className="h-3.5 w-3.5" />
                <span>Staff Access Active</span>
              </div>
              <p className="text-[10px] leading-tight text-amber-700">
                Daily operational access (Appointments, Phone Verification &amp;
                Calendar). Website structure, form builder, and branding are
                restricted to the Clinic Owner.
              </p>
            </div>
          )}
        </nav>
      </div>

      {/* Back to Public Site link */}
      <div className="space-y-2 border-t border-brand-border p-4">
        <Link
          href="/"
          className="hover:bg-brand-accent/20 flex items-center justify-between rounded-clinic border border-brand-border p-2.5 text-xs font-medium text-brand-text transition-colors"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-brand-primary" />
            <span>Public Clinic Website</span>
          </div>
          <ArrowUpRight className="h-3 w-3 text-brand-muted" />
        </Link>
      </div>
    </aside>
  );
}
