"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MessageSquare,
  Calendar,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  User,
  Shield,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  gender?: string;
  hasWhatsApp: boolean;
  whatsAppConversationId?: string;
  appointmentCount: number;
  appointments: Array<{
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    source: string;
    serviceName: string;
    preferredDoctor?: string;
  }>;
  createdAt: string;
}

export default function PatientsManagementPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  return (
    <div className="min-h-full bg-stone-50 p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 bg-white p-6 rounded-2xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-lg font-bold text-stone-900">Patient Records & WhatsApp Contacts</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Unified directory of clinic patients, WhatsApp booking history, and ongoing conversations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPatients}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by patient name, phone number, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
        <div className="text-xs text-stone-500">
          Showing <strong>{patients.length}</strong> patient records
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="py-3.5 px-4">Patient Name</th>
              <th className="py-3.5 px-4">Phone / WhatsApp</th>
              <th className="py-3.5 px-4">Booking Source</th>
              <th className="py-3.5 px-4">Total Appointments</th>
              <th className="py-3.5 px-4">Latest Appointment</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-stone-400">
                  Loading patient records...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-stone-400">
                  No patients found matching your search.
                </td>
              </tr>
            ) : (
              patients.map((p) => {
                const latestApt = p.appointments[0];
                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-900">{p.name}</span>
                          {p.email && <div className="text-[10px] text-stone-400">{p.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-stone-700">{p.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      {p.hasWhatsApp ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <MessageSquare className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                          Website / Desk
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-800">{p.appointmentCount}</span>
                    </td>

                    <td className="py-3 px-4">
                      {latestApt ? (
                        <div>
                          <div className="font-medium text-stone-800">{latestApt.serviceName}</div>
                          <div className="text-[10px] text-stone-400">
                            {new Date(latestApt.startTime).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/admin/whatsapp/chats"
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Chat</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedPatient(p)}
                          className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                        >
                          View History
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Profile & History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">{selectedPatient.name}</h3>
                <p className="text-xs text-stone-500 font-mono">Phone: {selectedPatient.phone}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Link
                href="/admin/whatsapp/chats"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Open WhatsApp Chat Thread</span>
              </Link>
            </div>

            {/* Appointment History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Appointment History ({selectedPatient.appointments.length})
              </h4>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedPatient.appointments.length === 0 ? (
                  <p className="text-xs text-stone-400">No recorded appointments.</p>
                ) : (
                  selectedPatient.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-stone-900">{apt.serviceName}</div>
                        <div className="text-[11px] text-stone-500">
                          {new Date(apt.startTime).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                          {apt.preferredDoctor && ` • Doctor: ${apt.preferredDoctor}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            apt.source === "WHATSAPP"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {apt.source}
                        </span>
                        <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700">
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedPatient(null)}
              className="w-full rounded-xl bg-stone-900 py-2 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
