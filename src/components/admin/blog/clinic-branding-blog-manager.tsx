"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Upload,
  Calendar,
  Clock,
  User,
  Tag,
  Save,
  RotateCcw,
  Sliders,
  FolderPlus,
  FolderEdit,
  FolderMinus,
  Star,
  ChevronDown,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/data/blog-posts";
import { BlogSectionConfig } from "@/lib/blog-store";

const PRESET_IMAGES = [
  { label: "Pediatric Care", url: "/images/treatments/children-dentistry.jpg" },
  { label: "Orthodontics & Aligners", url: "/images/treatments/orthodontics.jpg" },
  { label: "Preventive Care & Fillings", url: "/images/treatments/tooth-fillings.jpg" },
  { label: "Teeth Whitening", url: "/images/treatments/teeth-whitening.jpg" },
  { label: "Dental Implants", url: "/images/treatments/dental-implants.jpg" },
  { label: "Periodontal Examination", url: "/images/treatments/periodontal-examination.jpg" },
  { label: "Porcelain Veneers", url: "/images/treatments/porcelain-veneers.jpg" },
  { label: "Root Canal Therapy", url: "/images/treatments/root-canal.jpg" },
  { label: "Wisdom Tooth Surgery", url: "/images/treatments/wisdom-tooth.jpg" },
  { label: "Digital Smile Design", url: "/images/treatments/digital-smile-design.jpg" },
  { label: "Computed Tomography (3D CT)", url: "/images/treatments/computed-tomography.jpg" },
];

export function ClinicBrandingBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [config, setConfig] = useState<BlogSectionConfig>({
    sectionTitle: "Latest Dental Health Articles",
    sectionSubtitle:
      "Doctor-authored guides on kids dentistry, invisible aligners, pain-free implants, and everyday oral hygiene.",
    badgeText: "EVIDENCE-BASED DENTAL INSIGHTS",
    enabled: true,
    maxFeaturedCount: 3,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New / Edit Article Modal State
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingPostSlug, setEditingPostSlug] = useState<string | null>(null);

  // Article Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPublishedAt, setFormPublishedAt] = useState("");
  const [formReadTime, setFormReadTime] = useState("5 min read");
  const [formImage, setFormImage] = useState("/images/treatments/children-dentistry.jpg");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formAuthorName, setFormAuthorName] = useState("Dr. Deep, MDS");
  const [formAuthorRole, setFormAuthorRole] = useState("Lead Dental Surgeon & Orthodontist");
  const [formAuthorCredentials, setFormAuthorCredentials] = useState("MDS • CA Smile Dental Clinic Bilimora");
  const [formTags, setFormTags] = useState("");
  const [formContent, setFormContent] = useState("");

  // Category Management Modal / Quick inline state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCatOldName, setEditingCatOldName] = useState<string | null>(null);
  const [editingCatNewName, setEditingCatNewName] = useState("");

  // Delete Confirm State
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<string | null>(null);

  // Preset image picker state
  const [showImagePicker, setShowImagePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch initial blog data
  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
        setCategories(data.categories || []);
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.error("Failed to load blog data:", err);
      showToast("Failed to load blog data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, []);

  // 2. Filter posts by search and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategoryFilter === "ALL" ||
        post.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        (post.author?.name || "").toLowerCase().includes(q) ||
        (post.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategoryFilter, searchQuery]);

  // Count posts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      const cat = p.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // Open Create Article Modal
  const handleOpenCreateModal = () => {
    setEditingPostSlug(null);
    setFormTitle("");
    setFormSlug("");
    setFormSummary("");
    setFormCategory(categories[0] || "General Dentistry");
    setFormPublishedAt(
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
    setFormReadTime("5 min read");
    setFormImage(PRESET_IMAGES[0]?.url || "/images/treatments/children-dentistry.jpg");
    setFormFeatured(false);
    setFormAuthorName("Dr. Deep, MDS");
    setFormAuthorRole("Lead Dental Surgeon & Orthodontist");
    setFormAuthorCredentials("MDS • CA Smile Dental Clinic Bilimora");
    setFormTags("Dental Health, Preventive Care");
    setFormContent(
      "A healthy, radiant smile begins with consistent oral hygiene and routine clinical assessments.\n\nOur dental specialists leverage gentle, modern techniques to ensure your clinical visits are completely comfortable and stress-free."
    );
    setArticleModalOpen(true);
  };

  // Open Edit Article Modal
  const handleOpenEditModal = (post: BlogPost) => {
    setEditingPostSlug(post.slug);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormSummary(post.summary);
    setFormCategory(post.category);
    setFormPublishedAt(post.publishedAt);
    setFormReadTime(post.readTime);
    setFormImage(post.image);
    setFormFeatured(Boolean(post.featured));
    setFormAuthorName(post.author?.name || "Dr. Deep, MDS");
    setFormAuthorRole(post.author?.role || "Dental Specialist");
    setFormAuthorCredentials(post.author?.credentials || "CA Smile Dental Clinic");
    setFormTags((post.tags || []).join(", "));
    setFormContent(
      Array.isArray(post.content) ? post.content.join("\n\n") : String(post.content || "")
    );
    setArticleModalOpen(true);
  };

  // Auto-generate slug from title if not manually customized
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPostSlug) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(autoSlug);
    }
  };

  // Handle Image File Upload (converts to base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormImage(reader.result);
        showToast("Image selected successfully");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Article (Create or Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Please enter an article title", "error");
      return;
    }

    try {
      setSaving(true);
      const parsedTags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const parsedContent = formContent
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        action: editingPostSlug ? "update-post" : "create-post",
        slug: editingPostSlug || undefined,
        post: {
          title: formTitle.trim(),
          slug: formSlug.trim() || undefined,
          summary: formSummary.trim(),
          category: formCategory.trim() || "General Dentistry",
          publishedAt: formPublishedAt.trim(),
          readTime: formReadTime.trim(),
          image: formImage.trim(),
          featured: formFeatured,
          author: {
            name: formAuthorName.trim(),
            role: formAuthorRole.trim(),
            credentials: formAuthorCredentials.trim(),
          },
          tags: parsedTags.length > 0 ? parsedTags : [formCategory, "Dental Health"],
          content: parsedContent.length > 0 ? parsedContent : [formSummary],
        },
      };

      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save article");
      }

      setPosts(data.data?.posts || []);
      setCategories(data.data?.categories || []);
      setArticleModalOpen(false);
      showToast(editingPostSlug ? "Article updated successfully!" : "Article published successfully!");
    } catch (err: any) {
      console.error("Save article error:", err);
      showToast(err.message || "Failed to save article", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (slug: string) => {
    try {
      setSaving(true);
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-post", slug }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete article");
      }

      setPosts(data.data?.posts || []);
      setDeleteConfirmSlug(null);
      showToast("Article deleted successfully");
    } catch (err: any) {
      showToast(err.message || "Failed to delete article", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Featured status directly
  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const updatedFeatured = !post.featured;
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-post",
          slug: post.slug,
          post: { ...post, featured: updatedFeatured },
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.posts) {
        setPosts(data.data.posts);
        showToast(
          updatedFeatured
            ? `"${post.title}" featured on Homepage`
            : `"${post.title}" unfeatured from Homepage`
        );
      }
    } catch {
      showToast("Failed to update featured status", "error");
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsAddingCategory(true);
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-category",
          name: newCategoryName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add category");
      }

      setCategories(data.categories || []);
      setNewCategoryName("");
      showToast(`Category "${newCategoryName}" added successfully!`);
    } catch (err: any) {
      showToast(err.message || "Failed to add category", "error");
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Edit Category
  const handleUpdateCategory = async (oldName: string) => {
    if (!editingCatNewName.trim() || editingCatNewName.trim() === oldName) {
      setEditingCatOldName(null);
      return;
    }

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-category",
          oldName,
          newName: editingCatNewName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to rename category");
      }

      setCategories(data.categories || []);
      if (data.data?.posts) setPosts(data.data.posts);
      setEditingCatOldName(null);
      showToast(`Category renamed to "${editingCatNewName}"`);
    } catch (err: any) {
      showToast(err.message || "Failed to rename category", "error");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (categoryName: string) => {
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-category",
          name: categoryName,
          fallbackCategory: "General Dentistry",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete category");
      }

      setCategories(data.categories || []);
      if (data.data?.posts) setPosts(data.data.posts);
      setDeleteConfirmCategory(null);
      if (selectedCategoryFilter === categoryName) setSelectedCategoryFilter("ALL");
      showToast(`Category "${categoryName}" removed`);
    } catch (err: any) {
      showToast(err.message || "Failed to delete category", "error");
    }
  };

  // Save Blog Section Settings (Homepage Title, Subtitle, Visibility)
  const handleSaveSectionConfig = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-config",
          config,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update blog settings");
      }

      setConfig(data.config || config);
      showToast("Homepage blog section settings saved successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save blog settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Quick 1-click Toggle Blog Section Visibility (Hide or Unhide) with immediate save
  const handleToggleBlogVisibility = async (newEnabled: boolean) => {
    try {
      setSaving(true);
      const updatedConfig = { ...config, enabled: newEnabled };
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-config",
          config: updatedConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update blog visibility");
      }
      setConfig(data.config || updatedConfig);
      showToast(
        newEnabled
          ? "Blog section is now VISIBLE (Unhidden) on website homepage!"
          : "Blog section is now HIDDEN from website homepage!"
      );
    } catch (err: any) {
      showToast(err.message || "Failed to toggle blog visibility", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle hiding blog link from Header Navigation
  const handleToggleBlogNavigation = async (hideNav: boolean) => {
    try {
      setSaving(true);
      const updatedConfig = { ...config, hideFromNavigation: hideNav };
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-config",
          config: updatedConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update blog navigation");
      }
      setConfig(data.config || updatedConfig);
      showToast(
        hideNav
          ? "'Blog' menu link hidden from website header navbar!"
          : "'Blog' menu link is now visible in website header navbar!"
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update blog navigation", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="text-sm font-medium text-brand-muted">
          Loading articles, categories &amp; section settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl border animate-in slide-in-from-bottom-2 ${
            toastMessage.type === "success"
              ? "bg-zinc-900 text-white border-zinc-700"
              : "bg-red-900 text-white border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: STATS & ACTIONS                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-brand-text">
              Blog &amp; Article Management
            </h2>
            <Badge variant="outline" className="text-xs bg-brand-primary/10 text-brand-primary border-brand-primary/20">
              Live Content
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Create, edit, and organize clinic dental guides, articles, categories, and homepage showcase settings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/blog" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl text-xs font-semibold border-brand-border text-brand-text hover:bg-brand-surface"
            >
              <span>View Public Blog</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            className="gap-1.5 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Article</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK VISIBILITY CONTROL: HIDE / UNHIDE BLOG SECTION                      */}
      {/* ========================================================================= */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
          config.enabled !== false
            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
            : "border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs ${
                config.enabled !== false
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {config.enabled !== false ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-brand-text">
                  Website Blog Section Visibility
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    config.enabled !== false
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                  }`}
                >
                  {config.enabled !== false
                    ? "● Visible (Live on Homepage)"
                    : "○ Hidden from Homepage"}
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                {config.enabled !== false
                  ? "The blog section is currently live and displayed on your clinic homepage. Click 'Hide Blog Section' to remove it from public view."
                  : "The blog section is currently hidden. Patients browsing your website homepage will NOT see any blog articles."}
              </p>
            </div>
          </div>

          {/* Quick Toggle Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <div className="inline-flex rounded-xl border border-brand-border bg-brand-surface p-1 shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleBlogVisibility(true)}
                disabled={saving}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  config.enabled !== false
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Show (Unhide)</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleBlogVisibility(false)}
                disabled={saving}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  config.enabled === false
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide Blog Section</span>
              </button>
            </div>
          </div>
        </div>

        {/* Extra option: also hide from header navbar menu */}
        <div className="mt-3 pt-3 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <label
            className="flex items-center gap-2 cursor-pointer text-brand-text font-medium select-none"
            htmlFor="hideBlogNavCheckbox"
          >
            <input
              id="hideBlogNavCheckbox"
              type="checkbox"
              checked={Boolean(config.hideFromNavigation)}
              onChange={(e) => handleToggleBlogNavigation(e.target.checked)}
              disabled={saving}
              className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer"
            />
            <span>Also remove &ldquo;Blog&rdquo; link from Website Header Navbar</span>
          </label>
          <span className="text-[11px] text-brand-muted">
            Applies instantly to public website
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HOMEPAGE BLOG SECTION DISPLAY SETTINGS                        */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface/40 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-brand-primary" />
              <CardTitle className="text-sm sm:text-base font-bold">
                Homepage Blog Section Configuration
              </CardTitle>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
              <span>Section Visible on Homepage:</span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
            </label>
          </div>
          <CardDescription className="text-xs text-brand-muted">
            Customize the heading, description, badge, and maximum featured articles shown on the clinic homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text">
                Section Heading / Title
              </label>
              <Input
                value={config.sectionTitle}
                onChange={(e) => setConfig({ ...config, sectionTitle: e.target.value })}
                placeholder="Latest Dental Health Articles"
                className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text">
                Upper Badge Text (Optional)
              </label>
              <Input
                value={config.badgeText}
                onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
                placeholder="EVIDENCE-BASED DENTAL INSIGHTS"
                className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-brand-text">
                Section Subtitle / Description
              </label>
              <Input
                value={config.sectionSubtitle}
                onChange={(e) => setConfig({ ...config, sectionSubtitle: e.target.value })}
                placeholder="Doctor-authored guides on kids dentistry, invisible aligners..."
                className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-text">
                Max Featured Articles on Homepage
              </label>
              <select
                value={config.maxFeaturedCount}
                onChange={(e) =>
                  setConfig({ ...config, maxFeaturedCount: Number(e.target.value) })
                }
                className="w-full h-9 rounded-md border border-brand-border bg-white dark:bg-zinc-900 px-3 text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value={3}>3 Articles (Standard 3-Column)</option>
                <option value={4}>4 Articles</option>
                <option value={6}>6 Articles (2 Rows)</option>
              </select>
            </div>

            <div className="flex items-end justify-end">
              <Button
                onClick={handleSaveSectionConfig}
                disabled={saving}
                size="sm"
                className="gap-1.5 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>Save Section Settings</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 2: CATEGORY MANAGEMENT (ADD, EDIT, REMOVE)                       */}
      {/* ========================================================================= */}
      <Card className="border border-brand-border bg-brand-surface/40 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FolderEdit className="h-4 w-4 text-brand-primary" />
            <CardTitle className="text-sm sm:text-base font-bold">
              Blog Categories Management
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-brand-muted">
            Add new categories, rename existing categories (automatically updates articles), or remove unused categories.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name (e.g. Gum Health, Orthodontics)..."
              className="text-xs bg-white dark:bg-zinc-900 border-brand-border h-9"
            />
            <Button
              type="submit"
              disabled={isAddingCategory || !newCategoryName.trim()}
              size="sm"
              className="gap-1.5 shrink-0 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </Button>
          </form>

          {/* List of categories with edit/delete actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isEditing = editingCatOldName === cat;

              if (isEditing) {
                return (
                  <div
                    key={cat}
                    className="flex items-center gap-1.5 rounded-xl border border-brand-primary bg-brand-surface p-1.5 shadow-sm"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editingCatNewName}
                      onChange={(e) => setEditingCatNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateCategory(cat);
                        if (e.key === "Escape") setEditingCatOldName(null);
                      }}
                      className="h-7 w-36 rounded-lg border border-brand-border px-2 text-xs text-brand-text bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(cat)}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      title="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCatOldName(null)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-600"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={cat}
                  className="group flex items-center gap-2 rounded-xl border border-brand-border bg-white dark:bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-brand-text shadow-2xs hover:border-brand-primary transition-all"
                >
                  <span className="font-medium">{cat}</span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">
                    {count} {count === 1 ? "post" : "posts"}
                  </Badge>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatOldName(cat);
                        setEditingCatNewName(cat);
                      }}
                      className="p-0.5 text-zinc-400 hover:text-brand-text rounded transition-colors"
                      title="Edit Category Name"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmCategory(cat)}
                      className="p-0.5 text-zinc-400 hover:text-red-500 rounded transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Category Confirmation Dialog */}
      {deleteConfirmCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Delete Category &quot;{deleteConfirmCategory}&quot;?
                </h3>
                <p className="text-xs text-zinc-500">
                  Any existing articles assigned to this category will be safely reassigned to &quot;General Dentistry&quot;.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmCategory(null)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteCategory(deleteConfirmCategory)}
                className="text-xs rounded-xl"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ARTICLES LIST WITH FILTERING, SEARCH, EDIT & DELETE            */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategoryFilter === "ALL"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-brand-surface text-brand-muted hover:text-brand-text"
              }`}
            >
              All Articles ({posts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategoryFilter === cat
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-brand-surface text-brand-muted hover:text-brand-text"
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, tag, or author..."
              className="pl-8 text-xs bg-white dark:bg-zinc-900 border-brand-border h-9 rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-brand-muted hover:text-brand-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid / Cards */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border p-12 text-center space-y-3">
            <BookOpen className="h-8 w-8 text-brand-muted mx-auto" />
            <p className="text-sm font-semibold text-brand-text">
              No articles found matching your criteria.
            </p>
            <p className="text-xs text-brand-muted">
              Try adjusting your category filter or search query, or click &quot;Add New Article&quot;.
            </p>
            <Button
              onClick={handleOpenCreateModal}
              size="sm"
              className="gap-1.5 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Article</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.slug}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white dark:bg-[#121316] shadow-2xs hover:shadow-md hover:border-black dark:hover:border-white transition-all"
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <span className="rounded-full bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {post.category}
                    </span>

                    {/* Featured on Homepage Badge / Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(post)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md transition-all ${
                        post.featured
                          ? "bg-amber-400 text-black shadow-xs"
                          : "bg-black/60 text-white/70 hover:text-white"
                      }`}
                      title={post.featured ? "Featured on Homepage (Click to unfeature)" : "Click to feature on Homepage"}
                    >
                      <Star className={`h-3 w-3 ${post.featured ? "fill-black" : ""}`} />
                      <span>{post.featured ? "Featured" : "Standard"}</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-heading text-sm font-bold text-brand-text line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                    <span>{post.publishedAt}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-brand-border/40">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-muted hover:text-brand-text"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(post)}
                        className="h-7 px-2.5 rounded-lg text-xs font-semibold border-brand-border text-brand-text hover:bg-brand-surface"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmSlug(post.slug)}
                        className="h-7 px-2 rounded-lg text-xs text-red-500 border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Delete Article"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Article Confirmation Dialog */}
      {deleteConfirmSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Delete this Article?
                </h3>
                <p className="text-xs text-zinc-500">
                  This action is permanent and will remove the blog post from both the blog index and homepage.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmSlug(null)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteArticle(deleteConfirmSlug)}
                className="text-xs rounded-xl"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ARTICLE DRAWER & EDITOR                                */}
      {/* ========================================================================= */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8 rounded-2xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-border px-6 py-4 bg-brand-surface/30">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-primary" />
                <h3 className="font-heading text-base sm:text-lg font-bold text-brand-text">
                  {editingPostSlug ? "Edit Article" : "Create New Dental Article"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setArticleModalOpen(false)}
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Title & Slug */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Modern Invisible Aligners: What Patients Should Know"
                    className="text-sm bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-brand-muted flex items-center justify-between">
                    <span>URL Slug (Unique path /blog/[slug])</span>
                    <span className="font-mono text-[10px]">Preview: /blog/{formSlug || "your-slug"}</span>
                  </label>
                  <Input
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="modern-invisible-aligners-guide"
                    className="text-xs font-mono bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>
              </div>

              {/* Category & Read Time & Published Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-brand-border bg-white dark:bg-zinc-900 px-3 text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">
                    Read Time
                  </label>
                  <Input
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="5 min read"
                    className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">
                    Published Date
                  </label>
                  <Input
                    value={formPublishedAt}
                    onChange={(e) => setFormPublishedAt(e.target.value)}
                    placeholder="October 28, 2026"
                    className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface/40 p-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-brand-text">
                    Feature on Clinic Homepage
                  </span>
                  <p className="text-[11px] text-brand-muted">
                    When enabled, this article will appear in the top featured cards on the main website.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
              </div>

              {/* Cover Image Selector & Uploader */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-text flex items-center justify-between">
                  <span>Cover Image</span>
                  <span className="text-[11px] text-brand-muted">
                    Upload custom photo or choose clinical preset
                  </span>
                </label>

                <div className="flex items-start gap-4">
                  {/* Current image preview */}
                  <div className="relative aspect-[16/10] w-36 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formImage}
                      alt="Article preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Input
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/images/treatments/children-dentistry.jpg or https://..."
                      className="text-xs bg-white dark:bg-zinc-900 border-brand-border font-mono"
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 gap-1.5 rounded-lg text-xs font-semibold border-brand-border text-brand-text hover:bg-brand-surface"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Photo</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImagePicker(!showImagePicker)}
                        className="h-8 gap-1.5 rounded-lg text-xs font-semibold border-brand-border text-brand-text hover:bg-brand-surface"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>{showImagePicker ? "Hide Presets" : "Choose from 11 Presets"}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preset Image Picker Grid */}
                {showImagePicker && (
                  <div className="mt-2 rounded-xl border border-brand-border bg-brand-surface/60 p-3 space-y-2">
                    <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider block">
                      Select Dental Treatment Preset Photo:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            setFormImage(preset.url);
                            setShowImagePicker(false);
                          }}
                          className={`group relative aspect-[16/10] overflow-hidden rounded-lg border text-left transition-all ${
                            formImage === preset.url
                              ? "border-brand-primary ring-2 ring-brand-primary/40"
                              : "border-brand-border hover:border-brand-primary"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold text-white truncate">
                            {preset.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary / Excerpt */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text">
                  Short Summary / Excerpt <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="A concise 2-sentence summary of the article for blog cards and Google search snippets..."
                  className="w-full rounded-md border border-brand-border bg-white dark:bg-zinc-900 p-2.5 text-xs text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                />
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">Author Name</label>
                  <Input
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    placeholder="Dr. Deep, MDS"
                    className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">Author Role</label>
                  <Input
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    placeholder="Chief Dental Surgeon"
                    className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text">Credentials / Clinic</label>
                  <Input
                    value={formAuthorCredentials}
                    onChange={(e) => setFormAuthorCredentials(e.target.value)}
                    placeholder="CA Smile Dental Clinic • Bilimora"
                    className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text flex items-center justify-between">
                  <span>Tags</span>
                  <span className="text-[11px] text-brand-muted">Comma separated</span>
                </label>
                <Input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Clear Aligners, Orthodontics, Teeth Straightening, Smile Makeover"
                  className="text-xs bg-white dark:bg-zinc-900 border-brand-border"
                />
              </div>

              {/* Article Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-text flex items-center justify-between">
                  <span>Article Body Paragraphs <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-brand-muted">Separate paragraphs with double enter (empty line)</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter full article content here. Separate paragraphs with an empty line..."
                  className="w-full rounded-md border border-brand-border bg-white dark:bg-zinc-900 p-3 text-xs leading-relaxed text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-y"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setArticleModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="gap-1.5 rounded-xl text-xs font-semibold bg-black text-white hover:bg-zinc-800"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>{editingPostSlug ? "Update Article" : "Publish Article"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
