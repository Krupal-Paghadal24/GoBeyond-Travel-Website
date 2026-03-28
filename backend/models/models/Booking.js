const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    default: null  // ✅ null for AI trips
  },

  // ✅ ADDED: stores trip name when trip_id is null (AI trips)
  trip_name: {
    type: String,
    default: null
  },

  booking_date: {
    type: Date,
    default: Date.now
  },

  travel_date: Date,

  booking_status: {
    type: String,
    enum: ["Pending", "Approved", "Cancelled"],
    default: "Pending"
  },

  payment_status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid"
  },

  total_amount: Number

});

module.exports = mongoose.model("Booking", bookingSchema);