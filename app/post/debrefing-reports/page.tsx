"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const [debriefs, setDebriefs] = useState<IDebrief[]>([]);
  const [postCode, setPostCode] = useState<string>("");

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

        // 1️⃣ get logged in user
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

        setPostCode(post.postCode);

        // 2️⃣ fetch briefings for this post
        const briefingRes = await fetch(
          `/api/briefings?post=${post.postCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const briefingData = await briefingRes.json();

        if (briefingData.success) {
          setDebriefs(briefingData.data);
        }
      } catch (err) {
        console.error(err);
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* HEADER */}
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
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              {debriefs.length}
            </p>
            <p style={{ fontSize: "10px", color: "#64748b" }}>Total</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>
              {approvedCount}
            </p>
            <p style={{ fontSize: "10px", color: "#64748b" }}>Approved</p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ padding: "32px", maxWidth: "1200px", margin: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((d) => {
            const isOpen = expanded === d._id;
            const tab = getTab(d._id);
            const shift = d.shift in shiftColors ? d.shift : "Morning";

            return (
              <div
                key={d._id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  onClick={() => setExpanded(isOpen ? null : d._id)}
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    borderLeft: `4px solid ${
                      d.approved ? "#8b5cf6" : "#f59e0b"
                    }`,
                  }}
                >
                  <strong>{d.staffId.name}</strong> • {d.shift}
                </div>

                {isOpen && (
                  <div style={{ padding: "16px" }}>
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
          })}
        </div>
      </main>
    </div>
  );
}