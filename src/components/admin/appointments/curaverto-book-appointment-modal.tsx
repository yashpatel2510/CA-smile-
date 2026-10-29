"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  X,
  UserPlus,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Stethoscope,
  Camera,
  CheckCircle2,
  Sparkles,
  Sliders,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  BookingFormConfig,
  defaultBookingFormConfig,
} from "@/data/booking-form-config";
import {
  getTodayDateString,
  isDateToday,
  isDateInPast,
  isSlotInPast,
} from "@/lib/booking-time-utils";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

const SEX_OPTIONS = ["Male", "Female", "Other", "N/A"];

const LEAD_SOURCES = [
  "Not specified",
  "Walk-in",
  "Website Booking",
  "Google Search",
  "Patient Referral",
  "WhatsApp",
  "Social Media (Instagram/Facebook)",
  "Camp / Community Outreach",
  "Other",
];

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  onBookingComplete?: (booking: {
    patientName: string;
    phone: string;
    doctorName: string;
    service: string;
    time: string;
  }) => void;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: string;
}

const DEFAULT_PATIENTS: Patient[] = [
  { id: "p1", name: "Yash Patel", phone: "9664681536", age: "28 yrs" },
  { id: "p2", name: "Ketan Prajapati", phone: "0000000013", age: "44 yrs" },
  { id: "p3", name: "Amit Vora", phone: "0000000014", age: "33 yrs" },
  { id: "p4", name: "Rina Chauhan", phone: "0000000015", age: "39 yrs" },
  { id: "p5", name: "Vipul Joshi", phone: "0000000016", age: "51 yrs" },
];

const DOCTORS = [
  { id: "doc-1", name: "Dr. Deep Patel", specialty: "Clinic Director & Dental Surgeon" },
];

const DEFAULT_SERVICES = [
  { id: "srv-gen-2", name: "Teeth Whitening (In-office)", price: "₹6,000" },
  { id: "srv-doc-1", name: "Dental Consultation", price: "₹300" },
  { id: "srv-doc-9", name: "General Consultation", price: "₹100" },
  { id: "srv-doc-2", name: "Composite Restoration (Class I/II)", price: "₹1,000" },
  { id: "srv-doc-3", name: "GIC Filling", price: "₹600" },
  { id: "srv-doc-4", name: "Simple Extraction", price: "₹600" },
  { id: "srv-doc-5", name: "Root Canal Treatment: Molar", price: "₹6,000" },
  { id: "srv-doc-6", name: "Root Canal Treatment: Anterior", price: "₹4,000" },
  { id: "srv-doc-7", name: "Zirconia Crown", price: "₹9,000" },
  { id: "srv-doc-8", name: "Fluoride Application", price: "₹500" },
];

const MORNING_SLOTS = [
  "09:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "12:00 pm",
  "12:30 pm",
];

const AFTERNOON_SLOTS = [
  "01:30 pm",
  "02:00 pm",
  "02:30 pm",
  "03:00 pm",
  "03:30 pm",
  "04:00 pm",
  "04:30 pm",
];

const EVENING_SLOTS = [
  "05:00 pm",
  "05:30 pm",
  "06:00 pm",
  "06:30 pm",
  "07:00 pm",
  "07:30 pm",
  "08:00 pm",
];

const TIME_SLOTS = MORNING_SLOTS;

export function CuravertoBookAppointmentModal({
  isOpen,
  onClose,
  selectedDate: propDate,
  onBookingComplete,
}: BookAppointmentModalProps) {
  // Modal flow view: 'select-patient' | 'add-patient' | 'book-details' | 'success'
  const [modalView, setModalView] = useState<
    "select-patient" | "add-patient" | "book-details" | "success"
  >("select-patient");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const isCreatingPatientRef = useRef(false);

  // Live Patients List & Selected Patient
  const [patientsList, setPatientsList] = useState<Patient[]>(DEFAULT_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(
    DEFAULT_PATIENTS[0]
  );
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  // Add Patient Form State (Identical to Edit Patient Modal)
  const [activeTab, setActiveTab] = useState<"profile" | "family" | "medical">(
    "profile"
  );
  const [newPatientNumber, setNewPatientNumber] = useState("CA-0016");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newPatientType, setNewPatientType] = useState<"Adult" | "Child">("Adult");
  const [newSex, setNewSex] = useState<"Male" | "Female" | "Other" | "N/A">(
    "Female"
  );
  const [newBloodGroup, setNewBloodGroup] = useState<string>("B+");
  const [newLeadSource, setNewLeadSource] = useState("Website Booking");
  const [isAddressExpanded, setIsAddressExpanded] = useState(true);
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newLocality, setNewLocality] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newCity, setNewCity] = useState("Bilimora");
  const [newState, setNewState] = useState("Gujarat");

  // Family Tab
  const [newFamilyMembers, setNewFamilyMembers] = useState<
    { name: string; relation: string; phone: string }[]
  >([]);
  const [addFamName, setAddFamName] = useState("");
  const [addFamRelation, setAddFamRelation] = useState("Spouse");
  const [addFamPhone, setAddFamPhone] = useState("");

  // Medical Tab
  const [newAllergies, setNewAllergies] = useState("");
  const [newMedicalConditions, setNewMedicalConditions] = useState("");
  const [addPatientError, setAddPatientError] = useState("");
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  const handleAddFamilyMember = () => {
    if (!addFamName.trim()) return;
    setNewFamilyMembers((prev) => [
      ...prev,
      {
        name: addFamName.trim(),
        relation: addFamRelation,
        phone: addFamPhone.trim(),
      },
    ]);
    setAddFamName("");
    setAddFamPhone("");
  };

  const handleRemoveFamilyMember = (idx: number) => {
    setNewFamilyMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  // Book Details State (Images 4 & 5)
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: string;
    name: string;
    specialty: string;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<{
    id: string;
    name: string;
    price: string;
  } | null>(null);
  const todayIso = getTodayDateString();
  const [selectedDayIso, setSelectedDayIso] = useState<string>(() => {
    if (propDate && !isDateInPast(propDate)) return propDate;
    return getTodayDateString();
  });

  // Keep selectedDayIso in sync when propDate changes
  useEffect(() => {
    if (propDate && !isDateInPast(propDate)) {
      setSelectedDayIso(propDate);
    }
  }, [propDate]);

  // Generate 7 upcoming day options dynamically starting from today
  const upcomingDays = useMemo(() => {
    const days: Array<{ label: string; day: string; isoDate: string; fullDisplay: string }> = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = i === 0 ? "Today" : dayNames[d.getDay()];
      const day = String(d.getDate());
      const fullDisplay = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
      days.push({ label, day, isoDate: iso, fullDisplay });
    }
    return days;
  }, []);

  const currentSelectedDay = upcomingDays.find((d) => d.isoDate === selectedDayIso) || {
    label: selectedDayIso,
    day: selectedDayIso.split("-")[2] || "",
    isoDate: selectedDayIso,
    fullDisplay: selectedDayIso,
  };

  const [timeTab, setTimeTab] = useState<"morning" | "afternoon" | "evening">("morning");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Compute available slots per segment for the selected date
  const morningAvailable = useMemo(
    () => MORNING_SLOTS.filter((s) => !isSlotInPast(s, selectedDayIso)),
    [selectedDayIso]
  );
  const afternoonAvailable = useMemo(
    () => AFTERNOON_SLOTS.filter((s) => !isSlotInPast(s, selectedDayIso)),
    [selectedDayIso]
  );
  const eveningAvailable = useMemo(
    () => EVENING_SLOTS.filter((s) => !isSlotInPast(s, selectedDayIso)),
    [selectedDayIso]
  );

  const isMorningPassed = isDateToday(selectedDayIso) && morningAvailable.length === 0;
  const isAfternoonPassed = isDateToday(selectedDayIso) && afternoonAvailable.length === 0;
  const isEveningPassed = isDateToday(selectedDayIso) && eveningAvailable.length === 0;

  // Auto-switch timeTab if current timeTab has passed for the selected day
  useEffect(() => {
    if (timeTab === "morning" && isMorningPassed) {
      if (!isAfternoonPassed) {
        setTimeTab("afternoon");
      } else if (!isEveningPassed) {
        setTimeTab("evening");
      }
    } else if (timeTab === "afternoon" && isAfternoonPassed) {
      if (!isEveningPassed) {
        setTimeTab("evening");
      }
    }
  }, [selectedDayIso, timeTab, isMorningPassed, isAfternoonPassed, isEveningPassed]);

  // If current selectedTimeSlot is in past for selected day, deselect it
  useEffect(() => {
    if (selectedTimeSlot && isSlotInPast(selectedTimeSlot, selectedDayIso)) {
      setSelectedTimeSlot(null);
    }
  }, [selectedDayIso, selectedTimeSlot]);

  // Dynamic Booking Form Configuration state
  const [formConfig, setFormConfig] = useState<BookingFormConfig>(
    defaultBookingFormConfig
  );
  const [formValues, setFormValues] = useState<Record<string, any>>({
    fullName: "",
    mobileNumber: "",
    email: "",
    treatment: "",
    notes: "",
    consentAgreed: true,
    gender: "Male",
    dateOfBirth: "",
    bloodGroup: "Unknown",
    address: "",
  });

  const [availableDoctors, setAvailableDoctors] = useState(DOCTORS);
  const [availableServices, setAvailableServices] = useState(DEFAULT_SERVICES);

  // Appointment Box Styling (Standard | Rescheduled [Dark Blue] | Follow-Up [Purple])
  const [appointmentBoxStyle, setAppointmentBoxStyle] = useState<
    "STANDARD" | "RESCHEDULED" | "FOLLOW_UP"
  >("STANDARD");

  // Fetch live configuration, doctors, and services from API
  useEffect(() => {
    if (!isOpen) return;
    setModalView("select-patient");
    setPatientSearchQuery("");
    setAppointmentBoxStyle("STANDARD");

    // Fetch live patients from /api/patients
    fetch("/api/patients")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.patients) && data.patients.length > 0) {
          const mapped: Patient[] = data.patients.map((p: any) => ({
            id: p.id,
            name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
            phone: p.phone || "",
            age: p.age ? `${p.age} yrs` : p.patientCode || "",
          }));
          setPatientsList(mapped);
          if (mapped.length > 0) {
            setSelectedPatient(mapped[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch live patients:", err);
      });

    fetch("/api/booking-form/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.config) {
          setFormConfig(data.config);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch live booking form config, using fallback:", err);
      });

    fetch("/api/admin/setup/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setAvailableDoctors(
            data.data.map((d: any) => ({
              id: d.id,
              name: d.name,
              specialty: d.specialty || d.department || "Dental Surgeon",
            }))
          );
        }
      })
      .catch(() => {});

    fetch("/api/admin/setup/services")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setAvailableServices(
            data.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              price: s.price != null ? `₹${Number(s.price).toLocaleString("en-IN")}` : "",
            }))
          );
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  if (!isOpen) return null;

  // Filtered patients for search from live list
  const filteredPatients = patientsList.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      p.phone.includes(patientSearchQuery) ||
      (p.age && p.age.toLowerCase().includes(patientSearchQuery.toLowerCase()))
  );

  // Filtered doctors for search
  const filteredDoctors = availableDoctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalView("book-details");
  };

  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingPatientRef.current || isCreatingPatient) return;

    if (!newFullName.trim()) {
      setAddPatientError("Patient name is mandatory.");
      return;
    }

    const cleanPhone = newPhone.replace(/\D/g, "");
    if (!cleanPhone) {
      setAddPatientError("Contact number is mandatory.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setAddPatientError("Contact number must be exactly 10 numeric digits.");
      return;
    }

    isCreatingPatientRef.current = true;
    setIsCreatingPatient(true);
    setAddPatientError("");

    const patientName = newFullName.trim();
    const patientPhone = cleanPhone;
    let computedAge = newPatientType === "Child" ? "Child" : "Adult";
    if (newDob) {
      const birth = new Date(newDob);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      computedAge = newPatientType === "Child" ? "Child" : `${age} yrs`;
    }

    const patientId = newPatientNumber.trim()
      ? `#${newPatientNumber.trim().replace("#", "")}`
      : `#CA-${Date.now().toString().slice(-4)}`;

    const created: Patient = {
      id: patientId,
      name: patientName,
      phone: patientPhone,
      age: computedAge,
    };

    try {
      const pRes = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: patientName,
          phone: patientPhone,
          dateOfBirth: newDob || null,
          patientType: newPatientType,
          sex: newSex,
          gender: newSex,
          bloodGroup: newBloodGroup,
          leadSource: newLeadSource,
          addressLine: newAddressLine.trim(),
          locality: newLocality.trim(),
          pin: newPin.trim(),
          city: newCity.trim(),
          state: newState.trim(),
          patientCode: newPatientNumber,
          allergies: newAllergies,
          medicalConditions: newMedicalConditions,
          familyMembers: newFamilyMembers,
        }),
      });
      const pData = await pRes.json().catch(() => null);
      if (pData?.patient?.id) {
        created.id = pData.patient.id;
      }
    } catch {
      // Continue anyway
    } finally {
      isCreatingPatientRef.current = false;
      setIsCreatingPatient(false);
    }

    setPatientsList((prev) => [created, ...prev]);
    setSelectedPatient(created);
    setModalView("book-details");
  };

  const handleConfirmBooking = async () => {
    // Guard against multiple concurrent or rapid clicks
    if (isSubmittingRef.current || isSubmitting) return;
    if (!selectedDoctor || !selectedService || !selectedTimeSlot) return;

    if (isDateInPast(selectedDayIso)) {
      alert("Cannot book an appointment for a past date.");
      return;
    }
    if (isSlotInPast(selectedTimeSlot, selectedDayIso)) {
      alert("The selected time slot has already passed for today. Please choose an upcoming slot.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Build start date ISO using selectedDayIso
      const dateStr = selectedDayIso;
      const [timePart, ampm] = selectedTimeSlot.trim().split(" ");
      const [hStr, mStr] = (timePart || "10:00").split(":");
      let hours = parseInt(hStr, 10) || 10;
      const minutes = parseInt(mStr, 10) || 0;
      if (ampm?.toLowerCase() === "pm" && hours < 12) hours += 12;
      if (ampm?.toLowerCase() === "am" && hours === 12) hours = 0;

      const dateObj = new Date(`${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
      const startTimeIso = !isNaN(dateObj.getTime())
        ? dateObj.toISOString()
        : new Date().toISOString();

      const isRescheduled = appointmentBoxStyle === "RESCHEDULED";
      const isFollowUp = appointmentBoxStyle === "FOLLOW_UP";
      const statusVal = isRescheduled ? "RESCHEDULED" : isFollowUp ? "FOLLOW_UP" : "CONFIRMED";
      const notesPrefix = isRescheduled ? "[Rescheduled] " : isFollowUp ? "[Follow-Up] " : "";
      const finalNotes = `${notesPrefix}${formValues.notes || ""}`.trim();

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId:
            selectedPatient.id &&
            !selectedPatient.id.startsWith("p") &&
            !selectedPatient.id.startsWith("#")
              ? selectedPatient.id
              : undefined,
          fullName: selectedPatient.name,
          phone: selectedPatient.phone || "0000000000",
          preferredDoctor: selectedDoctor.name,
          serviceName: selectedService.name,
          treatment: selectedService.name,
          preferredDate: dateStr,
          startTime: startTimeIso,
          source: "ADMIN",
          status: statusVal,
          isRescheduled,
          isFollowUp,
          notes: finalNotes,
          consentAgreed: true,
        }),
      });

      const resData = await res.json().catch(() => null);
      if (!res.ok || resData?.success === false) {
        alert(resData?.message || resData?.error || "Failed to book appointment. Please verify the date and time.");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Booking API error:", err);
      alert("Booking error. Please try again.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (onBookingComplete) {
      onBookingComplete({
        patientName: selectedPatient.name,
        phone: selectedPatient.phone,
        doctorName: selectedDoctor.name,
        service: selectedService.name,
        time: selectedTimeSlot,
        boxStyle: appointmentBoxStyle,
      } as any);
    }
    setModalView("success");
    setTimeout(() => {
      onClose();
      // Reset view and guards for next open
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setModalView("select-patient");
      setSelectedDoctor(null);
      setSelectedService(null);
      setSelectedTimeSlot(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* =================================================================== */}
      {/* VIEW 1: STEP 1: SELECT A PATIENT (IMAGE 1)                         */}
      {/* =================================================================== */}
      {modalView === "select-patient" && (
        <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-7 sm:p-8 shadow-2xl transition-all border border-slate-100">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Book Appointment
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Step 1: Select a patient
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Patient Input */}
          <div className="mt-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-indigo-400" />
              </div>
              <input
                type="text"
                autoFocus
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                placeholder="Search by name or phone..."
                className="w-full rounded-2xl border-2 border-indigo-500 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Patient Search Results Dropdown List (when user searches) */}
          {patientSearchQuery.trim() !== "" && (
            <div className="mt-2.5 max-h-52 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="flex w-full items-center justify-between p-3 text-left rounded-xl hover:bg-indigo-50/60 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {patient.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {patient.phone} · {patient.age}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">
                      Select →
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No patient found. Click below to create one.
                </div>
              )}
            </div>
          )}

          {/* Create New Patient Record Button */}
          <div className="mt-3.5">
            <button
              type="button"
              onClick={() => {
                if (patientSearchQuery.trim()) {
                  if (/^\d+$/.test(patientSearchQuery.trim())) {
                    setNewPhone(patientSearchQuery.trim());
                  } else {
                    setNewFullName(patientSearchQuery.trim());
                  }
                }
                setActiveTab("profile");
                setAddPatientError("");
                setModalView("add-patient");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 py-3.5 px-4 text-center text-sm font-medium text-slate-600 hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 transition-all"
            >
              <UserPlus className="h-4 w-4 text-indigo-400" />
              <span>Create a new patient record</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: ADD PATIENT FORM MODAL (IDENTICAL UI TO EDIT PATIENT MODAL) */}
      {/* =================================================================== */}
      {modalView === "add-patient" && (
        <div className="relative max-h-[92vh] w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col my-8">
          {/* 1. Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-blue-200 text-blue-600 bg-blue-50/60 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  Add Patient
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {newFullName || "Enter patient demographic details"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalView("select-patient")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Tabs: Profile, Family, Medical */}
          <div className="flex items-center gap-6 px-6 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`inline-flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-all relative ${
                activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("family")}
              className={`inline-flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-all relative ${
                activeTab === "family"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Family</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("medical")}
              className={`inline-flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-all relative ${
                activeTab === "medical"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Medical</span>
            </button>
          </div>

          {/* 3. Form Content */}
          <form
            onSubmit={handleCreatePatientSubmit}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          >
            {addPatientError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
                {addPatientError}
              </div>
            )}

            {/* TAB A: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                {/* PATIENT # */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    PATIENT #
                  </label>
                  <input
                    type="text"
                    value={newPatientNumber}
                    onChange={(e) => setNewPatientNumber(e.target.value)}
                    placeholder="CA-0016"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900 tracking-wide focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* FULL NAME & CONTACT NO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      PATIENT NAME <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => {
                        setNewFullName(e.target.value);
                        if (addPatientError) setAddPatientError("");
                      }}
                      placeholder="e.g. Pooja Shah"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      CONTACT NO <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={newPhone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setNewPhone(digitsOnly);
                          if (addPatientError) setAddPatientError("");
                        }}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-9 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                      />
                      <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400 font-medium">
                      Only 10 numeric digits allowed ({newPhone.length}/10)
                    </p>
                  </div>
                </div>

                {/* DATE OF BIRTH & PATIENT TYPE (ADULT / CHILD) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      DATE OF BIRTH
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newDob}
                        onChange={(e) => {
                          setNewDob(e.target.value);
                          if (e.target.value) {
                            const birth = new Date(e.target.value);
                            const now = new Date();
                            let age = now.getFullYear() - birth.getFullYear();
                            const m = now.getMonth() - birth.getMonth();
                            if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
                            if (age < 18) setNewPatientType("Child");
                            else setNewPatientType("Adult");
                          }
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      PATIENT TYPE
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewPatientType("Adult")}
                        className={`flex-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all text-center ${
                          newPatientType === "Adult"
                            ? "bg-[#2563eb] text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        Adult
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPatientType("Child")}
                        className={`flex-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all text-center ${
                          newPatientType === "Child"
                            ? "bg-[#2563eb] text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        Child
                      </button>
                    </div>
                  </div>
                </div>

                {/* SEX */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    SEX
                  </label>
                  <div className="flex items-center gap-1.5">
                    {SEX_OPTIONS.map((opt) => {
                      const isSelected = newSex.toLowerCase() === opt.toLowerCase();
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setNewSex(opt as any)}
                          className={`flex-1 rounded-2xl px-3 py-2 text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-[#2563eb] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BLOOD GROUP */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    BLOOD GROUP
                  </label>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-5 gap-2">
                      {BLOOD_GROUPS.slice(0, 5).map((bg) => {
                        const isSelected = newBloodGroup === bg;
                        return (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setNewBloodGroup(bg)}
                            className={`rounded-2xl py-2 text-xs font-bold transition-all text-center ${
                              isSelected
                                ? "bg-[#dc2626] text-white shadow-xs"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {bg}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.slice(5).map((bg) => {
                        const isSelected = newBloodGroup === bg;
                        return (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setNewBloodGroup(bg)}
                            className={`rounded-2xl py-2 text-xs font-bold transition-all text-center ${
                              isSelected
                                ? "bg-[#dc2626] text-white shadow-xs"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {bg}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lead Source */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <div className="relative">
                    <select
                      value={newLeadSource}
                      onChange={(e) => setNewLeadSource(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    >
                      {LEAD_SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* ADDRESS COLLAPSIBLE SECTION */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      ADDRESS
                    </span>
                    {isAddressExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {isAddressExpanded && (
                    <div className="p-4 pt-1 space-y-3 border-t border-slate-100">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          ADDRESS LINE
                        </label>
                        <input
                          type="text"
                          value={newAddressLine}
                          onChange={(e) => setNewAddressLine(e.target.value)}
                          placeholder="Flat / House no., Street"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          LOCALITY / AREA
                        </label>
                        <input
                          type="text"
                          value={newLocality}
                          onChange={(e) => setNewLocality(e.target.value)}
                          placeholder="Locality, Colony, Area"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            PIN
                          </label>
                          <input
                            type="text"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            placeholder="6-digit"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            CITY
                          </label>
                          <input
                            type="text"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="City"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            STATE
                          </label>
                          <input
                            type="text"
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            placeholder="State"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB B: FAMILY */}
            {activeTab === "family" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Link family members or add emergency contact numbers for this patient.
                </p>

                {newFamilyMembers.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    {newFamilyMembers.map((fm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{fm.name}</span>
                          <span className="text-slate-400 ml-2">({fm.relation})</span>
                          {fm.phone && (
                            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                              {fm.phone}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFamilyMember(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    No family members added yet.
                  </div>
                )}

                {/* Add Member Form */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    + Add Family Contact
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={addFamName}
                      onChange={(e) => setAddFamName(e.target.value)}
                      placeholder="Name"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                    />
                    <select
                      value={addFamRelation}
                      onChange={(e) => setAddFamRelation(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      value={addFamPhone}
                      onChange={(e) => setAddFamPhone(e.target.value)}
                      placeholder="Phone"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            )}

            {/* TAB C: MEDICAL */}
            {activeTab === "medical" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Known Allergies
                  </label>
                  <textarea
                    rows={2}
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Latex, Local Anesthetics..."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical Conditions & Dental History
                  </label>
                  <textarea
                    rows={3}
                    value={newMedicalConditions}
                    onChange={(e) => setNewMedicalConditions(e.target.value)}
                    placeholder="e.g. Diabetes, Hypertension, Bleeding disorders, previous RCTs..."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 4. MODAL FOOTER BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalView("select-patient")}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreatingPatient}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-7 py-2.5 text-xs shadow-xs transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCreatingPatient ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Save & Continue to Book →</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 3: BOOK APPOINTMENT MULTI-STEP FLOW (IMAGES 4 & 5)             */}
      {/* =================================================================== */}
      {modalView === "book-details" && (
        <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalView("select-patient")}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Back to patient select"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Book appointment for {selectedPatient.name}
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  {selectedPatient.phone}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* APPOINTMENT BOX STYLING (Standard | Rescheduled [Dark Blue] | Follow-Up [Purple]) */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  APPOINTMENT BOX STYLING:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Click to set box color styling
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Standard */}
                <button
                  type="button"
                  onClick={() => setAppointmentBoxStyle("STANDARD")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    appointmentBoxStyle === "STANDARD"
                      ? "bg-[#334155] text-white shadow-sm ring-2 ring-slate-400"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>Standard</span>
                </button>

                {/* Rescheduled (Dark Blue #1e3a8a) */}
                <button
                  type="button"
                  onClick={() => setAppointmentBoxStyle("RESCHEDULED")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    appointmentBoxStyle === "RESCHEDULED"
                      ? "bg-[#1e3a8a] text-white shadow-md ring-2 ring-blue-500"
                      : "border border-blue-200 bg-blue-50/40 text-blue-900 hover:bg-blue-100/50"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rescheduled</span>
                </button>

                {/* Follow-Up (Purple #7e22ce) */}
                <button
                  type="button"
                  onClick={() => setAppointmentBoxStyle("FOLLOW_UP")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    appointmentBoxStyle === "FOLLOW_UP"
                      ? "bg-[#7e22ce] text-white shadow-md ring-2 ring-purple-500"
                      : "border border-purple-200 bg-purple-50/40 text-purple-900 hover:bg-purple-100/50"
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Follow-Up</span>
                </button>
              </div>

              {appointmentBoxStyle === "RESCHEDULED" && (
                <p className="text-[10px] font-semibold text-blue-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Rescheduled appointment will display in <strong>Dark Blue</strong> box in CA Smile &amp; Appointments.
                </p>
              )}
              {appointmentBoxStyle === "FOLLOW_UP" && (
                <p className="text-[10px] font-semibold text-purple-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                  Follow-up appointment will display in <strong>Purple</strong> box in CA Smile &amp; Appointments.
                </p>
              )}
            </div>
          </div>

          {/* 2-Column Body Layout */}
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: 1. DOCTOR & 2. SERVICE                           */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4">
              {/* STEP 1: CHOOSE A DOCTOR */}
              {!selectedDoctor ? (
                <div className="rounded-2xl border-2 border-emerald-500 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                        1
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        Choose a doctor
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                        Now
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {availableDoctors.length} doctors
                    </span>
                  </div>

                  {/* Search Doctors */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      placeholder={`Search all ${availableDoctors.length} doctors`}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Doctors List */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      DOCTORS
                    </div>
                    {filteredDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoctor(doc)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group"
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-800 group-hover:text-emerald-700">
                            {doc.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {doc.specialty}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                          Select →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Doctor Selected Summary Box (Image 5) */
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Doctor
                      </div>
                      <div className="font-bold text-xs text-slate-900">
                        {selectedDoctor.name} · {selectedDoctor.specialty}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(null);
                      setSelectedService(null);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* STEP 2: SERVICE */}
              {selectedDoctor && !selectedService ? (
                <div className="rounded-2xl border-2 border-emerald-500 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                        2
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        Choose a service
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                        Now
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {availableServices.map((srv) => (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-emerald-500 hover:bg-emerald-50/20 transition-all group"
                      >
                        <div className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">
                          {srv.name}
                        </div>
                        <div className="font-mono text-xs font-bold text-emerald-600">
                          {srv.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedService ? (
                /* Service Selected Summary Box (Image 5) */
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Service
                      </div>
                      <div className="font-bold text-xs text-slate-900">
                        {selectedService.name} · {selectedService.price}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Locked State */
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-500">
                      2
                    </span>
                    <span className="font-medium text-slate-500">Service</span>
                  </div>
                  <span className="text-slate-400">Unlocks after doctor</span>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: 3. DATE & 4. TIME                               */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-4">
              {/* STEP 3: DATE PICKER */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span className="font-bold text-sm text-slate-900">Date</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {currentSelectedDay.fullDisplay}
                  </span>
                </div>

                {/* Date Pills Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
                  {upcomingDays.map((d) => {
                    const isActive = selectedDayIso === d.isoDate;
                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        onClick={() => {
                          setSelectedDayIso(d.isoDate);
                          setSelectedTimeSlot(null);
                        }}
                        className={`flex flex-col items-center justify-center min-w-[50px] rounded-xl py-2 px-2 text-center transition-all ${
                          isActive
                            ? "bg-[#047857] text-white font-bold shadow-2xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-[10px] uppercase">{d.label}</span>
                        <span className="text-sm font-bold">{d.day}</span>
                      </button>
                    );
                  })}
                  <label
                    className="flex h-13 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer relative"
                    title="Pick custom date"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <input
                      type="date"
                      min={todayIso}
                      value={selectedDayIso}
                      onChange={(e) => {
                        if (e.target.value && !isDateInPast(e.target.value)) {
                          setSelectedDayIso(e.target.value);
                          setSelectedTimeSlot(null);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              {/* STEP 4: TIME SLOTS */}
              {selectedService ? (
                /* Unlocked Time Slots */
                <div className="rounded-2xl border-2 border-emerald-500 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                        4
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        Choose a time
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                        Now
                      </span>
                    </div>
                  </div>

                  {/* Time Segmented Tabs: Morning | Afternoon | Evening */}
                  <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 p-1 bg-slate-50/50">
                    <button
                      type="button"
                      disabled={isMorningPassed}
                      onClick={() => setTimeTab("morning")}
                      className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        isMorningPassed
                          ? "text-slate-300 opacity-60 cursor-not-allowed line-through"
                          : timeTab === "morning"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Morning · {isMorningPassed ? "Passed" : `${morningAvailable.length} free`}
                    </button>
                    <button
                      type="button"
                      disabled={isAfternoonPassed}
                      onClick={() => setTimeTab("afternoon")}
                      className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        isAfternoonPassed
                          ? "text-slate-300 opacity-60 cursor-not-allowed line-through"
                          : timeTab === "afternoon"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Afternoon · {isAfternoonPassed ? "Passed" : `${afternoonAvailable.length} free`}
                    </button>
                    <button
                      type="button"
                      disabled={isEveningPassed}
                      onClick={() => setTimeTab("evening")}
                      className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                        isEveningPassed
                          ? "text-slate-300 opacity-60 cursor-not-allowed line-through"
                          : timeTab === "evening"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Evening · {isEveningPassed ? "Passed" : `${eveningAvailable.length} free`}
                    </button>
                  </div>

                  {/* Slot Pills */}
                  {isDateToday(selectedDayIso) && isMorningPassed && isAfternoonPassed && isEveningPassed ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                      <span>All slots for today have ended. Please choose a future date above.</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(timeTab === "morning"
                        ? MORNING_SLOTS
                        : timeTab === "afternoon"
                        ? AFTERNOON_SLOTS
                        : EVENING_SLOTS
                      ).map((slot) => {
                        const isPast = isSlotInPast(slot, selectedDayIso);
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isPast}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isPast
                                ? "border border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed line-through"
                                : isSelected
                                ? "bg-[#2563eb] text-white shadow-2xs scale-102"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/20"
                            }`}
                          >
                            <span>{slot}</span>
                            {isPast && (
                              <span className="text-[9px] no-underline font-normal text-slate-400">
                                Passed
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Locked Time Placeholder (Image 4) */
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs text-center space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
                    <span className="font-bold text-slate-600">4 Time</span>
                    <span>Unlocks after service</span>
                  </div>
                  <div className="flex justify-center text-slate-300">
                    <Clock className="h-8 w-8" />
                  </div>
                  <div className="font-bold text-sm text-slate-700">
                    Pick a doctor, then a service
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Free times depend on the doctor and how long the service
                    takes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Summary Bar & Action Button (Images 4 & 5) */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 p-4 px-6">
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                SO FAR{" "}
              </span>
              <span className="text-slate-700 font-medium">
                {selectedDoctor && selectedService && selectedTimeSlot ? (
                  <>
                    {selectedDoctor.name} · {selectedService.name} {selectedService.price} · {currentSelectedDay.fullDisplay} · {selectedTimeSlot}
                  </>
                ) : selectedDoctor && selectedService ? (
                  <>
                    {selectedDoctor.name} · {selectedService.name} {selectedService.price} · {currentSelectedDay.fullDisplay}
                  </>
                ) : selectedDoctor ? (
                  <>
                    {selectedDoctor.name} · Start with service
                  </>
                ) : (
                  "Nothing picked yet. Start with the doctor."
                )}
              </span>
            </div>

            {/* Action Button: Dynamic based on progress */}
            {!selectedDoctor ? (
              <button
                type="button"
                disabled
                className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
              >
                Select a doctor
              </button>
            ) : !selectedService ? (
              <button
                type="button"
                disabled
                className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
              >
                Select a service
              </button>
            ) : !selectedTimeSlot ? (
              <button
                type="button"
                disabled
                className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
              >
                Select a time
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-2xs transition-all flex items-center gap-2 ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed opacity-80"
                    : "bg-[#2563eb] hover:bg-blue-700 active:scale-95 cursor-pointer"
                }`}
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isSubmitting ? "Booking Appointment..." : "Confirm Booking"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 4: SUCCESS CONFIRMATION                                        */}
      {/* =================================================================== */}
      {modalView === "success" && (
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl space-y-3">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle2 className="h-12 w-12 animate-bounce" />
          </div>
          <h3 className="font-bold text-base text-slate-900">
            Appointment Booked!
          </h3>
          <p className="text-xs text-slate-500">
            Appointment confirmed for {selectedPatient.name} on {currentSelectedDay.fullDisplay} at{" "}
            {selectedTimeSlot}.
          </p>
        </div>
      )}
    </div>
  );
}
