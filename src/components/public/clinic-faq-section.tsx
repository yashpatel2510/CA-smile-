"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqItem, FaqSettings, DEFAULT_FAQS_STORE } from "@/types/faqs";
import { HelpCircle, Sparkles, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClinicFaqSectionProps {
  initialSettings?: FaqSettings;
  initialItems?: FaqItem[];
  isPreview?: boolean;
}

export function ClinicFaqSection({
  initialSettings,
  initialItems,
  isPreview = false,
}: ClinicFaqSectionProps) {
  const [settings, setSettings] = useState<FaqSettings>(
    initialSettings || DEFAULT_FAQS_STORE.settings
  );
  const [items, setItems] = useState<FaqItem[]>(
    initialItems || DEFAULT_FAQS_STORE.items
  );
  const [loaded, setLoaded] = useState(!!initialSettings);

  useEffect(() => {
    if (initialSettings && initialItems) {
      setSettings(initialSettings);
      setItems(initialItems);
      setLoaded(true);
      return;
    }

    let isMounted = true;
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faqs");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.settings) setSettings(data.settings);
            if (Array.isArray(data.items)) setItems(data.items);
            setLoaded(true);
          }
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      }
    }

    loadFaqs();
    return () => {
      isMounted = false;
    };
  }, [initialSettings, initialItems]);

  // If section is disabled in admin settings and not in preview mode, don't render
  if (!isPreview && settings.showFaqSection === false) {
    return null;
  }

  // Filter only active items if not preview
  const displayItems = isPreview
    ? items
    : items.filter((item) => item.isActive);

  if (displayItems.length === 0 && !isPreview) {
    return null;
  }

  const isDarkMode = settings.mode === "dark";
  const isLightMode = settings.mode === "light";
  const isCentered = settings.layout === "centered";

  // Dynamic Theme Styling Classes based on admin choice
  const sectionBgClass = isDarkMode
    ? "bg-[#0b101b] text-slate-100"
    : isLightMode
    ? "bg-slate-50/80 text-zinc-900 border-t border-b border-slate-200/80"
    : "bg-brand-surface/40 text-brand-text border-t border-brand-border/60";

  const titleClass = isDarkMode
    ? "text-white"
    : isLightMode
    ? "text-zinc-900"
    : "text-brand-text";

  const subtitleClass = isDarkMode
    ? "text-slate-400"
    : isLightMode
    ? "text-slate-600"
    : "text-brand-muted";

  const accordionContainerClass = isDarkMode
    ? "bg-[#111827]/90 border border-slate-800 shadow-2xl ring-1 ring-white/10 rounded-2xl px-6 py-2 md:px-8 md:py-4"
    : isLightMode
    ? "bg-white border border-slate-200/90 shadow-md ring-1 ring-slate-900/5 rounded-2xl px-6 py-2 md:px-8 md:py-4"
    : "bg-brand-surface border border-brand-border/80 shadow-md ring-1 ring-brand-border/40 rounded-2xl px-6 py-2 md:px-8 md:py-4";

  const itemBorderClass = isDarkMode
    ? "border-b border-slate-800/80"
    : isLightMode
    ? "border-b border-slate-200/80"
    : "border-b border-brand-border/60";

  const triggerClass = isDarkMode
    ? "text-slate-100 hover:text-white"
    : isLightMode
    ? "text-zinc-900 hover:text-brand-primary"
    : "text-brand-text hover:text-brand-primary";

  const answerClass = isDarkMode
    ? "text-slate-300 leading-relaxed text-sm md:text-base font-normal"
    : isLightMode
    ? "text-slate-700 leading-relaxed text-sm md:text-base font-normal"
    : "text-brand-muted leading-relaxed text-sm md:text-base font-normal";

  const badgeClass = isDarkMode
    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30"
    : isLightMode
    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
    : "bg-brand-primary/10 text-brand-primary border border-brand-primary/20";

  return (
    <section
      id="clinic-faq-section"
      className={cn(
        "relative overflow-hidden py-16 md:py-24 transition-colors duration-300",
        sectionBgClass
      )}
    >
      {/* Decorative ambient background accents */}
      {isDarkMode && (
        <>
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        </>
      )}

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        {/* LAYOUT OPTION 1: CENTERED LAYOUT */}
        {isCentered ? (
          <div>
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <span className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", badgeClass)}>
                  <MessageCircleQuestion className="h-3.5 w-3.5" />
                  Clinic Answers & Guidance
                </span>
              </div>
              <h2 className={cn("text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl", titleClass)}>
                {settings.title || "Frequently Asked Questions"}
              </h2>
              <p className={cn("mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto", subtitleClass)}>
                {settings.subtitle ||
                  "Discover quick and comprehensive answers about our gentle treatments, pain-free dental procedures, and appointment scheduling."}
              </p>
            </div>

            <div className="mt-12">
              <Accordion
                type="single"
                collapsible
                className={accordionContainerClass}
              >
                {displayItems.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className={cn(
                      itemBorderClass,
                      index === displayItems.length - 1 && "border-b-0"
                    )}
                  >
                    <AccordionTrigger className={cn("cursor-pointer py-4 text-base md:text-lg font-medium hover:no-underline text-left", triggerClass)}>
                      <div className="flex items-center gap-3 pr-2">
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className={cn("pt-1 pb-4", answerClass)}>
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {settings.supportText && (
                <div className="mt-8 text-center">
                  <p className={cn("text-sm sm:text-base", subtitleClass)}>
                    {settings.supportText}{" "}
                    <Link
                      href={settings.supportLinkHref || "/contact"}
                      className="text-brand-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{settings.supportLinkText || "clinical support team"}</span>
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* LAYOUT OPTION 2: 2-COLUMN GRID (Demo Layout) */
          <div className="grid gap-8 md:grid-cols-5 md:gap-12 items-start">
            <div className="md:col-span-2 md:sticky md:top-24 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-1">
                <span className={cn("px-3 py-1 rounded-full flex items-center gap-1.5", badgeClass)}>
                  <MessageCircleQuestion className="h-3.5 w-3.5" />
                  FAQ & Patient Help
                </span>
              </div>
              <h2 className={cn("text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight", titleClass)}>
                {settings.title || "FAQs"}
              </h2>
              <p className={cn("text-base sm:text-lg leading-relaxed", subtitleClass)}>
                {settings.subtitle || "Your questions answered by our dental specialists."}
              </p>

              {settings.supportText && (
                <p className={cn("pt-2 hidden md:block text-sm sm:text-base leading-relaxed", subtitleClass)}>
                  {settings.supportText}{" "}
                  <Link
                    href={settings.supportLinkHref || "/contact"}
                    className="text-brand-primary font-semibold hover:underline"
                  >
                    {settings.supportLinkText || "clinical support team"}
                  </Link>
                </p>
              )}
            </div>

            <div className="md:col-span-3">
              <Accordion
                type="single"
                collapsible
                className={accordionContainerClass}
              >
                {displayItems.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className={cn(
                      itemBorderClass,
                      index === displayItems.length - 1 && "border-b-0"
                    )}
                  >
                    <AccordionTrigger className={cn("cursor-pointer py-4 text-base md:text-lg font-medium hover:no-underline text-left", triggerClass)}>
                      <div className="flex items-center gap-3 pr-2">
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className={cn("pt-1 pb-4", answerClass)}>
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {settings.supportText && (
                <p className={cn("mt-6 text-sm text-center md:hidden", subtitleClass)}>
                  {settings.supportText}{" "}
                  <Link
                    href={settings.supportLinkHref || "/contact"}
                    className="text-brand-primary font-semibold hover:underline"
                  >
                    {settings.supportLinkText || "clinical support team"}
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
