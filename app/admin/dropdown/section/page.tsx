"use client";

import { useEffect, useState } from "react";

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

    // Fetch Sections
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

    // Submit
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!post.trim() || !sectionCode.trim()) return;

        try {
            if (editingId) {
                await fetch(`/api/dropdown/section/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ post, sectionCode, type }),
                });
            } else {
                await fetch("/api/dropdown/section", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ post, sectionCode, type }),
                });
            }

            setPost("");
            setSectionCode("");
            setType("MAIN");
            setEditingId(null);
            fetchSections();
        } catch (err) {
            console.error(err);
        }
    };

    // Delete
    const handleDelete = async (id: string) => {
        await fetch(`/api/dropdown/section/${id}`, {
            method: "DELETE",
        });
        fetchSections();
    };

    // Edit
    const handleEdit = (sec: Section) => {
        setPost(sec.post);
        setSectionCode(sec.sectionCode);
        setType(sec.type);
        setEditingId(sec._id);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Section Management
                </h1>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <input
                            type="text"
                            placeholder="Post (e.g. ERS)"
                            value={post}
                            onChange={(e) => setPost(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="text"
                            placeholder="Section Code (e.g. ERS-TVC)"
                            value={sectionCode}
                            onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MAIN">MAIN</option>
                            <option value="BRANCH">BRANCH</option>
                        </select>

                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        {editingId ? "Update Section" : "Add Section"}
                    </button>
                </form>

                {/* List Card */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-gray-500">Loading...</p>
                    ) : sections.length === 0 ? (
                        <p className="p-6 text-gray-500">No sections found</p>
                    ) : (
                        sections.map((sec) => (
                            <div
                                key={sec._id}
                                className="flex items-center justify-between p-4 border-b last:border-none hover:bg-gray-50 transition"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {sec.sectionCode}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {sec.post} • {sec.type}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleEdit(sec)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(sec._id)}
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