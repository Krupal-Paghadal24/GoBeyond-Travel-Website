import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

function AdminUsers() {

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");


  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/admin/users");
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);


  /* ================= DELETE ================= */

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) { alert("Failed to delete user"); }
  };


  /* ================= BLOCK ================= */

  const blockUser = async (id) => {
    try {
      await API.put(`/api/admin/users/block/${id}`);
      fetchUsers();
    } catch (err) { alert("Failed to block user"); }
  };


  /* ================= ACTIVATE ================= */

  const activateUser = async (id) => {
    try {
      await API.put(`/api/admin/users/activate/${id}`);
      fetchUsers();
    } catch (err) { alert("Failed to activate user"); }
  };


  /* ================= FILTER ================= */

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b" }}>User Management</h2>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", width: "260px", outline: "none" }}
        />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Users",   value: users.length,                               color: "#3b82f6", bg: "#eff6ff" },
          { label: "Active Users",  value: users.filter(u => u.isActive).length,       color: "#10b981", bg: "#ecfdf5" },
          { label: "Blocked Users", value: users.filter(u => !u.isActive).length,      color: "#ef4444", bg: "#fef2f2" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: `1px solid #e2e8f0`, borderTop: `4px solid ${s.color}`, borderRadius: "10px", padding: "14px 20px", minWidth: "130px" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

      {/* Loading */}
      {loading && <p style={{ color: "#64748b", fontSize: "14px" }}>Loading users...</p>}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                      {search ? "No users match your search" : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, index) => (
                    <tr key={user._id}>

                      {/* Index */}
                      <td style={{ color: "#94a3b8", fontSize: "12px" }}>{index + 1}</td>

                      {/* Name with avatar */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "13px", flexShrink: 0 }}>
                            {user.firstName?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "500", fontSize: "13px" }}>
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ fontSize: "13px", color: "#475569" }}>{user.email}</td>

                      {/* Phone */}
                      <td style={{ fontSize: "13px" }}>{user.phone || "—"}</td>

                      {/* Gender */}
                      <td style={{ fontSize: "13px", color: "#64748b" }}>{user.gender || "—"}</td>

                      {/* Joined date */}
                      <td style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                      </td>

                      {/* Status badge */}
                      <td>
                        <span style={{
                          padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                          background: user.isActive ? "#EAF3DE" : "#FCEBEB",
                          color: user.isActive ? "#3B6D11" : "#A32D2D"
                        }}>
                          {user.isActive ? "Active" : "Blocked"}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>

                          {user.isActive ? (
                            <button onClick={() => blockUser(user._id)}
                              style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500", background: "#FAEEDA", color: "#854F0B" }}>
                              Block
                            </button>
                          ) : (
                            <button onClick={() => activateUser(user._id)}
                              style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500", background: "#EAF3DE", color: "#3B6D11" }}>
                              Activate
                            </button>
                          )}

                          <button onClick={() => deleteUser(user._id)}
                            style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "500", background: "#FCEBEB", color: "#A32D2D" }}>
                            Delete
                          </button>

                        </div>
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

export default AdminUsers;