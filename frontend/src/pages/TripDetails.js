import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function TripDetails() {

  const { id }   = useParams();
  const navigate = useNavigate();

  const [trip,         setTrip]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [existingBook, setExistingBook] = useState(null);
  const [showAllImgs,  setShowAllImgs]  = useState(false);
  const [lightboxImg,  setLightboxImg]  = useState(null); // ✅ single image lightbox

  const user   = JSON.parse(localStorage.getItem("user") || "null");
  const images = trip?.images || [];


  /* ================= FETCH TRIP ================= */

  useEffect(() => {
    API.get(`/api/trips/${id}`)
      .then(res => { setTrip(res.data); setLoading(false); })
      .catch(() => { setError("Trip not found."); setLoading(false); });
  }, [id]);


  /* ================= CHECK IF ALREADY BOOKED ================= */

  useEffect(() => {
    if (!user?._id || !id) return;
    API.get(`/api/bookings/user/${user._id}`)
      .then(res => {
        const found = res.data.find(b =>
          (b.trip_id?._id === id) || (b.trip_id === id)
        );
        if (found) setExistingBook(found);
      })
      .catch(() => {});
  }, [id, user?._id]);


  /* ================= GO TO PAYMENT ================= */

  const goToPayment = () => {
    if (!user) { alert("Please login to book a trip."); navigate("/login"); return; }
    if (!selectedDate) { alert("Please select a travel date."); return; }
    navigate("/payment", {
      state: {
        tripId:       trip._id,
        tripName:     trip.title,
        tripLocation: trip.location,
        tripPrice:    trip.price,
        travelDate:   selectedDate,
        isAITrip:     false,
      }
    });
  };


  /* ================= OPEN IMAGE ================= */

  const openImage = (img) => {
    setShowAllImgs(false);
    setLightboxImg(`${BASE_URL}/uploads/${img}`);
  };


  /* ================= LOADING / ERROR ================= */

  if (loading) return (
    <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>Loading trip details...</div>
    </div>
  );

  if (error || !trip) return (
    <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "80px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>😕</div>
        <p style={{ color: "#64748b" }}>{error || "Trip not found."}</p>
        <button onClick={() => navigate("/trips")}
          style={{ marginTop: "12px", padding: "8px 20px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          ← Back to Trips
        </button>
      </div>
    </div>
  );


  /* ================= MAGAZINE IMAGE GRID ================= */

  const renderImageGrid = () => {

    if (images.length === 0) return (
      <div style={{ height: "420px", background: "linear-gradient(135deg, #0f5132, #0d9488)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "60px" }}>
        ✈️
      </div>
    );

    if (images.length === 1) return (
      <div style={{ height: "420px", overflow: "hidden", cursor: "zoom-in" }} onClick={() => openImage(images[0])}>
        <img src={`${BASE_URL}/uploads/${images[0]}`} alt={trip.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
      </div>
    );

    if (images.length === 2) return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", height: "420px" }}>
        {images.map((img, i) => (
          <div key={i} style={{ overflow: "hidden", cursor: "zoom-in" }} onClick={() => openImage(img)}>
            <img src={`${BASE_URL}/uploads/${img}`} alt={`${trip.title} ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
        ))}
      </div>
    );

    // ✅ 3–5 images — Magazine grid
    const mainImg    = images[0];
    const subImgs    = images.slice(1, 5);
    const extraCount = images.length - 5;

    return (
      <div style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gridTemplateRows: "210px 210px", gap: "3px", height: "423px", overflow: "hidden" }}>

          {/* Big main image — spans 2 rows */}
          <div style={{ gridRow: "span 2", overflow: "hidden", cursor: "zoom-in" }} onClick={() => openImage(mainImg)}>
            <img src={`${BASE_URL}/uploads/${mainImg}`} alt={trip.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
          </div>

          {/* Up to 4 small images */}
          {subImgs.map((img, i) => (
            <div key={i} style={{ overflow: "hidden", position: "relative", cursor: "zoom-in" }} onClick={() => openImage(img)}>
              <img src={`${BASE_URL}/uploads/${img}`} alt={`${trip.title} ${i + 2}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />

              {/* +N more overlay on last image */}
              {i === subImgs.length - 1 && extraCount > 0 && (
                <div
                  onClick={e => { e.stopPropagation(); setShowAllImgs(true); }}
                  style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <span style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>+{extraCount} more</span>
                </div>
              )}
            </div>
          ))}

          {/* Fill empty grid slots */}
          {Array.from({ length: Math.max(0, 4 - subImgs.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: "#dcfce7" }} />
          ))}

        </div>

        {/* View all button */}
        <button onClick={() => setShowAllImgs(true)}
          style={{ position: "absolute", bottom: "14px", right: "14px", background: "rgba(255,255,255,0.92)", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
          🖼️ View all {images.length} photos
        </button>
      </div>
    );
  };


  /* ================= MODALS ================= */

  const renderModals = () => (
    <>
      {/* ✅ Single image lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.94)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>

          <button onClick={() => setLightboxImg(null)}
            style={{ position: "absolute", top: "16px", right: "20px", background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "7px 16px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
            ✕ Close
          </button>

          <img
            src={lightboxImg}
            alt="Trip"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "10px", display: "block", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }} />
        </div>
      )}

      {/* ✅ All images modal */}
      {showAllImgs && (
        <div
          onClick={() => setShowAllImgs(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, overflowY: "auto", padding: "24px" }}>

          <div style={{ maxWidth: "900px", margin: "0 auto" }} onClick={e => e.stopPropagation()}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: "600" }}>
                📸 {trip.title} — All Photos ({images.length})
              </span>
              <button onClick={() => setShowAllImgs(false)}
                style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: "8px", padding: "7px 16px", cursor: "pointer", fontSize: "14px" }}>
                ✕ Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "8px" }}>
              {images.map((img, i) => (
                <img key={i}
                  src={`${BASE_URL}/uploads/${img}`}
                  alt={`${trip.title} ${i + 1}`}
                  onClick={() => openImage(img)}
                  style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px", display: "block", cursor: "zoom-in", transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"} />
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );


  /* ================= BOOKING CARD ================= */

  const renderBookingCard = () => {

    if (existingBook) {
      const statusMap = {
        Approved:  { bg: "#EAF3DE", color: "#3B6D11", icon: "✅", msg: "Your trip is confirmed! Get ready for your adventure." },
        Cancelled: { bg: "#FCEBEB", color: "#A32D2D", icon: "❌", msg: "Your booking was cancelled. You may book again." },
        Pending:   { bg: "#FAEEDA", color: "#854F0B", icon: "⏳", msg: "Booking submitted. Waiting for admin approval." },
      };
      const s = statusMap[existingBook.booking_status] || statusMap.Pending;

      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "44px", marginBottom: "10px" }}>{s.icon}</div>
          <div style={{ display: "inline-block", background: s.bg, color: s.color, padding: "5px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
            {existingBook.booking_status}
          </div>
          <p style={{ fontSize: "13px", color: "#475569", marginBottom: "16px", lineHeight: "1.6" }}>{s.msg}</p>
          <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px", marginBottom: "16px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Travel Date</span>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {existingBook.travel_date ? new Date(existingBook.travel_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Amount</span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f5132" }}>
                ₹{existingBook.total_amount?.toLocaleString("en-IN") || "—"}
              </span>
            </div>
          </div>
          <button onClick={() => navigate("/my-trips")}
            style={{ width: "100%", padding: "12px", background: "#0f5132", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>
            View My Bookings
          </button>
          {existingBook.booking_status === "Cancelled" && (
            <button onClick={() => setExistingBook(null)}
              style={{ width: "100%", padding: "10px", background: "white", color: "#0f5132", border: "2px solid #0f5132", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>
              Book Again
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f5132", marginBottom: "4px" }}>
          ₹{trip.price?.toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>per person</div>
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginBottom: "16px" }}>
          {[
            { label: "📍 Location", value: trip.location },
            { label: "🕐 Duration", value: trip.duration || "Flexible" },
            { label: "✈️ Category", value: trip.category || "General" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>{item.label}</span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
            Select Travel Date *
          </label>
          <input type="date" value={selectedDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
        </div>
        <button onClick={goToPayment}
          style={{ width: "100%", padding: "13px", background: "#0f5132", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginBottom: "10px" }}>
          Book Now →
        </button>
        {!user && (
          <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
            <span onClick={() => navigate("/login")} style={{ color: "#0f5132", cursor: "pointer", fontWeight: "500" }}>Login</span> to book this trip
          </p>
        )}
        <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginTop: "10px" }}>
          ✅ Free cancellation • Confirmed by admin
        </p>
      </>
    );
  };


  /* ================= MAIN RENDER ================= */

  return (
    <div style={{ background: "#f8fffe", minHeight: "100vh" }}>

      <Navbar />

      {/* Modals */}
      {renderModals()}

      {/* Image grid section */}
      <div style={{ position: "relative" }}>

        {renderImageGrid()}

        {/* Title overlay */}
        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)", padding: "32px 28px 18px", pointerEvents: "none" }}>
          <div>
            {trip.category && (
              <span style={{ background: "#0f5132", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", marginBottom: "8px", display: "inline-block" }}>
                {trip.category}
              </span>
            )}
            <h1 style={{ fontSize: "30px", fontWeight: "800", color: "white", margin: "6px 0 4px", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              {trip.title}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "14px", margin: 0 }}>
              📍 {trip.location}
            </p>
          </div>
        </div>

        {/* Back button */}
        <button onClick={() => navigate("/trips")}
          style={{ position: "absolute", top: "14px", left: "16px", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "500", zIndex: 10 }}>
          ← Back
        </button>

      </div>


      {/* Main 2-column content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "28px" }}>

        {/* LEFT */}
        <div>

          {/* Quick info */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { icon: "💰", label: "Price",     value: `₹${trip.price?.toLocaleString("en-IN")}` },
              { icon: "🕐", label: "Duration",  value: trip.duration || "Flexible" },
              { icon: "🗣️", label: "Languages", value: Array.isArray(trip.language_support) ? trip.language_support.join(", ") : (trip.language_support || "Hindi, English") },
              { icon: "🤝", label: "Local Help", value: trip.local_help ? "Available" : "Not Available" },
            ].map((item, i) => (
              <div key={i} style={{ background: "white", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", minWidth: "130px" }}>
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>{item.icon}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", marginTop: "3px" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {trip.description && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "12px", color: "#1e293b" }}>About This Trip</h2>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.9" }}>{trip.description}</p>
            </div>
          )}

          {/* Guide */}
          {trip.guide_id && (
            <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "16px", color: "#1e293b" }}>Your Guide</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#dcfce7", color: "#0f5132", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", flexShrink: 0 }}>
                  {trip.guide_id.guide_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>{trip.guide_id.guide_name}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                    {trip.guide_id.expertise} Expert • {trip.guide_id.experience_years} yrs experience
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                    🗣️ {Array.isArray(trip.guide_id.languages) ? trip.guide_id.languages.join(", ") : trip.guide_id.languages}
                  </div>
                  <div style={{ fontSize: "13px", color: "#0f5132", marginTop: "4px", fontWeight: "500" }}>
                    📞 {trip.guide_id.contact}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT — booking card */}
        <div>
          <div style={{ background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "sticky", top: "20px" }}>
            {renderBookingCard()}
          </div>
        </div>

      </div>
    </div>
  );
}

export default TripDetails;