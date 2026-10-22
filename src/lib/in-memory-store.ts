/**
 * In-Memory Clinic Data Store
 * Used as a stateful fallback in development environments when PostgreSQL
 * is not actively running. Supports end-to-end appointment & treatment session lifecycle testing.
 */

export interface StoredTreatment {
  id: string;
  clinicId?: string;
  patientId: string;
  title: string;
  treatmentType: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ON_HOLD";
  totalSessions: number;
  completedSessions: number;
  totalAmount: number;
  paidAmount: number;
  startDate?: string;
  expectedEndDate?: string;
  notes?: string;
  dentistId?: string;
  dentistName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredTreatmentSession {
  id: string;
  treatmentId: string;
  appointmentId?: string;
  sessionNumber: number;
  totalSessions: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "TREATMENT_STARTED"
    | "TREATMENT_DONE"
    | "CANCELLED"
    | "NO_SHOW";
  procedure?: string;
  treatmentNotes?: string;
  dentistNotes?: string;
  amount: number;
  paidAmount: number;
  paymentStatus: "PENDING" | "PAID" | "PARTIAL";
  paymentMethod?: string; // CASH, UPI, CARD, NET_BANKING
  nextSessionRequired?: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredAuditLog {
  id: string;
  clinicId?: string;
  appointmentId?: string;
  treatmentId?: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  details?: string;
  previousValues?: any;
  newValues?: any;
  createdAt: string;
}

export interface StoredAppointment {
  id: string;
  clinicId?: string;
  patientId?: string;
  startTime: string;
  endTime: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "TREATMENT_STARTED"
    | "TREATMENT_DONE"
    | "CANCELLED"
    | "NO_SHOW"
    | "DECLINED"
    | "IN_PROGRESS"
    | "COMPLETED";
  source: string;
  notes?: string;
  reason?: string;
  patientType?: "ADULT" | "CHILD" | string;
  childName?: string;
  guardianName?: string;
  preferredDoctor?: string;
  timeRange?: string;
  contactMethod?: "PHONE" | "WHATSAPP" | string;
  consentAgreed?: boolean;
  reminderSentAt?: string | null;
  confirmedAt?: string | null;
  checkedInAt?: string | null;
  treatmentStartedAt?: string | null;
  treatmentDoneAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  noShowAt?: string | null;
  rescheduledAt?: string | null;
  rescheduledReason?: string | null;
  originalStartTime?: string | null;
  paymentStatus?: "PENDING" | "PAID" | "PARTIAL";
  paidAmount?: number;
  totalAmount?: number;

  treatmentId?: string;
  treatment?: StoredTreatment;
  treatmentSessionId?: string;
  treatmentSession?: StoredTreatmentSession;

  patient: {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
  };
  service: {
    id?: string;
    name: string;
    price?: number;
    durationMinutes?: number;
    category?: string;
  };
  staffUser?: {
    id?: string;
    name: string;
    role?: string;
  };
  auditLogs?: StoredAuditLog[];
  createdAt: string;
  updatedAt: string;
}

// Global references for Next.js HMR preservation
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryAppointments: Map<string, StoredAppointment> | undefined;
  // eslint-disable-next-line no-var
  var __inMemoryTreatments: Map<string, StoredTreatment> | undefined;
  // eslint-disable-next-line no-var
  var __inMemoryTreatmentSessions: Map<string, StoredTreatmentSession> | undefined;
  // eslint-disable-next-line no-var
  var __inMemoryAuditLogs: StoredAuditLog[] | undefined;
}

if (!global.__inMemoryAppointments) {
  global.__inMemoryAppointments = new Map<string, StoredAppointment>();
}
if (!global.__inMemoryTreatments) {
  global.__inMemoryTreatments = new Map<string, StoredTreatment>();
}
if (!global.__inMemoryTreatmentSessions) {
  global.__inMemoryTreatmentSessions = new Map<string, StoredTreatmentSession>();
}
if (!global.__inMemoryAuditLogs) {
  global.__inMemoryAuditLogs = [];
}

const getAppointmentsMap = () => {
  if (!global.__inMemoryAppointments) global.__inMemoryAppointments = new Map();
  return global.__inMemoryAppointments;
};

const getTreatmentsMap = () => {
  if (!global.__inMemoryTreatments) global.__inMemoryTreatments = new Map();
  return global.__inMemoryTreatments;
};

const getTreatmentSessionsMap = () => {
  if (!global.__inMemoryTreatmentSessions) global.__inMemoryTreatmentSessions = new Map();
  return global.__inMemoryTreatmentSessions;
};

const getAuditLogsList = () => {
  if (!global.__inMemoryAuditLogs) global.__inMemoryAuditLogs = [];
  return global.__inMemoryAuditLogs;
};

if (global.__inMemoryTreatments.size === 0 || global.__inMemoryAppointments.size === 0) {
  const now = new Date();
  const todayDateStr = now.toISOString().split("T")[0];

  // Helper for generating seed timestamps today / yesterday / tomorrow
  const createDateToday = (hour: number, minute: number) => {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const createDateOffset = (dayOffset: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  // Seed Treatments
  const seedTreatments: StoredTreatment[] = [
    {
      id: "TRT-00125",
      clinicId: "clinic-default",
      patientId: "PAT-001",
      title: "Root Canal Treatment (Molar #36)",
      treatmentType: "Root Canal",
      status: "IN_PROGRESS",
      totalSessions: 3,
      completedSessions: 1,
      totalAmount: 6500,
      paidAmount: 2500,
      startDate: createDateOffset(-7, 10, 0).toISOString(),
      expectedEndDate: createDateOffset(7, 11, 0).toISOString(),
      notes: "Severe pulpal necrosis lower left molar. Needs bio-mechanical prep and obturation.",
      dentistId: "doc-sankar",
      dentistName: "Dr. Sankar (Chief Dental Surgeon)",
      createdAt: createDateOffset(-7, 9, 30).toISOString(),
      updatedAt: createDateOffset(-7, 11, 30).toISOString(),
    },
    {
      id: "TRT-00126",
      clinicId: "clinic-default",
      patientId: "PAT-002",
      title: "Ceramic Crown Prosthesis",
      treatmentType: "Crown",
      status: "IN_PROGRESS",
      totalSessions: 2,
      completedSessions: 0,
      totalAmount: 8500,
      paidAmount: 4000,
      startDate: createDateOffset(0, 14, 0).toISOString(),
      expectedEndDate: createDateOffset(5, 14, 0).toISOString(),
      notes: "Tooth prep and scan for Zirconia crown.",
      dentistId: "doc-sankar",
      dentistName: "Dr. Sankar (Chief Dental Surgeon)",
      createdAt: createDateOffset(-2, 10, 0).toISOString(),
      updatedAt: createDateOffset(-2, 10, 0).toISOString(),
    },
    {
      id: "TRT-00127",
      clinicId: "clinic-default",
      patientId: "PAT-004",
      title: "Fixed Orthodontic Appliance (Braces)",
      treatmentType: "Braces",
      status: "IN_PROGRESS",
      totalSessions: 6,
      completedSessions: 3,
      totalAmount: 35000,
      paidAmount: 18000,
      startDate: createDateOffset(-60, 11, 0).toISOString(),
      expectedEndDate: createDateOffset(120, 11, 0).toISOString(),
      notes: "Active alignment phase. Archwire change and bracket check.",
      dentistId: "doc-vidhya",
      dentistName: "Dr. Vidhyamol (Pediatric & Ortho Specialist)",
      createdAt: createDateOffset(-60, 10, 0).toISOString(),
      updatedAt: createDateOffset(-14, 12, 0).toISOString(),
    },
    {
      id: "TRT-00128",
      clinicId: "clinic-default",
      patientId: "PAT-005",
      title: "Deep Scaling & Periodontal Therapy",
      treatmentType: "Cleaning",
      status: "COMPLETED",
      totalSessions: 2,
      completedSessions: 2,
      totalAmount: 3000,
      paidAmount: 3000,
      startDate: createDateOffset(-14, 10, 0).toISOString(),
      expectedEndDate: createDateOffset(-2, 11, 0).toISOString(),
      notes: "Generalized gingivitis fully addressed. Oral hygiene instructions delivered.",
      dentistId: "doc-mehta",
      dentistName: "Dr. A. Mehta (Periodontist)",
      createdAt: createDateOffset(-14, 9, 0).toISOString(),
      updatedAt: createDateOffset(-2, 11, 30).toISOString(),
    },
  ];

  for (const t of seedTreatments) {
    getTreatmentsMap().set(t.id, t);
  }

  // Seed Treatment Sessions
  const seedSessions: StoredTreatmentSession[] = [
    // TRT-00125 (Root Canal - 3 sessions)
    {
      id: "SES-101",
      treatmentId: "TRT-00125",
      appointmentId: "APT-849101-HIST",
      sessionNumber: 1,
      totalSessions: 3,
      status: "TREATMENT_DONE",
      procedure: "Pulp extirpation, working length measurement & temporary dressing.",
      treatmentNotes: "Canals irrigated with NaOCl and EDTA. Calcium hydroxide dressing placed.",
      dentistNotes: "Patient tolerated well under 2% Lignocaine with Adrenaline.",
      amount: 2500,
      paidAmount: 2500,
      paymentStatus: "PAID",
      paymentMethod: "UPI",
      nextSessionRequired: true,
      completedAt: createDateOffset(-7, 11, 15).toISOString(),
      completedBy: "Dr. Sankar",
      createdAt: createDateOffset(-7, 9, 30).toISOString(),
      updatedAt: createDateOffset(-7, 11, 15).toISOString(),
    },
    {
      id: "SES-102",
      treatmentId: "TRT-00125",
      appointmentId: "APT-849101",
      sessionNumber: 2,
      totalSessions: 3,
      status: "CHECKED_IN",
      procedure: "Biomechanical canal preparation & master cone fitting.",
      treatmentNotes: "Canals dry, no percussion pain. Ready for shaping.",
      dentistNotes: "Proceed with rotary Protaper Gold sequence.",
      amount: 2000,
      paidAmount: 0,
      paymentStatus: "PENDING",
      nextSessionRequired: true,
      createdAt: createDateOffset(-7, 11, 20).toISOString(),
      updatedAt: createDateToday(10, 15).toISOString(),
    },
    {
      id: "SES-103",
      treatmentId: "TRT-00125",
      appointmentId: "APT-849101-NEXT",
      sessionNumber: 3,
      totalSessions: 3,
      status: "PENDING",
      procedure: "Final Obturation and permanent post-endodontic composite restoration.",
      amount: 2000,
      paidAmount: 0,
      paymentStatus: "PENDING",
      nextSessionRequired: false,
      createdAt: createDateOffset(-7, 11, 20).toISOString(),
      updatedAt: createDateOffset(-7, 11, 20).toISOString(),
    },

    // TRT-00126 (Crown - 2 sessions)
    {
      id: "SES-201",
      treatmentId: "TRT-00126",
      appointmentId: "APT-849104",
      sessionNumber: 1,
      totalSessions: 2,
      status: "CONFIRMED",
      procedure: "Crown preparation, 3D intraoral digital impression & temporary crown fabrication.",
      amount: 4500,
      paidAmount: 4000,
      paymentStatus: "PARTIAL",
      paymentMethod: "CARD",
      nextSessionRequired: true,
      createdAt: createDateOffset(-2, 10, 0).toISOString(),
      updatedAt: createDateOffset(-2, 10, 0).toISOString(),
    },
  ];

  for (const s of seedSessions) {
    getTreatmentSessionsMap().set(s.id, s);
  }

  // Seed Appointments
  const seedAppointments: StoredAppointment[] = [
    {
      id: "APT-849101",
      clinicId: "clinic-default",
      patientId: "PAT-001",
      startTime: createDateToday(10, 30).toISOString(),
      endTime: createDateToday(11, 15).toISOString(),
      status: "CHECKED_IN",
      source: "WHATSAPP",
      patientType: "ADULT",
      preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
      timeRange: "Morning (9:30 AM - 1:00 PM)",
      contactMethod: "WHATSAPP",
      consentAgreed: true,
      treatmentId: "TRT-00125",
      treatment: seedTreatments[0],
      treatmentSessionId: "SES-102",
      treatmentSession: seedSessions[1],
      paymentStatus: "PENDING",
      paidAmount: 2500,
      totalAmount: 6500,
      checkedInAt: createDateToday(10, 15).toISOString(),
      notes: "Session 2/3: Root canal shaping & master cone fit. Patient in waiting lounge.",
      patient: {
        id: "PAT-001",
        firstName: "Rahul",
        lastName: "Patel",
        email: "rahul.patel@example.com",
        phone: "9847012345",
        dateOfBirth: "1988-04-12",
        gender: "Male",
      },
      service: {
        id: "srv-rct",
        name: "Root Canal Treatment",
        price: 6500,
        durationMinutes: 45,
        category: "Endodontics",
      },
      staffUser: {
        id: "doc-sankar",
        name: "Dr. Sankar",
        role: "DOCTOR",
      },
      createdAt: createDateOffset(-7, 11, 20).toISOString(),
      updatedAt: createDateToday(10, 15).toISOString(),
    },
    {
      id: "APT-849102",
      clinicId: "clinic-default",
      patientId: "PAT-003",
      startTime: createDateToday(11, 30).toISOString(),
      endTime: createDateToday(12, 0).toISOString(),
      status: "TREATMENT_STARTED",
      source: "WEB_FORM",
      patientType: "CHILD",
      childName: "Aarav Kumar",
      guardianName: "Sunitha Kumar (Mother)",
      preferredDoctor: "Dr. Vidhyamol (Pediatric & Ortho Specialist)",
      timeRange: "Morning (9:30 AM - 1:00 PM)",
      contactMethod: "PHONE",
      consentAgreed: true,
      paymentStatus: "PENDING",
      paidAmount: 0,
      totalAmount: 1200,
      treatmentStartedAt: createDateToday(11, 35).toISOString(),
      notes: "Milk tooth restoration and fluoride varnish application. In operatory chair 2.",
      patient: {
        id: "PAT-003",
        firstName: "Sunitha",
        lastName: "Kumar",
        email: "sunitha.kumar@example.com",
        phone: "8590499881",
        dateOfBirth: "2018-03-15",
        gender: "Female",
      },
      service: {
        id: "srv-pediatric",
        name: "Pediatric Dental Care & Milk Teeth",
        price: 1200,
        durationMinutes: 30,
        category: "Pediatric",
      },
      staffUser: {
        id: "doc-vidhya",
        name: "Dr. Vidhyamol",
        role: "DOCTOR",
      },
      createdAt: createDateOffset(-1, 14, 0).toISOString(),
      updatedAt: createDateToday(11, 35).toISOString(),
    },
    {
      id: "APT-849103",
      clinicId: "clinic-default",
      patientId: "PAT-002",
      startTime: createDateToday(14, 0).toISOString(),
      endTime: createDateToday(14, 45).toISOString(),
      status: "CONFIRMED",
      source: "PHONE",
      patientType: "ADULT",
      preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
      timeRange: "Afternoon (2:00 PM - 5:00 PM)",
      contactMethod: "PHONE",
      consentAgreed: true,
      treatmentId: "TRT-00126",
      treatment: seedTreatments[1],
      treatmentSessionId: "SES-201",
      treatmentSession: seedSessions[3],
      paymentStatus: "PARTIAL",
      paidAmount: 4000,
      totalAmount: 8500,
      confirmedAt: createDateOffset(-1, 10, 0).toISOString(),
      notes: "Session 1/2: Tooth preparation and shade selection for upper premolar crown.",
      patient: {
        id: "PAT-002",
        firstName: "Robert",
        lastName: "Fox",
        email: "robert.fox@example.com",
        phone: "9447155667",
        dateOfBirth: "1974-08-23",
        gender: "Male",
      },
      service: {
        id: "srv-crown",
        name: "Ceramic Crown & Bridge",
        price: 8500,
        durationMinutes: 45,
        category: "Prosthodontics",
      },
      staffUser: {
        id: "doc-sankar",
        name: "Dr. Sankar",
        role: "DOCTOR",
      },
      createdAt: createDateOffset(-2, 10, 0).toISOString(),
      updatedAt: createDateOffset(-1, 10, 0).toISOString(),
    },
    {
      id: "APT-849104",
      clinicId: "clinic-default",
      patientId: "PAT-006",
      startTime: createDateToday(16, 0).toISOString(),
      endTime: createDateToday(16, 30).toISOString(),
      status: "PENDING",
      source: "WHATSAPP",
      patientType: "ADULT",
      preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
      timeRange: "Afternoon (2:00 PM - 5:00 PM)",
      contactMethod: "WHATSAPP",
      consentAgreed: true,
      paymentStatus: "PENDING",
      paidAmount: 0,
      totalAmount: 500,
      notes: "Patient reported sharp pain when drinking warm tea. Requested emergency checkup slot.",
      patient: {
        id: "PAT-006",
        firstName: "Jonathan",
        lastName: "Swift",
        email: "j.swift@example.com",
        phone: "9895011223",
        dateOfBirth: "1985-06-15",
        gender: "Male",
      },
      service: {
        id: "srv-consultation",
        name: "Emergency Dental Consultation",
        price: 500,
        durationMinutes: 30,
        category: "General",
      },
      staffUser: {
        id: "doc-sankar",
        name: "Dr. Sankar",
        role: "DOCTOR",
      },
      createdAt: createDateToday(9, 15).toISOString(),
      updatedAt: createDateToday(9, 15).toISOString(),
    },
    {
      id: "APT-849105",
      clinicId: "clinic-default",
      patientId: "PAT-004",
      startTime: createDateToday(9, 0).toISOString(),
      endTime: createDateToday(9, 45).toISOString(),
      status: "TREATMENT_DONE",
      source: "MANUAL",
      patientType: "ADULT",
      preferredDoctor: "Dr. Vidhyamol (Pediatric & Ortho Specialist)",
      timeRange: "Morning (9:30 AM - 1:00 PM)",
      contactMethod: "PHONE",
      consentAgreed: true,
      treatmentId: "TRT-00127",
      treatment: seedTreatments[2],
      paymentStatus: "PAID",
      paidAmount: 2500,
      totalAmount: 2500,
      treatmentDoneAt: createDateToday(9, 45).toISOString(),
      notes: "Session 4/6: Lower 0.016 NiTi wire placed. Elastic chain activated.",
      patient: {
        id: "PAT-004",
        firstName: "Amit",
        lastName: "Patel",
        email: "amit.patel@example.com",
        phone: "9745533221",
        dateOfBirth: "1997-11-20",
        gender: "Male",
      },
      service: {
        id: "srv-braces",
        name: "Orthodontic Adjustments & Braces",
        price: 2500,
        durationMinutes: 45,
        category: "Orthodontics",
      },
      staffUser: {
        id: "doc-vidhya",
        name: "Dr. Vidhyamol",
        role: "DOCTOR",
      },
      createdAt: createDateOffset(-14, 12, 0).toISOString(),
      updatedAt: createDateToday(9, 45).toISOString(),
    },
    {
      id: "APT-849106",
      clinicId: "clinic-default",
      patientId: "PAT-005",
      startTime: createDateOffset(1, 10, 0).toISOString(),
      endTime: createDateOffset(1, 10, 30).toISOString(),
      status: "CONFIRMED",
      source: "WEBSITE",
      patientType: "ADULT",
      preferredDoctor: "Dr. A. Mehta (Periodontist)",
      timeRange: "Morning (9:30 AM - 1:00 PM)",
      contactMethod: "PHONE",
      consentAgreed: true,
      paymentStatus: "PENDING",
      paidAmount: 0,
      totalAmount: 1500,
      notes: "Routine 6-month preventive ultrasonic scaling and plaque removal.",
      patient: {
        id: "PAT-005",
        firstName: "Floyd",
        lastName: "Miles",
        email: "floyd.miles@example.com",
        phone: "9846055443",
        dateOfBirth: "1981-02-14",
        gender: "Male",
      },
      service: {
        id: "srv-scaling",
        name: "Teeth Cleaning & Scaling",
        price: 1500,
        durationMinutes: 30,
        category: "Periodontics",
      },
      staffUser: {
        id: "doc-mehta",
        name: "Dr. A. Mehta",
        role: "DOCTOR",
      },
      createdAt: createDateOffset(-3, 14, 0).toISOString(),
      updatedAt: createDateOffset(-1, 11, 0).toISOString(),
    },
    {
      id: "APT-849107",
      clinicId: "clinic-default",
      patientId: "PAT-001",
      startTime: createDateOffset(7, 10, 30).toISOString(),
      endTime: createDateOffset(7, 11, 15).toISOString(),
      status: "PENDING",
      source: "ADMIN",
      patientType: "ADULT",
      preferredDoctor: "Dr. Sankar (Chief Dental Surgeon)",
      timeRange: "Morning (9:30 AM - 1:00 PM)",
      contactMethod: "WHATSAPP",
      consentAgreed: true,
      treatmentId: "TRT-00125",
      treatment: seedTreatments[0],
      treatmentSessionId: "SES-103",
      treatmentSession: seedSessions[2],
      paymentStatus: "PENDING",
      paidAmount: 0,
      totalAmount: 2000,
      notes: "Session 3/3: Final root canal obturation & coronal seal.",
      patient: {
        id: "PAT-001",
        firstName: "Rahul",
        lastName: "Patel",
        email: "rahul.patel@example.com",
        phone: "9847012345",
      },
      service: {
        id: "srv-rct",
        name: "Root Canal Treatment",
        price: 2000,
        durationMinutes: 45,
        category: "Endodontics",
      },
      staffUser: {
        id: "doc-sankar",
        name: "Dr. Sankar",
        role: "DOCTOR",
      },
      createdAt: createDateOffset(-7, 11, 20).toISOString(),
      updatedAt: createDateOffset(-7, 11, 20).toISOString(),
    },
  ];

  for (const apt of seedAppointments) {
    getAppointmentsMap().set(apt.id, apt);

    // Initial audit log
    getAuditLogsList().push({
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      appointmentId: apt.id,
      entityType: "Appointment",
      entityId: apt.id,
      action: "APPOINTMENT_CREATED",
      performedBy: "Clinical Staff / Intake",
      details: `Appointment created for ${apt.patient.firstName} ${apt.patient.lastName} - ${apt.service.name}`,
      createdAt: apt.createdAt,
    });
  }
}

export const inMemoryStore = {
  // Appointments
  getAppointments(): StoredAppointment[] {
    return Array.from(getAppointmentsMap().values());
  },

  getAppointment(id: string): StoredAppointment | undefined {
    const apt = getAppointmentsMap().get(id);
    if (!apt) return undefined;

    // Attach latest audit logs
    const logs = getAuditLogsList().filter(
      (l) => l.appointmentId === id
    );
    return {
      ...apt,
      auditLogs: logs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  },

  saveAppointment(appointment: StoredAppointment): StoredAppointment {
    getAppointmentsMap().set(appointment.id, appointment);
    this.addAuditLog({
      appointmentId: appointment.id,
      entityType: "Appointment",
      entityId: appointment.id,
      action: "APPOINTMENT_SAVED",
      performedBy: "Clinical System",
      details: `Appointment created/saved for ${appointment.patient.firstName} ${appointment.patient.lastName}`,
    });
    return appointment;
  },

  updateAppointmentStatus(
    id: string,
    status: StoredAppointment["status"],
    reason?: string,
    performedBy = "Clinical Staff"
  ): StoredAppointment | undefined {
    const existing = getAppointmentsMap().get(id);
    if (!existing) return undefined;

    const previousStatus = existing.status;
    const nowIso = new Date().toISOString();

    const updated: StoredAppointment = {
      ...existing,
      status,
      updatedAt: nowIso,
    };

    if (reason) {
      updated.notes = existing.notes ? `${existing.notes} | ${reason}` : reason;
    }

    if (status === "CONFIRMED" && !existing.confirmedAt) {
      updated.confirmedAt = nowIso;
    } else if (status === "CHECKED_IN") {
      updated.checkedInAt = nowIso;
    } else if (status === "TREATMENT_STARTED") {
      updated.treatmentStartedAt = nowIso;
    } else if (status === "TREATMENT_DONE") {
      updated.treatmentDoneAt = nowIso;
      // Also update linked treatment session if present
      if (existing.treatmentSessionId) {
        const ses = getTreatmentSessionsMap().get(
          existing.treatmentSessionId
        );
        if (ses) {
          ses.status = "TREATMENT_DONE";
          ses.completedAt = nowIso;
          ses.completedBy = performedBy;
          getTreatmentSessionsMap().set(ses.id, ses);
        }
      }
    } else if (status === "CANCELLED") {
      updated.cancelledAt = nowIso;
      updated.cancellationReason = reason || "Cancelled by clinic";
    } else if (status === "NO_SHOW") {
      updated.noShowAt = nowIso;
    }

    getAppointmentsMap().set(id, updated);

    // Record Audit
    this.addAuditLog({
      appointmentId: id,
      entityType: "Appointment",
      entityId: id,
      action: `APPOINTMENT_${status}`,
      performedBy,
      details:
        reason ||
        `Status transitioned from ${previousStatus} to ${status} by ${performedBy}`,
      previousValues: { status: previousStatus },
      newValues: { status, reason: reason || null },
    });

    return updated;
  },

  rescheduleAppointment(
    id: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string,
    dentistName?: string,
    performedBy = "Clinical Staff"
  ): StoredAppointment | undefined {
    const existing = getAppointmentsMap().get(id);
    if (!existing) return undefined;

    const previousStart = existing.startTime;
    const nowIso = new Date().toISOString();

    const updated: StoredAppointment = {
      ...existing,
      originalStartTime: existing.originalStartTime || previousStart,
      startTime: newStartTime,
      endTime: newEndTime,
      rescheduledAt: nowIso,
      rescheduledReason: reason || "Rescheduled on request",
      preferredDoctor: dentistName || existing.preferredDoctor,
      updatedAt: nowIso,
    };

    getAppointmentsMap().set(id, updated);

    this.addAuditLog({
      appointmentId: id,
      entityType: "Appointment",
      entityId: id,
      action: "APPOINTMENT_RESCHEDULED",
      performedBy,
      details: `Rescheduled from ${new Date(previousStart).toLocaleString()} to ${new Date(newStartTime).toLocaleString()}. Reason: ${reason || "N/A"}`,
      previousValues: { startTime: previousStart },
      newValues: { startTime: newStartTime, reason },
    });

    return updated;
  },

  deleteAppointment(id: string): boolean {
    return getAppointmentsMap().delete(id);
  },

  deletePatient(patientIdOrPhone: string): boolean {
    const map = getAppointmentsMap();
    let deleted = false;
    for (const [id, apt] of Array.from(map.entries())) {
      if (
        apt.patientId === patientIdOrPhone ||
        apt.patient?.id === patientIdOrPhone ||
        apt.patient?.phone === patientIdOrPhone
      ) {
        map.delete(id);
        deleted = true;
      }
    }
    // Also remove treatments
    const tMap = getTreatmentsMap();
    for (const [id, t] of Array.from(tMap.entries())) {
      if (t.patientId === patientIdOrPhone) {
        tMap.delete(id);
        deleted = true;
      }
    }
    return deleted;
  },

  // Treatments
  getTreatments(): StoredTreatment[] {
    return Array.from(getTreatmentsMap().values());
  },

  getTreatment(id: string): StoredTreatment | undefined {
    return getTreatmentsMap().get(id);
  },

  getPatientTreatments(patientId: string): StoredTreatment[] {
    return Array.from(getTreatmentsMap().values()).filter(
      (t) => t.patientId === patientId
    );
  },

  saveTreatment(treatment: StoredTreatment): StoredTreatment {
    getTreatmentsMap().set(treatment.id, treatment);
    return treatment;
  },

  updateTreatmentStatus(
    id: string,
    status: StoredTreatment["status"],
    completedSessions?: number
  ): StoredTreatment | undefined {
    const trt = getTreatmentsMap().get(id);
    if (!trt) return undefined;

    trt.status = status;
    if (typeof completedSessions === "number") {
      trt.completedSessions = completedSessions;
    }
    trt.updatedAt = new Date().toISOString();
    getTreatmentsMap().set(id, trt);
    return trt;
  },

  // Treatment Sessions
  getTreatmentSessions(treatmentId: string): StoredTreatmentSession[] {
    return Array.from(getTreatmentSessionsMap().values())
      .filter((s) => s.treatmentId === treatmentId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);
  },

  saveTreatmentSession(session: StoredTreatmentSession): StoredTreatmentSession {
    getTreatmentSessionsMap().set(session.id, session);
    return session;
  },

  stampReminder(id: string): boolean {
    const apt = getAppointmentsMap().get(id);
    if (apt) {
      apt.reminderSentAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  // Audit Logs
  getAuditLogs(appointmentId?: string): StoredAuditLog[] {
    const logs = getAuditLogsList();
    if (!appointmentId) return logs;
    return logs.filter((l) => l.appointmentId === appointmentId);
  },

  addAuditLog(entry: Omit<StoredAuditLog, "id" | "createdAt">): StoredAuditLog {
    const list = getAuditLogsList();
    const newEntry: StoredAuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newEntry);
    return newEntry;
  },
};

export default inMemoryStore;
