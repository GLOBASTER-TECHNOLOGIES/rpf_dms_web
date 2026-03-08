"use client";

import { useState } from "react";
import { AlertTriangle, Zap, Loader2, ShieldCheck, ShieldAlert, Clock } from "lucide-react";

// Mock Data
const MOCK_TRAINS = [
    {
        id: "t1",
        number: "12606",
        name: "Pallavan Superfast Exp",
        eta: "06:45 AM",
        platform: "Pf 3",
        status: "On Time",
        recentIncidents: [
            "Luggage theft reported in Coach S2 (3 days ago)",
            "Chain pulling incident near Trichy outer"
        ],
    },
    {
        id: "t2",
        number: "16127",
        name: "Guruvayur Express",
        eta: "07:10 AM",
        platform: "Pf 2",
        status: "Delayed",
        recentIncidents: [],
    }
];

// Inline component to handle state for each individual train in the list
function TrainItem({ train }: { train: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState<string | null>(null);

    const handleGenerateAI = () => {
        setIsGenerating(true);
        // Simulate API Call delay
        setTimeout(() => {
            setAiPrompt(
                "1. POSITION: Stand near general coach (S1-S3) entry.\n2. WATCH FOR: Luggage thieves operating during boarding.\n3. ALERT: HIGH crowd expected. Watch for unauthorized vendors.\n4. CIRCULAR: Check for unaccompanied minors per HQ directive."
            );
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all mb-4">

            {/* Train Header */}
            <div
                className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${train.recentIncidents.length > 0 ? 'bg-orange-500' : 'bg-indigo-500'}`}>
                        {train.platform}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{train.number}</h3>
                        <p className="text-slate-500 text-sm">{train.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-indigo-700">{train.eta}</p>
                    <p className={`text-xs font-bold ${train.status === 'On Time' ? 'text-green-600' : 'text-red-500'}`}>
                        {train.status}
                    </p>
                </div>
            </div>

            {/* Expanded Details & Inline AI Assistant */}
            {isExpanded && (
                <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-5 animate-in slide-in-from-top-2">

                    {/* Raw Incidents */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
                            <AlertTriangle size={14} className={train.recentIncidents.length > 0 ? "text-orange-500" : "text-slate-400"} />
                            Recent Incident History
                        </h4>
                        {train.recentIncidents.length > 0 ? (
                            <ul className="space-y-2">
                                {train.recentIncidents.map((incident: string, idx: number) => (
                                    <li key={idx} className="text-sm text-slate-700 bg-white border border-slate-200 py-2 px-3 rounded-lg flex items-start gap-2 shadow-sm">
                                        <span className="text-orange-500 mt-0.5">•</span> {incident}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 italic bg-white py-2 px-3 rounded-lg border border-slate-200">No major incidents in the last 30 days.</p>
                        )}
                    </div>

                    {/* Inline AI Prompt Logic */}
                    {!aiPrompt && !isGenerating ? (
                        <button
                            onClick={handleGenerateAI}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
                        >
                            <Zap size={16} /> Synthesize Duty Instructions
                        </button>
                    ) : (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5 mb-3">
                                <ShieldCheck size={16} className="text-indigo-600" /> AI Duty Synthesis
                            </h4>

                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center py-4 text-indigo-500">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <p className="text-xs font-semibold uppercase tracking-widest">Processing Intelligence...</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm prose-indigo text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {aiPrompt}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

// Main Page Component
export default function ViewTrainDetailsPage() {
    return (
        <div className="min-h-screen font-sans  relative">


            {/* Main Content */}
            <div className="px-5 mt-6 max-w-md mx-auto">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Arriving Trains</h2>

                {MOCK_TRAINS.map((train) => (
                    <TrainItem key={train.id} train={train} />
                ))}
            </div>


        </div>
    );
}