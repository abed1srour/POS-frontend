"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/navigation";

/**
 * Professional Customers page for the POS app (matches dashboard theme).
 * - Dark/light toggle (persisted in localStorage)
 * - Auth guard (redirects to /login if no token)
 * - Search, sort, filter, pagination
 * - Add / Edit / Delete customers (modals)
 * - Minimal CSV export of current page
 *
 * API endpoints expected (can be proxied through Next):
 *   GET    /api/customers?limit=&offset=&q=&sort=&order=
 *   POST   /api/customers
 *   PUT    /api/customers/:id
 *   DELETE /api/customers/:id
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""; // empty means use Next proxy
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
  Download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 21h14" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  MapPin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

export default function CustomersPage() {
  const router = useRouter();
  // Query state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Handle URL search query from layout
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlQuery = urlParams.get("q");
      if (urlQuery && urlQuery !== q) {
        setQ(urlQuery);
        setPage(1); // Reset to first page when searching
      }
    }
  }, []);

  // Data state
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modal state
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [deletedCustomers, setDeletedCustomers] = useState([]);
  const [deletedCustomersLoading, setDeletedCustomersLoading] = useState(false);
  const [clearBinConfirm, setClearBinConfirm] = useState(false);

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

      const res = await fetch(api(`/api/customers?${params.toString()}`), {
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

  async function fetchDeletedCustomers() {
    setDeletedCustomersLoading(true);
    try {
      const res = await fetch(api("/api/customers?includeDeleted=true&limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setDeletedCustomers(data.data || data || []);
    } catch (e) {
      console.error("Failed to fetch deleted customers:", e);
    } finally {
      setDeletedCustomersLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, [q, sort, order, page, limit]);

  function toggleSort(col) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("asc"); }
  }

  function handleViewMore(customer) {
    router.push(`/customers/${customer.id}`);
  }

  function exportCSV() {
    const header = ["ID","First Name","Last Name","Address","Phone Number","Join Date","Created At"];
    const lines = rows.map(r => [
      r.id, 
      r.first_name, 
      r.last_name, 
      r.address, 
      r.phone_number, 
      r.join_date,
      r.created_at
    ].map(v => (v ?? "")).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `customers_page_${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveCustomer(input, isEdit) {
    const method = isEdit ? "PUT" : "POST";
    const path = isEdit ? `/api/customers/${input.id}` : "/api/customers";
    const res = await fetch(api(path), {
      method,
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
  }

  async function deleteCustomer(p) {
    const res = await fetch(api(`/api/customers/${p.id}`), { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  }

  async function restoreCustomer(p) {
    const res = await fetch(api(`/api/customers/${p.id}/restore`), { method: "PATCH", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Restore failed (${res.status})`);
  }

  async function clearRecycleBin() {
    const res = await fetch(api(`/api/customers/recycle-bin/clear`), { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Clear bin failed (${res.status})`);
    return res.json();
  }

  // Form state for create/edit
  function CustomerForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState({
      id: initial?.id,
      first_name: initial?.first_name || "",
      last_name: initial?.last_name || "",
      address: initial?.address || "",
      phone_number: initial?.phone_number || "",
      join_date: initial?.join_date || new Date().toISOString().split('T')[0],
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(e) {
      e.preventDefault();
      setBusy(true); setError(null);
      try {
        await saveCustomer(form, Boolean(initial?.id));
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally { setBusy(false); }
    }

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">{initial?.id ? "Edit customer" : "Add customer"}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">First Name</label>
            <input 
              value={form.first_name} 
              onChange={(e)=>setForm({...form, first_name: e.target.value})} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Last Name</label>
            <input 
              value={form.last_name} 
              onChange={(e)=>setForm({...form, last_name: e.target.value})} 
              required 
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
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Phone Number</label>
            <input 
              value={form.phone_number} 
              onChange={(e)=>setForm({...form, phone_number: e.target.value})} 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Join Date</label>
            <input 
              type="date"
              value={form.join_date} 
              onChange={(e)=>setForm({...form, join_date: e.target.value})} 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
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
    <Layout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your customer database</p>
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

            {/* Add Customer Button */}
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <Icon.Plus className="h-4 w-4" />
              Add customer
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
              onClick={() => {
                setRecycleBinOpen(true);
                fetchDeletedCustomers();
              }}
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
                placeholder="Search customers..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto table-container">
            <table className="w-full min-w-full text-left text-sm table-full-width table-optimized">
              <thead className="bg-gray-50/60 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
                <tr>
                  {[
                    { key: "id", label: "ID", w: "w-20" },
                    { key: "first_name", label: "First Name", w: "w-48" },
                    { key: "last_name", label: "Last Name", w: "w-48" },
                    { key: "address", label: "Address", w: "w-80" },
                    { key: "phone_number", label: "Phone Number", w: "w-48" },
                    { key: "_", label: "Actions", w: "w-48" },
                  ].map((c) => (
                    <th key={c.key} className={cn("px-4 py-3 font-medium whitespace-nowrap", c.w)}>
                      {c.key !== "_" ? (
                        <button onClick={() => toggleSort(c.key)} className="flex items-center gap-1 hover:underline">
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
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No customers found</td>
                  </tr>
                )}
                {!loading && rows.map((r) => (
                  <tr key={String(r.id)} className="border-t border-gray-200/60 dark:border-white/10">
                    <td className="px-4 py-3 font-medium">{r.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Icon.User className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{r.first_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{r.last_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 max-w-xs">
                        <Icon.MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 truncate">{r.address || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon.Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{r.phone_number || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setEditing(r)} 
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                          title="Edit customer"
                        >
                          <Icon.Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleting(r)} 
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                          title="Delete customer"
                        >
                          <Icon.Trash className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleViewMore(r)} 
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 transition-colors whitespace-nowrap"
                          title="View more details"
                        >
                          View More
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        <CustomerForm
          onCancel={()=>setCreating(false)}
          onSaved={async()=>{ setCreating(false); await fetchList(); }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={()=>setEditing(null)}>
        {editing && (
          <CustomerForm
            initial={editing}
            onCancel={()=>setEditing(null)}
            onSaved={async()=>{ setEditing(null); await fetchList(); }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleting)} onClose={()=>setDeleting(null)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Delete customer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete <span className="font-medium">{deleting?.first_name} {deleting?.last_name}</span>? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={()=>setDeleting(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white">Cancel</button>
            <button onClick={async()=>{ if (!deleting) return; await deleteCustomer(deleting); setDeleting(null); await fetchList(); }} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Recycle Bin Modal */}
      <Modal open={recycleBinOpen} onClose={() => setRecycleBinOpen(false)}>
        <div className="space-y-4 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Recycle Bin</h3>
            <div className="flex items-center gap-2">
              {deletedCustomers.length > 0 && (
                <button
                  onClick={() => setClearBinConfirm(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors"
                  title="Clear all deleted customers"
                >
                  <Icon.Trash className="h-3 w-3" />
                  Clear Bin
                </button>
              )}
              <button 
                onClick={() => setRecycleBinOpen(false)}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {deletedCustomersLoading ? (
              <div className="text-center py-8 text-gray-500">Loading deleted customers...</div>
            ) : deletedCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No deleted customers found</div>
            ) : (
              <div className="space-y-2">
                {deletedCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200/60 bg-white/50 dark:border-white/10 dark:bg-white/5">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{customer.first_name} {customer.last_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {customer.id} • Deleted: {new Date(customer.deleted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await restoreCustomer(customer);
                          await fetchDeletedCustomers();
                          await fetchList();
                        } catch (error) {
                          console.error("Failed to restore customer:", error);
                        }
                      }}
                      className="ml-3 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
                      title="Restore customer"
                    >
                      <Icon.Restore className="h-3 w-3" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Clear Bin Confirmation Modal */}
      <Modal open={clearBinConfirm} onClose={() => setClearBinConfirm(false)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Clear Recycle Bin</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to permanently delete all {deletedCustomers.length} items in the recycle bin? 
            This action cannot be undone and will permanently remove all deleted customers.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setClearBinConfirm(false)} 
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button 
              onClick={async () => {
                try {
                  await clearRecycleBin();
                  setClearBinConfirm(false);
                  setRecycleBinOpen(false);
                  await fetchDeletedCustomers();
                  await fetchList();
                } catch (error) {
                  console.error("Failed to clear recycle bin:", error);
                }
              }} 
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Clear All
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
