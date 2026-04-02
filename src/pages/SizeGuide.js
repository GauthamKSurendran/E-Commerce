import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Optimized SizeGuide Component
 * Features: Sticky Navigation, Responsive Tables, and Measurement Tips
 * Standardized for S, M, L, XL, XXL sizes
 */
const SizeGuide = () => {
  return (
    <div className="container mt-5 pt-5 mb-5 animate-in">
      {/* HEADER SECTION */}
      <div className="text-center mb-5 py-5 bg-dark text-white shadow-sm rounded-0">
        <h1 className="fw-black text-uppercase ls-3 mb-2">Size Guide</h1>
        <p className="opacity-75 small text-uppercase tracking-widest ls-1">Ensuring a Tailored Fit for Every Collection</p>
      </div>

      <div className="row g-5 justify-content-center">
        {/* LEFT COLUMN: GUIDELINES (Sticky Navigation & Tips) */}
        <div className="col-lg-3">
          <div className="sticky-top" style={{ top: '100px', zIndex: '10' }}>
            <h6 className="fw-black text-uppercase ls-1 mb-4 border-bottom pb-2 border-dark">Quick Navigation</h6>
            <div className="list-group list-group-flush mb-5">
                <a href="#men" className="list-group-item list-group-item-action small fw-bold text-uppercase border-0 px-0 transition-all">01. Men's Sizes</a>
                <a href="#women" className="list-group-item list-group-item-action small fw-bold text-uppercase border-0 px-0 transition-all">02. Women's Sizes</a>
                <a href="#kids" className="list-group-item list-group-item-action small fw-bold text-uppercase border-0 px-0 transition-all">03. Kids' Sizes</a>
            </div>

            <h6 className="fw-black text-uppercase ls-1 mb-3">Measuring Tips</h6>
            <div className="mb-4">
              <p className="extra-small fw-bold text-uppercase mb-1 text-primary">Chest / Bust</p>
              <p className="extra-small text-muted">Measure under your arms around the fullest part of your chest.</p>
            </div>
            <div className="mb-4">
              <p className="extra-small fw-bold text-uppercase mb-1 text-primary">Waist</p>
              <p className="extra-small text-muted">Measure around your natural waistline, keeping the tape slightly loose.</p>
            </div>

            <div className="mt-5 p-3 bg-light border border-dashed text-center rounded-0">
              <p className="extra-small fw-bold mb-2 uppercase ls-1">Need specific help?</p>
              <Link to="/about" className="extra-small text-dark fw-bold text-decoration-none border-bottom border-dark pb-1">CONTACT SUPPORT</Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIZE TABLES */}
        <div className="col-lg-8">
          
          {/* MENSWEAR TABLE */}
          <section id="men" className="mb-5 pt-2">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-dark text-white px-2 py-1 extra-small fw-bold me-2">MEN</div>
              <h5 className="fw-black text-uppercase ls-1 m-0">Standard Menswear</h5>
            </div>
            
            <div className="table-responsive">
              <table className="table border align-middle shadow-sm table-hover mb-0">
                <thead className="table-light border-bottom border-dark border-2">
                  <tr className="extra-small fw-bold text-uppercase ls-1">
                    <th className="p-3">Alpha</th>
                    <th className="p-3">Chest (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Hips (in)</th>
                  </tr>
                </thead>
                <tbody className="small">
                  <tr><td className="p-3 fw-black border-end">S</td><td className="p-3 text-muted">34 - 37</td><td className="p-3 text-muted">30 - 32</td><td className="p-3 text-muted">35 - 37</td></tr>
                  <tr><td className="p-3 fw-black border-end">M</td><td className="p-3 text-muted">38 - 40</td><td className="p-3 text-muted">32 - 35</td><td className="p-3 text-muted">38 - 40</td></tr>
                  <tr><td className="p-3 fw-black border-end">L</td><td className="p-3 text-muted">41 - 44</td><td className="p-3 text-muted">35 - 39</td><td className="p-3 text-muted">41 - 44</td></tr>
                  <tr><td className="p-3 fw-black border-end">XL</td><td className="p-3 text-muted">45 - 48</td><td className="p-3 text-muted">39 - 43</td><td className="p-3 text-muted">45 - 48</td></tr>
                  <tr><td className="p-3 fw-black border-end">XXL</td><td className="p-3 text-muted">49 - 52</td><td className="p-3 text-muted">44 - 47</td><td className="p-3 text-muted">49 - 52</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* WOMENSWEAR TABLE */}
          <section id="women" className="mb-5 pt-2">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary text-white px-2 py-1 extra-small fw-bold me-2">WOMEN</div>
              <h5 className="fw-black text-uppercase ls-1 m-0">Women's Standard Fit</h5>
            </div>
            <div className="table-responsive">
              <table className="table border align-middle shadow-sm table-hover mb-0">
                <thead className="table-light border-bottom border-primary border-2">
                  <tr className="extra-small fw-bold text-uppercase ls-1">
                    <th className="p-3">Alpha</th>
                    <th className="p-3">Bust (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Hips (in)</th>
                  </tr>
                </thead>
                <tbody className="small">
                  <tr><td className="p-3 fw-black border-end">S</td><td className="p-3 text-muted">33 - 35</td><td className="p-3 text-muted">26 - 28</td><td className="p-3 text-muted">36 - 38</td></tr>
                  <tr><td className="p-3 fw-black border-end">M</td><td className="p-3 text-muted">35 - 37</td><td className="p-3 text-muted">28 - 31</td><td className="p-3 text-muted">38 - 41</td></tr>
                  <tr><td className="p-3 fw-black border-end">L</td><td className="p-3 text-muted">37 - 40</td><td className="p-3 text-muted">31 - 34</td><td className="p-3 text-muted">41 - 44</td></tr>
                  <tr><td className="p-3 fw-black border-end">XL</td><td className="p-3 text-muted">40 - 43</td><td className="p-3 text-muted">34 - 37</td><td className="p-3 text-muted">44 - 47</td></tr>
                  <tr><td className="p-3 fw-black border-end">XXL</td><td className="p-3 text-muted">43 - 46</td><td className="p-3 text-muted">37 - 40</td><td className="p-3 text-muted">47 - 50</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* KIDS TABLE */}
          <section id="kids" className="mb-5 pt-2">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-success text-white px-2 py-1 extra-small fw-bold me-2">KIDS</div>
              <h5 className="fw-black text-uppercase ls-1 m-0">Junior Collection</h5>
            </div>
            <div className="table-responsive">
              <table className="table border align-middle shadow-sm table-hover mb-0">
                <thead className="table-light border-bottom border-success border-2">
                  <tr className="extra-small fw-bold text-uppercase ls-1">
                    <th className="p-3">Alpha</th>
                    <th className="p-3">Height (in)</th>
                    <th className="p-3">Chest (in)</th>
                    <th className="p-3">Avg. Age</th>
                  </tr>
                </thead>
                <tbody className="small">
                  <tr><td className="p-3 fw-black border-end">S</td><td className="p-3 text-muted">45 - 50</td><td className="p-3 text-muted">24 - 26</td><td className="p-3 text-muted">6 - 7 Yrs</td></tr>
                  <tr><td className="p-3 fw-black border-end">M</td><td className="p-3 text-muted">51 - 55</td><td className="p-3 text-muted">27 - 28</td><td className="p-3 text-muted">8 - 9 Yrs</td></tr>
                  <tr><td className="p-3 fw-black border-end">L</td><td className="p-3 text-muted">56 - 60</td><td className="p-3 text-muted">29 - 30</td><td className="p-3 text-muted">10 - 11 Yrs</td></tr>
                  <tr><td className="p-3 fw-black border-end">XL</td><td className="p-3 text-muted">61 - 63</td><td className="p-3 text-muted">31 - 32</td><td className="p-3 text-muted">12 - 13 Yrs</td></tr>
                  <tr><td className="p-3 fw-black border-end">XXL</td><td className="p-3 text-muted">64 - 66</td><td className="p-3 text-muted">33 - 34</td><td className="p-3 text-muted">14+ Yrs</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* NAVIGATION FOOTER */}
          <div className="text-center mt-5 pt-4 border-top">
            <Link to="/products" className="btn btn-dark rounded-0 px-5 py-3 fw-black ls-2 shadow-sm transition-all hover-up">
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;