import { useState, useEffect, useCallback, useRef } from 'react';
import './pwaInstallCard.css';

const LS = {
  SESSIONS: 'pwa_install_sessions',
  FIRST_VISIT: 'pwa_install_first_visit',
  DISMISSED: 'pwa_install_dismissed',
  COMPLETED: 'pwa_install_completed',
};

function getLs(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function setLs(key, val) {
  try { localStorage.setItem(key, String(val)); } catch {}
}

function getSessionCount() {
  return Number(getLs(LS.SESSIONS)) || 0;
}

function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent || '') && !window.MSStream;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export default function PwaInstallCard() {
  const [visible, setVisible] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installing, setInstalling] = useState(false);
  const timedOut = useRef(false);
  const hasDeferred = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    console.log('[PWA] Install card mounted');
    console.log('[PWA] Standalone:', isStandalone());
    console.log('[PWA] iOS:', isIOS());
    console.log('[PWA] ServiceWorker' in navigator ? 'supported' : 'unsupported');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        console.log('[PWA] SW registration:', reg ? 'active' : 'none');
      });
    }
  }, []);

  const dismissPermanently = useCallback(() => {
    setLs(LS.DISMISSED, 'true');
    setVisible(false);
    console.log('[PWA] Install dismissed permanently');
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOSDevice) {
      dismissPermanently();
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      console.log('[PWA] Triggering install prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install outcome:', outcome);
      if (outcome === 'accepted') {
        setLs(LS.COMPLETED, 'true');
        setVisible(false);
      }
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  }, [deferredPrompt, isIOSDevice, dismissPermanently]);

  useEffect(() => {
    if (isStandalone()) {
      console.log('[PWA] Already in standalone mode, skipping install');
      setLs(LS.COMPLETED, 'true');
      return;
    }

    const iOS = isIOS();
    setIsIOSDevice(iOS);

    const alreadyCompleted = getLs(LS.COMPLETED) === 'true';
    const alreadyDismissed = getLs(LS.DISMISSED) === 'true';

    if (alreadyCompleted) {
      console.log('[PWA] Already installed, hiding card');
      return;
    }

    const sessions = getSessionCount() + 1;
    setLs(LS.SESSIONS, sessions);

    if (!getLs(LS.FIRST_VISIT)) {
      setLs(LS.FIRST_VISIT, String(Date.now()));
    }

    console.log('[PWA] Session count:', sessions);

    const meetsSessionThreshold = sessions >= 2;
    if (alreadyDismissed || !meetsSessionThreshold) {
      if (alreadyDismissed) console.log('[PWA] Previously dismissed');
      if (!meetsSessionThreshold) console.log('[PWA] Below session threshold');
      return;
    }

    const canShow = () => hasDeferred.current || iOS;

    const tryShow = () => {
      if (canShow()) {
        console.log('[PWA] Showing install card');
        setVisible(true);
      }
    };

    const timer = setTimeout(() => {
      timedOut.current = true;
      console.log('[PWA] Initial delay elapsed');
      tryShow();
    }, 30000);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt fired');
      hasDeferred.current = true;
      setDeferredPrompt(e);
      tryShow();
    };

    const handleAppInstalled = () => {
      console.log('[PWA] appinstalled event fired');
      setLs(LS.COMPLETED, 'true');
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pwa-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Install Little Heartbeat"
    >
      <div className="pwa-card" role="document">
        <button
          className="pwa-close"
          onClick={dismissPermanently}
          aria-label="Close install prompt"
          type="button"
        >
          ✕
        </button>

        <div className="pwa-icon" aria-hidden="true">
          {isIOSDevice ? '📱' : '💗'}
        </div>

        <h2 className="pwa-title">
          Install Little Heartbeat
        </h2>

        <p className="pwa-subtitle">
          {isIOSDevice
            ? 'Add Little Heartbeat to your home screen for the best experience.'
            : 'Access medication reminders, offline health records and emergency SOS.'}
        </p>

        {!isIOSDevice && (
          <div className="pwa-features" role="list">
            <div className="pwa-feature" role="listitem">
              <span className="pwa-feature-icon reminder" aria-hidden="true">💊</span>
              Medication reminders
            </div>
            <div className="pwa-feature" role="listitem">
              <span className="pwa-feature-icon offline" aria-hidden="true">📁</span>
              Offline health records
            </div>
            <div className="pwa-feature" role="listitem">
              <span className="pwa-feature-icon emergency" aria-hidden="true">🆘</span>
              One-tap emergency SOS
            </div>
          </div>
        )}

        {isIOSDevice && (
          <div className="pwa-ios-instructions">
            <p>
              Tap the <span className="share-icon" aria-hidden="true">⬆</span> Share button in Safari, then scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
          </div>
        )}

        <div className="pwa-actions">
          <button
            className="pwa-btn pwa-btn-install"
            onClick={handleInstall}
            disabled={installing}
            type="button"
          >
            {installing ? 'Installing\u2026' : isIOSDevice ? 'Got it' : 'Install Now'}
          </button>
          <button
            className="pwa-btn pwa-btn-later"
            onClick={dismissPermanently}
            type="button"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
