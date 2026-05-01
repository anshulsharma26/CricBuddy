const express = require('express');
const router = require('express').Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get API Key from environment variables
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_API_KEY is not defined.");
}

const genAI = new GoogleGenerativeAI(apiKey);

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Google API key is missing on the server.' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are an AI cricket expert. Only answer questions related to cricket. If the user asks about anything else, respond exactly with: \"I am AI cricket expert please ask criket related queries/question\".",
    });

    // Format history for Google Generative AI
    // It expects { role: 'user' | 'model', parts: [{ text: string }] }
    const chatHistory = history ? history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: item.parts || [{ text: item.content || "" }]
    })) : [];

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ data: { text } });

  } catch (error) {
    console.error('Fatal Chat Error:', error);
    res.status(500).json({ error: 'Internal server error in chat route.' });
  }
});

module.exports = router;
