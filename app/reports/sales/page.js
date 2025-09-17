"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { ReportTable } from "../components/ReportTable";
import Link from "next/link";
import { api, getAuthHeadersFromStorage } from "../../config/api";

// Icons
const Icon = {
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
  Refresh: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  AlertTriangle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  ),
};

// API configuration is now imported from config/api.js

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch helpers - now using centralized auth headers
  function authHeaders() {
    return getAuthHeadersFromStorage();
  }

  // Calculate top products
  function calculateTopProducts(orderItems, products) {
    console.log("🧮 Calculating top products...");
    console.log("Input orderItems:", orderItems);
    console.log("Input products:", products);
    
    // Ensure orderItems is an array
    if (!Array.isArray(orderItems)) {
      console.warn('❌ orderItems is not an array:', orderItems);
      return [];
    }

    if (!Array.isArray(products)) {
      console.warn('❌ products is not an array:', products);
      return [];
    }

    const productSales = {};
    orderItems.forEach((item, index) => {
      console.log(`Processing order item ${index}:`, item);
      const productId = item.product_id;
      if (!productSales[productId]) {
        productSales[productId] = { quantity: 0, revenue: 0 };
      }
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const revenue = quantity * unitPrice;
      
      productSales[productId].quantity += quantity;
      productSales[productId].revenue += revenue;
      
      console.log(`Product ${productId}: +${quantity} units, +$${revenue} revenue`);
    });

    console.log("📊 Product sales summary:", productSales);

    const result = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find(p => p.id == productId);
        const resultItem = {
          id: productId,
          name: product?.name || `Product #${productId}`,
          sales: sales.quantity,
          revenue: sales.revenue,
        };
        console.log(`Mapped product ${productId}:`, resultItem);
        return resultItem;
      })
      .sort((a, b) => b.revenue - a.revenue);

    console.log("🏆 Final sorted result:", result);
    return result;
  }

  async function fetchSalesData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Fetching sales data...");
      
      // Fetch only the data needed for sales reports
      const [orderItemsRes, productsRes] = await Promise.all([
        fetch(api("/api/order-items?limit=1000"), { headers: authHeaders(), cache: "no-store" }),
        fetch(api("/api/products?limit=1000"), { headers: authHeaders(), cache: "no-store" }),
      ]);

      console.log("📡 API responses received");
      console.log("Order Items Response Status:", orderItemsRes.status);
      console.log("Products Response Status:", productsRes.status);

      const [orderItemsData, productsData] = await Promise.all([
        orderItemsRes.json(),
        productsRes.json(),
      ]);

      console.log("📊 Raw API Data:");
      console.log("Order Items Data:", orderItemsData);
      console.log("Products Data:", productsData);

      const orderItems = Array.isArray(orderItemsData.data) ? orderItemsData.data : Array.isArray(orderItemsData) ? orderItemsData : [];
      const products = Array.isArray(productsData.data) ? productsData.data : Array.isArray(productsData) ? productsData : [];

      console.log("🔍 Processed Data:");
      console.log("Order Items:", orderItems);
      console.log("Products:", products);

      const topProductsData = calculateTopProducts(orderItems, products);
      console.log("📈 Top Products Calculated:", topProductsData);
      
      setTopProducts(topProductsData);
    } catch (error) {
      console.error("❌ Error fetching sales data:", error);
      setError("Failed to load sales data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSalesData();
  }, []);

  // Table columns configuration
  const columns = [
    {
      header: "Rank",
      key: "rank",
      render: (item, globalIndex) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{globalIndex + 1}</span>
      )
    },
    {
      header: "Product Name",
      key: "name",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.name}</span>
      )
    },
    {
      header: "Product ID",
      key: "id",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">#{item.id}</span>
      )
    },
    {
      header: "Units Sold",
      key: "sales",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{item.sales}</span>
      )
    },
    {
      header: "Total Revenue",
      key: "revenue",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">${item.revenue.toFixed(2)}</span>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Sales Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Sales Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Analyzing product performance...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Sales Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <Icon.AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Sales Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchSalesData}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-white font-medium hover:bg-indigo-600 transition-colors"
            >
              <Icon.Refresh className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sales Reports">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Reports</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Product performance and sales analytics</p>
            </div>
          </div>
          <button
            onClick={fetchSalesData}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            <Icon.Refresh className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <ReportTable
          title="Top Products"
          description="Products ranked by total revenue"
          data={topProducts}
          columns={columns}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={Icon.Package}
          emptyMessage="No product data available"
          emptySubMessage="Product rankings will appear here once orders are recorded"
        />
      </div>
    </Layout>
  );
}
