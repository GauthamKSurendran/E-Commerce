import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartProvider";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Integrated Shopping Cart Component for FASHION.CO
 * Aligned with MongoDB cartSchema: safely handles productId, size, and quantity.
 * Includes Size-Specific Inventory Validation.
 */
export default function Cart() { 
  const { cart, removeFromCart, updateQty } = useContext(CartContext);
  const { user } = useContext(AuthContext) || {}; 
  const navigate = useNavigate();

  // 1. SELECTION STATE: Track which items are checked for checkout
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  // Default to selecting all items when the cart initially loads
  useEffect(() => {
    const allKeys = cart.map(item => {
      const id = item.productId || item._id;
      const size = item.size || item.selectedSize || 'N/A';
      return `${id}-${size}`;
    });
    setSelectedItemKeys(allKeys);
  }, [cart]);

  // 2. TOGGLE CHECKBOX LOGIC
  const handleCheckboxChange = (itemKey) => {
    setSelectedItemKeys(prev => 
      prev.includes(itemKey) 
        ? prev.filter(key => key !== itemKey) // Uncheck
        : [...prev, itemKey] // Check
    );
  };

  // 3. DYNAMIC CALCULATIONS
  const selectedItems = cart.filter(item => {
    const id = item.productId || item._id;
    const size = item.size || item.selectedSize || 'N/A';
    return selectedItemKeys.includes(`${id}-${size}`);
  });

  const subtotal = selectedItems.reduce((acc, item) => {
    const qty = item.quantity || item.qty;
    return acc + (item.price * qty);
  }, 0);
  
  const total = subtotal;

  // 4. PROCEED TO CHECKOUT
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
    
    // Check if any selected item is currently out of stock
    const outOfStockItems = selectedItems.filter(item => item.maxStock === 0);
    if (outOfStockItems.length > 0) {
      alert("One or more items in your cart are currently out of stock. Please remove them to proceed.");
      return;
    }
    
    // Pass strictly formatted items to the Checkout page
    const formattedCheckoutItems = selectedItems.map(item => ({
        _id: item.productId || item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        selectedSize: item.size || item.selectedSize || 'N/A',
        qty: item.quantity || item.qty
    }));

    navigate('/checkout', { 
      state: { 
        checkoutItems: formattedCheckoutItems, 
        checkoutTotal: total 
      } 
    });
  };

  if (cart.length === 0) {
    return (
      <div className="container text-center py-5 mt-5">
        <h2 className="fw-light mb-4">Your shopping bag is empty.</h2>
        <button 
          className="btn btn-dark rounded-0 px-4 fw-bold" 
          onClick={() => navigate("/products")}
        >
          CONTINUE SHOPPING
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5">
      <h3 className="fw-bold mb-5 text-uppercase ls-1">Shopping Bag</h3>
      <div className="row g-5">
        <div className="col-lg-8">
          {cart.map((item, index) => {
            // Safe Variable Extraction
            const id = item.productId || item._id;
            const size = item.size || item.selectedSize || 'N/A';
            const qty = item.quantity || item.qty;
            const maxStock = item.maxStock !== undefined ? item.maxStock : 99; // Added maxStock logic
            const itemKey = `${id}-${size}`;
            const isSelected = selectedItemKeys.includes(itemKey);
            const isOutOfStock = maxStock === 0;

            return (
              <div key={`${itemKey}-${index}`} className="row border-bottom pb-4 mb-4 align-items-center">
                
                {/* CHECKBOX FOR SELECTION */}
                <div className="col-1 text-center">
                  <input 
                    className="form-check-input fs-5 border-dark rounded-0 cursor-pointer shadow-none" 
                    type="checkbox" 
                    checked={isSelected && !isOutOfStock}
                    disabled={isOutOfStock}
                    onChange={() => handleCheckboxChange(itemKey)}
                  />
                </div>

                <div className="col-3 col-md-2 position-relative">
                  <img 
                    src={item.image || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    className={`img-fluid border ${(!isSelected || isOutOfStock) && 'opacity-50'}`} 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150';
                    }} 
                  />
                  {isOutOfStock && (
                     <span className="position-absolute top-50 start-50 translate-middle badge bg-danger rounded-0 px-2 py-1 small fw-bold" style={{ whiteSpace: 'nowrap' }}>
                       OUT OF STOCK
                     </span>
                  )}
                </div>
                
                <div className="col-8 col-md-9">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className={`fw-bold mb-1 ${(!isSelected || isOutOfStock) && 'text-muted'}`}>{item.name}</h6>
                      <p className="text-muted extra-small mb-3 text-uppercase">
                        SIZE: {size}
                      </p>
                      
                      <div className="d-flex align-items-center gap-3">
                        {/* QUANTITY CONTROLS WITH MAX STOCK VALIDATION */}
                        <div className="input-group input-group-sm" style={{width: '110px'}}>
                          <button 
                            className="btn btn-outline-dark rounded-0 border-end-0 fw-bold shadow-none" 
                            onClick={() => updateQty(id, size, qty - 1, maxStock)}
                            disabled={qty <= 1 || isOutOfStock}
                          >
                            -
                          </button>
                          <span className="input-group-text bg-white border-dark rounded-0 px-3 fw-bold text-center" style={{ width: '40px' }}>
                            {isOutOfStock ? 0 : qty}
                          </span>
                          <button 
                            className="btn btn-outline-dark rounded-0 border-start-0 fw-bold shadow-none" 
                            onClick={() => updateQty(id, size, qty + 1, maxStock)}
                            disabled={qty >= maxStock || isOutOfStock}
                          >
                            +
                          </button>
                        </div>

                        {/* REMOVE BUTTON */}
                        <button 
                          className="btn btn-link text-danger p-0 small text-decoration-none fw-bold shadow-none" 
                          onClick={() => removeFromCart(id, size)}
                        >
                          REMOVE
                        </button>
                      </div>
                      
                      {/* Contextual stock warnings */}
                      {!isOutOfStock && maxStock < 5 && maxStock > 0 && (
                        <p className="text-warning small fw-bold mt-2 mb-0">Only {maxStock} left in stock</p>
                      )}
                      {qty > maxStock && maxStock > 0 && (
                        <p className="text-danger small fw-bold mt-2 mb-0">Please reduce quantity. Only {maxStock} available.</p>
                      )}

                    </div>
                    
                    <p className={`fw-bold ${(!isSelected || isOutOfStock) && 'text-muted'}`}>
                      ₹{isOutOfStock ? 0 : (item.price * qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY SECTION */}
        <div className="col-lg-4">
          <div className="card border-0 bg-light p-4 rounded-0 shadow-sm position-sticky" style={{ top: '100px' }}>
            <h5 className="fw-bold mb-4 text-uppercase ls-1">Order Summary</h5>
            
            <div className="d-flex justify-content-between mb-3 small">
              <span className="text-muted">Selected Items ({selectedItems.length})</span>
              <span className="fw-bold">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="d-flex justify-content-between mb-4 small">
              <span className="text-muted">Shipping</span>
              <span className="text-success fw-bold">FREE</span>
            </div>
            
            <hr />
            
            <div className="d-flex justify-content-between fw-bold mb-4 fs-5">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            {/* AUTH & CHECKOUT ROUTING */}
            {user ? (
              <button 
                className={`btn ${selectedItems.length > 0 ? 'btn-dark' : 'btn-secondary'} w-100 py-3 rounded-0 fw-bold ls-1 shadow-none`}
                onClick={handleProceedToCheckout}
                disabled={selectedItems.length === 0}
              >
                PROCEED TO CHECKOUT
              </button>
            ) : (
              <div className="text-center p-3 border border-dark border-opacity-10 bg-white">
                <p className="extra-small mb-3 text-muted fw-bold">SIGN IN TO COMPLETE PURCHASE</p>
                <button 
                  className="btn btn-dark w-100 py-2 rounded-0 fw-bold small ls-1 shadow-none" 
                  onClick={() => navigate("/login")}
                >
                  LOGIN
                </button>
              </div>
            )}
            
            <p className="extra-small text-muted mt-3 text-center">
              Secure Checkout Powered by FASHION.CO SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}