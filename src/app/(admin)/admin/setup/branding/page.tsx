import { Metadata } from "next";
import { DentalDocumentBrandingView } from "@/components/admin/setup/dental-document-branding-view";

export const metadata: Metadata = {
  title: "Document Branding & Letterhead Calibration | Setup",
  description:
    "Calibrate physical pre-printed dental pads and customize high-resolution digital letterheads for patient WhatsApp delivery and PDF exports.",
};

export default function DocumentBrandingPage() {
  return <DentalDocumentBrandingView />;
}
