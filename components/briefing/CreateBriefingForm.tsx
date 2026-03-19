"use client";

import React, { useState } from "react";
import axios from "axios";
import { Save, X, Loader2, MapPin, Clock, Calendar, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

interface Props { onSuccess: () => void; onCancel: () => void; }

export default function CreateBriefing({ onSuccess, onCancel }: Props) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        post: "",
        shift: "Morning",
        dutyDate: new Date().toISOString().split("T")[0],
        briefingScript: "",
        createdByOfficerId: "65f1234567890abcdef12345",
    });

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.briefingScript.trim()) { toast.error("Please enter the briefing script content"); return; }
        setLoading(true);
        try {
            await axios.post("/api/briefing/create", form);
            toast.success("Briefing script saved!");
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save briefing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-900">New Briefing Script</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Draft a duty script for the shift</p>
                </div>
                <button
                    onClick={onCancel}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                {/* Meta fields */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <MapPin size={10} /> RPF Post
                        </label>
                        <input
                            required type="text" placeholder="e.g. CBE MAIN"
                            value={form.post} onChange={e => set("post", e.target.value)}
                            className={field}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <Clock size={10} /> Shift
                        </label>
                        <select value={form.shift} onChange={e => set("shift", e.target.value)} className={field}>
                            <option>Morning</option>
                            <option>Afternoon</option>
                            <option>Night</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            <Calendar size={10} /> Duty Date
                        </label>
                        <input
                            type="date" required
                            value={form.dutyDate} onChange={e => set("dutyDate", e.target.value)}
                            className={field}
                        />
                    </div>
                </div>

                {/* Script */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <Megaphone size={10} /> Briefing Script
                    </label>
                    <textarea
                        required rows={10}
                        placeholder="Type the briefing instructions clearly…"
                        value={form.briefingScript} onChange={e => set("briefingScript", e.target.value)}
                        className={`${field} resize-none leading-relaxed`}
                    />
                    <p className="text-[11px] text-slate-400 text-right">{form.briefingScript.length} chars</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-1.5 bg-slate-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        {loading ? "Saving…" : "Save Briefing"}
                    </button>
                </div>
            </form>
        </div>
    );
}

const field = "w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors";