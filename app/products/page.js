"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

/**
 * Professional Products page for the POS app (matches dashboard theme).
 * - Dark/light toggle (persisted in localStorage)
 * - Auth guard (redirects to /login if no token)
 * - Search, sort, filter by category, pagination
 * - Add / Edit / Delete products (modals)
 * - Minimal CSV export of current page
 *
 * API endpoints expected (can be proxied through Next):
 *   GET    /api/products?limit=&offset=&q=&sort=&order=&category_id=
 *   POST   /api/products
 *   PUT    /api/products/:id
 *   DELETE /api/products/:id
 *   GET    /api/categories  (optional for filter)
 *
 * If you're using a Next API proxy, just call "/api/...".
 * If you want to hit backend directly, set NEXT_PUBLIC_API_URL in .env.local
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

export default function ProductsPage() {
  // Query state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState("");

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
  const [categories, setCategories] = useState([]);

  // Modal state
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

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
      if (category) params.set("category_id", String(category));

      const res = await fetch(api(`/api/products?${params.toString()}`), {
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

  async function fetchCategories() {
    try {
      const res = await fetch(api("/api/categories"), { headers: authHeaders(), cache: "no-store" });
      if (res.ok) {
        const list = await res.json();
        const data = Array.isArray(list?.data) ? list.data : list;
        setCategories(data?.map((c) => ({ id: c.id, name: c.name })) || []);
      }
    } catch {}
  }

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchList(); }, [q, sort, order, page, limit, category]);

  function toggleSort(col) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("asc"); }
  }

  function exportCSV() {
    const header = ["ID","Name","SKU","Barcode","Price","Cost","Stock","Category","Status"];
    const lines = rows.map(r => [r.id, r.name, r.sku, r.barcode, r.price, r.cost, r.stock, r.category_id, r.status].map(v => (v ?? "")).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `products_page_${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveProduct(input, isEdit) {
    const method = isEdit ? "PUT" : "POST";
    const path = isEdit ? `/api/products/${input.id}` : "/api/products";
    const res = await fetch(api(path), {
      method,
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
  }

  async function deleteProduct(p) {
    const res = await fetch(api(`/api/products/${p.id}`), { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  }

  // Form state for create/edit
  function ProductForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState({
      id: initial?.id,
      name: initial?.name || "",
      sku: initial?.sku || "",
      barcode: initial?.barcode || "",
      price: initial?.price ?? undefined,
      cost: initial?.cost ?? undefined,
      stock: initial?.stock ?? 0,
      category_id: initial?.category_id ?? (category || ""),
      status: initial?.status || "active",
      description: initial?.description || "",
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(e) {
      e.preventDefault();
      setBusy(true); setError(null);
      try {
        await saveProduct(form, Boolean(initial?.id));
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally { setBusy(false); }
    }

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">{initial?.id ? "Edit product" : "Add product"}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">SKU</label>
            <input value={form.sku} onChange={(e)=>setForm({...form, sku: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Barcode</label>
            <input value={form.barcode} onChange={(e)=>setForm({...form, barcode: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Price</label>
            <input type="number" step="0.01" value={form.price ?? ""} onChange={(e)=>setForm({...form, price: e.target.value === "" ? undefined : Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Cost</label>
            <input type="number" step="0.01" value={form.cost ?? ""} onChange={(e)=>setForm({...form, cost: e.target.value === "" ? undefined : Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Stock</label>
            <input type="number" value={form.stock ?? 0} onChange={(e)=>setForm({...form, stock: Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Category</label>
            <select value={String(form.category_id ?? "")} onChange={(e)=>setForm({...form, category_id: e.target.value || null})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">—</option>
              {categories.map(c => <option key={c.id} value={String(c.id)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Status</label>
            <select value={form.status || "active"} onChange={(e)=>setForm({...form, status: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="active" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Active</option>
              <option value="archived" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Description</label>
            <textarea value={form.description || ""} onChange={(e)=>setForm({...form, description: e.target.value})} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5" />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">Cancel</button>
          <button disabled={busy} className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60">{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    );
  }

  return (
    <Layout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product inventory</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side - Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="" className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                  {c.name}
                </option>
              ))}
            </select>

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

            {/* Add Product Button */}
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <Icon.Plus className="h-4 w-4" />
              Add product
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

          {/* Right side - Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
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
                  { key: "name", label: "Name", w: "w-64" },
                  { key: "sku", label: "SKU", w: "w-32" },
                  { key: "barcode", label: "Barcode", w: "w-40" },
                  { key: "price", label: "Price", w: "w-28" },
                  { key: "cost_price", label: "Cost Price", w: "w-32" },
                  { key: "stock", label: "Stock", w: "w-24" },
                  { key: "category_id", label: "Category", w: "w-40" },
                  { key: "status", label: "Status", w: "w-32" },
                  { key: "_", label: "Actions", w: "w-32" },
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
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No products found</td>
                </tr>
              )}
              {!loading && rows.map((r) => (
                <tr key={String(r.id)} className="border-t border-gray-200/60 dark:border-white/10">
                  <td className="px-4 py-3 font-medium">{r.id}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="font-medium truncate" title={r.name}>{r.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{r.sku || "—"}</td>
                  <td className="px-4 py-3 font-mono text-sm">{r.barcode || "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.price != null ? `$${Number(r.price).toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3">{r.cost_price != null ? `$${Number(r.cost_price).toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.quantity_in_stock ?? r.stock ?? "—"}</td>
                  <td className="px-4 py-3">
                    {categories.find(c => c.id == r.category_id)?.name || r.category_id || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium",
                      (r.status || "active") === "active" && "bg-emerald-500/10 text-emerald-500",
                      (r.status || "active") === "archived" && "bg-gray-500/10 text-gray-500"
                    )}>{r.status || "active"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setEditing(r)} 
                        className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                        title="Edit product"
                      >
                        <Icon.Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeleting(r)} 
                        className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                        title="Delete product"
                      >
                        <Icon.Trash className="h-3.5 w-3.5" />
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
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-xl border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10">Prev</button>
            <span className="tabular-nums">Page {page} / {pages}</span>
            <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-xl border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10">Next</button>
          </div>
        </div>
      </div>
    </div>

      {/* Create modal */}
      <Modal open={creating} onClose={()=>setCreating(false)}>
        <ProductForm
          onCancel={()=>setCreating(false)}
          onSaved={async()=>{ setCreating(false); await fetchList(); }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={()=>setEditing(null)}>
        {editing && (
          <ProductForm
            initial={editing}
            onCancel={()=>setEditing(null)}
            onSaved={async()=>{ setEditing(null); await fetchList(); }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleting)} onClose={()=>setDeleting(null)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Delete product</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete <span className="font-medium">{deleting?.name}</span>? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={()=>setDeleting(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">Cancel</button>
            <button onClick={async()=>{ if (!deleting) return; await deleteProduct(deleting); setDeleting(null); await fetchList(); }} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
