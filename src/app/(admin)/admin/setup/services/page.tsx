import { Metadata } from "next";
import { CuravertoServicesSetupView } from "@/components/admin/setup/curaverto-services-setup-view";

export const metadata: Metadata = {
  title: "Service Menu & Pricing | Admin Setup",
  description: "Configure clinic dental services, consult charges, procedure duration, and doctor-specific pricing.",
};

export default function AdminServicesSetupPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CuravertoServicesSetupView />
    </div>
  );
}
