import { useCallback } from 'react';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const useHaptics = () => {
  const impactAsync = useCallback(async (style = 'light') => {
    if (isWeb) {
      if (style === 'heavy' || style === 'heavyImpact') {
        vibrate(50);
      } else if (style === 'medium' || style === 'mediumImpact') {
        vibrate(30);
      } else {
        vibrate(10);
      }
    } else {
      try {
        const Haptics = require('expo-haptics');
        switch (style) {
          case 'heavy':
          case 'heavyImpact':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'medium':
          case 'mediumImpact':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'light':
          case 'lightImpact':
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        }
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  }, []);

  const notificationAsync = useCallback(async (type = 'success') => {
    if (isWeb) {
      switch (type) {
        case 'success':
          vibrate([50, 50, 50]);
          break;
        case 'warning':
          vibrate([100, 50, 100]);
          break;
        case 'error':
          vibrate([200, 100, 200, 100, 200]);
          break;
        default:
          vibrate(50);
      }
    } else {
      try {
        const Haptics = require('expo-haptics');
        switch (type) {
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          default:
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  }, []);

  const selectionAsync = useCallback(async () => {
    if (isWeb) {
      vibrate(5);
    } else {
      try {
        const Haptics = require('expo-haptics');
        await Haptics.selectionAsync();
      } catch (e) {
        console.log('Haptics not available');
      }
    }
  }, []);

  return {
    impactAsync,
    notificationAsync,
    selectionAsync,
    isWeb,
  };
};

const vibrate = (pattern) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export default useHaptics;
