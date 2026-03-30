import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@lh_user_profile',
  CHAT_HISTORY: '@lh_chat_history',
  LANGUAGE: '@lh_language',
  IS_LOGGED_IN: '@lh_is_logged_in',
};

export const saveProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error('Error saving profile:', e);
    return false;
  }
};

export const getProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error getting profile:', e);
    return null;
  }
};

export const saveChatHistory = async (messages) => {
  try {
    const last50 = messages.slice(-50);
    await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(last50));
  } catch (e) {
    console.error('Error saving chat:', e);
  }
};

export const getChatHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
  } catch (e) {}
};

export const getLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem(KEYS.LANGUAGE);
    return lang || 'en';
  } catch (e) {
    return 'en';
  }
};

export const setLoggedIn = async (value) => {
  try {
    await AsyncStorage.setItem(KEYS.IS_LOGGED_IN, value ? 'true' : 'false');
  } catch (e) {}
};

export const isLoggedIn = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.IS_LOGGED_IN);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (e) {}
};
