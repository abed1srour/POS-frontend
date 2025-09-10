"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import PaymentDialog from "../components/PaymentDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusDialog from "../components/StatusDialog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

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
  Eye: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
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
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2S8.357 4.237 7.534 7.5" />
      <path d="M2 3h20v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V3Z" />
      <path d="M7 14h.01" />
      <path d="M12 14h.01" />
      <path d="M17 14h.01" />
      <path d="M22 9v.01" />
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
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PurchaseOrdersPage() {
  const router = useRouter();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingStatusOrder, setEditingStatusOrder] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, variant: 'warning', title: '', message: '' });
  const ordersPerPage = 10;

  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const offset = (currentPage - 1) * ordersPerPage;
      params.append('limit', ordersPerPage.toString());
      params.append('offset', offset.toString());
      
      if (supplierFilter) {
        params.append('supplier_id', supplierFilter);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (dateFilter) {
        params.append('date_from', dateFilter);
        params.append('date_to', dateFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const res = await fetch(api(`/api/purchase-orders?${params.toString()}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load purchase orders (${res.status})`);
      
      const data = await res.json();
      const ordersData = data.data || data || [];
      console.log("📋 Purchase orders API response:", data);
      console.log("📦 Orders data:", ordersData);
      console.log("📊 Pagination info:", data.pagination);
      console.log("🔍 Orders being set:", ordersData.map(o => ({ id: o.id, status: o.status })));
      setOrders(ordersData);
      
      if (data.pagination) {
        setTotalOrders(data.pagination.total);
        setTotalPages(data.pagination.pages);
      } else {
        // Fallback pagination calculation
        setTotalOrders(ordersData.length);
        setTotalPages(Math.ceil(ordersData.length / ordersPerPage));
      }
    } catch (e) {
      setError(e?.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSupplierDetails(supplierId) {
    try {
      const res = await fetch(api(`/api/suppliers/${supplierId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load supplier (${res.status})`);
      const data = await res.json();
      setSupplierDetails(data.data || data);
    } catch (e) {
      setSupplierDetails(null);
    }
  }

  async function deletePurchaseOrder(orderId) {
    try {
      console.log('🔧 Starting deletePurchaseOrder function');
      console.log('📋 Order ID to delete:', orderId);
      console.log('🔑 Auth headers:', authHeaders());
      
      setIsDeleting(true);
      console.log(`🗑️ Attempting to delete purchase order: ${orderId}`);
      
      const apiUrl = api(`/api/purchase-orders/${orderId}`);
      console.log('🌐 API URL:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: "DELETE",
        headers: authHeaders(),
      });
      
      console.log(`📡 Delete response status: ${res.status}`);
      console.log(`📡 Delete response headers:`, Object.fromEntries(res.headers.entries()));
      
      if (res.status === 401) {
        console.log('❌ Unauthorized - redirecting to login');
        return router.replace("/login");
      }
      
      if (!res.ok) {
        let payload = null;
        let errorText = '';
        try { payload = await res.clone().json(); } catch {}
        try { errorText = await res.text(); } catch {}
        const friendlyByStatus = {
          400: 'Cannot delete purchase order. Ensure it is not received and has no remaining balance.',
          404: 'Purchase order not found.',
          409: 'Cannot delete purchase order due to related references.',
          500: 'Internal server error while deleting purchase order.'
        };
        const bodyMsg = (payload && (payload.message || payload.error)) || (errorText && errorText.trim()) || '';
        const msg = bodyMsg || friendlyByStatus[res.status] || `Failed to delete purchase order (${res.status})`;
        // Show UX dialog for known validation cases and avoid throwing
        const msgLower = msg.toLowerCase();
        if (msgLower.includes('remaining balance') || msgLower.includes('fully paid') || msgLower.includes('payment')) {
          setStatusDialog({
            open: true,
            variant: 'warning',
            title: 'Payments Required Before Deletion',
            message: 'This purchase order has payments or a remaining balance. Please delete or refund its payments so the remaining balance becomes $0.00 before deleting the purchase order.'
          });
          setError(null); // do not show inline red banner
        } else {
          setError(msg);
        }
        return; // Stop here; no throw to avoid console error spam
      }
      
      const responseData = await res.json().catch(() => ({}));
      console.log('✅ Delete response data:', responseData);
      
      console.log(`✅ Successfully deleted purchase order: ${orderId}`);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setError(null);
      
      // Refresh the orders list to update pagination
      console.log('🔄 Refreshing orders list...');
      fetchOrders();
    } catch (e) {
      console.warn('Delete error:', e?.message);
      const emsg = e?.message || "Failed to delete purchase order";
      const msgLower = emsg.toLowerCase();
      if (msgLower.includes('remaining balance') || msgLower.includes('fully paid') || msgLower.includes('payment')) {
        setStatusDialog({
          open: true,
          variant: 'warning',
          title: 'Payments Required Before Deletion',
          message: 'This purchase order has payments or a remaining balance. Please delete or refund its payments so the remaining balance becomes $0.00 before deleting the purchase order.'
        });
        setError(null); // suppress inline banner
      } else {
        setError(emsg);
      }
    } finally {
      console.log('🏁 Delete operation finished');
      setIsDeleting(false);
    }
  }

  async function updatePurchaseOrderStatus(orderId, newStatus) {
    try {
      setStatusSaving(true);
      setStatusError(null);
      const res = await fetch(api(`/api/purchase-orders/${orderId}/status`), {
        method: "PATCH",
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

  function openPaymentModal(order) {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
    setSelectedOrder(null);
  }

  function handlePaymentSuccess() {
    closePaymentModal();
    fetchOrders();
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const supplierIdFromUrl = urlParams.get('supplier_id');
    if (supplierIdFromUrl) {
      setSupplierFilter(supplierIdFromUrl);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [supplierFilter, statusFilter, dateFilter, searchTerm]);

  useEffect(() => {
    console.log('🔄 Component re-rendering, orders count:', orders.length);
    fetchOrders();
    if (supplierFilter) {
      fetchSupplierDetails(supplierFilter);
    } else {
      setSupplierDetails(null);
    }
  }, [currentPage, supplierFilter, statusFilter, dateFilter, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showStatusDropdown && !event.target.closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  if (loading) {
    return (
      <Layout title="Purchase Orders">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading purchase orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Purchase Orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Purchase Orders Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all supplier purchase orders</p>
          </div>
                     <button
             onClick={() => router.push("/suppliers")}
             className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
           >
             <Icon.Plus className="h-4 w-4" />
             Create New Purchase Order
           </button>
        </div>

        {/* Supplier Filter Indicator */}
        {supplierFilter && (
          <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <Icon.Building className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Showing purchase orders for {supplierDetails ? supplierDetails.name : `Supplier ID: ${supplierFilter}`}
                  </p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                    {orders.length} purchase order{orders.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSupplierFilter("");
                  setSupplierDetails(null);
                  const url = new URL(window.location);
                  url.searchParams.delete('supplier_id');
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
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Total Purchase Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalOrders}</p>
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
                  {orders.filter(o => parseFloat(o.total_paid_amount || 0) < parseFloat(o.total || 0)).length}
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
                  {orders.filter(o => parseFloat(o.total_paid_amount || 0) >= parseFloat(o.total || 0)).length}
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
            <div className="relative flex-1">
              <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search purchase orders by ID, supplier name, or status..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {!supplierFilter && (
              <div className="relative status-dropdown">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center justify-between w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <span className={statusFilter ? "text-white" : "text-gray-400 dark:text-gray-300"}>
                    {statusFilter === "paid" ? "Paid" : 
                     statusFilter === "unpaid" ? "Unpaid" : 
                     statusFilter === "cancelled" ? "Cancelled" : 
                     "All Statuses"}
                  </span>
                  <svg 
                    className={`h-4 w-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-gray-200/60 bg-gray-800 dark:bg-gray-900 shadow-2xl overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setStatusFilter("");
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          statusFilter === "" 
                            ? "bg-blue-500 text-white" 
                            : "text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        All Statuses
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("paid");
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          statusFilter === "paid" 
                            ? "bg-blue-500 text-white" 
                            : "text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        Paid
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("unpaid");
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          statusFilter === "unpaid" 
                            ? "bg-blue-500 text-white" 
                            : "text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        Unpaid
                      </button>
                      <button
                        onClick={() => {
                          setStatusFilter("cancelled");
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          statusFilter === "cancelled" 
                            ? "bg-blue-500 text-white" 
                            : "text-white hover:bg-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        Cancelled
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!supplierFilter && (
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            )}
          </div>
        </div>

        {/* Purchase Orders Table */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-center font-bold">Order ID</th>
                  <th className="px-6 py-4 text-center font-bold">Supplier</th>
                  <th className="px-6 py-4 text-center font-bold">Order Status</th>
                  <th className="px-6 py-4 text-center font-bold">Payment Status</th>
                  <th className="px-6 py-4 text-center font-bold">Total</th>
                  <th className="px-6 py-4 text-center font-bold">Paid</th>
                  <th className="px-6 py-4 text-center font-bold">Balance</th>
                  <th className="px-6 py-4 text-center font-bold">Date</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                    const totalAmount = parseFloat(order.total || 0);
                    const totalPaid = parseFloat(order.total_paid_amount || 0);
                    const balance = Math.max(0, totalAmount - totalPaid);
                    const isPaid = totalPaid >= totalAmount;
                    
                    return (
                      <tr key={order.id} className="border-t border-gray-200/60 dark:border-white/10">
                        <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">#{order.id}</span></td>
                        <td className="px-6 py-4 text-center">
                          <div className="min-w-0">
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {order.supplier_name || `Supplier #${order.supplier_id}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "rounded-xl px-3 py-1 text-xs font-medium capitalize",
                            (order.status || 'pending') === 'pending' && "bg-amber-500/10 text-amber-500",
                            order.status === 'completed' && "bg-emerald-500/10 text-emerald-500",
                            order.status === 'received' && "bg-emerald-500/10 text-emerald-500",
                            order.status === 'ordered' && "bg-blue-500/10 text-blue-500",
                            order.status === 'cancelled' && "bg-rose-500/10 text-rose-500"
                          )}>{(order.status || 'pending')}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          <span className={cn(
                            "rounded-xl px-3 py-1 text-xs font-medium",
                            isPaid ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center"><span className="text-sm text-gray-500 dark:text-gray-400">${totalAmount.toFixed(2)}</span></td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${totalPaid.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ${balance.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => router.push(`/purchase-orders/${order.id}`)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                              title="View order"
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
                              onClick={() => openPaymentModal(order)}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-200"
                              title="Add payment"
                            >
                              <Icon.DollarSign className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                console.log('🗑️ DELETE BUTTON CLICKED for order:', order.id);
                                setDeletingOrder(order);
                              }}
                              disabled={order.status === 'received'}
                              className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={order.status === 'received' ? "Cannot delete received orders" : "Delete order"}
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

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Icon.Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                {searchTerm || statusFilter || dateFilter || supplierFilter
                  ? "No purchase orders found matching your filters"
                  : "No purchase orders found"}
              </p>
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-white/10">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} purchase orders
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-indigo-500 text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Next {ordersPerPage}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
            {error}
          </div>
        )}

        <ConfirmDialog
          open={Boolean(deletingOrder)}
          title="Delete Purchase Order"
          description={deletingOrder ? `Are you sure you want to delete purchase order #${deletingOrder.id}? This action cannot be undone.` : ""}
          confirmLabel="Delete"
          requireText
          keyword="confirm"
          destructive
          onConfirm={async () => {
            if (!deletingOrder) return;
            await deletePurchaseOrder(deletingOrder.id);
            setDeletingOrder(null);
          }}
          onClose={() => setDeletingOrder(null)}
        />

        {/* Payment Dialog */}
        {showPaymentModal && selectedOrder && (
          <PaymentDialog
            order={selectedOrder}
            onClose={closePaymentModal}
            onSuccess={handlePaymentSuccess}
            authHeaders={authHeaders}
            api={api}
          />
        )}

        {editingStatusOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingStatusOrder(null)} />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
              <h3 className="text-lg font-semibold mb-2">Update Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Purchase Order #{editingStatusOrder.id}</p>
              <div className="space-y-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400">Status</label>
                <div className="relative">
                  <button
                    onClick={()=>setStatusMenuOpen(v=>!v)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${editingStatusOrder.status === 'received' ? 'bg-emerald-500' : editingStatusOrder.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                      <span className="capitalize">{editingStatusOrder.status}</span>
                    </span>
                    <svg className={`h-4 w-4 transition-transform ${statusMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  {statusMenuOpen && (
                    <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-xl dark:border-white/10 dark:bg-[#0F1115]">
                      {[
                        { key: 'pending', color: 'bg-amber-500', desc: 'Draft - not received' },
                        { key: 'received', color: 'bg-emerald-500', desc: 'Stock will be added' },
                        { key: 'cancelled', color: 'bg-rose-500', desc: 'Reverses received stock' },
                      ].map(opt => (
                        <button
                          key={opt.key}
                          onClick={()=>{ setEditingStatusOrder({...editingStatusOrder, status: opt.key}); setStatusMenuOpen(false); }}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/10 ${editingStatusOrder.status === opt.key ? 'bg-gray-50/70 dark:bg-white/5' : ''}`}
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
                  <button onClick={()=>setEditingStatusOrder(null)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">Cancel</button>
                  <button
                    disabled={statusSaving}
                    onClick={()=> updatePurchaseOrderStatus(editingStatusOrder.id, editingStatusOrder.status)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {statusSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render global dialogs */}
      {/* Status Dialog for informative alerts */}
      {statusDialog.open && (
        <StatusDialog
          open={statusDialog.open}
          variant={statusDialog.variant}
          title={statusDialog.title}
          message={statusDialog.message}
          primaryLabel="OK"
          onPrimary={() => setStatusDialog((d) => ({ ...d, open: false }))}
          onClose={() => setStatusDialog((d) => ({ ...d, open: false }))}
        />
      )}
    </Layout>
  );
}
