import React, { useState, useEffect } from 'react';
import HeaderBar from '../../components/common/HeaderBar.jsx';
import { getNotificationSettings, updateNotificationSettings, registerForPushNotificationsAsync } from '../../services/notificationService.js';

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [permission, setPermission] = useState(Notification.permission || 'default');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getNotificationSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const handleRequestPermission = async () => {
    const result = await registerForPushNotificationsAsync();
    setPermission(Notification.permission);
  };

  const handleToggle = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await updateNotificationSettings({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><span className="spinner spinner-pink" /></div>;

  const ToggleRow = ({ label, desc, settingKey }) => (
    <div className="flex justify-between items-center" style={{ paddingTop: 14, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={settings[settingKey] || false} onChange={e => handleToggle(settingKey, e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );

  return (
    <div>
      <HeaderBar title="Notifications" emoji="🔔" subtitle="Manage reminders and alerts" />
      <div className="scroll-area">
        {/* Permission */}
        {permission !== 'granted' && (
          <div style={{ background: '#FEF6E7', borderRadius: 'var(--radius-xl)', padding: 16, border: '1px solid #F5A623' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#E65100', marginBottom: 8 }}>⚠️ Notifications Disabled</div>
            <p style={{ fontSize: 13, color: '#E65100', marginBottom: 12, lineHeight: 1.5 }}>
              Enable browser notifications to receive health reminders and emergency alerts.
            </p>
            <button onClick={handleRequestPermission} style={{ padding: '10px 16px', background: 'var(--color-warning)', border: 'none', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Enable Notifications
            </button>
          </div>
        )}

        {permission === 'granted' && (
          <div style={{ background: 'var(--color-risk-low-bg)', borderRadius: 'var(--radius-xl)', padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ fontSize: 14, color: 'var(--color-risk-low)', fontWeight: 600 }}>Notifications are enabled!</span>
          </div>
        )}

        {saved && (
          <div style={{ background: 'var(--color-risk-low-bg)', borderRadius: 'var(--radius-lg)', padding: 12, textAlign: 'center', fontSize: 14, color: 'var(--color-risk-low)', fontWeight: 600 }}>
            ✅ Settings saved!
          </div>
        )}

        {/* Toggles */}
        <div className="card shadow-sm">
          <div className="section-title">Daily Reminders</div>
          <ToggleRow label="Daily Health Check" desc="Morning reminder to log symptoms" settingKey="dailyReminder" />
          <ToggleRow label="Weekly Check-up Reminder" desc="Weekly prenatal appointment reminder" settingKey="weeklyReminder" />
        </div>

        <div className="card shadow-sm">
          <div className="section-title">Medical Alerts</div>
          <ToggleRow label="High Risk Alerts" desc="Immediate alerts when AI detects risk" settingKey="highRiskAlerts" />
          <ToggleRow label="Check-up Reminders" desc="Based on your pregnancy stage" settingKey="checkupReminder" />
          <ToggleRow label="Medication Reminders" desc="Prenatal vitamin reminders" settingKey="medicationReminder" />
        </div>

        {/* Info */}
        <div style={{ background: '#EEF4FF', borderRadius: 'var(--radius-xl)', padding: 16, border: '1px solid #D6E8FF' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: 8 }}>💡 About Notifications</div>
          <p style={{ fontSize: 13, color: 'var(--color-accent-dark)', lineHeight: 1.6 }}>
            Reminders use your browser's built-in notification system. For notifications to work when the app is closed, ensure the app is installed as a PWA and notifications are allowed in your browser settings.
          </p>
        </div>
      </div>
    </div>
  );
}
