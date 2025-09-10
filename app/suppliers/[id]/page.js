"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";

/**
 * Supplier Details page showing supplier info, purchase orders, and actions
 * - Supplier profile information
 * - Purchase order history with details
 * - Create new purchase order functionality
 * - Payment management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
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
  Mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  ShoppingCart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  CreditCard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Truck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 3h1a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h15" />
      <path d="M9 6h6l4 6v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <circle cx="9" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
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

export default function SupplierDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id;

  // State
  const [supplier, setSupplier] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  // Reset purchase orders when supplierId changes
  useEffect(() => {
    setPurchaseOrders([]);
  }, [supplierId]);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchSupplier() {
    try {
      const res = await fetch(api(`/api/suppliers/${supplierId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load supplier (${res.status})`);
      const data = await res.json();
      setSupplier(data.data || data);
    } catch (e) {
      setError(e?.message || "Failed to load supplier");
    }
  }

  async function fetchPurchaseOrders() {
    try {
      console.log(`Fetching purchase orders for supplier ID: ${supplierId}`);
      const res = await fetch(api(`/api/purchase-orders?supplier_id=${supplierId}&limit=50`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load purchase orders (${res.status})`);
      const data = await res.json();
      const ordersData = data.data || data || [];
      console.log(`Found ${ordersData.length} purchase orders for supplier ${supplierId}:`, ordersData);
      setPurchaseOrders(ordersData);
    } catch (e) {
      console.error("Failed to load purchase orders:", e);
      setPurchaseOrders([]);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    await Promise.all([fetchSupplier(), fetchPurchaseOrders()]);
    setLoading(false);
  }

  useEffect(() => {
    if (supplierId) {
      fetchData();
    }
  }, [supplierId]);

  if (loading) {
    return (
      <Layout title="Supplier Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading supplier details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !supplier) {
    return (
      <Layout title="Supplier Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-rose-500 mb-4">{error || "Supplier not found"}</p>
            <button 
              onClick={() => router.back()} 
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${supplier.name}`}>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
          >
            <Icon.ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Supplier Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage supplier information and purchase orders</p>
          </div>
        </div>

        {/* Supplier Profile Card */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="p-6">
            {/* Single row: Profile info on left, metrics in center, edit button on right */}
            <div className="flex items-center justify-between">
              {/* Left: Profile information */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Icon.Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{supplier.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Supplier #{supplier.id}</p>
                </div>
              </div>

              {/* Center: All metrics */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Icon.ShoppingCart className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Orders</p>
                    <p className="font-bold text-gray-900 dark:text-white">{purchaseOrders.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${purchaseOrders.reduce((total, order) => total + parseFloat(order.total || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${purchaseOrders.reduce((total, order) => total + parseFloat(order.payment_amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                    <p className="font-bold text-red-600 dark:text-red-400">
                      ${purchaseOrders.reduce((total, order) => {
                        const orderTotal = parseFloat(order.total || 0);
                        const orderPaid = parseFloat(order.payment_amount || 0);
                        return total + Math.max(0, orderTotal - orderPaid);
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Edit button */}
              <button 
                onClick={() => setEditing(true)}
                className="rounded-lg p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                title="Edit supplier"
              >
                <Icon.Edit className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/suppliers/${supplierId}/purchase`)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            <Icon.Plus className="h-4 w-4" />
            Create Purchase Order
          </button>
          <button
            onClick={() => router.push(`/purchase-orders?supplier_id=${supplierId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Icon.ShoppingCart className="h-4 w-4" />
            View All Purchase Orders
          </button>
          <button
            onClick={() => router.push(`/payments?supplier_id=${supplierId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Icon.CreditCard className="h-4 w-4" />
            Payment History
          </button>
        </div>

        {/* Recent Purchase Orders */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-gray-200/60 p-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Purchase Orders</h3>
              <button 
                onClick={() => router.push(`/purchase-orders?supplier_id=${supplierId}`)}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all purchase orders →
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {purchaseOrders.length === 0 ? (
              <div className="p-6 text-center">
                <Icon.ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No purchase orders found for this supplier</p>
                <button
                  onClick={() => router.push(`/suppliers/${supplierId}/purchase`)}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                >
                  Create First Purchase Order
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Paid</th>
                    <th className="px-6 py-4 font-medium">Balance</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.slice(0, 5).map((order) => {
                    const totalAmount = parseFloat(order.total || 0);
                    const totalPaid = parseFloat(order.payment_amount || 0);
                    const balance = Math.max(0, totalAmount - totalPaid);
                    const isPaid = totalPaid >= totalAmount;
                    
                    return (
                      <tr key={order.id} className="border-t border-gray-200/60 dark:border-white/10">
                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 font-semibold">${totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                          ${totalPaid.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-red-600 dark:text-red-400">
                          ${balance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "rounded-xl px-3 py-1 text-xs font-medium",
                            isPaid && "bg-emerald-500/10 text-emerald-500",
                            !isPaid && "bg-amber-500/10 text-amber-500",
                            order.status === "cancelled" && "bg-rose-500/10 text-rose-500"
                          )}>
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => router.push(`/purchase-orders/${order.id}`)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                              title="View order"
                            >
                              <Icon.Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => router.push(`/payments?purchase_order_id=${order.id}`)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-200"
                              title="View payments"
                            >
                              <Icon.DollarSign className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
