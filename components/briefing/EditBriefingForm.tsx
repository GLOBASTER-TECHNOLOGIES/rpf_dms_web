"use client";

import React, { useState } from "react";
import axios from "axios";
import { Save, X, Trash2, Loader2, RotateCcw, MapPin, Clock, Calendar, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

interface Props { briefing: any; onSuccess: () => void; onCancel: () => void; }

const toDateStr = (d: any) =>
  d ? new Date(d).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

export default function EditBriefing({ briefing, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const initial = {
    post: briefing?.post || "",
    shift: briefing?.shift || "Morning",
    dutyDate: toDateStr(briefing?.dutyDate),
    briefingScript: briefing?.briefingScript || "",
  };

  const [form, setForm] = useState(initial);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isDirty =
    form.post !== initial.post ||
    form.shift !== initial.shift ||
    form.dutyDate !== initial.dutyDate ||
    form.briefingScript !== initial.briefingScript;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // FIX: was `/api/briefing/update${briefing._id}` — missing `?id=`
      await axios.put(`/api/briefing/update?id=${briefing._id}`, form);
      toast.success("Briefing updated");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/briefing/delete?id=${briefing._id}`);
      toast.success("Briefing deleted");
      onSuccess();
    } catch {
      toast.error("Failed to delete");
      setIsDeleting(false);
      setConfirmDel(false);
    }
  };

  const updatedAt = briefing?.updatedAt
    ? new Date(briefing.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">Edit Briefing Script</h2>
          {updatedAt && <p className="text-xs text-slate-400 mt-0.5">Last saved: {updatedAt}</p>}
        </div>
        <div className="flex items-center gap-1">
          {isDirty && (
            <button
              onClick={() => { setForm(initial); toast("Reset to saved values", { icon: "↩️" }); }}
              title="Discard changes"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Unsaved changes notice */}
      {isDirty && (
        <div className="flex items-center gap-2 mx-6 mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <p className="text-xs font-medium text-amber-700">Unsaved changes</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleUpdate} className="px-6 py-5 space-y-5">

        {/* Meta fields */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <MapPin size={10} /> RPF Post
            </label>
            <input
              required type="text"
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
            value={form.briefingScript} onChange={e => set("briefingScript", e.target.value)}
            className={`${field} resize-none leading-relaxed`}
          />
          <p className="text-[11px] text-slate-400 text-right">{form.briefingScript.length} chars</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          {/* Delete */}
          {!confirmDel ? (
            <button type="button" onClick={() => setConfirmDel(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-semibold">Sure?</span>
              <button type="button" onClick={handleDelete} disabled={isDeleting}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {isDeleting ? <Loader2 className="animate-spin" size={12} /> : null}
                Yes, Delete
              </button>
              <button type="button" onClick={() => setConfirmDel(false)}
                className="text-xs font-medium text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          )}

          {/* Save */}
          <div className="flex gap-2">
            <button type="button" onClick={onCancel}
              className="text-sm font-medium text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Discard
            </button>
            <button type="submit" disabled={loading || !isDirty}
              className="flex items-center gap-1.5 bg-slate-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const field = "w-full px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors";