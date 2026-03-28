const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

 booking_id:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Booking"
 },

 user_id:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 payment_method:{
  type:String,
  enum:["Card","UPI","Net Banking"]
 },

 amount:Number,

 payment_status:{
  type:String,
  enum:["Success","Failed"]
 },

 payment_date:{
  type:Date,
  default:Date.now
 }

});

module.exports = mongoose.model("Payment",paymentSchema);