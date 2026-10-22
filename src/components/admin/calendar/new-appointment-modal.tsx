import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  X,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialDate?: string;
}

export function NewAppointmentModal({
  isOpen,
  onClose,
  onCreated,
  initialDate,
}: NewAppointmentModalProps) {
  const [bookingType, setBookingType] = useState<"NEW_CONSULTATION" | "EXISTING_PATIENT" | "NEW_PATIENT">("NEW_CONSULTATION");

  // Patient search state for existing patients
  const [patientSearch, setPatientSearch] = useState("");
  const [patientList, setPatientList] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Form Fields
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [patientType, setPatientType] = useState<"ADULT" | "CHILD">("ADULT");
  const [childName, setChildName] = useState("");
  const [treatment, setTreatment] = useState("Root Canal Treatment");
  const [dentist, setDentist] = useState("Dr. Sankar (Chief Dental Surgeon)");
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("10:00:00");
  const [duration, setDuration] = useState(30);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [totalSessions, setTotalSessions] = useState(1);
  const [source, setSource] = useState("ADMIN");
  const [totalAmount, setTotalAmount] = useState<number>(1500);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search existing patients when typing
  useEffect(() => {
    if (bookingType === "EXISTING_PATIENT" && patientSearch.trim().length >= 2) {
      const fetchPatients = async () => {
        try {
          const res = await fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}`);
          const data = await res.json();
          if (data.success && data.patients) {
            setPatientList(data.patients);
          }
        } catch {
          // ignore
        }
      };
      fetchPatients();
    } else {
      setPatientList([]);
    }
  }, [bookingType, patientSearch]);

  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p);
    setPatientName(p.name || `${p.firstName} ${p.lastName}`);
    setPhone(p.phone || "");
    setEmail(p.email || "");
    setPatientSearch("");
  };

  const handleTreatmentChange = (trt: string) => {
    setTreatment(trt);
    switch (trt) {
      case "Root Canal Treatment":
        setTotalSessions(3);
        setDuration(45);
        setTotalAmount(6500);
        break;
      case "Crown & Bridge":
        setTotalSessions(2);
        setDuration(45);
        setTotalAmount(8500);
        break;
      case "Teeth Cleaning & Scaling":
        setTotalSessions(1);
        setDuration(30);
        setTotalAmount(1500);
        break;
      case "Orthodontics / Braces":
        setTotalSessions(6);
        setDuration(30);
        setTotalAmount(35000);
        break;
      case "Dental Extraction":
        setTotalSessions(1);
        setDuration(30);
        setTotalAmount(1200);
        break;
      default:
        setTotalSessions(1);
        setDuration(30);
        setTotalAmount(500);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        fullName: patientName,
        phone,
        email: email || undefined,
        patientType,
        childName: patientType === "CHILD" ? childName : undefined,
        treatment,
        serviceName: treatment,
        preferredDoctor: dentist,
        appointmentDate: date,
        appointmentTime: time,
        durationMinutes: Number(duration) || 30,
        sessionNumber: Number(sessionNumber) || 1,
        totalSessions: Number(totalSessions) || 1,
        source,
        totalAmount: Number(totalAmount) || 0,
        notes,
        patientId: selectedPatient?.id,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create appointment");
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while booking");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text">
                Schedule New Appointment
              </h3>
              <p className="text-xs text-brand-muted">
                Create clinical booking with conflict detection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Booking Type Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
          {[
            { id: "NEW_CONSULTATION", label: "Consultation" },
            { id: "EXISTING_PATIENT", label: "Existing Patient" },
            { id: "NEW_PATIENT", label: "New Patient" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setBookingType(item.id as any);
                if (item.id === "NEW_CONSULTATION") {
                  handleTreatmentChange("General Dental Consultation");
                }
              }}
              className={`py-1.5 rounded-md transition-all ${
                bookingType === item.id
                  ? "bg-white text-brand-primary shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Existing Patient Search Section */}
        {bookingType === "EXISTING_PATIENT" && (
          <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3.5 space-y-2">
            <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider block">
              Search Patient Directory
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-muted" />
              <Input
                placeholder="Search by patient name, phone, or ID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-8 text-xs h-9 bg-white"
              />
            </div>

            {selectedPatient && (
              <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-brand-primary/30 text-xs">
                <div>
                  <span className="font-bold text-brand-text">
                    {selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`}
                  </span>
                  <span className="text-brand-muted block text-[11px]">
                    Phone: {selectedPatient.phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {patientList.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y">
                {patientList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className="p-2.5 text-xs hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-brand-text">{p.name || `${p.firstName} ${p.lastName}`}</div>
                      <div className="text-[11px] text-brand-muted">{p.phone}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Patient Name *</label>
              <Input
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Rahul Patel"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Mobile Phone *</label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9847012345"
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Patient Type</label>
              <select
                value={patientType}
                onChange={(e) => setPatientType(e.target.value as any)}
                className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="ADULT">Adult</option>
                <option value="CHILD">Child / Minor</option>
              </select>
            </div>
          </div>

          {patientType === "CHILD" && (
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Child Patient Name</label>
              <Input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Name of child"
                className="text-xs h-9"
              />
            </div>
          )}

          {/* Clinical Service & Doctor Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Treatment / Service *</label>
              <select
                value={treatment}
                onChange={(e) => handleTreatmentChange(e.target.value)}
                className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
              >
                <option value="General Dental Consultation">Consultation & Oral Examination</option>
                <option value="Root Canal Treatment">Root Canal Treatment (Multi-Session)</option>
                <option value="Crown & Bridge">Crown & Bridge (2 Sessions)</option>
                <option value="Teeth Cleaning & Scaling">Teeth Cleaning & Prophylaxis</option>
                <option value="Orthodontics / Braces">Orthodontic Adjustment / Braces</option>
                <option value="Dental Extraction">Dental Extraction</option>
                <option value="Composite Tooth Filling">Tooth Colored Restoration / Filling</option>
                <option value="Dental Implant">Dental Implant Consultation & Placement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Attending Dentist *</label>
              <select
                value={dentist}
                onChange={(e) => setDentist(e.target.value)}
                className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="Dr. Sankar (Chief Dental Surgeon)">Dr. Sankar (Chief Dental Surgeon)</option>
                <option value="Dr. Vidhyamol (Pediatric & Ortho Specialist)">Dr. Vidhyamol (Pediatric & Ortho)</option>
                <option value="Dr. A. Mehta (Periodontist)">Dr. A. Mehta (Periodontist)</option>
              </select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Date *</label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Start Time *</label>
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Session No.</label>
              <Input
                type="number"
                min="1"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Total Sessions</label>
              <Input
                type="number"
                min="1"
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Est. Amount (₹)</label>
              <Input
                type="number"
                min="0"
                step="50"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Booking Source & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Booking Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-md border border-brand-border bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="ADMIN">Admin / Front Desk</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="PHONE">Phone Inquiry</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="WEBSITE">Website Form</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-brand-text">Clinical / Intake Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Chief complaint or notes..."
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-brand-primary text-white font-bold text-xs"
            >
              {loading ? "Scheduling..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
