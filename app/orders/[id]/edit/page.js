"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Save: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
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
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    status: "pending",
    payment_method: "cash",
    notes: ""
  });

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
      setFormData({
        status: data.data.status || "pending",
        payment_method: data.data.payment_method || "cash",
        notes: data.data.notes || ""
      });
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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const methodLower = (formData.payment_method || '').toLowerCase();
      const payload = { ...formData, payment_method: (methodLower === 'whish' || methodLower === 'wish') ? 'cash' : methodLower };
      const res = await fetch(api(`/api/orders/${orderId}/status`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update order");
      }

      // Redirect to view order page
      router.push(`/orders/${orderId}`);
    } catch (error) {
      setError(error.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  if (loading) {
    return (
      <Layout title="Edit Order">
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
      <Layout title="Edit Order">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-4">
              {error || "Order not found"}
            </p>
                         <button
               onClick={() => router.push(`/orders/${orderId}`)}
               className="rounded-2xl bg-indigo-500 px-6 py-3 text-white font-medium hover:bg-indigo-600 transition-colors"
             >
               Back to Order
             </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Order #${order.id}`}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
                     <button
             onClick={() => router.push(`/orders/${orderId}`)}
             className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
           >
             <Icon.ArrowLeft className="h-5 w-5" />
             Back to Order
           </button>
          <div>
            <h1 className="text-gray-600 dark:text-gray-400 text-lg">
              Edit Order #{order.id}
            </h1>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Update order information and status
            </p>
          </div>
        </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Edit Form */}
           <div className="lg:col-span-2">
             <form onSubmit={handleSubmit} className="h-full flex flex-col">
                               <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <Icon.Package className="h-5 w-5 text-indigo-500" />
                    Order Information
                  </h2>
                 
                                   <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Method
                      </label>
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="Whish">Whish</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white h-full min-h-[120px]"
                        placeholder="Add any additional notes about this order..."
                      />
                    </div>
                  </div>
               </div>

                               {/* Submit Button */}
                <div className="flex gap-4 mt-4">
                 <button
                   type="button"
                   onClick={() => router.push(`/orders/${orderId}`)}
                   className="flex-1 rounded-2xl bg-red-500 px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-red-600 transition-all duration-200"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={saving}
                   className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {saving ? (
                     <>
                       <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                       Saving...
                     </>
                   ) : (
                     <>
                       <Icon.Save className="h-5 w-5" />
                       Save Changes
                     </>
                   )}
                 </button>
               </div>
             </form>
           </div>

                       {/* Order Summary */}
            <div className="h-full flex flex-col space-y-4">
                         {/* Customer Information */}
             <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                 <Icon.User className="h-5 w-5 text-indigo-500" />
                 Customer Information
               </h2>
               
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                     <Icon.User className="h-3 w-3 text-white" />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Name</p>
                     <p className="text-sm font-bold text-gray-900 dark:text-white">
                       {order.first_name} {order.last_name}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                     <Icon.Phone className="h-3 w-3 text-white" />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Phone</p>
                     <p className="text-sm text-gray-900 dark:text-white">
                       {order.phone_number || "No phone"}
                     </p>
                   </div>
                 </div>
                 {order.address && (
                   <div className="flex items-center gap-3">
                     <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                       <Icon.MapPin className="h-3 w-3 text-white" />
                     </div>
                     <div>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Address</p>
                       <p className="text-sm text-gray-900 dark:text-white">
                         {order.address}
                       </p>
                     </div>
                   </div>
                 )}
               </div>
            </div>

                                                   {/* Order Summary */}
              <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4 flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">#{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-bold text-lg text-white">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Paid Amount:</span>
                    <span className="font-bold text-base text-white">
                      ${parseFloat(order.total_paid || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remaining:</span>
                    <span className={`font-bold text-base ${parseFloat(order.total_paid || 0) >= parseFloat(order.total_amount || 0) ? 'text-white' : 'text-red-600 dark:text-red-400'}`}>
                      ${Math.max(0, parseFloat(order.total_amount || 0) - parseFloat(order.total_paid || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {order.items?.length || 0}
                    </span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}
