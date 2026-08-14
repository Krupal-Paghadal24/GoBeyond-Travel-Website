const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const { verifyToken } = require("../middleware/authMiddleware");
router.use(verifyToken);
/* ================= GET ALL TRIPS (User) ================= */

router.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find({ status: { $ne: "Unavailable" } })
      .populate("guide_id", "guide_name expertise languages experience_years contact")
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trips" });
  }
});


/* ================= GET SINGLE TRIP BY ID ================= */

router.get("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("guide_id", "guide_name expertise languages experience_years contact");

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trip" });
  }
});

module.exports = router;