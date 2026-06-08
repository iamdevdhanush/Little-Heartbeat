const NOTIFICATION_PERMISSION_KEY = '@lh_notification_permission';
const NOTIFICATION_SETTINGS_KEY = '@lh_notification_settings';

function loadJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

async function getServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return registration;
  } catch {
    return null;
  }
}

class NotificationEngine {
  constructor() {
    this._permission = Notification.permission;
    this._settings = this._loadSettings();
    this._pendingNotifications = new Map();
    this._onNotificationClick = null;
    this._onNotificationAction = null;
  }

  setOnNotificationClick(callback) {
    this._onNotificationClick = callback;
  }

  setOnNotificationAction(callback) {
    this._onNotificationAction = callback;
  }

  _loadSettings() {
    const defaults = {
      enabled: true,
      sound: true,
      vibration: true,
      reminderTiming: 'exact', // exact, 5min_before, 10min_before, 15min_before
      quietHoursStart: null,   // '22:00'
      quietHoursEnd: null,     // '07:00'
      followUpEnabled: true,
      followUpInterval: 30,    // minutes
      maxFollowUps: 3,
      persistentNotifications: true,
    };
    return { ...defaults, ...loadJson(NOTIFICATION_SETTINGS_KEY, {}) };
  }

  saveSettings(updates) {
    this._settings = { ...this._settings, ...updates };
    saveJson(NOTIFICATION_SETTINGS_KEY, this._settings);
    return this._settings;
  }

  getSettings() {
    return { ...this._settings };
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return { granted: false, error: 'Notifications not supported' };
    }

    if (Notification.permission === 'granted') {
      this._permission = 'granted';
      return { granted: true };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, error: 'Notifications blocked by user' };
    }

    try {
      const permission = await Notification.requestPermission();
      this._permission = permission;
      saveJson(NOTIFICATION_PERMISSION_KEY, permission);
      return { granted: permission === 'granted', error: permission === 'denied' ? 'Permission denied' : null };
    } catch (err) {
      return { granted: false, error: err.message };
    }
  }

  isPermissionGranted() {
    return this._permission === 'granted' || Notification.permission === 'granted';
  }

  isInQuietHours() {
    if (!this._settings.quietHoursStart || !this._settings.quietHoursEnd) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = this._settings.quietHoursStart.split(':').map(Number);
    const [endH, endM] = this._settings.quietHoursEnd.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  async showReminder(reminder, options = {}) {
    if (!this._settings.enabled) return false;
    if (!this.isPermissionGranted()) {
      const result = await this.requestPermission();
      if (!result.granted) return false;
    }
    if (this.isInQuietHours()) return false;

    const title = `💊 ${reminder.medicineName}`;
    const body = reminder.dosage
      ? `Time to take ${reminder.dosage}`
      : `Time to take your medication`;

    const notificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: `reminder-${reminder.id}`,
      data: {
        type: 'medication_reminder',
        reminderId: reminder.id,
        medicineId: reminder.medicineId,
        medicineName: reminder.medicineName,
        scheduledTime: reminder.scheduledTime,
        url: '/care',
      },
      requireInteraction: this._settings.persistentNotifications,
      actions: [
        { action: 'take', title: '✓ Taken' },
        { action: 'snooze', title: '⏰ Snooze 10m' },
        { action: 'skip', title: '✕ Skip' },
      ],
    };

    if (this._settings.sound) {
      notificationOptions.silent = false;
    }
    if (this._settings.vibration) {
      notificationOptions.vibrate = [200, 100, 200];
    }

    try {
      const sw = await getServiceWorker();
      if (sw) {
        await sw.showNotification(title, notificationOptions);
      } else {
        const notif = new Notification(title, notificationOptions);
        notif.onclick = (e) => {
          e.preventDefault();
          if (this._onNotificationClick) {
            this._onNotificationClick(reminder);
          }
        };
      }
      return true;
    } catch (err) {
      console.error('Notification error:', err);
      return false;
    }
  }

  async showFollowUp(reminder, followUpNumber) {
    if (!this._settings.followUpEnabled || followUpNumber > this._settings.maxFollowUps) return false;

    const title = `⏰ ${reminder.medicineName} — Reminder #${followUpNumber}`;
    const body = reminder.dosage
      ? `Still time to take ${reminder.dosage}`
      : `Don't forget to take your medication`;

    const notificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: `reminder-followup-${reminder.id}-${followUpNumber}`,
      data: {
        type: 'medication_followup',
        reminderId: reminder.id,
        medicineId: reminder.medicineId,
        medicineName: reminder.medicineName,
        followUpNumber,
        url: '/care',
      },
      requireInteraction: true,
      actions: [
        { action: 'take', title: '✓ Taken' },
        { action: 'snooze', title: '⏰ Snooze 10m' },
      ],
    };

    try {
      const sw = await getServiceWorker();
      if (sw) {
        await sw.showNotification(title, notificationOptions);
      } else {
        new Notification(title, notificationOptions);
      }
      return true;
    } catch {
      return false;
    }
  }

  async showAdherenceSummary(streak, dailyRate) {
    if (!this._settings.enabled || !this.isPermissionGranted()) return false;

    const title = '📊 Daily Adherence Summary';
    const body = streak > 0
      ? `${dailyRate}% today · ${streak} day streak! 🔥`
      : `${dailyRate}% adherence today`;

    try {
      const sw = await getServiceWorker();
      if (sw) {
        await sw.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'adherence-summary',
          data: { type: 'adherence_summary', url: '/care' },
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async showStreakMilestone(streak) {
    if (streak <= 0 || streak % 7 !== 0) return false;
    if (!this._settings.enabled || !this.isPermissionGranted()) return false;

    const emojis = { 7: '🌟', 14: '🔥', 21: '⚡', 30: '💪', 60: '🏆', 90: '👑', 365: '⭐' };
    const emoji = Object.entries(emojis)
      .sort(([a], [b]) => Number(b) - Number(a))
      .find(([days]) => streak >= Number(days));
    const emojiChar = emoji ? emoji[1] : '🎉';

    const title = `${emojiChar} ${streak}-Day Streak!`;
    const body = streak >= 30
      ? `Amazing consistency! You've been perfect for ${streak} days!`
      : `Keep it going! ${streak} day streak!`;

    try {
      const sw = await getServiceWorker();
      if (sw) {
        await sw.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'streak-milestone',
          data: { type: 'streak_milestone', streak, url: '/care' },
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  registerServiceWorkerListeners() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'notification_action') {
        const { action, reminderId, data } = event.data;

        if (action === 'take' && this._onNotificationAction) {
          this._onNotificationAction('take', reminderId, data);
        } else if (action === 'snooze' && this._onNotificationAction) {
          this._onNotificationAction('snooze', reminderId, data);
        } else if (action === 'skip' && this._onNotificationAction) {
          this._onNotificationAction('skip', reminderId, data);
        }
      }
    });
  }

  async testNotification() {
    return this.showReminder({
      id: 'test',
      medicineName: 'Test Medication',
      dosage: '10mg',
      scheduledTime: new Date().toISOString(),
    });
  }
}

export const notificationEngine = new NotificationEngine();
export default NotificationEngine;
