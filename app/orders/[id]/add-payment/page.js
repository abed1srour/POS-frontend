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
      const res = await fetch(api("/api/payments"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          order_id: parseInt(orderId),
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push(`/orders/${order.id}`)}
            className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon.ArrowLeft className="h-5 w-5" />
            Back to Order
          </button>
          <div>
            <h1 className="text-gray-600 dark:text-gray-400 text-lg">
              Add Payment for Order #{order.id}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Icon.CreditCard className="h-6 w-6 text-indigo-500" />
                  Payment Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Enter payment amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method *
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="wish">Wish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Add any additional notes about this payment..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="flex-1 rounded-2xl bg-red-500 px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-red-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.amount || parseFloat(formData.amount) <= 0}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Adding Payment...
                    </>
                  ) : (
                    <>
                      <Icon.Save className="h-5 w-5" />
                      Add Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Information */}
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(order.total_paid || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">Remaining:</span>
                  <span className={`font-bold text-lg ${parseFloat(order.remaining || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ${parseFloat(order.remaining || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customer
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {order.first_name} {order.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {order.phone_number || "No phone"}
                  </p>
                </div>
                {order.address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {order.address}
                    </p>
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
