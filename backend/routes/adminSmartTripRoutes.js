const express = require("express");
const router  = express.Router();
const AITrip  = require("../models/AITrip");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
router.use(verifyToken, requireAdmin);
/* ================= GET ALL AI TRIPS (ADMIN) ================= */

router.get("/smart-trips", async (req, res) => {
  try {
    const trips = await AITrip.find()
      .populate("user_id", "firstName lastName email")
      .sort({ created_at: -1 });
    res.json(trips);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching AI trips" });
  }
});


/* ================= GET STATS ================= */

router.get("/smart-trips/stats", async (req, res) => {
  try {
    const total   = await AITrip.countDocuments();
    const saved   = await AITrip.countDocuments({ saved: true });
    const unsaved = total - saved;

    // most popular destination
    const destinations = await AITrip.aggregate([
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // most popular trip type
    const tripTypes = await AITrip.aggregate([
      { $group: { _id: "$prompt_data.tripType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({ total, saved, unsaved, destinations, tripTypes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});


/* ================= DELETE AI TRIP (ADMIN) ================= */

router.delete("/smart-trips/:id", async (req, res) => {
  try {
    await AITrip.findByIdAndDelete(req.params.id);
    res.json({ message: "AI trip deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting AI trip" });
  }
});


module.exports = router;