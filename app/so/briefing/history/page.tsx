"use client";

import { ArrowLeft, Search, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Dummy data for visual development until API is connected
const MOCK_HISTORY = [
  { _id: "1", dutyDate: "2026-03-05", shift: "Morning", language: "English", isDelivered: true },
  { _id: "2", dutyDate: "2026-03-04", shift: "Night", language: "Tamil", isDelivered: true },
  { _id: "3", dutyDate: "2026-03-04", shift: "Afternoon", language: "English", isDelivered: true },
];

export default function BriefingHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div>
          <Link href="/so/dashboard/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-6">
            <ArrowLeft size={16} className="mr-2" /> Back to Command Center
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Briefing Archive</h1>
          <p className="text-slate-500 mt-2">Historical log of all generated shift briefings for Trichy Junction.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by date (YYYY-MM-DD)..." 
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* History List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-4 bg-slate-100 p-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>Date</div>
            <div>Shift</div>
            <div>Language</div>
            <div className="text-right">Action</div>
          </div>
          
          <div className="divide-y  divide-slate-100">
            {MOCK_HISTORY.map((briefing) => (
              <div key={briefing._id} className="grid grid-cols-4 items-center p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Calendar size={16} className="text-slate-400" />
                  {briefing.dutyDate}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock size={16} className="text-slate-400" />
                  {briefing.shift}
                </div>
                <div className="text-slate-600">
                  {briefing.language}
                </div>
                <div className="text-right">
                  {/* Future: Wire this up to open a modal or navigate to a view page */}
                  <button className="text-blue-600 font-bold hover:text-blue-800 text-sm">
                    View Script
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {MOCK_HISTORY.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No historical briefings found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}