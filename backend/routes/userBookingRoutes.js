const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);
/* ================= CREATE BOOKING ================= */

router.post("/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking successful", booking });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error booking trip" });
  }
});


/* ================= GET USER'S BOOKINGS ================= */
// ✅ ADDED: user can see their own bookings on My Bookings page

router.get("/bookings/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.userId })
      .populate("trip_id", "title location price images duration category")
      .sort({ booking_date: -1 }); // newest first

    res.json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

module.exports = router;