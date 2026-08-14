import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axiosInstance";

function Payment() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  // Get data passed from TripDetails or SmartTrips
  const stateData  = location.state || {};
  const queryParams = new URLSearchParams(location.search);

  const trip       = stateData.trip || null;
  const travelDate = stateData.travelDate || "";
  const isAITrip   = stateData.isAITrip || queryParams.get("aiTrip") === "true";
  const aiTripName = stateData.tripName || queryParams.get("tripName") || "";
  const baseAmount = stateData.amount || (trip ? trip.price : 0) || Number(queryParams.get("amount") || 0);

  // ── Price calculation ──────────────────────────────────
  const gst            = Math.round(baseAmount * 0.05);
  const convenienceFee = 99;
  const originalTotal  = baseAmount + gst + convenienceFee;

  // ── State ──────────────────────────────────────────────
  const [method,     setMethod]     = useState("upi");
  const [upiId,      setUpiId]      = useState("");
  const [cardNo,     setCardNo]     = useState("");
  const [cardName,   setCardName]   = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [bank,       setBank]       = useState("");

  const [couponCode,   setCouponCode]   = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [coupons,      setCoupons]      = useState([]);
  const [couponLoading,setCouponLoading]= useState(false);

  const [screen,     setScreen]     = useState("form");  // form | processing | success | failed
  const [bookingId,  setBookingId]  = useState("");

  const finalTotal = couponResult?.valid ? couponResult.finalAmount : originalTotal;

  const banks = ["SBI","HDFC","ICICI","Axis","Kotak","PNB","BOB","Canara"];

  useEffect(() => {
    if (user._id) {
      API.get(`/api/payments/coupons/${user._id}`)
      .then(res => setCoupons(res.data))
      .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Apply coupon ───────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponResult(null);
    try {
      const res = await API.post("/api/payments/apply-coupon", {
        code: couponCode, user_id: user._id, amount: originalTotal,
      });
      setCouponResult(res.data);
    } catch (err) {
      setCouponResult({ valid: false, message: err.response?.data?.message || "Invalid coupon." });
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Card number formatter ──────────────────────────────
  const formatCard = (val) => {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  // ── Validate ───────────────────────────────────────────
  const validate = () => {
    if (method === "upi")     return upiId.includes("@") && upiId.length > 3;
    if (method === "card")    return cardNo.replace(/\s/g,"").length === 16 && cardName.length > 2 && expiry.length === 5 && cvv.length === 3;
    if (method === "netbank") return bank !== "";
    return false;
  };

  // ── Pay ────────────────────────────────────────────────
  const handlePay = () => {
    if (!validate()) { alert("Please fill all details correctly."); return; }
    setScreen("processing");

    setTimeout(async () => {
      const isSuccess = Math.random() > 0.1;

      try {
        if (isSuccess) {
          // 1. Create booking
          const bookingRes = await API.post("/api/bookings", {
            user_id:        user._id,
            trip_id:        isAITrip ? null : trip?._id,
            trip_name:      isAITrip ? aiTripName : trip?.title,
            travel_date:    travelDate,
            booking_date:   new Date(),
            booking_status: "Pending",
            payment_status: "Paid",
            total_amount:   finalTotal,
          });

          const bId = bookingRes.data._id || bookingRes.data.booking?._id;
          setBookingId(bId);

          // 2. Save payment + trigger email + discount logic
          await API.post("/api/payments", {
            user_id:        user._id,
            booking_id:     bId,
            amount:         finalTotal,
            payment_method: method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking",
            payment_status: "Success",
            trip_id:        isAITrip ? null : trip?._id,
            trip_name:      isAITrip ? aiTripName : trip?.title,
            travel_date:    travelDate,
            total_amount:   finalTotal,
          });

          // 3. Mark coupon as used if applied
          if (couponResult?.valid && couponCode) {
            await API.put(`/api/payments/use-coupon`, { code: couponCode, user_id: user._id }).catch(() => {});
          }

          setScreen("success");
        } else {
          // Save failed payment
          await API.post("/api/payments", {
            user_id: user._id, amount: finalTotal,
            payment_method: method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking",
            payment_status: "Failed",
          });
          setScreen("failed");
        }
      } catch (err) {
        console.error(err);
        setScreen("failed");
      }
    }, 2500);
  };

  // ─────────────────────────────────────────────────────
  // SCREENS
  // ─────────────────────────────────────────────────────

  if (screen === "processing") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fffe" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "50px", animation: "spin 1s linear infinite" }}>⏳</div>
        <h3 style={{ color: "#0f5132", marginTop: "16px" }}>Processing your payment...</h3>
        <p style={{ color: "#6c757d" }}>Please do not close this window</p>
      </div>
    </div>
  );

  if (screen === "success") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fffe" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", maxWidth: "440px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "56px" }}>✅</div>
        <h2 style={{ color: "#0f5132", marginTop: "12px" }}>Payment Successful!</h2>
        <p style={{ color: "#6c757d", fontSize: "14px" }}>A confirmation email has been sent to <strong>{user.email}</strong></p>

        <div style={{ background: "#f8fffe", border: "1px solid #d4edda", borderRadius: "8px", padding: "16px", margin: "16px 0", textAlign: "left" }}>
          {[
            ["Trip", isAITrip ? aiTripName : trip?.title],
            ["Amount Paid", `₹${finalTotal?.toLocaleString()}`],
            ["Payment Method", method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking"],
            bookingId ? ["Booking ID", bookingId] : null,
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #eee", fontSize: "13px" }}>
              <span style={{ color: "#666" }}>{label}</span>
              <span style={{ fontWeight: "700", color: "#333" }}>{value}</span>
            </div>
          ))}
        </div>

        {couponResult?.valid && (
          <div style={{ background: "#e8f5e9", borderRadius: "8px", padding: "10px", marginBottom: "12px", fontSize: "13px", color: "#0f5132" }}>
            <i className="bi bi-tag-fill"></i> Coupon <strong>{couponCode}</strong> saved you <strong>₹{couponResult.discountAmount}</strong>!
          </div>
        )}

        <p style={{ fontSize: "12px", color: "#0f5132", background: "#e8f5e9", padding: "10px", borderRadius: "8px" }}>
          🎁 Check your email — if this is your first booking, a special discount coupon is waiting for you!
        </p>

        <button onClick={() => navigate("/my-trips")}
          style={{ width: "100%", marginTop: "12px", padding: "12px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
          View My Bookings
        </button>
      </div>
    </div>
  );

  if (screen === "failed") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fffe" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "56px" }}>❌</div>
        <h2 style={{ color: "#e74c3c", marginTop: "12px" }}>Payment Failed</h2>
        <p style={{ color: "#6c757d", fontSize: "14px" }}>Something went wrong. Your amount has not been deducted.</p>
        <button onClick={() => setScreen("form")}
          style={{ marginTop: "16px", padding: "12px 30px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
          Try Again
        </button>
      </div>
    </div>
  );

  // ── PAYMENT FORM ───────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fffe" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>

        {/* LEFT: Payment form */}
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 20px", color: "#1e293b" }}>Complete Payment</h3>

          {/* Method tabs */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {[["upi","bi-phone","UPI"],["card","bi-credit-card","Card"],["netbank","bi-bank","Net Banking"]].map(([m, icon, label]) => (
              <button key={m} onClick={() => setMethod(m)}
                style={{ flex: 1, padding: "10px", border: method === m ? "2px solid #0f5132" : "1px solid #e2e8f0", borderRadius: "8px", background: method === m ? "#f0fff4" : "white", color: method === m ? "#0f5132" : "#666", cursor: "pointer", fontSize: "13px", fontWeight: method === m ? "700" : "400" }}>
                <i className={`bi ${icon}`}></i><br />{label}
              </button>
            ))}
          </div>

          {/* UPI */}
          {method === "upi" && (
            <div>
              <label style={lbl}>UPI ID</label>
              <input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} style={inp} />
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                <i className="bi bi-info-circle"></i> Supports GPay, PhonePe, Paytm, BHIM
              </p>
            </div>
          )}

          {/* Card */}
          {method === "card" && (
            <div style={{ display: "grid", gap: "12px" }}>
              <div>
                <label style={lbl}>Card Number</label>
                <input placeholder="1234 5678 9012 3456" value={cardNo}
                  onChange={e => setCardNo(formatCard(e.target.value))} style={inp} maxLength={19} />
              </div>
              <div>
                <label style={lbl}>Name on Card</label>
                <input placeholder="JOHN DOE" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} style={inp} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={lbl}>Expiry (MM/YY)</label>
                  <input placeholder="08/27" value={expiry}
                    onChange={e => { let v = e.target.value.replace(/\D/g,""); if(v.length>=2) v=v.slice(0,2)+"/"+v.slice(2,4); setExpiry(v); }}
                    style={inp} maxLength={5} />
                </div>
                <div>
                  <label style={lbl}>CVV</label>
                  <input placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value.slice(0,3))} style={inp} maxLength={3} />
                </div>
              </div>
            </div>
          )}

          {/* Net Banking */}
          {method === "netbank" && (
            <div>
              <label style={lbl}>Select Bank</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {banks.map(b => (
                  <button key={b} onClick={() => setBank(b)}
                    style={{ padding: "10px 6px", border: bank === b ? "2px solid #0f5132" : "1px solid #e2e8f0", borderRadius: "6px", background: bank === b ? "#f0fff4" : "white", color: bank === b ? "#0f5132" : "#333", cursor: "pointer", fontSize: "12px", fontWeight: bank === b ? "700" : "400" }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Coupon */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <label style={lbl}><i className="bi bi-tag"></i> Have a Coupon Code?</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input placeholder="e.g. FIRST10XXXX" value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ ...inp, flex: 1 }} />
              <button onClick={applyCoupon} disabled={couponLoading}
                style={{ padding: "8px 16px", background: "#0f5132", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
            {couponResult && (
              <p style={{ fontSize: "12px", marginTop: "6px", color: couponResult.valid ? "#0f5132" : "#e74c3c", fontWeight: "700" }}>
                {couponResult.valid ? <><i className="bi bi-check-circle-fill"></i> {couponResult.message}</> : <><i className="bi bi-x-circle"></i> {couponResult.message}</>}
              </p>
            )}
            {coupons.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 4px" }}>Your available coupons:</p>
                {coupons.map(c => (
                  <span key={c._id} onClick={() => setCouponCode(c.code)}
                    style={{ display: "inline-block", background: "#e8f5e9", color: "#0f5132", border: "1px dashed #0f5132", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", cursor: "pointer", marginRight: "6px", fontWeight: "700" }}>
                    {c.code} ({c.discount}% OFF)
                  </span>
                ))}
              </div>
            )}
          </div>

          <button onClick={handlePay}
            style={{ width: "100%", marginTop: "20px", padding: "14px", background: "#0f5132", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
            <i className="bi bi-lock-fill"></i> Pay ₹{finalTotal?.toLocaleString()}
          </button>
        </div>

        {/* RIGHT: Order summary */}
        <div>
          <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <h4 style={{ margin: "0 0 14px", fontSize: "14px", color: "#1e293b" }}>Order Summary</h4>
            <p style={{ fontWeight: "700", color: "#0f5132", fontSize: "15px", margin: "0 0 4px" }}>
              {isAITrip ? aiTripName : trip?.title}
            </p>
            {!isAITrip && trip && (
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px" }}>
                <i className="bi bi-geo-alt-fill"></i> {trip.location}
              </p>
            )}
            <hr style={{ borderColor: "#eee" }} />
            {[
              ["Base Price", `₹${baseAmount?.toLocaleString()}`],
              ["GST (5%)", `₹${gst}`],
              ["Convenience Fee", "₹99"],
              couponResult?.valid ? ["Coupon Discount", `-₹${couponResult.discountAmount}`] : null,
            ].filter(Boolean).map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "13px" }}>
                <span style={{ color: "#666" }}>{label}</span>
                <span style={{ color: label === "Coupon Discount" ? "#0f5132" : "#333", fontWeight: label === "Coupon Discount" ? "700" : "400" }}>{val}</span>
              </div>
            ))}
            <hr style={{ borderColor: "#eee" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "15px", color: "#0f5132" }}>
              <span>Total</span>
              <span>₹{finalTotal?.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px", textAlign: "center" }}>
              <i className="bi bi-shield-lock-fill"></i> 100% Secure Payment
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

const lbl = { fontSize: "12px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "5px" };
const inp = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px", outline: "none", boxSizing: "border-box" };

export default Payment;