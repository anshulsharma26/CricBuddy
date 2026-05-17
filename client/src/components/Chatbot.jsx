import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';
import aiCoachIcon from '../assets/ai_coach.png';

// ── Text-to-Speech Hook ──────────────────────────────────────────────
const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const utteranceRef = useRef(null);

  const speak = useCallback((text, msgIndex) => {
    // Stop any current speech
    window.speechSynthesis.cancel();

    // If we're clicking the same message that's already speaking, just stop
    if (isSpeaking && speakingMsgIndex === msgIndex) {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
      return;
    }

    // Clean markdown artifacts from text before speaking
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/[•\-]\s*/g, ', ')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMsgIndex(msgIndex);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, speakingMsgIndex]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMsgIndex(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return { speak, stop, isSpeaking, speakingMsgIndex };
};

// ── Typewriter Component ──────────────────────────────────────────────
const Typewriter = ({ text, delay = 8, onComplete }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <span>{currentText}<span className="typewriter-cursor">|</span></span>;
};

// ── Speaker Button Component ──────────────────────────────────────────
const SpeakerButton = ({ isActive, onClick }) => (
  <button
    className={`speaker-btn ${isActive ? 'speaking' : ''}`}
    onClick={onClick}
    title={isActive ? 'Stop speaking' : 'Listen to response'}
    aria-label={isActive ? 'Stop speaking' : 'Listen to response'}
  >
    {isActive ? (
      // Volume/Speaking animated icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="sound-wave-1" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="sound-wave-2" />
      </svg>
    ) : (
      // Volume off/muted icon
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M15 9l6 6M21 9l-6 6" />
      </svg>
    )}
  </button>
);

// ── Main Chatbot Component ────────────────────────────────────────────
const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: "Hey there! 🏏 I'm CricBuddy AI — your cricket expert. Ask me anything about cricket rules, player stats, match history, or techniques!" }],
      isNew: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { speak, stop, isSpeaking, speakingMsgIndex } = useSpeech();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Stop speech when chat is closed
  useEffect(() => {
    if (!isOpen) stop();
  }, [isOpen, stop]);

  // If user is not logged in, don't show the chatbot
  if (!user) return null;

  const formatText = (text) => {
    return text
      .replace(/^\s*[\*\-]\s+/gm, '• ')
      .replace(/\*\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to UI
    setMessages(prev => [
      ...prev.map(m => ({ ...m, isNew: false })),
      { role: 'user', parts: [{ text: userMessage }], isNew: false, timestamp: new Date() }
    ]);
    setIsLoading(true);

    try {
      // Filter out the initial greeting and strip extra properties before sending
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
          isNew: true,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorData = error.response?.data;
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again.";

      if (error.response?.status === 429 || errorData?.retryable) {
        errorMessage = "🔄 I'm a bit busy right now. Please wait a few seconds and try again!";
      } else if (error.response?.status === 401) {
        errorMessage = "🔑 There's an API configuration issue. Please contact the administrator.";
      } else if (!navigator.onLine) {
        errorMessage = "📡 You appear to be offline. Please check your internet connection.";
      }

      setError(errorMessage);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: errorMessage }],
        isNew: true,
        isError: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    stop();
    setMessages([
      {
        role: 'model',
        parts: [{ text: "Chat cleared! 🏏 Ask me anything about cricket!" }],
        isNew: false,
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  const quickQuestions = [
    "🏏 What is LBW?",
    "🏆 2023 WC Winner?",
    "⭐ Top batsmen?",
  ];

  const handleQuickQuestion = (question) => {
    // Remove emoji prefix for the actual message
    const cleanQuestion = question.replace(/^[^\w]+/, '').trim();
    setInput(cleanQuestion);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🏏</div>
              <div>
                <h3>CricBuddy AI</h3>
                <span className="chatbot-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="header-action-btn"
                onClick={handleClearChat}
                title="Clear chat"
                aria-label="Clear chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button
                className="header-action-btn close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}
              >
                {msg.role === 'model' && (
                  <div className="ai-avatar-small">🤖</div>
                )}
                <div className={`message ${msg.role === 'user' ? 'user' : 'ai'} ${msg.isError ? 'error' : ''}`}>
                  <div className="message-content">
                    {msg.role === 'model' && msg.isNew ? (
                      <Typewriter text={msg.parts[0].text} />
                    ) : (
                      msg.parts[0].text
                    )}
                  </div>
                  {/* TTS button for AI messages only */}
                  {msg.role === 'model' && !msg.isError && (
                    <SpeakerButton
                      isActive={isSpeaking && speakingMsgIndex === index}
                      onClick={() => speak(msg.parts[0].text, index)}
                    />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper ai">
                <div className="ai-avatar-small">🤖</div>
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (show only when few messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="quick-questions">
              {quickQuestions.map((q, i) => (
                <button key={i} className="quick-q-btn" onClick={() => handleQuickQuestion(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form className="chatbot-input-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cricket..."
              disabled={isLoading}
              id="chatbot-input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-btn"
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)} aria-label="Open CricBuddy AI Chat">
          <div className="toggle-pulse"></div>
          <img src={aiCoachIcon} alt="AI Coach" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
