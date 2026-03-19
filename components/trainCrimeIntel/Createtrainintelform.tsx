"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Train, ChevronDown } from "lucide-react";

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

interface Props { onClose: () => void; onSuccess: () => void; }

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

const EMPTY_FORM: FormData = {
    trainNumber: "", riskLevel: "N/A", totalIncidents: 0, crimeProfile: [],
    primaryDutyAction: "",
    raCases: { sec141: 0, sec144: 0, sec145b: 0, sec155: 0, sec156: 0, sec162: 0, sec163: 0, sec164: 0 },
};

const INPUT = "w-full px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
const LABEL = "block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider";

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">{children}</p>
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    );
}

export default function CreateTrainIntelForm({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const setRaCase = (key: keyof FormData["raCases"], value: number) =>
        setForm(prev => ({ ...prev, raCases: { ...prev.raCases, [key]: value } }));

    const addCrimeProfile = () =>
        setField("crimeProfile", [...form.crimeProfile, { crimeType: "", count: 0 }]);

    const removeCrimeProfile = (i: number) =>
        setField("crimeProfile", form.crimeProfile.filter((_, idx) => idx !== i));

    const updateCrimeProfile = (i: number, key: keyof CrimeProfileEntry, value: string | number) => {
        const updated = [...form.crimeProfile];
        updated[i] = { ...updated[i], [key]: value };
        setField("crimeProfile", updated);
    };

    const handleSubmit = async () => {
        if (!form.trainNumber.trim()) { setError("Train number is required."); return; }
        setSubmitting(true); setError(null);
        try {
            const res = await fetch("/api/train-crime-intelligence/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message ?? `Server error ${res.status}`);
            }
            onSuccess();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to create record.");
        } finally { setSubmitting(false); }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <div
                // ADDED: overflow-hidden is critical here so the scrollable body doesn't bleed under the footer
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col border border-slate-200 overflow-hidden"
                style={{ maxHeight: "min(88vh, 680px)" }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                            <Train className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-sm leading-tight">New Train Record</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Train Crime Intelligence</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                {/* ADDED: min-h-0 allows flex child to properly calculate overflow heights */}
                <div className="overflow-y-auto flex-1 min-h-0 px-5 py-5 space-y-5">

                    <SectionHeading>Train Identity</SectionHeading>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL}>
                                Train Number <span className="text-red-600 normal-case tracking-normal">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.trainNumber}
                                onChange={e => setField("trainNumber", e.target.value.toUpperCase())}
                                placeholder="e.g. 12345"
                                className={INPUT}
                                style={{ fontFamily: "'DM Mono', monospace" }}
                            />
                        </div>
                        <div>
                            <label className={LABEL}>Risk Level</label>
                            <div className="relative w-full">
                                <select
                                    value={form.riskLevel}
                                    onChange={e => setField("riskLevel", e.target.value as RiskLevel)}
                                    // ADDED: Extra safeguards to enforce appearance-none across all browsers
                                    className={`${INPUT} appearance-none pr-9 font-bold cursor-pointer ${RISK_COLORS[form.riskLevel]}`}
                                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                >
                                    {RISK_OPTIONS.map(r => (
                                        <option key={r} value={r} className="bg-white text-slate-900 font-semibold">{r}</option>
                                    ))}
                                </select>
                                {/* FIXED: Re-positioned to the right boundary clearly */}
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
                                placeholder="e.g. Escort duty"
                                className={INPUT}
                            />
                        </div>
                    </div>

                    <SectionHeading>Crime Profile</SectionHeading>

                    <div>
                        {form.crimeProfile.length === 0 && (
                            <p className="text-xs font-medium text-slate-400 py-4 border border-dashed border-slate-300 rounded-lg text-center bg-slate-50 mb-3">
                                No crime types added yet.
                            </p>
                        )}
                        <div className="space-y-2.5">
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
                                    <button onClick={() => removeCrimeProfile(i)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex-shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCrimeProfile}
                            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors w-fit"
                        >
                            <Plus className="w-4 h-4" />
                            Add crime type
                        </button>
                    </div>

                    <SectionHeading>Railway Act Cases</SectionHeading>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-2">
                        {(Object.keys(RA_LABELS) as (keyof FormData["raCases"])[]).map(key => (
                            <div key={key}>
                                {/* REMOVED: truncate class so the longer text like "Drunkenness / Nuisance" safely wraps instead of cutting off */}
                                <label className="block text-[11px] leading-tight font-semibold text-slate-600 mb-1.5">{RA_LABELS[key]}</label>
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
                <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
                    {error ? (
                        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{error}</p>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2.5">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
                        >
                            {submitting ? "Creating…" : "Create Record"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}