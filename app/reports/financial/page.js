"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { api, getAuthHeadersFromStorage } from "../../config/api";

// Icons
const Icon = {
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  TrendingUp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
  TrendingDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" />
      <polyline points="16,17 22,17 22,11" />
    </svg>
  ),
  BarChart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
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

export default function FinancialReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profitLoss: 0,
    profitMargin: 0,
    averageOrderValue: 0,
    totalOrders: 0,
  });

  // Fetch helpers - now using centralized auth headers
  function authHeaders() {
    return getAuthHeadersFromStorage();
  }

  async function fetchFinancialData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Fetching financial data...");
      
      // Fetch only the data needed for financial reports
      const [ordersRes, expensesRes] = await Promise.all([
        fetch(api("/api/orders?limit=1000"), { headers: authHeaders(), cache: "no-store" }),
        fetch(api("/api/expenses?limit=1000"), { headers: authHeaders(), cache: "no-store" }),
      ]);

      console.log("📡 API responses received");
      console.log("Orders Response Status:", ordersRes.status);
      console.log("Expenses Response Status:", expensesRes.status);

      const [ordersData, expensesData] = await Promise.all([
        ordersRes.json(),
        expensesRes.json(),
      ]);

      console.log("📊 Raw API Data:");
      console.log("Orders Data:", ordersData);
      console.log("Expenses Data:", expensesData);

      const orders = Array.isArray(ordersData.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
      const expenses = Array.isArray(expensesData.data) ? expensesData.data : Array.isArray(expensesData) ? expensesData : [];

      console.log("🔍 Processed Data:");
      console.log("Orders:", orders);
      console.log("Expenses:", expenses);

      // Calculate financial metrics
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const profitLoss = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profitLoss / totalRevenue) * 100 : 0;
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      console.log("💰 Financial Metrics Calculated:");
      console.log("Total Revenue:", totalRevenue);
      console.log("Total Expenses:", totalExpenses);
      console.log("Profit/Loss:", profitLoss);
      console.log("Profit Margin:", profitMargin);
      console.log("Average Order Value:", averageOrderValue);
      console.log("Total Orders:", orders.length);

      setFinancialData({
        totalRevenue,
        totalExpenses,
        profitLoss,
        profitMargin,
        averageOrderValue,
        totalOrders: orders.length,
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError("Failed to load financial data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <Layout title="Financial Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Financial Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Analyzing financial performance...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Financial Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <Icon.AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Financial Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchFinancialData}
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
    <Layout title="Financial Reports">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Revenue, expenses, and profit analytics</p>
            </div>
          </div>
          <button
            onClick={fetchFinancialData}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            <Icon.Refresh className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  ${financialData.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  ${financialData.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Icon.TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit/Loss</h3>
                <p className={`text-3xl font-bold mt-2 ${financialData.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${financialData.profitLoss.toFixed(2)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center ${financialData.profitLoss >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'}`}>
                {financialData.profitLoss >= 0 ? (
                  <Icon.TrendingUp className="h-6 w-6 text-white" />
                ) : (
                  <Icon.TrendingDown className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit Margin</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {financialData.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Icon.BarChart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Average Order Value */}
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Average Order Value</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                ${financialData.averageOrderValue.toFixed(2)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Per order</p>
              <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Based on {financialData.totalOrders} orders
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Financial Summary</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-500/10">
                <div className="flex items-center gap-3">
                  <Icon.DollarSign className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Revenue</span>
                </div>
                <span className="text-xl font-bold text-green-600">${financialData.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-500/10">
                <div className="flex items-center gap-3">
                  <Icon.TrendingDown className="h-6 w-6 text-red-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">Expenses</span>
                </div>
                <span className="text-xl font-bold text-red-600">${financialData.totalExpenses.toFixed(2)}</span>
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl ${financialData.profitLoss >= 0 ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                <div className="flex items-center gap-3">
                  {financialData.profitLoss >= 0 ? (
                    <Icon.TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <Icon.TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white">Net Profit</span>
                </div>
                <span className={`text-xl font-bold ${financialData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${financialData.profitLoss.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
