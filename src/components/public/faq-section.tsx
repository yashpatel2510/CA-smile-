"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaqItem, FaqsConfig } from "@/lib/faqs-store";

interface FaqSectionProps {
  initialConfig?: FaqsConfig;
  className?: string;
  hideOnFaqPage?: boolean;
  filterCategory?: string;
  showAll?: boolean;
  overrideThemeMode?: "light" | "dark";
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How long does a full project take?",
    answer:
      "A standard project or comprehensive clinical transformation typically takes between 1 to 4 weeks depending on the treatment scope. Minor aesthetic touch-ups or single-visit restorations can often be completed in a single afternoon session, while custom aligners or multi-stage implant procedures are scheduled across comfortable milestones.",
    category: "General",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "faq-2",
    question: "Do you offer ongoing support after launch?",
    answer:
      "Yes, absolutely. We provide post-treatment follow-up consultations, preventative maintenance schedules, and ongoing direct communication with our clinical coordinators to ensure lasting results, comfort, and peace of mind.",
    category: "General",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "faq-3",
    question: "Can we start with only branding or only website?",
    answer:
      "Yes, you can begin with a focused phase such as a comprehensive diagnostic consultation or initial aesthetic smile assessment. Once you're fully satisfied with the blueprint and visualization, you have complete freedom to proceed with subsequent treatments at your own pace.",
    category: "General",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "faq-4",
    question: "What do we need to provide before starting?",
    answer:
      "For clinical consultations, you simply need your identification and any prior medical or dental records if available. Everything else—including high-resolution 3D digital oral scans, computerized imaging, and diagnostic profiling—is handled on-site during your initial visit.",
    category: "General",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "faq-5",
    question: "Do you work with startups or only large companies?",
    answer:
      "We work with patients and clients of all backgrounds—from individual pediatric children and working professionals to entire corporate wellness programs. Our care plans and service packages are customized to fit your specific needs and timeline.",
    category: "General",
    isActive: true,
    isFeatured: true,
  },
  {
    id: "faq-6",
    question: "How is pricing calculated?",
    answer:
      "Pricing is 100% transparent with zero hidden fees. After an initial clinical evaluation and 3D digital diagnosis, we provide a detailed itemized estimate outlining every phase, material option, and available flexible installment or insurance coverage plan before any work begins.",
    category: "General",
    isActive: true,
    isFeatured: true,
  },
];

export function FaqSection({
  initialConfig,
  className = "",
  hideOnFaqPage = true,
  filterCategory,
  showAll = false,
  overrideThemeMode,
}: FaqSectionProps) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);

  // If on /contact, /book, /about, or /faq, hide this section
  if (
    pathname === "/contact" ||
    pathname === "/book" ||
    pathname === "/about" ||
    (hideOnFaqPage && pathname === "/faq")
  ) {
    return null;
  }

  const tag = initialConfig?.tag || "• FAQS";
  const heading1 = initialConfig?.headingLine1 || "QUESTIONS,";
  const heading2 = initialConfig?.headingLine2 || "ANSWERED";
  const subtitle =
    initialConfig?.subtitle ||
    "Here are the most common questions before starting a project with us.";

  // Theme Mode: "light" (default) or "dark" as set in Admin Panel
  const isDark = (overrideThemeMode || initialConfig?.themeMode) === "dark";

  const rawList = initialConfig?.faqs?.length ? initialConfig.faqs : DEFAULT_FAQS;

  const displayList = rawList.filter((item) => {
    if (item.isActive === false) return false;
    if (filterCategory && filterCategory !== "All") {
      return item.category?.toLowerCase() === filterCategory.toLowerCase();
    }
    if (!showAll && item.isFeatured === false) {
      return false;
    }
    return true;
  });

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq-section"
      className={`relative w-full py-20 sm:py-24 lg:py-32 transition-colors duration-300 ${
        isDark
          ? "bg-[#0c0c0e] text-white border-t border-neutral-800/60"
          : "bg-white text-neutral-900"
      } ${className}`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: EXACT BADGE, TITLE, SUBTITLE MATCHING SCREENSHOT */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4 sm:space-y-6">
            {/* Tag / Badge */}
            <div
              className={`inline-flex items-center text-xs sm:text-sm font-medium tracking-wider uppercase select-none ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              <span>{tag}</span>
            </div>

            {/* Giant 2-Line Bold Heading */}
            <h2
              className={`font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[72px] xl:text-[80px] font-extrabold tracking-tight uppercase leading-[0.95] ${
                isDark ? "text-white" : "text-neutral-950"
              }`}
            >
              <span className="block">{heading1}</span>
              <span className="block">{heading2}</span>
            </h2>

            {/* Subtitle Description */}
            <p
              className={`max-w-sm text-sm sm:text-base leading-relaxed ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {subtitle}
            </p>
          </div>

          {/* RIGHT COLUMN: ACCORDION PILL CARDS WITH PLUS ICON */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5 sm:space-y-4">
            {displayList.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`group rounded-2xl sm:rounded-[22px] transition-colors duration-200 overflow-hidden ${
                    isDark
                      ? "bg-[#18181b] hover:bg-[#202024] border border-white/5"
                      : "bg-[#f4f4f6] hover:bg-[#ededf0]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between text-left px-6 py-5 sm:px-8 sm:py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 select-none cursor-pointer"
                  >
                    <span
                      className={`font-sans text-base sm:text-[17px] font-medium pr-6 leading-snug ${
                        isDark ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {faq.question}
                    </span>

                    {/* Smooth Rotating Plus/Minus Icon */}
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 ${
                        isDark ? "text-neutral-200" : "text-neutral-800"
                      }`}
                    >
                      <motion.svg
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </motion.svg>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        <div
                          className={`px-6 pb-6 pt-1 sm:px-8 sm:pb-7 text-sm sm:text-[15px] leading-relaxed ${
                            isDark ? "text-neutral-300" : "text-neutral-600"
                          }`}
                        >
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
