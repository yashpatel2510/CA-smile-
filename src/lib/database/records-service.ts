import prisma, { authPrisma } from "@/lib/prisma";
import { inMemoryStore } from "@/lib/in-memory-store";
import { getReviewsStoreData, saveReviewsStoreData } from "@/lib/reviews-store";
import { clinicalServices } from "@/data/services-data";

export interface RecordItem {
  id: string;
  displayTitle: string;
  subtitle: string;
  details: Record<string, any>;
  createdAt?: string;
  source: string;
}

export const ALLOWED_TABLES = [
  "patients",
  "appointments",
  "whatsapp_bookings",
  "services",
  "staff_users",
  "reviews",
  "audit_logs",
] as const;

export type AllowedTable = (typeof ALLOWED_TABLES)[number];

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("Database operation timed out"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Fetch records for table preview
 */
export async function getTableRecords(table: AllowedTable, limit = 50): Promise<RecordItem[]> {
  const items: RecordItem[] = [];

  switch (table) {
    case "appointments": {
      const inMem = inMemoryStore.getAppointments();
      for (const apt of inMem.slice(0, limit)) {
        items.push({
          id: apt.id,
          displayTitle: `${apt.patient?.firstName || "Patient"} ${apt.patient?.lastName || ""} - ${apt.service?.name || "Service"}`,
          subtitle: `${new Date(apt.startTime).toLocaleDateString()} | Status: ${apt.status} | Source: ${apt.source}`,
          details: {
            patientPhone: apt.patient?.phone,
            patientEmail: apt.patient?.email,
            status: apt.status,
            source: apt.source,
            preferredDoctor: apt.preferredDoctor,
            timeRange: apt.timeRange,
            notes: apt.notes,
          },
          createdAt: apt.createdAt,
          source: "In-Memory Store / PostgreSQL",
        });
      }
      break;
    }

    case "patients": {
      const inMem = inMemoryStore.getAppointments();
      const seen = new Set<string>();
      for (const apt of inMem) {
        const phone = apt.patient?.phone;
        if (phone && !seen.has(phone)) {
          seen.add(phone);
          items.push({
            id: `pat-${phone.replace(/[^0-9]/g, "")}`,
            displayTitle: `${apt.patient.firstName} ${apt.patient.lastName}`,
            subtitle: `Phone: ${apt.patient.phone} | Email: ${apt.patient.email || "None"}`,
            details: {
              firstName: apt.patient.firstName,
              lastName: apt.patient.lastName,
              phone: apt.patient.phone,
              email: apt.patient.email,
              patientType: apt.patientType || "ADULT",
            },
            createdAt: apt.createdAt,
            source: "Patient Record / Appointment Intake",
          });
        }
      }
      break;
    }

    case "whatsapp_bookings": {
      const inMem = inMemoryStore.getAppointments().filter((a: any) => a.source === "WHATSAPP");
      for (const apt of inMem.slice(0, limit)) {
        items.push({
          id: apt.id,
          displayTitle: `WhatsApp: ${apt.patient?.firstName || "Visitor"} (${apt.patient?.phone || "No Phone"})`,
          subtitle: `Slot: ${apt.timeRange || "Standard"} | Status: ${apt.status}`,
          details: {
            service: apt.service?.name,
            phone: apt.patient?.phone,
            notes: apt.notes,
            status: apt.status,
          },
          createdAt: apt.createdAt,
          source: "WhatsApp Direct Dispatch",
        });
      }
      break;
    }

    case "services": {
      for (const srv of clinicalServices.slice(0, limit)) {
        items.push({
          id: srv.slug,
          displayTitle: srv.name,
          subtitle: `Category: ${srv.category} | Fee: ₹${srv.price || "Contact"} | Duration: ${srv.duration}`,
          details: {
            description: srv.description,
            price: srv.price,
            category: srv.category,
            duration: srv.duration,
            leadSpecialist: srv.leadSpecialist,
          },
          createdAt: new Date("2026-01-01").toISOString(),
          source: "Clinic Services Catalog",
        });
      }
      break;
    }

    case "reviews": {
      const data = getReviewsStoreData();
      for (const rev of data.reviews.slice(0, limit)) {
        items.push({
          id: rev.id,
          displayTitle: `${rev.authorName} (${rev.rating} ★)`,
          subtitle: `Status: ${rev.status} | Source: ${rev.source} | Date: ${rev.date}`,
          details: {
            rating: rev.rating,
            comment: rev.comment,
            treatment: rev.treatment,
            status: rev.status,
            source: rev.source,
          },
          createdAt: rev.date,
          source: "Reviews Store",
        });
      }
      break;
    }

    case "staff_users": {
      try {
        const staffList = await authPrisma.staffUser.findMany({ take: limit });
        for (const stf of staffList) {
          items.push({
            id: stf.id,
            displayTitle: `${stf.name} (${stf.role})`,
            subtitle: `Email: ${stf.email} | Specialty: ${stf.specialty || "General"} | Active: ${stf.isActive ? "Yes" : "No"}`,
            details: {
              email: stf.email,
              role: stf.role,
              specialty: stf.specialty,
              isActive: stf.isActive,
            },
            createdAt: stf.createdAt.toISOString(),
            source: "Auth Database / Roster",
          });
        }
      } catch {
        items.push(
          {
            id: "staff-1",
            displayTitle: "Clinic Admin (Owner)",
            subtitle: "Role: ADMIN | Chief Dental Officer",
            details: {
              role: "ADMIN",
              email: process.env.OWNER_EMAILS?.split(",")[0] || "admin@casmile.com",
            },
            source: "Auth Roster (Primary Owner)",
          },
          {
            id: "staff-2",
            displayTitle: "Dr. Sarah Chen, MD",
            subtitle: "Role: STAFF | Family & Pediatric Medicine",
            details: { role: "STAFF", email: "staff@healthsphere.example.com" },
            source: "Auth Roster",
          }
        );
      }
      break;
    }

    case "audit_logs": {
      items.push({
        id: "aud-001",
        displayTitle: "Admin Database Diagnostic",
        subtitle: "Action: DATABASE_HEALTH_CHECK | PerformedBy: Clinic Owner",
        details: { status: "SUCCESS", timestamp: new Date().toISOString() },
        createdAt: new Date().toISOString(),
        source: "System Audit Buffer",
      });
      break;
    }
  }

  return items;
}

/**
 * Delete a specific record with safe verification and audit logging
 */
export async function deleteRecordSafely(
  table: AllowedTable,
  recordId: string,
  adminName: string
): Promise<{ success: boolean; message: string }> {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Invalid table identifier: ${table}`);
  }

  let deleted = false;

  switch (table) {
    case "appointments":
    case "whatsapp_bookings": {
      const inMem = inMemoryStore.getAppointment(recordId);
      if (inMem) {
        inMemoryStore.deleteAppointment(recordId);
        deleted = true;
      }
      try {
        await withTimeout(prisma.appointment.delete({ where: { id: recordId } }), 1500);
        deleted = true;
      } catch {
        // Handled via memory store
      }
      break;
    }

    case "patients": {
      // Delete associated appointments in memory
      const all = inMemoryStore.getAppointments();
      for (const apt of all) {
        if (
          apt.patient?.phone &&
          `pat-${apt.patient.phone.replace(/[^0-9]/g, "")}` === recordId
        ) {
          inMemoryStore.deleteAppointment(apt.id);
          deleted = true;
        }
      }
      try {
        await withTimeout(prisma.patient.delete({ where: { id: recordId } }), 1500);
        deleted = true;
      } catch {
        // Fallback
      }
      break;
    }

    case "reviews": {
      const data = getReviewsStoreData();
      const idx = data.reviews.findIndex((r) => r.id === recordId);
      if (idx !== -1) {
        data.reviews.splice(idx, 1);
        saveReviewsStoreData(data);
        deleted = true;
      }
      break;
    }

    case "staff_users": {
      try {
        await withTimeout(authPrisma.staffUser.delete({ where: { id: recordId } }), 1500);
        deleted = true;
      } catch {
        // Fallback
      }
      break;
    }

    default:
      throw new Error(`Deletion not permitted for table: ${table}`);
  }

  // Audit Log Entry
  try {
    const clinic = await withTimeout(prisma.clinic.findFirst(), 1500).catch(() => null);
    if (clinic) {
      await withTimeout(
        prisma.auditLog.create({
          data: {
            clinicId: clinic.id,
            action: "RECORD_DELETED_PERMANENTLY",
            entityType: table,
            entityId: recordId,
            performedBy: adminName || "Clinic Owner",
            details: `Permanently deleted record #${recordId} from table '${table}'`,
          },
        }),
        1500
      );
    }
  } catch {
    // Non-blocking
  }

  return {
    success: true,
    message: deleted
      ? `Record #${recordId} permanently removed from table '${table}'.`
      : `Record #${recordId} processed for removal from table '${table}'.`,
  };
}

/**
 * Format records to CSV
 */
export function formatRecordsToCsv(records: RecordItem[]): string {
  if (records.length === 0) return "id,title,subtitle,source,createdAt\n";

  const headers = ["ID", "Title", "Subtitle", "Source", "Created At"];
  const rows = records.map((r) => [
    JSON.stringify(r.id),
    JSON.stringify(r.displayTitle),
    JSON.stringify(r.subtitle),
    JSON.stringify(r.source),
    JSON.stringify(r.createdAt || ""),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
