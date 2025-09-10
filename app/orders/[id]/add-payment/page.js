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
  CreditCard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
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
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
    </svg>
  ),
};

export default function AddPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successAlert, setSuccessAlert] = useState({ show: false, message: "" });
  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "cash",
    notes: ""
  });
  const totalAmount = parseFloat(order?.total_amount || 0);
  const totalPaid = parseFloat(order?.total_paid || 0);
  const remaining = Math.max(0, totalAmount - totalPaid);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (remaining <= 0) {
        throw new Error("Order is fully paid. No remaining balance.");
      }
      const res = await fetch(api("/api/payments"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          order_id: parseInt(orderId),
          amount: parseFloat(formData.amount),
          payment_method: ((formData.payment_method || '').toLowerCase() === 'whish' || (formData.payment_method || '').toLowerCase() === 'wish') ? 'cash' : (formData.payment_method || '').toLowerCase(),
          notes: formData.notes,
          status: "completed"
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add payment");
      }

      // Show success alert
      setSuccessAlert({ show: true, message: "Payment added successfully!" });
      setTimeout(() => {
        setSuccessAlert({ show: false, message: "" });
        // Redirect to view order page
        router.push(`/orders/${orderId}`);
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to add payment");
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
      <Layout title="Add Payment">
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
      <Layout title="Add Payment">
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
    <Layout title={`Add Payment - Order #${order.id}`}>
      <div className="h-screen w-full space-y-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push(`/orders/${order.id}`)}
              className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 px-4 py-2.5 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Order
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon.CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add Payment for Order #{order.id}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Icon.Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full mb-0">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="h-full">
              <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-10 flex flex-col h-3/4 mb-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Icon.CreditCard className="h-5 w-5 text-indigo-500" />
                  Payment Information
                </h2>
                
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0.01"
                      max={remaining}
                      disabled={remaining <= 0}
                      required
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Enter payment amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method *
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      disabled={remaining <= 0}
                      required
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white appearance-none"
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
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white h-full resize-none"
                      placeholder="Add any additional notes about this payment..."
                      rows="6"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 mt-2 pt-3 border-t border-gray-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || remaining <= 0 || !formData.amount || parseFloat(formData.amount) <= 0}
                    className="flex-1 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Adding Payment...
                      </>
                    ) : (
                      <>
                        <Icon.Save className="h-4 w-4" />
                        Add Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 h-3/4 flex flex-col">
            {/* Order Information */}
            <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-10 flex-1 min-h-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Order Summary
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Paid:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(order.total_paid || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Remaining:</span>
                  <span className={`font-bold ${parseFloat(order.remaining || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ${parseFloat(order.remaining || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-10 flex-1 min-h-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Icon.User className="h-5 w-5 text-indigo-500" />
                Customer
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon.User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.first_name} {order.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon.Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.phone_number || "No phone"}
                    </p>
                  </div>
                </div>
                {order.address && (
                  <div className="flex items-center gap-3">
                    <Icon.MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {order.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successAlert.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl max-w-md transition-all duration-300 bg-green-500 text-white">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">{successAlert.message}</p>
              </div>
              <button
                onClick={() => setSuccessAlert({ show: false, message: "" })}
                className="flex-shrink-0 text-white/80 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
