"use client";

import { useEffect, useState } from "react";

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

    // Fetch Posts
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

    useEffect(() => {
        fetchPosts();
    }, []);

    // Submit (Create / Update)
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!postCode.trim()) return;

        try {
            if (editingId) {
                await fetch(`/api/dropdown/post/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postCode, postType }),
                });
            } else {
                await fetch("/api/dropdown/post", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ postCode, postType }),
                });
            }

            setPostCode("");
            setPostType("POST");
            setEditingId(null);
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    // Delete
    const handleDelete = async (id: string) => {
        await fetch(`/api/dropdown/post/${id}`, {
            method: "DELETE",
        });
        fetchPosts();
    };

    // Edit
    const handleEdit = (post: Post) => {
        setPostCode(post.postCode);
        setPostType(post.postType);
        setEditingId(post._id);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Post Management
                </h1>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Post Code"
                            value={postCode}
                            onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={postType}
                            onChange={(e) =>
                                setPostType(e.target.value as "POST" | "OUT-POST")
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="POST">POST</option>
                            <option value="OUT-POST">OUT-POST</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        {editingId ? "Update Post" : "Add Post"}
                    </button>
                </form>

                {/* List Card */}
                {/* List Card */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-gray-500">Loading...</p>
                    ) : posts.length === 0 ? (
                        <p className="p-6 text-gray-500">No posts found</p>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post._id}
                                className="flex items-center justify-between p-4 border-b last:border-none hover:bg-gray-50 transition"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {post.postCode}
                                    </p>
                                    <p className="text-sm text-gray-500">{post.postType}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}