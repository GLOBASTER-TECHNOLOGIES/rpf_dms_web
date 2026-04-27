"use client";

import { useEffect, useState } from "react";
import {
    MapPin,
    Trash2,
    Plus,
    Search,
    Map as MapIcon,
    Navigation,
    Loader2,
    AlertCircle,
    Globe,
    LocateFixed,
    Pencil,
    X
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface KmPost {
    _id?: string;
    division: string;
    section: string;
    km_number: number;
    latitude: number;
    longitude: number;
}

export default function KmPostPage() {
    const [posts, setPosts] = useState<KmPost[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<KmPost>({
        division: "",
        section: "",
        km_number: 0,
        latitude: 0,
        longitude: 0,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/km-posts");
            const data = await res.json();
            setPosts(data.data || []);
        } catch (err) {
            setError("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumeric = ["km_number", "latitude", "longitude"].includes(name);

        setForm({
            ...form,
            [name]: isNumeric ? parseFloat(value) || 0 : value.toUpperCase()
        });
    };

    const handleEdit = (post: KmPost) => {
        setEditingId(post._id || null);
        setForm({
            division: post.division,
            section: post.section,
            km_number: post.km_number,
            latitude: post.latitude,
            longitude: post.longitude,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ division: "", section: "", km_number: 0, latitude: 0, longitude: 0 });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.division || !form.section || form.km_number <= 0) {
            setError("Please fill in all required fields accurately.");
            return;
        }

        try {
            setIsSubmitting(true);
            const url = editingId ? `/api/km-posts/${editingId}` : "/api/km-posts";
            // Changed to PUT as requested
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.message);
                return;
            }

            cancelEdit();
            fetchPosts();
        } catch (err) {
            setError("Server connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this KM Post?")) return;
        await fetch(`/api/km-posts/${id}`, { method: "DELETE" });
        fetchPosts();
    };

    const filteredPosts = posts.filter(post =>
        post.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.division.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 text-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <button
                        onClick={() => router.push("/admin")}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                </div>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <MapIcon className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">KM Post Directory</h1>
                            <p className="text-slate-500 text-sm font-medium">Railway kilometer markers & GPS Coordinates</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
                            <div className="bg-slate-50 border-b px-6 py-4 flex justify-between items-center">
                                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                    {editingId ? <Pencil size={18} className="text-amber-500" /> : <Plus size={18} className="text-indigo-600" />}
                                    {editingId ? "Update Marker" : "Add New Marker"}
                                </h2>
                                {editingId && (
                                    <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Division</label>
                                        <input
                                            name="division"
                                            placeholder="E.g. TVC"
                                            value={form.division}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Section</label>
                                        <input
                                            name="section"
                                            placeholder="E.g. ERS-TVC"
                                            value={form.section}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">KM Number</label>
                                        <div className="relative flex items-center">
                                            <Navigation className="absolute left-3 text-slate-400 pointer-events-none" size={16} />
                                            <input
                                                name="km_number"
                                                type="number"
                                                placeholder="0.00"
                                                value={form.km_number || ""}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Latitude</label>
                                            <div className="relative flex items-center">
                                                <Globe className="absolute left-3 text-slate-400 pointer-events-none" size={14} />
                                                <input
                                                    name="latitude"
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.0000"
                                                    value={form.latitude || ""}
                                                    onChange={handleChange}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Longitude</label>
                                            <div className="relative flex items-center">
                                                <LocateFixed className="absolute left-3 text-slate-400 pointer-events-none" size={14} />
                                                <input
                                                    name="longitude"
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.0000"
                                                    value={form.longitude || ""}
                                                    onChange={handleChange}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'} disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md`}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? <Pencil size={20} /> : <Plus size={20} />)}
                                    {editingId ? "Update Post" : "Create Post"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                            <Search className="text-slate-400" size={18} />

                            <input
                                type="text"
                                placeholder="Search by section or division..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
                                    <p className="text-slate-500 font-bold">Synchronizing database...</p>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="text-slate-300" size={32} />
                                    </div>
                                    <p className="text-slate-400 font-medium text-lg">No KM posts found matching your search.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Division</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Section</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">KM Marker</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">GPS Coordinates</th>
                                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredPosts.map((post) => (
                                                <tr key={post._id} className="hover:bg-indigo-50/30 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-700">{post.division}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-600">{post.section}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black border border-indigo-200">
                                                            KM {post.km_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col text-[11px] font-mono text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <span className="text-indigo-400 font-bold">LAT:</span> {post.latitude?.toFixed(5) || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="text-indigo-400 font-bold">LNG:</span> {post.longitude?.toFixed(5) || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => handleEdit(post)}
                                                                className="p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all"
                                                                title="Edit Record"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(post._id!)}
                                                                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                                                title="Delete Record"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}