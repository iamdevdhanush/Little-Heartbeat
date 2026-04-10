import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const requestLocationPermission = async () => {
  if (isWeb) {
    if (!navigator.geolocation) {
      return false;
    }
    
    try {
      const result = await new Promise((resolve) => {
        navigator.permissions.query({ name: 'geolocation' }).then((perm) => {
          resolve(perm.state === 'granted');
        }).catch(() => resolve(true));
      });
      return result;
    } catch (e) {
      return true;
    }
  }
  
  try {
    const expoLocation = require('expo-location');
    const { status } = await expoLocation.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
};

export const getCurrentLocation = async () => {
  if (isWeb) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve(getDefaultLocation());
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.log('Location error:', error);
          resolve(getDefaultLocation());
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  try {
    const expoLocation = require('expo-location');
    const location = await expoLocation.getCurrentPositionAsync({
      accuracy: expoLocation.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.log('Native location error:', error);
    return getDefaultLocation();
  }
};

const getDefaultLocation = () => ({
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 100,
  timestamp: Date.now(),
  isDefault: true,
});

export const getGoogleMapsLink = (latitude, longitude) => {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
};

export const sendEmergencySMS = async (profile, riskLevel = 'High', additionalMessage = '') => {
  if (isWeb) {
    const location = await getCurrentLocation();
    const mapsLink = getGoogleMapsLink(location.latitude, location.longitude);
    const name = profile?.name || 'A pregnant woman';
    const month = profile?.pregnancyMonth || 'unknown';
    
    let message = `EMERGENCY: ${name} (${month} months pregnant) needs help!\n`;
    message += `Risk Level: ${riskLevel}\n`;
    message += `Location: ${mapsLink}\n`;
    if (additionalMessage) {
      message += `Note: ${additionalMessage}`;
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
    
    return {
      success: true,
      isWebMode: true,
      message,
      mapsLink,
      whatsappUrl,
      location,
    };
  }

  try {
    const SMS = require('expo-sms');
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'SMS not available' };
    }

    const location = await getCurrentLocation();
    const mapsLink = getGoogleMapsLink(location.latitude, location.longitude);
    const name = profile?.name || 'A pregnant woman';
    
    let fullMessage = `EMERGENCY: ${name} needs help!\n`;
    fullMessage += `Location: ${mapsLink}\n`;

    const { result } = await SMS.sendSMSAsync([], fullMessage);
    return { success: result === 'sent', result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const triggerSOS = async (profile, options = {}) => {
  const {
    riskLevel = 'High',
    includeLocation = true,
    customMessage = '',
    vibrationPattern = true,
  } = options;

  try {
    if (vibrationPattern && isWeb && navigator.vibrate) {
      navigator.vibrate([500, 200, 500]);
    }

    const location = includeLocation ? await getCurrentLocation() : null;
    const result = await sendEmergencySMS(profile, riskLevel, customMessage);

    return {
      success: true,
      location,
      smsResult: result,
      isWebMode: isWeb,
    };
  } catch (error) {
    console.error('SOS Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getEmergencyContacts = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const data = await AsyncStorage.getItem('@lh_emergency_contacts');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveEmergencyContacts = async (contacts) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('@lh_emergency_contacts', JSON.stringify(contacts));
    return true;
  } catch (e) {
    return false;
  }
};
