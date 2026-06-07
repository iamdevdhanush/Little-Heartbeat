// notificationService.js — Web Notification API + localStorage
// Replaces expo-notifications, expo-device, Platform

const NOTIFICATION_SETTINGS_KEY = '@lh_notification_settings';

// ── Permission ────────────────────────────────────────

export const registerForPushNotificationsAsync = async () => {
  if (!('Notification' in window)) {
    return { success: false, error: 'Notifications not supported in this browser' };
  }

  if (Notification.permission === 'granted') return { success: true };

  const permission = await Notification.requestPermission();
  if (permission === 'granted') return { success: true };

  return { success: false, error: 'Permission denied' };
};

// ── Immediate Notifications ───────────────────────────

export const sendImmediateNotification = async (title, body, data = {}) => {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log(`[Notification] ${title}: ${body}`);
      return { success: true };
    }

    const registration = await getServiceWorkerRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/icon-72.png',
        vibrate: [100, 50, 100],
        data,
        actions: [{ action: 'view', title: 'Open App' }],
      });
    } else {
      new Notification(title, { body, icon: '/assets/images/icon-192.png' });
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendHighRiskAlert = async (symptoms, riskLevel) => {
  return sendImmediateNotification(
    '⚠️ High Risk Alert',
    `Your symptoms suggest ${riskLevel} risk. Please consult a doctor immediately.`,
    { type: 'high_risk_alert', symptoms, riskLevel }
  );
};

// ── Scheduled Reminders (localStorage + Service Worker) ──

let scheduledTimers = {};

export const scheduleDailyReminder = async (hour = 9, minute = 0, message = 'Time for your daily health check! 💕') => {
  try {
    // Clear existing
    cancelAllNotifications();

    const now = new Date();
    let target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();

    const timerId = setTimeout(async () => {
      await sendImmediateNotification('Little Heartbeat 💗', message, { type: 'daily_reminder' });
      // Reschedule for next day
      scheduleDailyReminder(hour, minute, message);
    }, delay);

    scheduledTimers['daily'] = timerId;

    // Persist schedule for SW-based reminders
    localStorage.setItem('@lh_daily_reminder', JSON.stringify({ hour, minute, message, enabled: true }));

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const scheduleWeeklyReminder = async (dayOfWeek = 1, hour = 10, message = "Don't forget your prenatal check-up this week! 🤰") => {
  localStorage.setItem('@lh_weekly_reminder', JSON.stringify({ dayOfWeek, hour, message, enabled: true }));
  return { success: true };
};

export const scheduleMedicationReminder = async (medicationName, times = ['09:00', '21:00']) => {
  localStorage.setItem('@lh_med_reminder', JSON.stringify({ medicationName, times, enabled: true }));
  return { success: true };
};

export const scheduleCheckupReminder = async (profile) => {
  const month = profile?.pregnancyMonth || 5;
  let message = '';
  if (month <= 3) message = 'Your first trimester check-up is due! Monthly visits recommended.';
  else if (month <= 6) message = 'Second trimester check-up time! Fortnightly visits now.';
  else message = 'Third trimester — weekly check-ups recommended now!';

  setTimeout(() => sendImmediateNotification('📅 Check-up Reminder', message, { type: 'checkup_reminder' }), 5000);
  return { success: true };
};

export const cancelAllNotifications = async () => {
  try {
    Object.values(scheduledTimers).forEach(id => clearTimeout(id));
    scheduledTimers = {};
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── Settings ──────────────────────────────────────────

const getDefaultSettings = () => ({
  dailyReminder: true,
  dailyReminderTime: '09:00',
  weeklyReminder: true,
  weeklyReminderDay: 1,
  checkupReminder: true,
  medicationReminder: false,
  highRiskAlerts: true,
});

export const getNotificationSettings = async () => {
  try {
    const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
};

export const saveNotificationSettings = async (settings) => {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateNotificationSettings = async (newSettings) => {
  const currentSettings = await getNotificationSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  await saveNotificationSettings(updatedSettings);

  if (newSettings.dailyReminder !== undefined) {
    if (newSettings.dailyReminder) {
      const [hour, minute] = (newSettings.dailyReminderTime || '09:00').split(':').map(Number);
      await scheduleDailyReminder(hour, minute);
    } else {
      await cancelAllNotifications();
    }
  }

  return { success: true };
};

// ── Listener stubs (for API compatibility) ────────────
export const addNotificationReceivedListener = (handler) => {
  // Web push handled via SW 'push' event — no-op for in-app listener
  return { remove: () => {} };
};

export const addNotificationResponseReceivedListener = (handler) => {
  return { remove: () => {} };
};

// ── Helpers ───────────────────────────────────────────
const getServiceWorkerRegistration = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
};
