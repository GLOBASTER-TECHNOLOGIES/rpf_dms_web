"use client";

import { useState, useMemo } from "react";
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

const MOCK: Instruction[] = [
    {
        _id: "1",
        title: "Festival Crowd Protocol",
        instruction:
            "During Srirangam festival period, ensure all platforms are monitored continuously. Deploy additional staff at entry gates and coordinate with Station Master for crowd control.",
        shift: "all",
        validFrom: "2024-01-10",
        validTo: "2024-01-20",
        createdBy: "Admin",
        createdAt: "2024-01-08",
        active: true, // Fixed: Added missing active property
    },
    {
        _id: "2",
        title: "Morning Baggage Check",
        instruction:
            "Conduct random baggage checks at Platform 1 and 2 during peak morning hours between 05:00 and 09:00.",
        shift: "morning",
        validFrom: "2024-01-01",
        validTo: "2024-03-31",
        createdBy: "Admin",
        createdAt: "2024-01-01",
        active: true, // Fixed: Added missing active property
    },
];

const EMPTY_FORM = {
    title: "",
    instruction: "",
    shift: "all" as Instruction["shift"],
    validFrom: "",
    validTo: "",
    active: true, // Fixed: Added missing active property
};

export default function InstructionsPage() {
    const [instructions, setInstructions] = useState<Instruction[]>(MOCK);
    const [search, setSearch] = useState("");
    const [shiftFilter, setShiftFilter] = useState("all_shifts");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

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

    function handleSave() {
        if (editingId) {
            setInstructions((prev) =>
                prev.map((i) => (i._id === editingId ? { ...i, ...form } : i))
            );
        } else {
            setInstructions((prev) => [
                {
                    ...form,
                    _id: String(Date.now()),
                    createdBy: "Admin",
                    createdAt: new Date().toISOString(),
                },
                ...prev,
            ]);
        }

        setModalOpen(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            {/* Central Wrapper for Max Width and Vertical Rhythm */}
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-slate-900 rounded-2xl px-6 py-8 sm:px-8 shadow-xl">
                    <Link href="/admin">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-all">
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
                                    className="object-contain"
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    Instructions
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    Manage shift instructions and standing orders
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg border border-slate-700 text-sm font-bold hover:bg-slate-700 transition-all shadow-sm">
                                <Download size={16} /> Export
                            </button>

                            <button
                                onClick={openCreate}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-all shadow-sm"
                            >
                                <Plus size={16} /> New Instruction
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
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
                            // Fixed: Added text-slate-900
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <select
                        value={shiftFilter}
                        onChange={(e) => setShiftFilter(e.target.value)}
                        // Fixed: Added text-slate-900
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer transition-all"
                    >
                        <option value="all_shifts">All Shifts</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                    </select>
                </div>

                {/* Content Section */}
                <div className="bg-transparent md:bg-white md:border md:border-slate-200 md:rounded-xl md:shadow-sm overflow-hidden flex flex-col">
                    {/* Grid Header */}
                    <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50">
                        <div className="col-span-6">Title / Instruction</div>
                        <div className="col-span-2">Shift</div>
                        <div className="col-span-2">Validity</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-4 md:gap-0">
                        {filtered.map((item) => (
                            <InstructionCard
                                key={item._id}
                                instruction={item}
                                onEdit={openEdit}
                                onDelete={(id) =>
                                    setInstructions((prev) => prev.filter((i) => i._id !== id))
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl transform transition-all">
                        <h2 className="text-xl font-bold mb-6 text-slate-900">
                            {editingId ? "Edit Instruction" : "New Instruction"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                                <input
                                    // Fixed: Added text-slate-900
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Instruction Title"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({ ...form, title: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Details</label>
                                <textarea
                                    // Fixed: Added text-slate-900
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Instruction Details"
                                    rows={4}
                                    value={form.instruction}
                                    onChange={(e) =>
                                        setForm({ ...form, instruction: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shift</label>
                                <select
                                    // Fixed: Added text-slate-900
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    value={form.shift}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            shift: e.target.value as Instruction["shift"],
                                        })
                                    }
                                >
                                    <option value="all">All Shifts</option>
                                    <option value="morning">Morning</option>
                                    <option value="evening">Evening</option>
                                    <option value="night">Night</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Valid From
                                    </label>
                                    <input
                                        type="date"
                                        // Fixed: Added text-slate-900
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={form.validFrom}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                validFrom: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Valid To
                                    </label>
                                    <input
                                        type="date"
                                        // Fixed: Added text-slate-900
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        value={form.validTo}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                validTo: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-all shadow-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold transition-all shadow-sm"
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