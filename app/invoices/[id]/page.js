"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";

/**
 * Invoice Details page showing invoice info and actions
 * - Invoice details and items
 * - Payment status
 * - Print/export functionality
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
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
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
  Printer: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="6,9 6,2 18,2 18,9" />
      <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18" />
      <polyline points="6,14 6,18 18,18 18,14" />
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 21h14" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  CheckCircle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  AlertCircle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  }

  async function fetchInvoice() {
    try {
      const res = await fetch(api(`/api/invoices/${invoiceId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load invoice (${res.status})`);
      const data = await res.json();
      setInvoice(data.data || data);
    } catch (e) {
      setError(e?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrder(orderId) {
    if (!orderId) return;
    try {
      const res = await fetch(api(`/api/orders/${orderId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load order (${res.status})`);
      const data = await res.json();
      setOrder(data.data || data);
    } catch (e) {
      console.error("Failed to load order:", e);
    }
  }

  async function fetchCustomer(customerId) {
    if (!customerId) return;
    try {
      const res = await fetch(api(`/api/customers/${customerId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load customer (${res.status})`);
      const data = await res.json();
      setCustomer(data.data || data);
    } catch (e) {
      console.error("Failed to load customer:", e);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    await fetchInvoice();
    setLoading(false);
  }

  useEffect(() => {
    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoice) {
      if (invoice.order_id) {
        fetchOrder(invoice.order_id);
      }
      if (invoice.customer_id) {
        fetchCustomer(invoice.customer_id);
      }
    }
  }, [invoice]);

  async function deleteInvoice() {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    try {
      const res = await fetch(api(`/api/invoices/${invoiceId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to delete invoice (${res.status})`);
      
      showToast("Invoice deleted successfully", "success");
      router.push("/invoices");
    } catch (e) {
      showToast(e?.message || "Failed to delete invoice", "error");
    }
  }

  function printInvoice() {
    window.print();
  }

  function downloadPDF() {
    // This would typically generate and download a PDF
    showToast("PDF download feature coming soon!", "info");
  }

  if (loading) {
    return (
      <Layout title="Invoice Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading invoice details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !invoice) {
    return (
      <Layout title="Invoice Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-rose-500 mb-4">{error || "Invoice not found"}</p>
            <button 
              onClick={() => router.back()} 
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !isPaid;

  return (
    <Layout title={`Invoice #${invoice.id}`}>
      <div className="space-y-8">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="rounded-2xl border border-gray-200/60 p-3 hover:bg-gray-50/80 dark:border-white/10 dark:hover:bg-white/10 transition-all duration-200"
            >
              <Icon.ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Invoice #{invoice.id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={printInvoice}
              className="flex items-center gap-2 rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon.Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon.Download className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
              className="flex items-center gap-2 rounded-xl border border-gray-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon.Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={deleteInvoice}
              className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/50 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition-colors hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <Icon.Trash className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className={cn(
          "rounded-2xl border p-4",
          isPaid && "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
          !isPaid && isOverdue && "border-rose-200/60 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/10",
          !isPaid && !isOverdue && "border-amber-200/60 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/10"
        )}>
          <div className="flex items-center gap-3">
            {isPaid ? (
              <Icon.CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            ) : isOverdue ? (
              <Icon.AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            ) : (
              <Icon.Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending Payment"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isPaid 
                  ? "This invoice has been paid in full"
                  : isOverdue 
                    ? `Overdue by ${Math.ceil((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))} days`
                    : `Due on ${new Date(invoice.due_date).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Invoice Layout - Matching the image exactly */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="p-8">
            {/* Top Section: Date/Invoice Number, Company, Customer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Left: Date and Invoice Number */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Invoice #</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    BRA-{String(invoice.id).padStart(5, '0')}
                  </div>
                </div>
              </div>

              {/* Middle: Company Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 flex items-center justify-center">
                    <Icon.FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SROUR</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Solar Power</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Srour Solar Power</p>
                  <p className="text-gray-600 dark:text-gray-400">sroursolarpower@gmail.com</p>
                  <p className="text-gray-600 dark:text-gray-400">+96178863012</p>
                  <p className="text-gray-600 dark:text-gray-400">Lebanon, Tyre, Bazourieh - Main Road</p>
                </div>
              </div>

              {/* Right: Customer Information */}
              <div className="space-y-4">
                {customer ? (
                  <>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {customer.first_name} {customer.last_name}
                    </div>
                    <div className="space-y-1 text-sm">
                      {customer.phone_number && (
                        <p className="text-gray-600 dark:text-gray-400">PN: {customer.phone_number}</p>
                      )}
                      {customer.address && (
                        <p className="text-gray-600 dark:text-gray-400">{customer.address}</p>
                      )}
                      {order && (
                        <p className="text-gray-600 dark:text-gray-400">Order ID: {order.id}</p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">
                        Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400">Customer information not available</div>
                )}
              </div>
            </div>

            {/* Product Details Table */}
            {order && order.items && order.items.length > 0 && (
              <div className="mb-8">
                <div className="overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-indigo-600 text-white text-xs">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium">Product name</th>
                        <th className="px-6 py-4 text-left font-medium">Description</th>
                        <th className="px-6 py-4 text-left font-medium">Qty</th>
                        <th className="px-6 py-4 text-left font-medium">Price</th>
                        <th className="px-6 py-4 text-left font-medium">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                      {order.items.map((item, index) => {
                        const itemTotal = (parseFloat(item.unit_price || 0) * item.quantity) - parseFloat(item.discount || 0);
                        return (
                          <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {item.product_name || `Product #${item.product_id}`}
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {item.description || "---"}
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                              ${parseFloat(item.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                              ${itemTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Section: Totals and Payment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">PAYMENT DETAILS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                    <span className="font-medium text-gray-900 dark:text-white">cash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Reference:</span>
                    <span className="font-medium text-gray-900 dark:text-white">BRA-{String(invoice.id).padStart(5, '0')}</span>
                  </div>
                </div>
              </div>

              {/* Right: Totals */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Net total:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${parseFloat(invoice.total_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-indigo-600 text-white p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-xl font-bold">${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {invoice.notes && (
              <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Notes</h3>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200/60 dark:border-white/10">
                  <p className="text-gray-900 dark:text-white">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={cn(
              "rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
              toast.type === "success" && "bg-emerald-500 text-white",
              toast.type === "error" && "bg-rose-500 text-white",
              toast.type === "info" && "bg-blue-500 text-white"
            )}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}


