"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Train,
  Loader2,
  Save,
  Hash,
  MapPin,
  Clock,
  Layers,
  FileUp,
  Download,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
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
  const [activeTab, setActiveTab] = useState<"manual" | "bulk">("manual");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      const payload = {
        ...formData,
        platform: Number(formData.platform),
        daysOfRun,
        departureTime: formData.departureTime || undefined,
      };
      await axios.post("/api/trainschedule/create", payload);
      toast.success("Schedule created successfully");
      resetForm();
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
  };

  // --- Logic: Bulk Upload with Failed Items Download ---
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", raw: false, cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const payload = rawData
          .map((row: any) => {
            const getVal = (key: string) => {
              const actualKey = Object.keys(row).find(
                (k) => k.trim().toLowerCase() === key.toLowerCase()
              );
              return actualKey ? String(row[actualKey]).trim() : "";
            };

            const daysRaw = getVal("daysOfRun");

            return {
              trainNumber: getVal("trainNumber"),
              trainName: getVal("trainName"),
              source: getVal("source").toUpperCase(),
              destination: getVal("destination").toUpperCase(),
              arrivalTime: getVal("arrivalTime"),
              departureTime: getVal("departureTime") || undefined,
              platform: getVal("platform") ? Number(getVal("platform")) : undefined,
              daysOfRun: daysRaw
                ? daysRaw.split(",").map((d: string) => d.trim()).filter(Boolean)
                : [],
              // We keep the original row data to reconstruct the fail-file if needed
              _originalRow: row
            };
          })
          .filter((item) => item.trainNumber !== "");

        if (payload.length === 0) {
          toast.error("No valid data found in Excel sheet.");
          setLoading(false);
          return;
        }

        const res = await axios.post("/api/trainschedule/create", { schedules: payload });

        const { savedCount, failedCount, failedItems } = res.data;

        if (failedCount > 0) {
          toast.error(`${failedCount} rows failed. Downloading error report...`, { duration: 5000 });

          // Generate Excel of failed items
          const failedReport = failedItems.map((fail: any) => {
            // Find the original data sent for this trainNumber
            const original = payload.find(p => p.trainNumber === fail.trainNumber)?._originalRow || {};
            return {
              ...original,
              ERROR_REASON: fail.error
            };
          });

          const failWs = XLSX.utils.json_to_sheet(failedReport);
          const failWb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(failWb, failWs, "Errors");
          XLSX.writeFile(failWb, "failed_trains_report.xlsx");
        }

        if (savedCount > 0) {
          toast.success(`Successfully imported ${savedCount} schedules`);
          onSuccess();
        }
      } catch (err: any) {
        console.error("Upload Error:", err);
        toast.error(err.response?.data?.message || "Critical upload error");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const data = [
      {
        trainNumber: "12345",
        trainName: "Express Name",
        source: "NDLS",
        destination: "BCT",
        arrivalTime: "14:30",
        departureTime: "14:45",
        platform: 1,
        daysOfRun: "Mon,Wed,Fri",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedules");
    XLSX.writeFile(wb, "Train_Import_Template.xlsx");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-9 py-7 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/15 rounded-xl">
                <Train className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Train Schedule</h2>
                <p className="text-slate-300 text-sm">Add or bulk import schedules</p>
              </div>
            </div>
            <div className="flex bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === "manual" ? "bg-white text-slate-900 shadow" : "text-white hover:bg-white/5"}`}
              >
                Manual
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${activeTab === "bulk" ? "bg-white text-slate-900 shadow" : "text-white hover:bg-white/5"}`}
              >
                Bulk Upload
              </button>
            </div>
          </div>
        </div>

        {activeTab === "manual" ? (
          <form onSubmit={handleSubmit} className="px-9 py-8 space-y-7">
            {/* Train Info */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Train Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Train Number" required icon={<Hash size={16} />}>
                  <input type="text" required placeholder="12345" className={`${inputCls} font-mono`} value={formData.trainNumber} onChange={(e) => handleChange("trainNumber", e.target.value)} />
                </Field>
                <Field label="Train Name" required icon={<Train size={16} />}>
                  <input type="text" required placeholder="Chennai Express" className={inputCls} value={formData.trainName} onChange={(e) => handleChange("trainName", e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Route */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Route</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Source" required icon={<MapPin size={16} />}>
                  <input type="text" required placeholder="CSTM" className={`${inputCls} uppercase`} value={formData.source} onChange={(e) => handleChange("source", e.target.value.toUpperCase())} />
                </Field>
                <Field label="Destination" required icon={<ArrowRight size={16} />}>
                  <input type="text" required placeholder="MAS" className={`${inputCls} uppercase`} value={formData.destination} onChange={(e) => handleChange("destination", e.target.value.toUpperCase())} />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Timing */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Timing & Platform</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Arrival" required icon={<Clock size={16} />}>
                  <input type="time" required className={inputCls} value={formData.arrivalTime} onChange={(e) => handleChange("arrivalTime", e.target.value)} />
                </Field>
                <Field label="Departure" icon={<Clock size={16} />} hint="Optional">
                  <input type="time" className={inputCls} value={formData.departureTime} onChange={(e) => handleChange("departureTime", e.target.value)} />
                </Field>
                <Field label="Platform" required icon={<Layers size={16} />}>
                  <input type="number" required min={1} className={inputCls} value={formData.platform} onChange={(e) => handleChange("platform", e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Days */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Days of Run</p>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${daysOfRun.includes(day) ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={onSuccess} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                {loading ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-9 py-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 rotate-3">
              <FileUp size={38} className="-rotate-3" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Bulk Import via Excel</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-3 mb-10">
              Upload an Excel file. If any rows fail, we will download a report for you to fix and re-upload.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={downloadTemplate}
                className="flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                <Download size={19} />
                Download Template
              </button>

              <label className={`flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-700 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-800 transition shadow-lg shadow-blue-100 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {loading ? <Loader2 className="animate-spin" size={19} /> : <CheckCircle2 size={19} />}
                {loading ? "Processing..." : "Select Excel File"}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleBulkUpload}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTrainSchedule;