import React, { useState, useCallback } from 'react';
import MedicineCard from './MedicineCard.jsx';
import { savePrescription, confirmMedication, generateSchedules, deletePrescription } from '../../services/prescriptionService.js';

export default function ExtractionResult({ result, userId, onComplete, onBack }) {
  const [medicines, setMedicines] = useState(result.medicines || []);
  const [confirmedIds, setConfirmedIds] = useState(new Set());
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmStep, setConfirmStep] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleUpdate = useCallback((id, updates) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleToggleConfirm = useCallback((id) => {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleConfirmAll = useCallback(async () => {
    setIsConfirming(true);
    setConfirmStep('Saving prescription record...');

    try {
      await savePrescription(userId, result);

      const toConfirm = medicines.filter((m) => confirmedIds.has(m.id));
      const confirmed = [];

      for (const med of toConfirm) {
        setConfirmStep(`Saving ${med.name}...`);
        const saved = await confirmMedication({ ...med, prescriptionId: result.id }, userId);
        confirmed.push(saved);

        setConfirmStep(`Generating schedule for ${med.name}...`);
        await generateSchedules(saved, userId);
      }

      const uncheckedMeds = medicines.filter((m) => !confirmedIds.has(m.id));
      for (const med of uncheckedMeds) {
        setConfirmStep(`Saving ${med.name}...`);
        const saved = await confirmMedication({ ...med, prescriptionId: result.id }, userId);
        setConfirmStep(`Generating schedule for ${med.name}...`);
        await generateSchedules(saved, userId);
      }

      setConfirmStep('Done! Medication schedules created.');
      setHasConfirmed(true);
      setIsConfirming(false);

      if (onComplete) {
        onComplete(medicines);
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setIsConfirming(false);
      setConfirmStep(null);
    }
  }, [medicines, confirmedIds, result, userId, onComplete]);

  const statusIcon = (conf) => {
    if (conf >= 80) return '🟢';
    if (conf >= 50) return '🟡';
    return '🔴';
  };

  if (hasConfirmed) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 'var(--radius-full)',
          background: 'var(--color-success-tint)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 32,
        }}>
          ✅
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          All Set!
        </h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
          {medicines.length} medication{medicines.length > 1 ? 's' : ''} saved with schedules.
          You'll get reminders at the right times.
        </p>
        <button onClick={onBack} className="btn btn-primary">
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Review & Confirm
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {result.fileInfo?.name && `${result.fileInfo.name} · `}
            OCR Confidence: {result.ocrConfidence?.toFixed(0)}%
          </p>
        </div>
        <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
          Back
        </button>
      </div>

      {/* Overall confidence bar */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: result.confidence.overall >= 80
          ? 'var(--color-success-tint)'
          : result.confidence.overall >= 50
            ? 'var(--color-warning-tint)'
            : 'var(--color-danger-tint)',
        marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>
          {result.confidence.overall >= 80 ? '🟢' : result.confidence.overall >= 50 ? '🟡' : '🔴'}
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>
            Overall Extraction Quality: {result.confidence.verdict === 'high' ? 'High' : result.confidence.verdict === 'medium' ? 'Medium' : 'Low'}
          </p>
          <div className="progress-bar" style={{ marginTop: 6, background: 'rgba(0,0,0,0.08)', height: 6 }}>
            <div className="progress-bar-fill" style={{
              width: `${result.confidence.overall}%`,
              background: result.confidence.overall >= 80
                ? 'var(--color-success)'
                : result.confidence.overall >= 50
                  ? 'var(--color-warning)'
                  : 'var(--color-danger)',
            }} />
          </div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{result.confidence.overall}%</span>
      </div>

      {/* Doctor & Date info */}
      {(result.doctor?.name || result.dates?.appointmentDate || result.dates?.prescriptionDate) && (
        <div className="card-tint" style={{ padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {result.doctor?.name && (
              <div>
                <p className="caption text-muted" style={{ marginBottom: 1 }}>Doctor</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{result.doctor.name}</p>
              </div>
            )}
            {result.doctor?.clinic && (
              <div>
                <p className="caption text-muted" style={{ marginBottom: 1 }}>Clinic</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{result.doctor.clinic}</p>
              </div>
            )}
            {result.dates?.prescriptionDate && (
              <div>
                <p className="caption text-muted" style={{ marginBottom: 1 }}>Date</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{result.dates.prescriptionDate}</p>
              </div>
            )}
            {result.dates?.appointmentDate && (
              <div>
                <p className="caption text-muted" style={{ marginBottom: 1 }}>Next Visit</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{result.dates.appointmentDate}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Select all / deselect all */}
      {medicines.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            {medicines.length} medicine{medicines.length > 1 ? 's' : ''} detected
          </p>
          <button
            onClick={() => {
              if (confirmedIds.size === medicines.length) {
                setConfirmedIds(new Set());
              } else {
                setConfirmedIds(new Set(medicines.map((m) => m.id)));
              }
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12, color: 'var(--color-primary)' }}
          >
            {confirmedIds.size === medicines.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      {/* Medicine cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {medicines.map((med, idx) => (
          <div key={med.id} style={{ position: 'relative' }}>
            {/* Checkbox overlay for selection */}
            <div
              onClick={() => handleToggleConfirm(med.id)}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 2,
                width: 24, height: 24, borderRadius: 6,
                border: `2px solid ${confirmedIds.has(med.id) ? 'var(--color-success)' : 'var(--color-border-medium)'}`,
                background: confirmedIds.has(med.id) ? 'var(--color-success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
            >
              {confirmedIds.has(med.id) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <MedicineCard
              medicine={med}
              index={idx}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {/* Raw text (collapsible) */}
      {result.rawText && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{
            fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
            cursor: 'pointer', padding: '8px 0',
          }}>
            View Raw OCR Text
          </summary>
          <div className="ai-summary" style={{ marginTop: 4, maxHeight: 150, overflowY: 'auto', fontSize: 11, lineHeight: 1.6 }}>
            {result.rawText}
          </div>
        </details>
      )}

      {/* Confirm button */}
      {medicines.length > 0 && (
        <button
          onClick={handleConfirmAll}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <div className="sos-pulse" />
              {confirmStep || 'Saving...'}
            </span>
          ) : (
            `Confirm ${medicines.length} Medicine${medicines.length > 1 ? 's' : ''}`
          )}
        </button>
      )}

      {medicines.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <p className="text-secondary" style={{ marginBottom: 12 }}>No medicines to confirm</p>
          <button onClick={onBack} className="btn btn-secondary">Try Again</button>
        </div>
      )}
    </div>
  );
}
