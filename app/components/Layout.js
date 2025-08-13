"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

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
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
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
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout({ children, title = "POS System" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Persisted theme
  useEffect(() => {
    const t = (typeof window !== "undefined" && localStorage.getItem("theme")) || "dark";
    setDark(t === "dark");
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", dark ? "dark" : "light");
    }
  }, [dark]);

  // Auth guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token) router.replace("/login");
  }, [router]);

  // Scroll detection for navbar enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  function signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    }
    router.replace("/login");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, redirect to products page with search query
      // You can enhance this to search across multiple pages
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: Icon.Trend },
    { href: "/products", label: "Products", icon: Icon.Box },
    { href: "/orders", label: "Orders", icon: Icon.Dollar },
    { href: "/customers", label: "Customers", icon: Icon.Users },
    { href: "/categories", label: "Categories", icon: Icon.Tag },
    { href: "/reports", label: "Reports", icon: Icon.Trend },
    { href: "/settings", label: "Settings", icon: Icon.Settings },
  ];

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
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400" />
              <span className="hidden text-sm font-semibold sm:inline">POS</span>
            </Link>

            {/* Search - Enhanced */}
            <div className="ml-2 hidden flex-1 items-center sm:flex">
              <form onSubmit={handleSearch} className="relative w-full max-w-md">
                <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, products, customers..."
                  className="w-full rounded-xl border border-gray-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5"
                />
              </form>
            </div>

            {/* Actions - Enhanced */}
            <div className="ml-auto flex items-center gap-2">
              {/* Notifications */}
              <button className="relative rounded-xl p-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5">
                <Icon.Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500"></span>
              </button>
              
              {/* Theme Toggle */}
              <button 
                onClick={() => setDark((v) => !v)} 
                className="rounded-xl px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Icon.Sun className="h-4 w-4" /> : <Icon.Moon className="h-4 w-4" />}
              </button>
              
              {/* Sign Out */}
              <button 
                onClick={signOut} 
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5"
                title="Sign out"
              >
                <Icon.Logout className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
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
              "fixed left-2 top-20 z-40 h-[calc(100vh-6rem)] w-56 rounded-3xl border border-gray-200/60 bg-white/80 p-3 shadow-xl transition-all dark:border-white/10 dark:bg-white/5",
              sidebarOpen ? "block" : "hidden md:block"
            )}>
              <nav className="space-y-1 h-full overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors",
                        isActive 
                          ? "bg-indigo-500 text-white shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                })}
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
