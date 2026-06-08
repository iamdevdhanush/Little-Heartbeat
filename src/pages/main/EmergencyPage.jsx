import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import { getEmergencyContacts } from '../../services/sosService.js';

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      textAlign: 'center', padding: '24px 16px',
      background: 'var(--color-surface-tint)',
      borderRadius: 'var(--radius-card)',
      border: '1px dashed var(--color-border-strong)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{subtitle}</p>
    </div>
  );
}

export default function EmergencyPage() {
  const { user, loading: userLoading } = useUser();
  const { week, loading: pregLoading } = usePregnancy(user?.id);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  const [alertActive, setAlertActive] = useState(true);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    getEmergencyContacts().then(data => {
      setContacts(data || []);
      setContactsLoading(false);
    }).catch(() => setContactsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!alertActive) return;
    const timer = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [alertActive]);

  const handleCallEmergency = () => {
    window.location.href = 'tel:112';
  };

  const handleCallContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (!alertActive) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 className="serif-heading" style={{ fontSize: 28, marginBottom: 8 }}>
          Alert Cancelled
        </h1>
        <p className="body-md" style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          Your contacts have been notified that you are safe.
        </p>
        <button className="btn btn-primary" onClick={() => { setAlertActive(true); setSecondsElapsed(0); }}>
          Back to SOS
        </button>
      </div>
    );
  }

  const isLoading = userLoading || pregLoading || contactsLoading;

  return (
    <div style={{ background: '#FFFAF9', minHeight: '100%' }}>
      <div style={{ padding: '24px 20px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-6 animate-fade-in-up" style={{ paddingTop: 8 }}>
          <div className="flex items-center gap-2">
            <div className="sos-pulse" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-danger)' }}>
              SOS Active · {Math.floor(secondsElapsed / 60)}:{String(secondsElapsed % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>Location Shared</span>
          </div>
        </div>

        <div className="animate-fade-in-up delay-1" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-danger-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            border: '3px solid rgba(255,107,107,0.2)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 className="serif-heading" style={{ fontSize: 32, marginBottom: 8 }}>
            Emergency Help
          </h1>
          <p className="body-md" style={{ color: 'var(--color-text-secondary)', maxWidth: 280, margin: '0 auto' }}>
            We've sent your location to your emergency contacts
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            <span className="badge badge-success">✓ Location Shared</span>
            <span className="badge badge-primary">Contacts Notified</span>
          </div>
        </div>

        <button
          className="animate-fade-in-up delay-2"
          onClick={handleCallEmergency}
          style={{
            width: '100%', padding: '20px 24px', borderRadius: 20,
            background: 'var(--gradient-danger)',
            color: 'white', fontSize: 18, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 8,
            fontFamily: 'var(--font-family)',
            transition: 'all var(--transition-fast)',
            letterSpacing: '-0.01em',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.89-1.89a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call Emergency Services (112)
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Your GPS coordinates will be shared automatically
        </p>

        <section className="animate-fade-in-up delay-3" style={{ marginBottom: 20 }}>
          <h2 className="sans-title" style={{ fontSize: 18, marginBottom: 12 }}>
            Your Emergency Contacts
          </h2>

          {contacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.map((contact) => (
                <div key={contact.id} className="card" style={{ padding: '14px 16px' }}>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: contact.avatar_color || '#5B5BD6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0,
                    }}>
                      {(contact.name || '?').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <p className="sans-title" style={{ fontSize: 15 }}>
                          {contact.name}
                        </p>
                        {contact.relation && (
                          <span className="badge badge-outline" style={{ fontSize: 10 }}>{contact.relation}</span>
                        )}
                      </div>
                      <p className="caption" style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: 2 }}>
                        ✓ Notified
                      </p>
                    </div>

                    <button
                      onClick={() => handleCallContact(contact.phone)}
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--color-success)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(47,191,113,0.3)',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.89-1.89a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="👥" title="No Emergency Contacts" subtitle="Add emergency contacts in your profile to alert them during an SOS." />
          )}
        </section>

        <section className="animate-fade-in-up delay-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,107,107,0.2)' }}>
            <div style={{
              background: '#FFF5F5', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid rgba(255,107,107,0.12)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--color-danger-tint)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>
                ⚕️
              </div>
              <p className="serif-label" style={{ color: 'var(--color-danger-dark)', fontSize: 12 }}>
                Medical Information
              </p>
            </div>

            <div style={{ padding: '16px', background: '#FFFAF9' }}>
              {isLoading ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading medical info...</p>
              ) : user || week ? (
                <>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>Blood Type</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                        {user?.blood_type || '--'}
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>Weeks Pregnant</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                        {week ? `${week}w` : '--'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Allergies', value: user?.allergies || 'None listed' },
                      { label: 'Conditions', value: user?.conditions || 'None listed' },
                      { label: 'OB/GYN', value: user?.doctor_name || 'Not set' },
                      { label: "Doctor's Phone", value: user?.doctor_phone || 'Not set' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{row.label}</span>
                        <span style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 700 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  No medical profile found. Complete your profile for emergency use.
                </p>
              )}

              <div style={{
                marginTop: 14, padding: '10px 12px',
                background: 'rgba(255,107,107,0.06)',
                borderRadius: 10, textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: 'var(--color-danger-dark)', fontWeight: 600 }}>
                  📱 Show this screen to emergency personnel
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="animate-fade-in-up delay-5" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Location tracking active · Updating every 30s
          </p>
        </div>

        <button
          onClick={() => setAlertActive(false)}
          style={{
            width: '100%', padding: '14px',
            background: 'transparent', border: 'none',
            color: 'var(--color-text-secondary)', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
            textAlign: 'center', fontFamily: 'var(--font-family)',
          }}
        >
          Cancel Alert — False Alarm
        </button>
      </div>
    </div>
  );
}
