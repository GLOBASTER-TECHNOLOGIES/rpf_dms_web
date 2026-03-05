"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CalendarClock,
  Loader2,
  Save,
  Tag,
  MapPin,
  CalendarDays,
  ShieldAlert,
  FileText,
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const EVENT_TYPES = ["FESTIVAL", "EXAM", "POLITICAL", "LOCAL_EVENT"] as const;
const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const RISK_STYLE: Record<string, string> = {
  LOW:      "bg-green-50 text-green-700 border-green-200",
  MEDIUM:   "bg-amber-50 text-amber-700 border-amber-200",
  HIGH:     "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_LABEL: Record<string, string> = {
  FESTIVAL:    "Festival",
  EXAM:        "Exam",
  POLITICAL:   "Political",
  LOCAL_EVENT: "Local Event",
};

interface ThreatCalendar {
  _id: string;
  eventName: string;
  type: typeof EVENT_TYPES[number];
  location?: string;
  startDate: string;
  endDate: string;
  riskLevel: typeof RISK_LEVELS[number];
  advisories?: string;
}

interface EditThreatCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ThreatCalendar | null;
  onUpdateSuccess: () => void;
}

const Field = ({
  label, required, icon, children, hint,
}: {
  label: string; required?: boolean; icon: React.ReactNode;
  children: React.ReactNode; hint?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative flex items-center">
      <span className="absolute left-4 text-slate-400 pointer-events-none">{icon}</span>
      {children}
    </div>
    {hint && <p className="text-xs text-slate-400 pl-1">{hint}</p>}
  </div>
);

const inputCls = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all";
const selectCls = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer";

// Convert ISO date string → "YYYY-MM-DD" for date inputs
const toDateInput = (val?: string) => {
  if (!val) return "";
  return new Date(val).toISOString().split("T")[0];
};

const EditThreatCalendarModal: React.FC<EditThreatCalendarModalProps> = ({
  isOpen, onClose, event, onUpdateSuccess,
}) => {
  const [formData, setFormData] = useState({
    eventName: "",
    type: "FESTIVAL" as typeof EVENT_TYPES[number],
    location: "",
    startDate: "",
    endDate: "",
    riskLevel: "LOW" as typeof RISK_LEVELS[number],
    advisories: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        eventName: event.eventName,
        type: event.type,
        location: event.location || "",
        startDate: toDateInput(event.startDate),
        endDate: toDateInput(event.endDate),
        riskLevel: event.riskLevel,
        advisories: event.advisories || "",
      });
    }
  }, [event]);

  const handleChange = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      toast.error("End date cannot be before start date");
      return;
    }
    if (!event) return;
    setLoading(true);
    toast.dismiss();
    try {
      const payload = {
        eventName: formData.eventName,
        type: formData.type,
        location: formData.location || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        riskLevel: formData.riskLevel,
        advisories: formData.advisories || undefined,
      };
      const res = await axios.put(`/api/threatcalendar/update?id=${event._id}`, payload);
      if (res.status === 200) {
        toast.success("Threat event updated");
        onUpdateSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update event");
    } finally { setLoading(false); }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-red-800 to-red-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <CalendarClock className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Threat Event</h2>
              <p className="text-red-200 text-xs mt-0.5 truncate max-w-xs">{event.eventName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-red-200 hover:text-white hover:bg-white/10 rounded-xl transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Event Details */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Event Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Event Name" required icon={<CalendarClock size={16} />}>
                <input type="text" required placeholder="e.g. Diwali Celebrations"
                  className={inputCls} value={formData.eventName}
                  onChange={(e) => handleChange("eventName", e.target.value)} />
              </Field>

              <Field label="Event Type" required icon={<Tag size={16} />}>
                <select className={selectCls} value={formData.type} onChange={(e) => handleChange("type", e.target.value)}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </Field>

              <Field label="Location" icon={<MapPin size={16} />} hint="Optional">
                <input type="text" placeholder="e.g. Trichy Division"
                  className={inputCls} value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)} />
              </Field>

              <Field label="Risk Level" required icon={<ShieldAlert size={16} />}>
                <select className={selectCls} value={formData.riskLevel} onChange={(e) => handleChange("riskLevel", e.target.value)}>
                  {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            {formData.riskLevel && (
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${RISK_STYLE[formData.riskLevel]}`}>
                  <AlertTriangle size={12} />{formData.riskLevel} RISK
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Schedule */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Schedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Start Date" required icon={<CalendarDays size={16} />}>
                <input type="date" required className={inputCls}
                  value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} />
              </Field>
              <Field label="End Date" required icon={<CalendarDays size={16} />}>
                <input type="date" required className={inputCls}
                  min={formData.startDate} value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Advisories */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Advisories <span className="normal-case font-normal text-slate-300 ml-1">(optional)</span>
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <FileText size={15} className="text-slate-400" /> Security Advisories
              </label>
              <textarea rows={4}
                placeholder="e.g. Deploy extra QRT at main gates..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent focus:bg-white transition-all resize-none"
                value={formData.advisories}
                onChange={(e) => handleChange("advisories", e.target.value)} />
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition disabled:opacity-50 bg-white">
            Cancel
          </button>
          <button onClick={handleSubmit as any} disabled={loading}
            className="px-7 py-2.5 bg-red-800 hover:bg-red-900 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-md shadow-red-200 disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditThreatCalendarModal;