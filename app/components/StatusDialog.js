"use client";

import React from "react";

const Variant = {
  success: {
    ring: "ring-green-500/20",
    border: "border-green-500/20",
    bgBadge: "bg-green-500",
    iconColor: "text-green-500",
    title: "text-green-700 dark:text-green-400",
  },
  error: {
    ring: "ring-rose-500/20",
    border: "border-rose-500/20",
    bgBadge: "bg-rose-500",
    iconColor: "text-rose-500",
    title: "text-rose-700 dark:text-rose-400",
  },
  warning: {
    ring: "ring-amber-500/20",
    border: "border-amber-500/20",
    bgBadge: "bg-amber-500",
    iconColor: "text-amber-500",
    title: "text-amber-700 dark:text-amber-400",
  },
  info: {
    ring: "ring-blue-500/20",
    border: "border-blue-500/20",
    bgBadge: "bg-blue-500",
    iconColor: "text-blue-500",
    title: "text-blue-700 dark:text-blue-400",
  },
};

function Icon({ variant = "success", className = "h-7 w-7" }) {
  const color = Variant[variant]?.iconColor || Variant.success.iconColor;
  if (variant === "success") {
    return (
      <svg className={`${className} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg className={`${className} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-2.5L13.73 4c-.77-.83-1.96-.83-2.73 0L3.34 16.5C2.56 17.33 3.53 19 5.07 19z" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg className={`${className} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    );
  }
  return (
    <svg className={`${className} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
    </svg>
  );
}

export default function StatusDialog({
  open,
  variant = "success",
  title = "Success!",
  message = "",
  primaryLabel = "OK",
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}) {
  if (!open) return null;
  const v = Variant[variant] || Variant.success;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md rounded-3xl border bg-white/90 p-6 shadow-2xl dark:bg-[#0F1115]/90 ${v.border} ${v.ring}`}>
        <div className="text-center">
          <div className={`h-16 w-16 rounded-full ${v.bgBadge}/10 flex items-center justify-center mx-auto mb-4`}>
            <Icon variant={variant} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${v.title}`}>{title}</h3>
          {message && (
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">{message}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            {secondaryLabel && (
              <button
                onClick={onSecondary}
                className="rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {secondaryLabel}
              </button>
            )}
            <button
              onClick={onPrimary || onClose}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900"
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
