const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const authRoutes           = require("./routes/authRoutes");
const aiTripRoutes         = require("./routes/aiTripRoutes");
const savedTripRoutes      = require("./routes/savedTripRoutes");
const userTripRoutes       = require("./routes/userTripRoutes");      // ✅ UNCOMMENTED
const userBookingRoutes    = require("./routes/userBookingRoutes");
const adminUserRoutes      = require("./routes/adminUserRoutes");
const adminGuideRoutes     = require("./routes/adminGuideRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const adminTripRoutes      = require("./routes/adminTripRoutes");
const adminPaymentRoutes   = require("./routes/adminPaymentRoutes");  // ✅ ADDED
const bookingRoutes        = require("./routes/bookingRoutes");
const adminSmartTripRoutes = require("./routes/adminSmartTripRoutes");
// const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const userPaymentRoutes  = require("./routes/userPaymentRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");


const app = express();

// ✅ Auto-create uploads folder if missing
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
  console.log("Created uploads/ folder");
}

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// ===== USER ROUTES =====
app.use("/api/auth",       authRoutes);
app.use("/api/ai",         aiTripRoutes);
app.use("/api/savedTrips", savedTripRoutes);
app.use("/api",            userTripRoutes);    // ✅ GET /api/trips and GET /api/trips/:id
app.use("/api",            userBookingRoutes); // ✅ POST /api/bookings
app.use("/api",       userPaymentRoutes);   // user saves payment after checkout
app.use("/api/chatbot", chatbotRoutes);


// ===== ADMIN ROUTES =====
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/admin", adminTripRoutes);
app.use("/api/admin", adminSmartTripRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin", adminGuideRoutes);
app.use("/api/admin", bookingRoutes);
app.use("/api/admin", adminPaymentRoutes);     // ✅ ADDED
app.use("/api/admin", adminPaymentRoutes);  // admin view payments

// ===== STATIC FILES =====
app.use("/uploads", express.static("uploads"));

// ===== DATABASE =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

app.get("/", (req, res) => {
  res.send("GoBeyond API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));