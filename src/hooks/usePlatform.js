// usePlatform.js — Pure web platform detection
import { useState, useEffect } from 'react';

export const usePlatform = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handleResize = () => { setWidth(window.innerWidth); setHeight(window.innerHeight); };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isWeb: true,
    isMobile: /iPhone|iPad|Android/i.test(navigator.userAgent),
    isIOS: /iPhone|iPad/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    isOnline,
    isStandalone,
    isTablet: width >= 768,
    isDesktop: width >= 1024,
    width,
    height,
  };
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export const useIsLandscape = () => {
  const { width, height } = usePlatform();
  return width > height;
};

export const useSafeAreaInsets = () => ({
  top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0') || 0,
  bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0') || 0,
  left: 0,
  right: 0,
});

export default usePlatform;
