import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

/**
 * Integrated CartProvider for FASHION.CO
 * Features: DB Syncing, Category Persistence for Analytics, and Optimistic UI updates.
 */
export default function CartProvider({ children }) {
  const { user } = useContext(AuthContext);

  // Initialize from localStorage for instant UI feedback
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
        if (data && data.items) {
          const mappedCart = data.items.map(item => ({
            _id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category || "Other", // Sync category for Revenue Analytics
            selectedSize: item.size,
            qty: item.quantity, 
            maxStock: item.maxStock || 99 
          }));
          setCart(mappedCart);
        }
      }
    } catch (error) {
      console.error("Critical: Failed to fetch DB cart", error);
    }
  }, [user]);

  // Sync on Auth Change
  useEffect(() => {
    if (user) {
      fetchDbCart();
    } else {
      setCart([]);
      localStorage.removeItem("fashion_cart");
    }
  }, [user, fetchDbCart]);

  // Sync state to localStorage for guest persistence/persistence across refreshes
  useEffect(() => {
    localStorage.setItem("fashion_cart", JSON.stringify(cart));
  }, [cart]);

  // 2. ADD TO CART WITH CATEGORY PERSISTENCE
  const addToCart = async (product, qtyToAdd = 1, availableStock = 99) => {
    const existingItem = cart.find(x => x._id === product._id && x.selectedSize === product.selectedSize);
    const currentQtyInCart = existingItem ? existingItem.qty : 0;

    if (currentQtyInCart + qtyToAdd > availableStock) {
      alert(`Stock Limit: Only ${availableStock} units of size ${product.selectedSize} available.`);
      return; 
    }

    // Update Local State Optimistically
    setCart((prev) => {
      const exists = prev.find((x) => x._id === product._id && x.selectedSize === product.selectedSize);
      if (exists) {
        return prev.map((x) =>
          x._id === product._id && x.selectedSize === product.selectedSize 
            ? { ...x, qty: x.qty + qtyToAdd } 
            : x
        );
      }
      return [...prev, { 
        ...product, 
        qty: qtyToAdd, 
        maxStock: availableStock,
        category: product.category || "Other" 
      }];
    });

    // Backend Sync
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
            category: product.category || "Other", 
            image: product.image || (product.images && product.images[0]), 
            size: product.selectedSize,
            quantity: qtyToAdd,
            maxStock: availableStock 
          }),
        });
      } catch (err) {
        console.error("DB Sync Failed (Add)", err);
      }
    }
  };

  // 3. REMOVE FROM CART
  const removeFromCart = async (id, size) => {
    setCart((prev) => prev.filter((x) => !(x._id === id && x.selectedSize === size)));

    if (user) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/cart/item/${id}/${size}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("DB Sync Failed (Remove)", err);
      }
    }
  };

  // 4. UPDATE QUANTITY
  const updateQty = async (id, size, newQty, maxStock) => {
    if (newQty < 1) return;
    
    if (maxStock !== undefined && newQty > maxStock) {
        alert(`Maximum stock reached (${maxStock} units).`);
        return;
    }

    setCart((prev) =>
      prev.map((x) =>
        x._id === id && x.selectedSize === size ? { ...x, qty: newQty } : x
      )
    );

    if (user) {
      try {
        const token = localStorage.getItem("token");
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
        console.error("DB Sync Failed (Update)", err);
      }
    }
  };

  // 5. CLEAR CART (After Checkout or Manual Clear)
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
        console.error("DB Sync Failed (Clear)", err);
      }
    }
  };

  // MEMOIZED CALCULATION: Prevents unnecessary re-renders when other state changes
  const totalPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cart]);

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