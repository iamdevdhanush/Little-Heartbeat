import { create } from 'zustand';
import { reminderService } from './ReminderService.js';
import { notificationEngine } from './NotificationEngine.js';

const initialState = {
  medicines: [],
  todayReminders: [],
  adherence: { daily: { rate: 0, taken: 0, total: 0 }, weekly: { rate: 0, taken: 0, total: 0 }, monthly: { rate: 0, taken: 0, total: 0 } },
  streaks: { current: 0, longest: 0, lastAdherentDate: null, todayComplete: false },
  isLoading: true,
  isRunning: false,
  userId: null,
  error: null,
};

export const useReminderStore = create((set, get) => ({
  ...initialState,

  initialize: async (userId) => {
    set({ isLoading: true, error: null, userId });

    try {
      const notificationPerm = await notificationEngine.requestPermission();
      if (!notificationPerm.granted) {
        console.warn('Notification permission not granted:', notificationPerm.error);
      }

      notificationEngine.registerServiceWorkerListeners();
      notificationEngine.setOnNotificationClick((reminder) => {
        const state = get();
        state.handleTakeReminder(reminder.id);
      });

      notificationEngine.setOnNotificationAction(async (action, reminderId, data) => {
        const state = get();
        if (action === 'take') {
          await state.handleTakeReminder(reminderId);
        } else if (action === 'snooze') {
          await state.handleSnoozeReminder(reminderId, 10);
        } else if (action === 'skip') {
          await state.handleSkipReminder(reminderId);
        }
      });

      await get().loadMedicines(userId);

      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  loadMedicines: async (userId) => {
    try {
      const meds = await reminderService.loadMedicines(userId);
      set({ medicines: meds });

      if (meds.length > 0) {
        await get().refreshReminders(meds, userId);
        get().startEngine(meds, userId);
      }
    } catch (err) {
      set({ error: err.message });
    }
  },

  refreshReminders: async (medicines, userId) => {
    const meds = medicines || get().medicines;
    const uid = userId || get().userId;
    if (meds.length === 0) return;

    const todayReminders = reminderService.generateRemindersForToday(meds);
    const savedReminders = reminderService.getSavedReminders();

    if (savedReminders.length > 0) {
      const existingIds = new Set(savedReminders.map(r => r.id));
      const newReminders = todayReminders.filter(r => !existingIds.has(r.id));
      const merged = [...savedReminders, ...newReminders].sort((a, b) => a.time.localeCompare(b.time));
      reminderService.logCurrentReminders(merged);
      reminderService.saveReminders(merged[0]?.date || new Date().toISOString().split('T')[0], merged);
      set({ todayReminders: merged });
    } else {
      reminderService.logCurrentReminders(todayReminders);
      set({ todayReminders });
    }

    const plannedCount = (savedReminders.length > 0 ? savedReminders : todayReminders).length;
    reminderService.setPlannedCount(new Date().toISOString().split('T')[0], plannedCount);

    get().refreshAdherence();
  },

  refreshAdherence: () => {
    const adherence = reminderService.getAdherence();
    const streaks = reminderService.getStreaks();
    set({ adherence, streaks });
  },

  startEngine: (medicines, userId) => {
    const state = get();
    if (state.isRunning) return;

    reminderService.setOnReminderDue(async (reminder, uid) => {
      try {
        await notificationEngine.showReminder(reminder);
      } catch {}
    });

    reminderService.start(medicines, userId);
    set({ isRunning: true });
  },

  stopEngine: () => {
    reminderService.stop();
    set({ isRunning: false });
  },

  handleTakeReminder: async (reminderId) => {
    const uid = get().userId;
    const updated = await reminderService.takeReminder(reminderId, uid);
    if (updated) {
      get().refreshReminders();
      get().refreshAdherence();
      const streaks = get().streaks;
      if (streaks.current > 0 && streaks.current % 7 === 0) {
        notificationEngine.showStreakMilestone(streaks.current);
      }
    }
    return updated;
  },

  handleSkipReminder: async (reminderId) => {
    const uid = get().userId;
    const updated = await reminderService.skipReminder(reminderId, uid);
    if (updated) {
      get().refreshReminders();
      get().refreshAdherence();
    }
    return updated;
  },

  handleSnoozeReminder: async (reminderId, minutes = 10) => {
    const updated = await reminderService.snoozeReminder(reminderId, minutes);
    if (updated) {
      get().refreshReminders();
    }
    return updated;
  },

  getRemindersForTime: (time) => {
    return get().todayReminders.filter(r => r.time === time);
  },

  reset: () => {
    get().stopEngine();
    set({ ...initialState });
  },
}));

export function getReminderStore() {
  return useReminderStore;
}
