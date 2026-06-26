import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { generateChatResponse } from '../../services/aiService.js';
import { Link } from 'react-router-dom';

const SUGGESTED_QUESTIONS = [
  "Is mild nausea normal in trimester 2?",
  "Can I drink coconut water daily?",
  "What exercise is safe for week 24?",
  "What are warning signs to watch out for?"
];

export default function AIPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('lh_ai_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'welcome',
        sender: 'ai',
        text: `Hello Mama! I'm your Little Heartbeat AI Companion. Ask me anything about your pregnancy, body changes, or symptoms. 💕`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('lh_ai_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await generateChatResponse(textToSend, { name: user?.name, pregnancyMonth: 5 });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk: response.risk
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I am having trouble connecting right now, Mama. Please try again. If this is an emergency, use the SOS button.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear chat history?")) {
      const initial = [
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello Mama! I'm your Little Heartbeat AI Companion. Ask me anything about your pregnancy, body changes, or symptoms. 💕`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initial);
    }
  };

  return (
    <div className="screen flex flex-col" style={{ padding: 0, height: '100%', background: 'var(--color-warm-ivory)' }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 20px',
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sos-pulse" style={{ width: 14, height: 14, background: 'var(--color-success)' }} />
          <div>
            <h2 className="serif-title" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>AI Companion</h2>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Online guidance · AI assists, never diagnoses</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}
        >
          Clear
        </button>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="bg-blush-pink" style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,160,137,0.1)'
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <p style={{ fontSize: 11, color: 'var(--color-danger-dark)', lineHeight: 1.4, flex: 1 }}>
          Not medical advice. In case of acute symptoms or severe pain, please dial local emergency services or tap <Link to="/sos" style={{ fontWeight: 700, textDecoration: 'underline' }}>Emergency</Link> immediately.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1" style={{
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className="animate-fade-in-up"
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                background: isUser ? 'var(--gradient-primary)' : 'white',
                color: isUser ? 'white' : 'var(--color-text-primary)',
                padding: '14px 18px',
                borderRadius: isUser ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                boxShadow: 'var(--shadow-sm)',
                fontSize: 14,
                lineHeight: 1.5,
                border: isUser ? 'none' : '1px solid var(--color-border)',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
              <span style={{
                fontSize: 10,
                color: 'var(--color-text-muted)',
                marginTop: 4,
                marginRight: isUser ? 4 : 0,
                marginLeft: isUser ? 0 : 4
              }}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, alignItems: 'center', padding: '10px 16px', background: 'white', borderRadius: 20, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Little Heartbeat is typing</span>
            <div className="sos-pulse" style={{ width: 8, height: 8, background: 'var(--color-primary)' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      {messages.length === 1 && !isTyping && (
        <div style={{ padding: '0 16px 10px 16px', overflowX: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="badge badge-outline card-interactive"
              style={{
                padding: '8px 14px',
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-primary)',
                fontSize: 12,
                whiteSpace: 'nowrap'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Action Panel */}
      <div style={{
        padding: '16px 16px calc(16px + env(safe-area-inset-bottom, 0px)) 16px',
        background: 'white',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0
      }}>
        {/* Attachment Upload (UI Mock) */}
        <button
          onClick={() => alert("Upload prescription or medical report to extract information automatically in the Health Vault!")}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', borderRadius: 22, background: 'var(--color-soft-white)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
          placeholder="Type symptom or question..."
          style={{
            flex: 1,
            height: 44,
            padding: '0 16px',
            borderRadius: 22,
            border: '1.5px solid var(--color-border-medium)',
            background: 'var(--color-soft-white)',
            fontSize: 14,
            outline: 'none'
          }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend(inputVal)}
          className="btn-primary"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
