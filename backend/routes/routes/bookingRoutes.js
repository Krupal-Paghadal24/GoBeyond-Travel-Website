const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/admin/bookingController"); // ✅ admin controller


/* ================= GET ALL BOOKINGS (ADMIN) ================= */

router.get("/bookings", bookingController.getBookings);


/* ================= UPDATE BOOKING STATUS (ADMIN) ================= */
// Admin can set: Pending / Approved / Cancelled

router.put("/bookings/:id", bookingController.updateBookingStatus);


module.exports = router;