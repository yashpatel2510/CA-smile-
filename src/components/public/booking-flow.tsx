"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trackBookingFunnel } from "@/lib/analytics";

export function BookingFlow() {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<string>("General Practitioner Consultation");
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-18");
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    trackBookingFunnel(1, "view_booking_page");
  }, []);

  const availableServices = [
    { name: "General Practitioner Consultation", duration: "30 min" },
    { name: "Comprehensive Cardiology Panel", duration: "45 min" },
    { name: "Pediatric Wellness & Vaccination", duration: "40 min" },
    { name: "Neurology & Migraine Clinic", duration: "60 min" },
    { name: "Comprehensive Dental Prophylaxis", duration: "45 min" },
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM",
    "01:30 PM", "02:00 PM", "03:00 PM", "04:30 PM"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: selectedService,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          ...formData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to schedule appointment");
      }

      trackBookingFunnel(5, "booking_completed", selectedService, {
        appointmentId: data.appointment?.id,
      });

      setConfirmationNumber(data.appointment?.id || `APT-${Math.floor(100000 + Math.random() * 900000)}`);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Tracker */}
      <div className="grid grid-cols-3 gap-2 border-b border-brand-border pb-4">
        <div className={`text-xs font-semibold pb-1 border-b-2 ${step >= 1 ? "border-brand-primary text-brand-primary" : "border-transparent text-brand-muted"}`}>
          1. Select Service & Time
        </div>
        <div className={`text-xs font-semibold pb-1 border-b-2 ${step >= 2 ? "border-brand-primary text-brand-primary" : "border-transparent text-brand-muted"}`}>
          2. Patient Information
        </div>
        <div className={`text-xs font-semibold pb-1 border-b-2 ${step >= 3 ? "border-brand-primary text-brand-primary" : "border-transparent text-brand-muted"}`}>
          3. Confirmation
        </div>
      </div>

      {/* Step 1: Service & Date Selection */}
      {step === 1 && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose a Clinical Service</CardTitle>
              <CardDescription>Select the care you or your family member requires</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableServices.map((svc) => (
                <div
                  key={svc.name}
                  onClick={() => setSelectedService(svc.name)}
                  className={`cursor-pointer rounded-clinic p-4 border transition-all ${
                    selectedService === svc.name
                      ? "border-brand-primary bg-brand-accent/20 ring-1 ring-brand-primary"
                      : "border-brand-border hover:border-brand-primary/40 bg-brand-surface"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-brand-text">{svc.name}</span>
                    <span className="text-xs text-brand-muted">{svc.duration}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date & Time</CardTitle>
              <CardDescription>Choose an available slot with our attending medical staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-brand-text mb-2 block">Appointment Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text mb-2 block">Available Clinical Slots</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-clinic py-2 px-3 text-xs font-medium border transition-colors ${
                        selectedTime === time
                          ? "bg-brand-primary text-brand-primary-foreground border-brand-primary"
                          : "bg-brand-surface border-brand-border text-brand-text hover:border-brand-primary/40"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                trackBookingFunnel(2, "select_service_and_time", selectedService, {
                  date: selectedDate,
                  time: selectedTime,
                });
                setStep(2);
              }}
              size="md"
              className="font-semibold"
            >
              Continue to Patient Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Patient Form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Demographics</CardTitle>
              <CardDescription>Enter details for the confirmation receipt and clinical chart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="rounded-clinic bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">First Name *</label>
                  <Input
                    required
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">Last Name *</label>
                  <Input
                    required
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">Email Address *</label>
                  <Input
                    required
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-text">Mobile Phone *</label>
                  <Input
                    required
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">Reason for Visit or Clinical Notes</label>
                <textarea
                  rows={3}
                  className="w-full rounded-clinic border border-brand-border bg-brand-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  placeholder="Briefly describe symptoms, previous medications, or questions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="rounded-clinic bg-brand-accent/20 p-4 border border-brand-border/60 text-xs space-y-2">
                <div className="font-semibold text-brand-text">Appointment Summary:</div>
                <div className="grid grid-cols-2 gap-2 text-brand-muted">
                  <div>Service: <strong className="text-brand-text">{selectedService}</strong></div>
                  <div>Date: <strong className="text-brand-text">{selectedDate}</strong></div>
                  <div>Time: <strong className="text-brand-text">{selectedTime}</strong></div>
                  <div>Location: <strong className="text-brand-text">HealthSphere Main Clinic</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary" className="font-semibold">
              {isSubmitting ? "Confirming Appointment..." : "Confirm Appointment"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 3 && (
        <Card className="text-center py-10 px-6 space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <Badge variant="success">Booking Confirmed</Badge>
            <h2 className="text-2xl font-bold font-heading text-brand-text">We look forward to welcoming you!</h2>
            <p className="text-sm text-brand-muted">
              Your appointment has been registered. An email confirmation and calendar invite have been dispatched.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-clinic border border-brand-border bg-brand-accent/10 p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between border-b border-brand-border/60 pb-2">
              <span className="text-brand-muted">Confirmation Ref:</span>
              <span className="font-mono font-bold text-brand-primary">{confirmationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Service:</span>
              <span className="font-semibold text-brand-text">{selectedService}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Date & Time:</span>
              <span className="font-semibold text-brand-text">{selectedDate} at {selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Patient:</span>
              <span className="font-semibold text-brand-text">{formData.firstName} {formData.lastName}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
            <Link href="/admin/appointment">
              <Button variant="primary">View in Admin Portal</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
