"use client";

import { useState, useEffect } from "react";
import BriefingForm from "@/components/briefing/BriefingForm";
import BriefingDisplay from "@/components/briefing/BriefingDisplay";

import toast from "react-hot-toast";
import axios from "axios";

function getCurrentShift(): "Morning" | "Afternoon" | "Night" {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return "Morning";
    if (hour >= 14 && hour < 22) return "Afternoon";
    return "Night";
}

export default function BriefingDashboard() {
    // Mocking the logged-in SO details
    const MOCK_SO_ID = "65f0a1b2c3d4e5f6a7b8c9d0";
    const MOCK_POST = "Trichy Junction";

    const [currentShift, setCurrentShift] = useState("");
    const [activeBriefing, setActiveBriefing] = useState<any>(null);

    // Initialize the shift on load
    useEffect(() => {
        setCurrentShift(getCurrentShift());
        // TODO: In a real app, you would also run a fetch here to see if a briefing 
        // already exists for today's date and the current shift, and set it to activeBriefing.
    }, []);

    const handleGenerate = async (language: string) => {
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
        }
    };

    const handleMarkDelivered = async (briefingId: string) => {
        try {
            // Assuming you create a quick PATCH route to update this
            // await axios.patch(`/api/briefing/${briefingId}`, { isDelivered: true });

            // Optimistic UI update
            setActiveBriefing({ ...activeBriefing, isDelivered: true });
            toast.success("Delivery logged successfully");
        } catch (error) {
            toast.error("Failed to mark as delivered");
        }
    };

    if (!currentShift) return null; // Avoid hydration mismatch

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                <header className="mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-slate-900">Duty Briefing Dashboard</h1>
                    <p className="text-slate-500">RPF Intelligence-Led Security Operations [cite: 15]</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Form & History */}
                    <div className="lg:col-span-4 space-y-6">
                        <BriefingForm
                            post={MOCK_POST}
                            shift={currentShift}
                            hasExistingBriefing={!!activeBriefing}
                            onGenerate={handleGenerate}
                        />

                        {/* You can insert your <BriefingHistory /> component here later */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Past Briefings (Today)</h3>
                            <p className="text-sm text-slate-500 italic">No previous shifts recorded today.</p>
                        </div>
                    </div>

                    {/* Right Column: The Document Viewer */}
                    <div className="lg:col-span-8">
                        {activeBriefing ? (
                            <BriefingDisplay
                                briefing={activeBriefing}
                                onMarkDelivered={handleMarkDelivered}
                            />
                        ) : (
                            <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400 print:hidden">
                                <p>Configure parameters and generate a script to view intelligence.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}