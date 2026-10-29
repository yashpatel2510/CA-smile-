"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Layout } from "lucide-react";
import { HeroSectionConfig } from "@/types/branding";
import { useContactModal } from "@/components/public/contact-modal";

export interface BlankHeroProps {
  hero: HeroSectionConfig;
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function BlankHeroOne({ hero, previewMode }: BlankHeroProps) {
  const { openContactModal } = useContactModal();

  const isMobile = previewMode === "mobile";
  const minHeight = hero.blankHeroMinHeight || "520px";
  const bgColor = hero.blankHeroBgColor || hero.backgroundColor || "#fcfcfc";
  const textColor = hero.blankHeroTextColor || "#18181b";
  const title = hero.blankHeroTitle || "";
  const subtitle = hero.blankHeroSubtitle || "";
  const ctaText = hero.blankHeroCtaText || "";
  const ctaUrl = hero.blankHeroCtaUrl || "/contact";

  const hasContent = Boolean(title.trim() || subtitle.trim() || ctaText.trim());

  return (
    <section
      className={`relative w-full flex items-center justify-center overflow-hidden transition-colors ${
        isMobile ? "px-4 py-12" : "px-6 py-16 sm:py-24"
      }`}
      style={{
        backgroundColor: bgColor,
        minHeight: isMobile ? "400px" : minHeight,
      }}
    >
      {/* Subtle modern background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
          color: textColor,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl w-full text-center flex flex-col items-center justify-center">
        {hasContent ? (
          <div className="space-y-6">
            {title && (
              <h1
                className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
                style={{ color: textColor }}
              >
                {title}
              </h1>
            )}

            {subtitle && (
              <p
                className="mx-auto max-w-2xl text-base sm:text-lg opacity-80"
                style={{ color: textColor }}
              >
                {subtitle}
              </p>
            )}

            {ctaText && (
              <div className="pt-2">
                {ctaUrl === "/contact" ? (
                  <button
                    type="button"
                    onClick={() => openContactModal()}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: hero.ctaButtonBgColor || "#050505",
                      color: hero.ctaButtonTextColor || "#ffffff",
                    }}
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={ctaUrl}
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: hero.ctaButtonBgColor || "#050505",
                      color: hero.ctaButtonTextColor || "#ffffff",
                    }}
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Blank Canvas Placeholder */
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200/80 bg-white/60 p-8 sm:p-12 text-center backdrop-blur-xs max-w-lg w-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 mb-4">
              <Layout className="h-6 w-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 mb-2">
              <Sparkles className="h-3 w-3 text-zinc-500" />
              <span>Blank Hero Section 1</span>
            </div>
            <h2 className="text-base font-semibold text-zinc-800">
              Clean Blank Canvas
            </h2>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs">
              This is a clean, blank hero section template. You can customize the background or add your custom layout here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
