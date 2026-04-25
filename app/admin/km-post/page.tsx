"use client";

import { useEffect, useState } from "react";

interface KmPost {
    _id?: string;
    division: string;
    section: string;
    km_number: number;
    latitude?: number;
    longitude?: number;
    jurisdiction_rpfPost?: string;
}

export default function KmPostPage() {
    const [posts, setPosts] = useState<KmPost[]>([]);
    const [form, setForm] = useState<KmPost>({
        division: "",
        section: "",
        km_number: 0,
    });

    const [error, setError] = useState("");

    // FETCH
    const fetchPosts = async () => {
        const res = await fetch("/api/km-post");
        const data = await res.json();
        setPosts(data.data || []);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // HANDLE INPUT
    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // CREATE
    const handleSubmit = async () => {
        setError("");

        const res = await fetch("/api/km-post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!data.success) {
            setError(data.message); // showing server error
            return;
        }

        fetchPosts();
    };

    // DELETE
    const handleDelete = async (id: string) => {
        await fetch(`/api/km-post/${id}`, {
            method: "DELETE",
        });

        fetchPosts();
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">KM Posts</h1>

            {/* FORM */}
            <div className="mb-4 space-y-2">
                <input
                    name="division"
                    placeholder="Division"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <input
                    name="section"
                    placeholder="Section"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <input
                    name="km_number"
                    type="number"
                    placeholder="KM Number"
                    onChange={handleChange}
                    className="border p-2 w-full"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2"
                >
                    Add Post
                </button>

                {error && <p className="text-red-500">{error}</p>}
            </div>

            {/* LIST */}
            <div className="space-y-2">
                {posts.map((post) => (
                    <div
                        key={post._id}
                        className="border p-2 flex justify-between"
                    >
                        <span>
                            {post.section} - KM {post.km_number}
                        </span>

                        <button
                            onClick={() => handleDelete(post._id!)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}