"use client";

import { ArrowLeft, Search, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Briefing {
  _id: string;
  dutyDate: string;
  shift: "Morning" | "Afternoon" | "Night";
  language: "English" | "Tamil" | "Hindi";
  generatedScript: string;
  isDelivered: boolean;
}

export default function BriefingHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);

  /* Fetch briefing history */
  useEffect(() => {
    const fetchBriefings = async () => {
      try {
        const res = await fetch("/api/briefing/get");
        const data = await res.json();

        if (data.success) {
          setBriefings(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch briefing history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefings();
  }, []);

  /* Search filter */
  const filteredBriefings = briefings.filter((b) =>
    b.dutyDate?.slice(0, 10).includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link
            href="/so/dashboard/"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Briefing Archive
          </h1>

          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Historical log of all generated shift briefings for Trichy Junction.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by date (YYYY-MM-DD)..."
            className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-4 bg-slate-100 p-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div>Date</div>
            <div>Shift</div>
            <div>Language</div>
            <div className="text-right">Action</div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-10 text-center text-slate-500">
              Loading briefing history...
            </div>
          )}

          {/* Data */}
          <div className="divide-y divide-slate-100">
            {!loading &&
              filteredBriefings.map((briefing) => (
                <div
                  key={briefing._id}
                  className="grid md:grid-cols-4 gap-3 md:gap-0 items-start md:items-center p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Date */}
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Calendar size={16} className="text-slate-400" />
                    {new Date(briefing.dutyDate).toLocaleDateString()}
                  </div>

                  {/* Shift */}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={16} className="text-slate-400" />
                    {briefing.shift}
                  </div>

                  {/* Language */}
                  <div className="text-slate-600">
                    {briefing.language}
                  </div>

                  {/* Action */}
                  <div className="md:text-right">
                    <button
                      onClick={() =>
                        alert(briefing.generatedScript)
                      }
                      className="text-blue-600 font-bold hover:text-blue-800 text-sm"
                    >
                      View Script
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          {!loading && filteredBriefings.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No historical briefings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}