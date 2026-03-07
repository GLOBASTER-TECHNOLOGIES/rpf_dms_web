"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";

interface BriefingFormProps {
  post: string;
  shift: string;
  hasExistingBriefing: boolean;
  onGenerate: (language: string) => Promise<void>;
}

export default function BriefingForm({ post, shift, hasExistingBriefing, onGenerate }: BriefingFormProps) {
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onGenerate(language);
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Generate Shift Briefing</h2>
        <p className="text-sm text-slate-500">Auto-configured for your current assignment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Duty Post</p>
            <p className="font-semibold text-slate-800">{post}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Current Shift</p>
            <p className="font-semibold text-slate-800">{shift}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Output Language</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            disabled={hasExistingBriefing}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || hasExistingBriefing}
          className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
          {hasExistingBriefing 
            ? "Script Already Generated for this Shift" 
            : isLoading ? "Synthesizing Intelligence..." : "Generate Briefing"}
        </button>
      </form>
    </div>
  );
}