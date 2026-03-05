import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Integrated Login/Register Component
 * This version connects to a Node.js/Express backend instead of localStorage.
 */
function Login() {
  const navigate = useNavigate();
  const { handleLogin } = useContext(AuthContext);

  // UI States
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // 1. Basic Validation
    if (!form.email || !form.password || (isRegister && !form.name)) {
      setError("All fields are required");
      return;
    }

    if (isRegister && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 2. Determine Endpoint
      const endpoint = isRegister ? "/api/register" : "/api/login";
      
      // 3. API Call to Backend (Change URL if your backend port differs)
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // 4. Success Logic
      // Store the JWT token for authenticated requests
      localStorage.setItem("token", data.token);

      /**
       * RS1: Update Global Auth Context
       * data.user should contain { name, email, isAdmin }
       */
      handleLogin(data.user);

      alert(isRegister ? "Account Created!" : "Welcome Back!");

      // 5. Role-based Navigation
      if (data.user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="card shadow-lg border-0 p-4"
        style={{ width: "420px", borderRadius: "15px" }}
      >
        {/* TOGGLE TABS */}
        <div className="d-flex mb-4 p-1 bg-light rounded-pill">
          <button
            type="button"
            className={`btn w-50 rounded-pill transition-all ${
              !isRegister ? "btn-dark shadow" : "btn-light text-muted"
            }`}
            onClick={() => {
              setIsRegister(false);
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn w-50 rounded-pill transition-all ${
              isRegister ? "btn-dark shadow" : "btn-light text-muted"
            }`}
            onClick={() => {
              setIsRegister(true);
              setError("");
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-3">
              <label className="small fw-bold mb-1">FULL NAME</label>
              <input
                type="text"
                name="name"
                className="form-control rounded-3 shadow-none"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="small fw-bold mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              className="form-control rounded-3 shadow-none"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold mb-1">PASSWORD</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control rounded-3 shadow-none"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div className="mb-3">
              <label className="small fw-bold mb-1">CONFIRM PASSWORD</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-control rounded-3 shadow-none"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input shadow-none"
              id="showCheck"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label small text-muted" htmlFor="showCheck">
              Show Password
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-dark w-100 py-2 rounded-pill fw-bold ls-1"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm mr-2"></span>
            ) : isRegister ? (
              "CREATE ACCOUNT"
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;