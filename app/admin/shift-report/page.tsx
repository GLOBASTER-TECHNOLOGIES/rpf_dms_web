"use client";

import { useState } from "react";

export default function ShiftReportPage() {
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("Morning");
  const [post, setPost] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!date || !shift || !post) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/shift-details/get?date=${date}&shift=${shift}&post=${post}`
      );
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 🔍 Filters */}
      <div className="bg-white p-4 rounded-2xl shadow flex gap-4 items-end">
        <div>
          <label className="text-sm">Date</label>
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Shift</label>
          <select
            className="border p-2 rounded"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Night</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Post</label>
          <input
            className="border p-2 rounded"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Enter Post Code"
          />
        </div>

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Get Report"}
        </button>
      </div>

      {/* 📊 DATA DISPLAY */}
      {data && (
        <div className="space-y-6">
          {/* 🧠 Briefing */}
          <Section title="Briefing">
            <p>{data.briefing?.briefingScript || "No briefing available"}</p>
          </Section>

          {/* 👮 Officers */}
          <Section title="Officers">
            <ul className="list-disc ml-5">
              {data.officers?.map((o: any) => (
                <li key={o._id}>{o.name || o._id}</li>
              ))}
            </ul>
          </Section>

          {/* 📜 Instructions */}
          <Section title="Instructions">
            {data.instructions.map((i: any) => (
              <div key={i._id} className="border p-3 rounded mb-2">
                <h4 className="font-semibold">{i.title}</h4>
                <p>{i.instruction}</p>
              </div>
            ))}
          </Section>

          {/* 📝 Debriefs */}
          <Section title="Debriefs">
            {data.debriefs.map((d: any) => (
              <div key={d._id} className="border p-3 rounded mb-2">
                <p><strong>Officer:</strong> {d.staffId?.name}</p>
                <p><strong>Summary:</strong> {d.summary}</p>
                <p><strong>Observations:</strong> {d.observations}</p>
              </div>
            ))}
          </Section>

          {/* ⚠️ Threats */}
          <Section title="Threat Alerts">
            {data.threats.map((t: any) => (
              <div key={t._id} className="border p-3 rounded mb-2">
                <p className="font-semibold">{t.eventName}</p>
                <p>Risk: {t.riskLevel}</p>
                <p>{t.advisories}</p>
              </div>
            ))}
          </Section>

          {/* 🚆 Trains */}
          <Section title="Trains in Shift">
            {data.trains.map((t: any) => (
              <div key={t._id} className="border p-3 rounded mb-2">
                <p>{t.trainNumber} - {t.trainName}</p>
                <p>Arrival: {t.arrivalTime}</p>
                <p>Platform: {t.platform}</p>
              </div>
            ))}
          </Section>

          {/* 🚨 Crime Intelligence */}
          <Section title="Crime Intelligence">
            {data.crimeIntel.map((c: any) => (
              <div key={c._id} className="border p-3 rounded mb-2">
                <p><strong>Train:</strong> {c.trainNumber}</p>
                <p>Risk: {c.riskLevel}</p>
                <p>Total Incidents: {c.totalIncidents}</p>
              </div>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

/* 🔹 Reusable Section Component */
function Section({ title, children }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}