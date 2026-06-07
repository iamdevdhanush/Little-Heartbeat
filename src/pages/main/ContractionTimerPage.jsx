import React, { useState, useRef, useEffect } from 'react';
import HeaderBar from '../../components/common/HeaderBar.jsx';

export default function ContractionTimerPage() {
  const [contractions, setContractions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      const start = Date.now();
      setStartTime(start);
      intervalRef.current = setInterval(() => { setElapsedTime(Math.floor((Date.now() - start) / 1000)); }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedTime(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setIsActive(true);
  };

  const handleStop = () => {
    if (!isActive) return;
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    const duration = elapsedTime;
    const lastEnd = contractions.length > 0 ? contractions[contractions.length - 1].endTime : null;
    const interval = lastEnd ? Math.floor((Date.now() - lastEnd) / 1000) : null;

    const contraction = {
      id: Date.now().toString(),
      startTime: Date.now() - duration * 1000,
      endTime: Date.now(),
      duration,
      interval,
    };
    setContractions(prev => [...prev, contraction]);
    setIsActive(false);
  };

  const handleReset = () => { setContractions([]); setIsActive(false); };

  const avgDuration = contractions.length > 0 ? Math.round(contractions.reduce((s, c) => s + c.duration, 0) / contractions.length) : null;
  const avgInterval = contractions.filter(c => c.interval !== null).length > 0
    ? Math.round(contractions.filter(c => c.interval !== null).reduce((s, c) => s + c.interval, 0) / contractions.filter(c => c.interval !== null).length)
    : null;

  const getAdvice = () => {
    if (!avgInterval) return null;
    if (avgInterval <= 300 && avgDuration >= 30) return { text: '🚨 Go to hospital now! Contractions are 5 minutes apart and lasting 30+ seconds.', color: 'var(--color-error)' };
    if (avgInterval <= 600) return { text: '⚠️ Call your doctor. Contractions are getting closer.', color: 'var(--color-warning)' };
    return { text: '✅ Keep timing. Call your doctor when contractions are 5 min apart.', color: 'var(--color-success)' };
  };

  const advice = getAdvice();

  return (
    <div>
      <HeaderBar title="Contraction Timer" emoji="⏱️" subtitle="Track labor contractions" />
      <div className="scroll-area" style={{ alignItems: 'center', textAlign: 'center' }}>
        {/* Timer Display */}
        <div className="card shadow-lg" style={{ width: '100%', padding: 32 }}>
          <div className="timer-display">{formatTime(isActive ? elapsedTime : 0)}</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 8 }}>
            {isActive ? '⏱️ Contraction in progress...' : contractions.length > 0 ? 'Tap START when next contraction begins' : 'Tap START when contraction begins'}
          </p>
          <div className="flex gap-sm" style={{ marginTop: 24 }}>
            {!isActive ? (
              <button onClick={handleStart} style={{ flex: 1, padding: 16, background: 'linear-gradient(135deg, #E8517A, #C73D65)', border: 'none', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-md)' }}>
                ▶ START
              </button>
            ) : (
              <button onClick={handleStop} style={{ flex: 1, padding: 16, background: 'linear-gradient(135deg, #E53935, #B71C1C)', border: 'none', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-md)', animation: 'pulse 1s ease-in-out infinite' }}>
                ■ STOP
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {contractions.length > 0 && (
          <div className="card shadow-sm" style={{ width: '100%' }}>
            <div className="flex gap-sm">
              <div style={{ flex: 1, background: '#FFF5F8', borderRadius: 'var(--radius-lg)', padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)' }}>{contractions.length}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Contractions</div>
              </div>
              {avgDuration && (
                <div style={{ flex: 1, background: '#EEF4FF', borderRadius: 'var(--radius-lg)', padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-accent)' }}>{avgDuration}s</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Avg Duration</div>
                </div>
              )}
              {avgInterval && (
                <div style={{ flex: 1, background: '#F0FFF4', borderRadius: 'var(--radius-lg)', padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)' }}>{Math.floor(avgInterval / 60)}m</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Avg Interval</div>
                </div>
              )}
            </div>
            {advice && (
              <div style={{ background: '#FFF8FA', borderRadius: 'var(--radius-lg)', padding: 12, marginTop: 12, border: `1px solid ${advice.color}22` }}>
                <p style={{ fontSize: 14, color: advice.color, fontWeight: 600, textAlign: 'center' }}>{advice.text}</p>
              </div>
            )}
          </div>
        )}

        {/* Log */}
        {contractions.length > 0 && (
          <div className="card shadow-sm" style={{ width: '100%' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
              <div className="section-title" style={{ margin: 0 }}>Contraction Log</div>
              <button onClick={handleReset} style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Clear</button>
            </div>
            {[...contractions].reverse().map((c, i) => (
              <div key={c.id} className="flex justify-between items-center" style={{ padding: '8px 0', borderBottom: i < contractions.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>#{contractions.length - i}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Duration: <strong>{c.duration}s</strong></span>
                {c.interval && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Every {Math.floor(c.interval / 60)}m {c.interval % 60}s</span>}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-gradient-blue" style={{ borderRadius: 'var(--radius-xl)', padding: 20, width: '100%' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: 8 }}>📋 When to Go to Hospital</div>
          <p style={{ fontSize: 14, color: '#2D4A6E', lineHeight: 1.7 }}>
            🚨 Contractions 5 min apart, lasting 1 min, for 1 hour<br/>
            🚨 Water breaks<br/>
            🚨 Heavy bleeding<br/>
            ⚠️ Strong, regular contractions under 10 min apart
          </p>
        </div>
      </div>
    </div>
  );
}
