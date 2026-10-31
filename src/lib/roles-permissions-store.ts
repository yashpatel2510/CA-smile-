import fs from "fs";
import path from "path";
import {
  RoleDefinition,
  RolesPermissionsConfig,
  AdminSectionId,
  ADMIN_SECTIONS_CATALOG,
  RoleBadgeColor,
} from "@/types/roles-permissions";

const CONFIG_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "roles-permissions-config.json"
);

const DEFAULT_CONFIG: RolesPermissionsConfig = {
  roles: [
    {
      id: "role-admin",
      key: "ADMIN",
      name: "Super Administrator",
      badgeColor: "purple",
      description: "Full unconstrained administrative access across all clinical, financial, and system setup configurations.",
      isSystem: true,
      allowedSections: ADMIN_SECTIONS_CATALOG.map((s) => s.id),
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "role-doctor",
      key: "DOCTOR",
      name: "Doctor / Dentist Specialist",
      badgeColor: "emerald",
      description: "Full access to live queue, clinical appointments, patient medical records, treatment session charting, and prescriptions.",
      isSystem: true,
      allowedSections: [
        "today",
        "appointments",
        "patients",
        "doctor",
        "services",
        "reviews",
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "role-receptionist",
      key: "RECEPTIONIST",
      name: "Receptionist & Front Desk",
      badgeColor: "blue",
      description: "Front-desk check-in, token queue, appointment scheduling, patient intake, billing payments, and WhatsApp communication.",
      isSystem: true,
      allowedSections: [
        "today",
        "appointments",
        "patients",
        "billing",
        "whatsapp",
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "role-staff",
      key: "STAFF",
      name: "Clinical Assistant / Staff",
      badgeColor: "teal",
      description: "Assists with patient movement, token queue calls, basic appointments, and clinical procedures.",
      isSystem: true,
      allowedSections: ["today", "appointments", "patients"],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "role-nurse",
      key: "NURSE",
      name: "Dental Nurse & Caregiver",
      badgeColor: "amber",
      description: "Chairside assistance, patient preparation, sterilization notes, and post-procedure care.",
      isSystem: true,
      allowedSections: ["today", "appointments", "patients", "doctor"],
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  staffSectionOverrides: {},
};

export function getRolesPermissionsConfig(): RolesPermissionsConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.roles) && parsed.roles.length > 0) {
        return {
          roles: parsed.roles,
          staffSectionOverrides: parsed.staffSectionOverrides || {},
        };
      }
    }
  } catch (err) {
    console.warn("Could not read roles-permissions-config.json, using defaults:", err);
  }
  return DEFAULT_CONFIG;
}

export function saveRolesPermissionsConfig(config: RolesPermissionsConfig): void {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving roles-permissions-config.json:", err);
  }
}

export function getAllRoles(): RoleDefinition[] {
  const config = getRolesPermissionsConfig();
  return config.roles;
}

export function getRoleByKeyOrId(keyOrId: string): RoleDefinition | undefined {
  const roles = getAllRoles();
  const search = keyOrId.toUpperCase();
  return (
    roles.find((r) => r.key.toUpperCase() === search || r.id === keyOrId) ||
    roles.find((r) => r.name.toLowerCase() === keyOrId.toLowerCase())
  );
}

export function createCustomRole(data: {
  name: string;
  badgeColor?: RoleBadgeColor;
  description?: string;
  allowedSections: AdminSectionId[];
}): RoleDefinition {
  const config = getRolesPermissionsConfig();
  const cleanKey = data.name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/__+/g, "_")
    .slice(0, 30);

  // Ensure unique key
  let finalKey = cleanKey;
  let counter = 1;
  while (config.roles.some((r) => r.key === finalKey)) {
    finalKey = `${cleanKey}_${counter++}`;
  }

  const newRole: RoleDefinition = {
    id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    key: finalKey,
    name: data.name.trim(),
    badgeColor: data.badgeColor || "indigo",
    description: data.description?.trim() || `Custom role with ${data.allowedSections.length} allowed sections.`,
    isSystem: false,
    allowedSections: data.allowedSections,
    createdAt: new Date().toISOString(),
  };

  config.roles.push(newRole);
  saveRolesPermissionsConfig(config);
  return newRole;
}

export function updateRole(
  idOrKey: string,
  updates: Partial<Pick<RoleDefinition, "name" | "badgeColor" | "description" | "allowedSections">>
): RoleDefinition | null {
  const config = getRolesPermissionsConfig();
  const index = config.roles.findIndex(
    (r) => r.id === idOrKey || r.key.toUpperCase() === idOrKey.toUpperCase()
  );

  if (index === -1) return null;

  const existing = config.roles[index];

  // Prevent modifying system key or revoking essential sections on ADMIN
  const isSuperAdmin = existing.key === "ADMIN";
  const updatedAllowedSections = isSuperAdmin
    ? ADMIN_SECTIONS_CATALOG.map((s) => s.id)
    : updates.allowedSections !== undefined
    ? updates.allowedSections
    : existing.allowedSections;

  const updated: RoleDefinition = {
    ...existing,
    name: updates.name ? updates.name.trim() : existing.name,
    badgeColor: updates.badgeColor || existing.badgeColor,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    allowedSections: updatedAllowedSections,
    updatedAt: new Date().toISOString(),
  };

  config.roles[index] = updated;
  saveRolesPermissionsConfig(config);
  return updated;
}

export function deleteRole(idOrKey: string): boolean {
  const config = getRolesPermissionsConfig();
  const target = config.roles.find(
    (r) => r.id === idOrKey || r.key.toUpperCase() === idOrKey.toUpperCase()
  );

  if (!target || target.isSystem || target.key === "ADMIN") {
    // Cannot delete system roles
    return false;
  }

  config.roles = config.roles.filter((r) => r.id !== target.id);
  saveRolesPermissionsConfig(config);
  return true;
}

export function getStaffEffectiveSections(
  staffId: string,
  roleKey: string
): AdminSectionId[] {
  const config = getRolesPermissionsConfig();

  // 1. Check for specific staff member custom overrides
  if (config.staffSectionOverrides[staffId]?.length) {
    return config.staffSectionOverrides[staffId];
  }

  // 2. Check for role's permitted sections
  const role = getRoleByKeyOrId(roleKey);
  if (role) {
    return role.allowedSections;
  }

  // 3. Fallback for ADMIN
  if (roleKey.toUpperCase() === "ADMIN") {
    return ADMIN_SECTIONS_CATALOG.map((s) => s.id);
  }

  // Default fallback
  return ["today", "appointments", "patients"];
}

export function setStaffSectionOverrides(
  staffId: string,
  allowedSections: AdminSectionId[] | null
): void {
  const config = getRolesPermissionsConfig();
  if (allowedSections === null) {
    delete config.staffSectionOverrides[staffId];
  } else {
    config.staffSectionOverrides[staffId] = allowedSections;
  }
  saveRolesPermissionsConfig(config);
}

export const getEffectiveSectionsForStaff = getStaffEffectiveSections;
