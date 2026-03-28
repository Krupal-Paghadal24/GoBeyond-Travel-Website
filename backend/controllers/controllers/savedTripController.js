const AITrip = require("../models/AITrip");
const mongoose = require("mongoose");

exports.saveTrip = async (req, res) => {

    try {

        const { trip_id } = req.body;

        const trip = await AITrip.findByIdAndUpdate(
            trip_id,
            { saved: true },
            { returnDocument: "after" }
        );

        res.json({
            message: "Trip saved successfully",
            trip
        });

    } catch (err) {

        res.status(500).json({
            message: "Error saving trip"
        });

    }

};

exports.getUserTrips = async (req, res) => {

    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const trips = await AITrip.find({
            user_id: userId,
            saved: true
        }).sort({created_at:-1});

        res.json(trips);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Error fetching trips"
        });

    }

};