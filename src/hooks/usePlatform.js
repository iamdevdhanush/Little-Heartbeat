import { useState, useEffect, createContext, useContext } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const usePlatform = () => {
  const { width, height } = useWindowDimensions();
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (isWeb) {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return {
    isWeb,
    isMobile,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isOnline,
    isStandalone,
    isTablet: width >= 768,
    isDesktop: width >= 1024,
    width,
    height,
  };
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (isWeb && window.matchMedia) {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);

      const handler = (e) => setMatches(e.matches);
      mediaQuery.addEventListener('change', handler);

      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [query]);

  return matches;
};

export const useIsLandscape = () => {
  const { width, height } = useWindowDimensions();
  return width > height;
};

export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    if (isWeb) {
      const updateInsets = () => {
        const computedStyle = window.getComputedStyle(document.documentElement);
        const safeTop = parseInt(computedStyle.getPropertyValue('--sat') || '0', 10);
        const safeBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0', 10);
        setInsets({
          top: safeTop,
          bottom: safeBottom,
          left: 0,
          right: 0,
        });
      };

      updateInsets();
      window.addEventListener('resize', updateInsets);
      return () => window.removeEventListener('resize', updateInsets);
    }
  }, []);

  return insets;
};

export const PlatformContext = createContext({
  isWeb: false,
  isMobile: true,
  isStandalone: false,
});

export const usePlatformContext = () => useContext(PlatformContext);

export default usePlatform;
