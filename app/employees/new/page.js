"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
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
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Briefcase: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Alert: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successAlert, setSuccessAlert] = useState({ show: false, message: "" });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    daily_pay: "",
    role: "worker",
    status: "active"
  });

  // Calculate hourly rate based on daily pay
  const calculateHourlyRate = (dailyPay) => {
    if (!dailyPay || parseFloat(dailyPay) <= 0) return 0;
    const daily = parseFloat(dailyPay);
    const workHours = 9; // 8 AM to 5 PM = 9 hours
    return (daily / workHours).toFixed(2);
  };

  const hourlyRate = calculateHourlyRate(formData.daily_pay);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Client-side validation
    const validationErrors = [];
    
    if (!formData.first_name || formData.first_name.trim().length === 0) {
      validationErrors.push("First name is required");
    } else if (formData.first_name.trim().length > 50) {
      validationErrors.push("First name must be 50 characters or less");
    }
    
    if (!formData.last_name || formData.last_name.trim().length === 0) {
      validationErrors.push("Last name is required");
    } else if (formData.last_name.trim().length > 50) {
      validationErrors.push("Last name must be 50 characters or less");
    }
    
    if (!formData.phone || formData.phone.trim().length === 0) {
      validationErrors.push("Phone number is required");
    } else if (formData.phone.trim().length > 20) {
      validationErrors.push("Phone number must be 20 characters or less");
    }
    
    if (!formData.address || formData.address.trim().length === 0) {
      validationErrors.push("Address is required");
    } else if (formData.address.trim().length > 500) {
      validationErrors.push("Address must be 500 characters or less");
    }
    
    if (!formData.daily_pay || parseFloat(formData.daily_pay) <= 0) {
      validationErrors.push("Daily pay must be a positive number");
    }
    
    if (validationErrors.length > 0) {
      setError(`Please fix the following errors: ${validationErrors.join(', ')}`);
      setSaving(false);
      return;
    }
    
    try {
      const res = await fetch(api("/api/employees"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          ...formData,
          daily_pay: parseFloat(formData.daily_pay),
          hourly_rate: parseFloat(hourlyRate),
          hire_date: new Date().toISOString().split('T')[0]
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => `${err.path}: ${err.msg}`).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        throw new Error(errorData.message || "Failed to create employee");
      }

      setSuccessAlert({ show: true, message: "Employee created successfully!" });
      setTimeout(() => {
        setSuccessAlert({ show: false, message: "" });
        router.push("/employees");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to create employee");
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <Layout title="Add New Employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/employees")}
              className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 px-4 py-2.5 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Employees
            </button>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Icon.User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Add New Employee
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a new employee profile with all information
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information - All Fields */}
              <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Icon.User className="h-5 w-5 text-indigo-500" />
                  Employee Information
                </h2>
                
                <div className="space-y-6">
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                          maxLength={50}
                          className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                          maxLength={50}
                          className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          maxLength={20}
                          className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          maxLength={500}
                          rows="3"
                          className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
                          placeholder="Enter full address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work & Pay Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Work & Pay Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Daily Pay ($) *
                        </label>
                        <input
                          type="number"
                          name="daily_pay"
                          value={formData.daily_pay}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          required
                          className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          placeholder="Enter daily pay amount"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Role *
                        </label>
                        <div className="relative">
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white appearance-none"
                          >
                            <option value="worker">Worker</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Calculated Hourly Rate
                        </label>
                        <div className="w-full rounded-2xl border border-gray-200/60 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-white">
                          ${hourlyRate}/hour
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employee Summary */}
                  <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200/60 dark:border-indigo-500/20">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                      <Icon.Check className="h-5 w-5" />
                      Employee Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">Name:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {formData.first_name} {formData.last_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">Phone:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {formData.phone || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">Role:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300 capitalize">
                          {formData.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-indigo-700 dark:text-indigo-300 font-medium">Daily Pay:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          ${formData.daily_pay || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/employees")}
                  className="flex-1 rounded-xl bg-gray-700 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.first_name || !formData.last_name || !formData.phone || !formData.address || !formData.daily_pay}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Creating Employee...
                    </>
                  ) : (
                    <>
                      <Icon.Check className="h-4 w-4" />
                      Create Employee
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Work Schedule Info */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Icon.Briefcase className="h-5 w-5 text-indigo-500" />
                Work Schedule
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Start Time:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">8:00 AM</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-600 dark:text-gray-400">End Time:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">5:00 PM</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Work Hours:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">9 hours/day</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pay Day:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Every Saturday</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Payroll Features
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Daily time tracking with clock in/out
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatic hourly rate calculation
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Weekly salary calculation
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advance withdrawal tracking
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Saturday payroll processing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl max-w-md transition-all duration-300 bg-red-500 text-white">
            <div className="flex items-center gap-3">
              <Icon.Alert className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-white/80 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successAlert.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl max-w-md transition-all duration-300 bg-green-500 text-white">
            <div className="flex items-center gap-3">
              <Icon.Check className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{successAlert.message}</p>
              </div>
              <button
                onClick={() => setSuccessAlert({ show: false, message: "" })}
                className="text-white/80 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
