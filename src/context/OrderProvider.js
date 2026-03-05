import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const OrderContext = createContext();

/**
 * Backend-Integrated Order Provider
 * Manages real-time transaction data from MongoDB for FASHION.CO
 */
export default function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext) || {};

  /**
   * 1. FETCH ORDERS (Role-Based)
   * Admin: Fetches all orders for the Command Center
   * User: Fetches only their specific order history
   */
  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Determine endpoint based on isAdmin flag from MongoDB User document
      const endpoint = user?.isAdmin ? "/api/admin/orders" : "/api/orders/myorders";
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    }
  }, [user]);

  // Sync data whenever the user session changes or on initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * RS7: Place a new order in MongoDB
   * Sends order details to the POST /api/orders endpoint
   */
  const addOrder = async (orderData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (response.ok) {
        // Optimistic UI update: prepend the new order to the list
        setOrders(prev => [data, ...prev]);
        return data._id; // Returns the MongoDB ObjectId
      }
    } catch (err) {
      console.error("Order Placement Error:", err);
    }
    return null;
  };

  /**
   * RS12: Admin updates order status
   * Triggers status changes (Packed, Shipped, Delivered, Refunded) in MongoDB
   */
  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        // Update local state to reflect the status change without a full refresh
        setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        return true;
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
    return false;
  };

  /**
   * RS18: Return & Refund Logic
   * Updates status to "Return Requested" and records the reason
   */
  const requestReturn = async (orderId, reason) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Return Requested", returnReason: reason })
      });
      if (response.ok) {
        await fetchOrders(); // Full refresh to ensure consistency
        return true;
      }
    } catch (err) {
      console.error("Return Request Error:", err);
    }
    return false;
  };

  /**
   * RS8: Filtered View for Customers
   * Allows searching for local state orders by email (case-insensitive)
   */
  const getUserOrders = useCallback((userEmail) => {
    if (!userEmail) return [];
    return orders.filter(o => o.userEmail?.toLowerCase() === userEmail.toLowerCase());
  }, [orders]);

  return (
    <OrderContext.Provider value={{ 
      orders,             // Full array for AdminDashboard
      fetchOrders,        // Function to manually refresh data
      getUserOrders,      // Helper for OrderHistory page
      addOrder, 
      updateOrderStatus,  // Handler for Admin dropdowns
      requestReturn
    }}>
      {children}
    </OrderContext.Provider>
  );
}