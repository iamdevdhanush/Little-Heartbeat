import React, { useState } from 'react';

export default function DashboardPage() {
  // ── Client-Side Interactive States ──
  const [medsTaken, setMedsTaken] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [selectedMood, setSelectedMood] = useState('calm');
  const [loggedSymptoms, setLoggedSymptoms] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null); // null | 'uploading' | 'success'
  const [showInsightDetail, setShowInsightDetail] = useState(false);

  // Constants for Week 28
  const babyLength = '37.6 cm';
  const babyWeight = '1.1 kg';
  const babySizeEmoji = '🍆';
  const babySizeLabel = 'Eggplant';

  const moods = [
    { id: 'calm', label: 'Calm', emoji: '😌' },
    { id: 'excited', label: 'Excited', emoji: '✨' },
    { id: 'tired', label: 'Tired', emoji: '😴' },
    { id: 'anxious', label: 'Anxious', emoji: '🥺' },
  ];

  const symptomsList = ['Backache', 'Fatigue', 'Braxton Hicks', 'Mild Heartburn', 'Swelling'];

  const toggleSymptom = (symptom) => {
    if (loggedSymptoms.includes(symptom)) {
      setLoggedSymptoms(loggedSymptoms.filter((s) => s !== symptom));
    } else {
      setLoggedSymptoms([...loggedSymptoms, symptom]);
    }
  };

  const handlePrescriptionUpload = () => {
    setUploadProgress('uploading');
    setTimeout(() => {
      setUploadProgress('success');
    }, 2000);
  };

  return (
    <div className="screen animate-fade-in" style={{ padding: '16px 20px', maxWidth: '100%', margin: '0 auto' }}>
      
      {/* ── Top Header & Greeting ── */}
      <header className="flex items-center justify-between mb-5" style={{ marginTop: '8px' }}>
        <div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            color: 'var(--color-primary)',
            background: 'var(--color-primary-tint)',
            padding: '4px 8px',
            borderRadius: '99px',
            display: 'inline-block',
            marginBottom: '6px'
          }}>
            Third Trimester • Week 28
          </span>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            color: 'var(--color-text-primary)', 
            lineHeight: 1.1 
          }}>
            Good Morning, Priya 🌤️
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--color-surface-tint)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'var(--color-danger)', 
              border: '2px solid white' 
            }} />
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '15px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            P
          </div>
        </div>
      </header>

      {/* ── 1. Baby Growth Hero Card ── */}
      <div className="card mb-6" style={{ 
        padding: '24px', 
        background: 'linear-gradient(145deg, #FDFBFF 0%, #F5F3FF 100%)',
        border: '1px solid rgba(91, 91, 214, 0.12)',
        boxShadow: '0 10px 30px rgba(91, 91, 214, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Custom Generated Illustration */}
          <div style={{ 
            flexShrink: 0, 
            width: '120px', 
            height: '120px', 
            borderRadius: '24px', 
            background: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(45, 35, 56, 0.04)',
            overflow: 'hidden',
            border: '1px solid rgba(91, 91, 214, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/eggplant_baby_size.png" 
              alt="Week 28 Eggplant Size Illustration" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              BABY DEVELOPMENT
            </span>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 800, 
              color: 'var(--color-text-primary)', 
              marginTop: '4px',
              marginBottom: '8px',
              lineHeight: 1.2
            }}>
              Your baby is the size of an {babySizeLabel} {babySizeEmoji}
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '12px', 
                background: '#FFFFFF', 
                padding: '4px 10px', 
                borderRadius: '8px', 
                border: '1px solid var(--color-border)', 
                fontWeight: 650,
                color: 'var(--color-text-primary)'
              }}>
                📏 {babyLength}
              </span>
              <span style={{ 
                fontSize: '12px', 
                background: '#FFFFFF', 
                padding: '4px 10px', 
                borderRadius: '8px', 
                border: '1px solid var(--color-border)', 
                fontWeight: 650,
                color: 'var(--color-text-primary)'
              }}>
                ⚖️ {babyWeight}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Area */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(91, 91, 214, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Pregnancy Progress
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginLeft: 'auto' }}>
              70% Complete (28 of 40 weeks)
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(91, 91, 214, 0.1)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'var(--gradient-primary)', borderRadius: '99px' }} />
          </div>
        </div>
      </div>

      {/* ── 2. Today's Focus Section ── */}
      <section className="mb-6">
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
          Today's Focus
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Focus Row 1: Medications & Water (Split) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            {/* Interactive Medication Card */}
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justify: 'between', minHeight: '135px' }}>
              <div style={{ display: 'flex', justify: 'between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>💊</span>
                <button 
                  onClick={() => setMedsTaken(!medsTaken)}
                  style={{
                    marginLeft: 'auto',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: medsTaken ? 'var(--color-success)' : 'rgba(91, 91, 214, 0.05)',
                    border: medsTaken ? 'none' : '2px solid rgba(91, 91, 214, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {medsTaken && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Thyroxine 50mcg
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  8:00 AM • Morning Dose
                </p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: medsTaken ? 'var(--color-success)' : 'var(--color-warning)',
                  marginTop: '4px'
                }}>
                  {medsTaken ? '✓ Taken' : '○ Due Now'}
                </span>
              </div>
            </div>

            {/* Interactive Water Goal Card */}
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '135px' }}>
              <div style={{ display: 'flex', justify: 'between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>💧</span>
                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  background: 'rgba(124, 154, 255, 0.1)', 
                  color: 'var(--color-accent)', 
                  padding: '3px 8px', 
                  borderRadius: '99px' 
                }}>
                  {waterGlasses}/8 cups
                </span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Hydration Goal
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  Keep drinking water
                </p>
                <button 
                  onClick={() => setWaterGlasses(Math.min(8, waterGlasses + 1))}
                  disabled={waterGlasses >= 8}
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    width: '100%',
                    padding: '6px 0',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: waterGlasses >= 8 ? 'default' : 'pointer',
                    opacity: waterGlasses >= 8 ? 0.5 : 1
                  }}
                >
                  {waterGlasses >= 8 ? 'Goal Met! 🎉' : '+ Record 1 Cup'}
                </button>
              </div>
            </div>

          </div>

          {/* Focus Row 2: Mood & Symptoms Logging */}
          <div className="card" style={{ padding: '18px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              HOW DO YOU FEEL TODAY?
            </p>
            
            {/* Mood Emojis */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '16px',
                    background: selectedMood === mood.id ? 'var(--color-primary-tint)' : 'rgba(0,0,0,0.02)',
                    border: selectedMood === mood.id ? '1px solid rgba(91, 91, 214, 0.2)' : '1px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{mood.emoji}</span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: selectedMood === mood.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' 
                  }}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Symptoms Tags */}
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              LOG PHYSICAL SYMPTOMS
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {symptomsList.map((symptom) => {
                const isActive = loggedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: isActive ? 'var(--gradient-primary)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: isActive ? 'none' : '1px solid var(--color-border-medium)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isActive ? `✓ ${symptom}` : `+ ${symptom}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Next Appointment Card ── */}
      <section className="mb-6">
        <div style={{ display: 'flex', justify: 'between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Next Appointment
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700, marginLeft: 'auto', cursor: 'pointer' }}>
            Reschedule
          </span>
        </div>

        <div className="card" style={{ padding: '18px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'var(--color-primary-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justify: 'between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Dr. Anjali Sen
              </h4>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                background: 'var(--color-success-tint)', 
                color: 'var(--color-success)', 
                padding: '2px 8px', 
                borderRadius: '99px',
                marginLeft: 'auto'
              }}>
                Today 3:30 PM
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Routine Checkup • Fortis Hospital Clinical Annex
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Empathic Health Insights ── */}
      <section className="mb-6">
        <div className="card" style={{ padding: '20px', background: 'var(--color-surface-tint)', border: '1px solid var(--color-border-medium)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>✨</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Daily Growth Insight
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Personalized AI guidance
              </p>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            "Priya, your baby's lungs are rapidly developing and practicing inhaling amniotic fluid. You might feel subtle, regular rhythmic twitching. These are harmless, normal baby hiccups!"
          </p>

          {showInsightDetail ? (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(91, 91, 214, 0.08)' }} className="animate-fade-in">
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                💡 <strong>What you can do:</strong> Keep a healthy posture during hiccups. Sip cool water to help calm down if it keeps you awake, and gently massage the left side of your stomach.
              </p>
              <button 
                onClick={() => setShowInsightDetail(false)}
                style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700, border: 'none', background: 'none' }}
              >
                Show Less
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowInsightDetail(true)}
              style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700, border: 'none', background: 'none', marginTop: '10px', display: 'block' }}
            >
              Read tips & details →
            </button>
          )}
        </div>
      </section>

      {/* ── 5. Upload Prescription CTA (Clinical Intelligence Differentiator) ── */}
      <section style={{ marginBottom: '32px' }}>
        <div 
          className="card" 
          onClick={handlePrescriptionUpload}
          style={{ 
            padding: '24px', 
            border: '2px dashed var(--color-primary)',
            background: 'rgba(91, 91, 214, 0.02)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            boxShadow: 'none'
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-primary-tint)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
            {uploadProgress === 'uploading' ? 'Extracting details with AI...' : 
             uploadProgress === 'success' ? 'Prescription Synced Successfully! 🎉' : 
             'Upload New Medical Report / Prescription'}
          </h3>
          
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
            {uploadProgress === 'uploading' ? 'Analyzing medicines, dosage timings, and appointments...' :
             uploadProgress === 'success' ? 'Vitals logged, and reminders have been updated on your timeline.' :
             'AI automatically schedules your dose alerts, extractions, tests, and Ob-Gyn doctor visits in seconds.'}
          </p>

          {uploadProgress === null && (
            <span style={{ 
              display: 'inline-block', 
              marginTop: '12px', 
              fontSize: '12px', 
              fontWeight: 700, 
              color: 'var(--color-primary)', 
              background: 'var(--color-primary-tint)', 
              padding: '6px 16px', 
              borderRadius: '99px' 
            }}>
              Tap to Scan or Select File
            </span>
          )}
        </div>
      </section>

    </div>
  );
}
