import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.js';
import { clearAll } from '../../services/storageService.js';
import Button from '../../components/common/Button.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';

const REGIONS = { north_india: 'North India', south_india: 'South India', west_india: 'West India', east_india: 'East India', other: 'Other / General' };
const BODY_CHANGES = [
  { symptom: 'Back Pain', emoji: '🔙', explanation: 'As your baby grows, your body shifts its center of gravity. This puts extra strain on your back. Mild back pain is very normal.', tips: ['Rest and avoid standing for too long', 'Use a pregnancy pillow when sleeping', 'Gentle back stretches can help', 'Warm compress on the lower back'] },
  { symptom: 'Swelling', emoji: '🦵', explanation: 'Mild swelling in feet and ankles is very common, especially after month 5. Your body holds extra fluid during pregnancy.', tips: ['Elevate your feet when sitting', 'Avoid standing for long periods', 'Drink plenty of water', 'Avoid too much salt'] },
  { symptom: 'Heartburn', emoji: '🔥', explanation: 'Pregnancy hormones relax the valve between your stomach and food pipe. This causes a burning feeling. It is uncomfortable but not harmful.', tips: ['Eat smaller meals more often', 'Avoid lying down right after eating', 'Avoid spicy or oily foods', 'Sleep with head slightly raised'] },
  { symptom: 'Nausea', emoji: '🤢', explanation: 'Nausea is caused by rising pregnancy hormones. It usually improves after month 3. It is a sign your pregnancy is going well!', tips: ['Eat small meals every 2-3 hours', 'Ginger tea or ginger biscuits help', 'Avoid strong smells', 'Keep crackers nearby'] },
];

export default function ProfilePage() {
  const { profile, language, setLanguage } = useApp();
  const navigate = useNavigate();
  const { alertProps, showAlert } = useAlert();
  const [expandedSymptom, setExpandedSymptom] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await clearAll();
    navigate('/');
  };

  const month = profile?.pregnancyMonth || 5;

  return (
    <div>
      {/* Profile Header */}
      <div style={{ background: 'linear-gradient(135deg, #FFE4EE, #E8F4FF)', padding: 24, textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 12px', boxShadow: 'var(--shadow-md)', border: '2px solid #FFD6E5', fontWeight: 700, color: 'var(--color-primary)' }}>
          {profile?.name?.[0]?.toUpperCase() || '💕'}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>{profile?.name || 'Mama'}</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Age {profile?.age || '--'} • Month {month} • {REGIONS[profile?.region] || 'General'}
        </p>
        <button onClick={() => navigate('/setup')} style={{ marginTop: 10, padding: '7px 16px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✏️ Edit Profile
        </button>
      </div>

      <div className="scroll-area">
        {/* Pregnancy Progress */}
        <div className="card shadow-sm">
          <div className="section-title">🤰 Pregnancy Progress</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 10 }}>
            {[1,2,3,4,5,6,7,8,9].map(m => (
              <div key={m} style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                background: m === month ? 'var(--color-primary)' : m < month ? '#FFD6E5' : '#F5F5F5',
                border: `1.5px solid ${m === month ? 'var(--color-primary-dark)' : m < month ? '#FFB3CC' : '#E0E0E0'}`,
                color: m <= month ? (m === month ? '#fff' : 'var(--color-primary-dark)') : 'var(--color-text-muted)',
                transition: 'all 0.2s ease'
              }}>
                {m}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>You are in month {month} of your pregnancy 💕</p>
        </div>

        {/* Health Stats */}
        {(profile?.bp || profile?.sugar) && (
          <div className="card shadow-sm">
            <div className="section-title">📋 Health Stats</div>
            <div className="flex gap-md" style={{ marginTop: 4 }}>
              {profile?.bp && (
                <div style={{ flex: 1, textAlign: 'center', background: '#FFF5F8', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🩺</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{profile.bp}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Blood Pressure</div>
                </div>
              )}
              {profile?.sugar && (
                <div style={{ flex: 1, textAlign: 'center', background: '#FFF5F8', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🍬</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{profile.sugar} mg/dL</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Sugar Level</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Body Changes */}
        <div className="card shadow-sm">
          <div className="section-title">🧘 Body Changes Explained</div>
          <p className="section-subtitle">Tap any symptom to learn more</p>
          {BODY_CHANGES.map((item, i) => (
            <div key={i}>
              <button onClick={() => setExpandedSymptom(expandedSymptom === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 10 }}>
                <span style={{ fontSize: 20, width: 30 }}>{item.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{item.symptom}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{expandedSymptom === i ? '▲' : '▼'}</span>
              </button>
              {expandedSymptom === i && (
                <div style={{ background: '#FFF8FA', borderRadius: 'var(--radius-lg)', padding: 12, margin: '4px 0 8px' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{item.explanation}</p>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>What helps:</div>
                  {item.tips.map((tip, ti) => (
                    <div key={ti} className="flex items-start gap-sm" style={{ marginBottom: 3 }}>
                      <span style={{ color: 'var(--color-primary)' }}>•</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="card shadow-sm">
          <div className="section-title">⚙️ Settings</div>
          {[
            { label: '🔔 Notifications', desc: 'Manage reminders and alerts', path: '/app/notifications' },
            { label: '👨‍👩‍👧 Family Dashboard', desc: 'Share with partner or family', path: '/app/family' },
          ].map((s, i) => (
            <button key={i} onClick={() => navigate(s.path)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: i > 0 ? 8 : 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{s.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.desc}</div>
              </div>
              <span style={{ fontSize: 16, color: 'var(--color-text-muted)' }}>→</span>
            </button>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 8, borderTop: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Language</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{language === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'}</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={language === 'hi'} onChange={() => setLanguage(language === 'en' ? 'hi' : 'en')} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* About */}
        <div className="card shadow-sm">
          <div className="section-title">💗 About Little Heartbeat</div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Little Heartbeat is your caring AI pregnancy companion. We provide general health insights and support — but we are NOT a replacement for medical care.
            <br /><br />
            Always consult your doctor or midwife for proper medical advice.
          </p>
          <span style={{ display: 'inline-block', background: '#F0F7FF', borderRadius: 'var(--radius-full)', padding: '4px 10px', fontSize: 12, color: 'var(--color-accent-dark)', marginTop: 8 }}>
            Version 2.0.0 (PWA)
          </span>
        </div>

        <Button title="Log Out" onPress={() => setShowLogoutConfirm(true)} variant="secondary" style={{ marginTop: 4 }} />
      </div>

      <Alert
        visible={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to log out? Your data will remain saved."
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowLogoutConfirm(false) },
          { text: 'Log Out', style: 'destructive', onPress: handleLogout },
        ]}
        onDismiss={() => setShowLogoutConfirm(false)}
      />
      <Alert {...alertProps} />
    </div>
  );
}
