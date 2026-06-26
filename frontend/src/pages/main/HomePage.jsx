import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import { usePregnancy } from '../../hooks/usePregnancy.js';
import { useMedication } from '../../hooks/useMedication.js';
import { useAppointments } from '../../hooks/useAppointments.js';
import databaseService from '../../services/databaseService.js';
import { generateDailyInsight } from '../../services/aiService.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

export default function HomePage() {
  const { user } = useUser();
  const { pregnancy, week, babyGrowth, daysUntilDue } = usePregnancy(user?.id);
  const { medications } = useMedication(user?.id);
  const { nextAppointment } = useAppointments(user?.id);

  const [aiInsight, setAiInsight] = useState(null);
  const [waterCount, setWaterCount] = useState(0);
  const [isWaterLogging, setIsWaterLogging] = useState(false);

  // Load water count and AI insight
  useEffect(() => {
    if (user?.id) {
      databaseService.getWaterLogs(user.id).then(logs => {
        if (logs?.length) {
          const totalGlasses = logs.reduce((acc, curr) => acc + (curr.glasses || 1), 0);
          setWaterCount(totalGlasses);
        }
      });

      generateDailyInsight({ name: user?.name, pregnancyMonth: 5 }).then(setAiInsight);
    }
  }, [user]);

  const todayMeds = useMemo(() => {
    return (medications || []).filter(m => m.active !== false).slice(0, 2);
  }, [medications]);

  const nextApptDays = useMemo(() => {
    if (!nextAppointment?.scheduled_at) return null;
    return daysUntil(nextAppointment.scheduled_at);
  }, [nextAppointment]);

  const handleWaterClick = async () => {
    if (!user?.id || isWaterLogging) return;
    setIsWaterLogging(true);
    try {
      await databaseService.logWater(user.id, 1);
      setWaterCount(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsWaterLogging(false);
    }
  };

  return (
    <div className="screen" style={{ paddingBottom: 110, background: 'var(--color-warm-ivory)' }}>
      {/* Top Profile Header bar */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {getGreeting()}
          </p>
          <h1 className="serif-display" style={{ fontSize: 32, marginTop: 2, marginBottom: 0 }}>
            {user?.name || 'Mama'} 💕
          </h1>
        </div>
        <Link to="/profile" style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: 20 }}>👩‍🍼</span>
        </Link>
      </div>

      {/* Massive Hero Section - Baby Growth status */}
      {pregnancy && week ? (
        <Link to="/baby" className="animate-fade-in-up delay-1" style={{
          display: 'block',
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-hero)',
          padding: '24px 20px',
          color: 'white',
          boxShadow: 'var(--shadow-primary-lg)',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow circle */}
          <div style={{ position: 'absolute', right: -30, bottom: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(20px)' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 11, padding: '4px 10px', fontWeight: 700 }}>
                WEEK {week}
              </span>
              <h2 className="serif-heading" style={{ fontSize: 24, marginTop: 10, marginBottom: 4, color: 'white', lineHeight: 1.2 }}>
                Baby's heart is strong
              </h2>
              <p style={{ fontSize: 13, opacity: 0.85 }}>
                {daysUntilDue} days remaining until your due date
              </p>
            </div>
            {babyGrowth && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 44, display: 'block' }}>{babyGrowth.size_emoji || '👶'}</span>
                <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.15)', padding: '2px 8px', borderRadius: 10, display: 'inline-block', marginTop: 4 }}>
                  {babyGrowth.size_label || 'Avocado'}
                </span>
              </div>
            )}
          </div>
          <div className="divider" style={{ background: 'rgba(255,255,255,0.15)', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 500 }}>
            <span>Touch to view 3D visualization</span>
            <span>➔</span>
          </div>
        </Link>
      ) : (
        <div className="card animate-fade-in-up delay-1" style={{
          padding: 24, textAlign: 'center', background: 'white', marginBottom: 20
        }}>
          <h2 className="serif-heading" style={{ fontSize: 22, color: 'var(--color-primary)', marginBottom: 8 }}>
            Start Your Pregnancy OS
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            Set up your due date and get personalized daily insights and trackers.
          </p>
          <Link to="/profile" className="btn btn-primary">
            Setup Pregnancy Profile
          </Link>
        </div>
      )}

      {/* Quick AI Insight Card */}
      {aiInsight && (
        <div className="card-tint animate-fade-in-up delay-2" style={{
          padding: 16, marginBottom: 20, background: 'var(--color-lavender)', border: '1px solid rgba(147, 112, 219, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>{aiInsight.emoji || '✨'}</span>
            <span className="serif-label" style={{ color: 'var(--color-primary)', fontSize: 11, fontWeight: 700 }}>
              Daily AI Insight
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4, fontWeight: 500 }}>
            "{aiInsight.insight}"
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
            Tip: {aiInsight.tip}
          </p>
        </div>
      )}

      {/* Today's Priorities checklist */}
      <section className="animate-fade-in-up delay-2" style={{ marginBottom: 20 }}>
        <h3 className="serif-label" style={{ fontSize: 14, marginBottom: 12 }}>Today's Priorities</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          
          {/* Water Tracker Widget */}
          <div className="card-interactive card" style={{
            padding: 16, display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', background: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-success-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                💧
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Daily Hydration</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{waterCount} / 8 glasses logged</p>
              </div>
            </div>
            <button 
              onClick={handleWaterClick}
              className="btn btn-secondary btn-sm"
              disabled={isWaterLogging}
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              + Log Glass
            </button>
          </div>

          {/* Medication Tracker Widget */}
          {todayMeds.length > 0 ? (
            todayMeds.map((med) => (
              <Link to="/care" key={med.id} className="card-interactive card" style={{
                padding: 16, display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', background: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    💊
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {med.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {med.dosage} · {med.timing || 'As scheduled'}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Track ➔</span>
              </Link>
            ))
          ) : (
            <Link to="/upload" className="card-interactive card" style={{
              padding: 16, display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', background: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  💊
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Medication Schedule</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Upload prescription to sync medicines</p>
                </div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Upload ➔</span>
            </Link>
          )}

          {/* Upcoming Appointment widget */}
          {nextAppointment && (
            <div className="card" style={{ padding: 16, background: 'white', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-warning-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                📅
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {nextAppointment.title || 'Doctor Checkup'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {formatDate(nextAppointment.scheduled_at)} · {nextApptDays === 0 ? 'Today' : nextApptDays === 1 ? 'Tomorrow' : `${nextApptDays} days away`}
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Partner activity widget */}
      <section className="animate-fade-in-up delay-3" style={{ marginBottom: 20 }}>
        <h3 className="serif-label" style={{ fontSize: 14, marginBottom: 12 }}>Partner activity</h3>
        <div className="card" style={{ padding: 16, background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <div>
            <p style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Your partner set up shared timeline permissions
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Yesterday at 8:40 PM</p>
          </div>
        </div>
      </section>

      {/* SOS Quick trigger panel */}
      <div className="animate-fade-in-up delay-3" style={{ textAlign: 'center', marginTop: 10 }}>
        <Link to="/sos" className="btn btn-secondary w-full" style={{
          background: 'rgba(255,160,137,0.1)', color: 'var(--color-danger-dark)', border: '1px solid rgba(255,160,137,0.2)', padding: '14px 20px', borderRadius: 'var(--radius-card)'
        }}>
          🚨 Quick Access SOS Emergency Panel
        </Link>
      </div>

    </div>
  );
}
