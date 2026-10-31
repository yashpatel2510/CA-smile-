"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Calendar, ShieldCheck, Phone, Stethoscope } from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { Button } from "@/components/ui/button";
import { BookNowButton } from "@/components/ui/book-now-button";

export function PublicHeader() {
  const pathname = usePathname();
  const { currentTheme, brandConfig } = useClinicTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
  ];

  const phone = brandConfig?.phone || "+91 72260 98074";
  const clinicName = brandConfig?.logo?.clinicDisplayName || brandConfig?.clinicName || "CA Smile Dental Clinic";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-surface/90 backdrop-blur-md">
      {/* Top emergency announcement bar */}
      <div className="bg-brand-primary text-brand-primary-foreground px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Painless Dental Care • Call Clinic: <strong>{phone}</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="opacity-90">CA Smile Dental Care • Bilimora</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" prefetch={true} className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-clinic bg-brand-primary text-brand-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-brand-text font-heading block">
                {clinicName}
              </span>
              <span className="text-xs text-brand-muted block -mt-1">
                Multispeciality Dental Clinic
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
                  prefetch={true}
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
          <Link href="/admin" prefetch={true} className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand-muted hover:text-brand-text">
              <ShieldCheck className="h-4 w-4" />
              Staff Portal
            </Button>
          </Link>
          <BookNowButton href="/contact" text="Book Now" size="sm" />
        </div>
      </div>
    </header>
  );
}
