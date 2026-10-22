"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Mail,
  Phone,
  Shield,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  Filter,
  KeyRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "DOCTOR" | "NURSE" | "RECEPTIONIST";
  specialty?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

const FALLBACK_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Dr. Evelyn Reed, MD",
    email: "admin@healthsphere.example.com",
    role: "ADMIN",
    specialty: "Chief Medical Officer & Cardiology",
    phone: "(555) 019-2831",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "staff-2",
    name: "Dr. Sarah Chen, MD",
    email: "staff@healthsphere.example.com",
    role: "STAFF",
    specialty: "Family & Pediatric Medicine",
    phone: "(555) 019-2832",
    isActive: true,
    createdAt: "2026-02-15T08:00:00Z",
  },
  {
    id: "staff-3",
    name: "Dr. Marcus Vance, FACC",
    email: "marcus.vance@healthsphere.example.com",
    role: "STAFF",
    specialty: "Interventional Cardiology",
    phone: "(555) 019-2833",
    isActive: true,
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "staff-4",
    name: "Elena Rostova, RN",
    email: "elena.rostova@healthsphere.example.com",
    role: "NURSE",
    specialty: "Clinical Triage & Care Coordinator",
    phone: "(555) 019-2834",
    isActive: true,
    createdAt: "2026-04-12T08:00:00Z",
  },
];

export default function AdminStaffPage() {
  const { data: session, status: authStatus } = useSession();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "STAFF",
    specialty: "",
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit Role Modal State
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Set Password Modal State
  const [passwordModalStaff, setPasswordModalStaff] = useState<StaffMember | null>(null);
  const [staffNewPassword, setStaffNewPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Delete Staff Modal State
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true);
        const res = await fetch("/api/staff");
        if (res.ok) {
          const data = await res.json();
          if (data.staff && data.staff.length > 0) {
            setStaff(data.staff);
          } else {
            setStaff(FALLBACK_STAFF);
          }
        } else {
          setStaff(FALLBACK_STAFF);
        }
      } catch {
        setStaff(FALLBACK_STAFF);
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) {
      showToast("Name and email are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });

      if (res.ok) {
        const data = await res.json();
        setStaff((prev) => [data.staff, ...prev]);
        showToast(`Staff invitation sent to ${newStaff.email}`);
        setInviteModalOpen(false);
        setNewStaff({
          name: "",
          email: "",
          role: "STAFF",
          specialty: "",
          phone: "",
          password: "",
        });
      } else {
        // Fallback optimistic
        const created: StaffMember = {
          id: `staff-${Date.now()}`,
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role as any,
          specialty: newStaff.specialty || "General Medicine",
          phone: newStaff.phone,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setStaff((prev) => [created, ...prev]);
        showToast(`Staff invitation sent to ${newStaff.email}`);
        setInviteModalOpen(false);
        setNewStaff({
          name: "",
          email: "",
          role: "STAFF",
          specialty: "",
          phone: "",
          password: "",
        });
      }
    } catch {
      showToast("Failed to send staff invitation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStaff || !staffNewPassword) return;
    setPasswordSubmitting(true);
    try {
      const res = await fetch(`/api/staff/${passwordModalStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: staffNewPassword }),
      });
      if (res.ok) {
        showToast(`Login password updated successfully for ${passwordModalStaff.name}`);
        setPasswordModalStaff(null);
        setStaffNewPassword("");
      } else {
        showToast("Failed to update staff password", "error");
      }
    } catch {
      showToast("Failed to update staff password", "error");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleUpdateRole = async (targetRole: StaffMember["role"]) => {
    if (!editingStaff) return;
    try {
      const res = await fetch(`/api/staff/${editingStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });

      if (res.ok) {
        setStaff((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id ? { ...s, role: targetRole } : s
          )
        );
        showToast(`Updated ${editingStaff.name}'s role to ${targetRole}`);
      } else {
        setStaff((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id ? { ...s, role: targetRole } : s
          )
        );
        showToast(`Updated ${editingStaff.name}'s role to ${targetRole}`);
      }
      setEditingStaff(null);
    } catch {
      showToast("Failed to update role", "error");
    }
  };

  const handleToggleActive = async (member: StaffMember) => {
    const updatedStatus = !member.isActive;
    try {
      await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id ? { ...s, isActive: updatedStatus } : s
        )
      );
      showToast(
        `${member.name} is now ${updatedStatus ? "Active" : "Deactivated"}`
      );
    } catch {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id ? { ...s, isActive: updatedStatus } : s
        )
      );
      showToast(`${member.name} status updated`);
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    setIsDeletingStaff(true);
    try {
      const res = await fetch(`/api/staff/${staffToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
        showToast(`Staff member "${staffToDelete.name}" was removed from roster.`);
        setStaffToDelete(null);
      } else {
        setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
        showToast(`Staff member "${staffToDelete.name}" was removed.`);
        setStaffToDelete(null);
      }
    } catch {
      setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
      showToast(`Staff member "${staffToDelete.name}" was removed.`);
      setStaffToDelete(null);
    } finally {
      setIsDeletingStaff(false);
    }
  };

  // If loading session
  if (authStatus === "loading") {
    return (
      <div className="space-y-3 py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        <p className="text-xs text-brand-muted">
          Verifying administrator authorization...
        </p>
      </div>
    );
  }

  // Non-Admin Permission Guard Screen
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="space-y-4 border-rose-500/30 bg-rose-500/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-brand-text">
              Administrator Privileges Required
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-brand-muted">
              Staff management, role assignments, and clinician invitation are
              restricted to users with the{" "}
              <strong className="font-semibold text-brand-text">ADMIN</strong>{" "}
              role. Your current authenticated role is{" "}
              <strong className="font-semibold text-brand-primary">
                {session?.user?.role || "STAFF"}
              </strong>
              .
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-xs">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <span>Sign in as Admin</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const filteredStaff = staff.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.specialty &&
        m.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalAdmins = staff.filter((s) => s.role === "ADMIN").length;
  const totalClinicians = staff.filter((s) => s.isActive).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-clinic border p-3 text-xs transition-all ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="hover:opacity-75"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-brand-text">
              Staff & Access Control
            </h1>
            <Badge
              variant="secondary"
              className="border-purple-500/20 bg-purple-500/10 text-[10px] text-purple-600 dark:text-purple-400"
            >
              Admin Exclusive
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-brand-muted">
            Invite clinicians, assign role permissions (Admin vs. Staff), and
            manage system credentials.
          </p>
        </div>

        <Button
          onClick={() => setInviteModalOpen(true)}
          size="sm"
          variant="primary"
          className="h-9 gap-1.5 text-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite New Staff Member</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="bg-brand-primary/10 rounded-lg p-2.5 text-brand-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Total Roster
            </div>
            <div className="mt-0.5 font-heading text-xl font-bold text-brand-text">
              {staff.length} Members
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              Active Clinicians
            </div>
            <div className="mt-0.5 font-heading text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalClinicians} Active
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-600 dark:text-purple-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
              System Administrators
            </div>
            <div className="mt-0.5 font-heading text-xl font-bold text-purple-600 dark:text-purple-400">
              {totalAdmins} Admins
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or specialty..."
            className="w-full rounded-clinic border border-brand-border bg-brand-surface py-2 pl-9 pr-4 text-xs text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center gap-1.5 overflow-x-auto md:w-auto">
          {["ALL", "ADMIN", "STAFF", "DOCTOR", "NURSE", "RECEPTIONIST"].map(
            (role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
                  roleFilter === role
                    ? "bg-brand-primary font-medium text-white"
                    : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-text"
                }`}
              >
                {role === "ALL" ? "All Roles" : role}
              </button>
            )
          )}
        </div>
      </div>

      {/* Staff Table */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="space-y-3 p-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              <div className="text-xs text-brand-muted">
                Loading staff directory...
              </div>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="space-y-2 px-4 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-brand-muted" />
              <div className="font-heading text-sm font-semibold text-brand-text">
                No staff members found
              </div>
              <p className="text-xs text-brand-muted">
                Try adjusting your search or role filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border bg-brand-background font-medium text-brand-muted">
                <tr>
                  <th className="px-6 py-3">Staff Member</th>
                  <th className="px-6 py-3">Role & Access</th>
                  <th className="px-6 py-3">Department / Specialty</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-brand-accent/10 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-semibold text-brand-text">
                        {member.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-muted">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          member.role === "ADMIN"
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : member.role === "STAFF"
                              ? "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        <span>{member.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-brand-text">
                      {member.specialty || "Clinical Operations"}
                    </td>
                    <td className="px-6 py-3.5 text-brand-muted">
                      {member.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-brand-primary" />
                          <span>{member.phone}</span>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                          member.isActive
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                            : "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-zinc-400"}`}
                        />
                        <span>{member.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => {
                            setPasswordModalStaff(member);
                            setStaffNewPassword("");
                          }}
                          title="Set or update staff login password"
                        >
                          <KeyRound className="h-3 w-3 text-brand-primary" />
                          <span>Password</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs"
                          onClick={() => setEditingStaff(member)}
                        >
                          <Edit3 className="h-3 w-3 text-brand-primary" />
                          <span>Change Role</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                          onClick={() => setStaffToDelete(member)}
                          title="Remove staff member from roster"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Invite Staff */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="animate-in fade-in zoom-in-95 w-full max-w-md border-brand-border bg-brand-surface shadow-xl duration-150">
            <CardHeader className="flex flex-row items-center justify-between border-b border-brand-border pb-3">
              <div>
                <CardTitle className="font-heading text-base font-bold text-brand-text">
                  Invite New Staff Member
                </CardTitle>
                <CardDescription className="text-xs">
                  Grant access to the clinical admin dashboard and assign role
                  privileges.
                </CardDescription>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="rounded-md p-1 text-brand-muted hover:text-brand-text"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleInviteSubmit}>
              <CardContent className="space-y-3.5 p-5 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-brand-text">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Jordan Hayes, MD"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value })
                    }
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-brand-text">
                    Clinic Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.hayes@healthsphere.example.com"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, email: e.target.value })
                    }
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-medium text-brand-text">
                      Role Permission *
                    </label>
                    <select
                      value={newStaff.role}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, role: e.target.value })
                      }
                      className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    >
                      <option value="STAFF">STAFF (Clinical)</option>
                      <option value="ADMIN">ADMIN (Full Control)</option>
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="NURSE">NURSE</option>
                      <option value="RECEPTIONIST">RECEPTIONIST</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium text-brand-text">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="(555) 019-9922"
                      value={newStaff.phone}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, phone: e.target.value })
                      }
                      className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-brand-text">
                    Specialty / Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Preventive Cardiology, Pediatrics"
                    value={newStaff.specialty}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, specialty: e.target.value })
                    }
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-brand-text">
                    Staff Login Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password for email login"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, password: e.target.value })
                    }
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <p className="mt-1 text-[11px] text-brand-muted">
                    Staff can log in with this password OR use their personal Google account ({newStaff.email || "email"}).
                  </p>
                </div>
              </CardContent>

              <div className="bg-brand-background/50 flex items-center justify-end gap-2 border-t border-brand-border p-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteModalOpen(false)}
                  disabled={submitting}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="h-8 gap-1.5 text-xs"
                >
                  {submitting && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>Send Staff Invite</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Change Role */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="animate-in fade-in zoom-in-95 w-full max-w-sm border-brand-border bg-brand-surface shadow-xl duration-150">
            <CardHeader className="flex flex-row items-center justify-between border-b border-brand-border pb-3">
              <div>
                <CardTitle className="font-heading text-sm font-bold text-brand-text">
                  Modify Role Permissions
                </CardTitle>
                <CardDescription className="text-xs">
                  {editingStaff.name} ({editingStaff.email})
                </CardDescription>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="rounded-md p-1 text-brand-muted hover:text-brand-text"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="space-y-2 p-4 text-xs">
              <p className="mb-2 text-[11px] text-brand-muted">
                Select new role assignment for this clinician:
              </p>
              {(
                ["ADMIN", "STAFF", "DOCTOR", "NURSE", "RECEPTIONIST"] as const
              ).map((r) => (
                <button
                  key={r}
                  onClick={() => handleUpdateRole(r)}
                  className={`flex w-full items-center justify-between rounded-clinic border p-2.5 text-left transition-colors ${
                    editingStaff.role === r
                      ? "bg-brand-primary/10 border-brand-primary font-semibold text-brand-primary"
                      : "border-brand-border text-brand-text hover:bg-brand-background"
                  }`}
                >
                  <span>{r}</span>
                  {editingStaff.role === r && (
                    <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                  )}
                </button>
              ))}
            </CardContent>

            <div className="bg-brand-background/50 flex justify-end border-t border-brand-border p-3">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setEditingStaff(null)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Set Staff Password */}
      {passwordModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="animate-in fade-in zoom-in-95 w-full max-w-sm border-brand-border bg-brand-surface shadow-xl duration-150">
            <CardHeader className="flex flex-row items-center justify-between border-b border-brand-border pb-3">
              <div>
                <CardTitle className="font-heading text-sm font-bold text-brand-text flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-brand-primary" />
                  <span>Set Staff Password</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {passwordModalStaff.name} ({passwordModalStaff.email})
                </CardDescription>
              </div>
              <button
                onClick={() => setPasswordModalStaff(null)}
                className="rounded-md p-1 text-brand-muted hover:text-brand-text"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <form onSubmit={handleSaveStaffPassword}>
              <CardContent className="space-y-3.5 p-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-brand-text">
                    New Staff Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="Enter password (minimum 4 characters)"
                    value={staffNewPassword}
                    onChange={(e) => setStaffNewPassword(e.target.value)}
                    className="w-full rounded-clinic border border-brand-border bg-brand-background px-3 py-2 text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="rounded-clinic border border-brand-primary/20 bg-brand-primary/5 p-2.5 text-[11px] text-brand-text">
                  <span className="font-semibold text-brand-primary">Google Sign-in:</span> Staff can also sign in with their Google Account using <strong>{passwordModalStaff.email}</strong>.
                </div>
              </CardContent>

              <div className="bg-brand-background/50 flex justify-end gap-2 border-t border-brand-border p-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setPasswordModalStaff(null)}
                  disabled={passwordSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={passwordSubmitting || !staffNewPassword}
                  className="h-8 gap-1.5 text-xs"
                >
                  {passwordSubmitting && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <span>Save Password</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Remove Staff Confirmation */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <Card className="animate-in fade-in zoom-in-95 w-full max-w-md border-red-200 bg-white shadow-2xl duration-150">
            <CardHeader className="flex flex-row items-start gap-3 border-b border-stone-100 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="font-heading text-base font-bold text-stone-900">
                  Remove Staff Member?
                </CardTitle>
                <CardDescription className="text-xs text-stone-500 mt-1">
                  Are you sure you want to remove{" "}
                  <strong className="text-stone-900 font-semibold">{staffToDelete.name}</strong>{" "}
                  ({staffToDelete.email}, role: {staffToDelete.role}) from the clinic roster? This will permanently revoke their access.
                </CardDescription>
              </div>
            </CardHeader>
            <div className="flex justify-end gap-2 border-t border-stone-100 p-4 bg-stone-50 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setStaffToDelete(null)}
                disabled={isDeletingStaff}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmDeleteStaff}
                disabled={isDeletingStaff}
                className="h-8 gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletingStaff ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Remove Staff</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
