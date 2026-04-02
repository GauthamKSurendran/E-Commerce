import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { OrderContext } from "../context/OrderProvider";

/**
 * Modern Revenue Analytics Component
 * Features: High-resilience category detection with Manual Name Mapping fallback
 * Navbar-free minimalist version
 */
const RevenueReport = () => {
  const { orders } = useContext(OrderContext) || { orders: [] };

  // 1. CALCULATE REVENUE BY CATEGORY (ULTRA-RESILIENT VERSION)
  const categoryData = useMemo(() => {
    const stats = { Men: 0, Women: 0, Kids: 0, Other: 0 };

    /**
     * MANUAL MAPPING FOR OLD DATA
     * If an item shows up as "Other", add its exact name here to fix it.
     */
    const productToCategoryMap = {
      "Casual Pant": "Men",
      "Clothing Sets (Unisex)": "Kids",
      "Formal Pants": "Men",
      "JumpSuits": "Women",
      "Jeans": "Men",
      "Jacket": "Women",
      "T-Shirt": "Men",
    };
    
    orders.forEach(order => {
      if (order.status !== "Refunded" && order.status !== "Cancelled") {
        order.items?.forEach(item => {
          const itemPrice = Number(item.price) || 0;
          const itemQty = Number(item.quantity || item.qty) || 1;
          const revenue = itemPrice * itemQty;

          let detectedCat = "Other";
          const rawCat = item.category ? item.category.trim().toLowerCase() : "";
          const name = item.name || "";
          const nameLower = name.toLowerCase();

          if (rawCat === "men") {
            detectedCat = "Men";
          } else if (rawCat === "women") {
            detectedCat = "Women";
          } else if (rawCat === "kids") {
            detectedCat = "Kids";
          } 
          else if (productToCategoryMap[name]) {
            detectedCat = productToCategoryMap[name];
          }
          else if (nameLower.includes("men")) {
            detectedCat = "Men";
          } else if (nameLower.includes("women")) {
            detectedCat = "Women";
          } else if (nameLower.includes("kids")) {
            detectedCat = "Kids";
          }

          stats[detectedCat] += revenue;
        });
      }
    });

    return Object.fromEntries(
      Object.entries(stats).filter(([_, val]) => val > 0)
    );
  }, [orders]);

  // 2. CALCULATE REVENUE BY DATE
  const dailyRevenue = useMemo(() => {
    const daily = {};
    orders.forEach(order => {
      if (order.status !== "Refunded" && order.status !== "Cancelled") {
        const date = new Date(order.createdAt).toLocaleDateString();
        daily[date] = (daily[date] || 0) + Number(order.amount);
      }
    });
    return Object.entries(daily).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [orders]);

  // 3. CALCULATE TOTAL REVENUE FOR PERCENTAGES
  const totalRevenue = useMemo(() => {
    return Object.values(categoryData).reduce((acc, curr) => acc + curr, 0);
  }, [categoryData]);

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

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Navbar removed to maintain clean dashboard-style look */}
      
      <div className="container" style={{ paddingTop: '50px' }}>
        
        {/* HEADER SECTION */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom border-dark border-opacity-10">
          <div>
            <h2 className="fw-black text-uppercase ls-1 mb-1">Financial Intelligence</h2>
            <p className="text-muted small fw-bold mb-0">Revenue breakdown & transaction log</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/admin/dashboard" className="btn btn-outline-dark fw-bold px-4 rounded-3 text-uppercase d-flex align-items-center shadow-sm" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-arrow-left me-2 fs-6"></i> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* TOP LEVEL SUMMARY CARDS */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-light">
                  <div className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-pie-chart-fill fs-5"></i>
                  </div>
                  <h5 className="fw-black ls-1 mb-0 text-uppercase">Earnings by Category</h5>
                </div>
                
                {Object.entries(categoryData).length === 0 ? (
                  <p className="text-muted small fw-bold py-4">No categorized data available.</p>
                ) : (
                  Object.entries(categoryData).map(([cat, val]) => {
                    const percentage = totalRevenue > 0 ? ((val / totalRevenue) * 100).toFixed(1) : 0;
                    return (
                      <div key={cat} className="mb-4">
                        <div className="d-flex justify-content-between align-items-end mb-2">
                          <span className="small fw-bold text-uppercase text-muted">{cat}</span>
                          <div className="text-end">
                            <span className="fw-black text-dark d-block">₹{val.toLocaleString()}</span>
                            <span className="extra-small text-muted fw-bold">{percentage}% of total</span>
                          </div>
                        </div>
                        <div className="progress rounded-pill bg-light" style={{ height: '10px' }}>
                          <div 
                            className="progress-bar bg-dark rounded-pill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div className="card-body p-4 p-md-5 d-flex flex-column">
                <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-light">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-graph-up-arrow fs-5"></i>
                  </div>
                  <h5 className="fw-black ls-1 mb-0 text-uppercase">Recent Daily Earnings</h5>
                </div>
                
                <div className="table-responsive flex-grow-1">
                  <table className="table table-borderless table-hover align-middle mb-0">
                    <tbody>
                      {dailyRevenue.length === 0 ? (
                        <tr>
                          <td className="text-center py-4 text-muted small fw-bold">No recent earnings data available.</td>
                        </tr>
                      ) : (
                        dailyRevenue.slice(0, 5).map(([date, amount]) => (
                          <tr key={date} className="border-bottom border-light">
                            <td className="py-3 text-muted fw-bold small">
                              <i className="bi bi-calendar-event me-2 text-dark opacity-50"></i>
                              {date}
                            </td>
                            <td className="py-3 text-end fw-black text-success">
                              + ₹{amount.toLocaleString()}
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

        {/* DETAILED TRANSACTION LOG */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
          <div className="card-header bg-white p-4 border-bottom d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-receipt fs-6"></i>
            </div>
            <h5 className="fw-black text-uppercase ls-1 mb-0">Full Revenue Log</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4 py-3 fw-bold border-bottom-0">Order ID</th>
                    <th className="py-3 fw-bold border-bottom-0">Customer Account</th>
                    <th className="py-3 fw-bold border-bottom-0">Amount</th>
                    <th className="py-3 pe-4 fw-bold border-bottom-0 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted small fw-bold">No transactions found.</td>
                    </tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => window.location.href='/admin/orders'}>
                        <td className="ps-4 py-3">
                          <span className="font-monospace fw-bold text-primary" style={{ fontSize: '0.85rem' }}>
                            #{o._id.substring(o._id.length - 8).toUpperCase()}
                          </span>
                          <div className="text-muted extra-small mt-1">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold text-dark text-uppercase" style={{ fontSize: '0.85rem' }}>{o.userName || 'Guest'}</div>
                          <div className="text-muted extra-small">{o.userEmail}</div>
                        </td>
                        <td className="py-3 fw-black text-dark">
                          ₹{Number(o.amount).toLocaleString()}
                        </td>
                        <td className="py-3 pe-4 text-end">
                          <span className={`badge px-3 py-2 rounded-pill fw-bold text-uppercase ${getStatusBadge(o.status)}`} style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            {o.status}
                          </span>
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
};

export default RevenueReport;