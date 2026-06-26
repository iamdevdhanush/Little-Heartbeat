import React, { useState } from 'react';

const CONFIDENCE_COLORS = {
  high: 'var(--color-success)',
  medium: 'var(--color-warning)',
  low: 'var(--color-danger)',
};

const CONFIDENCE_BG = {
  high: 'var(--color-success-tint)',
  medium: 'var(--color-warning-tint)',
  low: 'var(--color-danger-tint)',
};

export default function MedicineCard({ medicine, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...medicine });

  const verdict = medicine.confidence >= 80 ? 'high'
    : medicine.confidence >= 50 ? 'medium' : 'low';

  const handleSave = () => {
    onUpdate(medicine.id, { ...editData, edited: true });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...medicine });
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const getIconForMed = (name) => {
    const med = name?.toLowerCase() || '';
    if (med.includes('thyroxin') || med.includes('thyro')) return '⚡';
    if (med.includes('calcium')) return '🦴';
    if (med.includes('iron') || med.includes('ferrous') || med.includes('ferup')) return '🩸';
    if (med.includes('folic') || med.includes('folate') || med.includes('folvite')) return '🧬';
    if (med.includes('vitamin') || med.includes('d3') || med.includes('omega')) return '☀️';
    if (med.includes('aspirin') || med.includes('ecosprin')) return '💊';
    if (med.includes('insulin')) return '💉';
    if (med.includes('progesterone') || med.includes('duphaston')) return '🌸';
    if (med.includes('antibiotic') || med.includes('amoxicillin')) return '🦠';
    if (med.includes('paracetamol') || med.includes('crocin')) return '🌡️';
    if (med.includes('prenatal') || med.includes('multi')) return '💊';
    return '💊';
  };

  const icon = getIconForMed(medicine.name);

  return (
    <div className="card" style={{
      padding: '16px',
      borderLeft: `4px solid ${CONFIDENCE_COLORS[verdict]}`,
      animation: 'fadeInUp 0.3s ease both',
      animationDelay: `${(index || 0) * 0.06}s`,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: CONFIDENCE_BG[verdict],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              className="input"
              value={editData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Medicine name"
              style={{ fontSize: 15, fontWeight: 600, padding: '8px 12px', marginBottom: 8 }}
            />
          ) : (
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
              {medicine.name}
            </p>
          )}

          {!isEditing && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {medicine.dosage && (
                <span className="badge badge-primary" style={{ fontSize: 11 }}>{medicine.dosage}</span>
              )}
              {medicine.frequency && (
                <span className="badge badge-outline" style={{ fontSize: 11 }}>{medicine.frequency}</span>
              )}
              {medicine.timing && (
                <span className="badge badge-outline" style={{ fontSize: 11 }}>{medicine.timing}</span>
              )}
              {medicine.duration && (
                <span className="badge badge-outline" style={{ fontSize: 11 }}>{medicine.duration}</span>
              )}
            </div>
          )}

          {/* Confidence indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: CONFIDENCE_COLORS[verdict],
            }} />
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: CONFIDENCE_COLORS[verdict],
            }}>
              {verdict === 'high' ? 'High Confidence' : verdict === 'medium' ? 'Medium Confidence' : 'Low Confidence'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {medicine.confidence}%
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px 8px', fontSize: 12 }}
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(medicine.id)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 8px', fontSize: 12, color: 'var(--color-danger)' }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Editable fields (when editing) */}
      {isEditing && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              className="input"
              value={editData.dosage || ''}
              onChange={(e) => handleFieldChange('dosage', e.target.value)}
              placeholder="Dosage (e.g., 50mg)"
              style={{ fontSize: 13, padding: '8px 12px' }}
            />
            <input
              className="input"
              value={editData.frequency || ''}
              onChange={(e) => handleFieldChange('frequency', e.target.value)}
              placeholder="Frequency (e.g., twice daily)"
              style={{ fontSize: 13, padding: '8px 12px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              className="input"
              value={editData.timing || ''}
              onChange={(e) => handleFieldChange('timing', e.target.value)}
              placeholder="Timing (e.g., after food)"
              style={{ fontSize: 13, padding: '8px 12px' }}
            />
            <input
              className="input"
              value={editData.duration || ''}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
              placeholder="Duration (e.g., 7 days)"
              style={{ fontSize: 13, padding: '8px 12px' }}
            />
          </div>
          <input
            className="input"
            value={editData.instructions || ''}
            onChange={(e) => handleFieldChange('instructions', e.target.value)}
            placeholder="Instructions"
            style={{ fontSize: 13, padding: '8px 12px' }}
          />
          {medicine.rawContext && (
            <div className="ai-summary" style={{ fontSize: 11, padding: '8px 10px', marginTop: 4 }}>
              <strong>Extracted context:</strong> {medicine.rawContext}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={handleCancel} className="btn btn-ghost btn-sm">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary btn-sm">Save</button>
          </div>
        </div>
      )}

      {/* Raw context (when not editing) */}
      {!isEditing && medicine.rawContext && (
        <div className="ai-summary" style={{ fontSize: 11, padding: '8px 10px', marginTop: 8, opacity: 0.7 }}>
          <strong>Raw:</strong> {medicine.rawContext}
        </div>
      )}
    </div>
  );
}
