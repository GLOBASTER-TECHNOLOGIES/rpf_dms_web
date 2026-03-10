"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Train,
  Building2,
  Users,
  ShieldAlert,
  CalendarClock,
  CloudLightning,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface Module {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
}

const modules: Module[] = [
  {
    title: "Instructions",
    description: "Guidelines and documentation for operating the admin panel.",
    href: "/admin/instruction",
    icon: <BookOpen size={20} />,
    accent: "hover:border-slate-900",
    iconBg: "bg-slate-600 text-white",
  },
  {
    title: "Train Schedules",
    description: "Manage arrival, departure, platforms and days of run.",
    href: "/admin/train-schedule",
    icon: <Train size={20} />,
    accent: "hover:border-slate-400",
    iconBg: "bg-slate-100 text-slate-700",
  },
  {
    title: "RPF Posts",
    description: "View and manage RPF Thanas and outposts across divisions.",
    href: "/admin/post",
    icon: <Building2 size={20} />,
    accent: "hover:border-blue-400",
    iconBg: "bg-blue-50 text-blue-700",
  },
  {
    title: "Officers",
    description: "Manage RPF personnel, ranks, roles and assignments.",
    href: "/admin/officer",
    icon: <Users size={20} />,
    accent: "hover:border-emerald-400",
    iconBg: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Threat Calendar",
    description: "Track alerts, security events and operational dates.",
    href: "/admin/threat-calendar",
    icon: <CalendarClock size={20} />,
    accent: "hover:border-amber-400",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    title: "Threat Forecast",
    description: "Monitor upcoming risk assessments for RPF zones.",
    href: "/admin/threatforecast",
    icon: <CloudLightning size={20} />,
    accent: "hover:border-red-400",
    iconBg: "bg-red-50 text-red-600",
  },
  {
    title: "Incidents",
    description: "Log and review security incidents reported across posts.",
    href: "/admin/incidents",
    icon: <ShieldAlert size={20} />,
    accent: "hover:border-purple-400",
    iconBg: "bg-purple-50 text-purple-700",
  },
];

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* ── Classic Dark Header ── */}
      <header className="bg-slate-900 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-inner">
              <Image
                src="/rpf_logo.png"
                alt="RPF Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                Railway Protection Force
              </p>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l pl-6 border-slate-700">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">Control Panel</p>
              <p className="text-[11px] text-slate-400">All Systems Nominal</p>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <ShieldAlert size={16} className="text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Body ── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Management Modules</h2>
          <p className="text-xs text-slate-400 mt-0.5">Select a category to manage database records.</p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.href}
              onClick={() => router.push(mod.href)}
              className={`group w-full text-left bg-white rounded-xl border border-slate-200 ${mod.accent} hover:shadow-sm transition-all duration-150 p-5 flex flex-col gap-4`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mod.iconBg}`}>
                  {mod.icon}
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <h3 className="text-md font-bold text-slate-800 leading-tight">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-normal line-clamp-2">
                  {mod.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-200 mt-4 text-center">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
          &copy; 2026 RPF Security Management System
        </p>
      </footer>
    </div>
  );
}