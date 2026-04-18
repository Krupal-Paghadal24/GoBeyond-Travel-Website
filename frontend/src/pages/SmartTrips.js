import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";

function SmartTrips() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ── Form state ─────────────────────────────────────────
  const [destination, setDestination] = useState("");
  const [days,        setDays]        = useState(5);
  const [startDate,   setStartDate]   = useState("");
  const [groupSize,   setGroupSize]   = useState("Solo");
  const [vibe,        setVibe]        = useState("");
  const [tags,        setTags]        = useState([]);
  const [budget,      setBudget]      = useState("Mid");

  // ── Trip state ─────────────────────────────────────────
  const [trip,      setTrip]      = useState(null);
  const [tripId,    setTripId]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // ── Editable itinerary state ───────────────────────────
  const [itinerary,     setItinerary]     = useState([]);
  const [editMode,      setEditMode]      = useState(false);
  const [suggestions,   setSuggestions]   = useState({});
  const [loadingSugg,   setLoadingSugg]   = useState({});

  // ── Coupon state ───────────────────────────────────────
  const [coupons,       setCoupons]       = useState([]);
  const [couponCode,    setCouponCode]    = useState("");
  const [couponResult,  setCouponResult]  = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const vibes    = ["Chilled", "Hustling", "Cultural", "Spiritual", "Adventure"];
  const allTags  = ["#beaches","#foodie","#nightlife","#nature","#historic","#wildlife","#mountains","#roadtrip"];
  const budgets  = ["Low","Mid","High","Luxury"];
  const groups   = ["Solo","Couple","Small Group","Large Group"];

  // Fetch user coupons on load
  useEffect(() => {
    if (user._id) {
      API.get(`/api/payments/coupons/${user._id}`)
        .then(res => setCoupons(res.data))
        .catch(() => {});
    }
  }, []);

  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ── Generate AI Trip ───────────────────────────────────
  const handleGenerate = async () => {
    if (!destination.trim()) { setError("Please enter a destination."); return; }
    setError(""); setLoading(true); setTrip(null); setItinerary([]);

    try {
      const res = await API.post("/api/ai/generate", {
        destination, days, tripType: vibe || "General",
        budget, interest: tags.join(", "), region: destination,
        userId: user._id,
      });
      setTrip(res.data);
      setTripId(res.data._id);
      setItinerary(res.data.itinerary || []);
    } catch {
      setError("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete activity from a day ─────────────────────────
  const deleteActivity = (dayIndex, actId) => {
    const updated = itinerary.map((day, di) => {
      if (di !== dayIndex) return day;
      return { ...day, activities: day.activities.filter(a => a.id !== actId) };
    });
    setItinerary(updated);
  };

  // ── Add suggested activity to a day ───────────────────
  const addActivity = (dayIndex, activity) => {
    const updated = itinerary.map((day, di) => {
      if (di !== dayIndex) return day;
      return { ...day, activities: [...day.activities, activity] };
    });
    setItinerary(updated);
    // remove from suggestions list
    setSuggestions(prev => ({
      ...prev,
      [dayIndex]: (prev[dayIndex] || []).filter(s => s.id !== activity.id),
    }));
  };

  // ── Get AI suggestions for a day ──────────────────────
  const getSuggestions = async (dayIndex) => {
    setLoadingSugg(prev => ({ ...prev, [dayIndex]: true }));
    try {
      const res = await API.post("/api/ai/suggest-activity", {
        destination:        trip.destination,
        day:                dayIndex + 1,
        existingActivities: itinerary[dayIndex].activities,
      });
      setSuggestions(prev => ({ ...prev, [dayIndex]: res.data }));
    } catch {
      alert("Could not get suggestions. Try again.");
    } finally {
      setLoadingSugg(prev => ({ ...prev, [dayIndex]: false }));
    }
  };

  // ── Save edited itinerary to DB ────────────────────────
  const saveItinerary = async () => {
    try {
      await API.put(`/api/ai/update-itinerary/${tripId}`, { itinerary });
      setEditMode(false);
      alert("Itinerary saved successfully!");
    } catch {
      alert("Failed to save. Try again.");
    }
  };

  // ── Apply coupon ───────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponResult(null);
    try {
      const res = await API.post("/api/payments/apply-coupon", {
        code: couponCode, user_id: user._id,
        amount: trip?.estimated_budget || 0,
      });
      setCouponResult(res.data);
    } catch (err) {
      setCouponResult({ valid: false, message: err.response?.data?.message || "Invalid coupon." });
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Save trip ──────────────────────────────────────────
  const saveTrip = async () => {
    try {
      await API.post("/api/savedTrips/save", { tripId });
      alert("Trip saved to My Trips!");
    } catch { alert("Could not save trip."); }
  };

  // ── Book this trip ─────────────────────────────────────
  const bookTrip = () => {
    const finalBudget = couponResult?.valid
      ? couponResult.finalAmount
      : trip?.estimated_budget;
    window.location.href = `/payment?aiTrip=true&tripName=${encodeURIComponent(trip.title)}&amount=${finalBudget}&tripId=${tripId}`;
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fffe" }}>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        <h2 style={{ textAlign: "center", color: "#0f5132", fontSize: "24px", marginBottom: "6px" }}>
          <i className="bi bi-robot"></i> AI Smart Trip Planner
        </h2>
        <p style={{ textAlign: "center", color: "#6c757d", marginBottom: "30px" }}>
          Tell us your vibe — we will build your perfect Indian adventure
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 220px", gap: "20px" }}>

          {/* ── LEFT: FORM ─────────────────────────────── */}
          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "fit-content" }}>
            <div style={{ marginBottom: "14px", fontSize: "12px", fontWeight: "700", color: "#0f5132", textTransform: "uppercase" }}>
              <i className="bi bi-map"></i> STEP 1 OF 2 — PLANNER
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={lbl}>Destination</label>
              <input
                placeholder="e.g. Goa, Rajasthan"
                value={destination} onChange={e => setDestination(e.target.value)}
                style={inp}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={lbl}>Number of Days: <strong>{days}</strong></label>
              <input type="range" min="1" max="14" value={days}
                onChange={e => setDays(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#0f5132" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999" }}>
                <span>1</span><span>14</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={lbl}>Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Who is Going?</label>
                <select value={groupSize} onChange={e => setGroupSize(e.target.value)} style={inp}>
                  {groups.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate} disabled={loading}
              style={{ width: "100%", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", padding: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
            >
              {loading ? <><i className="bi bi-hourglass-split"></i> Generating...</> : <><i className="bi bi-send-fill"></i> Let us Go!</>}
            </button>

            {error && <p style={{ color: "red", fontSize: "12px", marginTop: "8px" }}>{error}</p>}

            <hr style={{ margin: "16px 0", borderColor: "#eee" }} />

            <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f5132", marginBottom: "10px" }}>
              <i className="bi bi-sliders"></i> STEP 2 OF 2 — PREFERENCES
            </div>

            <label style={lbl}>My Vibe?</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
              {vibes.map(v => (
                <button key={v} onClick={() => setVibe(v)}
                  style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", border: "1px solid #0f5132", background: vibe === v ? "#0f5132" : "white", color: vibe === v ? "white" : "#0f5132", cursor: "pointer" }}>
                  {v}
                </button>
              ))}
            </div>

            <label style={lbl}>Tags?</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
              {allTags.map(t => (
                <button key={t} onClick={() => toggleTag(t)}
                  style={{ padding: "3px 8px", borderRadius: "20px", fontSize: "11px", border: "1px solid #ccc", background: tags.includes(t) ? "#0f5132" : "#f8f8f8", color: tags.includes(t) ? "white" : "#555", cursor: "pointer" }}>
                  {t}
                </button>
              ))}
            </div>

            <label style={lbl}>₹ Budget?</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {budgets.map(b => (
                <button key={b} onClick={() => setBudget(b)}
                  style={{ flex: 1, padding: "5px 0", fontSize: "11px", borderRadius: "6px", border: "1px solid #ccc", background: budget === b ? "#0f5132" : "white", color: budget === b ? "white" : "#333", cursor: "pointer" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* ── MIDDLE: GENERATED TRIP ─────────────────── */}
          <div>
            {!trip && !loading && (
              <div style={{ background: "white", borderRadius: "12px", padding: "50px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <i className="bi bi-robot" style={{ fontSize: "48px", color: "#ccc" }}></i>
                <p style={{ color: "#aaa", marginTop: "12px" }}>Your AI Trip Awaits!</p>
                <p style={{ color: "#bbb", fontSize: "13px" }}>Fill in your destination and preferences, then click Let us Go!</p>
              </div>
            )}

            {loading && (
              <div style={{ background: "white", borderRadius: "12px", padding: "50px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: "40px" }}>✈️</div>
                <p style={{ color: "#0f5132", fontWeight: "700", marginTop: "12px" }}>Planning your trip...</p>
                <p style={{ color: "#aaa", fontSize: "13px" }}>Groq AI is building your personalised itinerary</p>
              </div>
            )}

            {trip && (
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                {/* Trip Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <span style={{ background: "#0f5132", color: "white", fontSize: "10px", padding: "3px 8px", borderRadius: "20px" }}>AI GENERATED</span>
                    <h3 style={{ margin: "6px 0 2px", color: "#1e293b", fontSize: "18px" }}>{trip.title}</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                      <i className="bi bi-geo-alt-fill" style={{ color: "#0f5132" }}></i> {trip.destination}
                      &nbsp;&nbsp;<i className="bi bi-clock"></i> {days} days
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f5132" }}>
                      ₹{(couponResult?.valid ? couponResult.finalAmount : trip.estimated_budget)?.toLocaleString()}
                    </div>
                    {couponResult?.valid && (
                      <div style={{ fontSize: "11px", color: "#e74c3c", textDecoration: "line-through" }}>
                        ₹{trip.estimated_budget?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration Note */}
                {trip.duration_note && (
                  <div style={{ background: "#fff8e6", border: "1px solid #ffc107", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <i className="bi bi-lightbulb-fill" style={{ color: "#f59e0b", marginTop: "2px" }}></i>
                    <div>
                      <strong style={{ fontSize: "12px", color: "#856404" }}>AI Duration Suggestion</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#78350f" }}>{trip.duration_note}</p>
                      {trip.suggested_days && trip.suggested_days !== days && (
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#0f5132", fontWeight: "600" }}>
                          Recommended: <strong>{trip.suggested_days} days</strong> for {trip.destination}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Mode Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
                    <i className="bi bi-calendar3" style={{ color: "#0f5132" }}></i> Day-wise Itinerary
                  </h4>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {editMode ? (
                      <>
                        <button onClick={saveItinerary}
                          style={{ padding: "5px 12px", background: "#0f5132", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
                          <i className="bi bi-check2"></i> Save Changes
                        </button>
                        <button onClick={() => { setEditMode(false); setItinerary(trip.itinerary); }}
                          style={{ padding: "5px 12px", background: "#e2e8f0", color: "#333", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEditMode(true)}
                        style={{ padding: "5px 12px", background: "#e8f5e9", color: "#0f5132", border: "1px solid #0f5132", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>
                        <i className="bi bi-pencil"></i> Edit Itinerary
                      </button>
                    )}
                  </div>
                </div>

                {/* Itinerary Days */}
                <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                  {itinerary.map((day, di) => (
                    <div key={di} style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontWeight: "700", color: "#0f5132", marginBottom: "8px", fontSize: "13px" }}>
                        Day {day.day}
                      </div>

                      {/* Activities list */}
                      {day.activities.map((act, ai) => (
                        <div key={act.id || ai} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #eee" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className="bi bi-circle-fill" style={{ fontSize: "5px", color: "#0f5132" }}></i>
                            <span style={{ fontSize: "12px", color: "#475569" }}>{act.name}</span>
                            {act.duration && <span style={{ fontSize: "10px", color: "#94a3b8", background: "#f1f5f9", padding: "1px 6px", borderRadius: "10px" }}>{act.duration}</span>}
                          </div>
                          {editMode && (
                            <button onClick={() => deleteActivity(di, act.id || act.name)}
                              title="Remove this activity"
                              style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "14px", padding: "0 4px" }}>
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Suggestions section */}
                      {editMode && (
                        <div style={{ marginTop: "8px" }}>
                          <button onClick={() => getSuggestions(di)} disabled={loadingSugg[di]}
                            style={{ fontSize: "11px", color: "#0f5132", background: "none", border: "1px dashed #0f5132", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", marginTop: "4px" }}>
                            {loadingSugg[di] ? "Getting suggestions..." : <><i className="bi bi-plus-circle"></i> Suggest activities</>}
                          </button>

                          {suggestions[di] && suggestions[di].length > 0 && (
                            <div style={{ marginTop: "8px", background: "#e8f5e9", borderRadius: "6px", padding: "8px" }}>
                              <p style={{ fontSize: "11px", color: "#0f5132", fontWeight: "700", margin: "0 0 6px" }}>
                                AI Suggestions — click to add:
                              </p>
                              {suggestions[di].map(s => (
                                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                                  <span style={{ fontSize: "12px", color: "#333" }}>
                                    <i className="bi bi-magic"></i> {s.name}
                                    {s.duration && <span style={{ color: "#999", fontSize: "10px" }}> ({s.duration})</span>}
                                  </span>
                                  <button onClick={() => addActivity(di, s)}
                                    style={{ background: "#0f5132", color: "white", border: "none", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", cursor: "pointer" }}>
                                    + Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Travel Tips */}
                {trip.travel_tips?.length > 0 && (
                  <div style={{ background: "#fff8e6", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                      <i className="bi bi-lightbulb-fill" style={{ color: "#d97706" }}></i> Travel Tips
                    </h4>
                    {trip.travel_tips.map((tip, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "#78350f", display: "flex", gap: "6px", marginBottom: "4px" }}>
                        <i className="bi bi-check2-circle" style={{ color: "#d97706", flexShrink: 0 }}></i> {tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={saveTrip}
                    style={{ flex: 1, padding: "10px", background: "#e8f5e9", color: "#0f5132", border: "1px solid #0f5132", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    <i className="bi bi-bookmark-check-fill"></i> Save This Trip
                  </button>
                  <button onClick={bookTrip}
                    style={{ flex: 1, padding: "10px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    <i className="bi bi-calendar-check"></i> Book This Trip
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: BUDGET + COUPON ─────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Budget card */}
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                <i className="bi bi-wallet2"></i> Book and Plan
              </h4>
              {trip ? (
                <>
                  <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f5132", marginBottom: "4px" }}>
                    ₹{(couponResult?.valid ? couponResult.finalAmount : trip.estimated_budget)?.toLocaleString()}
                  </div>
                  <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 12px" }}>estimated for {groupSize}</p>

                  {/* Coupon input */}
                  <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#333", margin: "0 0 6px" }}>
                      <i className="bi bi-tag"></i> Have a Coupon?
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        placeholder="Enter code"
                        value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        style={{ flex: 1, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }}
                      />
                      <button onClick={applyCoupon} disabled={couponLoading}
                        style={{ padding: "6px 10px", background: "#0f5132", color: "white", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>

                    {couponResult && (
                      <div style={{ marginTop: "8px", padding: "8px", borderRadius: "6px", background: couponResult.valid ? "#e8f5e9" : "#fde8e8" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: couponResult.valid ? "#0f5132" : "#e74c3c", fontWeight: "700" }}>
                          {couponResult.valid ? <><i className="bi bi-check-circle-fill"></i> {couponResult.message}</> : <><i className="bi bi-x-circle"></i> {couponResult.message}</>}
                        </p>
                      </div>
                    )}

                    {/* Available coupons */}
                    {coupons.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px" }}>Your coupons:</p>
                        {coupons.map(c => (
                          <div key={c._id} onClick={() => setCouponCode(c.code)}
                            style={{ background: "#f8fffe", border: "1px dashed #0f5132", borderRadius: "6px", padding: "6px 8px", marginBottom: "4px", cursor: "pointer" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f5132" }}>{c.code}</span>
                            <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>{c.discount}% OFF</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>Generate a trip to see budget estimate</p>
              )}
            </div>

            {/* Why AI Planning */}
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>
                <i className="bi bi-stars"></i> Why AI Planning?
              </h4>
              {[
                ["bi-lightning-fill", "Instant personalised itinerary"],
                ["bi-piggy-bank", "Smart budget estimation"],
                ["bi-gem", "Hidden gems and local tips"],
                ["bi-pencil-square", "Edit activities your way"],
                ["bi-emoji-smile", "Matches your exact vibe"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                  <i className={`bi ${icon}`} style={{ color: "#0f5132", fontSize: "12px" }}></i>
                  <span style={{ fontSize: "11px", color: "#475569" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Shared styles
const lbl = { fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" };
const inp = { width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" };

export default SmartTrips;