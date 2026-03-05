import React, { useContext } from "react";
import { CartContext } from "../context/CartProvider";
import { WishlistContext } from "../context/WishlistProvider";
import { Link, useNavigate } from "react-router-dom";

/**
 * Optimized ProductCard Component
 * Prevents "Quick Add" without size selection for apparel
 */
function ProductCard({ product, user }) {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  // BACKEND INTEGRATION: Use MongoDB unique identifiers
  const productId = product._id; 
  const isInStock = product.stock > 0;
  const inWishlist = isInWishlist(productId);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    
    // 1. Check Authentication
    if (!user) {
      alert("Please login to add items to your bag.");
      navigate('/login');
      return;
    }
    
    if (!isInStock) return;

    // 2. SIZE VALIDATION LOGIC
    // If the product has multiple sizes, force the user to the detail page
    if (product.sizes && product.sizes.length > 1) {
      alert("Please select your preferred size on the product page.");
      navigate(`/product/${productId}`);
    } else {
      // If it's a single-size item or accessory, add directly
      const defaultSize = product.sizes?.[0] || "N/A";
      
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        size: defaultSize // Set the confirmed size
      });
      
      alert(`${product.name} added to your bag.`);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to use the wishlist.");
      navigate('/login');
      return;
    }
    inWishlist ? removeFromWishlist(productId) : addToWishlist(product);
  };

  return (
    <div className="card border-0 rounded-0 shadow-sm h-100 product-card-hover position-relative bg-white">
      <div className="position-relative overflow-hidden" style={{ height: "380px" }}>
        <Link to={`/product/${productId}`}>
          <img 
            src={product.image || "https://via.placeholder.com/300x380"} 
            className="card-img-top rounded-0 transition-all" 
            style={{ height: "100%", width: "100%", objectFit: "cover" }} 
            alt={product.name} 
          />
        </Link>
        
        {/* Stock Status Badge */}
        <span className={`position-absolute top-0 end-0 badge rounded-0 m-2 extra-small fw-bold ${isInStock ? 'bg-success' : 'bg-danger'}`}>
          {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
        </span>

        {/* Wishlist Toggle */}
        <button 
          className="btn btn-light rounded-pill position-absolute top-0 start-0 m-2 shadow-sm border-0 d-flex align-items-center justify-content-center" 
          style={{ width: "35px", height: "35px" }}
          onClick={toggleWishlist}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>

        {/* Quick Add Overlay - Logic Fixed */}
        <button 
          className="btn btn-dark w-100 rounded-0 position-absolute bottom-0 start-0 py-3 fw-black ls-1 animate-slide-up"
          id="quick-add-btn"
          onClick={handleQuickAdd}
          disabled={!isInStock}
        >
          {isInStock ? 'QUICK ADD +' : 'SOLD OUT'}
        </button>
      </div>

      <div className="card-body px-0 pt-3 bg-transparent">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-0 fw-black text-uppercase ls-1" style={{ fontSize: "0.85rem" }}>
              {product.name}
            </h6>
            <p className="text-muted extra-small fw-bold text-uppercase mb-0">{product.category}</p>
          </div>
          <p className="fw-black mb-0 text-danger">₹{product.price?.toLocaleString()}</p>
        </div>
      </div>

      {/* Hover Logic CSS */}
      <style>{`
        .product-card-hover #quick-add-btn {
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card-hover:hover #quick-add-btn {
          transform: translateY(0);
        }
        .product-card-hover:hover img {
          transform: scale(1.05);
          filter: brightness(0.9);
        }
      `}</style>
    </div>
  );
}

export default ProductCard;