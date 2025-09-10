"use client";

// Reusable invoice PDF exporter used by Orders and Invoices pages
// Requires running in a client component (uses DOM, html2canvas, jsPDF)

export async function exportInvoicePDF({ api, authHeaders, orderId, invoiceId, dueDate }) {
  // Fetch full order and optional company settings
  const [orderRes, companyRes] = await Promise.all([
    fetch(api(`/api/orders/${orderId}`), { headers: authHeaders(), cache: 'no-store' }),
    fetch(api(`/api/company-settings`), { headers: authHeaders(), cache: 'no-store' }).catch(() => null)
  ]);
  if (!orderRes.ok) throw new Error('Failed to load order');
  const orderJson = await orderRes.json();
  const order = orderJson.data || orderJson || {};
  const companyJson = companyRes && companyRes.ok ? await companyRes.json() : null;
  const company = companyJson ? (companyJson.data || companyJson) : {};

  const items = (order.order_items || order.items || []);
  const subtotal = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.price || i.unit_price || 0), 0);
  const discountTotal = items.reduce((sum, i) => sum + Number(i.discount || 0), 0);
  const delivery = Number(order.delivery_amount ?? order.delivery_fee ?? order.delivery ?? 0);
  const paidAmount = Number(order.total_paid ?? 0);
  const grandTotal = subtotal - discountTotal + delivery;
  const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const rowsHtml = items.map(i => {
    const qty = Number(i.quantity || 0);
    const price = Number(i.price || i.unit_price || 0);
    const line = qty * price - Number(i.discount || 0);
    const description = i.description || i.category || '';
    return `
      <tr>
        <td>
          <div style="font-weight:700; color:#111827;">${i.product_name || 'Product'}</div>
          ${description ? `<div style=\"font-size:11px; color:#6b7280;\">${description}</div>` : ''}
        </td>
        <td style="text-align:center;">${qty}</td>
        <td style="text-align:right;">${fmt(price)}</td>
        <td style="text-align:right;">${fmt(line)}</td>
      </tr>
    `;
  }).join('');

  const invoiceNumber = String(Math.floor(Math.random() * 900000) + 100000);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice #${invoiceId || orderId}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        body { font-family: Arial, Helvetica, sans-serif; color:#111827; }
        .topbar { height:6px; background:#2b4f91; margin-bottom:18px; }
        .invoice { background:#fff; padding:24px; }
        .title { font-size:40px; font-weight:800; color:#2b4f91; letter-spacing:1px; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; padding-top:6px; }
        .company, .billed, .meta { font-size:12px; line-height:1.6; }
        .label { color:#6b7280; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
        .divider { height:1px; background:#d1d5db; margin:16px 0; }
        h4 { margin:0 0 8px 0; font-size:12px; color:#264b8d; text-transform:uppercase; letter-spacing:1px; }
        table { width:100%; border-collapse:collapse; margin-top:10px; }
        thead th { background:#112246; color:#fff; font-size:11px; padding:10px 8px; text-align:left; }
        td { font-size:12px; border-bottom:1px solid #e5e7eb; padding:10px 8px; vertical-align:top; }
        .totals-wrap { margin-top:16px; display:flex; justify-content:flex-end; }
        .totals { width:320px; }
        .totals td { border:none; padding:6px 8px; }
        .totals tfoot td { font-weight:800; border-top:2px solid #d1d5db; padding-top:10px; }
        .grand { background:#2b4f91; color:#fff; font-weight:800; }
      </style>
    </head>
    <body>
      <div class="topbar"></div>
      <div class="invoice">
        <div class="title">INVOICE</div>
        <div class="billed" style="margin-top:6px;">
          <div class="label">Billed To</div>
          <div>${order.first_name || ''} ${order.last_name || ''}</div>
          <div>${order.address || ''}</div>
          <div>${order.phone_number || ''}</div>
          <div>${order.email || ''}</div>
        </div>
        <div class="header" style="margin-top:8px;">
          <div class="company">
            <div style="font-weight:700">${company.name || ''}</div>
            <div>${company.address || ''}</div>
            <div>${company.phone || ''}</div>
            <div>${company.email || ''}</div>
            <div>${company.website || ''}</div>
          </div>
          <div class="meta">
            <div><strong>Invoice No</strong> : ${invoiceNumber}</div>
            <div><strong>Issue Date</strong> : ${new Date().toLocaleDateString()}</div>
            <div><strong>Due Date</strong> : ${dueDate ? new Date(dueDate).toLocaleDateString() : new Date(Date.now()+14*24*60*60*1000).toLocaleDateString()}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="section">
          <h4>Items Description</h4>
          <table>
            <thead>
              <tr>
                <th>Items Description</th>
                <th style="width:60px; text-align:center;">Qty</th>
                <th style="width:110px; text-align:right;">Unit Price</th>
                <th style="width:110px; text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="4" style="text-align:center; color:#6b7280;">No items</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="totals-wrap">
          <table class="totals">
            <tbody>
              <tr><td>Sub Total</td><td style="text-align:right;">${fmt(subtotal)}</td></tr>
              ${delivery > 0 ? `<tr><td>Delivery</td><td style=\"text-align:right;\">${fmt(delivery)}</td></tr>` : ''}
            </tbody>
            <tfoot>
              <tr class="grand"><td>Total</td><td style="text-align:right;">${fmt(grandTotal)}</td></tr>
              <tr><td>Deposit</td><td style="text-align:right;">${fmt(paidAmount)}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  const { jsPDF } = await import('jspdf');
  const html2canvas = await import('html2canvas');
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  document.body.appendChild(container);
  const canvas = await html2canvas.default(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 800, height: container.scrollHeight });
  document.body.removeChild(container);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p','mm','a4');
  const imgWidth = 210; const pageHeight = 295; const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight; let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft >= 0) { position = heightLeft - imgHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); heightLeft -= pageHeight; }
  pdf.save(`invoice-${invoiceId || orderId}.pdf`);
}


