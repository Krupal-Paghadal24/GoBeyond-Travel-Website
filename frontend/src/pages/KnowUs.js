import React from "react";
import Navbar from "../components/Navbar";
import "../styles/KnowUs.css";

function KnowUs() {
  return (
    <>
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <div className="knowus-hero">
        <h1>Smart Trips for Smart India</h1>
        <p>Welcome to a new generation of travel planning</p>
      </div>

      {/* CONTENT */}
      <div className="knowus-container">
        <section className="knowus-section">
          <h2>Who We Are</h2>
          <p>
            We built this platform with one simple idea that to create smarter,
            affordable, and stress-free travel experiences.
          </p>

          <p>
            We are an <strong>AI-driven travel platform</strong> designed
            especially for young explorers, campus groups, solo backpackers, and
            curious minds who want to see the world without overspending or
            overplanning.
          </p>
        </section>

        <section className="knowus-section">
          <h2>What Makes Us Different?</h2>

          <div className="features">
            <div className="feature-card">Adventure & Cultural Interests</div>
            <div className="feature-card">Personal Budget Range</div>
            <div className="feature-card">Past Travel Choices</div>
            <div className="feature-card">Preferred Trip Style</div>
          </div>

          <p className="ai-text">
            Unlike traditional travel websites, our intelligent system
            understands you and creates personalized trip recommendations in
            seconds.
          </p>
        </section>

        <section className="knowus-section">
          <h2>Our Belief</h2>
          <p>
            We believe travel is more than a vacation , it’s about learning,
            growth, confidence, and unforgettable memories.
          </p>
          
          <p>
            Whether it’s a weekend getaway, an educational industrial visit, or
            a surprise adventure, our AI helps you discover the perfect trip
            effortlessly.
          </p>
        </section>
      </div>
    </>
  );
}

export default KnowUs;