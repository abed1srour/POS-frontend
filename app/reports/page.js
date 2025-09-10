"use client";

import React from "react";
import Layout from "../components/Layout";
import Link from "next/link";

// Icons
const Icon = {
  TrendingUp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
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
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ArrowRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  ),
};

export default function ReportsPage() {
  const reportCategories = [
    {
      id: "sales",
      title: "Sales Reports",
      description: "Product performance and sales analytics",
      icon: Icon.TrendingUp,
      href: "/reports/sales",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10",
    },
    {
      id: "customers",
      title: "Customer Reports",
      description: "Customer performance and spending analytics",
      icon: Icon.Users,
      href: "/reports/customers",
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10",
    },
    {
      id: "inventory",
      title: "Inventory Reports",
      description: "Stock levels and inventory analytics",
      icon: Icon.Package,
      href: "/reports/inventory",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10",
    },
    {
      id: "financial",
      title: "Financial Reports",
      description: "Revenue, expenses, and profit analytics",
      icon: Icon.DollarSign,
      href: "/reports/financial",
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10",
    },
  ];

  return (
    <Layout title="Reports">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Business Reports
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive analytics and insights for your business performance
          </p>
        </div>

        {/* Report Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group block"
              >
                <div className={`relative overflow-hidden rounded-3xl border border-gray-200/60 bg-gradient-to-br ${category.bgColor} shadow-xl dark:border-white/10 backdrop-blur-sm p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer`}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <Icon.ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Preview */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Report Categories Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Icon.TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Sales</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Product performance</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Icon.Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Customers</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customer analytics</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-3">
                <Icon.Package className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Inventory</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock management</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
                <Icon.DollarSign className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Financial</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profit & loss</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

