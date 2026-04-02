import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { OrderContext } from "../context/OrderProvider"; 

/**
 * Modern Admin Command Center
 * Features: SaaS-style layout, icon metrics, dynamic routing, recent order preview
 */
export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // We keep the contexts just in case other parts of the app rely on the global sync here,
  // but we fetch specific admin metrics directly from the backend for speed.
  const { fetchOrders } = useContext(OrderContext) || {};

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch Recent Orders
        const ordersRes = await fetch('http://localhost:5000/api/admin/orders', { headers });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.slice(0, 5)); // Only show the 5 most recent
        }
        
        // Sync global order state in the background
        if (fetchOrders) {
           fetchOrders();
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success text-white';
      case 'Refunded': return 'bg-secondary text-white';
      case 'Pending': return 'bg-warning text-dark';
      case 'Shipped': return 'bg-primary text-white';
      case 'Cancelled': return 'bg-danger text-white';
      case 'Return Requested': return 'bg-info text-dark';
      default: return 'bg-dark text-white';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-dark mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h5 className="fw-bold text-muted uppercase ls-1">Loading Dashboard...</h5>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5" style={{ paddingTop: '100px' }}>
      <div className="container">
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom border-dark border-opacity-10">
          <div>
            <h2 className="fw-black text-uppercase ls-1 mb-1">Command Center</h2>
            <p className="text-muted small fw-bold mb-0">Welcome back, {user?.name || 'System Admin'}</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <Link to="/" className="btn btn-outline-dark fw-bold px-4 rounded-3 shadow-sm text-uppercase" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-shop me-2"></i> View Storefront
            </Link>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="row g-4 mb-5">
          {/* Revenue Card */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Total Revenue</p>
                    <h3 className="fw-black text-success mb-0">₹{stats.totalRevenue?.toLocaleString()}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-wallet2 fs-4"></i>
                  </div>
                </div>
                {/* ISOLATED REVENUE LINK */}
                <Link to="/admin/revenue" className="text-decoration-none fw-bold small text-success d-flex align-items-center">
                  View Transactions <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Active Orders</p>
                    <h3 className="fw-black mb-0">{stats.totalOrders}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-box-seam fs-4"></i>
                  </div>
                </div>
                <Link to="/admin/orders" className="text-decoration-none fw-bold small text-primary d-flex align-items-center">
                  Manage Orders <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Product Catalog</p>
                    <h3 className="fw-black mb-0">{stats.totalProducts}</h3>
                  </div>
                  <div className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-tags fs-4"></i>
                  </div>
                </div>
                <Link to="/admin/products" className="text-decoration-none fw-bold small text-dark d-flex align-items-center">
                  Inventory Manager <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <p className="text-muted fw-bold extra-small text-uppercase ls-1 mb-1">Registered Users</p>
                    <h3 className="fw-black mb-0">{stats.totalUsers}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-people fs-4 text-dark"></i>
                  </div>
                </div>
                <Link to="/admin/users" className="text-decoration-none fw-bold small text-info text-dark d-flex align-items-center">
                  User Analytics <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS TABLE SECTION */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-black text-uppercase ls-1 mb-0">Recent Customer Orders</h5>
            <Link to="/admin/orders" className="btn btn-dark btn-sm fw-bold px-3 rounded-3 text-uppercase" style={{ fontSize: '0.75rem' }}>
              Manage All Orders
            </Link>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4 py-3 fw-bold border-bottom-0">Order ID & Date</th>
                    <th className="py-3 fw-bold border-bottom-0">Customer</th>
                    <th className="py-3 fw-bold border-bottom-0">Amount</th>
                    <th className="py-3 pe-4 fw-bold border-bottom-0 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">No orders found.</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => window.location.href='/admin/orders'}>
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-primary font-monospace" style={{ fontSize: '0.85rem' }}>
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </div>
                          <div className="text-muted extra-small">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold text-dark text-uppercase" style={{ fontSize: '0.85rem' }}>{order.userName || 'Guest'}</div>
                          <div className="text-muted extra-small">{order.userEmail}</div>
                        </td>
                        <td className="py-3 fw-black text-dark">
                          ₹{order.amount.toLocaleString()}
                        </td>
                        <td className="py-3 pe-4 text-end">
                          <span className={`badge px-3 py-2 rounded-pill fw-bold text-uppercase ${getStatusBadge(order.status)}`} style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            {order.status}
                          </span>
                           {/* Show Return Reason if applicable */}
                           {order.status === 'Return Requested' && order.returnReason && (
                              <div className="mt-1 extra-small text-danger fw-bold text-end">
                                Reason: {order.returnReason}
                              </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}