"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";

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
  CheckCircle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  ),
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState({
    lowStock: [],
    outOfStock: [],
    stockValue: 0,
  });

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchInventoryData() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only products data for inventory reports
      const productsRes = await fetch(api("/api/products?limit=1000"), { 
        headers: authHeaders(), 
        cache: "no-store" 
      });

      const productsData = await productsRes.json();
      const products = Array.isArray(productsData.data) ? productsData.data : Array.isArray(productsData) ? productsData : [];

      // Calculate inventory metrics
      const lowStock = products.filter(p => (p.stock_quantity || 0) < 10 && (p.stock_quantity || 0) > 0);
      const outOfStock = products.filter(p => (p.stock_quantity || 0) === 0);
      const stockValue = products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (parseFloat(p.cost_price) || 0)), 0);

      setInventoryData({
        lowStock,
        outOfStock,
        stockValue,
      });
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError("Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <Layout title="Inventory Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Inventory Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Analyzing stock levels...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Inventory Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <Icon.AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Inventory Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchInventoryData}
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
    <Layout title="Inventory Reports">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Reports</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Stock levels and inventory analytics</p>
            </div>
          </div>
          <button
            onClick={fetchInventoryData}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            <Icon.Refresh className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Value</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  ${inventoryData.stockValue.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Icon.Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock</h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {inventoryData.lowStock.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Icon.AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Out of Stock</h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {inventoryData.outOfStock.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Icon.AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Low Stock Alerts</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {inventoryData.lowStock.length > 0 ? (
              inventoryData.lowStock.slice(0, 10).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-yellow-50/80 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold">
                      !
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">{product.stock_quantity || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">units left</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Icon.CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Out of Stock</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {inventoryData.outOfStock.length > 0 ? (
              inventoryData.outOfStock.slice(0, 10).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-red-50/80 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                      ×
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">0</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">units left</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Icon.CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No products are out of stock!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
