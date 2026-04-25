"use client"
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to prevent Next.js server-side rendering crashes
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

    // --- 1. Area Chart (Timeline Trend) Options ---
    const areaOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            toolbar: { show: true },
            fontFamily: 'inherit',
        },
        colors: ['#3b82f6'],
        dataLabels: { enabled: false },
        // FIXED: Changed from 'smooth' to 'straight' so it doesn't draw weird curves between sparse data points
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: dashboardData?.timeline.map(item => item.date) || [],
            type: 'datetime', // Tells ApexCharts to treat these strings as real dates
            labels: {
                format: 'dd MMM', // Formats "2026-03-23" into "23 Mar"
                style: { colors: '#9ca3af' }
            }
        },
        tooltip: {
            x: { format: 'dd MMM yyyy' } // Keeps the full year visible when hovering
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' }, formatter: (val) => Math.floor(val).toString() }
        },
        grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] }
        }
    };

    const areaSeries = [
        { name: 'Reports', data: dashboardData?.timeline.map(item => item.reportCount) || [] }
    ];

    // --- 2. Donut Chart (Shift Distribution) Options ---
    const donutOptions: ApexCharts.ApexOptions = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: dashboardData?.shiftBreakdown.map(item => item.shift) || [],
        colors: dashboardData?.shiftBreakdown.map(item => SHIFT_COLORS[item.shift] || SHIFT_COLORS.Unknown) || [],
        dataLabels: { enabled: true },
        plotOptions: {
            pie: { donut: { size: '65%' } }
        },
        legend: { position: 'bottom' }
    };

    const donutSeries = dashboardData?.shiftBreakdown.map(item => item.reportCount) || [];

    // --- 3. Bar Chart (Daily Breakdown) Options ---
    const barOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            fontFamily: 'inherit',
            toolbar: { show: true }
        },
        colors: ['#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '50%',
                dataLabels: { position: 'top' }
            }
        },
        dataLabels: {
            enabled: true,
            offsetY: -20,
            style: { fontSize: '12px', colors: ["#6b7280"] }
        },
        xaxis: {
            categories: dashboardData?.timeline.map(item => item.date) || [],
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' }, formatter: (val) => Math.floor(val).toString() }
        },
        grid: { borderColor: '#f3f4f6', strokeDashArray: 4 }
    };

    const barSeries = [
        { name: 'Reports', data: dashboardData?.timeline.map(item => item.reportCount) || [] }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header & Controls */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Officer Dashboard</h2>

                    <div className="flex w-full md:w-auto gap-4">
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
                    </div>
                </div>

                {/* State Handling (Loading, Error, Empty) */}
                {!activeForceNumber && !isLoading && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                        Search for an officer using their Force Number to view analytics.
                    </div>
                )}
                {isLoading && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center animate-pulse text-blue-600 font-medium">
                        Compiling Officer Dossier...
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-600 text-center">
                        {error}
                    </div>
                )}

                {/* Main Dashboard Data */}
                {dashboardData && !isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Top Profile Card */}
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-sm md:col-span-3 flex flex-col justify-center">
                                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1">
                                    {dashboardData.officer.rank}
                                </p>
                                <h3 className="text-3xl font-bold mb-2">{dashboardData.officer.name}</h3>
                                <div className="flex flex-wrap gap-4 text-sm mt-2 text-blue-100">
                                    <span className="bg-blue-700 px-3 py-1 rounded-full border border-blue-500">Force No: {dashboardData.officer.forceNumber}</span>
                                    <span className="bg-blue-700 px-3 py-1 rounded-full border border-blue-500">Div: {dashboardData.officer.division}</span>
                                    <span className="bg-blue-700 px-3 py-1 rounded-full border border-blue-500">Post: {dashboardData.officer.postCode}</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 text-sm font-medium mb-2">Total Reports</p>
                                <p className="text-5xl font-extrabold text-blue-600">{dashboardData.stats.totalReports}</p>
                                <p className="text-xs text-gray-400 mt-2">in selected timeframe</p>
                            </div>
                        </div>

                        {/* Timeline Chart (ApexCharts) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Activity Trend</h4>
                            {dashboardData.timeline.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">No activity in this period.</div>
                            ) : (
                                <div className="w-full">
                                    <Chart options={areaOptions} series={areaSeries} type="area" height={320} />
                                </div>
                            )}
                        </div>

                        {/* Shift Breakdown Donut Chart (ApexCharts) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Shift Distribution</h4>
                            {dashboardData.shiftBreakdown.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">No shift data available.</div>
                            ) : (
                                <div className="w-full flex justify-center mt-4">
                                    <Chart options={donutOptions} series={donutSeries} type="donut" height={320} />
                                </div>
                            )}
                        </div>

                        {/* NEW: Daily Breakdown Bar Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-3">
                            <h4 className="text-lg font-bold text-gray-800 mb-6">Daily Report Breakdown</h4>
                            {dashboardData.timeline.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-gray-400">No activity in this period.</div>
                            ) : (
                                <div className="w-full">
                                    <Chart options={barOptions} series={barSeries} type="bar" height={350} />
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}