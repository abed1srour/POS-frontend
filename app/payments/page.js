"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
};

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer_id');
  const orderId = searchParams.get('order_id');
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchPayments() {
    try {
      let url = "/api/payments?limit=100";
      if (customerId) url += `&customer_id=${customerId}`;
      if (orderId) url += `&order_id=${orderId}`;
      
      const res = await fetch(api(url), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load payments (${res.status})`);
      const data = await res.json();
      setPayments(data.data || data || []);
    } catch (e) {
      setError(e?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, [customerId, orderId]);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id?.toString().includes(searchTerm) ||
      payment.order_id?.toString().includes(searchTerm) ||
      payment.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || payment.payment_date?.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "No date";
    
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

  // Get payment method badge styling
  function getPaymentMethodBadge(method) {
    const styles = {
      cash: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      card: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
      bank_transfer: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
      mobile_money: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400",
      check: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400",
    };
    return styles[method] || styles.cash;
  }

  if (loading) {
    return (
      <Layout title="Payments">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading payments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payments">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon.ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Payments
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                {customerId ? "Customer payments" : orderId ? "Order payments" : "All payments"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{payments.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Amount</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ${payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Average Payment</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  ${payments.length > 0 ? (payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0) / payments.length).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Icon.Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search payments by ID, order ID, customer name, or payment method..."
                className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-4 pl-12 pr-6 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Payment ID</th>
                  <th className="px-6 py-4 text-left font-bold">Order ID</th>
                  <th className="px-6 py-4 text-left font-bold">Customer</th>
                  <th className="px-6 py-4 text-left font-bold">Amount</th>
                  <th className="px-6 py-4 text-left font-bold">Method</th>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">#{payment.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/orders/${payment.order_id}`)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                      >
                        #{payment.order_id}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <Icon.DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {payment.customer?.first_name} {payment.customer?.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.customer?.phone_number || "No phone"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">
                        ${parseFloat(payment.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPaymentMethodBadge(payment.payment_method)}`}>
                        {payment.payment_method?.replace('_', ' ').toUpperCase() || "CASH"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/orders/${payment.order_id}`)}
                          className="rounded-xl p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                          title="View Order"
                        >
                          <Icon.Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <Icon.DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                {searchTerm || dateFilter ? "No payments found matching your filters" : "No payments available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
