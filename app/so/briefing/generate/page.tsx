"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Zap, Printer } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

function getCurrentShift(): "Morning" | "Afternoon" | "Night" {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Morning";
    if (hour >= 14 && hour < 22) return "Afternoon";
    return "Night";
}

export default function GenerateBriefingPage() {
    const MOCK_SO_ID = "65f0a1b2c3d4e5f6a7b8c9d0";
    const MOCK_POST = "Trichy Junction";

    const [currentShift, setCurrentShift] = useState("");
    const [language, setLanguage] = useState("English");
    const [isLoading, setIsLoading] = useState(false);
    const [activeBriefing, setActiveBriefing] = useState<any>(null);

    useEffect(() => {
        setCurrentShift(getCurrentShift());
        // Future: Add an axios call here to check if a briefing already exists for this shift/date
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("/api/briefing/create", {
                stationOfficerId: MOCK_SO_ID,
                post: MOCK_POST,
                shift: currentShift,
                language: language,
            });

            if (response.data.success) {
                setActiveBriefing(response.data.data);
                toast.success("Intelligence Briefing Generated");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Generation failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentShift) return null;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Top Navigation - Hidden on Print */}
                <div className="print:hidden">
                    <Link href="/so/dashboard" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-6">
                        <ArrowLeft size={16} className="mr-2" /> Back to Command Center
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Shift Briefing Generator</h1>
                </div>

                {/* Configuration Card - Hidden if script is already generated & on print */}
                {!activeBriefing && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 print:hidden">
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duty Post</p>
                                <p className="font-bold text-slate-800 text-lg">{MOCK_POST}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Shift</p>
                                <p className="font-bold text-blue-700 text-lg">{currentShift}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <label className="text-sm font-bold text-slate-700">Select Output Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium"
                            >
                                <option value="English">English</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                            {isLoading ? "Synthesizing Intelligence..." : "Generate Official Briefing"}
                        </button>
                    </div>
                )}

                {/* Output DocumentViewer */}
                {activeBriefing && (
                    <div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 print:hidden">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wider">
                                Ready For Briefing
                            </span>
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                            >
                                <Printer size={18} /> Print Script
                            </button>
                        </div>

                        <div className="prose max-w-none text-slate-900 font-serif whitespace-pre-wrap leading-relaxed text-lg">
                            {activeBriefing.generatedScript}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}