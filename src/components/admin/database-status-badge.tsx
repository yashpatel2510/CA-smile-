"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export type DatabaseStatus = "ONLINE" | "OFFLINE" | "TEST";

interface DatabaseStatusBadgeProps {
  size?: "xs" | "sm" | "md";
  className?: string;
  showTooltip?: boolean;
  linkToSettings?: boolean;
}

export function DatabaseStatusBadge({
  size = "sm",
  className = "",
  showTooltip = true,
  linkToSettings = true,
}: DatabaseStatusBadgeProps) {
  const [status, setStatus] = useState<DatabaseStatus>("ONLINE");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/database/status");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.status) {
          setStatus(data.status);
          setLatencyMs(data.latencyMs ?? null);
        }
      } else {
        setStatus("OFFLINE");
      }
    } catch {
      setStatus("OFFLINE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Listen for custom database mode switch events
    const handleModeSwitch = () => fetchStatus();
    window.addEventListener("database-mode-changed", handleModeSwitch);
    window.addEventListener("focus", handleModeSwitch);
    window.addEventListener("storage", handleModeSwitch);

    // Poll every 12 seconds
    const interval = setInterval(fetchStatus, 12000);

    return () => {
      window.removeEventListener("database-mode-changed", handleModeSwitch);
      window.removeEventListener("focus", handleModeSwitch);
      window.removeEventListener("storage", handleModeSwitch);
      clearInterval(interval);
    };
  }, [fetchStatus]);

  // Size styling
  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] font-bold gap-1",
    sm: "px-2.5 py-0.5 text-[11px] font-bold gap-1.5",
    md: "px-3 py-1 text-xs font-semibold gap-1.5",
  }[size];

  const dotSize = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2 w-2",
  }[size];

  // Tooltip content
  const tooltipText =
    status === "TEST"
      ? "Test Database Active: Sandbox mode enabled with blinking status indicator. Live clinic records protected."
      : status === "ONLINE"
      ? `Main Production Database Online${latencyMs ? ` (${latencyMs}ms)` : ""}: Ready for live appointments.`
      : "Database Offline: Unable to reach database server. Check connection.";

  // Render badge content
  const badgeContent = (
    <>
      {status === "TEST" && (
        <>
          <span className={`relative flex ${dotSize} shrink-0`}>
            {/* Blinking radar ping animation */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            {/* Pulsing core dot */}
            <span className={`relative inline-flex rounded-full ${dotSize} bg-amber-500 shadow-sm shadow-amber-500/50`}></span>
          </span>
          <span className="tracking-tight">Test</span>
        </>
      )}

      {status === "ONLINE" && (
        <>
          <span className={`relative flex ${dotSize} shrink-0`}>
            <span className={`inline-flex rounded-full ${dotSize} bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse`}></span>
          </span>
          <span className="tracking-tight">Online</span>
        </>
      )}

      {status === "OFFLINE" && (
        <>
          <span className={`relative flex ${dotSize} shrink-0`}>
            <span className={`inline-flex rounded-full ${dotSize} bg-rose-500 shadow-sm shadow-rose-500/50`}></span>
          </span>
          <span className="tracking-tight">Offline</span>
        </>
      )}
    </>
  );

  // Status color containers
  const statusContainerClasses =
    status === "TEST"
      ? "border-amber-300/90 bg-amber-50 text-amber-900 shadow-2xs dark:bg-amber-950/50 dark:border-amber-700/70 dark:text-amber-200"
      : status === "ONLINE"
      ? "border-emerald-200/90 bg-emerald-50 text-emerald-800 shadow-2xs dark:bg-emerald-950/50 dark:border-emerald-800/70 dark:text-emerald-200"
      : "border-rose-200/90 bg-rose-50 text-rose-800 shadow-2xs dark:bg-rose-950/50 dark:border-rose-800/70 dark:text-rose-200";

  const wrapperClasses = `inline-flex items-center rounded-full border transition-all duration-200 select-none ${sizeClasses} ${statusContainerClasses} ${className}`;

  if (linkToSettings) {
    return (
      <Link
        href="/admin/database"
        title={showTooltip ? tooltipText : undefined}
        className={`${wrapperClasses} hover:scale-105 hover:shadow-sm cursor-pointer`}
      >
        {badgeContent}
      </Link>
    );
  }

  return (
    <span
      title={showTooltip ? tooltipText : undefined}
      className={wrapperClasses}
    >
      {badgeContent}
    </span>
  );
}
