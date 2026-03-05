import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Cleaned and Integrated NotFound Component
 * Matches the FASHION.CO "THE WINTER EDIT" design system
 */
const NotFound = () => {
  return (
    <div className="container text-center py-5 mt-5 animate-in">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {/* Main Error Code */}
          <h1 className="display-1 fw-black text-danger mb-0" style={{ fontSize: '8rem' }}>
            404
          </h1>
          
          <h2 className="fw-black text-uppercase tracking-widest mb-3 ls-1">
            Page Not Found
          </h2>
          
          <p className="text-muted mb-5 small text-uppercase fw-bold">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          
          <div className="border-top border-dark pt-5">
            <h6 className="fw-black mb-4 text-uppercase small ls-2">
              Try one of these instead:
            </h6>
            
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link 
                to="/" 
                className="btn btn-dark rounded-0 px-5 py-3 fw-bold ls-1"
              >
                HOME
              </Link>
              
              <Link 
                to="/products" 
                className="btn btn-outline-dark rounded-0 px-5 py-3 fw-bold ls-1"
              >
                SHOP
              </Link>
              
              <Link 
                to="/about" 
                className="btn btn-outline-dark rounded-0 px-5 py-3 fw-bold ls-1"
              >
                ABOUT US
              </Link>
            </div>
          </div>
          
          {/* Branding Footer */}
          <div className="mt-5 pt-5 opacity-25">
            <p className="fw-black text-uppercase extra-small tracking-widest">
              FASHION.CO &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;