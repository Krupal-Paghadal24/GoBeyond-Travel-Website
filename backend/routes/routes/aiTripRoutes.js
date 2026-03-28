const express = require("express");
const router = express.Router();
const {generateTrip} = require("../controllers/aiTripController");

router.post("/generate",generateTrip);

module.exports = router;