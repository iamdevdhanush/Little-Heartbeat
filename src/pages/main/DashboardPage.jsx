import React, { useState } from 'react';

const moods = [
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'excited', label: 'Excited', emoji: '✨' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'anxious', label: 'Anxious', emoji: '🥺' },
];

const symptomsList = ['Backache', 'Fatigue', 'Braxton Hicks', 'Mild Heartburn', 'Swelling'];

const babyWeekData = {
  week: 28,
  trimester: 'Third Trimester',
  sizeLabel: 'Eggplant',
  sizeEmoji: '🍆',
  length: '37.6 cm',
  weight: '1.1 kg',
};

export default function DashboardPage() {
  const [medsTaken, setMedsTaken] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [selectedMood, setSelectedMood] = useState('calm');
  const [loggedSymptoms, setLoggedSymptoms] = useState([]);
  const [uploadState, setUploadState] = useState(null);
  const [showInsightDetail, setShowInsightDetail] = useState(false);

  const toggleSymptom = (symptom) => {
    setLoggedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleUpload = () => {
    setUploadState('uploading');
    setTimeout(() => setUploadState('success'), 2000);
  };

  const weekProgress = ((babyWeekData.week / 40) * 100).toFixed(0);

  return (
    <div className="screen" style={{ padding: '0 20px 100px' }}>
      {/* ─── Hero Section ─── */}
      <div className="animate-fade-in" style={{ paddingTop: '24px', marginBottom: '28px' }}>
        {/* Trimester Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: '#5B5BD6',
            background: 'rgba(91, 91, 214, 0.08)',
            padding: '6px 12px', borderRadius: '99px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5B5BD6' }} />
            Week {babyWeekData.week} · {babyWeekData.trimester}
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 600, color: '#6C6278',
            background: 'rgba(108, 98, 120, 0.06)',
            padding: '6px 12px', borderRadius: '99px',
          }}>
            Due {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Greeting Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{
            fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em',
            color: '#2D2338', lineHeight: 1.1,
          }}>
            Good Morning, Priya 🌤️
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: '#FFFFFF', border: '1px solid rgba(91, 91, 214, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2338" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#FF6B6B', border: '2px solid #FFFFFF',
              }} />
            </button>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #5B5BD6 0%, #7C9AFF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 700, fontSize: '17px',
              boxShadow: '0 4px 16px rgba(91, 91, 214, 0.3)',
            }}>
              P
            </div>
          </div>
        </div>
      </div>

      {/* ─── Baby Growth Hero Card ─── */}
      <div className="animate-fade-in delay-1" style={{
        background: 'linear-gradient(135deg, #F8F5FF 0%, #F0EEFF 50%, #E8E4FF 100%)',
        borderRadius: '32px', padding: '24px', marginBottom: '24px',
        border: '1px solid rgba(91, 91, 214, 0.1)',
        boxShadow: '0 12px 40px rgba(91, 91, 214, 0.06)',
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Baby Illustration */}
          <div style={{
            flexShrink: 0, width: '110px', height: '110px',
            borderRadius: '24px', background: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(45, 35, 56, 0.04)',
            border: '1px solid rgba(91, 91, 214, 0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img
              src="/eggplant_baby_size.png"
              alt="Baby size illustration"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#6C6278',
            }}>
              Baby Development
            </span>
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: '#2D2338',
              marginTop: '4px', marginBottom: '8px', lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              Your baby is the size of an {babyWeekData.sizeLabel} {babyWeekData.sizeEmoji}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: 600, color: '#2D2338',
                background: '#FFFFFF', padding: '5px 12px', borderRadius: '99px',
                border: '1px solid rgba(91, 91, 214, 0.08)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                {babyWeekData.length}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: 600, color: '#2D2338',
                background: '#FFFFFF', padding: '5px 12px', borderRadius: '99px',
                border: '1px solid rgba(91, 91, 214, 0.08)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                {babyWeekData.weight}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(91, 91, 214, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6C6278' }}>
              Pregnancy Progress
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#5B5BD6' }}>
              {weekProgress}% Complete ({babyWeekData.week} of 40 weeks)
            </span>
          </div>
          <div style={{
            height: '6px', background: 'rgba(91, 91, 214, 0.08)',
            borderRadius: '99px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${weekProgress}%`, height: '100%',
              background: 'linear-gradient(90deg, #5B5BD6 0%, #7C9AFF 100%)',
              borderRadius: '99px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ─── Today's Focus ─── */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{
            fontSize: '20px', fontWeight: 700, color: '#2D2338',
            letterSpacing: '-0.02em',
          }}>
            Today's Focus
          </h3>
          <span style={{
            fontSize: '12px', fontWeight: 600, color: '#6C6278',
            background: 'rgba(108, 98, 120, 0.06)',
            padding: '4px 10px', borderRadius: '99px',
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Medication + Water Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Medication Card */}
            <div style={{
              background: '#FFFFFF', borderRadius: '24px', padding: '18px',
              border: '1px solid rgba(91, 91, 214, 0.06)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', minHeight: '140px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: medsTaken ? 'rgba(47, 191, 113, 0.1)' : 'rgba(91, 91, 214, 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {medsTaken ? '✅' : '💊'}
                </div>
                <button
                  onClick={() => setMedsTaken(!medsTaken)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: medsTaken ? '#2FBF71' : 'rgba(91, 91, 214, 0.06)',
                    border: medsTaken ? 'none' : '2px solid rgba(91, 91, 214, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {medsTaken && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              </div>
              <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#2D2338', marginBottom: '2px' }}>
                Thyroxine 50mcg
              </p>
              <p style={{ fontSize: '12px', color: '#6C6278', marginBottom: '6px' }}>
                8:00 AM · Morning Dose
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700,
                color: medsTaken ? '#2FBF71' : '#FFB648',
                padding: '3px 8px', borderRadius: '99px',
                background: medsTaken ? 'rgba(47, 191, 113, 0.08)' : 'rgba(255, 182, 72, 0.08)',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: medsTaken ? '#2FBF71' : '#FFB648',
                }} />
                {medsTaken ? 'Taken at 8:12 AM' : 'Due Now'}
              </span>
              </div>
            </div>

            {/* Water Card */}
            <div style={{
              background: '#FFFFFF', borderRadius: '24px', padding: '18px',
              border: '1px solid rgba(91, 91, 214, 0.06)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', minHeight: '140px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'rgba(124, 154, 255, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  💧
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  background: 'rgba(124, 154, 255, 0.1)',
                  color: '#7C9AFF', padding: '3px 8px', borderRadius: '99px',
                }}>
                  {waterGlasses}/8
                </span>
              </div>
              <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#2D2338', marginBottom: '2px' }}>
                Hydration Goal
              </p>
              <p style={{ fontSize: '12px', color: '#6C6278', marginBottom: '8px' }}>
                Keep drinking water
              </p>
              <button
                onClick={() => setWaterGlasses(Math.min(8, waterGlasses + 1))}
                disabled={waterGlasses >= 8}
                style={{
                  width: '100%', padding: '7px 0', borderRadius: '12px',
                  background: waterGlasses >= 8 ? 'rgba(47, 191, 113, 0.08)' : '#5B5BD6',
                  color: waterGlasses >= 8 ? '#2FBF71' : '#FFFFFF',
                  fontSize: '12px', fontWeight: 700, border: 'none',
                  cursor: waterGlasses >= 8 ? 'default' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                {waterGlasses >= 8 ? 'Goal Met! 🎉' : '+ Record 1 Cup'}
              </button>
              </div>
            </div>
          </div>

          {/* Mood + Symptoms Card */}
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '20px',
            border: '1px solid rgba(91, 91, 214, 0.06)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}>
            {/* Mood */}
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#6C6278', marginBottom: '12px',
              display: 'block',
            }}>
              How do you feel today?
            </span>
            <div style={{
              display: 'flex', gap: '8px', marginBottom: '18px',
            }}>
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: '16px',
                    background: selectedMood === mood.id ? 'rgba(91, 91, 214, 0.06)' : 'rgba(0,0,0,0.02)',
                    border: selectedMood === mood.id
                      ? '1px solid rgba(91, 91, 214, 0.15)'
                      : '1px solid transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '4px', cursor: 'pointer',
                    transition: 'all 0.2s ease', fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{mood.emoji}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 600,
                    color: selectedMood === mood.id ? '#5B5BD6' : '#6C6278',
                  }}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Symptoms */}
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#6C6278', marginBottom: '10px',
              display: 'block',
            }}>
              Log physical symptoms
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {symptomsList.map((symptom) => {
                const isActive = loggedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    style={{
                      padding: '7px 14px', borderRadius: '99px',
                      fontSize: '12px', fontWeight: 600,
                      background: isActive ? '#5B5BD6' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#2D2338',
                      border: isActive ? 'none' : '1px solid rgba(91, 91, 214, 0.12)',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
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

      {/* ─── Next Appointment ─── */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{
            fontSize: '20px', fontWeight: 700, color: '#2D2338',
            letterSpacing: '-0.02em',
          }}>
            Next Appointment
          </h3>
          <button style={{
            fontSize: '12px', fontWeight: 600, color: '#5B5BD6',
            border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            Reschedule
          </button>
        </div>

        <div style={{
          background: '#FFFFFF', borderRadius: '24px', padding: '18px',
          border: '1px solid rgba(91, 91, 214, 0.06)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex', gap: '16px', alignItems: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '16px',
            background: 'rgba(91, 91, 214, 0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#5B5BD6', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#2D2338' }}>
                Dr. Anjali Sen
              </h4>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                background: 'rgba(47, 191, 113, 0.08)',
                color: '#2FBF71', padding: '3px 10px', borderRadius: '99px',
              }}>
                Today 3:30 PM
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#6C6278', marginTop: '3px' }}>
              Routine Checkup · Fortis Hospital Clinical Annex
            </p>
          </div>
        </div>
      </section>

      {/* ─── Health Insight ─── */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(248, 245, 255, 0.8)',
          borderRadius: '24px', padding: '20px',
          border: '1px solid rgba(91, 91, 214, 0.08)',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '14px',
              background: 'rgba(91, 91, 214, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>
              ✨
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#2D2338' }}>
                Daily Growth Insight
              </p>
              <p style={{ fontSize: '11px', color: '#6C6278' }}>
                Personalized AI guidance
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '14px', color: '#6C6278', lineHeight: 1.7,
          }}>
            "Priya, your baby's lungs are rapidly developing and practicing inhaling amniotic fluid. You might feel subtle, regular rhythmic twitching. These are harmless, normal baby hiccups!"
          </p>

          {showInsightDetail ? (
            <div style={{
              marginTop: '14px', paddingTop: '14px',
              borderTop: '1px solid rgba(91, 91, 214, 0.06)',
            }}>
              <p style={{ fontSize: '13px', color: '#6C6278', lineHeight: 1.6, marginBottom: '10px' }}>
                💡 <strong style={{ color: '#2D2338' }}>What you can do:</strong> Keep a healthy posture during hiccups. Sip cool water to help calm down if it keeps you awake, and gently massage the left side of your stomach.
              </p>
              <button
                onClick={() => setShowInsightDetail(false)}
                style={{
                  fontSize: '12px', fontWeight: 700, color: '#5B5BD6',
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Show Less
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInsightDetail(true)}
              style={{
                fontSize: '12px', fontWeight: 700, color: '#5B5BD6',
                border: 'none', background: 'none', cursor: 'pointer',
                marginTop: '10px', padding: '0',
                fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
              }}
            >
              Read tips & details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* ─── Upload Prescription CTA ─── */}
      <section style={{ marginBottom: '32px' }}>
        <div
          onClick={handleUpload}
          style={{
            background: 'rgba(91, 91, 214, 0.02)',
            borderRadius: '28px', padding: '28px 24px',
            border: '2px dashed rgba(91, 91, 214, 0.25)',
            cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: uploadState === 'success'
              ? 'rgba(47, 191, 113, 0.08)'
              : uploadState === 'uploading'
              ? 'rgba(255, 182, 72, 0.08)'
              : 'rgba(91, 91, 214, 0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            transition: 'all 0.3s ease',
          }}>
            {uploadState === 'success' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2FBF71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            )}
          </div>

          <h3 style={{
            fontSize: '16px', fontWeight: 700, color: '#2D2338',
            marginBottom: '6px', letterSpacing: '-0.01em',
          }}>
            {uploadState === 'uploading' ? 'Extracting with AI...' :
             uploadState === 'success' ? 'Prescription Synced! 🎉' :
             'Upload Medical Report'}
          </h3>

          <p style={{
            fontSize: '13px', color: '#6C6278', lineHeight: 1.5,
            maxWidth: '320px', margin: '0 auto',
          }}>
            {uploadState === 'uploading' ? 'Analyzing medicines, dosage, and appointments...' :
             uploadState === 'success' ? 'Vitals logged. Reminders updated on your timeline.' :
             'AI extracts medicines, dosage timings, and appointments automatically.'}
          </p>

          {uploadState === null && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '14px', padding: '8px 20px',
              background: '#5B5BD6', color: '#FFFFFF',
              fontSize: '12px', fontWeight: 700, borderRadius: '99px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              Upload Prescription or Report
            </span>
          )}

          {uploadState === 'success' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '14px', padding: '8px 20px',
              background: 'rgba(47, 191, 113, 0.08)',
              color: '#2FBF71',
              fontSize: '12px', fontWeight: 700, borderRadius: '99px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Synced to Health Vault
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
