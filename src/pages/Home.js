import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";
import ProductCard from "../components/ProductCard";
import kidsImage from '../components/Assets/kidss.jpg';
import womenImage from '../components/Assets/women.jpg';
import menImage from '../components/Assets/men.jpg';

/**
 * Integrated Home Component
 * Fetches live featured products from MongoDB via ProductProvider
 */
export default function Home({ user }) {
  // 1. ACCESS LIVE BACKEND DATA
  // products is now an array synced with your MongoDB database
  const { products, fetchProducts, loading } = useContext(ProductContext);

  // 2. FORCE SYNC ON MOUNT
  // Ensures the landing page always shows the latest inventory levels
  useEffect(() => {
    if (fetchProducts) fetchProducts();
  }, [fetchProducts]);

  // Display the first 4 live products as "Featured"
  const featuredProducts = (products || []).slice(0, 4);

  return (
    <div className="page-wrapper">
      
      {/* 1. HERO SECTION */}
      <section className="position-relative overflow-hidden mb-5" style={{ height: '90vh',marginTop: '-150px' }}>
        <img 
          src="/Homebg.png" 
          className="position-absolute w-100 h-100" 
          style={{ objectFit: 'cover' }} 
          alt="New Collection 2026" 
          onError={(e) => e.target.src = 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg'}
        />
        <div className="position-absolute top-50 start-0 translate-middle-y ps-5 text-white bg-dark bg-opacity-25 p-4 w-100">
          <div className="container">
            <h1 className="display-1 fw-black mb-0">THE SUMMER</h1>
            <h1 className="display-1 fw-light mb-4">EDIT. 2026</h1>
            <p className="lead mb-4">Premium apparel for Men, Women & Kids.</p>
            <div className="d-flex gap-3">
              <Link to="/products" className="btn btn-light btn-lg rounded-0 px-5 fw-bold">SHOP NOW</Link>
              <Link to="/about" className="btn btn-outline-light btn-lg rounded-0 px-5 fw-bold">OUR STORY</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY GRID - Filtered via URL Query Params for Backend Support */}
      <div className="container py-5">
        <h2 className="text-center fw-black mb-5 tracking-widest text-uppercase">Browse Collections</h2>
        <div className="row g-4 text-center">
          
          <div className="col-md-4">
            <Link to="/products?category=Men" className="text-decoration-none">
              <div className="card border-0 rounded-0 shadow-sm overflow-hidden category-card">
                <img src={menImage} className="w-100" style={{height: '500px', objectFit: 'cover'}} alt="Men" />
                <div className="card-body p-4 bg-white">
                  <h4 className="fw-bold mb-1 text-dark">MEN</h4>
                  <p className="text-muted small">Outerwear & Tailoring</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link to="/products?category=Women" className="text-decoration-none">
              <div className="card border-0 rounded-0 shadow-sm overflow-hidden category-card">
                <img src={womenImage} className="w-100" style={{height: '500px', objectFit: 'cover'}} alt="Women" />
                <div className="card-body p-4 bg-white">
                  <h4 className="fw-bold mb-1 text-dark">WOMEN</h4>
                  <p className="text-muted small">Dresses & Accessories</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
             <Link to="/products?category=Kids" className="text-decoration-none">
                <div className="card border-0 rounded-0 shadow-sm overflow-hidden category-card">
                  {/* 2. Update the src to use the imported variable */}
                    <img 
                    src={kidsImage} 
                    className="w-100" 
                    style={{ height: '500px', objectFit: 'cover' }} 
                    alt="Kids Collection" 
                    />
                    <div className="card-body p-4 bg-white">
                  <h4 className="fw-bold mb-1 text-dark">KIDS</h4>
                <p className="text-muted small">Organic Play-sets</p>
              </div>
            </div>
          </Link>
         </div>
        </div>
      </div>

      {/* 3. LIVE FEATURED PRODUCTS */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-2">
            <h3 className="fw-black mb-0 text-uppercase tracking-wider">Editor's Picks</h3>
            <Link to="/products" className="text-dark fw-bold small">VIEW ALL</Link>
        </div>
        
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border spinner-border-sm"></div></div>
        ) : (
          <div className="row g-4">
              {featuredProducts.map(product => (
                  // FIX: Using product._id for MongoDB compatibility
                  <div className="col-md-3" key={product._id}>
                      <ProductCard product={product} user={user} />
                  </div>
              ))}
          </div>
        )}
      </section>

      {/* 4. PROMOTIONAL FEATURE */}
      <section className="bg-light py-5 mt-5 border-top border-bottom text-center">
        <div className="container py-4">
          <h6 className="fw-bold ls-3 text-muted mb-3">NEW ARRIVALS EVERY WEEK</h6>
          <h2 className="display-5 fw-bold mb-4">Quality Fabrics. Timeless Styles.</h2>
          <Link to="/products" className="btn btn-dark rounded-0 px-5 py-3 fw-bold">VIEW ALL PRODUCTS</Link>
        </div>
      </section>
    </div>
  );
}