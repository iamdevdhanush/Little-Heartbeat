import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_SETTINGS_KEY = '@lh_notification_settings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8517A',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8517A',
    });

    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Health Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#E53935',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { success: false, error: 'Permission not granted' };
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });
      token = tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  }

  return { success: true, token };
};

export const scheduleDailyReminder = async (hour = 9, minute = 0, message = 'Time for your daily health check! 💕') => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Little Heartbeat 💗',
        body: message,
        data: { type: 'daily_reminder' },
        sound: true,
      },
      trigger,
    });

    return { success: true };
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return { success: false, error: error.message };
  }
};

export const scheduleWeeklyReminder = async (dayOfWeek = 1, hour = 10, message = 'Don\'t forget your prenatal check-up this week! 🤰') => {
  try {
    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: dayOfWeek,
      hour,
      minute: 0,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prenatal Reminder 👶',
        body: message,
        data: { type: 'weekly_reminder' },
        sound: true,
      },
      trigger,
    });

    return { success: true };
  } catch (error) {
    console.error('Error scheduling weekly reminder:', error);
    return { success: false, error: error.message };
  }
};

export const scheduleMedicationReminder = async (medicationName, times = ['09:00', '21:00']) => {
  try {
    for (const time of times) {
      const [hour, minute] = time.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `Time to take your ${medicationName}`,
          data: { type: 'medication_reminder', medication: medicationName },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error scheduling medication reminder:', error);
    return { success: false, error: error.message };
  }
};

export const scheduleCheckupReminder = async (profile) => {
  try {
    const month = profile?.pregnancyMonth || 5;
    let message = '';

    if (month <= 3) {
      message = 'Your first trimester check-up is due! Monthly visits recommended.';
    } else if (month <= 6) {
      message = 'Second trimester check-up time! Fortnightly visits now.';
    } else {
      message = 'Third trimester - weekly check-ups recommended now!';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Check-up Reminder',
        body: message,
        data: { type: 'checkup_reminder', month },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 1,
        hour: 10,
        minute: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error scheduling checkup reminder:', error);
    return { success: false, error: error.message };
  }
};

export const sendImmediateNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending immediate notification:', error);
    return { success: false, error: error.message };
  }
};

export const sendHighRiskAlert = async (symptoms, riskLevel) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ High Risk Alert',
        body: `Your symptoms suggest ${riskLevel} risk. Please consult a doctor immediately.`,
        data: { type: 'high_risk_alert', symptoms, riskLevel },
        sound: true,
        priority: 'max',
      },
      trigger: null,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending high risk alert:', error);
    return { success: false, error: error.message };
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return { success: true };
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return { success: false, error: error.message };
  }
};

export const getNotificationSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch (error) {
    return getDefaultSettings();
  }
};

export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    return { success: true };
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return { success: false, error: error.message };
  }
};

const getDefaultSettings = () => ({
  dailyReminder: true,
  dailyReminderTime: '09:00',
  weeklyReminder: true,
  weeklyReminderDay: 1,
  checkupReminder: true,
  medicationReminder: false,
  highRiskAlerts: true,
});

export const updateNotificationSettings = async (newSettings) => {
  const currentSettings = await getNotificationSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  await saveNotificationSettings(updatedSettings);

  if (newSettings.dailyReminder !== undefined) {
    if (newSettings.dailyReminder) {
      const [hour, minute] = (newSettings.dailyReminderTime || '09:00').split(':').map(Number);
      await scheduleDailyReminder(hour, minute);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  if (newSettings.weeklyReminder !== undefined && newSettings.weeklyReminder) {
    await scheduleWeeklyReminder(newSettings.weeklyReminderDay || 1);
  }

  return { success: true };
};

export const addNotificationReceivedListener = (handler) => {
  return Notifications.addNotificationReceivedListener(handler);
};

export const addNotificationResponseReceivedListener = (handler) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};
