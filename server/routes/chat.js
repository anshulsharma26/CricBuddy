const express = require('express');
const router = require('express').Router();
const OpenAI = require('openai');

// Groq API (free tier) — uses OpenAI-compatible SDK
let groq = null;

function getGroqClient() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("WARNING: GROQ_API_KEY is not defined in .env file.");
      return null;
    }
    groq = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groq;
}

const SYSTEM_PROMPT = `You are CricBuddy AI — a friendly, knowledgeable cricket expert assistant. 
Your job is to help users with anything related to cricket: rules, techniques, match history, player stats, strategy tips, and more.

Guidelines:
- Keep responses concise and conversational (2-4 paragraphs max unless the user asks for detail).
- Use cricket terminology naturally.
- If the user asks about something completely unrelated to cricket, respond with: "I'm CricBuddy AI — your cricket expert! 🏏 I can help with cricket rules, techniques, match stats, and more. Please ask me a cricket-related question!"
- Be enthusiastic about cricket and use emojis sparingly for friendliness.
- Format key facts with bullet points when listing multiple items.`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!getGroqClient()) {
      return res.status(500).json({ error: 'Groq API key is missing on the server. Add GROQ_API_KEY to .env file.' });
    }

    const client = getGroqClient();

    // Build messages array for Chat Completions API
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    // Convert history from Gemini format { role, parts } to OpenAI format { role, content }
    if (history && Array.isArray(history)) {
      for (const item of history) {
        if (!item.role) continue;
        const content = item.parts?.[0]?.text || item.content || '';
        if (!content) continue;
        messages.push({
          role: item.role === 'model' ? 'assistant' : 'user',
          content,
        });
      }
    }

    // Add the current user message
    messages.push({ role: 'user', content: message });

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || '';

    res.json({ data: { text } });

  } catch (error) {
    console.error('Chat Route Error:', error?.message || error);
    
    const errorMessage = error?.message || '';
    const statusCode = error?.status || error?.response?.status;
    
    if (statusCode === 429 || errorMessage.includes('429') || errorMessage.includes('rate')) {
      return res.status(429).json({ 
        error: 'API rate limit reached. Please wait a moment and try again.',
        retryable: true
      });
    }
    
    if (statusCode === 401 || errorMessage.includes('401') || errorMessage.includes('API key') || errorMessage.includes('invalid')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your GROQ_API_KEY configuration.' 
      });
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return res.status(500).json({ 
        error: 'AI model is unavailable. Please try again later.' 
      });
    }

    res.status(500).json({ error: 'Something went wrong with the AI service. Please try again.' });
  }
});

module.exports = router;
