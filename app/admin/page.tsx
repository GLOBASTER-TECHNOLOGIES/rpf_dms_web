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
    title: "Train Schedules",
    description: "Manage arrival & departure timings, platforms and days of run for trains at this post.",
    href: "/admin/train-schedule",
    icon: <Train size={26} />,
    accent: "hover:border-slate-700",
    iconBg: "bg-slate-100 text-slate-700",
  },
  {
    title: "RPF Posts",
    description: "View, create and manage RPF Thanas and outposts across divisions.",
    href: "/admin/posts",
    icon: <Building2 size={26} />,
    accent: "hover:border-blue-600",
    iconBg: "bg-blue-50 text-blue-700",
  },
  {
    title: "Officers",
    description: "Register and manage RPF personnel, ranks, roles and post assignments.",
    href: "/admin/officers",
    icon: <Users size={26} />,
    accent: "hover:border-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Threat Calendar",
    description: "Track and schedule threat alerts, security events and operational dates.",
    href: "/admin/threatcalendar",
    icon: <CalendarClock size={26} />,
    accent: "hover:border-amber-500",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    title: "Threat Forecast",
    description: "Monitor upcoming threat forecasts and risk assessments for RPF zones.",
    href: "/admin/threatforecast",
    icon: <CloudLightning size={26} />,
    accent: "hover:border-red-500",
    iconBg: "bg-red-50 text-red-600",
  },
  {
    title: "Incidents",
    description: "Log, review and manage security incidents reported across RPF posts.",
    href: "/admin/incidents",
    icon: <ShieldAlert size={26} />,
    accent: "hover:border-purple-600",
    iconBg: "bg-purple-50 text-purple-700",
  },
];

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top Nav / Header ── */}
      <header className="bg-slate-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 p-1.5">
              <Image
                src="/rpf_logo.png"
                alt="RPF Logo"
                width={52}
                height={52}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-0.5">
                Railway Protection Force
              </p>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-semibold">Control Panel</p>
              <p className="text-slate-400 text-xs mt-0.5">All Modules</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ShieldAlert size={20} className="text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Page Body ── */}
      <main className="max-w-7xl mx-auto px-8 py-10 space-y-10">

        {/* Section heading */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Modules</h2>
          <p className="text-slate-500 text-sm mt-1">
            Select a module below to manage its records.
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <button
              key={mod.href}
              onClick={() => router.push(mod.href)}
              className={`group w-full text-left bg-white rounded-2xl border-2 border-slate-200 ${mod.accent} shadow-sm hover:shadow-md transition-all duration-200 p-7 flex flex-col gap-5`}
            >
              {/* Icon + arrow */}
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${mod.iconBg}`}>
                  {mod.icon}
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{mod.title}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{mod.description}</p>
              </div>
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}