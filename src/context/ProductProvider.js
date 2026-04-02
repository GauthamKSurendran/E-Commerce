import React, { createContext, useState, useEffect, useCallback } from "react";

export const ProductContext = createContext();

/**
 * ProductProvider Component
 * Integrated with MongoDB Backend & JWT Authentication
 * Updated to handle FormData (Multiple Image Uploads)
 */
export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. FETCH PRODUCTS FROM BACKEND
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        setError(data.message || "Failed to load products.");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * RS10: Admin Management - Add Product (Backend Sync)
   * CRITICAL: Accepts FormData, does NOT set Content-Type header
   */
  const addProduct = async (formData, token) => {
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          // DO NOT SET 'Content-Type': 'application/json' here!
          // The browser automatically sets 'multipart/form-data' for FormData
          "Authorization": `Bearer ${token}` 
        },
        body: formData, // Sending FormData instead of JSON.stringify
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProducts(); // Force refresh dashboard metrics
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      console.error("Add product failed:", err);
      return { success: false, error: "Server connection failed." };
    }
  };

  /**
   * Admin Management - Update Product (Backend Sync)
   * CRITICAL: Accepts FormData, does NOT set Content-Type header
   */
  const updateProduct = async (id, formData, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData, 
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProducts(); 
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (err) {
      console.error("Update product failed:", err);
      return { success: false, error: "Server connection failed." };
    }
  };

  /**
   * RS10: Admin Management - Delete Product (Backend Sync)
   */
  const deleteProduct = async (id, token) => {
    // Fallback if token isn't passed directly
    const authToken = token || localStorage.getItem("token"); 
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        return { success: true };
      }
      const data = await response.json();
      return { success: false, error: data.message };
    } catch (err) {
      console.error("Delete product failed:", err);
      return { success: false, error: "Server connection failed." };
    }
  };

  /**
   * RS11: Automatic Stock Update (Legacy/Manual Fallback)
   * Note: Order creation handles stock natively now, but keeping this for manual overrides
   */
  const updateStock = async (productId, quantitySold) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock - quantitySold);
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ stock: newStock }),
      });
      fetchProducts(); // Sync state
    } catch (err) {
      console.error("Stock update failed:", err);
    }
  };

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        loading,
        error,
        fetchProducts, 
        setProducts,
        addProduct, 
        updateProduct, // NEW: Exported for editing
        deleteProduct, 
        updateStock
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}