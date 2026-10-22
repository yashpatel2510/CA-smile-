import React, { Suspense } from "react";
import type { Metadata } from "next";
import { DatabaseHub } from "@/components/admin/database-hub";

export const metadata: Metadata = {
  title: "Database & Storage Center | Smile Dental Clinic Admin",
  description: "Monitor database usage, verify PostgreSQL connections, inspect queries, and manage storage safely.",
};

export default function DatabaseStoragePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <Suspense fallback={<div className="p-8 text-brand-muted">Loading database center...</div>}>
        <DatabaseHub />
      </Suspense>
    </div>
  );
}
