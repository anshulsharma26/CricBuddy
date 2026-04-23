import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const Typewriter = ({ text, delay = 10 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: "Hi! I'm CricBuddy AI. Ask me anything about cricket!" }], isNew: false }
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

  const formatText = (text) => {
    return text
      .replace(/^\s*[\*\-]\s+/gm, '• ') // Replace bullet markers (* or -) with •
      .replace(/\*\*/g, '')              // Strip bold markers
      .replace(/#{1,6}\s?/g, '')        // Strip header markers
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [
      ...prev.map(m => ({ ...m, isNew: false })),
      { role: 'user', parts: [{ text: userMessage }], isNew: false }
    ]);
    setIsLoading(true);

    try {
      // Filter out the initial greeting because Gemini requires the first message in history to be from 'user'
      // Also strip extra properties like 'isNew' before sending
      const historyToSend = messages
        .filter((msg, index) => index !== 0 || msg.role === 'user')
        .map(({ role, parts }) => ({ role, parts }));
      
      const response = await chatService.sendMessage(userMessage, historyToSend);
      
      const responseText = response.data?.data?.text || response.data?.text || "";
      
      setMessages(prev => [
        ...prev.map(m => ({ ...m, isNew: false })),
        { 
          role: 'model', 
          parts: [{ text: formatText(responseText) }],
          isNew: true 
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }],
        isNew: true
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
                {msg.role === 'model' && msg.isNew ? (
                  <Typewriter text={msg.parts[0].text} />
                ) : (
                  msg.parts[0].text
                )}
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
