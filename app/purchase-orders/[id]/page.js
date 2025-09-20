"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";
import PaymentDialog from "../../components/PaymentDialog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
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
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2S8.357 4.237 7.534 7.5" />
      <path d="M2 3h20v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V3Z" />
      <path d="M7 14h.01" />
      <path d="M12 14h.01" />
      <path d="M17 14h.01" />
      <path d="M22 9v.01" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchOrderDetails() {
    try {
      setLoading(true);
      const res = await fetch(api(`/api/purchase-orders/${orderId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load purchase order (${res.status})`);
      
      const data = await res.json();
      const orderData = data.data || data;
      setOrder(orderData);
      
      // Extract items from the order response
      if (orderData.items) {
        setOrderItems(orderData.items);
      }
    } catch (e) {
      setError(e?.message || "Failed to load purchase order");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderItems() {
    try {
      // Order items are included in the main order response
      // This function is kept for future use if needed
    } catch (e) {
      console.error("Failed to load order items:", e);
    }
  }

  async function fetchPayments() {
    try {
      const res = await fetch(api(`/api/payments?purchase_order_id=${orderId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load payments (${res.status})`);
      
      const data = await res.json();
      setPayments(data.data || data || []);
    } catch (e) {
      console.error("Failed to load payments:", e);
    }
  }

  async function deletePurchaseOrder() {
    try {
      setIsDeleting(true);
      const res = await fetch(api(`/api/purchase-orders/${orderId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete purchase order (${res.status})`);
      }
      
      router.push("/purchase-orders");
    } catch (e) {
      setError(e?.message || "Failed to delete purchase order");
    } finally {
      setIsDeleting(false);
    }
  }

  function openPaymentModal() {
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
  }

  function handlePaymentSuccess() {
    closePaymentModal();
    fetchOrderDetails();
    fetchPayments();
  }

  async function updateOrderStatus(newStatus) {
    // Show confirmation for "received" status
    if (newStatus === 'received' && order.status !== 'received') {
      const confirmed = window.confirm(
        'Changing status to "received" will update product stock quantities. This action cannot be undone. Continue?'
      );
      if (!confirmed) return;
    }

    // Show confirmation for "cancelled" status
    if (newStatus === 'cancelled' && order.status === 'received') {
      const confirmed = window.confirm(
        'Changing status to "cancelled" will remove products from stock that were added when the order was received. This action cannot be undone. Continue?'
      );
      if (!confirmed) return;
    }

    try {
      setIsUpdatingStatus(true);
      const res = await fetch(api(`/api/purchase-orders/${orderId}/status`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update status (${res.status})`);
      }
      
                     setShowStatusModal(false);
               fetchOrderDetails();
    } catch (e) {
      setError(e?.message || "Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

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

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  function openPaymentModal() {
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
  }

  function handlePaymentSuccess() {
    closePaymentModal();
    fetchOrderDetails();
    fetchPayments();
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchPayments();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Layout title="Purchase Order Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading purchase order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Purchase Order Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6">
              <p className="text-rose-400 mb-4">{error}</p>
              <button
                onClick={() => router.push("/purchase-orders")}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              >
                Back to Purchase Orders
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Purchase Order Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Purchase order not found</p>
            <button
              onClick={() => router.push("/purchase-orders")}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Back to Purchase Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalAmount = parseFloat(order.total || 0);
  // Calculate total paid from payments array
  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  const balance = Math.max(0, totalAmount - totalPaid);
  const isPaid = totalPaid >= totalAmount;

  return (
    <Layout title={`Purchase Order #${order.id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/purchase-orders")}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <Icon.ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Purchase Order #{order.id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Created on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
                         <button
               onClick={openPaymentModal}
               className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/20 dark:bg-gray-700 dark:hover:bg-gray-600"
             >
               <Icon.DollarSign className="h-4 w-4" />
               Add Payment
             </button>
                         <button
              onClick={openPaymentModal}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/20 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Icon.DollarSign className="h-4 w-4" />
              Add Payment
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Icon.Edit className="h-4 w-4" />
              {isUpdatingStatus ? "Updating..." : "Change Status"}
            </button>
             <button
               onClick={() => setDeletingOrder(order)}
               disabled={order.status === 'received'}
               className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
               title={order.status === 'received' ? "Cannot delete received orders" : "Delete order"}
             >
               <Icon.Trash className="h-4 w-4" />
               Delete
             </button>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Icon.Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
                <Icon.DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Balance</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                <Icon.Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Payment Status</p>
                <span className={cn(
                  "inline-block rounded-xl px-3 py-1 text-xs font-medium mt-1",
                  isPaid && "bg-emerald-500/10 text-emerald-500",
                  !isPaid && "bg-amber-500/10 text-amber-500"
                )}>
                  {isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Icon.DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Status</p>
                <span className={cn(
                  "inline-block rounded-xl px-3 py-1 text-xs font-medium mt-1",
                  order.status === "received" && "bg-emerald-500/10 text-emerald-500",
                  order.status === "ordered" && "bg-blue-500/10 text-blue-500",
                  order.status === "pending" && "bg-amber-500/10 text-amber-500",
                  order.status === "cancelled" && "bg-rose-500/10 text-rose-500"
                )}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Icon.Building className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Supplier Information</h2>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Icon.Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {order.supplier_name || `Supplier #${order.supplier_id}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Supplier ID: {order.supplier_id}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200/60 dark:border-white/10">
            <h2 className="text-xl font-semibold">Order Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  <th className="px-6 py-4 font-medium">Unit Price</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No items found for this order
                    </td>
                  </tr>
                ) : (
                  orderItems.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200/60 dark:border-white/10">
                                             <td className="px-6 py-4">
                         <div>
                           <div className="font-medium text-gray-900 dark:text-white">
                             {item.product_name || `Product #${item.product_id}`}
                           </div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">
                             Product ID: {item.product_id}
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                         {item.quantity}
                       </td>
                       <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                         {formatCurrency(item.cost_price || item.unit_price || 0)}
                       </td>
                       <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                         {formatCurrency(item.total_price || (item.quantity * (item.cost_price || item.unit_price || 0)))}
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200/60 dark:border-white/10">
            <h2 className="text-xl font-semibold">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No payments recorded yet
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-gray-200/60 dark:border-white/10">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {payment.payment_method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {payment.reference || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingOrder(null)} />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
              <h3 className="text-lg font-semibold mb-4">Delete Purchase Order</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete purchase order <span className="font-medium">#{deletingOrder.id}</span>? 
                This action will:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>• Remove the purchase order from the system</li>
                <li>• Delete products that were only created by this order</li>
                <li>• Reduce stock quantities for products used by other orders</li>
                <li>• This action cannot be undone</li>
              </ul>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDeletingOrder(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={deletePurchaseOrder}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
              <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Current status: <span className="font-medium">{order.status}</span>
              </p>
              
              <div className="space-y-3 mb-6">
                {[
                  { status: 'pending', description: 'Order is being prepared' },
                  { status: 'ordered', description: 'Order has been placed with supplier' },
                  { status: 'received', description: 'Items have been received and stock updated' },
                  { status: 'cancelled', description: order.status === 'received' ? 'Order cancelled - removes products from stock' : 'Order has been cancelled' }
                ].map(({ status, description }) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={isUpdatingStatus || status === order.status}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      status === order.status
                        ? 'bg-indigo-500 text-white cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                                         <div className="flex items-center justify-between">
                       <div>
                         <span className="capitalize font-medium">{status}</span>
                         <p className="text-xs opacity-75 mt-1">{description}</p>
                       </div>
                       <div className="flex items-center gap-2">
                         {status === 'cancelled' && order.status === 'received' && (
                           <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">⚠️ Stock Impact</span>
                         )}
                         {status === order.status && (
                           <span className="text-xs bg-white/20 px-2 py-1 rounded">Current</span>
                         )}
                       </div>
                     </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowStatusModal(false)}
                  disabled={isUpdatingStatus}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Dialog */}
        {showPaymentModal && (
          <PaymentDialog
            order={order}
            onClose={closePaymentModal}
            onSuccess={handlePaymentSuccess}
            authHeaders={authHeaders}
            api={api}
          />
        )}
      </div>
    </Layout>
  );
}
