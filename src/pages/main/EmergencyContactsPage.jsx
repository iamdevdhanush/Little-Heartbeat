import React, { useState, useEffect } from 'react';
import HeaderBar from '../../components/common/HeaderBar.jsx';
import Button from '../../components/common/Button.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';
import { getEmergencyContacts, saveEmergencyContacts } from '../../services/sosService.js';

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const { alertProps, showAlert } = useAlert();
  const [confirmRemove, setConfirmRemove] = useState(null);

  useEffect(() => {
    getEmergencyContacts().then(c => { setContacts(c); setLoading(false); });
  }, []);

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) { showAlert('Missing Info', 'Please enter both name and phone number.'); return; }
    if (!/^[+]?[\d\s-]{10,}$/.test(phone.trim())) { showAlert('Invalid Phone', 'Please enter a valid phone number.'); return; }
    const newContact = { id: Date.now().toString(), name: name.trim(), phone: phone.trim(), isPrimary: contacts.length === 0 };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveEmergencyContacts(updated);
    setName(''); setPhone('');
    showAlert('Added! ✅', `${newContact.name} has been added to your emergency contacts.`);
  };

  const handleRemove = (contactId) => {
    const updated = contacts.filter(c => c.id !== contactId);
    if (updated.length > 0 && !updated[0].isPrimary) updated[0].isPrimary = true;
    setContacts(updated);
    saveEmergencyContacts(updated);
    setConfirmRemove(null);
  };

  const handleSetPrimary = (contactId) => {
    const updated = contacts.map(c => ({ ...c, isPrimary: c.id === contactId }));
    setContacts(updated);
    saveEmergencyContacts(updated);
  };

  return (
    <div>
      <HeaderBar title="Emergency Contacts" emoji="🚨" subtitle="These contacts will receive your location in emergencies" />
      <div className="scroll-area">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner spinner-pink" /></div>
        ) : contacts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Emergency Contacts</div>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Add contacts who will be notified during an emergency. They will receive your location via WhatsApp.
            </p>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="section-title">Your Emergency Contacts</div>
            {contacts.map((contact) => (
              <div key={contact.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--color-border)', marginBottom: 12 }}>
                <div className="flex items-center gap-sm">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-sm">
                      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>{contact.name}</span>
                      {contact.isPrimary && (
                        <span style={{ background: 'var(--color-risk-low-bg)', color: 'var(--color-risk-low)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>PRIMARY</span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 2 }}>{contact.phone}</div>
                  </div>
                </div>
                <div className="flex gap-sm" style={{ marginTop: 8 }}>
                  {!contact.isPrimary && (
                    <button onClick={() => handleSetPrimary(contact.id)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: '#F0F7FF', border: 'none', fontSize: 12, color: 'var(--color-accent)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Set Primary
                    </button>
                  )}
                  <button onClick={() => setConfirmRemove(contact.id)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-risk-high-bg)', border: 'none', fontSize: 12, color: 'var(--color-risk-high)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add manually */}
        <div className="card shadow-sm">
          <div className="section-title">Add Contact</div>
          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Husband / Mom" />
          </div>
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
          </div>
          <Button title="Add Contact" onPress={handleAdd} style={{ marginTop: 8 }} />
        </div>

        {/* How it works */}
        <div style={{ background: '#F0F7FF', borderRadius: 'var(--radius-xl)', padding: 16, border: '1px solid #D6E8FF' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent-dark)', marginBottom: 8 }}>💡 How it works</div>
          <p style={{ fontSize: 13, color: 'var(--color-accent-dark)', marginBottom: 8 }}>When you tap the SOS button, Little Heartbeat will:</p>
          {['📍 Get your current GPS location', '📱 Open WhatsApp with a pre-filled emergency message', '🗺️ Include a Google Maps link to your location', '⚠️ Alert your contacts to come help'].map((item, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--color-accent-dark)', marginBottom: 4 }}>{item}</div>
          ))}
        </div>
      </div>

      <Alert
        visible={!!confirmRemove}
        title="Remove Contact"
        message="Are you sure you want to remove this emergency contact?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setConfirmRemove(null) },
          { text: 'Remove', style: 'destructive', onPress: () => handleRemove(confirmRemove) },
        ]}
        onDismiss={() => setConfirmRemove(null)}
      />
      <Alert {...alertProps} />
    </div>
  );
}
