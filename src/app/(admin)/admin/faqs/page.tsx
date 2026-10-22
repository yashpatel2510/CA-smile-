"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Sun,
  Moon,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  ArrowRight,
  Sliders,
  Search,
  ExternalLink,
  Layers,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FaqSection } from "@/components/public/faq-section";
import { FaqItem, FaqsConfig } from "@/lib/faqs-store";

export default function AdminFaqsPage() {
  const [config, setConfig] = useState<FaqsConfig>({
    tag: "• FAQS",
    headingLine1: "QUESTIONS,",
    headingLine2: "ANSWERED",
    subtitle: "Here are the most common questions before starting a project with us.",
    themeMode: "light",
    faqs: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Tabs: questions | settings | preview
  const [activeTab, setActiveTab] = useState<"questions" | "settings" | "preview">("questions");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formIsActive, setFormIsActive] = useState(true);

  // Form State for Section Appearance & Dark Mode
  const [editTag, setEditTag] = useState("• FAQS");
  const [editHeading1, setEditHeading1] = useState("QUESTIONS,");
  const [editHeading2, setEditHeading2] = useState("ANSWERED");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editThemeMode, setEditThemeMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          const cfg = {
            tag: data.config.tag || "• FAQS",
            headingLine1: data.config.headingLine1 || "QUESTIONS,",
            headingLine2: data.config.headingLine2 || "ANSWERED",
            subtitle: data.config.subtitle || "",
            themeMode: data.config.themeMode === "dark" ? ("dark" as const) : ("light" as const),
            faqs: Array.isArray(data.faqs) ? data.faqs : [],
          };
          setConfig(cfg);
          setEditTag(cfg.tag);
          setEditHeading1(cfg.headingLine1);
          setEditHeading2(cfg.headingLine2);
          setEditSubtitle(cfg.subtitle);
          setEditThemeMode(cfg.themeMode);
        }
      }
    } catch (err) {
      notify("Failed to load FAQs", "error");
    } finally {
      setLoading(false);
    }
  }

  function notify(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  // Save Settings & Theme Mode
  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          settings: {
            tag: editTag,
            headingLine1: editHeading1,
            headingLine2: editHeading2,
            subtitle: editSubtitle,
            themeMode: editThemeMode,
          },
        }),
      });

      if (res.ok) {
        setConfig((prev) => ({
          ...prev,
          tag: editTag,
          headingLine1: editHeading1,
          headingLine2: editHeading2,
          subtitle: editSubtitle,
          themeMode: editThemeMode,
        }));
        notify(`Settings saved! Theme is now set to ${editThemeMode.toUpperCase()} mode.`);
      } else {
        notify("Failed to save settings", "error");
      }
    } catch (err: any) {
      notify(err?.message || "Error saving settings", "error");
    } finally {
      setSaving(false);
    }
  }

  // Toggle Theme Mode quickly
  async function handleToggleTheme(mode: "light" | "dark") {
    setEditThemeMode(mode);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          settings: {
            tag: editTag,
            headingLine1: editHeading1,
            headingLine2: editHeading2,
            subtitle: editSubtitle,
            themeMode: mode,
          },
        }),
      });

      if (res.ok) {
        setConfig((prev) => ({ ...prev, themeMode: mode }));
        notify(`Theme changed to ${mode.toUpperCase()} mode!`);
      }
    } catch (err: any) {
      notify("Failed to toggle theme", "error");
    } finally {
      setSaving(false);
    }
  }

  // Open Modal to Add
  function handleOpenAdd() {
    setEditingItem(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("General");
    setFormIsActive(true);
    setIsModalOpen(true);
  }

  // Open Modal to Edit
  function handleOpenEdit(item: FaqItem) {
    setEditingItem(item);
    setFormQuestion(item.question);
    setFormAnswer(item.answer);
    setFormCategory(item.category || "General");
    setFormIsActive(item.isActive !== false);
    setIsModalOpen(true);
  }

  // Save Modal (Add or Edit)
  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      notify("Question and Answer cannot be empty", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-item",
            id: editingItem.id,
            updates: {
              question: formQuestion,
              answer: formAnswer,
              category: formCategory,
              isActive: formIsActive,
            },
          }),
        });
        if (res.ok) {
          notify("Question updated successfully!");
          setIsModalOpen(false);
          await loadData();
        } else {
          notify("Failed to update question", "error");
        }
      } else {
        // Add
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add-item",
            question: formQuestion,
            answer: formAnswer,
            category: formCategory,
            isActive: formIsActive,
          }),
        });
        if (res.ok) {
          notify("New question added successfully!");
          setIsModalOpen(false);
          await loadData();
        } else {
          notify("Failed to add question", "error");
        }
      }
    } catch (err: any) {
      notify(err?.message || "Operation failed", "error");
    } finally {
      setSaving(false);
    }
  }

  // Delete Question
  async function handleDelete(id: string, questionText: string) {
    if (!confirm(`Are you sure you want to remove this question?\n\n"${questionText}"`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-item",
          id,
        }),
      });

      if (res.ok) {
        notify("Question deleted!");
        await loadData();
      } else {
        notify("Failed to delete question", "error");
      }
    } catch (err) {
      notify("Error deleting question", "error");
    }
  }

  // Move Up / Down
  async function handleMove(index: number, direction: "up" | "down") {
    const list = [...config.faqs];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const orderedIds = list.map((f) => f.id);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder-items",
          orderedIds,
        }),
      });

      if (res.ok) {
        setConfig((prev) => ({ ...prev, faqs: list }));
      }
    } catch (err) {
      notify("Failed to reorder items", "error");
    }
  }

  // Reset defaults
  async function handleResetDefaults() {
    if (
      !confirm(
        "Are you sure you want to reset all FAQs to default questions? Any custom questions will be restored to template."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-defaults" }),
      });

      if (res.ok) {
        notify("FAQs restored to default template!");
        await loadData();
      }
    } catch (err) {
      notify("Failed to reset defaults", "error");
    }
  }

  const filteredFaqs = config.faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Top Banner / Notification */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium transition-all ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1.5 text-xs">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Full Admin Access</span>
            </Badge>
            <span className="text-xs text-brand-muted font-mono">
              {config.faqs.length} Total Questions
            </span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            Q&amp;A / FAQ Section Management
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Add, edit, or remove all questions. Configure section titles, subtitles, and switch between Light Mode &amp; Dark Mode.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/faq"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-semibold text-brand-text hover:bg-brand-surface/80 transition-colors shadow-sm"
          >
            <Eye className="h-3.5 w-3.5 text-brand-muted" />
            <span>View Public /faq</span>
            <ExternalLink className="h-3 w-3 text-brand-muted ml-0.5" />
          </Link>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="gap-1.5 rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Question</span>
          </Button>
        </div>
      </div>

      {/* QUICK DARK MODE BAR & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "questions"
                ? "bg-brand-primary text-brand-primary-foreground shadow-sm"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>All Questions ({config.faqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-brand-primary text-brand-primary-foreground shadow-sm"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Appearance &amp; Dark Mode</span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-brand-primary text-brand-primary-foreground shadow-sm"
                : "text-brand-muted hover:text-brand-text hover:bg-brand-surface"
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Live Component Preview</span>
          </button>
        </div>

        {/* ONE-CLICK DARK / LIGHT MODE SWITCH */}
        <div className="flex items-center gap-2 bg-brand-surface border border-brand-border p-1.5 rounded-2xl shrink-0">
          <span className="text-[11px] font-medium text-brand-muted px-2 select-none">
            Display Mode:
          </span>
          <button
            type="button"
            onClick={() => handleToggleTheme("light")}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              config.themeMode === "light"
                ? "bg-white text-neutral-900 shadow-sm border border-neutral-200"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light</span>
            {config.themeMode === "light" && <Check className="h-3 w-3 ml-0.5 text-emerald-600" />}
          </button>

          <button
            type="button"
            onClick={() => handleToggleTheme("dark")}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              config.themeMode === "dark"
                ? "bg-neutral-900 text-white shadow-sm border border-neutral-700"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Moon className="h-3.5 w-3.5 text-blue-400" />
            <span>Dark</span>
            {config.themeMode === "dark" && <Check className="h-3 w-3 ml-0.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* TAB 1: ALL QUESTIONS LIST & CRUD */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Search bar & quick filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
              <Input
                placeholder="Search questions, answers, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-xs bg-brand-surface border-brand-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted hover:text-brand-text"
                >
                  Clear
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="gap-1.5 rounded-xl text-xs text-brand-muted hover:text-brand-text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Template</span>
            </Button>
          </div>

          {/* Questions Table / List */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-sm text-brand-muted">Loading questions...</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <HelpCircle className="h-10 w-10 text-brand-muted/40 mx-auto" />
                <p className="text-sm font-medium text-brand-text">No questions found</p>
                <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs">
                  Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-brand-border/60">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-brand-surface/40 transition-colors"
                  >
                    {/* Left: Reorder & Number */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="flex flex-col gap-0.5 shrink-0 pt-0.5 sm:pt-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, "up")}
                          className="p-1 rounded text-brand-muted hover:text-brand-text hover:bg-brand-background disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredFaqs.length - 1}
                          onClick={() => handleMove(index, "down")}
                          className="p-1 rounded text-brand-muted hover:text-brand-text hover:bg-brand-background disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-brand-muted">
                            #{index + 1}
                          </span>
                          <span className="font-heading text-sm font-semibold text-brand-text line-clamp-1">
                            {faq.question}
                          </span>
                          {faq.category && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0">
                              {faq.category}
                            </Badge>
                          )}
                          {faq.isActive === false && (
                            <Badge variant="outline" className="text-[10px] text-red-500 border-red-200">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(faq)}
                        className="gap-1 rounded-xl text-xs h-8 px-2.5"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-brand-muted" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(faq.id, faq.question)}
                        className="rounded-xl text-xs h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200"
                        title="Delete Question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPEARANCE & DARK MODE SETTINGS */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="rounded-2xl border-brand-border bg-brand-surface shadow-sm">
            <CardHeader className="p-6 border-b border-brand-border">
              <CardTitle className="text-base font-bold text-brand-text flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-primary" />
                <span>Q&amp;A Section Header &amp; Theme Mode Configuration</span>
              </CardTitle>
              <CardDescription className="text-xs text-brand-muted">
                Control the left-side branding text and switch between Light and Dark mode for the Q&amp;A cards.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* THEME MODE TOGGLE OPTION */}
              <div className="rounded-2xl border border-brand-border bg-brand-background/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                      {editThemeMode === "dark" ? (
                        <Moon className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Sun className="h-4 w-4 text-amber-500" />
                      )}
                      <span>Q&amp;A Theme Mode (Dark / Light Mode)</span>
                    </h3>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Choose whether the public Q&amp;A section renders in clean white or sleek dark mode.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-brand-surface border border-brand-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEditThemeMode("light")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        editThemeMode === "light"
                          ? "bg-white text-neutral-900 shadow-sm border border-neutral-200"
                          : "text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditThemeMode("dark")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        editThemeMode === "dark"
                          ? "bg-neutral-900 text-white shadow-sm border border-neutral-700"
                          : "text-brand-muted hover:text-brand-text"
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5 text-blue-400" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tag / Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Tag / Pill Label (Shown at top-left)
                </label>
                <Input
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  placeholder="• FAQS"
                  className="rounded-xl text-xs bg-brand-background border-brand-border"
                />
                <p className="text-[11px] text-brand-muted">
                  Default: <span className="font-mono">• FAQS</span>
                </p>
              </div>

              {/* Two-Line Giant Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Headline Line 1
                  </label>
                  <Input
                    value={editHeading1}
                    onChange={(e) => setEditHeading1(e.target.value)}
                    placeholder="QUESTIONS,"
                    className="rounded-xl text-xs bg-brand-background border-brand-border font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">
                    Headline Line 2
                  </label>
                  <Input
                    value={editHeading2}
                    onChange={(e) => setEditHeading2(e.target.value)}
                    placeholder="ANSWERED"
                    className="rounded-xl text-xs bg-brand-background border-brand-border font-bold uppercase"
                  />
                </div>
              </div>

              {/* Subtitle Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Subtitle Description
                </label>
                <textarea
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  rows={3}
                  placeholder="Here are the most common questions before starting a project with us."
                  className="w-full rounded-xl p-3 text-xs bg-brand-background border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-1.5 rounded-xl text-xs font-semibold shadow-sm px-6"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? "Saving Changes..." : "Save Section Settings"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* TAB 3: LIVE PREVIEW OF FAQ SECTION */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-brand-text">
                Live Interactive Component Preview
              </h2>
              <p className="text-xs text-brand-muted">
                Showing how the section appears with current theme mode (
                <span className="font-semibold text-brand-primary uppercase">
                  {config.themeMode}
                </span>
                ). You can click questions to test the smooth expand/collapse.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleTheme(config.themeMode === "dark" ? "light" : "dark")}
                className="gap-1.5 rounded-xl text-xs"
              >
                {config.themeMode === "dark" ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-blue-400" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border overflow-hidden shadow-lg">
            <FaqSection
              initialConfig={config}
              hideOnFaqPage={false}
              showAll={true}
              overrideThemeMode={config.themeMode}
            />
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT QUESTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="font-heading text-base font-bold text-brand-text flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-brand-primary" />
                <span>{editingItem ? "Edit Question" : "Add New Question"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-brand-muted hover:text-brand-text p-1 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g., How long does a full treatment take?"
                  className="rounded-xl text-xs bg-brand-background border-brand-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Answer Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide a clear, detailed, and helpful answer for patients or clients..."
                  className="w-full rounded-xl p-3 text-xs bg-brand-background border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">Category</label>
                  <Input
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="General, Treatments, Appointments, Pricing"
                    className="rounded-xl text-xs bg-brand-background border-brand-border"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-medium text-brand-text select-none cursor-pointer">
                    Visible on website (Active)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl text-xs font-semibold px-5"
                >
                  {saving ? "Saving..." : editingItem ? "Update Question" : "Add Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
