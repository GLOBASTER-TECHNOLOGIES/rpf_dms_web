"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface IDebrief {
    _id: string;
    staffId: { name: string; forceNumber: string; rank: string };
    shift: string;
    date: Date;
    transcript?: string;
    summary?: string;
    observations?: string;
    improvements?: string;
    approved: boolean;
    createdAt: Date;
}

const shiftColors: Record<string, { color: string; bg: string }> = {
    Morning: { color: "#b45309", bg: "#fffbeb" },
    Afternoon: { color: "#0369a1", bg: "#f0f9ff" },
    Night: { color: "#4c1d95", bg: "#f5f3ff" },
};

export default function ViewDebriefings() {
    const router = useRouter();
    const [postCode, setPostCode] = useState("");

    const [debriefs, setDebriefs] = useState<IDebrief[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedShift, setSelectedShift] = useState("all");
    const [approvedFilter, setApprovedFilter] = useState("all");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                if (!token) {
                    router.push("/login");
                    return;
                }

                // 1️⃣ Get logged in user
                const meRes = await fetch("/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const meData = await meRes.json();

                if (!meRes.ok) {
                    router.push("/login");
                    return;
                }

                const post = meData?.post;

                if (!post) return;

                const code = post.postCode;
                setPostCode(code);

                // 2️⃣ Fetch debriefs using postcode
                const debriefRes = await fetch(
                    `/api/debrief/get?postCode=${code}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const debriefData = await debriefRes.json();

                if (debriefData.success) {
                    const parsed = debriefData.data.map((d: any) => ({
                        ...d,
                        date: new Date(d.date),
                        createdAt: new Date(d.createdAt),
                    }));

                    setDebriefs(parsed);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const filtered = debriefs.filter((d) => {
        const matchShift = selectedShift === "all" || d.shift === selectedShift;
        const matchApproved =
            approvedFilter === "all"
                ? true
                : approvedFilter === "approved"
                    ? d.approved
                    : !d.approved;

        return matchShift && matchApproved;
    });

    const approvedCount = debriefs.filter((d) => d.approved).length;

    const getTab = (id: string) => activeTab[id] || "summary";
    const setTab = (id: string, tab: string) =>
        setActiveTab((prev) => ({ ...prev, [id]: tab }));

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                Loading debriefings...
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f0f2f5",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            }}
        >
            <header
                style={{
                    backgroundColor: "#0f172a",
                    padding: "0 32px",
                    height: "72px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: "#1e293b",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#94a3b8",
                        }}
                    >
                        ←
                    </button>

                    <div>
                        <p
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.12em",
                                color: "#64748b",
                                textTransform: "uppercase",
                                margin: 0,
                            }}
                        >
                            Post {postCode}
                        </p>
                        <h1
                            style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#f8fafc",
                                margin: 0,
                            }}
                        >
                            Debriefing Reports
                        </h1>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                    {[
                        { label: "Total", value: debriefs.length, color: "#f8fafc" },
                        { label: "Approved", value: approvedCount, color: "#10b981" },
                        {
                            label: "Pending Review",
                            value: debriefs.length - approvedCount,
                            color: "#8b5cf6",
                        },
                    ].map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>
                                {s.value}
                            </p>
                            <p style={{ fontSize: "10px", color: "#64748b" }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </header>

            <main style={{ padding: "32px 48px", maxWidth: "1400px", margin: "0 auto" }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                    {["all", "Morning", "Afternoon", "Night"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setSelectedShift(s)}
                            style={{
                                padding: "5px 14px",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: selectedShift === s ? "#0f172a" : "#fff",
                                color: selectedShift === s ? "#fff" : "#64748b",
                            }}
                        >
                            {s === "all" ? "All Shifts" : s}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.length === 0 ? (
                        <div
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "12px",
                                padding: "48px",
                                textAlign: "center",
                            }}
                        >
                            No debriefings found.
                        </div>
                    ) : (
                        filtered.map((d) => {
                            const isOpen = expanded === d._id;
                            const tab = getTab(d._id);
                            const shift = d.shift in shiftColors ? d.shift : "Morning";

                            return (
                                <div
                                    key={d._id}
                                    style={{
                                        backgroundColor: "#fff",
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <div
                                        onClick={() => setExpanded(isOpen ? null : d._id)}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "16px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div>
                                            <strong>{d.staffId.name}</strong> ({d.staffId.rank}) ·{" "}
                                            {d.shift}
                                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                                {d.date.toLocaleDateString()}
                                            </div>
                                        </div>

                                        <span style={{ color: d.approved ? "#16a34a" : "#b45309" }}>
                                            {d.approved ? "Approved" : "Pending Review"}
                                        </span>
                                    </div>

                                    {isOpen && (
                                        <div style={{ padding: "16px" }}>
                                            <div style={{ marginBottom: 10 }}>
                                                {["summary", "transcript", "observations", "improvements"].map(
                                                    (t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setTab(d._id, t)}
                                                            style={{
                                                                marginRight: 8,
                                                                fontWeight: tab === t ? 700 : 400,
                                                            }}
                                                        >
                                                            {t}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            <p>
                                                {tab === "summary" && d.summary}
                                                {tab === "transcript" && d.transcript}
                                                {tab === "observations" && d.observations}
                                                {tab === "improvements" && d.improvements}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <p style={{ marginTop: 12, fontSize: "12px", color: "#94a3b8" }}>
                    Showing {filtered.length} of {debriefs.length} debriefings
                </p>
            </main>

            <footer
                style={{
                    textAlign: "center",
                    padding: "24px",
                    fontSize: "11px",
                    color: "#94a3b8",
                }}
            >
                © 2026 RPF Security Management System
            </footer>
        </div>
    );
}