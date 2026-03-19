"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Loader2, Calendar, MapPin, FileText, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CreateBriefing from "@/components/briefing/CreateBriefingForm";
import EditBriefing from "@/components/briefing/EditBriefingForm";

const SHIFT_CONFIG: Record<string, { color: string; dot: string }> = {
    Morning: { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    Afternoon: { color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
    Night: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
};

export default function BriefingPage() {
    const router = useRouter();
    const [view, setView] = useState<"list" | "create" | "edit">("list");
    const [briefings, setBriefings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBriefing, setSelectedBriefing] = useState<any>(null);

    const fetchBriefings = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/briefing/get");
            setBriefings(res.data.data || []);
        } catch {
            toast.error("Failed to load briefings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBriefings(); }, []);

    const handleEdit = (briefing: any) => {
        setSelectedBriefing(briefing);
        setView("edit");
    };

    if (view === "create") return (
        <Shell router={router}>
            <CreateBriefing
                onSuccess={() => { setView("list"); fetchBriefings(); }}
                onCancel={() => setView("list")}
            />
        </Shell>
    );

    if (view === "edit") return (
        <Shell router={router}>
            <EditBriefing
                briefing={selectedBriefing}
                onSuccess={() => { setView("list"); fetchBriefings(); }}
                onCancel={() => setView("list")}
            />
        </Shell>
    );

    return (
        <Shell router={router}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[11px] font-medium tracking-widest text-slate-400 uppercase mb-1">
                        Railway Protection Force
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">Duty Briefings</h1>
                </div>
                <button
                    onClick={() => setView("create")}
                    className="flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <Plus size={15} />
                    New Briefing
                </button>
            </div>

            {/* Record count */}
            {!loading && briefings.length > 0 && (
                <p className="text-xs text-slate-400 mb-3">
                    {briefings.length} script{briefings.length !== 1 ? "s" : ""} on record
                </p>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-slate-300" size={26} />
                </div>
            ) : briefings.length === 0 ? (
                <EmptyState onNew={() => setView("create")} />
            ) : (
                <div className="flex flex-col gap-2">
                    {briefings.map((b: any) => (
                        <BriefingCard key={b._id} briefing={b} onEdit={() => handleEdit(b)} />
                    ))}
                </div>
            )}
        </Shell>
    );
}

function Shell({ children, router }: { children: React.ReactNode; router: any }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-8 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.push("/admin")}
                    className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 mb-6 transition-colors group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Admin
                </button>

                {children}
            </div>
        </div>
    );
}

function BriefingCard({ briefing: b, onEdit }: { briefing: any; onEdit: () => void }) {
    const shift = SHIFT_CONFIG[b.shift] ?? SHIFT_CONFIG["Morning"];
    const preview = b.briefingScript?.substring(0, 130)?.trim() || "No script content.";
    const date = b.dutyDate
        ? new Date(b.dutyDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";

    return (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className={`w-0.5 self-stretch rounded-full shrink-0 ${shift.dot} opacity-60`} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        <MapPin size={9} /> {b.post || "N/A"}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${shift.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${shift.dot}`} />
                        {b.shift}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar size={9} /> {date}
                    </span>
                </div>
                <p className="text-sm text-slate-500 italic leading-snug truncate">
                    "{preview}{(b.briefingScript?.length ?? 0) > 130 ? "…" : ""}"
                </p>
            </div>
            <button
                onClick={onEdit}
                className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors"
            >
                Edit
            </button>
        </div>
    );
}

function EmptyState({ onNew }: { onNew: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FileText size={18} className="text-slate-400" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-700">No briefings yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Create your first duty briefing script to get started.</p>
            </div>
            <button
                onClick={onNew}
                className="text-xs font-semibold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
                + New Briefing
            </button>
        </div>
    );
}