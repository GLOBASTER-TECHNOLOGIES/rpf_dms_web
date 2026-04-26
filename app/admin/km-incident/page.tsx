"use client";

import { useEffect, useState } from "react";

enum IncidentType {
    TRESPASSING = "TRESPASSING",
    CATTLE = "CATTLE",
    OBSTRUCTION = "OBSTRUCTION",
    TRACK_DAMAGE = "TRACK_DAMAGE",
    FIRE = "FIRE",
    FLOOD = "FLOOD",
    SIGNAL_FAILURE = "SIGNAL_FAILURE",
    ACCIDENT = "ACCIDENT",
}

interface KmIncident {
    _id?: string;
    division: string;
    rpf_post: string;
    section: string;
    track_km: number;
    incident_type: IncidentType;
    date_of_occurrence: string;
}

export default function IncidentPage() {
    const [incidents, setIncidents] = useState<KmIncident[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: KmIncident = {
        division: "",
        rpf_post: "",
        section: "",
        track_km: 0,
        incident_type: IncidentType.TRESPASSING,
        date_of_occurrence: new Date().toISOString().split("T")[0],
    };

    const [form, setForm] = useState<KmIncident>(initialFormState);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/km-incident");
            const data = await res.json();
            setIncidents(data.data || []);
        } catch (err) {
            setError("Error loading data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIncidents(); }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "track_km" ? parseFloat(value) || 0 : value });
    };

    // --- CREATE or UPDATE ---
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        try {
            const url = editingId ? `/api/km-incident/${editingId}` : "/api/km-incident";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                fetchIncidents();
                cancelEdit();
            } else {
                setError("Failed to save. Check server.");
            }
        } catch (err) {
            setError("Failed to save.");
        }
    };

    // --- DELETE ---
    const handleDelete = async (id: string) => {
        if (confirm("Delete this record?")) {
            await fetch(`/api/km-incident/${id}`, { method: "DELETE" });
            fetchIncidents();
        }
    };

    // --- PREPARE EDIT ---
    const handleEdit = (incident: KmIncident) => {
        setEditingId(incident._id!);
        // Ensure date is in YYYY-MM-DD format for the input
        const formattedDate = new Date(incident.date_of_occurrence).toISOString().split("T")[0];
        setForm({ ...incident, date_of_occurrence: formattedDate });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(initialFormState);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif", color: "#333" }}>
            <h1 style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>Incident Management</h1>

            {/* --- FORM SECTION --- */}
            <div style={{
                background: editingId ? "#fff7ed" : "#fff",
                border: editingId ? "2px solid #f97316" : "2px solid #2563eb",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "30px"
            }}>
                <h3 style={{ marginTop: "0", color: editingId ? "#f97316" : "#2563eb" }}>
                    {editingId ? "Edit Incident Details" : "Report New Incident"}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>

                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Division</label>
                        <input name="division" value={form.division} onChange={handleChange} required
                            style={{ width: "100%", padding: "10px", border: "1px solid #000", borderRadius: "4px" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>RPF Post</label>
                        <input name="rpf_post" value={form.rpf_post} onChange={handleChange} required
                            style={{ width: "100%", padding: "10px", border: "1px solid #000", borderRadius: "4px" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Section Code</label>
                        <input name="section" value={form.section} onChange={handleChange} required
                            style={{ width: "100%", padding: "10px", border: "1px solid #000", borderRadius: "4px" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Track KM</label>
                        <input name="track_km" type="number" step="any" value={form.track_km} onChange={handleChange} required
                            style={{ width: "100%", padding: "10px", border: "1px solid #000", borderRadius: "4px" }} />
                    </div>

                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Incident Type</label>
                        <select name="incident_type" value={form.incident_type} onChange={handleChange}
                            style={{ width: "100%", padding: "10px", border: "1px solid #000", borderRadius: "4px", background: "#fff" }}>
                            {Object.values(IncidentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Date</label>
                        <input name="date_of_occurrence" type="date" value={form.date_of_occurrence} onChange={handleChange} required
                            style={{ width: "100%", padding: "10px", border: "1px solid #000", borderRadius: "4px" }} />
                    </div>

                    <div style={{ gridColumn: "span 2", display: "flex", gap: "10px" }}>
                        <button type="submit" style={{
                            flex: 1,
                            padding: "12px",
                            background: editingId ? "#f97316" : "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}>
                            {editingId ? "UPDATE INCIDENT" : "SAVE INCIDENT"}
                        </button>

                        {editingId && (
                            <button type="button" onClick={cancelEdit} style={{
                                padding: "12px 20px",
                                background: "#666",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}>
                                CANCEL
                            </button>
                        )}
                    </div>
                </form>
                {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
            </div>

            {/* --- TABLE SECTION --- */}
            <h3 style={{ borderBottom: "1px solid #ccc" }}>Recent Logs</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead style={{ background: "#eee" }}>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Date</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Section (KM)</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "left" }}>Type</th>
                        <th style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {incidents.map((incident) => (
                        <tr key={incident._id} style={{ background: editingId === incident._id ? "#fff7ed" : "transparent" }}>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{new Date(incident.date_of_occurrence).toLocaleDateString()}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{incident.section} (KM: {incident.track_km})</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px", fontWeight: "bold" }}>{incident.incident_type}</td>
                            <td style={{ border: "1px solid #ccc", padding: "10px", textAlign: "center" }}>
                                <button onClick={() => handleEdit(incident)} style={{ background: "#f97316", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: "5px" }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(incident._id!)} style={{ background: "#ff4444", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && <p>Loading...</p>}
        </div>
    );
}