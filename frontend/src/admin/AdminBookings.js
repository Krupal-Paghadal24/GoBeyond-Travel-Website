import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../api/axiosInstance";

function AdminBookings() {

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);


  /* ================= FETCH BOOKINGS ================= */

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/admin/bookings");
      setBookings(res.data);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to load bookings. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);


  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/api/admin/bookings/${id}`, { booking_status: newStatus });
      fetchBookings();
    } catch (err) {
      alert("Failed to update booking status");
    }
  };


  /* ================= HELPERS ================= */

  // ✅ Smart trip name — shows AI trip name if no trip_id
  const getTripName = (booking) => {
    if (booking.trip_id?.title) return booking.trip_id.title;
    if (booking.trip_name)      return booking.trip_name;
    return "Unknown Trip";
  };

  const getTripLocation = (booking) => {
    if (booking.trip_id?.location) return booking.trip_id.location;
    if (booking.trip_name)         return "AI Generated Trip";
    return "—";
  };

  const getBadgeStyle = (status) => {
    const base = { padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" };
    if (status === "Approved")  return { ...base, background: "#EAF3DE", color: "#3B6D11" };
    if (status === "Cancelled") return { ...base, background: "#FCEBEB", color: "#A32D2D" };
    return { ...base, background: "#FAEEDA", color: "#854F0B" };
  };

  // AI trip indicator
  const isAITrip = (booking) => !booking.trip_id && booking.trip_name;


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600" }}>Booking Management</h2>
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          Total: {bookings.length} bookings
        </span>
      </div>

      {loading && <p style={{ color: "#64748b", fontSize: "14px" }}>Loading bookings...</p>}

      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>

              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Trip</th>
                  <th style={thStyle}>Travel Date</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}>
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking._id} style={{ borderBottom: "1px solid #f1f5f9" }}>

                      {/* User */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#dcfce7", color: "#0f5132", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", flexShrink: 0 }}>
                            {booking.user_id?.firstName?.[0] || "?"}
                          </div>
                          <span style={{ fontWeight: "500" }}>
                            {booking.user_id
                              ? `${booking.user_id.firstName} ${booking.user_id.lastName}`
                              : "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ ...tdStyle, color: "#64748b", fontSize: "13px" }}>
                        {booking.user_id?.email || "—"}
                      </td>

                      {/* ✅ Trip name — shows AI trip name if no regular trip */}
                      <td style={tdStyle}>
                        <div>
                          <div style={{ fontWeight: "500", fontSize: "13px" }}>
                            {getTripName(booking)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                            {getTripLocation(booking)}
                          </div>
                          {/* ✅ AI badge if AI trip */}
                          {isAITrip(booking) && (
                            <span style={{ fontSize: "10px", background: "#f0fdfa", color: "#0d9488", padding: "1px 6px", borderRadius: "10px", fontWeight: "600" }}>
                              🤖 AI Trip
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Travel date */}
                      <td style={tdStyle}>
                        {booking.travel_date
                          ? new Date(booking.travel_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>

                      {/* Amount */}
                      <td style={{ ...tdStyle, fontWeight: "600" }}>
                        ₹{booking.total_amount?.toLocaleString("en-IN") || "—"}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={getBadgeStyle(booking.booking_status)}>
                          {booking.booking_status || "Pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        {booking.booking_status !== "Approved" && (
                          <button onClick={() => updateStatus(booking._id, "Approved")}
                            style={{ ...btnStyle, background: "#EAF3DE", color: "#3B6D11", marginRight: "6px" }}>
                            Approve
                          </button>
                        )}
                        {booking.booking_status !== "Cancelled" && (
                          <button onClick={() => updateStatus(booking._id, "Cancelled")}
                            style={{ ...btnStyle, background: "#FCEBEB", color: "#A32D2D" }}>
                            Cancel
                          </button>
                        )}
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

const thStyle = { padding: "10px 14px", fontWeight: "500", fontSize: "12px", color: "#475569", borderBottom: "2px solid #e2e8f0", textTransform: "uppercase", letterSpacing: "0.4px" };
const tdStyle = { padding: "12px 14px", color: "#1e293b", verticalAlign: "middle" };
const btnStyle = { padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500" };

export default AdminBookings;