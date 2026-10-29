"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Stethoscope,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Pill,
  MapPin,
  Phone,
} from "lucide-react";

interface EditRxModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientId?: string;
  age?: string;
  service?: string;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
}

export function CuravertoEditRxModal({
  isOpen,
  onClose,
  patientName = "Sample Patient",
  patientId = "SAMPLE-0001",
  age = "58 y, Female",
  service = "Root Canal Treatment: Molar",
}: EditRxModalProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: "1", name: "Amoxicillin 500 mg + Clavulanic Acid", dosage: "1 Tab · After food", duration: "5 days" },
    { id: "2", name: "Paracetamol 650mg", dosage: "1 Tab · After food", duration: "3 days" },
    { id: "3", name: "Pantoprazole 40mg", dosage: "1 Tab · Before food", duration: "5 days" },
    { id: "4", name: "Levocetirizine 5mg", dosage: "1 Tab · At night", duration: "5 days" },
    { id: "5", name: "Ambroxol Syrup", dosage: "10 ml · After food", duration: "5 days" },
    { id: "6", name: "Salbutamol Inhaler", dosage: "2 puffs · As needed", duration: "7 days" },
  ]);
  const [newMedName, setNewMedName] = useState("");
  const [newDosage, setNewDosage] = useState("1 Tab · After food");
  const [newDuration, setNewDuration] = useState("5 days");
  const [clinicalNotes, setClinicalNotes] = useState(
    "Fever for four days with a productive cough. Sore throat and body ache. Reduced appetite and disturbed sleep."
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setMedicines((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newMedName,
        dosage: newDosage,
        duration: newDuration,
      },
    ]);
    setNewMedName("");
  };

  const handleRemoveMed = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveRx = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handlePrintRx = () => {
    const styleId = "rx-print-modal-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @media print {
        @page {
          size: A5 portrait;
          margin: 0;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden !important;
        }
        #rx-printable-sheet, #rx-printable-sheet * {
          visibility: visible !important;
        }
        #rx-printable-sheet {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Edit Rx</h2>
                <span className="text-xs font-semibold text-slate-400">
                  {patientId} · {age}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {patientName} &mdash; {service}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {saved ? (
          <div className="p-10 text-center space-y-3">
            <div className="flex justify-center text-emerald-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
            </div>
            <h3 className="font-bold text-base text-slate-900">Prescription Updated!</h3>
            <p className="text-xs text-slate-500">
              Clinical notes and medicines saved for {patientName}.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Clinical Notes */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                CLINICAL NOTES &amp; DIAGNOSIS
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Prescribed Medicines */}
            <div className="space-y-2">
              <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                PRESCRIBED MEDICINES ({medicines.length})
              </label>
              <div className="space-y-1.5 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                {medicines.map((m) => (
                  <div key={m.id} className="flex items-center justify-between pt-1.5 first:pt-0">
                    <div>
                      <div className="font-bold text-xs text-slate-800">{m.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {m.dosage} &middot; {m.duration}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMed(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Medicine Inline */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Medicine name..."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="col-span-6 rounded-lg border border-slate-200 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Dosage..."
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="col-span-3 rounded-lg border border-slate-200 p-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddMed}
                  className="col-span-3 inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrintRx}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-blue-600" />
                <span>Print Rx</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRx}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
                >
                  Save Rx
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Printable Sheet for Native Browser Printing */}
      <div
        id="rx-printable-sheet"
        className="hidden print:flex flex-col justify-between bg-white text-slate-900"
        style={{ width: "148mm", minHeight: "210mm" }}
      >
        {/* Navy Header */}
        <div
          className="bg-[#0b192c] text-white p-4"
          style={{ backgroundColor: "#0b192c", color: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5 space-y-0.5">
              <h2 className="text-sm font-bold text-white">Dr. Sample Doctor</h2>
              <p className="text-[9px] text-slate-300">MBBS, MD (General Medicine)</p>
              <span className="inline-block rounded-full bg-[#fbbf24] px-2 py-0.5 text-[8px] font-bold text-slate-950 uppercase mt-0.5">
                Reg. No. SAMPLE-REG-0000
              </span>
            </div>
            <div className="col-span-4 text-left space-y-0.5">
              <h3 className="text-xs font-bold text-white">Smile Dental Clinic</h3>
              <p className="text-[8.5px] text-slate-300">
                1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321
              </p>
            </div>
            <div className="col-span-3 text-right">
              <p className="text-[8.5px] text-slate-300">Call or WhatsApp</p>
              <p className="text-xs font-bold text-white">9664681536</p>
            </div>
          </div>
        </div>

        {/* Scope Sub-bar */}
        <div className="flex justify-between border-y border-slate-200 bg-slate-50 px-4 py-1 text-[10px] font-semibold text-slate-700">
          <span>Next 7 days</span>
          <span>{medicines.length} medicines</span>
        </div>

        {/* Content Zone */}
        <div className="p-4 flex-1 text-[10px]">
          {/* Patient Info Strip */}
          <div className="grid grid-cols-5 gap-2 border-b border-slate-200 pb-2 mb-2 text-slate-600">
            <div>
              <span className="block text-[8px] text-slate-400">Patient</span>
              <strong className="text-slate-900">{patientName}</strong>
            </div>
            <div>
              <span className="block text-[8px] text-slate-400">UHID</span>
              <strong className="text-slate-900 font-mono">{patientId}</strong>
            </div>
            <div>
              <span className="block text-[8px] text-slate-400">Age, sex</span>
              <strong className="text-slate-900">{age}</strong>
            </div>
            <div>
              <span className="block text-[8px] text-slate-400">Phone</span>
              <strong className="text-slate-900">9000000000</strong>
            </div>
            <div>
              <span className="block text-[8px] text-slate-400">Seen on</span>
              <strong className="text-slate-900">28 Oct 2026</strong>
            </div>
          </div>

          <div className="mb-2 text-[9px] text-slate-700">
            <strong>Vitals: </strong> BP 138/86 &bull; Pulse 82 &bull; Temp 99.1 &deg;F &bull; SpO2 97%
          </div>

          {/* Chief Complaint / Notes */}
          <div className="border-b border-slate-200 pb-2 mb-2">
            <h4 className="font-bold text-slate-900 text-[10px] mb-0.5">Chief Complaint &amp; Diagnosis</h4>
            <p className="text-slate-800 text-[9.5px]">{clinicalNotes || service}</p>
          </div>

          {/* Medicines Plan */}
          <div className="mb-2">
            <h4 className="font-bold text-slate-900 text-xs mb-1">Your plan</h4>
            <table className="w-full text-left text-[9.5px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase text-[8.5px]">
                  <th className="pb-1">Medicine</th>
                  <th className="pb-1">Timing / Dosage</th>
                  <th className="pb-1 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((m, idx) => (
                  <tr key={idx}>
                    <td className="py-1 font-bold text-slate-900">{m.name}</td>
                    <td className="py-1 text-slate-600">{m.dosage}</td>
                    <td className="py-1 text-right font-medium text-slate-800">{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alert box */}
          <div className="my-2 rounded-lg border border-red-300 bg-red-50/20 p-2 text-[9px]">
            <h5 className="font-bold text-slate-900 mb-0.5">Come back sooner if</h5>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              <li>Breathing becomes difficult</li>
              <li>The fever does not settle in three days</li>
              <li>You notice blood in the sputum</li>
            </ul>
          </div>

          {/* Next Visit */}
          <div className="border border-slate-800 rounded-lg px-3 py-1.5 flex justify-between items-center text-[10px]">
            <span className="text-slate-600">Your next visit</span>
            <strong className="text-slate-900 font-bold">Mon, 5 Oct</strong>
          </div>

          {/* Signature */}
          <div className="flex justify-end pt-3 text-right">
            <div className="border-t border-slate-800 pt-1 text-center min-w-[130px]">
              <p className="font-bold text-slate-900 text-[10px]">Dr. Sample Doctor</p>
              <p className="text-[8px] text-slate-500 font-mono">Reg. No. SAMPLE-REG-0000</p>
            </div>
          </div>
        </div>

        {/* Navy Footer */}
        <div
          className="bg-[#0b192c] text-white px-4 py-2 flex justify-between items-center text-[9px]"
          style={{ backgroundColor: "#0b192c", color: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <div>
            <p className="text-slate-400 text-[8px]">Book, ask, or need us sooner?</p>
            <p className="font-bold text-white text-[10px]">Send Hi on WhatsApp to 9664681536</p>
          </div>
          <div className="text-right text-[8px] text-slate-300">
            Prepared with CuraVerto
          </div>
        </div>
      </div>
    </div>
  );
}
