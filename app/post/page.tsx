"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Dummy post data based on IPost model
const dummyPost = {
    _id: "64f1a2b3c4d5e6f7a8b9c0d1",
    postCode: "MAS-01",
    division: "CHENNAI",
    contactNumber: "+91 98765 43210",
    address: "Platform No. 1, Chennai Central Railway Station, Chennai - 600003",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-03-10"),
    ipfId: {
        _id: "64f1a2b3c4d5e6f7a8b9c0d2",
        name: "Inspector R. Krishnamurthy",
        rank: "Inspector",
        badgeNumber: "RPF-2341",
    },
};

const modules = [
    {
        id: "officers",
        title: "Manage Officers",
        description:
            "View, assign and manage RPF personnel deployed at this post.",
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        accent: "#10b981",
        bg: "rgba(16,185,129,0.08)",
        stats: "12 Active",
    },
    {
        id: "briefing",
        title: "Briefing Reports",
        description:
            "Access pre-duty briefing records, shift assignments and operational notes.",
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
        accent: "#f59e0b",
        bg: "rgba(245,158,11,0.08)",
        stats: "8 This Week",
    },
    {
        id: "debriefing",
        title: "Debriefing Reports",
        description:
            "Review post-duty debriefs, incident summaries and shift handover logs.",
        icon: (
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        accent: "#8b5cf6",
        bg: "rgba(139,92,246,0.08)",
        stats: "6 Pending",
    },
];

export default function PostDashboard() {
    const router = useRouter();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const post = dummyPost;

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f0f2f5",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
        >
            {/* Header */}
            <header
                style={{
                    backgroundColor: "#0f172a",
                    padding: "0 32px",
                    height: "72px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* RPF Logo Placeholder */}
                    <div
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            backgroundColor: "#1e293b",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="1.8"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <p
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.12em",
                                color: "#64748b",
                                textTransform: "uppercase",
                                margin: 0,
                                fontWeight: 500,
                            }}
                        >
                            Railway Protection Force
                        </p>
                        <h1
                            style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#f8fafc",
                                margin: 0,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Post Dashboard
                        </h1>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ textAlign: "right" }}>
                        <p
                            style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#f8fafc",
                                margin: 0,
                            }}
                        >
                            Control Panel
                        </p>
                        <p
                            style={{
                                fontSize: "11px",
                                color: "#22c55e",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <span
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#22c55e",
                                    display: "inline-block",
                                }}
                            />
                            All Systems Nominal
                        </p>
                    </div>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#1e293b",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ padding: "40px 48px", maxWidth: "1400px", margin: "0 auto" }}>
                {/* Post Info Banner */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "24px 28px",
                        marginBottom: "36px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "12px",
                                backgroundColor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #bfdbfe",
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1.8"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <h2
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 700,
                                        color: "#0f172a",
                                        margin: 0,
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    Post {post.postCode}
                                </h2>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "#1d4ed8",
                                        backgroundColor: "#dbeafe",
                                        padding: "2px 10px",
                                        borderRadius: "20px",
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {post.division} Division
                                </span>
                            </div>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>
                                {post.address}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "32px" }}>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>In-Charge</p>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: 0 }}>
                                {(post.ipfId as any).name}
                            </p>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>
                                {(post.ipfId as any).rank} · {(post.ipfId as any).badgeNumber}
                            </p>
                        </div>
                        <div
                            style={{
                                width: "1px",
                                backgroundColor: "#e2e8f0",
                                alignSelf: "stretch",
                            }}
                        />
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Contact</p>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: 0 }}>
                                {post.contactNumber}
                            </p>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}>
                                Active since {post.createdAt.getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <div style={{ marginBottom: "24px" }}>
                    <p
                        style={{
                            fontSize: "11px",
                            letterSpacing: "0.12em",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            margin: "0 0 4px",
                        }}
                    >
                        Management Modules
                    </p>
                    <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                        Select a category to manage post records.
                    </p>
                </div>

                {/* Module Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "20px",
                    }}
                >
                    {modules.map((mod) => (
                        <div
                            key={mod.id}
                            onMouseEnter={() => setHoveredCard(mod.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => console.log(`Navigate to /post/${post.postCode}/${mod.id}`)}
                            style={{
                                backgroundColor: "#ffffff",
                                borderRadius: "14px",
                                padding: "28px",
                                border: `1px solid ${hoveredCard === mod.id ? "#cbd5e1" : "#e2e8f0"}`,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow:
                                    hoveredCard === mod.id
                                        ? "0 8px 24px rgba(0,0,0,0.08)"
                                        : "0 1px 3px rgba(0,0,0,0.04)",
                                transform: hoveredCard === mod.id ? "translateY(-2px)" : "none",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Subtle top accent line */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "3px",
                                    backgroundColor: mod.accent,
                                    opacity: hoveredCard === mod.id ? 1 : 0,
                                    transition: "opacity 0.2s ease",
                                    borderRadius: "14px 14px 0 0",
                                }}
                            />

                            {/* Icon */}
                            <div
                                style={{
                                    width: "52px",
                                    height: "52px",
                                    borderRadius: "12px",
                                    backgroundColor: mod.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "20px",
                                    color: mod.accent,
                                    border: `1px solid ${mod.accent}22`,
                                }}
                            >
                                {mod.icon}
                            </div>

                            {/* Content */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <h3
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 700,
                                            color: "#0f172a",
                                            margin: "0 0 8px",
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        {mod.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: "13px",
                                            color: "#64748b",
                                            margin: "0 0 16px",
                                            lineHeight: "1.6",
                                        }}
                                    >
                                        {mod.description}
                                    </p>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            color: mod.accent,
                                            backgroundColor: mod.bg,
                                            padding: "3px 10px",
                                            borderRadius: "20px",
                                        }}
                                    >
                                        {mod.stats}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        color: "#cbd5e1",
                                        transition: "color 0.2s, transform 0.2s",
                                        transform: hoveredCard === mod.id ? "translateX(3px)" : "none",
                                        flexShrink: 0,
                                        marginTop: "2px",
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer
                style={{
                    textAlign: "center",
                    padding: "32px",
                    fontSize: "11px",
                    color: "#94a3b8",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                }}
            >
                © 2026 RPF Security Management System
            </footer>
        </div>
    );
}