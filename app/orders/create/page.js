"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "../../components/Layout";

/**
 * Order Creation page for the POS app
 * - Select customer (or use pre-selected from URL)
 * - Add products with quantities and discounts (USD or %)
 * - Calculate totals
 * - Create order
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

// ---------------- Icons ----------------
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M5 12h14" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  ),
  Filter: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  ),
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedCustomerId = searchParams.get("customer_id");

  // State
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAmount, setDeliveryAmount] = useState(0);

  // Fetch helpers
  function authHeaders() {
    const token = (typeof window !== "undefined" && (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function fetchCustomers() {
    try {
      const res = await fetch(api("/api/customers?limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load customers (${res.status})`);
      const data = await res.json();
      setCustomers(data.data || data || []);
    } catch (e) {
      setError(e?.message || "Failed to load customers");
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch(api("/api/products?limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      setProducts(data.data || data || []);
    } catch (e) {
      setError(e?.message || "Failed to load products");
    }
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
      console.error("Failed to load categories:", e);
    }
  }

  // Initialize data
  useEffect(() => {
    Promise.all([fetchCustomers(), fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

  // Set pre-selected customer if provided in URL
  useEffect(() => {
    if (preSelectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id == preSelectedCustomerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [preSelectedCustomerId, customers]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to order
  function addProductToOrder(product) {
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Update quantity if product already exists
      updateItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      // Add new product with discount fields
      const newItem = {
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        quantity: 1,
        discount_amount: 0,
        discount_type: "usd", // "usd" or "percent"
        stock: product.quantity_in_stock || 0,
        category_name: categories.find(c => c.id == product.category_id)?.name || "Unknown"
      };
      setOrderItems([...orderItems, newItem]);
    }
  }

  // Update item quantity
  function updateItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      removeItemFromOrder(productId);
      return;
    }

    const item = orderItems.find(item => item.product_id === productId);
    if (item && newQuantity > item.stock) {
      setError(`Cannot add more than available stock (${item.stock})`);
      return;
    }

    setOrderItems(orderItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
    setError(null);
  }

  // Update item discount
  function updateItemDiscount(productId, newDiscount, type) {
    const discount = Math.max(0, parseFloat(newDiscount) || 0);
    const item = orderItems.find(item => item.product_id === productId);
    
    if (item) {
      let finalDiscount = discount;
      
      // Validate discount based on type
      if (type === "percent") {
        finalDiscount = Math.min(discount, 100); // Max 100%
      } else {
        const maxDiscount = item.price * item.quantity;
        finalDiscount = Math.min(discount, maxDiscount);
      }
      
      setOrderItems(orderItems.map(item =>
        item.product_id === productId
          ? { ...item, discount_amount: finalDiscount, discount_type: type }
          : item
      ));
    }
  }

  // Remove item from order
  function removeItemFromOrder(productId) {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  }

  // Calculate item total with discount
  function calculateItemTotal(item) {
    const subtotal = item.price * item.quantity;
    let discount = 0;
    
    if (item.discount_type === "percent") {
      discount = subtotal * (item.discount_amount / 100);
    } else {
      discount = item.discount_amount;
    }
    
    return subtotal - discount;
  }

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = orderItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    if (item.discount_type === "percent") {
      return sum + (itemTotal * (item.discount_amount / 100));
    } else {
      return sum + item.discount_amount;
    }
  }, 0);
  const tax = 0; // Tax set to 0
  const deliveryCost = deliveryEnabled ? deliveryAmount : 0;
  const total = subtotal - totalDiscount + tax + deliveryCost;

  async function createOrder() {
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }

    if (orderItems.length === 0) {
      setError("Please add at least one product to the order");
      return;
    }

    setSaving(true);
    setError(null);

    try {
             const orderData = {
         customer_id: selectedCustomer.id,
         total: total,
         status: "pending",
         items: orderItems.map(item => ({
           product_id: item.product_id,
           quantity: item.quantity,
           price: parseFloat(item.price) || 0, // This will be mapped to unit_price in backend
           discount: parseFloat(item.discount_amount) || 0,
           discount_type: item.discount_type
         })),
         delivery_enabled: deliveryEnabled,
         delivery_amount: parseFloat(deliveryAmount) || 0,
         tax: tax,
         subtotal: subtotal,
         total_discount: totalDiscount,
         payment_status: "pending",
         payment_method: "cash",
         notes: ""
       };

      const res = await fetch(api("/api/orders"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(orderData),
      });

      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create order (${res.status})`);
      }

      const data = await res.json();
      
      // Redirect to the new order details page
      router.push(`/orders/${data.data?.id || data.id}`);
    } catch (e) {
      setError(e?.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout title="Create Order">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Order">
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
              Create New Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Add products and create an order</p>
          </div>
        </div>

        {/* Customer Information and Order Summary - Merged */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-2xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm">
          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Customer Information */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Icon.User className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Customer Information</h2>
                </div>
                <div className="space-y-6">
                  <select
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => {
                      const customer = customers.find(c => c.id == e.target.value);
                      setSelectedCustomer(customer);
                    }}
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {customer.first_name} {customer.last_name} - {customer.phone_number || "No phone"}
                      </option>
                    ))}
                  </select>
                  
                  {selectedCustomer && (
                    <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Icon.User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xl text-gray-900 dark:text-white">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedCustomer.phone_number || "No phone number"}</p>
                        {selectedCustomer.address && (
                          <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedCustomer.address}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Icon.DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
                    <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Total Discount</span>
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">-${totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Tax</span>
                    <span className="font-bold text-lg">${tax.toFixed(2)}</span>
                  </div>
                  {deliveryEnabled && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/10">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Delivery</span>
                      <span className="font-bold text-lg">${deliveryAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-bold text-2xl text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                    <input
                      type="checkbox"
                      id="delivery"
                      checked={deliveryEnabled}
                      onChange={(e) => setDeliveryEnabled(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5"
                    />
                    <label htmlFor="delivery" className="text-base font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Delivery Required
                    </label>
                  </div>
                  {deliveryEnabled && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">Delivery Fee:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deliveryAmount}
                        onChange={(e) => setDeliveryAmount(parseFloat(e.target.value) || 0)}
                        className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                      <span className="text-base font-medium text-gray-600 dark:text-gray-400">USD</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-base text-rose-400">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Order Button - Full Width */}
        <div className="flex justify-center">
          <button
            onClick={createOrder}
            disabled={saving || !selectedCustomer || orderItems.length === 0}
            className="w-full max-w-md rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-lg font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating Order...
              </div>
            ) : (
              "Create Order"
            )}
          </button>
        </div>

        {/* Products and Order Items Table */}
        <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-2xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Icon.Package className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Products & Order Items</h2>
              </div>
              <div className="text-base text-gray-500 dark:text-gray-400 font-medium">
                {orderItems.length} items in order
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              <div className="relative flex-1">
                <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name, SKU, or barcode..."
                  className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-4 pl-12 pr-6 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-2xl border border-gray-200/60 bg-white/70 px-6 py-4 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-white/10">
              <table className="w-full text-base">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Product</th>
                    <th className="px-6 py-4 text-left font-bold">Category</th>
                    <th className="px-6 py-4 text-left font-bold">Price</th>
                    <th className="px-6 py-4 text-left font-bold">Stock</th>
                    <th className="px-6 py-4 text-left font-bold">Quantity</th>
                    <th className="px-6 py-4 text-left font-bold">Discount</th>
                    <th className="px-6 py-4 text-left font-bold">Total</th>
                    <th className="px-6 py-4 text-left font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                  {filteredProducts.map((product) => {
                    const orderItem = orderItems.find(item => item.product_id === product.id);
                    const categoryName = categories.find(c => c.id == product.category_id)?.name || "Unknown";
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              SKU: {product.sku || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                          {categoryName}
                        </td>
                        <td className="px-6 py-4 font-bold text-lg">
                          ${(parseFloat(product.price) || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${product.quantity_in_stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                            {product.quantity_in_stock || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {orderItem ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateItemQuantity(product.id, orderItem.quantity - 1)}
                                className="rounded-xl p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                              >
                                <Icon.Minus className="h-4 w-4" />
                              </button>
                              <span className="font-bold text-lg min-w-[3rem] text-center">{orderItem.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(product.id, orderItem.quantity + 1)}
                                disabled={orderItem.quantity >= product.quantity_in_stock}
                                className="rounded-xl p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition-all duration-200"
                              >
                                <Icon.Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addProductToOrder(product)}
                              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-bold text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                            >
                              Add
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {orderItem ? (
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={orderItem.discount_amount}
                                onChange={(e) => updateItemDiscount(product.id, e.target.value, orderItem.discount_type)}
                                className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-center font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <select
                                value={orderItem.discount_type}
                                onChange={(e) => updateItemDiscount(product.id, orderItem.discount_amount, e.target.value)}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white text-gray-900 dark:text-white"
                              >
                                <option value="usd" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">USD</option>
                                <option value="percent" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">%</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-medium">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {orderItem ? (
                            <div>
                              <div className="text-lg text-gray-900 dark:text-white">
                                ${calculateItemTotal(orderItem).toFixed(2)}
                              </div>
                              {orderItem.discount_amount > 0 && (
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  -${(orderItem.price * orderItem.quantity - calculateItemTotal(orderItem)).toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 font-medium">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {orderItem && (
                            <button
                              onClick={() => removeItemFromOrder(product.id)}
                              className="rounded-xl p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                              title="Remove item"
                            >
                              <Icon.Trash className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Icon.Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {searchTerm || selectedCategory ? "No products found matching your search" : "No products available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
