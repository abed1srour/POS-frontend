"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

// Icons
const Icon = {
  BarChart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
  TrendingUp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ShoppingCart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Filter: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  ),
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      revenueGrowth: 12.5,
      orderGrowth: 8.2,
      customerGrowth: 15.7,
      productGrowth: 3.1,
    },
    sales: {
      daily: [],
      monthly: [],
      topProducts: [],
      topCategories: [],
    },
    customers: {
      newCustomers: [],
      customerRetention: 0,
      topCustomers: [],
    },
    inventory: {
      lowStock: [],
      outOfStock: [],
      stockValue: 0,
    },
  });

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchReportData() {
    try {
      setLoading(true);
      
      // Fetch orders for revenue calculation
      const ordersRes = await fetch(api("/api/orders?limit=1000"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      const ordersData = await ordersRes.json();
      const orders = ordersData.data || ordersData || [];

      // Fetch customers
      const customersRes = await fetch(api("/api/customers?limit=1000"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      const customersData = await customersRes.json();
      const customers = customersData.data || customersData || [];

      // Fetch products
      const productsRes = await fetch(api("/api/products?limit=1000"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      const productsData = await productsRes.json();
      const products = productsData.data || productsData || [];

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = customers.length;
      const totalProducts = products.length;

      // Calculate growth (mock data for now)
      const revenueGrowth = 12.5;
      const orderGrowth = 8.2;
      const customerGrowth = 15.7;
      const productGrowth = 3.1;

      // Generate daily sales data for the last 7 days
      const dailySales = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayOrders = orders.filter(order => 
          new Date(order.created_at).toDateString() === date.toDateString()
        );
        const dayRevenue = dayOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
        dailySales.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayRevenue,
          orders: dayOrders.length,
        });
      }

      // Top products (mock data)
      const topProducts = [
        { name: "Product A", sales: 150, revenue: 4500 },
        { name: "Product B", sales: 120, revenue: 3600 },
        { name: "Product C", sales: 95, revenue: 2850 },
        { name: "Product D", sales: 80, revenue: 2400 },
        { name: "Product E", sales: 65, revenue: 1950 },
      ];

      // Top customers (mock data)
      const topCustomers = [
        { name: "John Doe", orders: 25, total: 1250 },
        { name: "Jane Smith", orders: 18, total: 980 },
        { name: "Bob Johnson", orders: 15, total: 750 },
        { name: "Alice Brown", orders: 12, total: 600 },
        { name: "Charlie Wilson", orders: 10, total: 500 },
      ];

      setReportData({
        overview: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          revenueGrowth,
          orderGrowth,
          customerGrowth,
          productGrowth,
        },
        sales: {
          daily: dailySales,
          monthly: [],
          topProducts,
          topCategories: [],
        },
        customers: {
          newCustomers: [],
          customerRetention: 78.5,
          topCustomers,
        },
        inventory: {
          lowStock: products.filter(p => (p.stock_quantity || 0) < 10),
          outOfStock: products.filter(p => (p.stock_quantity || 0) === 0),
          stockValue: products.reduce((sum, p) => sum + ((p.stock_quantity || 0) * (parseFloat(p.unit_price) || 0)), 0),
        },
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const tabs = [
    { id: "overview", name: "Overview", icon: Icon.BarChart },
    { id: "sales", name: "Sales", icon: Icon.TrendingUp },
    { id: "customers", name: "Customers", icon: Icon.Users },
    { id: "inventory", name: "Inventory", icon: Icon.Package },
  ];

  // Simple bar chart component
  const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="text-xs text-gray-500 mb-2">{item.label}</div>
            <div className="w-full bg-gray-200 rounded-t-lg relative">
              <div
                className="bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
            </div>
            <div className="text-xs font-medium text-gray-700 mt-1">${item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout title="Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Reports">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Comprehensive insights into your business performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-base font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
              <Icon.Download className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                          ${reportData.overview.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +{reportData.overview.revenueGrowth}% from last period
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Icon.DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                          {reportData.overview.totalOrders}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +{reportData.overview.orderGrowth}% from last period
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Icon.ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Customers</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                          {reportData.overview.totalCustomers}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +{reportData.overview.customerGrowth}% from last period
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Icon.Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Products</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                          {reportData.overview.totalProducts}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          +{reportData.overview.productGrowth}% from last period
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Icon.Package className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Chart */}
                <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Daily Sales</h2>
                  <BarChart 
                    data={reportData.sales.daily.map(day => ({
                      label: day.date,
                      value: day.revenue
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === "sales" && (
              <div className="space-y-8">
                <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Products</h2>
                  <div className="space-y-4">
                    {reportData.sales.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">${product.revenue.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Retention</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                        {reportData.customers.customerRetention}%
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Customer retention rate</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Total Customers</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                        {reportData.overview.totalCustomers}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Active customers</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Customers</h2>
                  <div className="space-y-4">
                    {reportData.customers.topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">${customer.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stock Value</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        ${reportData.inventory.stockValue.toFixed(2)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Total inventory value</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Low Stock</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                        {reportData.inventory.lowStock.length}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Products running low</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Out of Stock</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                        {reportData.inventory.outOfStock.length}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Products unavailable</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Low Stock Alerts</h2>
                  <div className="space-y-4">
                    {reportData.inventory.lowStock.slice(0, 10).map((product, index) => (
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
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
