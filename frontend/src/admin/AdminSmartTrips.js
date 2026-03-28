import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

function AdminSmartTrips() {

  const [trips,       setTrips]       = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("All"); // All / Saved / Unsaved
  const [expandedId,  setExpandedId]  = useState(null);  // which trip is expanded


  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, statsRes] = await Promise.all([
        API.get("/api/admin/smart-trips"),
        API.get("/api/admin/smart-trips/stats"),
      ]);
      setTrips(tripsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to load Smart Trips data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);


  /* ================= DELETE ================= */

  const deleteTrip = async (id) => {
    if (!window.confirm("Delete this AI trip?")) return;
    try {
      await API.delete(`/api/admin/smart-trips/${id}`);
      fetchData();
    } catch {
      alert("Failed to delete trip.");
    }
  };


  /* ================= FILTER ================= */

  const filtered = trips.filter(t => {
    const matchSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.destination?.toLowerCase().includes(search.toLowerCase()) ||
      `${t.user_id?.firstName} ${t.user_id?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All"    ? true :
      filter === "Saved"  ? t.saved === true :
      filter === "Unsaved"? t.saved === false : true;
    return matchSearch && matchFilter;
  });


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b", marginBottom: "2px" }}>Smart Trips</h2>
          <p style={{ fontSize: "13px", color: "#64748b" }}>All AI-generated trips by users</p>
        </div>
        <input
          type="text"
          placeholder="Search by title, destination or user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", width: "280px", outline: "none" }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <p style={{ color: "#64748b" }}>Loading Smart Trips...</p>}

      {!loading && !error && (
        <>

          {/* ── STAT CARDS ── */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { label: "Total AI Trips",  value: stats?.total   ?? 0, color: "#0f5132", bg: "#dcfce7" },
              { label: "Saved by Users",  value: stats?.saved   ?? 0, color: "#0d9488", bg: "#ccfbf1" },
              { label: "Not Saved",       value: stats?.unsaved ?? 0, color: "#854F0B", bg: "#FAEEDA" },
              { label: "Showing Now",     value: filtered.length,     color: "#3C3489", bg: "#EEEDFE" },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", borderTop: `4px solid ${s.color}`, borderRadius: "10px", padding: "14px 20px", minWidth: "130px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "24px", fontWeight: "700", color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── POPULAR DESTINATIONS ── */}
          {stats?.destinations?.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><i className="bi bi-bar-chart-fill" style={{ color: "#f59e0b" }}></i> Most Requested Destinations</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {stats.destinations.map((d, i) => (
                  <div key={i} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "20px", padding: "5px 14px", fontSize: "13px", fontWeight: "500", color: "#0f5132" }}>
                    {d._id || "Unknown"} <span style={{ color: "#94a3b8", fontSize: "11px" }}>({d.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FILTER PILLS ── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {["All", "Saved", "Unsaved"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "6px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "500",
                  background: filter === f ? "#0f5132" : "white",
                  color:      filter === f ? "white"   : "#475569",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                {f} {f === "All" ? `(${trips.length})` : f === "Saved" ? `(${trips.filter(t => t.saved).length})` : `(${trips.filter(t => !t.saved).length})`}
              </button>
            ))}
          </div>

          {/* ── TRIPS LIST ── */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "12px", color: "#94a3b8" }}>
              <i className="bi bi-robot" style={{ fontSize: "36px", color: "#94a3b8", display: "block", marginBottom: "10px" }}></i>
              <p>No AI trips found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map(trip => (
                <div key={trip._id} style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

                  {/* Trip row */}
                  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>

                    <div style={{ display: "flex", gap: "14px", alignItems: "center", flex: 1 }}>

                      {/* AI icon */}
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                      <i className="bi bi-robot" style={{ fontSize: "22px", color: "#0f5132" }}></i>
                      </div>

                      <div style={{ flex: 1 }}>
                        {/* Title + saved badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>{trip.title}</span>
                          <span style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: "600",
                            background: trip.saved ? "#dcfce7" : "#f1f5f9",
                            color:      trip.saved ? "#0f5132" : "#94a3b8"
                          }}>
                            {trip.saved ? <><i className="bi bi-bookmark-check-fill"></i> Saved</> : "Not saved"}
                          </span>
                        </div>

                        {/* Meta info */}
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><i className="bi bi-geo-alt-fill" style={{ color: "#0f5132" }}></i> {trip.destination}</span>
                          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><i className="bi bi-clock"></i> {trip.prompt_data?.days} days</span>
                          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><i className="bi bi-tag"></i> {trip.prompt_data?.tripType}</span>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "#0f5132" }}>₹{trip.estimated_budget?.toLocaleString("en-IN")}</span>
                        </div>

                        {/* User */}
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                          <i className="bi bi-person-circle" style={{ color: "#0f5132" }}></i> {trip.user_id ? `${trip.user_id.firstName} ${trip.user_id.lastName} (${trip.user_id.email})` : "Unknown User"}
                          <span style={{ marginLeft: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <i className="bi bi-calendar3"></i> {trip.created_at ? new Date(trip.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={() => setExpandedId(expandedId === trip._id ? null : trip._id)}
                        style={{ padding: "6px 14px", background: expandedId === trip._id ? "#f0fdf4" : "#f8fafc", color: expandedId === trip._id ? "#0f5132" : "#475569", border: `1px solid ${expandedId === trip._id ? "#0f5132" : "#e2e8f0"}`, borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                        {expandedId === trip._id ? "Hide ▲" : "View ▼"}
                      </button>
                      <button
                        onClick={() => deleteTrip(trip._id)}
                        style={{ padding: "6px 14px", background: "#FCEBEB", color: "#A32D2D", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                        Delete
                      </button>
                    </div>

                  </div>

                  {/* Expanded itinerary */}
                  {expandedId === trip._id && (
                    <div style={{ borderTop: "1px solid #f1f5f9", padding: "16px 20px", background: "#fafffe" }}>

                      {/* Tags */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                        {trip.prompt_data?.interest?.split(",").map((tag, i) => (
                          <span key={i} style={{ background: "#f0fdf4", color: "#0f5132", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>
                            #{tag.trim()}
                          </span>
                        ))}
                        {trip.prompt_data?.region && (
                          <span style={{ background: "#fafafa", color: "#64748b", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", border: "1px solid #e2e8f0", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <i className="bi bi-geo-alt"></i> {trip.prompt_data.region}
                          </span>
                        )}
                      </div>

                      {/* Itinerary */}
                      <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <i className="bi bi-calendar3" style={{ color: "#0f5132" }}></i> Itinerary
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "10px", marginBottom: "14px" }}>
                        {trip.itinerary?.map((day, i) => (
                          <div key={i} style={{ background: "white", borderRadius: "8px", padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f5132", marginBottom: "6px" }}>Day {day.day}</div>
                            {day.activities?.map((act, j) => (
                              <div key={j} style={{ fontSize: "12px", color: "#475569", padding: "2px 0", lineHeight: "1.5", display: "flex", gap: "6px" }}>
                                <i className="bi bi-circle-fill" style={{ fontSize: "5px", color: "#0f5132", marginTop: "5px", flexShrink: 0 }}></i> {act}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Travel tips */}
                      {trip.travel_tips?.length > 0 && (
                        <>
                          <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#92400e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="bi bi-lightbulb-fill" style={{ color: "#d97706" }}></i> Travel Tips
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {trip.travel_tips.map((tip, i) => (
                              <div key={i} style={{ fontSize: "12px", color: "#78350f", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                                <i className="bi bi-check2-circle" style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }}></i> {tip}
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </>
      )}

    </AdminLayout>
  );
}

export default AdminSmartTrips;