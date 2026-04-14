"use client";

import React, { useEffect, useState } from "react";
// Added ArrowLeft to the imports
import { Save, Trash2, RefreshCw, AlertCircle, CheckCircle2, Smartphone, ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // Assumes you are using Next.js App Router

interface AppConfigData {
    latestVersion: string;
    forceUpdate: boolean;
    downloadUrl: string;
}

const AppConfigPage = () => {
    const router = useRouter(); // Initialize router
    const [config, setConfig] = useState<AppConfigData>({
        latestVersion: "",
        forceUpdate: false,
        downloadUrl: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/app-config");
            const result = await res.json();
            if (result.success && result.data) {
                setConfig({
                    latestVersion: result.data.latestVersion,
                    forceUpdate: result.data.forceUpdate,
                    downloadUrl: result.data.downloadUrl,
                });
            }
        } catch (error) {
            showStatus("error", "Failed to load configuration");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const showStatus = (type: "success" | "error", msg: string) => {
        setStatus({ type, msg });
        setTimeout(() => setStatus(null), 4000);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/app-config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            const result = await res.json();
            if (result.success) showStatus("success", "Configuration updated successfully!");
        } catch (error) {
            showStatus("error", "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Reset all configurations? This will delete the current entry.")) return;
        try {
            const res = await fetch("/api/app-config", { method: "DELETE" });
            if (res.ok) {
                showStatus("success", "Configuration deleted");
                fetchConfig();
            }
        } catch (error) {
            showStatus("error", "Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="mt-4 text-slate-500 font-medium">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 md:p-12 font-sans">
            <div className="max-w-2xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => router.push("/admin")} // Update path as needed
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Admin</span>
                </button>

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">App Management</h1>
                            <p className="text-sm text-slate-500 mt-1">Control remote app versions and update policies.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={fetchConfig}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Toast Notification */}
                {status && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                        {status.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                        <span className="font-medium text-sm">{status.msg}</span>
                    </div>
                )}

                {/* Main Form Card */}
                <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="p-6 sm:p-8 space-y-6">

                        {/* Version Input */}
                        <div className="space-y-2">
                            <label htmlFor="latestVersion" className="block text-sm font-semibold text-slate-900">
                                Latest Version
                            </label>
                            <input
                                id="latestVersion"
                                type="text"
                                required
                                placeholder="e.g. 2.1.0"
                                value={config.latestVersion}
                                onChange={(e) => setConfig({ ...config, latestVersion: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            />
                            <p className="text-xs text-slate-500">The current build version available in the App Store or Google Play.</p>
                        </div>

                        {/* URL Input */}
                        <div className="space-y-2">
                            <label htmlFor="downloadUrl" className="block text-sm font-semibold text-slate-900">
                                Store URL <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="downloadUrl"
                                type="url"
                                placeholder="https://play.google.com/store/apps/details?id=..."
                                value={config.downloadUrl}
                                onChange={(e) => setConfig({ ...config, downloadUrl: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            />
                            <p className="text-xs text-slate-500">The direct link where users will be redirected to download the update.</p>
                        </div>

                        {/* Toggle Section */}
                        <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-start sm:items-center justify-between gap-4">
                            <div className="flex gap-3 items-start">
                                <ShieldAlert className={`w-5 h-5 mt-0.5 ${config.forceUpdate ? 'text-blue-600' : 'text-slate-400'}`} />
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Force Update</h3>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                                        When enabled, users on older versions cannot skip the update screen and must upgrade to continue using the app.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={config.forceUpdate}
                                onClick={() => setConfig({ ...config, forceUpdate: !config.forceUpdate })}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.forceUpdate ? "bg-blue-600" : "bg-slate-300"
                                    }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config.forceUpdate ? "translate-x-5" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl flex flex-col-reverse sm:flex-row gap-4 justify-between items-center">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset Defaults
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default AppConfigPage;