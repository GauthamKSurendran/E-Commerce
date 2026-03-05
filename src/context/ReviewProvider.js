import React, { createContext, useContext } from "react";
import { ProductContext } from "./ProductProvider";

export const ReviewContext = createContext();

/**
 * Backend-Integrated Review Provider
 * Now optimized to utilize pre-calculated database stats and handle API errors
 */
export default function ReviewProvider({ children }) {
  const { products, setProducts } = useContext(ProductContext);

  /**
   * Add a review to MongoDB and handle spam/duplicate errors
   */
  const addReview = async (reviewData) => {
    // We no longer need to pass userName from the frontend; the backend securely extracts it from the token
    const { productId, rating, comment } = reviewData;
    const token = localStorage.getItem("token");

    if (!token) return { success: false, message: "Please log in to leave a review." };

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ rating: Number(rating), comment }) 
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic UI Update: Instantly update the local state so the user sees their review
        // without needing to refresh the entire page.
        setProducts(prev => prev.map(p => {
          if (p._id === productId) {
            const newReviews = [...(p.reviews || []), { rating: Number(rating), comment, createdAt: new Date() }];
            const newNumReviews = newReviews.length;
            const newRating = newReviews.reduce((acc, r) => acc + r.rating, 0) / newNumReviews;
            
            return { 
                ...p, 
                reviews: newReviews, 
                rating: newRating, 
                numReviews: newNumReviews 
            };
          }
          return p;
        }));
        
        // Return an object instead of a boolean so the UI can display the success message
        return { success: true, message: data.message };
      } else {
        // This catches our backend spam-protection (e.g., "You have already reviewed this product.")
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Review Submission Error:", err);
      return { success: false, message: "Connection error. Please try again." };
    }
  };

  /**
   * Get all reviews for a specific product
   */
  const getProductReviews = (productId) => {
    const product = products.find(p => String(p._id) === String(productId));
    return product?.reviews || [];
  };

  /**
   * Get Average Rating (Vastly improved performance)
   * Instead of doing heavy math on the frontend, we now just grab the cached DB value
   */
  const getAverageRating = (productId) => {
    const product = products.find(p => String(p._id) === String(productId));
    // Fallback to 0 if the product has no rating yet
    return product?.rating?.toFixed(1) || 0;
  };

  /**
   * Delete a review (Admin feature)
   */
  const deleteReview = async (productId, reviewId) => {
    // Placeholder for future Admin integration
    console.log(`Deleting review ${reviewId} from product ${productId}`);
  };

  return (
    <ReviewContext.Provider
      value={{
        addReview,
        getProductReviews,
        getAverageRating,
        deleteReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}