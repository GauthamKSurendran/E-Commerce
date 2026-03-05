import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { OrderContext } from "../context/OrderProvider"; // NEW: Import the OrderContext

/**
 * Integrated Order History Component
 * Features: Real-time Order Tracking, 7-Day Return Policy, Pre-Shipment Cancellation, and Fallback Image Handling
 */
export default function OrderHistory() {
  const { user } = useContext(AuthContext) || {};
  // NEW: Consume global state and actions instead of manual fetching
  const { orders, fetchOrders, requestReturn, cancelOrder } = useContext(OrderContext);
  
  const [loading, setLoading] = useState(true);

  // 1. SYNC ORDERS ON LOAD
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user) {
        await fetchOrders();
      }
      setLoading(false);
    };
    loadData();
  }, [user, fetchOrders]);

  // 2. HANDLE CANCEL & RETURN REQUESTS VIA CONTEXT
  const handleUserAction = async (orderId, action) => {
    const confirmMessage = action === 'cancel' 
        ? "Are you sure you want to cancel this order? This cannot be undone." 
        : "Are you sure you want to request a return for this item?";
        
    if (window.confirm(confirmMessage)) {
        try {
            let result;

            if (action === 'return') {
                const reason = window.prompt("Please briefly explain the reason for the return (e.g., Wrong size, Damaged):");
                if (reason === null) return; // User cancelled the prompt
                
                // Call context function
                result = await requestReturn(orderId, reason);
            } else {
                // Call context function
                result = await cancelOrder(orderId);
            }

            // Provide user feedback based on the structured return object from the context
            if (result && result.success) {
                alert(`Success: ${result.message}`);
            } else {
                alert(`Notice: ${result?.message || "Action failed."}`);
            }
        } catch (error) {
            console.error(`Failed to process ${action}:`, error);
            alert("Network error occurred. Please try again.");
        }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success';
      case 'Return Requested': return 'bg-info text-dark';
      case 'Refunded': return 'bg-secondary';
      case 'Shipped': return 'bg-primary';
      case 'Packed': return 'bg-dark text-white';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  };

  return (
    <div className="container py-5 mt-5">
      <h2 className="fw-black mb-5 text-uppercase ls-2">Your Order History</h2>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status"></div>
          <p className="mt-2 text-muted small fw-bold">RETRIEVING TRANSACTIONS...</p>
        </div>
      ) : !user ? (
        <div className="text-center py-5 border bg-light">
          <p className="lead text-muted">Please login to view your orders.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 border bg-light rounded-0">
          <p className="lead text-muted">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order._id} className="card border-0 shadow-sm rounded-0 mb-4 overflow-hidden">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <span className="text-muted extra-small fw-bold text-uppercase ls-1">Order ID:</span>
                  <span className="font-monospace small ms-2 fw-bold text-primary">
                    #{order._id.substring(order._id.length - 12).toUpperCase()}
                  </span>
                </div>
                <span className={`badge rounded-0 px-3 py-2 extra-small fw-bold ${getStatusBadgeClass(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-8">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center mb-3">
                        
                        {/* FALLBACK IMAGE HANDLER */}
                        <img 
                          src={item.image || "https://via.placeholder.com/60x70?text=No+Image"} 
                          alt={item.name} 
                          className="border"
                          style={{ width: "60px", height: "70px", objectFit: "cover" }} 
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://via.placeholder.com/60x70?text=No+Image";
                          }}
                        />
                        
                        <div className="ms-3">
                          <p className="mb-0 fw-bold small text-uppercase">{item.name}</p>
                          <p className="text-muted extra-small mb-0 ls-1">
                            QTY: {item.quantity} | SIZE: {item.size || 'N/A'} | PRICE: ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-md-4 border-start text-end">
                    <p className="text-muted extra-small fw-bold mb-1 text-uppercase">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <h4 className="fw-black mb-3">TOTAL: ₹{order.amount.toLocaleString()}</h4>
                    
                    {/* CANCEL CONDITION: Pre-shipment */}
                    {['Pending', 'Packed'].includes(order.status) && (
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-0 fw-bold extra-small px-3 ls-1 mb-2 w-100"
                        onClick={() => handleUserAction(order._id, 'cancel')}
                      >
                        CANCEL ORDER
                      </button>
                    )}
                    
                    {/* RETURN CONDITION: 7-Day Window after Delivery */}
                    {order.status === 'Delivered' && (
                      (order.deliveredAt && (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24) <= 7) ? (
                        <button 
                          className="btn btn-outline-warning text-dark btn-sm rounded-0 fw-bold extra-small px-3 ls-1 mb-2 w-100"
                          onClick={() => handleUserAction(order._id, 'return')}
                        >
                          REQUEST RETURN
                        </button>
                      ) : (
                        <div className="p-2 bg-light border text-center mt-2">
                           <p className="text-muted extra-small fw-bold mb-0 ls-1">RETURN WINDOW CLOSED</p>
                        </div>
                      )
                    )}

                    {/* STATUS FEEDBACK */}
                    {order.status === 'Return Requested' && (
                      <div className="p-2 bg-light border text-center mt-2">
                        <p className="text-info extra-small fw-bold mb-0 ls-1">RETURN PENDING APPROVAL</p>
                      </div>
                    )}
                    {order.status === 'Cancelled' && (
                      <div className="p-2 bg-light border text-center mt-2 border-danger">
                        <p className="text-danger extra-small fw-bold mb-0 ls-1">ORDER CANCELLED</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}