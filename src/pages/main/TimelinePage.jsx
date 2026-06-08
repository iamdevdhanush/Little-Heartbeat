import React, { useState } from 'react';

const milestones = [
  {
    week: 6,
    title: 'Heartbeat Detected',
    emoji: '💓',
    status: 'past',
    badge: { label: 'Milestone', type: 'success' },
    description: 'Your baby\'s tiny heart started beating for the first time.',
  },
  {
    week: 12,
    title: 'NT Scan Cleared',
    emoji: '✅',
    status: 'past',
    badge: { label: 'Normal', type: 'success' },
    description: 'Nuchal translucency measurement within healthy range.',
  },
  {
    week: 20,
    title: "It's a Girl! 🌸",
    emoji: '💗',
    status: 'past',
    badge: { label: 'Special', type: 'primary' },
    description: 'Anatomy scan revealed a beautiful, healthy baby girl.',
  },
  {
    week: 24,
    title: 'Anomaly Scan Clear',
    emoji: '✅',
    status: 'past',
    badge: { label: 'All Clear', type: 'success' },
    description: 'No anomalies detected. Fetal heart rate 145 BPM.',
  },
  {
    week: 28,
    title: 'Third Trimester Begins',
    emoji: '⭐',
    status: 'current',
    badge: { label: 'You are here', type: 'primary' },
    description: 'Your baby can open their eyes, has regular sleep-wake cycles, and responds to light!',
    stats: [
      { label: 'Length', value: '37 cm' },
      { label: 'Weight', value: '1.1 kg' },
      { label: 'Age', value: '28w 0d' },
    ],
    achievements: [
      { icon: '🧠', label: 'Brain developing fast' },
      { icon: '👁️', label: 'Eyes opening' },
      { icon: '😴', label: 'Sleep cycles forming' },
    ],
  },
  {
    week: 32,
    title: 'Growth Scan Due',
    emoji: '📅',
    status: 'future',
    badge: { label: 'Upcoming', type: 'outline' },
    description: 'Schedule your growth scan with Dr. Anjali Sharma.',
  },
  {
    week: 36,
    title: 'GBS Test',
    emoji: '🏥',
    status: 'future',
    badge: { label: 'Upcoming', type: 'outline' },
    description: 'Group B Streptococcus swab test.',
  },
  {
    week: 40,
    title: 'Estimated Due Date',
    emoji: '⭐',
    status: 'future',
    badge: { label: 'Due Date', type: 'warning' },
    description: 'The big day! Your expected delivery date.',
    isSpecial: true,
  },
];

const trimesterTabs = ['1st Trimester', '2nd Trimester', '3rd Trimester'];

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState(2); // 3rd Trimester active (Week 28)

  const filtered = activeTab === 0
    ? milestones.filter(m => m.week <= 13)
    : activeTab === 1
    ? milestones.filter(m => m.week > 13 && m.week <= 27)
    : milestones.filter(m => m.week >= 28);

  return (
    <div className="screen" style={{ paddingTop: 20 }}>

      {/* ── Header ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }} className="animate-fade-in-up">
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
            Your Journey
          </h1>
          <p className="small text-secondary" style={{ marginTop: 4 }}>
            Week 28 of 40 · Third Trimester
          </p>
        </div>
        <button className="btn-icon" aria-label="Filter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/>
            <line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/>
            <line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/>
            <line x1="16" y1="18" x2="16" y2="22"/>
          </svg>
        </button>
      </header>

      {/* ── Trimester Tabs ── */}
      <div className="animate-fade-in-up delay-1" style={{
        display: 'flex',
        gap: 6,
        background: 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-full)',
        padding: 4,
        marginBottom: 28,
        border: '1px solid var(--color-border)',
      }}>
        {trimesterTabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === i ? 'var(--color-primary)' : 'transparent',
              color: activeTab === i ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: 12,
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-family)',
              letterSpacing: '-0.01em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Timeline ── */}
      <div style={{ position: 'relative' }}>
        {/* Vertical spine */}
        <div style={{
          position: 'absolute',
          left: 16,
          top: 8,
          bottom: 8,
          width: 2,
          background: 'linear-gradient(180deg, rgba(91,91,214,0.08) 0%, rgba(91,91,214,0.2) 50%, rgba(91,91,214,0.08) 100%)',
          borderRadius: 1,
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.map((milestone, i) => (
            <MilestoneItem key={milestone.week} milestone={milestone} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MilestoneItem({ milestone, index }) {
  const isPast = milestone.status === 'past';
  const isCurrent = milestone.status === 'current';
  const isFuture = milestone.status === 'future';

  return (
    <div
      className={`animate-fade-in-up`}
      style={{
        display: 'flex',
        gap: 16,
        opacity: isFuture ? 0.5 : 1,
        paddingLeft: 0,
        marginBottom: isCurrent ? 24 : 20,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Timeline dot */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        width: 34,
        paddingTop: 4,
      }}>
        {isCurrent ? (
          <div className="pulse-container" style={{ width: 34, height: 34, marginTop: -5 }}>
            <div className="pulse-ring" style={{ width: 28, height: 28 }} />
            <div className="pulse-ring" style={{ width: 28, height: 28, animationDelay: '0.5s' }} />
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 0 3px white, 0 0 0 5px rgba(91,91,214,0.25)',
              position: 'relative', zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9,
            }}>
              <span style={{ color: 'white' }}>★</span>
            </div>
          </div>
        ) : isPast ? (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--color-success)',
            boxShadow: '0 0 0 3px var(--color-success-tint)',
            marginTop: 4,
          }} />
        ) : (
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px dashed var(--color-border-strong)',
            background: 'white',
            marginTop: 5,
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 4 }}>
        {/* Week label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-muted)',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Week {milestone.week}
          </span>
          <span className={`badge badge-${milestone.badge.type}`} style={{ fontSize: 10 }}>
            {milestone.badge.label}
          </span>
        </div>

        {isCurrent ? (
          /* Hero card for current week */
          <div className="card-hero" style={{ padding: 0, overflow: 'hidden', borderRadius: 28 }}>
            {/* Illustration area */}
            <div style={{
              height: 160,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', top: -40, right: -40,
              }} />
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 70, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>👶</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}>
              {milestone.stats.map((stat, si) => (
                <React.Fragment key={si}>
                  <div style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{stat.label}</p>
                    <p style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{stat.value}</p>
                  </div>
                  {si < milestone.stats.length - 1 && (
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: '16px 20px 20px' }}>
              <p style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>
                {milestone.emoji} {milestone.title}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                {milestone.description}
              </p>
              {/* Achievement badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {milestone.achievements.map((ach, ai) => (
                  <span key={ai} style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    fontSize: 11, fontWeight: 600, color: 'white',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {ach.icon} {ach.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Regular milestone card */
          <div className={`card ${isFuture ? 'card-dashed' : ''} card-interactive`} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isPast ? 'var(--color-success-tint)' : 'var(--color-surface-tint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {milestone.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  {milestone.title}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {milestone.description}
                </p>
              </div>
              {isPast && (
                <div style={{ color: 'var(--color-success)', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
