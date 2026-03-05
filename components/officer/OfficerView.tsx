"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  ArrowLeft,
  Loader2,
  Shield,
  Trash2,
  AlertCircle,
  FileDown,
  Edit,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateOfficer from "./CreateOfficer";
import EditOfficerModal from "./Editofficer";

interface Officer {
  _id: string;
  name: string;
  badgeNumber?: string;
  rank?: "DSC" | "ASC" | "IPF" | "SI" | "ASI" | "HC" | "CONSTABLE";
  role: "ADMIN" | "SO" | "STAFF";
  stationId?: string;
  postId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  SO:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  STAFF: "bg-slate-100 text-slate-600 border-slate-200",
};

const exportOfficers = (officers: Officer[]) => {
  const headers = ["Name", "Badge Number", "Rank", "Role", "Status"];
  const rows = officers.map((o) => [
    o.name,
    o.badgeNumber || "N/A",
    o.rank || "N/A",
    o.role,
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

const OfficersView = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  const fetchOfficers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/officer/get", {
        headers: { "Cache-Control": "no-cache" },
      });
      setOfficers(res.data.officers ?? res.data ?? []);
    } catch (err) {
      console.error("Error fetching officers:", err);
      setError("Failed to load officers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (officer: Officer) => {
    setSelectedOfficer(officer);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => fetchOfficers();

  const executeDelete = async (id: string) => {
    const toastId = toast.loading("Deleting officer...");
    try {
      await axios.delete(`/api/officer/delete?id=${id}`);
      toast.success("Officer deleted successfully", { id: toastId });
      fetchOfficers();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete officer", { id: toastId });
    }
  };

  const handleDelete = (id: string) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-full">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Confirm Deletion</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete this officer?
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-600 text-sm font-medium hover:bg-slate-100 px-3 py-1.5 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); executeDelete(id); }}
              className="bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-red-700 transition shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  useEffect(() => {
    if (!showCreateForm) fetchOfficers();
  }, [showCreateForm]);

  if (showCreateForm) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowCreateForm(false)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium"
        >
          <ArrowLeft size={20} /> Back to Officer List
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
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" /> Police Officers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage RPF personnel accounts and access.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => officers.length > 0 && exportOfficers(officers)}
            disabled={officers.length === 0}
            className="flex-1 sm:flex-none justify-center bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold text-sm disabled:opacity-50"
          >
            <FileDown size={17} /> Export List
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold text-sm shadow-md shadow-blue-200"
          >
            <UserPlus size={17} /> Create New Officer
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
          <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
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
                  <th className="px-7 py-4 text-sm font-semibold text-slate-500 w-[28%]">Officer Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500">Rank</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500">Badge Number</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr
                    key={officer._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Officer Details */}
                    <td className="px-7 py-4">
                      <div className="font-semibold text-slate-800 text-[15px]">{officer.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        ID: {officer._id.slice(-8).toUpperCase()}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest border ${
                          ROLE_COLORS[officer.role] ?? "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {officer.role}
                      </span>
                    </td>

                    {/* Rank */}
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {officer.rank
                        ? officer.rank.charAt(0).toUpperCase() +
                          officer.rank.slice(1).toLowerCase()
                        : <span className="text-slate-300">—</span>
                      }
                    </td>

                    {/* Badge Number */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-mono">
                        <Hash size={13} className="text-slate-300" />
                        {officer.badgeNumber || <span className="text-slate-300">N/A</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            officer.active ? "bg-green-500" : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            officer.active
                              ? "text-green-700 font-medium"
                              : "text-slate-400"
                          }`}
                        >
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
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(officer._id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Officer"
                        >
                          <Trash2 size={17} />
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
              <div
                key={officer._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">
                      {officer.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 font-mono">
                      <Hash size={11} />
                      {officer.badgeNumber || "No badge"}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border flex-shrink-0 ${
                      ROLE_COLORS[officer.role] ?? "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {officer.role}
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Rank
                    </span>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {officer.rank || "—"}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          officer.active ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          officer.active ? "text-green-700" : "text-slate-400"
                        }`}
                      >
                        {officer.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleEditClick(officer)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition border border-slate-100"
                  >
                    <Edit size={15} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(officer._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition border border-red-100"
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
    </div>
  );
};

export default OfficersView;