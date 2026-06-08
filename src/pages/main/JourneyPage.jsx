import React, { useEffect, useState } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import databaseService from '../../services/databaseService.js';

function TimelineEvent({ event, index }) {
  const isPast = new Date(event.date) < new Date();
  const isCurrent = !isPast && index === 0;

  return (
    <div style={{
      display: 'flex', gap: 16,
      opacity: isPast ? 1 : isCurrent ? 1 : 0.5,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: isPast ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-border-strong)',
          border: isCurrent ? '3px solid rgba(91,91,214,0.2)' : 'none',
          flexShrink: 0,
        }} />
        <div style={{
          width: 2, flex: 1, minHeight: 40,
          background: 'var(--color-border)',
        }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
        }}>
          <span style={{ fontSize: 20 }}>{event.emoji || '📌'}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {event.title}
            </p>
            {event.date && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        {event.description && (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
            {event.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function JourneyPage() {
  const { user } = useUser();
  const { pregnancy, week, babyGrowth, loading: pregLoading } = usePregnancy(user?.id);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!pregnancy?.id) {
      setEventsLoading(false);
      return;
    }
    databaseService.getTimelineEvents(user?.id, pregnancy.id).then(data => {
      setEvents(data || []);
      setEventsLoading(false);
    }).catch(() => setEventsLoading(false));
  }, [pregnancy?.id]);

  if (pregLoading || eventsLoading) {
    return (
      <div className="screen" style={{ paddingTop: 40 }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!pregnancy || !week) {
    return (
      <div className="screen" style={{ paddingTop: 40, textAlign: 'center' }}>
        <div className="animate-fade-in-up" style={{ padding: '60px 20px' }}>
          <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>🌱</span>
          <h2 className="serif-heading" style={{ fontSize: 24, marginBottom: 8 }}>
            Your Journey Begins
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: 300, margin: '0 auto' }}>
            Set up your pregnancy details to see your weekly journey and milestones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 24 }}>
      <div className="animate-fade-in-up">
        <p style={{
          fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)',
          marginBottom: 4, letterSpacing: '0.02em', textTransform: 'uppercase',
        }}>
          Your Journey
        </p>
        <h1 className="serif-display" style={{ fontSize: 36, marginBottom: 4 }}>
          Week {week}
        </h1>
        <p className="serif-label" style={{ fontSize: 18, color: 'var(--color-text-secondary)' }}>
          {pregnancy.baby_name ? `${pregnancy.baby_name}'s journey` : 'Growing every day'}
        </p>
      </div>

      {babyGrowth && (
        <div className="animate-fade-in-up delay-1" style={{
          marginTop: 20,
          background: 'var(--gradient-soft)',
          borderRadius: 'var(--radius-hero)',
          padding: '24px 20px',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 64, display: 'block', marginBottom: 12 }}>
            {babyGrowth.size_emoji || '👶'}
          </span>
          <p className="serif-heading" style={{ fontSize: 24, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            {babyGrowth.size_label || ''}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
            {babyGrowth.length_cm && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>Length</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{babyGrowth.length_cm} cm</p>
              </div>
            )}
            {babyGrowth.weight_g && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>Weight</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{babyGrowth.weight_g}g</p>
              </div>
            )}
          </div>
          {babyGrowth.development && (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginTop: 16, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
              {babyGrowth.development}
            </p>
          )}
        </div>
      )}

      <section style={{ marginTop: 28 }}>
        <h2 className="serif-label" style={{ fontSize: 18, marginBottom: 14 }}>
          Milestones & Events
        </h2>
        {events.length > 0 ? (
          <div>
            {events.map((event, i) => (
              <TimelineEvent key={event.id || i} event={event} index={i} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            background: 'var(--color-surface-tint)',
            borderRadius: 'var(--radius-card)',
            border: '1px dashed var(--color-border-strong)',
          }}>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Your milestones will appear here as you add them.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
