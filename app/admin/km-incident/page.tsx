"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, X, Plus, Save, AlertCircle, Loader2 } from "lucide-react";

enum IncidentType {
    TRESPASSING = "TRESPASSING",
    CATTLE = "CATTLE",
    OBSTRUCTION = "OBSTRUCTION",
    TRACK_DAMAGE = "TRACK_DAMAGE",
    FIRE = "FIRE",
    FLOOD = "FLOOD",
    SIGNAL_FAILURE = "SIGNAL_FAILURE",
    ACCIDENT = "ACCIDENT",
}

interface KmIncident {
    _id?: string;
    division: string;
    rpf_post: string;
    section: string;
    track_km: number;
    incident_type: IncidentType;
    date_of_occurrence: string;
}

export default function IncidentPage() {
    const router = useRouter();
    const [incidents, setIncidents] = useState<KmIncident[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const initialFormState: KmIncident = {
        division: "",
        rpf_post: "",
        section: "",
        track_km: 0,
        incident_type: IncidentType.TRESPASSING,
        date_of_occurrence: new Date().toISOString().split("T")[0],
    };

    const [form, setForm] = useState<KmIncident>(initialFormState);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/km-incident");
            const data = await res.json();
            setIncidents(data.data || []);
        } catch (err) {
            setError("Error loading data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIncidents(); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "track_km" ? parseFloat(value) || 0 : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const url = editingId ? `/api/km-incident/${editingId}` : "/api/km-incident";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                fetchIncidents();
                closeForm();
            } else {
                setError("Failed to save. Check server.");
            }
        } catch (err) {
            setError("Failed to save.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record?")) {
            await fetch(`/api/km-incident/${id}`, { method: "DELETE" });
            fetchIncidents();
        }
    };

    const handleEdit = (incident: KmIncident) => {
        setEditingId(incident._id!);
        const formattedDate = new Date(incident.date_of_occurrence).toISOString().split("T")[0];
        setForm({ ...incident, date_of_occurrence: formattedDate });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const closeForm = () => {
        setEditingId(null);
        setForm(initialFormState);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Incident List</h1>
                    </div>

                    <button
                        onClick={() => (showForm ? closeForm() : setShowForm(true))}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 ${showForm
                                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg"
                            }`}
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? "Cancel" : "Report New Incident"}
                    </button>
                </div>

                {/* Collapsible Form Section */}
                {showForm && (
                    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className={`p-8 rounded-2xl border-2 shadow-xl ${editingId ? "bg-orange-50 border-orange-200" : "bg-white border-blue-100"}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${editingId ? "bg-orange-100" : "bg-blue-100"}`}>
                                    {editingId ? <Edit2 className="text-orange-600" size={20} /> : <Plus className="text-blue-600" size={20} />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingId ? "Update Incident Details" : "New Incident Report"}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Division</label>
                                    <input name="division" value={form.division} onChange={handleChange} required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="e.g. TPJ" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">RPF Post</label>
                                    <input name="rpf_post" value={form.rpf_post} onChange={handleChange} required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="e.g. TPJ" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Section Code</label>
                                    <input name="section" value={form.section} onChange={handleChange} required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="e.g. TPJ-SRM" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Track KM</label>
                                    <input name="track_km" type="number" step="any" value={form.track_km} onChange={handleChange} required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Incident Type</label>
                                    <div className="relative">
                                        <select name="incident_type" value={form.incident_type} onChange={handleChange}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none appearance-none cursor-pointer transition-all">
                                            {Object.values(IncidentType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date of Occurrence</label>
                                    <input name="date_of_occurrence" type="date" value={form.date_of_occurrence} onChange={handleChange} required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                                </div>

                                <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-70 ${editingId ? "bg-orange-600 shadow-orange-200" : "bg-blue-600 shadow-blue-200"
                                            }`}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {editingId ? "Update Record" : "Save Incident"}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-semibold">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Data Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-700">Recent Records</h2>
                        {loading && <Loader2 className="animate-spin text-blue-500" size={20} />}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Location (KM)</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {incidents.length > 0 ? (
                                    incidents.map((incident) => (
                                        <tr key={incident._id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {new Date(incident.date_of_occurrence).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{incident.section}</div>
                                                <div className="text-xs text-slate-400 font-semibold tracking-tight">KM: {incident.track_km} • {incident.division}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
                                                    {incident.incident_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(incident)}
                                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(incident._id!)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    !loading && (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                        <AlertCircle size={24} />
                                                    </div>
                                                    <p className="text-slate-400 font-medium">No records found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <p className="mt-6 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
                    Railway Incident Reporting System
                </p>
            </div>
        </div>
    );
}