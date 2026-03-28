import { useEffect, useState } from "react";
import API from "../api/axiosInstance"; // ✅ FIXED: was old axios
import AdminLayout from "./AdminLayout";

function AdminPayments() {

  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);


  /* ================= FETCH PAYMENTS ================= */

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/admin/payments"); // ✅ FIXED
      setPayments(res.data);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to load payments. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);


  /* ================= STATS ================= */

  const totalRevenue  = payments.filter(p => p.payment_status === "Success").reduce((s, p) => s + (p.amount || 0), 0);
  const successCount  = payments.filter(p => p.payment_status === "Success").length;
  const failedCount   = payments.filter(p => p.payment_status === "Failed").length;


  /* ================= BADGE STYLES ================= */

  const statusBadge = (status) => {
    const base = { padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" };
    if (status === "Success") return { ...base, background: "#EAF3DE", color: "#3B6D11" };
    return { ...base, background: "#FCEBEB", color: "#A32D2D" };
  };

  const methodBadge = (method) => {
    const base = { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" };
    if (method === "UPI")         return { ...base, background: "#f0fdf4", color: "#0f5132" };
    if (method === "Card")        return { ...base, background: "#EEEDFE", color: "#3C3489" };
    if (method === "Net Banking") return { ...base, background: "#FAEEDA", color: "#854F0B" };
    return { ...base, background: "#f1f5f9", color: "#475569" };
  };


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b" }}>Payment Management</h2>
        <span style={{ fontSize: "13px", color: "#64748b" }}>{payments.length} total transactions</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Total Revenue",      value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "#0f5132" },
          { label: "Successful",         value: successCount,   color: "#0d9488" },
          { label: "Failed",             value: failedCount,    color: "#ef4444" },
          { label: "Total Transactions", value: payments.length, color: "#854F0B" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderTop: `4px solid ${s.color}`, borderRadius: "10px", padding: "14px 20px", minWidth: "140px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <p style={{ color: "#64748b", fontSize: "14px" }}>Loading payments...</p>}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>💳</div>
                      No payments recorded yet. Payments will appear here after users complete checkout.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, index) => (
                    <tr key={p._id} style={{ borderBottom: "1px solid #f1f5f9" }}>

                      <td style={{ ...tdStyle, color: "#94a3b8", fontSize: "12px" }}>{index + 1}</td>

                      {/* User */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#dcfce7", color: "#0f5132", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", flexShrink: 0 }}>
                            {p.user_id?.firstName?.[0] || "?"}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "500" }}>
                              {p.user_id ? `${p.user_id.firstName} ${p.user_id.lastName}` : "Unknown"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.user_id?.email || ""}</div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ ...tdStyle, fontWeight: "700", fontSize: "15px", color: "#0f5132" }}>
                        ₹{p.amount?.toLocaleString("en-IN") || "—"}
                      </td>

                      {/* Method */}
                      <td style={tdStyle}>
                        <span style={methodBadge(p.payment_method)}>{p.payment_method || "—"}</span>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={statusBadge(p.payment_status)}>{p.payment_status || "—"}</span>
                      </td>

                      {/* Date */}
                      <td style={{ ...tdStyle, fontSize: "12px", color: "#94a3b8" }}>
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
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

export default AdminPayments;