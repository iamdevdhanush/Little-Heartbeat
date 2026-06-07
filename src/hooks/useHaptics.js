// useHaptics.js — Pure web implementation using Vibration API
import { useCallback } from 'react';

const vibrate = (pattern) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

export const useHaptics = () => {
  const impactAsync = useCallback((style = 'light') => {
    switch (style) {
      case 'heavy':
      case 'heavyImpact': vibrate(50); break;
      case 'medium':
      case 'mediumImpact': vibrate(30); break;
      default: vibrate(10); break;
    }
  }, []);

  const notificationAsync = useCallback((type = 'success') => {
    switch (type) {
      case 'success': vibrate([50, 50, 50]); break;
      case 'warning': vibrate([100, 50, 100]); break;
      case 'error': vibrate([200, 100, 200, 100, 200]); break;
      default: vibrate(50); break;
    }
  }, []);

  const selectionAsync = useCallback(() => vibrate(5), []);

  return { impactAsync, notificationAsync, selectionAsync };
};

export default useHaptics;
