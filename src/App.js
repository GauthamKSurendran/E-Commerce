import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import ProductProvider from './context/ProductProvider';
import CartProvider from './context/CartProvider';
import OrderProvider from './context/OrderProvider';
import ReviewProvider from './context/ReviewProvider';
import WishlistProvider from './context/WishlistProvider';

// Layout & Pages
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login'; 
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import OrderSuccess from './pages/OrderSuccess';
import AdminOrders from './pages/AdminOrders';
import NotFound from './pages/NotFound';

// NEW IMPORTS: Size Guide, Payment, and Revenue Intelligence
import SizeGuide from './pages/SizeGuide'; 
import PaymentGateway from './pages/PaymentGateway';
// FIX: Added RevenueReport to handle the breakdown of your ₹4,597 earnings
import RevenueReport from './pages/RevenueReport'; 

import './App.css';

/**
 * AppContent consumes the Context. 
 * Integrated with MongoDB Auth Session and Admin Role Protection
 */
function AppContent() {
  const { user, handleLogout } = useContext(AuthContext);

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <div className="page-wrapper">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/products" element={<Products user={user} />} />
          <Route path="/product/:id" element={<ProductDetails user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/size-guide" element={<SizeGuide />} />

          {/* --- USER PROTECTED ROUTES (Requires standard login) --- */}
          <Route path="/checkout" element={user ? <Checkout user={user} /> : <Navigate to="/login" />} />
          <Route path="/payment-gateway" element={user ? <PaymentGateway user={user} /> : <Navigate to="/login" />} />
          <Route path="/order-success" element={user ? <OrderSuccess user={user} /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <OrderHistory user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/wishlist" element={user ? <Wishlist user={user} /> : <Navigate to="/login" />} />

          {/* --- ADMIN PROTECTED ROUTES (Requires isAdmin: true) --- */}
          {/* Dashboard with Total Revenue tracking */}
          <Route path="/admin/dashboard" element={user?.isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/products" element={user?.isAdmin ? <AdminProducts user={user} /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/users" element={user?.isAdmin ? <AdminUsers user={user} /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/orders" element={user?.isAdmin ? <AdminOrders user={user} /> : <Navigate to="/admin/login" />} />
          
          {/* NEW: Financial Reporting for categorical earnings breakdown */}
          <Route path="/admin/revenue" element={user?.isAdmin ? <RevenueReport /> : <Navigate to="/admin/login" />} />

          {/* Fallback for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

/**
 * Root App wrapping all MERN Context Providers
 * Provides global state for Products, Orders, and Security
 */
function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <ReviewProvider>
              <WishlistProvider>
                <AppContent />
              </WishlistProvider>
            </ReviewProvider>
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;