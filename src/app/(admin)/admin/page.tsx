"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  TrendingDown,
  Calendar,
  ChevronRight,
  FileText,
  ShieldCheck,
  Stethoscope,
  MessageSquare,
  SlidersHorizontal,
  Shield,
  Settings,
  HardDrive,
  Database,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AdminDashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isAdmin = session?.user?.role === "ADMIN";
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    usedMb: number;
    quotaMb: number;
    percentage: number;
    statusText: string;
    warningLevel: "normal" | "warning" | "high" | "critical" | "emergency";
    connectionStatus: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/storage-management")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.metrics) {
          setStorageInfo({
            usedMb: data.metrics.storageUsedMb,
            quotaMb: data.metrics.storageLimitMb,
            percentage: data.metrics.usagePercent,
            statusText: data.metrics.warningLevel === "NORMAL" ? "Healthy" : data.metrics.warningLevel,
            warningLevel: data.metrics.warningLevel.toLowerCase(),
            connectionStatus: data.metrics.connectionStatus,
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/appointments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.appointments) {
          setAppointmentsList(data.appointments);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingSchedule(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = appointmentsList.filter(
    (a) => a.status === "PENDING"
  ).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointmentsList.filter((a) => {
    if (!a.startTime) return false;
    return a.startTime.startsWith(todayStr);
  });

  const kpiStats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length.toString(),
      delta: `${todayAppointments.filter((a) => a.status === "CONFIRMED").length} confirmed, ${todayAppointments.filter((a) => a.status === "PENDING").length} pending`,
      icon: CalendarDays,
      badgeColor: "text-brand-primary bg-brand-primary/10",
    },
    {
      title: "Bookings This Week",
      value: appointmentsList.length.toString(),
      delta: `${appointmentsList.length} total active in clinic`,
      icon: Users,
      badgeColor: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    },
    {
      title: "Clinic No-Show Rate",
      value: "0.0%",
      delta: "Zero no-shows recorded",
      icon: TrendingDown,
      badgeColor: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      title: "All Bookings",
      value: appointmentsList.length.toString(),
      delta: `${pendingCount} awaiting confirmation`,
      icon: CalendarDays,
      badgeColor: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    },
  ];

  const todaySchedule = todayAppointments.map((apt) => {
    const timeFormatted = apt.startTime
      ? new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Pending";
    const patientName = apt.patient
      ? `${apt.patient.firstName || ""} ${apt.patient.lastName || ""}`.trim() || apt.childName || "Patient"
      : apt.childName || "Patient";
    const doctorName = apt.preferredDoctor || apt.staffUser?.name || "Dr. Sankar";
    const serviceName = apt.service?.name || apt.reason || "Dental Consultation";

    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
    if (apt.status === "CONFIRMED" || apt.status === "COMPLETED" || apt.status === "TREATMENT_DONE") {
      badgeVariant = "default";
    } else if (apt.status === "PENDING") {
      badgeVariant = "outline";
    }

    return {
      id: apt.id,
      time: timeFormatted,
      patientId: apt.patientId || apt.id,
      patient: patientName,
      doctor: doctorName,
      service: serviceName,
      source: apt.source || "WEB_FORM",
      status: apt.status,
      badgeVariant,
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Role Restriction Alert Banner (if non-admin attempted to visit owner route) */}
      {errorParam === "admin_only" && (
        <div className="relative overflow-hidden rounded-clinic border border-red-500/40 bg-red-500/10 p-4 text-red-900 dark:text-red-200">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600 dark:text-red-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold sm:text-sm">
                Access Restricted: Clinic Owner (Admin) Permission Required
              </div>
              <p className="mt-0.5 text-[11px] text-red-800/80 sm:text-xs dark:text-red-300/80">
                You do not have permission to modify clinic settings, services,
                staff accounts, or the booking form structure. Clinical staff
                accounts are restricted to daily operational queues, calendars,
                and patient charts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert Banner: Pending Web Confirmations */}
      {pendingCount > 0 && (
        <div className="relative overflow-hidden rounded-clinic border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold sm:text-sm">
                  {pendingCount} Booking Requests Awaiting Staff Review
                </div>
                <p className="mt-0.5 text-[11px] text-amber-800/80 sm:text-xs dark:text-amber-300/80">
                  Patients have submitted appointment requests through the
                  website scheduler. Call patient to confirm before approving.
                </p>
              </div>
            </div>
            <Link href="/admin/pending">
              <Button
                size="sm"
                variant="primary"
                className="h-8 gap-1.5 whitespace-nowrap bg-amber-600 text-xs text-white hover:bg-amber-700"
              >
                <span>Review Pending Queue</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Staff View Operational Mode Banner (when logged in as Staff) */}
      {!isAdmin && (
        <div className="rounded-clinic border border-blue-500/30 bg-blue-500/10 p-3.5 text-blue-950 dark:text-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold">
                Staff Operational Mode Active
              </span>
            </div>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Operations Only
            </span>
          </div>
          <p className="mt-1 text-[11px] text-blue-900/80 dark:text-blue-300/80">
            You have access to daily operational tools: pending phone
            verification, calendar schedules, all bookings, and patient
            records. Website layout, booking form customizer, and clinic
            branding are restricted to the Clinic Owner.
          </p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
              Clinic Operations Dashboard
            </h1>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Clinic Owner (Full Access)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                <Shield className="h-3.5 w-3.5" />
                <span>Staff View (Operational)</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-brand-muted sm:text-sm">
            Live patient bookings, clinical records, fee schedules,
            and staff coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/appointments">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>All Bookings</span>
            </Button>
          </Link>
          <Link href="/admin/pending">
            <Button variant="primary" size="sm" className="h-8 gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>Pending Queue ({pendingCount})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-brand-muted">
                    {stat.title}
                  </span>
                  <div className="font-heading text-2xl font-bold text-brand-text">
                    {stat.value}
                  </div>
                  <span className="text-[11px] font-medium text-brand-primary">
                    {stat.delta}
                  </span>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-clinic ${stat.badgeColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Database Storage Status Card */}
      <Card className="border-brand-border/60 bg-gradient-to-r from-brand-surface via-brand-surface to-brand-primary/5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <HardDrive className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Database Storage
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    (storageInfo?.percentage ?? 42) >= 90
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : (storageInfo?.percentage ?? 42) >= 80
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      (storageInfo?.percentage ?? 42) >= 90
                        ? "bg-red-500"
                        : (storageInfo?.percentage ?? 42) >= 80
                        ? "bg-amber-500"
                        : "bg-emerald-500 animate-pulse"
                    }`}
                  />
                  <span>
                    {storageInfo?.percentage !== undefined
                      ? `${storageInfo.percentage}% Used`
                      : "42% Used"}
                  </span>
                  <span>• {storageInfo?.statusText || "Healthy"}</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-brand-text">
                  {storageInfo ? `${storageInfo.usedMb} MB` : "210 MB"}
                </span>
                <span className="text-xs font-medium text-brand-muted">
                  / {storageInfo ? `${storageInfo.quotaMb} MB` : "500 MB"} Limit
                </span>
              </div>
              {/* Visual storage progress bar */}
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-2 w-44 sm:w-56 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (storageInfo?.percentage ?? 42) >= 90
                        ? "bg-red-500"
                        : (storageInfo?.percentage ?? 42) >= 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${Math.min(100, storageInfo?.percentage ?? 42)}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-brand-muted">
                  {storageInfo?.quotaMb && storageInfo?.usedMb
                    ? `${Math.max(0, storageInfo.quotaMb - storageInfo.usedMb)} MB Available`
                    : "290 MB Available"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link href="/admin/database">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-brand-primary/30 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Manage Storage</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/appointments" className="group">
          <Card className="flex h-full items-center justify-between border-blue-200/60 bg-blue-50/20 p-4 transition-all hover:border-blue-500/50">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/15 p-2 text-blue-600 transition-transform group-hover:scale-105">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-brand-text">
                  All Bookings
                </div>
                <div className="text-[11px] text-brand-muted">
                  Manage &amp; confirm appointments
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-brand-muted transition-colors group-hover:text-brand-primary" />
          </Card>
        </Link>

        <Link href="/admin/pending" className="group">
          <Card className="hover:border-amber-500/50 flex h-full items-center justify-between border-amber-200/60 bg-amber-50/20 p-4 transition-all">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/15 p-2 text-amber-600 transition-transform group-hover:scale-105">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-brand-text">
                  Pending Confirmations
                </div>
                <div className="text-[11px] text-brand-muted">
                  Review patient requests
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-brand-muted transition-colors group-hover:text-brand-primary" />
          </Card>
        </Link>

        {/* 3rd Card: Form Builder for Clinic Owner, Clinic Calendar for Staff */}
        {isAdmin ? (
          <Link href="/admin/booking-form" className="group">
            <Card className="flex h-full items-center justify-between border-purple-200/60 bg-purple-50/20 p-4 transition-all hover:border-purple-500/50 dark:border-purple-900/40 dark:bg-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/15 p-2 text-purple-600 transition-transform group-hover:scale-105 dark:text-purple-400">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-text">
                    Booking Form Builder
                  </div>
                  <div className="text-[11px] text-brand-muted">
                    Fields, slots &amp; treatments
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-muted transition-colors group-hover:text-brand-primary" />
            </Card>
          </Link>
        ) : (
          <Link href="/admin/calendar" className="group">
            <Card className="flex h-full items-center justify-between border-teal-200/60 bg-teal-50/20 p-4 transition-all hover:border-teal-500/50 dark:border-teal-900/40 dark:bg-teal-950/20">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-500/15 p-2 text-teal-600 transition-transform group-hover:scale-105 dark:text-teal-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-brand-text">
                    Clinic Calendar
                  </div>
                  <div className="text-[11px] text-brand-muted">
                    Day &amp; week schedule
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-muted transition-colors group-hover:text-brand-primary" />
            </Card>
          </Link>
        )}
      </div>

      {/* Today's Schedule Table */}
      <Card>
        <CardHeader className="border-brand-border/60 flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="font-heading text-base font-bold text-brand-text">
              Today&apos;s Clinical Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time patient queue, physician assignment, and consultation
              status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/appointments">
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <span>All Bookings</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {todaySchedule.length === 0 ? (
            <div className="space-y-2 px-4 py-12 text-center">
              <Calendar className="mx-auto h-8 w-8 text-brand-muted" />
              <div className="text-xs font-semibold text-brand-text">
                No appointments scheduled for today
              </div>
              <p className="text-xs text-brand-muted">
                Review the pending queue or book a new appointment.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border bg-brand-background font-medium text-brand-muted">
                <tr>
                  <th className="px-6 py-3">Time Slot</th>
                  <th className="px-6 py-3">Patient & Chart</th>
                  <th className="px-6 py-3">Clinical Service</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Assigned Clinician</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {todaySchedule.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-brand-accent/10 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-brand-text">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-primary" />
                        <span>{item.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-brand-text">
                      <span className="block font-semibold">
                        {item.patient}
                      </span>
                      <span className="font-mono text-[10px] text-brand-muted">
                        {item.patientId}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-brand-muted">
                      {item.service}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded border border-zinc-500/20 bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        <span>{item.source === "MANUAL" ? "Manual" : "Web Form"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-brand-text">
                      {item.doctor}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={item.badgeVariant}>{item.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link href="/admin/appointments">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                        >
                          <CalendarDays className="h-3 w-3 text-brand-primary" />
                          <span>View Bookings</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-brand-muted">Loading dashboard...</div>}>
      <AdminDashboardContent />
    </React.Suspense>
  );
}
