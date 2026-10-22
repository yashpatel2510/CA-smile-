"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface NavbarProps {
  clinicName?: string;
  emergencyPhone?: string;
  navItems?: NavItem[];
}

export const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

function ToothIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 2C4.5 2 2.5 4.2 2.5 7.2c0 2.4 1.1 4.8 2.1 7.2.9 2.3 1.9 5.6 3.4 5.6 1.4 0 1.8-3 4-3s2.6 3 4 3c1.5 0 2.5-3.3 3.4-5.6 1-2.4 2.1-4.8 2.1-7.2 0-3-2-5.2-5-5.2-1.9 0-3.3 1-4.5 2.2C10.8 3 9.4 2 7.5 2z" />
    </svg>
  );
}

export function Navbar({
  clinicName = "PedioDent",
  navItems = defaultNavItems,
}: NavbarProps) {
  const pathname = usePathname();
  const { brandConfig } = useClinicTheme();
  const shouldReduceMotion = useReducedMotion();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!mobileMenuOpen) return;
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    },
    [mobileMenuOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const mobileMenuVariants: Variants = {
    closed: {
      opacity: 0,
      y: -8,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.2,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: "easeOut",
      },
    },
  };

  const displayName =
    brandConfig?.logo?.clinicDisplayName ||
    brandConfig?.clinicName ||
    clinicName ||
    "PedioDent";

  const mobileDisplayName =
    brandConfig?.logo?.mobileClinicDisplayName ||
    "CA SMILE";

  const headerBgColor = brandConfig?.headerBgColor || "#f4f4f5";
  const headerTextColor = brandConfig?.headerTextColor || "#18181b";
  const headerContactBtnBgColor =
    brandConfig?.headerContactBtnBgColor || "#000000";
  const headerContactBtnTextColor =
    brandConfig?.headerContactBtnTextColor || "#ffffff";
  const customLogoUrl = brandConfig?.logo?.imageUrl;

  const isDarkBelt = pathname === "/contact" || pathname === "/book";

  return (
    <header
      className={`sticky top-0 z-50 relative w-full px-3 py-2.5 sm:px-6 sm:py-3.5 transition-all ${
        isDarkBelt ? "bg-[#0c0d0f]" : ""
      }`}
    >
      {/* Floating Pill Container (Matching Sample Design) */}
      <div
        className={`mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between rounded-2xl px-3.5 sm:px-6 shadow-xs backdrop-blur-md transition-all duration-300 ${
          isDarkBelt
            ? "border border-white/10"
            : "border border-zinc-200/90 dark:border-zinc-800"
        }`}
        style={{
          backgroundColor: headerBgColor,
        }}
      >
        {/* Left: Tooth / Custom Logo Badge + Brand Title */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
          aria-label={`${displayName} homepage`}
        >
          {customLogoUrl ? (
            <div className="flex h-9 sm:h-10 w-auto max-w-[140px] items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customLogoUrl}
                alt={displayName}
                className="h-8 sm:h-9 w-auto max-w-[130px] object-contain"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black text-white shadow-xs transition-transform duration-200 group-hover:scale-105 dark:bg-white dark:text-black">
              <ToothIcon className="h-5 w-5" />
            </div>
          )}

          {/* Mobile Brand Name: ONLY SHOW "CA SMILE" */}
          <span
            className="font-heading text-base sm:text-lg font-bold tracking-tight transition-colors group-hover:opacity-85 md:hidden"
            style={{ color: headerTextColor }}
          >
            {mobileDisplayName}
          </span>

          {/* Desktop / Tablet Brand Name */}
          <span
            className="font-heading text-lg font-bold tracking-tight transition-colors group-hover:opacity-85 hidden md:inline sm:text-xl"
            style={{ color: headerTextColor }}
          >
            {displayName}
          </span>
        </Link>

        {/* Center: 4 Desktop Nav Links (Home, Services, About Us, Blog) */}
        <nav
          className="hidden items-center gap-6 md:flex lg:gap-8"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-opacity hover:opacity-75 ${
                  isActive ? "font-bold underline decoration-2 underline-offset-4" : "font-medium opacity-90"
                }`}
                style={{ color: headerTextColor }}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Desktop Contact Button + Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop Contact Button with Arrow Badge */}
          <Link
            href="/contact"
            className="group hidden md:inline-flex items-center justify-between gap-2.5 rounded-xl pl-4 pr-1.5 py-1.5 text-xs sm:text-sm font-semibold shadow-xs transition-all duration-200 hover:opacity-95 hover:shadow-md select-none"
            style={{
              backgroundColor: headerContactBtnBgColor,
              color: headerContactBtnTextColor,
            }}
            aria-label="Contact clinic"
          >
            <span className="font-heading tracking-wide">Contact</span>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white shadow-xs transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <ArrowRight
                className="h-3.5 w-3.5 stroke-[2.2]"
                style={{ color: headerContactBtnBgColor }}
              />
            </span>
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{ color: headerTextColor }}
            className="inline-flex items-center justify-center rounded-xl p-2 opacity-90 hover:opacity-100 hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 md:hidden"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Floats ON TOP of hero image without shifting page layout) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Soft backdrop to tap outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs md:hidden"
              aria-hidden="true"
            />

            <motion.div
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="absolute left-3 right-3 top-full mt-2 max-w-6xl mx-auto overflow-hidden rounded-2xl border border-zinc-200/90 p-4 shadow-2xl backdrop-blur-xl md:hidden dark:border-zinc-800 z-50"
              style={{
                backgroundColor: headerBgColor,
              }}
            >
              <nav
                aria-label="Mobile navigation links"
                className="flex flex-col space-y-1.5"
              >
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ color: headerTextColor }}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-black/10 font-bold"
                          : "opacity-85 hover:bg-black/5 hover:opacity-100"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className="h-4 w-4 opacity-60"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex w-full items-center justify-between rounded-xl pl-5 pr-2 py-2.5 text-sm font-semibold shadow-xs transition-opacity hover:opacity-95 select-none"
                  style={{
                    backgroundColor: headerContactBtnBgColor,
                    color: headerContactBtnTextColor,
                  }}
                >
                  <span className="font-heading tracking-wide">Contact</span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <ArrowRight
                      className="h-4 w-4 stroke-[2.2]"
                      style={{ color: headerContactBtnBgColor }}
                    />
                  </span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 pt-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Staff Portal</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
