"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import PaymentReceipt from "../components/PaymentReceipt";
import ConfirmDialog from "../components/ConfirmDialog";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
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
  CreditCard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Receipt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 6V4" />
      <path d="M12 20v-2" />
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
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  TrendingUp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
  FileText: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
};

export default function PaymentsPage() {
  const router = useRouter();

  // State
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

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showReceiptModal, setShowReceiptModal] = useState({ show: false, payment: null });

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Auth headers
  function authHeaders() {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Fetch payments
  async function fetchPayments() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));
      
      // Use the correct parameter names based on the backend API
      if (searchTerm) params.set("q", searchTerm);
      if (methodFilter) params.set("payment_method", methodFilter);
      params.set("onlyOrders", "true");

      console.log('Fetching payments with params:', params.toString()); // Debug log

      const res = await fetch(api(`/api/payments?${params.toString()}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (res.status === 401) return router.replace("/login");
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Payments API error:', res.status, errorText);
        throw new Error(`Failed to load payments (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Payments data received:', data); // Debug log
      
      setPayments(data.data || data || []);
      setTotal(data.pagination?.total ?? (data.data ? data.data.length : 0));
      

      
    } catch (e) {
      console.error('Error fetching payments:', e);
      setError(e?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  // Client-side only mount detection
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPayments();
    }
  }, [mounted, searchTerm, methodFilter, dateFilter, page, limit]);

  // Helper function to generate test payment data if API fails
  function generateTestPayments() {
    return [
      {
        id: 1,
        customer_name: "John Doe",
        order_id: 1,
        amount: 250.00,
        payment_method: "cash",
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        transaction_id: "TXN001"
      },
      {
        id: 2,
        customer_name: "Jane Smith",
        order_id: 2,
        amount: 150.75,
        payment_method: "card",
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        transaction_id: "TXN002"
      }
    ];
  }

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  }

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  async function deletePayment(id) {
    try {
      const res = await fetch(api(`/api/payments/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Failed to delete payment (${res.status})`);
      }
      showToast("Payment deleted successfully.");
      fetchPayments();
    } catch (e) {
      showToast(e?.message || "Failed to delete payment", "error");
    }
  }

  // Receipt functions
  const openReceiptModal = (payment) => setShowReceiptModal({ show: true, payment });
  const closeReceiptModal = () => setShowReceiptModal({ show: false, payment: null });


  // Format date
  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  }

  // Get payment method badge
  function getPaymentMethodBadge(method) {
    const methods = {
      cash: { color: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400" },
      card: { color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400" },
      credit: { color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400" },
      debit: { color: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400" },
      digital: { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400" },
    };
    
    const config = methods[method?.toLowerCase()] || methods.cash;
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        {method || 'Cash'}
      </span>
    );
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!payments.length) return { totalAmount: 0, cashPayments: 0, cardPayments: 0, todayPayments: 0 };
    
    const today = new Date().toDateString();
    return {
      totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      cashPayments: payments.filter(p => p.payment_method?.toLowerCase() === 'cash').length,
      cardPayments: payments.filter(p => ['card', 'credit', 'debit'].includes(p.payment_method?.toLowerCase())).length,
      todayPayments: payments.filter(p => new Date(p.payment_date || p.created_at).toDateString() === today).length,
    };
  }, [payments]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <Layout title="Payments Management">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Payments Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Track and manage all payment transactions</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Icon.CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Card Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cardPayments}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cashPayments}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Icon.TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayPayments}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payments by customer, order, or transaction ID..."
                  className="w-full rounded-xl border border-gray-200 bg-white/70 pl-12 pr-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Payment Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="digital">Digital</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />

            {/* Items per page */}
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-base table-typography">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-center font-bold">Payment ID</th>
                  <th className="px-6 py-4 text-center font-bold">Customer</th>
                  <th className="px-6 py-4 text-center font-bold">Order #</th>
                  <th className="px-6 py-4 text-center font-bold">Amount</th>
                  <th className="px-6 py-4 text-center font-bold">Method</th>
                  <th className="px-6 py-4 text-center font-bold">Date</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Icon.Receipt className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                          {searchTerm || methodFilter || dateFilter ? "No payments found matching your filters" : "No payments recorded yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="text-sm text-gray-500 dark:text-gray-400">#{payment.id}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.transaction_id || 'No transaction ID'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.customer_name || 'Unknown Customer'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Icon.FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{payment.order_id || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ${(parseFloat(payment.amount) || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getPaymentMethodBadge(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Icon.Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(payment.payment_date || payment.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openReceiptModal(payment)}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                          title="Generate Receipt"
                        >
                          <Icon.Receipt className="h-4 w-4" />
                        </button>
                        {payment.order_id && (
                          <button
                            onClick={() => router.push(`/orders/${payment.order_id}`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                            title="View Order"
                          >
                            <Icon.Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: payment.id })}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                          title="Delete Payment"
                        >
                          {/* trash icon */}
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && payments.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} payments
              </div>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300">
                  Page {page} of {pages}
                </span>
                <button 
                  disabled={page >= pages} 
                  onClick={() => setPage(p => Math.min(pages, p + 1))} 
                  className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`rounded-xl border p-4 shadow-lg ${
            toast.type === "success" 
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400" 
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                toast.type === "success" 
                  ? "bg-green-500 text-white" 
                  : "bg-red-500 text-white"
              }`}>
                {toast.type === "success" ? (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast({ show: false, message: "", type: "success" })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
        </div>
      </div>
      )}

      {/* Payment Receipt Dialog */}
      {showReceiptModal.show && showReceiptModal.payment && (
        <PaymentReceipt
          payment={showReceiptModal.payment}
          order={null} // We don't have order data in payments page, but the component can handle it
          onClose={closeReceiptModal}
          onSuccess={(message) => {
            showToast(message, message.includes('Failed') ? 'error' : 'success');
            closeReceiptModal();
          }}
        />
      )}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Payment"
        description={`Are you sure you want to delete this payment? This action cannot be undone.`}
        confirmLabel="Delete"
        requireText
        keyword="confirm"
        destructive
        onConfirm={async () => {
          const id = deleteDialog.id;
          setDeleteDialog({ open: false, id: null });
          await deletePayment(id);
        }}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      />
    </Layout>
  );
}
