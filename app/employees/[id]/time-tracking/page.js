"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// Icons
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
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
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
};

export default function EmployeeTimeTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;
  
  const [employee, setEmployee] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successAlert, setSuccessAlert] = useState({ show: false, message: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({ clock_in: false, clock_out: false });
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [timePickerState, setTimePickerState] = useState({
    clock_in: { hour: '09', minute: '00', period: 'AM' },
    clock_out: { hour: '05', minute: '00', period: 'PM' }
  });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clock_in: "",
    clock_out: ""
  });
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

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
      setEmployee(data.data);
    } catch (e) {
      setError(e?.message || "Failed to load employee");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTimeEntries() {
    try {
      const res = await fetch(api(`/api/employees/${employeeId}/time-entries`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTimeEntries(data.data || []);
      }
    } catch (e) {
      console.error("Error fetching time entries:", e);
    }
  }

  async function fetchWithdrawals() {
    try {
      const res = await fetch(api(`/api/employees/${employeeId}/withdrawals`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.data || []);
      }
    } catch (e) {
      console.error("Error fetching withdrawals:", e);
    }
  }

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
      fetchTimeEntries();
      fetchWithdrawals();
    }
  }, [employeeId]);

  // Close time picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showTimePicker.clock_in || showTimePicker.clock_out) {
        const timePickerElements = document.querySelectorAll('[data-time-picker]');
        let clickedInside = false;
        
        timePickerElements.forEach(element => {
          if (element.contains(event.target)) {
            clickedInside = true;
          }
        });
        
        if (!clickedInside) {
          setShowTimePicker({ clock_in: false, clock_out: false });
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimePicker]);

  async function handleAddTimeEntry(e) {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate that at least clock_in is provided
      if (!formData.clock_in) {
        throw new Error("Clock in time is required");
      }

      // Validate time format (HH:MM)
      const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeFormatRegex.test(formData.clock_in)) {
        throw new Error("Invalid clock in time format. Use HH:MM format (e.g., 09:30)");
      }
      
      if (formData.clock_out && !timeFormatRegex.test(formData.clock_out)) {
        throw new Error("Invalid clock out time format. Use HH:MM format (e.g., 17:30)");
      }

      console.log("Submitting time entry:", formData); // Debug log

      const res = await fetch(api(`/api/employees/${employeeId}/time-entries`), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          ...formData,
          employee_id: parseInt(employeeId)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData); // Debug log
        throw new Error(errorData.message || "Failed to add time entry");
      }

      await fetchTimeEntries();
      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        clock_in: "",
        clock_out: ""
      });
      showToast("Time entry added successfully", "success");
    } catch (error) {
      console.error("Error adding time entry:", error); // Debug log
      showToast(error.message || "Failed to add time entry", "error");
    } finally {
      setSaving(false);
    }
  }

  // Edit time entry
  async function handleEditTimeEntry(e) {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate that at least clock_in is provided
      if (!formData.clock_in) {
        throw new Error("Clock in time is required");
      }

      // Validate time format (HH:MM)
      const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeFormatRegex.test(formData.clock_in)) {
        throw new Error("Invalid clock in time format. Use HH:MM format (e.g., 09:30)");
      }
      
      if (formData.clock_out && !timeFormatRegex.test(formData.clock_out)) {
        throw new Error("Invalid clock out time format. Use HH:MM format (e.g., 17:30)");
      }

      const res = await fetch(api(`/api/employees/${employeeId}/time-entries/${editingEntry.id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          ...formData,
          employee_id: parseInt(employeeId)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update time entry");
      }

      await fetchTimeEntries();
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        clock_in: "",
        clock_out: ""
      });
      showToast("Time entry updated successfully", "success");
    } catch (error) {
      showToast(error.message || "Failed to update time entry", "error");
    } finally {
      setSaving(false);
    }
  }

  // Delete time entry
  async function handleDeleteTimeEntry() {
    setSaving(true);
    
    try {
      const res = await fetch(api(`/api/employees/${employeeId}/time-entries/${deletingEntry.id}`), {
        method: "DELETE",
        headers: authHeaders()
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete time entry");
      }

      await fetchTimeEntries();
      setDeletingEntry(null);
      showToast("Time entry deleted successfully", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete time entry", "error");
    } finally {
      setSaving(false);
    }
  }

  // Start editing an entry
  function startEditEntry(entry) {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      clock_in: entry.clock_in || "",
      clock_out: entry.clock_out || ""
    });
  }

  async function handleAddWithdrawal(e) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(api(`/api/employees/${employeeId}/withdrawals`), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          ...withdrawalData,
          employee_id: parseInt(employeeId),
          amount: parseFloat(withdrawalData.amount)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add withdrawal");
      }

      await fetchWithdrawals();
      setShowWithdrawalModal(false);
      setWithdrawalData({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        notes: ""
      });
      showToast("Withdrawal added successfully", "success");
    } catch (error) {
      showToast(error.message || "Failed to add withdrawal", "error");
    } finally {
      setSaving(false);
    }
  }

  function showToast(message, type = "success") {
    setSuccessAlert({ show: true, message, type });
    setTimeout(() => setSuccessAlert({ show: false, message: "", type: "success" }), 5000);
  }

  // Helper function to get current time in HH:MM format
  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Set current time for clock in
  function setCurrentTimeForClockIn() {
    setFormData(prev => ({
      ...prev,
      clock_in: getCurrentTime()
    }));
  }

  // Set current time for clock out
  function setCurrentTimeForClockOut() {
    setFormData(prev => ({
      ...prev,
      clock_out: getCurrentTime()
    }));
  }

  // Toggle time picker for clock in
  function toggleTimePickerForClockIn() {
    setShowTimePicker(prev => ({
      ...prev,
      clock_in: !prev.clock_in,
      clock_out: false
    }));
    
    // Initialize with current time if opening
    if (!showTimePicker.clock_in) {
      const now = new Date();
      const hour = now.getHours() % 12 || 12;
      const minute = Math.floor(now.getMinutes() / 15) * 15;
      const period = now.getHours() >= 12 ? 'PM' : 'AM';
      
      setTimePickerState(prev => ({
        ...prev,
        clock_in: { 
          hour: hour.toString().padStart(2, '0'),
          minute: minute.toString().padStart(2, '0'),
          period
        }
      }));
    }
  }

  // Toggle time picker for clock out
  function toggleTimePickerForClockOut() {
    setShowTimePicker(prev => ({
      ...prev,
      clock_out: !prev.clock_out,
      clock_in: false
    }));
    
    // Initialize with current time if opening
    if (!showTimePicker.clock_out) {
      const now = new Date();
      const hour = now.getHours() % 12 || 12;
      const minute = Math.floor(now.getMinutes() / 15) * 15;
      const period = now.getHours() >= 12 ? 'PM' : 'AM';
      
      setTimePickerState(prev => ({
        ...prev,
        clock_out: { 
          hour: hour.toString().padStart(2, '0'),
          minute: minute.toString().padStart(2, '0'),
          period
        }
      }));
    }
  }

  // Select time from picker
  function selectTime(field, time) {
    setFormData(prev => ({
      ...prev,
      [field]: time
    }));
    setShowTimePicker(prev => ({
      ...prev,
      [field]: false
    }));
  }

  // Generate hour options (1-12)
  function generateHourOptions() {
    const hours = [];
    for (let hour = 1; hour <= 12; hour++) {
      hours.push(hour.toString().padStart(2, '0'));
    }
    return hours;
  }

  // Generate minute options (0, 15, 30, 45)
  function generateMinuteOptions() {
    return ['00', '15', '30', '45'];
  }

  // Select time from picker
  function selectTime(field, hour, minute, period) {
    // Convert 12-hour format to 24-hour format
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    // Ensure hour is between 0-23
    hour24 = hour24 % 24;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    
    console.log(`Converting ${hour}:${minute} ${period} to ${timeString}`); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [field]: timeString
    }));
    setShowTimePicker(prev => ({
      ...prev,
      [field]: false
    }));
  }

  // Add clock out to existing time entry
  async function addClockOutToEntry(entryId) {
    setSaving(true);
    
    try {
      const currentTime = getCurrentTime();
      
      const res = await fetch(api(`/api/employees/${employeeId}/time-entries/${entryId}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          clock_out: currentTime
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update time entry");
      }

      await fetchTimeEntries();
      showToast("Clock out time added successfully", "success");
    } catch (error) {
      showToast(error.message || "Failed to add clock out time", "error");
    } finally {
      setSaving(false);
    }
  }

  // Check if there are active time entries (without clock out)
  function hasActiveEntries() {
    return timeEntries.some(entry => !entry.clock_out);
  }

  // Get the most recent active entry
  function getMostRecentActiveEntry() {
    return timeEntries
      .filter(entry => !entry.clock_out)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }

  // Quick clock out for most recent active entry
  async function quickClockOut() {
    const activeEntry = getMostRecentActiveEntry();
    if (activeEntry) {
      await addClockOutToEntry(activeEntry.id);
    }
  }

  // Calculate work hours
  function calculateWorkHours(clockIn, clockOut) {
    if (!clockIn || !clockOut) {
      return 0;
    }
    
    const [inHour, inMin] = clockIn.split(':').map(Number);
    const [outHour, outMin] = clockOut.split(':').map(Number);
    
    let hours = outHour - inHour;
    let minutes = outMin - inMin;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    return hours + (minutes / 60);
  }

  // Calculate daily pay
  function calculateDailyPay(hours, hourlyRate) {
    return (hours * hourlyRate).toFixed(2);
  }

  // Calculate weekly totals
  function calculateWeeklyTotals() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    const totalHours = weekEntries.reduce((sum, entry) => {
      return sum + calculateWorkHours(entry.clock_in, entry.clock_out);
    }, 0);

    const totalPay = (totalHours * (employee?.hourly_rate || 0)).toFixed(2);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const netPay = (parseFloat(totalPay) - totalWithdrawals).toFixed(2);

    return {
      totalHours: totalHours.toFixed(2),
      totalPay,
      totalWithdrawals: totalWithdrawals.toFixed(2),
      netPay
    };
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  }

  if (loading) {
    return (
      <Layout title="Employee Time Tracking">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading employee data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !employee) {
    return (
      <Layout title="Employee Time Tracking">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-4">
              {error || "Employee not found"}
            </p>
            <button
              onClick={() => router.push("/employees")}
              className="rounded-2xl bg-indigo-500 px-6 py-3 text-white font-medium hover:bg-indigo-600 transition-colors"
            >
              Back to Employees
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const weeklyTotals = calculateWeeklyTotals();

  return (
    <Layout title={`Time Tracking - ${employee.first_name} ${employee.last_name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/employees/${employeeId}`)}
              className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 px-4 py-2.5 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
              Back to Employee
            </button>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Icon.Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Time Tracking
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {employee.first_name} {employee.last_name} • ${employee.hourly_rate}/hour
                  {hasActiveEntries() && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      Active Entry
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
                     <div className="flex gap-3">
             {hasActiveEntries() && (
               <button
                 onClick={quickClockOut}
                 disabled={saving}
                 className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-green-500/10 dark:hover:border-green-500/20 dark:hover:text-green-400"
               >
                 <Icon.Clock className="h-4 w-4" />
                 {saving ? "Adding..." : "Quick Clock Out"}
               </button>
             )}
             <button
               onClick={() => setShowWithdrawalModal(true)}
               className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-orange-500/10 dark:hover:border-orange-500/20 dark:hover:text-orange-400"
             >
               <Icon.DollarSign className="h-4 w-4" />
               Add Withdrawal
             </button>
             <button
               onClick={() => setShowAddModal(true)}
               className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-indigo-500/10 dark:hover:border-indigo-500/20 dark:hover:text-indigo-400"
             >
               <Icon.Plus className="h-4 w-4" />
               Add Time Entry
             </button>
           </div>
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon.Clock className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyTotals.totalHours}h</p>
          </div>
          
          <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon.DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Pay</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${weeklyTotals.totalPay}</p>
          </div>
          
          <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon.DollarSign className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Withdrawals</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${weeklyTotals.totalWithdrawals}</p>
          </div>
          
          <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon.DollarSign className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Pay</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${weeklyTotals.netPay}</p>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Icon.Clock className="h-5 w-5 text-indigo-500" />
            Time Entries
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/60 dark:border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Clock In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Clock Out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Hours</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Daily Pay</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                {timeEntries.length > 0 ? (
                  timeEntries.map((entry) => {
                    const hours = calculateWorkHours(entry.clock_in, entry.clock_out);
                    const dailyPay = calculateDailyPay(hours, employee.hourly_rate);
                    
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(entry.date)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 dark:text-white">{entry.clock_in}</p>
                        </td>
                        <td className="px-4 py-3">
                          {entry.clock_out ? (
                            <p className="text-sm text-gray-900 dark:text-white">{entry.clock_out}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                                                             <button
                                 onClick={() => addClockOutToEntry(entry.id)}
                                 disabled={saving}
                                 className="text-xs border border-gray-200 bg-white/70 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-blue-500/10 dark:hover:border-blue-500/20 dark:hover:text-blue-400"
                                 title="Add current time as clock out"
                               >
                                 {saving ? "Adding..." : "Add Clock Out"}
                               </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.clock_out ? (
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{hours.toFixed(2)}h</p>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {entry.clock_out ? (
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">${dailyPay}</p>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">—</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditEntry(entry)}
                              className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg p-2 transition-all duration-200"
                              title="Edit Entry"
                            >
                              <Icon.Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg p-2 transition-all duration-200"
                              title="Delete Entry"
                            >
                              <Icon.Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="text-center">
                        <Icon.Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                          No time entries found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          Add the first time entry to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Time Entry Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Time Entry
              </h3>
              
              <form onSubmit={handleAddTimeEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                
                <div className="space-y-4">
                                                           <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clock In *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={toggleTimePickerForClockIn}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                            title="Select time"
                          >
                            <Icon.Clock className="h-4 w-4" />
                          </button>
                          <input
                            type="text"
                            name="clock_in"
                            value={formData.clock_in}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Only allow numbers and colon
                              value = value.replace(/[^0-9:]/g, '');
                              // Ensure only one colon
                              const colons = value.split(':').length - 1;
                              if (colons > 1) {
                                value = value.replace(/:/g, (match, index) => index === value.indexOf(':') ? ':' : '');
                              }
                              // Limit to 5 characters (HH:MM)
                              if (value.length <= 5) {
                                setFormData({...formData, clock_in: value});
                              }
                            }}
                            placeholder="HH:MM (e.g., 09:30)"
                            required
                            className="w-full rounded-2xl border border-gray-200/60 bg-white/70 pl-10 pr-24 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={setCurrentTimeForClockIn}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs border border-gray-200 bg-white/70 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-green-500/10 dark:hover:border-green-500/20 dark:hover:text-green-400"
                          >
                            Current Time
                          </button>
                          
                          {/* Time Picker Dropdown for Clock In */}
                          {showTimePicker.clock_in && (
                            <div data-time-picker className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
                              <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Icon.Clock className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Clock In Time</span>
                                  </div>
                                  <button
                                    onClick={() => setShowTimePicker(prev => ({ ...prev, clock_in: false }))}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Large Time Display */}
                                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-xl p-4 mb-4 border border-green-200/50 dark:border-green-500/30">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                      {timePickerState.clock_in.hour}:{timePickerState.clock_in.minute}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      {timePickerState.clock_in.period}
                                    </div>
                                  </div>
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  {/* Hours */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Hour</div>
                                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                      {generateHourOptions().map((hour) => (
                                        <button
                                          key={hour}
                                          type="button"
                                          onClick={() => setTimePickerState(prev => ({
                                            ...prev,
                                            clock_in: { ...prev.clock_in, hour }
                                          }))}
                                          className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                            timePickerState.clock_in.hour === hour 
                                              ? 'bg-green-500 text-white shadow-md' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10'
                                          }`}
                                        >
                                          {hour}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Minutes */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Minute</div>
                                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                      {generateMinuteOptions().map((minute) => (
                                        <button
                                          key={minute}
                                          type="button"
                                          onClick={() => setTimePickerState(prev => ({
                                            ...prev,
                                            clock_in: { ...prev.clock_in, minute }
                                          }))}
                                          className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                            timePickerState.clock_in.minute === minute 
                                              ? 'bg-green-500 text-white shadow-md' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10'
                                          }`}
                                        >
                                          {minute}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* AM/PM */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Period</div>
                                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                      {['AM', 'PM'].map((period) => (
                                        <button
                                          key={period}
                                          type="button"
                                          onClick={() => setTimePickerState(prev => ({
                                            ...prev,
                                            clock_in: { ...prev.clock_in, period }
                                          }))}
                                          className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                            timePickerState.clock_in.period === period 
                                              ? 'bg-green-500 text-white shadow-md' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10'
                                          }`}
                                        >
                                          {period}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Time Buttons */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const now = new Date();
                                      const hour = now.getHours() % 12 || 12;
                                      const minute = Math.floor(now.getMinutes() / 15) * 15;
                                      const period = now.getHours() >= 12 ? 'PM' : 'AM';
                                      setTimePickerState(prev => ({
                                        ...prev,
                                        clock_in: { 
                                          hour: hour.toString().padStart(2, '0'),
                                          minute: minute.toString().padStart(2, '0'),
                                          period
                                        }
                                      }));
                                    }}
                                    className="px-3 py-2 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-200/50 dark:border-blue-500/30"
                                  >
                                    Current Time
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTimePickerState(prev => ({
                                      ...prev,
                                      clock_in: { hour: '09', minute: '00', period: 'AM' }
                                    }))}
                                    className="px-3 py-2 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-200/50 dark:border-orange-500/30"
                                  >
                                    Default (9:00 AM)
                                  </button>
                                </div>
                                
                                {/* Action Button */}
                                <button
                                  type="button"
                                  onClick={() => selectTime('clock_in', timePickerState.clock_in.hour, timePickerState.clock_in.minute, timePickerState.clock_in.period)}
                                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  Set Clock In Time
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                  
                                                           <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clock Out (Optional)
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={toggleTimePickerForClockOut}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title="Select time"
                          >
                            <Icon.Clock className="h-4 w-4" />
                          </button>
                          <input
                            type="text"
                            name="clock_out"
                            value={formData.clock_out}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Only allow numbers and colon
                              value = value.replace(/[^0-9:]/g, '');
                              // Ensure only one colon
                              const colons = value.split(':').length - 1;
                              if (colons > 1) {
                                value = value.replace(/:/g, (match, index) => index === value.indexOf(':') ? ':' : '');
                              }
                              // Limit to 5 characters (HH:MM)
                              if (value.length <= 5) {
                                setFormData({...formData, clock_out: value});
                              }
                            }}
                            placeholder="HH:MM (e.g., 17:30)"
                            className="w-full rounded-2xl border border-gray-200/60 bg-white/70 pl-10 pr-24 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={setCurrentTimeForClockOut}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs border border-gray-200 bg-white/70 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-blue-500/10 dark:hover:border-blue-500/20 dark:hover:text-blue-400"
                          >
                            Current Time
                          </button>
                          
                          {/* Time Picker Dropdown for Clock Out */}
                          {showTimePicker.clock_out && (
                            <div data-time-picker className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
                              <div className="p-4">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Icon.Clock className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Clock Out Time</span>
                                  </div>
                                  <button
                                    onClick={() => setShowTimePicker(prev => ({ ...prev, clock_out: false }))}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Large Time Display */}
                                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-xl p-4 mb-4 border border-blue-200/50 dark:border-blue-500/30">
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                      {timePickerState.clock_out.hour}:{timePickerState.clock_out.minute}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      {timePickerState.clock_out.period}
                                    </div>
                                  </div>
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  {/* Hours */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Hour</div>
                                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                      {generateHourOptions().map((hour) => (
                                        <button
                                          key={hour}
                                          type="button"
                                          onClick={() => setTimePickerState(prev => ({
                                            ...prev,
                                            clock_out: { ...prev.clock_out, hour }
                                          }))}
                                          className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                            timePickerState.clock_out.hour === hour 
                                              ? 'bg-blue-500 text-white shadow-md' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                          }`}
                                        >
                                          {hour}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Minutes */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Minute</div>
                                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                      {generateMinuteOptions().map((minute) => (
                                        <button
                                          key={minute}
                                          type="button"
                                          onClick={() => setTimePickerState(prev => ({
                                            ...prev,
                                            clock_out: { ...prev.clock_out, minute }
                                          }))}
                                          className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                            timePickerState.clock_out.minute === minute 
                                              ? 'bg-blue-500 text-white shadow-md' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                          }`}
                                        >
                                          {minute}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* AM/PM */}
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Period</div>
                                    <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                      {['AM', 'PM'].map((period) => (
                                        <button
                                          key={period}
                                          type="button"
                                          onClick={() => setTimePickerState(prev => ({
                                            ...prev,
                                            clock_out: { ...prev.clock_out, period }
                                          }))}
                                          className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                            timePickerState.clock_out.period === period 
                                              ? 'bg-blue-500 text-white shadow-md' 
                                              : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                          }`}
                                        >
                                          {period}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Time Buttons */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const now = new Date();
                                      const hour = now.getHours() % 12 || 12;
                                      const minute = Math.floor(now.getMinutes() / 15) * 15;
                                      const period = now.getHours() >= 12 ? 'PM' : 'AM';
                                      setTimePickerState(prev => ({
                                        ...prev,
                                        clock_out: { 
                                          hour: hour.toString().padStart(2, '0'),
                                          minute: minute.toString().padStart(2, '0'),
                                          period
                                        }
                                      }));
                                    }}
                                    className="px-3 py-2 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-200/50 dark:border-blue-500/30"
                                  >
                                    Current Time
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTimePickerState(prev => ({
                                      ...prev,
                                      clock_out: { hour: '05', minute: '00', period: 'PM' }
                                    }))}
                                    className="px-3 py-2 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-200/50 dark:border-orange-500/30"
                                  >
                                    Default (5:00 PM)
                                  </button>
                                </div>
                                
                                {/* Action Button */}
                                <button
                                  type="button"
                                  onClick={() => selectTime('clock_out', timePickerState.clock_out.hour, timePickerState.clock_out.minute, timePickerState.clock_out.period)}
                                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  Set Clock Out Time
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Leave empty if employee is still working
                        </p>
                      </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Adding..." : "Add Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Time Entry Modal */}
        {editingEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Edit Time Entry
              </h3>
              
              <form onSubmit={handleEditTimeEntry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clock In *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={toggleTimePickerForClockIn}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                        title="Select time"
                      >
                        <Icon.Clock className="h-4 w-4" />
                      </button>
                      <input
                        type="text"
                        name="clock_in"
                        value={formData.clock_in}
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/[^0-9:]/g, '');
                          const colons = value.split(':').length - 1;
                          if (colons > 1) {
                            value = value.replace(/:/g, (match, index) => index === value.indexOf(':') ? ':' : '');
                          }
                          if (value.length <= 5) {
                            setFormData({...formData, clock_in: value});
                          }
                        }}
                        placeholder="HH:MM (e.g., 09:30)"
                        required
                        className="w-full rounded-2xl border border-gray-200/60 bg-white/70 pl-10 pr-24 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={setCurrentTimeForClockIn}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs border border-gray-200 bg-white/70 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-green-500/10 dark:hover:border-green-500/20 dark:hover:text-green-400"
                      >
                        Current Time
                      </button>
                      
                      {/* Time Picker Dropdown for Clock In */}
                      {showTimePicker.clock_in && (
                        <div data-time-picker className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
                          <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Icon.Clock className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Clock In Time</span>
                              </div>
                              <button
                                onClick={() => setShowTimePicker(prev => ({ ...prev, clock_in: false }))}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Large Time Display */}
                            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-xl p-4 mb-4 border border-green-200/50 dark:border-green-500/30">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                  {timePickerState.clock_in.hour}:{timePickerState.clock_in.minute}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  {timePickerState.clock_in.period}
                                </div>
                              </div>
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {/* Hours */}
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Hour</div>
                                <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                  {generateHourOptions().map((hour) => (
                                    <button
                                      key={hour}
                                      type="button"
                                      onClick={() => setTimePickerState(prev => ({
                                        ...prev,
                                        clock_in: { ...prev.clock_in, hour }
                                      }))}
                                      className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                        timePickerState.clock_in.hour === hour 
                                          ? 'bg-green-500 text-white shadow-md' 
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10'
                                      }`}
                                    >
                                      {hour}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Minutes */}
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Minute</div>
                                <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                  {generateMinuteOptions().map((minute) => (
                                    <button
                                      key={minute}
                                      type="button"
                                      onClick={() => setTimePickerState(prev => ({
                                        ...prev,
                                        clock_in: { ...prev.clock_in, minute }
                                      }))}
                                      className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                        timePickerState.clock_in.minute === minute 
                                          ? 'bg-green-500 text-white shadow-md' 
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10'
                                      }`}
                                    >
                                      {minute}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* AM/PM */}
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Period</div>
                                <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                  {['AM', 'PM'].map((period) => (
                                    <button
                                      key={period}
                                      type="button"
                                      onClick={() => setTimePickerState(prev => ({
                                        ...prev,
                                        clock_in: { ...prev.clock_in, period }
                                      }))}
                                      className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                        timePickerState.clock_in.period === period 
                                          ? 'bg-green-500 text-white shadow-md' 
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-500/10'
                                      }`}
                                    >
                                      {period}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Quick Time Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const now = new Date();
                                  const hour = now.getHours() % 12 || 12;
                                  const minute = Math.floor(now.getMinutes() / 15) * 15;
                                  const period = now.getHours() >= 12 ? 'PM' : 'AM';
                                  setTimePickerState(prev => ({
                                    ...prev,
                                    clock_in: { 
                                      hour: hour.toString().padStart(2, '0'),
                                      minute: minute.toString().padStart(2, '0'),
                                      period
                                    }
                                  }));
                                }}
                                className="px-3 py-2 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-200/50 dark:border-blue-500/30"
                              >
                                Current Time
                              </button>
                              <button
                                type="button"
                                onClick={() => setTimePickerState(prev => ({
                                  ...prev,
                                  clock_in: { hour: '09', minute: '00', period: 'AM' }
                                }))}
                                className="px-3 py-2 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-200/50 dark:border-orange-500/30"
                              >
                                Default (9:00 AM)
                              </button>
                            </div>
                            
                            {/* Action Button */}
                            <button
                              type="button"
                              onClick={() => selectTime('clock_in', timePickerState.clock_in.hour, timePickerState.clock_in.minute, timePickerState.clock_in.period)}
                              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              Set Clock In Time
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clock Out (Optional)
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={toggleTimePickerForClockOut}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Select time"
                      >
                        <Icon.Clock className="h-4 w-4" />
                      </button>
                      <input
                        type="text"
                        name="clock_out"
                        value={formData.clock_out}
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/[^0-9:]/g, '');
                          const colons = value.split(':').length - 1;
                          if (colons > 1) {
                            value = value.replace(/:/g, (match, index) => index === value.indexOf(':') ? ':' : '');
                          }
                          if (value.length <= 5) {
                            setFormData({...formData, clock_out: value});
                          }
                        }}
                        placeholder="HH:MM (e.g., 17:30)"
                        className="w-full rounded-2xl border border-gray-200/60 bg-white/70 pl-10 pr-24 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={setCurrentTimeForClockOut}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs border border-gray-200 bg-white/70 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-blue-500/10 dark:hover:border-blue-500/20 dark:hover:text-blue-400"
                      >
                        Current Time
                      </button>
                      
                      {/* Time Picker Dropdown for Clock Out */}
                      {showTimePicker.clock_out && (
                        <div data-time-picker className="absolute top-full left-0 right-0 mt-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl shadow-2xl z-50 backdrop-blur-sm">
                          <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Icon.Clock className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Clock Out Time</span>
                              </div>
                              <button
                                onClick={() => setShowTimePicker(prev => ({ ...prev, clock_out: false }))}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Large Time Display */}
                            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-xl p-4 mb-4 border border-blue-200/50 dark:border-blue-500/30">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                                  {timePickerState.clock_out.hour}:{timePickerState.clock_out.minute}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  {timePickerState.clock_out.period}
                                </div>
                              </div>
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {/* Hours */}
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Hour</div>
                                <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                  {generateHourOptions().map((hour) => (
                                    <button
                                      key={hour}
                                      type="button"
                                      onClick={() => setTimePickerState(prev => ({
                                        ...prev,
                                        clock_out: { ...prev.clock_out, hour }
                                      }))}
                                      className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                        timePickerState.clock_out.hour === hour 
                                          ? 'bg-blue-500 text-white shadow-md' 
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                      }`}
                                    >
                                      {hour}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Minutes */}
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Minute</div>
                                <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                  {generateMinuteOptions().map((minute) => (
                                    <button
                                      key={minute}
                                      type="button"
                                      onClick={() => setTimePickerState(prev => ({
                                        ...prev,
                                        clock_out: { ...prev.clock_out, minute }
                                      }))}
                                      className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                        timePickerState.clock_out.minute === minute 
                                          ? 'bg-blue-500 text-white shadow-md' 
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                      }`}
                                    >
                                      {minute}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* AM/PM */}
                              <div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Period</div>
                                <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-2 max-h-32 overflow-y-auto border border-gray-200/60 dark:border-gray-600/60">
                                  {['AM', 'PM'].map((period) => (
                                    <button
                                      key={period}
                                      type="button"
                                      onClick={() => setTimePickerState(prev => ({
                                        ...prev,
                                        clock_out: { ...prev.clock_out, period }
                                      }))}
                                      className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                        timePickerState.clock_out.period === period 
                                          ? 'bg-blue-500 text-white shadow-md' 
                                          : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                      }`}
                                    >
                                      {period}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Quick Time Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const now = new Date();
                                  const hour = now.getHours() % 12 || 12;
                                  const minute = Math.floor(now.getMinutes() / 15) * 15;
                                  const period = now.getHours() >= 12 ? 'PM' : 'AM';
                                  setTimePickerState(prev => ({
                                    ...prev,
                                    clock_out: { 
                                      hour: hour.toString().padStart(2, '0'),
                                      minute: minute.toString().padStart(2, '0'),
                                      period
                                    }
                                  }));
                                }}
                                className="px-3 py-2 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-200/50 dark:border-blue-500/30"
                              >
                                Current Time
                              </button>
                              <button
                                type="button"
                                onClick={() => setTimePickerState(prev => ({
                                  ...prev,
                                  clock_out: { hour: '05', minute: '00', period: 'PM' }
                                }))}
                                className="px-3 py-2 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors border border-orange-200/50 dark:border-orange-500/30"
                              >
                                Default (5:00 PM)
                              </button>
                            </div>
                            
                            {/* Action Button */}
                            <button
                              type="button"
                              onClick={() => selectTime('clock_out', timePickerState.clock_out.hour, timePickerState.clock_out.minute, timePickerState.clock_out.period)}
                              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              Set Clock Out Time
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty if employee is still working
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(null)}
                    className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Updating..." : "Update Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <Icon.Trash className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Time Entry
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete the time entry for <strong>{formatDate(deletingEntry.date)}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeletingEntry(null)}
                    className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTimeEntry}
                    disabled={saving}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Deleting..." : "Delete Entry"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Withdrawal Modal */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Withdrawal
              </h3>
              
              <form onSubmit={handleAddWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData({...withdrawalData, amount: e.target.value})}
                    step="0.01"
                    min="0"
                    required
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Enter withdrawal amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={withdrawalData.date}
                    onChange={(e) => setWithdrawalData({...withdrawalData, date: e.target.value})}
                    required
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={withdrawalData.notes}
                    onChange={(e) => setWithdrawalData({...withdrawalData, notes: e.target.value})}
                    rows="3"
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
                    placeholder="Add notes about this withdrawal"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="flex-1 rounded-xl bg-gray-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Adding..." : "Add Withdrawal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successAlert.show && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl max-w-md transition-all duration-300 bg-green-500 text-white">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">{successAlert.message}</p>
              </div>
              <button
                onClick={() => setSuccessAlert({ show: false, message: "", type: "success" })}
                className="flex-shrink-0 text-white/80 hover:text-white"
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
