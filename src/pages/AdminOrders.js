import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; // NEW: Imported Link for the simple navigation
import { OrderContext } from '../context/OrderProvider';

/**
 * Modern Admin Orders & Revenue Intelligence
 * Features: Live Financial Tracking, SaaS-style UI, Unified Status Badges, Minimal Navigation
 */
const AdminOrders = () => {
  const { orders, fetchOrders, updateOrderStatus } = useContext(OrderContext);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); 

  // 1. DATA SYNCHRONIZATION
  const loadInitialData = useCallback(async () => {
    await fetchOrders();
    setLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); 

  // 2. REVENUE INTELLIGENCE CALCULATIONS
  const revenueStats = useMemo(() => {
    return orders.reduce((acc, order) => {
      const amount = Number(order.amount) || 0;
      if (!['Cancelled', 'Refunded'].includes(order.status)) {
          acc.total += amount;
      }
      
      if (order.status === 'Delivered') {
        acc.collected += amount;
      } else if (['Pending', 'Packed', 'Shipped'].includes(order.status)) {
        acc.processing += amount;
      } else if (order.status === 'Refunded') {
        acc.refunded += amount;
      }
      return acc;
    }, { total: 0, collected: 0, processing: 0, refunded: 0 });
  }, [orders]);

  // 3. DATE SORTING LOGIC
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [orders, sortOrder]);

  // 4. UNIFIED STATUS BADGES
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success text-white';
      case 'Refunded': return 'bg-secondary text-white';
      case 'Pending': return 'bg-warning text-dark';
      case 'Shipped': return 'bg-primary text-white';
      case 'Cancelled': return 'bg-danger text-white';
      case 'Return Requested': return 'bg-info text-dark';
      case 'Packed': return 'bg-dark text-white';
      default: return 'bg-light text-dark border';
    }
  };

  // 5. FULFILLMENT LOGIC
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result === true || (result && result.success)) {
        // Success silently updates
      } else {
        alert("Failed to update status. Please check your connection.");
      }
    } catch (err) {
      console.error("Status Update Failed:", err);
      alert("A network error occurred while updating the status.");
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="container animate-in" style={{ paddingTop: '50px' }}>
        
        {/* SIMPLE NAVIGATION LINK */}
        <Link to="/admin/dashboard" className="text-decoration-none text-muted small fw-bold mb-4 d-inline-block ls-1">
          &larr; BACK TO COMMAND CENTER
        </Link>
        
        {/* REVENUE INTELLIGENCE SUMMARY BAR */}
        <div className="row g-4 mb-5">
          {/* Gross Revenue */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Gross Revenue</p>
                  <h4 className="fw-black mb-0">₹{revenueStats.total.toLocaleString()}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-wallet2 fs-4"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Collected */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Collected</p>
                  <h4 className="fw-black text-success mb-0">₹{revenueStats.collected.toLocaleString()}</h4>
                </div>
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-check-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Processing */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Processing</p>
                  <h4 className="fw-black text-warning mb-0">₹{revenueStats.processing.toLocaleString()}</h4>
                </div>
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-hourglass-split fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Refunded */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Refunded</p>
                  <h4 className="fw-black text-secondary mb-0">₹{revenueStats.refunded.toLocaleString()}</h4>
                </div>
                <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-arrow-return-left fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOG HEADER & SORTING TOGGLE */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <h2 className="fw-black m-0 text-uppercase ls-1">Live Order Management</h2>
            <p className="extra-small text-muted mb-0 fw-bold uppercase">Trace every transaction back to source</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button 
              className="btn btn-outline-dark rounded-3 fw-bold px-4 d-flex align-items-center text-uppercase shadow-sm"
              style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <i className={`bi bi-sort-${sortOrder === 'desc' ? 'down' : 'up'} me-2 fs-6`}></i> 
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
            <span className="badge bg-dark rounded-3 px-4 py-2 d-flex align-items-center fw-bold ls-1 shadow-sm">
              ACTIVE: {orders.length}
            </span>
          </div>
        </div>

        {/* MODERN TABLE WRAPPER */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
              <h5 className="fw-black text-uppercase">No active orders found</h5>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4 py-3 fw-bold border-bottom-0">Order Log</th>
                    <th className="py-3 fw-bold border-bottom-0">Customer</th>
                    <th className="py-3 fw-bold border-bottom-0">Items Details</th>
                    <th className="py-3 fw-bold border-bottom-0">Total</th>
                    <th className="py-3 fw-bold border-bottom-0">Status</th>
                    <th className="pe-4 py-3 fw-bold border-bottom-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="ps-4 py-3">
                        <div className="font-monospace fw-bold text-primary" style={{ fontSize: '0.85rem' }}>
                          #{order._id.substring(order._id.length - 8).toUpperCase()}
                        </div>
                        <div className="extra-small text-muted fw-bold mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="extra-small fw-black text-uppercase text-dark">{order.userName || "Guest"}</div>
                        <div className="extra-small text-muted fw-bold">{order.userEmail}</div>
                      </td>
                      <td className="py-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="extra-small text-muted fw-bold">
                            {item.name} <span className="text-dark">(x{item.quantity})</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 fw-black text-dark">
                        ₹{order.amount?.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`badge px-3 py-2 rounded-pill fw-bold text-uppercase ${getStatusBadge(order.status)}`} style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                          {order.status === 'Pending' && <span className="spinner-grow spinner-grow-sm me-2" style={{width: '0.5rem', height: '0.5rem'}} role="status"></span>}
                          {order.status}
                        </span>
                        
                        {order.status === 'Return Requested' && order.returnReason && (
                            <div className="mt-2 extra-small text-danger fw-bold border-top border-danger pt-1" style={{ maxWidth: '150px', whiteSpace: 'normal' }}>
                              Reason: {order.returnReason}
                            </div>
                        )}
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <select 
                          className="form-select form-select-sm rounded-3 fw-bold extra-small border-dark border-opacity-25 shadow-none d-inline-block"
                          style={{ width: '130px', cursor: 'pointer' }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={['Cancelled', 'Refunded'].includes(order.status)}
                        >
                          <option value="Pending">PENDING</option>
                          <option value="Packed">PACKED</option>
                          <option value="Shipped">SHIPPED</option>
                          <option value="Delivered">DELIVERED</option>
                          <option value="Return Requested" disabled>RETURN REQ</option>
                          <option value="Refunded">REFUND</option>
                          <option value="Cancelled" disabled>CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;