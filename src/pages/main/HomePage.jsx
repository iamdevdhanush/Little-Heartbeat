import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import { useMedication } from '../../hooks/useMedication.js';
import { useAppointments } from '../../hooks/useAppointments.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

function PriorityCard({ icon, title, subtitle, color, to }) {
  return (
    <Link to={to || '#'} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        background: color ? `${color}10` : 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${color ? `${color}20` : 'var(--color-border)'}`,
      }}>
        <span style={{ fontSize: 24, width: 40, textAlign: 'center' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

const LOAD_TIMEOUT = 5000;

export default function HomePage() {
  const { user, loading: userLoading } = useUser();
  const { pregnancy, week, babyGrowth, loading: pregLoading } = usePregnancy(user?.id);
  const { medications, loading: medLoading } = useMedication(user?.id);
  const { nextAppointment, loading: apptLoading } = useAppointments(user?.id);

  const [forceLoaded, setForceLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setForceLoaded(true), LOAD_TIMEOUT);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = !forceLoaded && (userLoading || pregLoading || medLoading || apptLoading);

  const todayMeds = useMemo(() => {
    return (medications || []).filter(m => m.active !== false).slice(0, 3);
  }, [medications]);

  const nextApptDays = useMemo(() => {
    if (!nextAppointment?.date) return null;
    return daysUntil(nextAppointment.date);
  }, [nextAppointment]);

  if (isLoading) {
    return (
      <div className="screen" style={{ paddingTop: 40 }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading your day...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: 24 }}>
      <div className="animate-fade-in-up">
        <p style={{
          fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)',
          marginBottom: 4, letterSpacing: '0.02em', textTransform: 'uppercase',
        }}>
          {getGreeting()}
        </p>
        <h1 className="serif-display" style={{ fontSize: 36, marginBottom: 4 }}>
          {user?.name || 'Mama'} {new Date().getHours() < 12 ? '🌤️' : new Date().getHours() < 17 ? '☀️' : '🌙'}
        </h1>
      </div>

      {pregnancy && week ? (
        <div className="animate-fade-in-up delay-1" style={{
          marginTop: 20,
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-hero)',
          padding: '24px 20px',
          color: 'white',
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginBottom: 4 }}>
            You're in Week {week}
          </p>
          <p className="serif-heading" style={{ fontSize: 28, marginBottom: 8, lineHeight: 1.2 }}>
            Your baby is growing well.
          </p>
          {babyGrowth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <span style={{ fontSize: 40 }}>{babyGrowth.size_emoji || '👶'}</span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{babyGrowth.size_label || ''}</p>
                {babyGrowth.length_cm && (
                  <p style={{ fontSize: 13, opacity: 0.85 }}>
                    {babyGrowth.length_cm} cm · {babyGrowth.weight_g ? `${babyGrowth.weight_g}g` : ''}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in-up delay-1" style={{
          marginTop: 20,
          background: 'var(--color-surface-tint)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 20px',
          textAlign: 'center',
          border: '1px solid var(--color-border)',
        }}>
          <p className="serif-heading" style={{ fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Welcome to Little Heartbeat
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            Upload your first prescription to get started.
          </p>
          <Link to="/upload" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Prescription
          </Link>
        </div>
      )}

      <section style={{ marginTop: 28 }}>
        <h2 className="serif-label" style={{ fontSize: 18, marginBottom: 14 }}>
          Today's Priorities
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todayMeds.length > 0 ? (
            todayMeds.map((med, i) => (
              <PriorityCard
                key={med.id || i}
                icon="💊"
                title={`${med.name}${med.dosage ? ` - ${med.dosage}` : ''}`}
                subtitle={med.timing ? `Take at ${med.timing}` : 'Follow your schedule'}
                color="var(--color-primary)"
                to="/care"
              />
            ))
          ) : (
            <PriorityCard
              icon="💊"
              title="No medications yet"
              subtitle="Upload a prescription to start tracking"
              to="/upload"
            />
          )}

          <PriorityCard
            icon="💧"
            title="Drink 8 glasses of water today"
            subtitle="Stay hydrated for you and baby"
            color="var(--color-accent)"
          />

          {nextAppointment ? (
            <PriorityCard
              icon="📅"
              title={nextApptDays !== null && nextApptDays <= 1
                ? `Appointment ${nextApptDays === 0 ? 'today' : 'tomorrow'}`
                : nextAppointment.title || 'Next appointment'
              }
              subtitle={formatDate(nextAppointment.date)}
              color="var(--color-warning)"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
