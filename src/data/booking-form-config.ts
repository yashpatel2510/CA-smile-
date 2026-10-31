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
  themeMode?: "dark" | "light"; // "dark" (Black & White Dribbble) vs "light" (White luxury mode)
  sideHeadingLine1?: string; // Left headline line 1, e.g. "Let's Make That"
  sideHeadingLine2?: string; // Left headline line 2, e.g. "Smile Shine!"
  sideWordmark?: string; // Left huge wordmark fallback (e.g. "brighter")
  logoDarkUrl?: string; // Logo image for dark theme, defaults to /images/ca-smile-logo-dark.png
  logoLightUrl?: string; // Logo image for light theme, defaults to /images/ca-smile-logo-light.png
  sideContactAddress?: string; // Custom address override (blank uses clinic address)
  sideContactPhone?: string; // Custom phone override (blank uses clinic phone)
  sideContactEmail?: string; // Custom email override (blank uses clinic email)
  sideFollowText?: string; // e.g. "Follow Us:"
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
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
  title: "Book Your Appointment",
  submitButtonText: "Submit Appointment Request",
  clinicName: "CA Smile Dental Clinic",
  themeMode: "light",
  sideHeadingLine1: "Let's Make That",
  sideHeadingLine2: "Smile Shine!",
  sideWordmark: "brighter",
  logoDarkUrl: "/images/ca-smile-logo-dark.png",
  logoLightUrl: "/images/ca-smile-logo-light.png",
  sideContactAddress: "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321",
  sideContactPhone: "+91 72260 98074",
  sideContactEmail: "casmileatbilimora@gmail.com",
  sideFollowText: "Follow Us:",
  facebookUrl: "https://facebook.com",
  linkedinUrl: "https://linkedin.com",
  instagramUrl: "https://www.instagram.com/ca_smile_bilimora?psln=c3Rhcmk3aHE4bjBw",
  formBgColor: "#ffffff",
  formTextColor: "#1c1917",
  buttonBgColor: "#881318",
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
    {
      id: "gender",
      label: "Sex / Gender",
      type: "select",
      required: false,
      enabled: false,
      options: ["Male", "Female", "Other", "N/A"],
      helpText: "Patient gender identification",
    },
    {
      id: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      required: false,
      enabled: false,
      helpText: "Patient date of birth",
    },
    {
      id: "bloodGroup",
      label: "Blood Group",
      type: "select",
      required: false,
      enabled: false,
      options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      helpText: "Patient blood group",
    },
    {
      id: "address",
      label: "Address & Locality",
      type: "text",
      required: false,
      enabled: false,
      placeholder: "Flat / House no., Street, Locality",
      helpText: "Residential address",
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
