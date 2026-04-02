import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { OrderContext } from "../context/OrderProvider";

/**
 * Admin User Management Component
 * Fully synced with MongoDB User & Order Collections
 */
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrders, setViewingOrders] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  // 1. ACCESS LIVE ORDERS FROM CONTEXT
  const orderData = useContext(OrderContext);
  const orders = orderData?.orders || [];

  // 2. FETCH USERS FROM MONGODB API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      // Hits the /api/admin/users route we added to server.js
          const res = await fetch("https://e-commerce-backend-9-t3c1.onrender.com/api/admin/users", {
          headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch users from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. ANALYTICS LOGIC: Links Orders to Users via Email
  const getUserAnalytics = (email) => {
    if (!email) return { count: 0, spent: 0, history: [] };

    // Filter live orders matching this specific user
    const userOrders = orders.filter(o => 
      o?.userEmail?.toLowerCase() === email.toLowerCase()
    );

    const spent = userOrders.reduce((sum, o) => sum + (Number(o?.amount) || 0), 0);

    return { 
      count: userOrders.length, 
      spent, 
      history: userOrders 
    };
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the customer account.")) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`https://e-commerce-backend-9-t3c1.onrender.com/api/admin/users/${id}`, {        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers(); // Force refresh the list
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="container mt-5 pt-4 mb-5">
      <Link to="/admin/dashboard" className="text-decoration-none text-muted small fw-bold">
        ← BACK TO COMMAND CENTER
      </Link>
      <h2 className="fw-bold mt-3 mb-4">Customer Insights & Analytics</h2>

      <div className="card border-0 shadow-sm rounded-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0 table-hover">
            <thead className="table-dark fw-bold small text-uppercase ls-1">
              <tr>
                <th className="ps-4 py-3">Customer Profile</th>
                <th className="py-3">Total Orders</th>
                <th className="py-3">Lifetime Value</th>
                <th className="text-end pe-4 py-3">Account Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm"></div></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No registered accounts found in MongoDB.</td></tr>
              ) : (
                users.map((user) => {
                  const stats = getUserAnalytics(user.email);
                  return (
                    <tr key={user._id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{user.name}</div>
                        <div className="text-muted small">{user.email}</div>
                        {user.isAdmin && <span className="badge bg-primary extra-small mt-1">STAFF/ADMIN</span>}
                      </td>
                      <td>
                        <button 
                          className="btn btn-link btn-sm p-0 fw-bold text-dark text-decoration-none border-bottom border-dark border-opacity-25" 
                          onClick={() => { 
                            setViewingOrders(stats.history); 
                            setSelectedUserEmail(user.email); 
                          }}
                        >
                          {stats.count} Orders View ↓
                        </button>
                      </td>
                      <td className="fw-bold text-success">
                        ₹{stats.spent.toLocaleString()}
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-0 border-0 fw-bold"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user.email === "admin@gmail.com"} // Prevent deleting the main admin
                        >
                          REMOVE
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Drill-down View */}
      {viewingOrders && (
        <div className="mt-4 p-4 bg-white border shadow-sm border-2 animate-in">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 text-uppercase ls-1">Activity Log: {selectedUserEmail}</h5>
            <button className="btn-close" onClick={() => setViewingOrders(null)}></button>
          </div>
          <div className="table-responsive">
            <table className="table table-sm border">
              <thead className="table-light small text-uppercase ls-1">
                <tr>
                  <th className="ps-2 py-2">Transaction ID</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2 text-end pe-3">Full Status</th>
                </tr>
              </thead>
              <tbody>
                {viewingOrders.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-4 text-muted small">No transactions found for this user.</td></tr>
                ) : (
                  viewingOrders.map(o => (
                    <tr key={o._id}>
                      <td className="font-monospace extra-small text-primary fw-bold ps-2 py-2">
                        {o._id?.substring(0, 12)}...
                      </td>
                      <td className="py-2 small">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="fw-bold py-2">₹{o.amount?.toLocaleString()}</td>
                      <td className="py-2 text-end pe-3">
                        <span className={`badge rounded-0 extra-small ${o.status === 'Delivered' ? 'bg-success' : 'bg-dark'}`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;