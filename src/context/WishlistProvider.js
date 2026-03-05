import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

/**
 * Backend-Integrated Wishlist Provider
 * Manages persistent saved items in MongoDB
 */
export default function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext); //

  // 1. SYNC WISHLIST ON LOGIN
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token"); //
      if (!user || !token) {
        setWishlist([]);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/wishlist", {
          headers: { 
            "Authorization": `Bearer ${token}`, //
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (response.ok) setWishlist(data); //
      } catch (err) {
        console.error("Wishlist sync error:", err);
      }
    };

    fetchWishlist();
  }, [user]);

  /**
   * RS13: Add product to MongoDB Wishlist
   */
  const addToWishlist = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to save items.");

    try {
      const response = await fetch("http://localhost:5000/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id }) // Use MongoDB _id
      });

      if (response.ok) {
        setWishlist((prev) => [...prev, product]); // Update local state
      }
    } catch (err) {
      console.error("Add to wishlist failed:", err);
    }
  };

  /**
   * Remove product from MongoDB Wishlist
   */
  const removeFromWishlist = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setWishlist((prev) => prev.filter((p) => p._id !== id)); //
      }
    } catch (err) {
      console.error("Remove from wishlist failed:", err);
    }
  };

  /**
   * Check if product is in wishlist using MongoDB _id
   */
  const isInWishlist = (id) => {
    return wishlist.some((p) => p._id === id); //
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}