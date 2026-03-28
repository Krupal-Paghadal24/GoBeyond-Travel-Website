import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="navbar">

      {/* ✅ FIXED: inline styles guarantee logo left, links right */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",  /* logo LEFT, links RIGHT */
        alignItems: "center",
        padding: "16px 60px",
        width: "100%",
        boxSizing: "border-box"
      }}>

        {/* LOGO — left side */}
        <div className="logo" onClick={() => navigate("/")}>
          <i className="bi bi-airplane-engines" style={{ marginRight: "8px", fontSize: "20px" }}></i>
          GoBeyond
        </div>

        {/* LINKS — right side */}
        <ul style={{
          display: "flex",
          listStyle: "none",
          gap: "25px",
          alignItems: "center",
          margin: "0",
          padding: "0",
        }}>

          <li
            className={location.pathname === "/" ? "active" : ""}
            onClick={() => navigate("/")}
            style={{ cursor: "pointer", fontWeight: "500", color: location.pathname === "/" ? "#00796b" : "#0b3d2e" }}
          >
            <i className="bi bi-house-door"></i>
            Home
          </li>

          <li
            onClick={() => navigate("/trips")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#0b3d2e" }}
          >
            <i className="bi bi-compass"></i>
            Trips
          </li>

          <li
            onClick={() => navigate("/smart-trips")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#0b3d2e" }}
          >
            <i className="bi bi-robot"></i>
            Smart Trips
          </li>

          <li
            onClick={() => navigate("/my-trips")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#0b3d2e" }}
          >
            <i className="bi bi-bookmark-check"></i>
            My Trips
          </li>

          <li
            className={location.pathname === "/blog" ? "active" : ""}
            onClick={() => navigate("/blog")}
            style={{ cursor: "pointer", fontWeight: "500", color: location.pathname === "/blog" ? "#00796b" : "#0b3d2e" }}
          >
            <i className="bi bi-newspaper"></i>
            Blog
          </li>

          <li
            className={location.pathname === "/know-us" ? "active" : ""}
            onClick={() => navigate("/know-us")}
            style={{ cursor: "pointer", fontWeight: "500", color: location.pathname === "/know-us" ? "#00796b" : "#0b3d2e" }}
          >
            <i className="bi bi-info-circle"></i>
            Know Us
          </li>

          <li>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                {/* ✅ Profile pill — shows name + logout */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "white",
                  border: "2px solid #0b3d2e",
                  borderRadius: "25px",
                  padding: "5px 14px 5px 6px",
                  cursor: "pointer"
                }}>
                  {/* Avatar circle with first letter */}
                  <div style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#0b3d2e",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    flexShrink: 0
                  }}>
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0b3d2e" }}>
                    {user.firstName}
                  </span>
                </div>

                {/* Logout button */}
                <button className="login-btn" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" style={{ marginRight: "4px" }}></i>
                  Logout
                </button>

              </div>
            ) : (
              <button className="login-btn" onClick={() => navigate("/login")}>
                <i className="bi bi-person-circle" style={{ marginRight: "4px" }}></i>
                Login
              </button>
            )}
          </li>

        </ul>

      </div>
    </div>
  );
}

export default Navbar;