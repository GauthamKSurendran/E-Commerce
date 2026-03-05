import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Integrated Footer Component
 * Connected to MongoDB Newsletter Collection via Backend API
 */
const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // BACKEND INTEGRATION: Submit email to MongoDB
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      // Hits the POST /api/newsletter route in server.js
      const response = await fetch("http://localhost:5000/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Success! You are now subscribed to the FASHION.CO newsletter.");
        setEmail(""); // Clear input on success
      } else {
        // Handles "Already subscribed" error from backend logic
        alert(data.message || "Subscription failed. Please try again.");
      }
    } catch (err) {
      console.error("Newsletter Error:", err);
      alert("Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-top pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4 text-center text-md-start">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-black mb-3 ls-1">FASHION.CO</h5>
            <p className="text-muted small">
              A minimalist clothing store dedicated to quality and timeless style. 
              Designed for Men, Women, and Kids who value simplicity and durability.
            </p>
          </div>

          {/* Navigation Links - Synchronized with App.js Routes */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-black text-uppercase small mb-3 ls-1">Shop</h6>
            <ul className="list-unstyled small">
              {/* Corrected path to match the newly fixed route in App.js */}
              <li className="mb-2"><Link to="/size-guide" className="text-muted text-decoration-none">Size Guide</Link></li>
              <li className="mb-2"><Link to="/products?category=Men" className="text-muted text-decoration-none">Men's Collection</Link></li>
              <li className="mb-2"><Link to="/products?category=Women" className="text-muted text-decoration-none">Women's Collection</Link></li>
              <li className="mb-2"><Link to="/products?category=Kids" className="text-muted text-decoration-none">Kids' Collection</Link></li>
            </ul>
          </div>
      
          {/* Support Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-black text-uppercase small mb-3 ls-1">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to="/about" className="text-muted text-decoration-none">About Us</Link></li>
              <li className="mb-2"><Link to="/orders" className="text-muted text-decoration-none">Order Tracking</Link></li>
              {/* Updated to point to the secure Admin Dashboard */}
              <li className="mb-2"><Link to="/admin/dashboard" className="text-muted text-decoration-none">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Section - Live API Logic */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-black text-uppercase small mb-3 ls-1">Stay Updated</h6>
            <form onSubmit={handleJoin} className="input-group mb-3">
              <input 
                type="email" 
                className="form-control rounded-0 border-dark small shadow-none" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-dark rounded-0 px-3 small fw-bold"
                disabled={loading}
              >
                {loading ? "..." : "JOIN"}
              </button>
            </form>
            <p className="extra-small text-muted mb-0">Subscribe for early access to the 2026 Winter Edit.</p>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted extra-small mb-0">© 2026 FASHION.CO. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
            <div className="extra-small text-muted uppercase fw-bold ls-1">
              Secure Payment: <span className="ms-2">💳 VISA</span> <span className="ms-2">🅿️ PAYPAL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;