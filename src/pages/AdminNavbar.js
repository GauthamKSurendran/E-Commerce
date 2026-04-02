import React from "react";
import { Link } from "react-router-dom";

/**
 * Modern Admin Navigation Bar
 * Provides global navigation back to the Command Center and the public Storefront.
 */
function AdminNavbar() {
  return (
    <div className="bg-dark py-3 mb-4 shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        
        {/* BRANDING (Also acts as a home button for the admin) */}
        <Link to="/admin/dashboard" className="text-white text-decoration-none fw-black text-uppercase ls-1 fs-5">
          FASHION.CO <span className="text-white-50 fw-bold ms-2 fs-6">| ADMIN PORTAL</span>
        </Link>

        {/* NAVIGATION ACTIONS */}
        <div className="d-flex gap-3">
          <Link 
            to="/admin/dashboard" 
            className="btn btn-outline-light btn-sm fw-bold px-3 rounded-3 d-flex align-items-center text-uppercase" 
            style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
          >
            <i className="bi bi-grid-1x2-fill me-2"></i> Command Center
          </Link>
          
          <Link 
            to="/" 
            className="btn btn-light btn-sm fw-bold px-3 rounded-3 d-flex align-items-center text-uppercase" 
            style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}
          >
            <i className="bi bi-shop me-2"></i> Storefront
          </Link>
        </div>
        
      </div>
    </div>
  );
}

export default AdminNavbar;