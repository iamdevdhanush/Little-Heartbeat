import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import { useMedication } from '../../hooks/useMedication.js';
import { useAppointments } from '../../hooks/useAppointments.js';
import { useUser } from '../../hooks/useUser.js';
import databaseService from '../../services/databaseService.js';

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '24px 16px',
      background: 'var(--color-surface-tint)',
      borderRadius: 'var(--radius-card)',
      border: '1px dashed var(--color-border-strong)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: action ? 12 : 0 }}>{subtitle}</p>
      {action}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getWeekday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { pregnancy, week, trimester, babyGrowth, daysUntilDue, loading: pregLoading } = usePregnancy(user?.id);
  const { activeMedications, loading: medLoading, todayCount: medCount } = useMedication(user?.id);
  const { appointments, nextAppointment, loading: apptLoading } = useAppointments(user?.id);

  const [moodTypes, setMoodTypes] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loggedSymptoms, setLoggedSymptoms] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [todaysSymptoms, setTodaysSymptoms] = useState([]);
  const [insight, setInsight] = useState(null);
  const [showInsightDetail, setShowInsightDetail] = useState(false);
  const [medsTaken, setMedsTaken] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      databaseService.getMoodTypes().then(setMoodTypes),
      databaseService.getPregnancyInsight(week).then(setInsight),
      databaseService.getWaterLogs(userId).then(logs => {
        const total = (logs || []).reduce((s, l) => s + (l.glasses || 0), 0);
        setWaterGlasses(total);
      }),
      databaseService.getSymptoms(userId).then(symptoms => {
        const today = symptoms.filter(s =>
          s.date === new Date().toISOString().split('T')[0]
        );
        setTodaysSymptoms(today);
      }),
    ]).finally(() => setLoadingData(false));
  }, [userId, week]);

  const logMood = useCallback(async (moodId) => {
    setSelectedMood(moodId);
    const mood = moodTypes.find(m => m.id === moodId);
    if (mood && userId) {
      await databaseService.logMood(userId, { mood: mood.label, emoji: mood.emoji });
    }
  }, [moodTypes, userId]);

  const toggleSymptom = useCallback(async (symptom) => {
    if (loggedSymptoms.includes(symptom)) {
      setLoggedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setLoggedSymptoms(prev => [...prev, symptom]);
      if (userId) {
        await databaseService.logSymptom(userId, { symptom, severity: 2 });
      }
    }
  }, [userId]);

  const addWater = useCallback(async () => {
    if (waterGlasses >= 8) return;
    if (userId) {
      await databaseService.logWater(userId, 1);
    }
    setWaterGlasses(prev => Math.min(8, prev + 1));
  }, [userId, waterGlasses]);

  const toggleMedTaken = useCallback(async (medId) => {
    const newState = !medsTaken[medId];
    setMedsTaken(prev => ({ ...prev, [medId]: newState }));
  }, [medsTaken]);

  const displayName = user?.name || 'Mama';
  const initial = displayName.charAt(0).toUpperCase();
  const trimesterLabel = trimester === 1 ? 'First Trimester' : trimester === 2 ? 'Second Trimester' : 'Third Trimester';
  const weekProgress = week ? Math.round((week / 40) * 100) : 0;

  const isLoading = userLoading || pregLoading || loadingData;

  if (isLoading) {
    return (
      <div className="screen" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="sos-pulse" style={{ margin: '0 auto 16px' }} />
        <p className="text-secondary" style={{ fontSize: 14 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 20px 100px' }}>
      {/* ─── Hero Section ─── */}
      <div className="animate-fade-in" style={{ paddingTop: '24px', marginBottom: '28px' }}>
        {pregnancy ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ fontSize: 11 }}>
              Week {week} · {trimesterLabel}
            </span>
            {daysUntilDue !== null && (
              <span className="badge badge-outline" style={{ fontSize: 11 }}>
                {daysUntilDue > 0 ? `${daysUntilDue} days to go` : 'Past due date'}
              </span>
            )}
            {babyGrowth?.size_emoji && (
              <span style={{ fontSize: 16 }}>{babyGrowth.size_emoji}</span>
            )}
          </div>
        ) : (
          <EmptyState icon="🤰" title="No Pregnancy Data" subtitle="Set up your pregnancy profile to track your journey." />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
            {getGreeting()}, {displayName} 🌤️
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontWeight: 700, fontSize: 17,
              boxShadow: '0 4px 16px rgba(91, 91, 214, 0.3)',
            }}>
              {initial}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Baby Growth Hero Card ─── */}
      {babyGrowth && pregnancy ? (
        <div className="animate-fade-in delay-1" style={{
          background: 'linear-gradient(135deg, #F8F5FF 0%, #F0EEFF 50%, #E8E4FF 100%)',
          borderRadius: 32, padding: 24, marginBottom: 24,
          border: '1px solid rgba(91, 91, 214, 0.1)',
          boxShadow: '0 12px 40px rgba(91, 91, 214, 0.06)',
        }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{
              flexShrink: 0, width: 110, height: 110,
              borderRadius: 24, background: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(45,35,56,0.04)',
              border: '1px solid rgba(91,91,214,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48,
            }}>
              {babyGrowth.size_emoji}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6C6278' }}>
                Baby Development
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2D2338', marginTop: 4, marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Your baby is the size of {babyGrowth.size_label} {babyGrowth.size_emoji}
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-outline" style={{ gap: 4, fontSize: 11 }}>
                  {babyGrowth.length_cm}
                </span>
                <span className="badge badge-outline" style={{ gap: 4, fontSize: 11 }}>
                  {babyGrowth.weight}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#6C6278', marginTop: 8, lineHeight: 1.5 }}>
                {babyGrowth.development}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(91,91,214,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6C6278' }}>Pregnancy Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#5B5BD6' }}>
                {weekProgress}% Complete ({week} of 40 weeks)
              </span>
            </div>
            <div className="progress-bar" style={{ height: 6, background: 'rgba(91,91,214,0.08)' }}>
              <div className="progress-bar-fill" style={{
                width: `${weekProgress}%`,
                background: 'linear-gradient(90deg, #5B5BD6 0%, #7C9AFF 100%)',
              }} />
            </div>
          </div>
        </div>
      ) : pregnancy && !babyGrowth ? (
        <div className="card-tint" style={{ padding: 24, textAlign: 'center', marginBottom: 24 }}>
          <p className="text-secondary" style={{ fontSize: 13 }}>Loading baby development data...</p>
        </div>
      ) : null}

      {/* ─── Today's Focus ─── */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Today's Focus
          </h3>
          <span className="badge badge-outline" style={{ fontSize: 11 }}>
            {getWeekday()}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Medication + Water Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Medication Card */}
            <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 140 }}>
              {activeMedications.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: medsTaken[activeMedications[0].id] ? 'rgba(47,191,113,0.1)' : 'rgba(91,91,214,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {medsTaken[activeMedications[0].id] ? '✅' : '💊'}
                    </div>
                    <button
                      onClick={() => toggleMedTaken(activeMedications[0].id)}
                      className={`${medsTaken[activeMedications[0].id] ? 'checked' : ''}`}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: medsTaken[activeMedications[0].id] ? '#2FBF71' : 'rgba(91,91,214,0.06)',
                        border: medsTaken[activeMedications[0].id] ? 'none' : '2px solid rgba(91,91,214,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
                      }}
                    >
                      {medsTaken[activeMedications[0].id] && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                      )}
                    </button>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                      {activeMedications[0].name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      {activeMedications[0].timing || activeMedications[0].frequency || 'As prescribed'}
                    </p>
                    <span className={`badge ${medsTaken[activeMedications[0].id] ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 11 }}>
                      {medsTaken[activeMedications[0].id] ? 'Taken' : 'Due today'}
                    </span>
                  </div>
                </>
              ) : (
                <EmptyState icon="💊" title="No Medications" subtitle="Upload a prescription to get reminders" />
              )}
            </div>

            {/* Water Card */}
            <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: 'rgba(124,154,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  💧
                </div>
                <span className="badge badge-primary" style={{ fontSize: 11 }}>
                  {waterGlasses}/8
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  Hydration Goal
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {waterGlasses >= 8 ? 'Goal met!' : `${8 - waterGlasses} cups remaining`}
                </p>
                <button
                  onClick={addWater}
                  disabled={waterGlasses >= 8}
                  className={`btn btn-sm ${waterGlasses >= 8 ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ width: '100%', fontSize: 12 }}
                >
                  {waterGlasses >= 8 ? 'Goal Met! 🎉' : '+ Record 1 Cup'}
                </button>
              </div>
            </div>
          </div>

          {/* Mood + Symptoms Card */}
          <div className="card" style={{ padding: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12, display: 'block' }}>
              How do you feel today?
            </span>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {(moodTypes.length > 0 ? moodTypes : []).map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => logMood(mood.id)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 16,
                    background: selectedMood === mood.id ? 'rgba(91,91,214,0.06)' : 'rgba(0,0,0,0.02)',
                    border: selectedMood === mood.id ? '1px solid rgba(91,91,214,0.15)' : '1px solid transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4, cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{mood.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: selectedMood === mood.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 10, display: 'block' }}>
              Log physical symptoms
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Backache', 'Fatigue', 'Braxton Hicks', 'Mild Heartburn', 'Swelling', 'Nausea', 'Headache', 'Cramping'].map((symptom) => {
                const isActive = loggedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    style={{
                      padding: '7px 14px', borderRadius: 99,
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                      background: isActive ? 'var(--color-primary)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: isActive ? 'none' : '1px solid var(--color-border-medium)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
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
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Next Appointment
          </h3>
        </div>

        {nextAppointment ? (
          <div className="card" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'rgba(91,91,214,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {nextAppointment.title || nextAppointment.doctor_name || 'Appointment'}
                </h4>
                <span className="badge badge-success" style={{ fontSize: 11 }}>
                  {formatDate(nextAppointment.scheduled_at)}
                </span>
              </div>
              {nextAppointment.location && (
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                  {nextAppointment.location}
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState icon="📅" title="No Upcoming Appointments" subtitle="Add your next checkup or scan" />
        )}
      </section>

      {/* ─── Health Insight ─── */}
      {insight && pregnancy && (
        <section style={{ marginBottom: 24 }}>
          <div style={{
            background: 'rgba(248,245,255,0.8)', borderRadius: 24, padding: 20,
            border: '1px solid rgba(91,91,214,0.08)',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14,
                background: 'rgba(91,91,214,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                ✨
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Daily Growth Insight
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  Week {week} guidance
                </p>
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {insight.insight_text}
            </p>

            {showInsightDetail ? (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(91,91,214,0.06)' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Tip:</strong> {insight.tip_text}
                </p>
                {insight.exercise_text && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>Exercise:</strong> {insight.exercise_text}
                  </p>
                )}
                <button onClick={() => setShowInsightDetail(false)} className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: 0 }}>
                  Show Less
                </button>
              </div>
            ) : (
              <button onClick={() => setShowInsightDetail(true)} className="btn btn-ghost btn-sm" style={{ fontSize: 12, marginTop: 10, padding: 0 }}>
                Read tips & details →
              </button>
            )}
          </div>
        </section>
      )}

      {/* ─── Upload Prescription CTA ─── */}
      <section style={{ marginBottom: 32 }}>
        <a href="/care" style={{
          display: 'block', textDecoration: 'none',
          background: 'rgba(91,91,214,0.02)',
          borderRadius: 28, padding: '28px 24px',
          border: '2px dashed rgba(91,91,214,0.25)',
          cursor: 'pointer', textAlign: 'center',
          transition: 'all 0.2s ease',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(91,91,214,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            Upload Medical Report
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: 320, margin: '0 auto' }}>
            AI extracts medicines, dosage timings, and appointments automatically.
          </p>
          <span className="btn btn-primary btn-sm" style={{ marginTop: 14, display: 'inline-flex' }}>
            Go to Medication Center
          </span>
        </a>
      </section>
    </div>
  );
}
