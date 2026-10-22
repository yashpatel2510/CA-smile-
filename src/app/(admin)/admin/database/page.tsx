import type { Metadata } from "next";
import { DatabaseManagementView } from "@/components/admin/database/database-management-view";

export const metadata: Metadata = {
  title: "Database Management | Smile Dental Clinic Admin",
  description:
    "Monitor your clinic databases, check connections, and manage automatic Excel backups.",
};

export default function DatabaseManagementPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DatabaseManagementView />
    </div>
  );
}
