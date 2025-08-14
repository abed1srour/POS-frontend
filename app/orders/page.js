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
  RecycleBin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  ),
  Restore: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
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
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
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
    notes: ""
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [deletedOrdersLoading, setDeletedOrdersLoading] = useState(false);
  const [clearBinConfirm, setClearBinConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, orderId: null, orderNumber: null });
  const [confirmText, setConfirmText] = useState("");
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAmountAlert, setShowAmountAlert] = useState(false);
  const [showEmptyBinAlert, setShowEmptyBinAlert] = useState(false);

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
    
    const totalAmount = parseFloat(order.total_amount || 0);
    const totalPaid = parseFloat(order.total_paid || 0);
    const isPaid = totalPaid >= totalAmount;
    
    let matchesStatus = true;
    if (statusFilter === "paid") {
      matchesStatus = isPaid;
    } else if (statusFilter === "unpaid") {
      matchesStatus = !isPaid;
    } else if (statusFilter === "cancelled") {
      matchesStatus = order.status === "cancelled";
    }
    
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
       notes: ""
     });
    setShowPaymentModal(true);
  }

  async function handleSubmitPayment() {
    if (!selectedOrder || !paymentData.amount || !paymentData.payment_method) {
      setAlertMessage("Please fill in all required fields");
      setShowCustomAlert(true);
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
      notes: ""
    });
  }

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  }

  // Recycle bin functions
  async function fetchDeletedOrders() {
    setDeletedOrdersLoading(true);
    try {
      const res = await fetch(api("/api/orders?includeDeleted=true&limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load deleted orders (${res.status})`);
      const data = await res.json();
      const deletedOrdersData = (data.data || data || []).filter(order => order.deleted_at);
      setDeletedOrders(deletedOrdersData);
    } catch (e) {
      showToast(e?.message || "Failed to load deleted orders", "error");
    } finally {
      setDeletedOrdersLoading(false);
    }
  }

  async function restoreOrder(orderId) {
    try {
      const res = await fetch(api(`/api/orders/${orderId}/restore`), {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to restore order (${res.status})`);
      
      showToast("Order restored successfully", "success");
      fetchDeletedOrders(); // Refresh deleted orders list
      fetchOrders(); // Refresh main orders list
    } catch (e) {
      showToast(e?.message || "Failed to restore order", "error");
    }
  }

  async function clearRecycleBin() {
    try {
      const res = await fetch(api("/api/orders/recycle-bin/clear"), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to clear recycle bin (${res.status})`);
      
      showToast("Recycle bin cleared successfully", "success");
      setClearBinConfirm(false);
      fetchDeletedOrders(); // Refresh deleted orders list
    } catch (e) {
      showToast(e?.message || "Failed to clear recycle bin", "error");
    }
  }

  async function deleteOrder(orderId) {
    try {
      const res = await fetch(api(`/api/orders/${orderId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to delete order (${res.status})`);
      
      showToast("Order moved to recycle bin successfully", "success");
      fetchOrders(); // Refresh orders list
    } catch (e) {
      showToast(e?.message || "Failed to delete order", "error");
    }
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
             className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-600 transition-all duration-200"
           >
             <Icon.Plus className="h-4 w-4" />
             Create New Order
           </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Icon.Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Unpaid</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {orders.filter(o => parseFloat(o.total_paid || 0) < parseFloat(o.total_amount || 0)).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Icon.Calendar className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {orders.filter(o => parseFloat(o.total_paid || 0) >= parseFloat(o.total_amount || 0)).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Icon.DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
          <div className="flex flex-col lg:flex-row gap-6">
                         <button
               onClick={() => {
                 setRecycleBinOpen(true);
                 fetchDeletedOrders();
               }}
               className="flex items-center gap-3 rounded-2xl bg-red-500 px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-red-600 transition-all duration-200"
             >
               <Icon.RecycleBin className="h-5 w-5" />
               Recycle Bin
             </button>
            
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
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
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
                          <span className="text-gray-600 dark:text-gray-400">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 dark:text-gray-400">
                            ${totalPaid.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            ${remaining.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {formatDate(order.order_date)}
                        </td>
                                               <td className="px-6 py-4">
                       <div className="flex items-center gap-1">
                         <button
                           onClick={() => router.push(`/orders/${order.id}`)}
                           className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                           title="View Order"
                         >
                           <Icon.Eye className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => router.push(`/orders/${order.id}/edit`)}
                           className="rounded-lg p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                           title="Edit Order"
                         >
                           <Icon.Edit className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => handleAddPayment(order)}
                           disabled={isPaid}
                           className={`rounded-lg p-1.5 transition-all duration-200 ${
                             isPaid 
                               ? 'text-gray-300 cursor-not-allowed' 
                               : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                           }`}
                           title={isPaid ? 'Order fully paid - no more payments needed' : 'Add Payment'}
                         >
                          <Icon.DollarSign className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({ show: true, orderId: order.id, orderNumber: order.id });
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                          title="Delete Order"
                        >
                          <Icon.Trash className="h-4 w-4" />
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
                  type="text"
                  value={paymentData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers, decimal point, and backspace
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setPaymentData({...paymentData, amount: value});
                    } else {
                      setShowAmountAlert(true);
                    }
                  }}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9.]/.test(e.key)) {
                      e.preventDefault();
                      setShowAmountAlert(true);
                    }
                  }}
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
                   <option value="wish">Wish</option>
                 </select>
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
                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-600 transition-all duration-200"
              >
                Cancel
              </button>
               <button
                 onClick={handleSubmitPayment}
                 disabled={paymentLoading}
                 className="flex-1 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className={`p-6 rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 pointer-events-auto ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400/20' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white border border-red-400/20'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <div className="h-10 w-10 rounded-full bg-green-400/20 flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-red-400/20 flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "success" })}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Modal */}
      {recycleBinOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recycle Bin ({deletedOrders.length})
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (deletedOrders.length === 0) {
                      setShowEmptyBinAlert(true);
                    } else {
                      setClearBinConfirm(true);
                    }
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                >
                  <Icon.Trash className="h-4 w-4" />
                  Clear Bin
                </button>
                <button
                  onClick={() => setRecycleBinOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {deletedOrdersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto"></div>
                </div>
              ) : deletedOrders.length > 0 ? (
                <div className="space-y-4">
                  {deletedOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            Order #{order.id}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Deleted: {formatDate(order.deleted_at)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          {order.first_name} {order.last_name} - ${parseFloat(order.total_amount || 0).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => restoreOrder(order.id)}
                        className="flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 transition-colors"
                      >
                        <Icon.Restore className="h-4 w-4" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon.RecycleBin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    No deleted orders found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
             )}

       {/* Delete Confirmation Modal */}
       {deleteConfirm.show && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6">
             <div className="text-center">
               <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                 <Icon.Trash className="h-8 w-8 text-red-600 dark:text-red-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                 Delete Order #{deleteConfirm.orderNumber}
               </h3>
               <p className="text-gray-600 dark:text-gray-400 mb-4">
                 Are you sure you want to delete this order? This will move it to the recycle bin.
               </p>
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Type "confirm" to delete
                 </label>
                 <input
                   type="text"
                   value={confirmText}
                   onChange={(e) => setConfirmText(e.target.value)}
                   className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                   placeholder="Type 'confirm' to delete"
                 />
               </div>
               <div className="flex gap-3">
                 <button
                   onClick={() => {
                     setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
                     setConfirmText("");
                   }}
                   className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-600 transition-all duration-200"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => {
                     deleteOrder(deleteConfirm.orderId);
                     setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
                     setConfirmText("");
                   }}
                   disabled={confirmText !== "confirm"}
                   className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Delete
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Clear Bin Confirmation Modal */}
       {clearBinConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon.Trash className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Clear Recycle Bin
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will permanently delete all {deletedOrders.length} orders in the recycle bin. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                                 <button
                   onClick={() => setClearBinConfirm(false)}
                   className="flex-1 rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                 >
                   Cancel
                 </button>
                                 <button
                   onClick={clearRecycleBin}
                   className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-600 transition-all duration-200"
                 >
                   Clear Bin
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {showCustomAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-500/20 dark:to-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Missing Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed">
                {alertMessage}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                  <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Payment amount is required</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                  <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Payment method is required</span>
                </div>
              </div>
              <button
                onClick={() => setShowCustomAlert(false)}
                className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-base font-bold text-white shadow-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mt-6"
              >
                I Understand
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* Amount Validation Alert */}
       {showAmountAlert && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
             <div className="text-center">
               <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-500/20 dark:to-rose-500/20 flex items-center justify-center mx-auto mb-4">
                 <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                 </svg>
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                 Invalid Input
               </h3>
               <p className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed">
                 Please enter only numbers and decimal points for the payment amount.
               </p>
               <div className="space-y-3 mb-6">
                 <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                   <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                     <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </div>
                   <span className="text-sm font-medium text-red-700 dark:text-red-300">Letters and special characters are not allowed</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                   <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                     <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                   </div>
                   <span className="text-sm font-medium text-green-700 dark:text-green-300">Only numbers (0-9) and decimal point (.) are allowed</span>
                 </div>
               </div>
               <button
                 onClick={() => setShowAmountAlert(false)}
                 className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-base font-bold text-white shadow-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
               >
                 Got it!
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Empty Bin Alert */}
       {showEmptyBinAlert && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
             <div className="text-center">
               <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                 <Icon.RecycleBin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                 Recycle Bin is Empty
               </h3>
               <p className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed">
                 There are no deleted orders in the recycle bin to clear.
               </p>
               <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 mb-6">
                 <div className="flex items-center gap-3">
                   <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                     <Icon.RecycleBin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                   </div>
                   <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                     The recycle bin is already empty and ready for new deleted orders
                   </span>
                 </div>
               </div>
               <button
                 onClick={() => setShowEmptyBinAlert(false)}
                 className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-base font-bold text-white shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
               >
                 Understood
               </button>
             </div>
           </div>
         </div>
       )}
    </Layout>
  );
}
