"use client";

import { useState } from "react";
import { generateShiftPDF } from "@/config/pdfGenerator";

export default function ShiftReportPage() {
    const [date, setDate] = useState("");
    const [shift, setShift] = useState("Morning");
    const [post, setPost] = useState("");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        if (!date || !shift || !post) return;
        setLoading(true);
        setData(null);
        try {
            const res = await fetch(`/api/shift-details/get?date=${date}&shift=${shift}&post=${post}`);
            const json = await res.json();
            if (json.success && json.data) {
                setData(json.data);
            } else {
                alert("No shift records found.");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* 🔍 Search Filters */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FilterInput label="Shift Date" type="date" value={date} onChange={(e: any) => setDate(e.target.value)} />
                    <div className="flex flex-col space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Shift Timing</label>
                        <select className="bg-gray-50 border-none ring-1 ring-gray-200 p-2.5 rounded-xl outline-none" value={shift} onChange={(e) => setShift(e.target.value)}>
                            <option>Morning</option>
                            <option>Afternoon</option>
                            <option>Night</option>
                        </select>
                    </div>
                    <FilterInput label="Post Code" placeholder="e.g. TPJ" value={post} onChange={(e: any) => setPost(e.target.value)} />
                    <button onClick={fetchReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                        {loading ? "Fetching..." : "Search Report"}
                    </button>
                </div>

                {data && (
                    <div className="animate-in fade-in duration-500 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 uppercase italic">
                                {data.post} Shift Report | {data.shiftDate}
                            </h2>
                            <button onClick={() => generateShiftPDF(data)} className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all flex items-center gap-2">
                                📥 Download PDF
                            </button>
                        </div>

                        {/* ROW 1: BRIEFING & INSTRUCTIONS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Section title="Commanders Briefing" icon="📢">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                                    <p className="text-blue-900 leading-relaxed italic text-sm">
                                        "{data.briefingDocument?.briefingScript || "No script available."}"
                                    </p>
                                </div>
                            </Section>

                            <Section title="Duty Instructions" icon="📜">
                                <div className="grid gap-2">
                                    {data.instructions?.map((i: any) => (
                                        <div key={i._id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                            <h4 className="font-bold text-gray-800 text-xs uppercase text-blue-600">{i.title}</h4>
                                            <p className="text-gray-600 text-xs mt-1">{i.instruction}</p>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>

                        {/* ROW 2: CRIME INTELLIGENCE & TRAINS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Crime Intelligence */}
                            <div className="lg:col-span-2">
                                <Section title="Crime Intelligence (Risk Analysis)" icon="🚨">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {data.crimeIntel?.map((c: any) => (
                                            <div key={c._id} className={`p-4 rounded-2xl border ${c.riskLevel === 'HIGH' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-gray-800">Train {c.trainNumber}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.riskLevel === 'HIGH' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                                                        {c.riskLevel} RISK
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-500 uppercase">Primary Action:</p>
                                                <p className="text-[11px] text-gray-700">{c.primaryDutyAction}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            </div>

                            {/* Train Schedule */}
                            <Section title="Shift Train Schedule" icon="🚆">
                                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {data.trains?.map((t: any) => (
                                        <div key={t._id} className="flex justify-between p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                                            <div className="text-[11px]">
                                                <p className="font-bold text-gray-800">{t.trainNumber}</p>
                                                <p className="text-gray-400">{t.trainName}</p>
                                            </div>
                                            <span className="text-blue-600 font-bold text-xs">{t.arrivalTime}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>

                        {/* ROW 3: DEBRIEFS & PERSONNEL */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Section title="Post-Shift Debriefs" icon="📝">
                                    {data.debriefs?.map((d: any) => (
                                        <div key={d._id} className="p-4 bg-green-50 rounded-2xl border border-green-100 mb-2">
                                            <p className="text-xs font-bold text-green-700 uppercase">Summary</p>
                                            <p className="text-sm text-gray-800 italic mt-1">"{d.summary}"</p>
                                            <div className="grid grid-cols-2 gap-4 mt-3 text-[10px] text-gray-500 uppercase font-bold">
                                                <div>Observations: <span className="text-gray-700 block normal-case font-normal">{d.observations}</span></div>
                                                <div>Improvements: <span className="text-gray-700 block normal-case font-normal">{d.improvements}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </Section>
                            </div>

                            <Section title="Personnel" icon="👮">
                                <div className="space-y-2">
                                    {data.officers?.map((o: any) => (
                                        <div key={o._id} className="bg-white border border-gray-200 p-2 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">{o.name.charAt(0)}</div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{o.name}</p>
                                                <p className="text-[10px] text-gray-400">{o.rank} | {o.forceNumber}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Reuse your components below
function Section({ title, icon, children }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-sm font-black text-gray-400 uppercase mb-4 flex items-center gap-2 italic">
                <span className="bg-gray-100 p-2 rounded-lg text-sm">{icon}</span> {title}
            </h2>
            {children}
        </div>
    );
}

function FilterInput({ label, ...props }: any) {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">{label}</label>
            <input {...props} className="bg-gray-50 border-none ring-1 ring-gray-200 p-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
        </div>
    );
}