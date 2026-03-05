"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Building2,
    ArrowLeft,
    Loader2,
    Trash2,
    AlertTriangle,
    FileDown,
    Edit,
    MapPin,
    Phone,
    UserSquare2,
    Plus,
    Layers,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import CreatePost from "./Createpost";
import EditPostModal from "./Editpost";

interface Post {
    _id: string;
    postCode: string;
    division: string;
    ipfId?: string;
    contactNumber?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

const exportPosts = (posts: Post[]) => {
    const headers = ["Post Code", "Division", "Contact", "Address"];
    const rows = posts.map((p) => [
        p.postCode,
        p.division,
        p.contactNumber || "N/A",
        p.address || "N/A",
    ]);
    const csv = [headers, ...rows]
        .map((row) => row.map((v) => `"${v}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "posts.csv";
    a.click();
    URL.revokeObjectURL(url);
};

const extractArray = (data: any): Post[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.posts)) return data.posts;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
};

// ── Standalone Delete Confirmation Modal ──────────────────────────────────
const DeleteConfirmModal = ({
    post,
    onConfirm,
    onCancel,
    loading,
}: {
    post: Post;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                        <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <h2 className="text-base font-bold text-slate-800">Delete Post</h2>
                </div>
                <button
                    onClick={onCancel}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
                <p className="text-sm text-slate-600">
                    Are you sure you want to delete post{" "}
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {post.postCode}
                    </span>
                    ?
                </p>
                <p className="text-xs text-slate-400 mt-2">
                    This action is permanent and cannot be undone.
                </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition bg-white disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {loading ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <Trash2 size={15} />
                    )}
                    {loading ? "Deleting..." : "Yes, Delete"}
                </button>
            </div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const ViewPost = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get("/api/post/get", {
                headers: { "Cache-Control": "no-cache" },
            });
            setPosts(extractArray(res.data));
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load posts. Please try again.");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (post: Post) => {
        setSelectedPost(post);
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = () => fetchPosts();

    // Opens the confirmation modal
    const handleDeleteClick = (post: Post) => {
        setDeleteTarget(post);
    };

    // Called when user confirms deletion
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await axios.delete(`/api/post/delete?id=${deleteTarget._id}`);
            toast.success(`Post ${deleteTarget.postCode} deleted`);
            setDeleteTarget(null);
            fetchPosts();
        } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err?.response?.data?.message || "Failed to delete post");
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (!showCreateForm) fetchPosts();
    }, [showCreateForm]);

    if (showCreateForm) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium text-sm"
                >
                    <ArrowLeft size={18} /> Back to Posts
                </button>
                <CreatePost onSuccess={() => setShowCreateForm(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="bg-slate-900 px-7 py-6 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
                        <Building2 className="text-white" size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">RPF Posts</h1>
                        <p className="text-slate-400 text-sm mt-0.5">Manage RPF Thanas and Outposts</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => posts.length > 0 && exportPosts(posts)}
                        disabled={posts.length === 0}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40"
                    >
                        <FileDown size={15} /> Export
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow"
                    >
                        <Plus size={15} /> New Post
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="animate-spin text-slate-700 mb-3" size={28} />
                    <p className="text-slate-500 text-sm">Loading Posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <Building2 className="mx-auto text-slate-300 mb-3" size={36} />
                    <p className="text-slate-400 text-sm">No posts found in database.</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition"
                    >
                        Create First Post
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Post Code</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Division</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Address</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">In-Charge</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr
                                        key={post._id}
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-slate-900 text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
                                                {post.postCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                                                <Layers size={13} className="text-slate-400" />
                                                {post.division}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.contactNumber ? (
                                                <div className="flex items-center gap-1.5 text-slate-600 text-sm font-mono">
                                                    <Phone size={13} className="text-slate-300" />
                                                    {post.contactNumber}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.address ? (
                                                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                                    <MapPin size={13} className="text-slate-300 flex-shrink-0" />
                                                    {post.address}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.ipfId ? (
                                                <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                                    <UserSquare2 size={14} className="text-blue-400" />
                                                    <span className="font-mono">{String(post.ipfId).slice(-8).toUpperCase()}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEditClick(post)}
                                                    className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Post"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(post)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Post"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {posts.map((post) => (
                            <div
                                key={post._id}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-slate-900 text-lg bg-slate-100 px-3 py-1 rounded-lg">
                                        {post.postCode}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5">
                                        <Layers size={12} /> {post.division}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                                    {post.address && (
                                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                            <MapPin size={13} className="text-slate-300" /> {post.address}
                                        </p>
                                    )}
                                    {post.contactNumber && (
                                        <p className="text-sm text-slate-500 flex items-center gap-1.5 font-mono">
                                            <Phone size={13} className="text-slate-300" /> {post.contactNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => handleEditClick(post)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition border border-slate-100"
                                    >
                                        <Edit size={15} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(post)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition border border-red-100"
                                    >
                                        <Trash2 size={15} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ── Edit Modal ── */}
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={selectedPost}
                onUpdateSuccess={handleUpdateSuccess}
            />

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <DeleteConfirmModal
                    post={deleteTarget}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default ViewPost;