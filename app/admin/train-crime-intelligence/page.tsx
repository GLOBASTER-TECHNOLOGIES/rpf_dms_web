"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    AlertTriangle, Plus, RefreshCw, Train, Search,
    ChevronDown, ChevronUp, Edit2, Trash2, ShieldAlert,
    TrendingUp, Activity, X, Save, ArrowLeft, BookCopy
} from "lucide-react";
import { ITrainCrimeIntelligence } from "@/models/TrainCrimeIntelligence";
import CreateTrainIntelForm from "@/components/trainCrimeIntel/Createtrainintelform";
import EditTrainIntelModal from "@/components/trainCrimeIntel/Edittrainintelmodal";

type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A";
type SortField = "trainNumber" | "riskLevel" | "totalIncidents" | "updatedAt";
type SortDir = "asc" | "desc";

const RISK_META: Record<RiskLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: { label: "Critical", bg: "bg-red-100", text: "text-red-800", border: "border-red-200", dot: "bg-red-600" },
    HIGH: { label: "High", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" },
    MEDIUM: { label: "Medium", bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
    LOW: { label: "Low", bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" },
    "N/A": { label: "N/A", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
};

const RISK_ORDER: Record<RiskLevel, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, "N/A": 4 };

function RiskBadge({ level }: { level: RiskLevel }) {
    const m = RISK_META[level] ?? RISK_META["N/A"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${m.bg} ${m.text} ${m.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            {m.label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function TrainCrimeIntelligencePage() {
    const [records, setRecords] = useState<ITrainCrimeIntelligence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState<RiskLevel | "ALL">("ALL");
    const [sortField, setSortField] = useState<SortField>("updatedAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
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
        } catch { alert("Failed to delete record."); }
        finally { setDeleting(false); }
    };

    const stats = {
        total: records.length,
        critical: records.filter(r => r.riskLevel === "CRITICAL").length,
        totalIncidents: records.reduce((s, r) => s + (r.totalIncidents ?? 0), 0),
        highRisk: records.filter(r => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL").length,
    };

    const filtered = records
        .filter(r => {
            const matchSearch = !search || r.trainNumber.toLowerCase().includes(search.toLowerCase());
            const matchRisk = filterRisk === "ALL" || r.riskLevel === filterRisk;
            return matchSearch && matchRisk;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortField === "trainNumber") cmp = a.trainNumber.localeCompare(b.trainNumber);
            else if (sortField === "riskLevel") cmp = (RISK_ORDER[a.riskLevel] ?? 4) - (RISK_ORDER[b.riskLevel] ?? 4);
            else if (sortField === "totalIncidents") cmp = (a.totalIncidents ?? 0) - (b.totalIncidents ?? 0);
            else if (sortField === "updatedAt") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            return sortDir === "asc" ? cmp : -cmp;
        });

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("asc"); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 text-slate-300" />;
        return sortDir === "asc"
            ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
            : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />;
    };

    const FILTER_OPTIONS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "N/A"] as const;
    const FILTER_ACTIVE = "bg-slate-900 text-white border-slate-900";
    const FILTER_IDLE = "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50";

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* ── Back Button ── */}
                        <Link
                            href="/admin"
                            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex items-center justify-center"
                            title="Back to Admin"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                                <Train className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-black text-slate-900 leading-tight tracking-tight">
                                    Train Crime Intelligence
                                </h1>
                                <p className="text-xs font-medium text-slate-500">RPF · Risk & RA Case Registry</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchRecords}
                            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Record
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-5">
                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Train} label="Total Trains" value={stats.total} color="bg-blue-600" />
                    <StatCard icon={ShieldAlert} label="Critical Risk" value={stats.critical} color="bg-red-600" />
                    <StatCard icon={Activity} label="Total Incidents" value={stats.totalIncidents.toLocaleString()} color="bg-violet-600" />
                    <StatCard icon={TrendingUp} label="High + Critical" value={stats.highRisk} sub="Priority duty required" color="bg-orange-500" />
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by train number…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {FILTER_OPTIONS.map(r => (
                            <button
                                key={r}
                                onClick={() => setFilterRisk(r)}
                                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${filterRisk === r ? FILTER_ACTIVE : FILTER_IDLE}`}
                            >
                                {r === "ALL" ? "All" : r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-800 text-sm font-medium rounded-lg px-4 py-3">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── Table ── */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-slate-500 text-sm font-medium gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            Loading records…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <Train className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500">No records found</p>
                            <p className="text-xs text-slate-400">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        {([
                                            { label: "Train No.", field: "trainNumber" },
                                            { label: "Risk Level", field: "riskLevel" },
                                            { label: "Incidents", field: "totalIncidents" },
                                            { label: "Top Crime", field: null },
                                            { label: "Duty Action", field: null },
                                            { label: "RA Cases", field: null },
                                            { label: "Updated", field: "updatedAt" },
                                            { label: "", field: null },
                                        ] as { label: string; field: SortField | null }[]).map(({ label, field }) => (
                                            <th
                                                key={label}
                                                onClick={field ? () => toggleSort(field) : undefined}
                                                className={`px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap ${field ? "cursor-pointer hover:text-slate-900 select-none" : ""}`}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    {label}
                                                    {field && <SortIcon field={field} />}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(rec => {
                                        const topCrime = rec.crimeProfile?.sort((a, b) => b.count - a.count)[0];
                                        const raTotal = rec.raCases
                                            ? Object.values(rec.raCases).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0)
                                            : 0;
                                        return (
                                            <tr key={String(rec._id)} className="hover:bg-blue-50/50 transition-colors group">
                                                <td className="px-4 py-3.5">
                                                    <span className="font-black text-slate-900 tracking-wider text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                                                        {rec.trainNumber}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <RiskBadge level={rec.riskLevel as RiskLevel} />
                                                </td>
                                                <td className="px-4 py-3.5 font-bold text-slate-800" style={{ fontFamily: "'DM Mono', monospace" }}>
                                                    {rec.totalIncidents ?? 0}
                                                </td>
                                                <td className="px-4 py-3.5 max-w-[160px] truncate">
                                                    {topCrime ? (
                                                        <span>
                                                            <span className="font-semibold text-slate-800">{topCrime.crimeType}</span>
                                                            <span className="text-slate-500 ml-1 font-mono text-xs">×{topCrime.count}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-700 max-w-[180px] truncate font-medium">
                                                    {rec.primaryDutyAction || <span className="text-slate-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${raTotal > 0 ? "bg-violet-50 text-violet-800 border-violet-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                                        {raTotal} cases
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-500 text-xs font-medium whitespace-nowrap">
                                                    {new Date(rec.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditTarget(rec)}
                                                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-700 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(String(rec._id))}
                                                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filtered.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                            Showing {filtered.length} of {records.length} records
                        </div>
                    )}
                </div>
            </div>

            {showCreate && (
                <CreateTrainIntelForm onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchRecords(); }} />
            )}
            {editTarget && (
                <EditTrainIntelModal record={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); fetchRecords(); }} />
            )}

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-base">Delete Record?</p>
                                <p className="text-sm text-slate-600 mt-1">This action is permanent and cannot be undone. All data for this train will be removed.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60">
                                {deleting ? "Deleting…" : "Delete Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}