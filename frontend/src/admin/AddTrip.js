import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

function AddTrip() {

  const [guides,     setGuides]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const navigate = useNavigate();

  const [trip, setTrip] = useState({
    title:            "",
    category:         "",
    location:         "",
    duration:         "",
    price:            "",
    description:      "",
    guide_id:         "",
    language_support: "",
    local_help:       false,
    status:           "Available",
    images:           []
  });


  /* ================= LOAD GUIDES ================= */

  useEffect(() => {
    API.get("/api/admin/guides")
      .then(res => setGuides(res.data))
      .catch(err => console.log(err));
  }, []);


  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ✅ When category changes, reset guide selection
    if (name === "category") {
      setTrip({ ...trip, category: value, guide_id: "" });
    } else {
      setTrip({ ...trip, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleImage = (e) => {
    setTrip({ ...trip, images: e.target.files });
  };


  /* ================= FILTERED GUIDES BY CATEGORY ================= */
  // ✅ Maps trip category → guide expertise
  // Guide model has: Industrial | Cultural | Adventure

  const getMatchingGuides = () => {
    if (!trip.category) return guides; // show all if no category selected

    const expertiseMap = {
      "Adventure":   "Adventure",
      "Cultural":    "Cultural",
      "Nature":      "Adventure",   // Nature trips → Adventure guides (outdoor)
      "Industrial":  "Industrial",
      "Educational": "Industrial",  // Educational trips → Industrial guides (knowledge)
    };

    const requiredExpertise = expertiseMap[trip.category];
    if (!requiredExpertise) return guides;

    return guides.filter(g => g.expertise === requiredExpertise);
  };

  const filteredGuides  = getMatchingGuides();
  const hasMatchGuides  = filteredGuides.length > 0;


  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trip.title || !trip.location || !trip.price) {
      setError("Title, Location and Price are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("title",            trip.title);
      formData.append("category",         trip.category);
      formData.append("location",         trip.location);
      formData.append("duration",         trip.duration);
      formData.append("price",            trip.price);
      formData.append("description",      trip.description);
      formData.append("guide_id",         trip.guide_id);
      formData.append("language_support", trip.language_support);
      formData.append("local_help",       trip.local_help);
      formData.append("status",           trip.status);

      for (let i = 0; i < trip.images.length; i++) {
        formData.append("images", trip.images[i]);
      }

      await API.post("/api/admin/trips", formData);

      alert("Trip Added Successfully!");
      navigate("/admin/trips");

    } catch (error) {
      console.log(error);
      setError("Failed to add trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  /* ================= RENDER ================= */

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b" }}>Add New Trip</h2>
        <button onClick={() => navigate("/admin/trips")}
          style={{ padding: "8px 16px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
          ← Back to Trips
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Form */}
      <div style={{ background: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit}>

          {/* Row 1: Title + Category */}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Trip Title *</label>
              <input name="title" onChange={handleChange} placeholder="e.g. Manali Adventure Trek" style={inputStyle} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Category</label>
              <select name="category" onChange={handleChange} style={inputStyle}>
                <option value="">Select Category</option>
                <option value="Adventure">🧗 Adventure</option>
                <option value="Cultural">🏛️ Cultural</option>
                <option value="Nature">🌿 Nature</option>
                <option value="Industrial">🏭 Industrial</option>
                <option value="Educational">🎓 Educational</option>
              </select>
            </div>
          </div>

          {/* Row 2: Location + Duration */}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Location *</label>
              <input name="location" onChange={handleChange} placeholder="e.g. Manali, Himachal Pradesh" style={inputStyle} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Duration</label>
              <input name="duration" onChange={handleChange} placeholder="e.g. 5 Days / 4 Nights" style={inputStyle} />
            </div>
          </div>

          {/* Row 3: Price + Status */}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Price (₹) *</label>
              <input name="price" type="number" onChange={handleChange} placeholder="e.g. 12000" style={inputStyle} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select name="status" onChange={handleChange} style={inputStyle}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" onChange={handleChange}
              placeholder="Describe the trip experience, highlights and what to expect..."
              style={{ ...inputStyle, height: "100px", resize: "vertical" }} />
          </div>

          {/* Row 4: Guide + Language */}
          <div style={rowStyle}>

            {/* ✅ SMART GUIDE SELECTOR */}
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Assign Guide
                {trip.category && (
                  <span style={{ marginLeft: "8px", fontSize: "11px", background: "#dcfce7", color: "#0f5132", padding: "2px 8px", borderRadius: "10px", fontWeight: "500" }}>
                    Showing {filteredGuides.length} matching guide{filteredGuides.length !== 1 ? "s" : ""} for {trip.category}
                  </span>
                )}
              </label>

              <select name="guide_id" value={trip.guide_id} onChange={handleChange} style={inputStyle}>
                <option value="">No Guide</option>

                {/* ✅ Matching guides — shown first with star */}
                {filteredGuides.map(g => (
                  <option key={g._id} value={g._id}>
                    ⭐ {g.guide_name} — {g.expertise} ({g.experience_years} yrs)
                  </option>
                ))}

                {/* ✅ Other guides — shown below with separator */}
                {trip.category && guides.filter(g => !filteredGuides.includes(g)).length > 0 && (
                  <>
                    <option disabled>── Other Guides ──</option>
                    {guides.filter(g => !filteredGuides.includes(g)).map(g => (
                      <option key={g._id} value={g._id}>
                        {g.guide_name} — {g.expertise} ({g.experience_years} yrs)
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* ✅ Warning if no matching guides */}
              {trip.category && !hasMatchGuides && (
                <p style={{ fontSize: "12px", color: "#854F0B", marginTop: "6px", background: "#FAEEDA", padding: "6px 10px", borderRadius: "6px" }}>
                  ⚠️ No {trip.category} guides available. Please add a guide with {trip.category === "Nature" || trip.category === "Adventure" ? "Adventure" : trip.category === "Educational" ? "Industrial" : trip.category} expertise first.
                </p>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Language Support <span style={{ color: "#94a3b8", fontWeight: 400 }}>(comma separated)</span></label>
              <input name="language_support" onChange={handleChange} placeholder="Hindi, English, Gujarati" style={inputStyle} />
            </div>
          </div>

          {/* Local help */}
          <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="checkbox" name="local_help" id="local_help" onChange={handleChange}
              style={{ width: "16px", height: "16px", cursor: "pointer" }} />
            <label htmlFor="local_help" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", margin: 0 }}>
              Local help available for this trip
            </label>
          </div>

          {/* Image upload */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Trip Images <span style={{ color: "#94a3b8", fontWeight: 400 }}>(max 5 images)</span></label>
            <div style={{ border: "2px dashed #e2e8f0", borderRadius: "8px", padding: "20px", textAlign: "center", background: "#f8fafc" }}>
              <input type="file" multiple accept="image/*" onChange={handleImage} style={{ fontSize: "13px" }} />
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px", marginBottom: 0 }}>
                PNG, JPG — up to 5 files
              </p>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={submitting}
              style={{ padding: "10px 28px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Adding Trip..." : "Add Trip"}
            </button>
            <button type="button" onClick={() => navigate("/admin/trips")}
              style={{ padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
              Cancel
            </button>
          </div>

        </form>
      </div>

    </AdminLayout>
  );
}

const rowStyle   = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" };
const fieldStyle = { display: "flex", flexDirection: "column" };
const labelStyle = { fontSize: "12px", fontWeight: "500", color: "#475569", marginBottom: "6px" };
const inputStyle = { padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", background: "#f8fafc", width: "100%" };

export default AddTrip;