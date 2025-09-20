"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";
import PaymentDialog from "../../components/PaymentDialog";
import PaymentReceipt from "../../components/PaymentReceipt";
import ConfirmDialog from "../../components/ConfirmDialog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
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
  CreditCard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Receipt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
};

export default function ViewOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [successAlert, setSuccessAlert] = useState({ show: false, message: "" });
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState(false);
  const [deleteOrderText, setDeleteOrderText] = useState("");
  const [productDialog, setProductDialog] = useState({ show: false, product: null });
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState({ show: false, payment: null });
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    details: true,
    customer: true,
    items: true,
    payments: true,
  });
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchOrder() {
    try {
      // First, fetch the order with items
      const res = await fetch(api(`/api/orders/${orderId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load order (${res.status})`);
      const data = await res.json();
      // Debug log
      
      // If we have items, try to fetch category information for each item
      if (data.data.items && data.data.items.length > 0) {
        // Debug log for items
        
        // Try to fetch category data for each item
        const itemsWithCategories = await Promise.all(
          data.data.items.map(async (item) => {
            if (item.product_id) {
              try {
                const productRes = await fetch(api(`/api/products/${item.product_id}`), {
                  headers: authHeaders(),
                  cache: "no-store",
                });
                if (productRes.ok) {
                  const productData = await productRes.json();
                  return {
                    ...item,
                    category_name: productData.data?.category?.name || productData.data?.category_name || item.category_name
                  };
                }
              } catch (error) {

              }
            }
            return item;
          })
        );
        
        data.data.items = itemsWithCategories;
      }
      
      setOrder(data.data);
    } catch (e) {
      setError(e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  async function deletePayment(paymentId) {
    try {
      const res = await fetch(api(`/api/payments/${paymentId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete payment");
      }
      
      await fetchOrder();
      setDeleteConfirm(null);
      setConfirmText("");
      
      setSuccessAlert({ show: true, message: "Payment deleted successfully!" });
      setTimeout(() => setSuccessAlert({ show: false, message: "" }), 3000);
    } catch (error) {
      // Show error in a more user-friendly way
      setSuccessAlert({ show: true, message: error.message || "Failed to delete payment" });
      setTimeout(() => setSuccessAlert({ show: false, message: "" }), 5000);
      setDeleteConfirm(null);
      setConfirmText("");
    }
  }

  async function deleteOrder() {
    try {
      const res = await fetch(api(`/api/orders/${orderId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete order");
      }
      
      setSuccessAlert({ show: true, message: "Order deleted successfully!" });
      setTimeout(() => {
        setSuccessAlert({ show: false, message: "" });
        router.push("/orders");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to delete order");
    }
  }

  async function fetchProductDetails(productId) {
    try {
      const res = await fetch(api(`/api/products/${productId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (!res.ok) {
        throw new Error(`Failed to load product (${res.status})`);
      }
      
      const data = await res.json();
      setProductDialog({ show: true, product: data.data });
    } catch (error) {
      console.error("Error fetching product details:", error);
      setSuccessAlert({ show: true, message: "Failed to load product details" });
      setTimeout(() => setSuccessAlert({ show: false, message: "" }), 3000);
    }
  }

  async function generateReceipt() {
    setGeneratingReceipt(true);
    try {
      // Create receipt content
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt - Order #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .receipt-info { font-size: 14px; color: #666; }
            .customer-info { margin-bottom: 30px; }
            .customer-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .customer-details { font-size: 14px; color: #666; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .total-section { text-align: right; margin-top: 20px; }
            .total-row { font-size: 16px; margin-bottom: 5px; }
            .grand-total { font-size: 20px; font-weight: bold; margin-top: 10px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="receipt-title">RECEIPT</div>
            <div class="receipt-info">
              Order #${order.id}<br>
              Date: ${formatDate(order.order_date)}<br>
              Payment Method: ${order.payment_method || 'Not specified'}
            </div>
          </div>
          
          <div class="customer-info">
            <div class="customer-name">${order.first_name} ${order.last_name}</div>
            <div class="customer-details">
              ${order.phone_number ? `Phone: ${order.phone_number}<br>` : ''}
              ${order.address ? `Address: ${order.address}` : ''}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.product_name || `Product #${item.product_id}`}</td>
                  <td>${item.category_name || item.category?.name || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>$${parseFloat(item.unit_price || item.product_price || 0).toFixed(2)}</td>
                  <td>$${parseFloat(item.discount || 0).toFixed(2)}</td>
                  <td>$${((parseFloat(item.unit_price || item.product_price || 0) * item.quantity) - parseFloat(item.discount || 0)).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">Subtotal: $${(order.items?.reduce((sum, item) => sum + (parseFloat(item.unit_price || item.product_price || 0) * item.quantity), 0) || 0).toFixed(2)}</div>
            <div class="total-row">Total Discount: $${(order.items?.reduce((sum, item) => sum + parseFloat(item.discount || 0), 0) || 0).toFixed(2)}</div>
            <div class="total-row">Total Paid: $${parseFloat(order.total_paid || 0).toFixed(2)}</div>
            <div class="total-row">Remaining: $${parseFloat(order.remaining || 0).toFixed(2)}</div>
            <div class="grand-total">Grand Total: $${parseFloat(order.total_amount || 0).toFixed(2)}</div>
          </div>
          
          <div class="footer">
            Thank you for your business!<br>
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
        </html>
      `;

      // Create a blob from the HTML content
      const blob = new Blob([receiptContent], { type: 'text/html' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-order-${order.id}.html`;
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      setSuccessAlert({ show: true, message: "Receipt generated successfully!" });
      setTimeout(() => setSuccessAlert({ show: false, message: "" }), 3000);
    } catch (error) {
      console.error("Error generating receipt:", error);
      setSuccessAlert({ show: true, message: "Failed to generate receipt" });
      setTimeout(() => setSuccessAlert({ show: false, message: "" }), 3000);
    } finally {
      setGeneratingReceipt(false);
    }
  }


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

  // Get status badge styling
  function getStatusBadge(status) {
    const styles = {
      pending: "bg-yellow-500 text-white",
      completed: "bg-green-500 text-white",
      cancelled: "bg-red-500 text-white",
      processing: "bg-blue-500 text-white",
    };
    return styles[status] || styles.pending;
  }

  // Payment dialog functions
  const openPaymentModal = () => setShowPaymentModal(true);
  const closePaymentModal = () => setShowPaymentModal(false);
  
  // Receipt functions
  const openReceiptModal = (payment) => setShowReceiptModal({ show: true, payment });
  const closeReceiptModal = () => setShowReceiptModal({ show: false, payment: null });

  if (loading) {
    return (
      <Layout title="View Order">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading order...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout title="View Order">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 text-lg font-medium mb-4">
              {error || "Order not found"}
            </p>
            <button
              onClick={() => router.push("/orders")}
              className="rounded-2xl bg-indigo-500 px-6 py-3 text-white font-medium hover:bg-indigo-600 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // ALT DESIGN v2
  if (true) {
    return (
      <Layout title={`Order #${order.id}`}>
        <div className="space-y-8">
          {/* Modern Hero */}
          <div className="rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-xl overflow-hidden">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 flex items-center justify-center shadow">
                    <Icon.Package className="h-5 w-5 text-white dark:text-slate-900" />
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white">Order #{order.id}</h1>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 capitalize ${((order.status || '').toLowerCase() === 'completed') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' : ((order.status || '').toLowerCase() === 'cancelled') ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20'}`}>{((order.status || '').toLowerCase() === 'completed') ? 'paid' : (order.status || '')}</span>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-gray-200 bg-gray-50 text-gray-700 dark:ring-white/10 dark:bg-white/10 dark:text-gray-300">
                      <Icon.Calendar className="h-3.5 w-3.5 mr-1.5" />{formatDate(order.order_date)}
                    </span>
                  </div>
                </div>
                <button onClick={() => router.push('/orders')} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition">Back to Orders</button>
              </div>
              {/* Stats */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total */}
                <div className="relative group h-28 rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                  <span className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-indigo-500/15 blur-2xl" />
                  <div className="flex h-full items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 text-indigo-500 ring-1 ring-indigo-500/20 flex items-center justify-center">
                      <Icon.DollarSign className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white truncate">${parseFloat(order.total_amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Paid */}
                <div className="relative group h-28 rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                  <span className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
                  <div className="flex h-full items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/20 flex items-center justify-center">
                      <Icon.CreditCard className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Paid</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">${parseFloat(order.total_paid || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Remaining */}
                <div className="relative group h-28 rounded-3xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-5 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                  <span className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full blur-2xl bg-rose-500/15" />
                  <div className="flex h-full items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl ring-1 bg-rose-500/15 text-rose-500 ring-rose-500/20 flex items-center justify-center">
                      <Icon.DollarSign className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Remaining</p>
                      <p className="mt-1 text-2xl font-bold truncate text-rose-600 dark:text-rose-400">${parseFloat(order.remaining || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items - Full Width */}
          <div className="mt-6 rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5 overflow-hidden">
            <button onClick={() => setOpenSections(prev => ({...prev, items: !prev.items}))} className="w-full flex items-center justify-between p-5">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Icon.Package className="h-4 w-4 text-indigo-500" />
                Items ({order.items?.length || 0})
              </h2>
              <span className="text-xs text-gray-500">{openSections?.items ? 'Hide' : 'Show'}</span>
            </button>
            {openSections?.items && (
              <div className="overflow-x-auto">
                <table className="w-full text-base table-typography">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Name</th>
                      <th className="px-6 py-4 text-left font-bold">Category</th>
                      <th className="px-6 py-4 text-left font-bold">Price</th>
                      <th className="px-6 py-4 text-left font-bold">Qty</th>
                      <th className="px-6 py-4 text-left font-bold">Discount</th>
                      <th className="px-6 py-4 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                    {order.items && order.items.length > 0 ? (
                      <>
                        {order.items.map((item, index) => (
                          <tr key={index} className="transition-colors duration-200">
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => item.product_id && fetchProductDetails(item.product_id)} className="text-sm text-gray-500 dark:text-gray-400 truncate hover:underline" title={item.product_name || `Product #${item.product_id}`}>
                                {item.product_name || `Product #${item.product_id}`}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 px-2 py-0.5 text-xs font-medium">
                                {item.category_name || item.category?.name || item.category_id || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${parseFloat(item.unit_price || item.product_price || 0).toFixed(2)}</span></td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{item.quantity}</span></td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${parseFloat(item.discount || 0).toFixed(2)}</span></td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${((parseFloat(item.unit_price || item.product_price || 0) * (item.quantity || 1)) - parseFloat(item.discount || 0)).toFixed(2)}</span></td>
                          </tr>
                        ))}
                        {/* Delivery row if delivery is required */}
                        {(order.delivery_required || order.delivery_fee > 0) && (
                          <tr className="transition-colors duration-200 bg-blue-50/50 dark:bg-blue-500/10">
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span className="text-sm text-blue-900 dark:text-blue-100">Delivery</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 text-xs font-medium">
                                Service
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${parseFloat(order.delivery_fee || 0).toFixed(2)}</span></td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">1</span></td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">$0.00</span></td>
                            <td className="px-6 py-4 text-center"><span className="text-sm text-blue-900 dark:text-blue-100">${parseFloat(order.delivery_fee || 0).toFixed(2)}</span></td>
                          </tr>
                        )}
                      </>
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-gray-500 dark:text-gray-400">No items found for this order</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payments - Full Width */}
          <div className="mt-6 rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5 overflow-hidden">
            <button onClick={() => setOpenSections(prev => ({...prev, payments: !prev.payments}))} className="w-full flex items-center justify-between p-5">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Icon.CreditCard className="h-4 w-4 text-indigo-500" />
                Payments ({order.payments?.length || 0})
              </h2>
              <span className="text-xs text-gray-500">{openSections?.payments ? 'Hide' : 'Show'}</span>
            </button>
            {openSections?.payments && (
              <div className="overflow-x-auto">
                <table className="w-full text-base table-typography">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Amount</th>
                      <th className="px-6 py-4 text-left font-bold">Method</th>
                      <th className="px-6 py-4 text-left font-bold">Date</th>
                      <th className="px-6 py-4 text-left font-bold">Notes</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                    {order.payments && order.payments.length > 0 ? (
                      order.payments.map((payment, idx) => (
                        <tr key={idx} className="transition-colors duration-200">
                          <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${parseFloat(payment.amount || 0).toFixed(2)}</span></td>
                          <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{payment.payment_method || 'Not specified'}</span></td>
                          <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{payment.formatted_date || formatDate(payment.payment_date)}</span></td>
                          <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">{payment.notes || 'No notes'}</span></td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => openReceiptModal(payment)} className="text-gray-400 hover:text-green-600 p-1" title="Receipt">
                                <Icon.Receipt className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteConfirm(payment.id)} className="text-gray-400 hover:text-rose-600 p-1" title="Delete">
                                <Icon.Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-500 dark:text-gray-400">No payments found for this order</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {openSections?.payments && (
              <div className="flex items-center justify-end p-5 border-t border-gray-200/60 dark:border-white/10">
                <button
                  onClick={openPaymentModal}
                  disabled={parseFloat(order.remaining || 0) <= 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 text-xs font-medium shadow transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <Icon.Plus className="h-3.5 w-3.5" /> Add Payment
                </button>
              </div>
            )}
          </div>

          {/* Content Grid - removed per request */}
          {false && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items - removed */}
            {/* removed content here */}

            {/* removed side column here */}
          </div>
          )}

          {/* Success/Error Alert */}
          {successAlert.show && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg max-w-md transition-all duration-300 text-white ${
              successAlert.message.toLowerCase().includes('error') || 
              successAlert.message.toLowerCase().includes('cannot') || 
              successAlert.message.toLowerCase().includes('failed') 
                ? 'bg-rose-500' : 'bg-emerald-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {successAlert.message.toLowerCase().includes('error') || 
                   successAlert.message.toLowerCase().includes('cannot') || 
                   successAlert.message.toLowerCase().includes('failed') ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{successAlert.message}</p>
                </div>
                <button
                  onClick={() => setSuccessAlert({ show: false, message: "" })}
                  className="flex-shrink-0 text-white/80 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={Boolean(deleteConfirm)}
            title="Delete Payment"
            description={deleteConfirm ? `Are you sure you want to delete Payment #${deleteConfirm}? This action cannot be undone.` : ""}
            confirmLabel="Delete"
            requireText
            keyword="confirm"
            destructive
            onConfirm={() => { if (deleteConfirm) deletePayment(deleteConfirm); }}
            onClose={() => { setDeleteConfirm(null); setConfirmText(""); }}
          />

          {/* Product Details Dialog */}
          {productDialog.show && productDialog.product && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Product Details</h3>
                  <button
                    onClick={() => setProductDialog({ show: false, product: null })}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-64 h-64 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img
                        src={(productDialog.product.image || productDialog.product.image_url) || "/placeholder-product.png"}
                        alt={productDialog.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/placeholder-product.png"; }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{productDialog.product.name}</h4>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {productDialog.product.category?.name || productDialog.product.category_name || 'No Category'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Price</p>
                      <p className="font-semibold">${parseFloat(productDialog.product.price || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Cost</p>
                      <p className="font-semibold">${parseFloat(productDialog.product.cost || productDialog.product.cost_price || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Stock</p>
                      <p className="font-semibold">{productDialog.product.stock ?? productDialog.product.quantity_in_stock ?? 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">SKU</p>
                      <p className="font-semibold">{productDialog.product.sku || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Barcode</p>
                      <p className="font-semibold">{productDialog.product.barcode || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Supplier</p>
                      <p className="font-semibold">{productDialog.product.supplier_name || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Reorder Level</p>
                      <p className="font-semibold">{productDialog.product.reorder_level ?? '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Product ID</p>
                      <p className="font-semibold">{productDialog.product.id}</p>
                    </div>
                  </div>
                  {productDialog.product.description && (
                    <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Description</p>
                      <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{productDialog.product.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Dialog */}
          {showPaymentModal && (
            <PaymentDialog 
              order={order}
              customer={null}
              onClose={closePaymentModal}
              onSuccess={() => { closePaymentModal(); fetchOrder(); }}
              authHeaders={authHeaders}
              api={api}
            />
          )}

          {/* Payment Receipt Dialog */}
          {showReceiptModal.show && showReceiptModal.payment && (
            <PaymentReceipt
              payment={showReceiptModal.payment}
              order={order}
              onClose={closeReceiptModal}
              onSuccess={(message) => {
                setSuccessAlert({ show: true, message });
                setTimeout(() => setSuccessAlert({ show: false, message: "" }), 3000);
                closeReceiptModal();
              }}
            />
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Order #${order.id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/orders")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-white/20 transition-all duration-200 group"
            >
              <Icon.ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Orders</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Icon.Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Order #{order.id}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Icon.Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {formatDate(order.order_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card - Order Details */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  Order Details
                </h2>
              </div>
              
              {/* Order Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Order Date */}
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Order Date</p>
                  <p className="font-medium">{formatDate(order.order_date)}</p>
                </div>
                
                {/* Payment Method */}
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.payment_method || "Not specified"}
                  </p>
                </div>
                
                {/* Items Count */}
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Items Count</p>
                  <p className="font-medium text-lg">
                    {order.items?.length || 0} items
                  </p>
                </div>
                
                {/* Total Paid */}
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Paid</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-lg">
                    ${parseFloat(order.total_paid || 0).toFixed(2)}
                  </p>
                </div>
                
                {/* Remaining - Full Width */}
                <div className="col-span-2 p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Remaining</p>
                  <p className={`font-medium text-lg ${parseFloat(order.remaining || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ${parseFloat(order.remaining || 0).toFixed(2)}
                  </p>
                </div>
                
                {/* Order Status - Full Width */}
                <div className="col-span-2 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Order Status</p>
                    </div>
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg capitalize">{(order.status || '').toLowerCase() === 'completed' ? 'paid' : (order.status || '')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Customer Info */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5 p-6 h-full">
              <h2 className="text-xl font-bold mb-6">
                Customer
              </h2>
              
              {/* Customer Profile */}
              <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Icon.User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Customer #{order.customer_id || order.id}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Phone Number</p>
                  <p className="font-medium">
                    {order.phone_number || "No phone provided"}
                  </p>
                </div>
                
                {order.address && (
                  <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Address</p>
                    <p className="font-medium">
                      {order.address}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Customer Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Orders</p>
                  <p className="font-bold text-lg">1</p>
                </div>
                
                <div className="p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Spent</p>
                  <p className="font-bold text-lg">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items - Full Width */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5 p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Icon.Package className="h-5 w-5 text-indigo-500" />
            Order Items ({order.items?.length || 0})
          </h2>
          
          {order.items && order.items.length > 0 ? (
            <div className="space-y-3">
              {/* Order Items Header Row */}
              <div className="flex items-center justify-between p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl font-medium text-sm">
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="text-center min-w-[120px]">
                    <p className="text-gray-600 dark:text-gray-400">Product</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-gray-600 dark:text-gray-400">Category</p>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <p className="text-gray-600 dark:text-gray-400">Quantity</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-gray-600 dark:text-gray-400">Unit Price</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-gray-600 dark:text-gray-400">Discount</p>
                  </div>
                  <div className="text-center min-w-[120px]">
                    <p className="text-gray-600 dark:text-gray-400">Total</p>
                  </div>
                </div>
              </div>
              
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between w-full gap-4">
                                         <div className="text-center min-w-[120px]">
                       <button
                         onClick={() => {
                           if (item.product_id) {
                             fetchProductDetails(item.product_id);
                           }
                         }}
                         className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
                       >
                         {item.product_name || `Product #${item.product_id}`}
                       </button>
                     </div>
                    <div className="text-center min-w-[100px]">
                      <p className="font-medium text-sm">
                        {item.category_name || item.category?.name || item.category_id || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="font-medium">
                        {item.quantity}
                      </p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <p className="font-medium">
                        ${parseFloat(item.unit_price || item.product_price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <p className="font-medium">
                        ${parseFloat(item.discount || 0).toFixed(2)}
                      </p>
                    </div>
                                         <div className="text-center min-w-[120px]">
                       <p className="font-medium text-sm">
                         ${((parseFloat(item.unit_price || item.product_price || 0) * item.quantity) - parseFloat(item.discount || 0)).toFixed(2)}
                       </p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">
              No items found for this order
            </p>
          )}
        </div>

        {/* Payments Section - Full Width */}
        <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon.CreditCard className="h-5 w-5 text-indigo-500" />
              Payments ({order.payments?.length || 0})
            </h2>
            <button
              onClick={openPaymentModal}
              disabled={parseFloat(order.remaining || 0) <= 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Icon.Plus className="h-4 w-4" />
              {order.payments && order.payments.length > 0 ? 'Add Payment' : 'Add First Payment'}
            </button>
          </div>
          
          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-3">
              {/* Payments Header Row */}
              <div className="flex items-center justify-between p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl font-medium text-sm">
                <div className="flex items-center justify-between w-full gap-6">
                  <div className="text-center flex-1">
                    <p className="text-gray-600 dark:text-gray-400">Amount</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-gray-600 dark:text-gray-400">Method</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-gray-600 dark:text-gray-400">Date</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-gray-600 dark:text-gray-400">Notes</p>
                  </div>
                </div>
                <div className="min-w-[120px] text-center">
                  <p className="text-gray-600 dark:text-gray-400">Actions</p>
                </div>
              </div>
              
              {order.payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/60 dark:bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between w-full gap-6">
                    <div className="text-center flex-1">
                      <p className="font-bold text-lg">
                        ${parseFloat(payment.amount || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-sm font-medium capitalize">
                        {payment.payment_method || 'Not specified'}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-sm">
                        {payment.formatted_date || formatDate(payment.payment_date)}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-sm">
                        {payment.notes || 'No notes'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 min-w-[120px] justify-center">
                                         <button
                       onClick={() => openReceiptModal(payment)}
                       className="text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg p-2 transition-all duration-200"
                       title="Generate Payment Receipt"
                     >
                       <Icon.Receipt className="h-4 w-4" />
                     </button>
                    <button
                      onClick={() => setDeleteConfirm(payment.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg p-2 transition-all duration-200"
                      title="Delete Payment"
                    >
                      <Icon.Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No payments found for this order
              </p>
            </div>
          )}
        </div>

        {/* Delete Payment Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-lg rounded-3xl bg-black p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                Delete Payment
              </h3>
              <p className="text-white mb-4">
                Are you sure you want to delete Payment #{deleteConfirm}? This action cannot be undone.
              </p>
              <p className="text-white mb-4">
                Type "confirm" to delete
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-2xl border border-red-500 bg-gray-900 px-4 py-3 text-base outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 text-white mb-6"
                placeholder="Type 'confirm' to delete"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null);
                    setConfirmText("");
                  }}
                  className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletePayment(deleteConfirm)}
                  disabled={confirmText !== "confirm"}
                  className="flex-1 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={Boolean(deleteOrderConfirm)}
          title="Delete Order"
          description={`Are you sure you want to delete Order #${order.id}? This action cannot be undone and will delete all associated payments and items.`}
          confirmLabel="Delete"
          requireText
          keyword="confirm"
          destructive
          onConfirm={() => deleteOrder()}
          onClose={() => { setDeleteOrderConfirm(false); setDeleteOrderText(""); }}
        />

        {/* Success/Error Alert */}
        {successAlert.show && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg max-w-md transition-all duration-300 text-white ${
            successAlert.message.toLowerCase().includes('error') || 
            successAlert.message.toLowerCase().includes('cannot') || 
            successAlert.message.toLowerCase().includes('failed') 
              ? 'bg-rose-500' : 'bg-emerald-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {successAlert.message.toLowerCase().includes('error') || 
                 successAlert.message.toLowerCase().includes('cannot') || 
                 successAlert.message.toLowerCase().includes('failed') ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{successAlert.message}</p>
              </div>
              <button
                onClick={() => setSuccessAlert({ show: false, message: "" })}
                className="flex-shrink-0 text-white/80 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
                 )}

        {/* Product Details Dialog */}
        {productDialog.show && productDialog.product && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  Product Details
                </h3>
                <button
                  onClick={() => setProductDialog({ show: false, product: null })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Product Image */}
                <div className="flex justify-center">
                  <div className="w-64 h-64 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <img
                      src={(productDialog.product.image || productDialog.product.image_url) || "/placeholder-product.png"}
                      alt={productDialog.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.png";
                      }}
                    />
                  </div>
                </div>
                
                {/* Product Information */}
                <div className="space-y-4">
                  {/* Product Name */}
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {productDialog.product.name}
                    </h4>
                  </div>
                  
                  {/* Category */}
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {productDialog.product.category?.name || productDialog.product.category_name || 'No Category'}
                    </span>
                  </div>
                  
                  {/* Description */}
                  {productDialog.product.description && (
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {productDialog.product.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${parseFloat(productDialog.product.price || 0).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">SKU</p>
                      <p className="font-medium">{productDialog.product.sku || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Stock</p>
                      <p className="font-medium">{productDialog.product.stock_quantity || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Payment Dialog */}
         {showPaymentModal && (
           <PaymentDialog 
             order={order}
             customer={null} // Order details page doesn't have customer object, but order has customer info
             onClose={closePaymentModal}
             onSuccess={() => {
               closePaymentModal();
               fetchOrder(); // Refresh order to show updated payment info
             }}
             authHeaders={authHeaders}
             api={api}
           />
         )}

         {/* Payment Receipt Dialog */}
         {showReceiptModal.show && showReceiptModal.payment && (
           <PaymentReceipt
             payment={showReceiptModal.payment}
             order={order}
             onClose={closeReceiptModal}
             onSuccess={(message) => {
               setSuccessAlert({ show: true, message });
               setTimeout(() => setSuccessAlert({ show: false, message: "" }), 3000);
               closeReceiptModal();
             }}
           />
         )}
       </div>
     </Layout>
   );
 }
