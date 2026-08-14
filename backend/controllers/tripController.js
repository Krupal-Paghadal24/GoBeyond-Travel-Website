const Trip = require("../../models/Trip");

exports.getTrips = async (req, res) => {

 try {

  const trips = await Trip.find({ status: "Available" })
   .populate("guide_id", "guide_name expertise");

  res.json(trips);

 } catch (error) {

  console.log(error);

  res.status(500).json({
   message: "Error fetching trips"
  });

 }

};