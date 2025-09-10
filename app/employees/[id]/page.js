"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../components/Layout";

/**
 * Employee Details page showing employee info, time tracking, and actions
 * - Employee profile information
 * - Time tracking summary
 * - Recent time entries
 * - Quick actions
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Track: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      <path d="M12 2v20" />
      <path d="M2 7h20" />
      <path d="M2 17h20" />
    </svg>
  ),
  Badge: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  TrendingUp: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
  Activity: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function EmployeeViewPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;

  // State
  const [employee, setEmployee] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchEmployee() {
    try {
      const res = await fetch(api(`/api/employees/${employeeId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load employee (${res.status})`);
      const data = await res.json();
      setEmployee(data);
    } catch (e) {
      setError(e?.message || "Failed to load employee");
    }
  }

  async function fetchTimeEntries() {
    try {
      const res = await fetch(api(`/api/employees/${employeeId}/time-entries?limit=10`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load time entries (${res.status})`);
      const data = await res.json();
      setTimeEntries(data.data || data || []);
    } catch (e) {
      console.error("Failed to load time entries:", e);
    }
  }

  useEffect(() => {
    if (employeeId) {
      Promise.all([fetchEmployee(), fetchTimeEntries()]).finally(() => setLoading(false));
    }
  }, [employeeId]);

  if (loading) {
    return (
      <Layout title="Employee Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading employee details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !employee) {
    return (
      <Layout title="Employee Details">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Icon.User className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Employee Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "The employee you're looking for doesn't exist."}</p>
            <button
              onClick={() => router.push("/employees")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Employees
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      manager: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      worker: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return colors[role] || colors.worker;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return colors[status] || colors.active;
  };

  return (
    <Layout title={`${employee.first_name} ${employee.last_name} - Employee Details`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/employees")}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Employees
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Employee Details & Time Tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/employees/${employeeId}/time-tracking`)}
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-600"
            >
              <Icon.Track className="h-4 w-4" />
              Track Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Employee Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Icon.User className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {employee.first_name} {employee.last_name}
                      </h2>
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", getRoleBadge(employee.role))}>
                        {employee.role?.charAt(0).toUpperCase() + employee.role?.slice(1) || 'Worker'}
                      </span>
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(employee.status))}>
                        {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1) || 'Active'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Employee ID: {employee.id}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Icon.Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{employee.phone || "Not provided"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon.DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Daily Pay</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${employee.daily_pay || '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon.Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Hire Date</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon.Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Hourly Rate</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${employee.hourly_rate || '0.00'}/hr</p>
                    </div>
                  </div>
                </div>

                {employee.address && (
                  <div className="mt-4 flex items-start gap-3">
                    <Icon.MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{employee.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Time Entries */}
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-gray-200/60 bg-gray-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Time Entries</h3>
                  <button
                    onClick={() => router.push(`/employees/${employeeId}/time-tracking`)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {timeEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon.Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No time entries found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Start tracking time for this employee</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 bg-gray-50/30 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                            <Icon.Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.clock_in} - {entry.clock_out || "Active"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {entry.hours_worked || 0} hrs
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${entry.daily_pay || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-gray-200/60 bg-gray-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3">
                    <Icon.Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Hours</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {timeEntries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0).toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <Icon.DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Total Earned</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        ${timeEntries.reduce((sum, entry) => sum + (entry.daily_pay || 0), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center gap-3">
                    <Icon.TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">This Month</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {timeEntries.filter(entry => {
                          const entryDate = new Date(entry.date);
                          const now = new Date();
                          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                        }).length} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-gray-200/60 bg-gray-50/60 px-6 py-4 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => router.push(`/employees/${employeeId}/time-tracking`)}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Icon.Track className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Track Time</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Clock in/out and manage time</p>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push(`/employees/${employeeId}/time-tracking`)}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Icon.Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">View Reports</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time tracking reports and analytics</p>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push("/employees")}
                  className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Icon.Edit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Edit Employee</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update employee information</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
