import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { OrderContext } from '../context/OrderProvider';
import AdminNavbar from './AdminNavbar'; 

/**
 * Backend-Integrated Admin Orders & Revenue Intelligence
 * Features: Live Financial Tracking and Multi-Directional Date Sorting
 */
const AdminOrders = () => {
  const { orders, fetchOrders, updateOrderStatus } = useContext(OrderContext);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first

  // 1. DATA SYNCHRONIZATION
  const loadInitialData = useCallback(async () => {
    await fetchOrders();
    setLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); 

  // 2. REVENUE INTELLIGENCE CALCULATIONS
  // Calculates live financial metrics from MongoDB Order History
  const revenueStats = useMemo(() => {
    return orders.reduce((acc, order) => {
      const amount = Number(order.amount) || 0;
      // Do not add Cancelled or Refunded to Gross Revenue
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

  // Helper for dynamic badge colors
  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success';
      case 'Shipped': return 'bg-primary';
      case 'Packed': return 'bg-info text-dark';
      case 'Return Requested': return 'bg-warning text-dark'; 
      case 'Refunded': return 'bg-secondary';       
      case 'Cancelled': return 'bg-danger'; 
      case 'Pending': return 'bg-dark text-white';
      default: return 'bg-secondary text-white';
    }
  };

  // 4. FULFILLMENT LOGIC (Backend Integrated)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      
      // CRITICAL FIX: Accepts BOTH a boolean (true) AND an object ({ success: true })
      if (result === true || (result && result.success)) {
        // Optional: Alert the admin on success
        // alert(`Order updated to ${newStatus.toUpperCase()} successfully.`);
      } else {
        alert("Failed to update status. Please check your connection.");
      }
    } catch (err) {
      console.error("Status Update Failed:", err);
      alert("A network error occurred while updating the status.");
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <AdminNavbar /> 
      
      <div className="container py-4 animate-in">
        {/* REVENUE INTELLIGENCE SUMMARY BAR */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-dark text-white p-3 rounded-0">
              <p className="extra-small fw-black ls-2 text-uppercase opacity-75 mb-1">Gross Revenue</p>
              <h4 className="fw-black mb-0">₹{revenueStats.total.toLocaleString()}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-success text-white p-3 rounded-0">
              <p className="extra-small fw-black ls-2 text-uppercase opacity-75 mb-1">Collected</p>
              <h4 className="fw-black mb-0">₹{revenueStats.collected.toLocaleString()}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-primary text-white p-3 rounded-0">
              <p className="extra-small fw-black ls-2 text-uppercase opacity-75 mb-1">Processing</p>
              <h4 className="fw-black mb-0">₹{revenueStats.processing.toLocaleString()}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm bg-secondary text-white p-3 rounded-0">
              <p className="extra-small fw-black ls-2 text-uppercase opacity-75 mb-1">Refunded</p>
              <h4 className="fw-black mb-0">₹{revenueStats.refunded.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* LOG HEADER & SORTING TOGGLE */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="border-start border-4 border-dark ps-3">
            <h2 className="fw-black m-0 text-uppercase ls-1">Live Order Management</h2>
            <p className="extra-small text-muted mb-0 fw-bold uppercase">Trace every transaction back to source</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-outline-dark rounded-0 fw-bold extra-small"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              SORT BY DATE: {sortOrder === 'desc' ? 'NEWEST FIRST' : 'OLDEST FIRST'}
            </button>
            <span className="badge bg-dark rounded-0 px-4 py-3 fw-bold ls-1 shadow-sm">
              ACTIVE ORDERS: {orders.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 border bg-white shadow-sm rounded-0">
            <h4 className="fw-black text-uppercase mt-3">No active orders found in MongoDB</h4>
          </div>
        ) : (
          <div className="table-responsive bg-white shadow-sm border border-dark rounded-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark extra-small text-uppercase ls-2">
                <tr>
                  <th className="py-3 ps-3">Order Log</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Items Details</th>
                  <th className="py-3">Revenue Contribution</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-center pe-3">Update</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="ps-3">
                      <div className="extra-small font-monospace fw-bold text-primary">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                      <div className="extra-small text-muted fw-bold">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="extra-small fw-black text-uppercase">{order.userName || "Guest"}</div>
                      <div className="extra-small text-muted fw-bold">{order.userEmail}</div>
                    </td>
                    <td>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="extra-small text-muted fw-bold">
                          {item.name} <span className="text-dark">(x{item.quantity})</span>
                        </div>
                      ))}
                    </td>
                    <td className="fw-black text-dark">
                      ₹{order.amount?.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge rounded-0 w-100 py-2 extra-small fw-black ls-1 ${getStatusClass(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      
                      {order.status === 'Return Requested' && order.returnReason && (
                          <div className="mt-2 extra-small text-danger fw-bold border-top pt-1">
                              Reason: {order.returnReason}
                          </div>
                      )}
                    </td>
                    <td className="pe-3">
                      <select 
                        className="form-select form-select-sm rounded-0 border-dark shadow-none fw-black"
                        style={{ fontSize: '10px' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={['Cancelled', 'Refunded'].includes(order.status)}
                      >
                        <option value="Pending">PENDING</option>
                        <option value="Packed">PACKED</option>
                        <option value="Shipped">SHIPPED</option>
                        <option value="Delivered">DELIVERED</option>
                        <option value="Return Requested" disabled>RETURN REQ</option>
                        <option value="Refunded">REFUND (Approve Return)</option>
                        <option value="Cancelled" disabled>CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;