import { z } from "zod";

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "TREATMENT_STARTED",
  "TREATMENT_DONE",
  "CANCELLED",
  "NO_SHOW",
  // Legacy compatibility
  "DECLINED",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "FOLLOW_UP",
] as const;

export type AppointmentStatusType = (typeof APPOINTMENT_STATUSES)[number];

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED", "DECLINED", "RESCHEDULED", "FOLLOW_UP", "CHECKED_IN"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW", "RESCHEDULED", "FOLLOW_UP", "TREATMENT_STARTED", "PENDING"],
  CHECKED_IN: ["TREATMENT_STARTED", "CANCELLED", "NO_SHOW", "RESCHEDULED", "FOLLOW_UP", "CONFIRMED"],
  TREATMENT_STARTED: ["TREATMENT_DONE", "CANCELLED", "RESCHEDULED", "FOLLOW_UP", "CHECKED_IN", "CONFIRMED"],
  TREATMENT_DONE: ["FOLLOW_UP", "RESCHEDULED", "CONFIRMED", "PENDING"],
  CANCELLED: ["PENDING", "CONFIRMED", "RESCHEDULED"],
  NO_SHOW: ["PENDING", "CONFIRMED", "RESCHEDULED"],
  DECLINED: ["PENDING", "CONFIRMED", "RESCHEDULED"],
  IN_PROGRESS: ["TREATMENT_DONE", "COMPLETED", "CANCELLED", "RESCHEDULED"],
  COMPLETED: ["FOLLOW_UP", "RESCHEDULED"],
  RESCHEDULED: ["CONFIRMED", "CHECKED_IN", "TREATMENT_STARTED", "TREATMENT_DONE", "CANCELLED", "PENDING", "FOLLOW_UP"],
  FOLLOW_UP: ["CONFIRMED", "CHECKED_IN", "TREATMENT_STARTED", "TREATMENT_DONE", "CANCELLED", "PENDING", "RESCHEDULED"],
};

export const createAppointmentSchema = z.object({
  patientType: z.enum(["ADULT", "CHILD"]).default("ADULT"),
  fullName: z.string().optional(),
  childName: z.string().optional(),
  guardianName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(35, "Phone number cannot exceed 35 characters")
    .default("0000000000"),
  preferredDoctor: z.string().optional(),
  treatment: z.string().optional(),
  treatmentId: z.string().optional(),
  treatmentSessionId: z.string().optional(),
  sessionNumber: z.number().int().min(1).optional(),
  totalSessions: z.number().int().min(1).optional(),
  serviceId: z.string().optional(),
  serviceName: z.string().optional(),
  preferredDate: z.string().optional(),
  timeRange: z
    .enum([
      "Morning (9:30 AM - 1:00 PM)",
      "Afternoon (2:00 PM - 5:00 PM)",
      "Evening (5:00 PM - 7:30 PM)",
    ])
    .or(z.string())
    .optional(),
  contactMethod: z.enum(["PHONE", "WHATSAPP"]).default("PHONE"),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(360).default(30),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  reason: z.string().max(255, "Reason cannot exceed 255 characters").optional(),
  consentAgreed: z.boolean().default(true),
  status: z.string().optional(),
  source: z.string().default("MANUAL"),
  customFields: z.record(z.string(), z.any()).optional(),
  clinicSlug: z.string().optional(),
  patientId: z.string().optional(),
  totalAmount: z.number().optional(),
  paidAmount: z.number().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "PARTIAL"]).default("PENDING"),
}).passthrough();

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional(),
  staffUserId: z.string().optional(),
  performedBy: z
    .string()
    .min(1, "Name of person performing action is required")
    .default("Staff Member"),
  reason: z
    .string()
    .max(500, "Reason notes cannot exceed 500 characters")
    .optional(),
  forceOverride: z.boolean().optional().default(false),

  // Treatment Done & Procedure specific fields
  procedure: z.string().optional(),
  treatmentNotes: z.string().optional(),
  dentistNotes: z.string().optional(),
  paidAmount: z.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  nextSessionRequired: z.boolean().optional(),
  nextSessionDate: z.string().optional(),
  nextSessionTime: z.string().optional(),
  nextSessionDoctor: z.string().optional(),
  nextSessionNotes: z.string().optional(),
});

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;

export const rescheduleAppointmentSchema = z.object({
  startTime: z.string(),
  endTime: z.string().optional(),
  preferredDoctor: z.string().optional(),
  reason: z.string().optional(),
  performedBy: z.string().default("Staff Member"),
});

export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;

export const createNextSessionSchema = z.object({
  treatmentId: z.string().min(1, "Treatment ID is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Time is required"),
  preferredDoctor: z.string().optional(),
  durationMinutes: z.number().int().min(15).max(240).default(45),
  notes: z.string().optional(),
  procedure: z.string().optional(),
  performedBy: z.string().default("Staff Member"),
});

export type CreateNextSessionInput = z.infer<typeof createNextSessionSchema>;

export const appointmentQuerySchema = z.object({
  status: z
    .enum(["ALL", ...APPOINTMENT_STATUSES])
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  serviceId: z.string().optional(),
  clinicSlug: z.string().optional(),
  source: z.string().optional(),
  doctor: z.string().optional(),
  dentist: z.string().optional(),
  patientId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  page: z.coerce.number().min(1).default(1),
});

export type AppointmentQueryParams = z.infer<typeof appointmentQuerySchema>;
