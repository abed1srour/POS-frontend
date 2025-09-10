"use client";

import React from 'react';

const PaymentReceipt = ({ payment, order, onClose, onSuccess }) => {
  const generatePaymentReceipt = async () => {
    try {
      // Create payment receipt content with traditional cash receipt design
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cash Receipt - Payment #${payment.id}</title>
          <style>
            body { 
              font-family: 'Georgia', 'Times New Roman', serif; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5dc;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .receipt-container {
              max-width: 500px;
              margin: 0 auto;
              background: #f5f5dc;
              border: 1px solid #000;
              padding: 30px;
            }
            .receipt-title {
              text-align: center;
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 35px;
              font-family: 'Georgia', 'Times New Roman', serif;
            }
            .header-info {
              text-align: right;
              margin-bottom: 35px;
            }
            .receipt-number, .date {
              margin-bottom: 10px;
              font-size: 15px;
            }
            .underline {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 120px;
              margin-left: 8px;
            }
            .main-content {
              margin-bottom: 35px;
            }
            .received-from {
              margin-bottom: 18px;
            }
            .for-line {
              margin-bottom: 18px;
            }
            .label {
              display: inline-block;
              min-width: 100px;
            }
            .long-underline {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 250px;
              margin-left: 8px;
            }
            .amount-underline {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 80px;
              margin-left: 8px;
            }
            .bottom-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 35px;
            }
            .financial-summary {
              flex: 1;
            }
            .payment-method {
              flex: 1;
              text-align: right;
            }
            .payment-option {
              margin-bottom: 6px;
              font-size: 14px;
            }
            .checkbox {
              display: inline-block;
              width: 14px;
              height: 14px;
              border: 1px solid #000;
              margin-right: 10px;
              text-align: center;
              line-height: 14px;
              font-size: 11px;
            }
            .checked {
              background: #000;
              color: white;
            }
            .signature-line {
              text-align: center;
              margin-top: 35px;
            }
            .signature-underline {
              border-bottom: 1px solid #000;
              display: inline-block;
              min-width: 180px;
              margin-left: 8px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-title">Cash Receipt</div>
            
            <div class="header-info">
              <div class="receipt-number">
                Receipt Number: <span class="underline">${payment.id}</span>
              </div>
              <div class="date">
                Date: <span class="underline">${new Date(payment.payment_date || payment.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            
            <div class="main-content">
              <div class="received-from">
                <span class="label">Received From</span>
                <span class="long-underline">${order?.first_name || 'Customer'} ${order?.last_name || ''}</span>
                <span class="label" style="margin-left: 15px;">the amount of $</span>
                <span class="amount-underline">${parseFloat(payment.amount || 0).toFixed(2)}</span>
              </div>
              
              <div class="for-line">
                <span class="label">For</span>
                <span class="long-underline">Payment for Order #${order?.id || payment.order_id}</span>
              </div>
            </div>
            
            <div class="bottom-section">
              <div class="financial-summary">
                <div style="margin-bottom: 8px;">
                  Current Balance: $<span class="underline">${parseFloat(order?.total_amount || 0).toFixed(2)}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  Payment Amount: $<span class="underline">${parseFloat(payment.amount || 0).toFixed(2)}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  Balance Due: $<span class="underline">${parseFloat(order?.remaining || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div class="payment-method">
                <div class="payment-option">
                  <span class="checkbox ${payment.payment_method === 'cash' ? 'checked' : ''}">${payment.payment_method === 'cash' ? '✓' : ''}</span>
                  Cash
                </div>
                <div class="payment-option">
                  <span class="checkbox ${payment.payment_method === 'cheque' ? 'checked' : ''}">${payment.payment_method === 'cheque' ? '✓' : ''}</span>
                  Cheque
                </div>
                <div class="payment-option">
                  <span class="checkbox ${payment.payment_method === 'money_order' ? 'checked' : ''}">${payment.payment_method === 'money_order' ? '✓' : ''}</span>
                  Money Order
                </div>
              </div>
            </div>
            
            <div class="signature-line">
              <span class="label">Received By:</span>
              <span class="signature-underline"></span>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a blob from the HTML content
      const blob = new Blob([receiptContent], { type: 'text/html' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-receipt-${payment.id}.html`;
      
      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      if (onSuccess) {
        onSuccess("Payment receipt generated successfully!");
      }
    } catch (error) {
      console.error("Error generating payment receipt:", error);
      if (onSuccess) {
        onSuccess("Failed to generate payment receipt");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 font-serif">
            Generate Payment Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1 font-medium">Payment Amount</p>
            <p className="font-bold text-lg text-gray-900">
              ${parseFloat(payment.amount || 0).toFixed(2)}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1 font-medium">Payment Method</p>
            <p className="font-medium text-gray-900 capitalize">
              {payment.payment_method || 'Not specified'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1 font-medium">Payment Date</p>
            <p className="font-medium text-gray-900">
              {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 shadow-lg hover:bg-gray-300 transition-all duration-200 border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={generatePaymentReceipt}
            className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-green-700 transition-all duration-200"
          >
            Generate Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
