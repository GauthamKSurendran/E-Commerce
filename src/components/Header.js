import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartProvider';

export default function Header({ user, onLogout }) {
  const { cart } = useContext(CartContext);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const menuData = {
    Men: {
      Topwear: ["T-Shirts", "Casual Shirts", "Formal Shirts", "Jackets", "Suits"],
      Bottomwear: ["Jeans", "Casual Trousers", "Formal Trousers", "Shorts"],
    },
    Women: {
      "Indian & Fusion": ["Kurtas & Suits", "Sarees", "Ethnic Wear", "Lehenga Cholis"],
      Western: ["Dresses", "Tops", "Tshirts", "Jeans", "Jumpsuits"],
    },
    Kids: {
      Boys: ["T-Shirts", "Shirts", "Shorts", "Jeans", "Trousers"],
      Girls: ["Dresses", "Tops", "Tshirts", "Clothing Sets", "Skirts"],
      Infants: ["Bodysuits", "Rompers", "Clothing Sets", "Bottom wear"],
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm.trim()}`);
      setSearchTerm("");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm p-0">
      <div className="container">
        {/* 1. BRAND LOGO */}
        <Link className="navbar-brand fw-black fs-2 py-3" to="/">
          FASHION<span className="text-muted">.CO</span>
        </Link>

        {/* 2. MOBILE TOGGLE */}
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* 3. NAVIGATION AREA */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav gap-1 fw-bold h-100 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link py-4 px-3 ls-1" to="/">HOME</Link>
            </li>

            {Object.keys(menuData).map((category) => (
              <li 
                key={category}
                className="nav-item position-static"
                onMouseEnter={() => setActiveMenu(category)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link className="nav-link py-4 px-3 ls-1" to={`/products?category=${category}`}>
                  {category.toUpperCase()}
                </Link>

                {activeMenu === category && (
                  <div className="mega-menu-dropdown shadow-sm border-top border-bottom">
                    <div className="container py-4">
                      <div className="row">
                        {Object.entries(menuData[category]).map(([section, items]) => (
                          <div className="col-md-2" key={section}>
                            <h6 className="fw-bold text-danger small mb-3">{section.toUpperCase()}</h6>
                            <ul className="list-unstyled">
                              {items.map(item => (
                                <li key={item} className="mb-2">
                                  <Link to={`/products?category=${category}&sub=${item}`} className="text-decoration-none text-dark small menu-item-link">
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* 4. INTEGRATED SEARCH */}
          <form onSubmit={handleSearch} className="d-flex ms-auto me-lg-4 my-2 my-lg-0 position-relative" style={{ width: '200px' }}>
            <input 
              type="text" 
              className="form-control rounded-0 border-light bg-light small shadow-none ps-4" 
              placeholder="Search..." 
              style={{ fontSize: '0.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="bi bi-search position-absolute text-muted" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem' }}></i>
          </form>
        </div>

        {/* 5. ACTION ICONS & ADMIN LOGIC */}
        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              {/* PROFILE LINK */}
              <Link to="/profile" className="text-dark text-decoration-none d-flex flex-column align-items-center">
                <i className="bi bi-person fs-5"></i>
                <span className="fw-bold d-none d-md-block ls-1" style={{fontSize: '0.6rem'}}>PROFILE</span>
              </Link>
              
              {/* NEW WISHLIST LINK */}
              <Link to="/wishlist" className="text-dark text-decoration-none d-flex flex-column align-items-center">
                <i className="bi bi-heart fs-5"></i>
                <span className="fw-bold d-none d-md-block ls-1" style={{fontSize: '0.6rem'}}>WISHLIST</span>
              </Link>
            </>
          )}

          {/* BAG LINK */}
          <Link to="/cart" className="position-relative text-dark text-decoration-none d-flex flex-column align-items-center">
            <i className="bi bi-bag fs-5"></i>
            <span className="fw-bold d-none d-md-block ls-1" style={{fontSize: '0.6rem'}}>BAG</span>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger" style={{fontSize: '0.5rem', padding: '0.25rem 0.4rem'}}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* RESTORED ADMIN & AUTH GROUP */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                {/* Admin button only shows if user.isAdmin is true */}
                {user.isAdmin && (
                  <Link to="/admin/dashboard" className="btn btn-outline-danger btn-sm rounded-0 fw-bold px-2 ls-1" style={{ fontSize: '0.65rem' }}>
                    ADMIN
                  </Link>
                )}
                <button onClick={onLogout} className="btn btn-dark btn-sm rounded-0 fw-bold px-2 ls-1" style={{ fontSize: '0.65rem' }}>
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-dark btn-sm rounded-0 fw-bold px-3 ls-1" style={{ fontSize: '0.7rem' }}>
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}