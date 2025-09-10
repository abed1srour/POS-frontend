"use client";

// Build a standalone HTML document string for an invoice.
// This is a presentational template only (no tax/VAT). Use in PDF export or print.
// Props shape (all optional except items):
// {
//   company: { name, address, phone, email, website },
//   customer: { first_name, last_name, address, phone_number, email },
//   items: [{ product_name, description, quantity, price }],
//   deliveryAmount: number,
//   issueDate: Date|string,
//   dueDate: Date|string,
//   invoiceNumber: string (if omitted, a random 5-digit number is generated)
// }

export function buildInvoiceHTML({ company = {}, customer = {}, items = [], deliveryAmount = 0, issueDate, dueDate, invoiceNumber } = {}) {
  const number = invoiceNumber || String(Math.floor(10000 + Math.random() * 90000));
  const fmt = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const normalizedItems = Array.isArray(items) ? items : [];
  const subtotal = normalizedItems.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.price || 0), 0);
  const delivery = Number(deliveryAmount || 0);
  const total = subtotal + delivery;

  const rows = normalizedItems.map((i) => {
    const qty = Number(i.quantity || 0);
    const price = Number(i.price || 0);
    const line = qty * price;
    const desc = i.description || "";
    return `
      <tr>
        <td>
          <div class="item-name">${i.product_name || "Item"}</div>
          ${desc ? `<div class="item-desc">${desc}</div>` : ""}
        </td>
        <td class="cell-center">${qty}</td>
        <td class="cell-right">${fmt(price)}</td>
        <td class="cell-right">${fmt(line)}</td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice #${number}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        body { font-family: Arial, Helvetica, sans-serif; color:#111827; }
        .topbar { height:6px; background:#2b4f91; margin-bottom:18px; }
        .invoice { background:#fff; padding:24px; }
        .title { font-size:36px; font-weight:800; color:#2b4f91; letter-spacing:1px; margin:0 0 6px 0; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; }
        .block { font-size:12px; line-height:1.6; }
        .label { color:#6b7280; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
        .meta { text-align:right; }
        .divider { height:1px; background:#d1d5db; margin:16px 0; }
        h4 { margin:0 0 8px 0; font-size:12px; color:#264b8d; text-transform:uppercase; letter-spacing:1px; }
        table { width:100%; border-collapse:collapse; margin-top:10px; }
        thead th { background:#112246; color:#fff; font-size:11px; padding:10px 8px; text-align:left; }
        td { font-size:12px; border-bottom:1px solid #e5e7eb; padding:10px 8px; vertical-align:top; }
        .cell-right { text-align:right; }
        .cell-center { text-align:center; }
        .item-name { font-weight:700; color:#111827; }
        .item-desc { font-size:11px; color:#6b7280; margin-top:2px; }
        .totals-wrap { margin-top:16px; display:flex; justify-content:flex-end; }
        .totals { width:340px; }
        .totals td { border:none; padding:6px 8px; }
        .totals tfoot td { font-weight:800; border-top:2px solid #d1d5db; padding-top:10px; }
      </style>
    </head>
    <body>
      <div class="topbar"></div>
      <div class="invoice">
        <div class="title">INVOICE</div>
        <div class="header">
          <div class="block">
            <div class="label">Company</div>
            <div style="font-weight:700">${company.name || ""}</div>
            <div>${company.address || ""}</div>
            <div>${company.phone || ""}</div>
            <div>${company.email || ""}</div>
            <div>${company.website || ""}</div>
          </div>
          <div class="block meta">
            <div class="label">Customer</div>
            <div>${[customer.first_name, customer.last_name].filter(Boolean).join(" ")}</div>
            <div>${customer.address || ""}</div>
            <div>${customer.phone_number || ""}</div>
            <div>${customer.email || ""}</div>
            <div style="margin-top:8px;"><strong>Invoice No:</strong> ${number}</div>
            <div><strong>Issue Date:</strong> ${issueDate ? new Date(issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            <div><strong>Due Date:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString() : new Date(Date.now()+14*24*60*60*1000).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="section">
          <h4>Items Description</h4>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="width:70px;" class="cell-center">Qty</th>
                <th style="width:120px;" class="cell-right">Unit Price</th>
                <th style="width:120px;" class="cell-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4" class="cell-center" style="color:#6b7280;">No items</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="totals-wrap">
          <table class="totals">
            <tbody>
              <tr><td>Subtotal</td><td class="cell-right">${fmt(subtotal)}</td></tr>
              <tr><td>Delivery</td><td class="cell-right">${fmt(delivery)}</td></tr>
            </tbody>
            <tfoot>
              <tr><td>Total</td><td class="cell-right">${fmt(total)}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
}

"use client";

import React from "react";

// Icons
const Icon = {
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
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M9 14h6" />
      <path d="M9 18h6" />
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
};

export default function InvoiceTemplate({ 
  invoice, 
  companySettings, 
  showCompanyInfo = true, 
  showCustomerInfo = true,
  showItems = true,
  className = "" 
}) {
  // Format date helper
  function formatDate(dateString) {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  }

  // Get status badge styling
  function getStatusBadge(status) {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
      paid: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      overdue: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400",
    };
    return styles[status] || styles.pending;
  }

  if (!invoice) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Icon.FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          No invoice data available
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Company Information */}
      {showCompanyInfo && companySettings && (
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Icon.FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Company Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Business Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {companySettings.business_name || "Your Company Name"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {companySettings.business_phone || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {companySettings.business_address || "123 Business Street, City Name, Country 12345"}
              </p>
            </div>
            {companySettings.business_website && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Website</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {companySettings.business_website}
                </p>
              </div>
            )}
            {companySettings.tax_number && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tax Number</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {companySettings.tax_number}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Header */}
      <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Icon.FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Invoice #{invoice.id || invoice.invoice_number}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {invoice.order_id ? `Created from Order #${invoice.order_id}` : 'Invoice Details'}
              </p>
            </div>
          </div>
          {invoice.status && (
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(invoice.status)}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${parseFloat(invoice.total_amount || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
            <p className="text-gray-900 dark:text-white">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Customer Information */}
      {showCustomerInfo && (
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Icon.User className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {invoice.customer_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {invoice.customer_email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {invoice.customer_phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Total</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                ${parseFloat(invoice.order_total || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Information */}
      {showItems && invoice.order_items && invoice.order_items.length > 0 && (
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Icon.Package className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Product Details</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Qty</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.order_items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.product_name || 'Unknown Product'}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.product_description || 'No description'}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.quantity || 1}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        ${(parseFloat(item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
