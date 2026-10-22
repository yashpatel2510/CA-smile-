export interface BookingFormFieldConfig {
  id: string;
  label: string;
  type:
    | "text"
    | "tel"
    | "email"
    | "select"
    | "date"
    | "radio"
    | "textarea"
    | "checkbox"
    | "segmented";
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
  isCustom?: boolean;
  bgColor?: string;
  textColor?: string;
}

export interface BookingFormConfig {
  headerBadge: string;
  title: string;
  submitButtonText: string;
  clinicName: string;
  formBgColor?: string;
  formTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  fields: BookingFormFieldConfig[];
  treatments: string[];
  timeSlots: string[];
  doctors: string[];
}

export const defaultBookingFormConfig: BookingFormConfig = {
  headerBadge: "Quick Appointment Request",
  title: "Select Date & Time",
  submitButtonText: "Submit Appointment Request",
  clinicName: "VS Multispeciality Dental Clinic",
  formBgColor: "#ffffff",
  formTextColor: "#1c1917",
  buttonBgColor: "#f2583e",
  buttonTextColor: "#ffffff",
  fields: [
    {
      id: "patientType",
      label: "Patient Type",
      type: "segmented",
      required: true,
      enabled: true,
      options: ["Adult Patient", "Child Patient"],
      helpText:
        "Toggle between adult booking or pediatric/child booking with guardian details",
    },
    {
      id: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      enabled: true,
      placeholder: "e.g. Anish Kumar",
    },
    {
      id: "childName",
      label: "Child's Full Name",
      type: "text",
      required: true,
      enabled: true,
      placeholder: "e.g. Aarav Kumar",
    },
    {
      id: "guardianName",
      label: "Parent or Guardian Name",
      type: "text",
      required: true,
      enabled: true,
      placeholder: "e.g. Sunitha Kumar (Mother)",
    },
    {
      id: "mobileNumber",
      label: "Mobile Number",
      type: "tel",
      required: true,
      enabled: true,
      placeholder: "10-digit mobile number",
      helpText: "Primary contact phone number for verification",
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      required: false,
      enabled: true,
      placeholder: "name@example.com",
    },
    {
      id: "preferredDoctor",
      label: "Preferred Doctor",
      type: "select",
      required: false,
      enabled: true,
      helpText: "Allow patient to request a specific clinical specialist",
    },
    {
      id: "treatment",
      label: "Treatment or Concern",
      type: "select",
      required: true,
      enabled: true,
      helpText: "Primary dental procedure or medical symptom",
    },
    {
      id: "preferredDate",
      label: "Preferred Date",
      type: "date",
      required: true,
      enabled: true,
      helpText: "Requested appointment date",
    },
    {
      id: "timeRange",
      label: "Preferred Time Range",
      type: "select",
      required: true,
      enabled: true,
      helpText: "Clinic operational time slot",
    },
    {
      id: "contactMethod",
      label: "Preferred Contact Method",
      type: "radio",
      required: true,
      enabled: true,
      options: ["Phone Call", "Email"],
      helpText: "How clinic staff should follow up for verbal confirmation",
    },
    {
      id: "notes",
      label: "Notes / Symptoms",
      type: "textarea",
      required: false,
      enabled: true,
      placeholder:
        "Describe your symptoms, tooth sensitivity, or clinical background...",
    },
    {
      id: "consentAgreed",
      label: "Contact & Clinical Consent",
      type: "checkbox",
      required: true,
      enabled: true,
      helpText:
        "Patient consent to receive communication from clinic coordinators",
    },
  ],
  treatments: [
    "General Dental Consultation & Checkup",
    "Pediatric Dentistry & Child Care",
    "Root Canal Treatment (Endodontics)",
    "Teeth Cleaning & Scaling (Prophylaxis)",
    "Orthodontics & Invisible Braces",
    "Dental Implants & Restoration",
    "Toothache & Emergency Dental Relief",
    "Cosmetic Dentistry & Smile Makeover",
  ],
  timeSlots: [
    "Morning (9:30 AM - 1:00 PM)",
    "Afternoon (2:00 PM - 5:00 PM)",
    "Evening (5:00 PM - 7:30 PM)",
  ],
  doctors: [
    "Any Available Specialist",
    "Dr. Vidhyamol (Pediatric Specialist)",
    "Dr. Sankar (Chief Dental Surgeon)",
    "Dr. Sarah Vance, MD (Lead Physician)",
  ],
};
