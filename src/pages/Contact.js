import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Modern Minimalist Contact Page
 * Features: Form handling, contact info cards, and "Back to Home" navigation
 */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for backend integration would go here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container py-5 mt-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="card border-0 shadow-sm p-5 rounded-4" style={{ maxWidth: '500px' }}>
          <i className="bi bi-envelope-check text-success mb-3" style={{ fontSize: '4rem' }}></i>
          <h2 className="fw-black text-uppercase ls-1">Message Sent</h2>
          <p className="text-muted mb-4">Thank you for reaching out. Our support team will contact you within 24 hours.</p>
          <Link to="/" className="btn btn-dark w-100 py-3 rounded-3 fw-bold text-uppercase ls-1">Return to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5 min-vh-100">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          <div className="text-center mb-5">
            <h2 className="fw-black text-uppercase ls-2 mb-2">Contact Support</h2>
            <p className="text-muted fw-bold small text-uppercase ls-1">We're here to help with your FASHION.CO experience</p>
          </div>

          <div className="row g-5">
            {/* LEFT: CONTACT INFO */}
            <div className="col-md-5">
              <div className="d-flex flex-column gap-4">
                <div className="p-4 bg-white shadow-sm rounded-4 border-start border-4 border-primary">
                  <h6 className="fw-black text-uppercase ls-1 mb-2">Customer Care</h6>
                  <p className="text-muted small mb-0">support@fashion.co</p>
                  <p className="text-muted small">Available 24/7</p>
                </div>

                <div className="p-4 bg-white shadow-sm rounded-4 border-start border-4 border-dark">
                  <h6 className="fw-black text-uppercase ls-1 mb-2">Office Headquarters</h6>
                  <p className="text-muted small mb-0"> Fashion.Co YMCA Road, Kottayam</p>
                  <p className="text-muted small">Kerala, India , KL 686001</p>
                </div>

                <Link to="/" className="btn btn-outline-dark py-3 rounded-3 fw-bold text-uppercase ls-1 mt-2">
                  <i className="bi bi-arrow-left me-2"></i> Back to Home
                </Link>
              </div>
            </div>

            {/* RIGHT: CONTACT FORM */}
            <div className="col-md-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="extra-small fw-bold text-uppercase text-muted mb-2">Full Name</label>
                      <input type="text" className="form-control rounded-3 border-light bg-light py-2" placeholder="John Doe" required />
                    </div>
                    <div className="col-md-6">
                      <label className="extra-small fw-bold text-uppercase text-muted mb-2">Email Address</label>
                      <input type="email" className="form-control rounded-3 border-light bg-light py-2" placeholder="john@example.com" required />
                    </div>
                    <div className="col-12">
                      <label className="extra-small fw-bold text-uppercase text-muted mb-2">Subject</label>
                      <select className="form-select rounded-3 border-light bg-light py-2" required>
                        <option value="">Select an option</option>
                        <option value="order">Order Status</option>
                        <option value="return">Returns & Refunds</option>
                        <option value="size">Size Guidance</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="extra-small fw-bold text-uppercase text-muted mb-2">Message</label>
                      <textarea className="form-control rounded-3 border-light bg-light py-2" rows="5" placeholder="How can we help you?" required></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-dark w-100 py-3 rounded-3 fw-black text-uppercase ls-1">
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}