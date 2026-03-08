"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Train, FileText, FileSearch, Mic,
  ChevronRight, Home, Bell, Settings,
  Sparkles, AlertTriangle, MapPin, Clock,
} from "lucide-react";

const AI_SUMMARY =
  "Srirangam Festival is driving heavy footfall today — ~25,000+ expected at Trichy Junction. Platforms 1–3 are high-priority. 3 extra units are deployed and valid until 22:00 hrs. Review your Briefing for updated standing orders, and file your Debriefing report before end of shift.";

const modules = [
  { href: "/duty-officer/briefing",          icon: FileSearch, label: "Briefing",           badge: "3 New Alerts",   color: "blue"  },
  { href: "/duty-officer/view-train-details", icon: Train,      label: "Train Intelligence",  badge: "Next: 06:45 AM", color: "teal"  },
  { href: "/duty-officer/debriefing",         icon: Mic,        label: "Debriefing",          badge: "Pending Report", color: "amber" },
  { href: "/duty-officer/view-circulars",     icon: FileText,   label: "HQ Circulars",        badge: "2 Unread",       color: "blue"  },
];

const badgeClass = {
  blue:  "bg-blue-100 text-blue-700",
  teal:  "bg-teal-100 text-teal-700",
  amber: "bg-amber-100 text-amber-700",
};
const iconClass = {
  blue:  "bg-blue-50 text-blue-600",
  teal:  "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-700",
};
const hoverBorder = {
  blue:  "hover:border-blue-300",
  teal:  "hover:border-teal-300",
  amber: "hover:border-amber-300",
};

export default function DutyOfficerDashboard() {
  const [time, setTime] = useState("--:--:--");
  const [mounted, setMounted] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setTyping(true);
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      if (i < AI_SUMMARY.length) {
        setDisplayed(AI_SUMMARY.slice(0, ++i));
      } else {
        setTyping(false);
        clearInterval(iv);
      }
    }, 18);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-svh bg-slate-100 flex flex-col font-sans">

     

      {/* ── LOCATION BAR ─────────────────────────────── */}
      <div className="bg-slate-800 px-4 sm:px-6 py-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-widest">
          <MapPin size={11} className="text-amber-400" />
          Trichy Junction PF 1–3
        </span>

      </div>

      {/* ── BODY ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-28 max-w-2xl w-full mx-auto flex flex-col gap-5">

        {/* AI Summary Card */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-200" />
              <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">
                AI Shift Summary
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
            </div>
            <span className="inline-flex items-center gap-1 bg-red-500/20 border border-red-400/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-red-300 uppercase tracking-wide">
              <AlertTriangle size={9} />
              High Risk
            </span>
          </div>
          {/* Card body */}
          <div className="px-4 py-4">
            <p className="text-sm text-slate-600 leading-relaxed min-h-[56px]">
              {displayed}
              {typing && (
                <span className="inline-block w-0.5 h-3.5 bg-blue-500 rounded-sm ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </div>
        </div>

        {/* Action Modules */}
        <div className="flex flex-col gap-3">
          {modules.map(({ href, icon: Icon, label, badge, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 transition-all duration-150 hover:shadow-md hover:translate-x-1 ${hoverBorder[color]}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass[color]}`}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <span className="flex-1 text-[15px] font-bold text-slate-800 tracking-tight">
                {label}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${badgeClass[color]}`}>
                {badge}
              </span>
              <ChevronRight size={17} className="text-slate-300 flex-shrink-0" />
            </Link>
          ))}
        </div>

      </main>

     

    </div>
  );
}