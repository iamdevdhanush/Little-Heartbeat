import React, { useState, useEffect, useRef } from 'react';
import HeaderBar from '../../components/common/HeaderBar.jsx';
import { playHeartbeat, pauseHeartbeat, stopHeartbeat, initializeAudio, getIsPlaying } from '../../services/audioService.js';

const HEART_RATES = [
  { bpm: 110, label: 'Slow', emoji: '💙' },
  { bpm: 140, label: 'Normal', emoji: '💗' },
  { bpm: 160, label: 'Fast', emoji: '💕' },
];

export default function HeartbeatPage() {
  const [playing, setPlaying] = useState(false);
  const [selectedRate, setSelectedRate] = useState(HEART_RATES[1]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => { stopHeartbeat(); };
  }, []);

  const handleToggle = async () => {
    if (!initialized) {
      setLoading(true);
      await initializeAudio();
      setInitialized(true);
      setLoading(false);
    }

    if (playing) {
      await pauseHeartbeat();
      setPlaying(false);
    } else {
      const success = await playHeartbeat(selectedRate.bpm);
      setPlaying(success);
    }
  };

  const handleRateChange = async (rate) => {
    setSelectedRate(rate);
    if (playing) {
      await stopHeartbeat();
      await playHeartbeat(rate.bpm);
    }
  };

  return (
    <div>
      <HeaderBar title="Baby Heartbeat" emoji="💗" subtitle="Listen to your baby's heartbeat" />
      <div className="scroll-area" style={{ alignItems: 'center', textAlign: 'center' }}>
        {/* Visualizer */}
        <div style={{ padding: '32px 0' }}>
          <div
            className={`heartbeat-circle ${playing ? 'playing' : ''}`}
            onClick={handleToggle}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {loading ? <span className="spinner spinner-pink" style={{ width: 40, height: 40, borderWidth: 3 }} /> : playing ? '💗' : '🤍'}
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 20 }}>
            {playing ? `Beating at ${selectedRate.bpm} BPM` : 'Tap to play heartbeat'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {playing ? '♫ Playing heartbeat sound...' : 'Simulated baby heartbeat'}
          </p>
        </div>

        {/* Rate Selector */}
        <div className="card shadow-sm" style={{ width: '100%' }}>
          <div className="section-title">Heart Rate</div>
          <div className="flex gap-sm">
            {HEART_RATES.map(rate => (
              <button
                key={rate.bpm}
                onClick={() => handleRateChange(rate)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-xl)',
                  border: `2px solid ${selectedRate.bpm === rate.bpm ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedRate.bpm === rate.bpm ? '#FFF0F5' : '#FFFFFF',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                }}
              >
                <span style={{ fontSize: 24 }}>{rate.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: selectedRate.bpm === rate.bpm ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{rate.bpm} BPM</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{rate.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-gradient-pink" style={{ borderRadius: 'var(--radius-xl)', padding: 20, width: '100%' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 8 }}>💡 Did You Know?</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            A baby's heart rate is typically between 120–160 beats per minute — much faster than an adult's! It's completely normal for it to vary depending on activity.
          </p>
        </div>

        <div className="card shadow-sm" style={{ width: '100%' }}>
          <div className="section-title">When to Seek Help</div>
          {[
            { text: 'Less than 100 BPM — consult your doctor', color: 'var(--color-warning)' },
            { text: 'Over 180 BPM consistently — seek immediate care', color: 'var(--color-error)' },
            { text: 'No movement for over 2 hours — contact doctor', color: 'var(--color-error)' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-sm" style={{ marginBottom: 8 }}>
              <span style={{ color: item.color, fontWeight: 700, marginTop: 1 }}>⚠️</span>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
