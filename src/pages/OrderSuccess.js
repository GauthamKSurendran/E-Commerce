import React, { useContext } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Integrated Order Success Component
 * Features: 
 * 1. Shortened Reference ID for clean UI
 * 2. Amount Display (Synced from Checkout)
 * 3. 3-day Delivery Estimation logic
 * 4. Fixed Routing for "Track My Order"
 */
const OrderSuccess = () => {
  const location = useLocation();
  const auth = useContext(AuthContext) || {};
  
  // --- SAFE LOCAL STORAGE FALLBACK ---
  let localUser = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      localUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Notice: Bypassed invalid local storage data.");
  }

  const user = auth?.user || localUser;

  // Retrieve order details passed from the payment/checkout state
  const { orderId, amount } = location.state || {};

  // --- HELPER: CALCULATE 3 DAYS FROM TODAY ---
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 1. SECURITY REDIRECT: Prevent manual navigation to this page if no orderId exists
  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-5 mt-5 animate-in">
      <div className="row justify-content-center">
        <div className="col-md-5 text-center">
          <div className="card shadow-lg border-0 rounded-4 p-5 bg-white">
            
            {/* SUCCESS ICON */}
            <div className="mb-4 text-success animate-bounce">
              <svg width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>

            <h2 className="fw-black text-uppercase ls-1 mb-2">Order Confirmed!</h2>
            <p className="text-muted mb-4 small">
              Thank you, <span className="fw-bold text-dark text-capitalize">{user.name || "Customer"}</span>. 
              We've received your order and our team is already getting it ready.
            </p>

            {/* TRANSACTION DETAILS */}
            <div className="bg-light p-4 mb-3 border rounded-3 text-start">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="extra-small text-muted fw-bold text-uppercase ls-1">Reference</span>
                {/* 
                  FIX: Shortened the ID display. 
                  Using substring to show last 10 characters so it fits your UI perfectly.
                */}
                <span className="font-monospace fw-bold text-primary">
                  #{orderId.toString().substring(orderId.length - 10).toUpperCase()}
                </span>
              </div>
              
              {amount && (
                <div className="d-flex justify-content-between align-items-center">
                  <span className="extra-small text-muted fw-bold text-uppercase ls-1">Total Paid</span>
                  <span className="fw-black text-dark">₹{Number(amount).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* DELIVERY ESTIMATION BOX */}
            <div className="bg-dark text-white p-4 mb-4 rounded-3 shadow-sm d-flex flex-column align-items-center">
              <i className="bi bi-truck fs-3 mb-2"></i>
              <p className="extra-small text-uppercase fw-bold ls-2 mb-1 opacity-75">Estimated Delivery By</p>
              <h5 className="fw-black text-uppercase m-0 ls-1">
                {getDeliveryDate()}
              </h5>
              <div className="mt-2 pt-2 border-top border-secondary w-100 border-opacity-25">
                <p className="extra-small mb-0 opacity-50 text-uppercase fw-bold">
                  Standard Express Shipping (3 Days)
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-grid gap-2">
              {/* 
                FIX: Route updated to /order-history to match the path defined in App.js.
                This fixes the 404 error on click.
              */}
              <Link 
                to="/order-history" 
                className="btn btn-dark py-3 rounded-3 fw-black ls-1 shadow-sm transition-all"
              >
                TRACK MY ORDER
              </Link>
              
              <Link 
                to="/products" 
                className="btn btn-outline-dark py-3 rounded-3 fw-bold ls-1"
              >
                CONTINUE SHOPPING
              </Link>
            </div>

            <div className="mt-4 pt-3 border-top">
              <p className="extra-small text-muted text-uppercase fw-bold ls-1">
                Need help? <Link to="/contact" className="text-dark text-decoration-none border-bottom border-dark">Contact Support</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;