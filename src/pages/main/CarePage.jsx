import React, { useState } from 'react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TODAY_INDEX = new Date().getDay(); // 0=Sun

const medications = [
  {
    id: 'thyroxine',
    name: 'Thyroxine 50mcg',
    instruction: 'Take on empty stomach, 30 min before breakfast',
    time: '8:00 AM',
    timeLabel: 'Morning',
    icon: '💊',
    iconBg: 'var(--color-primary-tint)',
    taken: true,
    takenAt: '8:12 AM',
    refill: 'Sufficient',
    refillType: 'success',
  },
  {
    id: 'calcium',
    name: 'Calcium 500mg',
    instruction: 'Take after meal with a full glass of water',
    time: '1:00 PM',
    timeLabel: 'Afternoon',
    icon: '🦴',
    iconBg: '#FFF3E8',
    taken: false,
    takenAt: null,
    refill: 'Sufficient',
    refillType: 'success',
  },
  {
    id: 'iron',
    name: 'Iron Supplement',
    instruction: 'Take with Vitamin C, avoid dairy for 1 hour',
    time: '8:00 PM',
    timeLabel: 'Evening',
    icon: '🩸',
    iconBg: 'var(--color-danger-tint)',
    taken: false,
    takenAt: null,
    refill: 'Refill in 5 days',
    refillType: 'warning',
  },
];

const prescriptions = [
  { name: 'Folic Acid 5mg', detail: 'Day 196 · Ongoing', status: 'Active', type: 'success' },
  { name: 'Thyroxine 50mcg', detail: '30 tablets remaining', status: 'Active', type: 'success' },
  { name: 'Iron Supplements', detail: 'Refill needed in 5 days', status: 'Refill Soon', type: 'warning' },
];

export default function CarePage() {
  const [meds, setMeds] = useState(() =>
    Object.fromEntries(medications.map(m => [m.id, m.taken]))
  );

  const takenCount = Object.values(meds).filter(Boolean).length;
  const totalCount = medications.length;
  const adherence = 94;

  const toggleMed = (id) => {
    setMeds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="screen" style={{ paddingTop: 20 }}>

      {/* ── Header ── */}
      <header className="mb-6 animate-fade-in-up">
        <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
          Medication Center
        </h1>
        <p className="small text-secondary" style={{ marginTop: 4 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* ── Adherence Hero Card ── */}
      <div className="card-hero mb-6 animate-fade-in-up delay-1" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Circular progress ring */}
          <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle
                cx="44" cy="44" r="36"
                fill="none" stroke="white" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - adherence / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                {adherence}%
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>
              Weekly Adherence
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
              You're doing amazing, Priya! Keep it up 🌟
            </p>
            {/* Day dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {DAYS.map((day, i) => {
                const isPast = i < TODAY_INDEX;
                const isToday = i === TODAY_INDEX;
                const isFuture = i > TODAY_INDEX;
                return (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isPast ? 'rgba(255,255,255,0.9)' : isToday ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      border: isToday ? '2px solid white' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                      color: isPast ? 'var(--color-primary)' : 'rgba(255,255,255,0.7)',
                    }}>
                      {isPast ? '✓' : day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Schedule ── */}
      <section className="mb-6 animate-fade-in-up delay-2">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Today's Schedule
          </h2>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>
            {takenCount}/{totalCount} taken
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {medications.map((med, i) => {
            const isTaken = meds[med.id];
            return (
              <div key={med.id}>
                {/* Time label */}
                <p className="section-label" style={{ marginBottom: 6, marginLeft: 4 }}>
                  {med.timeLabel} · {med.time}
                </p>
                <div className="card" style={{ padding: '16px' }}>
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: isTaken ? 'var(--color-success-tint)' : med.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                      transition: 'background var(--transition-normal)',
                    }}>
                      {isTaken ? '✅' : med.icon}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: isTaken ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', marginBottom: 2, textDecoration: isTaken ? 'line-through' : 'none' }}>
                        {med.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                        {med.instruction}
                      </p>
                      {isTaken && med.takenAt && (
                        <span className="badge badge-success" style={{ fontSize: 10, marginTop: 6 }}>
                          Taken {med.takenAt}
                        </span>
                      )}
                      {!isTaken && (
                        <span className={`badge badge-${med.refillType === 'warning' ? 'warning' : 'outline'}`} style={{ fontSize: 10, marginTop: 6 }}>
                          {med.refill}
                        </span>
                      )}
                    </div>

                    {/* Toggle */}
                    <div
                      className={`med-toggle ${isTaken ? 'on' : ''}`}
                      onClick={() => toggleMed(med.id)}
                      role="switch"
                      aria-checked={isTaken}
                      aria-label={`Mark ${med.name} as taken`}
                    >
                      <div className="med-toggle-thumb" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Active Prescriptions ── */}
      <section className="animate-fade-in-up delay-3">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            All Medications
          </h2>
          <button className="btn btn-secondary btn-sm" style={{ gap: 4, padding: '8px 14px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {prescriptions.map((rx, i) => (
            <div key={i} className="card card-interactive" style={{ padding: '14px 16px' }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: rx.type === 'success' ? 'var(--color-success)' : 'var(--color-warning)',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 1 }}>
                    {rx.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {rx.detail}
                  </p>
                </div>
                <span className={`badge badge-${rx.type}`} style={{ fontSize: 11 }}>
                  {rx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
