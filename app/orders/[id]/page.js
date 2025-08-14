"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";

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
      const res = await fetch(api(`/api/orders/${orderId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load order (${res.status})`);
      const data = await res.json();
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
      setError(error.message || "Failed to delete payment");
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
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    };
    return styles[status] || styles.pending;
  }

  if (loading) {
    return (
      <Layout title="View Order">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading order...</p>
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
            <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-4">
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

  return (
    <Layout title={`Order #${order.id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/orders")}
              className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Order #{order.id}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.order_date)}
              </p>
            </div>
          </div>
                     <div className="flex items-center gap-3">
             <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(order.status)}`}>
               {order.status}
             </span>
             <button
               onClick={() => router.push(`/orders/${order.id}/edit`)}
               className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
             >
               <Icon.Edit className="h-4 w-4" />
               Edit
             </button>
             <button
               onClick={() => setDeleteOrderConfirm(true)}
               className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
             >
               <Icon.Trash className="h-4 w-4" />
               Delete
             </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-3">
              {/* Order Information Card */}
              <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icon.Package className="h-5 w-5 text-indigo-500" />
                    Order Details
                  </h2>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {order.payment_method || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Items Count</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.items?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Paid</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      ${parseFloat(order.total_paid || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                    <p className={`text-sm font-medium ${parseFloat(order.remaining || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      ${parseFloat(order.remaining || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Customer Info */}
            <div className="lg:col-span-1">
              {/* Customer Information */}
              <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Icon.User className="h-5 w-5 text-indigo-500" />
                  Customer
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.first_name} {order.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Icon.Phone className="h-3 w-3 text-gray-400" />
                      {order.phone_number || "No phone"}
                    </p>
                  </div>
                  {order.address && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
                      <p className="text-sm text-gray-900 dark:text-white flex items-start gap-2">
                        <Icon.MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{order.address}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

                     {/* Order Items - Full Width */}
           <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-5">
             <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <Icon.Package className="h-5 w-5 text-indigo-500" />
               Order Items ({order.items?.length || 0})
             </h2>
            
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {/* Order Items Header Row */}
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium text-sm">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="text-center min-w-[120px]">
                      <p className="text-gray-700 dark:text-gray-300">Product</p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <p className="text-gray-700 dark:text-gray-300">Category</p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="text-gray-700 dark:text-gray-300">Quantity</p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <p className="text-gray-700 dark:text-gray-300">Unit Price</p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <p className="text-gray-700 dark:text-gray-300">Discount</p>
                    </div>
                    <div className="text-center min-w-[120px]">
                      <p className="text-gray-700 dark:text-gray-300">Total</p>
                    </div>
                  </div>
                </div>
                
                                 {order.items.map((item, index) => (
                   <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                     <div className="flex items-center justify-between w-full gap-4">
                       <div className="text-center min-w-[120px]">
                         <p className="font-medium text-gray-900 dark:text-white text-sm">
                           {item.product_name || `Product #${item.product_id}`}
                         </p>
                       </div>
                       <div className="text-center min-w-[100px]">
                         <p className="font-medium text-gray-900 dark:text-white text-sm">
                           {item.category_name || 'N/A'}
                         </p>
                       </div>
                       <div className="text-center min-w-[80px]">
                         <p className="font-medium text-gray-900 dark:text-white">
                           {item.quantity}
                         </p>
                       </div>
                       <div className="text-center min-w-[100px]">
                         <p className="font-medium text-gray-900 dark:text-white">
                           ${parseFloat(item.unit_price || item.product_price || 0).toFixed(2)}
                         </p>
                       </div>
                       <div className="text-center min-w-[100px]">
                         <p className="font-medium text-gray-900 dark:text-white">
                           ${parseFloat(item.discount || 0).toFixed(2)}
                         </p>
                       </div>
                       <div className="text-center min-w-[120px]">
                         <p className="font-bold text-gray-900 dark:text-white text-lg">
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
          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon.CreditCard className="h-5 w-5 text-indigo-500" />
                Payments ({order.payments?.length || 0})
              </h2>
              <button
                onClick={() => router.push(`/orders/${order.id}/add-payment`)}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
              >
                <Icon.Plus className="h-4 w-4" />
                Add Payment
              </button>
            </div>
            
            {order.payments && order.payments.length > 0 ? (
              <div className="space-y-3">
                                 {/* Payments Header Row */}
                 <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium text-sm">
                   <div className="flex items-center justify-between w-full gap-6">
                     <div className="text-center flex-1">
                       <p className="text-gray-700 dark:text-gray-300">Amount</p>
                     </div>
                     <div className="text-center flex-1">
                       <p className="text-gray-700 dark:text-gray-300">Method</p>
                     </div>
                     <div className="text-center flex-1">
                       <p className="text-gray-700 dark:text-gray-300">Date</p>
                     </div>
                     <div className="text-center flex-1">
                       <p className="text-gray-700 dark:text-gray-300">Notes</p>
                     </div>
                   </div>
                   <div className="min-w-[40px]"></div>
                 </div>
                
                                 {order.payments.map((payment, index) => (
                   <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                     <div className="flex items-center justify-between w-full gap-6">
                       <div className="text-center flex-1">
                         <p className="font-bold text-gray-900 dark:text-white text-lg">
                           ${parseFloat(payment.amount || 0).toFixed(2)}
                         </p>
                       </div>
                       <div className="text-center flex-1">
                         <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                           {payment.payment_method || 'Not specified'}
                         </p>
                       </div>
                       <div className="text-center flex-1">
                         <p className="text-sm text-gray-900 dark:text-white">
                           {payment.formatted_date || formatDate(payment.payment_date)}
                         </p>
                       </div>
                       <div className="text-center flex-1">
                         <p className="text-sm text-gray-900 dark:text-white">
                           {payment.notes || 'No notes'}
                         </p>
                       </div>
                     </div>
                     <button
                       onClick={() => setDeleteConfirm(payment.id)}
                       className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                       title="Delete Payment"
                     >
                       <Icon.Trash className="h-4 w-4" />
                     </button>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No payments found for this order
                </p>
                <button
                  onClick={() => router.push(`/orders/${order.id}/add-payment`)}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-600 transition-colors"
                >
                  Add First Payment
                </button>
              </div>
            )}
          </div>
        </div>

                 {/* Delete Payment Confirmation Modal */}
         {deleteConfirm && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                 Delete Payment
               </h3>
               <p className="text-gray-600 dark:text-gray-400 mb-4">
                 Are you sure you want to delete Payment #{deleteConfirm}? This action cannot be undone.
               </p>
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Type "confirm" to delete
                 </label>
                 <input
                   type="text"
                   value={confirmText}
                   onChange={(e) => setConfirmText(e.target.value)}
                   className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                   placeholder="Type 'confirm' to delete"
                 />
               </div>
               <div className="flex gap-4">
                 <button
                   onClick={() => {
                     setDeleteConfirm(null);
                     setConfirmText("");
                   }}
                   className="flex-1 rounded-xl bg-gray-500 px-4 py-3 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => deletePayment(deleteConfirm)}
                   disabled={confirmText !== "confirm"}
                   className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Delete
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Delete Order Confirmation Modal */}
         {deleteOrderConfirm && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                 Delete Order
               </h3>
               <p className="text-gray-600 dark:text-gray-400 mb-4">
                 Are you sure you want to delete Order #{order.id}? This action cannot be undone and will delete all associated payments and items.
               </p>
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Type "confirm" to delete
                 </label>
                 <input
                   type="text"
                   value={deleteOrderText}
                   onChange={(e) => setDeleteOrderText(e.target.value)}
                   className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                   placeholder="Type 'confirm' to delete"
                 />
               </div>
               <div className="flex gap-4">
                 <button
                   onClick={() => {
                     setDeleteOrderConfirm(false);
                     setDeleteOrderText("");
                   }}
                   className="flex-1 rounded-xl bg-gray-500 px-4 py-3 text-sm font-medium text-white hover:bg-gray-600 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => deleteOrder()}
                   disabled={deleteOrderText !== "confirm"}
                   className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Delete
                 </button>
               </div>
             </div>
           </div>
         )}

        {/* Success Alert */}
        {successAlert.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg max-w-md transition-all duration-300 bg-green-500 text-white">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
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
      </div>
    </Layout>
  );
}
