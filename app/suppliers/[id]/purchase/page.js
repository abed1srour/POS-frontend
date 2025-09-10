"use client";

import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { useRouter, useParams } from "next/navigation";

/**
 * Supplier Purchase page for the POS app
 * - Purchase products from a specific supplier
 * - Add discount to products
 * - Add products to inventory with discounted prices
 * - Track purchase orders and payments
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
  ShoppingCart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  ),
  DollarSign: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Building: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9h.01" />
      <path d="M9 13h.01" />
      <path d="M9 17h.01" />
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
  Truck: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M2 3h1a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h15" />
      <path d="M9 6h6l4 6v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <circle cx="9" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
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

export default function SupplierPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id;

  // Data state
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Purchase state
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [deliveryAmount, setDeliveryAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // New product state
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    category_id: "",
    cost_price: 0,
    selling_price: 0,
    quantity: "",
    image_url: "",
    reorder_level: "",
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

  async function fetchSupplier() {
    try {
      const res = await fetch(api(`/api/suppliers/${supplierId}`), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      console.log("Supplier data:", data); // Debug log
      setSupplier(data.data || data);
    } catch (e) {
      console.error("Supplier fetch error:", e); // Debug log
      setErr(e?.message || "Failed to load supplier");
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch(api("/api/products?limit=100"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setProducts(data.data || data || []);
    } catch (e) {
      setErr(e?.message || "Failed to load products");
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(api("/api/categories"), {
        headers: authHeaders(),
        cache: "no-store",
      });
      if (res.status === 401) return router.replace("/login");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setCategories(data.data || data || []);
    } catch (e) {
      setErr(e?.message || "Failed to load categories");
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchSupplier(), fetchProducts(), fetchCategories()]);
      setLoading(false);
    }
    loadData();
  }, [supplierId]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const totalWithPurchasePrices = cart.reduce((sum, item) => {
    const purchasePrice = parseFloat(item.purchasePrice) || 0;
    return sum + (purchasePrice * item.quantity);
  }, 0);
  const deliveryCost = deliveryChecked ? deliveryAmount : 0;
  const total = totalWithPurchasePrices + deliveryCost;

  // Debug logging for cart totals
  console.log("🛒 Cart Debug:", {
    cartItems: cart.map(item => ({
      name: item.name,
      purchasePrice: item.purchasePrice,
      quantity: item.quantity,
      total: item.total
    })),
    subtotal,
    totalWithPurchasePrices,
    deliveryCost,
    total
  });

  // Add product to cart
  function addProductToCart(product) {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update quantity if product already exists
      updateCartItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      // Add new product with empty purchase price (user must enter cost price)
      const originalPrice = parseFloat(product.price) || 0;
      const newItem = {
        id: Date.now(), // temporary ID
        productId: product.id,
        name: product.name,
        sku: product.sku,
        category: categories.find(c => c.id == product.category_id)?.name || "Unknown",
        originalPrice: originalPrice,
        purchasePrice: 0, // Start with empty/0 - user must enter actual cost price
        quantity: 1,
        total: 0, // Start with 0 total since purchase price is 0
        isExistingProduct: true // Mark as existing product
      };
      setCart([...cart, newItem]);
    }
    setErr(null);
  }

  // Add new product to cart
  function addNewProductToCart() {
    if (!newProduct.name || !newProduct.sku || !newProduct.category_id || newProduct.cost_price <= 0 || newProduct.selling_price <= 0 || !newProduct.quantity || parseInt(newProduct.quantity) < 1) {
      setErr("Please fill all required fields for the new product");
      return;
    }

    // Ensure selling price is different from cost price
    const costPrice = parseFloat(newProduct.cost_price) || 0;
    const sellingPrice = parseFloat(newProduct.selling_price) || 0;
    
    if (sellingPrice <= costPrice) {
      setErr("Selling price must be greater than cost price to ensure profit margin");
      return;
    }

    const newItem = {
      id: Date.now(), // temporary ID
      productId: `new_${Date.now()}`, // temporary ID for new product
      name: newProduct.name,
      sku: newProduct.sku,
      category: categories.find(c => c.id == newProduct.category_id)?.name || "Unknown",
      originalPrice: parseFloat(newProduct.cost_price) || 0,
      purchasePrice: parseFloat(newProduct.cost_price) || 0, // Use cost_price as purchase price for new products
      newPrice: parseFloat(newProduct.selling_price) || 0, // Use selling price only
      quantity: parseInt(newProduct.quantity),
      total: (parseFloat(newProduct.cost_price) || 0) * parseInt(newProduct.quantity),
      isNewProduct: true,
      newProductData: { ...newProduct }
    };
    
    setCart([...cart, newItem]);
    setShowNewProductForm(false);
    setNewProduct({
      name: "",
      sku: "",
      barcode: "",
      description: "",
      category_id: "",
      cost_price: 0,
      selling_price: 0,
      quantity: "",
      image_url: "",
      reorder_level: "",
      status: "active"
    });
    setErr(null);
  }

  // Clear all selected items
  function clearAllItems() {
    setCart([]);
  }

  // Update item quantity
  function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId 
        ? { 
            ...item, 
            quantity: newQuantity, 
            total: item.purchasePrice * newQuantity 
          }
        : item
    ));
  }

  // Update item new price (only for new products)
  function updateCartItemNewPrice(productId, newPrice) {
    const price = Math.max(0, parseFloat(newPrice) || 0);
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { 
            ...item, 
            newPrice: price,
            // Update the newProductData selling_price as well
            newProductData: item.newProductData ? {
              ...item.newProductData,
              selling_price: price
            } : item.newProductData
            // Total is calculated based on purchase price, not new price
          }
        : item
    ));
  }

  // Update item purchase price
  function updateCartItemPurchasePrice(productId, newPurchasePrice) {
    // Allow empty string to show as empty field, but convert to 0 for calculations
    const purchasePrice = newPurchasePrice === "" ? 0 : Math.max(0, parseFloat(newPurchasePrice) || 0);
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { 
            ...item, 
            purchasePrice: newPurchasePrice === "" ? "" : purchasePrice, // Keep empty string for display
            total: purchasePrice * item.quantity
          }
        : item
    ));
  }

  // Remove item from cart
  function removeFromCart(productId) {
    setCart(cart.filter(item => item.productId !== productId));
  }

  // Create purchase order
  async function createPurchaseOrder() {
    if (cart.length === 0) {
      setErr("Cart is empty");
      return;
    }

    // Validate cart items
    const invalidItems = cart.filter(item => 
      !item.name || 
      !item.productId || 
      item.purchasePrice <= 0 || 
      item.quantity <= 0
    );
    
    if (invalidItems.length > 0) {
      console.error("❌ Invalid cart items found:", invalidItems);
      setErr("Some items in your cart have invalid data. Please check purchase prices and quantities.");
      return;
    }

    // Additional validation: Check for empty purchase prices
    const itemsWithEmptyPurchasePrice = cart.filter(item => 
      item.purchasePrice === 0 || item.purchasePrice === "" || !item.purchasePrice || parseFloat(item.purchasePrice) <= 0
    );
    
    if (itemsWithEmptyPurchasePrice.length > 0) {
      const itemNames = itemsWithEmptyPurchasePrice.map(item => item.name).join(", ");
      setErr(`Please enter valid purchase prices for: ${itemNames}`);
      return;
    }

    console.log("🛒 Starting purchase order creation...");
    console.log("📦 Cart contents:", cart.map(item => ({
      name: item.name,
      sku: item.sku,
      originalPrice: item.originalPrice,
      purchasePrice: item.purchasePrice,
      newPrice: item.newPrice,
      quantity: item.quantity,
      total: item.total,
      isNewProduct: item.isNewProduct,
      isExistingProduct: item.isExistingProduct
    })));

    setSaving(true);
    setErr(null);

    try {
      // First, create any new products
      const newProducts = cart.filter(item => item.isNewProduct);
      console.log("🆕 New products to create:", newProducts.length);
      console.log("🆕 New products details:", newProducts.map(item => ({
        name: item.name,
        sku: item.sku,
        selling_price: item.newProductData.selling_price,
        cost_price: item.purchasePrice,
        newPrice: item.newPrice,
        quantity: item.quantity
      })));
      
      const createdProducts = [];
      
      // If there are no new products, we can skip the creation step
      if (newProducts.length === 0) {
        console.log("ℹ️ No new products to create, proceeding with existing products only");
        console.log("📦 Cart contains only existing products:", cart.filter(item => item.isExistingProduct).map(item => item.name));
      }
      
      for (const item of newProducts) {
        try {
          console.log("🔍 Debug - Item data:", {
            newProductData: item.newProductData,
            selling_price: item.newProductData.selling_price,
            purchasePrice: item.purchasePrice,
            newPrice: item.newPrice,
            finalPrice: item.newPrice || item.newProductData.selling_price
          });

          const productData = {
            name: item.newProductData.name,
            sku: item.newProductData.sku,
            barcode: item.newProductData.barcode,
            description: item.newProductData.description,
            category_id: item.newProductData.category_id,
            price: item.newPrice || item.newProductData.selling_price, // Use newPrice if available, otherwise use selling_price
            cost: item.purchasePrice, // Use the purchase price from cart (backend expects 'cost' not 'cost_price')
            supplier_id: supplierId, // Add the supplier ID
            quantity_in_stock: 0, // Will be updated when purchase order is processed
            image_url: item.newProductData.image_url,
            reorder_level: item.newProductData.reorder_level ? parseInt(item.newProductData.reorder_level) : 0,
            status: item.newProductData.status
          };

          console.log("📤 Sending product data to backend:", productData);
          console.log("🔍 Price breakdown:");
          console.log(`   - item.newPrice: ${item.newPrice}`);
          console.log(`   - item.newProductData.selling_price: ${item.newProductData.selling_price}`);
          console.log(`   - Final price being sent: ${productData.price}`);
          console.log(`   - Cost being sent: ${productData.cost}`);
          console.log(`   - Supplier ID being sent: ${productData.supplier_id}`);

          const res = await fetch(api("/api/products"), {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(productData),
          });

          if (res.ok) {
            const newProduct = await res.json();
            console.log(`✅ Product "${item.name}" created successfully!`);
            console.log(`📋 Backend response:`, newProduct);
            console.log(`🔍 Backend returned product data:`, newProduct.data || newProduct);
            
            const productId = newProduct.data?.id || newProduct.id;
            if (!productId) {
              console.error(`❌ No product ID returned for "${item.name}"`);
              throw new Error(`No product ID returned for "${item.name}"`);
            }
            
            createdProducts.push({
              oldId: item.productId,
              newId: productId
            });
            console.log(`✅ Product "${item.name}" created with ID: ${productId}`);
            console.log(`💰 Product "${item.name}" prices - Selling: $${productData.price}, Cost: $${productData.cost}`);
          } else {
            const errorData = await res.text();
            console.error(`❌ Failed to create product "${item.name}":`, errorData);
            console.error(`❌ Response status: ${res.status}`);
            console.error(`❌ Response headers:`, Object.fromEntries(res.headers.entries()));
            throw new Error(`Failed to create product "${item.name}": ${errorData}`);
          }
        } catch (e) {
          console.error(`❌ Failed to create product "${item.name}":`, e);
          console.error("Product data that failed:", productData);
        }
      }

      // Update cart items with new product IDs and filter out failed creations
      const updatedCart = cart.map(item => {
        if (item.isNewProduct) {
          // For new products, check if they were successfully created
          const createdProduct = createdProducts.find(cp => cp.oldId === item.productId);
          if (createdProduct) {
            console.log(`✅ New product "${item.name}" successfully created with ID: ${createdProduct.newId}`);
            return { ...item, productId: createdProduct.newId };
          } else {
            console.error(`❌ New product "${item.name}" failed to create`);
            return null;
          }
        } else {
          // For existing products, keep them as they are
          console.log(`✅ Existing product "${item.name}" (ID: ${item.productId}) kept in cart`);
          return item;
        }
      }).filter(item => item !== null); // Remove items that failed to create

      console.log("🔄 Updated cart with real product IDs:", updatedCart.map(item => ({
        name: item.name,
        productId: item.productId,
        purchasePrice: item.purchasePrice,
        quantity: item.quantity,
        total: item.total,
        isNewProduct: item.isNewProduct,
        isExistingProduct: item.isExistingProduct
      })));

      // Check if we have any items left
      if (updatedCart.length === 0) {
        console.error("❌ No items left in cart after processing");
        console.error("Original cart:", cart);
        console.error("Created products:", createdProducts);
        
        // Check if this is because all products failed to create
        const newProductCount = cart.filter(item => item.isNewProduct).length;
        const existingProductCount = cart.filter(item => item.isExistingProduct).length;
        
        if (newProductCount > 0 && createdProducts.length === 0) {
          throw new Error("Failed to create new products. Please check the product data and try again.");
        } else if (existingProductCount > 0) {
          throw new Error("Failed to process existing products. Please try again.");
        } else {
          throw new Error("No products were successfully created. Please try again.");
        }
      }

      const purchaseOrder = {
        supplier_id: supplierId,
        items: updatedCart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.purchasePrice // Use the custom purchase price
        })),
        subtotal,
        total_discount: 0, // No discount, using new prices instead
        total,
        total_amount: total,
        payment_method: 'cash',
        payment_amount: 0,
        balance: total,
        delivery_checked: deliveryChecked
      };

      console.log("🔍 Purchase order data being sent to backend:");
      console.log("   - supplier_id:", purchaseOrder.supplier_id);
      console.log("   - items count:", purchaseOrder.items.length);
      console.log("   - items:", purchaseOrder.items);
      console.log("   - subtotal:", purchaseOrder.subtotal);
      console.log("   - total:", purchaseOrder.total);
      console.log("   - total_amount:", purchaseOrder.total_amount);
      console.log("   - delivery_checked:", purchaseOrder.delivery_checked);

      console.log("📋 Final purchase order data:", purchaseOrder);
      console.log("📊 Purchase order summary:");
      console.log(`   - Total items: ${purchaseOrder.items.length}`);
      console.log(`   - Subtotal: $${purchaseOrder.subtotal}`);
      console.log(`   - Total: $${purchaseOrder.total}`);
      console.log(`   - Delivery: ${purchaseOrder.delivery_checked ? 'Yes' : 'No'}`);
      if (purchaseOrder.delivery_checked) {
        console.log(`   - Delivery amount: $${deliveryAmount}`);
      }

      console.log("📤 Sending purchase order to backend...");
      const res = await fetch(api("/api/purchase-orders"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(purchaseOrder),
      });

      console.log("📥 Purchase order creation response status:", res.status);
      console.log("📥 Purchase order creation response headers:", Object.fromEntries(res.headers.entries()));

      if (res.status === 401) return router.replace("/login");
      if (!res.ok) {
        const errorData = await res.text();
        console.error("❌ Purchase order creation failed:", errorData);
        console.error("❌ Response status:", res.status);
        throw new Error(`Failed (${res.status}): ${errorData}`);
      }

      const createdPO = await res.json();
      console.log("✅ Purchase order created successfully!");
      console.log("📋 Created purchase order data:", createdPO);
      console.log("🆔 Purchase order ID:", createdPO.data?.id || createdPO.id);

      // Mark the purchase order as received to update stock
      const purchaseOrderId = createdPO.data?.id || createdPO.id;
      if (purchaseOrderId) {
        console.log("🔄 Marking purchase order as received...");
        const statusRes = await fetch(api(`/api/purchase-orders/${purchaseOrderId}/status`), {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status: 'received' }),
        });

        console.log("📥 Status update response:", statusRes.status);
        if (statusRes.ok) {
          console.log("✅ Purchase order marked as received, stock updated");
        } else {
          const statusError = await statusRes.text();
          console.warn("⚠️ Failed to mark purchase order as received:", statusError);
        }
      } else {
        console.error("❌ No purchase order ID returned from creation");
      }

      // Clear cart and redirect
      setCart([]);
      console.log("🎉 Purchase order creation completed successfully!");
      console.log("🔄 Redirecting to purchase orders page to verify creation...");
      
      // Redirect to purchase orders page to verify the order was created
      router.push("/purchase-orders");
    } catch (e) {
      setErr(e?.message || "Failed to create purchase order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout title="Purchase from Supplier">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!supplier) {
    return (
      <Layout title="Supplier Not Found">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Supplier not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Purchase from ${supplier.company_name || supplier.name || "Supplier"}`}>
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
              Purchase from Supplier
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Add products and create a purchase order</p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="space-y-8">


          {/* Supplier Information and Purchase Summary - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supplier Information Card */}
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon.Building className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Supplier Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon.Building className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                        {supplier.company_name || supplier.name || "Unknown Supplier"}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                            <Icon.Package className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 font-medium">
                            {supplier.contact_person || "No contact person"}
                          </p>
                        </div>
                        {(supplier.phone || supplier.phone_number) && (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                              <Icon.Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {supplier.phone || supplier.phone_number}
                            </p>
                          </div>
                        )}
                        {(supplier.address || supplier.address_line) && (
                          <div className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mt-0.5">
                              <Icon.MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                              {supplier.address || supplier.address_line}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Supplier ID</p>
                    <p className="font-bold text-gray-900 dark:text-white">#{supplier.id || supplierId}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                    <p className="font-bold text-green-600 dark:text-green-400">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Summary Card */}
            <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon.DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Purchase Summary</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/10">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Cost Subtotal</span>
                  <span className="font-bold text-lg">${totalWithPurchasePrices.toFixed(2)}</span>
                </div>

                {deliveryChecked && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/10">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Delivery</span>
                    <span className="font-bold text-lg">${deliveryAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-xl text-gray-900 dark:text-white">Total Cost</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                {/* Help text when total is 0 */}
                {total === 0 && cart.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50/80 dark:bg-amber-500/10 rounded-lg border border-amber-200/50 dark:border-amber-500/20">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      ⚠️ <strong>Total is $0.00:</strong> Make sure you've set purchase prices for all items in your cart.
                    </p>
                  </div>
                )}

                {/* Delivery Check-in */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="delivery-check"
                      checked={deliveryChecked}
                      onChange={(e) => setDeliveryChecked(e.target.checked)}
                      className="h-5 w-5 text-indigo-500 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="delivery-check" className="text-sm font-medium text-gray-900 dark:text-white">
                      Delivery Check-in
                    </label>
                  </div>
                    <Icon.Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  {deliveryChecked && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Fee:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deliveryAmount === 0 ? '' : deliveryAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDeliveryAmount(value === '' ? 0 : parseFloat(value) || 0);
                        }}
                        className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">USD</span>
                    </div>
                  )}
                </div>

                {err && (
                  <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      {err}
                    </div>
                  </div>
                )}

                <button
                  onClick={createPurchaseOrder}
                  disabled={cart.length === 0 || saving}
                  className="w-full mt-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-lg font-bold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating Purchase Order...
                    </div>
                  ) : (
                    <>
                  <Icon.ShoppingCart className="inline h-5 w-5 mr-2" />
                  Complete Purchase Order
                    </>
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
                <button
                  onClick={() => setShowNewProductForm(!showNewProductForm)}
                  className="rounded-2xl border border-transparent bg-indigo-500/90 px-6 py-3 text-sm font-bold text-white transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                >
                  <Icon.Plus className="inline h-4 w-4 mr-2" />
                  {showNewProductForm ? "Cancel" : "Add New Product"}
                            </button>
                          </div>

              {/* New Product Form */}
              {showNewProductForm && (
                <div className="mb-6 p-4 rounded-2xl border border-gray-200/60 bg-white/90 dark:bg-white/5 dark:border-white/10 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add New Product</h3>
                    <button
                      onClick={() => setShowNewProductForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Enter SKU"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Barcode
                      </label>
                      <input
                        type="text"
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Enter barcode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={newProduct.category_id}
                        onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reorder Level
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newProduct.reorder_level}
                        onChange={(e) => setNewProduct({...newProduct, reorder_level: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={newProduct.status}
                        onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      rows={2}
                      className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cost Price (Supplier) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProduct.cost_price === 0 ? "" : newProduct.cost_price}
                        onChange={(e) => setNewProduct({...newProduct, cost_price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selling Price *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProduct.selling_price === 0 ? "" : newProduct.selling_price}
                        onChange={(e) => setNewProduct({...newProduct, selling_price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Must be higher than cost price"
                        required
                      />
                    </div>
                  </div>

                  {/* Image URL and Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity to Purchase *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newProduct.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewProduct({...newProduct, quantity: value});
                        }}
                        className="w-full rounded-lg border border-gray-200/60 bg-white/70 px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter quantity"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                                          <button
                        onClick={addNewProductToCart}
                        className="rounded-lg border border-transparent bg-indigo-500/90 px-4 py-2 text-sm font-medium text-white transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                      >
                        <Icon.Plus className="inline h-4 w-4 mr-2" />
                        Add to Purchase Order
                      </button>
                  </div>
                </div>
              )}

              {/* Search Results Table - Only Show When Searching */}
              {searchTerm && (
                <div className="overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10">
                  {/* Help Text */}
                  <div className="bg-blue-50/80 dark:bg-blue-500/10 border-b border-blue-200/50 dark:border-blue-500/20 px-4 py-2">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 <strong>Tip:</strong> Set the purchase price for each item. This will be used for cost calculations and inventory updates.
                    </p>
                  </div>
                  <div className="overflow-y-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Product</th>
                          <th className="px-4 py-3 text-left font-bold">Category</th>
                          <th className="px-4 py-3 text-left font-bold">Price</th>
                          <th className="px-4 py-3 text-left font-bold">Stock</th>
                          <th className="px-4 py-3 text-left font-bold">Quantity</th>
                          <th className="px-4 py-3 text-left font-bold">Purchase Price</th>
                          {cart.some(item => !item.isExistingProduct) && (
                            <th className="px-4 py-3 text-left font-bold">New Price</th>
                          )}
                          <th className="px-4 py-3 text-left font-bold">Total</th>
                          <th className="px-4 py-3 text-left font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                        {filteredProducts.map((product) => {
                          const cartItem = cart.find(item => item.productId === product.id);
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
                                {cartItem ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateCartItemQuantity(product.id, cartItem.quantity - 1)}
                                      className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                    >
                                      <Icon.Minus className="h-3 w-3" />
                                    </button>
                                    <span className="font-bold min-w-[2rem] text-center text-sm">{cartItem.quantity}</span>
                                    <button
                                      onClick={() => updateCartItemQuantity(product.id, cartItem.quantity + 1)}
                                      className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                    >
                                      <Icon.Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addProductToCart(product)}
                                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                                  >
                                    Add
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {cartItem ? (
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cartItem.purchasePrice || ""}
                                    onChange={(e) => updateCartItemPurchasePrice(product.id, e.target.value)}
                                    className={`w-20 rounded-lg border px-2 py-1 text-xs text-center font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                      cartItem.purchasePrice <= 0 
                                        ? "border-red-300 bg-red-50 focus:border-red-500 dark:border-red-500/50 dark:bg-red-500/10" 
                                        : "border-gray-200 bg-white focus:border-indigo-500 dark:border-white/10"
                                    }`}
                                    placeholder="Enter cost"
                                    title="Enter the cost price for this purchase (required)"
                                    required
                                  />
                                ) : (
                                  <span className="text-gray-400 font-medium text-xs">—</span>
                                )}
                              </td>
                              {cart.some(item => !item.isExistingProduct) && (
                                <td className="px-4 py-3">
                                  {cartItem && !cartItem.isExistingProduct ? (
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={cartItem.newPrice}
                                      onChange={(e) => updateCartItemNewPrice(product.id, e.target.value)}
                                      className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-center font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder="0.00"
                                      title="Set the new price for this new product"
                                    />
                                  ) : (
                                    <span className="text-gray-400 font-medium text-xs">—</span>
                                  )}
                                </td>
                              )}
                              <td className="px-4 py-3 font-bold">
                                {cartItem ? (
                                  <div className="text-gray-900 dark:text-white text-sm">
                                    {cartItem.total > 0 ? `$${cartItem.total.toFixed(2)}` : "—"}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 font-medium text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {cartItem && (
                          <button
                                    onClick={() => removeFromCart(product.id)}
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
                    Search for products to add to your purchase order
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
          {cart.length > 0 && (
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
                    <span className="text-sm font-medium text-white/90">{cart.length} items</span>
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
                      <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 text-sm text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Product</th>
                          <th className="px-4 py-3 text-left font-bold">Category</th>
                          <th className="px-4 py-3 text-left font-bold">Price</th>
                          <th className="px-4 py-3 text-left font-bold">Purchase Price</th>
                          <th className="px-4 py-3 text-left font-bold">Quantity</th>
                          {cart.some(item => !item.isExistingProduct) && (
                            <th className="px-4 py-3 text-left font-bold">New Price</th>
                          )}
                          <th className="px-4 py-3 text-left font-bold">Total</th>
                          <th className="px-4 py-3 text-left font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
                        {cart.map((item) => {
                          const product = products.find(p => p.id === item.productId);
                          
                          return (
                            <tr key={item.productId} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    SKU: {product?.sku || "N/A"}
                          </div>
                        </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium text-xs">
                                {item.category}
                              </td>
                              <td className="px-4 py-3 font-bold text-sm">
                                ${item.originalPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.purchasePrice || ""}
                                  onChange={(e) => updateCartItemPurchasePrice(item.productId, e.target.value)}
                                  className={`w-24 rounded-lg border px-2 py-1 text-xs text-center font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                    item.purchasePrice <= 0 
                                      ? "border-red-300 bg-red-50 focus:border-red-500 dark:border-red-500/50 dark:bg-red-500/10" 
                                      : "border-gray-200 bg-white focus:border-indigo-500 dark:border-white/10"
                                  }`}
                                  placeholder="Enter cost"
                                  title="Enter the cost price for this purchase (required)"
                                  required
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                  >
                                    <Icon.Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-bold min-w-[2rem] text-center text-sm">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200"
                                  >
                                    <Icon.Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                              {cart.some(item => !item.isExistingProduct) && (
                                <td className="px-4 py-3">
                                  {!item.isExistingProduct ? (
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.newPrice}
                                      onChange={(e) => updateCartItemNewPrice(item.productId, e.target.value)}
                                      className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-center font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder="0.00"
                                      title="Set the new price for this new product"
                                    />
                                  ) : (
                                    <span className="text-gray-400 font-medium text-xs">Auto-calculated</span>
                                  )}
                                </td>
                              )}
                              <td className="px-4 py-3 font-bold">
                                <div className={`text-sm ${
                                  item.purchasePrice <= 0 || item.purchasePrice === "" 
                                    ? "text-red-500 dark:text-red-400" 
                                    : "text-gray-900 dark:text-white"
                                }`}>
                                  ${item.total.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => removeFromCart(item.productId)}
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
                
                {/* Empty Cart State */}
                {cart.length === 0 && (
                  <div className="text-center py-8">
                    <Icon.ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      Search for products above and add them to your purchase order
                    </p>
                    <div className="bg-blue-50/80 dark:bg-blue-500/10 rounded-lg p-3 border border-blue-200/50 dark:border-blue-500/20">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 <strong>How it works:</strong> 
                        <br />1. Search for products you want to purchase
                        <br />2. Click "Add" to add them to your cart
                        <br />3. Set the purchase price for each item
                        <br />4. Complete your purchase order
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
