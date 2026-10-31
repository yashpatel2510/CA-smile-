export type AdminSectionId =
  | "today"
  | "appointments"
  | "patients"
  | "doctor"
  | "services"
  | "billing"
  | "whatsapp"
  | "reviews"
  | "faqs"
  | "database"
  | "setup"
  | "staff";

export interface AdminSectionConfig {
  id: AdminSectionId;
  name: string;
  category: "Clinical Operations" | "Practice Management" | "Patient Engagement" | "System & Administration";
  description: string;
  href: string;
  iconName: string;
  badge?: string;
  isSensitive?: boolean;
}

export type RoleBadgeColor =
  | "emerald"
  | "purple"
  | "blue"
  | "teal"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo";

export interface RoleDefinition {
  id: string;
  key: string;
  name: string;
  badgeColor: RoleBadgeColor;
  description: string;
  isSystem: boolean;
  allowedSections: AdminSectionId[];
  createdAt: string;
  updatedAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  customSections?: AdminSectionId[];
  effectiveSections?: AdminSectionId[];
}

export interface RolesPermissionsConfig {
  roles: RoleDefinition[];
  staffSectionOverrides: Record<string, AdminSectionId[]>;
}

export const ADMIN_SECTIONS_CATALOG: AdminSectionConfig[] = [
  // 1. Clinical Operations
  {
    id: "today",
    name: "Today's Queue & CA Smile Board",
    category: "Clinical Operations",
    description: "Real-time 4-column token queue, patient movement, and stage tracker.",
    href: "/admin/today",
    iconName: "Smile",
    badge: "Live",
  },
  {
    id: "appointments",
    name: "Appointments Desk & Calendar",
    category: "Clinical Operations",
    description: "Complete appointment booking schedule, calendar, reschedules, and follow-ups.",
    href: "/admin/appointment",
    iconName: "Calendar",
  },
  {
    id: "patients",
    name: "Patients Directory & Records",
    category: "Clinical Operations",
    description: "Search patients, contact details, medical histories, and consultation timelines.",
    href: "/admin/patients",
    iconName: "Users",
  },
  {
    id: "doctor",
    name: "Doctor Consultation & Clinical Notes",
    category: "Clinical Operations",
    description: "Doctor's examination workspace, treatment session charting, and prescriptions.",
    href: "/admin/doctor",
    iconName: "Stethoscope",
  },

  // 2. Practice Management
  {
    id: "services",
    name: "Services & Clinical Treatments",
    category: "Practice Management",
    description: "Catalog of dental treatments, service durations, pricing, and procedures.",
    href: "/admin/services",
    iconName: "BriefcaseMedical",
  },
  {
    id: "billing",
    name: "Billing, Invoicing & Payments",
    category: "Practice Management",
    description: "Quick payment receipts, invoice generation, treatment fee collections, and ledgers.",
    href: "/admin/appointment",
    iconName: "Receipt",
    isSensitive: true,
  },

  // 3. Patient Engagement
  {
    id: "whatsapp",
    name: "WhatsApp Patient Hub & Chat",
    category: "Patient Engagement",
    description: "Live WhatsApp patient messaging, booking flow triggers, and auto-reminders.",
    href: "/admin/whatsapp",
    iconName: "MessageSquare",
    badge: "Bot",
  },
  {
    id: "reviews",
    name: "Patient Reviews & Testimonials",
    category: "Patient Engagement",
    description: "Patient satisfaction feedback, Google 5-star ratings, and review moderation.",
    href: "/admin/reviews",
    iconName: "Star",
    badge: "Google",
  },
  {
    id: "faqs",
    name: "Q&A & FAQs Management",
    category: "Patient Engagement",
    description: "Website FAQ answers, patient dental knowledge base, and help articles.",
    href: "/admin/faqs",
    iconName: "HelpCircle",
    badge: "Live",
  },

  // 4. System & Administration
  {
    id: "database",
    name: "Database Health & Cloud Backups",
    category: "System & Administration",
    description: "PostgreSQL metrics, automated Excel backups, sync logs, and database restore.",
    href: "/admin/database",
    iconName: "Database",
    isSensitive: true,
  },
  {
    id: "setup",
    name: "Clinic Setup & System Branding",
    category: "System & Administration",
    description: "Clinic profile, dental letterhead calibration, patient numbering, and fee schedules.",
    href: "/admin/setup",
    iconName: "Cog",
    isSensitive: true,
  },
  {
    id: "staff",
    name: "Staff & Access Control",
    category: "System & Administration",
    description: "Manage team roster, custom roles, password resets, and section permissions.",
    href: "/admin/staff",
    iconName: "UserCog",
    isSensitive: true,
  },
];
