"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Columns, Sparkles } from "lucide-react";
import { HeroSectionConfig } from "@/types/branding";
import { useContactModal } from "@/components/public/contact-modal";

export interface BlankHeroTwoProps {
  hero: HeroSectionConfig;
  previewMode?: "desktop" | "tablet" | "mobile";
}

export function BlankHeroTwo({ hero, previewMode }: BlankHeroTwoProps) {
  const { openContactModal } = useContactModal();

  const isMobile = previewMode === "mobile";
  const minHeight = hero.blankHeroMinHeight || "540px";
  const bgColor = hero.blankHeroBgColor || hero.backgroundColor || "#f8fafc";
  const textColor = hero.blankHeroTextColor || "#0f172a";
  const title = hero.blankHeroTitle || "";
  const subtitle = hero.blankHeroSubtitle || "";
  const ctaText = hero.blankHeroCtaText || "";
  const ctaUrl = hero.blankHeroCtaUrl || "/contact";

  const hasContent = Boolean(title.trim() || subtitle.trim() || ctaText.trim());

  return (
    <section
      className={`relative w-full flex items-center justify-center overflow-hidden transition-colors ${
        isMobile ? "px-4 py-12" : "px-6 py-16 sm:py-20 lg:py-28"
      }`}
      style={{
        backgroundColor: bgColor,
        minHeight: isMobile ? "400px" : minHeight,
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl w-full">
        {hasContent ? (
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left Column: Text & Actions */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3.5 py-1 text-xs font-semibold text-brand-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured Care</span>
              </div>

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
                  className="text-base sm:text-lg opacity-80 max-w-xl"
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
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
                      className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
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

            {/* Right Column: Blank Graphic Canvas */}
            <div className="flex h-72 sm:h-96 items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white/70 p-6 backdrop-blur-xs">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 mb-3">
                  <Columns className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-700">Right Visual Canvas</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Ready for custom media or banner</p>
              </div>
            </div>
          </div>
        ) : (
          /* Blank Split Canvas Placeholder */
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
            {/* Left Blank Box */}
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white/70 p-8 sm:p-12 text-center backdrop-blur-xs min-h-[260px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 mb-3">
                <Columns className="h-6 w-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 mb-2">
                <Sparkles className="h-3 w-3 text-zinc-500" />
                <span>Blank Hero Section 2 (Split)</span>
              </div>
              <h2 className="text-base font-semibold text-zinc-800">
                Left Canvas Area
              </h2>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                Clean blank left panel ready for introductory copy, headlines, or brand messaging.
              </p>
            </div>

            {/* Right Blank Box */}
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white/70 p-8 sm:p-12 text-center backdrop-blur-xs min-h-[260px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-base font-semibold text-zinc-800">
                Right Canvas Area
              </h2>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                Clean blank right panel ready for graphics, interactive media, or showcase widgets.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
