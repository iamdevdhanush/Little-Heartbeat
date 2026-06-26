import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, saveProfile, getLanguage, saveLanguage } from '../services/storageService';

const AppContext = createContext({});

export const AppProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [language, setLanguageState] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [savedProfile, savedLang] = await Promise.all([getProfile(), getLanguage()]);
      if (savedProfile) setProfile(savedProfile);
      if (savedLang) setLanguageState(savedLang);
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (newProfile) => {
    const merged = { ...profile, ...newProfile };
    setProfile(merged);
    await saveProfile(merged);
  };

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    await saveLanguage(lang);
  };

  return (
    <AppContext.Provider value={{ profile, updateProfile, language, setLanguage, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
