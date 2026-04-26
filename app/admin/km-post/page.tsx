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
    Globe, // Icon for coordinates
    LocateFixed // Icon for longitude
} from "lucide-react";

interface KmPost {
    _id?: string;
    division: string;
    section: string;
    km_number: number;
    latitude: number; // Made mandatory for form handling
    longitude: number; // Made mandatory for form handling
    jurisdiction_rpfPost?: string;
}

export default function KmPostPage() {
    const [posts, setPosts] = useState<KmPost[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.division || !form.section || form.km_number <= 0) {
            setError("Please fill in all required fields accurately.");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/km-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.message);
                return;
            }

            setForm({ division: "", section: "", km_number: 0, latitude: 0, longitude: 0 });
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
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <MapIcon className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">KM Post Directory</h1>
                            <p className="text-slate-500 text-sm font-medium">Railway kilometer markers & GPS Coordinates</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
                            <div className="bg-slate-50 border-b px-6 py-4">
                                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Plus size={18} className="text-indigo-600" />
                                    Add New Marker
                                </h2>
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
                                            className="w-full px-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Section</label>
                                        <input
                                            name="section"
                                            placeholder="E.g. ERS-TVC"
                                            value={form.section}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">KM Number</label>
                                        <div className="relative">
                                            <Navigation className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                            <input
                                                name="km_number"
                                                type="number"
                                                placeholder="0.00"
                                                value={form.km_number || ""}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* GPS Fields Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Latitude</label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                                <input
                                                    name="latitude"
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.0000"
                                                    value={form.latitude || ""}
                                                    onChange={handleChange}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Longitude</label>
                                            <div className="relative">
                                                <LocateFixed className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                                <input
                                                    name="longitude"
                                                    type="number"
                                                    step="any"
                                                    placeholder="0.0000"
                                                    value={form.longitude || ""}
                                                    onChange={handleChange}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
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
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                    Create Post
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by section or division..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-slate-700 font-medium"
                            />
                        </div>

                        {/* List Content */}
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
                                                        <button
                                                            onClick={() => handleDelete(post._id!)}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
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