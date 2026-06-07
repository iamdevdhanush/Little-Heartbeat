// sosService.js — Pure Web implementation
// Replaces expo-location, expo-sms, expo-contacts, AsyncStorage

const EMERGENCY_CONTACTS_KEY = '@lh_emergency_contacts';

// ── Location ──────────────────────────────────────────

export const requestLocationPermission = async () => {
  if (!navigator.geolocation) return false;
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state !== 'denied';
  } catch {
    return true; // Browser may not support permissions API — try anyway
  }
};

export const getCurrentLocation = () => {
  return new Promise((resolve) => {
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
        console.warn('Geolocation error:', error.message);
        resolve(getDefaultLocation());
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

const getDefaultLocation = () => ({
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 1000,
  timestamp: Date.now(),
  isDefault: true,
});

export const getGoogleMapsLink = (latitude, longitude) =>
  `https://maps.google.com/?q=${latitude},${longitude}`;

// ── Contacts Storage (localStorage) ───────────────────

export const saveEmergencyContacts = async (contacts) => {
  try {
    localStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
    return false;
  }
};

export const getEmergencyContacts = async () => {
  try {
    const data = localStorage.getItem(EMERGENCY_CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
};

// No device contacts on web — returns empty (manual entry only)
export const getDeviceContacts = async () => [];

// ── SOS / Messaging ───────────────────────────────────

/**
 * Sends emergency message via WhatsApp deep link.
 * Web cannot send SMS directly — opens WhatsApp with pre-filled message.
 */
export const sendEmergencySMS = async (profile, riskLevel = 'High', additionalMessage = '') => {
  try {
    const location = await getCurrentLocation();
    const contacts = await getEmergencyContacts();
    const mapsLink = getGoogleMapsLink(location.latitude, location.longitude);
    const name = profile?.name || 'A pregnant woman';
    const month = profile?.pregnancyMonth || 'unknown';

    let message = `🚨 EMERGENCY: ${name} (${month} months pregnant) needs help!\n\n`;
    if (riskLevel === 'High') message += `⚠️ HIGH RISK: Seeking immediate medical attention.\n\n`;
    if (!location.isDefault) {
      message += `📍 Location: ${mapsLink}\n\n`;
    } else {
      message += `📍 Location could not be determined.\n\n`;
    }
    if (additionalMessage) message += `Note: ${additionalMessage}\n\n`;
    message += `Please help immediately or call emergency services (108).`;

    // Open WhatsApp with message (user selects contact in WhatsApp)
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    return {
      success: true,
      isWebMode: true,
      message,
      mapsLink,
      location,
      contactsNotified: contacts.length,
    };
  } catch (error) {
    console.error('Error sending emergency message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Main SOS trigger — vibrates + opens WhatsApp emergency message
 */
export const triggerSOS = async (profile, options = {}) => {
  const {
    riskLevel = 'High',
    includeLocation = true,
    customMessage = '',
    vibrationPattern = true,
  } = options;

  try {
    // Browser vibration API
    if (vibrationPattern && navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    const location = includeLocation ? await getCurrentLocation() : null;
    const contacts = await getEmergencyContacts();
    const result = await sendEmergencySMS(profile, riskLevel, customMessage);

    return {
      success: true,
      location,
      contactsNotified: contacts.length,
      smsResult: result,
      isWebMode: true,
    };
  } catch (error) {
    console.error('SOS Error:', error);
    return { success: false, error: error.message };
  }
};
