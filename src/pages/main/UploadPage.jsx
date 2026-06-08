import React, { useState } from 'react';
import PrescriptionUpload from '../../components/prescription/PrescriptionUpload.jsx';

export default function UploadPage() {
  const [done, setDone] = useState(false);

  const handleComplete = () => {
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  const handleError = (err) => {
    console.error('Upload error:', err);
  };

  if (done) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 'var(--radius-full)',
          background: 'var(--color-success-tint)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, fontSize: 32,
        }}>
          ✓
        </div>
        <h1 className="serif-heading" style={{ fontSize: 28, marginBottom: 8 }}>
          All Set!
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
          Your medications are saved. You'll get reminders at the right times.
        </p>
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
          Doctor Visit
        </p>
        <h1 className="serif-display" style={{ fontSize: 36, marginBottom: 4 }}>
          Upload Prescription
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
          Take a photo of your prescription. We'll extract the medicines and create your schedule.
        </p>
      </div>

      <div style={{ marginTop: 24 }} className="animate-fade-in-up delay-1">
        <PrescriptionUpload
          userId="local"
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>

      <div className="animate-fade-in-up delay-2" style={{
        marginTop: 32, padding: '16px 20px',
        background: 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          All processing happens on your device. Your data stays private.
        </p>
      </div>
    </div>
  );
}
