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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is missing.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: message
            }
          ]
        }
      ]
    });
    res.json({ data: { text: response.text} });

  } catch (error) {
    console.error('Fatal Chat Error:', error);
    res.status(500).json({ error: 'Internal server error in chat route.' });
  }
});

module.exports = router;
