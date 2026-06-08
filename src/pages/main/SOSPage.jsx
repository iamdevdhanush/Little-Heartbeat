import React, { useState, useEffect } from 'react';
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

export default function SOSPage() {
  const { week } = usePregnancy();
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  useEffect(() => {
    getEmergencyContacts().then(data => {
      setContacts(data || []);
      setContactsLoading(false);
    }).catch(() => setContactsLoading(false));
  }, []);

  const handleCallEmergency = () => {
    window.location.href = 'tel:112';
  };

  const handleCallContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div style={{ background: '#FFFAF9', minHeight: '100%' }}>
      <div style={{ padding: '24px 20px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center', paddingTop: 8, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--color-danger-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            border: '3px solid rgba(255,107,107,0.15)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 className="serif-heading" style={{ fontSize: 28, marginBottom: 4, color: 'var(--color-danger-dark)' }}>
            Emergency
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 280, margin: '0 auto' }}>
            Tap the button below to call for help
          </p>
        </div>

        <button
          className="animate-fade-in-up delay-1"
          onClick={handleCallEmergency}
          style={{
            width: '100%', padding: '20px 24px', borderRadius: 20,
            background: 'var(--gradient-danger)',
            color: 'white', fontSize: 18, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255,107,107,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 24,
            fontFamily: 'var(--font-family)',
            letterSpacing: '-0.01em',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.89-1.89a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call Emergency Services (112)
        </button>

        <section className="animate-fade-in-up delay-2" style={{ marginBottom: 20 }}>
          <h2 className="sans-title" style={{ fontSize: 18, marginBottom: 12 }}>
            Emergency Contacts
          </h2>

          {contacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.map((contact) => (
                <div key={contact.id} className="card" style={{ padding: '14px 16px' }}>
                  <div className="flex items-center" style={{ gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: contact.avatar_color || '#5B5BD6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0,
                    }}>
                      {(contact.name || '?').charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="sans-title" style={{ fontSize: 15 }}>
                        {contact.name}
                      </p>
                      {contact.relation && (
                        <p className="caption" style={{ color: 'var(--color-text-muted)', marginTop: 1 }}>
                          {contact.relation}
                        </p>
                      )}
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
            <EmptyState icon="👥" title="No Emergency Contacts" subtitle="Add contacts to alert them in an emergency." />
          )}
        </section>

        <section className="animate-fade-in-up delay-3" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,107,107,0.2)' }}>
            <div style={{
              background: '#FFF5F5', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid rgba(255,107,107,0.12)',
            }}>
              <span style={{ fontSize: 16 }}>⚕️</span>
              <p className="serif-label" style={{ color: 'var(--color-danger-dark)', fontSize: 12 }}>
                Medical Information
              </p>
            </div>

            <div style={{ padding: '16px', background: '#FFFAF9' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>Weeks Pregnant</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {week ? `${week}w` : '--'}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>Blood Type</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>--</p>
                </div>
              </div>

              <div style={{
                marginTop: 8, padding: '10px 12px',
                background: 'rgba(255,107,107,0.06)',
                borderRadius: 10, textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: 'var(--color-danger-dark)', fontWeight: 600 }}>
                  Show this screen to emergency personnel
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
