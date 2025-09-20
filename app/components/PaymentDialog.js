"use client";

import React, { useState, useEffect } from "react";

// Icons
const Icon = {
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  CreditCard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// Minimal modal component
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-gray-200/60 bg-white/90 p-5 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
        {children}
      </div>
    </div>
  );
}

// Payment Dialog Component
export default function PaymentDialog({ order, customer, onClose, onSuccess, authHeaders, api }) {
  const [form, setForm] = useState({
    amount: "",
    payment_method: "cash",
    payment_date: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Calculate remaining amount - handle both regular orders and purchase orders
  const totalAmount = parseFloat(order?.total_amount || order?.total || 0);
  const totalPaid = parseFloat(order?.total_paid_amount || order?.total_paid || order?.payment_amount || 0);
  const remaining = Math.max(0, totalAmount - totalPaid);

  // Set default amount to remaining balance
  useEffect(() => {
    if (order && remaining > 0) {
      setForm(prev => ({ ...prev, amount: remaining.toFixed(2) }));
    }
  }, [order, remaining]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (remaining <= 0) {
      setError("Order is fully paid. No remaining balance.");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const methodUi = (form.payment_method || '').toLowerCase();
      // Keep the original payment method as selected by user
      const apiMethod = methodUi;
      const paymentData = {
        // Handle both regular orders and purchase orders
        ...(order?.supplier_name ? { purchase_order_id: order.id } : { order_id: order.id }),
        customer_id: customer?.id || order.customer_id,
        amount: parseFloat(form.amount),
        payment_method: apiMethod,
        status: 'completed',
        payment_date: form.payment_date,
        notes: form.notes
      };
      const res = await fetch(api('/api/payments'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (res.status === 401) {
        // Handle unauthorized - redirect to login
        window.location.href = '/login';
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to create payment (${res.status})`);
      }

      onSuccess();
    } catch (e) {
      setError(e?.message || "Failed to create payment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold">Add Payment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Record payment for Order #{order?.id}
          </p>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Order Total</p>
              <p className="font-semibold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Already Paid</p>
              <p className="font-semibold text-gray-900 dark:text-white">${totalPaid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Remaining</p>
              <p className="font-semibold text-red-600 dark:text-red-400">${remaining.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                {order?.supplier_name ? 'Supplier' : 'Customer'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order?.supplier_name ? order.supplier_name :
                 customer?.first_name ? `${customer.first_name} ${customer.last_name}` : 
                 order?.first_name ? `${order.first_name} ${order.last_name}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Payment Amount</label>
            <input 
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              value={form.amount} 
              onChange={(e) => setForm({...form, amount: e.target.value})} 
              required 
              disabled={remaining <= 0}
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
            <div className="relative">
              <select 
                value={form.payment_method} 
                onChange={(e) => setForm({...form, payment_method: e.target.value})} 
                required 
                disabled={remaining <= 0}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm font-medium outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/20 dark:bg-white/10 dark:text-white dark:focus:border-indigo-400" 
              >
                <option value="cash" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-gray-900 dark:text-white py-3 px-4 font-medium border-b border-gray-100 dark:border-gray-700">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Cash
                  </span>
                </option>
                <option value="whish" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-gray-900 dark:text-white py-3 px-4 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Whish
                  </span>
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Payment Date</label>
            <input 
              type="date"
              value={form.payment_date} 
              onChange={(e) => setForm({...form, payment_date: e.target.value})} 
              required 
              disabled={remaining <= 0}
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Notes (Optional)</label>
            <textarea 
              value={form.notes} 
              onChange={(e) => setForm({...form, notes: e.target.value})} 
              rows={3} 
              className="w-full resize-none rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button 
              disabled={busy || remaining <= 0 || !form.amount || parseFloat(form.amount) <= 0} 
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-green-600 hover:to-emerald-700 disabled:opacity-60"
            >
              {busy ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
