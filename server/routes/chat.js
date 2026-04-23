require('dotenv').config();
const express = require('express');
const router = express.Router();
const { GoogleGenAI } =  require("@google/genai");

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not defined. Check your Vercel Environment Variables.");
}

const ai = new GoogleGenAI(apiKey);

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'Google API key is missing.' });
    }

    const systemInstruction = `You are an AI cricket expert. Only answer questions related to cricket. If the user asks about anything else, respond exactly with: "I am AI cricket expert please ask criket related queries/question".`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I will only answer cricket-related questions and provide no other information." }]
      }
    ];

    // Add history if it exists
    if (history && Array.isArray(history)) {
      contents.push(...history);
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents
    });
    res.json({ data: { text: response.text} });

  } catch (error) {
    console.error('Fatal Chat Error:', error);
    res.status(500).json({ error: 'Internal server error in chat route.' });
  }
});

module.exports = router;
