import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import databaseService from '../../services/databaseService.js';

export default function ProfilePage() {
  const { user, update: updateUser } = useUser();
  const { pregnancy, update: updatePregnancy, week, daysUntilDue } = usePregnancy(user?.id);

  // Profile fields state
  const [motherName, setMotherName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [pregnancyNumber, setPregnancyNumber] = useState('1');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [partnerStatus, setPartnerStatus] = useState('Not Invited');

  // Load initial values from DB/localstorage
  useEffect(() => {
    if (user) {
      setMotherName(user.name || user.display_name || '');
      setHeight(user.height_cm || '');
      setWeight(user.weight_kg || '');
      setAge(user.age || '');
      setEmergencyName(user.emergency_contact_name || '');
      setEmergencyPhone(user.emergency_contact_phone || '');
    }
    if (pregnancy) {
      setDueDate(pregnancy.due_date ? pregnancy.due_date.substring(0, 10) : '');
      setPregnancyNumber(pregnancy.notes || '1'); // Storing number in notes or default
    }
  }, [user, pregnancy]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Update user profile details
      await updateUser({
        name: motherName,
        height_cm: height ? parseFloat(height) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        age: age ? parseInt(age) : null,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone
      });

      // 2. Update pregnancy details
      if (dueDate) {
        await updatePregnancy({
          due_date: dueDate,
          notes: pregnancyNumber // using notes for pregnancy number representation
        });
      }
      setIsEditing(false);
      alert("Profile updated successfully, Mama!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvitePartner = (e) => {
    e.preventDefault();
    if (!partnerEmail.trim()) return;
    setPartnerStatus("Pending Invitation");
    alert(`Invitation sent to ${partnerEmail}! They can now access your shared pregnancy timeline.`);
    setPartnerEmail('');
  };

  return (
    <div className="screen" style={{ paddingBottom: 110, background: 'var(--color-warm-ivory)' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 24 }}>
        <p className="serif-label">My Account</p>
        <h1 className="serif-display" style={{ fontSize: 32, color: 'var(--color-text-primary)', marginTop: 4 }}>
          Pregnancy Profile
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Manage your pregnancy information and companion settings
        </p>
      </div>

      {/* Main card view */}
      {!isEditing ? (
        <div className="flex flex-col gap-4 animate-fade-in-up delay-1">
          {/* Fetus details panel */}
          <div className="card" style={{ padding: 20, background: 'white' }}>
            <h3 className="serif-title" style={{ fontSize: 20, color: 'var(--color-primary)', marginBottom: 12 }}>
              Pregnancy Journey Stats
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Week</span>
                <p style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>Week {week || '--'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Days to Due Date</span>
                <p style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{daysUntilDue || '--'} Days</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Due Date</span>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{dueDate || 'Not set'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pregnancy No.</span>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{pregnancyNumber || '1'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary w-full"
              style={{ marginTop: 20 }}
            >
              Edit Pregnancy Profile
            </button>
          </div>

          {/* Mother Bio details */}
          <div className="card" style={{ padding: 20, background: 'white' }}>
            <h3 className="serif-title" style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 14 }}>
              Mother's Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Mother's Name</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{motherName || 'Mama'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Age</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{age ? `${age} years` : '--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Height</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{height ? `${height} cm` : '--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Weight</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{weight ? `${weight} kg` : '--'}</span>
              </div>
            </div>
          </div>

          {/* Emergency SOS details */}
          <div className="card" style={{ padding: 20, background: 'white' }}>
            <h3 className="serif-title" style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 14 }}>
              Emergency Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Emergency Contact Name</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{emergencyName || 'Not Set'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Emergency Contact Phone</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{emergencyPhone || 'Not Set'}</span>
              </div>
            </div>
          </div>

          {/* Partner Mode panel */}
          <div className="card" style={{ padding: 20, background: 'white' }}>
            <h3 className="serif-title" style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              Partner Mode
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              Share updates, sync timelines, and plan appointments together.
            </p>
            {partnerStatus === 'Not Invited' ? (
              <form onSubmit={handleInvitePartner} style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="Partner's Email Address"
                  className="input"
                  style={{ height: 44, padding: '0 12px', fontSize: 13 }}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">Invite</button>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-tint)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Invitation Status</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Waiting for partner validation</p>
                </div>
                <span className="badge badge-warning">{partnerStatus}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-4 animate-fade-in-up">
          <div className="card" style={{ padding: 20, background: 'white', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 className="serif-title" style={{ fontSize: 20, color: 'var(--color-text-primary)' }}>
              Edit Profile details
            </h3>

            {/* Mother Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Mother's Name</label>
              <input 
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Due Date & Pregnancy No */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Due Date</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Pregnancy Number</label>
                <select 
                  value={pregnancyNumber}
                  onChange={(e) => setPregnancyNumber(e.target.value)}
                  className="input"
                >
                  <option value="1">1st Pregnancy</option>
                  <option value="2">2nd Pregnancy</option>
                  <option value="3">3rd Pregnancy</option>
                  <option value="4+">4th or more</option>
                </select>
              </div>
            </div>

            {/* Age, Height, Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Age (years)</label>
                <input 
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input"
                  placeholder="Age"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Height (cm)</label>
                <input 
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input"
                  placeholder="Height"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Weight (kg)</label>
                <input 
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input"
                  placeholder="Weight"
                />
              </div>
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />
            <h4 className="label" style={{ color: 'var(--color-primary)' }}>Emergency Settings</h4>

            {/* Emergency Contact Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Emergency Contact Name</label>
              <input 
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="input"
                placeholder="e.g. Spouse, Mother"
                required
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Emergency Contact Phone</label>
              <input 
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="input"
                placeholder="e.g. +91 99999 99999"
                required
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary flex-1"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex-1"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
