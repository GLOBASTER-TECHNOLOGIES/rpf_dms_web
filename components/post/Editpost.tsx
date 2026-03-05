"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    X,
    Loader2,
    Building2,
    MapPin,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Layers,
    FileText,
} from "lucide-react";
import toast from "react-hot-toast";

interface Post {
    _id: string;
    postCode: string;
    division: string;
    ipfId?: string;
    contactNumber?: string;
    address?: string;
}

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post | null;
    onUpdateSuccess: () => void;
}

const inputCls =
    "w-full px-4 py-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent focus:bg-white transition-all";

const iconInputCls =
    "w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent focus:bg-white transition-all";

const Field = ({
    label,
    required,
    children,
    hint,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    hint?: string;
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

const Section = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            {title}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
    </div>
);

const EditPostModal: React.FC<EditPostModalProps> = ({
    isOpen,
    onClose,
    post,
    onUpdateSuccess,
}) => {
    const [form, setForm] = useState({
        postCode: "",
        division: "",
        password: "",
        contactNumber: "",
        address: "",
    });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (post) {
            setForm({
                postCode: post.postCode,
                division: post.division,
                password: "",
                contactNumber: post.contactNumber ?? "",
                address: post.address ?? "",
            });
        }
    }, [post]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!post) return;

        if (!form.postCode.trim() || !form.division.trim()) {
            toast.error("Post Code and Division are required.");
            return;
        }

        setSaving(true);
        const toastId = toast.loading("Updating post...");

        try {
            // API expects id in the request BODY
            const payload: Record<string, any> = {
                id: post._id,
                postCode: form.postCode.toUpperCase().trim(),
                division: form.division.toUpperCase().trim(),
                contactNumber: form.contactNumber.trim() || undefined,
                address: form.address.trim() || undefined,
            };

            // Only include password if user typed one
            if (form.password.trim()) {
                payload.password = form.password.trim();
            }

            await axios.put("/api/post/update", payload);

            toast.success("Post updated successfully", { id: toastId });
            onUpdateSuccess();
            onClose();
        } catch (err: any) {
            console.error("Update error:", err);
            toast.error(
                err?.response?.data?.message ?? "Failed to update post.",
                { id: toastId }
            );
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Building2 className="text-white" size={17} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Edit Post</h2>
                            <p className="text-slate-400 text-xs mt-0.5 font-mono">{post.postCode}</p>
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

                    <Section title="Post Identity" />

                    {/* Post Code + Division side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Post Code" required>
                            <input
                                name="postCode"
                                type="text"
                                required
                                className={`${inputCls} font-mono text-base tracking-[0.2em] uppercase`}
                                value={form.postCode}
                                onChange={handleChange}
                            />
                        </Field>

                        <Field label="Division" required>
                            <div className="relative flex items-center">
                                <Layers size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                                <input
                                    name="division"
                                    type="text"
                                    required
                                    className={`${iconInputCls} uppercase`}
                                    value={form.division}
                                    onChange={handleChange}
                                />
                            </div>
                        </Field>
                    </div>

                    <Section title="Contact & Location" />

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Contact Number">
                            <div className="relative flex items-center">
                                <Phone size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                                <input
                                    name="contactNumber"
                                    type="tel"
                                    placeholder="9876543210"
                                    className={`${iconInputCls} font-mono`}
                                    value={form.contactNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </Field>

                        <Field label="Address">
                            <div className="relative flex items-center">
                                <MapPin size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                                <input
                                    name="address"
                                    type="text"
                                    placeholder="Address or landmark"
                                    className={iconInputCls}
                                    value={form.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </Field>
                    </div>

                    <Section title="Security" />

                    <Field label="New Password" hint="Leave blank to keep existing password">
                        <div className="relative flex items-center">
                            <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                minLength={6}
                                placeholder="Leave blank to keep current"
                                className={`${iconInputCls} pr-10`}
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-slate-400 hover:text-slate-600 transition"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </Field>

                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
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

export default EditPostModal;