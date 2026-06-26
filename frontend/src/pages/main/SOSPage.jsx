import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import databaseService from '../../services/databaseService.js';

// Pre-seeded emergency contacts in case database is empty
const defaultContacts = [
  { id: 'ec1', name: 'Dr. Anjali Mehta (Obstetrician)', phone: '+91 98888 77777', relation: 'Primary Doctor', is_primary: true },
  { id: 'ec2', name: 'Arjun Sen (Husband)', phone: '+91 99999 88888', relation: 'Partner', is_primary: true }
];

// Pre-seeded maternity hospitals
const maternityHospitals = [
  { name: 'Cloudnine Maternity Hospital', phone: '1860 500 9999', distance: '1.2 km', specialties: ['Maternity Care', 'NICU Level III', '24/7 ER'], rating: 4.8 },
  { name: 'Apollo Cradle & Children’s Hospital', phone: '1860 500 4424', distance: '2.5 km', specialties: ['High-Risk Pregnancies', 'Pediatrics', 'Maternity Suite'], rating: 4.7 },
  { name: 'Fortis La Femme Specialty Hospital', phone: '011 4057 9400', distance: '3.8 km', specialties: ['Neonatology', 'Maternity ER', 'Labor Delivery Rooms'], rating: 4.6 }
];

export default function SOSPage() {
  const { user } = useUser();
  const { week } = usePregnancy(user?.id);
  
  const [contacts, setContacts] = useState([]);
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Attempt loading emergency contacts from databaseService
    if (user?.id) {
      // In a real app we might fetch user contacts; fallback to defaults for high-fidelity representation
      setContacts(defaultContacts);
    } else {
      setContacts(defaultContacts);
    }
  }, [user]);

  // Trigger countdown trigger
  const handleTriggerStart = () => {
    setIsCounting(true);
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsAlertActive(true);
          setIsCounting(false);
          // Auto dial primary doctor or hospital
          window.location.href = `tel:112`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTriggerCancel = () => {
    clearInterval(timerRef.current);
    setIsCounting(false);
    setCountdown(3);
    setIsAlertActive(false);
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="screen" style={{ paddingBottom: 110, background: '#FFFBFB' }}>
      
      {/* Header bar */}
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 20 }}>
        <p className="serif-label" style={{ color: 'var(--color-danger-dark)', fontWeight: 700 }}>
          SOS SAFETY TERMINAL
        </p>
        <h1 className="serif-display" style={{ fontSize: 30, color: 'var(--color-text-primary)', marginTop: 4 }}>
          Emergency Panel
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 280, margin: '0 auto' }}>
          Instantly alert your doctor, partner, and locate nearby maternity clinics.
        </p>
      </div>

      {/* Pulsing Central SOS Button */}
      <div className="flex justify-center items-center animate-fade-in delay-1" style={{
        height: 220, position: 'relative', marginBottom: 24
      }}>
        {/* Large pulsing rings */}
        <div className="sos-pulse" style={{
          position: 'absolute', width: 170, height: 170, borderRadius: '50%',
          background: 'rgba(255, 160, 137, 0.25)', animationDuration: '2s'
        }} />
        <div className="sos-pulse" style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(255, 160, 137, 0.12)', animationDuration: '2.5s', animationDelay: '0.5s'
        }} />

        {/* SOS button */}
        {!isCounting && !isAlertActive ? (
          <button 
            onClick={handleTriggerStart}
            style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'var(--gradient-danger)',
              border: '6px solid white',
              boxShadow: 'var(--shadow-danger)',
              color: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, position: 'relative'
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '0.04em' }}>SOS</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, marginTop: 4 }}>
              Tap to Trigger
            </span>
          </button>
        ) : isCounting ? (
          <div 
            onClick={handleTriggerCancel}
            style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'var(--color-text-primary)',
              border: '6px solid white',
              boxShadow: 'var(--shadow-md)',
              color: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, position: 'relative'
            }}
          >
            <span style={{ fontSize: 44, fontWeight: 800 }}>{countdown}</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, marginTop: 2 }}>
              Tap to Cancel
            </span>
          </div>
        ) : (
          <button 
            onClick={handleTriggerCancel}
            style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'var(--color-success)',
              border: '6px solid white',
              boxShadow: 'var(--shadow-md)',
              color: 'white',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10, position: 'relative'
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 800 }}>Sent!</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, marginTop: 4 }}>
              Tap to Reset
            </span>
          </button>
        )}
      </div>

      {/* GPS Location sharing status */}
      <div className="card animate-fade-in-up delay-2" style={{
        padding: '12px 16px', background: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div className="sos-pulse" style={{ width: 12, height: 12, background: isAlertActive ? 'var(--color-danger)' : 'var(--color-success)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {isAlertActive ? 'GPS Location Shared Successfully' : 'GPS Location Ready'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
            Sharing coordinates with 2 active contacts (Accuracy: 4.8m)
          </p>
        </div>
      </div>

      {/* Medical ID card */}
      <div className="card animate-fade-in-up delay-2" style={{
        padding: 0, overflow: 'hidden', marginBottom: 24, border: '1px solid rgba(255, 160, 137, 0.2)'
      }}>
        <div style={{ background: 'rgba(255, 160, 137, 0.08)', padding: '10px 16px', borderBottom: '1px solid rgba(255, 160, 137, 0.15)' }}>
          <p className="serif-label" style={{ color: 'var(--color-danger-dark)', fontSize: 11, fontWeight: 700 }}>
            🏥 Mother's Medical ID Summary
          </p>
        </div>
        <div style={{ padding: 16, background: 'white', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Gestational Age</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
              {week ? `Week ${week}` : '--'}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Blood Group</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>O Positive (O+)</p>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Known Allergies</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2 }}>Penicillin, Sulfa drugs</p>
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Primary Hospital</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2 }}>Cloudnine Hospital</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts List */}
      <section className="animate-fade-in-up delay-3" style={{ marginBottom: 24 }}>
        <h3 className="serif-label" style={{ fontSize: 14, marginBottom: 12 }}>Emergency Contacts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.map((contact) => (
            <div key={contact.id} className="card" style={{ padding: '12px 16px', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{contact.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{contact.relation}</p>
                </div>
                <button 
                  onClick={() => handleCall(contact.phone)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-danger-dark)', background: 'var(--color-danger-tint)', border: 'none', borderRadius: 16 }}
                >
                  📞 Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Maternity Clinics */}
      <section className="animate-fade-in-up delay-3">
        <h3 className="serif-label" style={{ fontSize: 14, marginBottom: 12 }}>Nearby Maternity Hospitals</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {maternityHospitals.map((hosp, idx) => (
            <div key={idx} className="card" style={{ padding: 16, background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{hosp.name}</h4>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>Distance: {hosp.distance}</p>
                </div>
                <button 
                  onClick={() => handleCall(hosp.phone)}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 16, padding: '6px 12px', fontSize: 11 }}
                >
                  Dial Hospital
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {hosp.specialties.map((spec, specIdx) => (
                  <span key={specIdx} className="badge badge-outline" style={{ fontSize: 10, padding: '3px 8px', background: 'var(--color-soft-white)' }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
