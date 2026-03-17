"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    User,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    AlertCircle,
    FileText,
    Eye,
    TrendingUp,
    MessageSquare,
    MapPin
} from "lucide-react";

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

const shiftStyles: Record<string, { color: string; bg: string }> = {
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
    const [expanded, setExpanded] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) { router.push("/login"); return; }

                const meRes = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const meData = await meRes.json();
                if (!meRes.ok) { router.push("/login"); return; }

                const code = meData?.post?.postCode;
                setPostCode(code);

                const debriefRes = await fetch(`/api/debrief/get?postCode=${code}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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

    const filtered = debriefs.filter((d) => selectedShift === "all" || d.shift === selectedShift);
    const approvedCount = debriefs.filter((d) => d.approved).length;

    const setTab = (id: string, tab: string) => setActiveTab((prev) => ({ ...prev, [id]: tab }));

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Inter, sans-serif" }}>
            {/* HEADER */}
            <header style={{ backgroundColor: "#0f172a", padding: "16px 32px", height: "80px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button onClick={() => router.back()} style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer" }}>
                        ←
                    </button>
                    <div>
                        <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={10} /> Post {postCode}
                        </div>
                        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>Debriefing Reports</h1>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "24px" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>{debriefs.length}</div>
                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>TOTAL</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#10b981" }}>{approvedCount}</div>
                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>APPROVED</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#8b5cf6" }}>{debriefs.length - approvedCount}</div>
                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>PENDING</div>
                    </div>
                </div>
            </header>

            <main style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
                {/* FILTER TABS */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "#fff", padding: "6px", borderRadius: "12px", width: "fit-content", border: "1px solid #e2e8f0" }}>
                    {["all", "Morning", "Afternoon", "Night"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setSelectedShift(s)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                transition: "0.2s",
                                backgroundColor: selectedShift === s ? "#0f172a" : "transparent",
                                color: selectedShift === s ? "#fff" : "#64748b",
                            }}
                        >
                            {s === "all" ? "All Shifts" : s}
                        </button>
                    ))}
                </div>

                {/* LIST */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {filtered.map((d) => {
                        const isOpen = expanded === d._id;
                        const currentTab = activeTab[d._id] || "summary";
                        const shiftStyle = shiftStyles[d.shift] || shiftStyles.Morning;

                        return (
                            <div key={d._id} style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", transition: "0.2s", boxShadow: isOpen ? "0 10px 15px -3px rgba(0,0,0,0.1)" : "none" }}>
                                {/* CARD HEADER */}
                                <div onClick={() => setExpanded(isOpen ? null : d._id)} style={{ padding: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>{d.date.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                            <span style={{ fontSize: "16px", fontWeight: 800 }}>{d.date.getDate()}</span>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "15px", fontWeight: 700 }}>{d.staffId.name}</span>
                                                <span style={{ fontSize: "11px", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{d.staffId.rank}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#64748b" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: shiftStyle.color }}>
                                                    <Clock size={12} /> {d.shift} Shift
                                                </span>
                                                <span>•</span>
                                                <span>Force No: {d.staffId.forceNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: d.approved ? "#059669" : "#d97706", backgroundColor: d.approved ? "#ecfdf5" : "#fff7ed", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, border: `1px solid ${d.approved ? "#bbf7d0" : "#ffedd5"}` }}>
                                            {d.approved ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                            {d.approved ? "Approved" : "Pending Review"}
                                        </div>
                                        {isOpen ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                                    </div>
                                </div>

                                {/* EXPANDED CONTENT */}
                                {isOpen && (
                                    <div style={{ padding: "0 20px 20px 20px", borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}>
                                        {/* INTERNAL TABS */}
                                        <div style={{ display: "flex", gap: "24px", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
                                            {[
                                                { id: "summary", label: "Summary", icon: <FileText size={14} /> },
                                                { id: "observations", label: "Observations", icon: <Eye size={14} /> },
                                                { id: "improvements", label: "Improvements", icon: <TrendingUp size={14} /> },
                                                { id: "transcript", label: "Full Transcript", icon: <MessageSquare size={14} /> },
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={(e) => { e.stopPropagation(); setTab(d._id, t.id); }}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        borderBottom: currentTab === t.id ? "2px solid #0f172a" : "2px solid transparent",
                                                        padding: "8px 0",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        fontSize: "13px",
                                                        fontWeight: currentTab === t.id ? 700 : 500,
                                                        color: currentTab === t.id ? "#0f172a" : "#64748b",
                                                    }}
                                                >
                                                    {t.icon} {t.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", lineHeight: "1.6", color: "#334155", minHeight: "100px" }}>
                                            {d[currentTab as keyof IDebrief] || `No ${currentTab} available for this report.`}
                                        </div>

                                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                                            {!d.approved && (
                                                <button style={{ padding: "10px 20px", borderRadius: "8px", background: "#0f172a", color: "white", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
                                                    Approve Report
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}