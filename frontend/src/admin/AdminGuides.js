import { useEffect, useState } from "react";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

function AdminGuides() {

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // ✅ toggle add form
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    guide_name: "",
    expertise: "",
    languages: "",
    experience_years: "",
    contact: ""
  });


  /* ================= FETCH GUIDES ================= */

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/admin/guides");
      setGuides(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load guides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuides(); }, []);


  /* ================= HANDLE FORM INPUT ================= */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  /* ================= ADD GUIDE ================= */

  const addGuide = async () => {

    if (!form.guide_name || !form.expertise || !form.contact) {
      alert("Please fill Name, Expertise and Contact fields.");
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/api/admin/guides", {
        guide_name: form.guide_name,
        expertise: form.expertise,
        languages: form.languages.split(",").map(l => l.trim()).filter(Boolean),
        experience_years: Number(form.experience_years) || 0,
        contact: form.contact
      });

      // Reset form and close panel
      setForm({ guide_name: "", expertise: "", languages: "", experience_years: "", contact: "" });
      setShowForm(false);
      fetchGuides();

    } catch (err) {
      alert("Failed to add guide. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  /* ================= DELETE GUIDE ================= */

  const deleteGuide = async (id) => {
    if (!window.confirm("Delete this guide?")) return;
    try {
      await API.delete(`/api/admin/guides/${id}`);
      fetchGuides();
    } catch (err) {
      alert("Failed to delete guide.");
    }
  };


  /* ================= EXPERTISE BADGE ================= */

  const expertiseBadge = (exp) => {
    const base = { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" };
    if (exp === "Adventure") return { ...base, background: "#FAEEDA", color: "#854F0B" };
    if (exp === "Cultural") return { ...base, background: "#EEEDFE", color: "#3C3489" };
    if (exp === "Industrial") return { ...base, background: "#E6F1FB", color: "#185FA5" };
    if (exp === "Nature") return { ...base, background: "#E6F7EE", color: "#166534" };
    if (exp === "Educational") return { ...base, background: "#FEF9C3", color: "#854D0E" };
    return { ...base, background: "#f1f5f9", color: "#475569" }; // fallback
  };


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b" }}>Guide Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "9px 20px", background: showForm ? "#64748b" : "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
        >
          {showForm ? "✕ Cancel" : "+ Add New Guide"}
        </button>
      </div>

      {/* ===== ADD GUIDE FORM PANEL ===== */}
      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>

          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "18px", color: "#1e293b" }}>Add New Guide</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            <div>
              <label style={labelStyle}>Guide Name *</label>
              <input name="guide_name" value={form.guide_name} onChange={handleChange} placeholder="Enter guide name" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Expertise *</label>
              <select name="expertise" value={form.expertise} onChange={handleChange} style={inputStyle}>
                <option value="">Select Expertise</option>
                <option value="Industrial">Industrial</option>
                <option value="Cultural">Cultural</option>
                <option value="Adventure">Adventure</option>
                <option value="Nature">Nature</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Languages <span style={{ color: "#94a3b8" }}>(comma separated)</span></label>
              <input name="languages" value={form.languages} onChange={handleChange} placeholder="Hindi, English, Gujarati" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Experience (years)</label>
              <input name="experience_years" type="number" value={form.experience_years} onChange={handleChange} placeholder="e.g. 5" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Contact *</label>
              <input name="contact" value={form.contact} onChange={handleChange} placeholder="Phone number or email" style={inputStyle} />
            </div>

          </div>

          <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
            <button
              onClick={addGuide}
              disabled={submitting}
              style={{ padding: "9px 24px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
            >
              {submitting ? "Adding..." : "Add Guide"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ padding: "9px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Guides", value: guides.length, color: "#3b82f6" },
          { label: "Industrial", value: guides.filter(g => g.expertise === "Industrial").length, color: "#185FA5" },
          { label: "Cultural", value: guides.filter(g => g.expertise === "Cultural").length, color: "#3C3489" },
          { label: "Adventure", value: guides.filter(g => g.expertise === "Adventure").length, color: "#854F0B" },
          { label: "Nature", value: guides.filter(g => g.expertise === "Nature").length, color: "#166534" },
          { label: "Educational", value: guides.filter(g => g.expertise === "Educational").length, color: "#854D0E" },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderTop: `4px solid ${s.color}`, borderRadius: "10px", padding: "12px 18px", minWidth: "110px" }}>
            <div style={{ fontSize: "20px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

      {/* Loading */}
      {loading && <p style={{ color: "#64748b", fontSize: "14px" }}>Loading guides...</p>}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guide Name</th>
                  <th>Expertise</th>
                  <th>Languages</th>
                  <th>Experience</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                      No guides added yet. Click "+ Add New Guide" to get started.
                    </td>
                  </tr>
                ) : (
                  guides.map((g, index) => (
                    <tr key={g._id}>

                      <td style={{ color: "#94a3b8", fontSize: "12px" }}>{index + 1}</td>

                      {/* Name with avatar */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "13px", flexShrink: 0 }}>
                            {g.guide_name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "500", fontSize: "13px" }}>{g.guide_name}</span>
                        </div>
                      </td>

                      {/* Expertise badge */}
                      <td>
                        <span style={expertiseBadge(g.expertise)}>{g.expertise}</span>
                      </td>

                      {/* Languages */}
                      <td style={{ fontSize: "13px", color: "#475569" }}>
                        {g.languages?.join(", ") || "—"}
                      </td>

                      {/* Experience */}
                      <td style={{ fontSize: "13px" }}>
                        {g.experience_years ? `${g.experience_years} yrs` : "—"}
                      </td>

                      {/* Contact */}
                      <td style={{ fontSize: "13px", color: "#475569" }}>{g.contact}</td>

                      {/* Delete */}
                      <td>
                        <button
                          onClick={() => deleteGuide(g._id)}
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


/* ===== STYLES ===== */

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "500",
  color: "#475569",
  marginBottom: "6px"
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "13px",
  outline: "none",
  background: "#f8fafc"
};

export default AdminGuides;