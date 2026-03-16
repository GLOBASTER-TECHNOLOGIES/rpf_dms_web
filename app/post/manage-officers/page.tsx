"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

// IOfficer shape based on model
interface IOfficer {
  _id: string;
  name: string;
  forceNumber: string;
  rank: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  postCode: string;
  division: string;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
}

const dummyOfficers: IOfficer[] = [
  { _id: "1", name: "Inspector R. Krishnamurthy", forceNumber: "RPF-2341", rank: "IPF", role: "SO", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: false, createdAt: new Date("2023-04-10") },
  { _id: "2", name: "Sub-Inspector P. Murugan", forceNumber: "RPF-1892", rank: "SI", role: "SO", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: false, createdAt: new Date("2023-06-15") },
  { _id: "3", name: "ASI K. Selvam", forceNumber: "RPF-3310", rank: "ASI", role: "STAFF", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: true, createdAt: new Date("2024-01-20") },
  { _id: "4", name: "HC D. Rajendran", forceNumber: "RPF-4421", rank: "HC", role: "STAFF", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: false, createdAt: new Date("2023-09-05") },
  { _id: "5", name: "Constable M. Priya", forceNumber: "RPF-5567", rank: "CONSTABLE", role: "STAFF", postCode: "MAS-01", division: "CHENNAI", active: false, mustChangePassword: false, createdAt: new Date("2024-03-12") },
  { _id: "6", name: "ASC V. Subramaniam", forceNumber: "RPF-1123", rank: "ASC", role: "ADMIN", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: false, createdAt: new Date("2022-11-01") },
  { _id: "7", name: "Constable S. Arumugam", forceNumber: "RPF-6678", rank: "CONSTABLE", role: "STAFF", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: true, createdAt: new Date("2024-05-18") },
  { _id: "8", name: "HC T. Lakshmi", forceNumber: "RPF-4490", rank: "HC", role: "STAFF", postCode: "MAS-01", division: "CHENNAI", active: true, mustChangePassword: false, createdAt: new Date("2023-07-22") },
];

const rankColors: Record<string, { color: string; bg: string }> = {
  DSC:       { color: "#dc2626", bg: "#fef2f2" },
  ASC:       { color: "#b45309", bg: "#fffbeb" },
  IPF:       { color: "#1d4ed8", bg: "#eff6ff" },
  SI:        { color: "#0369a1", bg: "#f0f9ff" },
  ASI:       { color: "#6d28d9", bg: "#f5f3ff" },
  HC:        { color: "#065f46", bg: "#ecfdf5" },
  CONSTABLE: { color: "#374151", bg: "#f9fafb" },
};

const roleColors: Record<string, { color: string; bg: string }> = {
  ADMIN: { color: "#dc2626", bg: "#fef2f2" },
  SO:    { color: "#1d4ed8", bg: "#eff6ff" },
  STAFF: { color: "#374151", bg: "#f3f4f6" },
};

export default function ManageOfficers() {
  const router = useRouter();
  const params = useParams();
  const postCode = (params?.postCode as string) || "MAS-01";

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [filterRank, setFilterRank] = useState<string>("all");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = dummyOfficers.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.forceNumber.toLowerCase().includes(search.toLowerCase());
    const matchActive = filterActive === "all" ? true : filterActive === "active" ? o.active : !o.active;
    const matchRank = filterRank === "all" ? true : o.rank === filterRank;
    return matchSearch && matchActive && matchRank;
  });

  const activeCount = dummyOfficers.filter((o) => o.active).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#0f172a", padding: "0 32px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.back()}
            style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={{ width: "1px", height: "28px", backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#64748b", textTransform: "uppercase", margin: 0 }}>Post {postCode}</p>
            <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "-0.01em" }}>Manage Officers</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", gap: "16px", marginRight: "8px" }}>
            {[{ label: "Total", value: dummyOfficers.length, color: "#f8fafc" }, { label: "Active", value: activeCount, color: "#10b981" }, { label: "Inactive", value: dummyOfficers.length - activeCount, color: "#f87171" }].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Officer
          </button>
        </div>
      </header>

      <main style={{ padding: "32px 48px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Search by name or force number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", height: "40px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", fontSize: "13px", color: "#334155", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "4px" }}>
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                style={{ padding: "5px 14px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", backgroundColor: filterActive === f ? "#0f172a" : "transparent", color: filterActive === f ? "#fff" : "#64748b", textTransform: "capitalize" }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Rank Filter */}
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            style={{ height: "40px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", fontSize: "13px", color: "#334155", padding: "0 12px", outline: "none", cursor: "pointer" }}
          >
            <option value="all">All Ranks</option>
            {["DSC", "ASC", "IPF", "SI", "ASI", "HC", "CONSTABLE"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 80px", padding: "12px 20px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
            {["Officer", "Force Number", "Rank", "Role", "Status", "Joined", ""].map((h) => (
              <p key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No officers found matching your filters.</div>
          ) : (
            filtered.map((officer) => (
              <div
                key={officer._id}
                onMouseEnter={() => setHoveredRow(officer._id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 80px", padding: "14px 20px", borderBottom: "1px solid #f1f5f9", alignItems: "center", backgroundColor: hoveredRow === officer._id ? "#fafbfc" : "#fff", transition: "background 0.15s" }}
              >
                {/* Name + avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }}>
                    {officer.name.split(" ").slice(-1)[0][0]}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", margin: 0 }}>{officer.name}</p>
                    {officer.mustChangePassword && (
                      <p style={{ fontSize: "10px", color: "#f59e0b", margin: "2px 0 0", fontWeight: 500 }}>⚠ Password reset required</p>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#475569", margin: 0, fontFamily: "monospace" }}>{officer.forceNumber}</p>

                <span style={{ fontSize: "11px", fontWeight: 700, color: rankColors[officer.rank].color, backgroundColor: rankColors[officer.rank].bg, padding: "3px 10px", borderRadius: "20px", display: "inline-block" }}>{officer.rank}</span>

                <span style={{ fontSize: "11px", fontWeight: 600, color: roleColors[officer.role].color, backgroundColor: roleColors[officer.role].bg, padding: "3px 10px", borderRadius: "20px", display: "inline-block" }}>{officer.role}</span>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: officer.active ? "#22c55e" : "#f87171", display: "inline-block" }} />
                  <span style={{ fontSize: "12px", color: officer.active ? "#16a34a" : "#dc2626", fontWeight: 500 }}>{officer.active ? "Active" : "Inactive"}</span>
                </div>

                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{officer.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button style={{ width: "30px", height: "30px", borderRadius: "6px", border: "1px solid #fee2e2", backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px" }}>Showing {filtered.length} of {dummyOfficers.length} officers</p>
      </main>

      <footer style={{ textAlign: "center", padding: "24px", fontSize: "11px", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        © 2026 RPF Security Management System
      </footer>
    </div>
  );
}