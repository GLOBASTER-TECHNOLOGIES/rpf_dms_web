"use client";

import { useState } from "react";
import Link from "next/link";
// Import the PDF function from your separate file
import { generateShiftPDF } from "@/config/pdfGenerator";

export default function ShiftReportPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [shift, setShift] = useState("Morning");
    const [post, setPost] = useState("TPJ");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchReport = async () => {
        if (!date || !shift || !post) {
            alert("Please fill in all filters.");
            return;
        }
        setLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch(
                `/api/shift-report/get?date=${date}&shift=${shift}&post=${post}`,
            );
            const json = await res.json();
            if (json.success && json.data) {
                setData(json.data);
            } else {
                setData(null);
                alert("No records found for the selected criteria.");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Failed to fetch report. Check console.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 font-sans text-slate-900 flex justify-center">
            <div className="w-full max-w-[800px] space-y-6">

                {/* --- BACK NAVIGATION --- */}
                <div className="flex items-center">
                    <Link
                        href="/admin"
                        className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <span className="bg-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-600 p-1.5 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                            </svg>
                        </span>
                        Back to Admin Dashboard
                    </Link>
                </div>

                {/* --- HEADER & FILTERS --- */}
                <header className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Shift Operations Center
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Intelligence & Duty Reporting System
                        </p>
                    </div>

                    <div className="flex flex-col gap-5 w-full">
                        <FilterInput
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e: any) => setDate(e.target.value)}
                        />
                        <div className="flex flex-col w-full gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Shift
                            </label>
                            <select
                                className="bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-700 transition-all w-full"
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                            >
                                <option>Morning</option>
                                <option>Afternoon</option>
                                <option>Night</option>
                            </select>
                        </div>
                        <FilterInput
                            label="Post Code"
                            placeholder="e.g. TPJ"
                            value={post}
                            onChange={(e: any) => setPost(e.target.value)}
                        />
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-base font-bold px-6 py-3.5 mt-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse">Fetching Records...</span>
                            ) : (
                                "Generate Report"
                            )}
                        </button>
                    </div>
                </header>

                {/* --- EMPTY / LOADING STATES --- */}
                {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <span className="text-4xl mb-3 opacity-50">📋</span>
                        <p className="font-medium text-sm uppercase tracking-widest text-center px-4">
                            Configure parameters to view shift data
                        </p>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col gap-6 animate-pulse">
                        <div className="h-40 bg-slate-200 rounded-3xl w-full" />
                        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
                        <div className="h-64 bg-slate-200 rounded-3xl w-full" />
                    </div>
                ) : data ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">

                        {/* --- TOP BANNER --- */}
                        <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col gap-5 shadow-lg">
                            <div className="flex flex-col gap-3">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="bg-indigo-500 w-2 h-2 rounded-full animate-pulse"></span>
                                    Active Shift Profile
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                    {data.post} • {data.shiftDate}
                                </h2>
                                <span className="bg-indigo-600 px-3 py-1 rounded-md text-sm font-semibold tracking-wide w-fit">
                                    {data.shiftName} Shift
                                </span>
                            </div>

                            {/* --- FIXED EXPORT BUTTON --- */}
                            <button
                                onClick={() => generateShiftPDF(data)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 mt-2"
                            >
                                📥 Export PDF Report
                            </button>
                        </div>

                        {/* --- CONTENT SECTIONS --- */}

                        <Section title="Briefing Script" icon="📢">
                            <div className="bg-[#F8FAFC] border border-slate-200 p-6 rounded-2xl">
                                <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">
                                    {data.briefingDocument?.briefingScript ||
                                        "No briefing script recorded for this shift."}
                                </p>
                            </div>
                        </Section>

                        <Section title="Deployed Personnel" icon="👮">
                            <div className="flex flex-col gap-3">
                                {data.officers?.length > 0 ? (
                                    data.officers.map((o: any) => (
                                        <div
                                            key={o._id}
                                            className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg border border-slate-200">
                                                {o.name?.charAt(0) ?? "?"}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-base font-bold text-slate-900">
                                                    {o.name}
                                                </p>
                                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                                                    {o.rank} • {o.forceNumber}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No personnel assigned." />
                                )}
                            </div>
                        </Section>

                        <Section title="Duty Instructions" icon="📜">
                            <div className="flex flex-col gap-4">
                                {data.instructions?.length > 0 ? (
                                    data.instructions.map((i: any) => (
                                        <div
                                            key={i._id}
                                            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-2"
                                        >
                                            <h4 className="font-bold text-slate-900 text-base">
                                                {i.title}
                                            </h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                {i.instruction}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No specific instructions provided." />
                                )}
                            </div>
                        </Section>

                        <Section title="Risk Analysis & Intel" icon="🚨">
                            <div className="flex flex-col gap-4">
                                {data.crimeIntel?.length > 0 ? (
                                    data.crimeIntel.map((c: any) => (
                                        <div
                                            key={c._id}
                                            className={`p-5 rounded-2xl border flex flex-col gap-4 shadow-sm ${c.riskLevel === "HIGH"
                                                ? "bg-red-50 border-red-200"
                                                : "bg-amber-50 border-amber-200"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-900 text-lg">
                                                    Train #{c.trainNumber}
                                                </span>
                                                <span
                                                    className={`text-[11px] px-3 py-1 rounded-md font-bold uppercase tracking-wider ${c.riskLevel === "HIGH"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {c.riskLevel} Risk
                                                </span>
                                            </div>
                                            <div className="bg-white/60 p-4 rounded-xl border border-white/50">
                                                <span className="font-bold text-slate-600 text-xs uppercase tracking-wider block mb-1">
                                                    Action Required
                                                </span>
                                                <p className="text-sm md:text-base text-slate-800 font-medium leading-relaxed">
                                                    {c.primaryDutyAction}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No active intelligence alerts." />
                                )}
                            </div>
                        </Section>

                        <Section title="Post-Shift Debriefs" icon="📝">
                            {data.debriefs?.length > 0 ? (
                                <div className="flex flex-col gap-6">
                                    {data.debriefs.map((d: any) => (
                                        <div
                                            key={d._id}
                                            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
                                        >
                                            {/* Debrief Header */}
                                            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xl shadow-sm">
                                                        {d.staffId?.name?.charAt(0) ?? "?"}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="font-bold text-slate-900 text-lg">
                                                            {d.staffId?.name ?? "Unknown Officer"}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
                                                            {d.staffId?.rank} • {d.staffId?.forceNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full shadow-sm">
                                                    {d.reports?.length ?? 0} Report(s)
                                                </span>
                                            </div>

                                            {/* Reports List */}
                                            <div className="p-6 flex flex-col gap-10">
                                                {d.reports?.length > 0 ? (
                                                    d.reports.map((r: any, idx: number) => (
                                                        <div key={r._id ?? idx} className="flex flex-col gap-5">

                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                                    REPORT {idx + 1}
                                                                </span>

                                                                {(r.trainNo || r.trainNumber) && (
                                                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
                                                                        🚆 Train {r.trainNo || r.trainNumber}
                                                                    </span>
                                                                )}

                                                                <span className="text-sm text-slate-400 font-semibold ml-auto">
                                                                    {r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                                                                </span>
                                                            </div>

                                                            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                                                <p className="text-slate-800 text-sm md:text-base leading-relaxed font-medium">
                                                                    {r.summary || r.transcript || "No content provided."}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-col gap-6 mt-2">
                                                                {r.observations && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <p className="text-sm font-bold text-slate-500">Observations</p>
                                                                        <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                                                                            {r.observations}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {r.improvements && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <p className="text-sm font-bold text-slate-500">Improvements</p>
                                                                        <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                                                                            {r.improvements}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {idx !== d.reports.length - 1 && <hr className="border-slate-100 my-4" />}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-slate-400 text-sm font-medium">No specific reports logged.</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No post-shift debriefs submitted yet." />
                            )}
                        </Section>

                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-medium">
                            No shift data matches your current filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Reusable UI Components ---

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <span className="bg-slate-50 p-3.5 rounded-2xl text-xl leading-none shadow-sm border border-slate-100">
                    {icon}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {title}
                </h2>
            </div>
            <div className="flex flex-col w-full">
                {children}
            </div>
        </div>
    );
}

function FilterInput({ label, ...props }: any) {
    return (
        <div className="flex flex-col w-full gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            <input
                {...props}
                className="bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all w-full"
            />
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 w-full">
            <p className="text-slate-500 text-sm font-semibold">{message}</p>
        </div>
    );
}