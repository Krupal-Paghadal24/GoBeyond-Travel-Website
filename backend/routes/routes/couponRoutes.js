const express = require("express");
const router  = express.Router();
const Coupon  = require("../models/Coupon");

// PUT /api/payments/use-coupon — mark coupon as used after payment
router.put("/payments/use-coupon", async (req, res) => {
  try {
    const { code, user_id } = req.body;
    await Coupon.findOneAndUpdate(
      { code, user_id },
      { is_used: true, used_at: new Date() }
    );
    res.json({ message: "Coupon marked as used" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;