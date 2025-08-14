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
  ShoppingCart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
  Truck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 3h1a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h15" />
      <path d="M9 6h6l4 6v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <circle cx="9" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
    </svg>
  ),
  Globe: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
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
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAmount, setDeliveryAmount] = useState(0);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

  // Auto-clear items when customer is removed
  useEffect(() => {
    if (!selectedCustomer && orderItems.length > 0) {
      setOrderItems([]);
    }
  }, [selectedCustomer, orderItems.length]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const phone = customer.phone_number?.toLowerCase() || "";
    const searchLower = customerSearchTerm.toLowerCase();
    return fullName.includes(searchLower) || phone.includes(searchLower);
  });

  // Add product to order
  function addProductToOrder(product) {
    if (!selectedCustomer) {
      setAlertMessage("You should select a customer first!");
      setShowCustomAlert(true);
      return;
    }

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
        category_name: categories.find(c => c.id == product.category_id)?.name || "No Category"
      };
      setOrderItems([...orderItems, newItem]);
    }
    setError(null);
  }

  // Clear all selected items
  function clearAllItems() {
    setOrderItems([]);
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
      setAlertMessage("You should select a customer first!");
      setShowCustomAlert(true);
      return;
    }

    if (orderItems.length === 0) {
      setAlertMessage("Please add at least one product to the order!");
      setShowCustomAlert(true);
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

        {/* Main Content Layout */}
        <div className="space-y-8">
          {/* Customer Information and Order Summary - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information Card */}
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon.User className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Customer Information</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Search Customer
                  </label>
                  <div className="relative">
                    <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      placeholder="Search customers by name or phone..."
                      className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-3 pl-12 pr-6 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  
                                     {/* Customer Search Results */}
                   {customerSearchTerm && (
                     <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-gray-200/60 dark:border-white/10">
                       {filteredCustomers.length > 0 ? (
                         filteredCustomers.slice(0, 10).map((customer) => (
                           <div
                             key={customer.id}
                             className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/10 last:border-b-0 transition-colors duration-200"
                           >
                             <div className="flex items-center justify-between">
                               <div className="flex-1">
                                 <div className="font-medium text-gray-900 dark:text-white">
                                   {customer.first_name} {customer.last_name}
                                 </div>
                                 <div className="text-sm text-gray-500 dark:text-gray-400">
                                   {customer.phone_number || "No phone"}
                                 </div>
                               </div>
                               <button
                                 onClick={() => {
                                   setSelectedCustomer(customer);
                                   setCustomerSearchTerm("");
                                 }}
                                 className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                               >
                                 Select
                               </button>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                           No customers found
                         </div>
                       )}
                     </div>
                   )}
                </div>
                 
                 {selectedCustomer ? (
                   <div className="space-y-4">
                     <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                       <div className="flex items-start gap-4">
                         <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                           <Icon.User className="h-7 w-7 text-white" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                             {selectedCustomer.first_name} {selectedCustomer.last_name}
                           </h3>
                           <div className="space-y-2">
                             <div className="flex items-center gap-2">
                               <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                 <Icon.Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                               </div>
                               <p className="text-gray-600 dark:text-gray-300 font-medium">
                                 {selectedCustomer.phone_number || "No phone number"}
                               </p>
                             </div>
                             {selectedCustomer.address && (
                               <div className="flex items-start gap-2">
                                 <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mt-0.5">
                                   <Icon.MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                 </div>
                                 <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                   {selectedCustomer.address}
                                 </p>
                               </div>
                             )}
                           </div>
                         </div>
                         <button
                           onClick={() => setSelectedCustomer(null)}
                           className="rounded-lg p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                           title="Remove customer"
                         >
                           <Icon.Trash className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                         <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer ID</p>
                         <p className="font-bold text-gray-900 dark:text-white">#{selectedCustomer.id}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                         <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                         <p className="font-bold text-green-600 dark:text-green-400">Active</p>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                       <Icon.User className="h-8 w-8 text-gray-400" />
                     </div>
                     <p className="text-gray-500 dark:text-gray-400 text-sm">
                       Search and select a customer to view details
                     </p>
                   </div>
                 )}
               </div>
            </div>

            {/* Order Summary Card */}
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon.DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Order Summary</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/10">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
                  <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total Discount</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">-${totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {deliveryEnabled && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Delivery</span>
                    <span className="font-bold text-lg">${deliveryAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-xl text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-2xl text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>

                                 {/* Delivery Options */}
                 <div className="mt-6 space-y-4">
                   <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                     <div className="flex items-center gap-3">
                       <div className="relative">
                         <input
                           type="checkbox"
                           id="delivery"
                           checked={deliveryEnabled}
                           onChange={(e) => setDeliveryEnabled(e.target.checked)}
                           className="h-5 w-5 rounded-full border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-white/10 dark:bg-white/5"
                         />
                       </div>
                       <label htmlFor="delivery" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                         Delivery Required
                       </label>
                     </div>
                     <Icon.Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                   </div>
                  {deliveryEnabled && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Fee:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deliveryAmount}
                        onChange={(e) => setDeliveryAmount(parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">USD</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      {error}
                    </div>
                  </div>
                )}

                {/* Create Order Button */}
                <button
                  onClick={createOrder}
                  disabled={saving}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-lg font-bold text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] mt-6"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating Order...
                    </div>
                  ) : (
                    "Create Order"
                  )}
                </button>
              </div>
            </div>
          </div>

                    {/* Products Section */}
          <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon.Package className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Products</h2>
              </div>
            </div>
            
            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products by name, SKU, or barcode..."
                    className="w-full rounded-2xl border border-gray-200/60 bg-white/70 py-3 pl-12 pr-6 text-base outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-2xl border border-gray-200/60 bg-white/70 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Results Table - Only Show When Searching */}
              {searchTerm && (
                <div className="overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10">
                  <div className="overflow-y-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-xs text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Product</th>
                          <th className="px-4 py-3 text-left font-bold">Category</th>
                          <th className="px-4 py-3 text-left font-bold">Price</th>
                          <th className="px-4 py-3 text-left font-bold">Stock</th>
                          <th className="px-4 py-3 text-left font-bold">Quantity</th>
                          <th className="px-4 py-3 text-left font-bold">Discount</th>
                          <th className="px-4 py-3 text-left font-bold">Total</th>
                          <th className="px-4 py-3 text-left font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                        {filteredProducts.map((product) => {
                          const orderItem = orderItems.find(item => item.product_id === product.id);
                          const categoryName = categories.find(c => c.id == product.category_id)?.name || "No Category";
                          
                          return (
                            <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    SKU: {product.sku || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium text-xs">
                                {categoryName}
                              </td>
                              <td className="px-4 py-3 font-bold text-sm">
                                ${(parseFloat(product.price) || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.quantity_in_stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                                  {product.quantity_in_stock || 0}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {orderItem ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateItemQuantity(product.id, orderItem.quantity - 1)}
                                      className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                    >
                                      <Icon.Minus className="h-3 w-3" />
                                    </button>
                                    <span className="font-bold min-w-[2rem] text-center text-sm">{orderItem.quantity}</span>
                                    <button
                                      onClick={() => updateItemQuantity(product.id, orderItem.quantity + 1)}
                                      disabled={orderItem.quantity >= product.quantity_in_stock}
                                      className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition-all duration-200"
                                    >
                                      <Icon.Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addProductToOrder(product)}
                                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                  >
                                    Add
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {orderItem ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={orderItem.discount_amount}
                                      onChange={(e) => updateItemDiscount(product.id, e.target.value, orderItem.discount_type)}
                                      className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-center font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <select
                                      value={orderItem.discount_type}
                                      onChange={(e) => updateItemDiscount(product.id, orderItem.discount_amount, e.target.value)}
                                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white text-gray-900 dark:text-white"
                                    >
                                      <option value="usd" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">USD</option>
                                      <option value="percent" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">%</option>
                                    </select>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 font-medium text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-bold">
                                {orderItem ? (
                                  <div>
                                    <div className="text-gray-900 dark:text-white text-sm">
                                      ${calculateItemTotal(orderItem).toFixed(2)}
                                    </div>
                                    {orderItem.discount_amount > 0 && (
                                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        -${(orderItem.price * orderItem.quantity - calculateItemTotal(orderItem)).toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 font-medium text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {orderItem && (
                                  <button
                                    onClick={() => removeItemFromOrder(product.id)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                                    title="Remove item"
                                  >
                                    <Icon.Trash className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty States */}
              {!searchTerm && (
                <div className="text-center py-6">
                  <Icon.Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-base font-medium mb-1">
                    Search for products to add to your order
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Use the search bar above to find products by name, SKU, or barcode
                  </p>
                </div>
              )}

              {searchTerm && filteredProducts.length === 0 && (
                <div className="text-center py-6">
                  <Icon.Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
                    No products found matching "{searchTerm}"
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Try searching with different keywords or check the category filter
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Products Section */}
          {orderItems.length > 0 && (
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
                             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                       <Icon.ShoppingCart className="h-5 w-5 text-white" />
                     </div>
                     <h2 className="text-lg font-bold text-white">Selected Products</h2>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-sm font-medium text-white/90">{orderItems.length} items</span>
                     <button
                       onClick={clearAllItems}
                       className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition-all duration-200"
                       title="Clear all items"
                     >
                       Clear All
                     </button>
                   </div>
                 </div>
               </div>
              
              <div className="p-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10">
                  <div className="overflow-y-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 text-xs text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Product</th>
                          <th className="px-4 py-3 text-left font-bold">Category</th>
                          <th className="px-4 py-3 text-left font-bold">Price</th>
                          <th className="px-4 py-3 text-left font-bold">Quantity</th>
                          <th className="px-4 py-3 text-left font-bold">Discount</th>
                          <th className="px-4 py-3 text-left font-bold">Total</th>
                          <th className="px-4 py-3 text-left font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                        {orderItems.map((item) => {
                          const product = products.find(p => p.id === item.product_id);
                          
                          return (
                            <tr key={item.product_id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    SKU: {product?.sku || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium text-xs">
                                {item.category_name}
                              </td>
                              <td className="px-4 py-3 font-bold text-sm">
                                ${item.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                  >
                                    <Icon.Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-bold min-w-[2rem] text-center text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-50 transition-all duration-200"
                                  >
                                    <Icon.Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.discount_amount}
                                    onChange={(e) => updateItemDiscount(item.product_id, e.target.value, item.discount_type)}
                                    className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-center font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <select
                                    value={item.discount_type}
                                    onChange={(e) => updateItemDiscount(item.product_id, item.discount_amount, e.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white text-gray-900 dark:text-white"
                                  >
                                    <option value="usd" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">USD</option>
                                    <option value="percent" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">%</option>
                                  </select>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-bold">
                                <div>
                                  <div className="text-gray-900 dark:text-white text-sm">
                                    ${calculateItemTotal(item).toFixed(2)}
                                  </div>
                                  {item.discount_amount > 0 && (
                                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      -${(item.price * item.quantity - calculateItemTotal(item)).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removeItemFromOrder(item.product_id)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                                  title="Remove item"
                                >
                                  <Icon.Trash className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Alert Modal */}
      {showCustomAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Attention Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed">
                {alertMessage}
              </p>
              <button
                onClick={() => setShowCustomAlert(false)}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-bold text-white shadow-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
