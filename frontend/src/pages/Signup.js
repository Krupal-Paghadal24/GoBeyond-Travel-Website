import React, { useState } from "react";
import API from "../api/axiosInstance";  // ✅ FIXED: was still using old axios import
import { useNavigate, Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import "../styles/login.css";
import "../styles/signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    password: "",
    phone: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ ADDED: loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    try {

      setLoading(true);
      setError("");

      await API.post("/api/auth/signup", formData); // ✅ FIXED: was still using full axios URL

      alert("Signup Successful! Please login.");
      navigate("/login"); // ✅ FIXED: was navigating to "/HomePage" which doesn't exist — correct path is "/login"

    } catch (err) {

      // ✅ FIXED: now shows the actual error from backend instead of just "Signup Failed"
      const msg = err.response?.data?.message || "Signup failed. Please try again.";
      setError(msg);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="main-container">
      <div className="login-box">
        <h2 className="text-center mb-4">Create Your Account</h2>

        <form onSubmit={handleSubmit}>

          {/* First Name */}
          <div className="row mb-3 align-items-center">
            <label className="col-sm-4 col-form-label">First Name</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name="firstName"
                placeholder="Enter first name"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="row mb-3 align-items-center">
            <label className="col-sm-4 col-form-label">Last Name</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name="lastName"
                placeholder="Enter last name"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Gender */}
          <div className="row mb-3 align-items-center">
            <label className="col-sm-4 col-form-label">Gender</label>
            <div className="col-sm-8">
              <select
                className="form-select"
                name="gender"
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div className="row mb-3 align-items-center">
            <label className="col-sm-4 col-form-label">Email</label>
            <div className="col-sm-8">
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="row mb-3 align-items-center">
            <label className="col-sm-4 col-form-label">Phone</label>
            <div className="col-sm-8">
              <input
                type="text"
                className="form-control"
                name="phone"
                placeholder="Enter 10 digit phone number"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="row mb-4 align-items-center">
            <label className="col-sm-4 col-form-label">Password</label>
            <div className="col-sm-8">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter password"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-danger text-center">{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-light w-100 fw-bold"
            disabled={loading}
          >
            {loading ? "Signing up..." : "SIGN UP"} {/* ✅ ADDED: loading text */}
          </button>

        </form>

        <p className="SignUp mt-3 text-center">
          Already have an account?{" "}
          <Link to="/login">  {/* ✅ FIXED: was linking to "/" */}
            <span>Login</span>
          </Link>
        </p>
      </div>

      <div className="right-content">
        <h1>
          START YOUR JOURNEY <br />
          WITH CONFIDENCE <br />
          AND EXPLORE MORE.
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

export default Signup;