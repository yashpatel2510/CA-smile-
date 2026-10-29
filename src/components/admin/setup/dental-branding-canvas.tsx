"use client";

import React from "react";
import {
  DentalDocumentLayoutProfile,
  DentalClinicBrandingMaster,
  DentalDocumentType,
} from "@/types/dental-document-branding";
import {
  Smile,
  ShieldCheck,
  Calendar,
  Pill,
  Check,
  Phone,
  MapPin,
} from "lucide-react";

interface DentalBrandingCanvasProps {
  layout: DentalDocumentLayoutProfile;
  master: DentalClinicBrandingMaster;
  activeDoc: DentalDocumentType;
  previewMode: "pad" | "blank";
  showScanOverlay: boolean;
  scanOverlayUrl?: string;
  overlayOpacity: number;
}

// Sample medicine dataset matching CuraVerto standard prescription layout
const SAMPLE_PRESCRIPTION_MEDICINES = [
  {
    name: "Amoxicillin 500 mg + Clavulanic Acid",
    form: "1 Tab",
    instruction:
      "Complete the full course even if you feel better after two or three days",
    morn: true,
    noon: false,
    night: true,
    food: "After food",
    durationText: "5 days",
    durationDays: 5,
    qty: "Qty 10",
  },
  {
    name: "Paracetamol 650mg",
    form: "1 Tab",
    instruction: "Take with food; stop once the fever settles",
    morn: true,
    noon: true,
    night: true,
    food: "After food",
    durationText: "3 days",
    durationDays: 3,
    qty: "Qty 9",
  },
  {
    name: "Pantoprazole 40mg",
    form: "1 Tab",
    instruction: "",
    morn: true,
    noon: false,
    night: false,
    food: "Before food",
    durationText: "5 days",
    durationDays: 5,
    qty: "Qty 5",
  },
  {
    name: "Levocetirizine 5mg",
    form: "1 Tab",
    instruction: "",
    morn: false,
    noon: false,
    night: true,
    food: "At night",
    durationText: "5 days",
    durationDays: 5,
    qty: "Qty 5",
  },
  {
    name: "Ambroxol Syrup",
    form: "10 ml",
    instruction: "",
    morn: true,
    noon: true,
    night: true,
    food: "After food",
    durationText: "5 days",
    durationDays: 5,
    qty: "Qty 1",
  },
  {
    name: "Salbutamol Inhaler",
    form: "2 puffs",
    instruction: "Rinse your mouth after each use",
    specialSchedule: "Every 6 hours",
    food: "As needed",
    durationText: "7 days",
    durationDays: 7,
    qty: "Qty 28",
  },
];

// Crisp, vector SVG WhatsApp QR Code component
function WhatsAppQrSvg({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="shrink-0 bg-white"
      style={{ shapeRendering: "crispEdges" }}
    >
      {/* Background */}
      <rect width="100" height="100" fill="#ffffff" />

      {/* Top-Left Position Detection Marker */}
      <rect x="6" y="6" width="28" height="28" fill="#0f172a" />
      <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
      <rect x="14" y="14" width="12" height="12" fill="#0f172a" />

      {/* Top-Right Position Detection Marker */}
      <rect x="66" y="6" width="28" height="28" fill="#0f172a" />
      <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
      <rect x="74" y="14" width="12" height="12" fill="#0f172a" />

      {/* Bottom-Left Position Detection Marker */}
      <rect x="6" y="66" width="28" height="28" fill="#0f172a" />
      <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
      <rect x="14" y="74" width="12" height="12" fill="#0f172a" />

      {/* Alignment Pattern */}
      <rect x="68" y="68" width="16" height="16" fill="#0f172a" />
      <rect x="72" y="72" width="8" height="8" fill="#ffffff" />
      <rect x="74" y="74" width="4" height="4" fill="#0f172a" />

      {/* Timing Patterns */}
      <rect x="18" y="38" width="64" height="3" fill="#0f172a" strokeDasharray="3,3" />
      <rect x="38" y="18" width="3" height="64" fill="#0f172a" strokeDasharray="3,3" />

      {/* Data Matrix Dots (Realistic QR Structure) */}
      <rect x="42" y="10" width="4" height="8" fill="#0f172a" />
      <rect x="50" y="8" width="8" height="4" fill="#0f172a" />
      <rect x="46" y="24" width="12" height="4" fill="#0f172a" />
      <rect x="10" y="46" width="6" height="12" fill="#0f172a" />
      <rect x="22" y="44" width="8" height="8" fill="#0f172a" />
      <rect x="22" y="56" width="4" height="6" fill="#0f172a" />
      <rect x="44" y="44" width="12" height="12" fill="#0f766e" />
      <rect x="60" y="44" width="8" height="6" fill="#0f172a" />
      <rect x="54" y="54" width="10" height="6" fill="#0f172a" />
      <rect x="44" y="66" width="6" height="10" fill="#0f172a" />
      <rect x="54" y="68" width="8" height="8" fill="#0f172a" />
      <rect x="44" y="80" width="14" height="6" fill="#0f172a" />
      <rect x="74" y="46" width="16" height="6" fill="#0f172a" />
      <rect x="80" y="56" width="10" height="6" fill="#0f172a" />

      {/* WhatsApp Center Brand Dot */}
      <circle cx="50" cy="50" r="7" fill="#ffffff" />
      <circle cx="50" cy="50" r="5" fill="#25d366" />
    </svg>
  );
}

export function DentalBrandingCanvas({
  layout,
  master,
  activeDoc,
  previewMode,
  showScanOverlay,
  scanOverlayUrl,
  overlayOpacity,
}: DentalBrandingCanvasProps) {
  const isPad = previewMode === "pad";
  const isDotMatrix = master.dot_matrix_mode;
  const currencySymbol = isDotMatrix ? "Rs. " : "₹";

  // Paper size dimensions
  const paperDimensions =
    layout.paper_size === "a5"
      ? { width: "148mm", minHeight: "210mm", label: "A5 Dental Pad (148 × 210 mm)" }
      : layout.paper_size === "thermal_80"
      ? { width: "80mm", minHeight: "180mm", label: "80mm Thermal Receipt Roll" }
      : { width: "210mm", minHeight: "297mm", label: "A4 Standard Document (210 × 297 mm)" };

  // Fallback defaults matching the user's sample clinic & doctor
  const doctorName = master.doctor_name || "Dr. Sample Doctor";
  const doctorQual =
    master.doctor_qualification ||
    "MBBS, MD (General Medicine), Diploma in Diabetology";
  const doctorReg = master.doctor_reg_no || "SAMPLE-REG-0000";
  const clinicName = master.clinic_name || "Smile Dental Clinic";
  const clinicAddress =
    master.address ||
    "1st Floor, Labdhi Arcade, Above HDFC Bank, Bilimora, Gujarat 396321";
  const clinicPhone = master.phone || "9664681536";

  return (
    <div className="relative flex w-full flex-col items-center justify-center rounded-2xl bg-slate-900/90 p-3 sm:p-6 backdrop-blur-md">
      {/* Top Paper Info Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 w-full max-w-[210mm] text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">{paperDimensions.label}</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-teal-400 font-mono">
            Scale: {layout.font_scale.toFixed(2)}x
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">View Mode:</span>
          <span
            className={`rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider ${
              isPad
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
            }`}
          >
            {isPad ? "Pre-Printed Pad Clearance" : "Digital Letterhead Output"}
          </span>
        </div>
      </div>

      {/* Paper Sheet Viewport */}
      <div className="relative flex justify-center w-full overflow-x-auto py-2">
        <div
          id="dental-printable-sheet"
          className={`relative bg-white text-slate-900 shadow-2xl transition-all duration-200 flex flex-col justify-between ${
            isDotMatrix ? "font-mono tracking-tight" : "font-sans"
          }`}
          style={{
            width: paperDimensions.width,
            minHeight: paperDimensions.minHeight,
            maxWidth: "100%",
            transformOrigin: "top center",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Optional Flatbed Scanner Watermark */}
          {showScanOverlay && scanOverlayUrl && (
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-cover bg-no-repeat bg-top"
              style={{
                backgroundImage: `url(${scanOverlayUrl})`,
                opacity: overlayOpacity / 100,
              }}
            />
          )}

          {/* ========================================================== */}
          {/* 1. TOP HEADER SECTION (PAD CLEARANCE vs DIGITAL NAVY BANNER) */}
          {/* ========================================================== */}
          {isPad ? (
            <div>
              {/* Pre-Printed Pad Clearance Area (Zero Ink in Print) */}
              <div
                className="relative w-full border-b-2 border-dashed border-amber-500/70 bg-amber-50/50 print:border-none print:bg-transparent"
                style={{
                  height: `${layout.header_height_mm}mm`,
                  minHeight: `${layout.header_height_mm}mm`,
                }}
              >
                <div className="print-pad-notice flex h-full flex-col justify-between p-2.5 text-[10px] text-amber-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded text-[9px]">
                      Pre-Printed Pad Clearance ({layout.header_height_mm} mm)
                    </span>
                    <span className="text-[10px] font-mono text-amber-800">
                      No ink will print in this zone
                    </span>
                  </div>
                  <div className="text-center italic text-amber-600/80 text-[10px]">
                    Physical pre-printed clinic logo &amp; doctor degrees pass through untouched here
                  </div>
                </div>
              </div>

              {/* Pad Sub-Line (Shown on paper below pre-printed header) */}
              <div className="px-5 pt-3 pb-1 text-[11px] font-medium text-slate-700">
                <span>
                  {doctorName.replace(" Doctor", "")} has planned your next 7 days. Six medicines.
                </span>
              </div>
            </div>
          ) : (
            <div>
              {/* Digital Letterhead Top Dark Navy Banner */}
              <div
                className="relative w-full bg-[#0b192c] text-white p-4 sm:p-5"
                style={{
                  backgroundColor: "#0b192c",
                  color: "#ffffff",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              >
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Left: Doctor Credentials */}
                  <div className="col-span-5 space-y-0.5">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                      {doctorName}
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-tight">
                      {doctorQual}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      General Medicine
                    </p>
                    <div className="pt-0.5">
                      <span className="inline-block rounded-full bg-[#fbbf24] px-2.5 py-0.5 text-[9px] font-extrabold text-slate-950 tracking-wide uppercase">
                        Reg. No. {doctorReg}
                      </span>
                    </div>
                  </div>

                  {/* Center: Clinic Name & Address */}
                  <div className="col-span-4 text-center sm:text-left space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">
                      {clinicName}
                    </h3>
                    <div className="flex items-start justify-center sm:justify-start gap-1 text-[9.5px] text-slate-300 leading-snug">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{clinicAddress}</span>
                    </div>
                  </div>

                  {/* Right: CA Smile Logo & Contact */}
                  <div className="col-span-3 flex flex-col items-end justify-center space-y-1">
                    <div className="rounded-lg bg-white px-2.5 py-1 shadow-sm flex items-center justify-center">
                      {master.logo_url && !master.logo_url.includes("placeholder") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={master.logo_url}
                          alt="Clinic Logo"
                          className="h-6 w-auto max-w-[95px] object-contain"
                        />
                      ) : (
                        <span className="text-xs font-black tracking-tight text-slate-900">
                          CA <span className="text-teal-600 font-normal">smile</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-300">
                      <span>Call or WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-white text-xs sm:text-sm tracking-tight">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>{clinicPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope Sub-Bar: Days & Medicines Count */}
              <div className="flex items-center justify-between border-y border-slate-200 bg-slate-50/90 px-5 py-1.5 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  <span>Next 7 days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5 text-slate-600" />
                  <span>6 medicines</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. SAFE PRINTABLE CLINICAL CONTENT ZONE                    */}
          {/* ========================================================== */}
          <div
            className="relative px-5 py-3 flex-1 transition-transform duration-100"
            style={{
              transform: `scale(${layout.font_scale})`,
              transformOrigin: "top left",
            }}
          >
            {/* Safe zone boundary indicator for screen calibration */}
            <div className="print-guide-marker pointer-events-none mb-1 border-b border-dashed border-teal-500/50 flex justify-between items-center py-0.5 text-[9px] text-teal-600 font-mono">
              <span>▲ Content starts here</span>
              <span>Safe Zone Top: {layout.header_height_mm}mm</span>
            </div>

            {/* Patient Demographics Strip */}
            <div className="mb-2 pb-2 border-b border-slate-300 text-[10.5px]">
              <div className="grid grid-cols-5 gap-2 text-slate-600">
                <div>
                  <span className="block text-[9px] text-slate-400 font-medium">Patient</span>
                  <strong className="text-slate-900 font-bold">Sample Patient</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-medium">UHID</span>
                  <strong className="text-slate-900 font-bold font-mono">SAMPLE-0001</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-medium">Age, sex</span>
                  <strong className="text-slate-900 font-bold">58 y, Female</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-medium">Phone</span>
                  <strong className="text-slate-900 font-bold">9000000000</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 font-medium">Seen on</span>
                  <strong className="text-slate-900 font-bold">19 Sep 2026, 11:20 am</strong>
                </div>
              </div>

              {/* Vitals */}
              <div className="mt-2 pt-1 border-t border-slate-100 flex items-center gap-3 text-[10px]">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                  Vitals
                </span>
                <span className="font-bold text-slate-900 tracking-tight">
                  BP <span className="font-mono">138/86</span> &nbsp;&bull;&nbsp; Pulse{" "}
                  <span className="font-mono">82</span> &nbsp;&bull;&nbsp; Temp{" "}
                  <span className="font-mono">99.1 °F</span> &nbsp;&bull;&nbsp; SpO2{" "}
                  <span className="font-mono">97%</span>
                </span>
              </div>
            </div>

            {/* DOCUMENT-SPECIFIC SAMPLES */}
            {activeDoc === "PRESCRIPTION" && (
              <div>
                {/* Chief Complaint & Diagnosis */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-200 text-[11px]">
                  <div className="col-span-7">
                    <h4 className="font-bold text-slate-900 text-xs mb-1">Chief Complaint</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-800 text-[10.5px]">
                      <li>Fever for four days with a productive cough</li>
                      <li>Sore throat and body ache</li>
                      <li>Reduced appetite and disturbed sleep</li>
                    </ul>
                  </div>
                  <div className="col-span-5">
                    <h4 className="font-bold text-slate-900 text-xs mb-1">Diagnosis</h4>
                    <p className="font-bold text-slate-900 text-xs leading-snug">
                      Acute bronchitis with a secondary bacterial infection
                    </p>
                    {layout.show_tooth_diagram && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-teal-100 px-2 py-0.5 text-[9.5px] font-bold text-teal-900">
                        <Smile className="h-3 w-3" /> FDI #46 (Lower Right 1st Molar)
                      </span>
                    )}
                  </div>
                </div>

                {/* Medicine Schedule: Your plan */}
                <div className="py-2.5">
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">Your plan</h3>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-[9.5px] font-bold uppercase text-slate-500">
                        <th className="pb-1.5">Medicine</th>
                        <th className="pb-1.5 text-center w-10">Morn</th>
                        <th className="pb-1.5 text-center w-10">Noon</th>
                        <th className="pb-1.5 text-center w-10">Night</th>
                        <th className="pb-1.5">Food</th>
                        <th className="pb-1.5">How long</th>
                        <th className="pb-1.5 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {SAMPLE_PRESCRIPTION_MEDICINES.map((med, idx) => (
                        <tr key={idx} className="align-middle">
                          {/* Medicine & Dosage & Instruction */}
                          <td className="py-2 pr-2">
                            {idx === 0 ? (
                              <>
                                <div className="font-bold text-slate-900 text-[11px] leading-tight">
                                  {med.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {med.form}
                                </div>
                              </>
                            ) : (
                              <div className="font-bold text-slate-900 text-[11px] leading-tight flex items-baseline gap-1.5">
                                <span>{med.name}</span>
                                <span className="font-normal text-slate-500 text-[10px]">
                                  {med.form}
                                </span>
                              </div>
                            )}
                            {med.instruction && (
                              <div className="text-[9px] text-slate-500 italic mt-0.5 leading-snug">
                                {med.instruction}
                              </div>
                            )}
                          </td>

                          {/* Timing Badges */}
                          {med.specialSchedule ? (
                            <td colSpan={3} className="py-2 text-center">
                              <span className="inline-block rounded-full border border-slate-900 px-2.5 py-0.5 font-bold text-[9px] text-slate-900">
                                {med.specialSchedule}
                              </span>
                            </td>
                          ) : (
                            <>
                              <td className="py-2 text-center">
                                {med.morn ? (
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-white shadow-xs">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">&ndash;</span>
                                )}
                              </td>
                              <td className="py-2 text-center">
                                {med.noon ? (
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-white shadow-xs">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">&ndash;</span>
                                )}
                              </td>
                              <td className="py-2 text-center">
                                {med.night ? (
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-white shadow-xs">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">&ndash;</span>
                                )}
                              </td>
                            </>
                          )}

                          {/* Food condition */}
                          <td className="py-2 text-slate-700 font-medium text-[10.5px]">
                            {med.food}
                          </td>

                          {/* How long: Horizontal pill timeline */}
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 rounded-full bg-slate-950"
                                style={{
                                  width: `${Math.min(med.durationDays * 12, 80)}px`,
                                  backgroundColor: "#0f172a",
                                  WebkitPrintColorAdjust: "exact",
                                  printColorAdjust: "exact",
                                }}
                              />
                              <span className="font-bold text-[10.5px] text-slate-900 whitespace-nowrap">
                                {med.durationText}
                              </span>
                            </div>
                          </td>

                          {/* Qty */}
                          <td className="py-2 text-right font-medium text-slate-700 text-[10.5px]">
                            {med.qty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tests & Advice (2 columns) */}
                <div className="grid grid-cols-12 gap-4 py-2 border-t border-slate-200 text-[11px]">
                  <div className="col-span-6">
                    <h4 className="font-bold text-slate-900 text-xs mb-1">Tests</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-800 text-[10px]">
                      <li>Complete Blood Count</li>
                      <li>Chest X-ray PA view</li>
                      <li>C-Reactive Protein (CRP)</li>
                    </ul>
                  </div>
                  <div className="col-span-6">
                    <h4 className="font-bold text-slate-900 text-xs mb-1">Advice</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-800 text-[10px]">
                      <li>Drink plenty of warm fluids and rest for three days</li>
                      <li>Avoid cold drinks and dust exposure</li>
                      <li>Steam inhalation twice a day helps loosen the cough</li>
                    </ul>
                  </div>
                </div>

                {/* Come back sooner if (Red-flag alert box) */}
                <div className="my-2 rounded-xl border border-red-400 bg-red-50/20 p-2.5 text-[10.5px]">
                  <h5 className="font-bold text-slate-900 text-xs mb-1">Come back sooner if</h5>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-800 text-[10px]">
                    <li>Breathing becomes difficult</li>
                    <li>The fever does not settle in three days</li>
                    <li>You notice blood in the sputum</li>
                  </ul>
                </div>

                {/* Your next visit */}
                <div className="my-2 rounded-xl border border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Your next visit</span>
                  <span className="font-bold text-slate-950 text-sm">Mon, 5 Oct</span>
                </div>

                {/* Doctor Signature Block */}
                <div className="flex justify-end pt-3 pb-1">
                  <div className="text-center min-w-[170px] border-t border-slate-800 pt-1.5">
                    <p className="font-bold text-slate-900 text-xs leading-tight">{doctorName}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Reg. No. {doctorReg}</p>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER DOCUMENT TYPES: TREATMENT PLAN, CONSENT, INVOICE */}
            {activeDoc === "TREATMENT_PLAN" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Comprehensive Dental Odontogram &amp; Treatment Estimate
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Chart System: FDI Two-Digit
                  </span>
                </div>

                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="pb-1.5">Tooth #</th>
                      <th className="pb-1.5">Diagnosis</th>
                      <th className="pb-1.5">Planned Treatment</th>
                      <th className="pb-1.5 text-center">Sittings</th>
                      <th className="pb-1.5 text-right">Fee ({currencySymbol.trim()})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-1.5 font-bold text-teal-800">#46</td>
                      <td className="py-1.5 text-slate-700">Pulpitis / Deep Caries</td>
                      <td className="py-1.5 font-medium text-slate-900">
                        Molar Endodontic Therapy (Rotary RCT)
                      </td>
                      <td className="py-1.5 text-center">3</td>
                      <td className="py-1.5 text-right font-mono font-bold">
                        {currencySymbol}4,500
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-teal-800">#46</td>
                      <td className="py-1.5 text-slate-700">Post-Endo Restoration</td>
                      <td className="py-1.5 font-medium text-slate-900">
                        Monolithic Zirconia CAD/CAM Crown (10y Warr.)
                      </td>
                      <td className="py-1.5 text-center">2</td>
                      <td className="py-1.5 text-right font-mono font-bold">
                        {currencySymbol}7,500
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-bold text-teal-800">#21</td>
                      <td className="py-1.5 text-slate-700">Class IV Incisal Fracture</td>
                      <td className="py-1.5 font-medium text-slate-900">
                        Nanohybrid Composite Aesthetic Build-up
                      </td>
                      <td className="py-1.5 text-center">1</td>
                      <td className="py-1.5 text-right font-mono font-bold">
                        {currencySymbol}2,500
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={4} className="pt-2 text-right">
                        Estimated Total:
                      </td>
                      <td className="pt-2 text-right font-mono text-sm text-teal-800">
                        {currencySymbol}14,500
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {activeDoc === "CONSENT_FORM" && (
              <div className="space-y-3">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-rose-600" />
                    Informed Consent for Surgical &amp; Restorative Procedures
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Form: DCI-SMR-2026</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-[10.5px] text-slate-700 space-y-2 leading-relaxed border border-slate-200">
                  <p>
                    I, <strong className="text-slate-900">Sample Patient</strong>, authorize{" "}
                    <strong>{doctorName}</strong> and clinical associates to perform the agreed
                    surgical procedure(s):{" "}
                    <strong className="text-teal-800">
                      Molar Endodontic Surgery &amp; Restoration on Tooth #46
                    </strong>
                    .
                  </p>
                  <p>
                    The proposed therapy, alternatives, benefits, and common risks have been
                    explained to me in a language I understand.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 text-[10px]">
                  <div className="border-t border-slate-400 pt-1">
                    <span className="text-slate-500 block">Patient / Guardian Signature</span>
                    <span className="font-bold text-slate-800">Sample Patient</span>
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-right">
                    <span className="text-slate-500 block">Treating Dental Surgeon</span>
                    <span className="font-bold text-slate-800">{doctorName}</span>
                  </div>
                </div>
              </div>
            )}

            {activeDoc === "INVOICE" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Tax Invoice / Receipt
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      INV-CAS-2026-1094
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Mode
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">UPI / GPay</span>
                  </div>
                </div>

                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                      <th className="pb-1.5">Description</th>
                      <th className="pb-1.5 text-center">Qty</th>
                      <th className="pb-1.5 text-right">Amount ({currencySymbol.trim()})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-1.5 font-medium text-slate-900">
                        OPD Consultation &amp; Digital RVG Diagnostic X-Ray
                      </td>
                      <td className="py-1.5 text-center">1</td>
                      <td className="py-1.5 text-right font-mono">{currencySymbol}500</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium text-slate-900">
                        Rotary Endodontic Bio-Mechanical Canal Prep (#46)
                      </td>
                      <td className="py-1.5 text-center">1</td>
                      <td className="py-1.5 text-right font-mono">{currencySymbol}2,000</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={2} className="pt-2 text-right">
                        Net Paid:
                      </td>
                      <td className="pt-2 text-right font-mono text-sm text-teal-800">
                        {currencySymbol}2,500
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* 3. BOTTOM FOOTER SECTION (PAD CLEARANCE vs DIGITAL BANNER)  */}
          {/* ========================================================== */}
          {isPad ? (
            <div
              className="w-full border-t-2 border-dashed border-amber-500/70 bg-amber-50/50 print:border-none print:bg-transparent"
              style={{
                height: `${layout.footer_height_mm}mm`,
                minHeight: `${layout.footer_height_mm}mm`,
              }}
            >
              <div className="print-pad-notice flex h-full flex-col justify-between p-2 text-[9px] text-amber-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded text-[8px]">
                    Pre-Printed Footer Clearance ({layout.footer_height_mm} mm)
                  </span>
                  <span className="font-mono text-[9px] text-amber-800">
                    Stationery footer area left blank
                  </span>
                </div>
                <div className="text-center italic text-amber-600/80 text-[9px]">
                  Hospital address, emergency phone, and accreditation logos pre-printed on pad
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Digital Letterhead Dark Navy Footer Banner */}
              <div
                className="w-full bg-[#0b192c] text-white px-5 py-3 flex items-center justify-between"
                style={{
                  backgroundColor: "#0b192c",
                  color: "#ffffff",
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              >
                <div>
                  <p className="text-[9.5px] text-slate-400 font-medium">
                    Book, ask, or need us sooner?
                  </p>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                    Send Hi on WhatsApp
                  </h4>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-semibold text-slate-300">
                    Send Hi to {clinicPhone}
                  </span>
                  <div className="rounded-lg bg-white p-1 shadow-sm">
                    <WhatsAppQrSvg size={44} />
                  </div>
                </div>
              </div>

              {/* Prepared with CuraVerto */}
              <div className="py-1 text-center text-[8.5px] text-slate-400 font-medium bg-white">
                Prepared with CuraVerto
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
