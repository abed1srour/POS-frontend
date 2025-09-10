"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../components/ConfirmDialog";

/**
 * Suppliers management page for the POS app
 * - List all suppliers
 * - Add new suppliers
 * - Edit existing suppliers
 * - Soft delete suppliers (move to recycle bin)
 * - Restore suppliers from recycle bin
 * - Permanently delete suppliers
 * - Search and filter suppliers
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  RecycleBin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  ),
  Restore: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 21h14" />
    </svg>
  ),
  Truck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="7" cy="20" r="2" />
      <circle cx="20" cy="20" r="2" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Building: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9h.01" />
      <path d="M9 13h.01" />
      <path d="M9 17h.01" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Minimal modal component
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-gray-200/60 bg-white/90 p-5 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
        {children}
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const router = useRouter();
  
  // Query state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  // Data state
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modal state
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [restoring, setRestoring] = useState(null);
  const [permanentDeleting, setPermanentDeleting] = useState(null);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchList() {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      if (q.trim()) params.set("q", q.trim());
      if (sort) params.set("sort", sort);
      if (order) params.set("order", order);
      if (showRecycleBin) params.set("includeDeleted", "true");

      const endpoint = showRecycleBin ? "/api/suppliers/deleted/list" : "/api/suppliers";
      const res = await fetch(api(`${endpoint}?${params.toString()}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setRows(data.data || data || []);
      setTotal(data.pagination?.total ?? (data.data ? data.data.length : 0));
    } catch (e) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    setPage(1); // Reset to first page when switching views
    fetchList(); 
  }, [q, sort, order, limit, showRecycleBin]);

  useEffect(() => { fetchList(); }, [page]);

  function toggleSort(col) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("asc"); }
  }

  function exportCSV() {
    const header = ["ID","Company Name","Contact Person","Phone","Address","Created At"];
    const lines = rows.map(r => [
      r.id, 
      r.company_name, 
      r.contact_person, 
      r.phone,
      r.address,
      r.created_at
    ].map(v => (v ?? "")).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `suppliers_${showRecycleBin ? 'deleted' : 'active'}_page_${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveSupplier(input, isEdit) {
    const method = isEdit ? "PUT" : "POST";
    const path = isEdit ? `/api/suppliers/${input.id}` : "/api/suppliers";
    const res = await fetch(api(path), {
      method,
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
  }

  async function deleteSupplier(p) {
    const res = await fetch(api(`/api/suppliers/${p.id}`), { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  }

  async function restoreSupplier(p) {
    const res = await fetch(api(`/api/suppliers/${p.id}/restore`), { method: "POST", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Restore failed (${res.status})`);
  }

  async function permanentDeleteSupplier(p) {
    const res = await fetch(api(`/api/suppliers/${p.id}/permanent`), { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Permanent delete failed (${res.status})`);
  }

  // Form state for create/edit
  function SupplierForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState({
      id: initial?.id,
      company_name: initial?.company_name || "",
      contact_person: initial?.contact_person || "",
      phone: initial?.phone || "",
      address: initial?.address || "",
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(e) {
      e.preventDefault();
      setBusy(true); setError(null);
      try {
        await saveSupplier(form, Boolean(initial?.id));
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally { setBusy(false); }
    }

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">{initial?.id ? "Edit supplier" : "Add supplier"}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Company Name</label>
            <input 
              value={form.company_name} 
              onChange={(e)=>setForm({...form, company_name: e.target.value})} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Contact Person</label>
            <input 
              value={form.contact_person} 
              onChange={(e)=>setForm({...form, contact_person: e.target.value})} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Phone</label>
            <input 
              value={form.phone} 
              onChange={(e)=>setForm({...form, phone: e.target.value})} 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Address</label>
            <textarea 
              value={form.address || ""} 
              onChange={(e)=>setForm({...form, address: e.target.value})} 
              rows={3} 
              className="w-full resize-none rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white">Cancel</button>
          <button disabled={busy} className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60">{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    );
  }

  return (
    <Layout title="Suppliers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Suppliers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your supplier database</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side - Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Items per page */}
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value={5} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">5 / page</option>
              <option value={10} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">10 / page</option>
              <option value={25} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">25 / page</option>
              <option value={50} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">50 / page</option>
            </select>

            {/* Add Supplier Button */}
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <Icon.Plus className="h-4 w-4" />
              Add supplier
            </button>

            {/* Export CSV Button */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon.Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Right side - Search and Recycle Bin */}
          <div className="flex items-center gap-3">
            {/* Recycle Bin Button */}
            <button
              onClick={() => setShowRecycleBin(!showRecycleBin)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon.RecycleBin className="h-4 w-4" />
              Recycle Bin
            </button>

            <div className="relative">
              <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto table-container">
            <table className="w-full min-w-full text-left text-sm table-full-width table-optimized">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                                     {[
                     { key: "id", label: "ID", w: "w-16", align: "text-center" },
                     { key: "company_name", label: "Company Name", w: "w-48", align: "text-center" },
                     { key: "contact_person", label: "Contact Person", w: "w-40", align: "text-center" },
                     { key: "phone", label: "Phone", w: "w-32", align: "text-center" },
                     { key: "address", label: "Address", w: "w-64", align: "text-center" },
                     ...(showRecycleBin ? [{ key: "deleted_at", label: "Deleted At", w: "w-28", align: "text-center" }] : []),
                     { key: "_", label: "Actions", w: "w-40", align: "text-center" },
                   ].map((c) => (
                    <th key={c.key} className={cn("px-4 py-3 font-bold whitespace-nowrap", c.w, c.align)}>
                      {c.key !== "_" ? (
                        <button onClick={() => toggleSort(c.key)} className="flex items-center justify-center gap-1 hover:underline w-full">
                          {c.label}
                          {sort === c.key && (
                            <span className="text-[10px]">{order === "asc" ? "▲" : "▼"}</span>
                          )}
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={showRecycleBin ? 7 : 6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                )}
                {!loading && rows.length === 0 && null}
                {!loading && rows.map((r) => (
                  <tr key={String(r.id)} className="border-t border-gray-200/60 dark:border-white/10">
                    <td className="px-4 py-3 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{r.id}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={r.company_name}>{r.company_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{r.contact_person}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Icon.Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{r.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                        <Icon.MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{r.address || "—"}</span>
                      </div>
                    </td>
                    {showRecycleBin && (
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {r.deleted_at ? new Date(r.deleted_at).toLocaleDateString() : "—"}
                        </span>
                      </td>
                    )}
                                         <td className="px-4 py-3 text-center">
                       <div className="flex items-center justify-center gap-1">
                         {!showRecycleBin ? (
                           <>
                             <button 
                               onClick={() => router.push(`/suppliers/${r.id}`)} 
                               className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                               title="View supplier details"
                             >
                               <Icon.Eye className="h-3.5 w-3.5" />
                             </button>
                             <button 
                               onClick={() => router.push(`/suppliers/${r.id}/purchase`)} 
                               className="rounded-lg p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-200"
                               title="Purchase from supplier"
                             >
                               <Icon.Truck className="h-3.5 w-3.5" />
                             </button>
                             <button 
                               onClick={() => setEditing(r)} 
                               className="rounded-lg p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                               title="Edit supplier"
                             >
                               <Icon.Edit className="h-3.5 w-3.5" />
                             </button>
                             <button 
                               onClick={() => setDeleting(r)} 
                               className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                               title="Move to recycle bin"
                             >
                               <Icon.Trash className="h-3.5 w-3.5" />
                             </button>
                           </>
                         ) : (
                           <>
                             <button 
                               onClick={() => setRestoring(r)} 
                               className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                               title="Restore supplier"
                             >
                               <Icon.Restore className="h-3.5 w-3.5" />
                             </button>
                             <button 
                               onClick={() => setPermanentDeleting(r)} 
                               className="rounded-lg border border-rose-200 p-1.5 hover:bg-rose-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10"
                               title="Permanently delete"
                             >
                               <Icon.Trash className="h-3.5 w-3.5 text-rose-500" />
                             </button>
                           </>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && rows.length === 0 && (
            <div className="text-center py-12">
              <Icon.Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No suppliers found</p>
            </div>
          )}

          {/* Footer row: error + pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200/60 bg-white/60 p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="min-h-[20px] text-rose-500">{err}</div>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-xl border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10 dark:text-white">Prev</button>
              <span className="tabular-nums text-gray-600 dark:text-gray-300">Page {page} / {pages}</span>
              <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-xl border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10 dark:text-white">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={creating} onClose={()=>setCreating(false)}>
        <SupplierForm
          onCancel={()=>setCreating(false)}
          onSaved={async()=>{ setCreating(false); await fetchList(); }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={()=>setEditing(null)}>
        {editing && (
          <SupplierForm
            initial={editing}
            onCancel={()=>setEditing(null)}
            onSaved={async()=>{ setEditing(null); await fetchList(); }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Move to Recycle Bin"
        description={deleting ? `Move ${deleting.company_name} to recycle bin? You can restore it later.` : ''}
        confirmLabel="Move to Recycle Bin"
        destructive={false}
        onConfirm={async()=>{ if (!deleting) return; const s = deleting; setDeleting(null); await deleteSupplier(s); await fetchList(); }}
        onClose={()=>setDeleting(null)}
      />

      <ConfirmDialog
        open={Boolean(restoring)}
        title="Restore Supplier"
        description={restoring ? `Restore ${restoring.company_name} back to the active list?` : ''}
        confirmLabel="Restore"
        destructive={false}
        onConfirm={async()=>{ if (!restoring) return; const s = restoring; setRestoring(null); await restoreSupplier(s); await fetchList(); }}
        onClose={()=>setRestoring(null)}
      />

      <ConfirmDialog
        open={Boolean(permanentDeleting)}
        title="Permanently Delete"
        description={permanentDeleting ? `Permanently delete ${permanentDeleting.company_name}? This cannot be undone.` : ''}
        confirmLabel="Permanently Delete"
        destructive
        onConfirm={async()=>{ if (!permanentDeleting) return; const s = permanentDeleting; setPermanentDeleting(null); await permanentDeleteSupplier(s); await fetchList(); }}
        onClose={()=>setPermanentDeleting(null)}
      />
    </Layout>
  );
}
