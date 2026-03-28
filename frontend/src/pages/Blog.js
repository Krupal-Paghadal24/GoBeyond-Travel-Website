import React from "react";
import Navbar from "../components/Navbar";
import "../styles/Blog.css";
import natureVideo from "../images/nature2.mp4";

const blogs = [
  {
    place: "Jodhpur, Rajasthan",
    subtitle: "The Blue City of Royal Heritage",
    content:
      "Jodhpur is known for its majestic Mehrangarh Fort, blue-painted houses, royal palaces, and vibrant markets.",
    author: "Ananya Sharma",
  },
  {
    place: "Goa, India",
    subtitle: "The Beach Paradise of India",
    content:
      "Goa offers golden beaches, vibrant nightlife, historic forts, and delicious seafood.",
    author: "Rohan Mehta",
  },
   {
    place: "Ajanta & Ellora Caves, Maharashtra",
    subtitle: "Timeless Rock-Cut Wonders",
    content:
      "UNESCO World Heritage Sites showcasing stunning Buddhist murals and the incredible Kailash Temple carved from a single rock.",
    author: "Priya Desai",
  },
  {
    place: "Leh & Ladakh, India",
    subtitle: "The Land of High Passes",
    content:
      "A dream destination with snow-capped mountains, Pangong Lake, Nubra Valley, and thrilling bike trips across Khardung La.",
    author: "Arjun Singh",
  },
  {
    place: "Rishikesh, Uttarakhand",
    subtitle: "The Yoga Capital of the World",
    content: "Rishikesh combines spirituality with adventure. Attend yoga sessions by the Ganges and feel the thrill of river rafting beneath the iconic Laxman Jhula.",
    author: "Karan Malhotra",
  },
  {
    place: "Darjeeling, West Bengal",
    subtitle: "Hills, Tea & Hassle-Free Stay",
    content: "Watching the sunrise over the Himalayas and riding the Darjeeling Himalayan Railway was magical. Hotel reservations were simple, and many properties offered stunning valley views with attentive service and cozy rooms.",
    author: "Ishita Banerjee",
  },
];

function Blog() {
  return (
    <>
      <Navbar />

      {/* HERO WITH VIDEO */}
      <div className="blog-hero">
        <video
          className="hero-video"
          src={natureVideo}
          autoPlay
          muted
          loop
        />
        <div className="blog-hero-overlay">
          <h1 className="blog-title">Travel Blogs</h1>
          <p className="blog-subtitle">
            Real travel stories & experiences from explorers
          </p>
        </div>
      </div>

      {/* BLOG CONTENT */}
      <div className="blog-page">
        <div className="blog-container">
          {blogs.map((blog, index) => (
            <div className="blog-card" key={index}>
              <h2>{blog.place}</h2>
              <h4>{blog.subtitle}</h4>
              <p>{blog.content}</p>
              <span className="author">— {blog.author}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Blog;