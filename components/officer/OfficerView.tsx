"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ArrowLeft,
  Loader2,
  Trash2,
  FileDown,
  Edit,
  Hash,
  X,
  AlertTriangle,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
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
  postCode?: string;
  division?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLE_STYLE: Record<string, { pill: string; avatar: string; bar: string }> = {
  ADMIN: { pill: "bg-blue-50 text-blue-700 border border-blue-200", avatar: "bg-blue-600", bar: "bg-blue-600" },
  SO:    { pill: "bg-indigo-50 text-indigo-700 border border-indigo-200", avatar: "bg-indigo-600", bar: "bg-indigo-500" },
  STAFF: { pill: "bg-slate-100 text-slate-600 border border-slate-200", avatar: "bg-slate-600", bar: "bg-slate-400" },
};

const RANK_STYLE: Record<string, string> = {
  DSC:       "text-red-700 bg-red-50 border-red-200",
  ASC:       "text-orange-700 bg-orange-50 border-orange-200",
  IPF:       "text-amber-700 bg-amber-50 border-amber-200",
  SI:        "text-green-700 bg-green-50 border-green-200",
  ASI:       "text-teal-700 bg-teal-50 border-teal-200",
  HC:        "text-cyan-700 bg-cyan-50 border-cyan-200",
  CONSTABLE: "text-slate-600 bg-slate-100 border-slate-200",
};

const RANKS = ["DSC", "ASC", "IPF", "SI", "ASI", "HC", "CONSTABLE"] as const;
const ROLES = ["ADMIN", "SO", "STAFF"] as const;

const Avatar = ({ name, role }: { name: string; role: string }) => {
  const style = ROLE_STYLE[role] ?? ROLE_STYLE.STAFF;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`w-11 h-11 rounded-xl ${style.avatar} flex items-center justify-center flex-shrink-0`}>
      <span className="text-sm font-bold text-white">{initials}</span>
    </div>
  );
};

const DeleteConfirmModal = ({ officer, onConfirm, onCancel, loading }: {
  officer: Officer; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Delete Officer</h2>
        </div>
        <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><X size={16} /></button>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-slate-900">{officer.name}</span>?
        </p>
        <p className="text-xs text-slate-400 mt-2">This action is permanent and cannot be undone.</p>
      </div>
      <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button onClick={onCancel} disabled={loading} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

const OfficerCard = ({ officer, onEdit, onDelete }: {
  officer: Officer; onEdit: () => void; onDelete: () => void;
}) => {
  const role = ROLE_STYLE[officer.role] ?? ROLE_STYLE.STAFF;
  const rank = officer.rank ? RANK_STYLE[officer.rank] : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      <div className={`h-1 w-full ${role.bar}`} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <Avatar name={officer.name} role={officer.role} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm leading-tight truncate">{officer.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Hash size={10} className="text-slate-300 flex-shrink-0" />
              <span className="text-xs text-slate-400 font-mono truncate">{officer.forceNumber ?? "—"}</span>
            </div>
          </div>
          <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${officer.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400"}`}>
            {officer.active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {officer.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {officer.rank && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${rank ?? "text-slate-600 bg-slate-100 border-slate-200"}`}>
              {officer.rank}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${role.pill}`}>{officer.role}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Post</p>
            <p className="text-xs font-semibold text-slate-700 font-mono">{officer.postCode ?? "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Division</p>
            <div className="flex items-center gap-1">
              {officer.division && <Layers size={9} className="text-slate-400 flex-shrink-0" />}
              <p className="text-xs font-semibold text-slate-700 truncate">{officer.division ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-t border-slate-100">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition border-r border-slate-100">
          <Edit size={13} /> Edit
        </button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder: string;
}) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const OfficersView = () => {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Officer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterRank, setFilterRank] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchOfficers = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get("/api/officer/get", { headers: { "Cache-Control": "no-cache" } });
      const data = res.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.officers) ? data.officers : [];
      setOfficers(list);
    } catch { setError("Failed to load officers. Please try again."); setOfficers([]); }
    finally { setLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/officer/delete?id=${deleteTarget._id}`);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null); fetchOfficers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete officer");
    } finally { setDeleting(false); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return officers.filter((o) => {
      const matchQ = !q || o.name.toLowerCase().includes(q) || (o.forceNumber ?? "").toLowerCase().includes(q) || (o.division ?? "").toLowerCase().includes(q) || (o.postCode ?? "").toLowerCase().includes(q);
      const matchRole   = !filterRole   || o.role === filterRole;
      const matchRank   = !filterRank   || o.rank === filterRank;
      const matchStatus = !filterStatus || (filterStatus === "active" ? o.active : !o.active);
      return matchQ && matchRole && matchRank && matchStatus;
    });
  }, [officers, search, filterRole, filterRank, filterStatus]);

  const activeFilters = [filterRole, filterRank, filterStatus].filter(Boolean).length;
  const clearFilters  = () => { setFilterRole(""); setFilterRank(""); setFilterStatus(""); setSearch(""); };

  const exportCSV = () => {
    const h = ["Name","Force Number","Rank","Role","Division","Post","Status"];
    const r = filtered.map((o) => [o.name, o.forceNumber||"N/A", o.rank||"N/A", o.role, o.division||"N/A", o.postCode||"N/A", o.active?"Active":"Inactive"]);
    const csv = [h,...r].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download="officers.csv"; a.click(); URL.revokeObjectURL(url);
  };

  useEffect(() => { if (!showCreateForm) fetchOfficers(); }, [showCreateForm]);

  if (showCreateForm) {
    return (
      <div className="space-y-4 p-6">
        <button onClick={() => setShowCreateForm(false)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition font-medium text-sm">
          <ArrowLeft size={18} /> Back to Officers
        </button>
        <CreateOfficer onSuccess={() => setShowCreateForm(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between gap-4">

          {/* Back + Logo + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-semibold transition group border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              <LayoutDashboard size={13} />
              Admin
            </button>

            <div className="w-px h-7 bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Image src="/rpf_logo.png" alt="RPF" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">RPF Officers</h1>
                <p className="text-slate-400 text-xs">Manage RPF personnel accounts and access</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} disabled={filtered.length === 0}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-40">
              <FileDown size={14} /> Export
            </button>
            <button onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-100">
              <UserPlus size={14} /> New Officer
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4 max-w-screen-xl mx-auto">

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, force number, division, post..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13} /></button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition shadow-sm ${
              showFilters || activeFilters > 0 ? "bg-blue-600 text-white border-blue-600 shadow-blue-100 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="bg-white text-blue-600 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter By</p>
              {activeFilters > 0 && (
                <button onClick={() => { setFilterRole(""); setFilterRank(""); setFilterStatus(""); }}
                  className="text-xs text-slate-400 hover:text-red-500 font-semibold transition flex items-center gap-1">
                  <X size={11} /> Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FilterSelect label="Role"   value={filterRole}   onChange={setFilterRole}   options={ROLES}                  placeholder="All Roles" />
              <FilterSelect label="Rank"   value={filterRank}   onChange={setFilterRank}   options={RANKS}                  placeholder="All Ranks" />
              <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["active","inactive"]}  placeholder="All Status" />
            </div>
          </div>
        )}

        {/* Result count */}
        {!loading && officers.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-700">{filtered.length}</span> of <span className="font-bold text-slate-700">{officers.length}</span> officers
            </p>
            {(search || activeFilters > 0) && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline font-semibold">Clear all</button>
            )}
          </div>
        )}

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{error}</div>}

        {/* Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="animate-spin text-blue-500 mb-3" size={26} />
            <p className="text-slate-400 text-sm">Loading Officers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-sm">No officers found</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
            {(search || activeFilters > 0) && (
              <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 hover:underline font-semibold">Clear all filters</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((officer) => (
              <OfficerCard
                key={officer._id}
                officer={officer}
                onEdit={() => { setSelectedOfficer(officer); setIsEditModalOpen(true); }}
                onDelete={() => setDeleteTarget(officer)}
              />
            ))}
          </div>
        )}
      </div>

      <EditOfficerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        officer={selectedOfficer}
        onUpdateSuccess={fetchOfficers}
      />
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