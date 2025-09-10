"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import { useRouter } from "next/navigation";

/**
 * Inventory management page for the POS app
 * - List all products with stock levels
 * - Add stock to products
 * - Track inventory movements
 * - View low stock alerts
 * - Search and filter inventory
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
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 21h14" />
    </svg>
  ),
  AlertTriangle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7L12 12l8.7-5" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export default function InventoryPage() {
  const router = useRouter();
  
  // Query state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showLowStock, setShowLowStock] = useState(false);

  // Data state
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modal state
  const [addingStock, setAddingStock] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

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
      if (showLowStock) params.set("lowStock", "true");

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

  useEffect(() => { 
    setPage(1); // Reset to first page when switching views
    fetchList(); 
  }, [q, sort, order, limit, showLowStock]);

  useEffect(() => { fetchList(); }, [page]);

  function toggleSort(col) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("asc"); }
  }

  function exportCSV() {
    const header = ["ID","Name","SKU","Current Stock","Reorder Level","Category","Supplier","Status"];
    const lines = rows.map(r => [
      r.id, 
      r.name, 
      r.sku, 
      r.quantity_in_stock || r.stock || 0,
      r.reorder_level || 0,
      r.category_name || r.category_id,
      r.supplier_name || r.supplier_id,
      r.status || "active"
    ].map(v => (v ?? "")).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `inventory_page_${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function addStock(productId, quantity) {
    const res = await fetch(api(`/api/products/${productId}/stock`), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ quantity: Number(quantity) }),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Add stock failed (${res.status})`);
  }

  async function deleteProduct(productId) {
    const res = await fetch(api(`/api/products/${productId}`), {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  }

  // Replace inline delete confirmation with shared ConfirmDialog

  // Form component for adding stock
  function AddStockForm({ product, onCancel, onSaved }) {
    const [quantity, setQuantity] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(e) {
      e.preventDefault();
      if (!quantity || quantity <= 0) {
        setError("Please enter a valid quantity");
        return;
      }
      setBusy(true); 
      setError(null);
      try {
        await addStock(product.id, quantity);
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to add stock");
      } finally { 
        setBusy(false); 
      }
    }

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">Add Stock</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Product</label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
              {product.name}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Current Stock</label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
              {product.quantity_in_stock || product.stock || 0}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Quantity to Add</label>
            <input 
              type="number"
              min="1"
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white">Cancel</button>
          <button disabled={busy} className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60">{busy ? "Adding..." : "Add Stock"}</button>
        </div>
      </form>
    );
  }

  return (
    <Layout title="Inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product stock levels</p>
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

            {/* Low Stock Filter */}
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-4 ${
                showLowStock 
                  ? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500/20" 
                  : "border border-gray-200 bg-white/70 text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              }`}
            >
              <Icon.AlertTriangle className="h-4 w-4" />
              Low Stock
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
                placeholder="Search inventory..."
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
                    { key: "name", label: "Product Name", w: "w-64", align: "text-center" },
                    { key: "sku", label: "SKU", w: "w-32", align: "text-center" },
                    { key: "quantity_in_stock", label: "Current Stock", w: "w-32", align: "text-center" },
                    { key: "reorder_level", label: "Reorder Level", w: "w-32", align: "text-center" },
                    { key: "category_id", label: "Category", w: "w-40", align: "text-center" },
                    { key: "supplier_name", label: "Supplier", w: "w-40", align: "text-center" },
                    { key: "status", label: "Status", w: "w-32", align: "text-center" },
                    { key: "_", label: "Actions", w: "w-32", align: "text-center" },
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
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No products found
                    </td>
                  </tr>
                )}
                {!loading && rows.map((r) => {
                  const currentStock = r.quantity_in_stock || r.stock || 0;
                  const reorderLevel = r.reorder_level || 0;
                  const isLowStock = currentStock <= reorderLevel;
                  
                  return (
                    <tr key={String(r.id)} className="border-t border-gray-200/60 dark:border-white/10">
                      <td className="px-4 py-3 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{r.id}</span></td>
                      <td className="px-4 py-3 text-center">
                        <div className="max-w-xs mx-auto">
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={r.name}>{r.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center"><span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{r.sku || "—"}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm",
                          isLowStock ? "text-rose-500" : "text-gray-500 dark:text-gray-400"
                        )}>
                          {currentStock}
                        </span>
                        {isLowStock && (
                          <Icon.AlertTriangle className="inline h-3 w-3 ml-1 text-rose-500" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{reorderLevel}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {r.category_name || r.category_id || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {r.supplier_name || r.supplier_id || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium",
                          (r.status || "active") === "active" && "bg-emerald-500/10 text-emerald-500",
                          (r.status || "active") === "archived" && "bg-gray-500/10 text-gray-500"
                        )}>{r.status || "active"}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => router.push(`/products/${r.id}/edit`)} 
                            className="rounded-lg p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                            title="Edit product"
                          >
                            <Icon.Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => setAddingStock(r)} 
                            className="rounded-lg p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-200"
                            title="Add stock"
                          >
                            <Icon.Plus className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeletingProduct(r)} 
                            className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                            title="Delete product"
                          >
                            <Icon.Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Add Stock modal */}
      <Modal open={Boolean(addingStock)} onClose={()=>setAddingStock(null)}>
        {addingStock && (
          <AddStockForm
            product={addingStock}
            onCancel={()=>setAddingStock(null)}
            onSaved={async()=>{ setAddingStock(null); await fetchList(); }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete Product"
        description={deletingProduct ? `Are you sure you want to delete ${deletingProduct.name}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={async()=>{ if (!deletingProduct) return; const p = deletingProduct; setDeletingProduct(null); await deleteProduct(p.id); await fetchList(); }}
        onClose={()=>setDeletingProduct(null)}
      />
    </Layout>
  );
}
