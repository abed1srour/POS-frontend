"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/navigation";

/**
 * Warranties management page for the POS app
 * - List all warranties
 * - Add new warranties
 * - Edit existing warranties
 * - Delete warranties
 * - Search and filter warranties
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
  Shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
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

export default function WarrantiesPage() {
  const router = useRouter();
  
  // Query state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Data state
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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

      const res = await fetch(api(`/api/warranties?${params.toString()}`), {
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

  async function fetchCustomers() {
    try {
      const res = await fetch(api("/api/customers?limit=1000"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      console.log("Customers loaded:", data.data || data || []);
      setCustomers(data.data || data || []);
    } catch (e) {
      console.error("Failed to load customers:", e);
    }
  }

  async function fetchProducts() {
    try {
      console.log("Fetching products from:", api("/api/products?limit=1000"));
      const res = await fetch(api("/api/products?limit=1000"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      console.log("Products API response status:", res.status);
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      console.log("Products API raw response:", data);
      console.log("Products loaded:", data.data || data || []);
      setProducts(data.data || data || []);
    } catch (e) {
      console.error("Failed to load products:", e);
    }
  }

  useEffect(() => { 
    fetchList(); 
    fetchCustomers();
    fetchProducts();
  }, [q, sort, order, page, limit]);

  function toggleSort(col) {
    if (sort === col) setOrder(order === "asc" ? "desc" : "asc");
    else { setSort(col); setOrder("asc"); }
  }

  function exportCSV() {
    const header = ["ID","Serial Number","Warranty Years","Customer ID","Customer Name","Product ID","Product Name","Start Date","Created At"];
    const lines = rows.map(r => [
      r.id, 
      r.serial_number, 
      r.warranty_years, 
      r.customer_id,
      r.customer_name || "Unknown",
      r.product_id,
      r.product_name || "Unknown",
      r.start_date,
      r.created_at
    ].map(v => (v ?? "")).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `warranties_page_${page}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveWarranty(input, isEdit) {
    const method = isEdit ? "PUT" : "POST";
    const path = isEdit ? `/api/warranties/${input.id}` : "/api/warranties";
    const res = await fetch(api(path), {
      method,
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
  }

  async function deleteWarranty(p) {
    const res = await fetch(api(`/api/warranties/${p.id}`), { method: "DELETE", headers: authHeaders() });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  }

  // Form state for create/edit
  function WarrantyForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState({
      id: initial?.id,
      serial_number: initial?.serial_number || "",
      warranty_years: initial?.warranty_years || 1,
      customer_id: initial?.customer_id || "",
      product_id: initial?.product_id || "",
      start_date: initial?.start_date || new Date().toISOString().split('T')[0],
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    
    // Search states
    const [customerSearch, setCustomerSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    async function onSubmit(e) {
      e.preventDefault();
      setBusy(true); setError(null);
      try {
        await saveWarranty(form, Boolean(initial?.id));
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally { setBusy(false); }
    }

    // Filter customers and products based on search
    const filteredCustomers = customerSearch.trim() 
      ? customers.filter(customer =>
          customer.first_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.last_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.id?.toString().includes(customerSearch)
        )
      : customers;

    const filteredProducts = productSearch.trim() 
      ? products.filter(product =>
          product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.id?.toString().includes(productSearch)
        )
      : products;

    // Debug logging
    console.log("Customers state:", customers);
    console.log("Customer search term:", customerSearch);
    console.log("Filtered customers:", filteredCustomers);
    console.log("Products state:", products);
    console.log("Product search term:", productSearch);
    console.log("Filtered products:", filteredProducts);

    // Get selected customer and product names
    const selectedCustomer = customers.find(c => c.id == form.customer_id);
    const selectedProduct = products.find(p => p.id == form.product_id);

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.customer-dropdown') && !event.target.closest('.product-dropdown')) {
          setShowCustomerDropdown(false);
          setShowProductDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">{initial?.id ? "Edit warranty" : "Add warranty"}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Serial Number</label>
            <input 
              value={form.serial_number} 
              onChange={(e)=>setForm({...form, serial_number: e.target.value})} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Warranty Years</label>
            <input 
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={form.warranty_years} 
              onChange={(e)=>setForm({...form, warranty_years: parseFloat(e.target.value) || 1})} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div className="relative customer-dropdown">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Customer</label>
            <div className="relative">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                  if (!e.target.value) setForm({...form, customer_id: ""});
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : "Search customers..."}
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              {showCustomerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {customer.id} {customer.phone_number && `• ${customer.phone_number}`}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setForm({...form, customer_id: customer.id});
                              setCustomerSearch("");
                              setShowCustomerDropdown(false);
                            }}
                            className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))
                                     ) : customerSearch.trim() ? (
                     <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">No customers found for "{customerSearch}"</div>
                   ) : customers.length === 0 ? (
                     <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">No customers available</div>
                   ) : (
                     <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">All customers</div>
                   )}
                </div>
              )}
            </div>
          </div>
          <div className="relative product-dropdown">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Product</label>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                  if (!e.target.value) setForm({...form, product_id: ""});
                }}
                onFocus={() => setShowProductDropdown(true)}
                placeholder={selectedProduct ? selectedProduct.name : "Search products..."}
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
                             {showProductDropdown && (
                 <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                   {filteredProducts.length > 0 ? (
                     filteredProducts.map(product => (
                       <div
                         key={product.id}
                         onClick={() => {
                           setForm({...form, product_id: product.id});
                           setProductSearch("");
                           setShowProductDropdown(false);
                         }}
                         className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                       >
                         {product.name} (ID: {product.id})
                       </div>
                     ))
                   ) : productSearch.trim() ? (
                     <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">No products found for "{productSearch}"</div>
                   ) : products.length === 0 ? (
                     <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                       {loading ? "Loading products..." : "No products available"}
                     </div>
                   ) : (
                     <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">All products ({products.length})</div>
                   )}
                 </div>
               )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Start Date</label>
            <input 
              type="date"
              value={form.start_date} 
              onChange={(e)=>setForm({...form, start_date: e.target.value})} 
              required 
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
    <Layout title="Warranties">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warranties</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage product warranties</p>
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

            {/* Add Warranty Button */}
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              <Icon.Plus className="h-4 w-4" />
              Add warranty
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
                placeholder="Search warranties..."
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
                    { key: "id", label: "ID", w: "w-20" },
                    { key: "serial_number", label: "Serial Number", w: "w-48" },
                    { key: "warranty_years", label: "Warranty Years", w: "w-32" },
                    { key: "customer_id", label: "Customer", w: "w-48" },
                    { key: "product_id", label: "Product", w: "w-48" },
                    { key: "start_date", label: "Start Date", w: "w-32" },
                    { key: "_", label: "Actions", w: "w-48" },
                  ].map((c) => (
                    <th key={c.key} className={cn("px-4 py-3 text-center font-bold whitespace-nowrap", c.w)}>
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
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No warranties found</td>
                  </tr>
                )}
                {!loading && rows.map((r) => (
                  <tr key={String(r.id)} className="border-t border-gray-200/60 dark:border-white/10">
                    <td className="px-4 py-3 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{r.id}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={r.serial_number}>{r.serial_number}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{r.warranty_years} {r.warranty_years === 1 ? 'year' : 'years'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{r.customer_name || `Customer #${r.customer_id}`}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{r.product_name || `Product #${r.product_id}`}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => setEditing(r)} 
                          className="rounded-lg p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                          title="Edit warranty"
                        >
                          <Icon.Edit className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleting(r)} 
                          className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                          title="Delete warranty"
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
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-xl border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10 dark:text-white">Prev</button>
              <span className="tabular-nums text-gray-600 dark:text-gray-300">Page {page} / {pages}</span>
              <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-xl border border-gray-200 px-3 py-1.5 disabled:opacity-50 dark:border-white/10 dark:text-white">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={creating} onClose={()=>setCreating(false)}>
        <WarrantyForm
          onCancel={()=>setCreating(false)}
          onSaved={async()=>{ setCreating(false); await fetchList(); }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={()=>setEditing(null)}>
        {editing && (
          <WarrantyForm
            initial={editing}
            onCancel={()=>setEditing(null)}
            onSaved={async()=>{ setEditing(null); await fetchList(); }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleting)} onClose={()=>setDeleting(null)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Delete warranty</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete warranty for <span className="font-medium">{deleting?.serial_number}</span>? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={()=>setDeleting(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white">Cancel</button>
            <button onClick={async()=>{ if (!deleting) return; await deleteWarranty(deleting); setDeleting(null); await fetchList(); }} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
