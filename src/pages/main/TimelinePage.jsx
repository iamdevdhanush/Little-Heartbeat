import React, { useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import { useTimeline } from '../../hooks/useTimeline.js';

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--color-surface-tint)',
      borderRadius: 'var(--radius-card)',
      border: '1px dashed var(--color-border-strong)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

const trimesterTabs = ['1st Trimester', '2nd Trimester', '3rd Trimester'];

function getWeekStatus(eventWeek, currentWeek) {
  if (eventWeek < currentWeek) return 'past';
  if (eventWeek === currentWeek) return 'current';
  return 'future';
}

export default function TimelinePage() {
  const { user, loading: userLoading } = useUser();
  const { pregnancy, week, trimester, babyGrowth, loading: pregLoading } = usePregnancy(user?.id);
  const { events, loading: eventsLoading, addEvent } = useTimeline(user?.id, pregnancy?.id);

  const [activeTab, setActiveTab] = useState(trimester > 0 ? trimester - 1 : 2);

  const currentWeek = week || 1;

  const filteredEvents = events.filter(e => {
    if (activeTab === 0) return e.week <= 13;
    if (activeTab === 1) return e.week > 13 && e.week <= 27;
    return e.week >= 28;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => b.week - a.week);

  const isLoading = userLoading || pregLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="screen" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
        <p className="text-secondary" style={{ fontSize: 14 }}>Loading your journey...</p>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }} className="animate-fade-in-up">
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
            Your Journey
          </h1>
          {pregnancy && (
            <p className="small text-secondary" style={{ marginTop: 4 }}>
              Week {week} of 40 · {trimester === 1 ? 'First' : trimester === 2 ? 'Second' : 'Third'} Trimester
            </p>
          )}
        </div>
      </header>

      <div className="animate-fade-in-up delay-1" style={{
        display: 'flex', gap: 6,
        background: 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-full)',
        padding: 4, marginBottom: 28,
        border: '1px solid var(--color-border)',
      }}>
        {trimesterTabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-full)',
              background: activeTab === i ? 'var(--color-primary)' : 'transparent',
              color: activeTab === i ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer',
              transition: 'all var(--transition-fast)', fontFamily: 'var(--font-family)',
              letterSpacing: '-0.01em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {babyGrowth && pregnancy && (
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div style={{
            position: 'absolute', left: 16, top: 8, bottom: 8,
            width: 2,
            background: 'linear-gradient(180deg, rgba(91,91,214,0.08) 0%, rgba(91,91,214,0.2) 50%, rgba(91,91,214,0.08) 100%)',
            borderRadius: 1,
          }} />
          <div className="animate-fade-in-up" style={{ display: 'flex', gap: 16, paddingLeft: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 34, paddingTop: 4 }}>
              <div className="pulse-container" style={{ width: 34, height: 34, marginTop: -5 }}>
                <div className="pulse-ring" style={{ width: 28, height: 28 }} />
                <div className="pulse-ring" style={{ width: 28, height: 28, animationDelay: '0.5s' }} />
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 0 3px white, 0 0 0 5px rgba(91,91,214,0.25)',
                  position: 'relative', zIndex: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
                }}>
                  <span style={{ color: 'white' }}>★</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--color-primary)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Week {currentWeek}
                </span>
                <span className="badge badge-primary" style={{ fontSize: 10 }}>You are here</span>
              </div>

              <div className="card-hero" style={{ padding: 0, overflow: 'hidden', borderRadius: 28 }}>
                <div style={{
                  height: 160,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', top: -40, right: -40,
                  }} />
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 70, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>👶</div>
                  </div>
                </div>

                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  {[{ label: 'Length', value: babyGrowth.length_cm || '--' }, { label: 'Weight', value: babyGrowth.weight || '--' }, { label: 'Age', value: `Week ${currentWeek}` }].map((stat, si, arr) => (
                    <React.Fragment key={si}>
                      <div style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{stat.label}</p>
                        <p style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{stat.value}</p>
                      </div>
                      {si < arr.length - 1 && <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', alignSelf: 'stretch' }} />}
                    </React.Fragment>
                  ))}
                </div>

                <div style={{ padding: '16px 20px 20px' }}>
                  <p style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>
                    {babyGrowth.size_emoji} Your baby is the size of {babyGrowth.size_label}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                    {babyGrowth.development}
                  </p>
                  {babyGrowth.description && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 'var(--radius-full)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: 'white',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {babyGrowth.size_emoji} {babyGrowth.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {sortedEvents.length > 0 ? (
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 16, top: 8, bottom: 8,
            width: 2,
            background: 'linear-gradient(180deg, rgba(91,91,214,0.08) 0%, rgba(91,91,214,0.2) 50%, rgba(91,91,214,0.08) 100%)',
            borderRadius: 1,
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sortedEvents.map((event, i) => (
              <TimelineEvent key={event.id} event={event} index={i} currentWeek={currentWeek} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon="🌟"
          title="No Milestones Yet"
          subtitle="Start tracking your pregnancy journey by adding milestones, scan results, and special moments. Each week brings new developments worth remembering."
        />
      )}
    </div>
  );
}

function TimelineEvent({ event, index, currentWeek }) {
  const status = getWeekStatus(event.week, currentWeek);
  const isPast = status === 'past';
  const isFuture = status === 'future';

  return (
    <div className="animate-fade-in-up" style={{
      display: 'flex', gap: 16,
      opacity: isFuture ? 0.5 : 1,
      paddingLeft: 0, marginBottom: 20,
      animationDelay: `${index * 0.05}s`,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 34, paddingTop: 4 }}>
        {isPast ? (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--color-success)',
            boxShadow: '0 0 0 3px var(--color-success-tint)',
            marginTop: 4,
          }} />
        ) : isFuture ? (
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px dashed var(--color-border-strong)',
            background: 'white', marginTop: 5,
          }} />
        ) : (
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 0 3px white, 0 0 0 5px rgba(91,91,214,0.25)',
            position: 'relative', zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
          }}>
            <span style={{ color: 'white' }}>★</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: isPast ? 'var(--color-text-muted)' : 'var(--color-primary)',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Week {event.week}
          </span>
          <span className={`badge badge-${isPast ? 'success' : isFuture ? 'outline' : 'primary'}`} style={{ fontSize: 10 }}>
            {isPast ? 'Past' : isFuture ? 'Upcoming' : 'Current'}
          </span>
        </div>

        <div className={`card ${isFuture ? 'card-dashed' : ''} card-interactive`} style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: isPast ? 'var(--color-success-tint)' : 'var(--color-surface-tint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              {event.emoji || '📌'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                {event.title}
              </p>
              {event.description && (
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {event.description}
                </p>
              )}
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
      </div>
    </div>
  );
}
