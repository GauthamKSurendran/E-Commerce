import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartProvider';
import { OrderContext } from '../context/OrderProvider'; // NEW: Import OrderContext
import { AuthContext } from '../context/AuthContext';    // NEW: Import AuthContext

/**
 * Backend-Integrated Payment Gateway for FASHION.CO
 * Supports Card and UPI payment modes with Selective Checkout support
 */
const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Connect to global state
  const { removeFromCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const auth = useContext(AuthContext) || {};

  // Safe LocalStorage Fallback (Prevents crashes if context is lagging)
  let localUser = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      localUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Notice: Bypassed invalid local storage data.");
  }
  const user = auth?.user || localUser;
  
  // DATA VALIDATION: Retrieve specific checkout data passed from Checkout.js
  const shipping = location.state?.shipping;
  const checkoutItems = location.state?.checkoutItems || []; // FIX: Use selected items, not full cart
  const total = location.state?.total || 0;
  const userEmail = location.state?.userEmail || user?.email;

  const [paymentMode, setPaymentMode] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: user?.name || '',
    upiId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  /**
   * BACKEND INTEGRATION: Submit Order via Global Context
   */
  const handlePayment = async (e) => {
    e.preventDefault();
    if (processing) return;
    
    setProcessing(true);

    // Prepare strict structure for MongoDB Order Schema
    const orderPayload = {
      items: checkoutItems.map(item => ({
        productId: item._id, 
        name: item.name,
        image: item.image,
        quantity: item.qty, // Matches MongoDB schema
        price: item.price,
        size: item.selectedSize || 'N/A' 
      })),
      amount: total,
      userEmail: userEmail,
      userName: user?.name || "Customer",
    };

    try {
      // FIX: Use cleanly integrated OrderContext function
      const newOrderId = await addOrder(orderPayload);

      if (newOrderId) {
        // Selective Cleanup: Loop through and remove ONLY the purchased items
        checkoutItems.forEach(item => {
            removeFromCart(item._id, item.selectedSize);
        });
        
        // Redirect to success page with the generated MongoDB Order ID
        navigate('/order-success', { state: { orderId: newOrderId } });
      } else {
        alert("Payment processing failed. Please check your connection and try again.");
      }
    } catch (err) {
      console.error("Critical Payment Failure:", err);
      alert("Network error. Please check your connection.");
    } finally {
      setProcessing(false);
    }
  };

  // Prevent direct URL access without selected checkout items
  if (!shipping || checkoutItems.length === 0) {
    return (
      <div className="container py-5 mt-5 text-center vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-black text-uppercase ls-1">Checkout Session Expired</h3>
        <p className="text-muted small fw-bold">NO ITEMS SELECTED FOR PAYMENT.</p>
        <button className="btn btn-dark rounded-0 mt-3 px-5 py-3 fw-bold ls-1" onClick={() => navigate('/cart')}>
          RETURN TO BAG
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5 animate-in">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 rounded-0 p-4 bg-white border-top border-5 border-dark">
            <h4 className="fw-black mb-4 ls-2 text-uppercase text-center">Secure Payment</h4>
            
            {/* Payment Mode Toggle */}
            <div className="d-flex mb-4 border">
              <button 
                type="button"
                className={`btn w-50 rounded-0 py-3 fw-bold ls-1 ${paymentMode === 'card' ? 'btn-dark' : 'btn-light'}`}
                onClick={() => setPaymentMode('card')}
              >
                CARD
              </button>
              <button 
                type="button"
                className={`btn w-50 rounded-0 py-3 fw-bold ls-1 ${paymentMode === 'upi' ? 'btn-dark' : 'btn-light'}`}
                onClick={() => setPaymentMode('upi')}
              >
                UPI
              </button>
            </div>

            <div className="bg-light p-3 mb-4 border-dashed border-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold small text-muted text-uppercase ls-1">Payable Amount</span>
                <span className="fw-black text-danger fs-4">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              {paymentMode === 'card' ? (
                <div className="card-fields animate-in">
                  <div className="mb-3">
                    <label className="extra-small fw-bold text-muted mb-1 ls-1">CARDHOLDER NAME</label>
                    <input type="text" name="cardName" className="form-control rounded-0 border-dark shadow-none p-3" value={paymentData.cardName} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="extra-small fw-bold text-muted mb-1 ls-1">CARD NUMBER</label>
                    <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" maxLength="16" className="form-control rounded-0 border-dark shadow-none p-3" onChange={handleInputChange} required />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3"><label className="extra-small fw-bold text-muted mb-1 ls-1">EXPIRY</label><input type="text" name="expiry" placeholder="MM/YY" maxLength="5" className="form-control rounded-0 border-dark shadow-none p-3" onChange={handleInputChange} required /></div>
                    <div className="col-6 mb-3"><label className="extra-small fw-bold text-muted mb-1 ls-1">CVV</label><input type="password" name="cvv" placeholder="***" maxLength="3" className="form-control rounded-0 border-dark shadow-none p-3" onChange={handleInputChange} required /></div>
                  </div>
                </div>
              ) : (
                <div className="upi-fields animate-in">
                  <div className="mb-4">
                    <label className="extra-small fw-bold text-muted mb-1 ls-1">UPI ID</label>
                    <input type="text" name="upiId" placeholder="username@bank" className="form-control rounded-0 border-dark shadow-none p-3" onChange={handleInputChange} required />
                    <p className="extra-small text-muted mt-2 uppercase">A request will be sent to your UPI app.</p>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-dark w-100 py-3 fw-black ls-2 rounded-0 shadow-none mt-2 border-0 shadow-hover" disabled={processing}>
                {processing ? <><span className="spinner-border spinner-border-sm me-2"></span> AUTHORIZING...</> : `PAY ₹${total.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;