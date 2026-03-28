import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Trips() {

  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const navigate = useNavigate();


  /* ================= FETCH TRIPS ================= */

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/admin/trips");
      setTrips(res.data);
      setError(null);
    } catch (error) {
      setError("Failed to load trips. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);


  /* ================= DELETE TRIP ================= */

  const deleteTrip = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await API.delete(`/api/admin/trips/${id}`);
      fetchTrips();
    } catch (error) {
      alert("Failed to delete trip");
    }
  };


  /* ================= STATUS BADGE ================= */

  const getStatusBadge = (status) => {
    const base = { padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap" };
    const s = (status || "").toLowerCase().trim();
    if (s === "available" || s === "") return { ...base, background: "#EAF3DE", color: "#3B6D11" };
    if (s === "unavailable")           return { ...base, background: "#FCEBEB", color: "#A32D2D" };
    return { ...base, background: "#FAEEDA", color: "#854F0B" }; // draft or anything else
  };


  /* ================= SEARCH FILTER ================= */

  const filtered = trips.filter(trip =>
    trip.title?.toLowerCase().includes(search.toLowerCase()) ||
    trip.location?.toLowerCase().includes(search.toLowerCase()) ||
    trip.category?.toLowerCase().includes(search.toLowerCase())
  );


  /* ================= STAT COUNTS ================= */
  // ✅ FIXED: normalise to lowercase before comparing
  // handles empty string "", null, undefined, "Available", "available" — all correctly

  const availableCount = trips.filter(t => {
    const s = (t.status || "").toLowerCase().trim();
    return s === "available" || s === "";
  }).length;

  const unavailableCount = trips.filter(t =>
    (t.status || "").toLowerCase().trim() === "unavailable"
  ).length;

  const draftCount = trips.filter(t =>
    (t.status || "").toLowerCase().trim() === "draft"
  ).length;


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b" }}>Trip Management</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search trips..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", width: "220px", outline: "none" }}
          />
          <button
            onClick={() => navigate("/admin/add-trip")}
            style={{ padding: "8px 18px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" }}
          >
            + Add New Trip
          </button>
        </div>
      </div>

      {/* Stat cards — ✅ FIXED counts */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Trips",  value: trips.length,     color: "#3b82f6" },
          { label: "Available",    value: availableCount,   color: "#10b981" },
          { label: "Unavailable",  value: unavailableCount, color: "#ef4444" },
          { label: "Draft",        value: draftCount,       color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderTop: `4px solid ${s.color}`, borderRadius: "10px", padding: "14px 20px", minWidth: "120px" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <p style={{ color: "#64748b", fontSize: "14px" }}>Loading trips...</p>}

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Trip Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Guide</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                      {search ? "No trips match your search" : "No trips found. Add your first trip!"}
                    </td>
                  </tr>
                ) : (
                  filtered.map(trip => (
                    <tr key={trip._id}>

                      {/* Image */}
                      <td>
                        {trip.images && trip.images.length > 0 ? (
                          <img
                            src={`${BASE_URL}/uploads/${trip.images[0]}`}
                            alt={trip.title}
                            style={{ width: "60px", height: "auto", objectFit: "contain", borderRadius: "6px", background: "#f0fdf4" }}
                          />
                        ) : (
                          <div style={{ width: "60px", height: "50px", background: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#94a3b8" }}>
                            No img
                          </div>
                        )}
                      </td>

                      {/* Title */}
                      <td style={{ fontWeight: "500", fontSize: "13px" }}>{trip.title}</td>

                      {/* Category */}
                      <td style={{ fontSize: "13px", color: "#64748b" }}>{trip.category || "—"}</td>

                      {/* Location */}
                      <td style={{ fontSize: "13px" }}>{trip.location || "—"}</td>

                      {/* Price */}
                      <td style={{ fontSize: "13px", fontWeight: "500" }}>
                        ₹{trip.price?.toLocaleString("en-IN") || "—"}
                      </td>

                      {/* Guide */}
                      <td style={{ fontSize: "13px" }}>
                        {trip.guide_id
                          ? trip.guide_id.guide_name
                          : <span style={{ color: "#94a3b8" }}>No guide</span>}
                      </td>

                      {/* Status */}
                      <td>
                        <span style={getStatusBadge(trip.status)}>
                          {trip.status || "Available"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <button
                          onClick={() => navigate(`/admin/edit-trip/${trip._id}`)}
                          style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500", background: "#E6F1FB", color: "#185FA5", marginRight: "6px" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTrip(trip._id)}
                          style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500", background: "#FCEBEB", color: "#A32D2D" }}
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default Trips;