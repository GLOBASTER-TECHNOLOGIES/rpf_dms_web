"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Languages,
  User,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Printer,
  MapPin
} from "lucide-react";

// Using the Lucide icons for a more professional look
// Install via: npm install lucide-react

interface IBriefing {
  _id: string;
  createdByOfficerId: { name: string; forceNumber: string; rank: string };
  post: string;
  shift: "Morning" | "Afternoon" | "Night";
  language: "English" | "Tamil" | "Hindi";
  dutyDate: string; // ISO string from API
  generatedScript: string;
  isDelivered: boolean;
  deliveredAt?: string;
  isPrinted: boolean;
  createdAt: string;
}

const shiftConfig = {
  Morning: { color: "#f59e0b", icon: <Clock size={16} />, label: "Morning" },
  Afternoon: { color: "#3b82f6", icon: <Clock size={16} />, label: "Afternoon" },
  Night: { color: "#6366f1", icon: <Clock size={16} />, label: "Night" },
};

export default function ViewBriefings() {
  const router = useRouter();
  const [briefings, setBriefings] = useState<IBriefing[]>([]);
  const [postCode, setPostCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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

        const post = meData?.post;
        if (!post) return;
        setPostCode(post.postCode);

        const briefingRes = await fetch(`/api/briefing/get?post=${post.postCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const briefingData = await briefingRes.json();
        if (briefingData.success) setBriefings(briefingData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const deliveredCount = briefings.filter((b) => b.isDelivered).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Inter, sans-serif" }}>
      {/* MODERN HEADER */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 32px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => router.back()} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}>
              ←
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
                <MapPin size={12} /> Post {postCode}
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Briefing Reports</h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ background: "#f1f5f9", padding: "8px 16px", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>{briefings.length}</div>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>TOTAL</div>
            </div>
            <div style={{ background: "#ecfdf5", padding: "8px 16px", borderRadius: "12px", textAlign: "center", border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#059669" }}>{deliveredCount}</div>
              <div style={{ fontSize: "10px", color: "#059669", fontWeight: 600 }}>DELIVERED</div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: "32px 16px", maxWidth: "1100px", margin: "0 auto" }}>
        {loading ? (
          <p>Loading reports...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {briefings.map((b) => {
              const isOpen = expanded === b._id;
              const dateObj = new Date(b.dutyDate);

              return (
                <div
                  key={b._id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    transition: "all 0.2s"
                  }}
                >
                  {/* CARD HEADER */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : b._id)}
                    style={{ padding: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
                      {/* Date Block */}
                      <div style={{ textAlign: "center", minWidth: "60px", paddingRight: "20px", borderRight: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{dateObj.toLocaleString('default', { month: 'short' })}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800 }}>{dateObj.getDate()}</div>
                      </div>

                      {/* Info Block */}
                      <div style={{ display: "grid", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: "#f1f5f9",
                            color: shiftConfig[b.shift].color,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            {shiftConfig[b.shift].icon} {b.shift}
                          </span>
                          <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Languages size={14} /> {b.language}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#64748b" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={14} /> {b.createdByOfficerId?.rank} {b.createdByOfficerId?.name}
                          </span>
                          {b.isPrinted && <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#0284c7" }}><Printer size={14} /> Printed</span>}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {b.isDelivered ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#059669", fontSize: "13px", fontWeight: 600 }}>
                          <CheckCircle2 size={18} /> Delivered
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>
                          <Circle size={18} /> Pending
                        </div>
                      )}
                      {isOpen ? <ChevronDown size={20} color="#94a3b8" /> : <ChevronRight size={20} color="#94a3b8" />}
                    </div>
                  </div>

                  {/* EXPANDABLE CONTENT */}
                  {isOpen && (
                    <div style={{ padding: "20px", backgroundColor: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
                      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", lineHeight: "1.6", color: "#334155", whiteSpace: "pre-wrap" }}>
                        <h4 style={{ marginTop: 0, fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Briefing Script</h4>
                        {b.generatedScript}
                      </div>

                      <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
                          Print Report
                        </button>
                        {!b.isDelivered && (
                          <button style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#0f172a", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}