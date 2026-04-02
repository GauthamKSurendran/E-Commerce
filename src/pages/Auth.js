import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Ensure this matches your file structure

/**
 * Backend-Integrated Authentication Component
 * Handles Login and Registration for FASHION.CO
 */
export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext); // Use login function from your AuthContext
  const navigate = useNavigate();

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user types
  };

  // BACKEND INTEGRATION: Submit to Node.js/MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = isRegistering 
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
        const response = await fetch(`https://e-commerce-backend-9-t3c1.onrender.com${endpoint}`, {        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Store token and update global Auth state
        localStorage.setItem('token', data.token);
        login(data.user); // Pass user object to Context
        
        // Redirect based on role
        if (data.user.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError("Server connection failed. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light animate-in">
      <div className="card p-5 shadow-sm border-0 rounded-0" style={{ width: '420px' }}>
        <h2 className="fw-black mb-4 text-center text-uppercase ls-1">
          {isRegistering ? 'Create Account' : 'Sign In'}
        </h2>

        {error && (
          <div className="alert alert-danger rounded-0 small fw-bold mb-4 py-2 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="mb-3">
              <label className="extra-small fw-bold text-muted ls-1">FULL NAME</label>
              <input 
                type="text" 
                name="name"
                className="form-control rounded-0 shadow-none border-dark" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          )}
          <div className="mb-3">
            <label className="extra-small fw-bold text-muted ls-1">EMAIL ADDRESS</label>
            <input 
              type="email" 
              name="email"
              className="form-control rounded-0 shadow-none border-dark" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-4">
            <label className="extra-small fw-bold text-muted ls-1">PASSWORD</label>
            <input 
              type="password" 
              name="password"
              className="form-control rounded-0 shadow-none border-dark" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-dark w-100 py-3 rounded-0 mb-3 fw-black ls-2"
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : (isRegistering ? 'REGISTER' : 'SIGN IN')}
          </button>
        </form>

        <p className="text-center small text-muted mb-0">
          {isRegistering ? 'Already have an account?' : 'New to FASHION.CO?'}
          <button 
            className="btn btn-link text-dark fw-bold text-decoration-underline p-0 ms-2 small"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}