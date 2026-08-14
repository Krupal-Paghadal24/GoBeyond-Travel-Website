const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Build conversation history for context
    const messages = [
      {
        role: "system",
        content: `You are GoBeyond AI, a friendly travel assistant for the GoBeyond travel platform. 
You specialize in Indian travel destinations only.
Keep answers short, helpful and conversational (2-4 sentences max).
Always suggest relevant Indian destinations, tips, or experiences.
If asked about non-India travel, politely redirect to Indian destinations.
Use emojis occasionally to be friendly. Never use markdown formatting like ** or ##.`
      },
      // Include last 6 messages for context
      ...history.slice(-6).map(h => ({
        role: h.role,
        content: h.content
      })),
      { role: "user", content: message }
    ];

    const response = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.log("Chatbot error:", error);
    res.status(500).json({ message: "Chatbot error. Please try again." });
  }
});

module.exports = router;