"use client";

import Link from "next/link";
import { ShieldCheck, History, Users, ArrowRight, Lock } from "lucide-react";

function getCurrentShift(): "Morning" | "Afternoon" | "Night" {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return "Morning";
  if (hour >= 14 && hour < 22) return "Afternoon";
  return "Night";
}

function getGreeting(shift: "Morning" | "Afternoon" | "Night") {
  if (shift === "Morning") return "Good morning";
  if (shift === "Afternoon") return "Good afternoon";
  return "Good evening";
}

const SHIFT_COLOR: Record<string, { accent: string; bg: string; border: string; text: string }> = {
  Morning:   { accent: "#f59e0b", bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
  Afternoon: { accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  Night:     { accent: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
};

export default function StationOfficerDashboard() {
  const SO_NAME = "Insp. R. Sharma";
  const shift = getCurrentShift();
  const greeting = getGreeting(shift);
  const sc = SHIFT_COLOR[shift];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ backgroundColor: "#f1f4f8", zIndex: 10 }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(28px, 5vw, 56px) clamp(16px, 4vw, 32px)", display: "flex", flexDirection: "column", gap: 40 }}>

        {/* ── Greeting ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8", margin: 0 }}>
            {today}
          </p>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            {greeting},<br />
            <span style={{ color: "#475569" }}>{SO_NAME}</span>
          </h1>

          {/* Shift badge */}
          <div style={{ marginTop: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700,
              color: sc.text, background: sc.bg,
              border: `1px solid ${sc.border}`,
              borderRadius: 20, padding: "5px 12px",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: sc.accent, display: "inline-block" }} />
              {shift} Shift
            </span>
          </div>
        </div>

        {/* ── Modules ── */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94a3b8", margin: 0 }}>
            Modules
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            alignItems: "stretch",
          }}>

            {/* Start Duty Briefing */}
            <Link href="/so/briefing/generate" style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: 18, padding: "28px",
                  display: "flex", flexDirection: "column", gap: 18,
                  cursor: "pointer", height: "100%", boxSizing: "border-box",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; el.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; el.style.borderColor = "#e2e8f0"; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ShieldCheck size={22} color="#4f46e5" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.2px" }}>Start Duty Briefing</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                    Generate AI-assisted intelligence briefings for the current shift.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>
                  Launch <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Briefing Archive */}
            <Link href="/so/briefing/history" style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: 18, padding: "28px",
                  display: "flex", flexDirection: "column", gap: 18,
                  cursor: "pointer", height: "100%", boxSizing: "border-box",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; el.style.borderColor = "#cbd5e1"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; el.style.borderColor = "#e2e8f0"; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <History size={22} color="#475569" strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.2px" }}>Briefing Archive</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                    Access historical briefings, delivery logs and PDF records for audits.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#475569" }}>
                  View Records <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Staff Roster — locked */}
            <div
              style={{
                backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
                borderRadius: 18, padding: "28px",
                display: "flex", flexDirection: "column", gap: 18,
                opacity: 0.4, cursor: "not-allowed", height: "100%", boxSizing: "border-box",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Users size={22} color="#cbd5e1" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#94a3b8", margin: "0 0 8px" }}>Staff Roster</h3>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.65, margin: 0 }}>
                  Assign constables to beats, manage attendance and track deployment.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#cbd5e1" }}>
                <Lock size={13} /> Under Development
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}