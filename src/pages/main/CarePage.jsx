import React, { useState } from 'react';
import PrescriptionUpload from '../../components/prescription/PrescriptionUpload.jsx';
import ReminderPanel from '../../components/reminder/ReminderPanel.jsx';

export default function CarePage() {
  const [showUpload, setShowUpload] = useState(false);

  const handleComplete = () => {
    setShowUpload(false);
  };

  return (
    <div className="screen" style={{ paddingTop: 24 }}>
      <div className="animate-fade-in-up" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{
            fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)',
            letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="serif-display" style={{ fontSize: 36 }}>
            My Medicines
          </h1>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary btn-sm"
          style={{ padding: '10px 16px', gap: 6, whiteSpace: 'nowrap' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {showUpload ? 'Close' : 'Upload Rx'}
        </button>
      </div>

      {showUpload && (
        <div className="mb-6 animate-fade-in-up" style={{ marginTop: 20 }}>
          <PrescriptionUpload
            userId="local"
            onComplete={handleComplete}
          />
        </div>
      )}

      <div className="animate-fade-in-up delay-1" style={{ marginTop: showUpload ? 8 : 24 }}>
        <ReminderPanel userId="local" showStats={false} />
      </div>
    </div>
  );
}
