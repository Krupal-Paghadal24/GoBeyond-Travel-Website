import React, { useState } from "react";
import API from "../api/axiosInstance"; // ✅ FIXED: was using old axios
import { useNavigate, Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import "../styles/login.css";

function Login() {

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");         // ✅ ADDED: proper error state
  const [loading, setLoading] = useState(false);  // ✅ ADDED: loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);
      setError("");

      const res = await API.post("/api/auth/login", form); // ✅ FIXED: was using old axios + full URL

      // ✅ FIXED: save role INSIDE the user object in localStorage
      // Before: localStorage had { _id, firstName, lastName, email } — NO role
      // After:  localStorage has { _id, firstName, lastName, email, role } — WITH role
      // AdminProtectedRoute checks user.role — so role must be inside the user object
      localStorage.setItem("user", JSON.stringify({
        ...res.data.user,
        role: res.data.role  // ← this is the key fix
      }));

      // ✅ Also save token for future API calls
      localStorage.setItem("token", res.data.token);

      // ✅ Redirect based on role
      if (res.data.role === "admin") {
        navigate("/admin");       // → admin dashboard
      } else {
        navigate("/");            // → user homepage
      }

    } catch (err) {

      // ✅ FIXED: shows actual backend error message
      const msg = err.response?.data?.message || "Invalid Email or Password";
      setError(msg);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="main-container">
      <div className="login-box">
        <h2 className="login-title">Login to Your Account</h2>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="remember">
            <input type="checkbox" />
            <span>Remember me?</span>
          </div>

          {/* ✅ ADDED: show error message */}
          {error && (
            <p style={{ color: "red", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

        </form>

        <p className="forgot">Forgot Password?</p>

        <p className="signUp">
          Don't have an account?{" "}
          <Link to="/signup">
            <span>Sign Up</span>
          </Link>
        </p>

      </div>

      <div className="right-content">
        <h1>
          THE GOAL OF LIFE IS <br />
          LIVING IN AGREEMENT <br />
          WITH NATURE.
        </h1>

        <div className="line"></div>

        <div className="social-icons">
          <FaFacebookF />
          <FaInstagram />
          <FaLinkedinIn />
          <FaTwitter />
        </div>

        <h2 className="brand">GoBeyond</h2>
      </div>
    </div>
  );
}

export default Login;