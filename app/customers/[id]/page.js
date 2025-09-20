"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";
import PaymentDialog from "../../components/PaymentDialog";

/**
 * Customer Details page showing customer info, orders, and actions
 * - Customer profile information
 * - Order history with details
 * - Create new order functionality
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
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  // State
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, order: null });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Reset orders when customerId changes
  useEffect(() => {
    setOrders([]);
  }, [customerId]);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchCustomer() {
    try {
      const res = await fetch(api(`/api/customers/${customerId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load customer (${res.status})`);
      const data = await res.json();
      setCustomer(data.data || data);
    } catch (e) {
      setError(e?.message || "Failed to load customer");
    }
  }

  async function fetchOrders() {
    try {

      const res = await fetch(api(`/api/orders?customer_id=${customerId}&limit=50`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      const data = await res.json();
      const ordersData = data.data || data || [];

      setOrders(ordersData);
    } catch (e) {
      console.error("Failed to load orders:", e);
      // Don't set error for orders, just log it and set empty array
      setOrders([]);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    await Promise.all([fetchCustomer(), fetchOrders()]);
    setLoading(false);
  }

  useEffect(() => {
    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  async function updateCustomer(updatedData) {
    try {
      const res = await fetch(api(`/api/customers/${customerId}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(updatedData),
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      await fetchCustomer();
      setEditing(false);
    } catch (e) {
      setError(e?.message || "Failed to update customer");
    }
  }

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  }

  // Form component for editing customer
  function EditCustomerForm({ customer, onCancel, onSaved }) {
    const [form, setForm] = useState({
      first_name: customer?.first_name || "",
      last_name: customer?.last_name || "",
      address: customer?.address || "",
      phone_number: customer?.phone_number || "",
      join_date: customer?.join_date || new Date().toISOString().split('T')[0],
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(e) {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        await updateCustomer(form);
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally {
        setBusy(false);
      }
    }

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">Edit Customer</h3>
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

  if (loading) {
    return (
      <Layout title="Customer Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading customer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout title="Customer Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-rose-500 mb-4">{error || "Customer not found"}</p>
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
    <Layout title={`${customer.first_name} ${customer.last_name}`}>
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
            <h1 className="text-3xl font-bold">Customer Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer information and orders</p>
          </div>
        </div>

        {/* Customer Profile Card */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="p-6">
            {/* Single row: Profile info on left, metrics in center, edit button on right */}
            <div className="flex items-center justify-between">
              {/* Left: Profile information */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Icon.User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.first_name} {customer.last_name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Customer #{customer.id}</p>
                </div>
              </div>

              {/* Center: All metrics */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Icon.ShoppingCart className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Orders</p>
                    <p className="font-bold text-gray-900 dark:text-white">{orders.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${orders.reduce((total, order) => total + parseFloat(order.total_amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${orders.reduce((total, order) => total + parseFloat(order.total_paid || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="font-bold text-red-600 dark:text-red-400">
                      ${orders.reduce((total, order) => {
                        const orderTotal = parseFloat(order.total_amount || 0);
                        const orderPaid = parseFloat(order.total_paid || 0);
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
                title="Edit customer"
              >
                <Icon.Edit className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCreatingOrder(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            <Icon.Plus className="h-4 w-4" />
            Create New Order
          </button>
          <button
            onClick={() => router.push(`/orders?customer_id=${customerId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Icon.ShoppingCart className="h-4 w-4" />
            View All Orders
          </button>
          <button
            onClick={() => router.push(`/payments?customer_id=${customerId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Icon.CreditCard className="h-4 w-4" />
            Payment History
          </button>
        </div>

        {/* Recent Orders */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-gray-200/60 p-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Orders</h3>
              <button 
                onClick={() => router.push(`/orders?customer_id=${customerId}`)}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all orders →
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-6 text-center">
                <Icon.ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No orders found for this customer</p>
                <button
                  onClick={() => setCreatingOrder(true)}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                >
                  Create First Order
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
                    <th className="px-6 py-4 font-medium">Remaining</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => {
                    const totalAmount = parseFloat(order.total_amount || 0);
                    const totalPaid = parseFloat(order.total_paid || 0);
                    const remaining = Math.max(0, totalAmount - totalPaid);
                    
                    // Check if the order has a status field that indicates it's paid
                    const hasPaidStatus = order.status === 'paid' || order.status === 'completed';
                    // More robust paid status check - prioritize status field, then payment amounts
                    const isPaid = hasPaidStatus || remaining <= 0.01 || totalPaid >= totalAmount;
                    
                    // Debug logging

                    return (
                      <tr key={order.id} className="border-t border-gray-200/60 dark:border-white/10">
                        <td className="px-6 py-4 font-medium">#{order.id}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {order.order_date ? new Date(order.order_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 font-semibold">${totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          ${totalPaid.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-red-600 dark:text-red-400">
                          ${remaining.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "rounded-xl px-3 py-1 text-xs font-medium",
                            (isPaid || order.status === 'paid') && "bg-emerald-500/10 text-emerald-500",
                            (!isPaid && order.status !== 'paid') && "bg-red-500/10 text-red-500",
                            order.status === "cancelled" && "bg-rose-500/10 text-rose-500"
                          )}>
                            {(isPaid || order.status === 'paid') ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => router.push(`/orders/${order.id}`)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                              title="View order"
                            >
                              <Icon.Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setPaymentDialog({ open: true, order })}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-200"
                              title="Add payment"
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

      {/* Edit Customer Modal */}
      <Modal open={editing} onClose={() => setEditing(false)}>
        <EditCustomerForm
          customer={customer}
          onCancel={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      </Modal>

      {/* Create Order Modal - Placeholder */}
      <Modal open={creatingOrder} onClose={() => setCreatingOrder(false)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Create New Order</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a new order for {customer.first_name} {customer.last_name}.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setCreatingOrder(false)} 
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setCreatingOrder(false);
                router.push(`/orders/create?customer_id=${customerId}`);
              }}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Create Order
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Dialog */}
      {paymentDialog.open && (
        <PaymentDialog 
          order={paymentDialog.order}
          customer={customer}
          onClose={() => setPaymentDialog({ open: false, order: null })}
          onSuccess={() => {
            setPaymentDialog({ open: false, order: null });
            fetchOrders(); // Refresh orders to show updated payment info
            showToast("Payment recorded successfully!", "success");
          }}
          authHeaders={authHeaders}
          api={api}
        />
      )}

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
    </Layout>
  );
}
