import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import Navbar from "../components/Navbar";

import rajasthan from "../images/rajasthan.jpg";
import leh from "../images/leh.png";
import goa from "../images/goa.jpg";
import bgHero from "../images/bg.jpg";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BLOGS = [
  { place: "Jodhpur, Rajasthan", subtitle: "The Blue City of Royal Heritage", content: "Jodhpur is known for its majestic Mehrangarh Fort, blue-painted houses, royal palaces, and vibrant markets.", author: "Ananya Sharma", img: rajasthan },
  { place: "Goa, India", subtitle: "The Beach Paradise of India", content: "Goa offers golden beaches, vibrant nightlife, historic forts, and delicious seafood.", author: "Rohan Mehta", img: goa },
  { place: "Leh and Ladakh", subtitle: "The Land of High Passes", content: "A dream destination with snow-capped mountains, Pangong Lake, Nubra Valley, and thrilling bike trips.", author: "Arjun Singh", img: leh },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "iMSc IT, GLS University", quote: "GoBeyond planned our entire Rajasthan trip in minutes. The AI suggestions were spot on and saved us hours of research.", initials: "PS", color: "#0f5132" },
  { name: "Rahul Mehta", role: "Engineering Student, Nirma", quote: "Booked a Leh Ladakh trip for our college group. The guide assigned was amazing and the whole experience was seamless.", initials: "RM", color: "#0d9488" },
  { name: "Sneha Patel", role: "MBA Student, MICA", quote: "Smart Trips feature is unbelievable! It created a full 7-day cultural itinerary for Varanasi with budget estimates too.", initials: "SP", color: "#854F0B" },
];

const AI_FEATURES = [
  { icon: "bi-activity", title: "Adventure", desc: "GoBeyond uses AI to personalise your journey for thrilling experiences." },
  { icon: "bi-heart-pulse", title: "Wellness", desc: "GoBeyond curates enrichments and wellness stops for your wellbeing." },
  { icon: "bi-building-columns", title: "Culture", desc: "GoBeyond uses AI to immerse you in the finest cultural stories." },
  { icon: "bi-stars", title: "Spiritual", desc: "GoBeyond uses AI to connect you with sacred and spiritual places." },
];

function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState([]);
  const [category, setCategory] = useState("All");
  const [loadTrips, setLoadTrips] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const CATEGORIES = ["All", "Adventure", "Cultural", "Nature", "Industrial", "Educational"];

  const categoryIcon = {
    "All": "bi-grid",
    "Adventure": "bi-activity",
    "Cultural": "bi-building",
    "Nature": "bi-tree",
    "Industrial": "bi-buildings",
    "Educational": "bi-mortarboard",
  };

  useEffect(() => {
    API.get("/api/trips")
      .then(res => { setTrips(res.data.slice(0, 8)); setLoadTrips(false); })
      .catch(() => setLoadTrips(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = trips.filter(t =>
    (category === "All" || t.category === category) &&
    (search === "" || t.title?.toLowerCase().includes(search.toLowerCase()) || t.location?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSearch = () => { if (search.trim()) navigate(`/trips?q=${search}`); };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fff", overflowX: "hidden" }}>
      <Navbar />

      {/* ══ HERO ══ */}
      <section ref={heroRef} style={{ position: "relative", height: "100vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${scrollY * 0.4}px)` }}>
          <img src={bgHero} alt="hero" style={{ width: "100%", height: "120%", objectFit: "cover", objectPosition: "center" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.7) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "white", padding: "6px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.3)", letterSpacing: "1px" }}>
            <i className="bi bi-geo-alt-fill"></i> INDIA'S AI TRAVEL PLATFORM
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: "800", color: "white", lineHeight: "1.1", marginBottom: "16px", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
            Find Your Special<br /><span style={{ color: "#86efac" }}>Tour Today</span>
          </h1>

          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.88)", marginBottom: "36px", lineHeight: "1.6" }}>
            Explore incredible India and create unforgettable memories<br />
            with AI-powered personalised trip planning
          </p>

          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.97)", borderRadius: "50px", padding: "6px 6px 6px 20px", maxWidth: "580px", margin: "0 auto 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <i className="bi bi-search" style={{ fontSize: "16px", color: "#94a3b8", marginRight: "8px" }}></i>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search destinations... (Goa, Rajasthan, Leh...)"
              style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", background: "transparent", color: "#1e293b" }} />
            <button onClick={handleSearch}
              style={{ padding: "12px 28px", background: "#0f5132", color: "white", border: "none", borderRadius: "40px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
              Search
            </button>
          </div>

          <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { num: "500+", label: "Curated Trips", icon: "bi-map-fill" },
              { num: "50+", label: "Expert Guides", icon: "bi-person-badge-fill" },
              { num: "10k+", label: "Happy Travelers", icon: "bi-people-fill" },
              { num: "AI", label: "Powered Planner", icon: "bi-robot" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#86efac", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                  <i className={`bi ${s.icon}`} style={{ fontSize: "16px" }}></i> {s.num}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", color: "white", opacity: 0.6, fontSize: "12px", textAlign: "center" }}>
          <div style={{ marginBottom: "4px" }}>Scroll to explore</div>
          <i className="bi bi-chevron-double-down" style={{ fontSize: "16px" }}></i>
        </div>
      </section>


      {/* ══ FEATURED TRIPS ══ */}
      <section style={{ background: "#f8fffe", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#0f5132", padding: "4px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
              <i className="bi bi-airplane-fill"></i> FEATURED TRIPS
            </div>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Explore India's Best Destinations</h2>
            <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>Handpicked trips across India — from misty mountains to golden beaches</p>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "36px" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{
                  padding: "8px 20px", borderRadius: "25px", border: "2px solid", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px",
                  borderColor: category === cat ? "#0f5132" : "#e2e8f0",
                  background: category === cat ? "#0f5132" : "white",
                  color: category === cat ? "white" : "#475569"
                }}>
                <i className={`bi ${categoryIcon[cat]}`}></i> {cat}
              </button>
            ))}
          </div>

          {loadTrips ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <i className="bi bi-arrow-repeat" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}></i>
              Loading trips...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <i className="bi bi-search" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}></i>
              No trips found. Try a different category.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {filtered.map(trip => (
                <div key={trip._id} onClick={() => navigate(`/trips/${trip._id}`)}
                  style={{ background: "white", borderRadius: "16px", overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.14)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}>
                  <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
                    {trip.images?.[0] ? (
                      <img src={`${BASE_URL}/uploads/${trip.images[0]}`} alt={trip.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0f5132, #0d9488)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-airplane" style={{ fontSize: "40px", color: "white", opacity: 0.7 }}></i>
                      </div>
                    )}
                    {trip.category && (
                      <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(15,81,50,0.85)", color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className={`bi ${categoryIcon[trip.category] || "bi-tag"}`}></i> {trip.category}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "5px" }}>{trip.title}</h3>
                    <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="bi bi-geo-alt-fill" style={{ color: "#0f5132" }}></i> {trip.location}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Starting from</span>
                        <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f5132", display: "flex", alignItems: "center", gap: "2px" }}>
                          <i className="bi bi-currency-rupee" style={{ fontSize: "14px" }}></i>
                          {trip.price?.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <button style={{ padding: "7px 14px", background: "#dcfce7", color: "#0f5132", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        View <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button onClick={() => navigate("/trips")}
              style={{ padding: "13px 36px", background: "#0f5132", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              View All Trips <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>


      {/* ══ AI SMART TRIPS BANNER ══ */}
      <section style={{ background: "white", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg, #0f5132 0%, #0d9488 50%, #1d4ed8 100%)", borderRadius: "24px", padding: "56px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", color: "white", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", marginBottom: "14px", letterSpacing: "1px" }}>
                <i className="bi bi-robot"></i> AI POWERED
              </div>
              <h2 style={{ fontSize: "36px", fontWeight: "800", color: "white", lineHeight: "1.2", marginBottom: "14px" }}>Smart Trips</h2>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", marginBottom: "28px", lineHeight: "1.7" }}>
                A uniquely AI-curated experience flow. Tell us your vibe, budget and interests and our AI builds the perfect Indian adventure for you in seconds.
              </p>
              <button onClick={() => navigate("/smart-trips")}
                style={{ padding: "14px 32px", background: "white", color: "#0f5132", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Start Your Smart Journey <i className="bi bi-arrow-right-circle-fill"></i>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {AI_FEATURES.map((f, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: "14px", padding: "18px", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <i className={`bi ${f.icon}`} style={{ fontSize: "24px", color: "white", display: "block", marginBottom: "8px" }}></i>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "4px" }}>{f.title}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", lineHeight: "1.5" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══ BLOG PREVIEW ══ */}
      <section style={{ background: "#f8fffe", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#0f5132", padding: "4px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
              <i className="bi bi-newspaper"></i> FROM OUR BLOG
            </div>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Travel Stories and Tips</h2>
            <p style={{ fontSize: "16px", color: "#64748b" }}>Real experiences from real travelers across India</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {BLOGS.map((blog, i) => (
              <div key={i} onClick={() => navigate("/blog")}
                style={{ background: "white", borderRadius: "16px", overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                <div style={{ height: "180px", overflow: "hidden" }}>
                  <img src={blog.img} alt={blog.place} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <i className="bi bi-pen"></i> Travel Story
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>{blog.place}</h3>
                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px", fontStyle: "italic" }}>{blog.subtitle}</p>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {blog.content}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="bi bi-person-circle"></i> {blog.author}
                    </span>
                    <span style={{ fontSize: "13px", color: "#0f5132", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      Read more <i className="bi bi-arrow-right"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button onClick={() => navigate("/blog")}
              style={{ padding: "12px 32px", background: "white", color: "#0f5132", border: "2px solid #0f5132", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "7px" }}>
              Read All Stories <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>


      {/* ══ TESTIMONIALS ══ */}
      <section style={{ background: "white", padding: "72px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#0f5132", padding: "4px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
              <i className="bi bi-star-fill"></i> TESTIMONIALS
            </div>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>What Students Say</h2>
            <p style={{ fontSize: "16px", color: "#64748b" }}>Real experiences from GoBeyond travelers</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "#f8fffe", borderRadius: "16px", padding: "28px", border: "1px solid #dcfce7", position: "relative" }}>
                <i className="bi bi-quote" style={{ position: "absolute", top: "16px", right: "20px", fontSize: "32px", color: "#dcfce7" }}></i>
                <div style={{ display: "flex", gap: "4px", color: "#f59e0b", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, si) => <i key={si} className="bi bi-star-fill" style={{ fontSize: "13px" }}></i>)}
                </div>
                <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7", marginBottom: "20px", fontStyle: "italic" }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: t.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{t.name}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══ CTA ══ */}
      <section style={{ background: "#0f5132", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "800", color: "white", marginBottom: "10px" }}>Ready to GoBeyond?</h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
          Join thousands of students discovering incredible India with AI-powered travel planning
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/smart-trips")}
            style={{ padding: "14px 32px", background: "#86efac", color: "#0f5132", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <i className="bi bi-robot"></i> Try Smart Planner
          </button>
          <button onClick={() => navigate("/trips")}
            style={{ padding: "14px 32px", background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.5)", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <i className="bi bi-compass"></i> Browse All Trips
          </button>
        </div>
      </section>


      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#0a3622", color: "rgba(255,255,255,0.75)", padding: "56px 24px 28px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "white", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-airplane-engines" style={{ color: "#86efac" }}></i> GoBeyond
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "20px", color: "rgba(255,255,255,0.65)" }}>
                India's AI-powered travel platform for young explorers. Discover destinations, plan smart trips, and create unforgettable memories.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {["bi-facebook", "bi-instagram", "bi-twitter-x", "bi-youtube"].map((icon, i) => (
                  <div key={i} style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <i className={`bi ${icon}`} style={{ color: "white", fontSize: "15px" }}></i>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Explore</div>
              {["Home", "Trips", "Smart Trips", "Blog", "Know Us"].map((l, i) => (
                <div key={i} onClick={() => navigate(l === "Home" ? "/" : `/${l.toLowerCase().replace(" ", "-")}`)}
                  style={{ fontSize: "14px", marginBottom: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#86efac"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}>
                  <i className="bi bi-chevron-right" style={{ fontSize: "11px" }}></i> {l}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Resources</div>
              {["About Us", "Travel Tips", "FAQ", "Privacy Policy", "Terms of Use"].map((l, i) => (
                <div key={i} style={{ fontSize: "14px", marginBottom: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#86efac"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}>
                  <i className="bi bi-chevron-right" style={{ fontSize: "11px" }}></i> {l}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact</div>
              {[
                { icon: "bi-envelope-fill", text: "hello@gobeyond.in" },
                { icon: "bi-telephone-fill", text: "+91 99999 99999" },
                { icon: "bi-geo-alt-fill", text: "Ahmedabad, Gujarat" },
              ].map((c, i) => (
                <div key={i} style={{ fontSize: "14px", marginBottom: "10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <i className={`bi ${c.icon}`} style={{ color: "#86efac", marginTop: "2px", flexShrink: 0 }}></i>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
              <i className="bi bi-c-circle"></i> 2026 GoBeyond. Made with love for young Indian travelers.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {["Privacy Policy", "Terms of Use", "Sitemap"].map((l, i) => (
                <span key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;