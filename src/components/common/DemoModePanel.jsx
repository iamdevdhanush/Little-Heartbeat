import React, { useState } from 'react';
import { useDemoMode, DEMO_PRESET_SCENARIOS } from '../../hooks/useDemoMode.js';

export default function DemoModePanel() {
  const { isDemoMode, enableDemoMode, disableDemoMode, simulateLocation, simulateHealthRisk, alertMessage, setAlertMessage } = useDemoMode();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Alert from demo mode */}
      {alertMessage && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(45,27,46,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: 24
          }}
          onClick={() => setAlertMessage(null)}
        >
          <div
            className="card-lg animate-slide-up"
            style={{ maxWidth: 360, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{alertMessage.title}</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', whiteSpace: 'pre-line', marginBottom: 16 }}>
              {alertMessage.message}
            </div>
            <button className="btn btn-primary" onClick={() => setAlertMessage(null)}>Got it</button>
          </div>
        </div>
      )}

      <div className="demo-panel">
        <button className="demo-fab" onClick={() => setOpen(o => !o)} title="Demo Mode">
          {isDemoMode ? '🎬' : '🔧'}
        </button>

        {open && (
          <div className="demo-drawer">
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🎬 Demo Mode</span>
              <button
                style={{ background: isDemoMode ? 'var(--color-primary)' : '#E0E0E0', border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: isDemoMode ? '#fff' : '#666' }}
                onClick={() => isDemoMode ? disableDemoMode() : enableDemoMode()}
              >
                {isDemoMode ? 'ON' : 'OFF'}
              </button>
            </div>

            {isDemoMode && (
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Scenarios</div>
                {DEMO_PRESET_SCENARIOS.map(scenario => (
                  <button
                    key={scenario.id}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)', textAlign: 'left', cursor: 'pointer', marginBottom: 6, fontFamily: 'inherit'
                    }}
                    onClick={() => {
                      simulateLocation(scenario.location);
                      simulateHealthRisk(scenario.health);
                      setOpen(false);
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{scenario.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{scenario.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
