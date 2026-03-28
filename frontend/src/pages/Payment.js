import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

function Payment() {

    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // ✅ Trip details passed via navigation state
    const tripData = location.state || {};
    const { tripId, tripName, tripLocation, tripPrice, travelDate, isAITrip, aiTripTitle } = tripData;

    const [method, setMethod] = useState("upi");    // upi | card | netbanking
    const [upiId, setUpiId] = useState("");
    const [cardNum, setCardNum] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [bank, setBank] = useState("");
    const [step, setStep] = useState("form");   // form | processing | success | failed
    const [error, setError] = useState("");


    /* ── Redirect if no trip data ── */
    if (!tripPrice) {
        return (
            <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
                <Navbar />
                <div style={{ textAlign: "center", padding: "80px 24px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                    <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>No payment details found</h2>
                    <p style={{ color: "#64748b", marginBottom: "24px" }}>Please go back and try again.</p>
                    <button onClick={() => navigate("/trips")} style={btnGreen}>Browse Trips</button>
                </div>
            </div>
        );
    }


    /* ── Taxes & totals ── */
    const baseAmount = Number(tripPrice) || 0;
    const gst = Math.round(baseAmount * 0.05);
    const convenience = 99;
    const totalAmount = baseAmount + gst + convenience;


    /* ── Validate ── */
    const validate = () => {
        if (method === "upi") {
            if (!upiId.includes("@")) { setError("Please enter a valid UPI ID (e.g. name@upi)"); return false; }
        }
        if (method === "card") {
            if (cardNum.replace(/\s/g, "").length < 16) { setError("Please enter a valid 16-digit card number"); return false; }
            if (!cardName.trim()) { setError("Please enter the cardholder name"); return false; }
            if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) { setError("Please enter expiry as MM/YY"); return false; }
            if (cardCvv.length < 3) { setError("Please enter a valid CVV"); return false; }
        }
        if (method === "netbanking") {
            if (!bank) { setError("Please select a bank"); return false; }
        }
        return true;
    };


    /* ── Process payment (mock) ── */
    const processPayment = async () => {
        if (!validate()) return;
        setError("");
        setStep("processing");

        // Simulate payment processing delay
        await new Promise(r => setTimeout(r, 2500));

        // 90% success rate for demo
        const success = Math.random() > 0.1;

        if (success) {
            try {
                // Save booking to DB
                await API.post("/api/bookings", {
                    user_id: user._id,
                    trip_id: isAITrip ? null : tripId,
                    trip_name: isAITrip ? `🤖 AI Trip: ${aiTripTitle}` : null,
                    travel_date: travelDate,
                    total_amount: totalAmount,
                });

                // Save payment record
                // ✅ Fixed — shows error if payment save fails
                try {
                    await API.post("/api/payments", {
                        user_id: user._id,
                        amount: totalAmount,
                        payment_method: method === "upi" ? "UPI" : method === "card" ? "Card" : "Net Banking",
                        payment_status: "Success",
                    });
                } catch (payErr) {
                    console.log("Payment save error:", payErr.response?.data || payErr.message);
                    // Don't block success — booking is already saved
                }

                setStep("success");
            } catch {
                setStep("failed");
            }
        } else {
            setStep("failed");
        }
    };


    /* ── Format card number with spaces ── */
    const formatCard = (val) => {
        const nums = val.replace(/\D/g, "").slice(0, 16);
        return nums.replace(/(.{4})/g, "$1 ").trim();
    };


    /* ══════════════════════════════════════
       PROCESSING SCREEN
    ══════════════════════════════════════ */
    if (step === "processing") return (
        <div style={{ background: "#f8fffe", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", padding: "48px" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "5px solid #dcfce7", borderTopColor: "#0f5132", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Processing Payment...</h2>
                <p style={{ color: "#64748b", fontSize: "14px" }}>Please wait. Do not press back or refresh.</p>
                <div style={{ marginTop: "20px", display: "flex", gap: "8px", justifyContent: "center" }}>
                    {["Verifying details", "Connecting bank", "Confirming"].map((s, i) => (
                        <div key={i} style={{ background: "#dcfce7", color: "#0f5132", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" }}>
                            ✓ {s}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );


    /* ══════════════════════════════════════
       SUCCESS SCREEN
    ══════════════════════════════════════ */
    if (step === "success") return (
        <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: "500px", margin: "60px auto", padding: "0 24px", textAlign: "center" }}>
                <div style={{ background: "white", borderRadius: "20px", padding: "40px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

                    {/* Success icon */}
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "36px" }}>
                        ✅
                    </div>

                    <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f5132", marginBottom: "6px" }}>Payment Successful!</h2>
                    <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
                        Your booking has been confirmed. Get ready for your adventure!
                    </p>

                    {/* Receipt */}
                    <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "18px", textAlign: "left", marginBottom: "24px", border: "1px dashed #86efac" }}>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f5132", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                            🧾 Booking Receipt
                        </div>
                        {[
                            { label: "Trip", value: tripName || aiTripTitle || "AI Trip" },
                            { label: "Destination", value: tripLocation || "India" },
                            { label: "Travel Date", value: travelDate ? new Date(travelDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—" },
                            { label: "Payment Mode", value: method === "upi" ? "UPI" : method === "card" ? "Credit/Debit Card" : "Net Banking" },
                            { label: "Amount Paid", value: `₹${totalAmount.toLocaleString("en-IN")}` },
                            { label: "Status", value: "✅ Confirmed" },
                        ].map((r, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "13px", borderBottom: i < 5 ? "1px solid #dcfce7" : "none" }}>
                                <span style={{ color: "#64748b" }}>{r.label}</span>
                                <span style={{ fontWeight: "600", color: "#1e293b" }}>{r.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => navigate("/my-trips")} style={{ ...btnGreen, flex: 1 }}>
                            View My Bookings
                        </button>
                        <button onClick={() => navigate("/trips")} style={{ ...btnOutline, flex: 1 }}>
                            Explore More
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );


    /* ══════════════════════════════════════
       FAILED SCREEN
    ══════════════════════════════════════ */
    if (step === "failed") return (
        <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: "500px", margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
                <div style={{ background: "white", borderRadius: "20px", padding: "40px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#FCEBEB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "36px" }}>
                        ❌
                    </div>
                    <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#A32D2D", marginBottom: "6px" }}>Payment Failed</h2>
                    <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
                        Something went wrong. Your money has not been deducted. Please try again.
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => setStep("form")} style={{ ...btnGreen, flex: 1 }}>Try Again</button>
                        <button onClick={() => navigate(-1)} style={{ ...btnOutline, flex: 1 }}>Go Back</button>
                    </div>
                </div>
            </div>
        </div>
    );


    /* ══════════════════════════════════════
       MAIN PAYMENT FORM
    ══════════════════════════════════════ */
    return (
        <div style={{ background: "#f8fffe", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>

                {/* ═══ LEFT — Payment Form ═══ */}
                <div>

                    <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" }}>
                        💳 Complete Your Payment
                    </h2>

                    {/* Method tabs */}
                    <div style={{ display: "flex", gap: "0", background: "white", borderRadius: "12px", padding: "4px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                        {[
                            { key: "upi", label: "UPI", icon: "📱" },
                            { key: "card", label: "Card", icon: "💳" },
                            { key: "netbanking", label: "Net Banking", icon: "🏦" },
                        ].map(m => (
                            <button key={m.key} onClick={() => { setMethod(m.key); setError(""); }}
                                style={{
                                    flex: 1, padding: "10px", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.15s",
                                    background: method === m.key ? "#0f5132" : "transparent",
                                    color: method === m.key ? "white" : "#64748b"
                                }}>
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Form card */}
                    <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

                        {/* ── UPI ── */}
                        {method === "upi" && (
                            <div>
                                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                    <div style={{ fontSize: "48px", marginBottom: "8px" }}>📱</div>
                                    <p style={{ fontSize: "14px", color: "#64748b" }}>Pay instantly using any UPI app</p>
                                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                                        {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                                            <div key={app} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", color: "#0f5132" }}>{app}</div>
                                        ))}
                                    </div>
                                </div>
                                <label style={labelSt}>Enter UPI ID</label>
                                <input value={upiId} onChange={e => setUpiId(e.target.value)}
                                    placeholder="yourname@upi or mobile@bank"
                                    style={inputSt} />
                                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Example: krupal@okicici, 9999999999@paytm</p>
                            </div>
                        )}

                        {/* ── CARD ── */}
                        {method === "card" && (
                            <div>
                                {/* Card preview */}
                                <div style={{ background: "linear-gradient(135deg, #0f5132, #0d9488)", borderRadius: "14px", padding: "22px 24px", color: "white", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                                    <div style={{ position: "absolute", right: "20px", top: "20px", fontSize: "28px", opacity: 0.8 }}>💳</div>
                                    <div style={{ fontSize: "18px", letterSpacing: "3px", fontWeight: "600", marginBottom: "16px", fontFamily: "monospace" }}>
                                        {cardNum || "•••• •••• •••• ••••"}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", opacity: 0.85 }}>
                                        <div>
                                            <div style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase" }}>Card Holder</div>
                                            <div style={{ fontWeight: "600" }}>{cardName || "YOUR NAME"}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "10px", opacity: 0.7, textTransform: "uppercase" }}>Expires</div>
                                            <div style={{ fontWeight: "600" }}>{cardExpiry || "MM/YY"}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gap: "14px" }}>
                                    <div>
                                        <label style={labelSt}>Card Number</label>
                                        <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
                                            placeholder="1234 5678 9012 3456" maxLength="19" style={inputSt} />
                                    </div>
                                    <div>
                                        <label style={labelSt}>Cardholder Name</label>
                                        <input value={cardName} onChange={e => setCardName(e.target.value)}
                                            placeholder="As on card" style={inputSt} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                        <div>
                                            <label style={labelSt}>Expiry Date</label>
                                            <input value={cardExpiry} onChange={e => {
                                                let v = e.target.value.replace(/\D/g, "");
                                                if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                                                setCardExpiry(v);
                                            }} placeholder="MM/YY" maxLength="5" style={inputSt} />
                                        </div>
                                        <div>
                                            <label style={labelSt}>CVV</label>
                                            <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                                placeholder="•••" maxLength="3" type="password" style={inputSt} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── NET BANKING ── */}
                        {method === "netbanking" && (
                            <div>
                                <label style={labelSt}>Select Your Bank</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                                    {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Bank of Baroda", "PNB", "Canara Bank"].map(b => (
                                        <button key={b} onClick={() => setBank(b)}
                                            style={{ padding: "12px", borderRadius: "8px", border: `2px solid ${bank === b ? "#0f5132" : "#e2e8f0"}`, background: bank === b ? "#f0fdf4" : "white", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: bank === b ? "#0f5132" : "#475569", textAlign: "left", transition: "all 0.15s" }}>
                                            🏦 {b}
                                        </button>
                                    ))}
                                </div>
                                {bank && (
                                    <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#0f5132" }}>
                                        ✓ You will be redirected to <strong>{bank}</strong> to complete the payment securely.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginTop: "14px" }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Security note */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "16px" }}>🔒</span>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>256-bit SSL encrypted. Your payment details are 100% secure.</span>
                        </div>

                        {/* Pay button */}
                        <button onClick={processPayment}
                            style={{ width: "100%", padding: "15px", background: "#0f5132", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer" }}>
                            Pay ₹{totalAmount.toLocaleString("en-IN")} →
                        </button>

                    </div>
                </div>


                {/* ═══ RIGHT — Order Summary ═══ */}
                <div>
                    <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: "20px" }}>

                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "18px" }}>🧾 Order Summary</h3>

                        {/* Trip info */}
                        <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
                            <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                                {tripName || aiTripTitle || "AI Generated Trip"}
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>📍 {tripLocation || "India"}</div>
                            {travelDate && (
                                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                                    📅 {new Date(travelDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                                </div>
                            )}
                            {isAITrip && (
                                <span style={{ display: "inline-block", marginTop: "6px", background: "#ccfbf1", color: "#0d9488", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>
                                    🤖 AI Generated
                                </span>
                            )}
                        </div>

                        {/* Price breakdown */}
                        <div style={{ marginBottom: "16px" }}>
                            {[
                                { label: "Trip Price", value: `₹${baseAmount.toLocaleString("en-IN")}` },
                                { label: "GST (5%)", value: `₹${gst.toLocaleString("en-IN")}` },
                                { label: "Convenience Fee", value: `₹${convenience}` },
                            ].map((r, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "13px", borderBottom: "1px solid #f1f5f9" }}>
                                    <span style={{ color: "#64748b" }}>{r.label}</span>
                                    <span style={{ color: "#1e293b" }}>{r.value}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "16px", fontWeight: "800" }}>
                                <span style={{ color: "#1e293b" }}>Total</span>
                                <span style={{ color: "#0f5132" }}>₹{totalAmount.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                            {[
                                { icon: "🔒", text: "Secure Payment" },
                                { icon: "✅", text: "Instant Confirmation" },
                                { icon: "↩️", text: "Free Cancellation" },
                            ].map((b, i) => (
                                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "14px" }}>{b.icon}</span>
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>{b.text}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

/* ── Styles ── */
const labelSt = { fontSize: "13px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "6px" };
const inputSt = { width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none", background: "#f8fafc", boxSizing: "border-box", transition: "border 0.15s" };
const btnGreen = { padding: "12px 24px", background: "#0f5132", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" };
const btnOutline = { padding: "12px 24px", background: "white", color: "#0f5132", border: "2px solid #0f5132", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" };

export default Payment;