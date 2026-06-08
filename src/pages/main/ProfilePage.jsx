import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import databaseService from '../../services/databaseService.js';
import { clearAll } from '../../services/storageService.js';
import Button from '../../components/common/Button.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';

const REGIONS = { north_india: 'North India', south_india: 'South India', west_india: 'West India', east_india: 'East India', other: 'Other / General' };

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { pregnancy, week, trimester, loading: pregLoading } = usePregnancy(user?.id);
  const navigate = useNavigate();
  const { alertProps, showAlert } = useAlert();
  const [expandedSymptom, setExpandedSymptom] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [bodyChanges, setBodyChanges] = useState([]);

  useEffect(() => {
    databaseService.getBodyChanges().then(setBodyChanges);
  }, []);

  const handleLogout = async () => {
    await clearAll();
    navigate('/');
  };

  const isLoading = userLoading || pregLoading;

  if (isLoading) {
    return (
      <div className="screen" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
        <p className="text-secondary" style={{ fontSize: 14 }}>Loading profile...</p>
      </div>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() || '💕';
  const month = pregnancy ? Math.ceil(week / 4) : null;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #FFE4EE, #E8F4FF)', padding: 24, textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 12px', boxShadow: 'var(--shadow-md)', border: '2px solid #FFD6E5', fontWeight: 700, color: 'var(--color-primary)' }}>
          {initial}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>{user?.name || 'Mama'}</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {user?.age ? `Age ${user.age}` : ''}{user?.age && month ? ' · ' : ''}{month ? `Month ${month}` : ''}{month && user?.region ? ' · ' : ''}{REGIONS[user?.region] || ''}
        </p>
        <button onClick={() => navigate('/setup')} style={{ marginTop: 10, padding: '7px 16px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✏️ Edit Profile
        </button>
      </div>

      <div className="scroll-area">
        {pregnancy && (
          <div className="card shadow-sm">
            <div className="section-title">🤰 Pregnancy Progress</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 10 }}>
              {[1,2,3,4,5,6,7,8,9].map(m => (
                <div key={m} style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
                  background: m === month ? 'var(--color-primary)' : m < month ? '#FFD6E5' : '#F5F5F5',
                  border: `1.5px solid ${m === month ? 'var(--color-primary-dark)' : m < month ? '#FFB3CC' : '#E0E0E0'}`,
                  color: m <= month ? (m === month ? '#fff' : 'var(--color-primary-dark)') : 'var(--color-text-muted)',
                  transition: 'all 0.2s ease',
                }}>
                  {m}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              You are in {trimester === 1 ? 'First' : trimester === 2 ? 'Second' : 'Third'} Trimester  ·  Week {week}  ·  Month {month} 💕
            </p>
          </div>
        )}

        {(user?.bp || user?.sugar) && (
          <div className="card shadow-sm">
            <div className="section-title">📋 Health Stats</div>
            <div className="flex gap-md" style={{ marginTop: 4 }}>
              {user?.bp && (
                <div style={{ flex: 1, textAlign: 'center', background: '#FFF5F8', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🩺</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{user.bp}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Blood Pressure</div>
                </div>
              )}
              {user?.sugar && (
                <div style={{ flex: 1, textAlign: 'center', background: '#FFF5F8', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🍬</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{user.sugar} mg/dL</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Sugar Level</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="section-title">🧘 Body Changes Explained</div>
          <p className="section-subtitle">Tap any symptom to learn more</p>
          {bodyChanges.length > 0 ? bodyChanges.map((item, i) => (
            <div key={item.id || i}>
              <button onClick={() => setExpandedSymptom(expandedSymptom === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 10 }}>
                <span style={{ fontSize: 20, width: 30 }}>{item.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{item.symptom || item.title}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{expandedSymptom === i ? '▲' : '▼'}</span>
              </button>
              {expandedSymptom === i && (
                <div style={{ background: '#FFF8FA', borderRadius: 'var(--radius-lg)', padding: 12, margin: '4px 0 8px' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{item.explanation}</p>
                  {item.tips?.length > 0 && (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>What helps:</div>
                      {item.tips.map((tip, ti) => (
                        <div key={ti} className="flex items-start gap-sm" style={{ marginBottom: 3 }}>
                          <span style={{ color: 'var(--color-primary)' }}>•</span>
                          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.5 }}>{tip}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {item.when_to_worry && (
                    <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 8 }}>
                      ⚠️ {item.when_to_worry}
                    </p>
                  )}
                </div>
              )}
            </div>
          )) : (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
              Loading body change information...
            </p>
          )}
        </div>

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
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>English</div>
            </div>
          </div>
        </div>

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
