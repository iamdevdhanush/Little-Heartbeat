import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { analyzeHealthForm } from '../../services/aiService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import Alert, { useAlert } from '../../components/common/Alert.jsx';

const SYMPTOMS = [
  { key: 'severe_headache', label: 'Severe Headache', emoji: '🤕' },
  { key: 'mild_headache', label: 'Mild Headache', emoji: '😔' },
  { key: 'blurred_vision', label: 'Blurred Vision', emoji: '👁' },
  { key: 'vomiting', label: 'Vomiting', emoji: '🤢' },
  { key: 'spotting', label: 'Light Spotting', emoji: '🩸' },
  { key: 'severe_cramps', label: 'Severe Cramps', emoji: '😣' },
  { key: 'swollen_feet', label: 'Swollen Feet', emoji: '🦵' },
  { key: 'difficulty_breathing', label: 'Difficulty Breathing', emoji: '😮‍💨' },
  { key: 'fever', label: 'Fever', emoji: '🌡️' },
  { key: 'chest_pain', label: 'Chest Pain', emoji: '💔' },
  { key: 'no_movement', label: 'No Baby Movement', emoji: '👶' },
  { key: 'fainting', label: 'Dizziness/Fainting', emoji: '💫' },
];

export default function RiskAnalysisPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { alertProps, showAlert } = useAlert();

  const [systolic, setSystolic] = useState(user?.bp?.split('/')[0] || '');
  const [diastolic, setDiastolic] = useState(user?.bp?.split('/')[1] || '');
  const [sugarFasting, setSugarFasting] = useState(user?.sugar || '');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmergencyPrompt, setShowEmergencyPrompt] = useState(false);

  const toggleSymptom = (key) => setSelectedSymptoms(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeHealthForm({ systolic, diastolic, sugarFasting, symptoms: selectedSymptoms });
      setResult(analysis);
      if (analysis.risk === 'High') setShowEmergencyPrompt(true);
    } catch (error) {
      showAlert('Error', 'Unable to analyze. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = () => { setResult(null); setSelectedSymptoms([]); setSystolic(''); setDiastolic(''); setSugarFasting(''); };

  const riskGradient = result?.risk === 'High' ? 'linear-gradient(135deg, #FFEBEE, #FFCDD2)' :
    result?.risk === 'Medium' ? 'linear-gradient(135deg, #FEF6E7, #FFF3CD)' : 'linear-gradient(135deg, #E8F8F2, #C8F0E2)';

  return (
    <div>
      <div style={{ background: 'linear-gradient(to right, #EEF4FF, #FFF0F5)', padding: '16px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>📊 Health Check</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>Let's see how you're doing today</p>
      </div>

      <div className="scroll-area">
        {!result ? (
          <>
            <div className="card shadow-sm">
              <div className="section-title">🩺 Blood Pressure</div>
              <p className="section-subtitle">Optional — enter if you have a reading</p>
              <div className="flex items-start gap-md">
                <div style={{ flex: 1 }}>
                  <Input label="Systolic (Upper)" value={systolic} onChangeText={setSystolic} placeholder="e.g. 120" type="number" />
                </div>
                <span style={{ fontSize: 24, color: 'var(--color-text-muted)', fontWeight: 700, marginTop: 28 }}>/</span>
                <div style={{ flex: 1 }}>
                  <Input label="Diastolic (Lower)" value={diastolic} onChangeText={setDiastolic} placeholder="e.g. 80" type="number" />
                </div>
              </div>
              <div style={{ background: '#F8F8FF', borderRadius: 'var(--radius-lg)', padding: 12, marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Normal ranges in pregnancy:</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>✅ Normal: below 120/80<br/>⚠️ Monitor: 120–140 / 80–90<br/>🚨 High risk: above 140/90</div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="section-title">🍬 Blood Sugar</div>
              <p className="section-subtitle">Fasting sugar level (optional)</p>
              <Input label="Fasting Sugar (mg/dL)" value={sugarFasting} onChangeText={setSugarFasting} placeholder="e.g. 90" type="number" />
              <div style={{ background: '#F8F8FF', borderRadius: 'var(--radius-lg)', padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Normal ranges in pregnancy:</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>✅ Normal: below 95 mg/dL<br/>⚠️ Monitor: 95–125 mg/dL<br/>🚨 High: above 126 mg/dL</div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="section-title">🩹 Current Symptoms</div>
              <p className="section-subtitle">Select all that apply today</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {SYMPTOMS.map(s => {
                  const active = selectedSymptoms.includes(s.key);
                  return (
                    <button
                      key={s.key}
                      onClick={() => toggleSymptom(s.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 12px', borderRadius: 'var(--radius-full)',
                        background: active ? '#FFF0F5' : '#F5F5F5',
                        border: `1.5px solid ${active ? 'var(--color-primary)' : '#E0E0E0'}`,
                        cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontWeight: active ? 700 : 500, transition: 'all 0.15s ease',
                      }}
                    >
                      {s.emoji} {s.label} {active && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button title="Analyze My Health 🔍" onPress={handleAnalyze} loading={loading} />

            <div style={{ background: '#F0F7FF', borderRadius: 'var(--radius-lg)', padding: 12, border: '1px solid #D6E8FF' }}>
              <p style={{ fontSize: 12, color: 'var(--color-accent-dark)', lineHeight: 1.6 }}>⚕️ This tool provides general guidance only. It is NOT a medical diagnosis. Always consult your doctor.</p>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: riskGradient, borderRadius: 'var(--radius-2xl)', padding: 24, textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{result.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>Your Health Report</div>
              <RiskBadge risk={result.risk} />
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 12, lineHeight: 1.5 }}>{result.overallMessage}</p>
            </div>

            {result.reasons?.length > 0 && (
              <div className="card shadow-sm">
                <div className="section-title">🔍 What We Found</div>
                {result.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-sm" style={{ marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>•</span>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.5 }}>{reason}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="card shadow-sm">
              <div className="section-title">✅ What To Do Now</div>
              {result.steps?.map((step, i) => (
                <div key={i} className="flex items-start gap-md" style={{ marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.5, marginTop: 3 }}>{step}</p>
                </div>
              ))}
            </div>

            {result.risk === 'High' && (
              <button onClick={() => navigate('/app/emergency')} style={{ width: '100%', background: 'var(--color-emergency)', borderRadius: 'var(--radius-xl)', padding: 16, border: 'none', cursor: 'pointer', color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: 'inherit' }}>
                🚨 Get Emergency Help Now
              </button>
            )}

            <div style={{ background: '#F0F7FF', borderRadius: 'var(--radius-lg)', padding: 12, border: '1px solid #D6E8FF' }}>
              <p style={{ fontSize: 12, color: 'var(--color-accent-dark)', lineHeight: 1.6 }}>⚕️ This is NOT a medical diagnosis. Always consult your doctor or midwife.</p>
            </div>

            <Button title="Check Again" onPress={handleReset} variant="secondary" />
          </>
        )}
      </div>

      <Alert
        visible={showEmergencyPrompt}
        title="🚨 High Risk Detected"
        message="Your symptoms indicate you should seek immediate medical attention."
        buttons={[
          { text: 'Get Emergency Help', onPress: () => { setShowEmergencyPrompt(false); navigate('/app/emergency'); } },
          { text: "I'll Monitor", style: 'cancel', onPress: () => setShowEmergencyPrompt(false) },
        ]}
        onDismiss={() => setShowEmergencyPrompt(false)}
      />
      <Alert {...alertProps} />
    </div>
  );
}
