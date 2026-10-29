"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Tv,
  Volume2,
  VolumeX,
  Sparkles,
  User,
  CheckCircle2,
  Maximize2,
  Users,
} from "lucide-react";

export default function WaitingRoomTvScreen() {
  const params = useParams();
  const tokenParam = params?.token as string;

  const [time, setTime] = useState("");
  const [currentToken, setCurrentToken] = useState<number>(1);
  const [currentPatient, setCurrentPatient] = useState("Waiting for next patient");
  const [doctorName, setDoctorName] = useState("Dr. Deep Arvindbhai Patel");
  const [roomName, setRoomName] = useState("ROOM DENTAL CHAIR 1");
  const [upcomingList, setUpcomingList] = useState<{ token: number; name: string }[]>([]);
  const [queueStatus, setQueueStatus] = useState<"CALLING" | "CONSULTING" | "READY" | "COMPLETED">("READY");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevTokenRef = useRef<number>(0);
  const prevCallTimestampRef = useRef<number>(0);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
      // AudioContext could be blocked if no user interaction yet
    }
  };

  // Speech Announcement
  const announcePatient = (tNum: number, pName: string, room = roomName) => {
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

  // Fetch Live Queue from /api/admin/queue/live
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch("/api/admin/queue/live");
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          const activeT = data.currentToken || 1;
          const activeP = data.currentPatient || "Welcome to CA Smile Dental Clinic";

          if (data.doctorName) setDoctorName(data.doctorName);
          if (data.roomName) setRoomName(data.roomName);
          if (data.status) setQueueStatus(data.status);
          if (Array.isArray(data.upcoming)) setUpcomingList(data.upcoming);

          // Audio chime & speech if new token OR explicit recall timestamp changed
          const isNewToken = activeT !== prevTokenRef.current && prevTokenRef.current !== 0;
          const isRecall = data.callTimestamp && data.callTimestamp !== prevCallTimestampRef.current && prevCallTimestampRef.current !== 0;

          if ((isNewToken || isRecall) && soundEnabled && data.status !== "COMPLETED" && !activeP.includes("All Consultations Completed")) {
            playChime();
            setTimeout(() => announcePatient(activeT, activeP, data.roomName || roomName), 500);
          }

          prevTokenRef.current = activeT;
          if (data.callTimestamp) {
            prevCallTimestampRef.current = data.callTimestamp;
          }

          setCurrentToken(activeT);
          setCurrentPatient(activeP);
        }
      } catch (err) {
        console.error("Error fetching live queue for TV:", err);
      }
    };

    fetchQueue();
    const pollInterval = setInterval(fetchQueue, 2000);
    return () => clearInterval(pollInterval);
  }, [soundEnabled, roomName]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-white flex flex-col justify-between p-6 sm:p-12 select-none font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-2xl text-white shadow-lg">
            CA
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              CA Smile Dental Clinic
            </h1>
            <p className="text-sm font-medium text-slate-400">
              Reception &amp; Consultation Calling Display
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <span className="block text-2xl sm:text-3xl font-mono font-bold text-slate-200">
              {time || "12:00:00 PM"}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bilimora Clinic
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChime();
              }}
              className={`p-2.5 rounded-xl border transition-colors ${
                soundEnabled
                  ? "border-blue-500/40 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-300"
              }`}
              title={soundEnabled ? "Audio Bell & Voice: ON" : "Muted"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleFullScreen}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Fullscreen Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </div>
        </div>
      </header>

      {/* Main Calling Box */}
      <main className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-6">
        {queueStatus === "CALLING" ? (
          <div className="inline-flex items-center gap-2.5 rounded-full bg-blue-500/25 border border-blue-400 px-6 py-2.5 text-xs sm:text-sm font-black tracking-widest uppercase text-blue-300 animate-pulse shadow-xl shadow-blue-500/30">
            <span className="h-3 w-3 rounded-full bg-blue-400 animate-ping" />
            NOW CALLING — PLEASE PROCEED TO ROOM
          </div>
        ) : queueStatus === "CONSULTING" ? (
          <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-500/20 border border-amber-400/50 px-6 py-2.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-amber-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            CURRENTLY IN CONSULTATION
          </div>
        ) : queueStatus === "COMPLETED" || currentPatient.includes("All Consultations Completed") ? (
          <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-6 py-2.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            ALL CONSULTATIONS COMPLETED FOR TODAY
          </div>
        ) : (
          <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-800 border border-slate-700 px-6 py-2.5 text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-300">
            <Sparkles className="w-4 h-4 text-slate-400" />
            DOCTOR CHAIR READY — WAITING FOR PATIENT
          </div>
        )}

        <div className="text-8xl sm:text-9xl lg:text-[11rem] font-black tracking-tight text-white drop-shadow-2xl font-mono leading-none">
          TOKEN {currentToken}
        </div>

        <div className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-100 max-w-4xl truncate px-4">
          {currentPatient}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <div className="rounded-2xl border border-slate-700/80 bg-slate-800/80 px-6 py-3 text-base sm:text-lg font-semibold text-slate-200 shadow-md flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>{doctorName}</span>
          </div>
          <div className="rounded-2xl border border-blue-500/40 bg-blue-600/30 px-6 py-3 text-base sm:text-lg font-bold text-blue-300 shadow-md">
            {roomName}
          </div>
        </div>

        {/* Next In Queue Strip */}
        {upcomingList.length > 0 && (
          <div className="pt-6 flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-6 py-3 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              NEXT UP:
            </span>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-300">
              {upcomingList.map((item, idx) => (
                <span key={item.token} className="flex items-center gap-1.5">
                  <span className="text-blue-400 font-bold font-mono">#{item.token}</span>
                  <span>{item.name}</span>
                  {idx < upcomingList.length - 1 && <span className="text-slate-600">·</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info Banner */}
      <footer className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs sm:text-sm gap-3">
        <p>
          Please watch this screen for your token number. Approach the front desk if you require assistance.
        </p>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
          <span>TV LINK ACTIVE</span>
          <span>•</span>
          <span className="truncate max-w-[150px]">{tokenParam || "LIVE-QUEUE"}</span>
        </div>
      </footer>
    </div>
  );
}
