import React, { createContext, useContext } from "react";
import { ProductContext } from "./ProductProvider";

export const ReviewContext = createContext();

/**
 * Backend-Integrated Review Provider
 * Optimized for e-commerce standards including full CRUD operations and analytics
 */
export default function ReviewProvider({ children }) {
  const { products, setProducts } = useContext(ProductContext);

  // 1. ADD REVIEW
  const addReview = async (reviewData) => {
    const { productId, rating, comment } = reviewData;
    const token = localStorage.getItem("token");

    if (!token) return { success: false, message: "Please log in to leave a review." };

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({ rating: Number(rating), comment }) 
      });

      const data = await response.json();

      if (response.ok) {
        // Re-fetch products to ensure we get the actual MongoDB _id for the new review.
        // This is crucial so the user can edit/delete it immediately without having to refresh the page.
        const productsRes = await fetch("http://localhost:5000/api/products");
        const updatedProducts = await productsRes.json();
        setProducts(updatedProducts);
        
        return { success: true, message: "Review submitted successfully!" };
      } else {
        return { success: false, message: data.message || "Failed to submit review." };
      }
    } catch (err) {
      console.error("Review Submission Error:", err);
      return { success: false, message: "Connection error. Please try again." };
    }
  };

  // 2. UPDATE REVIEW (NEW)
  const updateReview = async ({ productId, reviewId, rating, comment }) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, message: "Please log in to update." };

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({ rating: Number(rating), comment })
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic UI Update: Instantly change the text/stars on the screen
        setProducts(prev => prev.map(p => {
          if (String(p._id) === String(productId)) {
            const updatedReviews = p.reviews.map(r => 
              String(r._id) === String(reviewId) ? { ...r, rating: Number(rating), comment } : r
            );
            const newRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
            return { ...p, reviews: updatedReviews, rating: newRating };
          }
          return p;
        }));
        return { success: true, message: "Review updated successfully!" };
      } else {
        return { success: false, message: data.message || "Failed to update review." };
      }
    } catch (err) {
      console.error("Update Error:", err);
      return { success: false, message: "Connection error. Please try again." };
    }
  };

  // 3. DELETE REVIEW (NEW)
  const deleteReview = async (productId, reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, message: "Please log in to delete." };

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token.trim()}`
        }
      });

      if (response.ok) {
        // Optimistic UI Update: Instantly remove the review from the screen and recalculate the average
        setProducts(prev => prev.map(p => {
          if (String(p._id) === String(productId)) {
            const filteredReviews = p.reviews.filter(r => String(r._id) !== String(reviewId));
            const newNumReviews = filteredReviews.length;
            const newRating = newNumReviews > 0 ? filteredReviews.reduce((acc, r) => acc + r.rating, 0) / newNumReviews : 0;
            return { ...p, reviews: filteredReviews, rating: newRating, numReviews: newNumReviews };
          }
          return p;
        }));
        return { success: true, message: "Review deleted." };
      }
      return { success: false, message: "Failed to delete review." };
    } catch (err) {
      console.error("Delete Error:", err);
      return { success: false, message: "Connection error. Please try again." };
    }
  };

  /**
   * Calculates the 1-5 star distribution for the progress bars
   */
  const getRatingDistribution = (productId) => {
    const product = products.find(p => String(p._id) === String(productId));
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    if (product && product.reviews) {
      product.reviews.forEach(rev => {
        const r = Math.round(rev.rating);
        if (distribution[r] !== undefined) distribution[r]++;
      });
    }
    return distribution;
  };

  /**
   * Get Average Rating and Total Count (Cached from DB)
   */
  const getProductStats = (productId) => {
    const product = products.find(p => String(p._id) === String(productId));
    return {
      average: product?.rating?.toFixed(1) || "0.0",
      total: product?.numReviews || 0,
      reviews: product?.reviews || []
    };
  };

  return (
    <ReviewContext.Provider
      value={{
        addReview,
        updateReview,  // Added to context
        deleteReview,  // Added to context
        getProductStats,
        getRatingDistribution,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}