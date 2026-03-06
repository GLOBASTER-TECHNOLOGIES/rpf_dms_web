import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page

// "use client"
// import { useState, useEffect, useRef, useCallback } from "react";

// // ── CONSTANTS & MOCK DATA ──────────────────────────────────────────────────────

// const COLORS = {
//   navy: "#0D1F3C",
//   navyDark: "#080F1E",
//   navyMid: "#1A2E50",
//   navyLight: "#243654",
//   red: "#C0272D",
//   redLight: "#E53935",
//   gold: "#D4A017",
//   goldLight: "#F5C842",
//   white: "#FFFFFF",
//   offWhite: "#F4F6FA",
//   lightGray: "#E8EDF5",
//   midGray: "#8A9BB5",
//   darkText: "#1A1A2E",
//   success: "#2E7D32",
//   warning: "#E65100",
//   info: "#1565C0",
// };

// const CIRCULARS = [
//   { id: 1, title: "Anti-Human Trafficking Drive — Summer 2026", date: "2026-02-28", priority: "HIGH", category: "Operations", content: "Enhanced screening at all major junctions. Focus on unaccompanied minors and suspicious groups. Coordinate with GRP.", tags: ["trafficking", "screening", "summer"] },
//   { id: 2, title: "Pongal/Festival Crowd Management Protocol", date: "2026-01-10", priority: "HIGH", category: "Crowd", content: "Deploy additional staff at Trichy Junction platforms 1-4. Emergency crowd control measures to be activated when passenger density exceeds threshold.", tags: ["festival", "crowd", "pongal"] },
//   { id: 3, title: "Board Exam Season Security Advisory", date: "2026-02-15", priority: "MEDIUM", category: "Advisory", content: "Exam season March-April. Increased student movement. Watch for impersonation, cheating material transport. Coordinate with education dept.", tags: ["exam", "students", "advisory"] },
//   { id: 4, title: "Unclaimed Baggage SOP Update", date: "2026-02-20", priority: "MEDIUM", category: "SOP", content: "Updated procedure: Report to control within 5 minutes. Photo document before touching. Bomb squad intimation mandatory for suspicious items.", tags: ["baggage", "sop", "bomb"] },
//   { id: 5, title: "Women Safety — Night Train Protocol", date: "2026-01-25", priority: "HIGH", category: "Women Safety", content: "Mandatory check of ladies coaches on all night trains. Coordinate with Meri Saheli team. Helpline 182 to be prominently displayed.", tags: ["women", "safety", "night"] },
//   { id: 6, title: "Stone Pelting Hotspots — Updated List", date: "2026-02-10", priority: "HIGH", category: "Security", content: "Three new hotspots identified near Srirangam approach. Alert loco pilots. Increase patrol frequency during 18:00-22:00 hrs.", tags: ["stone pelting", "security", "patrol"] },
// ];

// const TRAIN_SCHEDULE = [
//   { trainNo: "12083", name: "Chennai Express", platform: 1, arrival: "06:15", departure: "06:20", type: "Express", alerts: ["Women coach check", "Anti-trafficking screening"], crowdLevel: "HIGH", focus: ["Platform 1 concourse", "Ladies coach S1-S3"] },
//   { trainNo: "16853", name: "Puducherry Passenger", platform: 3, arrival: "06:45", departure: "06:55", type: "Passenger", alerts: ["Pickpocket alert zone"], crowdLevel: "MEDIUM", focus: ["General coaches", "Unreserved section"] },
//   { trainNo: "22671", name: "Kovai SF Express", platform: 2, arrival: "07:30", departure: "07:35", type: "Superfast", alerts: ["VIP movement", "Luggage screening"], crowdLevel: "HIGH", focus: ["AC coaches", "Entry gates"] },
//   { trainNo: "06051", name: "Special Exam Train", platform: 4, arrival: "08:00", departure: "08:10", type: "Special", alerts: ["Student rush", "Exam material check", "Anti-impersonation"], crowdLevel: "VERY HIGH", focus: ["All platforms", "Footbridge"], special: true },
//   { trainNo: "12697", name: "Ernakulam Express", platform: 1, arrival: "09:15", departure: "09:20", type: "Express", alerts: ["Unclaimed baggage check"], crowdLevel: "MEDIUM", focus: ["Platform 1", "Parking area"] },
//   { trainNo: "16101", name: "Boat Mail", platform: 2, arrival: "10:30", departure: "10:45", type: "Mail", alerts: ["Night train protocol", "Women safety check"], crowdLevel: "HIGH", focus: ["Ladies coaches", "Platform 2 end"] },
// ];

// const STAFF_ROSTER = [
//   { id: "RPF001", name: "Cst. Murugan R.", rank: "Constable", post: "Trichy Junction", duty: "Platform 1-2", shift: "Morning", status: "On Duty" },
//   { id: "RPF002", name: "Cst. Priya S.", rank: "Constable", post: "Trichy Junction", duty: "Ladies Coach Escort", shift: "Morning", status: "On Duty" },
//   { id: "RPF003", name: "HC Selvam K.", rank: "Head Constable", post: "Trichy Junction", duty: "Parcel Office", shift: "Morning", status: "On Duty" },
//   { id: "RPF004", name: "Cst. Arjun M.", rank: "Constable", post: "Srirangam", duty: "Platform Patrol", shift: "Morning", status: "On Duty" },
//   { id: "RPF005", name: "Cst. Lakshmi V.", rank: "Constable", post: "Trichy Junction", duty: "Waiting Hall", shift: "Morning", status: "Briefing" },
//   { id: "RPF006", name: "SI Ramesh P.", rank: "Sub-Inspector", post: "Trichy Junction", duty: "Supervisory", shift: "Morning", status: "On Duty" },
// ];

// const POSTS = [
//   { id: "TJ", name: "Trichy Junction", staff: 24, onDuty: 8, sos: "SI Ramesh P." },
//   { id: "SR", name: "Srirangam", staff: 6, onDuty: 2, sos: "ASI Kumar V." },
//   { id: "PDY", name: "Puducherry", staff: 8, onDuty: 3, sos: "SI Anand K." },
//   { id: "CDM", name: "Chidambaram", staff: 6, onDuty: 2, sos: "ASI Vijay R." },
// ];

// const INCIDENT_LOG = [
//   { id: 1, date: "2026-03-02", type: "Lost Child", location: "Platform 2", staff: "Cst. Murugan R.", status: "Resolved", severity: "MEDIUM" },
//   { id: 2, date: "2026-03-02", type: "Unclaimed Baggage", location: "Platform 4", staff: "HC Selvam K.", status: "Resolved", severity: "HIGH" },
//   { id: 3, date: "2026-03-01", type: "Pickpocket", location: "General Coach", staff: "Cst. Arjun M.", status: "FIR Filed", severity: "HIGH" },
//   { id: 4, date: "2026-03-01", type: "Medical Emergency", location: "Waiting Hall", staff: "Cst. Priya S.", status: "Resolved", severity: "MEDIUM" },
//   { id: 5, date: "2026-02-28", type: "Suspicious Person", location: "Parking", staff: "Cst. Murugan R.", status: "Cleared", severity: "LOW" },
// ];

// const FORECAST_EVENTS = [
//   { date: "2026-03-10", event: "Tamil Nadu Board Exams Begin", type: "exam", impact: "HIGH", advice: "Expect 40% higher student traffic. Deploy extra staff at entry gates. Watch for paper leaks and impersonation." },
//   { date: "2026-03-14", event: "Holi", type: "festival", impact: "MEDIUM", advice: "Crowd surge expected on evening trains. Coordinate with RPF outposts. Alert for eve-teasing incidents." },
//   { date: "2026-03-25", event: "Good Friday", type: "festival", impact: "MEDIUM", advice: "Pilgrimage movement to Velankanni. Platform 3 will be heavily used. Arrange crowd barriers." },
//   { date: "2026-04-14", event: "Tamil New Year (Puthandu)", type: "festival", impact: "VERY HIGH", advice: "Maximum crowd day. All staff on duty. Coordinate with GRP. Emergency response teams on standby." },
// ];

// // ── UTILITIES ──────────────────────────────────────────────────────────────────

// function getCurrentTime() {
//   return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
// }

// function getCurrentDate() {
//   return new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
// }

// function getUpcomingTrains() {
//   return TRAIN_SCHEDULE.slice(0, 4);
// }

// function getPriorityColor(priority) {
//   switch (priority) {
//     case "HIGH": case "VERY HIGH": return COLORS.red;
//     case "MEDIUM": return COLORS.warning;
//     case "LOW": return COLORS.success;
//     default: return COLORS.midGray;
//   }
// }

// // ── STYLE HELPERS ──────────────────────────────────────────────────────────────

// const styles = {
//   app: {
//     fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
//     background: COLORS.offWhite,
//     minHeight: "100vh",
//     color: COLORS.darkText,
//   },
//   sidebar: {
//     width: 240,
//     background: COLORS.navyDark,
//     minHeight: "100vh",
//     position: "fixed",
//     left: 0,
//     top: 0,
//     display: "flex",
//     flexDirection: "column",
//     zIndex: 100,
//     borderRight: `1px solid ${COLORS.navyLight}`,
//   },
//   main: {
//     marginLeft: 240,
//     padding: "24px 28px",
//     minHeight: "100vh",
//   },
//   card: {
//     background: COLORS.white,
//     borderRadius: 12,
//     padding: 20,
//     boxShadow: "0 2px 12px rgba(13,31,60,0.08)",
//     border: `1px solid ${COLORS.lightGray}`,
//   },
//   navItem: (active) => ({
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     padding: "11px 20px",
//     cursor: "pointer",
//     background: active ? COLORS.red : "transparent",
//     color: active ? COLORS.white : COLORS.midGray,
//     fontWeight: active ? 600 : 400,
//     fontSize: 13,
//     borderLeft: active ? `3px solid ${COLORS.goldLight}` : "3px solid transparent",
//     transition: "all 0.15s",
//     userSelect: "none",
//   }),
//   badge: (color) => ({
//     background: color,
//     color: COLORS.white,
//     borderRadius: 4,
//     padding: "2px 7px",
//     fontSize: 10,
//     fontWeight: 700,
//     letterSpacing: 0.5,
//     display: "inline-block",
//   }),
//   btn: (variant = "primary") => ({
//     padding: "9px 18px",
//     borderRadius: 8,
//     border: "none",
//     cursor: "pointer",
//     fontWeight: 600,
//     fontSize: 13,
//     background: variant === "primary" ? COLORS.red : variant === "navy" ? COLORS.navy : variant === "gold" ? COLORS.gold : COLORS.lightGray,
//     color: variant === "light" ? COLORS.darkText : COLORS.white,
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 6,
//     transition: "opacity 0.15s",
//   }),
//   tag: (color = COLORS.navyLight) => ({
//     background: color + "20",
//     color: color,
//     border: `1px solid ${color}40`,
//     borderRadius: 20,
//     padding: "2px 10px",
//     fontSize: 11,
//     fontWeight: 500,
//     display: "inline-block",
//     marginRight: 4,
//     marginBottom: 4,
//   }),
//   sectionTitle: {
//     fontSize: 13,
//     fontWeight: 700,
//     color: COLORS.midGray,
//     letterSpacing: 1,
//     textTransform: "uppercase",
//     marginBottom: 12,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   },
//   statBox: (accent = COLORS.navy) => ({
//     background: accent,
//     borderRadius: 10,
//     padding: "16px 20px",
//     color: COLORS.white,
//   }),
// };

// // ── COMPONENTS ─────────────────────────────────────────────────────────────────

// function Sidebar({ activeTab, setActiveTab, role, setRole }) {
//   const navItems = [
//     { id: "dashboard", label: "Dashboard", icon: "⬛" },
//     { id: "briefing", label: "Briefing Module", icon: "📋" },
//     { id: "duty", label: "Duty Module", icon: "🚉" },
//     { id: "debriefing", label: "Debriefing Module", icon: "🎙️" },
//     { id: "reports", label: "Reports & Analytics", icon: "📊" },
//     { id: "forecast", label: "Threat Forecast", icon: "🔮" },
//     { id: "circulars", label: "Circulars", icon: "📄" },
//     { id: "roster", label: "Staff Roster", icon: "👥" },
//   ];

//   return (
//     <div style={styles.sidebar}>
//       {/* Logo */}
//       <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${COLORS.navyLight}` }}>
//         <div style={{ fontSize: 11, color: COLORS.gold, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>RAILWAY PROTECTION FORCE</div>
//         <div style={{ fontSize: 16, color: COLORS.white, fontWeight: 800, lineHeight: 1.2 }}>Duty Management<br />System</div>
//         <div style={{ fontSize: 11, color: COLORS.midGray, marginTop: 4 }}>Trichy Division / SR</div>
//       </div>

//       {/* Role Switcher */}
//       <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.navyLight}` }}>
//         <div style={{ fontSize: 10, color: COLORS.midGray, marginBottom: 6, letterSpacing: 0.8 }}>ACTIVE ROLE</div>
//         <select
//           value={role}
//           onChange={e => setRole(e.target.value)}
//           style={{ width: "100%", background: COLORS.navyMid, color: COLORS.white, border: `1px solid ${COLORS.navyLight}`, borderRadius: 6, padding: "6px 8px", fontSize: 12, cursor: "pointer" }}
//         >
//           <option value="admin">Division Head (SP)</option>
//           <option value="so">Station Officer (SO/SI)</option>
//           <option value="staff">Staff (Constable)</option>
//         </select>
//       </div>

//       {/* Nav */}
//       <nav style={{ flex: 1, paddingTop: 8 }}>
//         {navItems.map(item => (
//           <div
//             key={item.id}
//             style={styles.navItem(activeTab === item.id)}
//             onClick={() => setActiveTab(item.id)}
//           >
//             <span style={{ fontSize: 14 }}>{item.icon}</span>
//             <span>{item.label}</span>
//           </div>
//         ))}
//       </nav>

//       {/* Footer */}
//       <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.navyLight}` }}>
//         <div style={{ fontSize: 10, color: COLORS.midGray }}>{getCurrentDate()}</div>
//         <div style={{ fontSize: 16, color: COLORS.gold, fontWeight: 700, marginTop: 2 }}>{getCurrentTime()} HRS</div>
//       </div>
//     </div>
//   );
// }

// function Header({ title, subtitle }) {
//   return (
//     <div style={{ marginBottom: 24 }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
//         <div style={{ width: 4, height: 28, background: COLORS.red, borderRadius: 2 }} />
//         <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.navy }}>{title}</h1>
//       </div>
//       {subtitle && <div style={{ marginLeft: 16, fontSize: 13, color: COLORS.midGray }}>{subtitle}</div>}
//     </div>
//   );
// }

// // ── DASHBOARD ──────────────────────────────────────────────────────────────────

// function Dashboard({ role }) {
//   const stats = [
//     { label: "Staff On Duty", value: "15", sub: "across 4 posts", color: COLORS.navy },
//     { label: "Trains Today", value: "48", sub: "6 with alerts", color: COLORS.red },
//     { label: "Incidents (24h)", value: "3", sub: "2 resolved", color: COLORS.warning },
//     { label: "Circulars Active", value: "6", sub: "2 high priority", color: COLORS.success },
//   ];

//   return (
//     <div>
//       <Header title="Command Dashboard" subtitle={`Good morning. Today's security overview for Trichy Division.`} />

//       {/* Alert Banner */}
//       <div style={{ background: `${COLORS.red}15`, border: `1px solid ${COLORS.red}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
//         <span style={{ fontSize: 20 }}>⚠️</span>
//         <div>
//           <div style={{ fontWeight: 700, color: COLORS.red, fontSize: 13 }}>HIGH ALERT — Board Exam Season Approaching</div>
//           <div style={{ fontSize: 12, color: COLORS.darkText, marginTop: 2 }}>Tamil Nadu Board Exams begin March 10. Heightened security protocols in effect. Refer to Circular #3 for details.</div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
//         {stats.map((s, i) => (
//           <div key={i} style={{ ...styles.statBox(s.color), position: "relative", overflow: "hidden" }}>
//             <div style={{ position: "absolute", right: -10, top: -10, fontSize: 60, opacity: 0.08 }}>◉</div>
//             <div style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</div>
//             <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
//             <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{s.sub}</div>
//           </div>
//         ))}
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
//         {/* Post Status */}
//         <div style={styles.card}>
//           <div style={styles.sectionTitle}>📍 Post Status</div>
//           {POSTS.map(post => (
//             <div key={post.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.lightGray}` }}>
//               <div>
//                 <div style={{ fontWeight: 600, fontSize: 13 }}>{post.name}</div>
//                 <div style={{ fontSize: 11, color: COLORS.midGray }}>SO: {post.sos}</div>
//               </div>
//               <div style={{ textAlign: "right" }}>
//                 <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy }}>{post.onDuty}<span style={{ fontSize: 11, fontWeight: 400, color: COLORS.midGray }}>/{post.staff}</span></div>
//                 <div style={{ fontSize: 10, color: COLORS.midGray }}>On Duty</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Upcoming Trains with Alerts */}
//         <div style={styles.card}>
//           <div style={styles.sectionTitle}>🚂 Upcoming Trains — Alerts</div>
//           {getUpcomingTrains().map((train, i) => (
//             <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.lightGray}` }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <div>
//                   <span style={{ fontWeight: 700, fontSize: 13 }}>{train.trainNo}</span>
//                   <span style={{ fontSize: 12, color: COLORS.midGray, marginLeft: 8 }}>{train.name}</span>
//                 </div>
//                 <span style={{ ...styles.badge(getPriorityColor(train.crowdLevel)), fontSize: 9 }}>{train.crowdLevel}</span>
//               </div>
//               <div style={{ fontSize: 11, color: COLORS.midGray, marginTop: 3 }}>
//                 Pf {train.platform} • {train.arrival} — {train.alerts[0]}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent Incidents */}
//       <div style={styles.card}>
//         <div style={styles.sectionTitle}>🔴 Recent Incidents</div>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
//           {INCIDENT_LOG.map(inc => (
//             <div key={inc.id} style={{ background: COLORS.offWhite, borderRadius: 8, padding: "12px 14px", borderLeft: `3px solid ${getPriorityColor(inc.severity)}` }}>
//               <div style={{ fontWeight: 700, fontSize: 12 }}>{inc.type}</div>
//               <div style={{ fontSize: 11, color: COLORS.midGray, marginTop: 3 }}>{inc.location}</div>
//               <div style={{ fontSize: 11, color: COLORS.midGray }}>{inc.staff}</div>
//               <div style={{ ...styles.badge(inc.status === "Resolved" || inc.status === "Cleared" ? COLORS.success : COLORS.warning), marginTop: 6, fontSize: 9 }}>{inc.status}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── BRIEFING MODULE ────────────────────────────────────────────────────────────

// function BriefingModule({ role }) {
//   const [loading, setLoading] = useState(false);
//   const [briefingText, setBriefingText] = useState("");
//   const [shift, setShift] = useState("Morning");
//   const [post, setPost] = useState("Trichy Junction");
//   const [generated, setGenerated] = useState(false);
//   const [language, setLanguage] = useState("English");

//   const generateBriefing = async () => {
//     setLoading(true);
//     setBriefingText("");
//     setGenerated(false);

//     const highCirculars = CIRCULARS.filter(c => c.priority === "HIGH").map(c => c.title).join(", ");
//     const upcomingEvents = FORECAST_EVENTS.slice(0, 2).map(e => `${e.event} on ${e.date}`).join("; ");
//     const trainAlerts = TRAIN_SCHEDULE.slice(0, 3).map(t => `Train ${t.trainNo} (${t.name}) at ${t.arrival} on Pf ${t.platform}: ${t.alerts.join(", ")}`).join(". ");

//     const prompt = `You are an AI assistant for the Railway Protection Force (RPF) Trichy Division, Indian Railways. Generate a concise, professional duty briefing script for an SO (Station Officer) to read out to staff.

// Context:
// - Shift: ${shift}
// - Post: ${post}
// - Date: ${getCurrentDate()}
// - High Priority Circulars: ${highCirculars}
// - Upcoming Events/Threats: ${upcomingEvents}
// - Key Train Alerts Today: ${trainAlerts}
// - Language: ${language}

// Generate a structured briefing with these sections:
// 1. Opening (greet staff, state shift/date)
// 2. Priority Alerts (top 3 issues to focus on today)
// 3. Train-wise Instructions (for the first 3 trains)
// 4. Special Focus Areas (based on upcoming events)
// 5. Closing Reminder (duty, discipline, public trust)

// Keep it crisp, professional, and suitable for reading aloud. Use RPF terminology. Format clearly with section headers. Maximum 400 words.`;

//     try {
//       const response = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514",
//           max_tokens: 1000,
//           messages: [{ role: "user", content: prompt }]
//         })
//       });
//       const data = await response.json();
//       const text = data.content?.map(c => c.text || "").join("") || "Error generating briefing.";
//       setBriefingText(text);
//       setGenerated(true);
//     } catch (e) {
//       setBriefingText("⚠️ Unable to connect to AI. Please check connectivity and try again.");
//       setGenerated(true);
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <Header title="Briefing Module" subtitle="AI-generated shift briefing for SOs to deliver to staff" />

//       <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
//         {/* Controls */}
//         <div>
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>⚙️ Briefing Setup</div>

//             <div style={{ marginBottom: 14 }}>
//               <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.midGray, display: "block", marginBottom: 6 }}>POST / STATION</label>
//               <select value={post} onChange={e => setPost(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 13 }}>
//                 {POSTS.map(p => <option key={p.id}>{p.name}</option>)}
//               </select>
//             </div>

//             <div style={{ marginBottom: 14 }}>
//               <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.midGray, display: "block", marginBottom: 6 }}>SHIFT</label>
//               <select value={shift} onChange={e => setShift(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 13 }}>
//                 <option>Morning (06:00–14:00)</option>
//                 <option>Afternoon (14:00–22:00)</option>
//                 <option>Night (22:00–06:00)</option>
//               </select>
//             </div>

//             <div style={{ marginBottom: 20 }}>
//               <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.midGray, display: "block", marginBottom: 6 }}>LANGUAGE</label>
//               <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 13 }}>
//                 <option>English</option>
//                 <option>Tamil</option>
//                 <option>Hindi</option>
//               </select>
//             </div>

//             <button onClick={generateBriefing} disabled={loading} style={{ ...styles.btn("primary"), width: "100%", justifyContent: "center", padding: "12px" }}>
//               {loading ? "⏳ Generating..." : "🤖 Generate AI Briefing"}
//             </button>
//           </div>

//           {/* Active Circulars Summary */}
//           <div style={{ ...styles.card, marginTop: 16 }}>
//             <div style={styles.sectionTitle}>📋 Active Circulars</div>
//             {CIRCULARS.filter(c => c.priority === "HIGH").map(c => (
//               <div key={c.id} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.lightGray}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
//                 <span style={styles.badge(COLORS.red)}>HIGH</span>
//                 <span style={{ fontSize: 12, fontWeight: 500 }}>{c.title}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Briefing Output */}
//         <div style={styles.card}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//             <div style={styles.sectionTitle}>📢 Briefing Script</div>
//             {generated && (
//               <button onClick={() => window.print()} style={styles.btn("light")}>
//                 🖨️ Print
//               </button>
//             )}
//           </div>

//           {!generated && !loading && (
//             <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.midGray }}>
//               <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
//               <div style={{ fontSize: 15, fontWeight: 600 }}>Configure and generate your briefing</div>
//               <div style={{ fontSize: 13, marginTop: 8 }}>The AI will pull relevant circulars, train schedules, and threat forecasts to create a ready-to-deliver script.</div>
//             </div>
//           )}

//           {loading && (
//             <div style={{ textAlign: "center", padding: "60px 20px" }}>
//               <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
//               <div style={{ fontSize: 14, color: COLORS.midGray }}>AI is generating your briefing...</div>
//               <div style={{ width: "60%", height: 4, background: COLORS.lightGray, borderRadius: 2, margin: "16px auto 0", overflow: "hidden" }}>
//                 <div style={{ width: "60%", height: "100%", background: COLORS.red, borderRadius: 2, animation: "pulse 1s infinite" }} />
//               </div>
//             </div>
//           )}

//           {generated && briefingText && (
//             <div>
//               <div style={{ background: COLORS.navy, color: COLORS.gold, borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>
//                 🎖️ {shift.split(" ")[0].toUpperCase()} SHIFT BRIEFING — {post.toUpperCase()} — {new Date().toLocaleDateString("en-IN")}
//               </div>
//               <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, color: COLORS.darkText, fontFamily: "Georgia, serif" }}>
//                 {briefingText}
//               </div>
//               <div style={{ marginTop: 20, padding: "12px 16px", background: COLORS.offWhite, borderRadius: 8, fontSize: 12, color: COLORS.midGray }}>
//                 ✅ Briefing generated at {getCurrentTime()} HRS | Confirm delivery by SO signature
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── DUTY MODULE ────────────────────────────────────────────────────────────────

// function DutyModule({ role }) {
//   const [selectedStaff, setSelectedStaff] = useState(STAFF_ROSTER[0]);
//   const [selectedTrain, setSelectedTrain] = useState(null);
//   const [aiPrompt, setAiPrompt] = useState("");
//   const [loadingPrompt, setLoadingPrompt] = useState(false);

//   const getTrainPrompt = async (train) => {
//     setSelectedTrain(train);
//     setLoadingPrompt(true);
//     setAiPrompt("");

//     const prompt = `You are an RPF duty assistant for Indian Railways. Generate a brief, actionable security prompt for a constable about to handle an arriving train.

// Staff: ${selectedStaff.name} (${selectedStaff.rank})
// Duty Point: ${selectedStaff.duty}
// Train: ${train.trainNo} — ${train.name}
// Platform: ${train.platform}
// Arrival: ${train.arrival}
// Crowd Level: ${train.crowdLevel}
// Alerts: ${train.alerts.join(", ")}
// Focus Areas: ${train.focus.join(", ")}
// ${train.special ? "⚠️ SPECIAL TRAIN — heightened alert" : ""}

// Generate a focused 3-4 point duty prompt. Each point should be one clear action. Be direct and use RPF operational language. Include specific positions to take, what to watch for, and who to contact if needed. Keep under 150 words.`;

//     try {
//       const response = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514",
//           max_tokens: 1000,
//           messages: [{ role: "user", content: prompt }]
//         })
//       });
//       const data = await response.json();
//       const text = data.content?.map(c => c.text || "").join("") || "Error generating prompt.";
//       setAiPrompt(text);
//     } catch (e) {
//       setAiPrompt("⚠️ Could not fetch AI prompt. Refer to standard operating procedures.");
//     }
//     setLoadingPrompt(false);
//   };

//   return (
//     <div>
//       <Header title="Duty Module" subtitle="Real-time train-by-train security prompts for on-duty staff" />

//       <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>
//         {/* Staff Selector */}
//         <div>
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>👮 Select Staff</div>
//             {STAFF_ROSTER.map(staff => (
//               <div
//                 key={staff.id}
//                 onClick={() => setSelectedStaff(staff)}
//                 style={{
//                   padding: "10px 12px",
//                   borderRadius: 8,
//                   cursor: "pointer",
//                   marginBottom: 6,
//                   background: selectedStaff.id === staff.id ? `${COLORS.navy}10` : "transparent",
//                   border: `1px solid ${selectedStaff.id === staff.id ? COLORS.navy : COLORS.lightGray}`,
//                   borderLeft: `3px solid ${selectedStaff.id === staff.id ? COLORS.red : "transparent"}`,
//                 }}
//               >
//                 <div style={{ fontWeight: 600, fontSize: 12 }}>{staff.name}</div>
//                 <div style={{ fontSize: 11, color: COLORS.midGray }}>{staff.rank} • {staff.duty}</div>
//                 <div style={{ ...styles.badge(staff.status === "On Duty" ? COLORS.success : COLORS.warning), marginTop: 4, fontSize: 9 }}>{staff.status}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Train Schedule + AI Prompts */}
//         <div>
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>🚂 Today's Train Schedule — Click for Duty Prompt</div>
//             <div style={{ display: "grid", gap: 10 }}>
//               {TRAIN_SCHEDULE.map((train, i) => (
//                 <div
//                   key={i}
//                   style={{
//                     border: `1px solid ${selectedTrain?.trainNo === train.trainNo ? COLORS.red : COLORS.lightGray}`,
//                     borderLeft: `4px solid ${train.special ? COLORS.gold : getPriorityColor(train.crowdLevel)}`,
//                     borderRadius: 8,
//                     padding: "12px 14px",
//                     cursor: "pointer",
//                     background: selectedTrain?.trainNo === train.trainNo ? `${COLORS.red}08` : COLORS.white,
//                     transition: "all 0.15s",
//                   }}
//                   onClick={() => getTrainPrompt(train)}
//                 >
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                     <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//                       <div>
//                         <span style={{ fontWeight: 800, fontSize: 14, color: COLORS.navy }}>{train.trainNo}</span>
//                         <span style={{ fontSize: 13, color: COLORS.darkText, marginLeft: 8 }}>{train.name}</span>
//                         {train.special && <span style={{ ...styles.badge(COLORS.gold), marginLeft: 8, fontSize: 9 }}>SPECIAL</span>}
//                       </div>
//                     </div>
//                     <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//                       <span style={styles.badge(getPriorityColor(train.crowdLevel))}>{train.crowdLevel}</span>
//                       <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy }}>Pf {train.platform}</span>
//                       <span style={{ fontSize: 13, color: COLORS.midGray }}>{train.arrival}</span>
//                     </div>
//                   </div>
//                   <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
//                     {train.alerts.map((alert, ai) => (
//                       <span key={ai} style={styles.tag(COLORS.red)}>⚠ {alert}</span>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* AI Prompt Panel */}
//           {(selectedTrain || loadingPrompt) && (
//             <div style={{ ...styles.card, marginTop: 16, borderLeft: `4px solid ${COLORS.gold}` }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//                 <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.navy }}>
//                   🤖 AI Duty Prompt — {selectedTrain?.trainNo} {selectedTrain?.name}
//                 </div>
//                 <span style={{ fontSize: 11, color: COLORS.midGray }}>For: {selectedStaff.name}</span>
//               </div>

//               {loadingPrompt ? (
//                 <div style={{ color: COLORS.midGray, fontSize: 13 }}>⏳ Generating security prompt...</div>
//               ) : (
//                 <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.8, color: COLORS.darkText }}>
//                   {aiPrompt}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── DEBRIEFING MODULE ──────────────────────────────────────────────────────────

// function DebriefingModule({ role }) {
//   const [recording, setRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [report, setReport] = useState("");
//   const [loadingReport, setLoadingReport] = useState(false);
//   const [selectedStaff, setSelectedStaff] = useState(STAFF_ROSTER[0]);
//   const [duty, setDuty] = useState("Platform 1-2");
//   const [savedLogs, setSavedLogs] = useState([]);
//   const recognitionRef = useRef(null);

//   const startRecording = () => {
//     if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
//       setTranscript("⚠️ Voice recognition not available in this browser. Please type your debrief below.");
//       return;
//     }
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = "en-IN";
//     recognition.onresult = (event) => {
//       let text = "";
//       for (let i = 0; i < event.results.length; i++) {
//         text += event.results[i][0].transcript + " ";
//       }
//       setTranscript(text);
//     };
//     recognition.onerror = () => setRecording(false);
//     recognition.onend = () => setRecording(false);
//     recognition.start();
//     recognitionRef.current = recognition;
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     recognitionRef.current?.stop();
//     setRecording(false);
//   };

//   const generateReport = async () => {
//     if (!transcript.trim()) return;
//     setLoadingReport(true);
//     setReport("");

//     const prompt = `You are an RPF duty analyst. Analyze this voice debrief from an RPF constable and generate a structured incident log entry.

// Staff: ${selectedStaff.name} (${selectedStaff.rank})
// Duty: ${duty}
// Shift: Morning
// Date: ${getCurrentDate()}
// Raw Voice Debrief: "${transcript}"

// Generate a structured report with:
// 1. Summary (2-3 sentences)
// 2. Incidents Reported (list each with type, location, action taken, outcome)
// 3. Security Observations (notable observations during duty)
// 4. Areas for Improvement (if any)
// 5. Recommended Follow-up Actions
// 6. Duty Rating: Excellent / Good / Needs Improvement (with brief justification)

// Be professional, concise, and use RPF operational terminology. Format clearly.`;

//     try {
//       const response = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514",
//           max_tokens: 1000,
//           messages: [{ role: "user", content: prompt }]
//         })
//       });
//       const data = await response.json();
//       const text = data.content?.map(c => c.text || "").join("") || "Error generating report.";
//       setReport(text);
//     } catch (e) {
//       setReport("⚠️ Could not generate report. Please check connectivity.");
//     }
//     setLoadingReport(false);
//   };

//   const saveLog = () => {
//     const log = {
//       id: Date.now(),
//       staff: selectedStaff.name,
//       duty,
//       time: getCurrentTime(),
//       transcript,
//       report,
//       date: new Date().toLocaleDateString("en-IN"),
//     };
//     setSavedLogs(prev => [log, ...prev]);
//     setTranscript("");
//     setReport("");
//     alert("✅ Debrief logged successfully!");
//   };

//   return (
//     <div>
//       <Header title="Debriefing Module" subtitle="Voice-based duty debrief capture, AI analysis & incident logging" />

//       <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
//         {/* Controls */}
//         <div>
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>👮 Staff Details</div>
//             <div style={{ marginBottom: 12 }}>
//               <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.midGray, display: "block", marginBottom: 5 }}>STAFF</label>
//               <select value={selectedStaff.id} onChange={e => setSelectedStaff(STAFF_ROSTER.find(s => s.id === e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 12 }}>
//                 {STAFF_ROSTER.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//               </select>
//             </div>
//             <div style={{ marginBottom: 12 }}>
//               <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.midGray, display: "block", marginBottom: 5 }}>DUTY POINT</label>
//               <input value={duty} onChange={e => setDuty(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 12, boxSizing: "border-box" }} />
//             </div>
//           </div>

//           {/* Saved Logs */}
//           {savedLogs.length > 0 && (
//             <div style={{ ...styles.card, marginTop: 16 }}>
//               <div style={styles.sectionTitle}>📁 Saved Logs</div>
//               {savedLogs.map(log => (
//                 <div key={log.id} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.lightGray}` }}>
//                   <div style={{ fontWeight: 600, fontSize: 12 }}>{log.staff}</div>
//                   <div style={{ fontSize: 11, color: COLORS.midGray }}>{log.duty} • {log.time} HRS</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Main Debrief Area */}
//         <div>
//           {/* Voice Recording */}
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>🎙️ Voice Debrief</div>
//             <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
//               {!recording ? (
//                 <button onClick={startRecording} style={styles.btn("primary")}>
//                   🎙️ Start Recording
//                 </button>
//               ) : (
//                 <button onClick={stopRecording} style={{ ...styles.btn("primary"), background: COLORS.red, animation: "pulse 1s infinite" }}>
//                   ⏹️ Stop Recording
//                 </button>
//               )}
//               {recording && <span style={{ fontSize: 12, color: COLORS.red, alignSelf: "center", fontWeight: 600 }}>● RECORDING...</span>}
//             </div>

//             <textarea
//               value={transcript}
//               onChange={e => setTranscript(e.target.value)}
//               placeholder="Voice transcript will appear here... or type directly in English, Tamil, or Hindi."
//               style={{ width: "100%", minHeight: 120, padding: "12px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 13, lineHeight: 1.7, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
//             />

//             <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
//               <button onClick={generateReport} disabled={!transcript.trim() || loadingReport} style={styles.btn("navy")}>
//                 {loadingReport ? "⏳ Analysing..." : "🤖 Analyse & Generate Report"}
//               </button>
//               <button onClick={() => setTranscript("")} style={styles.btn("light")}>
//                 🗑️ Clear
//               </button>
//             </div>
//           </div>

//           {/* AI Report */}
//           {(report || loadingReport) && (
//             <div style={{ ...styles.card, marginTop: 16 }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
//                 <div style={styles.sectionTitle}>📊 AI-Generated Duty Report</div>
//                 {report && (
//                   <button onClick={saveLog} style={styles.btn("gold")}>
//                     💾 Save & Log
//                   </button>
//                 )}
//               </div>

//               {loadingReport ? (
//                 <div style={{ color: COLORS.midGray, fontSize: 13 }}>⏳ AI is analysing the debrief...</div>
//               ) : (
//                 <div>
//                   <div style={{ background: COLORS.navy, color: COLORS.gold, borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
//                     DUTY REPORT — {selectedStaff.name} — {duty} — {getCurrentDate()}
//                   </div>
//                   <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.8, color: COLORS.darkText }}>
//                     {report}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── REPORTS ────────────────────────────────────────────────────────────────────

// function Reports({ role }) {
//   const [reportType, setReportType] = useState("daily");
//   const [aiReport, setAiReport] = useState("");
//   const [loading, setLoading] = useState(false);

//   const generateReport = async () => {
//     setLoading(true);
//     setAiReport("");

//     const prompt = `You are an RPF divisional intelligence analyst. Generate a ${reportType} performance and security report for the Trichy Division.

// Data available:
// - Incidents: ${INCIDENT_LOG.length} incidents in last 24 hours
// - Posts: Trichy Junction (8/24 on duty), Srirangam (2/6), Puducherry (3/8), Chidambaram (2/6)
// - High priority circulars active: Anti-Human Trafficking, Festival Crowd Management, Board Exam Advisory
// - Train alerts today: 6 trains with security alerts
// - Upcoming high-risk events: Board exams (March 10), Holi (March 14), Tamil New Year (April 14)

// Generate a professional ${reportType} report with:
// 1. Executive Summary
// 2. Operational Performance (staffing, duty coverage, response times)
// 3. Incident Analysis (patterns, hotspots, types)
// 4. Security Threat Assessment
// 5. Recommendations for Next Shift/Day/Week
// 6. Commendations & Areas Needing Improvement

// Use RPF/IPS terminology. Be analytical and actionable. 350-400 words.`;

//     try {
//       const response = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514",
//           max_tokens: 1000,
//           messages: [{ role: "user", content: prompt }]
//         })
//       });
//       const data = await response.json();
//       setAiReport(data.content?.map(c => c.text || "").join("") || "Error generating report.");
//     } catch (e) {
//       setAiReport("⚠️ Could not generate report.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <Header title="Reports & Analytics" subtitle="AI-generated operational intelligence and performance reports" />

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
//         {["Daily", "Weekly", "Monthly"].map(r => (
//           <div
//             key={r}
//             onClick={() => setReportType(r.toLowerCase())}
//             style={{
//               ...styles.card,
//               cursor: "pointer",
//               borderLeft: `4px solid ${reportType === r.toLowerCase() ? COLORS.red : COLORS.lightGray}`,
//               background: reportType === r.toLowerCase() ? `${COLORS.navy}08` : COLORS.white,
//             }}
//           >
//             <div style={{ fontWeight: 700, fontSize: 15, color: reportType === r.toLowerCase() ? COLORS.navy : COLORS.darkText }}>{r} Report</div>
//             <div style={{ fontSize: 12, color: COLORS.midGray, marginTop: 4 }}>Generate {r.toLowerCase()} summary</div>
//           </div>
//         ))}
//       </div>

//       {/* Incident Breakdown */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
//         <div style={styles.card}>
//           <div style={styles.sectionTitle}>📊 Incident Breakdown (Last 7 Days)</div>
//           {[
//             { type: "Theft/Pickpocket", count: 4, color: COLORS.red },
//             { type: "Lost Items/Children", count: 6, color: COLORS.warning },
//             { type: "Medical Emergency", count: 3, color: COLORS.info },
//             { type: "Unclaimed Baggage", count: 5, color: COLORS.gold },
//             { type: "Suspicious Activity", count: 2, color: COLORS.midGray },
//           ].map((item, i) => (
//             <div key={i} style={{ marginBottom: 10 }}>
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                 <span style={{ fontSize: 12 }}>{item.type}</span>
//                 <span style={{ fontSize: 12, fontWeight: 700 }}>{item.count}</span>
//               </div>
//               <div style={{ height: 6, background: COLORS.lightGray, borderRadius: 3 }}>
//                 <div style={{ height: "100%", width: `${(item.count / 10) * 100}%`, background: item.color, borderRadius: 3 }} />
//               </div>
//             </div>
//           ))}
//         </div>

//         <div style={styles.card}>
//           <div style={styles.sectionTitle}>📍 Performance by Post</div>
//           {POSTS.map((post, i) => (
//             <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.lightGray}` }}>
//               <div>
//                 <div style={{ fontWeight: 600, fontSize: 13 }}>{post.name}</div>
//                 <div style={{ fontSize: 11, color: COLORS.midGray }}>Staffing: {Math.round((post.onDuty / post.staff) * 100)}%</div>
//               </div>
//               <div style={{ textAlign: "right" }}>
//                 <div style={styles.badge(post.onDuty / post.staff > 0.3 ? COLORS.success : COLORS.warning)}>
//                   {post.onDuty / post.staff > 0.3 ? "ADEQUATE" : "REVIEW"}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* AI Report Generator */}
//       <div style={styles.card}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//           <div style={styles.sectionTitle}>🤖 AI Intelligence Report</div>
//           <button onClick={generateReport} disabled={loading} style={styles.btn("primary")}>
//             {loading ? "⏳ Generating..." : `📊 Generate ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
//           </button>
//         </div>

//         {!aiReport && !loading && (
//           <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.midGray }}>
//             <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
//             <div>Click to generate an AI-powered intelligence report</div>
//           </div>
//         )}
//         {loading && <div style={{ color: COLORS.midGray, padding: 20 }}>⏳ Analysing data and generating report...</div>}
//         {aiReport && (
//           <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.8, color: COLORS.darkText }}>
//             {aiReport}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── THREAT FORECAST ────────────────────────────────────────────────────────────

// function ThreatForecast() {
//   const [aiAnalysis, setAiAnalysis] = useState("");
//   const [loading, setLoading] = useState(false);

//   const generateForecast = async () => {
//     setLoading(true);
//     setAiAnalysis("");

//     const eventsStr = FORECAST_EVENTS.map(e => `${e.event} (${e.date}) — Impact: ${e.impact}`).join("; ");

//     const prompt = `You are an RPF security intelligence officer. Generate a crowd and threat forecast for the next 30 days for Trichy Division, Indian Railways.

// Upcoming events: ${eventsStr}

// Historical patterns:
// - Festivals: 60-80% increase in passenger traffic
// - Board exam seasons: Large student movement, impersonation risks
// - Summer vacation (April-May): Family travel surge, pickpocket increase
// - Night trains: Women safety concerns heightened

// Generate a structured forecast with:
// 1. Overall Threat Level for Next 30 Days
// 2. Week-by-week threat calendar with specific dates
// 3. Crowd Surge Predictions (which stations, which days, expected volume)
// 4. Anticipated Incident Types (ranked by probability)
// 5. Recommended Deployment Changes (specific staff augmentation suggestions)
// 6. Special Operations to Consider

// Be specific, data-driven, and actionable. Use RPF/security terminology. 400 words.`;

//     try {
//       const response = await fetch("https://api.anthropic.com/v1/messages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           model: "claude-sonnet-4-20250514",
//           max_tokens: 1000,
//           messages: [{ role: "user", content: prompt }]
//         })
//       });
//       const data = await response.json();
//       setAiAnalysis(data.content?.map(c => c.text || "").join("") || "Error generating forecast.");
//     } catch (e) {
//       setAiAnalysis("⚠️ Could not generate forecast.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <Header title="Threat Forecast" subtitle="AI-powered crowd prediction and security threat assessment" />

//       {/* Event Calendar */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
//         {FORECAST_EVENTS.map((event, i) => (
//           <div key={i} style={{ ...styles.card, borderLeft: `4px solid ${getPriorityColor(event.impact)}` }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
//               <div>
//                 <div style={{ fontWeight: 700, fontSize: 14 }}>{event.event}</div>
//                 <div style={{ fontSize: 12, color: COLORS.midGray, marginTop: 3 }}>📅 {event.date}</div>
//               </div>
//               <span style={styles.badge(getPriorityColor(event.impact))}>{event.impact} IMPACT</span>
//             </div>
//             <div style={{ fontSize: 12, color: COLORS.darkText, lineHeight: 1.6, background: COLORS.offWhite, borderRadius: 6, padding: "8px 10px" }}>
//               💡 {event.advice}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* AI Forecast */}
//       <div style={styles.card}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//           <div style={styles.sectionTitle}>🔮 AI 30-Day Security Forecast</div>
//           <button onClick={generateForecast} disabled={loading} style={styles.btn("primary")}>
//             {loading ? "⏳ Forecasting..." : "🔮 Generate Forecast"}
//           </button>
//         </div>

//         {!aiAnalysis && !loading && (
//           <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.midGray }}>
//             <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
//             <div style={{ fontSize: 14, fontWeight: 600 }}>Generate AI-powered threat forecast</div>
//             <div style={{ fontSize: 12, marginTop: 8 }}>Analyses upcoming events, historical patterns, and seasonal trends to predict security challenges</div>
//           </div>
//         )}
//         {loading && <div style={{ color: COLORS.midGray, padding: 20 }}>⏳ Analysing events and generating 30-day forecast...</div>}
//         {aiAnalysis && (
//           <div style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.8, color: COLORS.darkText }}>
//             {aiAnalysis}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── CIRCULARS ──────────────────────────────────────────────────────────────────

// function Circulars({ role }) {
//   const [selected, setSelected] = useState(null);
//   const [search, setSearch] = useState("");

//   const filtered = CIRCULARS.filter(c =>
//     c.title.toLowerCase().includes(search.toLowerCase()) ||
//     c.category.toLowerCase().includes(search.toLowerCase()) ||
//     c.tags.some(t => t.includes(search.toLowerCase()))
//   );

//   return (
//     <div>
//       <Header title="Circulars & Instructions" subtitle="Active orders, SOPs, and advisories from IG / DG / Division" />

//       <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
//         <div>
//           <input
//             placeholder="🔍 Search circulars..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${COLORS.lightGray}`, fontSize: 13, marginBottom: 12, boxSizing: "border-box" }}
//           />

//           {filtered.map(c => (
//             <div
//               key={c.id}
//               onClick={() => setSelected(c)}
//               style={{
//                 ...styles.card,
//                 cursor: "pointer",
//                 marginBottom: 10,
//                 borderLeft: `4px solid ${getPriorityColor(c.priority)}`,
//                 background: selected?.id === c.id ? `${COLORS.navy}08` : COLORS.white,
//                 padding: "12px 14px",
//               }}
//             >
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                 <span style={styles.badge(getPriorityColor(c.priority))}>{c.priority}</span>
//                 <span style={{ fontSize: 11, color: COLORS.midGray }}>{c.date}</span>
//               </div>
//               <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{c.title}</div>
//               <div style={{ fontSize: 11, color: COLORS.midGray, marginTop: 3 }}>{c.category}</div>
//             </div>
//           ))}

//           {role === "admin" && (
//             <button style={{ ...styles.btn("primary"), width: "100%", justifyContent: "center", marginTop: 8 }}>
//               ➕ Add New Circular
//             </button>
//           )}
//         </div>

//         <div style={styles.card}>
//           {selected ? (
//             <div>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
//                 <div>
//                   <div style={{ fontSize: 11, color: COLORS.midGray, marginBottom: 6 }}>{selected.category} • {selected.date}</div>
//                   <h2 style={{ margin: 0, fontSize: 18, color: COLORS.navy }}>{selected.title}</h2>
//                 </div>
//                 <span style={styles.badge(getPriorityColor(selected.priority))}>{selected.priority} PRIORITY</span>
//               </div>
//               <div style={{ background: COLORS.offWhite, borderRadius: 8, padding: "16px", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
//                 {selected.content}
//               </div>
//               <div>
//                 <span style={{ fontSize: 11, color: COLORS.midGray, marginRight: 8 }}>TAGS:</span>
//                 {selected.tags.map(tag => <span key={tag} style={styles.tag(COLORS.navy)}>{tag}</span>)}
//               </div>
//             </div>
//           ) : (
//             <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.midGray }}>
//               <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
//               <div>Select a circular to view details</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── ROSTER ─────────────────────────────────────────────────────────────────────

// function Roster({ role }) {
//   return (
//     <div>
//       <Header title="Staff Roster" subtitle="Current shift deployment across all posts and outposts" />

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
//         {POSTS.map(post => (
//           <div key={post.id} style={styles.card}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//               <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.navy }}>{post.name}</div>
//               <div>
//                 <span style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy }}>{post.onDuty}</span>
//                 <span style={{ fontSize: 12, color: COLORS.midGray }}>/{post.staff} on duty</span>
//               </div>
//             </div>
//             <div style={{ height: 6, background: COLORS.lightGray, borderRadius: 3, marginBottom: 10 }}>
//               <div style={{ height: "100%", width: `${(post.onDuty / post.staff) * 100}%`, background: COLORS.navy, borderRadius: 3 }} />
//             </div>
//             <div style={{ fontSize: 12, color: COLORS.midGray }}>SO: {post.sos}</div>
//           </div>
//         ))}
//       </div>

//       <div style={styles.card}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//           <div style={styles.sectionTitle}>👮 Trichy Junction — Current Shift</div>
//           {role !== "staff" && <button style={styles.btn("primary")}>➕ Add Staff</button>}
//         </div>

//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: COLORS.navy }}>
//               {["ID", "Name", "Rank", "Duty Assignment", "Shift", "Status"].map(h => (
//                 <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: COLORS.gold, fontWeight: 700, letterSpacing: 0.8 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {STAFF_ROSTER.map((staff, i) => (
//               <tr key={staff.id} style={{ background: i % 2 === 0 ? COLORS.white : COLORS.offWhite }}>
//                 <td style={{ padding: "11px 14px", fontSize: 12, color: COLORS.midGray, fontFamily: "monospace" }}>{staff.id}</td>
//                 <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600 }}>{staff.name}</td>
//                 <td style={{ padding: "11px 14px", fontSize: 12 }}>{staff.rank}</td>
//                 <td style={{ padding: "11px 14px", fontSize: 12 }}>{staff.duty}</td>
//                 <td style={{ padding: "11px 14px", fontSize: 12 }}>{staff.shift}</td>
//                 <td style={{ padding: "11px 14px" }}>
//                   <span style={styles.badge(staff.status === "On Duty" ? COLORS.success : staff.status === "Briefing" ? COLORS.info : COLORS.warning)}>
//                     {staff.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // ── ROOT APP ───────────────────────────────────────────────────────────────────

// export default function App() {
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [role, setRole] = useState("admin");

//   const renderContent = () => {
//     switch (activeTab) {
//       case "dashboard": return <Dashboard role={role} />;
//       case "briefing": return <BriefingModule role={role} />;
//       case "duty": return <DutyModule role={role} />;
//       case "debriefing": return <DebriefingModule role={role} />;
//       case "reports": return <Reports role={role} />;
//       case "forecast": return <ThreatForecast />;
//       case "circulars": return <Circulars role={role} />;
//       case "roster": return <Roster role={role} />;
//       default: return <Dashboard role={role} />;
//     }
//   };

//   return (
//     <div style={styles.app}>
//       <style>{`
//         * { box-sizing: border-box; }
//         body { margin: 0; }
//         @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
//         select, input, textarea, button { font-family: 'DM Sans', 'Segoe UI', sans-serif; }
//         button:hover { opacity: 0.88; }
//         @media print { .no-print { display: none; } }
//       `}</style>
//       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} setRole={setRole} />
//       <main style={styles.main}>
//         {renderContent()}
//       </main>
//     </div>
//   );
// }