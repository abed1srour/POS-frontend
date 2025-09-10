"use client";

import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { useRouter, useParams } from "next/navigation";

/**
 * Product Edit Page
 * - Edit existing product details
 * - Update pricing, stock, and category
 * - Form validation and error handling
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  ArrowLeft: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  Save: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
  Package: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.3 7L12 12l8.7-5" />
    </svg>
  ),
  AlertCircle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  CheckCircle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    category_id: "",
    price: "",
    cost_price: "",
    quantity_in_stock: "",
    reorder_level: "",
    image_url: "",
    supplier_id: "",
    status: "active"
  });

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Fetch product data
  async function fetchProduct() {
    try {
      const res = await fetch(api(`/api/products/${productId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to fetch product (${res.status})`);
      
      const data = await res.json();
      const productData = data.data || data;
      
             setProduct({
         name: productData.name || "",
         sku: productData.sku || "",
         barcode: productData.barcode || "",
         description: productData.description || "",
         category_id: productData.category_id || "",
         price: productData.price || "",
         cost_price: productData.cost_price || "",
         quantity_in_stock: productData.quantity_in_stock || "",
         reorder_level: productData.reorder_level || "",
         image_url: productData.image_url || "",
         supplier_id: productData.supplier_id || "",
         status: productData.status || "active"
       });
    } catch (err) {
      setError(err?.message || "Failed to load product");
    }
  }

  // Fetch categories
  async function fetchCategories() {
    try {
      const res = await fetch(api("/api/categories"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to fetch categories (${res.status})`);
      
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchProduct(), fetchCategories()]);
      setLoading(false);
    }
    loadData();
  }, [productId]);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validation
      if (!product.name.trim()) {
        throw new Error("Product name is required");
      }
      if (!product.sku.trim()) {
        throw new Error("SKU is required");
      }
      if (!product.category_id) {
        throw new Error("Category is required");
      }
      if (!product.price || parseFloat(product.price) <= 0) {
        throw new Error("Valid price is required");
      }

             const updateData = {
         name: product.name.trim(),
         sku: product.sku.trim(),
         barcode: product.barcode.trim(),
         description: product.description.trim(),
         category_id: product.category_id,
         price: parseFloat(product.price),
         cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
         quantity_in_stock: product.quantity_in_stock ? parseInt(product.quantity_in_stock) : 0,
         reorder_level: product.reorder_level ? parseInt(product.reorder_level) : 0,
         image_url: product.image_url.trim(),
         supplier_id: product.supplier_id || null,
         status: product.status
       };

      const res = await fetch(api(`/api/products/${productId}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(updateData),
      });

      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || errorData?.message || `Failed to update product (${res.status})`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/products");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  // Handle input changes
  function handleInputChange(field, value) {
    setProduct(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <Layout title="Edit Product">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !product.name) {
    return (
      <Layout title="Product Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Icon.AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-2">Product not found</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
            <button 
              onClick={() => router.push("/products")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Product - ${product.name}`}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="rounded-2xl border border-gray-200/60 p-3 hover:bg-gray-50/80 dark:border-white/10 dark:hover:bg-white/10 transition-all duration-200"
          >
            <Icon.ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Edit Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Update product information and settings</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-center gap-3">
              <Icon.CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-green-600 dark:text-green-400 font-medium">Product updated successfully!</p>
                <p className="text-green-500 dark:text-green-300 text-sm">Redirecting to products page...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-center gap-3">
              <Icon.AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon.Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Product Information</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={product.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  value={product.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={product.category_id}
                  onChange={(e) => handleInputChange("category_id", e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={product.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
                placeholder="Enter product description"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selling Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.cost_price}
                  onChange={(e) => handleInputChange("cost_price", e.target.value)}
                  className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              </div>
            </div>

                         {/* Inventory */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Quantity in Stock
                 </label>
                 <input
                   type="number"
                   min="0"
                   value={product.quantity_in_stock}
                   onChange={(e) => handleInputChange("quantity_in_stock", e.target.value)}
                   className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                   placeholder="0"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Reorder Level
                 </label>
                 <input
                   type="number"
                   min="0"
                   value={product.reorder_level}
                   onChange={(e) => handleInputChange("reorder_level", e.target.value)}
                   className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                   placeholder="0"
                 />
               </div>
             </div>

             {/* Image URL */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Image URL
               </label>
               <input
                 type="url"
                 value={product.image_url}
                 onChange={(e) => handleInputChange("image_url", e.target.value)}
                 className="w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                 placeholder="https://example.com/image.jpg"
               />
             </div>

             {/* Status */}
             <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
               <select
                 value={product.status}
                 onChange={(e) => handleInputChange("status", e.target.value)}
                 className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
               >
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
               </select>
               <label className="text-sm font-medium text-gray-900 dark:text-white">
                 Product Status
               </label>
             </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200/60 dark:border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon.Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-gray-200/60 bg-white/70 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-white/10 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
