import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axiosInstance";
import AdminLayout from "./AdminLayout";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function EditTrip() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [guides,     setGuides]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);

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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages,      setNewImages]      = useState([]);


  /* ================= LOAD TRIP DATA ================= */

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await API.get(`/api/admin/trips`);
        const found = res.data.find(t => t._id === id);
        if (!found) {
          setError("Trip not found.");
          setLoading(false);
          return;
        }

        setTrip({
          title:            found.title            || "",
          category:         found.category         || "",
          location:         found.location         || "",
          duration:         found.duration         || "",
          price:            found.price            || "",
          description:      found.description      || "",
          guide_id:         found.guide_id?._id    || found.guide_id || "",
          language_support: (found.language_support || []).join(", "),
          local_help:       found.local_help        || false,
          status:           found.status           || "Available",
          images:           []
        });

        setExistingImages(found.images || []);
        setLoading(false);

      } catch (err) {
        setError("Failed to load trip data.");
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);


  /* ================= LOAD GUIDES ================= */

  useEffect(() => {
    API.get("/api/admin/guides")
      .then(res => setGuides(res.data))
      .catch(err => console.log(err));
  }, []);


  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "category") {
      setTrip({ ...trip, category: value, guide_id: "" });
    } else {
      setTrip({ ...trip, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleImage = (e) => {
    setNewImages(e.target.files);
  };


  /* ================= FILTERED GUIDES ================= */

  const getMatchingGuides = () => {
    if (!trip.category) return guides;
    const expertiseMap = {
      "Adventure":   "Adventure",
      "Cultural":    "Cultural",
      "Nature":      "Adventure",
      "Industrial":  "Industrial",
      "Educational": "Industrial",
    };
    const requiredExpertise = expertiseMap[trip.category];
    if (!requiredExpertise) return guides;
    return guides.filter(g => g.expertise === requiredExpertise);
  };

  const filteredGuides = getMatchingGuides();


  /* ================= SUBMIT UPDATE ================= */

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

      for (let i = 0; i < newImages.length; i++) {
        formData.append("images", newImages[i]);
      }

      await API.put(`/api/admin/trips/${id}`, formData);

      alert("Trip Updated Successfully!");
      navigate("/admin/trips");

    } catch (err) {
      console.log(err);
      setError("Failed to update trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  /* ================= RENDER ================= */

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Loading trip data...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b" }}>Edit Trip</h2>
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
              <input name="title" value={trip.title} onChange={handleChange} style={inputStyle} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Category</label>
              <select name="category" value={trip.category} onChange={handleChange} style={inputStyle}>
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
              <input name="location" value={trip.location} onChange={handleChange} style={inputStyle} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Duration</label>
              <input name="duration" value={trip.duration} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Row 3: Price + Status */}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Price (₹) *</label>
              <input name="price" type="number" value={trip.price} onChange={handleChange} style={inputStyle} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select name="status" value={trip.status} onChange={handleChange} style={inputStyle}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={trip.description} onChange={handleChange}
              style={{ ...inputStyle, height: "100px", resize: "vertical" }} />
          </div>

          {/* Row 4: Guide + Language */}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>
                Assign Guide
                {trip.category && (
                  <span style={{ marginLeft: "8px", fontSize: "11px", background: "#dcfce7", color: "#0f5132", padding: "2px 8px", borderRadius: "10px", fontWeight: "500" }}>
                    {filteredGuides.length} matching for {trip.category}
                  </span>
                )}
              </label>
              <select name="guide_id" value={trip.guide_id} onChange={handleChange} style={inputStyle}>
                <option value="">No Guide</option>
                {filteredGuides.map(g => (
                  <option key={g._id} value={g._id}>
                    ⭐ {g.guide_name} — {g.expertise} ({g.experience_years} yrs)
                  </option>
                ))}
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
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Language Support <span style={{ color: "#94a3b8", fontWeight: 400 }}>(comma separated)</span></label>
              <input name="language_support" value={trip.language_support} onChange={handleChange} placeholder="Hindi, English, Gujarati" style={inputStyle} />
            </div>
          </div>

          {/* Local help */}
          <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="checkbox" name="local_help" id="local_help"
              checked={trip.local_help}
              onChange={handleChange}
              style={{ width: "16px", height: "16px", cursor: "pointer" }} />
            <label htmlFor="local_help" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", margin: 0 }}>
              Local help available for this trip
            </label>
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Current Images</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
                {existingImages.map((img, i) => (
                  <img
                    key={i}
                    src={`${BASE_URL}/uploads/${img}`}
                    alt={`trip-${i}`}
                    style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* New image upload */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>
              Replace Images <span style={{ color: "#94a3b8", fontWeight: 400 }}>(upload new images to replace existing)</span>
            </label>
            <div style={{ border: "2px dashed #e2e8f0", borderRadius: "8px", padding: "20px", textAlign: "center", background: "#f8fafc" }}>
              <input type="file" multiple accept="image/*" onChange={handleImage} style={{ fontSize: "13px" }} />
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px", marginBottom: 0 }}>
                PNG, JPG — up to 5 files. Leave empty to keep current images.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={submitting}
              style={{ padding: "10px 28px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Saving Changes..." : "Save Changes"}
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

export default EditTrip;
