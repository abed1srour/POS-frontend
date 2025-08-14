"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";

/**
 * Categories management page for the POS app
 * - List all categories
 * - Add new categories
 * - Edit existing categories
 * - Delete categories
 * - Search and filter categories
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  RecycleBin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  ),
  Restore: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  Tag: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r="1" />
    </svg>
  ),
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2S8.357 4.237 7.534 7.5" />
      <path d="M2 3h20v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V3Z" />
      <path d="M7 14h.01" />
      <path d="M12 14h.01" />
      <path d="M17 14h.01" />
      <path d="M22 9v.01" />
    </svg>
  ),
  Download: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Minimal modal component
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-gray-200/60 bg-white/90 p-5 shadow-2xl dark:border-white/10 dark:bg-[#0F1115]/90">
        {children}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
  
  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [deletedCategoriesLoading, setDeletedCategoriesLoading] = useState(false);
  const [clearBinConfirm, setClearBinConfirm] = useState(false);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchCategories() {
    try {
      const res = await fetch(api("/api/categories?limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch (e) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function saveCategory(input, isEdit) {
    const method = isEdit ? "PUT" : "POST";
    const path = isEdit ? `/api/categories/${input.id}` : "/api/categories";
    const res = await fetch(api(path), {
      method,
      headers: authHeaders(),
      body: JSON.stringify(input),
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Save failed (${res.status})`);
  }

  async function deleteCategory(category) {
    const res = await fetch(api(`/api/categories/${category.id}`), { 
      method: "DELETE", 
      headers: authHeaders() 
    });
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  }

  // Export functions
  function exportToCSV() {
    const headers = ['ID', 'Name', 'Description', 'Created At', 'Updated At'];
    const csvData = categories.map(category => [
      category.id,
      category.name,
      category.description || '',
      category.created_at ? new Date(category.created_at).toLocaleDateString() : '',
      category.updated_at ? new Date(category.updated_at).toLocaleDateString() : ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Recycle bin functions
  async function fetchDeletedCategories() {
    setDeletedCategoriesLoading(true);
    try {
      const res = await fetch(api("/api/categories?includeDeleted=true&limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load deleted categories (${res.status})`);
      const data = await res.json();
      const deletedCategoriesData = (data.data || data || []).filter(category => category.deleted_at);
      setDeletedCategories(deletedCategoriesData);
    } catch (e) {
      console.error("Failed to load deleted categories:", e);
    } finally {
      setDeletedCategoriesLoading(false);
    }
  }

  async function restoreCategory(categoryId) {
    try {
      const res = await fetch(api(`/api/categories/${categoryId}/restore`), {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to restore category (${res.status})`);
      
      // Refresh both lists
      fetchDeletedCategories();
      fetchCategories();
    } catch (e) {
      console.error("Failed to restore category:", e);
    }
  }

  async function clearRecycleBin() {
    try {
      const res = await fetch(api("/api/categories/recycle-bin/clear"), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to clear recycle bin (${res.status})`);
      
      setClearBinConfirm(false);
      fetchDeletedCategories();
    } catch (e) {
      console.error("Failed to clear recycle bin:", e);
    }
  }

  // Form component for create/edit
  function CategoryForm({ initial, onCancel, onSaved }) {
    const [form, setForm] = useState({
      id: initial?.id,
      name: initial?.name || "",
      description: initial?.description || "",
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    async function onSubmit(e) {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        await saveCategory(form, Boolean(initial?.id));
        onSaved();
      } catch (e) {
        setError(e?.message || "Failed to save");
      } finally {
        setBusy(false);
      }
    }

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-base font-semibold">{initial?.id ? "Edit category" : "Add category"}</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Name</label>
            <input 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              required 
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Description</label>
            <textarea 
              value={form.description || ""} 
              onChange={(e) => setForm({...form, description: e.target.value})} 
              rows={3} 
              className="w-full resize-none rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white" 
            />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white">Cancel</button>
          <button disabled={busy} className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60">{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    );
  }

  if (loading) {
    return (
      <Layout title="Categories">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Categories">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage product categories</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-600"
            >
              <Icon.Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setRecycleBinOpen(true);
                fetchDeletedCategories();
              }}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <Icon.RecycleBin className="h-4 w-4" />
              Recycle Bin
            </button>
            <div className="relative w-80">
              <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            <Icon.Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {error ? (
            <div className="col-span-full p-6 text-center">
              <p className="text-rose-500">{error}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full p-6 text-center">
              <Icon.Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "No categories found matching your search" : "No categories found"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setCreating(true)}
                  className="mt-4 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                >
                  Create First Category
                </button>
              )}
            </div>
          ) : (
                         filteredCategories.map((category) => (
               <div key={category.id} className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Icon.Tag className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{category.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {category.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                      onClick={() => setEditing(category)} 
                      className="rounded-lg p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                      title="Edit category"
                    >
                      <Icon.Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setDeleting(category)} 
                      className="rounded-lg p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      title="Delete category"
                    >
                      <Icon.Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 truncate">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Created: {category.created_at ? new Date(category.created_at).toLocaleDateString() : "—"}</span>
                  <span>Updated: {category.updated_at ? new Date(category.updated_at).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={creating} onClose={() => setCreating(false)}>
        <CategoryForm
          onCancel={() => setCreating(false)}
          onSaved={async () => { 
            setCreating(false); 
            await fetchCategories(); 
          }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)}>
        {editing && (
          <CategoryForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSaved={async () => { 
              setEditing(null); 
              await fetchCategories(); 
            }}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Delete category</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-medium">{deleting?.name}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setDeleting(null)} 
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={async () => { 
                if (!deleting) return; 
                await deleteCategory(deleting); 
                setDeleting(null); 
                await fetchCategories(); 
              }} 
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Recycle Bin Modal */}
      <Modal open={recycleBinOpen} onClose={() => setRecycleBinOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Recycle Bin ({deletedCategories.length})</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (deletedCategories.length === 0) {
                    alert("Recycle bin is empty! There are no items to clear.");
                    return;
                  }
                  setClearBinConfirm(true);
                }}
                className="flex items-center gap-1 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
              >
                <Icon.Trash className="h-3 w-3" />
                Clear Bin
              </button>
              <button
                onClick={() => setRecycleBinOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {deletedCategoriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : deletedCategories.length === 0 ? (
              <div className="text-center py-8">
                <Icon.RecycleBin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No deleted categories found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Deleted: {category.deleted_at ? new Date(category.deleted_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => restoreCategory(category.id)}
                      className="flex items-center gap-1 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
                    >
                      <Icon.Restore className="h-3 w-3" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Clear Bin Confirmation Modal */}
      <Modal open={clearBinConfirm} onClose={() => setClearBinConfirm(false)}>
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Clear Recycle Bin</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This will permanently delete all {deletedCategories.length} categories in the recycle bin. 
            This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setClearBinConfirm(false)} 
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button 
              onClick={clearRecycleBin} 
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Clear Bin
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
