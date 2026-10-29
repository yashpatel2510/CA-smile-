"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, CalendarCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Portal Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
        <ShieldAlert className="h-7 w-7" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-rose-500">
          Admin Portal Error
        </span>
        <h2 className="font-heading text-xl font-bold text-brand-text">
          Clinical Operations View Failed to Render
        </h2>
        <p className="text-xs leading-relaxed text-brand-muted">
          The requested admin view or data query encountered a runtime
          exception. Database transactions and patient EMR records remain
          unaffected.
        </p>
        {process.env.NODE_ENV !== "production" && error.message && (
          <div className="mt-2 overflow-x-auto rounded border border-rose-500/20 bg-rose-500/5 p-3 text-left font-mono text-[11px] text-rose-600 dark:text-rose-400">
            {error.message}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Button
          onClick={() => reset()}
          variant="primary"
          size="sm"
          className="h-9 w-full gap-1.5 text-xs sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload View</span>
        </Button>
        <Link href="/admin/today" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full gap-1.5 text-xs sm:w-auto"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Return to Bookings</span>
          </Button>
        </Link>
      </div>

      <div className="pt-2 text-xs text-brand-muted">
        Having authentication issues?{" "}
        <Link
          href="/admin/login"
          className="font-semibold text-brand-primary underline"
        >
          Sign in again
        </Link>
      </div>
    </div>
  );
}
