"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AdminSidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

const STORAGE_KEY = "ca_smile_admin_sidebar_collapsed";

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // LocalStorage not available or restricted
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const setCollapsed = useCallback((val: boolean) => {
    setIsCollapsed(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {}
  }, []);

  // Keyboard shortcut: Cmd+B (Mac) or Ctrl+B (Windows/Linux) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <AdminSidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
  }
  return context;
}
