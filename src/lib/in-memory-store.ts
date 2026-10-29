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

// Store starts empty with 0 dummy appointments & patients
export const clearInMemoryStore = () => {
  if (global.__inMemoryAppointments) global.__inMemoryAppointments.clear();
  if (global.__inMemoryTreatments) global.__inMemoryTreatments.clear();
  if (global.__inMemoryTreatmentSessions) global.__inMemoryTreatmentSessions.clear();
  if (global.__inMemoryAuditLogs) global.__inMemoryAuditLogs.length = 0;
};

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
      status: "PENDING",
      notes: (existing.notes || "").includes("[Rescheduled]")
        ? existing.notes
        : `[Rescheduled] ${existing.notes || ""}`.trim(),
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

  updatePatient(patientIdOrPhone: string, updates: Record<string, any>): boolean {
    const map = getAppointmentsMap();
    let updated = false;
    for (const [id, apt] of Array.from(map.entries())) {
      if (
        apt.patientId === patientIdOrPhone ||
        apt.patient?.id === patientIdOrPhone ||
        apt.patient?.phone === patientIdOrPhone
      ) {
        const p = apt.patient || { firstName: "", lastName: "", phone: "" };
        const newPatient = {
          ...p,
          ...updates,
          firstName: updates.firstName !== undefined ? updates.firstName : p.firstName,
          lastName: updates.lastName !== undefined ? updates.lastName : p.lastName,
          phone: updates.phone !== undefined ? updates.phone : p.phone,
          dateOfBirth: updates.dateOfBirth !== undefined ? updates.dateOfBirth : p.dateOfBirth,
          gender: updates.gender !== undefined ? updates.gender : p.gender,
        };
        map.set(id, {
          ...apt,
          patient: newPatient,
        });
        updated = true;
      }
    }
    return updated;
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
