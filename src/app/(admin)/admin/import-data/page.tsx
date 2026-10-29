import { Metadata } from "next";
import { ImportClinicDataView } from "@/components/admin/setup/import-clinic-data-view";

export const metadata: Metadata = {
  title: "Import Data | Admin Panel",
  description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
};

export default function AdminImportDataPage() {
  return <ImportClinicDataView />;
}
