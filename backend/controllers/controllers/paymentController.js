const Payment = require("../../models/Payment");

exports.getPayments = async (req, res) => {

  try {

    const payments = await Payment.find()
      .populate("user_id", "firstName lastName email")  // ✅ FIXED: only needed fields
      .populate("booking_id", "booking_status travel_date total_amount")
      .sort({ payment_date: -1 }); // ✅ ADDED: newest first

    res.json(payments);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Error fetching payments" });

  }

};