"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  UserCheck,
  Stethoscope,
  Building,
  Palette,
  AlertTriangle,
  ArrowRight,
  Check,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { DentalChair, ChairColorTheme, ChairOperationalStatus } from "@/types/chairs";

// =========================================================================
// 1. ADD CHAIR MODAL
// =========================================================================
interface AddChairModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDoctors: string[];
  existingChairsCount: number;
  onChairCreated: (newChair: DentalChair) => void;
}

export function AddChairModal({
  isOpen,
  onClose,
  availableDoctors,
  existingChairsCount,
  onChairCreated,
}: AddChairModalProps) {
  const nextNum = existingChairsCount + 1;
  const [name, setName] = useState(`Dental Chair ${nextNum}`);
  const [room, setRoom] = useState(`ROOM DENTAL CHAIR ${nextNum}`);
  const [selectedDoctor, setSelectedDoctor] = useState(availableDoctors[0] || "Dr. Deep Arvindbhai Patel");
  const [customDoctor, setCustomDoctor] = useState("");
  const [isCustomDoctor, setIsCustomDoctor] = useState(false);
  const [specialty, setSpecialty] = useState("General Dentistry & Implants");
  const [description, setDescription] = useState("Consultation & Treatment Operatory");
  const [colorTheme, setColorTheme] = useState<ChairColorTheme>("purple");
  const [status, setStatus] = useState<ChairOperationalStatus>("READY");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const num = existingChairsCount + 1;
      setName(`Dental Chair ${num}`);
      setRoom(`ROOM DENTAL CHAIR ${num}`);
      setSelectedDoctor(availableDoctors[0] || "Dr. Deep Arvindbhai Patel");
      setCustomDoctor("");
      setIsCustomDoctor(false);
      setErrorMsg(null);
    }
  }, [isOpen, existingChairsCount, availableDoctors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a chair name.");
      return;
    }

    const doctorName = (isCustomDoctor ? customDoctor : selectedDoctor).trim();
    if (!doctorName) {
      setErrorMsg("Please select or enter an assigned doctor name.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/queue/chairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          room: room.trim() || `ROOM ${name.trim().toUpperCase()}`,
          doctorName,
          specialty: specialty.trim(),
          description: description.trim(),
          colorTheme,
          status,
          isActive: true,
        }),
      });

      const json = await res.json();
      if (json.success && json.chair) {
        onChairCreated(json.chair);
        onClose();
      } else {
        setErrorMsg(json.error || "Failed to create chair.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while creating chair.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add Dental Chair
              </h3>
              <p className="text-xs text-slate-500">
                Configure a new treatment chair and assign an on-duty doctor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Chair Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chair Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dental Chair 3"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            {/* Room / Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Room Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. ROOM DENTAL CHAIR 3"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Assigned Doctor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Assigned Doctor <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDoctor(!isCustomDoctor)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                {isCustomDoctor ? "← Choose from doctor list" : "+ Type new doctor name"}
              </button>
            </div>

            {isCustomDoctor ? (
              <input
                type="text"
                required
                value={customDoctor}
                onChange={(e) => setCustomDoctor(e.target.value)}
                placeholder="e.g. Dr. Ramesh Kumar (Visiting Orthodontist)"
                className="w-full rounded-xl border border-blue-300 bg-blue-50/20 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            ) : (
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              >
                {availableDoctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Specialty / Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Department / Specialty
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Orthodontics & Aligners"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChairOperationalStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              >
                <option value="READY">Ready for Patients</option>
                <option value="AVAILABLE">Available / On Standby</option>
                <option value="PAUSED">On Short Break / Sanitizing</option>
                <option value="OFFLINE">Offline / Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Procedures
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Ready to receive orthodontic appointments and consultations"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Card Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { id: "blue", label: "Blue", bg: "bg-blue-500" },
                  { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
                  { id: "purple", label: "Purple", bg: "bg-purple-500" },
                  { id: "amber", label: "Amber", bg: "bg-amber-500" },
                  { id: "cyan", label: "Cyan", bg: "bg-cyan-500" },
                  { id: "rose", label: "Rose", bg: "bg-rose-500" },
                  { id: "indigo", label: "Indigo", bg: "bg-indigo-500" },
                ] as const
              ).map((th) => (
                <button
                  type="button"
                  key={th.id}
                  onClick={() => setColorTheme(th.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    colorTheme === th.id
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${th.bg}`} />
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? "Creating..." : "Confirm & Add Chair"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 2. EDIT CHAIR MODAL (Change Doctor, Name, Room, Specialty, Color)
// =========================================================================
interface EditChairModalProps {
  isOpen: boolean;
  chair: DentalChair | null;
  onClose: () => void;
  availableDoctors: string[];
  onChairUpdated: (updatedChair: DentalChair) => void;
}

export function EditChairModal({
  isOpen,
  chair,
  onClose,
  availableDoctors,
  onChairUpdated,
}: EditChairModalProps) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [customDoctor, setCustomDoctor] = useState("");
  const [isCustomDoctor, setIsCustomDoctor] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [description, setDescription] = useState("");
  const [colorTheme, setColorTheme] = useState<ChairColorTheme>("blue");
  const [status, setStatus] = useState<ChairOperationalStatus>("READY");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (chair) {
      setName(chair.name);
      setRoom(chair.room);
      setSpecialty(chair.specialty || "");
      setDescription(chair.description || "");
      setColorTheme(chair.colorTheme || "blue");
      setStatus(chair.status || "READY");
      setIsActive(chair.isActive);

      if (availableDoctors.includes(chair.doctorName)) {
        setSelectedDoctor(chair.doctorName);
        setIsCustomDoctor(false);
        setCustomDoctor("");
      } else {
        setIsCustomDoctor(true);
        setCustomDoctor(chair.doctorName);
        setSelectedDoctor(availableDoctors[0] || "");
      }
      setErrorMsg(null);
    }
  }, [chair, availableDoctors]);

  if (!isOpen || !chair) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Chair Name is required.");
      return;
    }

    const doctorName = (isCustomDoctor ? customDoctor : selectedDoctor).trim();
    if (!doctorName) {
      setErrorMsg("Doctor Name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/queue/chairs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: chair.id,
          name: name.trim(),
          room: room.trim() || `ROOM ${name.trim().toUpperCase()}`,
          doctorName,
          specialty: specialty.trim(),
          description: description.trim(),
          colorTheme,
          status,
          isActive,
        }),
      });

      const json = await res.json();
      if (json.success && json.chair) {
        onChairUpdated(json.chair);
        onClose();
      } else {
        setErrorMsg(json.error || "Failed to update chair.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error while updating chair.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shadow-2xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configure Chair &amp; Doctor
              </h3>
              <p className="text-xs text-slate-500">
                Update assigned doctor, room designation, and settings for {chair.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assigned Doctor (Primary Feature) */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-blue-900">
                👨‍⚕️ Assigned Doctor (Consulting at this Chair) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDoctor(!isCustomDoctor)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
              >
                {isCustomDoctor ? "← Pick from registered doctors" : "+ Enter custom doctor"}
              </button>
            </div>

            {isCustomDoctor ? (
              <input
                type="text"
                required
                value={customDoctor}
                onChange={(e) => setCustomDoctor(e.target.value)}
                placeholder="Type doctor name (e.g. Dr. Deep Arvindbhai Patel)"
                className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-bold"
              />
            ) : (
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-bold"
              >
                {availableDoctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-blue-700/80">
              This doctor name is announced to waiting room TVs and printed on queue tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chair Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Room Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specialty / Department
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChairOperationalStatus)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
              >
                <option value="READY">Ready for Patients</option>
                <option value="IN_CONSULTATION">In Active Consultation</option>
                <option value="AVAILABLE">Available / On Standby</option>
                <option value="PAUSED">On Short Break / Sanitizing</option>
                <option value="OFFLINE">Offline / Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Procedures
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Card Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  { id: "blue", label: "Blue", bg: "bg-blue-500" },
                  { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
                  { id: "purple", label: "Purple", bg: "bg-purple-500" },
                  { id: "amber", label: "Amber", bg: "bg-amber-500" },
                  { id: "cyan", label: "Cyan", bg: "bg-cyan-500" },
                  { id: "rose", label: "Rose", bg: "bg-rose-500" },
                  { id: "indigo", label: "Indigo", bg: "bg-indigo-500" },
                ] as const
              ).map((th) => (
                <button
                  type="button"
                  key={th.id}
                  onClick={() => setColorTheme(th.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    colorTheme === th.id
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${th.bg}`} />
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-800">Chair Active Status</p>
              <p className="text-[11px] text-slate-500">
                Inactive chairs are hidden from reception screens and token booking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isActive ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 3. QUICK CHANGE DOCTOR MODAL (1-Click Doctor Switcher)
// =========================================================================
interface QuickChangeDoctorModalProps {
  isOpen: boolean;
  chair: DentalChair | null;
  onClose: () => void;
  availableDoctors: string[];
  onDoctorChanged: (chairId: string, newDoctor: string) => void;
}

export function QuickChangeDoctorModal({
  isOpen,
  chair,
  onClose,
  availableDoctors,
  onDoctorChanged,
}: QuickChangeDoctorModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [customDoctor, setCustomDoctor] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (chair) {
      if (availableDoctors.includes(chair.doctorName)) {
        setSelectedDoctor(chair.doctorName);
        setIsCustom(false);
      } else {
        setIsCustom(true);
        setCustomDoctor(chair.doctorName);
        setSelectedDoctor(availableDoctors[0] || "");
      }
      setErrorMsg(null);
    }
  }, [chair, availableDoctors]);

  if (!isOpen || !chair) return null;

  const handleUpdate = async () => {
    const finalDoc = (isCustom ? customDoctor : selectedDoctor).trim();
    if (!finalDoc) {
      setErrorMsg("Doctor name cannot be empty.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/queue/chairs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: chair.id,
          action: "change_doctor",
          doctorName: finalDoc,
        }),
      });

      const json = await res.json();
      if (json.success && json.chair) {
        onDoctorChanged(chair.id, finalDoc);
        onClose();
      } else {
        setErrorMsg(json.error || "Failed to update doctor.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Change Doctor for {chair.name}
              </h3>
              <p className="text-xs text-slate-500">
                Select or type the on-duty doctor for this chair
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Available Doctors:</span>
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              {isCustom ? "← Choose from list" : "+ Type other doctor"}
            </button>
          </div>

          {!isCustom ? (
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {availableDoctors.map((doc) => {
                const isSelected = selectedDoctor === doc;
                return (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => setSelectedDoctor(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-2xs"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        Dr
                      </div>
                      <span className="text-xs">{doc}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Custom Doctor Name:
              </label>
              <input
                type="text"
                value={customDoctor}
                onChange={(e) => setCustomDoctor(e.target.value)}
                placeholder="e.g. Dr. Deep Arvindbhai Patel"
                className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {submitting ? "Updating..." : "Update Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. DELETE CHAIR CONFIRMATION MODAL
// =========================================================================
interface DeleteChairModalProps {
  isOpen: boolean;
  chair: DentalChair | null;
  onClose: () => void;
  onChairDeleted: (deletedId: string) => void;
}

export function DeleteChairModal({
  isOpen,
  chair,
  onClose,
  onChairDeleted,
}: DeleteChairModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !chair) return null;

  const handleDelete = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/queue/chairs?id=${chair.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        onChairDeleted(chair.id);
        onClose();
      } else {
        setErrorMsg(json.error || "Failed to delete chair.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="h-10 w-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Delete {chair.name}?
            </h3>
            <p className="text-xs text-slate-500">
              This action will remove the chair from the queue and TV displays.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5 text-slate-700">
          <div><strong className="text-slate-900">Chair Name:</strong> {chair.name}</div>
          <div><strong className="text-slate-900">Room:</strong> {chair.room}</div>
          <div><strong className="text-slate-900">Doctor:</strong> {chair.doctorName}</div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{submitting ? "Deleting..." : "Confirm Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
