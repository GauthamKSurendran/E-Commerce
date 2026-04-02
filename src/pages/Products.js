import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";
import ProductCard from "../components/ProductCard";

/**
 * Products Page Component
 * Cleaned, optimized, and integrated with Size-Specific Stock filtering
 */
function Products({ user }) {
  const { products } = useContext(ProductContext);
  const location = useLocation();

  // 1. STATE MANAGEMENT
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(50000); 
  const [selectedSize, setSelectedSize] = useState(""); 

  // Dynamic Price Slider max calculation
  const maxAvailablePrice = products.length > 0 
    ? Math.max(...products.map(p => p.price)) 
    : 50000;

  // 2. BACKEND SYNC WITH URL PARAMS
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryQuery = params.get("category");
    const searchKey = params.get("search");

    if (categoryQuery) {
      // Normalize to match DB Case: 'Men', 'Women', 'Kids'
      const formattedCat = categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1).toLowerCase();
      setCategory(formattedCat);
    }
    
    if (searchKey) {
      setSearchTerm(searchKey);
      // Sync keyword "Men/Women/Kids" with category filter
      if (["men", "women", "kids"].includes(searchKey.toLowerCase())) {
        const syncCat = searchKey.charAt(0).toUpperCase() + searchKey.slice(1).toLowerCase();
        setCategory(syncCat);
      }
    }
  }, [location.search]);

  // Set initial price range once products load
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange(maxAvailablePrice);
    }
  }, [products, maxAvailablePrice]);

  // 3. MULTI-FACETED FILTER LOGIC
  const filteredProducts = products.filter((p) => {
    // A. Category Matching
    const matchesCategory = category === "All" || p.category === category;
    
    // B. Keyword Search (Matches Name or Category)
    const activeSearch = searchTerm.toLowerCase();
    const matchesSearch = activeSearch 
      ? (p.name.toLowerCase().includes(activeSearch) || p.category.toLowerCase().includes(activeSearch))
      : true;
    
    // C. Price logic
    const matchesPrice = p.price <= priceRange;

    // D. Variant logic (Size & Stock) - UPDATED FOR NEW SCHEMA
    // We check if the product has the selected size AND if that size's countInStock is greater than 0
    const matchesSize = selectedSize === "" || (
      p.sizes && p.sizes.some(s => s.size === selectedSize && s.countInStock > 0)
    );

    return matchesCategory && matchesSearch && matchesPrice && matchesSize;
  });

  return (
    <div className="container mt-5 pt-5 page-wrapper animate-in">
      <div className="row g-4">
        {/* SIDEBAR FILTERS */}
        <aside className="col-lg-3">
          <div className="sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <h4 className="fw-black mb-4 ls-2 text-uppercase">Filters</h4>
            
            {/* Keyword Search */}
            <div className="mb-4">
              <label className="extra-small fw-bold mb-2 text-muted text-uppercase ls-1">Keyword Search</label>
              <div className="input-group border border-dark rounded-0">
                <input 
                  type="text" 
                  className="form-control rounded-0 border-0 shadow-none p-2" 
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>

            {/* Gender Category Filter */}
            <div className="mb-4">
              <label className="extra-small fw-bold mb-2 text-muted text-uppercase ls-1">Gender</label>
              <div className="d-flex flex-column gap-1">
                {["All", "Men", "Women", "Kids"].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => {
                      setCategory(cat);
                      setSearchTerm(""); 
                    }}
                    className={`btn btn-sm text-start rounded-0 py-2 px-3 fw-bold ls-1 ${category === cat ? "btn-dark text-white" : "btn-outline-secondary border-0"}`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-4">
              <label className="extra-small fw-bold mb-2 text-muted text-uppercase ls-1">Size Selection (In Stock)</label>
              <div className="d-flex flex-wrap gap-2">
                {["S", "M", "L", "XL", "XXL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                    className={`btn btn-sm rounded-0 border fw-bold ${selectedSize === size ? 'btn-dark' : 'btn-outline-dark'}`}
                    style={{ width: '40px', height: '40px' }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="mb-4">
              <label className="extra-small fw-bold mb-2 text-muted text-uppercase ls-1">
                Max Price: ₹{priceRange.toLocaleString()}
              </label>
              <input 
                type="range" 
                className="form-range shadow-none accent-dark" 
                min="0" 
                max={maxAvailablePrice} 
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
            </div>

            <button 
              className="btn btn-dark w-100 rounded-0 small fw-black ls-1 py-3 mt-2 shadow-hover"
              onClick={() => {
                setCategory("All");
                setSearchTerm("");
                setSelectedSize("");
                setPriceRange(maxAvailablePrice);
              }}
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <main className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-dark">
            <h2 className="fw-black mb-0 ls-1 text-uppercase">
              {category} Products
              {searchTerm && <span className="text-muted fw-light"> / "{searchTerm}"</span>}
            </h2>
            <span className="text-muted extra-small fw-bold ls-1 uppercase">{filteredProducts.length} Pieces Found</span>
          </div>

          <div className="row g-4">
            {filteredProducts.map(product => (
              <div className="col-md-6 col-lg-4" key={product._id}>
                <ProductCard product={product} user={user} />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-5 mt-5 border border-dashed">
              <h3 className="fw-black text-uppercase ls-1">No matches found</h3>
              <p className="text-muted small fw-bold uppercase">Adjust your filters or try a different keyword.</p>
              <button className="btn btn-dark rounded-0 px-4 py-2 mt-2 ls-1 fw-bold" onClick={() => setCategory("All")}>
                VIEW ALL
              </button>
            </div>
          )}
        </main>
      </div>
      
      <style>{`
        .accent-dark { accent-color: #000; }
        .page-wrapper { min-height: 80vh; }
        .animate-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

export default Products;