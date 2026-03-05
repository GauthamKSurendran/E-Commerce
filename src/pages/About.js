import React from "react";

export default function About() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="display-4 fw-bold mb-5 text-center">Beyond Fashion.</h1>
          <div className="mb-5">
            <h3>Our Story</h3>
            <p className="text-muted lead">
              Founded in 2025, MINIMALSTORE was born out of a desire for simplicity in a cluttered world. 
              We believe that clothing should be an investment, not a disposable commodity.
            </p>
          </div>
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <h5>Sustainable Ethics</h5>
              <p className="small text-muted">We source 100% organic cotton and work with fair-trade factories to ensure every garment respects the planet and the people who make it.</p>
            </div>
            <div className="col-md-6">
              <h5>Timeless Design</h5>
              <p className="small text-muted">Our designers ignore trends. We focus on architectural silhouettes that look as good today as they will in ten years.</p>
            </div>
          </div>
          <div className="bg-dark text-white p-5 text-center mt-4">
            <h2 className="fw-light">"Simplicity is the ultimate sophistication."</h2>
          </div>
        </div>
      </div>
    </div>
  );
}