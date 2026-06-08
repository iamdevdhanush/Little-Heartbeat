import React from 'react';
import ReminderCard from './ReminderCard.jsx';

export default function ReminderList({ reminders, onTake, onSkip, onSnooze }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        background: 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-card)',
        border: '1px dashed var(--color-border-strong)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-full)',
          background: 'var(--color-success-tint)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', fontSize: 24,
        }}>
          ✅
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          All Caught Up!
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          No pending reminders right now
        </p>
      </div>
    );
  }

  const grouped = reminders.reduce((acc, r) => {
    const period = getPeriod(r.time);
    if (!acc[period]) acc[period] = [];
    acc[period].push(r);
    return acc;
  }, {});

  const periodOrder = ['morning', 'afternoon', 'evening', 'night'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {periodOrder.map((period) => {
        const periodReminders = grouped[period];
        if (!periodReminders || periodReminders.length === 0) return null;
        return (
          <div key={period}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--color-text-muted)',
              marginBottom: 8, paddingLeft: 4,
            }}>
              {getPeriodLabel(period)} · {periodReminders.length} reminder{periodReminders.length > 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {periodReminders.map((reminder) => (
                <div key={reminder.id} style={{ animation: 'fadeInUp 0.3s ease both' }}>
                  <ReminderCard
                    reminder={reminder}
                    onTake={onTake}
                    onSkip={onSkip}
                    onSnooze={onSnooze}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getPeriod(time) {
  if (!time) return 'other';
  const [h] = time.split(':').map(Number);
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

function getPeriodLabel(period) {
  switch (period) {
    case 'morning': return '🌅 Morning';
    case 'afternoon': return '☀️ Afternoon';
    case 'evening': return '🌆 Evening';
    case 'night': return '🌙 Night';
    default: return 'Other';
  }
}
