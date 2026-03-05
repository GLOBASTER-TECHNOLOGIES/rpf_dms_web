"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Train,
  Loader2,
  Save,
  Hash,
  MapPin,
  Clock,
  Layers,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CreateTrainScheduleProps {
  onSuccess: () => void;
}

const Field = ({
  label,
  required,
  icon,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
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

const inputCls =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-white transition-all";

const CreateTrainSchedule: React.FC<CreateTrainScheduleProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    trainNumber: "",
    trainName: "",
    arrivalTime: "",
    departureTime: "",
    platform: "",
    source: "",
    destination: "",
  });
  const [daysOfRun, setDaysOfRun] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setDaysOfRun((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (daysOfRun.length === 0) {
      toast.error("Please select at least one day of run");
      return;
    }
    setLoading(true);
    toast.dismiss();
    try {
      const payload = {
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        arrivalTime: formData.arrivalTime,
        departureTime: formData.departureTime || undefined,
        platform: Number(formData.platform),
        daysOfRun,
        source: formData.source,
        destination: formData.destination,
      };
      const res = await axios.post("/api/trainschedule/create", payload);
      if (res.status === 201) {
        toast.success("Train schedule created successfully");
        setFormData({
          trainNumber: "",
          trainName: "",
          arrivalTime: "",
          departureTime: "",
          platform: "",
          source: "",
          destination: "",
        });
        setDaysOfRun([]);
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create train schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Card Header ── */}
        <div className="px-9 py-7 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <Train className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add Train Schedule</h2>
              <p className="text-slate-300 text-sm mt-0.5">
                Register a new train schedule at this post
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-9 py-8 space-y-7">

          {/* ── Section: Train Info ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Train Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Train Number" required icon={<Hash size={16} />}>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12345"
                  className={`${inputCls} font-mono`}
                  value={formData.trainNumber}
                  onChange={(e) => handleChange("trainNumber", e.target.value)}
                />
              </Field>

              <Field label="Train Name" required icon={<Train size={16} />}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai Express"
                  className={inputCls}
                  value={formData.trainName}
                  onChange={(e) => handleChange("trainName", e.target.value)}
                />
              </Field>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section: Route ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Route
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Source Station" required icon={<MapPin size={16} />}>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSTM"
                  className={`${inputCls} uppercase placeholder:normal-case`}
                  value={formData.source}
                  onChange={(e) => handleChange("source", e.target.value.toUpperCase())}
                />
              </Field>

              <Field label="Destination Station" required icon={<ArrowRight size={16} />}>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAS"
                  className={`${inputCls} uppercase placeholder:normal-case`}
                  value={formData.destination}
                  onChange={(e) => handleChange("destination", e.target.value.toUpperCase())}
                />
              </Field>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section: Timing ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Timing & Platform
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              <Field label="Arrival Time" required icon={<Clock size={16} />}>
                <input
                  type="time"
                  required
                  className={inputCls}
                  value={formData.arrivalTime}
                  onChange={(e) => handleChange("arrivalTime", e.target.value)}
                />
              </Field>

              <Field
                label="Departure Time"
                icon={<Clock size={16} />}
                hint="Optional"
              >
                <input
                  type="time"
                  className={inputCls}
                  value={formData.departureTime}
                  onChange={(e) => handleChange("departureTime", e.target.value)}
                />
              </Field>

              <Field label="Platform" required icon={<Layers size={16} />}>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 3"
                  className={`${inputCls} font-mono`}
                  value={formData.platform}
                  onChange={(e) => handleChange("platform", e.target.value)}
                />
              </Field>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section: Days of Run ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Days of Run <span className="normal-case font-normal text-red-400 ml-1">*</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {DAYS_OF_WEEK.map((day) => {
                const active = daysOfRun.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      active
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {daysOfRun.length > 0 && (
              <p className="text-xs text-slate-400 mt-3 pl-1">
                Selected: <span className="text-slate-600 font-medium">{daysOfRun.join(", ")}</span>
              </p>
            )}
          </div>

          {/* ── Footer Buttons ── */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onSuccess}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-md shadow-slate-200 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {loading ? "Saving..." : "Save Schedule"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTrainSchedule;