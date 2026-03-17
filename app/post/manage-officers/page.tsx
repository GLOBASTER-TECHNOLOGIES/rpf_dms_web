"use client";

import { useState, useEffect } from "react";
import {
    UserPlus, Search, ShieldCheck, ShieldAlert, Edit2,
    Trash2, IdCard, MapPin, Lock, X, Check, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface IOfficer {
    _id: string;
    name: string;
    forceNumber: string;
    rank: string;
    role: string;
    postCode: string;
    division: string;
    active: boolean;
}

export default function ManageOfficers() {
    const router = useRouter(); // <--- Add this line here

    const [officers, setOfficers] = useState<IOfficer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [myPostCode, setMyPostCode] = useState("");

    // UI State for Actions
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchOfficers = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const meRes = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const meData = await meRes.json();
            const code = meData?.post?.postCode;
            setMyPostCode(code);

            const res = await fetch(`/api/officer/get?postCode=${code}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setOfficers(data.data);
        } catch (err) {
            console.error("Failed to load officers", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficers();
    }, []);

    const handleDelete = async (id: string) => {
        setIsActionLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`/api/officer/delete?id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setOfficers(prev => prev.filter(o => o._id !== id));
                setDeletingId(null);
            }
        } catch (err) {
            alert("Failed to delete officer");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleActive = async (officer: IOfficer) => {
        // Logic for toggling active status via an update API
        alert(`Toggling status for ${officer.name}`);
    };

    const filteredOfficers = officers.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.forceNumber.includes(search)
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* HEADER */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                    <div>
                        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Staff Management</h1>
                        <p style={{ color: "#64748b", fontSize: "15px", marginTop: "4px" }}>
                            Active personnel assigned to Post <span style={{ color: "#0f172a", fontWeight: 700 }}>{myPostCode}</span>
                        </p>
                    </div>
                    <button
                        style={{
                            display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#0f172a",
                            color: "white", padding: "12px 24px", borderRadius: "12px", border: "none",
                            fontWeight: 600, cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)"
                        }}
                    >
                        <UserPlus size={18} /> Add New Officer
                    </button>
                </header>

                {/* SEARCH BAR */}
                <div style={{ position: "relative", marginBottom: "32px" }}>
                    <Search style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={20} />
                    <input
                        type="text"
                        placeholder="Filter by name, force number, or rank..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%", padding: "18px 18px 18px 56px", borderRadius: "16px",
                            border: "1px solid #e2e8f0", fontSize: "16px", outline: "none",
                            backgroundColor: "white", transition: "all 0.2s",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                        }}
                    />
                </div>

                {/* GRID */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "100px" }}>
                        <Loader2 className="animate-spin" size={40} color="#0f172a" />
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
                        {filteredOfficers.map((officer) => (
                            <div
                                key={officer._id}
                                style={{
                                    backgroundColor: "white", borderRadius: "20px", border: "1px solid #e2e8f0",
                                    padding: "24px", position: "relative", display: "flex", flexDirection: "column",
                                    gap: "20px", transition: "transform 0.2s, boxShadow 0.2s",
                                    boxShadow: deletingId === officer._id ? "0 0 0 2px #ef4444" : "0 1px 3px rgba(0,0,0,0.05)"
                                }}
                            >
                                {/* Top Info */}
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        <div style={{
                                            width: "56px", height: "56px", borderRadius: "14px",
                                            backgroundColor: "#f1f5f9", display: "flex", alignItems: "center",
                                            justifyContent: "center", color: "#0f172a", fontWeight: 800, fontSize: "20px",
                                            border: "1px solid #e2e8f0"
                                        }}>
                                            {officer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{officer.name}</h3>
                                            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{officer.rank}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button
                                            onClick={() => router.push(`/officers/edit/${officer._id}`)}
                                            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "10px", cursor: "pointer", color: "#64748b" }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(officer._id)}
                                            style={{ background: "#fef2f2", border: "1px solid #fee2e2", padding: "8px", borderRadius: "10px", cursor: "pointer", color: "#ef4444" }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                                    <DetailItem icon={<IdCard size={14} />} label="Force No" value={officer.forceNumber} />
                                    <DetailItem icon={<Lock size={14} />} label="System Role" value={officer.role} />
                                    <DetailItem icon={<MapPin size={14} />} label="Post Code" value={officer.postCode} />
                                </div>

                                {/* Footer Actions */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700,
                                        color: officer.active ? "#059669" : "#ef4444", backgroundColor: officer.active ? "#ecfdf5" : "#fef2f2",
                                        padding: "6px 12px", borderRadius: "20px", border: `1px solid ${officer.active ? "#d1fae5" : "#fee2e2"}`
                                    }}>
                                        {officer.active ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                        {officer.active ? "ACTIVE" : "DISABLED"}
                                    </div>
                                    <button style={{ fontSize: "12px", fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>
                                        Reset Password
                                    </button>
                                </div>

                                {/* Delete Overlay */}
                                {deletingId === officer._id && (
                                    <div style={{
                                        position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.95)",
                                        borderRadius: "20px", zIndex: 10, display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px"
                                    }}>
                                        <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Permanently delete this officer?</p>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <button
                                                disabled={isActionLoading}
                                                onClick={() => handleDelete(officer._id)}
                                                style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "white", fontWeight: 600, cursor: "pointer" }}
                                            >
                                                {isActionLoading ? "..." : "Delete"}
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white", fontWeight: 600, cursor: "pointer" }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>{value}</div>
        </div>
    );
}