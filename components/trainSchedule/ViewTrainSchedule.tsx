"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Train,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertTriangle,
  FileDown,
  Edit,
  Clock,
  Plus,
  Layers,
  X,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateTrainSchedule from "./CreateTrainSchedule";
import EditTrainScheduleModal from "./Edittrainschedulemodal";

interface TrainSchedule {
  _id: string;
  trainNumber: string;
  trainName: string;
  arrivalTime: string;
  departureTime?: string;
  platform: number;
  daysOfRun: string[];
  source: string;
  destination: string;
  createdAt: string;
  updatedAt: string;
}

const exportSchedules = (schedules: TrainSchedule[]) => {
  const headers = ["Train No.", "Train Name", "Source", "Destination", "Arrival", "Departure", "Platform", "Days"];
  const rows = schedules.map((s) => [
    s.trainNumber, s.trainName, s.source, s.destination,
    s.arrivalTime, s.departureTime || "N/A", s.platform, s.daysOfRun.join(", "),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "train_schedules.csv"; a.click();
  URL.revokeObjectURL(url);
};

const extractArray = (data: any): TrainSchedule[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.schedules)) return data.schedules;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DayBadges = ({ days }: { days: string[] }) => (
  <div className="flex gap-1.5 flex-wrap">
    {ALL_DAYS.map((d) => (
      <span key={d} className={`text-[11px] font-bold px-2 py-1 rounded-lg ${days.includes(d) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-300"}`}>
        {d}
      </span>
    ))}
  </div>
);

const DeleteConfirmModal = ({ schedule, onConfirm, onCancel, loading }: {
  schedule: TrainSchedule; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Delete Schedule</h2>
        </div>
        <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><X size={16} /></button>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{schedule.trainNumber}</span>{" "}
          <span className="font-semibold">{schedule.trainName}</span>?
        </p>
        <p className="text-xs text-slate-400 mt-2">This action is permanent and cannot be undone.</p>
      </div>
      <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button onClick={onCancel} disabled={loading} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition bg-white disabled:opacity-50">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

const ViewTrainSchedule = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TrainSchedule | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TrainSchedule | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterDay, setFilterDay] = useState("All");
  const [filterPlatform, setFilterPlatform] = useState("All");

  const handleEditClick = (s: TrainSchedule) => { setSelectedSchedule(s); setIsEditModalOpen(true); };

  const fetchSchedules = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get("/api/trainschedule/get", { headers: { "Cache-Control": "no-cache" } });
      setSchedules(extractArray(res.data));
    } catch (err) {
      setError("Failed to load train schedules. Please try again."); setSchedules([]);
    } finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/trainschedule/delete?id=${deleteTarget._id}`);
      toast.success(`Train ${deleteTarget.trainNumber} deleted`);
      setDeleteTarget(null); fetchSchedules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete schedule");
    } finally { setDeleting(false); }
  };

  useEffect(() => { if (!showCreateForm) fetchSchedules(); }, [showCreateForm]);

  const allPlatforms = useMemo(() =>
    [...new Set(schedules.map((s) => String(s.platform)))].sort((a, b) => Number(a) - Number(b)),
    [schedules]
  );

  const filtered = useMemo(() => schedules.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.trainNumber.toLowerCase().includes(q) || s.trainName.toLowerCase().includes(q) || s.source.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q);
    const matchesDay = filterDay === "All" || s.daysOfRun.includes(filterDay);
    const matchesPlatform = filterPlatform === "All" || String(s.platform) === filterPlatform;
    return matchesSearch && matchesDay && matchesPlatform;
  }), [schedules, search, filterDay, filterPlatform]);

  const hasFilters = search || filterDay !== "All" || filterPlatform !== "All";
  const clearFilters = () => { setSearch(""); setFilterDay("All"); setFilterPlatform("All"); };

  if (showCreateForm) {
    return (
      <div className="space-y-5 p-6">
        <button onClick={() => setShowCreateForm(false)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium text-sm">
          <ArrowLeft size={18} /> Back to Schedules
        </button>
        <CreateTrainSchedule onSuccess={() => setShowCreateForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="bg-slate-900 px-8 py-6 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0 p-1">
            <Image src="/rpf_logo.png" alt="RPF Logo" width={48} height={48} className="object-contain w-full h-full" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Train Schedules</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage train timings and platforms</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => schedules.length > 0 && exportSchedules(schedules)}
            disabled={schedules.length === 0}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40"
          >
            <FileDown size={16} /> Export
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow"
          >
            <Plus size={16} /> New Schedule
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{error}</div>}

      {/* Search & Filter Bar */}
      {!loading && schedules.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by train number, name, source or destination..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Day filter */}
            <div className="relative">
              <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                className="pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
              >
                <option value="All">All Days</option>
                {ALL_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Platform filter */}
            <div className="relative">
              <Layers size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                className="pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
              >
                <option value="All">All Platforms</option>
                {allPlatforms.map((p) => <option key={p} value={p}>Platform {p}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition px-3 py-3 rounded-xl hover:bg-slate-100 whitespace-nowrap">
                <X size={14} /> Clear
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-700 font-bold">{filtered.length}</span> of <span className="text-slate-700 font-bold">{schedules.length}</span> schedules
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin text-slate-700 mb-3" size={30} />
          <p className="text-slate-500 text-sm">Loading Schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Train className="mx-auto text-slate-300 mb-4" size={42} />
          <p className="text-slate-600 font-semibold text-base">No train schedules found.</p>
          <p className="text-slate-400 text-sm mt-1">Add the first train schedule for this post.</p>
          <button onClick={() => setShowCreateForm(true)} className="mt-5 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition">
            Add First Schedule
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Search className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-slate-500 font-medium">No schedules match your filters.</p>
          <button onClick={clearFilters} className="mt-4 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Train</th>
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival</th>
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Departure</th>
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</th>
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Days</th>
                  <th className="px-7 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-7 py-5">
                      <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-3 py-1.5 rounded-lg">{s.trainNumber}</span>
                      <p className="text-sm text-slate-600 font-medium mt-2">{s.trainName}</p>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="font-mono font-bold text-slate-800 text-base">{s.source}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="font-mono font-bold text-slate-800 text-base">{s.destination}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2 text-slate-700 font-mono text-sm font-bold">
                        <Clock size={14} className="text-slate-300" />{s.arrivalTime}
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      {s.departureTime ? (
                        <div className="flex items-center gap-2 text-slate-700 font-mono text-sm font-bold">
                          <Clock size={14} className="text-slate-300" />{s.departureTime}
                        </div>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-slate-300" />
                        <span className="font-mono font-bold text-slate-900 text-base">{s.platform}</span>
                      </div>
                    </td>
                    <td className="px-7 py-5"><DayBadges days={s.daysOfRun} /></td>
                    <td className="px-7 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleEditClick(s)} className="p-2.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors" title="Edit">
                          <Edit size={17} />
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filtered.map((s) => (
              <div key={s._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-base bg-slate-100 px-3 py-1.5 rounded-lg">{s.trainNumber}</span>
                    <p className="text-sm font-semibold text-slate-700 mt-2">{s.trainName}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Layers size={12} /> Pf. {s.platform}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-800 pt-4 border-t border-slate-100">
                  <span className="bg-slate-100 px-2.5 py-1.5 rounded-lg">{s.source}</span>
                  <ArrowRight size={14} className="text-slate-300" />
                  <span className="bg-slate-100 px-2.5 py-1.5 rounded-lg">{s.destination}</span>
                </div>
                <div className="flex gap-5 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Clock size={13} className="text-slate-300" />Arr: <span className="font-mono font-semibold text-slate-800">{s.arrivalTime}</span></div>
                  {s.departureTime && <div className="flex items-center gap-1.5"><Clock size={13} className="text-slate-300" />Dep: <span className="font-mono font-semibold text-slate-800">{s.departureTime}</span></div>}
                </div>
                <div className="pt-3 border-t border-slate-100"><DayBadges days={s.daysOfRun} /></div>
                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button onClick={() => handleEditClick(s)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition border border-slate-100">
                    <Edit size={15} /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(s)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition border border-red-100">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <EditTrainScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        schedule={selectedSchedule}
        onUpdateSuccess={fetchSchedules}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          schedule={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ViewTrainSchedule;