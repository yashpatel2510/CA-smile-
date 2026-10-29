import { Metadata } from "next";
import { CuravertoFeeScheduleView } from "@/components/admin/setup/curaverto-fee-schedule-view";

export const metadata: Metadata = {
  title: "Fee Schedule & Pricing Benchmarks | Admin Setup",
  description: "Configure clinic dental procedure fees, categories, clinical workflows, and industry benchmarks.",
};

export default function AdminFeeSchedulePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CuravertoFeeScheduleView />
    </div>
  );
}
