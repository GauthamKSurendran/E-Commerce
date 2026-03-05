import React, { useContext } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // NEW: Import AuthContext

/**
 * Integrated Order Success Component
 * Displays confirmation details from the MongoDB Order record securely
 */
const OrderSuccess = () => { // REMOVED: user prop
  const location = useLocation();
  const auth = useContext(AuthContext) || {};
  
  // --- CRITICAL FIX: SAFE LOCAL STORAGE FALLBACK ---
  // Guarantees we know who the user is even if the React Context is lagging during the fast redirect
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

  // Retrieve the order ID passed from Checkout/PaymentGateway via state
  const { orderId } = location.state || {};

  // 1. SECURITY & FALLBACK: Redirect if no session or order context exists
  // This prevents users from manually navigating to /order-success without a purchase
  if (!user || (!user.name && !user.email) || !orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card shadow-lg border-0 rounded-0 p-5 bg-white shadow-hover">
            
            {/* SUCCESS ICON */}
            <div className="mb-4 text-success animate-bounce">
              <svg width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>

            <h2 className="fw-black text-uppercase ls-2 mb-2">Order Confirmed!</h2>
            <p className="text-muted mb-4 small">
              Thank you, <span className="fw-bold text-dark">{user.name || "Customer"}</span>. 
              We've received your order and our team is already getting it ready for shipment.
            </p>

            {/* TRANSACTION DETAILS */}
            <div className="bg-light p-4 mb-4 border border-dashed rounded-0">
              <p className="extra-small text-muted mb-1 text-uppercase fw-bold ls-1">Order Reference</p>
              {/* Displaying the MongoDB _id in uppercase for a professional look */}
              <h4 className="fw-black text-primary m-0 font-monospace">
                #{orderId.toString().toUpperCase()}
              </h4>
              <p className="extra-small text-muted mt-2 mb-0">
                A confirmation receipt has been sent to your email.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-grid gap-3">
              <Link 
                to="/profile" // Adjust this to match your actual Order History route (e.g., /profile or /orders)
                className="btn btn-dark py-3 rounded-0 fw-black ls-1 transition-all"
              >
                TRACK MY ORDER
              </Link>
              
              <Link 
                to="/products" 
                className="btn btn-outline-dark py-3 rounded-0 fw-bold ls-1"
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