"use client"
import React, { useEffect, useState, useRef } from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { toPng } from 'html-to-image';

interface Officer {
    name: string;
    forceNumber: string;
    rank: string;
    division: string;
    postCode: string;
}

interface DashboardData {
    officer: Officer;
    stats: { totalReports: number };
    timeline: { date: string; reportCount: number }[];
    shiftBreakdown: { shift: string; reportCount: number }[];
}

const SHIFT_COLORS: Record<string, string> = {
    Morning: "#FFBB28",
    Afternoon: "#00C49F",
    Night: "#0088FE",
    Unknown: "#8884d8"
};

export default function PerformancePage() {
    const [searchInput, setSearchInput] = useState("");
    const [activeForceNumber, setActiveForceNumber] = useState("");
    const [timeframe, setTimeframe] = useState("30");

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            if (!activeForceNumber) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/officer-perfomance?forceNumber=${activeForceNumber}&timeframe=${timeframe}`);

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API Error: ${response.status} - ${errText.slice(0, 50)}`);
                }

                const result = await response.json();

                if (result.success && result.data) {
                    setDashboardData(result.data);
                } else {
                    setError(result.message || "Unknown error occurred");
                }
            } catch (err: any) {
                console.error("Failed to fetch performance data:", err);
                setError(err.message || "Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPerformanceData();
    }, [activeForceNumber, timeframe]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) setActiveForceNumber(searchInput.trim());
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = async () => {
        if (dashboardRef.current === null) return;

        try {
            const dataUrl = await toPng(dashboardRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `Officer_Dashboard_${activeForceNumber}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to export dashboard:', err);
            alert("Failed to export dashboard. Please try again.");
        }
    };

    // --- Data Transformations for MUI Charts ---
    const timelineDates = dashboardData?.timeline.map(item => new Date(item.date)) || [];
    const timelineCounts = dashboardData?.timeline.map(item => item.reportCount) || [];

    const formattedDateStrings = timelineDates.map(date =>
        date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    );

    const pieChartData = dashboardData?.shiftBreakdown.map((item, index) => ({
        id: index,
        value: item.reportCount,
        label: item.shift,
        color: SHIFT_COLORS[item.shift] || SHIFT_COLORS.Unknown
    })) || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-900 print:bg-white print:p-0">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & Controls */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <h2 className="text-2xl font-bold text-gray-800">Officer Dashboard</h2>

                    <div className="flex w-full md:w-auto gap-4 flex-wrap">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <input
                                type="text"
                                placeholder="Force No. (e.g., 0816992)"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full md:w-48 p-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                Search
                            </button>
                        </form>

                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="all">All Time</option>
                        </select>

                        {dashboardData && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors border border-gray-300 font-medium"
                                >
                                    Print
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
                                >
                                    Export PNG
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* State Handling (Loading, Error, Empty) */}
                {!activeForceNumber && !isLoading && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 print:hidden">
                        Search for an officer using their Force Number to view analytics.
                    </div>
                )}
                {isLoading && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center animate-pulse text-blue-600 font-medium print:hidden">
                        Compiling Officer Dossier...
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-600 text-center print:hidden">
                        {error}
                    </div>
                )}

                {/* Main Dashboard Data */}
                {dashboardData && !isLoading && (
                    <div ref={dashboardRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 print:block">

                        {/* Top Profile Card */}
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 print:mb-6">
                            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-sm md:col-span-3 flex flex-col justify-center print:bg-blue-600 print:text-black print:border print:border-gray-300">
                                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1 print:text-gray-600">
                                    {dashboardData.officer.rank}
                                </p>
                                <h3 className="text-3xl font-bold mb-2">{dashboardData.officer.name}</h3>
                                <div className="flex flex-wrap gap-4 text-sm mt-2 text-blue-100 print:text-gray-800">
                                    <span className="bg-blue-700 px-3 py-1 rounded-full border border-blue-500 print:bg-gray-100 print:border-gray-300">Force No: {dashboardData.officer.forceNumber}</span>
                                    <span className="bg-blue-700 px-3 py-1 rounded-full border border-blue-500 print:bg-gray-100 print:border-gray-300">Div: {dashboardData.officer.division}</span>
                                    <span className="bg-blue-700 px-3 py-1 rounded-full border border-blue-500 print:bg-gray-100 print:border-gray-300">Post: {dashboardData.officer.postCode}</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 text-sm font-medium mb-2">Total Reports</p>
                                <p className="text-5xl font-extrabold text-blue-600">{dashboardData.stats.totalReports}</p>
                                <p className="text-xs text-gray-400 mt-2">in selected timeframe</p>
                            </div>
                        </div>

                        {/* Timeline Area Chart (MUI) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 print:mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Activity Trend</h4>
                            {dashboardData.timeline.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">No activity in this period.</div>
                            ) : (
                                <div className="w-full">
                                    {/* FIXED: Added explicit height prop */}
                                    <LineChart
                                        height={320}
                                        xAxis={[{
                                            data: timelineDates,
                                            scaleType: 'time',
                                            valueFormatter: (date) => new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                                        }]}
                                        series={[{
                                            data: timelineCounts,
                                            area: true,
                                            color: '#3b82f6',
                                            showMark: false,
                                        }]}
                                        grid={{ horizontal: true }}
                                        margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Shift Breakdown Donut Chart (MUI) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-1 print:mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Shift Distribution</h4>
                            {dashboardData.shiftBreakdown.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">No shift data available.</div>
                            ) : (
                                <div className="w-full flex justify-center mt-4">
                                    {/* FIXED: Added explicit height prop */}
                                    <PieChart
                                        height={320}
                                        series={[{
                                            data: pieChartData,
                                            innerRadius: 65,
                                            outerRadius: 100,
                                            paddingAngle: 2,
                                            cornerRadius: 4,
                                        }]}
                                        slotProps={{
                                            legend: {
                                                position: { vertical: 'bottom', horizontal: 'center' }
                                            },
                                        }}
                                        margin={{ top: 10, bottom: 80, left: 10, right: 10 }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Daily Breakdown Bar Chart (MUI) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-3 print:mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Daily Report Breakdown</h4>
                            {dashboardData.timeline.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">No activity in this period.</div>
                            ) : (
                                <div className="w-full">
                                    {/* FIXED: Added explicit height prop */}
                                    <BarChart
                                        height={320}
                                        xAxis={[{
                                            scaleType: 'band',
                                            data: formattedDateStrings,
                                            categoryGapRatio: 0.5
                                        }]}
                                        series={[{
                                            data: timelineCounts,
                                            color: '#3b82f6',
                                        }]}
                                        borderRadius={4}
                                        grid={{ horizontal: true }}
                                        margin={{ left: 40, right: 20, top: 20, bottom: 40 }}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}