"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Train, ChevronDown, Save } from "lucide-react";
import { ITrainCrimeIntelligence } from "@/models/TrainCrimeIntelligence";

type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A";

interface CrimeProfileEntry { crimeType: string; count: number; }

interface FormData {
    trainNumber: string;
    riskLevel: RiskLevel;
    totalIncidents: number;
    crimeProfile: CrimeProfileEntry[];
    primaryDutyAction: string;
    raCases: {
        sec141: number; sec144: number; sec145b: number; sec155: number;
        sec156: number; sec162: number; sec163: number; sec164: number;
    };
}

// ── Props: requires the existing record ──────────────────────────────────────
interface Props {
    record: ITrainCrimeIntelligence;
    onClose: () => void;
    onSuccess: () => void;
}

const RA_LABELS: Record<keyof FormData["raCases"], string> = {
    sec141: "Sec 141 — Trespass",
    sec144: "Sec 144 — Unlawful possession",
    sec145b: "Sec 145B — Drunkenness / Nuisance",
    sec155: "Sec 155 — Reserved compartment",
    sec156: "Sec 156 — Roof riding",
    sec162: "Sec 162 — Ladies carriage",
    sec163: "Sec 163 — False declaration",
    sec164: "Sec 164 — Dangerous goods",
};

const RISK_OPTIONS: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "N/A"];

const RISK_COLORS: Record<RiskLevel, string> = {
    CRITICAL: "text-red-700 bg-red-50",
    HIGH: "text-orange-700 bg-orange-50",
    MEDIUM: "text-amber-700 bg-amber-50",
    LOW: "text-emerald-700 bg-emerald-50",
    "N/A": "text-slate-700 bg-white",
};

const RISK_BADGE: Record<RiskLevel, string> = {
    CRITICAL: "text-red-800 bg-red-100 border-red-300",
    HIGH: "text-orange-800 bg-orange-100 border-orange-300",
    MEDIUM: "text-amber-800 bg-amber-100 border-amber-300",
    LOW: "text-emerald-800 bg-emerald-100 border-emerald-300",
    "N/A": "text-slate-700 bg-slate-100 border-slate-300",
};

const INPUT = "w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
const LABEL = "block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider";

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">{children}</p>
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    );
}

export default function EditTrainIntelModal({ record, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<FormData>({
        trainNumber: "",
        riskLevel: "N/A",
        totalIncidents: 0,
        crimeProfile: [],
        primaryDutyAction: "",
        raCases: { sec141: 0, sec144: 0, sec145b: 0, sec155: 0, sec156: 0, sec162: 0, sec163: 0, sec164: 0 },
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);

    // ── Populate form from record on mount / record change ───────────────────
    useEffect(() => {
        setForm({
            trainNumber: record.trainNumber ?? "",
            riskLevel: (record.riskLevel as RiskLevel) ?? "N/A",
            totalIncidents: record.totalIncidents ?? 0,
            crimeProfile: (record.crimeProfile ?? []).map(c => ({
                crimeType: c.crimeType,
                count: c.count,
            })),
            primaryDutyAction: record.primaryDutyAction ?? "",
            raCases: {
                sec141: record.raCases?.sec141 ?? 0,
                sec144: record.raCases?.sec144 ?? 0,
                sec145b: record.raCases?.sec145b ?? 0,
                sec155: record.raCases?.sec155 ?? 0,
                sec156: record.raCases?.sec156 ?? 0,
                sec162: record.raCases?.sec162 ?? 0,
                sec163: record.raCases?.sec163 ?? 0,
                sec164: record.raCases?.sec164 ?? 0,
            },
        });
        setDirty(false);
    }, [record]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setDirty(true);
    };

    const setRaCase = (key: keyof FormData["raCases"], value: number) => {
        setForm(prev => ({ ...prev, raCases: { ...prev.raCases, [key]: value } }));
        setDirty(true);
    };

    const addCrimeProfile = () =>
        setField("crimeProfile", [...form.crimeProfile, { crimeType: "", count: 0 }]);

    const removeCrimeProfile = (i: number) =>
        setField("crimeProfile", form.crimeProfile.filter((_, idx) => idx !== i));

    const updateCrimeProfile = (i: number, key: keyof CrimeProfileEntry, value: string | number) => {
        const updated = [...form.crimeProfile];
        updated[i] = { ...updated[i], [key]: value };
        setField("crimeProfile", updated);
    };

    // ── Submit → PUT /api/train-crime-intelligence/update?id=<_id> ───────────
    const handleSubmit = async () => {
        if (!form.trainNumber.trim()) { setError("Train number is required."); return; }
        setSubmitting(true);
        setError(null);
        try {
            // record._id is an ObjectId from Mongoose — convert to string for the query param
            const id = String(record._id);
            const res = await fetch(`/api/train-crime-intelligence/update?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message ?? `Server error ${res.status}`);
            }
            onSuccess();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to update record.");
        } finally {
            setSubmitting(false);
        }
    };

    const riskLevel = form.riskLevel ?? "N/A";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col border border-slate-200"
                style={{ maxHeight: "min(88vh, 680px)" }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 flex-shrink-0 bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                            <Train className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900 text-sm leading-tight">Edit Record</p>
                                {/* Show train number as a coloured badge matching risk level */}
                                <span
                                    className={`text-[11px] font-black tracking-wider px-2 py-0.5 rounded border ${RISK_BADGE[riskLevel]}`}
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                >
                                    {form.trainNumber || record.trainNumber}
                                </span>
                                {dirty && (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                                        Unsaved
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-500">Train Crime Intelligence</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                    <SectionHeading>Train Identity</SectionHeading>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={LABEL}>
                                Train Number <span className="text-red-600 normal-case tracking-normal">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.trainNumber}
                                onChange={e => setField("trainNumber", e.target.value.toUpperCase())}
                                className={INPUT}
                                style={{ fontFamily: "'DM Mono', monospace" }}
                            />
                        </div>
                        <div>
                            <label className={LABEL}>Risk Level</label>
                            <div className="relative">
                                <select
                                    value={riskLevel}
                                    onChange={e => setField("riskLevel", e.target.value as RiskLevel)}
                                    className={`${INPUT} appearance-none pr-8 font-bold ${RISK_COLORS[riskLevel]}`}
                                >
                                    {RISK_OPTIONS.map(r => (
                                        <option key={r} value={r} className="bg-white text-slate-900 font-semibold">{r}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className={LABEL}>Total Incidents</label>
                            <input
                                type="number" min={0} value={form.totalIncidents}
                                onChange={e => setField("totalIncidents", Number(e.target.value))}
                                className={INPUT}
                                style={{ fontFamily: "'DM Mono', monospace" }}
                            />
                        </div>
                        <div>
                            <label className={LABEL}>Primary Duty Action</label>
                            <input
                                type="text" value={form.primaryDutyAction}
                                onChange={e => setField("primaryDutyAction", e.target.value)}
                                placeholder="e.g. Escort duty on all trips"
                                className={INPUT}
                            />
                        </div>
                    </div>

                    <SectionHeading>Crime Profile</SectionHeading>

                    <div>
                        {form.crimeProfile.length === 0 && (
                            <p className="text-xs font-medium text-slate-400 py-2.5 border border-dashed border-slate-300 rounded-lg text-center bg-slate-50 mb-2">
                                No crime types added yet.
                            </p>
                        )}
                        <div className="space-y-2">
                            {form.crimeProfile.map((entry, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="text" value={entry.crimeType}
                                        placeholder="Crime type"
                                        onChange={e => updateCrimeProfile(i, "crimeType", e.target.value)}
                                        className={`${INPUT} flex-1 min-w-0`}
                                    />
                                    <input
                                        type="number" min={0} value={entry.count}
                                        onChange={e => updateCrimeProfile(i, "count", Number(e.target.value))}
                                        className="w-20 px-2 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-shrink-0"
                                        style={{ fontFamily: "'DM Mono', monospace" }}
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={() => removeCrimeProfile(i)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex-shrink-0"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCrimeProfile}
                            className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add crime type
                        </button>
                    </div>

                    <SectionHeading>Railway Act Cases</SectionHeading>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 pb-1">
                        {(Object.keys(RA_LABELS) as (keyof FormData["raCases"])[]).map(key => (
                            <div key={key}>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">{RA_LABELS[key]}</label>
                                <input
                                    type="number" min={0} value={form.raCases[key]}
                                    onChange={e => setRaCase(key, Number(e.target.value))}
                                    className={INPUT}
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-slate-50 rounded-b-2xl">
                    {error ? (
                        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{error}</p>
                    ) : (
                        <span className="text-[11px] font-medium text-slate-400">
                            Last updated:{" "}
                            {new Date(record.updatedAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                            })}
                        </span>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !dirty}
                            className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}