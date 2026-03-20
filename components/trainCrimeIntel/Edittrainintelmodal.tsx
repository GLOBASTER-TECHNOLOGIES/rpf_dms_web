"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Train, ChevronDown, Save } from "lucide-react";
import { ITrainCrimeIntelligence } from "@/models/TrainCrimeIntelligence";

// ── Types ─────────────────────────────────────────────────────────────────
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "N/A";

export interface CrimeProfileEntry {
    crimeType: string;
    count: number;
}

export interface FormData {
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

// ── Props ─────────────────────────────────────────────────────────────────
interface Props {
    record: ITrainCrimeIntelligence;
    onClose: () => void;
    onSuccess: () => void;
}

// ── Constants & Styles ────────────────────────────────────────────────────
const RA_LABELS: Record<keyof FormData["raCases"], string> = {
    sec141: "Sec 141 — Alarm Chain Pulling",
    sec144: "Sec 144 — Unauthorised Vending",
    sec145b: "Sec 145B — Drunkenness / Nuisance",
    sec155: "Sec 155 — Unauth. Entry In Disabled/Reserved",
    sec156: "Sec 156 — Foot Board Journey",
    sec162: "Sec 162 — Men Traveling in Ladies Compartment",
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
const LABEL = "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider";

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 pt-4 pb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em] whitespace-nowrap">{children}</p>
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function FullScreenEditTrainIntel({ record, onClose, onSuccess }: Props) {
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

    const handleSubmit = async () => {
        if (!form.trainNumber.trim()) { setError("Train number is required."); return; }
        setSubmitting(true);
        setError(null);
        try {
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
            className="fixed inset-0 z-50 flex flex-col bg-slate-50 w-screen h-screen overflow-hidden"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* ── Sticky Header ── */}
            <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                        <Train className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-black text-slate-900 text-lg leading-tight">Edit Train Intelligence</h1>
                            <span
                                className={`text-xs font-black tracking-wider px-2.5 py-0.5 rounded border ${RISK_BADGE[riskLevel]}`}
                                style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                                {form.trainNumber || record.trainNumber}
                            </span>
                            {dirty && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase tracking-wider">
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Manage crime profiles and incident reports</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </header>

            {/* ── Scrollable Form Body ── */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">

                    {/* Section: Train Identity */}
                    <div>
                        <SectionHeading>Train Identity & Overview</SectionHeading>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
                            <div className="lg:col-span-1">
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
                            <div className="lg:col-span-1">
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
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="lg:col-span-1">
                                <label className={LABEL}>Total Incidents</label>
                                <input
                                    type="number" min={0} value={form.totalIncidents}
                                    onChange={e => setField("totalIncidents", Number(e.target.value))}
                                    className={INPUT}
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className={LABEL}>Primary Duty Action</label>
                                <input
                                    type="text" value={form.primaryDutyAction}
                                    onChange={e => setField("primaryDutyAction", e.target.value)}
                                    placeholder="e.g. Escort duty"
                                    className={INPUT}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Crime Profile */}
                    <div>
                        <SectionHeading>Crime Profile</SectionHeading>
                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            {form.crimeProfile.length === 0 && (
                                <div className="text-sm font-medium text-slate-400 py-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-white mb-3">
                                    No crime types recorded for this train.
                                </div>
                            )}
                            <div className="space-y-3">
                                {form.crimeProfile.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text" value={entry.crimeType}
                                                placeholder="Enter crime type (e.g., Theft of Passenger Belongings)"
                                                onChange={e => updateCrimeProfile(i, "crimeType", e.target.value)}
                                                className={INPUT}
                                            />
                                        </div>
                                        <div className="w-28">
                                            <input
                                                type="number" min={0} value={entry.count}
                                                onChange={e => updateCrimeProfile(i, "count", Number(e.target.value))}
                                                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                style={{ fontFamily: "'DM Mono', monospace" }}
                                                placeholder="Count"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeCrimeProfile(i)}
                                            className="p-2.5 text-red-500 hover:bg-red-100 rounded-lg border border-red-200 transition-colors flex-shrink-0"
                                            title="Remove crime type"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addCrimeProfile}
                                className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Crime Type
                            </button>
                        </div>
                    </div>

                    {/* Section: Railway Act Cases */}
                    <div>
                        <SectionHeading>Railway Act Cases</SectionHeading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-4 mt-4">
                            {(Object.keys(RA_LABELS) as (keyof FormData["raCases"])[]).map(key => (
                                <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <label className="block text-xs font-semibold text-slate-700 mb-2 h-8 leading-tight">
                                        {RA_LABELS[key]}
                                    </label>
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

                </div>
            </main>

            {/* ── Sticky Footer ── */}
            <footer className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
                    <div className="flex-1">
                        {error ? (
                            <p className="inline-block text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                {error}
                            </p>
                        ) : (
                            <span className="text-xs font-medium text-slate-400">
                                Last updated:{" "}
                                {new Date(record.updatedAt).toLocaleDateString("en-IN", {
                                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                })}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !dirty}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}