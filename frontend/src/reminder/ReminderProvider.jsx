import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useReminderStore } from './reminderStore.js';
import { reminderService } from './ReminderService.js';
import { useApp } from '../context/AppContext.js';

const ReminderContext = createContext(null);

export function useReminder() {
  const ctx = useContext(ReminderContext);
  if (!ctx) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return ctx;
}

export default function ReminderProvider({ children, userId: propUserId }) {
  const initialized = useRef(false);
  const store = useReminderStore();
  const { profile } = useApp();

  const userId = useMemo(() => {
    return propUserId || profile?.id || profile?.email || 'local-user';
  }, [propUserId, profile]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (userId) {
      store.initialize(userId);
    }

    const interval = setInterval(() => {
      store.refreshReminders();
    }, 60000);

    return () => {
      clearInterval(interval);
      store.stopEngine();
      initialized.current = false;
    };
  }, [userId]);

  const contextValue = useMemo(() => ({
    ...store,
    todayReminders: store.todayReminders,
    adherence: store.adherence,
    streaks: store.streaks,
    isLoading: store.isLoading,
    medicines: store.medicines,
  }), [store.todayReminders, store.adherence, store.streaks, store.isLoading, store.medicines]);

  return (
    <ReminderContext.Provider value={contextValue}>
      {children}
    </ReminderContext.Provider>
  );
}
