import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hi! I'm CricBuddy AI. Ask me anything about cricket!" }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If user is not logged in, don't show the chatbot
  if (!user) return null;

  const cleanText = (text) => {
    return text
      .replace(/#{1,6}\s?/g, '') // Remove markdown headers (e.g., #, ##)
      .replace(/\*\*/g, '')      // Remove bold markers (**)
      .replace(/\*/g, '• ')      // Replace bullet markers (*) with a bullet point
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    const newMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Filter out the initial greeting because Gemini requires the first message in history to be from 'user'
      const historyToSend = messages.filter((msg, index) => index !== 0 || msg.role === 'user');
      const response = await chatService.sendMessage(userMessage, historyToSend);
      
      const responseText = response.data?.data?.text || response.data?.text || "";
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: cleanText(responseText) }] 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>CricBuddy AI</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.parts[0].text}
              </div>
            ))}
            {isLoading && <div className="typing-indicator">CricBuddy is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a cricket question..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
            <circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="9" r="1.5"/><circle cx="16" cy="9" r="1.5"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
