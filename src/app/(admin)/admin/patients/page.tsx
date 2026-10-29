"use client";

import React from "react";
import { CuravertoPatientsWorkspace } from "@/components/admin/patients/curaverto-patients-workspace";

export default function PatientsManagementPage() {
  return (
    <div className="min-h-full bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-4">
      <CuravertoPatientsWorkspace />
    </div>
  );
}
