import { Metadata } from "next";
import { ImportClinicDataView } from "@/components/admin/setup/import-clinic-data-view";

export const metadata: Metadata = {
  title: "Import Data | Setup",
  description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
};

export default function ImportDataPage() {
  return <ImportClinicDataView />;
}
