"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  Search,
  Plus,
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
  Stethoscope,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ServiceItem } from "@/app/api/admin/setup/services/route";

const DEFAULT_DOCTORS = [
  "General (All Doctors)",
  "Dr. Deep Arvindbhai Patel",
];

export function CuravertoServicesSetupView() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State for + ADD NEW SERVICE
  const [provider, setProvider] = useState("Dr. Deep Arvindbhai Patel");
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("500");
  const [duration, setDuration] = useState("Def.");

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // Load Services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/setup/services");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setServices(json.data);
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle Add New Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      alert("Please enter a service name.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: serviceName.trim(),
        provider: provider === "General (All Doctors)" ? "GENERAL" : provider,
        price: Number(price) || 0,
        duration: duration === "Def." ? "30m" : duration,
        isConsult: true,
      };

      const res = await fetch("/api/admin/setup/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.allServices) {
        setServices(json.allServices);
        setServiceName("");
        setPrice("500");
        setDuration("Def.");
      } else {
        alert("Failed to add service: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error adding service:", err);
      alert("Error adding service.");
    } finally {
      setSaving(false);
    }
  };

  // Start Inline Edit
  const startEdit = (item: ServiceItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDuration(item.duration.replace("m", ""));
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditDuration("");
  };

  // Save Inline Edit
  const saveEdit = async (item: ServiceItem) => {
    if (!editName.trim()) return;

    try {
      const payload = {
        ...item,
        name: editName.trim(),
        price: Number(editPrice) || 0,
        duration: editDuration.includes("m") ? editDuration : `${editDuration}m`,
      };

      const res = await fetch("/api/admin/setup/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.allServices) {
        setServices(json.allServices);
        setEditingId(null);
      }
    } catch (err) {
      console.error("Error saving service edit:", err);
    }
  };

  // Delete Service
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this service?")) return;

    try {
      const res = await fetch(`/api/admin/setup/services?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success && json.allServices) {
        setServices(json.allServices);
      }
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  // Group services: GENERAL vs Specific Providers
  const generalServices = services.filter(
    (s) => s.provider === "GENERAL" || s.providerName?.toLowerCase().includes("general")
  );

  const providerGroups = services.reduce((acc, item) => {
    if (item.provider !== "GENERAL" && !item.providerName?.toLowerCase().includes("general")) {
      const key = item.provider;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
    }
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Loading Service Menu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* =================================================================== */}
      {/* 1. BACK TO SETUP LINK (Screenshot 2)                                */}
      {/* =================================================================== */}
      <div>
        <Link
          href="/admin/setup"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Setup</span>
        </Link>
      </div>

      {/* =================================================================== */}
      {/* 2. + ADD NEW SERVICE CARD (Screenshots 1 & 2)                       */}
      {/* =================================================================== */}
      <div className="rounded-2xl border-l-4 border-l-blue-600 border-t border-r border-b border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
        <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase mb-4">
          + ADD NEW SERVICE
        </h2>

        <form onSubmit={handleAddService} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* 1. PROVIDER */}
            <div className="sm:col-span-3 space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PROVIDER
              </label>
              <div className="relative">
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                >
                  {DEFAULT_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 2. SERVICE NAME */}
            <div className="sm:col-span-5 space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SERVICE NAME
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Search or Type..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* 3. PRICE (₹) */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                PRICE (₹)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* 4. TIME */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TIME
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Def."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Full-width Add Service Button */}
          <div>
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b1329] hover:bg-slate-900 text-white font-semibold py-3 text-xs shadow-xs transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* =================================================================== */}
      {/* 3. SERVICE MENU (Screenshots 1, 2, 3)                               */}
      {/* =================================================================== */}
      <div className="space-y-6 pt-2">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Service Menu
        </h3>

        {/* Group 1: GENERAL · not tied to a specific provider */}
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          {/* Group Header */}
          <div className="bg-blue-50/50 border-b border-blue-100/80 px-5 py-3 flex items-center gap-2 text-xs font-semibold text-blue-700">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>GENERAL · not tied to a specific provider</span>
          </div>

          {/* Group Items */}
          <div className="divide-y divide-slate-100">
            {generalServices.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                No general services added yet.
              </div>
            ) : (
              generalServices.map((item) => {
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 bg-blue-50/20 space-y-3"
                    >
                      {/* Name input (Screenshot 1) */}
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-blue-300 bg-white py-2 px-3 text-sm font-bold text-slate-900 shadow-2xs focus:outline-hidden"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            placeholder="1200"
                            className="w-24 rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs"
                          />
                          <div className="relative inline-flex items-center">
                            <Clock className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              placeholder="30"
                              className="w-20 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-xs font-semibold text-slate-800 shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Save & Cancel Buttons (Screenshot 1) */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(item)}
                            title="Save Changes"
                            className="h-8 w-8 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            title="Cancel Edit"
                            className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.name}
                        </h4>
                        {item.isConsult && (
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 tracking-wider">
                            CONSULT
                          </span>
                        )}
                        {item.duration && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.duration}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">
                        ₹{item.price}
                      </div>
                    </div>

                    {/* Right Edit / Delete Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit service"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Group 2+: Specific Provider Groups (e.g. Dr. Deep Arvindbhai Patel) */}
        {Object.entries(providerGroups).map(([provName, provServices]) => (
          <div
            key={provName}
            className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs"
          >
            {/* Group Header */}
            <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-3 flex items-center gap-2 text-xs font-bold text-slate-700">
              <Stethoscope className="w-4 h-4 text-slate-500" />
              <span>PROVIDER: {provName}</span>
            </div>

            {/* Group Items */}
            <div className="divide-y divide-slate-100">
              {provServices.map((item) => {
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 bg-blue-50/20 space-y-3"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-blue-300 bg-white py-2 px-3 text-sm font-bold text-slate-900 shadow-2xs focus:outline-hidden"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            placeholder="300"
                            className="w-24 rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs"
                          />
                          <div className="relative inline-flex items-center">
                            <Clock className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              placeholder="15"
                              className="w-20 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-xs font-semibold text-slate-800 shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(item)}
                            title="Save Changes"
                            className="h-8 w-8 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            title="Cancel Edit"
                            className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/50 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.name}
                        </h4>
                        {item.isConsult && (
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 tracking-wider">
                            CONSULT
                          </span>
                        )}
                        {item.duration && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {item.duration !== "0" && (
                              <Clock className="w-3 h-3 text-slate-400" />
                            )}
                            {item.duration}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">
                        ₹{item.price}
                      </div>
                    </div>

                    {/* Right Edit / Delete Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit service"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
