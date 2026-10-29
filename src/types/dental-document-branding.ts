export type DentalDocumentType =
  | "PRESCRIPTION"
  | "TREATMENT_PLAN"
  | "CONSENT_FORM"
  | "INVOICE";

export type PaperSize = "a4" | "a5" | "thermal_80";

export type DefaultPaperType = "pad" | "blank";

export type LayoutStyle = "classic" | "sidebar" | "thermal";

export interface DentalDocumentLayoutProfile {
  document_type: DentalDocumentType;
  paper_size: PaperSize;
  default_paper_type: DefaultPaperType;
  layout_style: LayoutStyle;
  header_height_mm: number;
  footer_height_mm: number;
  sidebar_width_mm: number;
  font_scale: number;
  show_tooth_diagram: boolean;
  show_doctor_signature: boolean;
  calibration_overlay_url?: string;
  overlay_opacity: number;
}

export interface DentalClinicBrandingMaster {
  clinic_name: string;
  tagline: string;
  logo_url: string;
  signature_url: string;
  watermark_url: string;
  primary_color: string;
  secondary_color: string;
  header_text: string;
  footer_text: string;
  dot_matrix_mode: boolean;
  doctor_name: string;
  doctor_qualification: string;
  doctor_reg_no: string;
  phone: string;
  emergency_phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface DentalDocumentBrandingConfig {
  master: DentalClinicBrandingMaster;
  layouts: Record<DentalDocumentType, DentalDocumentLayoutProfile>;
}

export const DEFAULT_DENTAL_BRANDING_MASTER: DentalClinicBrandingMaster = {
  clinic_name: "Smile Dental Clinic",
  tagline: "Advanced Dental Surgery, Dental Implants & Aesthetic Dentistry",
  logo_url: "/images/ca-smile-logo-light.png",
  signature_url: "",
  watermark_url: "",
  primary_color: "#0b192c",
  secondary_color: "#1e293b",
  header_text:
    "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321",
  footer_text:
    "Clinic Timings: Mon - Sat 9:00 AM - 8:00 PM | Emergency Contact: 9664681536",
  dot_matrix_mode: false,
  doctor_name: "Dr. Sample Doctor",
  doctor_qualification: "MBBS, MD (General Medicine), Diploma in Diabetology",
  doctor_reg_no: "SAMPLE-REG-0000",
  phone: "9664681536",
  emergency_phone: "9664681536",
  email: "casmileatbilimora@gmail.com",
  address: "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora",
  city: "Bilimora",
  state: "Gujarat",
  postal_code: "396321",
};

export const DEFAULT_DOCUMENT_LAYOUTS: Record<
  DentalDocumentType,
  DentalDocumentLayoutProfile
> = {
  PRESCRIPTION: {
    document_type: "PRESCRIPTION",
    paper_size: "a5",
    default_paper_type: "pad",
    layout_style: "classic",
    header_height_mm: 45,
    footer_height_mm: 25,
    sidebar_width_mm: 0,
    font_scale: 1.0,
    show_tooth_diagram: true,
    show_doctor_signature: true,
    calibration_overlay_url: "",
    overlay_opacity: 40,
  },
  TREATMENT_PLAN: {
    document_type: "TREATMENT_PLAN",
    paper_size: "a4",
    default_paper_type: "blank",
    layout_style: "classic",
    header_height_mm: 40,
    footer_height_mm: 25,
    sidebar_width_mm: 0,
    font_scale: 0.95,
    show_tooth_diagram: true,
    show_doctor_signature: true,
    calibration_overlay_url: "",
    overlay_opacity: 35,
  },
  CONSENT_FORM: {
    document_type: "CONSENT_FORM",
    paper_size: "a4",
    default_paper_type: "blank",
    layout_style: "classic",
    header_height_mm: 35,
    footer_height_mm: 20,
    sidebar_width_mm: 0,
    font_scale: 0.95,
    show_tooth_diagram: false,
    show_doctor_signature: true,
    calibration_overlay_url: "",
    overlay_opacity: 35,
  },
  INVOICE: {
    document_type: "INVOICE",
    paper_size: "a4",
    default_paper_type: "blank",
    layout_style: "classic",
    header_height_mm: 35,
    footer_height_mm: 25,
    sidebar_width_mm: 0,
    font_scale: 1.0,
    show_tooth_diagram: true,
    show_doctor_signature: true,
    calibration_overlay_url: "",
    overlay_opacity: 35,
  },
};

export const DEFAULT_DENTAL_DOCUMENT_BRANDING: DentalDocumentBrandingConfig = {
  master: DEFAULT_DENTAL_BRANDING_MASTER,
  layouts: DEFAULT_DOCUMENT_LAYOUTS,
};
