"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
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
  Stethoscope,
  Edit3,
  Settings,
  ShieldCheck,
  Lock,
  ChevronDown,
  Building2,
  HelpCircle,
} from "lucide-react";
import { DentalChair, ChairColorTheme, ChairOperationalStatus } from "@/types/chairs";
import {
  AddChairModal,
  EditChairModal,
  QuickChangeDoctorModal,
  DeleteChairModal,
} from "./curaverto-chair-modals";

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

const THEME_STYLES: Record<
  ChairColorTheme,
  {
    borderTop: string;
    badgeBg: string;
    badgeText: string;
    accentBg: string;
    accentBorder: string;
    tokenText: string;
    buttonBg: string;
    buttonHover: string;
    dotBg: string;
  }
> = {
  blue: {
    borderTop: "border-t-blue-600",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    accentBg: "bg-blue-50/40",
    accentBorder: "border-blue-200",
    tokenText: "text-blue-600",
    buttonBg: "bg-blue-600",
    buttonHover: "hover:bg-blue-700",
    dotBg: "bg-blue-500",
  },
  emerald: {
    borderTop: "border-t-emerald-600",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    accentBg: "bg-emerald-50/40",
    accentBorder: "border-emerald-200",
    tokenText: "text-emerald-600",
    buttonBg: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-700",
    dotBg: "bg-emerald-500",
  },
  purple: {
    borderTop: "border-t-purple-600",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    accentBg: "bg-purple-50/40",
    accentBorder: "border-purple-200",
    tokenText: "text-purple-600",
    buttonBg: "bg-purple-600",
    buttonHover: "hover:bg-purple-700",
    dotBg: "bg-purple-500",
  },
  amber: {
    borderTop: "border-t-amber-500",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-800",
    accentBg: "bg-amber-50/40",
    accentBorder: "border-amber-200",
    tokenText: "text-amber-600",
    buttonBg: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
    dotBg: "bg-amber-500",
  },
  cyan: {
    borderTop: "border-t-cyan-600",
    badgeBg: "bg-cyan-50 border-cyan-200",
    badgeText: "text-cyan-700",
    accentBg: "bg-cyan-50/40",
    accentBorder: "border-cyan-200",
    tokenText: "text-cyan-600",
    buttonBg: "bg-cyan-600",
    buttonHover: "hover:bg-cyan-700",
    dotBg: "bg-cyan-500",
  },
  rose: {
    borderTop: "border-t-rose-600",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    accentBg: "bg-rose-50/40",
    accentBorder: "border-rose-200",
    tokenText: "text-rose-600",
    buttonBg: "bg-rose-600",
    buttonHover: "hover:bg-rose-700",
    dotBg: "bg-rose-500",
  },
  indigo: {
    borderTop: "border-t-indigo-600",
    badgeBg: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    accentBg: "bg-indigo-50/40",
    accentBorder: "border-indigo-200",
    tokenText: "text-indigo-600",
    buttonBg: "bg-indigo-600",
    buttonHover: "hover:bg-indigo-700",
    dotBg: "bg-indigo-500",
  },
};

export function CuravertoQueueManagerView() {
  const { data: session } = useSession();

  // Determine if logged in account is Clinic Admin or Owner
  const isAdminOrOwner = useMemo(() => {
    if (!session?.user) return false;
    const role = (session.user as any).role;
    const email = session.user.email?.toLowerCase().trim();
    const ownerEmails = (process.env.NEXT_PUBLIC_OWNER_EMAILS || "casmileatbilimora@gmail.com,applei74740@gmail.com")
      .toLowerCase()
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    return role === "ADMIN" || (email && ownerEmails.includes(email));
  }, [session]);

  // Dental Chairs State
  const [chairs, setChairs] = useState<DentalChair[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([]);
  const [loadingChairs, setLoadingChairs] = useState(true);

  // Chair Modals State
  const [isAddChairOpen, setIsAddChairOpen] = useState(false);
  const [chairToEdit, setChairToEdit] = useState<DentalChair | null>(null);
  const [chairToChangeDoctor, setChairToChangeDoctor] = useState<DentalChair | null>(null);
  const [chairToDelete, setChairToDelete] = useState<DentalChair | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // TV Displays State
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
  const [walkInChairId, setWalkInChairId] = useState<string>("chair-1");
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [issuedWalkInToken, setIssuedWalkInToken] = useState<number | null>(null);

  // Sound Announcements State
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Clinic Overall Queue Metrics
  const [currentToken, setCurrentToken] = useState<number>(1);
  const [currentPatient, setCurrentPatient] = useState("Doctor Chair Ready");
  const [currentDoctor, setCurrentDoctor] = useState("Dr. Deep Arvindbhai Patel");
  const [currentRoom, setCurrentRoom] = useState("ROOM DENTAL CHAIR 1");
  const [seenCount, setSeenCount] = useState(0);
  const [waitingList, setWaitingList] = useState<WaitingPatient[]>([]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    } catch {}
  };

  // Speech Announcement
  const announcePatient = (tNum: number, pName: string, destination = "Room Dental Chair 1") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Token number ${tNum}. ${pName}. Please proceed to ${destination}.`;
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
    chairId?: string;
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

  // Fetch Chairs
  const fetchChairs = async () => {
    try {
      setLoadingChairs(true);
      const res = await fetch("/api/admin/queue/chairs");
      const json = await res.json();
      if (json.success && Array.isArray(json.chairs)) {
        setChairs(json.chairs);
        if (Array.isArray(json.availableDoctors)) {
          setAvailableDoctors(json.availableDoctors);
          if (json.chairs.length > 0 && !walkInDoctor) {
            setWalkInDoctor(json.chairs[0].doctorName);
            setWalkInChairId(json.chairs[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load dental chairs:", err);
    } finally {
      setLoadingChairs(false);
    }
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

        const inConsultation = appts.find(
          (a: any) =>
            a.status === "TREATMENT_STARTED" ||
            a.status === "IN_TREATMENT" ||
            a.status === "CONSULTING"
        );

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

        waiting.sort((a: any, b: any) => {
          const isCheckA =
            a.status === "TREATMENT_STARTED"
              ? -1
              : a.status === "CHECKED_IN" || a.status === "WAITING" || a.status === "IN-CLINIC"
              ? 0
              : 1;
          const isCheckB =
            b.status === "TREATMENT_STARTED"
              ? -1
              : b.status === "CHECKED_IN" || b.status === "WAITING" || b.status === "IN-CLINIC"
              ? 0
              : 1;
          if (isCheckA !== isCheckB) return isCheckA - isCheckB;
          return (a.tokenNumber || 0) - (b.tokenNumber || 0);
        });

        if (inConsultation) {
          setCurrentToken(inConsultation.tokenNumber || 1);
          setCurrentPatient(inConsultation.patientName || "Patient");
          setCurrentDoctor(inConsultation.doctor || "Dr. Deep Arvindbhai Patel");
        } else if (waiting.length > 0) {
          const first = waiting[0];
          setCurrentToken(first.tokenNumber || 1);
          setCurrentPatient("Doctor Chair Ready");
          setCurrentDoctor(first.doctor || "Dr. Deep Arvindbhai Patel");
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
        fetchChairs(),
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

  useEffect(() => {
    fetchTvs();
    fetchTodayQueue();
    fetchChairs();

    const interval = setInterval(() => {
      fetchTodayQueue(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------------------
  // PER-CHAIR ACTIONS (Call Next, Recall, Complete, Status)
  // -------------------------------------------------------------------------
  const handleRecallChair = (chair: DentalChair) => {
    const token = chair.currentToken || currentToken || 1;
    const patient = chair.currentPatient && chair.currentPatient !== "Dental Chair Ready"
      ? chair.currentPatient
      : currentPatient;

    if (soundEnabled) {
      playChime();
      setTimeout(
        () => announcePatient(token, patient, `${chair.room} with ${chair.doctorName}`),
        400
      );
    }

    broadcastLiveQueue({
      token,
      patient,
      doctor: chair.doctorName,
      room: chair.room,
      status: "CALLING",
      action: "RECALL",
      chairId: chair.id,
      upcoming: waitingList.map((w) => ({ token: w.token, name: w.name })),
    });

    showToast(`🔔 Recalled Token #${token} for ${chair.name} (${chair.doctorName})`);
  };

  const handleCallNextForChair = async (chair: DentalChair) => {
    // Find waiting patient preferencing this doctor, or first waiting patient
    const candidate =
      waitingList.find(
        (w) =>
          w.doctor === chair.doctorName ||
          (w.doctor && chair.doctorName.toLowerCase().includes(w.doctor.toLowerCase()))
      ) || waitingList[0];

    if (candidate) {
      setSeenCount((prev) => prev + 1);

      if (soundEnabled) {
        playChime();
        setTimeout(
          () =>
            announcePatient(
              candidate.token,
              candidate.name,
              `${chair.room} with ${chair.doctorName}`
            ),
          400
        );
      }

      broadcastLiveQueue({
        token: candidate.token,
        patient: candidate.name,
        doctor: chair.doctorName,
        service: candidate.service || "Consultation",
        room: chair.room,
        status: "CALLING",
        action: "CALL",
        chairId: chair.id,
        upcoming: waitingList
          .filter((w) => w.id !== candidate.id)
          .map((w) => ({ token: w.token, name: w.name })),
      });

      // Update chair state
      setChairs((prev) =>
        prev.map((c) =>
          c.id === chair.id
            ? {
                ...c,
                status: "IN_CONSULTATION",
                currentPatient: candidate.name,
                currentToken: candidate.token,
                currentApptId: candidate.id,
                currentService: candidate.service || "Consultation",
                seenCount: (c.seenCount || 0) + 1,
              }
            : c
        )
      );

      setWaitingList((prev) => prev.filter((p) => p.id !== candidate.id));

      try {
        await fetch(`/api/appointments/${candidate.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_STARTED", forceOverride: true }),
        });
      } catch (err) {
        console.error("Error setting treatment status:", err);
      }

      showToast(`Called Token #${candidate.token} (${candidate.name}) to ${chair.name}`);
    } else {
      // No more waiting patients
      if (chair.currentApptId) {
        try {
          await fetch(`/api/appointments/${chair.currentApptId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "TREATMENT_DONE", forceOverride: true }),
          });
        } catch {}
      }

      setChairs((prev) =>
        prev.map((c) =>
          c.id === chair.id
            ? {
                ...c,
                status: "READY",
                currentPatient: "Dental Chair Ready",
                currentApptId: null,
                currentService: "Waiting room is clear. No waiting patients.",
              }
            : c
        )
      );

      broadcastLiveQueue({
        token: chair.currentToken || currentToken || 1,
        patient: "All Consultations Completed",
        doctor: chair.doctorName,
        service: "Clinic Queue Finished",
        room: chair.room,
        status: "COMPLETED",
        action: "FINISH",
        chairId: chair.id,
        upcoming: [],
      });

      showToast(`All consultations completed for ${chair.name}`);
    }

    await fetchTodayQueue(true);
  };

  const handleFinishConsultationForChair = async (chair: DentalChair) => {
    if (chair.currentApptId) {
      try {
        await fetch(`/api/appointments/${chair.currentApptId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_DONE", forceOverride: true }),
        });
        setSeenCount((prev) => prev + 1);
      } catch (err) {
        console.error("Error completing appointment:", err);
      }
    }

    // Call next patient immediately
    handleCallNextForChair(chair);
  };

  const handleCallSpecificPatientToChair = async (item: WaitingPatient, chair: DentalChair) => {
    if (chair.currentApptId) {
      try {
        await fetch(`/api/appointments/${chair.currentApptId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "TREATMENT_DONE", forceOverride: true }),
        });
        setSeenCount((prev) => prev + 1);
      } catch {}
    }

    if (soundEnabled) {
      playChime();
      setTimeout(
        () =>
          announcePatient(
            item.token,
            item.name,
            `${chair.room} with ${chair.doctorName}`
          ),
        400
      );
    }

    broadcastLiveQueue({
      token: item.token,
      patient: item.name,
      doctor: chair.doctorName,
      service: item.service || "Consultation",
      room: chair.room,
      status: "CALLING",
      action: "CALL",
      chairId: chair.id,
      upcoming: waitingList
        .filter((p) => p.id !== item.id)
        .map((w) => ({ token: w.token, name: w.name })),
    });

    setChairs((prev) =>
      prev.map((c) =>
        c.id === chair.id
          ? {
              ...c,
              status: "IN_CONSULTATION",
              currentPatient: item.name,
              currentToken: item.token,
              currentApptId: item.id,
              currentService: item.service || "Consultation",
              seenCount: (c.seenCount || 0) + 1,
            }
          : c
      )
    );

    setWaitingList((prev) => prev.filter((p) => p.id !== item.id));

    try {
      await fetch(`/api/appointments/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TREATMENT_STARTED", forceOverride: true }),
      });
    } catch (err) {
      console.error("Error updating patient status:", err);
    }

    showToast(`Called Token #${item.token} (${item.name}) to ${chair.name}`);
    await fetchTodayQueue(true);
  };

  // Quick Status update for chair
  const handleQuickStatusChange = async (chairId: string, newStatus: ChairOperationalStatus) => {
    try {
      const res = await fetch("/api/admin/queue/chairs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chairId, action: "change_status", status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setChairs((prev) =>
          prev.map((c) => (c.id === chairId ? { ...c, status: newStatus } : c))
        );
        showToast(`Chair status updated to ${newStatus}`);
      } else {
        alert(json.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Check In Patient
  const handleCheckInPatient = async (item: WaitingPatient) => {
    try {
      await fetch(`/api/appointments/${item.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CHECKED_IN", forceOverride: true }),
      });
      await fetchTodayQueue(true);
      showToast(`Checked in Token #${item.token} (${item.name})`);
    } catch (err) {
      console.error("Error checking in patient:", err);
    }
  };

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

  // Issue New Walk-in Token
  const handleIssueWalkInToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    setSubmittingWalkIn(true);
    try {
      const selectedChair = chairs.find((c) => c.id === walkInChairId);
      const assignedDoctor = selectedChair ? selectedChair.doctorName : walkInDoctor;

      const res = await fetch("/api/admin/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: walkInName.trim(),
          phone: walkInPhone.trim() || "+91 98000 00000",
          serviceName: walkInService,
          doctor: assignedDoctor,
          source: "WALK_IN",
          status: "CHECKED_IN",
          notes: `Walk-in registered via Queue Manager for ${selectedChair?.name || "Main Chair"}`,
        }),
      });

      const json = await res.json();
      if (json.success && json.appointment) {
        const newTokenNum = json.appointment.tokenNumber || waitingList.length + currentToken + 1;
        setIssuedWalkInToken(newTokenNum);
        if (soundEnabled) playChime();
        await fetchTodayQueue();
        showToast(`Token #${newTokenNum} issued to ${walkInName}`);

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

  // Active Chairs count
  const activeChairsCount = chairs.filter((c) => c.isActive && c.status !== "OFFLINE").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold shadow-xs flex items-center justify-between animate-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. TOP HEADER ROW WITH ACTIONS & SOUND TOGGLE                        */}
      {/* =================================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Live Queue Manager
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYNCED LIVE
              </span>

              {/* Admin / Owner Role Badge */}
              {isAdminOrOwner ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  Admin / Owner Access
                </span>
              ) : (
                <span
                  title="Only Clinic Admin or Owner can add or delete chairs and reassign doctors."
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  Staff View
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {chairs.length} {chairs.length === 1 ? "chair" : "chairs"} configured ({activeChairsCount} active) •{" "}
              {waitingList.length} patients in waiting lounge • {seenCount} completed today
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admin "+ Add Chair" Button (Only available to Admin / Owner) */}
          {isAdminOrOwner && (
            <button
              type="button"
              onClick={() => setIsAddChairOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold px-3.5 py-2 text-xs shadow-2xs transition-colors"
              title="Add a new treatment chair with assigned doctor"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Chair</span>
            </button>
          )}

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
      {/* 2. DYNAMIC DOCTOR LIVE QUEUE CHAIR CARDS                             */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chairs.map((chair) => {
          const theme = THEME_STYLES[chair.colorTheme || "blue"] || THEME_STYLES.blue;
          const isInConsultation = chair.status === "IN_CONSULTATION";
          const isPaused = chair.status === "PAUSED";
          const isOffline = chair.status === "OFFLINE";
          const isAvailable = chair.status === "AVAILABLE";

          // Filter waiting patients for this doctor or chair
          const chairWaitingList = waitingList.filter(
            (w) =>
              !w.doctor ||
              w.doctor === chair.doctorName ||
              chair.doctorName.toLowerCase().includes(w.doctor.toLowerCase())
          );

          return (
            <div
              key={chair.id}
              className={`rounded-2xl border-t-4 ${theme.borderTop} border-x border-b border-slate-200/90 bg-white p-5 shadow-xs w-full space-y-3.5 relative flex flex-col justify-between transition-all`}
            >
              <div className="space-y-3.5">
                {/* Chair Top Title & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Doctor Name with Quick Change Doctor Button */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3
                        className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate"
                        title={chair.doctorName}
                      >
                        {chair.doctorName}
                      </h3>

                      {/* Admin Doctor Switcher Button */}
                      {isAdminOrOwner && (
                        <button
                          type="button"
                          onClick={() => setChairToChangeDoctor(chair)}
                          title="Change assigned doctor for this chair"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-2 py-0.5 rounded-lg transition-colors shrink-0"
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>Change Doctor</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
                        {chair.room}
                      </span>
                      <span className="text-xs text-slate-400">
                        {chair.specialty || `${chair.seenCount || 0} seen today`}
                      </span>
                    </div>
                  </div>

                  {/* Header Top-Right: Chair Admin Gear / Delete Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isAdminOrOwner ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setChairToEdit(chair)}
                          title="Edit Chair & Doctor Settings"
                          className="h-7 w-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {chairs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setChairToDelete(chair)}
                            title="Delete this chair"
                            className="h-7 w-7 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span
                        title="Admin permission required to edit chairs"
                        className="text-slate-300 p-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {/* Operational Status Badge */}
                    <div className="text-right ml-1">
                      {isInConsultation ? (
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                          ACTIVE
                        </span>
                      ) : isPaused ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          ON BREAK
                        </span>
                      ) : isOffline ? (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          OFFLINE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          READY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* IN CONSULTATION / CHAIR STATUS Container */}
                <div
                  className={`rounded-xl border p-3.5 space-y-2 transition-colors ${
                    isInConsultation
                      ? "border-blue-200 bg-blue-50/30"
                      : isPaused
                      ? "border-amber-200 bg-amber-50/20"
                      : isOffline
                      ? "border-slate-200 bg-slate-50"
                      : "border-slate-200 bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      {isInConsultation ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-700 font-extrabold">
                          <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                          <User className="w-3.5 h-3.5" />
                          IN CONSULTATION
                        </span>
                      ) : isPaused ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold">
                          <Hourglass className="w-3.5 h-3.5" />
                          CHAIR ON SHORT BREAK / SANITIZING
                        </span>
                      ) : chairWaitingList.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          CHAIR READY — {chairWaitingList.length} QUEUED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-600 font-bold">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          CHAIR READY FOR PATIENTS
                        </span>
                      )}
                    </div>

                    {/* Recall & Call Next actions */}
                    <div className="flex items-center gap-2">
                      {isInConsultation && (
                        <button
                          type="button"
                          onClick={() => handleRecallChair(chair)}
                          title="Ring Bell & Announce Token Again on TV"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 rounded-lg transition-colors"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Recall</span>
                        </button>
                      )}

                      {chairWaitingList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleCallNextForChair(chair)}
                          title="Call Next Patient Token"
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Next Token →
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-extrabold text-slate-900 text-base leading-snug truncate">
                      {chair.currentPatient || "Dental Chair Ready"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {chair.currentService || chair.description || "General Dental Consultation"}
                    </p>
                  </div>

                  {/* Consultation / Chair Routing Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 flex-wrap gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {isInConsultation ? "Active Patient" : "Chair Status"}
                    </span>

                    <div className="flex items-center gap-2">
                      {isInConsultation ? (
                        <button
                          type="button"
                          onClick={() => handleFinishConsultationForChair(chair)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Complete &amp; Next</span>
                        </button>
                      ) : chairWaitingList.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleCallNextForChair(chair)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Call Next Patient In</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setWalkInChairId(chair.id);
                            setWalkInDoctor(chair.doctorName);
                            setIsWalkInModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1 text-[11px] shadow-2xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Queue for this Chair</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* WAITING QUEUE LIST FOR THIS CHAIR */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <div className="flex items-center gap-1">
                      <Hourglass className="w-3 h-3 text-slate-400" />
                      <span>WAITING FOR {chair.name.toUpperCase()}</span>
                    </div>
                    <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {chairWaitingList.length}
                    </span>
                  </div>

                  {chairWaitingList.length === 0 ? (
                    <div className="py-5 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      No waiting arrivals. Click &quot;+ Queue for this Chair&quot; to issue a token.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {chairWaitingList.map((item, idx) => {
                        const estWaitMin = idx * 15;
                        const isCheckedIn = item.status === "CHECKED_IN" || item.status === "WAITING";
                        const isConfirmed = item.status === "CONFIRMED";

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
                                </div>
                                <p className="truncate text-[10px] text-slate-400 mt-0.5">
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
                                onClick={() => handleCallSpecificPatientToChair(item, chair)}
                                title={`Call patient into ${chair.name}`}
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

              {/* Card Footer: Quick Status Switcher for Admin */}
              {isAdminOrOwner && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Chair Mode:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(chair.id, "READY")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        chair.status === "READY"
                          ? "bg-emerald-100 text-emerald-800"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(chair.id, "PAUSED")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        chair.status === "PAUSED"
                          ? "bg-amber-100 text-amber-800"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      Break
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickStatusChange(chair.id, "OFFLINE")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        chair.status === "OFFLINE"
                          ? "bg-slate-200 text-slate-800"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      Offline
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 3. WAITING-ROOM TVS CARD                                             */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
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

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                Shows
              </label>
              <select
                value={tvShows}
                onChange={(e) => setTvShows(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="The clinic queue">The clinic queue (All Chairs)</option>
                {chairs.map((c) => (
                  <option key={c.id} value={`${c.name} (${c.doctorName})`}>
                    {c.name} — {c.doctorName}
                  </option>
                ))}
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
      {/* 4. CHAIR MODALS (Add, Edit, Quick Doctor Switch, Delete)             */}
      {/* =================================================================== */}
      {/* Add Chair Modal */}
      <AddChairModal
        isOpen={isAddChairOpen}
        onClose={() => setIsAddChairOpen(false)}
        availableDoctors={availableDoctors}
        existingChairsCount={chairs.length}
        onChairCreated={(newChair) => {
          setChairs((prev) => [...prev, newChair]);
          showToast(`Dental Chair "${newChair.name}" added successfully!`);
          fetchChairs();
        }}
      />

      {/* Edit Chair Modal */}
      <EditChairModal
        isOpen={!!chairToEdit}
        chair={chairToEdit}
        onClose={() => setChairToEdit(null)}
        availableDoctors={availableDoctors}
        onChairUpdated={(updatedChair) => {
          setChairs((prev) =>
            prev.map((c) => (c.id === updatedChair.id ? updatedChair : c))
          );
          showToast(`Chair "${updatedChair.name}" updated successfully.`);
          fetchChairs();
        }}
      />

      {/* Quick Change Doctor Modal */}
      <QuickChangeDoctorModal
        isOpen={!!chairToChangeDoctor}
        chair={chairToChangeDoctor}
        onClose={() => setChairToChangeDoctor(null)}
        availableDoctors={availableDoctors}
        onDoctorChanged={(chairId, newDoctor) => {
          setChairs((prev) =>
            prev.map((c) => (c.id === chairId ? { ...c, doctorName: newDoctor } : c))
          );
          showToast(`Assigned doctor changed to ${newDoctor}`);
          fetchChairs();
        }}
      />

      {/* Delete Chair Modal */}
      <DeleteChairModal
        isOpen={!!chairToDelete}
        chair={chairToDelete}
        onClose={() => setChairToDelete(null)}
        onChairDeleted={(deletedId) => {
          setChairs((prev) => prev.filter((c) => c.id !== deletedId));
          showToast("Chair removed successfully.");
          fetchChairs();
        }}
      />

      {/* =================================================================== */}
      {/* 5. ISSUE WALK-IN TOKEN MODAL                                         */}
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
                    <option value="Oral Surgery & Extractions">Oral Surgery & Extractions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Queue for Chair / Doctor
                  </label>
                  <select
                    value={walkInChairId}
                    onChange={(e) => {
                      setWalkInChairId(e.target.value);
                      const targetChair = chairs.find((c) => c.id === e.target.value);
                      if (targetChair) setWalkInDoctor(targetChair.doctorName);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-medium"
                  >
                    {chairs.map((chair) => (
                      <option key={chair.id} value={chair.id}>
                        {chair.name} — {chair.doctorName} ({chair.room})
                      </option>
                    ))}
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
      {/* 6. LIVE BOARD FULLSCREEN MODAL DISPLAY                              */}
      {/* =================================================================== */}
      {isLiveBoardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800 bg-[#0b1120] text-white p-6 sm:p-10 shadow-2xl flex flex-col justify-between min-h-[540px]">
            <button
              type="button"
              onClick={() => setIsLiveBoardOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

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
                <span>{currentDoctor}</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-white">{currentRoom}</span>
              </div>

              {/* Active Chairs Strip in Live Board */}
              <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
                {chairs.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                  >
                    <span className={`h-2 w-2 rounded-full ${c.status === "IN_CONSULTATION" ? "bg-blue-400 animate-pulse" : "bg-emerald-400"}`} />
                    <span className="font-bold text-slate-300">{c.name}:</span>
                    <span className="text-slate-400">{c.doctorName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
              <div>
                Please proceed to your assigned dental chair when your token is called.
              </div>
              <div className="flex items-center gap-2">
                {chairs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRecallChair(chairs[0])}
                    className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 text-xs transition-colors"
                  >
                    Recall 🔔
                  </button>
                )}
                {chairs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleCallNextForChair(chairs[0])}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 text-xs transition-colors"
                  >
                    Call Next Token
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
