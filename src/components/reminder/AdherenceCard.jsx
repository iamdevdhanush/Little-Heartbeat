import React from 'react';

function CircularProgress({ rate, size = 72, strokeWidth = 6, color, bgColor = 'rgba(0,0,0,0.06)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  const finalColor = color || (
    rate >= 80 ? 'var(--color-success)' :
    rate >= 50 ? 'var(--color-warning)' :
    'var(--color-danger)'
  );

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={finalColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
          {rate}%
        </span>
      </div>
    </div>
  );
}

function StatBar({ label, taken, total }) {
  const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {taken}/{total}
        </span>
      </div>
      <div className="progress-bar" style={{ height: 6, background: 'var(--color-border)' }}>
        <div className="progress-bar-fill" style={{
          width: `${rate}%`,
          background: rate >= 80 ? 'var(--color-success)' : rate >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

function StreakSection({ streaks }) {
  if (!streaks) return null;

  const flameIcons = streaks.current >= 30 ? '🔥🔥🔥' : streaks.current >= 14 ? '🔥🔥' : streaks.current >= 7 ? '🔥' : '';

  return (
    <div style={{
      background: 'var(--gradient-primary)',
      borderRadius: 'var(--radius-card)',
      padding: '16px 20px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        fontSize: 36, lineHeight: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
      }}>
        {streaks.current >= 7 ? '🔥' : '⭐'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {streaks.current}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>
            day streak
          </span>
          {flameIcons && (
            <span style={{ fontSize: 16 }}>{flameIcons}</span>
          )}
        </div>
        <p style={{ fontSize: 12, opacity: 0.8 }}>
          Best: {streaks.longest} days
          {streaks.todayComplete ? ' · Today: Complete ✅' : streaks.current > 0 ? '' : ''}
        </p>
      </div>
    </div>
  );
}

export default function AdherenceCard({ adherence, streaks }) {
  if (!adherence) {
    return (
      <div className="card-tint" style={{ padding: 24, textAlign: 'center' }}>
        <p className="text-muted" style={{ fontSize: 13 }}>No adherence data yet</p>
      </div>
    );
  }

  const { daily, weekly, monthly } = adherence;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Streak */}
      {streaks && <StreakSection streaks={streaks} />}

      {/* Rate circles */}
      <div className="card" style={{ padding: '20px' }}>
        <p style={{
          fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 16,
        }}>
          Adherence Rate
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <CircularProgress rate={daily?.rate || 0} size={64} strokeWidth={5} />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, fontWeight: 600 }}>Daily</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CircularProgress rate={weekly?.rate || 0} size={64} strokeWidth={5} />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, fontWeight: 600 }}>Weekly</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CircularProgress rate={monthly?.rate || 0} size={64} strokeWidth={5} />
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6, fontWeight: 600 }}>Monthly</p>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <StatBar label="Today" taken={daily?.taken || 0} total={daily?.total || 0} />
          <StatBar label="This Week" taken={weekly?.taken || 0} total={weekly?.total || 0} />
          <StatBar label="This Month" taken={monthly?.taken || 0} total={monthly?.total || 0} />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Taken</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Skipped</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Missed</span>
        </div>
      </div>
    </div>
  );
}

export { CircularProgress, StreakSection };
