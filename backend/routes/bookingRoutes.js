const express  = require("express");
const router   = express.Router();
const Booking  = require("../models/Booking");
const User     = require("../models/User");
const { sendBookingApproved } = require("../utils/emailService");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
router.use(verifyToken, requireAdmin);

// GET /api/admin/bookings
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user_id", "firstName lastName email")
      .populate("trip_id", "title location")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/bookings/:id  — approve or cancel + send email
router.put("/bookings/:id", async (req, res) => {
  try {
    const { booking_status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { booking_status },
      { new: true }
    ).populate("user_id", "firstName lastName email")
     .populate("trip_id", "title");

    // Send approval email to user
    if (booking_status === "Approved" && booking.user_id) {
      const tripName  = booking.trip_id ? booking.trip_id.title : booking.trip_name;
      await sendBookingApproved(
        booking.user_id.email,
        booking.user_id.firstName,
        tripName,
        booking.travel_date
      );
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;