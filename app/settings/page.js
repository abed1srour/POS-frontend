"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/navigation";

// Icons
const Icon = {
  Settings: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Building: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-7H4a2 2 0 0 0-2 2v17Z" />
      <path d="M16 18h6" />
      <path d="M13 6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h8" />
    </svg>
  ),
  Dollar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 1v22M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6" />
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Palette: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Database: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  Save: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polyline points="20,6 9,17 4,12" />
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

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("business");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [settings, setSettings] = useState({
    // Business Information
    business_name: "POS System",
    business_email: "",
    business_phone: "",
    business_address: "",
    business_city: "",
    business_country: "",
    business_logo: "",
    business_website: "",
    
    // Financial Settings
    currency: "USD",
    currency_symbol: "$",
    tax_rate: 0.1,
    tax_enabled: true,
    
    // Invoice & Receipt Settings
    invoice_prefix: "INV",
    invoice_start_number: 1000,
    receipt_footer: "Thank you for your business!",
    invoice_terms: "Payment due within 30 days",
    
    // System Settings
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    language: "en",
    theme: "light",
    
    // Security Settings
    session_timeout: 30,
    require_password_change: false,
    password_expiry_days: 90,
    two_factor_auth: false,
    login_attempts_limit: 5,
    
    // Notification Settings
    email_notifications: true,
    sms_notifications: false,
    low_stock_alerts: true,
    low_stock_threshold: 10,
    order_notifications: true,
    payment_notifications: true,
    
    // Backup & Maintenance
    auto_backup_enabled: true,
    backup_frequency: "daily",
  });

  // API helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
  const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

  // Helper function to handle null values for input fields
  const sanitizeValue = (value) => {
    return value === null || value === undefined ? "" : String(value);
  };

  // Helper function to handle numeric values
  const sanitizeNumericValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    return Number(value);
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch(api("/api/settings"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      
      if (data.success && data.data) {
        // Sanitize all fields to handle null values and NaN
        const sanitizedData = Object.keys(data.data).reduce((acc, key) => {
          const value = data.data[key];
          
          // Handle numeric fields
          if (['tax_rate', 'invoice_start_number', 'session_timeout', 'password_expiry_days', 
               'login_attempts_limit', 'low_stock_threshold'].includes(key)) {
            acc[key] = sanitizeNumericValue(value);
          }
          // Handle boolean fields
          else if (['tax_enabled', 'require_password_change', 'two_factor_auth', 
                   'email_notifications', 'sms_notifications', 'low_stock_alerts', 
                   'order_notifications', 'payment_notifications', 'auto_backup_enabled'].includes(key)) {
            acc[key] = value === null || value === undefined ? false : Boolean(value);
          }
          // Handle string fields
          else if (typeof value === 'string' || value === null || value === undefined) {
            acc[key] = sanitizeValue(value);
          }
          // Handle other fields as is
          else {
            acc[key] = value;
          }
          
          return acc;
        }, {});
        
        setSettings(prev => ({ ...prev, ...sanitizedData }));
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setShowSuccess(false);
    try {
      // Create a copy of settings without system-managed fields
      const settingsToUpdate = { ...settings };
      delete settingsToUpdate.last_backup_date; // Remove system-managed field
      
      const res = await fetch(api("/api/settings/1"), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(settingsToUpdate),
      });
      
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Save failed (${res.status})`);
      }
      
      const result = await res.json();
      console.log('✅ Settings saved successfully:', result);
      
      setSaved(true);
      setSaveMessage("Settings saved successfully!");
      setShowSuccess(true);
      setTimeout(() => {
        setSaved(false);
        setSaveMessage("");
        setShowSuccess(false);
      }, 5000);
      
      // Update the header business name
      if (typeof window !== "undefined") {
        localStorage.setItem('business_name', settings.business_name);
        window.dispatchEvent(new CustomEvent('businessNameChanged', { 
          detail: { businessName: settings.business_name } 
        }));
      }
      
    } catch (e) {
      console.error("Failed to save settings:", e);
      setError(`Failed to save settings: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "business", name: "Business", icon: Icon.Building, color: "from-blue-500 to-blue-600" },
    { id: "financial", name: "Financial", icon: Icon.Dollar, color: "from-green-500 to-green-600" },
    { id: "security", name: "Security", icon: Icon.Shield, color: "from-red-500 to-red-600" },
    { id: "notifications", name: "Notifications", icon: Icon.Bell, color: "from-purple-500 to-purple-600" },
    { id: "appearance", name: "Appearance", icon: Icon.Palette, color: "from-pink-500 to-pink-600" },
    { id: "system", name: "System", icon: Icon.Settings, color: "from-indigo-500 to-indigo-600" },
    { id: "backup", name: "Backup", icon: Icon.Database, color: "from-orange-500 to-orange-600" },
  ];

  if (loading) {
    return (
      <Layout title="Settings">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings">
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D10] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 flex items-center justify-center shadow-xl">
                <Icon.Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                System Settings
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Configure your POS system preferences and business information to match your needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white/95 dark:bg-[#0F1115]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 dark:border-white/10 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 px-2">Settings Categories</h3>
                <nav className="space-y-3">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/5'}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="font-semibold">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/95 dark:bg-[#0F1115]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60 dark:border-white/10 p-8">
                {/* Error Message */}
                {error && (
                  <div className="mb-8 p-6 rounded-xl bg-red-50/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                        <Icon.Alert className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-red-800 dark:text-red-200 font-bold text-lg">Error</h3>
                        <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {showSuccess && saveMessage && (
                  <div className="mb-8 p-6 rounded-xl bg-green-50/80 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                        <Icon.Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-green-800 dark:text-green-200 font-bold text-lg">Success!</h3>
                        <p className="text-green-700 dark:text-green-300 mt-1">{saveMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content */}
                {activeTab === "business" && <BusinessTab settings={settings} onSettingChange={handleSettingChange} />}
                {activeTab === "financial" && <FinancialTab settings={settings} onSettingChange={handleSettingChange} />}
                {activeTab === "security" && <SecurityTab settings={settings} onSettingChange={handleSettingChange} />}
                {activeTab === "notifications" && <NotificationsTab settings={settings} onSettingChange={handleSettingChange} />}
                {activeTab === "appearance" && <AppearanceTab settings={settings} onSettingChange={handleSettingChange} />}
                {activeTab === "system" && <SystemTab settings={settings} onSettingChange={handleSettingChange} />}
                {activeTab === "backup" && <BackupTab settings={settings} onSettingChange={handleSettingChange} />}

                {/* Save Status and Button */}
                <div className="pt-8 border-t border-gray-200/60 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Make sure to save your changes before leaving this page
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 text-white font-bold rounded-xl hover:from-indigo-600 hover:via-sky-600 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Icon.Save className="w-5 h-5" />
                          Save All Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Tab Components
function BusinessTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business Name *
            </label>
            <input
              type="text"
              value={settings.business_name || ""}
              onChange={(e) => onSettingChange("business_name", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="Enter your business name"
            />
          </div>

                                 <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business Logo
            </label>
            <div className="flex items-center gap-4">
              {settings.business_logo && (
                <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden">
                  <img 
                    src={settings.business_logo} 
                    alt="Business Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        onSettingChange("business_logo", e.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-12 pr-6 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
                  placeholder="Choose logo file..."
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Upload your business logo (PNG, JPG, SVG recommended)</p>
          </div>

                    <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business Email
            </label>
            <input
              type="email"
              value={settings.business_email || ""}
              onChange={(e) => onSettingChange("business_email", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="business@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business Phone
            </label>
            <input
              type="tel"
              value={settings.business_phone || ""}
              onChange={(e) => onSettingChange("business_phone", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Website
            </label>
            <input
              type="url"
              value={settings.business_website || ""}
              onChange={(e) => onSettingChange("business_website", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="https://www.yourbusiness.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business Address
            </label>
            <textarea
              value={settings.business_address || ""}
              onChange={(e) => onSettingChange("business_address", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200 resize-none"
              placeholder="Enter your complete business address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business City
            </label>
            <input
              type="text"
              value={settings.business_city || ""}
              onChange={(e) => onSettingChange("business_city", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="Enter your business city"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Business Country
            </label>
            <input
              type="text"
              value={settings.business_country || ""}
              onChange={(e) => onSettingChange("business_country", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="Enter your business country"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-10">
      {/* Currency & Tax Settings */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Financial Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => onSettingChange("currency", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Currency Symbol
            </label>
            <input
              type="text"
              value={settings.currency_symbol}
              onChange={(e) => onSettingChange("currency_symbol", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="$"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Tax Rate (%)
            </label>
                          <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={isNaN(settings.tax_rate) ? 0 : settings.tax_rate * 100}
                onChange={(e) => onSettingChange("tax_rate", parseFloat(e.target.value) / 100)}
                className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
                placeholder="8.5"
              />
          </div>

          <div className="flex items-center justify-between p-8 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 border border-gray-200/50 dark:border-white/10 shadow-lg">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Enable Tax</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Apply tax to all transactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.tax_enabled}
                onChange={(e) => onSettingChange("tax_enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Invoice & Receipt Settings */}
      <div className="pt-8 border-t border-gray-200/60 dark:border-white/10">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Invoice & Receipt Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Invoice Prefix
            </label>
            <input
              type="text"
              value={settings.invoice_prefix}
              onChange={(e) => onSettingChange("invoice_prefix", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              placeholder="INV"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Invoice Start Number
            </label>
                          <input
                type="number"
                value={isNaN(settings.invoice_start_number) ? 1000 : settings.invoice_start_number}
                onChange={(e) => onSettingChange("invoice_start_number", parseInt(e.target.value))}
                className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
                placeholder="1000"
              />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Receipt Footer
            </label>
            <textarea
              value={settings.receipt_footer}
              onChange={(e) => onSettingChange("receipt_footer", e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200 resize-none"
              placeholder="Thank you for your business!"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Invoice Terms
            </label>
            <textarea
              value={settings.invoice_terms}
              onChange={(e) => onSettingChange("invoice_terms", e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200 resize-none"
              placeholder="Payment due within 30 days"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Session Timeout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically log out after inactivity</p>
            </div>
                          <select
                value={isNaN(settings.session_timeout) ? 30 : settings.session_timeout}
                onChange={(e) => onSettingChange("session_timeout", parseInt(e.target.value))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={240}>4 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Require Password Change</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Force users to change passwords periodically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_password_change}
                onChange={(e) => onSettingChange("require_password_change", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Password Expiry Days</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days before password expires</p>
            </div>
                          <input
                type="number"
                value={isNaN(settings.password_expiry_days) ? 90 : settings.password_expiry_days}
                onChange={(e) => onSettingChange("password_expiry_days", parseInt(e.target.value))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white w-24"
              />
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.two_factor_auth}
                onChange={(e) => onSettingChange("two_factor_auth", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Login Attempts Limit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maximum failed login attempts before lockout</p>
            </div>
                          <input
                type="number"
                min="1"
                max="10"
                value={isNaN(settings.login_attempts_limit) ? 5 : settings.login_attempts_limit}
                onChange={(e) => onSettingChange("login_attempts_limit", parseInt(e.target.value))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white w-24"
              />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => onSettingChange("email_notifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">SMS Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sms_notifications}
                onChange={(e) => onSettingChange("sms_notifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when products are running low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.low_stock_alerts}
                onChange={(e) => onSettingChange("low_stock_alerts", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Low Stock Threshold</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Minimum quantity before alert</p>
            </div>
                          <input
                type="number"
                min="0"
                value={isNaN(settings.low_stock_threshold) ? 10 : settings.low_stock_threshold}
                onChange={(e) => onSettingChange("low_stock_threshold", parseInt(e.target.value))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white w-24"
              />
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Order Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when new orders are placed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.order_notifications}
                onChange={(e) => onSettingChange("order_notifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Payment Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when payments are received</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payment_notifications}
                onChange={(e) => onSettingChange("payment_notifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Appearance Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => onSettingChange("theme", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => onSettingChange("language", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.date_format}
              onChange={(e) => onSettingChange("date_format", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Format
            </label>
            <select
              value={settings.time_format}
              onChange={(e) => onSettingChange("time_format", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => onSettingChange("timezone", e.target.value)}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupTab({ settings, onSettingChange }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Backup & Maintenance</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Auto Backup</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically backup your data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_backup_enabled}
                onChange={(e) => onSettingChange("auto_backup_enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Backup Frequency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">How often to create backups</p>
            </div>
            <select
              value={settings.backup_frequency}
              onChange={(e) => onSettingChange("backup_frequency", e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="p-6 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Manual Backup</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Create a backup of your database right now
            </p>
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Create Backup Now
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-green-50/80 dark:bg-green-500/10 border border-green-200/50 dark:border-green-500/20">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Restore Database</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Restore your database from a previous backup
            </p>
            <button className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
              Restore Backup
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-red-50/80 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Clear Database</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Warning: This will permanently delete all data
            </p>
            <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
