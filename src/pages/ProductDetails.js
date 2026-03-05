import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProductContext } from "../context/ProductProvider";
import { CartContext } from "../context/CartProvider";
import { ReviewContext } from "../context/ReviewProvider";
import { OrderContext } from "../context/OrderProvider"; 
import ProductCard from "../components/ProductCard";
import ProductReviews from "../components/ProductReviews"; // NEW: Modular review component

export default function ProductDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);
  const { orders } = useContext(OrderContext);
  const { getProductReviews, getAverageRating } = useContext(ReviewContext);
  
  const product = products.find(p => String(p._id) === String(id));

  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(""); 

  useEffect(() => {
    if (product) {
      setActiveImage(product.images && product.images.length > 0 ? product.images[0] : product.image);
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

  // Check if the user is a verified buyer of this exact item
  const hasDeliveredOrder = orders?.some(order => 
    (order.user === user?.id || order.userEmail === user?.email) && 
    order.status === 'Delivered' && 
    order.items.some(item => String(item.productId) === String(id))
  );

  // Stats for the top badge
  const productReviews = getProductReviews(product._id);
  const averageRating = getAverageRating(product._id);
  const isInStock = product.stock > 0;

  const relatedProducts = products
    .filter(p => p.category === product.category && String(p._id) !== String(id))
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to your bag.");
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      alert("Please select a size before adding to bag.");
      return;
    }

    if (isInStock) {
      addToCart({
        ...product,
        productId: product._id, 
        selectedSize: selectedSize
      });
      alert(`${product.name} (Size: ${selectedSize}) added to bag!`);
    }
  };

  return (
    <div className="container mt-5 mb-5 pt-5 animate-in">
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
                {isInStock && product.stock < 5 && (
                  <span className="position-absolute top-0 end-0 m-3 badge bg-danger rounded-0 px-3 py-2 fw-bold small">
                    ONLY {product.stock} LEFT
                  </span>
                )}
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
                {averageRating > 0 ? `${averageRating} ★` : 'NEW'}
              </span>
              <span className="text-muted ms-3 small fw-bold text-uppercase ls-1">({productReviews.length} Reviews)</span>
            </div>

            <h3 className="fw-black mb-4 fs-1 text-danger">₹{product.price.toLocaleString()}</h3>
            
            {/* SIZE SELECTION SECTION */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="extra-small fw-bold text-muted text-uppercase ls-1 mb-0">Select Size</p>
                <Link to="/size-guide" className="extra-small text-dark fw-bold text-decoration-underline ls-1">SIZE GUIDE</Link>
              </div>
              <div className="d-flex gap-2">
                {["S", "M", "L", "XL", "XXL"].map(size => {
                  const isAvailable = product.sizes?.includes(size);
                  return (
                    <button 
                      key={size} 
                      type="button"
                      className={`btn rounded-0 border fw-bold px-4 py-2 transition-all ${
                        !isAvailable ? 'btn-light disabled opacity-25' : 
                        selectedSize === size ? 'btn-dark' : 'btn-outline-dark'
                      }`}
                      onClick={() => isAvailable && setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mb-5 text-secondary small" style={{ lineHeight: '1.8' }}>
              {product.description || "Premium quality fashion piece crafted for style and comfort."}
            </p>

            <button 
              className={`btn w-100 py-3 fw-black mb-4 rounded-0 ls-2 ${isInStock ? 'btn-dark shadow-hover' : 'btn-secondary disabled'}`}
              onClick={handleAddToCart}
              disabled={!isInStock}
            >
              {isInStock ? 'ADD TO BAG' : 'OUT OF STOCK'}
            </button>

            <div className="bg-light p-3 border-start border-4 border-dark">
                <p className="extra-small fw-bold mb-1 uppercase">Free Shipping</p>
                <p className="extra-small text-muted mb-0">On all orders above ₹4,999. Easy 7-day returns.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODULAR COMPONENT: RATE & REVIEW SECTION */}
      {/* Passing hasDeliveredOrder so the component knows if this user is a verified buyer */}
      <ProductReviews 
        productId={product._id} 
        user={user} 
        hasDeliveredOrder={hasDeliveredOrder} 
      />

      {/* Related Products */}
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