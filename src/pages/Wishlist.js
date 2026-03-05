import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartProvider";
import ProductCard from "../components/ProductCard";
import { Link, useNavigate } from "react-router-dom";

/**
 * Backend-Integrated Wishlist Component
 * Integrated with MongoDB and Persistent Cart schema for FASHION.CO
 */
export default function Wishlist({ user }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  
  const navigate = useNavigate();

  // 1. FETCH WISHLIST FROM BACKEND
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/wishlist", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (response.ok) {
          setWishlist(data); 
        }
      } catch (err) {
        console.error("Wishlist Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // 2. REMOVE FROM WISHLIST API
  const handleRemove = async (productId) => {
    const token = localStorage.getItem("token");
    
    // Optimistic UI Update: Remove instantly on frontend for snappy feel
    setWishlist(prev => prev.filter(item => item._id !== productId));

    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        // Revert if the backend fails
        console.error("Failed to remove from database.");
      }
    } catch (err) {
      console.error("Remove Error:", err);
    }
  };

  // 3. TRANSFER ALL ITEMS TO CART & REDIRECT
  const handleMoveAllToBag = () => {
    if (wishlist.length === 0) return;

    let itemsAdded = 0;
    wishlist.forEach((product) => {
      // Ensure we only move items that are in stock
      if ((product.stock || 0) > 0) {
        
        // Exact mapping to match our new Persistent Cart Schema
        addToCart({ 
          productId: product._id, 
          name: product.name,
          price: product.price,
          image: product.image,
          size: product.sizes?.[0] || "M", // Default to first available size or "M"
          quantity: 1
        });
        
        // Remove the item from wishlist once moved to cart
        handleRemove(product._id);
        itemsAdded++;
      }
    });

    if (itemsAdded > 0) {
      alert(`${itemsAdded} items successfully moved to your bag!`);
      navigate('/cart'); 
    } else {
      alert("No items were in stock to move to the bag.");
    }
  };

  // Fallback for unauthenticated access
  if (!user) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <h2 className="fw-black text-uppercase ls-2">My Wishlist</h2>
        <p className="text-muted mt-3 small fw-bold">PLEASE LOGIN TO VIEW SAVED PIECES.</p>
        <Link to="/login" className="btn btn-dark rounded-0 px-5 py-3 mt-2 fw-bold ls-1">LOGIN</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5 mb-5 animate-in">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2 border-dark">
        <h2 className="fw-black mb-0 text-uppercase ls-1">My Wishlist</h2>
        <div className="d-flex align-items-center gap-3">
          {wishlist.length > 0 && (
            <button 
              className="btn btn-outline-dark btn-sm rounded-0 fw-bold px-4 py-2 extra-small ls-1"
              onClick={handleMoveAllToBag}
            >
              MOVE ALL TO BAG
            </button>
          )}
          <span className="text-muted extra-small fw-bold">{wishlist.length} ITEMS</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-5 border bg-light shadow-sm rounded-0 border-dashed">
          <p className="lead text-muted mb-4 small fw-bold text-uppercase">Your wishlist is currently empty.</p>
          <Link to="/products" className="btn btn-dark rounded-0 px-5 py-3 fw-bold ls-1">
            CONTINUE BROWSING
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((product) => (
            <div className="col-lg-3 col-md-4 col-6" key={product._id}>
              <ProductCard product={product} user={user} />
              <button 
                className="btn btn-link text-danger text-decoration-none w-100 mt-2 extra-small fw-bold text-uppercase ls-1"
                onClick={() => handleRemove(product._id)}
              >
                &times; Remove Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}