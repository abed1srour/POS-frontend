"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import PaymentDialog from "../components/PaymentDialog";
import { api, getAuthHeadersFromStorage } from "../config/api";

// API configuration is now imported from config/api.js

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
  FileText: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  Receipt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 6V4" />
      <path d="M12 20v-2" />
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
  const [customerFilter, setCustomerFilter] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [editingStatusOrder, setEditingStatusOrder] = useState(null);
  const [orderStatusMenuOpen, setOrderStatusMenuOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);

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
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', '100');
      
      // Add customer filter if specified
      if (customerFilter) {
        params.append('customer_id', customerFilter);
        console.log(`Fetching orders for customer ID: ${customerFilter}`);
      }
      
      const res = await fetch(api(`/api/orders?${params.toString()}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      const data = await res.json();
      const ordersData = data.data || data || [];
      console.log(`Received ${ordersData.length} orders from backend:`, ordersData);
      setOrders(ordersData);
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomerDetails(customerId) {
    try {
      const res = await fetch(api(`/api/customers/${customerId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load customer (${res.status})`);
      const data = await res.json();
      setCustomerDetails(data.data || data);
    } catch (e) {
      console.error("Failed to load customer details:", e);
      setCustomerDetails(null);
    }
  }



  useEffect(() => {
    // Check for customer_id in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const customerIdFromUrl = urlParams.get('customer_id');
    
    if (customerIdFromUrl) {
      setCustomerFilter(customerIdFromUrl);
    }
  }, []); // Only run once on mount

  // Separate useEffect to handle customerFilter changes
  useEffect(() => {
    fetchOrders();
    
    // Fetch customer details if we have a customer filter
    if (customerFilter) {
      fetchCustomerDetails(customerFilter);
    } else {
      setCustomerDetails(null);
    }
  }, [customerFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownOpen && !event.target.closest('.status-dropdown') && !event.target.closest('[data-portal-dropdown]')) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusDropdownOpen]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // If customer filter is active, only apply search filter since backend already filtered by customer
    if (customerFilter) {
      // Only apply search filter when customer filter is active
      if (searchTerm) {
        const matchesSearch = 
          order.id?.toString().includes(searchTerm) ||
          order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone_number?.includes(searchTerm);
        return matchesSearch;
      }
      return true; // Show all orders returned by backend (they're already filtered by customer)
    }
    
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
    
    const matchesDate = !dateFilter || (() => {
      if (!order.order_date) return false;
      try {
        const orderDate = new Date(order.order_date);
        if (isNaN(orderDate.getTime())) return false;
        
        // Convert order date to YYYY-MM-DD format for comparison
        const orderDateStr = orderDate.toISOString().split('T')[0];
        return orderDateStr === dateFilter;
      } catch (error) {
        return false;
      }
    })();
    
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
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
    setSelectedOrder(null);
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
      // Just clear the local state instead of calling the API
      setDeletedOrders([]);
      showToast("Recycle bin cleared successfully", "success");
      setClearBinConfirm(false);
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
      
      if (!res.ok) {
        // Try to get the specific error message from the response
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to delete order (${res.status})`;
        throw new Error(errorMessage);
      }
      
      showToast("Order moved to recycle bin successfully", "success");
      fetchOrders(); // Refresh orders list
    } catch (e) {
      showToast(e?.message || "Failed to delete order", "error");
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      setStatusSaving(true);
      setStatusError(null);
      const useDirect = Boolean(API_BASE);
      const url = useDirect ? api(`/api/orders/${orderId}/status`) : api(`/api/orders?id=${orderId}`);
      const res = await fetch(url, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Failed to update status (${res.status})`);
      }
      await fetchOrders();
      setEditingStatusOrder(null);
    } catch (e) {
      setStatusError(e?.message || "Failed to update status");
    } finally {
      setStatusSaving(false);
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

        {/* Customer Filter Indicator */}
        {customerFilter && (
          <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <Icon.User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Showing orders for {customerDetails ? `${customerDetails.first_name} ${customerDetails.last_name}` : `Customer ID: ${customerFilter}`}
                  </p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCustomerFilter("");
                  setCustomerDetails(null);
                  // Remove customer_id from URL
                  const url = new URL(window.location);
                  url.searchParams.delete('customer_id');
                  window.history.replaceState({}, '', url);
                }}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

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
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6 relative overflow-visible">
          <div className="flex flex-col lg:flex-row gap-6">
                         <button
               onClick={() => {
                 setRecycleBinOpen(true);
                 fetchDeletedOrders();
               }}
               className="rounded-2xl border border-gray-200/60 bg-white/70 py-4 px-4 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 dark:border-white/10 dark:bg-white/5 flex items-center justify-center"
               title="Recycle Bin"
             >
               <Icon.RecycleBin className="h-5 w-5" />
             </button>
            
            <div className="relative flex-1">
              <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders by ID, customer name, or phone..."
                className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-4 pl-12 pr-4 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            
            <div className="relative status-dropdown overflow-visible" ref={statusDropdownRef}>
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center justify-between w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200 min-w-[140px]"
              >
                <span className={statusFilter ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                  {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All Statuses"}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {statusDropdownOpen && statusDropdownRef.current && typeof window !== 'undefined' && createPortal(
                <div 
                  className="fixed rounded-2xl border border-gray-200/60 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl dark:border-white/10 z-[99999] overflow-hidden"
                  data-portal-dropdown
                  style={{
                    top: statusDropdownRef.current.getBoundingClientRect().bottom + 4,
                    left: statusDropdownRef.current.getBoundingClientRect().left,
                    width: statusDropdownRef.current.offsetWidth,
                    minWidth: '140px'
                  }}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 ${
                        statusFilter === "" 
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter("paid");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 ${
                        statusFilter === "paid" 
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter("unpaid");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 ${
                        statusFilter === "unpaid" 
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                    >
                      Unpaid
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter("cancelled");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 ${
                        statusFilter === "cancelled" 
                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>,
                document.body
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => document.getElementById('date-input').showPicker()}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200 z-10"
                title="Open calendar"
              >
                <Icon.Calendar className="h-5 w-5" />
              </button>
              <input
                id="date-input"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-4 pl-12 pr-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="Select date"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                                 <tr>
                   <th className="px-6 py-4 text-center font-bold">Customer</th>
                   <th className="px-6 py-4 text-center font-bold">Order Status</th>
                   <th className="px-6 py-4 text-center font-bold">Payment Status</th>
                   <th className="px-6 py-4 text-center font-bold">Total</th>
                   <th className="px-6 py-4 text-center font-bold">Paid</th>
                   <th className="px-6 py-4 text-center font-bold">Remaining</th>
                   <th className="px-6 py-4 text-center font-bold">Date</th>
                   <th className="px-6 py-4 text-center font-bold">Actions</th>
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
                       <td className="px-6 py-4 text-center">
                         <div className="max-w-xs mx-auto">
                           <div className="text-sm text-gray-500 dark:text-gray-400" title={`${order.first_name} ${order.last_name}`}>
                             {order.first_name} {order.last_name}
                           </div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">
                             {order.phone_number || "No phone"}
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-center">
                         <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusBadge(order.status || 'pending')}`}>
                           {(order.status || 'pending')}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                         <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                           isPaid 
                             ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                             : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                         }`}>
                           {isPaid ? 'Paid' : 'Unpaid'}
                         </span>
                       </td>
                                               <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${totalPaid.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            ${remaining.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.order_date)}
                          </span>
                        </td>
                                               <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-1">
                         <button
                           onClick={() => router.push(`/orders/${order.id}`)}
                           className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                           title="View Order"
                         >
                           <Icon.Eye className="h-4 w-4" />
                         </button>
                         <button
                           onClick={() => setEditingStatusOrder(order)}
                           className="rounded-lg p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200"
                           title="Edit status"
                         >
                           <Icon.Edit className="h-4 w-4" />
                         </button>
                                                 <button
                          onClick={() => handleAddPayment(order)}
                          disabled={isPaid}
                          className={`rounded-lg p-1.5 transition-all duration-200 ${
                            isPaid 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
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

      {/* Payment Dialog */}
      {showPaymentModal && selectedOrder && (
        <PaymentDialog 
          order={selectedOrder}
          customer={null} // Orders page doesn't have customer object, but order has customer info
          onClose={closePaymentModal}
          onSuccess={() => {
            closePaymentModal();
            fetchOrders(); // Refresh orders to show updated payment info
          }}
          authHeaders={authHeaders}
          api={api}
        />
      )}

      {/* Success Notification */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className={`p-8 rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 pointer-events-auto ${
            toast.type === 'success' 
              ? 'bg-gray-800 text-white border border-gray-600' 
              : 'bg-white/90 dark:bg-[#0F1115]/90 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center shadow-lg">
                    <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-xl mb-2 ${toast.type === 'success' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                  {toast.type === 'success' ? 'Success!' : 'Warning!'}
                </h3>
                <p className={`font-medium text-lg leading-relaxed ${toast.type === 'success' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{toast.message}</p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "success" })}
                className={`flex-shrink-0 transition-colors p-1 rounded-full ${toast.type === 'success' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-rose-400 hover:text-rose-500 hover:bg-rose-500/10'}`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Progress bar for auto-dismiss */}
            <div className={`mt-4 h-1 rounded-full overflow-hidden ${toast.type === 'success' ? 'bg-gray-600' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
              <div className={`h-full rounded-full transition-all duration-5000 ease-linear ${toast.type === 'success' ? 'bg-green-500' : 'bg-rose-500'}`} style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Modal */}
      {recycleBinOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-gray-200/60 dark:border-white/10 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60 dark:border-white/10">
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
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Icon.Trash className="h-4 w-4" />
                  Clear Bin
                </button>
                <button
                  onClick={() => setRecycleBinOpen(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {deletedOrdersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto"></div>
                </div>
              ) : deletedOrders.length > 0 ? (
                <div className="space-y-4">
                  {deletedOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-white/10">
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
                          {order.first_name && order.last_name ? `${order.first_name} ${order.last_name} - ` : ''}${parseFloat(order.total_amount || 0).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => restoreOrder(order.id)}
                        className="flex items-center gap-2 rounded-2xl border border-red-500 bg-transparent px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Icon.Restore className="h-4 w-4" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon.RecycleBin className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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
           <div className="bg-black rounded-3xl shadow-2xl max-w-md w-full p-6">
             <div className="text-left">
               <h3 className="text-xl font-bold text-white mb-4">
                 Delete Order #{deleteConfirm.orderNumber}
               </h3>
               <p className="text-white mb-4">
                 Are you sure you want to delete this order? This will move it to the recycle bin.
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
                     setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
                     setConfirmText("");
                   }}
                   className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => {
                     const orderToDelete = orders.find(o => o.id === deleteConfirm.orderId);
                     const paidAmount = parseFloat(orderToDelete?.total_paid || 0);
                     const status = (orderToDelete?.status || '').toLowerCase();
                     if (orderToDelete && status === 'cancelled' && paidAmount > 0) {
                       showToast('This order has payments. Please delete the payments first to delete this order.', 'error');
                       return;
                     }
                     deleteOrder(deleteConfirm.orderId);
                     setDeleteConfirm({ show: false, orderId: null, orderNumber: null });
                     setConfirmText("");
                   }}
                   disabled={confirmText !== "confirm"}
                   className="flex-1 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon.Trash className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Clear Recycle Bin
              </h3>
              <p className="text-gray-400 mb-6">
                This will hide all {deletedOrders.length} orders from the recycle bin view. This action can be undone by refreshing the page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClearBinConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-600 bg-gray-700 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-600 transition-all duration-200"
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

      {/* Edit Status Modal */}
      {editingStatusOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingStatusOrder(null)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
            <h3 className="text-lg font-semibold mb-2">Update Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Order #{editingStatusOrder.id}</p>
            <div className="space-y-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400">Status</label>
              <div className="relative">
                <button
                  onClick={() => setOrderStatusMenuOpen(v => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      (editingStatusOrder.status || 'pending') === 'completed' ? 'bg-emerald-500' :
                      (editingStatusOrder.status || 'pending') === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}></span>
                    <span className="capitalize">{editingStatusOrder.status || 'pending'}</span>
                  </span>
                  <svg className={`h-4 w-4 transition-transform ${orderStatusMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {orderStatusMenuOpen && (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-xl dark:border-white/10 dark:bg-[#0F1115]">
                    {[
                      { key: 'pending', color: 'bg-amber-500', desc: 'Awaiting fulfillment' },
                      { key: 'completed', color: 'bg-emerald-500', desc: 'Order delivered' },
                      { key: 'cancelled', color: 'bg-rose-500', desc: 'Restock inventory; allows deletion' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setEditingStatusOrder({ ...editingStatusOrder, status: opt.key }); setOrderStatusMenuOpen(false); }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/10 ${
                          (editingStatusOrder.status || 'pending') === opt.key ? 'bg-gray-50/70 dark:bg-white/5' : ''
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`}></span>
                        <span className="capitalize flex-1">{opt.key}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {statusError && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{statusError}</div>
              )}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setEditingStatusOrder(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">Cancel</button>
                <button
                  disabled={statusSaving}
                  onClick={() => updateOrderStatus(editingStatusOrder.id, editingStatusOrder.status || 'pending')}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {statusSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
