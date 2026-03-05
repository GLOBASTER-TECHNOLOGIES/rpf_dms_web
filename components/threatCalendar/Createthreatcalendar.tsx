"use client";

import React, { useState } from "react";
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

interface CreateThreatCalendarProps {
  onSuccess: () => void;
}

const Field = ({
  label, required, icon, children, hint,
}: {
  label: string; required?: boolean; icon: React.ReactNode;
  children: React.ReactNode; hint?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative flex items-center">
      <span className="absolute left-4 text-slate-400 pointer-events-none">{icon}</span>
      {children}
    </div>
    {hint && <p className="text-xs text-slate-400 pl-1">{hint}</p>}
  </div>
);

const inputCls = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-white transition-all";
const selectCls = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer";

const CreateThreatCalendar: React.FC<CreateThreatCalendarProps> = ({ onSuccess }) => {
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      toast.error("End date cannot be before start date");
      return;
    }
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
      const res = await axios.post("/api/threatcalendar/create", payload);
      if (res.status === 201 && res.data?.success) {
        toast.success("Threat event created successfully");
        setFormData({ eventName: "", type: "FESTIVAL", location: "", startDate: "", endDate: "", riskLevel: "LOW", advisories: "" });
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create threat event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-9 py-7 bg-gradient-to-r from-red-800 to-red-900">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <CalendarClock className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add Threat Event</h2>
              <p className="text-red-200 text-sm mt-0.5">Register a new event on the threat calendar</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-9 py-8 space-y-7">

          {/* Event Details */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Event Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Event Name" required icon={<CalendarClock size={16} />}>
                <input
                  type="text" required
                  placeholder="e.g. Diwali Celebrations"
                  className={inputCls}
                  value={formData.eventName}
                  onChange={(e) => handleChange("eventName", e.target.value)}
                />
              </Field>

              <Field label="Event Type" required icon={<Tag size={16} />}>
                <select className={selectCls} value={formData.type} onChange={(e) => handleChange("type", e.target.value)}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </Field>

              <Field label="Location" icon={<MapPin size={16} />} hint="Optional — e.g. Division Wide, Trichy City">
                <input
                  type="text"
                  placeholder="e.g. Trichy Division"
                  className={inputCls}
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </Field>

              <Field label="Risk Level" required icon={<ShieldAlert size={16} />}>
                <select className={selectCls} value={formData.riskLevel} onChange={(e) => handleChange("riskLevel", e.target.value)}>
                  {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>

            {/* Risk level preview badge */}
            {formData.riskLevel && (
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${RISK_STYLE[formData.riskLevel]}`}>
                  <AlertTriangle size={12} />
                  {formData.riskLevel} RISK
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Schedule */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Schedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Start Date" required icon={<CalendarDays size={16} />}>
                <input
                  type="date" required
                  className={inputCls}
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </Field>
              <Field label="End Date" required icon={<CalendarDays size={16} />}>
                <input
                  type="date" required
                  className={inputCls}
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Advisories */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Advisories
              <span className="normal-case font-normal text-slate-300 ml-1">(optional)</span>
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <FileText size={15} className="text-slate-400" /> Security Advisories
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Deploy extra QRT at main gates. Coordinate with local police. Increase platform surveillance during peak hours."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-white transition-all resize-none"
                value={formData.advisories}
                onChange={(e) => handleChange("advisories", e.target.value)}
              />
              <p className="text-xs text-slate-400 pl-1">Detailed instructions for field officers during this event.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onSuccess}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-7 py-3 bg-red-800 hover:bg-red-900 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-md shadow-red-200 disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
              {loading ? "Saving..." : "Save Event"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateThreatCalendar;