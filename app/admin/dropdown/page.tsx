"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

                {/* Manage Section Tile */}
                <div
                    onClick={() => router.push("/admin/dropdown/section")}
                    className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-lg transition"
                >
                    <h2 className="text-xl font-semibold text-gray-800">
                        Manage Section Data
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Add, edit and manage all section entries
                    </p>
                </div>

                {/* Manage Post Tile */}
                <div
                    onClick={() => router.push("/admin/dropdown/post")}
                    className="cursor-pointer bg-white rounded-2xl shadow-md p-8 border hover:shadow-lg transition"
                >
                    <h2 className="text-xl font-semibold text-gray-800">
                        Manage Post Data
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Add, edit and manage all post entries
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Page;