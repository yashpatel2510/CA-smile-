"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  Pencil,
  ArrowLeft,
  Building2,
  Loader2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

interface BranchData {
  id: string;
  name: string;
  isMain: boolean;
  sharedWa: boolean;
  quality: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  slotInterval: string;
  whatsappNumber: string;
  phoneNumberId: string;
}

const INITIAL_BRANCH: BranchData = {
  id: "main-clinic",
  name: "Main Clinic",
  isMain: true,
  sharedWa: true,
  quality: "—",
  address: "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321",
  city: "Bilimora",
  state: "Gujarat",
  pinCode: "396321",
  slotInterval: "15 min",
  whatsappNumber: "+91 98765 43210",
  phoneNumberId: "",
};

export default function BranchesSetupPage() {
  // Accordions matching the exact screenshot
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [manualIdOpen, setManualIdOpen] = useState(false);

  // Manual WhatsApp Phone Number & ID for Clinic Default
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [savingWa, setSavingWa] = useState(false);
  const [waSaveStatus, setWaSaveStatus] = useState<string | null>(null);

  // Branch data
  const [branch, setBranch] = useState<BranchData>(INITIAL_BRANCH);

  // Edit Branch Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<BranchData>(INITIAL_BRANCH);
  const [savingBranch, setSavingBranch] = useState(false);

  // Load existing settings if available
  useEffect(() => {
    fetch("/api/admin/whatsapp/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          if (data.settings.displayPhoneNumber) {
            setPhoneNumber(data.settings.displayPhoneNumber);
            setBranch((prev) => ({
              ...prev,
              whatsappNumber: data.settings.displayPhoneNumber,
            }));
          }
          if (data.settings.phoneNumberId) {
            setPhoneNumberId(data.settings.phoneNumberId);
            setBranch((prev) => ({
              ...prev,
              phoneNumberId: data.settings.phoneNumberId,
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveNumberId = async () => {
    setSavingWa(true);
    setWaSaveStatus(null);
    try {
      const res = await fetch("/api/admin/whatsapp/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayPhoneNumber: phoneNumber.trim(),
          phoneNumberId: phoneNumberId.trim(),
        }),
      });

      if (res.ok) {
        setWaSaveStatus("Saved successfully");
        setTimeout(() => setWaSaveStatus(null), 3000);
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      setWaSaveStatus("Error saving ID");
    } finally {
      setSavingWa(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({ ...branch });
    setEditModalOpen(true);
  };

  const handleSaveBranch = () => {
    setSavingBranch(true);
    setTimeout(() => {
      setBranch({ ...editForm });
      setSavingBranch(false);
      setEditModalOpen(false);
    }, 250);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Return to Setup Link */}
      <div className="mb-4">
        <Link
          href="/admin/setup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] transition-colors hover:text-[#0f172a]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Setup</span>
        </Link>
      </div>

      {/* Top Header: BRANCHES (1/1) */}
      <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
        <MapPin className="h-4 w-4 text-[#94a3b8] stroke-[1.8]" />
        <span>BRANCHES</span>
        <span className="font-normal text-[#94a3b8]">(1/1)</span>
      </div>

      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* CARD 1: CLINIC DEFAULT WHATSAPP NUMBER                                    */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-[#e2e8f0]/90 bg-white p-7 shadow-xs">
          {/* Header Title with Chat Bubble */}
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#64748b]">
            <MessageCircle className="h-4 w-4 text-[#64748b] stroke-[1.8]" />
            <span>CLINIC DEFAULT WHATSAPP NUMBER</span>
          </div>

          <p className="mt-2 text-[13px] text-[#64748b]">
            Used by any branch that doesn&apos;t have its own number connected.
          </p>

          <div className="mt-4 space-y-3">
            {/* Accordion 1: Advanced (Meta Embedded Signup) */}
            <div>
              <button
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex items-center gap-1.5 text-left text-[13px] font-normal text-[#64748b] hover:text-[#334155] transition-colors"
              >
                <span className="text-[10px]">{advancedOpen ? "▼" : "▶"}</span>
                <span>
                  Advanced: connect a brand-new number instead (no existing WhatsApp app to keep)
                </span>
              </button>

              {advancedOpen && (
                <div className="mt-3 space-y-3.5">
                  <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-5 text-[13px] text-[#475569]">
                    <ol className="list-decimal space-y-2.5 pl-4 leading-relaxed">
                      <li>
                        Create a free{" "}
                        <a
                          href="https://business.facebook.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#3b82f6] underline hover:text-[#2563eb]"
                        >
                          Meta Business account
                        </a>{" "}
                        if you don&apos;t have one. Use the clinic&apos;s name exactly as patients know it.
                      </li>
                      <li>
                        Keep the phone with you. Meta sends a verification code to the number you are connecting, and you will need to type it in.
                      </li>
                      <li>
                        Press <strong className="font-bold text-[#1e293b]">Connect via Meta Embedded Signup</strong> below and follow Meta&apos;s steps. Your number and its ID come back to us automatically, nothing to copy.
                      </li>
                      <li>
                        Meta approves your display name in <strong className="font-bold text-[#1e293b]">24 to 48 hours</strong>. Everything else in CuraVerto works while you wait.
                      </li>
                    </ol>
                  </div>

                  {/* Connect via Meta Embedded Signup Button */}
                  <button
                    type="button"
                    onClick={() => alert("Launching Meta Embedded Signup...")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white py-3 text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc] transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-[#64748b] stroke-[1.8]" />
                    <span>Connect via Meta Embedded Signup</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 2: Already have a Phone Number ID? Enter manually */}
            <div>
              <button
                type="button"
                onClick={() => setManualIdOpen(!manualIdOpen)}
                className="flex items-center gap-1.5 text-left text-[13px] font-normal text-[#64748b] hover:text-[#334155] transition-colors"
              >
                <span className="text-[10px]">{manualIdOpen ? "▼" : "▶"}</span>
                <span>Already have a Phone Number ID? Enter it manually</span>
              </button>

              {manualIdOpen && (
                <div className="mt-3 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#1e293b] placeholder:text-[#94a3b8] focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      placeholder="Phone Number ID (from Meta Business Manager)"
                      className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#1e293b] placeholder:text-[#94a3b8] focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Save Number ID Button */}
                  <button
                    type="button"
                    onClick={handleSaveNumberId}
                    disabled={savingWa}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#eef2f6] py-3 text-[13px] font-bold text-[#1e293b] hover:bg-[#e2e8f0] transition-colors"
                  >
                    {savingWa ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#64748b]" />
                        <span>Saving...</span>
                      </>
                    ) : waSaveStatus ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>{waSaveStatus}</span>
                      </>
                    ) : (
                      <span>Save Number ID</span>
                    )}
                  </button>

                  <p className="text-[12px] text-[#64748b]">
                    Find this in{" "}
                    <a
                      href="https://business.facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3b82f6] underline hover:text-[#2563eb]"
                    >
                      Meta Business Manager
                    </a>{" "}
                    → WhatsApp → Phone Numbers → Phone Number ID
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Explanation note below accordions */}
          <p className="mt-5 text-[13px] leading-relaxed text-[#64748b]">
            This keeps your WhatsApp Business app working on the same number. You need the app on version{" "}
            <strong className="font-bold text-[#1e293b]">2.24.17</strong> or newer, and up to 180 days of your existing chats will be imported.
          </p>

          {/* Connect existing WhatsApp number button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => alert("Connecting existing WhatsApp number...")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white py-3 text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc] transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[#64748b] stroke-[1.8]" />
              <span>Connect existing WhatsApp number (keep using the app)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: BRANCH ITEM (Main Clinic) matching bottom of screenshot 2         */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between rounded-2xl border border-[#e2e8f0]/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            {/* Purple Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ede9fe] text-[#7c3aed]">
              <Building2 className="h-5 w-5" />
            </div>

            {/* Main Clinic Title & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[15px] text-[#0f172a]">{branch.name}</span>
              {branch.isMain && (
                <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                  MAIN
                </span>
              )}
              {branch.sharedWa && (
                <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#64748b]">
                  Shared WA
                </span>
              )}
              <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#64748b]">
                Quality: {branch.quality}
              </span>
            </div>
          </div>

          {/* Edit Pencil Icon Button */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="rounded-lg p-2 text-[#94a3b8] transition-colors hover:bg-slate-50 hover:text-[#475569]"
            title="Edit Branch"
          >
            <Pencil className="h-4 w-4 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT BRANCH MODAL (EXACT 1:1 MATCH TO USER SCREENSHOT)                    */}
      {/* ========================================================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-5">
              <h2 className="text-lg font-bold text-[#0f172a]">Edit Branch</h2>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg p-1 text-[#94a3b8] transition-colors hover:bg-slate-50 hover:text-[#334155]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* BRANCH NAME */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                  BRANCH NAME
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                  ADDRESS
                </label>
                <textarea
                  rows={3}
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium resize-none leading-relaxed"
                />
              </div>

              {/* 3-Column Row: CITY, STATE *, PIN CODE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* CITY */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                    CITY
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* STATE * */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                    STATE <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={editForm.state}
                      onChange={(e) =>
                        setEditForm({ ...editForm, state: e.target.value })
                      }
                      className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 pr-8 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                    >
                      <option value="Gujarat">Gujarat</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#64748b]" />
                  </div>
                </div>

                {/* PIN CODE */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                    PIN CODE
                  </label>
                  <input
                    type="text"
                    value={editForm.pinCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pinCode: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* SLOT INTERVAL (MINUTES) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                  SLOT INTERVAL (MINUTES)
                </label>
                <div className="relative">
                  <select
                    value={editForm.slotInterval}
                    onChange={(e) =>
                      setEditForm({ ...editForm, slotInterval: e.target.value })
                    }
                    className="w-full appearance-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 pr-8 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="10 min">10 min</option>
                    <option value="15 min">15 min</option>
                    <option value="20 min">20 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#64748b]" />
                </div>
              </div>

              {/* WHATSAPP NUMBER */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1.5">
                  WHATSAPP NUMBER
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.whatsappNumber}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        whatsappNumber: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#0f172a] focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <input
                    type="text"
                    value={editForm.phoneNumberId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        phoneNumberId: e.target.value,
                      })
                    }
                    placeholder="Phone Number ID (from Meta Business Manager)"
                    className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <p className="mt-2 text-[12px] text-[#64748b]">
                  Find this in{" "}
                  <a
                    href="https://business.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3b82f6] underline hover:text-[#2563eb]"
                  >
                    Meta Business Manager
                  </a>{" "}
                  → WhatsApp → Phone Numbers → Phone Number ID
                </p>
              </div>

              {/* ── OR ── Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2e8f0]" />
                </div>
                <div className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                  OR
                </div>
              </div>

              {/* Connect via Meta Embedded Signup button */}
              <button
                type="button"
                onClick={() => alert("Launching Meta Embedded Signup...")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white py-3 text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc] transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#64748b] stroke-[1.8]" />
                <span>Connect via Meta Embedded Signup</span>
              </button>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBranch}
                  disabled={savingBranch}
                  className="rounded-xl bg-[#0f172a] hover:bg-[#1e293b] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {savingBranch ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
