"use client";

import { useState } from "react";
import { Pencil, Trash2, CalendarDays } from "lucide-react";

export interface Instruction {
  _id: string;
  title: string;
  instruction: string;
  shift: "morning" | "evening" | "night" | "all";
  validFrom: string;
  validTo: string;
  createdBy: string;
  active: boolean;
  createdAt?: string;
}

interface InstructionCardProps {
  instruction: Instruction;
  onEdit: (instruction: Instruction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
}

const SHIFT_STYLES: Record<string, string> = {
  morning: "bg-amber-50 text-amber-700 border-amber-200",
  evening: "bg-orange-50 text-orange-700 border-orange-200",
  night: "bg-indigo-50 text-indigo-700 border-indigo-200",
  all: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InstructionCard({
  instruction,
  onEdit,
  onDelete,
  onToggleActive,
}: InstructionCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group relative">
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {/* Top Row: Shift Badge & Active Toggle */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wider ${
              SHIFT_STYLES[instruction.shift]
            }`}
          >
            {instruction.shift} Shift
          </span>

          <button
            onClick={() => onToggleActive(instruction._id, instruction.active)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
              instruction.active
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                instruction.active ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {instruction.active ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Title & Body */}
        <div className="mb-6 flex-1">
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2">
            {instruction.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
            {instruction.instruction}
          </p>
        </div>

        {/* Metadata: Dates Box (UPDATED) */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-6 sm:gap-8 mt-auto">
          {/* Valid From */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
              <CalendarDays size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Valid From
              </p>
              <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                {formatDate(instruction.validFrom)}
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

          {/* Expires On */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Expires On
            </p>
            <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
              {formatDate(instruction.validTo)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          ID: {instruction._id.slice(-6)}
        </span>

        <div className="flex items-center gap-2">
          {!confirmDelete ? (
            <>
              <button
                onClick={() => onEdit(instruction)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold text-sm"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Are you sure?
              </span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(instruction._id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Yes, delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}