import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  ArrowLeft,
  Home,
  Calendar,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background p-4 text-brand-text">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-brand-border bg-brand-surface p-8 text-center shadow-xl">
        {/* Brand Icon */}
        <div className="bg-brand-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-brand-primary">
          <Stethoscope className="h-8 w-8" />
        </div>

        {/* 404 Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-brand-primary">
            Error 404 • Page Not Found
          </span>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            Looking for Clinical Care?
          </h1>
          <p className="text-xs leading-relaxed text-brand-muted sm:text-sm">
            The page, medical resource, or appointment record you are searching
            for does not exist or may have been relocated.
          </p>
        </div>

        {/* Helpful Navigation CTAs */}
        <div className="space-y-2 pt-2">
          <Link href="/" className="block w-full">
            <Button
              variant="primary"
              size="sm"
              className="h-9 w-full gap-2 text-xs"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Return to Clinic Home</span>
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/contact" className="block w-full">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-1.5 text-xs"
              >
                <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                <span>Book a Visit</span>
              </Button>
            </Link>
            <Link href="/contact" className="block w-full">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-1.5 text-xs"
              >
                <Phone className="h-3.5 w-3.5 text-brand-primary" />
                <span>Contact Desk</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact info footer */}
        <div className="border-t border-brand-border pt-4 text-[11px] text-brand-muted">
          Need immediate assistance? Call our reception at{" "}
          <a
            href="tel:5552345678"
            className="font-semibold text-brand-primary hover:underline"
          >
            (555) 234-5678
          </a>
        </div>
      </div>
    </div>
  );
}
