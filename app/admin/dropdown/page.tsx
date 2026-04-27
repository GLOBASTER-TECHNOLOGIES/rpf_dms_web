"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, FileText, ChevronRight } from "lucide-react";

const Page = () => {
    const router = useRouter();

    const managementOptions = [
        {
            title: "Sections",
            path: "/admin/dropdown/section",
            icon: <LayoutGrid className="text-blue-600" size={22} />,
            bg: "bg-blue-50",
        },
        {
            title: "Posts",
            path: "/admin/dropdown/post",
            icon: <FileText className="text-blue-600" size={22} />,
            bg: "bg-blue-50",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <header className="mb-10">
                    <button
                        onClick={() => router.push("/admin")}
                        className="group flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm transition-all mb-6"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Back to Dashboard</span>
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Data Management
                        </h1>
                    </div>
                </header>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {managementOptions.map((option) => (
                        <div
                            key={option.title}
                            onClick={() => router.push(option.path)}
                            className="group relative flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${option.bg} flex items-center justify-center`}>
                                    {option.icon}
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                    {option.title}
                                </h2>
                            </div>

                            <ChevronRight
                                size={20}
                                className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;