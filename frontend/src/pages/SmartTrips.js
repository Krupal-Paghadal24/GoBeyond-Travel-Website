import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

const VIBES = [
  { label: "Chilled",   icon: "bi-umbrella"        },
  { label: "Hustling",  icon: "bi-lightning-charge" },
  { label: "Cultural",  icon: "bi-building"         },
  { label: "Spiritual", icon: "bi-stars"            },
  { label: "Adventure", icon: "bi-activity"         },
];

const ALL_TAGS = ["#beaches","#foodie","#nightlife","#nature","#historic","#wildlife","#temples","#mountains","#roadtrip"];

const BUDGETS = [
  { label: "Low",    range: "Under Rs.10,000", value: "10000"  },
  { label: "Mid",    range: "Rs.10k - Rs.30k", value: "30000"  },
  { label: "High",   range: "Rs.30k - Rs.70k", value: "70000"  },
  { label: "Luxury", range: "Above Rs.70k",    value: "100000" },
];

function SmartTrips() {

  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  /* form */
  const [destination, setDestination] = useState("");
  const [days,        setDays]        = useState(5);
  const [groupSize,   setGroupSize]   = useState("2");
  const [startDate,   setStartDate]   = useState("");
  const [vibe,        setVibe]        = useState("Chilled");
  const [tags,        setTags]        = useState(["#nature"]);
  const [budgetLevel, setBudgetLevel] = useState(1);

  /* result */
  const [tripResult, setTripResult] = useState(null);
  const [tripId,     setTripId]     = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [activeDay,  setActiveDay]  = useState(null);
  const [error,      setError]      = useState(null);

  /* booking modal */
  const [showBookModal, setShowBookModal] = useState(false);
  const [travelDate,    setTravelDate]    = useState("");
  const [booking,       setBooking]       = useState(false);

  const toggleTag = (tag) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  /* Generate trip */
  const generateTrip = async () => {
    if (!destination.trim()) { setError("Please enter a destination!"); return; }
    setError(null);
    setGenerating(true);
    setTripResult(null);
    setSaved(false);
    try {
      const res = await API.post("/api/ai/generate", {
        tripType: vibe,
        days,
        budget:   BUDGETS[budgetLevel].value,
        interest: tags.join(", ").replace(/#/g, ""),
        region:   destination,
        user_id:  user._id,
      });
      setTripResult(res.data.trip);
      setTripId(res.data.tripId);
      setActiveDay(null);
    } catch {
      setError("Trip generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  /* Save trip */
  const saveTrip = async () => {
    try {
      setSaving(true);
      await API.post("/api/savedTrips/save", { trip_id: tripId });
      setSaved(true);
    } catch {
      alert("Error saving trip");
    } finally {
      setSaving(false);
    }
  };

  /* Book trip - go to payment */
  const confirmBooking = () => {
    if (!travelDate) { alert("Please select a travel date."); return; }
    navigate("/payment", {
      state: {
        tripPrice:    tripResult.estimated_budget,
        travelDate:   travelDate,
        isAITrip:     true,
        aiTripTitle:  tripResult.title,
        tripLocation: tripResult.destination,
      }
    });
  };

  /* Not logged in */
  if (!user) return (
    <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <i className="bi bi-robot" style={{ fontSize: "56px", color: "#0f5132", display: "block", marginBottom: "16px" }}></i>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" }}>AI Smart Trip Planner</h2>
        <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "15px" }}>
          Login to unlock personalised AI-generated itineraries for any destination across India.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "32px" }}>
          {[
            { icon: "bi-geo-alt", text: "Day-wise itinerary" },
            { icon: "bi-lightbulb", text: "Smart recommendations" },
            { icon: "bi-currency-rupee", text: "Budget estimation" },
            { icon: "bi-map", text: "Destination matching" },
          ].map((f, i) => (
            <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className={`bi ${f.icon}`} style={{ color: "#0f5132" }}></i> {f.text}
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/login")}
          style={{ padding: "12px 32px", background: "#0f5132", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>
          Login to Get Started
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#fdf6ee", minHeight: "100vh" }}>
      <Navbar />

      {/* Booking modal */}
      {showBookModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>
              <i className="bi bi-clipboard-check" style={{ marginRight: "8px", color: "#0f5132" }}></i>
              Confirm Booking
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              You are booking an AI-generated trip to <strong>{tripResult?.destination}</strong>
            </p>
            <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
              {[
                { label: "Trip",     value: tripResult?.title },
                { label: "Duration", value: `${days} days` },
                { label: "Group",    value: groupSize === "1" ? "Solo" : groupSize === "2" ? "Couple" : groupSize },
                { label: "Estimate", value: `Rs.${tripResult?.estimated_budget?.toLocaleString("en-IN")}` },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "13px", borderBottom: i < 3 ? "1px solid #ccfbf1" : "none" }}>
                  <span style={{ color: "#64748b" }}>{r.label}</span>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>{r.value}</span>
                </div>
              ))}
            </div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" }}>
              Select Travel Start Date *
            </label>
            <input type="date" value={travelDate} min={new Date().toISOString().split("T")[0]}
              onChange={e => setTravelDate(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", marginBottom: "20px", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={confirmBooking} disabled={booking}
                style={{ flex: 1, padding: "12px", background: booking ? "#94a3b8" : "#0f5132", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: booking ? "not-allowed" : "pointer" }}>
                Confirm Booking
              </button>
              <button onClick={() => setShowBookModal(false)}
                style={{ padding: "12px 16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page title */}
      <div style={{ textAlign: "center", padding: "28px 24px 16px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <i className="bi bi-robot" style={{ color: "#0f5132" }}></i>
          AI Smart Trip Planner
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Tell us your vibe — we will build your perfect Indian adventure</p>
      </div>

      {/* 3-column layout */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 20px 40px", display: "grid", gridTemplateColumns: "320px 1fr 300px", gap: "20px", alignItems: "start" }}>

        {/* LEFT — Planner + Prefs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Planner card */}
          <div style={{ background: "#fde8d0", borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#854F0B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Step 1 of 2</div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bi bi-clipboard2-pulse" style={{ color: "#854F0B" }}></i>
              PLANNER
            </h2>

            {/* Destination */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <i className="bi bi-geo-alt-fill" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#0f5132", fontSize: "16px" }}></i>
              <input value={destination} onChange={e => setDestination(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateTrip()}
                placeholder="Go where? (e.g., Goa, Rajasthan)"
                style={{ width: "100%", padding: "12px 12px 12px 38px", borderRadius: "10px", border: "2px solid #f4c38a", fontSize: "14px", outline: "none", background: "white", boxSizing: "border-box" }} />
            </div>

            {/* Days slider */}
            <div style={{ background: "white", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px" }}>
                  <i className="bi bi-calendar3" style={{ color: "#0f5132" }}></i> Number of Days
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f5132" }}>{days} days</span>
              </div>
              <input type="range" min="1" max="14" value={days} onChange={e => setDays(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#0f5132" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                <span>1</span><span>7</span><span>14</span>
              </div>
            </div>

            {/* Date + Group */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label style={labelSt}>
                  <i className="bi bi-calendar-event" style={{ marginRight: "4px", color: "#0f5132" }}></i>
                  Start Date
                </label>
                <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]}
                  onChange={e => setStartDate(e.target.value)} style={{ ...inputSt, fontSize: "12px" }} />
              </div>
              <div>
                <label style={labelSt}>
                  <i className="bi bi-people-fill" style={{ marginRight: "4px", color: "#0f5132" }}></i>
                  Who is Going?
                </label>
                <select value={groupSize} onChange={e => setGroupSize(e.target.value)} style={inputSt}>
                  <option value="1">Solo</option>
                  <option value="2">Couple</option>
                  <option value="3-5">Small Group</option>
                  <option value="6+">Large Group</option>
                </select>
              </div>
            </div>

            <button onClick={generateTrip} disabled={generating}
              style={{ width: "100%", padding: "14px", background: generating ? "#94a3b8" : "#0f5132", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <i className={`bi ${generating ? "bi-arrow-repeat" : "bi-send-fill"}`}></i>
              {generating ? "Generating..." : "Let us Go!"}
            </button>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <i className="bi bi-exclamation-circle"></i> {error}
              </p>
            )}
          </div>

          {/* Preferences card */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#0f5132", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Step 2 of 2</div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="bi bi-sliders" style={{ color: "#0f5132" }}></i>
              PREFERENCES
            </h2>

            {/* Vibe */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "10px" }}>My Vibe?</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {VIBES.map(v => (
                  <button key={v.label} onClick={() => setVibe(v.label)}
                    style={{ padding: "8px 12px", borderRadius: "10px", border: "2px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "5px",
                      borderColor: vibe === v.label ? "#0f5132" : "#e2e8f0",
                      background:  vibe === v.label ? "#dcfce7" : "#f8fafc",
                      color:       vibe === v.label ? "#0f5132" : "#64748b" }}>
                    <i className={`bi ${v.icon}`}></i> {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "10px" }}>Tags?</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {ALL_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    style={{ padding: "5px 12px", borderRadius: "20px", border: "1.5px solid", cursor: "pointer", fontSize: "12px", fontWeight: "500",
                      borderColor: tags.includes(tag) ? "#0f5132" : "#e2e8f0",
                      background:  tags.includes(tag) ? "#dcfce7" : "#f8fafc",
                      color:       tags.includes(tag) ? "#0f5132" : "#64748b" }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", gap: "5px" }}>
                  <i className="bi bi-currency-rupee" style={{ color: "#0f5132" }}></i> Budget?
                </span>
                <span style={{ fontSize: "13px", color: "#0f5132", fontWeight: "600" }}>{BUDGETS[budgetLevel].range}</span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {BUDGETS.map((b, i) => (
                  <button key={i} onClick={() => setBudgetLevel(i)}
                    style={{ flex: 1, padding: "6px", borderRadius: "8px", border: "1.5px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                      borderColor: budgetLevel === i ? "#0f5132" : "#e2e8f0",
                      background:  budgetLevel === i ? "#dcfce7" : "#f8fafc",
                      color:       budgetLevel === i ? "#0f5132" : "#64748b" }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* CENTER — Trip Result */}
        <div>

          {/* Empty state */}
          {!tripResult && !generating && (
            <div style={{ background: "white", borderRadius: "16px", padding: "48px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", minHeight: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-map" style={{ fontSize: "56px", color: "#dcfce7", display: "block", marginBottom: "16px" }}></i>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Your AI Trip Awaits!</h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "340px" }}>
                Fill in your destination and preferences, then click <strong>Let us Go!</strong>
              </p>
              <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap", justifyContent: "center" }}>
                {["Himachal Pradesh", "Goa Beaches", "Rajasthan Forts", "Kerala Backwaters"].map((s, i) => (
                  <button key={i} onClick={() => setDestination(s)}
                    style={{ padding: "8px 14px", background: "#f0fdf4", color: "#0f5132", border: "1px solid #bbf7d0", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "5px" }}>
                    <i className="bi bi-geo-alt"></i> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {generating && (
            <div style={{ background: "#f0fdfa", borderRadius: "16px", padding: "48px 24px", textAlign: "center", border: "2px dashed #bbf7d0", minHeight: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-arrow-repeat" style={{ fontSize: "48px", color: "#0f5132", display: "block", marginBottom: "20px", animation: "spin 1s linear infinite" }}></i>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f5132", marginBottom: "8px" }}>Generating Your Trip...</h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Our AI is crafting the perfect itinerary for you</p>
            </div>
          )}

          {/* Trip result */}
          {tripResult && !generating && (
            <div>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #dcfce7 0%, #e0f2fe 100%)", borderRadius: "16px", padding: "20px 24px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#0f5132", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <i className="bi bi-check-circle-fill"></i> Generated
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}>Your Trip!</h2>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f5132" }}>
                    {days} Days — {tripResult.destination}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                    {vibe} — {tags.slice(0,3).join(", ")}
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>Estimate</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f5132", display: "flex", alignItems: "center", gap: "2px" }}>
                    <i className="bi bi-currency-rupee" style={{ fontSize: "16px" }}></i>
                    {tripResult.estimated_budget?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <i className="bi bi-calendar3" style={{ color: "#0f5132" }}></i> Day-wise Itinerary
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tripResult.itinerary?.map((day, i) => (
                    <div key={i}>
                      <div onClick={() => setActiveDay(activeDay === i ? null : i)}
                        style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
                          background: activeDay === i ? "#f0fdf4" : "#f8fafc",
                          border: `1.5px solid ${activeDay === i ? "#0f5132" : "#e2e8f0"}` }}>
                        <div style={{ minWidth: "52px", height: "36px", background: activeDay === i ? "#0f5132" : "#e2e8f0", color: activeDay === i ? "white" : "#475569", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700" }}>
                          Day {day.day}
                        </div>
                        <div style={{ flex: 1, fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: activeDay === i ? "normal" : "nowrap" }}>
                          {day.activities?.[0]}
                        </div>
                        <i className={`bi ${activeDay === i ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#94a3b8", fontSize: "12px" }}></i>
                      </div>
                      {activeDay === i && (
                        <div style={{ margin: "4px 0 0 16px", borderLeft: "2px solid #0f5132", paddingLeft: "14px" }}>
                          {day.activities?.map((act, j) => (
                            <div key={j} style={{ padding: "8px 0", fontSize: "13px", color: "#475569", borderBottom: j < day.activities.length - 1 ? "1px dashed #e2e8f0" : "none", lineHeight: "1.5", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                              <i className="bi bi-circle-fill" style={{ fontSize: "6px", color: "#0f5132", marginTop: "6px", flexShrink: 0 }}></i>
                              {act}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel tips */}
              <div style={{ background: "#fffbeb", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid #fde68a" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#92400e", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
                  <i className="bi bi-lightbulb-fill" style={{ color: "#d97706" }}></i> Travel Tips
                </h3>
                {tripResult.travel_tips?.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                    <i className="bi bi-check2-circle" style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }}></i>
                    <span style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.5" }}>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Save button */}
              {!saved ? (
                <button onClick={saveTrip} disabled={saving}
                  style={{ width: "100%", padding: "14px", background: saving ? "#94a3b8" : "#f59e0b", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <i className="bi bi-bookmark-plus-fill"></i>
                  {saving ? "Saving..." : "Save This Trip"}
                </button>
              ) : (
                <div style={{ width: "100%", padding: "14px", background: "#EAF3DE", color: "#3B6D11", borderRadius: "12px", fontSize: "14px", fontWeight: "700", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <i className="bi bi-bookmark-check-fill"></i>
                  Saved! View it in <span onClick={() => navigate("/my-trips")} style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "4px" }}>My Trips</span>
                </div>
              )}
            </div>
          )}
        </div>


        {/* RIGHT — Book & Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Book card */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "7px" }}>
                <i className="bi bi-calendar2-check" style={{ color: "#0f5132" }}></i> Book and Plan
              </h3>
            </div>

            {tripResult ? (
              <>
                <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#0f5132", fontWeight: "600", marginBottom: "4px", textTransform: "uppercase" }}>Total Trip Estimate</div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center" }}>
                    <i className="bi bi-currency-rupee" style={{ fontSize: "18px" }}></i>
                    {tripResult.estimated_budget?.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    avg for {groupSize} person{groupSize !== "1" ? "s" : ""}
                  </div>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  {[
                    { icon: "bi-geo-alt-fill", label: "Destination", value: tripResult.destination },
                    { icon: "bi-clock",        label: "Duration",    value: `${days} days` },
                    { icon: "bi-tag",          label: "Type",        value: vibe },
                    { icon: "bi-people-fill",  label: "Group",       value: groupSize === "1" ? "Solo" : groupSize === "2" ? "Couple" : groupSize },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "12px" }}>
                      <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                        <i className={`bi ${item.icon}`} style={{ color: "#0f5132" }}></i> {item.label}
                      </span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowBookModal(true)}
                  style={{ width: "100%", padding: "12px", background: "#0f5132", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                  <i className="bi bi-bag-check-fill"></i> Book This Trip
                </button>
                <button onClick={() => {
                    const text = `Check out my AI trip to ${tripResult.destination} on GoBeyond! ${days} days | Rs.${tripResult.estimated_budget?.toLocaleString("en-IN")}`;
                    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
                  }}
                  style={{ width: "100%", padding: "11px", background: "white", color: "#0f5132", border: "2px solid #0f5132", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                  <i className="bi bi-share-fill"></i> Share It
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                <i className="bi bi-currency-rupee" style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}></i>
                <p style={{ fontSize: "13px" }}>Generate a trip to see budget estimate</p>
              </div>
            )}
          </div>

          {/* Why AI card */}
          <div style={{ background: "linear-gradient(135deg, #1e293b, #0f5132)", borderRadius: "16px", padding: "20px", color: "white" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
              <i className="bi bi-stars"></i> Why AI Planning?
            </h3>
            {[
              { icon: "bi-lightning-charge-fill", text: "Instant personalised itinerary" },
              { icon: "bi-lightbulb-fill",        text: "Smart budget estimation" },
              { icon: "bi-map-fill",              text: "Hidden gems and local tips" },
              { icon: "bi-bullseye",              text: "Matches your exact vibe" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <i className={`bi ${f.icon}`} style={{ fontSize: "15px", color: "#86efac" }}></i>
                <span style={{ fontSize: "13px", opacity: 0.9 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Popular picks */}
          <div style={{ background: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="bi bi-fire" style={{ color: "#f59e0b" }}></i> Popular Picks
            </h3>
            {["Goa", "Rajasthan", "Kerala", "Himachal Pradesh", "Leh Ladakh"].map((dest, i) => (
              <button key={i} onClick={() => setDestination(dest)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#475569", fontWeight: "500", width: "100%", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="bi bi-geo-alt" style={{ color: "#0f5132" }}></i> {dest}
                </span>
                <i className="bi bi-arrow-right" style={{ color: "#0f5132" }}></i>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

const labelSt = { fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" };
const inputSt = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", background: "#f8fafc", boxSizing: "border-box" };

export default SmartTrips;