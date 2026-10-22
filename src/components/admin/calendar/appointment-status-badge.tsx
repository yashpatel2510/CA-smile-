import React from "react";
import {
  Clock,
  CheckCircle2,
  UserCheck,
  PlayCircle,
  Check,
  XCircle,
  UserX,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export type AppointmentStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "TREATMENT_STARTED"
  | "TREATMENT_DONE"
  | "CANCELLED"
  | "NO_SHOW"
  | "DECLINED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | string;

interface StatusBadgeProps {
  status: AppointmentStatusValue;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function AppointmentStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const normStatus = (status || "PENDING").toUpperCase();

  let colorClasses = "bg-slate-100 text-slate-800 border-slate-300";
  let label = normStatus;
  let IconComponent = Clock;

  switch (normStatus) {
    case "PENDING":
      colorClasses =
        "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      label = "Pending";
      IconComponent = Clock;
      break;

    case "CONFIRMED":
      colorClasses =
        "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      label = "Confirmed";
      IconComponent = CheckCircle2;
      break;

    case "CHECKED_IN":
      colorClasses =
        "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      label = "Checked In";
      IconComponent = UserCheck;
      break;

    case "TREATMENT_STARTED":
    case "IN_PROGRESS":
      colorClasses =
        "bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
      label = "Treatment Started";
      IconComponent = PlayCircle;
      break;

    case "TREATMENT_DONE":
    case "COMPLETED":
      colorClasses =
        "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      label = "Treatment Done";
      IconComponent = Sparkles;
      break;

    case "CANCELLED":
    case "DECLINED":
      colorClasses =
        "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      label = normStatus === "DECLINED" ? "Declined" : "Cancelled";
      IconComponent = XCircle;
      break;

    case "NO_SHOW":
      colorClasses =
        "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      label = "No Show";
      IconComponent = UserX;
      break;

    default:
      colorClasses = "bg-slate-100 text-slate-800 border-slate-200";
      label = status;
      IconComponent = AlertCircle;
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5 gap-1"
      : size === "lg"
      ? "text-xs px-2.5 py-1 gap-1.5 font-bold"
      : "text-[11px] px-2 py-0.5 gap-1 font-semibold";

  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-colors shrink-0 ${sizeClasses} ${colorClasses} ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSize} shrink-0`} />}
      <span>{label}</span>
    </span>
  );
}

export function getStatusColorClass(status: string) {
  const norm = (status || "").toUpperCase();
  switch (norm) {
    case "PENDING":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "CONFIRMED":
      return "border-blue-300 bg-blue-50 text-blue-900";
    case "CHECKED_IN":
      return "border-purple-300 bg-purple-50 text-purple-900";
    case "TREATMENT_STARTED":
    case "IN_PROGRESS":
      return "border-orange-300 bg-orange-50 text-orange-900";
    case "TREATMENT_DONE":
    case "COMPLETED":
      return "border-emerald-300 bg-emerald-50 text-emerald-900";
    case "CANCELLED":
    case "DECLINED":
      return "border-rose-300 bg-rose-50 text-rose-900";
    case "NO_SHOW":
      return "border-slate-300 bg-slate-100 text-slate-700";
    default:
      return "border-slate-300 bg-slate-50 text-slate-800";
  }
}
