import React, { useState } from 'react';
import HeaderBar from '../../components/common/HeaderBar.jsx';
import { useApp } from '../../context/AppContext.js';
import Alert, { useAlert } from '../../components/common/Alert.jsx';

export default function FamilyDashboardPage() {
  const { profile } = useApp();
  const { alertProps, showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (!email.trim() || !email.includes('@')) { showAlert('Invalid Email', 'Please enter a valid email address.'); return; }
    setSharing(true);
    await new Promise(r => setTimeout(r, 1200));
    setSharing(false);
    setShared(true);
    setEmail('');
    showAlert('✅ Invite Sent!', `An invitation has been sent to ${email}. They will be able to view your pregnancy updates.`);
  };

  const month = profile?.pregnancyMonth || 5;

  return (
    <div>
      <HeaderBar title="Family Dashboard" emoji="👨‍👩‍👧" subtitle="Share your journey with loved ones" />
      <div className="scroll-area">
        {/* Current Status */}
        <div className="bg-gradient-hero" style={{ borderRadius: 'var(--radius-2xl)', padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Current Status</div>
          <div className="flex gap-md">
            {[
              { label: 'Month', value: `${month}`, emoji: '🤰' },
              { label: 'Week', value: `${month * 4 - 2}`, emoji: '📅' },
              { label: 'Health', value: 'Good', emoji: '💚' },
            ].map((stat, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-lg)', padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.emoji}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="card shadow-sm">
          <div className="section-title">📨 Invite Family Member</div>
          <p className="section-subtitle">Share real-time pregnancy updates with your partner or family</p>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@email.com" />
          </div>
          <button onClick={handleShare} disabled={sharing} className="btn btn-primary">
            {sharing ? <span className="spinner" /> : '📨 Send Invite'}
          </button>
        </div>

        {/* Partner Tips */}
        <div className="card shadow-sm">
          <div className="section-title">💑 How Partners Can Help</div>
          {[
            { emoji: '🛒', tip: 'Help with grocery shopping and preparing nutritious meals' },
            { emoji: '🚗', tip: 'Drive to prenatal appointments and hospital visits' },
            { emoji: '🧘', tip: 'Join prenatal yoga or relaxation sessions together' },
            { emoji: '📚', tip: 'Learn about pregnancy stages and newborn care' },
            { emoji: '💆', tip: 'Give gentle back and foot massages to relieve discomfort' },
            { emoji: '📞', tip: 'Keep emergency contacts and hospital routes ready' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-md" style={{ paddingBottom: 10, borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none', paddingTop: 10 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.tip}</p>
            </div>
          ))}
        </div>

        {/* Emergency Prep */}
        <div className="bg-gradient-emergency" style={{ borderRadius: 'var(--radius-xl)', padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#C62828', marginBottom: 8 }}>🚨 Emergency Preparedness</div>
          <p style={{ fontSize: 14, color: '#5D1A1A', lineHeight: 1.7 }}>
            Know the route to the nearest hospital.<br />
            Have the hospital bag ready from month 7.<br />
            Keep emergency numbers saved in your phone.
          </p>
        </div>
      </div>
      <Alert {...alertProps} />
    </div>
  );
}
