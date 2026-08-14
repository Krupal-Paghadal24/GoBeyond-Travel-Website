const express = require("express");
const router  = express.Router();
const Payment = require("../models/Payment");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
router.use(verifyToken, requireAdmin);
/* ================= GET ALL PAYMENTS (ADMIN) ================= */

router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user_id",  "firstName lastName email")
      .populate("booking_id", "booking_status travel_date total_amount")
      .sort({ payment_date: -1 });
    res.json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching payments" });
  }
});


/* ================= CREATE PAYMENT (from Payment page) ================= */

router.post("/payments", async (req, res) => {
  try {
    const { user_id, booking_id, amount, payment_method, payment_status } = req.body;
    const payment = new Payment({
      user_id,
      booking_id: booking_id || null,
      amount,
      payment_method,
      payment_status
    });
    await payment.save();
    res.json({ message: "Payment recorded", payment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error recording payment" });
  }
});


module.exports = router;