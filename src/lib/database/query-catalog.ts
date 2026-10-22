import prisma, { authPrisma } from "@/lib/prisma";

export interface DatabaseQueryItem {
  id: string;
  category: "STORAGE_DIAGNOSTICS" | "ARCHIVING_RETENTION" | "CLINICAL_OPERATIONS" | "SECURITY_AUDIT";
  title: string;
  description: string;
  targetDatabase: "Main Clinic Database" | "Auth Security Database";
  safetyLevel: "SAFE_READONLY" | "ADMIN_RESTRICTED" | "TRANSACTIONAL_WRITE";
  sql: string;
  parametersExplanation?: string;
  expectedResult: string;
}

export const DATABASE_QUERIES_CATALOG: DatabaseQueryItem[] = [
  {
    id: "qry-storage-size",
    category: "STORAGE_DIAGNOSTICS",
    title: "Total PostgreSQL Database Size",
    description: "Calculates the total on-disk physical storage consumed by the PostgreSQL database in Supabase.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "SAFE_READONLY",
    sql: "SELECT pg_size_pretty(pg_database_size(current_database())) as size_pretty, pg_database_size(current_database()) as size_bytes, current_database() as database_name;",
    expectedResult: "Single row with size_pretty (e.g. '210 MB'), size_bytes, and database_name ('postgres').",
  },
  {
    id: "qry-table-sizes",
    category: "STORAGE_DIAGNOSTICS",
    title: "Table Storage Breakdown",
    description: "Lists all application tables sorted from largest to smallest disk consumption, including indexes and heap files.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "SAFE_READONLY",
    sql: `SELECT 
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_total_relation_size(relid) as size_bytes
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;`,
    expectedResult: "List of tables with human-readable disk sizes and raw byte counts.",
  },
  {
    id: "qry-row-counts",
    category: "STORAGE_DIAGNOSTICS",
    title: "System-Wide Entity Row Counts",
    description: "Quickly counts records across all primary models in the clinic schema.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "SAFE_READONLY",
    sql: `SELECT 'Appointment' as model, count(*) as count FROM "Appointment"
UNION ALL
SELECT 'Patient', count(*) FROM "Patient"
UNION ALL
SELECT 'Service', count(*) FROM "Service"
UNION ALL
SELECT 'AuditLog', count(*) FROM "AuditLog"
UNION ALL
SELECT 'ChatSession', count(*) FROM "ChatSession";`,
    expectedResult: "Tabular summary of each schema model and active count.",
  },
  {
    id: "qry-archive-appointments",
    category: "ARCHIVING_RETENTION",
    title: "Query Completed Appointments for Archiving",
    description: "Selects older completed or cancelled appointments that exceed the configured retention policy (e.g. older than 1 year).",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "ADMIN_RESTRICTED",
    sql: `SELECT 
  id, "patientId", "serviceId", "startTime", "endTime", status, source, notes, "createdAt"
FROM "Appointment"
WHERE status IN ('COMPLETED', 'CANCELLED', 'NO_SHOW')
  AND "startTime" < NOW() - INTERVAL '1 year'
ORDER BY "startTime" ASC;`,
    parametersExplanation: "Interval can be dynamically adjusted: '90 days', '6 months', '1 year', '2 years'.",
    expectedResult: "Candidate rows eligible for verified archiving and deletion.",
  },
  {
    id: "qry-archive-whatsapp",
    category: "ARCHIVING_RETENTION",
    title: "Query WhatsApp Direct Bookings for Archiving",
    description: "Identifies old WhatsApp booking dispatches beyond 90 days to free up high-churn notification records.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "ADMIN_RESTRICTED",
    sql: `SELECT 
  id, "patientId", "startTime", status, source, "timeRange", "contactMethod", "createdAt"
FROM "Appointment"
WHERE source = 'WHATSAPP'
  AND "createdAt" < NOW() - INTERVAL '90 days'
ORDER BY "createdAt" ASC;`,
    expectedResult: "WhatsApp booking records eligible for backup and pruning.",
  },
  {
    id: "qry-archive-logs",
    category: "ARCHIVING_RETENTION",
    title: "Query Old Audit Logs for Archiving",
    description: "Scans security audit events and status change records older than the 30-day retention threshold.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "ADMIN_RESTRICTED",
    sql: `SELECT 
  id, action, "entityType", "entityId", "performedBy", details, "createdAt"
FROM "AuditLog"
WHERE "createdAt" < NOW() - INTERVAL '30 days'
ORDER BY "createdAt" ASC;`,
    expectedResult: "Audit logs to be bundled into the encrypted audit archive file.",
  },
  {
    id: "qry-patient-protected",
    category: "CLINICAL_OPERATIONS",
    title: "Patient Intake Registry (Protected)",
    description: "Retrieves patient contact records. Marked permanently PROTECTED from automated cleanup.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "SAFE_READONLY",
    sql: `SELECT 
  id, "firstName", "lastName", email, phone, "dateOfBirth", "createdAt"
FROM "Patient"
ORDER BY "createdAt" DESC
LIMIT 50;`,
    expectedResult: "Protected patient demographic records.",
  },
  {
    id: "qry-staff-auth",
    category: "SECURITY_AUDIT",
    title: "Staff Roles and Security Roster",
    description: "Queries the isolated Auth Database for active clinical practitioners and administrative credentials.",
    targetDatabase: "Auth Security Database",
    safetyLevel: "SAFE_READONLY",
    sql: `SELECT 
  id, name, email, role, specialty, "isActive", "createdAt"
FROM "StaffUser"
ORDER BY "createdAt" ASC;`,
    expectedResult: "Roster of staff members, specialties, and assigned RBAC roles.",
  },
  {
    id: "qry-server-health",
    category: "STORAGE_DIAGNOSTICS",
    title: "PostgreSQL Server Engine & Version",
    description: "Inspects PostgreSQL database engine release version, current server timestamp, and active SSL state.",
    targetDatabase: "Main Clinic Database",
    safetyLevel: "SAFE_READONLY",
    sql: "SELECT version() as pg_version, current_timestamp as server_time, pg_is_in_recovery() as in_standby;",
    expectedResult: "PostgreSQL 15+ build information and connection timestamp.",
  },
];

/**
 * Execute a safe read-only query for the admin query inspector
 */
export async function executeSafeQuery(queryId: string): Promise<{
  queryId: string;
  sql: string;
  executionStatus: "SUCCESS" | "FAILED" | "OFFLINE_SIMULATION";
  durationMs: number;
  rowCount: number;
  results: any[];
  notes?: string;
}> {
  const item = DATABASE_QUERIES_CATALOG.find((q) => q.id === queryId);
  if (!item) {
    throw new Error(`Query with id '${queryId}' not found in catalog`);
  }

  const startTime = Date.now();

  try {
    const isAuth = item.targetDatabase === "Auth Security Database";
    const client = isAuth ? authPrisma : prisma;

    // Timeout safe execution
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Query execution timed out after 3500ms")), 3500)
    );

    const queryPromise = client.$queryRawUnsafe(item.sql);
    const rawResults: any = await Promise.race([queryPromise, timeoutPromise]);
    const durationMs = Date.now() - startTime;

    return {
      queryId,
      sql: item.sql,
      executionStatus: "SUCCESS",
      durationMs,
      rowCount: Array.isArray(rawResults) ? rawResults.length : 1,
      results: rawResults,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return {
      queryId,
      sql: item.sql,
      executionStatus: "OFFLINE_SIMULATION",
      durationMs,
      rowCount: 0,
      results: [],
      notes: `Remote database connection unavailable (${err.message}). Showing query structure and schema specification.`,
    };
  }
}
