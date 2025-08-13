"use client";

import React, { useMemo } from "react";
import Layout from "../components/Layout";

/**
 * Professional dashboard (dark/light) with theme switch, sidebar, topbar, KPIs, chart stub, and recent orders table.
 * No external UI libs required (Tailwind only). Icons are inline SVGs.
 * Auth guard: redirects to /login if no token in localStorage/sessionStorage.
 */

// ---------------- Icons ----------------
const Icon = {
  Dollar: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 1v22M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6" />
    </svg>
  ),
  Users: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Box: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7L12 12l8.7-5" />
    </svg>
  ),
  Trend: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 5h7v7" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardPage() {
  // Fake data for UI
  const stats = useMemo(
    () => [
      { title: "Revenue", value: "$12,480", change: "+12.3%", icon: Icon.Dollar },
      { title: "Orders", value: "342", change: "+4.7%", icon: Icon.Trend },
      { title: "Customers", value: "1,125", change: "+2.1%", icon: Icon.Users },
      { title: "Products", value: "286", change: "-1.4%", icon: Icon.Box },
    ],
    []
  );

  const orders = useMemo(
    () => [
      { id: "#10023", customer: "Sara Lee", total: 86.4, status: "Paid", date: "Aug 10" },
      { id: "#10022", customer: "Ali Hassan", total: 42.0, status: "Pending", date: "Aug 10" },
      { id: "#10021", customer: "John Doe", total: 129.9, status: "Refunded", date: "Aug 09" },
      { id: "#10020", customer: "Maya N.", total: 17.5, status: "Paid", date: "Aug 09" },
      { id: "#10019", customer: "Omar K.", total: 63.2, status: "Paid", date: "Aug 09" },
    ],
    []
  );

  return (
    <Layout title="POS Dashboard">
      <div className="space-y-8">
        {/* Stats grid */}
        <section>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.title} className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-indigo-500/10 p-3 dark:bg-indigo-500/20">
                    <stat.icon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold truncate">{stat.value}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    stat.change.startsWith("+") ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chart and Orders Grid */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Chart placeholder */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Revenue Overview</h3>
                <select className="rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <option className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Last 7 days</option>
                  <option className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Last 30 days</option>
                  <option className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Last 90 days</option>
                </select>
              </div>
              <div className="h-80 rounded-2xl bg-gray-100/50 dark:bg-white/5">
                <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  Chart placeholder - integrate your preferred charting library
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <h4 className="text-lg font-semibold mb-4">Top Products</h4>
              <div className="space-y-4">
                {[
                  { name: "Longi 615W Panel", sold: 82, revenue: "$12,480" },
                  { name: "Felicity 5kW Inverter", sold: 56, revenue: "$8,960" },
                  { name: "12V 200Ah Battery", sold: 31, revenue: "$4,960" },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.sold} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{product.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { action: "New order placed", time: "2 min ago", type: "order" },
                  { action: "Product stock updated", time: "5 min ago", type: "stock" },
                  { action: "Customer registered", time: "12 min ago", type: "customer" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent orders */}
        <section>
          <div className="rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
            <div className="border-b border-gray-200/60 p-6 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Recent Orders</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                  View all orders →
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/60 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-200/60 dark:border-white/10">
                      <td className="px-6 py-4 font-medium">{order.id}</td>
                      <td className="px-6 py-4">{order.customer}</td>
                      <td className="px-6 py-4 font-semibold">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "rounded-xl px-3 py-1 text-xs font-medium",
                          order.status === "Paid" && "bg-emerald-500/10 text-emerald-500",
                          order.status === "Pending" && "bg-amber-500/10 text-amber-500",
                          order.status === "Refunded" && "bg-rose-500/10 text-rose-500"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-12 px-6 pb-6 text-center text-xs text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} POS System
      </footer>
    </Layout>
  );
}
