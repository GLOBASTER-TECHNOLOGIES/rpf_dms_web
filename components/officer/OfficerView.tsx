"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  ArrowLeft,
  Loader2,
  Shield,
  Trash2,
  FileDown,
  Edit,
  Hash,
  X,
  AlertTriangle,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateOfficer from "./CreateOfficer";
import EditOfficerModal from "./Editofficer";

interface Officer {
  _id: string;
  name: string;
  forceNumber?: string;
  rank?: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  postId?: string;
  division?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  SO: "bg-indigo-50 text-indigo-700 border-indigo-200",
  STAFF: "bg-slate-100 text-slate-600 border-slate-200",
};

const RANK_COLORS: Record<string, string> = {
  DSC: "text-red-600 bg-red-50",
  ASC: "text-orange-600 bg-orange-50",
  IPF: "text-yellow-700 bg-yellow-50",
  SI: "text-green-700 bg-green-50",
  ASI: "text-teal-700 bg-teal-50",
  HC: "text-cyan-700 bg-cyan-50",
  CONSTABLE: "text-slate-600 bg-slate-100",
};

const exportOfficers = (officers: Officer[]) => {
  const headers = ["Name", "Force Number", "Rank", "Role", "Division", "Status"];
  const rows = officers.map((o) => [
    o.name,
    o.forceNumber || "N/A",
    o.rank || "N/A",
    o.role,
    o.division || "N/A",
    o.active ? "Active" : "Inactive",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "officers.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────
const DeleteConfirmModal = ({
  officer,
  onConfirm,
  onCancel,
  loading,
}: {
  officer: Officer;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={17} className="text-red-500" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Delete Officer</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <X size={16} />
        </button>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-900">{officer.name}</span>?
        </p>
        <p className="text-xs text-slate-400 mt-1.5">
          This action is permanent and cannot be undone.
        </p>
      </div>
      <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition bg-white disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const OfficersView = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Officer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOfficers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/officer/get", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = res.data;
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : Array.isArray(data?.officers) ? data.officers
        : [];
      setOfficers(list);
    } catch (err) {
      console.error("Error fetching officers:", err);
      setError("Failed to load officers. Please try again.");
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (officer: Officer) => {
    setSelectedOfficer(officer);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => fetchOfficers();

  // DELETE — query param as the API expects
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/officer/delete?id=${deleteTarget._id}`);
      toast.success(`${deleteTarget.name} deleted successfully`);
      setDeleteTarget(null);
      fetchOfficers();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete officer");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!showCreateForm) fetchOfficers();
  }, [showCreateForm]);

  if (showCreateForm) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium text-sm"
        >
          <ArrowLeft size={18} /> Back to Officer List
        </button>
        <CreateOfficer onSuccess={() => setShowCreateForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" /> Police Officers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage RPF personnel accounts and access.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => officers.length > 0 && exportOfficers(officers)}
            disabled={officers.length === 0}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold text-sm disabled:opacity-50"
          >
            <FileDown size={16} /> Export
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold text-sm shadow-md shadow-blue-200"
          >
            <UserPlus size={16} /> New Officer
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="animate-spin text-blue-600 mb-3" size={28} />
          <p className="text-slate-500 text-sm">Loading Officers...</p>
        </div>
      ) : officers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
          No officers found in database.
        </div>
      ) : (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Officer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Force No.</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Division</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">

                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{officer.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {officer._id.slice(-8).toUpperCase()}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest border ${ROLE_COLORS[officer.role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {officer.role}
                      </span>
                    </td>

                    {/* Rank */}
                    <td className="px-6 py-4">
                      {officer.rank ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${RANK_COLORS[officer.rank] ?? "text-slate-600 bg-slate-100"}`}>
                          {officer.rank}
                        </span>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>

                    {/* Force Number */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-mono">
                        <Hash size={12} className="text-slate-300" />
                        {officer.forceNumber ?? <span className="text-slate-300">N/A</span>}
                      </div>
                    </td>

                    {/* Division */}
                    <td className="px-6 py-4">
                      {officer.division ? (
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Layers size={12} className="text-slate-400" />
                          {officer.division}
                        </div>
                      ) : <span className="text-slate-300 text-sm">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${officer.active ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className={`text-sm ${officer.active ? "text-green-700 font-medium" : "text-slate-400"}`}>
                          {officer.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(officer)}
                          className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Officer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(officer)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Officer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {officers.map((officer) => (
              <div key={officer._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Card Top — colored by role */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{officer.name}</h3>
                      <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 font-mono">
                        <Hash size={11} />
                        {officer.forceNumber ?? "No force number"}
                      </div>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border flex-shrink-0 ${ROLE_COLORS[officer.role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {officer.role}
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank</p>
                      {officer.rank ? (
                        <span className={`mt-1 inline-flex text-xs font-bold px-2 py-0.5 rounded-lg ${RANK_COLORS[officer.rank] ?? "text-slate-600 bg-slate-100"}`}>
                          {officer.rank}
                        </span>
                      ) : <p className="text-sm text-slate-300 mt-1">—</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Division</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">{officer.division ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${officer.active ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className={`text-sm font-medium ${officer.active ? "text-green-700" : "text-slate-400"}`}>
                          {officer.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex border-t border-slate-100">
                  <button
                    onClick={() => handleEditClick(officer)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition border-r border-slate-100"
                  >
                    <Edit size={15} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(officer)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* ── EDIT MODAL ── */}
      <EditOfficerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        officer={selectedOfficer}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          officer={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default OfficersView;