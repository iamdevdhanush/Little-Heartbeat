import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';
import { useApp } from '../../context/AppContext.js';
import { showAlert } from '../../utils/webAlert.js';

const MONTHS = [1,2,3,4,5,6,7,8,9];
const REGIONS = [
  { key: 'north_india', label: 'North India' },
  { key: 'south_india', label: 'South India' },
  { key: 'west_india', label: 'West India' },
  { key: 'east_india', label: 'East India' },
  { key: 'other', label: 'Other / General' },
];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { updateProfile } = useApp();
  const { alertProps, showAlert: showA } = useAlert();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState(null);
  const [region, setRegion] = useState(null);
  const [bp, setBp] = useState('');
  const [sugar, setSugar] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({ name, age: parseInt(age), pregnancyMonth, region, bp, sugar, createdAt: new Date().toISOString() });
    setLoading(false);
    navigate('/app/dashboard');
  };

  const handleNext = () => {
    if (!name || !age || !pregnancyMonth || !region) {
      showA('Error', 'Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(160deg, #FFF0F5 0%, #F0F7FF 100%)', padding: 20, paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))', overflowY: 'auto' }}>
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 8 }}>Step {step} of 2</div>
        <div style={{ height: 4, background: '#FFD6E5', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', background: 'var(--color-primary)', borderRadius: 2, width: step === 1 ? '50%' : '100%', transition: 'width 0.3s ease' }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
          {step === 1 ? 'Tell us about you 👋' : 'A bit more detail 💕'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {step === 1 ? 'This helps us personalize your care' : 'Optional — helps us give better advice'}
        </p>
      </div>

      <div className="card-lg">
        {step === 1 ? (
          <>
            <Input label="Your Name *" value={name} onChangeText={setName} placeholder="e.g. Priya" />
            <Input label="Your Age *" value={age} onChangeText={setAge} placeholder="e.g. 27" type="number" />

            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, marginTop: 4 }}>Pregnancy Month *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MONTHS.map(m => (
                <button
                  key={m}
                  onClick={() => setPregnancyMonth(m)}
                  style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: pregnancyMonth === m ? 'var(--color-primary)' : '#FFF0F5',
                    border: `1.5px solid ${pregnancyMonth === m ? 'var(--color-primary)' : '#FFD6E5'}`,
                    fontSize: 16, fontWeight: 600, cursor: 'pointer',
                    color: pregnancyMonth === m ? '#fff' : 'var(--color-text-secondary)',
                    fontFamily: 'inherit', transition: 'all 0.2s ease'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Your Region *</div>
            {REGIONS.map(r => (
              <button
                key={r.key}
                onClick={() => setRegion(r.key)}
                style={{
                  width: '100%', padding: 14, borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${region === r.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: region === r.key ? '#FFF0F5' : '#FFFBFD',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 15, color: region === r.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: region === r.key ? 700 : 500, transition: 'all 0.2s ease'
                }}
              >
                {r.label}
                {region === r.key && <span>✓</span>}
              </button>
            ))}

            <Button title="Next →" onPress={handleNext} style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              These are optional but help us give you better health insights.
            </p>

            <Input label="Blood Pressure" value={bp} onChangeText={setBp} placeholder="e.g. 120/80" />
            <Input label="Fasting Sugar Level (mg/dL)" value={sugar} onChangeText={setSugar} placeholder="e.g. 90" type="number" />

            <div style={{ background: '#EEF4FF', borderRadius: 'var(--radius-lg)', padding: 12, marginTop: 4, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--color-accent-dark)', lineHeight: 1.5 }}>
                🔒 Your health data is stored only on your device. We never share it.
              </p>
            </div>

            <div className="flex gap-sm">
              <Button title="← Back" onPress={() => setStep(1)} variant="secondary" style={{ flex: 1 }} />
              <Button title="Get Started 💕" onPress={handleSave} loading={loading} style={{ flex: 1.5 }} />
            </div>

            <button
              onClick={handleSave}
              style={{ background: 'none', border: 'none', width: '100%', marginTop: 12, padding: 8, fontSize: 13, color: 'var(--color-text-muted)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
            >
              Skip for now
            </button>
          </>
        )}
      </div>

      <Alert {...alertProps} />
    </div>
  );
}
