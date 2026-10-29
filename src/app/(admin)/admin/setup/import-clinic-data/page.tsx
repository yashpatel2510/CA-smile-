import { Metadata } from "next";
import { ImportClinicDataView } from "@/components/admin/setup/import-clinic-data-view";

export const metadata: Metadata = {
  title: "Import Clinic Data | Setup",
  description: "Bulk import patients, appointments, services, and doctors from CSV or Excel files.",
};

export default function ImportClinicDataPage() {
  return <ImportClinicDataView />;
}
