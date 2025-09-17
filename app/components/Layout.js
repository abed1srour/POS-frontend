"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "../lib/useTranslation";
import { api } from "../config/api";

// ---------------- Icons ----------------
const Icon = {
  Menu: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  Sun: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  Moon: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  ),
  Logout: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h12l-3-3m3 3-3 3" />
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
  Settings: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.3l.06.06c.48.48 1.17.62 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.38 1.25 1 1.51h.08c.65.29 1.34.15 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.48.48-.62 1.17-.33 1.82V9c.26.62.85 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.66 0-1.25.38-1.51 1z" />
    </svg>
  ),
  Bell: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Tag: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r="1" />
    </svg>
  ),
  Truck: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="7" cy="20" r="2" />
      <circle cx="20" cy="20" r="2" />
    </svg>
  ),
  Shield: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Package: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" />
      <path d="m15.194 13.707 3.306 3.307a1 1 0 0 1 0 1.414l-1.586 1.586a1 1 0 0 1-1.414 0l-3.307-3.306" />
      <path d="M10 14.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
    </svg>
  ),
  ShoppingCart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  FileText: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  ),
  User: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout({ children, title = "POS System" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [businessName, setBusinessName] = useState("POS");


  // Client-side only mount detection
  useEffect(() => {
    setMounted(true);
    
    // Set initial language and direction from localStorage
    const savedLang = localStorage.getItem('language') || 'en';
    if (savedLang === 'ar') {
      document.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.documentElement.setAttribute('data-lang', 'ar');
    } else {
      document.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.documentElement.setAttribute('data-lang', 'en');
    }
  }, []);

  // Persisted theme
  useEffect(() => {
    if (mounted) {
      const t = localStorage.getItem("theme") || "dark";
      setDark(t === "dark");
      
      // Apply initial theme to html element
      if (t === "dark") {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mounted]);
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", dark ? "dark" : "light");
      // Apply dark class to html element for Tailwind dark mode
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mounted, dark]);

  // Auth guard
  useEffect(() => {
    if (mounted) {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (!token) router.replace("/login");
    }
  }, [mounted, router]);

  // Scroll detection for navbar enhancement
  useEffect(() => {
    if (mounted) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [mounted]);

  // Listen for business name changes
  useEffect(() => {
    const handleBusinessNameChange = (event) => {
      setBusinessName(event.detail.businessName);
      // Also update localStorage
      localStorage.setItem('business_name', event.detail.businessName);
    };

    if (mounted) {
      window.addEventListener('businessNameChanged', handleBusinessNameChange);
      return () => {
        window.removeEventListener('businessNameChanged', handleBusinessNameChange);
      };
    }
  }, [mounted]);

  // Load business name from localStorage and API on mount
  useEffect(() => {
    const loadBusinessName = async () => {
      try {
        // First try to get from localStorage
        const storedName = localStorage.getItem('business_name');
        if (storedName) {
          setBusinessName(storedName);
        }

        // Then try to get from API
        const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
        if (!token) return;

        const res = await fetch(api("/api/company-settings"), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          const apiName = data.business_name || "POS";
          setBusinessName(apiName);
          // Update localStorage with API value
          localStorage.setItem('business_name', apiName);
        }
      } catch (error) {
        console.error("Failed to load business name:", error);
      }
    };

    if (mounted) {
      loadBusinessName();
    }
  }, [mounted]);





  function signOut() {
    if (mounted) {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    }
    router.replace("/login");
  }

  const navigation = [
    // Core Business Operations
    { href: "/dashboard", label: t('common.dashboard'), icon: Icon.Trend },
    { href: "/orders", label: t('common.orders'), icon: Icon.Dollar },
    { href: "/payments", label: t('common.payments'), icon: Icon.Dollar },
    
    // Inventory Management
    { href: "/products", label: t('common.products'), icon: Icon.Box },
    { href: "/inventory", label: t('common.inventory'), icon: Icon.Package },
    { href: "/categories", label: t('common.categories'), icon: Icon.Tag },
    { href: "/suppliers", label: t('common.suppliers'), icon: Icon.Truck },
    { href: "/purchase-orders", label: t('common.purchase_orders'), icon: Icon.ShoppingCart },
    
    // Customer & Employee Management
    { href: "/customers", label: t('common.customers'), icon: Icon.Users },
    { href: "/employees", label: t('common.employees'), icon: Icon.User },
    
    // Support & Reports
    { href: "/warranties", label: t('common.warranties'), icon: Icon.Shield },
    { href: "/reports", label: t('common.reports'), icon: Icon.Trend },
  ];

  const settingsItem = { href: "/settings", label: t('common.settings'), icon: Icon.Settings };

  // Grouped sections for sidebar
  const navSections = [
    {
      title: t('common.home'),
      items: [
        { href: "/dashboard", label: t('common.dashboard'), icon: Icon.Trend },
      ],
    },
    {
      title: t('common.inventory'),
      items: [
        { href: "/products", label: t('common.products'), icon: Icon.Box },
        { href: "/inventory", label: t('common.inventory'), icon: Icon.Package },
        { href: "/categories", label: t('common.categories'), icon: Icon.Tag },
        { href: "/suppliers", label: t('common.suppliers'), icon: Icon.Truck },
      ],
    },
    {
      title: t('navigation.sales'),
      items: [
        { href: "/orders", label: t('common.orders'), icon: Icon.Dollar },
        { href: "/payments", label: t('common.payments'), icon: Icon.Dollar },
        { href: "/company-payments", label: t('common.company_payments'), icon: Icon.Dollar },
        { href: "/purchase-orders", label: t('common.purchase_orders'), icon: Icon.ShoppingCart },
      ],
    },
    {
      title: t('common.people'),
      items: [
        { href: "/customers", label: t('common.customers'), icon: Icon.Users },
        { href: "/employees", label: t('common.employees'), icon: Icon.User },
      ],
    },
    {
      title: t('common.other'),
      items: [
        { href: "/warranties", label: t('common.warranties'), icon: Icon.Shield },
        { href: "/reports", label: t('common.reports'), icon: Icon.Trend },
      ],
    },
  ];

  const [openSections, setOpenSections] = useState({});
  // Load persisted open sections on mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem('sidebar_open_sections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setOpenSections(parsed);
        }
      }
    } catch {}
  }, [mounted]);

  // Persist open sections when they change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('sidebar_open_sections', JSON.stringify(openSections));
    } catch {}
  }, [mounted, openSections]);

  useEffect(() => {
    if (!mounted) return;
    // If no persisted state and no sections set yet, initialize based on current route
    const hasStored = typeof window !== 'undefined' && localStorage.getItem('sidebar_open_sections');
    if (!hasStored && Object.keys(openSections).length === 0) {
      const initial = {};
      navSections.forEach((section) => {
        initial[section.title] = section.items.some((i) => i.href === pathname);
      });
      setOpenSections(initial);
    }
  }, [mounted, pathname]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className={cn(dark ? "dark" : undefined)}>
      <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#0B0D10] dark:text-white">
        {/* Fixed Navbar */}
        <header className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
          isScrolled 
            ? "border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-lg dark:border-white/20 dark:bg-[#0F1115]/95" 
            : "border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#0F1115]/70"
        )}>
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            {/* Mobile menu */}
            <button 
              onClick={() => setSidebarOpen((v) => !v)} 
              className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-white/5 md:hidden"
            >
              <Icon.Menu className="h-5 w-5" />
            </button>

            {/* Brand */}
            <Link href="/dashboard" className="flex items-center gap-3 ml-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6 text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="hidden text-lg font-bold text-gray-900 dark:text-white sm:inline font-sans tracking-wide">{businessName}</span>
            </Link>

            {/* Actions - Enhanced */}
            <div className="ml-auto flex items-center gap-2 navbar-actions">
              {/* Notifications */}
              <button className="relative rounded-xl p-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5">
                <Icon.Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500"></span>
              </button>
              
              {/* Theme Toggle */}
              <button 
                onClick={() => setDark((v) => !v)} 
                className="rounded-xl px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
                title={dark ? t('common.switch_to_light_mode') : t('common.switch_to_dark_mode')}
              >
                {dark ? <Icon.Sun className="h-4 w-4" /> : <Icon.Moon className="h-4 w-4" />}
              </button>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    // Get current language from localStorage or default to 'en'
                    const currentLang = localStorage.getItem('language') || 'en';
                    const newLang = currentLang === 'ar' ? 'en' : 'ar';
                    
                    // Save language preference
                    localStorage.setItem('language', newLang);
                    
                    // Set document direction for RTL support
                    if (typeof document !== 'undefined') {
                      document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
                      document.documentElement.lang = newLang;
                      document.documentElement.setAttribute('data-lang', newLang);
                    }
                    
                    // Trigger a re-render by updating a state or just reload the page
                    window.location.reload();
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title={t('common.switch_language')}
                >
                  {(localStorage.getItem('language') || 'en') === 'ar' ? 'EN' : 'ع'}
                </button>
              </div>
              
              {/* Sign Out */}
              <button 
                onClick={signOut} 
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
                title={t('common.sign_out')}
              >
                <Icon.Logout className="h-4 w-4" />
                <span className="hidden sm:inline">{t('common.sign_out')}</span>
              </button>
              
              {/* User Avatar */}
              <div className="ml-1 h-8 w-8 rounded-xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-indigo-500" />
            </div>
          </div>
        </header>

        {/* Content with top padding for fixed navbar */}
        <div className="pt-16">
          {/* Shell */}
          <div className="mx-auto max-w-full px-1 sm:px-2 lg:px-4">
            {/* Fixed Sidebar */}
            <aside className={cn(
              "fixed left-2 top-20 z-40 h-[calc(100vh-6rem)] w-56 rounded-3xl border border-gray-200/60 bg-white/80 p-3 shadow-xl transition-all dark:border-white/10 dark:bg-white/5 sidebar",
              sidebarOpen ? "block" : "hidden md:block"
            )}>
              <nav className="flex flex-col h-full">
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {navSections.map((section) => {
                    const isOpen = openSections[section.title] ?? false;
                    const hasActive = section.items.some((i) => i.href === pathname);
                    return (
                      <div key={section.title} className="mb-1.5">
                        <button
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide",
                            hasActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400",
                            "hover:bg-gray-100 dark:hover:bg-white/5"
                          )}
                          onClick={() => {
                            setOpenSections((prev) => {
                              const next = { ...prev, [section.title]: !isOpen };
                              // Enforce max 3 open sections
                              const openKeys = Object.keys(next).filter((k) => next[k]);
                              if (openKeys.length > 3) {
                                // Close the oldest open section among the ones currently open (excluding the one just toggled if it became open)
                                const toClose = openKeys.find((k) => k !== section.title);
                                if (toClose) next[toClose] = false;
                              }
                              return next;
                            });
                          }}
                        >
                          <span>{section.title}</span>
                          <svg className={cn("h-3 w-3 transition-transform", isOpen ? "rotate-90" : "rotate-0")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7"/></svg>
                        </button>
                        {isOpen && (
                          <div className="mt-2 space-y-1.5">
                            {section.items.map((item) => {
                              const active = pathname === item.href;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={cn(
                                    "flex items-center gap-3 rounded-2xl px-2.5 py-1.5 text-sm transition-colors",
                                    active ? "bg-indigo-500 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                                  )}
                                >
                                  {item.icon && <item.icon className="h-4 w-4" />}
                                  {item.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Settings at bottom */}
                <div className="mt-auto pt-3">
                  {(() => {
                    const isActive = pathname === settingsItem.href;
                    return (
                      <Link
                        href={settingsItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-2.5 py-1.5 text-sm transition-colors",
                          isActive 
                            ? "bg-indigo-500 text-white shadow-sm" 
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                        )}
                      >
                        {settingsItem.icon && <settingsItem.icon className="h-4 w-4" />}
                        {settingsItem.label}
                      </Link>
                    );
                  })()}
                </div>
              </nav>
            </aside>

            {/* Main content with left margin for fixed sidebar */}
            <main className="md:ml-60 min-w-0">
              <div className="py-4">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
