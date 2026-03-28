const Payment = require("../../models/Payment");

exports.getPayments = async(req,res)=>{

 const payments = await Payment.find()
 .populate("user_id")
 .populate("booking_id");

 res.json(payments);

};