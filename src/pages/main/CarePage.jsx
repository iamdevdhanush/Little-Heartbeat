import React, { useState } from 'react';
import ReminderPanel from '../../components/reminder/ReminderPanel.jsx';
import PrescriptionUpload from '../../components/prescription/PrescriptionUpload.jsx';
import { useReminderStore } from '../../reminder/reminderStore.js';

export default function CarePage() {
  const [showUpload, setShowUpload] = useState(false);
  const refreshReminders = useReminderStore((s) => s.refreshReminders);
  const userId = useReminderStore((s) => s.userId);

  const handlePrescriptionComplete = async (result) => {
    setShowUpload(false);
    setTimeout(() => {
      refreshReminders();
    }, 500);
  };

  const handlePrescriptionError = (error) => {
    console.error('Prescription error:', error);
  };

  return (
    <div className="screen" style={{ paddingTop: 20 }}>

      {/* ── Header ── */}
      <header className="mb-6 animate-fade-in-up" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
            Medication Center
          </h1>
          <p className="small text-secondary" style={{ marginTop: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary btn-sm"
          style={{ padding: '10px 16px', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {showUpload ? 'Close' : 'Upload Rx'}
        </button>
      </header>

      {/* ── Prescription Upload (collapsible) ── */}
      {showUpload && (
        <div className="mb-6 animate-fade-in-up">
          <PrescriptionUpload
            userId={userId}
            onComplete={handlePrescriptionComplete}
            onError={handlePrescriptionError}
          />
          <div className="divider" style={{ marginTop: 20 }} />
        </div>
      )}

      {/* ── Reminder Engine ── */}
      <div className="animate-fade-in-up delay-1">
        <ReminderPanel userId={userId} />
      </div>

    </div>
  );
}
