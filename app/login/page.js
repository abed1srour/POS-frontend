"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Matches the Dashboard look-and-feel (dark/light persisted in localStorage).
 * - Centered single card using the same glass/border/shadow tokens
 * - Top-right theme toggle identical behavior to dashboard
 * - Username + password (show/hide), error state, loading state
 * - On success stores token & user then routes to /dashboard
 *
 * By default it calls your Next proxy: POST /api/auth/login
 * (If you want to hit the backend directly, swap to process.env.NEXT_PUBLIC_API_URL)
 */

// ---------------- Icons (inline, minimal) ----------------
const Icon = {
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
  User: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
    </svg>
  ),
  Lock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Eye: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.86 21.86 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-4.87 5.65M1 1l22 22" />
    </svg>
  ),
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);

  // Prevent hydration mismatch + persist theme like dashboard
  useEffect(() => {
    setMounted(true);
    const t = (typeof window !== "undefined" && localStorage.getItem("theme")) || "dark";
    setDark(t === "dark");
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", dark ? "dark" : "light");
    }
  }, [dark]);

  async function onSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || `Login failed (${res.status})`);

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0D10]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : undefined}>
      <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#0B0D10] dark:text-white">
        {/* Theme Toggle */}
        <button
          onClick={() => setDark((v) => !v)}
          className="fixed right-6 top-6 rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-white/5"
          aria-label="Toggle theme"
        >
          {dark ? <Icon.Sun className="h-5 w-5" /> : <Icon.Moon className="h-5 w-5" />}
        </button>

        {/* Centered Card */}
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Brand */}
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400" />
              <h1 className="text-xl font-semibold">POS System</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to continue</p>
            </div>

            <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <label htmlFor="username" className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Username</label>
                  <div className="relative">
                    <Icon.User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <Icon.Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Icon.EyeOff className="h-4 w-4" /> : <Icon.Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>

                {/* Optional helper row */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span />
                  <a href="#" className="hover:underline">Forgot password?</a>
                </div>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">© {new Date().getFullYear()} POS System</p>
          </div>
        </main>
      </div>
    </div>
  );
}
