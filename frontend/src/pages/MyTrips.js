import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function MyTrips() {

  const [activeTab,  setActiveTab]  = useState("bookings"); // "bookings" | "aitrips"
  const [bookings,   setBookings]   = useState([]);
  const [aiTrips,    setAiTrips]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [expandedAI, setExpandedAI] = useState(null); // which AI trip is expanded

  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "null");
  const userId   = user?._id;


  /* ── Fetch both on mount ── */
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    Promise.all([
      API.get(`/api/bookings/user/${userId}`),
      API.get(`/api/savedTrips/user/${userId}`)
    ])
      .then(([bRes, aiRes]) => {
        setBookings(bRes.data);
        setAiTrips(aiRes.data);
      })
      .catch(() => setError("Failed to load your trips."))
      .finally(() => setLoading(false));

  }, [userId]);


  /* ── Status styles ── */
  const statusStyle = (status) => {
    const base = { padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-block" };
    if (status === "Approved")  return { ...base, background: "#EAF3DE", color: "#3B6D11" };
    if (status === "Cancelled") return { ...base, background: "#FCEBEB", color: "#A32D2D" };
    return { ...base, background: "#FAEEDA", color: "#854F0B" };
  };

  const statusIcon = (s) => s === "Approved" ? "✅" : s === "Cancelled" ? "❌" : "⏳";


  /* ── Not logged in ── */
  if (!user) return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>Login Required</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>Please login to view your trips and bookings.</p>
        <button onClick={() => navigate("/login")}
          style={{ padding: "10px 28px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          Go to Login
        </button>
      </div>
    </div>
  );


  /* ── Main render ── */
  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "24px 32px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>My Trips</h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Welcome back, <strong>{user.firstName}</strong>! All your travel plans in one place.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: "4px", background: "white", borderRadius: "12px", padding: "4px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", width: "fit-content" }}>
          {[
            { key: "bookings", label: "🎫 My Bookings",    count: bookings.length },
            { key: "aitrips",  label: "🤖 Saved AI Trips", count: aiTrips.length  },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding: "10px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.15s",
                background: activeTab === tab.key ? "#1d4ed8" : "transparent",
                color:      activeTab === tab.key ? "white"    : "#64748b" }}>
              {tab.label}
              <span style={{ marginLeft: "8px", background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "#f1f5f9", color: activeTab === tab.key ? "white" : "#64748b", padding: "1px 8px", borderRadius: "10px", fontSize: "12px" }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>}

        {/* Loading */}
        {loading && <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading your trips...</div>}


        {/* ════════════════════════
            TAB 1 — MY BOOKINGS
        ════════════════════════ */}
        {!loading && activeTab === "bookings" && (
          <div>
            {/* Stat cards */}
            {bookings.length > 0 && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                {[
                  { label: "Total",     value: bookings.length,                                        color: "#3b82f6" },
                  { label: "Approved",  value: bookings.filter(b => b.booking_status === "Approved").length,  color: "#10b981" },
                  { label: "Pending",   value: bookings.filter(b => b.booking_status === "Pending").length,   color: "#f59e0b" },
                  { label: "Cancelled", value: bookings.filter(b => b.booking_status === "Cancelled").length, color: "#ef4444" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "white", borderTop: `4px solid ${s.color}`, borderRadius: "10px", padding: "12px 18px", minWidth: "100px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {bookings.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧳</div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>No Bookings Yet</h3>
                <p style={{ color: "#64748b", marginBottom: "24px" }}>Start exploring and book your first trip!</p>
                <button onClick={() => navigate("/trips")}
                  style={{ padding: "10px 28px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                  Explore Trips
                </button>
              </div>
            )}

            {/* Booking cards */}
            {bookings.map(booking => (
              <div key={booking._id} style={{ background: "white", borderRadius: "14px", marginBottom: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex" }}>
                <div style={{ width: "150px", minWidth: "150px", overflow: "hidden" }}>
                  {booking.trip_id?.images?.[0] ? (
                    <img src={`${BASE_URL}/uploads/${booking.trip_id.images[0]}`} alt={booking.trip_id.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: "130px", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>✈️</div>
                  )}
                </div>
                <div style={{ flex: 1, padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
                      {booking.trip_id?.title || "Unknown Trip"}
                    </h3>
                    <span style={statusStyle(booking.booking_status)}>
                      {statusIcon(booking.booking_status)} {booking.booking_status || "Pending"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>📍 {booking.trip_id?.location || "—"}</span>
                    {booking.trip_id?.duration && <span style={{ fontSize: "13px", color: "#64748b" }}>🕐 {booking.trip_id.duration}</span>}
                  </div>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Travel Date</div>
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>
                        {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Amount</div>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1d4ed8" }}>
                        ₹{booking.total_amount?.toLocaleString("en-IN") || "—"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {booking.trip_id?._id && (
                      <button onClick={() => navigate(`/trips/${booking.trip_id._id}`)}
                        style={{ padding: "5px 14px", background: "#E6F1FB", color: "#185FA5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                        View Trip
                      </button>
                    )}
                    <span style={{ fontSize: "12px", padding: "5px 12px", borderRadius: "6px",
                      background: booking.booking_status === "Approved" ? "#EAF3DE" : booking.booking_status === "Cancelled" ? "#FCEBEB" : "#FAEEDA",
                      color: booking.booking_status === "Approved" ? "#3B6D11" : booking.booking_status === "Cancelled" ? "#A32D2D" : "#854F0B" }}>
                      {booking.booking_status === "Approved" ? "🎉 Trip confirmed!" : booking.booking_status === "Cancelled" ? "❌ Booking cancelled" : "⏳ Awaiting approval"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {bookings.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button onClick={() => navigate("/trips")}
                  style={{ padding: "10px 28px", background: "white", color: "#1d4ed8", border: "2px solid #1d4ed8", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                  + Book Another Trip
                </button>
              </div>
            )}
          </div>
        )}


        {/* ════════════════════════
            TAB 2 — SAVED AI TRIPS
        ════════════════════════ */}
        {!loading && activeTab === "aitrips" && (
          <div>
            {/* Empty */}
            {aiTrips.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>No Saved AI Trips Yet</h3>
                <p style={{ color: "#64748b", marginBottom: "24px" }}>Generate a trip using Smart Planner and save it here!</p>
                <button onClick={() => navigate("/smart-trips")}
                  style={{ padding: "10px 28px", background: "#0d9488", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                  Open Smart Planner
                </button>
              </div>
            )}

            {/* AI Trip cards */}
            {aiTrips.map(trip => (
              <div key={trip._id} style={{ background: "white", borderRadius: "14px", marginBottom: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>

                {/* Card header */}
                <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ background: "#f0fdfa", color: "#0d9488", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>🤖 AI Generated</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {trip.created_at ? new Date(trip.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>{trip.title}</h3>
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>📍 {trip.destination}</span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>🕐 {trip.prompt_data?.days} days</span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#0d9488" }}>₹{trip.estimated_budget?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <button onClick={() => setExpandedAI(expandedAI === trip._id ? null : trip._id)}
                    style={{ padding: "8px 16px", background: expandedAI === trip._id ? "#f0fdfa" : "#f1f5f9", color: expandedAI === trip._id ? "#0d9488" : "#475569", border: `1px solid ${expandedAI === trip._id ? "#0d9488" : "#e2e8f0"}`, borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                    {expandedAI === trip._id ? "Hide Details ▲" : "View Details ▼"}
                  </button>
                </div>

                {/* Expanded itinerary */}
                {expandedAI === trip._id && (
                  <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px" }}>

                    {/* Preferences chips */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                      {trip.prompt_data?.tripType && <span style={chip}>{trip.prompt_data.tripType}</span>}
                      {trip.prompt_data?.interest && trip.prompt_data.interest.split(",").map((t, i) => <span key={i} style={chip}>#{t.trim()}</span>)}
                    </div>

                    {/* Itinerary */}
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" }}>📅 Itinerary</h4>
                    {trip.itinerary?.map((day, i) => (
                      <div key={i} style={{ marginBottom: "10px", paddingLeft: "12px", borderLeft: "2px solid #0d9488" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#0d9488", marginBottom: "4px" }}>Day {day.day}</div>
                        {day.activities?.map((act, j) => (
                          <div key={j} style={{ fontSize: "13px", color: "#475569", padding: "2px 0", lineHeight: "1.5" }}>• {act}</div>
                        ))}
                      </div>
                    ))}

                    {/* Travel tips */}
                    {trip.travel_tips?.length > 0 && (
                      <>
                        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#92400e", margin: "14px 0 8px" }}>💡 Travel Tips</h4>
                        {trip.travel_tips.map((tip, i) => (
                          <div key={i} style={{ fontSize: "13px", color: "#78350f", padding: "3px 0" }}>✦ {tip}</div>
                        ))}
                      </>
                    )}

                    <button onClick={() => navigate("/smart-trips")}
                      style={{ marginTop: "14px", padding: "8px 18px", background: "#0d9488", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                      Generate Another Trip
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const chip = { background: "#f0fdfa", color: "#0d9488", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" };

export default MyTrips;