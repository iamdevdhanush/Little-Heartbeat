import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.js';
import { triggerSOS, getCurrentLocation, getEmergencyContacts } from '../../services/sosService.js';
import Alert, { useAlert } from '../../components/common/Alert.jsx';

const EMERGENCY_NUMBERS = [
  { name: 'Emergency Ambulance', number: '108', emoji: '🚑', color: 'linear-gradient(135deg, #E53935, #C62828)' },
  { name: 'Police', number: '100', emoji: '👮', color: 'linear-gradient(135deg, #1565C0, #0D47A1)' },
  { name: 'Women Helpline', number: '181', emoji: '👩', color: 'linear-gradient(135deg, #E8517A, #C73D65)' },
];

const WARNING_SIGNS = [
  { emoji: '🩸', text: 'Heavy vaginal bleeding' },
  { emoji: '🤕', text: 'Severe persistent headache' },
  { emoji: '👁️', text: 'Blurred vision or seeing spots' },
  { emoji: '😮‍💨', text: 'Difficulty breathing' },
  { emoji: '💔', text: 'Chest pain' },
  { emoji: '🤢', text: "Severe vomiting that won't stop" },
  { emoji: '🌡️', text: 'Fever above 38.5°C' },
  { emoji: '👶', text: 'Baby not moving for 2+ hours' },
  { emoji: '💧', text: 'Water breaks' },
  { emoji: '😵', text: 'Fainting or dizziness' },
];

export default function EmergencyPage() {
  const { profile } = useApp();
  const navigate = useNavigate();
  const { alertProps, showAlert } = useAlert();
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  useEffect(() => {
    getEmergencyContacts().then(setEmergencyContacts);
  }, []);

  const handleSOS = async () => {
    setSosLoading(true);
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    try {
      const result = await triggerSOS(profile, { riskLevel: 'High', includeLocation: true });
      setSosSent(true);
      if (result.success) {
        showAlert('✅ SOS Sent!', 'WhatsApp has been opened with your emergency message and location. Please send it to your contacts.', [{ text: 'OK' }]);
      }
    } catch (error) {
      showAlert('Error', 'Could not send SOS. Try calling emergency services directly.');
    }
    setSosLoading(false);
  };

  const handleCall = (number, name) => {
    showAlert(`Call ${name}?`, `You are about to call ${number}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Call ${number}`, style: 'destructive', onPress: () => window.open(`tel:${number}`) },
    ]);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-emergency" style={{ padding: '20px 20px 16px', paddingTop: 'calc(20px + env(safe-area-inset-top,0px))', textAlign: 'center', borderBottom: '1px solid #FFB3B3' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFCDD2', border: '2px solid #EF9A9A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 8px' }}>🚨</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#B71C1C' }}>Emergency Help</h1>
        <p style={{ fontSize: 13, color: '#E57373', marginTop: 2 }}>Stay calm. Help is available.</p>
      </div>

      <div className="scroll-area">
        {/* SOS Button */}
        <button className={`sos-button ${sosSent ? 'sent' : ''}`} onClick={handleSOS} disabled={sosLoading}>
          {!sosSent && !sosLoading && <div className="sos-ring" />}
          {sosLoading ? (
            <span className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
          ) : (
            <>
              <span className="sos-emoji">{sosSent ? '✅' : '🆘'}</span>
              <span className="sos-title">{sosSent ? 'SOS SENT!' : 'TAP FOR SOS'}</span>
              <span className="sos-sub">{sosSent ? 'Your contacts have been notified via WhatsApp' : 'Opens WhatsApp with your location'}</span>
              {emergencyContacts.length > 0 && !sosSent && (
                <span className="sos-contacts">Will notify: {emergencyContacts.map(c => c.name).join(', ')}</span>
              )}
            </>
          )}
        </button>

        {!sosSent && emergencyContacts.length === 0 && (
          <button onClick={() => navigate('/app/contacts')} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 16, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 32 }}>📱</span>
            <div className="flex-1">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Set up Emergency Contacts</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>Add contacts who will receive your location during an emergency</div>
            </div>
            <span style={{ fontSize: 20, color: 'var(--color-primary)', fontWeight: 700 }}>→</span>
          </button>
        )}

        {sosSent && (
          <button onClick={() => setSosSent(false)} style={{ textAlign: 'center', width: '100%', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 12, cursor: 'pointer', fontSize: 14, color: 'var(--color-text-muted)', fontFamily: 'inherit' }}>
            Tap to send SOS again if needed
          </button>
        )}

        {/* Emergency Numbers */}
        <div>
          <div className="section-title">📞 Emergency Numbers</div>
          <p className="section-subtitle">Tap to call immediately</p>
          {EMERGENCY_NUMBERS.map((c, i) => (
            <button key={i} onClick={() => handleCall(c.number, c.name)} style={{ width: '100%', background: c.color, borderRadius: 'var(--radius-xl)', padding: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, boxShadow: 'var(--shadow-md)' }}>
              <span style={{ fontSize: 28 }}>{c.emoji}</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{c.name}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{c.number}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 'var(--radius-full)', padding: '6px 12px' }}>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Call Now →</span>
              </div>
            </button>
          ))}
        </div>

        {/* Warning Signs */}
        <div>
          <div className="section-title">🚨 Go to Hospital if you have:</div>
          <p className="section-subtitle">Do not wait — these need immediate care</p>
          <div className="warning-card">
            {WARNING_SIGNS.map((sign, i) => (
              <div key={i} className="warning-row">
                <span className="warning-emoji">{sign.emoji}</span>
                <span className="warning-text">{sign.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calm Card */}
        <div className="bg-gradient-blue" style={{ borderRadius: 'var(--radius-xl)', padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: 8 }}>💙 Stay Calm, Mama</div>
          <p style={{ fontSize: 14, color: '#2D4A6E', lineHeight: 1.7 }}>
            Take slow, deep breaths.<br/>
            Breathe in for 4 counts, hold for 4, out for 4.<br/><br/>
            You are strong. Help is on the way.
          </p>
        </div>

        {/* Actions */}
        <button onClick={() => navigate('/app/contacts')} style={{ width: '100%', background: 'none', border: 'none', padding: 12, fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ⚙️ Manage Emergency Contacts
        </button>
        <button onClick={() => navigate('/app/hospitals')} style={{ width: '100%', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius-xl)', padding: 16, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          🏥 Find Nearby Hospitals
        </button>
      </div>

      <Alert {...alertProps} />
    </div>
  );
}
