// storageService.js — Pure localStorage replacement for AsyncStorage
// API shape is identical (all async) so callers need zero changes

const KEYS = {
  USER_PROFILE: '@lh_user_profile',
  CHAT_HISTORY: '@lh_chat_history',
  LANGUAGE: '@lh_language',
  IS_LOGGED_IN: '@lh_is_logged_in',
};

const get = (key) => {
  try {
    return Promise.resolve(localStorage.getItem(key));
  } catch (e) {
    return Promise.resolve(null);
  }
};

const set = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return Promise.resolve(true);
  } catch (e) {
    console.error('Storage write error:', e);
    return Promise.resolve(false);
  }
};

const remove = (key) => {
  try {
    localStorage.removeItem(key);
    return Promise.resolve(true);
  } catch (e) {
    return Promise.resolve(false);
  }
};

export const saveProfile = async (profile) => {
  try {
    await set(KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error('Error saving profile:', e);
    return false;
  }
};

export const getProfile = async () => {
  try {
    const data = await get(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error getting profile:', e);
    return null;
  }
};

export const saveChatHistory = async (messages) => {
  try {
    const last50 = messages.slice(-50);
    await set(KEYS.CHAT_HISTORY, JSON.stringify(last50));
  } catch (e) {
    console.error('Error saving chat:', e);
  }
};

export const getChatHistory = async () => {
  try {
    const data = await get(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLanguage = async (lang) => {
  try {
    await set(KEYS.LANGUAGE, lang);
  } catch (e) {}
};

export const getLanguage = async () => {
  try {
    const lang = await get(KEYS.LANGUAGE);
    return lang || 'en';
  } catch (e) {
    return 'en';
  }
};

export const setLoggedIn = async (value) => {
  try {
    await set(KEYS.IS_LOGGED_IN, value ? 'true' : 'false');
  } catch (e) {}
};

export const isLoggedIn = async () => {
  try {
    const val = await get(KEYS.IS_LOGGED_IN);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

export const clearAll = async () => {
  try {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  } catch (e) {}
};
