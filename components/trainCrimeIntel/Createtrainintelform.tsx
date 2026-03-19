"use client";

import React, { useState, useRef } from "react";
import { X, Plus, Trash2, Train, ChevronDown, UploadCloud, Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";

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
    const [mode, setMode] = useState<"single" | "bulk">("single");
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false); // Track drag state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Single Form Handlers ---
    const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => setForm(prev => ({ ...prev, [key]: value }));
    const setRaCase = (key: keyof FormData["raCases"], value: number) => setForm(prev => ({ ...prev, raCases: { ...prev.raCases, [key]: value } }));
    const addCrimeProfile = () => setField("crimeProfile", [...form.crimeProfile, { crimeType: "", count: 0 }]);
    const removeCrimeProfile = (i: number) => setField("crimeProfile", form.crimeProfile.filter((_, idx) => idx !== i));
    const updateCrimeProfile = (i: number, key: keyof CrimeProfileEntry, value: string | number) => {
        const updated = [...form.crimeProfile];
        updated[i] = { ...updated[i], [key]: value };
        setField("crimeProfile", updated);
    };

    // --- Drag and Drop Handlers ---
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            const ext = droppedFile.name.split('.').pop()?.toLowerCase();

            // Validate file extension
            if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
                setFile(droppedFile);
            } else {
                setError("Invalid file type. Please upload a .xlsx, .xls, or .csv file.");
            }
        }
    };

    // --- Bulk Upload Handlers ---
    const downloadTemplate = () => {
        const templateData = [
            {
                trainNumber: "12345", riskLevel: "HIGH", totalIncidents: 5, primaryDutyAction: "Escort duty",
                sec141: 1, sec144: 0, sec145b: 2, sec155: 0, sec156: 0, sec162: 0, sec163: 0, sec164: 0,
                crimeProfile: "Theft:2|Assault:1"
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, "Train_Intelligence_Template.xlsx");
    };

    const parseUploadFile = async (file: File) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) throw new Error("File is empty or formatted incorrectly.");

        return jsonData.map(row => {
            const record: any = { raCases: {}, crimeProfile: [] };
            record.trainNumber = String(row.trainNumber || "");
            record.riskLevel = row.riskLevel || "N/A";
            record.totalIncidents = Number(row.totalIncidents) || 0;
            record.primaryDutyAction = row.primaryDutyAction || "";

            ["sec141", "sec144", "sec145b", "sec155", "sec156", "sec162", "sec163", "sec164"].forEach(key => {
                record.raCases[key] = Number(row[key]) || 0;
            });

            if (row.crimeProfile) {
                record.crimeProfile = String(row.crimeProfile).split("|").map(cp => {
                    const [type, count] = cp.split(":");
                    return { crimeType: type.trim(), count: Number(count) || 0 };
                });
            }

            return record;
        });
    };

    // --- Submit Handler ---
    const handleSubmit = async () => {
        setSubmitting(true); setError(null);
        try {
            if (mode === "single") {
                if (!form.trainNumber.trim()) throw new Error("Train number is required.");
                const res = await fetch("/api/train-crime-intelligence/create", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
                });
                if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message ?? `Server error ${res.status}`);
            } else {
                if (!file) throw new Error("Please select a file to upload.");
                const parsedData = await parseUploadFile(file);

                const res = await fetch("/api/train-crime-intelligence/create", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsedData),
                });
                if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message ?? `Server error ${res.status}`);
            }
            onSuccess();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to process request.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col border border-slate-200 overflow-hidden" style={{ maxHeight: "min(88vh, 680px)" }}>

                {/* ── Header ── */}
                <div className="px-5 py-4 border-b border-slate-200 flex-shrink-0 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
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

                    <div className="flex p-1 bg-slate-200/50 rounded-lg">
                        <button onClick={() => setMode("single")} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${mode === "single" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Single Entry</button>
                        <button onClick={() => setMode("bulk")} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${mode === "bulk" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Bulk Upload</button>
                    </div>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="overflow-y-auto flex-1 min-h-0 px-5 py-5 space-y-5">

                    {mode === "single" ? (
                        <>
                            {/* ... [Single Mode Form UI] ... */}
                            <SectionHeading>Train Identity</SectionHeading>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL}>Train Number <span className="text-red-600 normal-case tracking-normal">*</span></label>
                                    <input type="text" value={form.trainNumber} onChange={e => setField("trainNumber", e.target.value.toUpperCase())} placeholder="e.g. 12345" className={INPUT} style={{ fontFamily: "'DM Mono', monospace" }} />
                                </div>
                                <div>
                                    <label className={LABEL}>Risk Level</label>
                                    <div className="relative w-full">
                                        <select value={form.riskLevel} onChange={e => setField("riskLevel", e.target.value as RiskLevel)} className={`${INPUT} appearance-none pr-9 font-bold cursor-pointer ${RISK_COLORS[form.riskLevel]}`} style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}>
                                            {RISK_OPTIONS.map(r => <option key={r} value={r} className="bg-white text-slate-900 font-semibold">{r}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className={LABEL}>Total Incidents</label>
                                    <input type="number" min={0} value={form.totalIncidents} onChange={e => setField("totalIncidents", Number(e.target.value))} className={INPUT} style={{ fontFamily: "'DM Mono', monospace" }} />
                                </div>
                                <div>
                                    <label className={LABEL}>Primary Duty Action</label>
                                    <input type="text" value={form.primaryDutyAction} onChange={e => setField("primaryDutyAction", e.target.value)} placeholder="e.g. Escort duty" className={INPUT} />
                                </div>
                            </div>

                            <SectionHeading>Crime Profile</SectionHeading>
                            <div>
                                {form.crimeProfile.length === 0 && (
                                    <p className="text-xs font-medium text-slate-400 py-4 border border-dashed border-slate-300 rounded-lg text-center bg-slate-50 mb-3">No crime types added yet.</p>
                                )}
                                <div className="space-y-2.5">
                                    {form.crimeProfile.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input type="text" value={entry.crimeType} placeholder="Crime type" onChange={e => updateCrimeProfile(i, "crimeType", e.target.value)} className={`${INPUT} flex-1 min-w-0`} />
                                            <input type="number" min={0} value={entry.count} onChange={e => updateCrimeProfile(i, "count", Number(e.target.value))} className="w-20 px-2 py-2 text-sm font-bold border border-slate-300 rounded-lg bg-white text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace" }} placeholder="0" />
                                            <button onClick={() => removeCrimeProfile(i)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addCrimeProfile} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors w-fit">
                                    <Plus className="w-4 h-4" /> Add crime type
                                </button>
                            </div>

                            <SectionHeading>Railway Act Cases</SectionHeading>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-2">
                                {(Object.keys(RA_LABELS) as (keyof FormData["raCases"])[]).map(key => (
                                    <div key={key}>
                                        <label className="block text-[11px] leading-tight font-semibold text-slate-600 mb-1.5">{RA_LABELS[key]}</label>
                                        <input type="number" min={0} value={form.raCases[key]} onChange={e => setRaCase(key, Number(e.target.value))} className={INPUT} style={{ fontFamily: "'DM Mono', monospace" }} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 h-full flex flex-col pt-2">
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">Upload Data Guide</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                        Download the template to see the required structure. To add multiple crime profiles, format them with pipes and colons: <br />
                                        <code className="bg-blue-100/50 text-blue-800 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">Theft:3|Assault:1|Contraband:5</code>
                                    </p>
                                    <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-md shadow-sm transition-colors">
                                        <Download className="w-3.5 h-3.5" /> Download Template (.xlsx)
                                    </button>
                                </div>
                            </div>

                            {/* Functional Drag and Drop Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-200 
                  ${isDragging ? 'border-blue-500 bg-blue-100 scale-[1.02]' :
                                        file ? 'border-blue-400 bg-blue-50' :
                                            'border-slate-300 bg-slate-50'}`}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                                        setError(null);
                                    }}
                                />
                                <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-blue-600' : file ? 'text-blue-500' : 'text-slate-400'}`} />

                                {file ? (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-800">{file.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                        <button onClick={() => setFile(null)} className="text-xs text-red-500 font-bold mt-4 hover:underline px-3 py-1 bg-red-50 rounded-md">Remove file</button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-800 mb-1">Drag & Drop Spreadsheet Here</p>
                                        <p className="text-xs text-slate-500 mb-5">Accepts .xlsx, .xls, or .csv files.</p>

                                        <div className="flex items-center justify-center gap-3">
                                            <div className="h-px bg-slate-300 w-12"></div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">OR</span>
                                            <div className="h-px bg-slate-300 w-12"></div>
                                        </div>

                                        {/* Explicit Browse Button */}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-4 px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                                        >
                                            Browse Files
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
                    {error ? (
                        <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-[60%]">{error}</p>
                    ) : (
                        <span />
                    )}
                    <div className="flex gap-2.5 ml-auto">
                        <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={submitting || (mode === "bulk" && !file)} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[140px]">
                            {submitting ? "Processing…" : mode === "bulk" ? "Upload & Create" : "Create Record"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}