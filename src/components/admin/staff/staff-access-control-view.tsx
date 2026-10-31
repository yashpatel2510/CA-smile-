"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Shield,
  UserPlus,
  Search,
  Mail,
  Phone,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ChevronRight,
  Filter,
  Check,
  Plus,
  Eye,
  SlidersHorizontal,
  Building2,
  Smile,
  Calendar,
  Stethoscope,
  BriefcaseMedical,
  Receipt,
  MessageSquare,
  Star,
  HelpCircle,
  Database,
  Cog,
  UserCog,
  Sparkles,
  Settings,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AdminSectionId,
  AdminSectionConfig,
  RoleDefinition,
  RoleBadgeColor,
  StaffMember,
  ADMIN_SECTIONS_CATALOG,
} from "@/types/roles-permissions";

// Icon mapper for admin sections
const SECTION_ICONS: Record<string, React.ElementType> = {
  Smile,
  Calendar,
  Users,
  Stethoscope,
  BriefcaseMedical,
  Receipt,
  MessageSquare,
  Star,
  HelpCircle,
  Database,
  Cog,
  UserCog,
};

// Role badge styling presets
const ROLE_COLOR_STYLES: Record<
  RoleBadgeColor,
  {
    badge: string;
    border: string;
    ring: string;
    dot: string;
    bg: string;
    text: string;
  }
> = {
  purple: {
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    border: "border-purple-200 dark:border-purple-900/60",
    ring: "focus:ring-purple-500",
    dot: "bg-purple-600",
    bg: "bg-purple-600",
    text: "text-purple-700 dark:text-purple-300",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    border: "border-emerald-200 dark:border-emerald-900/60",
    ring: "focus:ring-emerald-500",
    dot: "bg-emerald-600",
    bg: "bg-emerald-600",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  blue: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    border: "border-blue-200 dark:border-blue-900/60",
    ring: "focus:ring-blue-500",
    dot: "bg-blue-600",
    bg: "bg-blue-600",
    text: "text-blue-700 dark:text-blue-300",
  },
  teal: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    border: "border-teal-200 dark:border-teal-900/60",
    ring: "focus:ring-teal-500",
    dot: "bg-teal-600",
    bg: "bg-teal-600",
    text: "text-teal-700 dark:text-teal-300",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25",
    border: "border-amber-200 dark:border-amber-900/60",
    ring: "focus:ring-amber-500",
    dot: "bg-amber-600",
    bg: "bg-amber-600",
    text: "text-amber-800 dark:text-amber-300",
  },
  rose: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    border: "border-rose-200 dark:border-rose-900/60",
    ring: "focus:ring-rose-500",
    dot: "bg-rose-600",
    bg: "bg-rose-600",
    text: "text-rose-700 dark:text-rose-300",
  },
  cyan: {
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
    border: "border-cyan-200 dark:border-cyan-900/60",
    ring: "focus:ring-cyan-500",
    dot: "bg-cyan-600",
    bg: "bg-cyan-600",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  indigo: {
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    border: "border-indigo-200 dark:border-indigo-900/60",
    ring: "focus:ring-indigo-500",
    dot: "bg-indigo-600",
    bg: "bg-indigo-600",
    text: "text-indigo-700 dark:text-indigo-300",
  },
};

export function StaffAccessControlView() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"staff" | "roles" | "simulator">("staff");

  // Data state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [sections] = useState<AdminSectionConfig[]>(ADMIN_SECTIONS_CATALOG);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Toast / Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    role: "STAFF",
    specialty: "",
    phone: "",
    password: "",
  });
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Role Creation / Editing Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleDefinition | null>(null);
  const [roleForm, setRoleForm] = useState<{
    name: string;
    badgeColor: RoleBadgeColor;
    description: string;
    allowedSections: AdminSectionId[];
  }>({
    name: "",
    badgeColor: "indigo",
    description: "",
    allowedSections: ["today", "appointments", "patients"],
  });
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Custom Staff Section Permissions Modal
  const [permissionsModalStaff, setPermissionsModalStaff] = useState<StaffMember | null>(null);
  const [staffSectionsForm, setStaffSectionsForm] = useState<AdminSectionId[]>([]);
  const [isSavingStaffPermissions, setIsSavingStaffPermissions] = useState(false);

  // Change Password Modal
  const [passwordModalStaff, setPasswordModalStaff] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Delete Staff Modal
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);

  // Delete Role Modal
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [isDeletingRole, setIsDeletingRole] = useState(false);

  // Simulator State
  const [simulatorSubjectType, setSimulatorSubjectType] = useState<"role" | "staff">("role");
  const [simulatorSubjectId, setSimulatorSubjectId] = useState<string>("role-receptionist");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all staff and roles
  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/admin/roles"),
      ]);

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        if (Array.isArray(staffData.staff)) {
          setStaffList(staffData.staff);
        }
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        if (Array.isArray(rolesData.roles)) {
          setRoles(rolesData.roles);
        }
      }
    } catch (err) {
      console.error("Failed to load staff/roles data:", err);
      showToast("Failed to load staff directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.specialty && m.specialty.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q));

      const matchesRole =
        selectedRoleFilter === "ALL" ||
        m.role.toUpperCase() === selectedRoleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [staffList, searchQuery, selectedRoleFilter]);

  // Group sections by category
  const sectionsByCategory = useMemo(() => {
    const categories: Record<string, AdminSectionConfig[]> = {};
    for (const s of sections) {
      if (!categories[s.category]) {
        categories[s.category] = [];
      }
      categories[s.category].push(s);
    }
    return categories;
  }, [sections]);

  // Open Create / Edit Role Modal
  const handleOpenCreateRole = () => {
    setRoleToEdit(null);
    setRoleForm({
      name: "",
      badgeColor: "indigo",
      description: "",
      allowedSections: ["today", "appointments", "patients"],
    });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: RoleDefinition) => {
    setRoleToEdit(role);
    setRoleForm({
      name: role.name,
      badgeColor: role.badgeColor,
      description: role.description,
      allowedSections: [...role.allowedSections],
    });
    setIsRoleModalOpen(true);
  };

  // Submit Create / Edit Role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      showToast("Role title is required", "error");
      return;
    }

    if (roleForm.allowedSections.length === 0) {
      showToast("Select at least 1 section for this role", "error");
      return;
    }

    setIsSavingRole(true);
    try {
      if (roleToEdit) {
        // Edit existing
        const res = await fetch("/api/admin/roles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: roleToEdit.id,
            ...roleForm,
          }),
        });
        const data = await res.json();
        if (data.success && data.role) {
          setRoles((prev) =>
            prev.map((r) => (r.id === roleToEdit.id ? data.role : r))
          );
          showToast(`Role '${data.role.name}' updated successfully!`);
          setIsRoleModalOpen(false);
          loadData();
        } else {
          showToast(data.message || "Failed to update role", "error");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roleForm),
        });
        const data = await res.json();
        if (data.success && data.role) {
          setRoles((prev) => [...prev, data.role]);
          showToast(`Custom role '${data.role.name}' created successfully!`);
          setIsRoleModalOpen(false);
          loadData();
        } else {
          showToast(data.message || "Failed to create role", "error");
        }
      }
    } catch {
      showToast("Server communication error", "error");
    } finally {
      setIsSavingRole(false);
    }
  };

  // Delete Custom Role
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeletingRole(true);
    try {
      const res = await fetch(`/api/admin/roles?id=${roleToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
        showToast("Custom role deleted successfully");
        setRoleToDelete(null);
        loadData();
      } else {
        showToast(data.message || "Could not delete role", "error");
      }
    } catch {
      showToast("Failed to delete role", "error");
    } finally {
      setIsDeletingRole(false);
    }
  };

  // Open Edit Staff Section Overrides
  const handleOpenStaffPermissions = (staff: StaffMember) => {
    setPermissionsModalStaff(staff);
    // Initial selection is their effective sections
    const current =
      staff.customSections ||
      staff.effectiveSections ||
      roles.find((r) => r.key.toUpperCase() === staff.role.toUpperCase())?.allowedSections ||
      ["today", "appointments", "patients"];
    setStaffSectionsForm([...current]);
  };

  // Save Staff Section Overrides
  const handleSaveStaffPermissions = async (resetToDefault = false) => {
    if (!permissionsModalStaff) return;
    setIsSavingStaffPermissions(true);
    try {
      const res = await fetch("/api/admin/roles/staff-permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: permissionsModalStaff.id,
          allowedSections: resetToDefault ? null : staffSectionsForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((m) =>
            m.id === permissionsModalStaff.id
              ? {
                  ...m,
                  customSections: resetToDefault ? undefined : staffSectionsForm,
                  effectiveSections: data.effectiveSections,
                }
              : m
          )
        );
        showToast(
          resetToDefault
            ? `Restored default role permissions for ${permissionsModalStaff.name}`
            : `Updated section access for ${permissionsModalStaff.name}`
        );
        setPermissionsModalStaff(null);
      } else {
        showToast(data.message || "Failed to update permissions", "error");
      }
    } catch {
      showToast("Error saving permissions", "error");
    } finally {
      setIsSavingStaffPermissions(false);
    }
  };

  // Submit Invite Staff
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email) {
      showToast("Name and email are required", "error");
      return;
    }

    setIsSubmittingInvite(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaffForm),
      });
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList((prev) => [data.staff, ...prev]);
        showToast(`Staff member '${newStaffForm.name}' added successfully!`);
        setIsInviteModalOpen(false);
        setNewStaffForm({
          name: "",
          email: "",
          role: "STAFF",
          specialty: "",
          phone: "",
          password: "",
        });
      } else {
        showToast(data.message || "Failed to invite staff", "error");
      }
    } catch {
      showToast("Error creating staff account", "error");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Submit Reset Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStaff || !newPassword) return;

    setIsSavingPassword(true);
    try {
      const res = await fetch(`/api/staff/${passwordModalStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Password updated for ${passwordModalStaff.name}`);
        setPasswordModalStaff(null);
        setNewPassword("");
      } else {
        showToast(data.message || "Failed to update password", "error");
      }
    } catch {
      showToast("Failed to update password", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Submit Delete Staff
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setIsDeletingStaff(true);
    try {
      const res = await fetch(`/api/staff/${staffToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) => prev.filter((m) => m.id !== staffToDelete.id));
        showToast(`Staff member removed from clinic roster`);
        setStaffToDelete(null);
      } else {
        showToast(data.message || "Could not delete staff member", "error");
      }
    } catch {
      showToast("Failed to remove staff", "error");
    } finally {
      setIsDeletingStaff(false);
    }
  };

  // Toggle active status
  const handleToggleStaffStatus = async (member: StaffMember) => {
    const updatedStatus = !member.isActive;
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.ok) {
        setStaffList((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, isActive: updatedStatus } : m))
        );
        showToast(`${member.name} marked as ${updatedStatus ? "Active" : "Inactive"}`);
      }
    } catch {
      showToast("Could not update staff status", "error");
    }
  };

  // Simulator: active permitted sections
  const simulatedAllowedSections = useMemo(() => {
    if (simulatorSubjectType === "role") {
      const r = roles.find((role) => role.id === simulatorSubjectId || role.key === simulatorSubjectId);
      return r ? r.allowedSections : [];
    } else {
      const m = staffList.find((member) => member.id === simulatorSubjectId);
      return m ? m.effectiveSections || [] : [];
    }
  }, [simulatorSubjectType, simulatorSubjectId, roles, staffList]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 select-none">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
              : "border-rose-500/30 bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Staff &amp; Access Control
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
              <Shield className="h-3 w-3" />
              <span>Role-Based Access</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Create custom clinic roles, assign staff credentials, and specify exactly which sections of the Admin Panel each person or role is allowed to see and manage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleOpenCreateRole}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl border-zinc-300 hover:bg-zinc-100 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Role</span>
          </Button>

          <Button
            onClick={() => setIsInviteModalOpen(true)}
            size="sm"
            variant="primary"
            className="h-9 gap-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                Total Staff
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                {staffList.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                Active Clinicians
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {staffList.filter((m) => m.isActive).length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                Defined Roles
              </div>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                {roles.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                Admin Sections
              </div>
              <div className="text-xl font-black text-teal-600 dark:text-teal-400">
                {sections.length} Managed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sub-Tabs Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "staff"
                ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Staff Directory &amp; Permissions</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {staffList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "roles"
                ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Roles &amp; Section Access Matrix</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.2 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {roles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Section Visibility Preview</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: STAFF DIRECTORY & PERMISSIONS                                */}
      {/* =================================================================== */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search staff by name, email, specialty, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedRoleFilter("ALL")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  selectedRoleFilter === "ALL"
                    ? "bg-zinc-900 text-white shadow-2xs"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                All Roles
              </button>
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoleFilter(r.key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                    selectedRoleFilter.toUpperCase() === r.key.toUpperCase()
                      ? "bg-zinc-900 text-white shadow-2xs"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Table */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
            {loading ? (
              <div className="p-12 text-center text-xs text-zinc-500">
                Loading staff directory...
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  No staff members found
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Try adjusting your search query or role filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50/70 font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-850">
                    <tr>
                      <th className="px-5 py-3">Staff Member</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Allowed Admin Sections</th>
                      <th className="px-5 py-3">Specialty / Department</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                    {filteredStaff.map((member) => {
                      const matchedRole = roles.find(
                        (r) => r.key.toUpperCase() === member.role.toUpperCase()
                      );
                      const badgeColor = matchedRole?.badgeColor || "teal";
                      const colorStyle = ROLE_COLOR_STYLES[badgeColor] || ROLE_COLOR_STYLES.teal;
                      const effective = member.effectiveSections || matchedRole?.allowedSections || [];
                      const isCustom = Boolean(member.customSections?.length);

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-zinc-50/60 dark:hover:bg-zinc-850/50 transition-colors"
                        >
                          {/* Name & Email */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs uppercase border ${colorStyle.border} ${colorStyle.badge}`}
                              >
                                {member.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {member.name}
                                </div>
                                <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${colorStyle.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${colorStyle.dot}`} />
                              <span>{matchedRole?.name || member.role}</span>
                            </span>
                          </td>

                          {/* Allowed Admin Sections */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center gap-1 max-w-sm">
                              {effective.slice(0, 3).map((secId) => {
                                const sec = sections.find((s) => s.id === secId);
                                return (
                                  <span
                                    key={secId}
                                    className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700"
                                  >
                                    <span>{sec?.name.split(" ")[0]}</span>
                                  </span>
                                );
                              })}
                              {effective.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenStaffPermissions(member)}
                                  className="inline-flex items-center rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 text-[10px] font-bold border border-purple-200 hover:underline"
                                >
                                  +{effective.length - 3} more
                                </button>
                              )}
                              {isCustom && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider ml-1">
                                  Custom Override
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Specialty / Contact */}
                          <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                            <div>{member.specialty || "Clinical Staff"}</div>
                            {member.phone && (
                              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStaffStatus(member)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold transition-all ${
                                member.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  member.isActive ? "bg-emerald-500" : "bg-zinc-400"
                                }`}
                              />
                              <span>{member.isActive ? "Active" : "Inactive"}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenStaffPermissions(member)}
                                title="Customize Allowed Admin Sections"
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                <Eye className="h-3 w-3 text-zinc-500" />
                                <span>Access</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPasswordModalStaff(member);
                                  setNewPassword("");
                                }}
                                title="Set / Reset Password"
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setStaffToDelete(member)}
                                title="Remove Staff Member"
                                className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-zinc-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-800"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ROLES & SECTION ACCESS MATRIX                                */}
      {/* =================================================================== */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Clinic Role Permissions Matrix
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Each role defines the default admin panel sections visible to staff members assigned to it.
              </p>
            </div>

            <Button
              onClick={handleOpenCreateRole}
              size="sm"
              className="gap-1.5 text-xs font-bold rounded-xl bg-zinc-900 hover:bg-black text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Role</span>
            </Button>
          </div>

          {/* Grid of Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
              const colorStyle = ROLE_COLOR_STYLES[role.badgeColor] || ROLE_COLOR_STYLES.teal;
              const count = staffList.filter((m) => m.role.toUpperCase() === role.key.toUpperCase()).length;

              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between transition-all hover:border-zinc-300 hover:shadow-md"
                >
                  <div>
                    {/* Role Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${colorStyle.badge}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${colorStyle.dot}`} />
                        <span>{role.name}</span>
                      </span>

                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                        {count} Member{count === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 min-h-[36px] line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Allowed Sections Pill Checklist */}
                    <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        <span>Permitted Sections:</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {role.allowedSections.length} / {sections.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                        {role.allowedSections.map((secId) => {
                          const sec = sections.find((s) => s.id === secId);
                          return (
                            <span
                              key={secId}
                              className="inline-flex items-center gap-1 rounded-lg bg-zinc-50 dark:bg-zinc-850 px-2 py-1 text-[10.5px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-800"
                            >
                              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{sec?.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {role.isSystem ? "Built-In System Role" : "Custom Clinic Role"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRole(role)}
                        className="rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </button>

                      {!role.isSystem && role.key !== "ADMIN" && (
                        <button
                          type="button"
                          onClick={() => setRoleToDelete(role)}
                          className="rounded-lg p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: SECTION VISIBILITY SIMULATOR / PREVIEW                       */}
      {/* =================================================================== */}
      {activeTab === "simulator" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Admin Panel Navigation Simulator
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Select any role or staff member to preview exactly which admin panel tabs and sections they can see.
              </p>
            </div>

            {/* Selector Toolbar */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-850">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorSubjectType("role");
                    setSimulatorSubjectId(roles[0]?.id || "role-admin");
                  }}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    simulatorSubjectType === "role"
                      ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  By Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorSubjectType("staff");
                    setSimulatorSubjectId(staffList[0]?.id || "");
                  }}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                    simulatorSubjectType === "staff"
                      ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  By Staff Member
                </button>
              </div>

              {simulatorSubjectType === "role" ? (
                <select
                  value={simulatorSubjectId}
                  onChange={(e) => setSimulatorSubjectId(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={simulatorSubjectId}
                  onChange={(e) => setSimulatorSubjectId(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {staffList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Simulator Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Mock Sidebar Preview */}
            <div className="md:col-span-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                <span>Simulated Admin Sidebar</span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {simulatedAllowedSections.length} Sections Visible
                </span>
              </div>

              <div className="space-y-1.5">
                {sections.map((sec) => {
                  const isVisible = simulatedAllowedSections.includes(sec.id);
                  const Icon = SECTION_ICONS[sec.iconName] || Smile;

                  return (
                    <div
                      key={sec.id}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                        isVisible
                          ? "bg-white text-zinc-900 border border-zinc-200 shadow-2xs dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
                          : "opacity-30 bg-transparent text-zinc-400 border border-dashed border-zinc-200 line-through dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />
                        <span className="font-semibold truncate">{sec.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          isVisible
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                        }`}
                      >
                        {isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Section Details & Explanations */}
            <div className="md:col-span-7 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Detailed Section Capabilities
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.map((sec) => {
                  const isVisible = simulatedAllowedSections.includes(sec.id);
                  const Icon = SECTION_ICONS[sec.iconName] || Smile;

                  return (
                    <div
                      key={sec.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isVisible
                          ? "bg-white border-zinc-200/90 shadow-2xs dark:bg-zinc-900 dark:border-zinc-800"
                          : "bg-zinc-50/50 border-zinc-200/50 opacity-40 dark:bg-zinc-900/20 dark:border-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {sec.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">
                        {sec.description}
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-zinc-400">
                        Route: {sec.href}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: CREATE / EDIT CUSTOM ROLE                                  */}
      {/* =================================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {roleToEdit ? "Edit Role Configuration" : "New Custom Role"}
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                {roleToEdit ? `Configure ${roleToEdit.name}` : "Create Custom Clinic Role"}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Define the role name, styling badge, and specify which sections of the Admin Panel users with this role can see and access.
              </p>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              {/* Role Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Dental Surgeon, Front Desk Associate"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Badge Color Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Badge Color Theme
                </label>
                <div className="flex items-center gap-2">
                  {(
                    ["purple", "emerald", "blue", "teal", "amber", "rose", "cyan", "indigo"] as RoleBadgeColor[]
                  ).map((color) => {
                    const style = ROLE_COLOR_STYLES[color];
                    const isSelected = roleForm.badgeColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setRoleForm({ ...roleForm, badgeColor: color })}
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${style.bg} ${
                          isSelected ? "ring-2 ring-offset-2 ring-zinc-900 scale-110" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of duties and responsibilities..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Section Access Checkbox Grid */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Permitted Admin Panel Sections ({roleForm.allowedSections.length} / {sections.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRoleForm({
                          ...roleForm,
                          allowedSections: sections.map((s) => s.id),
                        })
                      }
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-zinc-300">•</span>
                    <button
                      type="button"
                      onClick={() => setRoleForm({ ...roleForm, allowedSections: [] })}
                      className="text-[11px] font-bold text-zinc-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(sectionsByCategory).map(([catName, catSections]) => (
                    <div key={catName} className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {catName}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catSections.map((sec) => {
                          const isChecked = roleForm.allowedSections.includes(sec.id);
                          const Icon = SECTION_ICONS[sec.iconName] || Smile;

                          return (
                            <label
                              key={sec.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? "border-emerald-500/50 bg-emerald-50/50 text-zinc-900 dark:bg-emerald-950/30 dark:text-zinc-100"
                                  : "border-zinc-200 bg-zinc-50/40 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-850"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRoleForm({
                                      ...roleForm,
                                      allowedSections: [...roleForm.allowedSections, sec.id],
                                    });
                                  } else {
                                    setRoleForm({
                                      ...roleForm,
                                      allowedSections: roleForm.allowedSections.filter((id) => id !== sec.id),
                                    });
                                  }
                                }}
                                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                  <Icon className="h-3 w-3 shrink-0 text-zinc-600 dark:text-zinc-300" />
                                  <span className="truncate">{sec.name}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                  {sec.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingRole}
                  className="rounded-xl bg-zinc-900 hover:bg-black text-white font-bold"
                >
                  {isSavingRole ? "Saving..." : roleToEdit ? "Update Role" : "Create Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: CUSTOMIZE STAFF SECTION PERMISSIONS                        */}
      {/* =================================================================== */}
      {permissionsModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setPermissionsModalStaff(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Staff Access Customization
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                {permissionsModalStaff.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Assigned Role: <span className="font-bold text-zinc-800 dark:text-zinc-200">{permissionsModalStaff.role}</span>. You can customize the exact admin sections visible to this individual staff member.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 pb-2">
                <span>Select Permitted Sections ({staffSectionsForm.length} / {sections.length})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffSectionsForm(sections.map((s) => s.id))}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-zinc-300">•</span>
                  <button
                    type="button"
                    onClick={() => setStaffSectionsForm([])}
                    className="text-[11px] font-bold text-zinc-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {sections.map((sec) => {
                  const isChecked = staffSectionsForm.includes(sec.id);
                  const Icon = SECTION_ICONS[sec.iconName] || Smile;

                  return (
                    <label
                      key={sec.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-emerald-500/50 bg-emerald-50/40 text-zinc-900 dark:bg-emerald-950/20 dark:text-zinc-100"
                          : "border-zinc-200 bg-zinc-50/40 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStaffSectionsForm([...staffSectionsForm, sec.id]);
                            } else {
                              setStaffSectionsForm(staffSectionsForm.filter((id) => id !== sec.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <Icon className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />
                        <div className="min-w-0">
                          <span className="font-bold text-xs truncate block">{sec.name}</span>
                          <span className="text-[10px] text-zinc-400 truncate block">{sec.category}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isChecked
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                        }`}
                      >
                        {isChecked ? "Allowed" : "Blocked"}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveStaffPermissions(true)}
                  className="text-xs text-zinc-600 hover:text-zinc-900"
                >
                  Reset to Role Defaults
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPermissionsModalStaff(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isSavingStaffPermissions}
                    onClick={() => handleSaveStaffPermissions(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isSavingStaffPermissions ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: INVITE STAFF MEMBER                                        */}
      {/* =================================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Team Roster
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                Invite Staff Member
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Add a new clinician or staff member with role credentials.
              </p>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Sharma"
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya@casmile.com"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Assign Role *
                  </label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.key}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department / Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g. Endodontics, Front Desk, Periodontics"
                  value={newStaffForm.specialty}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, specialty: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Minimum 4 characters"
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isSubmittingInvite ? "Inviting..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: RESET PASSWORD                                             */}
      {/* =================================================================== */}
      {passwordModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setPasswordModalStaff(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Security &amp; Credentials
              </span>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                Set Password
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Updating credentials for <span className="font-bold">{passwordModalStaff.name}</span>.
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordModalStaff(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingPassword || !newPassword}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  {isSavingPassword ? "Saving..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: DELETE CONFIRMATION                                        */}
      {/* =================================================================== */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <ShieldAlert className="h-6 w-6" />
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                Remove Staff Member?
              </h2>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-zinc-800 dark:text-zinc-200">{staffToDelete.name}</span> ({staffToDelete.email}) from the clinic roster? They will lose access to all clinical systems immediately.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStaffToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingStaff}
                onClick={handleDeleteStaff}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isDeletingStaff ? "Removing..." : "Yes, Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: DELETE CUSTOM ROLE CONFIRMATION */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <ShieldAlert className="h-6 w-6" />
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                Delete Role: {roleToDelete.name}?
              </h2>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to permanently delete this custom role? Any staff members currently assigned to this role will default to basic staff access.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoleToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingRole}
                onClick={handleDeleteRole}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isDeletingRole ? "Deleting..." : "Delete Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffAccessControlView;
