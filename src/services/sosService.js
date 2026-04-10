import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMERGENCY_CONTACTS_KEY = '@lh_emergency_contacts';

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const getLocationAddress = async (latitude, longitude) => {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (address) {
      const parts = [
        address.streetNumber,
        address.street,
        address.district,
        address.city,
        address.region,
      ].filter(Boolean);
      return parts.join(', ') || 'Unknown location';
    }
    return 'Unknown location';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Unknown location';
  }
};

export const getGoogleMapsLink = (latitude, longitude) => {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
};

export const saveEmergencyContacts = async (contacts) => {
  try {
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
    return false;
  }
};

export const getEmergencyContacts = async () => {
  try {
    const data = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
};

export const getDeviceContacts = async () => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      pageSize: 100,
    });

    return data
      .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
      .map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phoneNumbers[0].number,
      }));
  } catch (error) {
    console.error('Error getting device contacts:', error);
    return [];
  }
};

export const sendEmergencySMS = async (profile, riskLevel = 'High', additionalMessage = '') => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'SMS not available on this device' };
    }

    const location = await getCurrentLocation();
    const contacts = await getEmergencyContacts();

    if (contacts.length === 0) {
      return { success: false, error: 'No emergency contacts configured' };
    }

    const mapsLink = location 
      ? getGoogleMapsLink(location.latitude, location.longitude)
      : '';

    const name = profile?.name || 'A pregnant woman';
    const month = profile?.pregnancyMonth || 'unknown';
    
    let message = `🚨 EMERGENCY: ${name} (${month} months pregnant) needs help!\n\n`;
    
    if (riskLevel === 'High') {
      message += `⚠️ HIGH RISK: Seeking immediate medical attention.\n\n`;
    }
    
    if (location) {
      message += `📍 Location: ${mapsLink}\n`;
      message += `🗺️ Google Maps: ${mapsLink}\n\n`;
    } else {
      message += `📍 Location could not be determined.\n\n`;
    }
    
    if (additionalMessage) {
      message += `Note: ${additionalMessage}\n\n`;
    }
    
    message += `Please help immediately or call emergency services.`;

    const phoneNumbers = contacts.map(c => c.phone);

    const { result } = await SMS.sendSMSAsync(phoneNumbers, message);

    return {
      success: result === 'sent' || result === 'unknown',
      result,
      location,
      message,
    };
  } catch (error) {
    console.error('Error sending emergency SMS:', error);
    return { success: false, error: error.message };
  }
};

export const sendCustomSMS = async (phoneNumbers, message) => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, error: 'SMS not available' };
    }

    const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
    return { success: result === 'sent' || result === 'unknown', result };
  } catch (error) {
    console.error('Error sending SMS:', error);
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
    if (vibrationPattern) {
      const Haptics = await import('expo-haptics');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const location = includeLocation ? await getCurrentLocation() : null;

    const contacts = await getEmergencyContacts();
    
    let result;
    if (contacts.length > 0) {
      result = await sendEmergencySMS(profile, riskLevel, customMessage);
    }

    return {
      success: true,
      location,
      contactsNotified: contacts.length,
      smsResult: result,
    };
  } catch (error) {
    console.error('SOS Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
