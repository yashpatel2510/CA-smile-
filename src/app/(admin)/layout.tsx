import React from "react";
import { AdminSessionProvider } from "@/components/admin/admin-session-provider";
import { AdminSidebarProvider } from "@/components/admin/admin-sidebar-context";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <AdminSidebarProvider>
        <AdminShell>{children}</AdminShell>
      </AdminSidebarProvider>
    </AdminSessionProvider>
  );
}
