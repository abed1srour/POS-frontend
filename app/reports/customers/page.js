"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { ReportTable } from "../components/ReportTable";
import Link from "next/link";

// Icons
const Icon = {
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function CustomersReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Calculate top customers
  function calculateTopCustomers(allOrders, customers) {
    // Ensure orders and customers are arrays
    if (!Array.isArray(allOrders)) {

      return [];
    }
    
    if (!Array.isArray(customers)) {

      return [];
    }

    const customerTotals = {};
    
    // Process ALL orders (not just filtered ones) to get complete customer data
    allOrders.forEach(order => {
      const customerId = order.customer_id;
      if (customerId) {
        if (!customerTotals[customerId]) {
          customerTotals[customerId] = { orders: 0, total: 0 };
        }
        customerTotals[customerId].orders += 1;
        customerTotals[customerId].total += parseFloat(order.total_amount) || 0;
      }
    });

    // Create results for all customers, including those without orders
    const results = customers.map(customer => {
      const customerData = customerTotals[customer.id] || { orders: 0, total: 0 };
      return {
        id: customer.id,
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || `Customer #${customer.id}`,
        orders: customerData.orders,
        total: customerData.total,
      };
    });

    // Sort by total spent (descending) and return all
    return results.sort((a, b) => b.total - a.total);
  }

  async function fetchCustomersData() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only the data needed for customer reports
      const [ordersRes, customersRes] = await Promise.all([
        fetch(api("/api/orders?limit=1000"), { headers: authHeaders(), cache: "no-store" }),
        fetch(api("/api/customers?limit=1000"), { headers: authHeaders(), cache: "no-store" }),
      ]);

      const [ordersData, customersData] = await Promise.all([
        ordersRes.json(),
        customersRes.json(),
      ]);

      const orders = Array.isArray(ordersData.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
      const customers = Array.isArray(customersData.data) ? customersData.data : Array.isArray(customersData) ? customersData : [];

      const topCustomersData = calculateTopCustomers(orders, customers);
      setTopCustomers(topCustomersData);
    } catch (error) {
      console.error("Error fetching customers data:", error);
      setError("Failed to load customers data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomersData();
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
      header: "First Name",
      key: "firstName",
      render: (item) => {
        const nameParts = item.name.split(' ');
        const firstName = nameParts[0] || '';
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{firstName}</span>
        );
      }
    },
    {
      header: "Last Name",
      key: "lastName",
      render: (item) => {
        const nameParts = item.name.split(' ');
        const lastName = nameParts.slice(1).join(' ') || '';
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{lastName}</span>
        );
      }
    },
    {
      header: "Customer ID",
      key: "id",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">#{item.id}</span>
      )
    },
    {
      header: "Total Orders",
      key: "orders",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{item.orders}</span>
      )
    },
    {
      header: "Total Spent",
      key: "total",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">${item.total.toFixed(2)}</span>
      )
    }
  ];

  if (loading) {
    return (
      <Layout title="Customer Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Customer Data</h2>
            <p className="text-gray-600 dark:text-gray-400">Analyzing customer performance...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Customer Reports">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <Icon.AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Customer Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchCustomersData}
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
    <Layout title="Customer Reports">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Reports</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Customer performance and spending analytics</p>
            </div>
          </div>
          <button
            onClick={fetchCustomersData}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            <Icon.Refresh className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <ReportTable
          title="Top Customers"
          description="Customers ranked by total spending"
          data={topCustomers}
          columns={columns}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          icon={Icon.Users}
          emptyMessage="No customer data available"
          emptySubMessage="Customer rankings will appear here once orders are recorded"
        />
      </div>
    </Layout>
  );
}
