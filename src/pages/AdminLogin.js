import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { handleLogin, user } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Redirect if user is already logged in as Admin.
   * Prevents authenticated users from accessing the login page.
   */
  useEffect(() => {
    if (user?.isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  /**
   * Form Submission Handler
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset state before attempt
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. BACKEND API CALL
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await response.json();

      // 2. HTTP ERROR HANDLING
      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials.");
      }

      // 3. PRIVILEGE VALIDATION
      if (!data.user || !data.user.isAdmin) {
        throw new Error("Access Denied: This portal is for administrators only.");
      }

      // 4. PERSISTENCE & SESSION MANAGEMENT
      localStorage.setItem("token", data.token);
      
      // Update AuthContext global state
      handleLogin(data.user);

      // 5. SUCCESS FEEDBACK
      navigate("/admin/dashboard");
      
    } catch (err) {
      setError(err.message === "Failed to fetch" 
        ? "Server is offline. Please check your connection." 
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      <div className="card shadow-lg border-0 p-4" style={{ width: "420px", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: "2rem" }}>🔐</div>
          <h3 className="fw-bold mb-1">Admin Portal</h3>
          <p className="text-muted small">Manage your store inventory and orders</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="alert alert-danger py-2 small text-center border-0 rounded-3 shadow-sm mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="small fw-bold mb-1 text-muted text-uppercase ls-1">Admin Email</label>
            <input
              type="email"
              className="form-control rounded-3 shadow-none border-light bg-light"
              placeholder="name@fashionco.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold mb-1 text-muted text-uppercase ls-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control rounded-3 shadow-none border-light bg-light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input shadow-none cursor-pointer"
              type="checkbox"
              id="showPass"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label small text-muted cursor-pointer" htmlFor="showPass">
              Show Password
            </label>
          </div>

          <button 
            className={`btn btn-dark w-100 rounded-pill py-3 fw-bold ls-1 shadow-sm transition-all ${loading ? 'opacity-75' : ''}`} 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                AUTHENTICATING...
              </>
            ) : (
              "SIGN IN TO DASHBOARD"
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-light border border-dashed rounded-3 text-center">
          <p className="mb-1 extra-small text-uppercase fw-bold text-muted">Staging Environment Credentials</p>
          <code className="small text-danger">admin@gmail.com / admin123</code>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;