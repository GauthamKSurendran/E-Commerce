import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New: Loading state

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Basic Client-Side Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 2. API Call to your Node.js Backend
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If backend sends a 400 or 500 error
        throw new Error(data.message || "Registration failed");
      }

      // 3. Success Logic
      alert("Registration Successful! Please login.");
      navigate("/login");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "85vh" }}
    >
      <div className="card shadow-lg border-0 p-4" style={{ width: "420px", borderRadius: "15px" }}>
        <h3 className="text-center fw-bold mb-2">Create Account 🚀</h3>
        <p className="text-center text-muted mb-4">
          Join Fashion Store today
        </p>

        {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="small fw-bold mb-1">FULL NAME</label>
            <input
              type="text"
              name="name"
              className="form-control rounded-3 shadow-none"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              name="email"
              className="form-control rounded-3 shadow-none"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold mb-1">PASSWORD</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control rounded-3 shadow-none"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold mb-1">CONFIRM PASSWORD</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              className="form-control rounded-3 shadow-none"
              placeholder="Re-type password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input shadow-none"
              type="checkbox"
              id="regCheck"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="form-check-label small text-muted" htmlFor="regCheck">
              Show Password
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-success w-100 rounded-pill fw-bold py-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "REGISTER"
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link to="/login" className="fw-semibold text-success text-decoration-none">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;