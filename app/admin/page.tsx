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
  BookOpen,
  LogOut,
  Megaphone,
  Proportions
} from "lucide-react";

interface Module {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  borderAccent: string;
  iconColors: string;
}

const modules: Module[] = [
  {
    title: "Briefings",
    description: "Publish daily security briefings and notices.",
    href: "/admin/briefing",
    icon: <Megaphone size={24} strokeWidth={2} />,
    borderAccent: "border-l-cyan-500",
    iconColors: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white",
  },
  {
    title: "Instructions",
    description: "Manage official guidelines and standing orders.",
    href: "/admin/instruction",
    icon: <BookOpen size={24} strokeWidth={2} />,
    borderAccent: "border-l-indigo-500",
    iconColors: "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white",
  },
  {
    title: "Train Schedules",
    description: "Update and monitor regional train timelines.",
    href: "/admin/train-schedule",
    icon: <Train size={24} strokeWidth={2} />,
    borderAccent: "border-l-blue-500",
    iconColors: "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    title: "Train Crime Intelligence",
    description: "Update and monitor regional train timelines.",
    href: "/admin/train-crime-intelligence",
    icon: <Train size={24} strokeWidth={2} />,
    borderAccent: "border-l-blue-500",
    iconColors: "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    title: "Shift Report",
    description: "Download and view post wise shift report.",
    href: "/admin/shift-report",
    icon: <Proportions size={24} strokeWidth={2} />,
    borderAccent: "border-l-violet-500",
    iconColors: "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white",
  },
  {
    title: "RPF Posts",
    description: "Manage outposts, stations, and jurisdictions.",
    href: "/admin/post",
    icon: <Building2 size={24} strokeWidth={2} />,
    borderAccent: "border-l-violet-500",
    iconColors: "bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white",
  },
  {
    title: "Officers",
    description: "Personnel directory and duty assignments.",
    href: "/admin/officer",
    icon: <Users size={24} strokeWidth={2} />,
    borderAccent: "border-l-emerald-500",
    iconColors: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    title: "Threat Calendar",
    description: "Monitor upcoming security events and alerts.",
    href: "/admin/threat-calendar",
    icon: <CalendarClock size={24} strokeWidth={2} />,
    borderAccent: "border-l-amber-500",
    iconColors: "bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white",
  },

];

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── Top Navigation Bar ── */}
      {/* Changed to standard Tailwind bg-slate-900 to ensure it renders */}
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-sm">
                <Image
                  src="/rpf_logo.png"
                  alt="RPF Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest leading-none mb-0.5">
                  Southern Railway
                </span>
                <span className="text-base font-bold tracking-wide leading-none text-white">
                  Railway Protection Force
                </span>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right mr-4 border-r border-slate-700 pr-4">
                <p className="text-sm font-medium text-white">System Administrator</p>
                <p className="text-xs text-emerald-400">Session Active</p>
              </div>
              <button className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>


      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {modules.map((mod) => (
            <button
              key={mod.href}
              onClick={() => router.push(mod.href)}
              className={`flex items-start gap-4 p-5 bg-white border-y border-r border-l-4 border-slate-200 rounded-md shadow-sm 
                         hover:shadow-md transition-all duration-200 text-left group 
                         focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                         ${mod.borderAccent}`}
            >
              {/* Colored Icon Container */}
              <div className={`flex-shrink-0 p-3 rounded-md transition-colors duration-200 ${mod.iconColors}`}>
                {mod.icon}
              </div>

              {/* Text Content */}
              <div>
                <h3 className="text-base font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-snug">
                  {mod.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}