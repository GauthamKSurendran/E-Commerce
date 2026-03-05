import React, { useState, useContext, useEffect, useMemo } from "react"; // FIX: Imported useMemo
import { CartContext } from "../context/CartProvider";
import { OrderContext } from "../context/OrderProvider"; 
import { AuthContext } from "../context/AuthContext"; 
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Backend-Integrated Checkout Component
 * Uses a strict, crash-proof LocalStorage fallback to guarantee newly added addresses are visible
 */
export default function Checkout() { 
  const { removeFromCart } = useContext(CartContext); 
  const { addOrder } = useContext(OrderContext); 
  const auth = useContext(AuthContext) || {}; 
  
  // --- CRITICAL FIX: SAFE LOCAL STORAGE PARSING ---
  let localUser = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      localUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Notice: Bypassed invalid local storage data.");
  }

  // Prioritize AuthContext, but fall back to localUser if AuthContext is lagging
  const user = (auth?.user?.addresses?.length > 0) ? auth.user : (localUser?.addresses ? localUser : auth?.user);
  
  // --- ESLINT FIX: Wrapped addresses in useMemo ---
  // This prevents React from recreating an empty array on every render, solving the dependency warning
  const addresses = useMemo(() => user?.addresses || [], [user?.addresses]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 1. GRAB PASSED DATA FROM ROUTER STATE
  const checkoutItems = location.state?.checkoutItems || [];
  const checkoutTotal = location.state?.checkoutTotal || 0;

  // Initialize shipping state with completely empty defaults to prevent stale overrides
  const [shipping, setShipping] = useState({ 
    name: user?.name || '', 
    street: '', 
    city: '', 
    state: '', 
    zip: '' 
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // AUTO-FILL LOGIC
  useEffect(() => {
    if (addresses.length > 0 && !shipping.street) {
      setShipping(prev => ({
        name: prev.name || user?.name || '',
        street: addresses[0].street,
        city: addresses[0].city,
        state: addresses[0].state,
        zip: addresses[0].zip
      }));
    }
  }, [addresses, user?.name, shipping.street]);

  const handleSelectSavedAddress = (addr) => {
    setShipping({
      name: user?.name || '',
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip
    });
  };

  // Prevent direct URL access without selected cart items
  if (!location.state || checkoutItems.length === 0) {
    return (
      <div className="container py-5 text-center mt-5 vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-black text-uppercase">No Items Selected</h3>
        <p className="text-muted small fw-bold">PLEASE SELECT ITEMS FROM YOUR BAG TO CHECKOUT.</p>
        <button className="btn btn-dark rounded-0 px-5 py-3 mt-3 fw-bold ls-1 shadow-none" onClick={() => navigate("/cart")}>
          RETURN TO BAG
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!shipping.name || !shipping.street || !shipping.city || !shipping.state || !shipping.zip) {
      alert("Please fill in all shipping details");
      return;
    }

    if (!user || (!user.email && !localUser.email)) {
      alert("Please log in to complete your purchase");
      navigate("/login");
      return;
    }

    const activeEmail = user?.email || localUser?.email;

    if (paymentMethod === "card") {
      navigate("/payment-gateway", { 
        state: { 
          shipping, 
          checkoutItems, 
          total: checkoutTotal, 
          userEmail: activeEmail 
        } 
      });
    } 
    else if (paymentMethod === "upi") {
      if (!upiId.includes("@")) {
        alert("Please enter a valid UPI ID (e.g. user@bank)");
        return;
      }
      await processFinalOrder("UPI", activeEmail);
    } 
    else {
      await processFinalOrder("COD", activeEmail);
    }
  };

  const processFinalOrder = async (method, activeEmail) => {
    setIsProcessing(true);

    const orderData = { 
      items: checkoutItems.map(item => ({
        productId: item._id, 
        name: item.name,
        image: item.image, 
        quantity: item.qty, 
        price: item.price,
        size: item.selectedSize || 'N/A'
      })),
      userEmail: activeEmail,
      userName: user?.name || localUser?.name || "Customer",
      amount: checkoutTotal, 
    };

    try {
      const newOrderId = await addOrder(orderData);

      if (newOrderId) {
        checkoutItems.forEach(item => {
            removeFromCart(item._id, item.selectedSize);
        });
        
        navigate("/order-success", { state: { orderId: newOrderId } });
      } else {
        alert(`Order Failed. Please check your connection and try again.`);
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Connection error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-5 mt-5 animate-in">
      <div className="row g-5">
        
        {/* SHIPPING & PAYMENT FORM */}
        <div className="col-lg-7">
          <h4 className="fw-black text-uppercase ls-1 mb-4 border-bottom pb-2 border-dark">Shipping Details</h4>
          
          {addresses.length > 0 && (
            <div className="mb-5">
              <label className="extra-small fw-bold mb-3 text-muted text-uppercase ls-2">Select Saved Address</label>
              <div className="row g-3">
                {addresses.map((addr, index) => (
                  <div key={index} className="col-md-6">
                    <div 
                      className={`card p-3 rounded-0 transition-all ${shipping.street === addr.street ? 'border-dark bg-light shadow-none' : 'border-light shadow-sm'}`}
                      onClick={() => handleSelectSavedAddress(addr)}
                      style={{ cursor: 'pointer' }}
                    >
                      <p className="extra-small fw-bold mb-1 text-uppercase text-primary">{addr.name || `Address ${index + 1}`}</p>
                      <p className="extra-small text-muted mb-0 fw-bold">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="row g-4">
            <div className="col-12">
              <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2">Full Name</label>
              <input type="text" className="form-control rounded-0 p-3 border-dark shadow-none" required 
                value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
            </div>
            <div className="col-12">
              <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2">Street Address</label>
              <input type="text" className="form-control rounded-0 p-3 border-dark shadow-none" required 
                value={shipping.street} onChange={e => setShipping({...shipping, street: e.target.value})} />
            </div>
            <div className="col-md-4">
              <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2">City</label>
              <input type="text" className="form-control rounded-0 p-3 border-dark shadow-none" required 
                value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
            </div>
            <div className="col-md-4">
              <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2">State</label>
              <input type="text" className="form-control rounded-0 p-3 border-dark shadow-none" required 
                value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} />
            </div>
            <div className="col-md-4">
              <label className="extra-small fw-bold text-muted text-uppercase ls-1 mb-2">ZIP / Postal Code</label>
              <input type="text" className="form-control rounded-0 p-3 border-dark shadow-none" required 
                value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} />
            </div>

            <div className="col-12 mt-5">
              <h4 className="fw-black text-uppercase ls-1 mb-4">Payment Method</h4>
              <div className="list-group rounded-0 border-dark">
                
                {/* CARD PAYMENT */}
                <div className={`list-group-item py-3 border-dark ${paymentMethod === 'card' ? 'bg-light' : ''}`}>
                  <label className="d-flex gap-3 align-items-center w-100 m-0 cursor-pointer">
                    <input className="form-check-input shadow-none m-0" type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <span className="fw-black small text-uppercase ls-1">Credit / Debit Card</span>
                  </label>
                </div>
                
                {/* UPI PAYMENT */}
                <div className={`list-group-item py-3 border-dark ${paymentMethod === 'upi' ? 'bg-light' : ''}`}>
                  <label className="d-flex gap-3 align-items-center w-100 m-0 cursor-pointer">
                    <input className="form-check-input shadow-none m-0" type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                    <span className="fw-black small text-uppercase ls-1">UPI Payment (GPay, PhonePe)</span>
                  </label>
                  {paymentMethod === 'upi' && (
                    <div className="mt-3 ms-4 ps-2">
                      <input type="text" className="form-control rounded-0 border-dark shadow-none" placeholder="VPA Address (e.g. user@upi)" 
                        value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
                    </div>
                  )}
                </div>

                {/* COD PAYMENT */}
                <div className={`list-group-item py-3 border-dark ${paymentMethod === 'cod' ? 'bg-light' : ''}`}>
                  <label className="d-flex gap-3 align-items-center w-100 m-0 cursor-pointer">
                    <input className="form-check-input shadow-none m-0" type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <span className="fw-black small text-uppercase ls-1">Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="col-12">
              <button 
                type="submit"
                className="btn btn-dark w-100 py-3 mt-4 fw-black ls-2 rounded-0 shadow-hover border-0" 
                disabled={isProcessing}
              >
                {isProcessing ? 'AUTHORIZING...' : paymentMethod === 'card' ? 'PROCEED TO PAYMENT' : 'COMPLETE TRANSACTION'}
              </button>
            </div>
          </form>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="col-lg-5">
          <div className="bg-light p-4 border border-dark rounded-0 sticky-top shadow-sm" style={{ top: '100px' }}>
              <h5 className="fw-black text-uppercase ls-1 mb-4 border-bottom pb-2">Order Summary</h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="small fw-bold text-muted text-uppercase">Selected Items ({checkoutItems.length})</span>
                <span className="small fw-bold">₹{checkoutTotal.toLocaleString()}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4 border-bottom pb-3">
                <span className="small fw-bold text-muted text-uppercase">Shipping</span>
                <span className="small fw-bold text-success uppercase">FREE</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4 fs-3">
                <span className="fw-black text-uppercase">Total</span>
                <span className="fw-black text-danger">₹{checkoutTotal.toLocaleString()}</span>
              </div>

              <div className="mt-4 pt-3 border-top border-dark">
                  <h6 className="fw-black text-uppercase extra-small ls-1 mb-3">Items in this Order:</h6>
                  {checkoutItems.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-3">
                          <img 
                            src={item.image || 'https://via.placeholder.com/50'} 
                            alt={item.name}
                            className="img-fluid border border-dark me-3"
                            style={{ width: '45px', height: '60px', objectFit: 'cover' }} 
                          />
                          <div>
                            <p className="fw-bold mb-0 small" style={{ lineHeight: '1.2' }}>{item.name}</p>
                            <p className="extra-small text-muted mb-0 fw-bold text-uppercase">
                              QTY: {item.qty} | SIZE: {item.selectedSize || 'N/A'}
                            </p>
                          </div>
                      </div>
                  ))}
              </div>

              <p className="extra-small text-muted text-uppercase fw-bold ls-1 mb-0 border-top pt-3 mt-3 text-center">
                <i className="bi bi-shield-lock-fill me-2 text-dark"></i>
                Secure SSL Encrypted Transaction
              </p>
          </div>
        </div>

      </div>
    </div>
  );
}