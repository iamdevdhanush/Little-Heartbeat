import React, { useEffect } from 'react';
import { useReminderStore } from '../../reminder/reminderStore.js';
import ReminderList from './ReminderList.jsx';

export default function ReminderPanel({ userId, showStats = true, compact = false }) {
  const todayReminders = useReminderStore((s) => s.todayReminders);
  const adherence = useReminderStore((s) => s.adherence);
  const streaks = useReminderStore((s) => s.streaks);
  const isLoading = useReminderStore((s) => s.isLoading);
  const medicines = useReminderStore((s) => s.medicines);
  const error = useReminderStore((s) => s.error);
  const initialize = useReminderStore((s) => s.initialize);
  const refreshReminders = useReminderStore((s) => s.refreshReminders);
  const handleTakeReminder = useReminderStore((s) => s.handleTakeReminder);
  const handleSkipReminder = useReminderStore((s) => s.handleSkipReminder);
  const handleSnoozeReminder = useReminderStore((s) => s.handleSnoozeReminder);

  useEffect(() => {
    if (userId) {
      initialize(userId);
    }
  }, [userId]);

  const pendingCount = todayReminders.filter(
    (r) => r.status === 'pending' || r.status === 'snoozed'
  ).length;
  const totalCount = todayReminders.length;
  const takenCount = todayReminders.filter((r) => r.status === 'taken').length;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: 16, borderRadius: 'var(--radius-md)',
        background: 'var(--color-danger-tint)',
        border: '1px solid rgba(255,107,107,0.2)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--color-danger-dark)', marginBottom: 8 }}>{error}</p>
        <button
          onClick={() => initialize(userId)}
          className="btn btn-secondary btn-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-tint)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 28,
        }}>
          💊
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          No Medications Yet
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
          Upload a prescription to get started with automated medication reminders
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary header */}
      {!compact && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {totalCount > 0
                ? `${takenCount} of ${totalCount} taken today`
                : 'No reminders today'
              }
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="badge badge-primary">
              {pendingCount} pending
            </span>
          )}
          {pendingCount === 0 && totalCount > 0 && (
            <span className="badge badge-success">
              All done! 🎉
            </span>
          )}
        </div>
      )}

      {/* Reminder list */}
      <ReminderList
        reminders={todayReminders}
        onTake={handleTakeReminder}
        onSkip={handleSkipReminder}
        onSnooze={handleSnoozeReminder}
      />

      {/* Adherence + streaks */}
      {showStats && !compact && (
        <div style={{
          marginTop: 24, padding: 16, borderRadius: 'var(--radius-card)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            📊 Adherence
          </p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Today</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)' }}>
                {adherence?.daily?.rate ?? 0}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>7-Day</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>
                {adherence?.weekly?.rate ?? 0}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Streak</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-accent)' }}>
                {streaks?.current ?? 0} days
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
