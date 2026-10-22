"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Calendar, ShieldCheck, Phone, Stethoscope } from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";

export function PublicHeader() {
  const pathname = usePathname();
  const { currentTheme } = useClinicTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-surface/90 backdrop-blur-md">
      {/* Top emergency announcement bar */}
      <div className="bg-brand-primary text-brand-primary-foreground px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>24/7 Urgent Care Available • Call our emergency triage: <strong>(800) 555-CLINIC</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="opacity-90">Active Theme: <strong>{currentTheme.name}</strong></span>
            <Link
              href="/admin/settings"
              className="underline text-xs hover:opacity-80 transition-opacity"
            >
              (Customize Theme)
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-clinic bg-brand-primary text-brand-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-brand-text font-heading block">
                HealthSphere
              </span>
              <span className="text-xs text-brand-muted block -mt-1">
                {currentTheme.name} Medical Center
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-brand-primary ${
                    isActive ? "text-brand-primary font-semibold" : "text-brand-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand-muted hover:text-brand-text">
              <ShieldCheck className="h-4 w-4" />
              Staff Portal
            </Button>
          </Link>
          <BookNowButton href="/book" text="Book Now" size="sm" />
        </div>
      </div>
    </header>
  );
}
