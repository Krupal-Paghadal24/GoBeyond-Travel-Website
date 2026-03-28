const Booking = require("../models/Booking"); // ✅ FIXED: was "../models/Booking"


/* ================= CREATE BOOKING ================= */

exports.createBooking = async (req, res) => {

  try {

    const {
      user_id,
      trip_id,
      travel_date,
      total_amount
    } = req.body;

    const booking = new Booking({
      user_id,
      trip_id,
      travel_date,
      total_amount
    });

    await booking.save();

    res.json({
      message: "Trip booked successfully",
      booking
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error booking trip"
    });

  }

};



/* ================= GET ALL BOOKINGS (ADMIN) ================= */

exports.getBookings = async (req, res) => {

  try {

    const bookings = await Booking.find()
      .populate("user_id", "firstName lastName email") // ✅ FIXED: was "name email" — User model has firstName & lastName
      .populate("trip_id", "title location price");

    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching bookings"
    });

  }

};



/* ================= UPDATE BOOKING STATUS ================= */

exports.updateBookingStatus = async (req, res) => {

  try {

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { booking_status: req.body.booking_status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" }); // ✅ ADDED: handle missing booking
    }

    res.json({
      message: "Booking status updated",
      booking
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating booking"
    });

  }

};