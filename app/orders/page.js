"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
const Icon = {
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  Filter: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
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
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method: "cash",
    transaction_id: "",
    notes: ""
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchOrders() {
    try {
      const res = await fetch(api("/api/orders?limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      const data = await res.json();
      setOrders(data.data || data || []);
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toString().includes(searchTerm) ||
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_number?.includes(searchTerm);
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesDate = !dateFilter || order.order_date?.startsWith(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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

  // Payment handling functions
  function handleAddPayment(order) {
    const totalAmount = parseFloat(order.total_amount || 0);
    const totalPaid = parseFloat(order.total_paid || 0);
    const isPaid = totalPaid >= totalAmount;
    
    if (isPaid) {
      showToast('This order is already fully paid. No more payments can be added.', 'error');
      return;
    }
    
    setSelectedOrder(order);
         const remaining = Math.max(0, (parseFloat(order.total_amount || 0) - parseFloat(order.total_paid || 0)));
     setPaymentData({
       amount: remaining > 0 ? remaining.toString() : "",
       payment_method: "cash",
       transaction_id: "",
       notes: ""
     });
    setShowPaymentModal(true);
  }

  async function handleSubmitPayment() {
    if (!selectedOrder || !paymentData.amount || !paymentData.payment_method) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setPaymentLoading(true);
    try {
      const res = await fetch(api("/api/payments"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          order_id: selectedOrder.id,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id || null,
          notes: paymentData.notes || ""
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create payment");
      }

      const result = await res.json();
      
             // Show success message with payment details
       const successMessage = result.remaining === 0 
         ? `Payment added successfully! Order #${selectedOrder.id} is now fully paid.`
         : `Payment added successfully! Remaining balance: $${result.remaining.toFixed(2)}`;
      
      showToast(successMessage, "success");
      
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setPaymentData({
        amount: "",
        payment_method: "cash",
        transaction_id: "",
        notes: ""
      });
      // Refresh orders to show updated data
      fetchOrders();
    } catch (error) {
      showToast(error.message || "Failed to add payment", "error");
    } finally {
      setPaymentLoading(false);
    }
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    setPaymentData({
      amount: "",
      payment_method: "cash",
      transaction_id: "",
      notes: ""
    });
  }

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  }

  if (loading) {
    return (
      <Layout title="Orders">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Orders">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Orders Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={() => router.push("/orders/create")}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <Icon.Plus className="h-5 w-5" />
            Create New Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

                     <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Unpaid</p>
                 <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                   {orders.filter(o => parseFloat(o.total_paid || 0) < parseFloat(o.total_amount || 0)).length}
                 </p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                 <Icon.Calendar className="h-6 w-6 text-white" />
               </div>
             </div>
           </div>

           <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Paid</p>
                 <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                   {orders.filter(o => parseFloat(o.total_paid || 0) >= parseFloat(o.total_amount || 0)).length}
                 </p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                 <Icon.DollarSign className="h-6 w-6 text-white" />
               </div>
             </div>
           </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  ${orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Icon.DollarSign className="h-6 w-6 text-white" />
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
                placeholder="Search orders by ID, customer name, or phone..."
                className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-4 pl-12 pr-6 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                                 <tr>
                   <th className="px-6 py-4 text-left font-bold">Customer</th>
                   <th className="px-6 py-4 text-left font-bold">Payment Status</th>
                   <th className="px-6 py-4 text-left font-bold">Total</th>
                   <th className="px-6 py-4 text-left font-bold">Paid</th>
                   <th className="px-6 py-4 text-left font-bold">Remaining</th>
                   <th className="px-6 py-4 text-left font-bold">Date</th>
                   <th className="px-6 py-4 text-left font-bold">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                                 {filteredOrders.map((order) => {
                   const totalAmount = parseFloat(order.total_amount || 0);
                   const totalPaid = parseFloat(order.total_paid || 0);
                   const remaining = Math.max(0, totalAmount - totalPaid);
                   const isPaid = totalPaid >= totalAmount;
                   
                   return (
                     <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                             <Icon.User className="h-5 w-5 text-white" />
                           </div>
                                                       <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {order.first_name} {order.last_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {order.phone_number || "No phone"}
                              </div>
                            </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                           isPaid 
                             ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                             : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                         }`}>
                           {isPaid ? 'Paid' : 'Unpaid'}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <span className="font-bold text-lg text-gray-900 dark:text-white">
                           ${totalAmount.toFixed(2)}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <span className={`font-bold text-lg ${
                           isPaid 
                             ? 'text-green-600 dark:text-green-400'
                             : 'text-blue-600 dark:text-blue-400'
                         }`}>
                           ${totalPaid.toFixed(2)}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <span className={`font-bold text-lg ${
                           remaining === 0 
                             ? 'text-green-600 dark:text-green-400'
                             : 'text-red-600 dark:text-red-400'
                         }`}>
                           ${remaining.toFixed(2)}
                         </span>
                       </td>
                                                                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {formatDate(order.order_date)}
                        </td>
                       <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="rounded-xl p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                          title="View Order"
                        >
                          <Icon.Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/orders/${order.id}/edit`)}
                          className="rounded-xl p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                          title="Edit Order"
                        >
                          <Icon.Edit className="h-5 w-5" />
                        </button>
                                                 <button
                           onClick={() => handleAddPayment(order)}
                           disabled={isPaid}
                           className={`rounded-xl p-2 transition-all duration-200 ${
                             isPaid 
                               ? 'text-gray-300 cursor-not-allowed' 
                               : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
                           }`}
                           title={isPaid ? 'Order fully paid - no more payments needed' : 'Add Payment'}
                         >
                          <Icon.DollarSign className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Icon.DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                {searchTerm || statusFilter || dateFilter ? "No orders found matching your filters" : "No orders available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Payment
              </h3>
              <button
                onClick={closePaymentModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

                         {selectedOrder && (
               <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                 <p className="text-sm text-gray-600 dark:text-gray-400">Order #{selectedOrder.id}</p>
                                   <p className="font-bold text-gray-900 dark:text-white">
                    {selectedOrder.first_name} {selectedOrder.last_name}
                  </p>
                 <div className="space-y-1 mt-2">
                   <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                     Total: ${(parseFloat(selectedOrder.total_amount) || 0).toFixed(2)}
                   </p>
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                     Paid: ${(parseFloat(selectedOrder.total_paid) || 0).toFixed(2)}
                   </p>
                   <p className="text-sm font-medium text-green-600 dark:text-green-400">
                     Remaining: ${Math.max(0, (parseFloat(selectedOrder.total_amount || 0) - parseFloat(selectedOrder.total_paid || 0))).toFixed(2)}
                   </p>
                 </div>
               </div>
             )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                  className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={paymentData.transaction_id}
                  onChange={(e) => setPaymentData({...paymentData, transaction_id: e.target.value})}
                  className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Optional transaction reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Optional payment notes"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closePaymentModal}
                className="flex-1 rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={paymentLoading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-bold text-white shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </div>
                ) : (
                  "Add Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl max-w-md transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
