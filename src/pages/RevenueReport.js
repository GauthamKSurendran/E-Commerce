import React, { useContext, useMemo } from "react";
import { OrderContext } from "../context/OrderProvider";
import AdminNavbar from "./AdminNavbar";

/**
 * Revenue Analytics Component
 * Breaks down MongoDB order data into visual categories and timeframes
 */
const RevenueReport = () => {
  const { orders } = useContext(OrderContext) || { orders: [] };

  // 1. CALCULATE REVENUE BY CATEGORY
  const categoryData = useMemo(() => {
    const stats = { Men: 0, Women: 0, Kids: 0 };
    orders.forEach(order => {
      if (order.status !== "Refunded") {
        order.items?.forEach(item => {
          // This assumes your order items include the category field
          if (stats[item.category] !== undefined) {
            stats[item.category] += (item.price * item.quantity);
          }
        });
      }
    });
    return stats;
  }, [orders]);

  // 2. CALCULATE REVENUE BY DATE
  const dailyRevenue = useMemo(() => {
    const daily = {};
    orders.forEach(order => {
      if (order.status !== "Refunded") {
        const date = new Date(order.createdAt).toLocaleDateString();
        daily[date] = (daily[date] || 0) + Number(order.amount);
      }
    });
    return Object.entries(daily).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [orders]);

  const totalRevenue = orders.reduce((sum, o) => 
    o.status !== "Refunded" ? sum + (Number(o.amount) || 0) : sum, 0
  );

  return (
    <div className="bg-light min-vh-100">
      <AdminNavbar />
      <div className="container py-4">
        <div className="border-start border-4 border-success ps-3 mb-5">
          <h2 className="fw-black mb-0 text-uppercase ls-1">Financial Intelligence</h2>
          <p className="text-muted small mb-0 fw-bold uppercase">Revenue breakdown from MongoDB Collections</p>
        </div>

        {/* Top Level Summary Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="card border-dark shadow-sm p-4 rounded-0 h-100">
              <h6 className="extra-small fw-black ls-2 mb-4 text-uppercase">Earnings by Category</h6>
              {Object.entries(categoryData).map(([cat, val]) => (
                <div key={cat} className="mb-3">
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    <span>{cat.toUpperCase()}</span>
                    <span>₹{val.toLocaleString()}</span>
                  </div>
                  <div className="progress rounded-0" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-dark" 
                      style={{ width: `${(val / totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-dark shadow-sm p-4 rounded-0 h-100">
              <h6 className="extra-small fw-black ls-2 mb-4 text-uppercase">Recent Daily Earnings</h6>
              <div className="table-responsive">
                <table className="table table-sm extra-small fw-bold">
                  <tbody>
                    {dailyRevenue.slice(0, 5).map(([date, amount]) => (
                      <tr key={date}>
                        <td className="py-2 text-muted">{date}</td>
                        <td className="py-2 text-end">₹{amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Transaction Log */}
        <div className="card border-dark shadow-sm rounded-0">
          <div className="card-header bg-dark text-white rounded-0 py-3">
            <h6 className="mb-0 extra-small fw-black ls-2">FULL REVENUE LOG</h6>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="extra-small fw-bold text-uppercase bg-light">
                <tr>
                  <th className="ps-4">Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th className="text-end pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="small">
                    <td className="ps-4 font-monospace fw-bold text-primary">
                      #{o._id.substring(o._id.length - 8).toUpperCase()}
                    </td>
                    <td>{o.userEmail}</td>
                    <td className="fw-black">₹{Number(o.amount).toLocaleString()}</td>
                    <td className="text-end pe-4">
                      <span className={`badge rounded-0 extra-small ${o.status === 'Delivered' ? 'bg-success' : 'bg-dark'}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;