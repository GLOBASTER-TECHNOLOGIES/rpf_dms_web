"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    AlertTriangle, Plus, RefreshCw, Train, Search,
    ChevronDown, ChevronUp, Edit2, Trash2, ShieldAlert,
    Activity, ArrowLeft, AlertCircle, FileText
} from "lucide-react";
import { ITrainCrimeIntelligence } from "@/models/TrainCrimeIntelligence";

// Assuming these components exist in your project as imported:
import CreateTrainIntelForm from "@/components/trainCrimeIntel/Createtrainintelform";
import EditTrainIntelModal from "@/components/trainCrimeIntel/Edittrainintelmodal";

type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A";
type SortField = "trainNumber" | "riskLevel" | "totalIncidents" | "updatedAt";
type SortDir = "asc" | "desc";

const RISK_META: Record<RiskLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: { label: "Critical", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-600" },
    HIGH: { label: "High", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
    MEDIUM: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    LOW: { label: "Low", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    "N/A": { label: "N/A", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
};

const RISK_ORDER: Record<RiskLevel, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, "N/A": 4 };

function RiskBadge({ level }: { level: RiskLevel }) {
    const m = RISK_META[level] ?? RISK_META["N/A"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-sm ${m.bg} ${m.text} ${m.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot} animate-pulse`} />
            {m.label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm transition-all hover:shadow-md">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
            </div>
        </div>
    );
}

export default function TrainCrimeIntelligencePage() {
    const [records, setRecords] = useState<ITrainCrimeIntelligence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtering & Sorting State
    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState<RiskLevel | "ALL">("ALL");
    const [sortField, setSortField] = useState<SortField>("updatedAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    // Modal & Action State
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<ITrainCrimeIntelligence | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchRecords = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await fetch("/api/train-crime-intelligence/get");
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const json = await res.json();
            setRecords(json.data ?? []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to fetch records");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/train-intel/delete?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            setDeleteId(null);
            await fetchRecords();
        } catch {
            alert("Failed to delete record.");
        } finally {
            setDeleting(false);
        }
    };

    // Calculate Dashboard Stats
    const stats = {
        total: records.length,
        critical: records.filter(r => r.riskLevel === "CRITICAL").length,
        totalIncidents: records.reduce((s, r) => s + (r.totalIncidents ?? 0), 0),
        highRisk: records.filter(r => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL").length,
    };

    // Apply Filters & Sort
    const filtered = records
        .filter(r => {
            const matchSearch = !search || r.trainNumber.toLowerCase().includes(search.toLowerCase());
            const matchRisk = filterRisk === "ALL" || r.riskLevel === filterRisk;
            return matchSearch && matchRisk;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === "trainNumber") cmp = a.trainNumber.localeCompare(b.trainNumber);
            else if (sortField === "riskLevel") cmp = (RISK_ORDER[a.riskLevel as RiskLevel] ?? 4) - (RISK_ORDER[b.riskLevel as RiskLevel] ?? 4);
            else if (sortField === "totalIncidents") cmp = (a.totalIncidents ?? 0) - (b.totalIncidents ?? 0);
            else if (sortField === "updatedAt") cmp = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
            return sortDir === "asc" ? cmp : -cmp;
        });

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("asc"); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronDown className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortDir === "asc"
            ? <ChevronUp className="w-4 h-4 text-indigo-600" />
            : <ChevronDown className="w-4 h-4 text-indigo-600" />;
    };

    const FILTER_OPTIONS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "N/A"] as const;
    const FILTER_ACTIVE = "bg-slate-900 text-white border-slate-900 shadow-md";
    const FILTER_IDLE = "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50";

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">

                {/* --- TOP NAVIGATION --- */}
                <Link
                    href="/admin"
                    className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Admin Dashboard
                </Link>

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-indigo-600" />
                            Train Crime Intelligence
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Monitor and manage risk profiles for scheduled trains
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchRecords}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 font-bold"
                        >
                            <Plus className="w-5 h-5" /> Add Intel Record
                        </button>
                    </div>
                </div>

                {/* --- STATS ROW --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Train} label="Monitored Trains" value={stats.total} color="bg-blue-600" />
                    <StatCard icon={ShieldAlert} label="Elevated Risk" value={stats.highRisk} sub="High & Critical combined" color="bg-orange-500" />
                    <StatCard icon={AlertTriangle} label="Critical Alerts" value={stats.critical} color="bg-red-600" />
                    <StatCard icon={Activity} label="Total Incidents" value={stats.totalIncidents} sub="Across all active trains" color="bg-indigo-600" />
                </div>

                {/* --- CONTROLS ROW --- */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between gap-4">
                    {/* Search */}
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search train number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
                        />
                    </div>
                    {/* Risk Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Risk:</span>
                        {FILTER_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => setFilterRisk(opt)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${opt === filterRisk ? FILTER_ACTIVE : FILTER_IDLE}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                                    <th
                                        className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                        onClick={() => toggleSort("trainNumber")}
                                    >
                                        <div className="flex items-center gap-2">Train No. <SortIcon field="trainNumber" /></div>
                                    </th>
                                    <th
                                        className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                        onClick={() => toggleSort("riskLevel")}
                                    >
                                        <div className="flex items-center gap-2">Risk Level <SortIcon field="riskLevel" /></div>
                                    </th>
                                    <th className="p-5">Primary Duty Action</th>
                                    <th
                                        className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                        onClick={() => toggleSort("totalIncidents")}
                                    >
                                        <div className="flex items-center gap-2">Incidents <SortIcon field="totalIncidents" /></div>
                                    </th>
                                    <th
                                        className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                        onClick={() => toggleSort("updatedAt")}
                                    >
                                        <div className="flex items-center gap-2">Last Updated <SortIcon field="updatedAt" /></div>
                                    </th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading && records.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-300" />
                                            Loading intelligence records...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-400">
                                            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 opacity-50" />
                                            <p className="font-medium text-base text-slate-500">No records found</p>
                                            <p className="text-xs mt-1">Try adjusting your search or risk filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(rec => {
                                        // Calculate total RA Cases
                                        const raTotal = (rec as any).raCases
                                            ? Object.values((rec as any).raCases).reduce(
                                                (s: number, v: unknown) => s + (typeof v === "number" ? v : 0), 0
                                            ) : 0;

                                        return (
                                            <tr key={String(rec._id)} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="p-5">
                                                    <span className="font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                        {rec.trainNumber}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <RiskBadge level={rec.riskLevel as RiskLevel} />
                                                </td>
                                                <td className="p-5">
                                                    <p className="max-w-xs text-slate-700 font-medium truncate" title={rec.primaryDutyAction}>
                                                        {rec.primaryDutyAction || "—"}
                                                    </p>
                                                    {/* Top Crime Indicator (if available) */}
                                                    {rec.crimeProfile && rec.crimeProfile.length > 0 && (
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider truncate max-w-xs">
                                                            Primary Threat: {rec.crimeProfile.sort((a, b) => b.count - a.count)[0].category}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800">{rec.totalIncidents ?? 0}</span>
                                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                                            {raTotal} RA Cases
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-slate-500 font-medium text-xs">
                                                    {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit", month: "short", year: "numeric"
                                                    }) : "—"}
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditTarget(rec)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit Record"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(String(rec._id))}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                </div>
            </div>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Delete Intelligence Record?</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Are you sure you want to permanently delete this record? This action cannot be undone.
                            </p>
                            <div className="flex w-full gap-3 mt-4">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    disabled={deleting}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteId)}
                                    disabled={deleting}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FORMS/MODALS (Assumes they take onClose and onSuccess) --- */}
            {showCreate && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8">
                        {/* Wrapper div provides relative positioning and a close button just in case the form component doesn't */}
                        <div className="relative p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Add New Intelligence Record</h2>
                            <button onClick={() => setShowCreate(false)} className="p-2 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
                                <Search className="w-4 h-4 rotate-45" /> {/* Using Search rotated as an X fallback */}
                            </button>
                        </div>
                        <div className="p-6">
                            <CreateTrainIntelForm
                                onClose={() => setShowCreate(false)}
                                onSuccess={() => { setShowCreate(false); fetchRecords(); }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {editTarget && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8">
                        <div className="relative p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Edit Record: Train {editTarget.trainNumber}</h2>
                            <button onClick={() => setEditTarget(null)} className="p-2 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
                                <Search className="w-4 h-4 rotate-45" /> {/* Using Search rotated as an X fallback */}
                            </button>
                        </div>
                        <div className="p-6">
                            <EditTrainIntelModal
                                record={editTarget}
                                onClose={() => setEditTarget(null)}
                                onSuccess={() => { setEditTarget(null); fetchRecords(); }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}