import React from 'react';
import { useReminderStore } from '../../reminder/reminderStore.js';

const STATUS_STYLES = {
  pending: { bg: 'var(--color-surface-tint)', border: 'var(--color-border)', icon: '⏳', label: 'Pending' },
  taken: { bg: 'var(--color-success-tint)', border: 'var(--color-success)', icon: '✅', label: 'Taken' },
  skipped: { bg: 'var(--color-warning-tint)', border: 'var(--color-warning)', icon: '⏭️', label: 'Skipped' },
  missed: { bg: 'var(--color-danger-tint)', border: 'var(--color-danger)', icon: '❌', label: 'Missed' },
  snoozed: { bg: 'var(--color-primary-tint)', border: 'var(--color-primary)', icon: '⏰', label: 'Snoozed' },
};

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function ReminderCard({ reminder, onTake, onSkip, onSnooze }) {
  const isProcessing = useReminderStore((s) => s.isLoading);
  const style = STATUS_STYLES[reminder.status] || STATUS_STYLES.pending;

  const timeStr = reminder.scheduledTime
    ? formatTime(reminder.scheduledTime)
    : reminder.time || '--:--';

  const isActionable = reminder.status === 'pending' || reminder.status === 'snoozed';

  const snoozedUntil = reminder.snoozedUntil
    ? new Date(reminder.snoozedUntil)
    : null;
  const snoozeTimeStr = snoozedUntil && snoozedUntil > new Date()
    ? formatTime(snoozedUntil.toISOString())
    : null;

  return (
    <div style={{
      background: style.bg,
      borderRadius: 'var(--radius-card)',
      border: `1px solid ${style.border}`,
      padding: '14px 16px',
      transition: 'all var(--transition-fast)',
      opacity: reminder.status === 'taken' || reminder.status === 'skipped' ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Status icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {style.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {reminder.medicineName}
            </p>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {timeStr}
            </span>
          </div>
          {reminder.dosage && (
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 1 }}>
              {reminder.dosage}
            </p>
          )}
          {reminder.instructions && reminder.status === 'pending' && (
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              {reminder.instructions}
            </p>
          )}
          {snoozeTimeStr && reminder.status === 'snoozed' && (
            <p style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
              Snoozed until {snoozeTimeStr}
            </p>
          )}
          {reminder.takenAt && (
            <p style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>
              Taken at {formatTime(reminder.takenAt)}
            </p>
          )}
          {reminder.skippedAt && (
            <p style={{ fontSize: 11, color: 'var(--color-warning)', fontWeight: 600 }}>
              Skipped
            </p>
          )}
          {reminder.missedAt && (
            <p style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 600 }}>
              Missed
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {isActionable && (
            <button
              onClick={() => onTake(reminder.id)}
              disabled={isProcessing}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 14px', fontSize: 12 }}
            >
              Take
            </button>
          )}
          {isActionable && (
            <button
              onClick={() => onSnooze(reminder.id)}
              disabled={isProcessing}
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px 10px', fontSize: 12 }}
            >
              Snooze
            </button>
          )}
          {isActionable && (
            <button
              onClick={() => onSkip(reminder.id)}
              disabled={isProcessing}
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px 10px', fontSize: 12, color: 'var(--color-text-muted)' }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
