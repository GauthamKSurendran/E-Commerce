import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { ProductContext } from "../context/ProductProvider";
import { OrderContext } from "../context/OrderProvider"; 
import { AuthContext } from "../context/AuthContext";    

/**
 * Backend-Integrated Admin Dashboard for FASHION.CO
 * Updated: Made "Recent Orders" table read-only and limited to top 5 recent orders.
 */
function AdminDashboard() { 
  const productContext = useContext(ProductContext) || {};
  // REMOVED: updateOrderStatus is no longer needed here
  const { orders = [], fetchOrders } = useContext(OrderContext) || {};
  const { user } = useContext(AuthContext) || {}; 

  const products = productContext.products || [];

  const [totalUserCount, setTotalUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. BACKEND STATS SYNCHRONIZATION
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (fetchOrders) {
          await fetchOrders();
        }

        const response = await fetch("http://localhost:5000/api/admin/users", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
          setTotalUserCount(data.length);
        }
      } catch (err) {
        console.error("Backend stats connection failed.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [fetchOrders]);

  // 2. ANALYTICS CALCULATIONS
  const totalOrders = orders.length;
  const totalProducts = products.length;
  
  const totalRevenue = orders.reduce((sum, order) => {
    // Only count revenue for orders that haven't been cancelled or refunded
    return !['Refunded', 'Cancelled'].includes(order.status) ? sum + (Number(order.amount) || 0) : sum;
  }, 0);

  // 3. RECENT ORDERS LIMITER (Only grabs the 5 most recent)
  const recentOrders = [...orders].reverse().slice(0, 5);

  return (
    <div className="container mt-5 pt-4 animate-in">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="border-start border-4 border-dark ps-3">
          <h2 className="fw-black mb-0 text-uppercase ls-1">Admin Command Center</h2>
          <p className="text-muted small mb-0 fw-bold uppercase">Real-time store metrics and management</p>
        </div>
        <div className="text-end">
          <span className="badge bg-danger rounded-0 px-3 py-2 mb-2 d-inline-block fw-bold ls-1 shadow-sm">
            WELCOME, {user?.name?.toUpperCase() || "ADMIN"}
          </span>
          <br />
          <Link to="/" className="btn btn-outline-dark btn-sm rounded-0 fw-bold extra-small">VIEW STOREFRONT</Link>
        </div>
      </div>

      {/* Analytics Summary Bar */}
      <div className="row g-4 mb-5">
        {[
          { 
            label: "TOTAL REVENUE", 
            value: `₹${totalRevenue.toLocaleString()}`, 
            color: "text-success",
            link: "/admin/orders", 
            linkText: "View Transactions →" 
          },
          { label: "REGISTERED USERS", value: loading ? "..." : totalUserCount },
          { label: "PRODUCT COUNT", value: totalProducts },
          { label: "ACTIVE ORDERS", value: totalOrders }
        ].map((stat, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="card border-dark shadow-sm p-4 bg-white h-100 rounded-0 d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted extra-small fw-black mb-1 ls-1">{stat.label}</p>
                <h3 className={`fw-black mb-0 ${stat.color || "text-dark"}`}>{stat.value}</h3>
              </div>
              {stat.link && (
                <Link to={stat.link} className="text-decoration-none extra-small fw-bold mt-3 text-primary">
                  {stat.linkText}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="card p-5 shadow-sm border-0 h-100 bg-dark text-white rounded-0 text-center">
            <h4 className="fw-black mb-3 text-uppercase ls-1">Inventory Management</h4>
            <p className="opacity-75 mb-4 text-uppercase extra-small fw-bold ls-2">
              Current Stock: {totalProducts} Unique Items
            </p>
            <Link to="/admin/products" className="btn btn-light py-3 fw-black rounded-0 ls-1">
              OPEN PRODUCT CATALOG
            </Link>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card p-5 shadow-sm border-0 h-100 rounded-0 border-dark text-center">
            <h4 className="fw-black mb-3 text-dark text-uppercase ls-1">User Management</h4>
            <p className="text-muted mb-4 text-uppercase extra-small fw-bold ls-2">
              Total Customers: {totalUserCount} Active Accounts
            </p>
            <Link to="/admin/users" className="btn btn-dark py-3 fw-black rounded-0 ls-1">
              VIEW USER ANALYTICS
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table (Read-Only) */}
      <div className="card p-4 shadow-sm border-0 mb-5 rounded-0 border-top border-4 border-dark">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h4 className="fw-black mb-0 text-uppercase ls-1">Recent Customer Orders</h4>
            <Link to="/admin/orders" className="btn btn-dark btn-sm rounded-0 px-3 py-2 fw-bold">
              MANAGE ALL ORDERS
            </Link>
        </div>
        
        <div className="table-responsive">
          <table className="table align-middle table-hover border">
            <thead className="table-dark">
              <tr className="extra-small fw-bold text-uppercase ls-1">
                <th className="py-3 ps-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Amount</th>
                <th className="py-3 text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <p className="mb-0 fw-bold uppercase small">No recent orders found in MongoDB.</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="font-monospace extra-small text-primary fw-bold ps-3">
                      #{order._id?.substring(order._id.length - 8).toUpperCase()}
                      <div className="text-muted mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="extra-small fw-black text-uppercase">{order.userName || "Guest"}</div>
                    </td>
                    <td className="fw-black text-dark">₹{Number(order.amount)?.toLocaleString() || 0}</td>
                    <td className="text-end pe-4">
                      <span className={`badge rounded-0 px-3 py-2 extra-small fw-bold ${
                        order.status === 'Delivered' ? 'bg-success' : 
                        order.status === 'Shipped' ? 'bg-primary' : 
                        order.status === 'Refunded' ? 'bg-secondary text-white' :
                        order.status === 'Return Requested' ? 'bg-info text-dark' :
                        order.status === 'Cancelled' ? 'bg-danger text-white' :
                        order.status === 'Packed' ? 'bg-dark text-white' : 'bg-warning text-dark'
                      }`}>
                        {(order.status || "PENDING").toUpperCase()}
                      </span>
                      
                      {/* Show Return Reason if applicable */}
                      {order.status === 'Return Requested' && order.returnReason && (
                          <div className="mt-1 extra-small text-danger fw-bold">
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
  );
}

export default AdminDashboard;