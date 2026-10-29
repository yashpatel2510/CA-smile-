"use client";

import React, { useState } from "react";
import { X, Printer, Check, Zap, DollarSign, FileText } from "lucide-react";

interface QuickBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientId?: string;
  service?: string;
  defaultFee?: number;
}

export function CuravertoQuickBillModal({
  isOpen,
  onClose,
  patientName = "Sample Patient",
  patientId = "SAMPLE-0001",
  service = "Routine Scaling & Polishing",
  defaultFee = 1500,
}: QuickBillModalProps) {
  const [selectedPatient, setSelectedPatient] = useState(patientName);
  const [treatmentCost, setTreatmentCost] = useState(defaultFee);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "card">("upi");
  const [isBilled, setIsBilled] = useState(false);

  if (!isOpen) return null;

  const total = Math.max(0, Number(treatmentCost || 0) - Number(discount || 0));

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBilled(true);

    const styleId = "bill-print-modal-style";
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
        #bill-printable-sheet, #bill-printable-sheet * {
          visibility: visible !important;
        }
        #bill-printable-sheet {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 150);

    setTimeout(() => {
      setIsBilled(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Zap className="h-5 w-5 fill-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Quick Bill</h2>
              <p className="text-xs text-slate-400">Generate instant invoice</p>
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

        {isBilled ? (
          <div className="p-8 text-center space-y-3">
            <div className="flex justify-center text-emerald-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Invoice Generated &amp; Printed!
            </h3>
            <p className="text-xs text-slate-500">
              Receipt of ₹{total.toLocaleString()} prepared for {selectedPatient}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBillSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                PATIENT
              </label>
              <input
                type="text"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                TREATMENT / SERVICE
              </label>
              <input
                type="text"
                defaultValue={service}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                  COST (₹)
                </label>
                <input
                  type="number"
                  value={treatmentCost}
                  onChange={(e) => setTreatmentCost(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                  DISCOUNT (₹)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
                PAYMENT METHOD
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["upi", "cash", "card"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`flex items-center justify-center rounded-xl border py-2 font-bold uppercase text-[11px] transition-all ${
                      paymentMode === mode
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="font-bold text-xs uppercase text-slate-500">
                Total Payable
              </span>
              <span className="font-mono text-lg font-bold text-slate-900">
                ₹{total.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4f46e5] px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-2xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print &amp; Bill</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Hidden Printable Invoice Sheet for Native Browser Printing */}
      <div
        id="bill-printable-sheet"
        className="hidden print:flex flex-col justify-between bg-white text-slate-900"
        style={{ width: "148mm", minHeight: "210mm" }}
      >
        <div
          className="bg-[#0b192c] text-white p-4"
          style={{ backgroundColor: "#0b192c", color: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white">Smile Dental Clinic</h2>
              <p className="text-[9px] text-slate-300">
                1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321
              </p>
              <p className="text-[9px] text-slate-300">Tel: 9664681536</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded bg-purple-500 px-2 py-0.5 text-[8px] font-bold uppercase text-white">
                Official Receipt
              </span>
              <p className="font-mono text-[9px] text-slate-300 mt-1">INV-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 text-[11px] space-y-4">
          <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
            <div>
              <span className="block text-[9px] text-slate-400">Billed To</span>
              <strong className="text-slate-900">{selectedPatient}</strong>
              <span className="block text-[9px] text-slate-500">ID: {patientId}</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] text-slate-400">Date</span>
              <strong className="text-slate-900">{new Date().toLocaleDateString("en-IN")}</strong>
              <span className="block text-[9px] text-slate-500 uppercase">Mode: {paymentMode}</span>
            </div>
          </div>

          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 uppercase text-[9px]">
                <th className="pb-1.5">Description</th>
                <th className="pb-1.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2">{service}</td>
                <td className="py-2 text-right font-mono">₹{treatmentCost.toLocaleString()}</td>
              </tr>
              {discount > 0 && (
                <tr className="text-emerald-700">
                  <td className="py-1">Special Discount</td>
                  <td className="py-1 text-right font-mono">-₹{discount.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                <td className="pt-2">Total Paid</td>
                <td className="pt-2 text-right font-mono text-emerald-800">₹{total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-600 border border-slate-200">
            Thank you for visiting Smile Dental Clinic. Please keep this receipt for medical reimbursement or insurance records.
          </div>
        </div>

        <div
          className="bg-[#0b192c] text-white px-4 py-2 flex justify-between items-center text-[9px]"
          style={{ backgroundColor: "#0b192c", color: "#ffffff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        >
          <span>Prepared with CuraVerto</span>
          <span>Emergency / Support: 9664681536</span>
        </div>
      </div>
    </div>
  );
}
