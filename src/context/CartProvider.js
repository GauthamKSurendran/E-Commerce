import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

/**
 * Integrated CartProvider for FASHION.CO
 * Features: MongoDB Sync, Optimistic UI Updates, and Cross-Device Persistence
 */
export default function CartProvider({ children }) {
  const { user } = useContext(AuthContext);

  // Initialize from localStorage as a fallback for fast initial loads
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("fashion_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 1. FETCH DB CART ON LOGIN
  const fetchDbCart = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map backend schema to match your existing frontend UI logic
        if (data.items) {
          const mappedCart = data.items.map(item => ({
            _id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            selectedSize: item.size,
            qty: item.quantity // Translates DB 'quantity' to local 'qty'
          }));
          setCart(mappedCart);
        }
      }
    } catch (error) {
      console.error("Failed to fetch DB cart", error);
    }
  }, [user]);

  // Sync cart from DB when user logs in, or clear it on logout
  useEffect(() => {
    if (user) {
      fetchDbCart();
    } else {
      setCart([]);
      localStorage.removeItem("fashion_cart");
    }
  }, [user, fetchDbCart]);

  // Keep LocalStorage synced for immediate UI loads on refresh
  useEffect(() => {
    localStorage.setItem("fashion_cart", JSON.stringify(cart));
  }, [cart]);

  // 2. ADD TO CART API SYNC
  const addToCart = async (product) => {
    // Optimistic UI Update: Instant feedback for the user
    setCart((prev) => {
      const exists = prev.find((x) => x._id === product._id && x.selectedSize === product.selectedSize);
      if (exists) {
        return prev.map((x) =>
          x._id === product._id && x.selectedSize === product.selectedSize ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    // Background Backend Sync
    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:5000/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image || (product.images && product.images[0]), // Safe fallback
            size: product.selectedSize,
            quantity: 1 // Backend route automatically adds to existing quantity
          }),
        });
      } catch (err) {
        console.error("DB Add to Cart Error", err);
      }
    }
  };

  // 3. REMOVE FROM CART API SYNC
  const removeFromCart = async (id, size) => {
    // Optimistic UI Update
    setCart((prev) => prev.filter((x) => !(x._id === id && x.selectedSize === size)));

    // Background Backend Sync
    if (user) {
      try {
        const token = localStorage.getItem("token");
        // FIX APPLIED: Added size to the URL parameters to prevent deleting all sizes of a product
        await fetch(`http://localhost:5000/api/cart/item/${id}/${size}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("DB Remove from Cart Error", err);
      }
    }
  };

  // 4. UPDATE QUANTITY API SYNC
  const updateQty = async (id, size, newQty) => {
    if (newQty < 1) return;

    // Optimistic UI Update
    setCart((prev) =>
      prev.map((x) =>
        x._id === id && x.selectedSize === size ? { ...x, qty: newQty } : x
      )
    );

    // Background Backend Sync
    if (user) {
      try {
        const token = localStorage.getItem("token");
        // FIX APPLIED: Using the new PUT route and passing the exact absolute quantity
        await fetch("http://localhost:5000/api/cart/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: id,
            size: size,
            quantity: newQty
          }),
        });
      } catch (err) {
        console.error("DB Update Qty Error", err);
      }
    }
  };

  // 5. CLEAR CART API SYNC
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("fashion_cart");

    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:5000/api/cart", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("DB Clear Cart Error", err);
      }
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}