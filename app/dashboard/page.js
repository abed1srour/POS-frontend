"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useTranslation } from "../lib/useTranslation";

// Icons
const Icon = {
  TrendingUp: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 5h7v7" />
    </svg>
  ),
  TrendingDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 7l6 6 4-4 7 7" />
      <path d="M14 19h7v-7" />
    </svg>
  ),
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
  Package: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7L12 12l8.7-5" />
    </svg>
  ),
  ShoppingCart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Clock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  CheckCircle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  AlertCircle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Star: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  ),
  BarChart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  PieChart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  Activity: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
  Target: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Zap: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
    </svg>
  ),
  Calendar: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  AlertTriangle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  TrendingUp: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Enhanced Chart Components
const BarChart = ({ data, title, height = 200, color = "indigo", showValues = false }) => {
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value || 0)) : 1;
  
  return (
    <div className="h-full">
      {title && <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{title}</h4>}
      <div className="flex h-full items-end justify-between gap-1">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative min-h-[20px]">
              <div
                className={`bg-gradient-to-t from-${color}-500 to-${color}-600 rounded-t-lg transition-all duration-500`}
                style={{ height: `${((item.value || 0) / maxValue) * 100}%` }}
              ></div>
              {showValues && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {item.value}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data, title, height = 200, color = "blue", showGrid = true }) => {
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No data</div>;
  
  const maxValue = Math.max(...data.map(d => d.value || 0));
  const minValue = Math.min(...data.map(d => d.value || 0));
  const range = maxValue - minValue;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range > 0 ? 100 - ((item.value - minValue) / range) * 100 : 50;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="h-full">
      {title && <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{title}</h4>}
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {showGrid && (
            <>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="rgba(156, 163, 175, 0.2)"
                  strokeWidth="0.5"
                />
              ))}
            </>
          )}
          <polyline
            fill="none"
            stroke={`rgb(59, 130, 246)`}
            strokeWidth="2"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = range > 0 ? 100 - ((item.value - minValue) / range) * 100 : 50;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={`rgb(59, 130, 246)`}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const PieChart = ({ data, title, height = 200 }) => {
  if (data.length === 0) return <div className="h-full flex items-center justify-center text-gray-500">No data</div>;
  
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      label: item.label,
      percentage: percentage.toFixed(1),
      value: item.value
    };
  });
  
  return (
    <div className="h-full">
      {title && <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{title}</h4>}
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{total.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: segment.color }}></div>
              <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{segment.percentage}%</div>
              <div className="text-gray-500">{segment.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, changeType, icon, color, subtitle }) => (
  <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
    <div className="flex items-start gap-4">
      <div className={`rounded-xl p-3 flex-shrink-0 ${
        color === 'blue' ? 'bg-blue-500/10 dark:bg-blue-500/20' :
        color === 'green' ? 'bg-green-500/10 dark:bg-green-500/20' :
        color === 'purple' ? 'bg-purple-500/10 dark:bg-purple-500/20' :
        color === 'orange' ? 'bg-orange-500/10 dark:bg-orange-500/20' :
        color === 'red' ? 'bg-red-500/10 dark:bg-red-500/20' :
        'bg-indigo-500/10 dark:bg-indigo-500/20'
      }`}>
        {icon && React.createElement(icon, {
          className: `h-6 w-6 ${
            color === 'blue' ? 'text-blue-500' :
            color === 'green' ? 'text-green-500' :
            color === 'purple' ? 'text-purple-500' :
            color === 'orange' ? 'text-orange-500' :
            color === 'red' ? 'text-red-500' :
            'text-indigo-500'
          }`
        })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        {change && (
          <div className="flex items-center gap-1 mt-2">
            {changeType === "positive" ? (
              <Icon.TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <Icon.TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-semibold ${
              changeType === "positive" ? "text-green-500" : "text-red-500"
            }`}>
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real data state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    productsSold: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    inventoryValue: 0,
    lowStockItems: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [hourlySales, setHourlySales] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // API helper function
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch dashboard statistics
      const statsResponse = await fetch(`/api/dashboard/stats?period=${selectedPeriod}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (!statsResponse.ok) {
        const errorData = await statsResponse.json();
        if (statsResponse.status === 503) {
          throw new Error("Backend server is not available. Please start the backend server to see real data.");
        }
        throw new Error(`Failed to fetch stats: ${errorData.error || statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent orders
      const ordersResponse = await fetch(`/api/orders?limit=5&sort=created_at&order=desc`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.data || []);
      } else if (ordersResponse.status === 503) {
        setRecentOrders([]);
      }

      // Fetch top products
      const productsResponse = await fetch(`/api/products/top-selling?limit=4`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setTopProducts(productsData.data || []);
      } else if (productsResponse.status === 503) {
        setTopProducts([]);
      }

      // Fetch recent activities
      const activitiesResponse = await fetch(`/api/activities?limit=5`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.data || []);
      } else if (activitiesResponse.status === 503) {
        setActivities([]);
      }

      // Fetch chart data
      const chartResponse = await fetch(`/api/dashboard/chart?period=${selectedPeriod}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        setChartData(chartData.data || []);
      } else if (chartResponse.status === 503) {
        setChartData([]);
      } else {
        setChartData([]);
      }

    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Mock data for enhanced charts (replace with real API calls)
  const mockSalesByCategory = [
    { label: 'Electronics', value: 45 },
    { label: 'Clothing', value: 30 },
    { label: 'Books', value: 15 },
    { label: 'Home & Garden', value: 10 },
  ];

  const mockOrderStatus = [
    { label: 'Completed', value: 65 },
    { label: 'Processing', value: 20 },
    { label: 'Pending', value: 10 },
    { label: 'Cancelled', value: 5 },
  ];

  const mockHourlySales = [
    { label: '9AM', value: 1200 },
    { label: '10AM', value: 1800 },
    { label: '11AM', value: 2200 },
    { label: '12PM', value: 2800 },
    { label: '1PM', value: 2400 },
    { label: '2PM', value: 2000 },
    { label: '3PM', value: 1800 },
    { label: '4PM', value: 1600 },
    { label: '5PM', value: 1400 },
    { label: '6PM', value: 1200 },
  ];

  const mockLowStockAlerts = [
    { name: 'iPhone 14 Pro', current: 3, min: 5, category: 'Electronics' },
    { name: 'Nike Air Max', current: 2, min: 8, category: 'Shoes' },
    { name: 'Samsung TV 55"', current: 1, min: 3, category: 'Electronics' },
    { name: 'Coffee Maker', current: 4, min: 6, category: 'Home' },
  ];

  if (loading) {
    return (
      <Layout title={t('common.dashboard')}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={t('common.dashboard')}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Icon.AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-2">Failed to load dashboard data</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time insights for informed decision making</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-48 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-sm font-medium text-white cursor-pointer transition-all duration-200 hover:bg-white/15 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20"
              >
                <span>
                  {selectedPeriod === 'daily' && 'Today'}
                  {selectedPeriod === 'weekly' && 'This Week'}
                  {selectedPeriod === 'monthly' && 'This Month'}
                  {selectedPeriod === 'yearly' && 'This Year'}
                </span>
                <svg 
                  className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown List */}
              <div className={`absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 z-50 ${
                isDropdownOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="py-2">
                  {[
                    { value: 'daily', label: 'Today' },
                    { value: 'weekly', label: 'This Week' },
                    { value: 'monthly', label: 'This Month' },
                    { value: 'yearly', label: 'This Year' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPeriod(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-3 text-left text-sm font-medium transition-all duration-150 hover:bg-white/10 ${
                        selectedPeriod === option.value 
                          ? 'bg-indigo-500/20 text-indigo-300 border-r-2 border-indigo-500' 
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('dashboard.total_sales')}
            value={formatCurrency(stats.totalRevenue)}
            change={formatPercentage(stats.revenueChange)}
            changeType={stats.revenueChange >= 0 ? "positive" : "negative"}
            icon={Icon.Dollar}
            color="blue"
            subtitle={t('dashboard.vs_previous_period')}
          />
          <MetricCard
            title={t('dashboard.total_orders')}
            value={stats.totalOrders.toLocaleString()}
            change={formatPercentage(stats.ordersChange)}
            changeType={stats.ordersChange >= 0 ? "positive" : "negative"}
            icon={Icon.ShoppingCart}
            color="green"
            subtitle={t('dashboard.orders_processed')}
          />
          <MetricCard
            title={t('dashboard.total_customers')}
            value={stats.activeCustomers.toLocaleString()}
            change={formatPercentage(stats.customersChange)}
            changeType={stats.customersChange >= 0 ? "positive" : "negative"}
            icon={Icon.Users}
            color="purple"
            subtitle={t('dashboard.unique_customers')}
          />
          <MetricCard
            title={t('dashboard.total_products')}
            value={stats.productsSold.toLocaleString()}
            change={formatPercentage(stats.productsChange)}
            changeType={stats.productsChange >= 0 ? "positive" : "negative"}
            icon={Icon.Package}
            color="orange"
            subtitle={t('dashboard.units_sold')}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('dashboard.average_order_value')}
            value={formatCurrency(stats.averageOrderValue || 0)}
            icon={Icon.Target}
            color="indigo"
            subtitle={t('dashboard.per_transaction')}
          />
          <MetricCard
            title={t('dashboard.conversion_rate')}
            value={`${(stats.conversionRate || 0).toFixed(1)}%`}
            icon={Icon.Zap}
            color="yellow"
            subtitle={t('dashboard.visitor_to_customer')}
          />
          <MetricCard
            title={t('dashboard.inventory_value')}
            value={formatCurrency(stats.inventoryValue || 0)}
            icon={Icon.Package}
            color="cyan"
            subtitle={t('dashboard.total_stock_value')}
          />
          <MetricCard
            title={t('dashboard.low_stock_items')}
            value={stats.lowStockItems || 0}
            icon={Icon.AlertTriangle}
            color="red"
            subtitle={t('dashboard.need_restocking')}
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                <span>Revenue</span>
              </div>
            </div>
            
            <div className="h-80">
              {chartData.length > 0 ? (
                <LineChart data={chartData} height={320} color="blue" showGrid={true} />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sales by Category</h3>
              <Icon.PieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            
            <div className="h-80">
              <PieChart data={mockSalesByCategory} height={320} />
            </div>
          </div>

          {/* Hourly Sales Performance */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Hourly Sales Performance</h3>
              <Icon.Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            
            <div className="h-80">
              <BarChart data={mockHourlySales} height={320} color="green" showValues={true} />
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order Status</h3>
              <Icon.BarChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            
            <div className="h-80">
              <BarChart data={mockOrderStatus} height={320} color="purple" showValues={true} />
            </div>
          </div>
        </div>

        {/* Bottom Grid - Business Insights */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Low Stock Alerts */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h4>
              <Icon.AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-3">
              {mockLowStockAlerts.length > 0 ? (
                mockLowStockAlerts.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {item.current}/{item.min}
                      </p>
                      <p className="text-xs text-gray-500">in stock</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">All items well stocked</p>
              )}
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h4>
              <Icon.Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.total_sold} units sold</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(product.total_revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No product data available</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h4>
              <Icon.Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        #{order.id} - {order.first_name && order.last_name 
                          ? `${order.first_name} ${order.last_name}` 
                          : order.customer_name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(() => {
                          try {
                            const date = order.order_date || order.created_at;
                            if (!date) return 'N/A';
                            return new Date(date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            });
                          } catch (error) {
                            return 'Invalid Date';
                          }
                        })()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.total_amount || order.calculated_total || 0)}
                      </p>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        order.status === "completed" && "bg-green-100 text-green-800",
                        order.status === "processing" && "bg-blue-100 text-blue-800",
                        order.status === "pending" && "bg-yellow-100 text-yellow-800",
                        order.status === "cancelled" && "bg-red-100 text-red-800"
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent orders found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
