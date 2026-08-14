const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  id:       { type: String },
  name:     { type: String, required: true },
  duration: { type: String },
  type:     { type: String },
}, { _id: false });

const DaySchema = new mongoose.Schema({
  day:        { type: Number, required: true },
  activities: [ActivitySchema],
}, { _id: false });

const AITripSchema = new mongoose.Schema({
  user_id:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  prompt_data: {
    tripType: String,
    days:     Number,
    budget:   String,
    interest: String,
    region:   String,
  },
  title:            { type: String },
  destination:      { type: String },
  estimated_budget: { type: Number },
  suggested_days:   { type: Number },        // NEW — ideal days for destination
  duration_note:    { type: String },        // NEW — AI feedback on selected days
  itinerary:        [DaySchema],
  travel_tips:      [String],
  saved:            { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("AITrip", AITripSchema);