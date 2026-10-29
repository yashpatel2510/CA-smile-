import type { Metadata } from "next";
import { GoogleSheetsGateway } from "@/components/admin/google-sheets/google-sheets-gateway";

export const metadata: Metadata = {
  title: "Google Sheets & Spreadsheet Gateway | Admin Portal",
  description:
    "Real-time Google Sheets view and automatic patient data sync for SmileCraft Dental Studio.",
};

export default function GoogleSheetsAdminPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <GoogleSheetsGateway />
    </div>
  );
}
