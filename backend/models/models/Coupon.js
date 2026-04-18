const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true },
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  discount:   { type: Number, required: true },      // percentage
  type:       { type: String, default: "percentage" },
  is_used:    { type: Boolean, default: false },
  used_at:    { type: Date },
  expires_at: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", CouponSchema);