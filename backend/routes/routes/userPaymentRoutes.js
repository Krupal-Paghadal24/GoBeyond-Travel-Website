const express = require("express");
const router  = express.Router();
const Payment = require("../models/Payment");


/* ================= SAVE PAYMENT AFTER CHECKOUT ================= */
// Called from frontend Payment.js after successful mock payment

router.post("/payments", async (req, res) => {
  try {
    const { user_id, booking_id, amount, payment_method, payment_status } = req.body;
    const payment = new Payment({
      user_id,
      booking_id: booking_id || null,
      amount,
      payment_method,
      payment_status: payment_status || "Success"
    });
    await payment.save();
    res.json({ message: "Payment recorded successfully", payment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error recording payment" });
  }
});


module.exports = router;