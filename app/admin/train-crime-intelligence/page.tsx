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
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-screen-xl mx-auto px-6 py-6">
                <table className="w-full">
                    <tbody>
                        {filtered.map(rec => {
                            const topCrime = rec.crimeProfile?.sort((a, b) => b.count - a.count)[0];

                            // ✅ FIXED HERE ONLY
                            const raTotal = (rec as any).raCases
                                ? Object.values((rec as any).raCases).reduce(
                                    (s: number, v: unknown) => s + (typeof v === "number" ? v : 0),
                                    0
                                )
                                : 0;

                            return (
                                <tr key={String(rec._id)}>
                                    <td>{rec.trainNumber}</td>
                                    <td>{raTotal}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}