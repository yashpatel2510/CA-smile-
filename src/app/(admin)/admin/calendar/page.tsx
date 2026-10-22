"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminCalendarPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/appointments");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-muted">Redirecting to All Bookings...</p>
    </div>
  );
}
