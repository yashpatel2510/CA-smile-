"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Tv,
  RefreshCw,
  Copy,
  Check,
  X,
  User,
  Clock,
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  ExternalLink,
  Plus,
  Bell,
  CheckCheck,
  UserCheck,
  Phone,
  Trash2,
} from "lucide-react";

interface WaitingRoomTv {
  id: string;
  name: string;
  shows: string;
  lastSeen: string;
  status: "Active" | "Revoked";
  token: string;
  createdAt: string;
}

interface WaitingPatient {
  id: string;
  token: number;
  name: string;
  phone?: string;
  timeSlot?: string;
  service?: string;
  status?: string;
  source?: string;
  doctor?: string;
  waitingMinutes?: number;
}

export function CuravertoQueueManagerView() {
  const [tvs, setTvs] = useState<WaitingRoomTv[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New TV Form State
  const [tvName, setTvName] = useState("");
  const [tvShows, setTvShows] = useState("The clinic queue");
  const [creatingTv, setCreatingTv] = useState(false);

  // Ready TV Alert Banner
  const [readyTv, setReadyTv] = useState<{ name: string; url: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Revoke & Delete TV States
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingRevoked, setIsClearingRevoked] = useState(false);

  // Live Board Modal State
  const [isLiveBoardOpen, setIsLiveBoardOpen] = useState(false);

  // Walk-In Token Modal State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInService, setWalkInService] = useState("General Consultation");
  const [walkInDoctor, setWalkInDoctor] = useState("Dr. Deep Arvindbhai Patel");
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [issuedWalkInToken, setIssuedWalkInToken] = useState<number | null>(null);

  // Sound Announcements State
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Doctor Queue State
  const [currentToken, setCurrentToken] = useState<number>(1);
  const [currentPatient, setCurrentPatient] = useState("No Patient in Consultation");
  const [currentApptId, setCurrentApptId] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState<string>("Dental Consultation");
  const [seenCount, setSeenCount] = useState(0);
  const [waitingList, setWaitingList] = useState<WaitingPatient[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState("Dr. Deep Arvindbhai Patel");
  const [currentRoom, setCurrentRoom] = useState("ROOM DENTAL CHAIR 1");

  // Web Audio Clinic Chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.18); // A5
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext could be blocked by browser policy until user interacts
    }
  };

  // Speech Announcement
  const announcePatient = (tNum: number, pName: string, room = "Room Dental Chair 1") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Token number ${tNum}. ${pName}. Please proceed to ${room}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  // Broadcast to TV Live Queue Display
  const broadcastLiveQueue = async (payload: {
    token: number;
    patient: string;
    doctor?: string;
    service?: string;
    room?: string;
    status?: "CALLING" | "CONSULTING" | "READY" | "COMPLETED";
    action?: "CALL" | "RECALL" | "FINISH";
    upcoming?: { token: number; name: string }[];
  }) => {
    try {
      await fetch("/api/admin/queue/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to broadcast live queue to TV:", err);
    }
  };

  // Ring Again / Recall Patient
  const handleRecallCurrent = () => {
    if (soundEnabled) {
      playChime();
      setTimeout(() => announcePatient(currentToken, currentPatient), 400);
    }
    broadcastLiveQueue({
      token: currentToken,
      patient: currentPatient,
      doctor: "Dr. CA Smile",
      room: "Consultation Room 1",
      status: "CALLING",
      action: "RECALL",
      upcoming: waitingList.map((w) => ({ token: w.token, name: w.name })),
    });
  };

  // Load Today's Queue from API
  const fetchTodayQueue = async (silent = false) => {
    try {
      const res = await fetch("/api/admin/today");
      const json = await res.json();
      if (json.success && Array.isArray(json.appointments)) {
        const appts = json.appointments;
        const completed = appts.filter(
          (a: any) =>
            a.status === "COMPLETED" || a.status === "DONE" || a.status === "TREATMENT_DONE"
        );
        setSeenCount(completed.length);

        // Find active in treatment or consulting
        const inConsultation = appts.find(
          (a: any) =>
            a.status === "TREATMENT_STARTED" ||
            a.status === "IN_TREATMENT" ||
            a.status === "CONSULTING"
        );

        // All active scheduled / waiting patients for today who are not completed and not in chair
        const waiting = appts.filter(
          (a: any) =>
            (a.status === "CHECKED_IN" ||
              a.status === "WAITING" ||
              a.status === "CONFIRMED" ||
              a.status === "PENDING" ||
              a.status === "BOOKED" ||
              a.status === "SCHEDULED" ||
              a.status === "IN-CLINIC" ||
              (a.status === "TREATMENT_STARTED" && a.id !== inConsultation?.id)) &&
            a.id !== inConsultation?.id &&
            a.status !== "CANCELLED" &&
            a.status !== "NO_SHOW" &&
            a.status !== "DECLINED" &&
            a.status !== "COMPLETED" &&
            a.status !== "TREATMENT_DONE" &&
            a.status !== "DONE"
        );

        // Prioritize physically checked-in / started patients first, then confirmed/booked
        waiting.sort((a: any, b: any) => {
          const isCheckA = a.status === "TREATMENT_STARTED" ? -1 : a.status === "CHECKED_IN" || a.status === "WAITING" || a.status === "IN-CLINIC" ? 0 : 1;
          const isCheckB = b.status === "TREATMENT_STARTED" ? -1 : b.status === "CHECKED_IN" || b.status === "WAITING" || b.status === "IN-CLINIC" ? 0 : 1;
          if (isCheckA !== isCheckB) return isCheckA - isCheckB;
          return (a.tokenNumber || 0) - (b.tokenNumber || 0);
        });

        if (inConsultation) {
          setCurrentToken(inConsultation.tokenNumber || 1);
          setCurrentPatient(inConsultation.patientName || "Patient");
          setCurrentApptId(inConsultation.id);
          setCurrentService(inConsultation.serviceName || inConsultation.reason || "Consultation");
          setCurrentDoctor(inConsultation.doctor || "Dr. Deep Arvindbhai Patel");
        } else if (waiting.length > 0) {
          const first = waiting[0];
          setCurrentToken(first.tokenNumber || 1);
          setCurrentPatient("Dental Chair Ready");
          setCurrentApptId(null);
          setCurrentService(`Next in Queue: ${first.patientName} (${first.serviceName || "Consultation"})`);
          setCurrentDoctor(first.doctor || "Dr. Deep Arvindbhai Patel");
        } else if (completed.length > 0) {
          const lastCompleted = completed[completed.length - 1];
          setCurrentToken(lastCompleted.tokenNumber || completed.length);
          setCurrentPatient("All Consultations Completed");
          setCurrentApptId(null);
          setCurrentService(`${completed.length} patients seen today`);
          setCurrentDoctor("Dr. Deep Arvindbhai Patel");
        } else {
          setCurrentToken(1);
          setCurrentPatient("Dental Chair Ready");
          setCurrentApptId(null);
          setCurrentService("Waiting for patient arrivals");
          setCurrentDoctor("Dr. Deep Arvindbhai Patel");
        }

        const waitItems: WaitingPatient[] = waiting.map((a: any, idx: number) => ({
          id: a.id,
          token: a.tokenNumber || idx + 1,
          name: a.patientName || "Walk-in Patient",
          phone: a.phone,
          timeSlot: a.timeSlot,
          service: a.serviceName || a.reason || "General Consultation",
          status: a.status,
          source: a.source,
          doctor: a.doctor,
          waitingMinutes: a.waitingMinutes,
        }));
        setWaitingList(waitItems);
      }
    } catch (err) {
      if (!silent) console.error("Failed to load today queue:", err);
    }
  };

  // Load TVs
  const fetchTvs = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const [tvsRes] = await Promise.all([
        fetch("/api/admin/setup/waiting-room-tvs"),
        fetchTodayQueue(),
      ]);
      const json = await tvsRes.json();
      if (json.success && Array.isArray(json.data)) {
        setTvs(json.data);
      }
    } catch (err) {
      console.error("Failed to load TVs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and auto-polling every 6 seconds
  useEffect(() => {
    fetchTvs();
    fetchTodayQueue();

    const interval = setInterval(() => {
      fetchTodayQueue(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle Create TV Link
  const handleCreateTvLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tvName.trim()) {
      alert("Please enter a TV name.");
      return;
    }

    setCreatingTv(true);
    try {
      const res = await fetch("/api/admin/setup/waiting-room-tvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tvName.trim(),
          shows: tvShows,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const fullUrl = `${window.location.origin}/tv/${json.data.token}`;
        setReadyTv({
          name: json.data.name,
          url: fullUrl,
        });
        setTvName("");
        if (json.allTvs) {
          setTvs(json.allTvs);
        } else {
          fetchTvs();
        }
      } else {
        alert("Failed to create TV: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error creating TV link:", err);
      alert("Error creating TV link.");
    } finally {
      setCreatingTv(false);
    }
  };

  // Copy TV Link
  const handleCopyLink = () => {
    if (readyTv?.url) {
      navigator.clipboard.writeText(readyTv.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Confirm Revoke TV
  const handleConfirmRevoke = async (id: string) => {
    try {
      const res = await fetch("/api/admin/setup/waiting-room-tvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTvs(json.data);
      }
    } catch (err) {
      console.error("Error revoking TV link:", err);
    } finally {
      setRevokingId(null);
    }
  };

  // Permanently Delete TV Session
  const handleDeleteTv = async (id: string) => {
    try {
      const res = await fetch("/api/admin/setup/waiting-room-tvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTvs(json.data);
      }
    } catch (err) {
      console.error("Error deleting TV session:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all Revoked TV sessions
  const handleClearRevokedTvs = async () => {
    if (!window.confirm("Are you sure you want to permanently remove all revoked TV sessions?")) return;
    setIsClearingRevoked(true);
    try {
      const res = await fetch("/api/admin/setup/waiting-room-tvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_revoked" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTvs(json.data);
      }
    } catch (err) {
      console.error("Error clearing revoked TVs:", err);
    } finally {
      setIsClearingRevoked(false);
    }
  };

  // Check In Patient (Marks patient as physically arrived in reception lounge)
  const handleCheckInPatient = async (item: WaitingPatient) => {
    try {
      await fetch(`/api/appointments/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CHECKED_IN", forceOverride: true }),
      });
      await fetchTodayQueue(true);
    } catch (err) {
      console.error("Error checking in patient:", err);
    }
  };

  // Advance Consultation Token (Calls Next Patient)
  const handleCallNext = async () => {
    if (waitingList.length > 0) {
      const next = waitingList[0];
      if (currentApptId) {
        setSeenCount((prev) => prev + 1);
      }
      setCurrentToken(next.token);
      setCurrentPatient(next.name);
      setCurrentApptId(next.id);
      setCurrentService(next.service || "Consultation");
      setWaitingList((prev) => prev.slice(1));

      if (soundEnabled) {
        playChime();
        setTimeout(() => announcePatient(next.token, next.name), 400);
      }

      broadcastLiveQueue({
        token: next.token,
        patient: next.name,
        doctor: next.doctor || "Dr. CA Smile",
        service: next.service || "Consultation",
        room: "Consultation Room 1",
        status: "CALLING",
        action: "CALL",
        upcoming: waitingList.slice(1).map((w) => ({ token: w.token, name: w.name })),
      });

      // Transition appointment to TREATMENT_STARTED
      try {
        await fetch(`/api/appointments/${next.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_STARTED", forceOverride: true }),
        });
        await fetchTodayQueue(true);
      } catch (err) {
        console.error("Error updating appointment status:", err);
      }
    } else {
      // No more patients waiting in reception
      if (currentApptId) {
        try {
          await fetch(`/api/appointments/${currentApptId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "TREATMENT_DONE", forceOverride: true }),
          });
          setSeenCount((prev) => prev + 1);
        } catch (err) {
          console.error("Error completing current appointment:", err);
        }
      }

      setCurrentPatient("All Consultations Completed");
      setCurrentApptId(null);
      setCurrentService("Waiting room is clear. No waiting patients.");

      broadcastLiveQueue({
        token: currentToken,
        patient: "All Consultations Completed",
        doctor: currentDoctor || "Dr. Deep Arvindbhai Patel",
        service: "Clinic Queue Finished",
        room: currentRoom || "ROOM DENTAL CHAIR 1",
        status: "COMPLETED",
        action: "FINISH",
        upcoming: [],
      });

      await fetchTodayQueue(true);
    }
  };

  // Complete Current Consultation & Call Next
  const handleFinishConsultation = async () => {
    if (currentApptId) {
      try {
        await fetch(`/api/appointments/${currentApptId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_DONE", forceOverride: true }),
        });
        setSeenCount((prev) => prev + 1);
      } catch (err) {
        console.error("Error completing appointment:", err);
      }
    }

    if (waitingList.length > 0) {
      const next = waitingList[0];
      setCurrentToken(next.token);
      setCurrentPatient(next.name);
      setCurrentApptId(next.id);
      setCurrentService(next.service || "Consultation");
      setCurrentDoctor(next.doctor || currentDoctor);
      setWaitingList((prev) => prev.slice(1));

      if (soundEnabled) {
        playChime();
        setTimeout(() => announcePatient(next.token, next.name), 400);
      }

      broadcastLiveQueue({
        token: next.token,
        patient: next.name,
        doctor: next.doctor || currentDoctor || "Dr. Deep Arvindbhai Patel",
        service: next.service || "Consultation",
        room: currentRoom || "Consultation Room 1",
        status: "CALLING",
        action: "CALL",
        upcoming: waitingList.slice(1).map((w) => ({ token: w.token, name: w.name })),
      });

      try {
        await fetch(`/api/appointments/${next.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_STARTED", forceOverride: true }),
        });
      } catch (err) {
        console.error("Error transitioning next appointment:", err);
      }
    } else {
      setCurrentPatient("All Consultations Completed");
      setCurrentApptId(null);
      setCurrentService("Waiting room is clear. All patients completed.");

      broadcastLiveQueue({
        token: currentToken,
        patient: "All Consultations Completed",
        doctor: currentDoctor || "Dr. Deep Arvindbhai Patel",
        service: "Clinic Queue Finished",
        room: currentRoom || "Consultation Room 1",
        status: "COMPLETED",
        action: "FINISH",
        upcoming: [],
      });
    }

    await fetchTodayQueue(true);
  };

  // Call Specific Patient from Waiting List
  const handleCallSpecificPatient = async (item: WaitingPatient) => {
    if (currentApptId) {
      setSeenCount((prev) => prev + 1);
      try {
        await fetch(`/api/appointments/${currentApptId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_DONE", forceOverride: true }),
        });
      } catch {}
    }

    setCurrentToken(item.token);
    setCurrentPatient(item.name);
    setCurrentApptId(item.id);
    setCurrentService(item.service || "Consultation");
    setCurrentDoctor(item.doctor || currentDoctor);
    setWaitingList((prev) => prev.filter((p) => p.id !== item.id));

    if (soundEnabled) {
      playChime();
      setTimeout(() => announcePatient(item.token, item.name), 400);
    }

    broadcastLiveQueue({
      token: item.token,
      patient: item.name,
      doctor: item.doctor || currentDoctor || "Dr. Deep Arvindbhai Patel",
      service: item.service || "Consultation",
      room: currentRoom || "Consultation Room 1",
      status: "CALLING",
      action: "CALL",
      upcoming: waitingList.filter((p) => p.id !== item.id).map((w) => ({ token: w.token, name: w.name })),
    });

    try {
      await fetch(`/api/appointments/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TREATMENT_STARTED", forceOverride: true }),
      });
    } catch (err) {
      console.error("Error calling patient:", err);
    }

    await fetchTodayQueue(true);
  };

  // Issue New Walk-in Token
  const handleIssueWalkInToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    setSubmittingWalkIn(true);
    try {
      const res = await fetch("/api/admin/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: walkInName.trim(),
          phone: walkInPhone.trim() || "+91 98000 00000",
          serviceName: walkInService,
          doctor: walkInDoctor,
          source: "WALK_IN",
          status: "CHECKED_IN",
          notes: "Walk-in registered via Queue Manager",
        }),
      });

      const json = await res.json();
      if (json.success && json.appointment) {
        const newTokenNum = json.appointment.tokenNumber || waitingList.length + currentToken + 1;
        setIssuedWalkInToken(newTokenNum);
        if (soundEnabled) playChime();
        await fetchTodayQueue();
        setTimeout(() => {
          setIsWalkInModalOpen(false);
          setIssuedWalkInToken(null);
          setWalkInName("");
          setWalkInPhone("");
        }, 1600);
      } else {
        alert("Failed to issue walk-in token: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error issuing walk-in token:", err);
      alert("Error issuing walk-in token.");
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. TOP HEADER ROW WITH ACTIONS & SOUND TOGGLE                        */}
      {/* =================================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Live Queue Manager
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYNCED LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              1 chair active • {waitingList.length} patients in waiting lounge • {seenCount} completed today
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs transition-colors ${
              soundEnabled
                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
            title={soundEnabled ? "Audio Bell & Speech: Active" : "Audio Muted"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-blue-600" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>

          {/* Quick Issue Walk-In Token Button */}
          <button
            type="button"
            onClick={() => setIsWalkInModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 text-xs shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Issue Walk-in Token</span>
          </button>

          {/* Live Board Reception Screen */}
          <button
            type="button"
            onClick={() => setIsLiveBoardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-3.5 py-2 text-xs shadow-xs transition-colors"
          >
            <Tv className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Live Board</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => fetchTvs(true)}
            title="Refresh Live Queue"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DOCTOR LIVE QUEUE CARDS                                           */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Main Consultation Room Card */}
        <div className="rounded-2xl border-t-4 border-t-blue-600 border-x border-b border-slate-200/90 bg-white p-5 shadow-xs w-full space-y-3.5">
          {/* Top Title & Token */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {currentDoctor}
              </h3>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 tracking-wider">
                  {currentRoom}
                </span>
                <span className="text-xs text-slate-400">
                  {seenCount} seen today
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {currentApptId ? "TOKEN" : waitingList.length > 0 ? "NEXT" : "STATUS"}
              </span>
              <span className="text-3xl font-black text-blue-600 leading-none font-mono">
                {currentApptId ? `#${currentToken}` : waitingList.length > 0 ? `#${waitingList[0].token}` : "DONE"}
              </span>
            </div>
          </div>

          {/* IN CONSULTATION / CHAIR STATUS Container */}
          <div
            className={`rounded-xl border p-3.5 space-y-2 transition-colors ${
              currentApptId
                ? "border-blue-200 bg-blue-50/30"
                : waitingList.length > 0
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                {currentApptId ? (
                  <span className="inline-flex items-center gap-1.5 text-blue-700 font-extrabold">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                    <User className="w-3.5 h-3.5" />
                    IN CONSULTATION
                  </span>
                ) : waitingList.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    CHAIR READY — WAITING FOR PATIENT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 font-bold">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ALL CONSULTATIONS COMPLETED
                  </span>
                )}
              </div>

              {/* Recall & Call Next actions */}
              <div className="flex items-center gap-2">
                {currentApptId && (
                  <button
                    type="button"
                    onClick={handleRecallCurrent}
                    title="Ring Bell & Announce Token Again"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <Bell className="w-3 h-3" />
                    <span>Recall</span>
                  </button>
                )}

                {waitingList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCallNext}
                    title="Call Next Patient Token"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Next Token →
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="font-extrabold text-slate-900 text-base leading-snug">
                {currentPatient}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {currentService}
              </p>
            </div>

            {/* Quick Consultation Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400">
                {currentApptId ? "Active Chair" : "Chair Status"}
              </span>
              {currentApptId ? (
                <button
                  type="button"
                  onClick={handleFinishConsultation}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Complete &amp; Next</span>
                </button>
              ) : waitingList.length > 0 ? (
                <button
                  type="button"
                  onClick={handleCallNext}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Call Next Patient In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Issue Walk-in Token</span>
                </button>
              )}
            </div>
          </div>

          {/* WAITING Section */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-slate-400" />
                <span>WAITING IN RECEPTION</span>
              </div>
              <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                {waitingList.length}
              </span>
            </div>

            {waitingList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Waiting room is clear. Click &quot;Issue Walk-in Token&quot; to queue a new arrival.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {waitingList.map((item, idx) => {
                  const estWaitMin = idx * 15;
                  const isCheckedIn = item.status === "CHECKED_IN" || item.status === "WAITING";
                  const isConfirmed = item.status === "CONFIRMED";
                  const isOnline = item.source === "WEBSITE" || item.source === "WEB_FORM";
                  const isWhatsApp = item.source === "WHATSAPP";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 p-2.5 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-mono text-xs font-bold text-blue-700">
                          #{item.token}
                        </span>
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="truncate text-xs font-bold text-slate-800">
                              {item.name}
                            </p>
                            {isCheckedIn ? (
                              <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                                🟢 In Lounge
                              </span>
                            ) : isConfirmed ? (
                              <span className="rounded bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                                🔵 Confirmed
                              </span>
                            ) : (
                              <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                                🟡 Booked
                              </span>
                            )}
                            {isOnline && (
                              <span className="rounded bg-purple-50 text-purple-700 text-[9px] font-medium px-1 py-0.2 shrink-0">
                                Web
                              </span>
                            )}
                            {isWhatsApp && (
                              <span className="rounded bg-emerald-50 text-emerald-700 text-[9px] font-medium px-1 py-0.2 shrink-0">
                                WhatsApp
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[10px] text-slate-400 mt-0.5">
                            {item.timeSlot && <span className="font-semibold text-slate-600">{item.timeSlot} · </span>}
                            {item.service || "General Consultation"} ·{" "}
                            <span className="text-amber-600 font-semibold">
                              ~{estWaitMin === 0 ? "5" : estWaitMin}m wait
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isCheckedIn && (
                          <button
                            type="button"
                            onClick={() => handleCheckInPatient(item)}
                            title="Mark as arrived in reception lounge"
                            className="rounded-lg bg-white border border-emerald-300 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 shadow-2xs transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCallSpecificPatient(item)}
                          title="Call patient into consultation room"
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Call In</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Room 2 / Assistant Doctor Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs w-full space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Dr. Sankar (Chief Dental Surgeon)
              </h3>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 tracking-wider">
                  ROOM DENTAL CHAIR 2
                </span>
                <span className="text-xs text-slate-400">
                  Oral Surgery Chair
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                STATUS
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                AVAILABLE
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>CHAIR READY — ORAL SURGERY</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-base leading-snug">
                Oral Surgery &amp; Consultations
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Ready to receive appointments and procedures
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-emerald-100/60">
              <span className="text-[10px] font-semibold text-slate-400">
                Chair 2 Routing
              </span>
              <button
                type="button"
                onClick={() => {
                  setWalkInDoctor("Dr. Sankar (Chief Dental Surgeon)");
                  setIsWalkInModalOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Queue for Chair 2</span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1">
                <Hourglass className="w-3 h-3 text-slate-400" />
                <span>CHAIR 2 STATUS</span>
              </div>
              <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                Ready
              </span>
            </div>
            <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Shifts configured via Doctor Schedule. Click &quot;Queue for Chair 2&quot; to route an arrival.
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. WAITING-ROOM TVS CARD                                             */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
        {/* Card Header & Explainer */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Waiting-room TVs &amp; Reception Screens</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {tvs.length} {tvs.length === 1 ? "Screen" : "Screens"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
              Each TV display link updates in real time and automatically announces calling tokens with sound chimes. Open a link in fullscreen on any smart TV or tablet in the clinic waiting area.
            </p>
          </div>
          {tvs.filter((t) => t.status === "Revoked").length > 0 && (
            <button
              type="button"
              onClick={handleClearRevokedTvs}
              disabled={isClearingRevoked}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-colors shadow-2xs shrink-0 self-start sm:self-center"
              title="Permanently remove all revoked TV sessions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {isClearingRevoked
                  ? "Clearing..."
                  : `Clear Revoked (${tvs.filter((t) => t.status === "Revoked").length})`}
              </span>
            </button>
          )}
        </div>

        {/* Ready Banner */}
        {readyTv && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
            <div>
              <p className="text-xs font-bold text-emerald-800">
                {readyTv.name} is ready.
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Open this link on the TV now. It updates live with current tokens.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={readyTv.url}
                className="flex-1 rounded-xl border border-emerald-300/80 bg-white px-3.5 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:outline-hidden"
              />
              <a
                href={readyTv.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 text-xs shadow-xs transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Screen</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs shadow-xs transition-colors shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy link
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setReadyTv(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 text-xs shadow-2xs transition-colors shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Create TV Form Row */}
        <form onSubmit={handleCreateTvLink} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TV Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                TV name
              </label>
              <input
                type="text"
                value={tvName}
                onChange={(e) => setTvName(e.target.value)}
                placeholder="Main waiting room display"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Shows Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                Shows
              </label>
              <select
                value={tvShows}
                onChange={(e) => setTvShows(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="The clinic queue">The clinic queue</option>
                <option value="Dr. Deep Arvindbhai Patel">Dr. Deep Arvindbhai Patel</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={creatingTv}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 text-xs shadow-xs transition-colors"
            >
              {creatingTv ? "Creating..." : "Create TV link"}
            </button>
          </div>
        </form>

        {/* TVs Table */}
        <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    TV
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    SHOWS
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    LAST SEEN
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    STATUS
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tvs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">
                      No waiting-room TVs registered yet.
                    </td>
                  </tr>
                ) : (
                  tvs.map((tv) => {
                    const isRevokingThis = revokingId === tv.id;
                    const isDeletingThis = deletingId === tv.id;
                    const isActive = tv.status === "Active";

                    return (
                      <tr key={tv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">
                          {tv.name}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {tv.shows}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {tv.lastSeen}
                        </td>
                        <td className="px-5 py-3.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                              Revoked
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {isDeletingThis ? (
                            <div className="inline-flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-500">Delete TV?</span>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTv(tv.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-2xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Confirm</span>
                              </button>
                            </div>
                          ) : isRevokingThis ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setRevokingId(null)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                Keep it
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmRevoke(tv.id)}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                              >
                                Confirm revoke
                              </button>
                            </div>
                          ) : isActive ? (
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={`/tv/${tv.token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs"
                                title="Open full-screen waiting room TV display in a new tab"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open TV</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => setRevokingId(tv.id)}
                                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                                title="Revoke TV session"
                              >
                                Revoke
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(tv.id)}
                                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
                                title="Permanently delete this TV"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDeletingId(tv.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
                                title="Permanently delete this revoked TV session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. ISSUE WALK-IN TOKEN MODAL                                         */}
      {/* =================================================================== */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Issue Walk-in Token
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Register a walk-in patient directly to today&apos;s queue
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWalkInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {issuedWalkInToken ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-black font-mono">
                  #{issuedWalkInToken}
                </div>
                <h4 className="font-bold text-slate-900 text-base">
                  Token #{issuedWalkInToken} Issued Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  {walkInName} has been queued into reception.
                </p>
              </div>
            ) : (
              <form onSubmit={handleIssueWalkInToken} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason / Treatment Service
                  </label>
                  <select
                    value={walkInService}
                    onChange={(e) => setWalkInService(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value="General Consultation">General Consultation</option>
                    <option value="Severe Tooth Pain & Root Canal Checkup">Severe Tooth Pain & Root Canal</option>
                    <option value="Teeth Cleaning & Scaling">Teeth Cleaning & Scaling</option>
                    <option value="Composite Restoration">Composite Restoration</option>
                    <option value="Orthodontic Braces Checkup">Orthodontic Braces Checkup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Doctor
                  </label>
                  <select
                    value={walkInDoctor}
                    onChange={(e) => setWalkInDoctor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  >
                    <option value="Dr. Deep Arvindbhai Patel">Dr. Deep Arvindbhai Patel (Main Chair)</option>
                    <option value="Dr. Sankar (Chief Dental Surgeon)">Dr. Sankar (Chair 2)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsWalkInModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWalkIn}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    {submittingWalkIn ? "Issuing..." : "Confirm & Issue Token"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. LIVE BOARD FULLSCREEN MODAL DISPLAY                              */}
      {/* =================================================================== */}
      {isLiveBoardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-[#0b1120] text-white p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[540px]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLiveBoardOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* TV Screen Top Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
                  CA
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    CA Smile Dental Clinic
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live Waiting Room Reception Display
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE QUEUE
                </span>
              </div>
            </div>

            {/* Main Token Announcement Hero */}
            <div className="my-auto py-8 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 animate-pulse">
                NOW CONSULTING
              </span>

              <div className="text-7xl sm:text-8xl font-black tracking-tight text-white drop-shadow-md font-mono">
                TOKEN #{currentToken}
              </div>

              <div className="text-2xl sm:text-3xl font-semibold text-slate-200">
                {currentPatient}
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-2 text-sm text-slate-300">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Dr. Deep Arvindbhai Patel</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-white">ROOM DENTAL CHAIR 1</span>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
              <div>
                Please proceed to Room Dental Chair 1 when your token is called.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecallCurrent}
                  className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 text-xs transition-colors"
                >
                  Recall 🔔
                </button>
                <button
                  type="button"
                  onClick={handleCallNext}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 text-xs transition-colors"
                >
                  Call Next Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
