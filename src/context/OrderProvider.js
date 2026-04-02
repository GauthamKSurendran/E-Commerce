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
      // Determine endpoint based on isAdmin flag
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
   * 2. ADD ORDER
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
        // Optimistic UI update
        setOrders(prev => [data, ...prev]);
        return data._id; 
      }
    } catch (err) {
      console.error("Order Placement Error:", err);
    }
    return null;
  };

  /**
   * 3. ADMIN: UPDATE ORDER STATUS
   * Hits the Admin-only endpoint to update logistics status
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
        setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        return true;
      }
    } catch (err) {
      console.error("Status Update Error:", err);
    }
    return false;
  };

  /**
   * 4. USER: CANCEL ORDER
   * Uses the user action endpoint to bypass 403 Forbidden errors
   */
  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'cancel' }), 
      });

      const data = await response.json();

      if (response.ok) {
        await fetchOrders(); 
        return { success: true, message: "Order cancelled successfully." };
      } else {
        return { success: false, message: data.message || "Failed to cancel order." };
      }
    } catch (error) {
      console.error("Cancel Order Error:", error);
      return { success: false, message: "Network error occurred." };
    }
  };

  /**
   * 5. USER: REQUEST RETURN
   * Uses the user action endpoint to bypass 403 Forbidden errors
   */
  const requestReturn = async (orderId, reason) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'return', reason: reason }), 
      });

      const data = await response.json();

      if (response.ok) {
        await fetchOrders(); 
        return { success: true, message: "Return requested successfully." };
      } else {
        return { success: false, message: data.message || "Failed to request return." };
      }
    } catch (error) {
      console.error("Return Request Error:", error);
      return { success: false, message: "Network error occurred." };
    }
  };

  /**
   * 6. HELPER: GET USER ORDERS
   * Allows searching for local state orders by email
   */
  const getUserOrders = useCallback((userEmail) => {
    if (!userEmail) return [];
    return orders.filter(o => o.userEmail?.toLowerCase() === userEmail.toLowerCase());
  }, [orders]);

  return (
    <OrderContext.Provider value={{ 
      orders,             // Full array for AdminDashboard / User Dashboard
      fetchOrders,        // Function to manually refresh data
      getUserOrders,      // Helper for OrderHistory page
      addOrder, 
      updateOrderStatus,  // Handler for Admin dropdowns
      cancelOrder,        // Handler for User Cancellation
      requestReturn       // Handler for User Returns
    }}>
      {children}
    </OrderContext.Provider>
  );
}