import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Trips() {

  const [trips,    setTrips]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();

  const categories = ["All", "Adventure", "Cultural", "Nature", "Industrial", "Educational"];

  // Bootstrap icon per category
  const categoryIcon = {
    "All":         "bi-grid",
    "Adventure":   "bi-activity",
    "Cultural":    "bi-building",
    "Nature":      "bi-tree",
    "Industrial":  "bi-buildings",
    "Educational": "bi-mortarboard",
  };


  /* ================= FETCH TRIPS ================= */

  useEffect(() => {
    API.get("/api/trips")
      .then(res => { setTrips(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);


  /* ================= FILTER ================= */

  const filtered = trips.filter(trip => {
    const matchSearch =
      trip.title?.toLowerCase().includes(search.toLowerCase()) ||
      trip.location?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || trip.category === category;
    return matchSearch && matchCat;
  });


  /* ================= RENDER ================= */

  return (
    <div style={{ background: "#f8fffe", minHeight: "100vh" }}>

      <Navbar />

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg, #0f5132 0%, #0d9488 100%)", padding: "48px 24px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          <i className="bi bi-geo-alt" style={{ marginRight: "10px" }}></i>
          Explore Indian Destinations
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.85, marginBottom: "24px" }}>
          Discover trips crafted for curious minds
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", background: "white", borderRadius: "50px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", paddingLeft: "18px", color: "#94a3b8" }}>
            <i className="bi bi-search" style={{ fontSize: "16px" }}></i>
          </div>
          <input
            type="text"
            placeholder="Search by destination or trip name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: "14px 16px", border: "none", outline: "none", fontSize: "14px", color: "#1e293b" }}
          />
          <button style={{ padding: "14px 24px", background: "#0f5132", color: "white", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            Search
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: "8px 20px", borderRadius: "25px", border: "2px solid",
                cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "6px",
                borderColor: category === cat ? "#0f5132" : "#e2e8f0",
                background:  category === cat ? "#0f5132" : "white",
                color:       category === cat ? "white"   : "#475569"
              }}>
              <i className={`bi ${categoryIcon[cat]}`}></i>
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
          <i className="bi bi-list-ul" style={{ marginRight: "6px" }}></i>
          {loading ? "Loading trips..." : `${filtered.length} trip${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: "32px", display: "block", marginBottom: "10px" }}></i>
            Loading trips...
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <i className="bi bi-search" style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}></i>
            <p>No trips found. Try a different search or category.</p>
          </div>
        )}

        {/* Trip cards grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {filtered.map(trip => (
              <div
                key={trip._id}
                onClick={() => navigate(`/trips/${trip._id}`)}
                style={{ background: "white", borderRadius: "14px", overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"; }}
              >

                {/* Trip image */}
                <div style={{ background: "#f0fdf4", overflow: "hidden", position: "relative" }}>
                  {trip.images && trip.images.length > 0 ? (
                    <img
                      src={`${BASE_URL}/uploads/${trip.images[0]}`}
                      alt={trip.title}
                      style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ height: "200px", background: "linear-gradient(135deg, #0f5132, #0d9488)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-airplane" style={{ fontSize: "48px", color: "white", opacity: 0.7 }}></i>
                    </div>
                  )}
                  {trip.category && (
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(15,81,50,0.85)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className={`bi ${categoryIcon[trip.category] || "bi-tag"}`}></i>
                      {trip.category}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: "18px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>
                    {trip.title}
                  </h3>

                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: "#0f5132" }}></i>
                    {trip.location}
                  </div>

                  {trip.duration && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <i className="bi bi-clock"></i>
                      {trip.duration}
                    </div>
                  )}

                  {trip.description && (
                    <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {trip.description}
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Starting from</div>
                      <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f5132", display: "flex", alignItems: "center", gap: "2px" }}>
                        <i className="bi bi-currency-rupee" style={{ fontSize: "16px" }}></i>
                        {trip.price?.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <button style={{ padding: "8px 16px", background: "#dcfce7", color: "#0f5132", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
                      View Details
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Trips;