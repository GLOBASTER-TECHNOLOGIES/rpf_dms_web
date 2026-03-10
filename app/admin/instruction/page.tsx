"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
    Search,
    Plus,
    Download,
    ChevronLeft,
} from "lucide-react";
import InstructionCard, {
    Instruction,
} from "@/components/instruction/Instructioncard";
import Link from "next/link";

const EMPTY_FORM = {
    title: "",
    instruction: "",
    shift: "all" as Instruction["shift"],
    validFrom: "",
    validTo: "",
    active: true,
};

export default function InstructionsPage() {
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [search, setSearch] = useState("");
    const [shiftFilter, setShiftFilter] = useState("all_shifts");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

    /* ---------------- FETCH INSTRUCTIONS ---------------- */

    async function fetchInstructions() {
        try {
            const res = await fetch("/api/instruction/get");
            const data = await res.json();

            if (data.success) {
                setInstructions(data.data);
            }
        } catch (err) {
            console.error("Failed to load instructions", err);
        }
    }

    useEffect(() => {
        fetchInstructions();
    }, []);

    /* ---------------- FILTER ---------------- */

    const filtered = useMemo(() => {
        return instructions.filter((i) => {
            const matchSearch =
                !search ||
                i.title.toLowerCase().includes(search.toLowerCase()) ||
                i.instruction.toLowerCase().includes(search.toLowerCase());

            const matchShift =
                shiftFilter === "all_shifts" || i.shift === shiftFilter;

            return matchSearch && matchShift;
        });
    }, [instructions, search, shiftFilter]);

    /* ---------------- OPEN MODALS ---------------- */

    function openCreate() {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setModalOpen(true);
    }

    function openEdit(instruction: Instruction) {
        setForm({
            ...instruction,
            validFrom: instruction.validFrom.slice(0, 10),
            validTo: instruction.validTo.slice(0, 10),
        });

        setEditingId(instruction._id);
        setModalOpen(true);
    }

    /* ---------------- SAVE ---------------- */

    async function handleSave() {
        try {
            if (editingId) {
                await fetch("/api/instruction/update", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        _id: editingId,
                        ...form,
                    }),
                });
            } else {
                await fetch("/api/instruction/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                });
            }

            setModalOpen(false);
            fetchInstructions();
        } catch (error) {
            console.error("Save failed", error);
        }
    }

    /* ---------------- DELETE ---------------- */

    async function handleDelete(id: string) {
        try {
            await fetch(`/api/instruction/delete?id=${id}`, {
                method: "DELETE",
            });

            fetchInstructions();
        } catch (error) {
            console.error("Delete failed", error);
        }
    }

    /* ---------------- TOGGLE ACTIVE ---------------- */

    async function toggleActive(id: string, current: boolean) {
        try {
            await fetch("/api/instruction/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    _id: id,
                    active: !current,
                }),
            });

            fetchInstructions();
        } catch (error) {
            console.error("Toggle failed", error);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER */}
                <div className="bg-slate-900 rounded-2xl px-6 py-8 sm:px-8 shadow-xl">
                    <Link href="/admin">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-6">
                            <ChevronLeft size={14} /> Back to Admin
                        </button>
                    </Link>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                                <Image
                                    src="/rpf_logo.png"
                                    alt="RPF"
                                    width={48}
                                    height={48}
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Instructions
                                </h1>
                                <p className="text-slate-400 text-sm">
                                    Manage shift instructions and standing orders
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold"
                        >
                            <Plus size={16} /> New Instruction
                        </button>
                    </div>
                </div>

                {/* FILTER */}
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">

                    <div className="flex-1 min-w-[280px] relative">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search instructions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                        />
                    </div>

                    <select
                        value={shiftFilter}
                        onChange={(e) => setShiftFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                    >
                        <option value="all_shifts">All Shifts</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                    </select>
                </div>

                {/* LIST */}
                <div className="flex flex-col gap-4">
                    {filtered.map((item) => (
                        <InstructionCard
                            key={item._id}
                            instruction={item}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onToggleActive={toggleActive}
                        />
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">

                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            {editingId ? "Edit Instruction" : "New Instruction"}
                        </h2>

                        <div className="space-y-5">

                            {/* TITLE */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Title
                                </label>

                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="Instruction title"
                                />
                            </div>

                            {/* INSTRUCTION */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Instruction
                                </label>

                                <textarea
                                    rows={4}
                                    value={form.instruction}
                                    onChange={(e) =>
                                        setForm({ ...form, instruction: e.target.value })
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="Write instruction details..."
                                />
                            </div>

                            {/* DATES */}
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Valid From
                                    </label>

                                    <input
                                        type="date"
                                        value={form.validFrom}
                                        onChange={(e) =>
                                            setForm({ ...form, validFrom: e.target.value })
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Valid To
                                    </label>

                                    <input
                                        type="date"
                                        value={form.validTo}
                                        onChange={(e) =>
                                            setForm({ ...form, validTo: e.target.value })
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>

                            </div>

                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3 mt-8">

                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 border border-slate-300 py-2.5 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition"
                            >
                                Save Instruction
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}