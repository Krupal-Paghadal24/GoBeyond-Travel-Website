const Groq = require("groq-sdk");
const AITrip = require("../models/AITrip");
const mongoose = require("mongoose");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

exports.generateTrip = async (req, res) => {

    try {
        console.log("Request Body:", req.body);
        const { tripType, days, budget, interest, region, user_id } = req.body;

        const prompt = `
Create a ${days} day trip in India.

Trip Type: ${tripType}
Budget: ${budget}
Interest: ${interest}
Region: ${region}

Return ONLY JSON in this format:

{
"title":"",
"destination":"",
"estimated_budget":0,
"itinerary":[
 { "day":1, "activities":["",""] },
 { "day":2, "activities":["",""] }
],
"travel_tips":["",""]
}
`;

        const response = await groq.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile"
        });

        let aiText = response.choices[0].message.content;

        // remove ```json and ``` if present
        aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

        const tripData = JSON.parse(aiText);

        // 🔹 SAVE TRIP IN DATABASE
        const newTrip = new AITrip({

            user_id: new mongoose.Types.ObjectId(user_id),

            prompt_data: {
                tripType,
                days,
                budget,
                interest,
                region
            },

            title: tripData.title,

            destination: tripData.destination,

            estimated_budget: tripData.estimated_budget,

            itinerary: tripData.itinerary,

            travel_tips: tripData.travel_tips

        });

        await newTrip.save();

        res.json({
            trip: tripData,
            tripId: newTrip._id
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Trip generation failed"
        });

    }

};