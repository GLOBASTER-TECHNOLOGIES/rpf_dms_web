"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Building2,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  Lock,
  Hash,
  FileText,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

interface CreatePostProps {
  onSuccess: () => void;
}

const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputCls =
  "w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent focus:bg-white transition-all";

const iconInputCls =
  "w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent focus:bg-white transition-all";

const Section = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 pt-1">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const CreatePost: React.FC<CreatePostProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    postCode: "",
    division: "",
    password: "",
    ipfForceId: "",
    contactNumber: "",
    address: "",
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
        postCode: formData.postCode.toUpperCase(),
        division: formData.division.toUpperCase(),
        password: formData.password,
        ipfForceId: formData.ipfForceId || undefined,
        contactNumber: formData.contactNumber || undefined,
        address: formData.address || undefined,
      };
      const res = await axios.post("/api/post/create", payload);
      if (res.status === 201) {
        toast.success("Post created successfully");
        setFormData({
          postCode: "",
          division: "",
          password: "",
          ipfForceId: "",
          contactNumber: "",
          address: "",
        });
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="bg-slate-900 px-7 py-6 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Create New Post
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Register a new RPF Thana or Outpost
            </p>
          </div>
        </div>
        <div className="opacity-10">
          <Building2 className="text-white" size={52} />
        </div>
      </div>

      {/* ── Form Card ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm px-7 py-6 space-y-5"
      >

        <Section title="Post Identity" />

        {/* Post Code + Division side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Post Code" required>
            <input
              type="text"
              required
              placeholder="E.G.  TPJ"
              className={`${inputCls} font-mono text-base tracking-[0.25em] uppercase`}
              value={formData.postCode}
              onChange={(e) => handleChange("postCode", e.target.value)}
            />
          </Field>

          <Field label="Division" required>
            <div className="relative flex items-center">
              <Layers size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="E.G.  TRICHY"
                className={`${iconInputCls} uppercase`}
                value={formData.division}
                onChange={(e) => handleChange("division", e.target.value)}
              />
            </div>
          </Field>
        </div>

        {/* Password */}
        <Field label="Password" required>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="Desk Login Password"
              className={`${iconInputCls} pr-10`}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-700 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Section title="Contact & Location" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Number">
            <div className="relative flex items-center">
              <Phone size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                placeholder="E.G.  9876543210"
                className={`${iconInputCls} font-mono`}
                value={formData.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
              />
            </div>
          </Field>

          <Field label="Address">
            <div className="relative flex items-center">
              <FileText size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Address or landmark"
                className={iconInputCls}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </Field>
        </div>

        <Section title="In-Charge (Optional)" />

        <Field
          label="IPF Force Number"
          hint="The system will auto-link the officer profile if found. Leave empty to assign later."
        >
          <div className="relative flex items-center">
            <Hash size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="E.G.  95123"
              className={`${iconInputCls} font-mono`}
              value={formData.ipfForceId}
              onChange={(e) => handleChange("ipfForceId", e.target.value)}
            />
          </div>
        </Field>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onSuccess}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 transition shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Building2 size={17} />
            )}
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreatePost;