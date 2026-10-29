"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  Stethoscope,
  Pill,
  DollarSign,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Trash2,
  Plus,
  Save,
  Check,
  Shield,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  number: number;
  title: string;
  badge: {
    text: string;
    type: "configured" | "needs-setup" | "optional";
  };
  secondaryBadge?: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  isLocked?: boolean;
  italicSummary: string;
  description: string;
}

// 4th step (Lab / Diagnostics) is REMOVED as requested by user
const INITIAL_STEPS: WorkflowStep[] = [
  {
    id: 1,
    number: 1,
    title: "Patient Booking",
    badge: { text: "Configured", type: "configured" },
    subtitle: "1 doctor • 1 branch",
    icon: Calendar,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    italicSummary: "Patients book via walk-in, WhatsApp, or your online booking link.",
    description:
      "Use the Doctors tab to add doctors, set slot durations, and configure daily capacity. Each doctor can be linked to one or more branches.",
  },
  {
    id: 2,
    number: 2,
    title: "Front Desk Check-In",
    badge: { text: "Configured", type: "configured" },
    subtitle: "Appointments tab",
    icon: Users,
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    italicSummary:
      "Reception marks arrival, assigns a queue token, and starts the patient journey.",
    description:
      "No additional setup required. Check-in happens from the Appointments tab. Patients receive a WhatsApp confirmation on check-in when WhatsApp is connected.",
  },
  {
    id: 3,
    number: 3,
    title: "Doctor Consultation",
    badge: { text: "Configured", type: "configured" },
    subtitle: "EMR • Rx • AI Scribe",
    icon: Stethoscope,
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    italicSummary:
      "Doctor captures vitals, records the visit, writes a prescription, and may order lab tests.",
    description:
      'Consultation templates live in Settings → Templates. When the Diagnostics module is on, the doctor can convert free-text lab notes into tracked orders using the "Convert to Lab Orders" button inside the consultation.',
  },
  // STEP 4 (Lab / Diagnostics) WAS REMOVED AS REQUESTED
  {
    id: 4,
    number: 4,
    title: "Pharmacy Dispatch",
    badge: { text: "Configured", type: "configured" },
    subtitle: "Active",
    icon: Pill,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    italicSummary:
      "Dispense medications from the prescription. Tracks inventory, batches, and expiry.",
    description:
      "Pharmacy is active. Manage stock and dispense from the Pharmacy tab.",
  },
  {
    id: 5,
    number: 5,
    title: "Billing & Payment",
    badge: { text: "Needs Setup", type: "needs-setup" },
    subtitle: "Online payments not configured",
    icon: DollarSign,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    italicSummary:
      "Generate invoices, collect cash/UPI/card payments, and issue receipts.",
    description:
      "Configure payment gateways, tax rates, and invoice numbering policies.",
  },
  {
    id: 6,
    number: 6,
    title: "Post-Visit Follow-Up",
    badge: { text: "Optional", type: "optional" },
    secondaryBadge: "Module off",
    subtitle: "Requires WhatsApp integration",
    icon: MessageCircle,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    isLocked: true,
    italicSummary:
      "Automated follow-up messages, recovery surveys, and next appointment reminders.",
    description:
      "Sends automated follow-up messages 48 hours after visit completion once WhatsApp is active.",
  },
];

interface CustomStep {
  id: string;
  name: string;
  roleType: string;
  specificDoctor?: string;
  isApprover?: boolean;
}

export default function AppointmentWorkflowPage() {
  // Expanded step in the main readiness flow (defaults to step 1)
  const [openStepId, setOpenStepId] = useState<number | null>(1);

  // Consent settings / Doctor workflow state (from Image 1)
  const [consentDoctorOpen, setConsentDoctorOpen] = useState(true);
  const [targetName, setTargetName] = useState("yash patel");
  const [customSteps, setCustomSteps] = useState<CustomStep[]>([
    { id: "1", name: "Front desk", roleType: "Front desk" },
    { id: "2", name: "Workup", roleType: "Booked doctor" },
    {
      id: "3",
      name: "hi",
      roleType: "Specific doctor...",
      specificDoctor: "Select doctor...",
      isApprover: true,
    },
  ]);
  const [workflowSaved, setWorkflowSaved] = useState(false);

  const toggleStep = (id: number) => {
    setOpenStepId(openStepId === id ? null : id);
  };

  const handleAddCustomStep = () => {
    const nextNum = customSteps.length + 1;
    setCustomSteps([
      ...customSteps,
      {
        id: Date.now().toString(),
        name: `Step ${nextNum}`,
        roleType: "Booked doctor",
      },
    ]);
  };

  const handleRemoveCustomStep = (id: string) => {
    setCustomSteps(customSteps.filter((s) => s.id !== id));
  };

  const handleSaveWorkflow = () => {
    setWorkflowSaved(true);
    setTimeout(() => setWorkflowSaved(false), 3000);
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

      {/* Main Title */}
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl dark:text-zinc-100">
        Appointment Workflow
      </h1>

      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* CLINIC READINESS CARD (MATCHING USER SCREENSHOTS)                         */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-[#e2e8f0]/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[#0f172a] dark:text-zinc-100">
              Clinic Readiness
            </h2>
            <span className="text-sm font-bold text-[#4f46e5]">
              4 / 5 steps configured
            </span>
          </div>

          {/* Readiness Progress Bar */}
          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-[#f1f5f9] dark:bg-zinc-800">
            <div className="h-full w-[80%] rounded-full bg-[#6366f1] transition-all duration-300" />
          </div>

          <p className="mt-2.5 text-xs text-[#94a3b8]">
            Expand any step below to configure it.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CONNECTED WORKFLOW STEPS (STEP 4 LAB/DIAGNOSTICS EXCLUDED)                */}
        {/* ========================================================================= */}
        <div className="space-y-0">
          {INITIAL_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isOpen = openStepId === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Connecting Arrow between steps */}
                {idx > 0 && (
                  <div className="flex justify-center py-1.5">
                    <span className="select-none text-xs text-[#cbd5e1] dark:text-zinc-600">
                      ↓
                    </span>
                  </div>
                )}

                {/* Step Card */}
                <div
                  onClick={() => toggleStep(step.id)}
                  className={`cursor-pointer overflow-hidden rounded-2xl bg-white transition-all shadow-xs dark:bg-zinc-900 ${
                    isOpen
                      ? "border-2 border-blue-600 ring-2 ring-blue-500/10 dark:border-blue-500"
                      : "border border-[#e2e8f0]/90 hover:border-[#cbd5e1] dark:border-zinc-800"
                  } p-5`}
                >
                  {/* Step Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      {/* Step Icon with Number Badge */}
                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconColor}`}
                      >
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4f46e5] text-[10px] font-bold text-white shadow-xs">
                          {step.number}
                        </span>
                        <Icon className="h-5 w-5 stroke-[1.8]" />
                      </div>

                      {/* Title, Badges & Subtitle */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-base font-bold text-[#0f172a] dark:text-zinc-100">
                            {step.title}
                          </span>

                          {step.badge.type === "configured" && (
                            <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                              Configured
                            </span>
                          )}

                          {step.badge.type === "needs-setup" && (
                            <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-bold text-[#b45309]">
                              Needs Setup
                            </span>
                          )}

                          {step.badge.type === "optional" && (
                            <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#64748b]">
                              Optional
                            </span>
                          )}

                          {step.secondaryBadge && (
                            <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#94a3b8]">
                              {step.secondaryBadge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#64748b] dark:text-zinc-400">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right Arrow / Lock */}
                    <div className="flex items-center gap-2 text-[#94a3b8]">
                      {step.isLocked && <Lock className="h-4 w-4 text-[#cbd5e1]" />}
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content (when open) */}
                  {isOpen && (
                    <div className="mt-4 border-t border-[#f1f5f9] pt-3.5 text-xs dark:border-zinc-800">
                      <p className="italic text-[#64748b] dark:text-zinc-400">
                        {step.italicSummary}
                      </p>
                      <p className="mt-2.5 leading-relaxed text-[#334155] dark:text-zinc-300">
                        {step.description}
                      </p>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* DOCTOR CONSENT & WORKFLOW BUILDER (FROM USER SCREENSHOT 1)                */}
        {/* ========================================================================= */}
        <div className="mt-10 pt-6 border-t border-[#e2e8f0]/80">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-[#0f172a] dark:text-zinc-100">
                Consent Settings
              </h2>
              <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-bold text-[#64748b]">
                PER DOCTOR
              </span>
            </div>
            <p className="mt-1 text-xs text-[#94a3b8]">
              Configure consent requirements per doctor. Each doctor saves independently. This does not affect the workflow settings above.
            </p>
          </div>

          {/* Doctor Row */}
          <div className="rounded-2xl border border-[#e2e8f0]/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <button
              type="button"
              onClick={() => setConsentDoctorOpen(!consentDoctorOpen)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-[#0f172a] dark:text-zinc-100">
                    Dr. Deep Arvindbhai Patel
                  </h3>
                  <p className="text-xs text-[#94a3b8]">Consent not required</p>
                </div>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-[#94a3b8] transition-transform ${
                  consentDoctorOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Expanded Appointment Workflow Box (Screenshot 1) */}
            {consentDoctorOpen && (
              <div className="p-6 pt-2 border-t border-[#f1f5f9] dark:border-zinc-800">
                <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="font-heading text-base font-bold text-[#0f172a] dark:text-zinc-100">
                    Appointment workflow
                  </h4>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Describe who does what, in order. The last step is the approver — drafts route to them, and approving closes the visit.
                  </p>

                  {/* Target input row */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-[#64748b]">For an</span>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="rounded-xl border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-bold text-[#0f172a] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Step rows */}
                  <div className="mt-4 space-y-2.5">
                    {customSteps.map((s, idx) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#f1f5f9] bg-[#f8fafc] p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/40"
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <span className="text-xs font-bold text-[#94a3b8] w-4">
                            {idx + 1}
                          </span>

                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => {
                              const updated = [...customSteps];
                              updated[idx].name = e.target.value;
                              setCustomSteps(updated);
                            }}
                            className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs text-[#0f172a] font-medium flex-1 max-w-xs focus:outline-none focus:border-blue-500"
                          />

                          {/* Role Select / Label */}
                          {idx === 0 ? (
                            <span className="text-xs text-[#64748b] px-2 font-medium">
                              Front desk
                            </span>
                          ) : idx === 1 ? (
                            <div className="relative">
                              <select
                                value={s.roleType}
                                onChange={(e) => {
                                  const updated = [...customSteps];
                                  updated[idx].roleType = e.target.value;
                                  setCustomSteps(updated);
                                }}
                                className="appearance-none rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 pr-7 text-xs text-[#0f172a] font-medium cursor-pointer"
                              >
                                <option value="Booked doctor">Booked doctor</option>
                                <option value="Specific doctor...">Specific doctor...</option>
                                <option value="Front desk">Front desk</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[#94a3b8]" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="relative">
                                <select
                                  value={s.roleType}
                                  onChange={(e) => {
                                    const updated = [...customSteps];
                                    updated[idx].roleType = e.target.value;
                                    setCustomSteps(updated);
                                  }}
                                  className="appearance-none rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 pr-7 text-xs text-[#0f172a] font-medium cursor-pointer"
                                >
                                  <option value="Specific doctor...">Specific doctor...</option>
                                  <option value="Booked doctor">Booked doctor</option>
                                  <option value="Front desk">Front desk</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[#94a3b8]" />
                              </div>

                              <div className="relative">
                                <select
                                  value={s.specificDoctor || "Select doctor..."}
                                  onChange={(e) => {
                                    const updated = [...customSteps];
                                    updated[idx].specificDoctor = e.target.value;
                                    setCustomSteps(updated);
                                  }}
                                  className="appearance-none rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 pr-7 text-xs text-[#0f172a] font-medium cursor-pointer"
                                >
                                  <option value="Select doctor...">Select doctor...</option>
                                  <option value="Dr. Deep Arvindbhai Patel">Dr. Deep Patel</option>
                                  <option value="Dr. Sankar">Dr. Sankar</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-[#94a3b8]" />
                              </div>

                              <span className="font-bold text-[11px] text-emerald-600">
                                approves &amp; closes
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Delete Step */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomStep(s.id)}
                          className="text-[#94a3b8] hover:text-rose-600 transition-colors p-1"
                          title="Remove step"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions: Add a step & Save workflow */}
                  <div className="mt-5 flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleAddCustomStep}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#4f46e5] hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>add a step</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveWorkflow}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f5132] hover:bg-[#0b3d25] px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors"
                    >
                      {workflowSaved ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span>Save workflow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
