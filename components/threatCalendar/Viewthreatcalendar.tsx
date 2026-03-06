"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertTriangle,
  FileDown,
  Edit,
  MapPin,
  Plus,
  X,
  Search,
  Filter,
  CalendarDays,
  Tag,
  FileText,
  ShieldAlert,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateThreatCalendar from "./Createthreatcalendar";
import EditThreatCalendarModal from "./Editthreatcalendarmodal";

// ── Types ─────────────────────────────────────────────────────────────────
const EVENT_TYPES = ["FESTIVAL", "EXAM", "POLITICAL", "LOCAL_EVENT"] as const;
const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

interface ThreatCalendar {
  _id: string;
  eventName: string;
  type: typeof EVENT_TYPES[number];
  location?: string;
  startDate: string;
  endDate: string;
  riskLevel: typeof RISK_LEVELS[number];
  advisories?: string;
  createdAt: string;
}

// ── Style maps ────────────────────────────────────────────────────────────
const RISK_STYLE: Record<string, { pill: string; bar: string; glow: string; dot: string }> = {
  LOW:      { pill: "bg-green-50 text-green-700 border-green-200",    bar: "bg-green-500",  glow: "shadow-green-100",  dot: "bg-green-500" },
  MEDIUM:   { pill: "bg-amber-50 text-amber-700 border-amber-200",    bar: "bg-amber-500",  glow: "shadow-amber-100",  dot: "bg-amber-500" },
  HIGH:     { pill: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-orange-500", glow: "shadow-orange-100", dot: "bg-orange-500" },
  CRITICAL: { pill: "bg-red-50 text-red-700 border-red-200",          bar: "bg-red-600",    glow: "shadow-red-100",    dot: "bg-red-600" },
};

const TYPE_STYLE: Record<string, string> = {
  FESTIVAL:    "bg-purple-50 text-purple-700 border-purple-200",
  EXAM:        "bg-blue-50 text-blue-700 border-blue-200",
  POLITICAL:   "bg-rose-50 text-rose-700 border-rose-200",
  LOCAL_EVENT: "bg-teal-50 text-teal-700 border-teal-200",
};

const TYPE_LABEL: Record<string, string> = {
  FESTIVAL: "Festival", EXAM: "Exam", POLITICAL: "Political", LOCAL_EVENT: "Local Event",
};

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const extractArray = (data: any): ThreatCalendar[] => {
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.events)) return data.events;
  if (Array.isArray(data)) return data;
  return [];
};

const exportCSV = (events: ThreatCalendar[]) => {
  const h = ["Event Name", "Type", "Location", "Start Date", "End Date", "Risk Level", "Advisories"];
  const r = events.map((e) => [e.eventName, e.type, e.location || "N/A", fmtDate(e.startDate), fmtDate(e.endDate), e.riskLevel, e.advisories || "N/A"]);
  const csv = [h, ...r].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "threat_calendar.csv"; a.click();
  URL.revokeObjectURL(url);
};

// ── Delete Modal ──────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ event, onConfirm, onCancel, loading }: {
  event: ThreatCalendar; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Delete Event</h2>
        </div>
        <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <X size={16} />
        </button>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-900">{event.eventName}</span>?
        </p>
        <p className="text-xs text-slate-400 mt-2">This action is permanent and cannot be undone.</p>
      </div>
      <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button onClick={onCancel} disabled={loading}
          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition bg-white disabled:opacity-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Event Card (Vertical) ─────────────────────────────────────────────────
const EventCard = ({ event, onEdit, onDelete }: {
  event: ThreatCalendar; onEdit: () => void; onDelete: () => void;
}) => {
  const risk = RISK_STYLE[event.riskLevel];
  const isActive = new Date(event.endDate) >= new Date();
  const isSameDay = fmtDate(event.startDate) === fmtDate(event.endDate);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden`}>

      {/* Top risk bar */}
      <div className={`h-2 w-full ${risk.bar}`} />

      <div className="p-6 flex flex-col gap-4 flex-1">

        {/* Header row: status badge + active/past */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${TYPE_STYLE[event.type]}`}>
              <Tag size={11} />
              {TYPE_LABEL[event.type]}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${risk.pill}`}>
              <AlertTriangle size={11} />
              {event.riskLevel}
            </span>
          </div>
          <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isActive
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-slate-100 text-slate-400 border-slate-200"
          }`}>
            {isActive ? "● Active" : "○ Past"}
          </span>
        </div>

        {/* Event name */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug">{event.eventName}</h3>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Date range */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${risk.pill} border`}>
            <CalendarDays size={16} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {isSameDay ? "Date" : "Date Range"}
            </p>
            {isSameDay ? (
              <p className="text-sm font-semibold text-slate-800">{fmtDate(event.startDate)}</p>
            ) : (
              <p className="text-sm font-semibold text-slate-800">
                {fmtDate(event.startDate)}
                <span className="text-slate-400 mx-1.5">→</span>
                {fmtDate(event.endDate)}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
              <p className="text-sm font-semibold text-slate-800">{event.location}</p>
            </div>
          </div>
        )}

        {/* Advisories */}
        {event.advisories && (
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <FileText size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Advisories</p>
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{event.advisories}</p>
            </div>
          </div>
        )}

      </div>

      {/* Action strip */}
      <div className="flex border-t border-slate-100 mt-auto">
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition border-r border-slate-100">
          <Edit size={15} /> Edit
        </button>
        <button onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
const ViewThreatCalendar = () => {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [events, setEvents] = useState<ThreatCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ThreatCalendar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ThreatCalendar | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchEvents = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get("/api/threatcalendar/get", { headers: { "Cache-Control": "no-cache" } });
      if (res.data?.success) {
        setEvents(extractArray(res.data));
      } else {
        setError(res.data?.message || "Failed to load events.");
        setEvents([]);
      }
    } catch { setError("Failed to load events. Please try again."); setEvents([]); }
    finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/threatcalendar/delete?id=${deleteTarget._id}`);
      toast.success(`Event "${deleteTarget.eventName}" deleted`);
      setDeleteTarget(null); fetchEvents();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete event");
    } finally { setDeleting(false); }
  };

  useEffect(() => { if (!showCreateForm) fetchEvents(); }, [showCreateForm]);

  const filtered = useMemo(() => events.filter((e) => {
    const q = search.toLowerCase();
    const now = new Date();
    const isActive = new Date(e.endDate) >= now;
    const matchSearch = !q || e.eventName.toLowerCase().includes(q) || (e.location ?? "").toLowerCase().includes(q);
    const matchType   = filterType === "All" || e.type === filterType;
    const matchRisk   = filterRisk === "All" || e.riskLevel === filterRisk;
    const matchStatus = filterStatus === "All" || (filterStatus === "active" ? isActive : !isActive);
    return matchSearch && matchType && matchRisk && matchStatus;
  }), [events, search, filterType, filterRisk, filterStatus]);

  const hasFilters = search || filterType !== "All" || filterRisk !== "All" || filterStatus !== "All";
  const clearFilters = () => { setSearch(""); setFilterType("All"); setFilterRisk("All"); setFilterStatus("All"); };

  if (showCreateForm) {
    return (
      <div className="space-y-5 p-6">
        <button onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium text-sm">
          <ArrowLeft size={18} /> Back to Threat Calendar
        </button>
        <CreateThreatCalendar onSuccess={() => setShowCreateForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 px-8 py-6 rounded-2xl shadow-lg">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-red-300 hover:text-white text-xs font-semibold mb-5 transition"
        >
          <LayoutDashboard size={13} /> Back to Admin
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0 p-1">
              <Image src="/rpf_logo.png" alt="RPF Logo" width={48} height={48} className="object-contain w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Threat Calendar</h1>
              <p className="text-red-300 text-sm mt-0.5">Track events, risk levels and security advisories</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => events.length > 0 && exportCSV(events)}
              disabled={events.length === 0}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40"
            >
              <FileDown size={16} /> Export
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-white text-red-900 px-5 py-3 rounded-xl text-sm font-bold hover:bg-red-50 transition shadow"
            >
              <Plus size={16} /> New Event
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{error}</div>
      )}

      {/* ── Filter Bar ── */}
      {!loading && events.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by event name or location..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              {/* Type */}
              <div className="relative flex-1 sm:flex-none">
                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  className="w-full sm:w-auto pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                  value={filterType} onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>

              {/* Risk */}
              <div className="relative flex-1 sm:flex-none">
                <ShieldAlert size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  className="w-full sm:w-auto pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                  value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}
                >
                  <option value="All">All Risk Levels</option>
                  {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="relative flex-1 sm:flex-none">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  className="w-full sm:w-auto pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                  value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="past">Past</option>
                </select>
              </div>

              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition px-4 py-3 rounded-xl hover:bg-slate-100 whitespace-nowrap border border-slate-200">
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{filtered.length}</span> of{" "}
            <span className="text-slate-700 font-bold">{events.length}</span> events
          </p>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin text-red-700 mb-3" size={32} />
          <p className="text-slate-500 text-sm">Loading Threat Calendar...</p>
        </div>

      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <CalendarClock className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-700 font-bold text-lg">No threat events found.</p>
          <p className="text-slate-400 text-sm mt-1.5">Add the first event to the threat calendar.</p>
          <button onClick={() => setShowCreateForm(true)}
            className="mt-6 px-7 py-3 bg-red-800 text-white text-sm font-semibold rounded-xl hover:bg-red-900 transition">
            Add First Event
          </button>
        </div>

      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Search className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-600 font-semibold">No events match your filters.</p>
          <button onClick={clearFilters}
            className="mt-4 px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">
            Clear Filters
          </button>
        </div>

      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((e) => (
            <EventCard
              key={e._id}
              event={e}
              onEdit={() => { setSelectedEvent(e); setIsEditModalOpen(true); }}
              onDelete={() => setDeleteTarget(e)}
            />
          ))}
        </div>
      )}

      <EditThreatCalendarModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={selectedEvent}
        onUpdateSuccess={fetchEvents}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          event={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ViewThreatCalendar;