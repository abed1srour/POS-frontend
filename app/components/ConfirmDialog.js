"use client";

import React, { useState, useEffect } from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  description = "Are you sure?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  requireText = false,
  keyword = "confirm",
  destructive = true,
  onConfirm,
  onClose,
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  if (!open) return null;

  const canConfirm = !requireText || text === keyword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-gray-200/60 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        {requireText && (
          <div className="mb-4">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Type "{keyword}" to continue</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Type '${keyword}' to confirm`}
              className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}


