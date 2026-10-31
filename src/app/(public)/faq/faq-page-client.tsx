"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageSquare, Calendar, Sparkles, Phone } from "lucide-react";
import { FaqsConfig, FaqItem } from "@/lib/faqs-store";

interface FaqPageClientProps {
  initialConfig: FaqsConfig;
}

export function FaqPageClient({ initialConfig }: FaqPageClientProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isDark = initialConfig?.themeMode === "dark";

  const tag = initialConfig?.tag || "• FAQS";
  const heading1 = initialConfig?.headingLine1 || "QUESTIONS,";
  const heading2 = initialConfig?.headingLine2 || "ANSWERED";
  const subtitle =
    initialConfig?.subtitle ||
    "Here are the most common questions before starting a project with us.";

  const allFaqs = useMemo(
    () => (initialConfig?.faqs || []).filter((f) => f.isActive !== false),
    [initialConfig]
  );

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allFaqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ["All", ...Array.from(set)];
  }, [allFaqs]);

  // Filtered FAQs based on query and category
  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allFaqs, selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#0c0c0e] text-white" : "bg-white text-neutral-900"
      }`}
    >
      {/* MAIN FAQ VIEWPORT - EXACT SCREENSHOT DESIGN */}
      <section className="relative w-full py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* LEFT COLUMN: BADGE, TWO-LINE GIANT HEADING, SUBTITLE */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-5 sm:space-y-6">
              {/* Tag / Badge */}
              <div
                className={`inline-flex items-center text-xs sm:text-sm font-medium tracking-wider uppercase select-none ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                <span>{tag}</span>
              </div>

              {/* Giant 2-Line Bold Heading */}
              <h1
                className={`font-heading text-3xl sm:text-5xl md:text-7xl lg:text-[72px] xl:text-[80px] font-extrabold tracking-tight uppercase leading-tight sm:leading-[0.95] ${
                  isDark ? "text-white" : "text-neutral-950"
                }`}
              >
                <span className="block">{heading1}</span>
                <span className="block">{heading2}</span>
              </h1>

              {/* Subtitle Description */}
              <p
                className={`max-w-sm text-sm sm:text-base leading-relaxed ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {subtitle}
              </p>

              {/* Interactive Search Bar */}
              <div className="pt-2 max-w-sm">
                <div className="relative flex items-center">
                  <Search
                    className={`absolute left-3.5 h-4 w-4 ${
                      isDark ? "text-neutral-500" : "text-neutral-400"
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any question..."
                    className={`w-full rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 border transition-all ${
                      isDark
                        ? "bg-[#18181b] text-white placeholder:text-neutral-500 border-neutral-800 focus:ring-neutral-600 focus:bg-[#202024]"
                        : "bg-[#f4f4f6] text-neutral-900 placeholder:text-neutral-400 border-transparent focus:ring-neutral-400 focus:bg-white"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 text-xs text-neutral-400 hover:text-neutral-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills (if more than 1) */}
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2 pt-1 max-w-sm">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat
                          ? isDark
                            ? "bg-white text-neutral-950 shadow-sm"
                            : "bg-neutral-900 text-white shadow-sm"
                          : isDark
                          ? "bg-[#18181b] text-neutral-400 hover:bg-[#27272a] hover:text-white"
                          : "bg-[#f4f4f6] text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Help Card */}
              <div className="hidden sm:block pt-4">
                <div
                  className={`rounded-2xl p-5 space-y-3 border ${
                    isDark
                      ? "border-neutral-800 bg-[#141417]/80"
                      : "border-neutral-200/80 bg-neutral-50/70"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                      isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                    <span>Still have questions?</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Our team is here to assist. Connect via WhatsApp or schedule an initial consultation directly.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Link
                      href="/book"
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                        isDark
                          ? "bg-white text-neutral-950 hover:bg-neutral-200"
                          : "bg-neutral-900 text-white hover:bg-neutral-800"
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Consultation</span>
                    </Link>
                    <a
                      href="https://wa.me/917226098074"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors border ${
                        isDark
                          ? "border-neutral-800 bg-[#18181b] text-neutral-300 hover:bg-[#222226]"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                      <span>WhatsApp: +91 72260 98074</span>
                    </a>
                    <a
                      href="tel:+917226098074"
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors border ${
                        isDark
                          ? "border-neutral-800 bg-[#18181b] text-neutral-300 hover:bg-[#222226]"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5 text-sky-500" />
                      <span>Call: +91 72260 98074</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACCORDION PILL CARDS WITH PLUS ICON */}
            <div className="lg:col-span-7 flex flex-col space-y-3.5 sm:space-y-4">
              {filteredFaqs.length === 0 ? (
                <div
                  className={`rounded-2xl p-8 text-center ${
                    isDark ? "bg-[#18181b] text-neutral-400" : "bg-[#f4f4f6] text-neutral-500"
                  }`}
                >
                  <p className="text-sm font-medium">
                    No questions found matching &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className={`mt-3 text-xs font-semibold underline hover:no-underline ${
                      isDark ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    View all questions
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
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

                        {/* Plus Icon that rotates 45deg on open */}
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
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
