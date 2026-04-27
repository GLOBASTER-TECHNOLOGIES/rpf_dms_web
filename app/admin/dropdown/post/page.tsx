"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, Trash2, Plus, X, Check, Search, MapPin, Shield } from "lucide-react";
import Link from "next/link";

type Post = {
    _id: string;
    postCode: string;
    postType: "POST" | "OUT-POST";
};

export default function PostPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [postCode, setPostCode] = useState("");
    const [postType, setPostType] = useState<"POST" | "OUT-POST">("POST");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // --- RESTORED FUNCTIONS ---

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dropdown/post");
            const data = await res.json();
            setPosts(data.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/dropdown/post/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchPosts(); // Refresh list after delete
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleEdit = (post: Post) => {
        setPostCode(post.postCode);
        setPostType(post.postType);
        setEditingId(post._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetForm = () => {
        setPostCode("");
        setPostType("POST");
        setEditingId(null);
    };

    // --- EFFECT & HANDLERS ---

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postCode.trim()) return;

        try {
            const payload = { postCode, postType };
            const url = editingId ? `/api/dropdown/post/${editingId}` : "/api/dropdown/post";
            const method = editingId ? "PUT" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            resetForm();
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.postCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.postType.toLowerCase().includes(searchTerm.toLowerCase())
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
                            POST LIST <span className="text-slate-400 font-normal ml-2">/ Drop Down Data Management</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                            <Search size={14} className="text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search post codes..."
                                className="bg-transparent text-xs outline-none w-40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Form Sidebar */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {editingId ? "Update Post" : "Register Post"}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Add or modify posts and out-posts.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Unique Post Code</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            type="text"
                                            placeholder="e.g. MS-01"
                                            value={postCode}
                                            onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Classification</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <select
                                            value={postType}
                                            onChange={(e) => setPostType(e.target.value as "POST" | "OUT-POST")}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all text-sm font-medium appearance-none bg-white"
                                        >
                                            <option value="POST">POST</option>
                                            <option value="OUT-POST">OUT-POST</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-slate-200"
                                >
                                    {editingId ? <Check size={16} /> : <Plus size={16} />}
                                    {editingId ? "Save Changes" : "Deploy Post"}
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

                {/* Right Column: Data Table */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest"> Post Registry</h3>
                            <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-400">
                                {filteredPosts.length} Posts
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-6 py-4 font-bold">Post Code</th>
                                        <th className="px-6 py-4 font-bold">Classification</th>
                                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                                Synchronizing database...
                                            </td>
                                        </tr>
                                    ) : filteredPosts.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                                                No records found in current view.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPosts.map((post) => (
                                            <tr
                                                key={post._id}
                                                className="group hover:bg-blue-50/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800 tracking-tight">
                                                            {post.postCode}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.postType === 'POST'
                                                        ? 'bg-blue-50 border-blue-100 text-blue-600'
                                                        : 'bg-amber-50 border-amber-100 text-amber-600'
                                                        }`}>
                                                        {post.postType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(post)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Delete this post? This action cannot be undone.")) {
                                                                    handleDelete(post._id);
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