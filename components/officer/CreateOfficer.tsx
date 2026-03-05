"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  UserPlus,
  Loader2,
  Save,
  Eye,
  EyeOff,
  User,
  Hash,
  ShieldCheck,
  MapPin,
  Lock,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

const RANKS = ["DSC", "ASC", "IPF", "SI", "ASI", "HC", "CONSTABLE"];
const ROLES = ["ADMIN", "SO", "STAFF"];

interface CreateOfficerProps {
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

const selectCls =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer";

const CreateOfficer: React.FC<CreateOfficerProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    forceNumber: "",
    rank: "CONSTABLE",
    role: "STAFF",
    division: "",
    postCode: "",
    postId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();
    try {
      const payload = {
        name: formData.name,
        forceNumber: formData.forceNumber,
        rank: formData.rank,
        role: formData.role,
        division: formData.division,
        postCode: formData.postCode,
        postId: formData.postId || undefined,
        password: formData.password,
      };
      const res = await axios.post("/api/officer/create", payload);
      if (res.status === 201) {
        toast.success("Officer created successfully");
        setFormData({
          name: "",
          forceNumber: "",
          rank: "CONSTABLE",
          role: "STAFF",
          division: "",
          postCode: "",
          postId: "",
          password: "",
        });
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create officer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ── Card Header ── */}
        <div className="px-9 py-7 bg-gradient-to-r from-blue-800 to-blue-900">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <UserPlus className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Register Officer</h2>
              <p className="text-blue-200 text-sm mt-0.5">
                Add a new RPF personnel to the system
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-9 py-8 space-y-7">

          {/* ── Section: Personal Info ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Personal Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Full Name" required icon={<User size={16} />}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  className={inputCls}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Field>

              <Field
                label="Force Number"
                required
                icon={<Hash size={16} />}
                hint="Unique identifier assigned by RPF"
              >
                <input
                  type="text"
                  required
                  placeholder="e.g. RPF-00123"
                  className={`${inputCls} font-mono`}
                  value={formData.forceNumber}
                  onChange={(e) => handleChange("forceNumber", e.target.value)}
                />
              </Field>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section: Role & Rank ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Role & Rank
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Rank" required icon={<ShieldCheck size={16} />}>
                <select
                  className={selectCls}
                  value={formData.rank}
                  onChange={(e) => handleChange("rank", e.target.value)}
                >
                  {RANKS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>

              <Field label="App Role" required icon={<ShieldCheck size={16} />}>
                <select
                  className={selectCls}
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section: Assignment ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Assignment
              <span className="normal-case font-normal text-slate-300 ml-1">(optional)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <Field label="Division" icon={<Layers size={16} />}>
                <input
                  type="text"
                  placeholder="e.g. TPJ"
                  className={`${inputCls} uppercase placeholder:normal-case`}
                  value={formData.division}
                  onChange={(e) => handleChange("division", e.target.value.toUpperCase())}
                />
              </Field>

              <Field label="Post Code" icon={<MapPin size={16} />}>
                <input
                  type="text"
                  placeholder="e.g. TPJ"
                  className={`${inputCls} uppercase placeholder:normal-case font-mono`}
                  value={formData.postCode}
                  onChange={(e) => handleChange("postCode", e.target.value.toUpperCase())}
                />
              </Field>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* ── Section: Security ── */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Security
            </p>

            <Field label="Password" required icon={<Lock size={16} />} hint="Minimum 6 characters">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Set a secure password"
                className={`${inputCls} pr-12`}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

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
              className="px-7 py-3 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-md shadow-blue-200 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {loading ? "Creating..." : "Create Officer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateOfficer;