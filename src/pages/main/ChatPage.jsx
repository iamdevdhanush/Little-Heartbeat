import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.js';
import { generateChatResponse } from '../../services/aiService.js';
import { getTranslation } from '../../data/translations.js';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';

const QUICK_PROMPTS = [
  'I have a headache 😔', 'My feet are swollen 🦵', 'I feel nauseous today 🤢',
  'What should I eat? 🥗', 'How much should I walk? 🚶', 'I feel very tired 😴',
];

export default function ChatPage() {
  const { profile, language } = useApp();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { alertProps, showAlert } = useAlert();

  const [messages, setMessages] = useState([{
    id: '1', role: 'bot', time: new Date(),
    text: `Hello ${profile?.name || 'Mama'}! 💕\n\nI'm your Little Heartbeat assistant. I'm here to help you through your pregnancy journey.\n\nTell me about any symptoms, ask questions, or just talk about how you're feeling. I'll always be gentle and supportive.`,
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || inputText.trim();
    if (!msgText) return;
    const userMsg = { id: Date.now().toString(), role: 'user', text: msgText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await generateChatResponse(msgText, profile, language);
      const botMsg = { id: (Date.now() + 1).toString(), role: 'bot', text: response.text, time: new Date(), isAnalysis: response.isAnalysis || response.requiresEmergency, analysisData: response };
      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
      if (response.requiresEmergency) setEmergencyAlert(true);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: "I'm sorry, I had trouble processing that. Please try again or contact your doctor directly. 💕", time: new Date() }]);
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFF8FA' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(to right, #FFF0F5, #FFF8FA)', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFD6E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2px solid #FFB3CC' }}>💗</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Little Heartbeat AI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Always here for you</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '85%', alignSelf: isUser ? 'flex-end' : 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
              {!isUser && <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFD6E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>💗</div>}
              <div style={{ maxWidth: '100%' }}>
                {msg.isAnalysis && msg.analysisData && (
                  <div style={{ marginBottom: 6 }}><RiskBadge risk={msg.analysisData.risk} /></div>
                )}
                <div className={isUser ? 'chat-message-user' : 'chat-message-bot'} style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
                  {formatTime(msg.time)}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFD6E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💗</div>
            <div className="chat-message-bot" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner spinner-pink" style={{ width: 16, height: 16, borderWidth: 2 }} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div style={{ overflowX: 'auto', padding: '6px 12px', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)} style={{ display: 'inline-block', marginRight: 8, padding: '8px 14px', borderRadius: 'var(--radius-full)', background: '#FFF0F5', border: '1px solid #FFD6E5', fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 12px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom,0px))', background: '#fff', borderTop: '1px solid var(--color-border)', gap: 8, flexShrink: 0 }}>
        <textarea
          style={{ flex: 1, background: '#FFF5F8', borderRadius: 22, padding: '10px 16px', fontSize: 14, color: 'var(--color-text-primary)', maxHeight: 100, resize: 'none', border: '1px solid var(--color-border)', fontFamily: 'inherit', outline: 'none' }}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Tell me how you're feeling..."
          rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!inputText.trim()}
          style={{ width: 44, height: 44, borderRadius: '50%', background: inputText.trim() ? 'var(--color-primary)' : '#FFB3CC', border: 'none', color: '#fff', fontSize: 18, fontWeight: 700, cursor: inputText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ➤
        </button>
      </div>

      {/* Emergency Alert */}
      <Alert
        visible={emergencyAlert}
        title="⚠️ High Risk Detected"
        message="Based on your symptoms, we recommend seeking immediate medical attention. Would you like to access emergency help?"
        buttons={[
          { text: "I'm Okay", style: 'cancel', onPress: () => setEmergencyAlert(false) },
          { text: 'Get Emergency Help', onPress: () => { setEmergencyAlert(false); navigate('/app/emergency'); } },
        ]}
        onDismiss={() => setEmergencyAlert(false)}
      />
    </div>
  );
}
