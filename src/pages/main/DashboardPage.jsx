import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.js';
import { getBabyData } from '../../data/babyGrowth.js';
import { getRegionDiet } from '../../data/dietData.js';
import { getInsight } from '../../data/insights.js';
import { getTranslation } from '../../data/translations.js';

export default function DashboardPage() {
  const { profile, language } = useApp();
  const navigate = useNavigate();
  const t = getTranslation(language);

  const month = profile?.pregnancyMonth || 5;
  const babyData = getBabyData(month);
  const diet = getRegionDiet(profile?.region);
  const insight = getInsight(month);
  const [dietTab, setDietTab] = useState('eat');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Hero Header */}
      <div className="bg-gradient-hero" style={{ padding: '20px 20px 24px', paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))' }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {greeting()}, {profile?.name || 'Mama'} 💕
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>Month {month} of your pregnancy</p>
          </div>
          <button onClick={() => navigate('/app/emergency')} style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFE4E4', border: '1px solid #FFB3B3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20 }}>
            🚨
          </button>
        </div>
      </div>

      <div className="scroll-area">
        {/* Baby Card */}
        <div className="card shadow-lg" style={{ background: 'linear-gradient(135deg, #FFF0F5, #F0F7FF)', borderRadius: 'var(--radius-2xl)' }}>
          <div className="flex items-center gap-base">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0 }}>
              {babyData.emoji}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Your Baby</div>
              <div style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                is the size of <strong style={{ fontSize: 20, color: 'var(--color-text-primary)' }}>a {babyData.size}</strong>
              </div>
              <div className="flex gap-md" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>📏 {babyData.sizeInCm}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>⚖️ {babyData.weight}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Baby Development */}
        <div className="card shadow-sm">
          <div className="section-title">👶 What's Happening Inside</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{babyData.description}</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>{babyData.development}</p>
        </div>

        {/* Today's Insight */}
        <div className="bg-gradient-blue" style={{ borderRadius: 'var(--radius-xl)', padding: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: 8 }}>💡 Today's Insight</div>
          <p style={{ fontSize: 14, color: '#2D4A6E', lineHeight: 1.6, marginBottom: 10 }}>{insight.insight}</p>
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)', padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent-dark)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>This week's tip</div>
            <p style={{ fontSize: 13, color: '#2D4A6E', lineHeight: 1.5 }}>{insight.tip}</p>
          </div>
        </div>

        {/* Exercise & Care */}
        <div className="card shadow-sm">
          <div className="section-title">🏃 Exercise & Care</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{insight.exercise}</p>
          {babyData.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-sm" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: 'var(--color-success)', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* Body Changes */}
        <div className="card shadow-sm">
          <div className="section-title">🧘 Your Body This Month</div>
          {babyData.bodyChanges.map((change, i) => (
            <div key={i} className="flex items-start gap-sm" style={{ marginBottom: 4 }}>
              <span style={{ flexShrink: 0 }}>💗</span>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{change}</p>
            </div>
          ))}
        </div>

        {/* Diet Guide */}
        <div className="card shadow-sm">
          <div className="section-title">🍽️ Your Diet Guide</div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>{diet.label} Recommendations</p>
          <div className="diet-tabs">
            <button className={`diet-tab ${dietTab === 'eat' ? 'active' : ''}`} onClick={() => setDietTab('eat')}>✅ Eat These</button>
            <button className={`diet-tab ${dietTab === 'avoid' ? 'active' : ''}`} onClick={() => setDietTab('avoid')}>🚫 Avoid These</button>
          </div>
          {(dietTab === 'eat' ? diet.toEat : diet.toAvoid).map((item, i) => (
            <div key={i} className="flex items-center gap-md" style={{ paddingBottom: 8, borderBottom: '1px solid var(--color-border-light)', paddingTop: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFF5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.reason}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-grid">
          {month >= 7 && (
            <button onClick={() => navigate('/app/contractions')} className="quick-card" style={{ background: '#FFF0F5' }}>
              <span className="quick-card-emoji">⏱️</span>
              <span className="quick-card-label">Contractions</span>
            </button>
          )}
          {month < 7 && (
            <button onClick={() => navigate('/app/heartbeat')} className="quick-card" style={{ background: '#FFF0F5' }}>
              <span className="quick-card-emoji">💗</span>
              <span className="quick-card-label">Heartbeat</span>
            </button>
          )}
          <button onClick={() => navigate('/app/health')} className="quick-card" style={{ background: '#EEF4FF' }}>
            <span className="quick-card-emoji">📊</span>
            <span className="quick-card-label">Health Check</span>
          </button>
          <button onClick={() => navigate('/app/hospitals')} className="quick-card" style={{ background: '#FFF8EA' }}>
            <span className="quick-card-emoji">🏥</span>
            <span className="quick-card-label">Hospitals</span>
          </button>
          <button onClick={() => navigate('/app/family')} className="quick-card" style={{ background: '#F0FFF4' }}>
            <span className="quick-card-emoji">👨‍👩‍👧</span>
            <span className="quick-card-label">Family</span>
          </button>
        </div>
      </div>
    </div>
  );
}
