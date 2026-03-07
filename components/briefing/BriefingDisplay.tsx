"use client";

import { Printer } from "lucide-react";

interface BriefingDisplayProps {
  briefing: {
    _id: string;
    generatedScript: string;
    dutyDate: string;
  };
}

export default function BriefingDisplay({ briefing }: BriefingDisplayProps) {
  if (!briefing) return null;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Action Bar - Hidden during printing */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 print:hidden">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            READY FOR BRIEFING
          </span>
        </div>
        <div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
          >
            <Printer size={16} /> Print Script
          </button>
        </div>
      </div>

      {/* The Actual Script */}
      <div className="prose max-w-none text-slate-800 font-serif whitespace-pre-wrap leading-relaxed">
        {briefing.generatedScript}
      </div>
      
    </div>
  );
}