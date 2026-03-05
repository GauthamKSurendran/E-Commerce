import React, { createContext, useState, useEffect, useCallback } from "react";

export const ProductContext = createContext();

/**
 * ProductProvider Component
 * Integrated with MongoDB Backend & JWT Authentication
 */
export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH PRODUCTS FROM BACKEND
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * RS10: Admin Management - Add Product (Backend Sync)
   */
  const addProduct = async (newProduct) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Fixed space-delimited header
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        await fetchProducts(); // Force refresh dashboard metrics
        return true;
      }
      return false;
    } catch (err) {
      console.error("Add product failed:", err);
      return false;
    }
  };

  /**
   * RS10: Admin Management - Delete Product (Backend Sync)
   */
  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete product failed:", err);
      return false;
    }
  };

  /**
   * RS11: Automatic Stock Update (Backend Logic)
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
        fetchProducts, // Exported to allow manual refresh from Dashboard
        setProducts,
        addProduct, 
        deleteProduct, 
        updateStock
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}