"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, Trash2, Plus, X, Check, Search, Hash, Layers, LayoutGrid } from "lucide-react";
import Link from "next/link";

type Section = {
    _id: string;
    post: string;
    sectionCode: string;
    type: string;
};

export default function SectionPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [post, setPost] = useState("");
    const [sectionCode, setSectionCode] = useState("");
    const [type, setType] = useState("MAIN");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Restored handleEdit function
    const handleEdit = (sec: Section) => {
        setPost(sec.post);
        setSectionCode(sec.sectionCode);
        setType(sec.type);
        setEditingId(sec._id);
        // Optional: scroll to top so user sees the form is now in edit mode
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchSections = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dropdown/section");
            const data = await res.json();
            setSections(data.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!post.trim() || !sectionCode.trim()) return;

        try {
            const payload = { post, sectionCode, type };
            const url = editingId ? `/api/dropdown/section/${editingId}` : "/api/dropdown/section";
            const method = editingId ? "PUT" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            resetForm();
            fetchSections();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setPost("");
        setSectionCode("");
        setType("MAIN");
        setEditingId(null);
    };

    const filteredSections = sections.filter(s =>
        s.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.post.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB] text-slate-900 selection:bg-blue-100">
            {/* Top Sticky Navigation */}
            <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/dropdown"
                            className="group p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-slate-500 group-hover:text-slate-900" />
                        </Link>
                        <div className="h-6 w-[1px] bg-slate-200" />
                        <h1 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-800">
                            System Architecture <span className="text-slate-400 font-normal ml-2">/ Sections</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                            <Search size={14} className="text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Quick Search..."
                                className="bg-transparent text-xs outline-none w-40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Form Section */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingId ? "Modify Section" : "New Entry"}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Define organizational units and hierarchy codes.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Reporting Post</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TPJ"
                                        value={post}
                                        onChange={(e) => setPost(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Section Identifier</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TPJ-SRM"
                                        value={sectionCode}
                                        onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Category Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
                                    >
                                        <option value="MAIN">MAIN</option>
                                        <option value="BRANCH">BRANCH</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-slate-200"
                                >
                                    {editingId ? <Check size={16} /> : <Plus size={16} />}
                                    {editingId ? "Commit Changes" : "Create Section"}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-500 py-3 rounded-xl font-medium text-sm hover:bg-slate-100 transition-all"
                                    >
                                        <X size={16} /> Discard
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Data Grid */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Directory</h3>
                            <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-400">
                                {filteredSections.length} RECORDS
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-6 py-4 font-bold">Post</th>
                                        <th className="px-6 py-4 font-bold">Code</th>
                                        <th className="px-6 py-4 font-bold">Type</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                                Syncing database...
                                            </td>
                                        </tr>
                                    ) : filteredSections.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                                                No entries match your search criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSections.map((sec) => (
                                            <tr
                                                key={sec._id}
                                                className="group hover:bg-blue-50/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        {sec.post}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-slate-800">{sec.sectionCode}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sec.type === 'MAIN'
                                                        ? 'bg-blue-50 border-blue-100 text-blue-600'
                                                        : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                        }`}>
                                                        {sec.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(sec)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Archive this record?")) {
                                                                    fetch(`/api/dropdown/section/${sec._id}`, { method: "DELETE" }).then(fetchSections);
                                                                }
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}