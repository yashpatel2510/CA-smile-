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
  LayoutGrid,
  AlignLeft,
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClinicFaqSection } from "@/components/public/clinic-faq-section";
import { FaqItem, FaqSettings, DEFAULT_FAQS_STORE } from "@/types/faqs";

export default function AdminFaqsPage() {
  const [settings, setSettings] = useState<FaqSettings>(DEFAULT_FAQS_STORE.settings);
  const [items, setItems] = useState<FaqItem[]>(DEFAULT_FAQS_STORE.items);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"questions" | "settings" | "preview">("questions");

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General Care",
    isActive: true,
  });

  // Load FAQs from API
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.items)) setItems(data.items);
      }
    } catch (err: any) {
      setErrorMessage("Failed to load FAQs data");
    } finally {
      setLoading(false);
    }
  }

  function showNotification(msg: string) {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3500);
  }

  // Save Settings
  async function handleSaveSettings() {
    setSavingSettings(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-settings",
          settings,
        }),
      });

      if (res.ok) {
        showNotification("FAQ settings saved successfully!");
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setSavingSettings(false);
    }
  }

  // Open Add Modal
  function handleOpenAdd() {
    setEditingItem(null);
    setFormData({
      question: "",
      answer: "",
      category: "General Care",
      isActive: true,
    });
    setIsModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(item: FaqItem) {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || "General Care",
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  }

  // Submit Add or Edit
  async function handleSubmitItem(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Please fill in both the Question and the Answer.");
      return;
    }

    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-item",
            id: editingItem.id,
            updates: formData,
          }),
        });

        if (res.ok) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingItem.id ? { ...i, ...formData } : i))
          );
          setIsModalOpen(false);
          showNotification("Question updated successfully!");
        }
      } else {
        // Add
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add-item",
            ...formData,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [...prev, data.item]);
          setIsModalOpen(false);
          showNotification("New question added successfully!");
        }
      }
    } catch (err: any) {
      alert("Error saving item: " + err.message);
    }
  }

  // Delete Item
  async function handleDeleteItem(id: string, question: string) {
    if (!confirm(`Are you sure you want to delete this question?\n\n"${question}"`)) {
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
        setItems((prev) => prev.filter((i) => i.id !== id));
        showNotification("Question removed successfully.");
      }
    } catch (err: any) {
      alert("Failed to delete item: " + err.message);
    }
  }

  // Toggle Active/Inactive
  async function handleToggleActive(item: FaqItem) {
    const updatedStatus = !item.isActive;
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-item",
          id: item.id,
          updates: { isActive: updatedStatus },
        }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isActive: updatedStatus } : i))
        );
        showNotification(
          updatedStatus ? "Question published on site." : "Question hidden from site."
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Move Item Up
  async function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setItems(newItems);

    try {
      await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder-items",
          orderedIds: newItems.map((i) => i.id),
        }),
      });
      showNotification("Order updated.");
    } catch (err) {
      console.error("Failed to persist order:", err);
    }
  }

  // Reset to Defaults
  async function handleResetDefaults() {
    if (
      !confirm(
        "Are you sure you want to reset all FAQs and settings to the clinic standard defaults?"
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
        const data = await res.json();
        setSettings(data.settings);
        setItems(data.items);
        showNotification("Reset to clinic defaults successfully!");
      }
    } catch (err: any) {
      alert("Error resetting defaults: " + err.message);
    }
  }

  const filteredItems = items.filter(
    (i) =>
      i.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.category && i.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
              <HelpCircle className="h-3.5 w-3.5 text-brand-primary" />
              Public FAQ Section
            </Badge>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                settings.showFaqSection
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {settings.showFaqSection ? "● Live on Website" : "○ Hidden from Website"}
            </span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-brand-text md:text-3xl">
            FAQ Section Management
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Customize the public FAQ section rendered after the map on your website. Full control over
            questions, answers, dark/white theme modes, and layouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/#clinic-faq-section" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <ExternalLink className="h-4 w-4" />
              <span>View on Site</span>
            </Button>
          </Link>
          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="gap-1.5 rounded-xl bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Question</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-brand-border/60">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "questions"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Questions & Answers ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "settings"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Section Appearance & Dark/White Mode</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "preview"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-brand-muted hover:text-brand-text"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* TAB 1: QUESTIONS LIST */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Search bar and counter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
              <Input
                placeholder="Search questions, answers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <span>Showing {filteredItems.length} of {items.length} questions</span>
            </div>
          </div>

          {/* List of FAQ Cards */}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border p-12 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-brand-muted/50" />
              <h3 className="mt-4 text-base font-semibold text-brand-text">No questions found</h3>
              <p className="mt-1 text-sm text-brand-muted">
                {searchTerm ? "No questions match your search query." : "You have not added any questions yet."}
              </p>
              <Button onClick={handleOpenAdd} size="sm" className="mt-4 rounded-xl">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group rounded-2xl border transition-all duration-200 p-5 ${
                    item.isActive
                      ? "border-brand-border bg-brand-surface shadow-sm hover:border-brand-primary/50"
                      : "border-brand-border/40 bg-brand-surface/40 opacity-70"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-brand-muted">
                          #{item.order || index + 1}
                        </span>
                        {item.category && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            {item.category}
                          </Badge>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-zinc-500/10 text-zinc-600"
                          }`}
                        >
                          {item.isActive ? "Active on Site" : "Hidden"}
                        </span>
                      </div>

                      <h3 className="font-heading text-base font-semibold text-brand-text">
                        {item.question}
                      </h3>

                      <p className="text-sm text-brand-muted leading-relaxed">
                        {item.answer}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-start shrink-0 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "up")}
                        title="Move Up"
                        className="h-8 w-8 p-0 text-brand-muted hover:text-brand-text"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(index, "down")}
                        title="Move Down"
                        className="h-8 w-8 p-0 text-brand-muted hover:text-brand-text"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(item)}
                        className="h-8 text-xs font-medium rounded-lg"
                      >
                        {item.isActive ? "Hide" : "Show"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 p-0 text-brand-text hover:text-brand-primary rounded-lg"
                        title="Edit Question"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id, item.question)}
                        className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 rounded-lg"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPEARANCE & DARK/WHITE MODE SETTINGS */}
      {activeTab === "settings" && (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Mode Options (Dark Mode vs White/Light Mode) */}
            <Card className="rounded-2xl border-brand-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sun className="h-5 w-5 text-amber-500" />
                  Color Mode Options (Dark vs White Mode)
                </CardTitle>
                <CardDescription>
                  Choose how the FAQ section renders on your public website. You can force crisp White mode, sleek Dark mode, or have it follow your clinic theme.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* White / Light Mode Option */}
                  <div
                    onClick={() => setSettings((s) => ({ ...s, mode: "light" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      settings.mode === "light"
                        ? "border-brand-primary bg-brand-primary/5 shadow-md ring-2 ring-brand-primary/20"
                        : "border-brand-border bg-card hover:border-brand-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sun className="h-5 w-5 text-amber-500" />
                      {settings.mode === "light" && (
                        <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-semibold text-foreground text-sm">White / Light Mode</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Clean bright white background, optimal high readability, crisp borders.
                      </p>
                    </div>
                  </div>

                  {/* Dark Mode Option */}
                  <div
                    onClick={() => setSettings((s) => ({ ...s, mode: "dark" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      settings.mode === "dark"
                        ? "border-brand-primary bg-brand-primary/5 shadow-md ring-2 ring-brand-primary/20"
                        : "border-brand-border bg-card hover:border-brand-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon className="h-5 w-5 text-indigo-400" />
                      {settings.mode === "dark" && (
                        <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-semibold text-foreground text-sm">Dark Mode</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sleek midnight dark background, glowing neon highlights, premium contrast.
                      </p>
                    </div>
                  </div>

                  {/* Clinic Brand Theme Option */}
                  <div
                    onClick={() => setSettings((s) => ({ ...s, mode: "clinic" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      settings.mode === "clinic"
                        ? "border-brand-primary bg-brand-primary/5 shadow-md ring-2 ring-brand-primary/20"
                        : "border-brand-border bg-card hover:border-brand-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="h-5 w-5 text-brand-primary" />
                      {settings.mode === "clinic" && (
                        <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-semibold text-foreground text-sm">Adaptive Clinic Theme</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Inherits your primary theme palette and current clinic brand settings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Options */}
            <Card className="rounded-2xl border-brand-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LayoutGrid className="h-5 w-5 text-brand-primary" />
                  Accordion Layout Design
                </CardTitle>
                <CardDescription>
                  Switch between 2-column split layout or centered accordion layout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Grid Layout (2 Columns) */}
                  <div
                    onClick={() => setSettings((s) => ({ ...s, layout: "grid" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      settings.layout === "grid"
                        ? "border-brand-primary bg-brand-primary/5 shadow-md ring-2 ring-brand-primary/20"
                        : "border-brand-border bg-card hover:border-brand-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <LayoutGrid className="h-5 w-5 text-brand-primary" />
                      {settings.layout === "grid" && (
                        <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-semibold text-foreground text-sm">Two-Column Split (Demo Style)</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Title &amp; description on the left (2 cols), interactive accordion on the right (3 cols).
                      </p>
                    </div>
                  </div>

                  {/* Centered Layout */}
                  <div
                    onClick={() => setSettings((s) => ({ ...s, layout: "centered" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      settings.layout === "centered"
                        ? "border-brand-primary bg-brand-primary/5 shadow-md ring-2 ring-brand-primary/20"
                        : "border-brand-border bg-card hover:border-brand-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <AlignLeft className="h-5 w-5 text-brand-primary" />
                      {settings.layout === "centered" && (
                        <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-semibold text-foreground text-sm">Centered Layout (Standard Style)</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Centered title and subtitle at top, with a prominent boxed accordion container below.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content & Headings */}
            <Card className="rounded-2xl border-brand-border">
              <CardHeader>
                <CardTitle className="text-lg">Section Headings &amp; Support Link</CardTitle>
                <CardDescription>
                  Edit the text displayed in the header and support link of the FAQ section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-brand-text">Section Title</label>
                  <Input
                    value={settings.title}
                    onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))}
                    placeholder="e.g. Frequently Asked Questions or FAQs"
                    className="mt-1.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text">Section Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={settings.subtitle}
                    onChange={(e) => setSettings((s) => ({ ...s, subtitle: e.target.value }))}
                    placeholder="Brief intro for your patients..."
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface p-3 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-brand-text">Support Prefix Text</label>
                    <Input
                      value={settings.supportText}
                      onChange={(e) => setSettings((s) => ({ ...s, supportText: e.target.value }))}
                      placeholder="Can't find answers? Contact our"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-brand-text">Support Link Label</label>
                    <Input
                      value={settings.supportLinkText}
                      onChange={(e) => setSettings((s) => ({ ...s, supportLinkText: e.target.value }))}
                      placeholder="clinical support team"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-brand-text">Support Target Link</label>
                    <Input
                      value={settings.supportLinkHref}
                      onChange={(e) => setSettings((s) => ({ ...s, supportLinkHref: e.target.value }))}
                      placeholder="/contact or tel:+91..."
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar Actions */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-brand-border bg-brand-surface p-6 space-y-5">
              <h3 className="font-heading text-base font-semibold text-brand-text">Section Visibility</h3>

              <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
                <div>
                  <div className="text-sm font-semibold text-brand-text">Show FAQ Section</div>
                  <div className="text-xs text-brand-muted">Display on the public website after map</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showFaqSection}
                  onChange={(e) => setSettings((s) => ({ ...s, showFaqSection: e.target.checked }))}
                  className="h-5 w-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full gap-2 rounded-xl bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 shadow font-semibold"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingSettings ? "Saving Changes..." : "Save All Settings"}</span>
                </Button>

                <Button
                  onClick={handleResetDefaults}
                  variant="outline"
                  className="w-full gap-2 rounded-xl text-xs font-medium text-brand-muted hover:text-brand-text"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to Defaults</span>
                </Button>
              </div>
            </Card>

            <div className="rounded-2xl border border-brand-border/60 bg-brand-surface/40 p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Section Location Note
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                As configured, this FAQ accordion automatically renders <strong>immediately after the clinic map section</strong> and right above the footer on your public site. It is not placed in the navigation bar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-brand-primary" />
              <span className="font-semibold text-sm text-brand-text">Live Interactive Preview</span>
              <Badge variant="outline" className="text-xs font-mono">
                {settings.mode.toUpperCase()} MODE | {settings.layout.toUpperCase()} LAYOUT
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={settings.mode === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings((s) => ({ ...s, mode: "light" }))}
                className="gap-1.5 h-8 text-xs rounded-lg"
              >
                <Sun className="h-3.5 w-3.5" />
                White Mode
              </Button>
              <Button
                variant={settings.mode === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings((s) => ({ ...s, mode: "dark" }))}
                className="gap-1.5 h-8 text-xs rounded-lg"
              >
                <Moon className="h-3.5 w-3.5" />
                Dark Mode
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border overflow-hidden shadow-2xl">
            <ClinicFaqSection
              initialSettings={settings}
              initialItems={items}
              isPreview={true}
            />
          </div>
        </div>
      )}

      {/* ADD / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-brand-border bg-card p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {editingItem ? "Edit FAQ Question" : "Add New FAQ Question"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Questions will appear immediately in your website's FAQ accordion.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Question</label>
                <Input
                  required
                  placeholder="e.g. How long does teeth whitening last?"
                  value={formData.question}
                  onChange={(e) => setFormData((f) => ({ ...f, question: e.target.value }))}
                  className="mt-1.5 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Answer</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a detailed, patient-friendly medical or practical explanation..."
                  value={formData.answer}
                  onChange={(e) => setFormData((f) => ({ ...f, answer: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/40 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <Input
                    placeholder="e.g. Preventive Care, Orthodontics, Billing"
                    value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-medium text-foreground cursor-pointer">
                    Visible immediately on website
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90"
                >
                  {editingItem ? "Update Question" : "Add Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
