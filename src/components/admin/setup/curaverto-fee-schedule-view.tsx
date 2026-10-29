"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Stethoscope,
  Loader2,
  Search,
  Save,
  Info,
  FolderPlus,
} from "lucide-react";
import { FeeCategory, ProcedureItem } from "@/app/api/admin/setup/fee-schedule/route";

const COLOR_STYLES: Record<string, { dot: string; headerBg: string; text: string; border: string }> = {
  purple: {
    dot: "bg-purple-600",
    headerBg: "bg-[#fbf7ff] hover:bg-[#f6effe]",
    text: "text-purple-700",
    border: "border-purple-200/70",
  },
  amber: {
    dot: "bg-amber-500",
    headerBg: "bg-[#fffcf4] hover:bg-[#fff7e6]",
    text: "text-amber-800",
    border: "border-amber-200/70",
  },
  emerald: {
    dot: "bg-emerald-600",
    headerBg: "bg-[#f4fcf7] hover:bg-[#ebf9f1]",
    text: "text-emerald-800",
    border: "border-emerald-200/70",
  },
  rose: {
    dot: "bg-red-500",
    headerBg: "bg-[#fff5f5] hover:bg-[#ffebeb]",
    text: "text-red-700",
    border: "border-red-200/70",
  },
  pink: {
    dot: "bg-pink-500",
    headerBg: "bg-[#fdf4f7] hover:bg-[#fbe8ef]",
    text: "text-pink-700",
    border: "border-pink-200/70",
  },
  indigo: {
    dot: "bg-indigo-600",
    headerBg: "bg-[#f6f7fe] hover:bg-[#eef0fc]",
    text: "text-indigo-700",
    border: "border-indigo-200/70",
  },
  blue: {
    dot: "bg-blue-600",
    headerBg: "bg-[#f4f8fe] hover:bg-[#ebf2fd]",
    text: "text-blue-700",
    border: "border-blue-200/70",
  },
  teal: {
    dot: "bg-teal-600",
    headerBg: "bg-[#f2faf8] hover:bg-[#e6f6f2]",
    text: "text-teal-700",
    border: "border-teal-200/70",
  },
};

export function CuravertoFeeScheduleView() {
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBatch, setSavingBatch] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded categories (category IDs)
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Category currently in "Edit Prices" batch mode (Screenshot 3)
  const [editingCategoryPricesId, setEditingCategoryPricesId] = useState<string | null>(null);
  // Draft prices and enabled state while in batch edit mode: { [procId]: { price: string, isEnabled: boolean } }
  const [batchDraft, setBatchDraft] = useState<Record<string, { price: string; isEnabled: boolean }>>({});

  // Quick Service Adder Form (Screenshot 1)
  const [quickServiceName, setQuickServiceName] = useState("");
  const [quickCategory, setQuickCategory] = useState("");
  const [quickPrice, setQuickPrice] = useState("");

  // Modal State: Add Category
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState<FeeCategory["color"]>("blue");

  // Modal State: Add Procedure
  const [addProcCatId, setAddProcCatId] = useState<string | null>(null);
  const [newProcName, setNewProcName] = useState("");
  const [newProcSessions, setNewProcSessions] = useState("");
  const [newProcSteps, setNewProcSteps] = useState("");
  const [newProcRange, setNewProcRange] = useState("₹2,000–₹5,000");
  const [newProcPrice, setNewProcPrice] = useState("");

  // Modal State: Edit Procedure Name / Range
  const [editProcItem, setEditProcItem] = useState<{
    catId: string;
    proc: ProcedureItem;
  } | null>(null);

  // Modal / Inline State: Single Price Set Modal
  const [singlePriceModal, setSinglePriceModal] = useState<{
    catId: string;
    procId: string;
    name: string;
    currentPrice: string;
  } | null>(null);

  // Fetch Fee Schedule
  const fetchFeeSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/setup/fee-schedule");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load fee schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeSchedule();
  }, []);

  const toggleExpand = (catId: string) => {
    setExpandedIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Calculations for top metrics
  const { totalProcedures, pricedCount, offeredCount, notOfferedCount, percentagePriced } = useMemo(() => {
    let total = 0;
    let priced = 0;
    let offered = 0;
    let notOffered = 0;

    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        total++;
        if (item.clinicPrice !== null && item.clinicPrice !== undefined && item.clinicPrice > 0) {
          priced++;
        }
        if (item.isEnabled) {
          offered++;
        } else {
          notOffered++;
        }
      });
    });

    const percent = total > 0 ? Math.round((priced / total) * 100) : 0;
    return {
      totalProcedures: total,
      pricedCount: priced,
      offeredCount: offered,
      notOfferedCount: notOffered,
      percentagePriced: percent,
    };
  }, [categories]);

  // Start Batch Edit for Category (Matches Screenshot 3)
  const handleStartBatchEdit = (cat: FeeCategory) => {
    if (!expandedIds.includes(cat.id)) {
      setExpandedIds((prev) => [...prev, cat.id]);
    }
    setEditingCategoryPricesId(cat.id);
    const initialDraft: Record<string, { price: string; isEnabled: boolean }> = {};
    cat.items.forEach((item) => {
      initialDraft[item.id] = {
        price: item.clinicPrice !== null && item.clinicPrice !== undefined ? String(item.clinicPrice) : "0",
        isEnabled: item.isEnabled,
      };
    });
    setBatchDraft(initialDraft);
  };

  // Cancel Batch Edit
  const handleCancelBatchEdit = () => {
    setEditingCategoryPricesId(null);
    setBatchDraft({});
  };

  // Save Batch Edit for Category
  const handleSaveBatchEdit = async (catId: string) => {
    try {
      setSavingBatch(true);
      const updatedCategories = categories.map((cat) => {
        if (cat.id === catId) {
          return {
            ...cat,
            items: cat.items.map((item) => {
              const draft = batchDraft[item.id];
              if (draft) {
                const num = draft.price.trim() === "" ? null : Number(draft.price);
                return {
                  ...item,
                  clinicPrice: isNaN(num as number) ? null : num,
                  isEnabled: draft.isEnabled,
                };
              }
              return item;
            }),
          };
        }
        return cat;
      });

      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedCategories }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
        setEditingCategoryPricesId(null);
        setBatchDraft({});
      }
    } catch (err) {
      console.error("Error saving batch prices:", err);
    } finally {
      setSavingBatch(false);
    }
  };

  // Quick Service / Category Adder Handler (Screenshot 1)
  const handleQuickAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickServiceName.trim() || !quickCategory.trim()) return;

    try {
      let targetCategory = categories.find(
        (c) => c.name.toLowerCase() === quickCategory.trim().toLowerCase()
      );

      let workingCategories = [...categories];

      // If category doesn't exist, create it first!
      if (!targetCategory) {
        const newCat: FeeCategory = {
          id: `cat-${Date.now()}`,
          name: quickCategory.trim(),
          color: "blue",
          items: [],
        };
        targetCategory = newCat;
        workingCategories.push(newCat);
      }

      const parsedPrice = quickPrice.trim() !== "" ? Number(quickPrice) : null;
      const newProc: ProcedureItem = {
        id: `proc-${Date.now()}`,
        name: quickServiceName.trim(),
        typicalRange: parsedPrice ? `₹${parsedPrice.toLocaleString("en-IN")}` : "Custom",
        clinicPrice: isNaN(parsedPrice as number) ? null : parsedPrice,
        isEnabled: true,
      };

      const finalCategories = workingCategories.map((c) => {
        if (c.id === targetCategory!.id) {
          return {
            ...c,
            items: [...c.items, newProc],
          };
        }
        return c;
      });

      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: finalCategories }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
        setExpandedIds((prev) => [...prev, targetCategory!.id]);
        setQuickServiceName("");
        setQuickCategory("");
        setQuickPrice("");
      }
    } catch (err) {
      console.error("Error adding quick service:", err);
    }
  };

  // Add Category Handler (Modal)
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addCategory",
          name: newCatName.trim(),
          color: newCatColor,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
        const newCat = json.data[json.data.length - 1];
        if (newCat) setExpandedIds((prev) => [...prev, newCat.id]);
        setIsAddCatOpen(false);
        setNewCatName("");
      } else {
        alert("Failed to add category: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  // Remove Category Handler
  const handleRemoveCategory = async (catId: string, catName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove the category "${catName}" and all its procedures?`
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "removeCategory",
          categoryId: catId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
        setExpandedIds((prev) => prev.filter((id) => id !== catId));
        if (editingCategoryPricesId === catId) {
          setEditingCategoryPricesId(null);
        }
      }
    } catch (err) {
      console.error("Error removing category:", err);
    }
  };

  // Add Procedure Handler
  const handleAddProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addProcCatId || !newProcName.trim()) return;

    try {
      const stepsArr = newProcSteps
        ? newProcSteps.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addProcedure",
          categoryId: addProcCatId,
          name: newProcName.trim(),
          sessions: newProcSessions ? `${newProcSessions} sessions typical` : undefined,
          steps: stepsArr,
          typicalRange: newProcRange || "Custom",
          clinicPrice: newProcPrice ? Number(newProcPrice) : null,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
        setAddProcCatId(null);
        setNewProcName("");
        setNewProcSessions("");
        setNewProcSteps("");
        setNewProcRange("₹2,000–₹5,000");
        setNewProcPrice("");
      }
    } catch (err) {
      console.error("Error adding procedure:", err);
    }
  };

  // Save Single Clinic Price Handler
  const handleSaveSinglePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singlePriceModal) return;

    try {
      const parsedPrice = singlePriceModal.currentPrice.trim() !== ""
        ? Number(singlePriceModal.currentPrice)
        : null;

      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProcedure",
          categoryId: singlePriceModal.catId,
          procedureId: singlePriceModal.procId,
          clinicPrice: parsedPrice,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
        setSinglePriceModal(null);
      }
    } catch (err) {
      console.error("Error updating price:", err);
    }
  };

  // Delete Procedure Handler
  const handleDeleteProcedure = async (catId: string, procId: string) => {
    if (!confirm("Are you sure you want to remove this procedure?")) return;

    try {
      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteProcedure",
          categoryId: catId,
          procedureId: procId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Error deleting procedure:", err);
    }
  };

  // Toggle procedure enabled state in normal view
  const handleToggleProcedure = async (catId: string, procId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/admin/setup/fee-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProcedure",
          categoryId: catId,
          procedureId: procId,
          isEnabled: !currentVal,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Error toggling procedure:", err);
    }
  };

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();

    return categories
      .map((cat) => {
        const matchesCategory = cat.name.toLowerCase().includes(q);
        const matchedItems = cat.items.filter((item) =>
          item.name.toLowerCase().includes(q)
        );

        if (matchesCategory) return cat;
        if (matchedItems.length > 0) {
          return {
            ...cat,
            items: matchedItems,
          };
        }
        return null;
      })
      .filter(Boolean) as FeeCategory[];
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-xs font-semibold">Loading Dental Fee Schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16 font-sans">
      {/* 1. BACK TO SETUP LINK */}
      <div>
        <Link
          href="/admin/setup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Setup</span>
        </Link>
      </div>

      {/* 2. TOP HEADER CARD (Matches Screenshot 1) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Dental Fee Schedule
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Set your clinic&apos;s prices once. Used in AI treatment plans and patient quotes.
            </p>
          </div>

          {/* Right Progress Counter & Circular Ring */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-0.5">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {pricedCount}
                </span>
                <span className="text-base font-bold text-slate-400">
                  /{totalProcedures}
                </span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                PROCEDURES PRICED
              </div>
            </div>

            {/* Circular Progress Indicator */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-500"
                  strokeDasharray={`${percentagePriced}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-slate-700">
                {percentagePriced}%
              </span>
            </div>
          </div>
        </div>


        {/* Divider & Metrics Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
          <div>
            <span className="font-bold text-slate-900">{offeredCount}</span> offered
          </div>
          <span className="text-slate-300">·</span>
          <div>
            <span className="font-bold text-slate-900">{notOfferedCount}</span> not offered
          </div>
          <span className="text-slate-300">·</span>
          <div>
            <span className="font-bold text-slate-900">{pricedCount}</span> priced
          </div>

          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setIsAddCatOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Add New Category</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. QUICK SERVICE ADDER BAR (Matches Screenshot 1) */}
      <form
        onSubmit={handleQuickAddService}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-wrap md:flex-nowrap items-end gap-3"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Service name
          </label>
          <input
            type="text"
            required
            value={quickServiceName}
            onChange={(e) => setQuickServiceName(e.target.value)}
            placeholder=""
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="w-full md:w-56">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Category
          </label>
          <input
            type="text"
            list="fee-category-datalist"
            required
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value)}
            placeholder=""
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-hidden"
          />
          <datalist id="fee-category-datalist">
            {categories.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div className="w-full md:w-36">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Price (₹)
          </label>
          <input
            type="number"
            value={quickPrice}
            onChange={(e) => setQuickPrice(e.target.value)}
            placeholder=""
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0">
          <button
            type="submit"
            className="rounded-xl bg-[#8fae9d] hover:bg-[#7da08e] text-white font-bold px-5 py-2.5 text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Add service
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickServiceName("");
              setQuickCategory("");
              setQuickPrice("");
            }}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* 4. SEARCH PROCEDURES INPUT (Matches Screenshot 1) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search procedures (e.g. crown, RCT, implant...)"
          className="w-full rounded-2xl border border-slate-200/90 bg-white pl-11 pr-4 py-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 5. GUIDANCE NOTICE (Matches Screenshot 1 & 2) */}
      <div className="flex items-start gap-2.5 px-4 py-2.5 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-slate-700">Checkboxes</span> mark procedures as offered or not (when editing). Uncheck any procedure your clinic doesn&apos;t offer — it&apos;ll be hidden from patient quotes. Prices shown in grey are typical market guidance only.
        </p>
      </div>

      {/* 6. CATEGORIES ACCORDION LIST (Matches Screenshot 2, 3, 4, 5) */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
            No procedures matching &quot;{searchQuery}&quot;. Clear your search or add a new service above.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isExpanded = expandedIds.includes(cat.id);
            const isBatchEditing = editingCategoryPricesId === cat.id;
            const style = COLOR_STYLES[cat.color] || COLOR_STYLES.blue;
            const enabledCount = cat.items.filter((i) => i.isEnabled).length;
            const totalCount = cat.items.length;

            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
              >
                {/* CATEGORY HEADER ROW */}
                <div
                  className={`flex flex-wrap items-center justify-between px-5 py-3.5 transition-colors cursor-pointer select-none border-b ${
                    isExpanded ? "border-slate-100" : "border-transparent"
                  } ${style.headerBg}`}
                  onClick={() => toggleExpand(cat.id)}
                >
                  {/* Category Title + Dot + Offered count */}
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <h3 className={`font-bold text-sm ${style.text}`}>
                      {cat.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {enabledCount}/{totalCount} offered
                    </span>
                  </div>

                  {/* Actions on the right */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isBatchEditing ? (
                      /* Batch Editing Mode Actions (Matches Screenshot 3) */
                      <>
                        <button
                          type="button"
                          onClick={handleCancelBatchEdit}
                          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={savingBatch}
                          onClick={() => handleSaveBatchEdit(cat.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#008953] hover:bg-[#007547] text-white px-3.5 py-1 text-xs font-semibold transition-colors shadow-2xs"
                        >
                          {savingBatch ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save {cat.name}</span>
                        </button>
                      </>
                    ) : (
                      /* Normal Mode Actions (Matches Screenshot 1 & 2) */
                      <>
                        {/* + Add Procedure to this category */}
                        <button
                          type="button"
                          onClick={() => setAddProcCatId(cat.id)}
                          title="Add procedure to this category"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <Plus className="w-3 h-3 text-slate-400" />
                          <span>Add Procedure</span>
                        </button>

                        {/* Edit Prices Button (Matches Screenshot 1 & 2) */}
                        <button
                          type="button"
                          onClick={() => handleStartBatchEdit(cat)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <Pencil className="w-3 h-3 text-slate-400" />
                          <span>Edit Prices</span>
                        </button>

                        {/* Remove Category Trash Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id, cat.name)}
                          title="Delete category"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Chevron toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* CATEGORY PROCEDURES LIST */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100">
                    {cat.items.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 italic">
                        No procedures in this category yet. Click &quot;Add Procedure&quot; above to add one.
                      </div>
                    ) : (
                      cat.items.map((proc) => {
                        /* ---------------------------------------------------- */
                        /* MODE A: BATCH EDITING ROW (Matches Screenshot 3)     */
                        /* ---------------------------------------------------- */
                        if (isBatchEditing) {
                          const currentDraft = batchDraft[proc.id] || {
                            price: proc.clinicPrice !== null && proc.clinicPrice !== undefined ? String(proc.clinicPrice) : "0",
                            isEnabled: proc.isEnabled,
                          };

                          return (
                            <div
                              key={proc.id}
                              className="flex items-center justify-between p-3.5 sm:px-6 hover:bg-slate-50/50 transition-colors gap-3"
                            >
                              {/* Left: Green Checkbox & Name */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setBatchDraft((prev) => ({
                                      ...prev,
                                      [proc.id]: {
                                        ...currentDraft,
                                        isEnabled: !currentDraft.isEnabled,
                                      },
                                    }))
                                  }
                                  className="shrink-0"
                                >
                                  {currentDraft.isEnabled ? (
                                    <div className="w-5 h-5 rounded-md bg-[#008953] border border-[#008953] text-white flex items-center justify-center">
                                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md border border-slate-300 bg-white text-transparent flex items-center justify-center hover:border-slate-400">
                                      <Check className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                </button>

                                <span
                                  className={`text-xs font-bold ${
                                    currentDraft.isEnabled ? "text-slate-900" : "text-slate-400 line-through"
                                  }`}
                                >
                                  {proc.name}
                                </span>
                              </div>

                              {/* Right: Typical Range + Input Box [₹ 0] + Pencil + Trash */}
                              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                {proc.typicalRange && (
                                  <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                                    Typical: {proc.typicalRange}
                                  </span>
                                )}

                                {/* Price Input with ₹ Prefix (Matches Screenshot 3) */}
                                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs w-28 focus-within:border-emerald-500">
                                  <span className="text-slate-400 font-medium mr-1.5 select-none">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    value={currentDraft.price}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setBatchDraft((prev) => ({
                                        ...prev,
                                        [proc.id]: {
                                          ...currentDraft,
                                          price: val,
                                        },
                                      }));
                                    }}
                                    className="w-full font-bold text-slate-800 text-xs focus:outline-hidden"
                                    placeholder="0"
                                  />
                                </div>

                                {/* Edit procedure name */}
                                <button
                                  type="button"
                                  onClick={() => setEditProcItem({ catId: cat.id, proc })}
                                  className="p-1 text-slate-400 hover:text-slate-700"
                                  title="Edit name"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete procedure */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProcedure(cat.id, proc.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Delete procedure"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        }

                        /* ---------------------------------------------------- */
                        /* MODE B: NORMAL VIEW ROW (Matches Screenshot 4 & 5)   */
                        /* ---------------------------------------------------- */
                        return (
                          <div
                            key={proc.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 sm:py-3.5 hover:bg-slate-50/50 transition-colors gap-3"
                          >
                            {/* Left: Checkmark + Name + Workflow steps + Sessions */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleProcedure(cat.id, proc.id, proc.isEnabled)
                                }
                                title={proc.isEnabled ? "Disable procedure" : "Enable procedure"}
                                className="mt-0.5 shrink-0"
                              >
                                {proc.isEnabled ? (
                                  <div className="w-5 h-5 rounded-md bg-[#008953] border border-[#008953] text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-md border border-slate-300 bg-white text-transparent flex items-center justify-center hover:border-slate-400">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </button>

                              <div className="space-y-1">
                                <h4
                                  className={`text-xs font-bold ${
                                    proc.isEnabled ? "text-slate-900" : "text-slate-400 line-through"
                                  }`}
                                >
                                  {proc.name}
                                </h4>

                                {proc.sessions && (
                                  <span className="block text-[11px] text-slate-400 font-medium">
                                    {proc.sessions}
                                  </span>
                                )}

                                {/* Workflow steps (Screenshot 5: Access Opening → Biomechanical Prep...) */}
                                {proc.steps && proc.steps.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {proc.steps.map((st, sIdx) => (
                                      <React.Fragment key={st}>
                                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded">
                                          {st}
                                        </span>
                                        {sIdx < proc.steps!.length - 1 && (
                                          <span className="text-slate-300 text-xs">
                                            →
                                          </span>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Typical Range + Clinic Price + Actions */}
                            <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                              {proc.typicalRange && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Typical: {proc.typicalRange}
                                </span>
                              )}

                              {/* Price Column */}
                              <div className="w-24 text-right">
                                {proc.clinicPrice !== null && proc.clinicPrice !== undefined && proc.clinicPrice > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSinglePriceModal({
                                        catId: cat.id,
                                        procId: proc.id,
                                        name: proc.name,
                                        currentPrice: String(proc.clinicPrice),
                                      })
                                    }
                                    className="font-bold text-slate-900 text-xs hover:text-emerald-700 transition-colors"
                                  >
                                    ₹{proc.clinicPrice.toLocaleString("en-IN")}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSinglePriceModal({
                                        catId: cat.id,
                                        procId: proc.id,
                                        name: proc.name,
                                        currentPrice: "",
                                      })
                                    }
                                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                                  >
                                    Set price
                                  </button>
                                )}
                              </div>

                              {/* Edit Pencil & Delete Trash */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditProcItem({ catId: cat.id, proc })}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                  title="Edit procedure"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProcedure(cat.id, proc.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete procedure"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 7. FOOTER NOTICE (Matches Screenshot 2) */}
      <div className="pt-8 text-center">
        <p className="text-[11px] text-slate-400">
          Base procedures are maintained by CuraVerto. Renames, removals and added services apply to your clinic only.
        </p>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: ADD CATEGORY                                               */}
      {/* =================================================================== */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Fee Category</h3>
              <button
                type="button"
                onClick={() => setIsAddCatOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Implantology, Sedation"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {(["blue", "purple", "amber", "emerald", "rose", "pink", "indigo", "teal"] as const).map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCatColor(c)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          COLOR_STYLES[c]?.dot || "bg-blue-600"
                        } ${newCatColor === c ? "ring-3 ring-emerald-400 scale-110" : ""}`}
                      >
                        {newCatColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD PROCEDURE TO CATEGORY                                  */}
      {/* =================================================================== */}
      {addProcCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add New Procedure</h3>
              <button
                type="button"
                onClick={() => setAddProcCatId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProcedure} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProcName}
                  onChange={(e) => setNewProcName(e.target.value)}
                  placeholder="e.g. Crown lengthening"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Typical Sessions
                  </label>
                  <input
                    type="number"
                    value={newProcSessions}
                    onChange={(e) => setNewProcSessions(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Typical Range
                  </label>
                  <input
                    type="text"
                    value={newProcRange}
                    onChange={(e) => setNewProcRange(e.target.value)}
                    placeholder="₹2,000–₹5,000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workflow Steps (comma separated)
                </label>
                <input
                  type="text"
                  value={newProcSteps}
                  onChange={(e) => setNewProcSteps(e.target.value)}
                  placeholder="e.g. Incision, Bone Contouring, Suturing"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic Price (₹) (optional)
                </label>
                <input
                  type="number"
                  value={newProcPrice}
                  onChange={(e) => setNewProcPrice(e.target.value)}
                  placeholder="Leave empty for 'Set price'"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddProcCatId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Add Procedure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: SET SINGLE CLINIC PRICE                                    */}
      {/* =================================================================== */}
      {singlePriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Set Procedure Price</h3>
              <button
                type="button"
                onClick={() => setSinglePriceModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSinglePrice} className="space-y-4">
              <div>
                <span className="block text-xs text-slate-500 mb-1">Procedure</span>
                <p className="font-bold text-slate-800 text-sm">{singlePriceModal.name}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic Standard Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    autoFocus
                    value={singlePriceModal.currentPrice}
                    onChange={(e) =>
                      setSinglePriceModal({ ...singlePriceModal, currentPrice: e.target.value })
                    }
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSinglePriceModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: EDIT PROCEDURE DETAILS                                     */}
      {/* =================================================================== */}
      {editProcItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Procedure</h3>
              <button
                type="button"
                onClick={() => setEditProcItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const updated = categories.map((cat) => {
                    if (cat.id === editProcItem.catId) {
                      return {
                        ...cat,
                        items: cat.items.map((it) =>
                          it.id === editProcItem.proc.id ? editProcItem.proc : it
                        ),
                      };
                    }
                    return cat;
                  });

                  const res = await fetch("/api/admin/setup/fee-schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ categories: updated }),
                  });
                  const json = await res.json();
                  if (json.success && json.data) {
                    setCategories(json.data);
                    setEditProcItem(null);
                  }
                } catch (err) {
                  console.error("Failed to update procedure:", err);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedure Name
                </label>
                <input
                  type="text"
                  required
                  value={editProcItem.proc.name}
                  onChange={(e) =>
                    setEditProcItem({
                      ...editProcItem,
                      proc: { ...editProcItem.proc, name: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Typical Market Benchmark
                </label>
                <input
                  type="text"
                  value={editProcItem.proc.typicalRange}
                  onChange={(e) =>
                    setEditProcItem({
                      ...editProcItem,
                      proc: { ...editProcItem.proc, typicalRange: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic Price (₹)
                </label>
                <input
                  type="number"
                  value={editProcItem.proc.clinicPrice !== null && editProcItem.proc.clinicPrice !== undefined ? editProcItem.proc.clinicPrice : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditProcItem({
                      ...editProcItem,
                      proc: {
                        ...editProcItem.proc,
                        clinicPrice: val === "" ? null : Number(val),
                      },
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProcItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
