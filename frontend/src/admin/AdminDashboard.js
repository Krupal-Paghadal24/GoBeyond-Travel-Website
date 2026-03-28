import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

function AdminDashboard() {

  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/admin/dashboard")
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Users",     value: stats.totalUsers     || 0, icon: "bi-people-fill",       color: "#0f5132", bg: "#dcfce7" },
    { label: "Total Trips",     value: stats.totalTrips     || 0, icon: "bi-map-fill",           color: "#0d9488", bg: "#ccfbf1" },
    { label: "Total Bookings",  value: stats.totalBookings  || 0, icon: "bi-calendar-check-fill",color: "#854F0B", bg: "#FAEEDA" },
    { label: "Pending",         value: stats.pendingBookings|| 0, icon: "bi-hourglass-split",    color: "#A32D2D", bg: "#FCEBEB" },
    { label: "New Users (Week)",value: stats.newUsersThisWeek||0, icon: "bi-person-plus-fill",   color: "#3C3489", bg: "#EEEDFE" },
  ];

  const statusStyle = (status) => {
    const base = { padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "500" };
    if (status === "Approved")  return { ...base, background: "#dcfce7",  color: "#0f5132" };
    if (status === "Cancelled") return { ...base, background: "#FCEBEB",  color: "#A32D2D" };
    return { ...base, background: "#FAEEDA", color: "#854F0B" };
  };

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "2px" }}>Dashboard</h2>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Welcome back! Here is what is happening with GoBeyond.</p>
        </div>
        <button onClick={() => navigate("/admin/add-trip")}
          style={{ padding: "9px 18px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="bi bi-plus-circle-fill"></i> Add New Trip
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "28px", flexWrap: "wrap" }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: "12px", padding: "18px 20px", minWidth: "160px", flex: "1", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`bi ${s.icon}`} style={{ fontSize: "20px", color: s.color }}></i>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", lineHeight: 1 }}>
                {loading ? "..." : s.value}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", marginRight: "4px" }}>
          <i className="bi bi-lightning-charge-fill" style={{ color: "#f59e0b", marginRight: "4px" }}></i> Quick Actions:
        </div>
        {[
          { label: "Manage Trips",    path: "/admin/trips",        icon: "bi-map"            },
          { label: "View Bookings",   path: "/admin/bookings",     icon: "bi-calendar-check" },
          { label: "Manage Users",    path: "/admin/users",        icon: "bi-people"         },
          { label: "View Payments",   path: "/admin/payments",     icon: "bi-credit-card"    },
          { label: "Smart Trips",     path: "/admin/smart-trips",  icon: "bi-robot"          },
          { label: "Manage Guides",   path: "/admin/guides",       icon: "bi-person-badge"   },
        ].map((a, i) => (
          <button key={i} onClick={() => navigate(a.path)}
            style={{ padding: "7px 14px", background: "white", color: "#0f5132", border: "1px solid #dcfce7", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <i className={`bi ${a.icon}`}></i> {a.label}
          </button>
        ))}
      </div>

      {/* Recent bookings table */}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#1e293b", display: "flex", alignItems: "center", gap: "7px" }}>
            <i className="bi bi-clock-history" style={{ color: "#0f5132" }}></i> Recent Bookings
          </h3>
          <button onClick={() => navigate("/admin/bookings")}
            style={{ fontSize: "13px", color: "#0f5132", background: "none", border: "none", cursor: "pointer", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
            View all <i className="bi bi-arrow-right"></i>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
            <i className="bi bi-arrow-repeat" style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}></i>
            Loading...
          </div>
        ) : !stats.recentBookings || stats.recentBookings.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
            <i className="bi bi-calendar-x" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}></i>
            No bookings yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["User", "Trip", "Travel Date", "Amount", "Status"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e2e8f0" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#dcfce7", color: "#0f5132", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                          {b.user_id?.firstName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span style={{ fontWeight: "500", color: "#1e293b" }}>
                          {b.user_id ? `${b.user_id.firstName} ${b.user_id.lastName}` : "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>
                      {b.trip_id?.title || b.trip_name || "AI Trip"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>
                      {b.travel_date ? new Date(b.travel_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: "600", color: "#0f5132" }}>
                      Rs.{b.total_amount?.toLocaleString("en-IN") || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={statusStyle(b.booking_status)}>{b.booking_status || "Pending"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;