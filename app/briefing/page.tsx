"use client";

import { useState } from "react";

export default function BriefingGenerator() {
    // Form State
    const [post, setPost] = useState("Trichy Junction");
    const [shift, setShift] = useState("Morning");
    const [language, setLanguage] = useState("English");

    // App State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedScript, setGeneratedScript] = useState<string | null>(null);

    // In a real app, you'd get this from your Auth context (e.g., NextAuth)
    const MOCK_SO_ID = "65f0a1b2c3d4e5f6a7b8c9d0";

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedScript(null);

        try {
            const response = await fetch("/api/briefing/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    stationOfficerId: MOCK_SO_ID,
                    post,
                    shift,
                    language,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // The backend returns { success: true, data: briefingDocument }
            setGeneratedScript(data.data.generatedScript);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">RPF Duty Management System</h1>
                    <p className="text-gray-500">Shift Briefing Generator [cite: 38-40]</p>
                </div>

                {/* Input Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:hidden">
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Post Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Duty Post</label>
                            <select
                                value={post}
                                onChange={(e) => setPost(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Trichy Junction">Trichy Junction</option>
                                <option value="Srirangam">Srirangam</option>
                                <option value="Thanjavur">Thanjavur</option>
                            </select>
                        </div>

                        {/* Shift Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Shift [cite: 71]</label>
                            <select
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Night">Night</option>
                            </select>
                        </div>

                        {/* Language Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Language [cite: 71]</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="English">English</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-3 flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {isLoading ? "Fetching Intelligence & Generating..." : "Generate Briefing Script"}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Output Document area */}
                {generatedScript && (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6 print:hidden">
                            <h2 className="text-xl font-bold text-gray-800">Generated Briefing Script</h2>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium border border-gray-300 transition-colors"
                            >
                                Print Script
                            </button>
                        </div>

                        <hr className="mb-6 print:hidden" />

                        {/* The whitespace-pre-wrap class is critical here. 
              It ensures the line breaks generated by the AI are actually rendered on screen.
            */}
                        <div className="prose max-w-none text-gray-800 font-serif whitespace-pre-wrap leading-relaxed">
                            {generatedScript}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}