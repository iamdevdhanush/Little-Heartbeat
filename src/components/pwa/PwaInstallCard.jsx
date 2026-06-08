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

  const dismissPermanently = useCallback(() => {
    setLs(LS.DISMISSED, 'true');
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOSDevice) {
      dismissPermanently();
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setLs(LS.COMPLETED, 'true');
        setVisible(false);
      }
    } catch {}
    setDeferredPrompt(null);
    setInstalling(false);
  }, [deferredPrompt, isIOSDevice, dismissPermanently]);

  useEffect(() => {
    if (isStandalone()) {
      setLs(LS.COMPLETED, 'true');
      return;
    }

    const iOS = isIOS();
    setIsIOSDevice(iOS);

    const alreadyCompleted = getLs(LS.COMPLETED) === 'true';
    const alreadyDismissed = getLs(LS.DISMISSED) === 'true';

    if (alreadyCompleted) return;

    const sessions = getSessionCount() + 1;
    setLs(LS.SESSIONS, sessions);

    if (!getLs(LS.FIRST_VISIT)) {
      setLs(LS.FIRST_VISIT, String(Date.now()));
    }

    const meetsSessionThreshold = sessions >= 2;
    if (alreadyDismissed || !meetsSessionThreshold) return;

    const canShow = () => timedOut.current && (hasDeferred.current || iOS);

    const tryShow = () => {
      if (canShow()) setVisible(true);
    };

    const timer = setTimeout(() => {
      timedOut.current = true;
      tryShow();
    }, 60000);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      hasDeferred.current = true;
      setDeferredPrompt(e);
      tryShow();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          onClick={dismiss}
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
            {installing ? 'Installing…' : isIOSDevice ? 'Got it' : 'Install'}
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
