"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusDialog from "../components/StatusDialog";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

const Icon = {
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
};

export default function CompanyPaymentsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, variant: "success", title: "", message: "" });

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchPayments() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      if (searchTerm) params.set("q", searchTerm);
      if (methodFilter) params.set("payment_method", methodFilter);
      params.set("onlyCompany", "true");
      const res = await fetch(api(`/api/payments?${params.toString()}`), { headers: authHeaders(), cache: "no-store" });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load company payments (${res.status})`);
      const data = await res.json();
      setPayments(data.data || data || []);
      setTotal(data.pagination?.total ?? (data.data ? data.data.length : 0));
    } catch (e) {
      setError(e?.message || "Failed to load company payments");
    } finally {
      setLoading(false);
    }
  }

  async function deletePayment(id) {
    try {
      const res = await fetch(api(`/api/payments/${id}`), { method: "DELETE", headers: authHeaders() });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to delete payment (${res.status})`);
      setStatusDialog({ open: true, variant: "success", title: "Success!", message: "Payment deleted successfully." });
      fetchPayments();
    } catch (e) {
      setStatusDialog({ open: true, variant: "error", title: "Delete failed", message: e?.message || "Failed to delete payment" });
    }
  }

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  }

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted) fetchPayments(); }, [mounted, searchTerm, methodFilter, dateFilter, page, limit]);

  if (!mounted) return null;

  return (
    <Layout title="Company Payments">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Company Payments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Outgoing payments like suppliers, employees, and expenses</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search payments..." className="w-full rounded-xl border border-gray-200 bg-white/70 pl-12 pr-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </div>
              <select value={methodFilter} onChange={(e)=>setMethodFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="digital">Digital</option>
              </select>
              <input type="date" value={dateFilter} onChange={(e)=>setDateFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <select value={limit} onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }} className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-center font-bold">Payment ID</th>
                  <th className="px-6 py-4 text-center font-bold">Supplier</th>
                  <th className="px-6 py-4 text-center font-bold">Order ID</th>
                  <th className="px-6 py-4 text-center font-bold">View Order</th>
                  <th className="px-6 py-4 text-center font-bold">Amount</th>
                  <th className="px-6 py-4 text-center font-bold">Method</th>
                  <th className="px-6 py-4 text-center font-bold">Date</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">#{p.id}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{p.supplier_name || p.supplier_contact || '—'}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{p.purchase_order_id ? `#${p.purchase_order_id}` : '—'}</span></td>
                    <td className="px-6 py-4 text-center">
                      {p.purchase_order_id ? (
                        <button
                          onClick={() => router.push(`/purchase-orders/${p.purchase_order_id}`)}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                          title="View order"
                        >
                          <Icon.Eye className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${(parseFloat(p.amount)||0).toFixed(2)}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{p.payment_method}</span></td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Icon.Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(p.payment_date || p.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={()=>setDeleteDialog({ open:true, id: p.id })} className="rounded-lg p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200" title="Delete Payment">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && payments.length === 0 && (
            <div className="text-center py-12">
              <Icon.DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                {searchTerm || methodFilter || dateFilter ? "No company payments found matching your filters" : "No company payments found"}
              </p>
            </div>
          )}
          {!loading && payments.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="text-sm text-gray-600 dark:text-gray-400">Showing {((page-1)*limit)+1} to {Math.min(page*limit,total)} of {total} payments</div>
              <div className="flex items-center gap-2">
                <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10">Previous</button>
                <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300">Page {page} of {pages}</span>
                <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10">Next</button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">{error}</div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Payment"
        description={`Are you sure you want to delete this payment? This action cannot be undone.`}
        confirmLabel="Delete"
        requireText
        keyword="confirm"
        destructive
        onConfirm={async()=>{ const id = deleteDialog.id; setDeleteDialog({ open:false, id:null }); await deletePayment(id); }}
        onClose={()=>setDeleteDialog({ open:false, id:null })}
      />

      <StatusDialog
        open={statusDialog.open}
        variant={statusDialog.variant}
        title={statusDialog.title}
        message={statusDialog.message}
        onClose={() => setStatusDialog({ open: false, variant: "success", title: "", message: "" })}
      />
    </Layout>
  );
}
