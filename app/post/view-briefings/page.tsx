"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface IBriefing {
  _id: string;
  createdByOfficerId: { name: string; forceNumber: string; rank: string };
  post: string;
  shift: "Morning" | "Afternoon" | "Night";
  language: "English" | "Tamil" | "Hindi";
  dutyDate: Date;
  generatedScript: string;
  isDelivered: boolean;
  deliveredAt?: Date;
  isPrinted: boolean;
  createdAt: Date;
}

const shiftColors: Record<string, { color: string; bg: string; icon: string }> = {
  Morning: { color: "#b45309", bg: "#fffbeb", icon: "🌅" },
  Afternoon: { color: "#0369a1", bg: "#f0f9ff", icon: "☀️" },
  Night: { color: "#4c1d95", bg: "#f5f3ff", icon: "🌙" },
};

const langColors: Record<string, { color: string; bg: string }> = {
  English: { color: "#1d4ed8", bg: "#eff6ff" },
  Tamil: { color: "#065f46", bg: "#ecfdf5" },
  Hindi: { color: "#9a3412", bg: "#fff7ed" },
};

export default function ViewBriefings() {
  const router = useRouter();

  const [briefings, setBriefings] = useState<IBriefing[]>([]);
  const [postCode, setPostCode] = useState("");

  const [selectedShift, setSelectedShift] = useState("all");
  const [selectedLang, setSelectedLang] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deliveredFilter, setDeliveredFilter] = useState("all");

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

        // 2️⃣ fetch briefings
        const briefingRes = await fetch(
          `/api/briefing/get?post=${post.postCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const briefingData = await briefingRes.json();

        if (briefingData.success) {
          setBriefings(briefingData.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [router]);

  const filtered = briefings.filter((b) => {
    const matchShift = selectedShift === "all" || b.shift === selectedShift;
    const matchLang = selectedLang === "all" || b.language === selectedLang;

    const matchDelivered =
      deliveredFilter === "all"
        ? true
        : deliveredFilter === "delivered"
          ? b.isDelivered
          : !b.isDelivered;

    return matchShift && matchLang && matchDelivered;
  });

  const deliveredCount = briefings.filter((b) => b.isDelivered).length;

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
              color: "#94a3b8",
              border: "none",
              cursor: "pointer",
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
              Briefing Reports
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
              {briefings.length}
            </p>
            <p style={{ fontSize: "10px", color: "#64748b" }}>Total</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>
              {deliveredCount}
            </p>
            <p style={{ fontSize: "10px", color: "#64748b" }}>Delivered</p>
          </div>
        </div>
      </header>

      {/* LIST */}
      <main style={{ padding: "32px", maxWidth: "1200px", margin: "auto" }}>
        {filtered.map((b) => {
          const isOpen = expanded === b._id;

          return (
            <div
              key={b._id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                marginBottom: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                onClick={() => setExpanded(isOpen ? null : b._id)}
                style={{
                  padding: "16px",
                  cursor: "pointer",
                  borderLeft: `4px solid ${shiftColors[b.shift].color}`,
                }}
              >
                <strong>
                  {shiftColors[b.shift].icon} {b.shift} Shift
                </strong>{" "}
                · {b.language}
              </div>

              {isOpen && (
                <div style={{ padding: "16px" }}>
                  <p>{b.generatedScript}</p>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}