import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { OrderContext } from "../context/OrderProvider";

/**
 * Professional Order History Dashboard
 * Features: Timeline tracking, 7-day return window, and minimalist logistics UI.
 */
export default function OrderHistory() {
  const { user } = useContext(AuthContext) || {};
  const { orders, fetchOrders, requestReturn, cancelOrder } = useContext(OrderContext);
  
  const [loading, setLoading] = useState(true);

  // 1. SYNC DATA
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

  // HELPER: ESTIMATE 3-DAY DELIVERY
  const getDeliveryDate = (createdAt) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  // CHECK IF WITHIN 7-DAY RETURN WINDOW
  const canReturn = (order) => {
    if (order.status !== 'Delivered') return false;
    // Fallback to updatedAt if deliveredAt isn't explicitly set in your DB
    const deliveredDate = new Date(order.deliveredAt || order.updatedAt);
    const diffTime = Math.abs(new Date() - deliveredDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const handleUserAction = async (orderId, action) => {
    const confirmMessage = action === 'cancel' 
        ? "Cancel this order? This action cannot be undone." 
        : "Request a return for this order?";
        
    if (window.confirm(confirmMessage)) {
        try {
            let result;
            if (action === 'return') {
                const reason = window.prompt("Reason for return (e.g., Wrong size, Damaged):");
                if (!reason) return; 
                result = await requestReturn(orderId, reason);
            } else {
                result = await cancelOrder(orderId);
            }

            if (result && result.success) {
                alert(`SUCCESS: ${result.message}`);
                // Refresh is handled by Context update usually, but safe to fetch again
                fetchOrders();
            } else {
                alert(`NOTICE: ${result?.message || "Action failed. Check console for details."}`);
            }
        } catch (error) {
            console.error(`Error processing ${action}:`, error);
            alert("NOTICE: Connection error.");
        }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success';
      case 'Return Requested': return 'bg-info text-white';
      case 'Refunded': return 'bg-secondary';
      case 'Shipped': return 'bg-primary';
      case 'Packed': return 'bg-dark';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  };

  if (loading) return (
    <div className="container py-5 mt-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <div className="spinner-border text-dark mb-3" role="status"></div>
      <p className="fw-black ls-1 extra-small">RETRIEVING LEDGER...</p>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="container pt-5">
        <h2 className="fw-black text-uppercase ls-2 mb-5">Order History</h2>
        
        {!user ? (
          <div className="card border-0 p-5 text-center shadow-sm rounded-0">
            <h4 className="fw-black ls-1">PLEASE LOGIN TO VIEW HISTORY</h4>
          </div>
        ) : orders.length === 0 ? (
          <div className="card border-0 p-5 text-center shadow-sm rounded-0 bg-white">
            <i className="bi bi-bag-x fs-1 text-muted mb-3"></i>
            <h5 className="fw-bold text-muted">NO ORDERS FOUND</h5>
            <p className="extra-small fw-bold text-uppercase ls-1">Your wardrobe awaits its first selection.</p>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => (
              <div key={order._id} className="col-12">
                <div className="card border-0 shadow-sm rounded-0 overflow-hidden mb-2">
                  
                  {/* HEADER: TRACKING ID */}
                  <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="extra-small fw-black text-muted text-uppercase ls-1">Reference:</span>
                      <span className="font-monospace ms-2 fw-bold text-primary small">
                        #{order._id.substring(order._id.length - 12).toUpperCase()}
                      </span>
                    </div>
                    <span className={`badge rounded-0 px-3 py-2 extra-small fw-black ls-1 ${getStatusBadgeClass(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* LOGISTICS BAR */}
                  {!['Cancelled', 'Refunded'].includes(order.status) && (
                    <div className="bg-light border-bottom px-4 py-2 d-flex justify-content-between">
                      <div className="extra-small fw-bold text-uppercase ls-1">
                        <i className="bi bi-truck me-2"></i>
                        {order.status === 'Delivered' ? 'Delivery Completed' : 'Estimated Arrival'}: 
                        <span className="text-primary ms-1">{getDeliveryDate(order.createdAt)}</span>
                      </div>
                      <div className="extra-small text-muted fw-bold ls-1">STANDARD LOGISTICS</div>
                    </div>
                  )}

                  <div className="card-body p-4">
                    <div className="row g-4">
                      {/* PRODUCT LIST */}
                      <div className="col-md-8">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="d-flex align-items-center mb-3 pb-3 border-bottom border-light">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="bg-light"
                              style={{ width: "70px", height: "90px", objectFit: "cover" }} 
                              onError={(e) => e.target.src="https://via.placeholder.com/70x90?text=No+Img"}
                            />
                            <div className="ms-3">
                              <p className="mb-1 fw-black text-uppercase small ls-1">{item.name}</p>
                              <p className="text-muted extra-small fw-bold mb-0 text-uppercase ls-1">
                                Size: {item.size} | Qty: {item.quantity} | Unit Price: ₹{item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ACTIONS & TOTALS */}
                      <div className="col-md-4 border-start text-end d-flex flex-column justify-content-center">
                        <p className="extra-small fw-black text-muted text-uppercase ls-1 mb-1">Total Amount</p>
                        <h3 className="fw-black mb-4">₹{order.amount.toLocaleString()}</h3>
                        
                        {/* Cancel Logic */}
                        {!user?.isAdmin && ['Pending', 'Packed'].includes(order.status) && (
                          <button 
                            className="btn btn-dark w-100 rounded-0 fw-black extra-small ls-1 py-2 mb-2"
                            onClick={() => handleUserAction(order._id, 'cancel')}
                          >
                            CANCEL SHIPMENT
                          </button>
                        )}
                        
                        {/* Return Logic */}
                        {!user?.isAdmin && order.status === 'Delivered' && (
                          canReturn(order) ? (
                            <button 
                              className="btn btn-outline-dark w-100 rounded-0 fw-black extra-small ls-1 py-2"
                              onClick={() => handleUserAction(order._id, 'return')}
                            >
                              REQUEST RETURN
                            </button>
                          ) : (
                            <div className="bg-light p-2 border text-center">
                              <p className="extra-small fw-black text-muted mb-0 ls-1">RETURN WINDOW CLOSED</p>
                            </div>
                          )
                        )}

                        {order.status === 'Return Requested' && (
                          <div className="bg-info bg-opacity-10 border border-info p-2 text-center">
                            <p className="text-info extra-small fw-black mb-0 ls-1">PENDING VERIFICATION</p>
                          </div>
                        )}

                        {order.status === 'Cancelled' && (
                          <div className="bg-danger bg-opacity-10 border border-danger p-2 text-center">
                            <p className="text-danger extra-small fw-black mb-0 ls-1">TRANSACTION VOIDED</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}