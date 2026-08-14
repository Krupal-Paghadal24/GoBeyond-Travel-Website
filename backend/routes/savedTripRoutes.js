const express = require("express");
const router = express.Router();

const {
    saveTrip,
    getUserTrips
} = require("../controllers/savedTripController");

router.post("/save", saveTrip);

router.get("/user/:userId", getUserTrips);   // ✅ add this

module.exports = router;