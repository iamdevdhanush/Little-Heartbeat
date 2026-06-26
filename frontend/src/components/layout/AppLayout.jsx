import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PwaInstallCard from '../pwa/PwaInstallCard.jsx';

export default function AppLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);

  useEffect(() => {
    // Check if onboarding completed
    const onboardDone = localStorage.getItem('lh_onboarding_completed') === 'true';
    
    // Show splash first
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (!onboardDone) {
        setShowOnboarding(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleNextOnboard = () => {
    if (onboardStep < 2) {
      setOnboardStep(prev => prev + 1);
    } else {
      localStorage.setItem('lh_onboarding_completed', 'true');
      setShowOnboarding(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('lh_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // 1. Splash Screen Render
  if (showSplash) {
    return (
      <div className="app-shell" style={{
        background: 'var(--color-warm-ivory)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', position: 'relative'
      }}>
        {/* Floating particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="sos-pulse" style={{
              position: 'absolute', width: 10 + i * 4, height: 10 + i * 4,
              borderRadius: '50%', background: 'var(--color-blush-pink)', opacity: 0.3,
              top: `${(i * 18) % 90}%`, left: `${(i * 23) % 90}%`,
              animationDuration: `${3 + i}s`
            }} />
          ))}
        </div>

        {/* Pulsing logo */}
        <div className="animate-heartbeat" style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-primary)',
          marginBottom: 16
        }}>
          <span style={{ fontSize: 44 }}>❤️</span>
        </div>
        <h2 className="serif-heading" style={{ fontSize: 28, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Little Heartbeat
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Pregnancy Operating System
        </p>
      </div>
    );
  }

  // 2. Onboarding slideshow Render
  if (showOnboarding) {
    return (
      <div className="app-shell" style={{
        background: 'var(--color-warm-ivory)',
        display: 'flex', flexDirection: 'column',
        height: '100%', padding: '24px 20px',
        justifyContent: 'between'
      }}>
        {/* Top skip header */}
        <div style={{ display: 'flex', justifyContent: 'end', flexShrink: 0 }}>
          <button onClick={handleSkip} style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Skip Onboarding
          </button>
        </div>

        {/* Dynamic slides content */}
        <div className="animate-fade-in-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          
          {onboardStep === 0 && (
            <div>
              <span style={{ fontSize: 72, display: 'block', marginBottom: 20 }}>👶</span>
              <h2 className="serif-display" style={{ fontSize: 32, marginBottom: 12 }}>
                Connect with Baby
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6, padding: '0 16px' }}>
                Follow your baby's growth week-by-week with realistic visualizations and expert development guides.
              </p>
            </div>
          )}

          {onboardStep === 1 && (
            <div>
              <span style={{ fontSize: 72, display: 'block', marginBottom: 20 }}>📄</span>
              <h2 className="serif-display" style={{ fontSize: 32, marginBottom: 12 }}>
                AI Document Intelligence
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6, padding: '0 16px' }}>
                Upload prescriptions and doctor reports. AI automaticallychedules medication reminders and updates your Health Vault.
              </p>
            </div>
          )}

          {onboardStep === 2 && (
            <div>
              <span style={{ fontSize: 72, display: 'block', marginBottom: 20 }}>🛡️</span>
              <h2 className="serif-display" style={{ fontSize: 32, marginBottom: 12 }}>
                Peace of Mind
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6, padding: '0 16px' }}>
                Quick emergency SOS sharing with doctor and spouse. Plus, invite your partner for a synchronized pregnancy experience.
              </p>
            </div>
          )}

        </div>

        {/* Bottom controls */}
        <div style={{ flexShrink: 0, paddingBottom: 16 }}>
          {/* Step indicator bubbles */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {[0, 1, 2].map((idx) => (
              <div key={idx} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: onboardStep === idx ? 'var(--color-primary)' : 'var(--color-border-strong)',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>

          <button 
            onClick={handleNextOnboard}
            className="btn btn-primary btn-xl"
          >
            {onboardStep === 2 ? 'Get Started' : 'Next Step ➔'}
          </button>
        </div>
      </div>
    );
  }

  // 3. Normal App Render
  return (
    <div className="app-shell">
      <main className="page-content">
        <Outlet />
      </main>
      <BottomNav />
      <PwaInstallCard />
    </div>
  );
}
