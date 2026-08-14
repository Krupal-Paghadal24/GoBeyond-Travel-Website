const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const User    = require("../models/User");
const Trip    = require("../models/Trip");
const Guide   = require("../models/Guide");
const Coupon  = require("../models/Coupon");
const {
  sendBookingConfirmation,
  sendFirstBookingDiscount,
} = require("../utils/emailService");

// POST /api/payments  — save payment + booking + send email + give discount
router.post("/payments", async (req, res) => {
  try {
    const {
      user_id,
      booking_id,
      amount,
      payment_method,
      payment_status,
      trip_id,
      trip_name,
      travel_date,
      total_amount,
    } = req.body;

    // 1. Save payment record
    const payment = new Payment({
      user_id,
      booking_id,
      amount,
      payment_method,
      payment_status,
      payment_date: new Date(),
    });
    await payment.save();

    // Only do email + discount if payment was successful
    if (payment_status === "Success") {

      // 2. Fetch user details for email
      const user = await User.findById(user_id);

      // 3. Fetch trip + guide details
      let tripDetails = {
        tripName:    trip_name || "Your Trip",
        location:    "",
        duration:    "",
        guideName:   "",
        guidePhone:  "",
        guideEmail:  "",
      };

      if (trip_id) {
        const trip = await Trip.findById(trip_id).populate("guide_id");
        if (trip) {
          tripDetails.tripName  = trip.title;
          tripDetails.location  = trip.location;
          tripDetails.duration  = trip.duration;
          if (trip.guide_id) {
            tripDetails.guideName  = trip.guide_id.guide_name;
            tripDetails.guidePhone = trip.guide_id.contact;
          }
        }
      }

      // 4. Send booking confirmation email
      if (user && user.email) {
        await sendBookingConfirmation(user.email, user.firstName, {
          bookingId:     booking_id,
          tripName:      tripDetails.tripName,
          location:      tripDetails.location,
          travelDate:    travel_date,
          duration:      tripDetails.duration,
          totalAmount:   total_amount || amount,
          paymentMethod: payment_method,
          guideName:     tripDetails.guideName,
          guidePhone:    tripDetails.guidePhone,
        });
      }

      // 5. Check if this is user's FIRST booking → give discount coupon
      const previousBookings = await Booking.countDocuments({
        user_id,
        payment_status: "Paid",
        _id: { $ne: booking_id }, // exclude current booking
      });

      if (previousBookings === 0) {
        // Generate unique coupon code
        const couponCode = "FIRST10" + user_id.toString().slice(-4).toUpperCase();

        // Save coupon to database
        const coupon = new Coupon({
          code:        couponCode,
          user_id,
          discount:    10,         // 10% discount
          type:        "percentage",
          is_used:     false,
          expires_at:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
        await coupon.save();

        // Send discount email
        if (user && user.email) {
          await sendFirstBookingDiscount(user.email, user.firstName, couponCode);
        }
      }
    }

    res.status(201).json({ message: "Payment saved successfully", payment });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: err.message });
  }
});


// POST /api/payments/apply-coupon — validate and apply coupon
router.post("/payments/apply-coupon", async (req, res) => {
  try {
    const { code, user_id, amount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), user_id });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: "Invalid coupon code." });
    }
    if (coupon.is_used) {
      return res.status(400).json({ valid: false, message: "This coupon has already been used." });
    }
    if (new Date() > coupon.expires_at) {
      return res.status(400).json({ valid: false, message: "This coupon has expired." });
    }

    const discountAmount = Math.round((amount * coupon.discount) / 100);
    const finalAmount    = amount - discountAmount;

    res.json({
      valid:          true,
      discount:       coupon.discount,
      discountAmount,
      finalAmount,
      message:        `Coupon applied! You save ₹${discountAmount}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/payments/coupons/:userId — get user's available coupons
router.get("/payments/coupons/:userId", async (req, res) => {
  try {
    const coupons = await Coupon.find({
      user_id:  req.params.userId,
      is_used:  false,
      expires_at: { $gt: new Date() },
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// This line already exists in the file above but adding mark-as-used route separately