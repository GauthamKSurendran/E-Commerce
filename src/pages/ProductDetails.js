import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";
import { CartContext } from "../context/CartProvider";
import { ReviewContext } from "../context/ReviewProvider";
import { OrderContext } from "../context/OrderProvider"; 
import ProductCard from "../components/ProductCard";
import ProductReviews from "../components/ProductReviews"; 

/**
 * Integrated Product Details Component
 * Features: Multi-schema Inventory Logic, Stock Validation, and Category-Aware Cart Integration
 */
export default function ProductDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useContext(ProductContext);
  
  // Pull 'cart' state and 'addToCart' action
  const { addToCart, cart } = useContext(CartContext);
  const { orders } = useContext(OrderContext);
  
  const { getProductStats, getRatingDistribution } = useContext(ReviewContext);
  
  const product = products.find(p => String(p._id) === String(id));

  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(""); 

  useEffect(() => {
    if (product) {
      setActiveImage(product.images && product.images.length > 0 ? product.images[0] : product.image);
      setSelectedSize(""); 
      window.scrollTo(0, 0);
    }
  }, [product, id]);

  if (!product) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <h3 className="fw-black">PRODUCT NOT FOUND</h3>
        <button className="btn btn-dark mt-3 rounded-0 px-4" onClick={() => navigate('/products')}>
          BACK TO SHOP
        </button>
      </div>
    );
  }

  const hasDeliveredOrder = orders?.some(order => 
    (order.user === user?.id || order.userEmail === user?.email) && 
    order.status === 'Delivered' && 
    order.items.some(item => String(item.productId) === String(id))
  );

  const { reviews, average, total } = getProductStats(product._id);
  const distribution = getRatingDistribution(product._id);
  
  // --- ROBUST INVENTORY CALCULATIONS ---
  
  const totalStock = product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'object'
    ? product.sizes.reduce((acc, curr) => acc + (curr.countInStock || 0), 0)
    : product.stock || 0;

  const isGloballyInStock = totalStock > 0;

  const getStockForSize = (size) => {
    if (product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'object') {
      const sizeData = product.sizes.find(s => s.size === size);
      return sizeData ? sizeData.countInStock : 0;
    }
    
    if (product.sizes && product.sizes.length > 0 && typeof product.sizes[0] === 'string') {
      return product.sizes.includes(size) ? (product.stock || 0) : 0;
    }

    if (product.stock > 0) {
      return product.stock; 
    }

    return 0;
  };

  const selectedSizeStock = selectedSize ? getStockForSize(selectedSize) : 0;

  // --- CART INVENTORY VALIDATION ---
  const cartItem = cart.find(item => 
    (String(item.productId) === String(product._id) || String(item._id) === String(product._id)) && 
    item.selectedSize === selectedSize
  );
  const qtyInCart = cartItem ? (cartItem.quantity || cartItem.qty) : 0;
  
  const isStockLimitReached = selectedSize && selectedSizeStock > 0 && qtyInCart >= selectedSizeStock;

  // ---------------------------------------------

  const relatedProducts = products
    .filter(p => p.category === product.category && String(p._id) !== String(id))
    .slice(0, 4);

  /**
   * REVENUE FIX: Explicitly passing the category property into the cart item object.
   * This ensures that when the order is placed, the 'items' array in MongoDB 
   * contains the category needed for the Revenue Report.
   */
  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to your bag.");
      navigate('/login');
      return;
    }

    if (!isGloballyInStock) {
      alert("Sorry, this item is completely out of stock.");
      return;
    }
    
    if (!selectedSize) {
      alert("Please select a size before adding to bag.");
      return;
    }

    if (selectedSizeStock > 0 && !isStockLimitReached) {
      // We spread the whole product but explicitly re-confirm category 
      // to ensure it reaches the Order collection later.
      addToCart({
        ...product,
        productId: product._id, 
        selectedSize: selectedSize,
        category: product.category // CRITICAL: Ensures category-based revenue tracking works
      }, 1, selectedSizeStock); 
      
      alert(`${product.name} (Size: ${selectedSize}) added to bag!`);
    } else if (isStockLimitReached) {
      alert("You already have all available units of this size in your bag.");
    } else {
      alert("Sorry, this size is currently out of stock.");
    }
  };

  return (
    <div className="container mt-5 mb-5 pt-4 animate-in">
      <div className="row g-5">
        
        {/* Product Image Gallery Section */}
        <div className="col-md-7">
          <div className="row g-2">
            <div className="col-2 d-flex flex-column gap-2 order-last order-md-first">
              {product.images && product.images.length > 0 ? (
                product.images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`border cursor-pointer transition-all ${activeImage === img ? 'border-dark border-2' : 'opacity-75'}`}
                    onClick={() => setActiveImage(img)}
                    style={{ width: '100%', aspectRatio: '3/4' }}
                  >
                    <img src={img} className="w-100 h-100" alt={`View ${index + 1}`} style={{ objectFit: 'cover' }} />
                  </div>
                ))
              ) : (
                <div className="border border-dark border-2" style={{ width: '100%', aspectRatio: '3/4' }}>
                   <img src={product.image} className="w-100 h-100" alt="Main View" style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div className="col-10">
              <div className="product-image-wrapper border bg-light overflow-hidden position-relative">
                <img 
                  src={activeImage} 
                  className="img-fluid w-100" 
                  alt={product.name}
                  style={{ minHeight: '600px', objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Info Section */}
        <div className="col-md-5">
          <div className="ps-lg-4">
            <h2 className="fw-black mb-1 text-uppercase ls-1">{product.name}</h2>
            <p className="text-muted mb-3 extra-small fw-bold text-uppercase ls-2">{product.category}</p>
            
            <div className="mb-4 d-flex align-items-center">
              <span className="badge bg-dark rounded-0 px-3 py-2 fs-6">
                {total > 0 ? `${average} ★` : 'NEW'}
              </span>
              <span className="text-muted ms-3 small fw-bold text-uppercase ls-1">({total} Reviews)</span>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <h3 className="fw-black mb-0 fs-1 text-danger">₹{product.price.toLocaleString()}</h3>
              {isGloballyInStock && (
                <span className="badge bg-light text-dark border border-dark rounded-0 px-2 py-1 fw-bold">
                  {selectedSize ? `${selectedSizeStock} AVAILABLE IN ${selectedSize}` : `${totalStock} TOTAL IN STOCK`}
                </span>
              )}
            </div>
            
            {/* SIZE SELECTION SECTION */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="extra-small fw-bold text-muted text-uppercase ls-1 mb-0">Select Size</p>
                <Link to="/size-guide" className="extra-small text-dark fw-bold text-decoration-underline ls-1">SIZE GUIDE</Link>
              </div>
              <div className="d-flex gap-2">
                {["S", "M", "L", "XL", "XXL"].map(size => {
                  const sizeStock = getStockForSize(size);
                  const isAvailable = sizeStock > 0;
                  
                  return (
                    <button 
                      key={size} 
                      type="button"
                      className={`btn rounded-0 border fw-bold px-4 py-2 transition-all ${
                        !isAvailable ? 'btn-light disabled opacity-25 text-decoration-line-through' : 
                        selectedSize === size ? 'btn-dark' : 'btn-outline-dark'
                      }`}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      title={!isAvailable ? 'Out of Stock' : `${sizeStock} available`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              
              {selectedSize && selectedSizeStock === 0 && (
                <p className="text-danger small fw-bold mt-2 mb-0">This size is currently out of stock.</p>
              )}
              {!user?.isAdmin && isStockLimitReached && (
                <p className="text-warning small fw-bold mt-2 mb-0 text-dark">
                  You have all {selectedSizeStock} available units of this size in your bag.
                </p>
              )}
            </div>

            <p className="mb-5 text-secondary small" style={{ lineHeight: '1.8' }}>
              {product.description || "Premium quality fashion piece crafted for style and comfort."}
            </p>

            {/* ADMIN / CUSTOMER ACTION BUTTONS */}
            {!user?.isAdmin ? (
              <>
                <button 
                  className={`btn w-100 py-3 fw-black mb-4 rounded-0 ls-2 ${
                    !isGloballyInStock || (selectedSize && selectedSizeStock === 0) || isStockLimitReached
                      ? 'btn-secondary' 
                      : 'btn-dark shadow-hover'
                  }`}
                  onClick={handleAddToCart}
                >
                  {!isGloballyInStock ? 'SOLD OUT' : 
                   (selectedSize && selectedSizeStock === 0) ? 'SIZE OUT OF STOCK' : 
                   isStockLimitReached ? 'ALL AVAILABLE STOCK IN BAG' :
                   'ADD TO BAG'}
                </button>

                <div className="bg-light p-3 border-start border-4 border-dark">
                    <p className="extra-small fw-bold mb-1 uppercase">Free Shipping</p>
                    <p className="extra-small text-muted mb-0">On all orders above ₹4,999. Easy 7-day returns.</p>
                </div>
              </>
            ) : (
              <Link to="/admin/products" className="btn btn-outline-danger w-100 rounded-0 py-3 fw-black mb-4 d-block text-center ls-2 text-decoration-none">
                MANAGE THIS PRODUCT
              </Link>
            )}

          </div>
        </div>
      </div>

      <ProductReviews 
        productId={product._id} 
        user={user} 
        hasDeliveredOrder={hasDeliveredOrder}
        reviews={reviews}
        averageRating={average}
        totalReviews={total}
        distribution={distribution}
      />

      {relatedProducts.length > 0 && (
        <section className="mt-5 pt-5 border-top">
          <h4 className="fw-black mb-5 text-uppercase ls-2">Similar Items</h4>
          <div className="row g-4">
            {relatedProducts.map(relProduct => (
              <div key={relProduct._id} className="col-6 col-md-3">
                <ProductCard product={relProduct} user={user} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}