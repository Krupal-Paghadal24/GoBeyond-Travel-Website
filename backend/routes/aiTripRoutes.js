
const express = require("express");
const router  = express.Router();
const AITrip  = require("../models/AITrip");
const Groq    = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/generate — generate AI trip with duration suggestion
router.post("/generate", async (req, res) => {
  try {
    const { destination, days, tripType, budget, interest, region, userId } = req.body;

    const prompt = `
You are an expert Indian travel planner.

Create a detailed trip plan:
- Destination: ${destination}
- Duration: ${days} days
- Trip Type: ${tripType || "General"}
- Budget: ${budget || "Mid"}
- Vibe: ${interest || "Adventure"}
- Region: ${region || ""}

Return ONLY a valid JSON object exactly like this:
{
  "title": "Trip title here",
  "destination": "${destination}",
  "estimated_budget": 15000,
  "suggested_days": 4,
  "duration_note": "3-4 days is ideal for ${destination}. Your selected ${days} days is perfect.",
  "itinerary": [
    {
      "day": 1,
      "activities": [
        { "id": "d1a1", "name": "Visit Amber Fort", "duration": "3 hours", "type": "sightseeing" },
        { "id": "d1a2", "name": "Explore Local Market", "duration": "2 hours", "type": "shopping" }
      ]
    }
  ],
  "travel_tips": ["tip 1", "tip 2", "tip 3"]
}

IMPORTANT:
- Each activity must have a unique id like d1a1 (day1 activity1), d1a2, d2a1 etc.
- suggested_days should be the IDEAL number of days for this destination
- duration_note should clearly tell if the selected days is too less, too much, or perfect
- Do not repeat the same place in multiple days
- Keep activities realistic and achievable in the given time
- No text before or after the JSON
`;

    const response = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens:  3000,
    });

    const raw  = response.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const trip  = JSON.parse(clean);

    // Save to MongoDB
    const savedTrip = new AITrip({
      user_id:          userId,
      prompt_data:      { tripType, days, budget, interest, region },
      title:            trip.title,
      destination:      trip.destination,
      estimated_budget: trip.estimated_budget,
      suggested_days:   trip.suggested_days,
      duration_note:    trip.duration_note,
      itinerary:        trip.itinerary,
      travel_tips:      trip.travel_tips,
      saved:            false,
    });
    await savedTrip.save();

    res.json({ ...trip, _id: savedTrip._id });

  } catch (err) {
    console.error("AI generate error:", err);
    res.status(500).json({ error: "Failed to generate trip. Please try again." });
  }
});


// PUT /api/ai/update-itinerary/:id — user edits activities (add/delete)
router.put("/update-itinerary/:id", async (req, res) => {
  try {
    const { itinerary } = req.body;

    const trip = await AITrip.findByIdAndUpdate(
      req.params.id,
      { itinerary },
      { new: true }
    );

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/ai/suggest-activity — AI suggests new activity for a specific day
router.post("/suggest-activity", async (req, res) => {
  try {
    const { destination, day, existingActivities } = req.body;

    const existing = existingActivities.map(a => a.name).join(", ");

    const prompt = `
You are an Indian travel expert.

Destination: ${destination}
Day: ${day}
Already planned activities: ${existing}

Suggest 3 NEW activities for Day ${day} that are:
- Different from already planned ones
- Realistic and achievable in one day
- Suitable for ${destination}

Return ONLY a JSON array like this:
[
  { "id": "suggested_1", "name": "Activity Name", "duration": "2 hours", "type": "sightseeing" },
  { "id": "suggested_2", "name": "Activity Name", "duration": "1 hour", "type": "food" },
  { "id": "suggested_3", "name": "Activity Name", "duration": "3 hours", "type": "adventure" }
]

No text before or after JSON.
`;

    const response = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens:  500,
    });

    const raw   = response.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(clean);

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: "Could not get suggestions." });
  }
});

module.exports = router;