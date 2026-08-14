const Trip = require("../../models/Trip");


/* ================= ADD TRIP ================= */

exports.addTrip = async (req, res) => {

 try {

  const {
   title,
   category,
   location,
   duration,
   price,
   description,
   guide_id,
   language_support,
   local_help,
   created_by,
   status
  } = req.body;


  /* HANDLE IMAGE UPLOAD */

  let images = [];

  if (req.files && req.files.length > 0) {
   images = req.files.map(file => file.filename);
  }


  /* CREATE TRIP */

  const trip = new Trip({

   title,
   category,
   location,
   duration,
   price,
   description,
   images,
   guide_id:         guide_id   || null,  // ✅ FIXED: empty string → null (valid for ObjectId)
   language_support: language_support ? language_support.split(",") : [],
   local_help,
   created_by:       created_by || null,  // ✅ FIXED: same issue for created_by
   status

  });


  await trip.save();


  res.json({
   message: "Trip added successfully",
   trip
  });

 } catch (error) {

  console.log(error);

  res.status(500).json({
   message: "Error adding trip"
  });

 }

};



/* ================= GET ALL TRIPS ================= */

exports.getTrips = async (req, res) => {

 try {

  const trips = await Trip.find()
   .populate("guide_id", "guide_name expertise")
   .populate("created_by", "firstName lastName");

  res.json(trips);

 } catch (error) {

  res.status(500).json({
   message: "Error fetching trips"
  });

 }

};



/* ================= DELETE TRIP ================= */

exports.deleteTrip = async (req, res) => {

 try {

  await Trip.findByIdAndDelete(req.params.id);

  res.json({
   message: "Trip deleted"
  });

 } catch (error) {

  res.status(500).json({
   message: "Error deleting trip"
  });

 }

};



/* ================= UPDATE TRIP ================= */

exports.updateTrip = async (req, res) => {

 try {

  const trip = await Trip.findByIdAndUpdate(
   req.params.id,
   req.body,
   { new: true }
  );

  res.json({
   message: "Trip updated",
   trip
  });

 } catch (error) {

  res.status(500).json({
   message: "Error updating trip"
  });

 }

};