"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Loader2, User, Hash, ShieldCheck, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface Officer {
  _id: string;
  name: string;
  forceNumber?: string;
  rank?: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  division?: string;
  active: boolean;
}

interface EditOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  officer: Officer | null;
  onUpdateSuccess: () => void;
}

const RANKS = ["DSC", "ASC", "IPF", "SI", "ASI", "HC", "CONSTABLE"] as const;
const ROLES = ["ADMIN", "SO", "STAFF"] as const;

const inputCls =
  "w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent focus:bg-white transition-all";

const selectCls =
  "w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer";

const Field = ({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <div className="relative flex items-center">
      <span className="absolute left-3 text-slate-400 pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
  </div>
);

const Section = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const EditOfficerModal: React.FC<EditOfficerModalProps> = ({
  isOpen,
  onClose,
  officer,
  onUpdateSuccess,
}) => {
  const [form, setForm] = useState({
    name: "",
    forceNumber: "",
    rank: "" as Officer["rank"] | "",
    role: "STAFF" as Officer["role"],
    division: "",
    active: true,
  });

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (officer) {
      setForm({
        name: officer.name,
        forceNumber: officer.forceNumber ?? "",
        rank: officer.rank ?? "",
        role: officer.role,
        division: officer.division ?? "",
        active: officer.active,
      });
    }
  }, [officer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!officer) return;

    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!form.role) {
      toast.error("Role is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Updating officer...");

    try {
      await axios.put("/api/officer/update", {
        id: officer._id,
        name: form.name.trim(),
        forceNumber: form.forceNumber.trim() || undefined,
        rank: form.rank || undefined,
        role: form.role,
        division: form.division.trim() || undefined,
        active: form.active,
      });

      toast.success("Officer updated successfully", { id: toastId });

      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to update officer.",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!officer) return;

    const confirmReset = window.confirm(
      "Reset password to default (1234567890)?"
    );

    if (!confirmReset) return;

    setResetting(true);
    const toastId = toast.loading("Resetting password...");

    try {
      await axios.put("/api/officer/update", {
        id: officer._id,
        resetPassword: true,
      });

      toast.success("Password reset to 1234567890", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to reset password", { id: toastId });
    } finally {
      setResetting(false);
    }
  };

  if (!isOpen || !officer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <User className="text-white" size={17} />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Edit Officer
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {officer.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          <Section title="Personal Info" />

          <Field label="Full Name" required icon={<User size={15} />}>
            <input
              name="name"
              type="text"
              required
              className={inputCls}
              value={form.name}
              onChange={handleChange}
            />
          </Field>

          <Field label="Force Number" icon={<Hash size={15} />}>
            <input
              name="forceNumber"
              type="text"
              className={`${inputCls} font-mono`}
              value={form.forceNumber}
              onChange={handleChange}
            />
          </Field>

          <Section title="Role & Rank" />

          <div className="grid grid-cols-2 gap-3">

            <Field label="Rank" required icon={<ShieldCheck size={15} />}>
              <select
                name="rank"
                className={selectCls}
                value={form.rank}
                onChange={handleChange}
              >
                <option value="">— None —</option>
                {RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Role" required icon={<ShieldCheck size={15} />}>
              <select
                name="role"
                className={selectCls}
                value={form.role}
                onChange={handleChange}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

          </div>

          <Field label="Division" icon={<Layers size={15} />}>
            <input
              name="division"
              type="text"
              className={`${inputCls} uppercase`}
              placeholder="E.G. TRICHY"
              value={form.division}
              onChange={handleChange}
            />
          </Field>

          <Section title="Status" />

          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Active Status
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Inactive officers cannot log in.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="sr-only peer"
              />

              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-slate-400 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">

          <button
            onClick={handleResetPassword}
            disabled={resetting}
            className="px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
          >
            {resetting ? "Resetting..." : "Reset Password"}
          </button>

          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50 bg-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
};

  export default EditOfficerModal;