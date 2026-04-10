import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import { 
  getNotificationSettings, 
  updateNotificationSettings,
  scheduleDailyReminder,
  scheduleWeeklyReminder,
  cancelAllNotifications,
  registerForPushNotificationsAsync,
} from '../../services/notificationService';
import Button from '../../components/common/Button';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = [
  { label: 'Morning (9:00 AM)', value: '09:00' },
  { label: 'Afternoon (12:00 PM)', value: '12:00' },
  { label: 'Evening (6:00 PM)', value: '18:00' },
  { label: 'Night (9:00 PM)', value: '21:00' },
];

export default function NotificationSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    const data = await getNotificationSettings();
    setSettings(data);
    setLoading(false);
  };

  const checkPermissions = async () => {
    const result = await registerForPushNotificationsAsync();
    setPushPermission(result.success);
  };

  const handleToggle = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await updateNotificationSettings({ [key]: value });

    if (key === 'dailyReminder' && value) {
      const [hour, minute] = (settings.dailyReminderTime || '09:00').split(':').map(Number);
      await scheduleDailyReminder(hour, minute);
    } else if (key === 'weeklyReminder' && value) {
      await scheduleWeeklyReminder(settings.weeklyReminderDay || 1);
    } else if (key === 'dailyReminder' && !value) {
      await cancelAllNotifications();
    }
  };

  const handleTimeChange = async (time) => {
    const updated = { ...settings, dailyReminderTime: time };
    setSettings(updated);
    await updateNotificationSettings({ dailyReminderTime: time });
    await scheduleDailyReminder(...time.split(':').map(Number));
  };

  const handleDayChange = async (day) => {
    const updated = { ...settings, weeklyReminderDay: day };
    setSettings(updated);
    await updateNotificationSettings({ weeklyReminderDay: day });
    await scheduleWeeklyReminder(day);
  };

  const handleRequestPermission = async () => {
    const result = await registerForPushNotificationsAsync();
    setPushPermission(result.success);
    if (result.success) {
      Alert.alert('Success', 'Push notifications are now enabled!');
    } else {
      Alert.alert('Error', 'Please enable push notifications in your device settings.');
    }
  };

  if (loading || !settings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#EEF4FF', '#FFF0F5']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notifications</Text>
        <Text style={styles.headerSubtitle}>Manage your reminders and alerts</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {!pushPermission && (
          <View style={[styles.permissionCard, shadows.sm]}>
            <Text style={styles.permissionTitle}>📱 Enable Push Notifications</Text>
            <Text style={styles.permissionText}>
              Allow Little Heartbeat to send you important health reminders and alerts.
            </Text>
            <Button
              title="Enable Notifications"
              onPress={handleRequestPermission}
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Health Check</Text>
              <Text style={styles.settingDescription}>
                Get a gentle reminder to log your health data
              </Text>
            </View>
            <Switch
              value={settings.dailyReminder}
              onValueChange={(value) => handleToggle('dailyReminder', value)}
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={settings.dailyReminder ? colors.primary : '#BDBDBD'}
            />
          </View>

          {settings.dailyReminder && (
            <View style={styles.timeSelector}>
              <Text style={styles.timeSelectorLabel}>Reminder Time:</Text>
              <View style={styles.timeOptions}>
                {TIMES.map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    style={[
                      styles.timeChip,
                      settings.dailyReminderTime === time.value && styles.timeChipActive,
                    ]}
                    onPress={() => handleTimeChange(time.value)}
                  >
                    <Text style={[
                      styles.timeChipText,
                      settings.dailyReminderTime === time.value && styles.timeChipTextActive,
                    ]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>Weekly Check-up Reminder</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Weekly Reminder</Text>
              <Text style={styles.settingDescription}>
                Reminder for your prenatal check-ups
              </Text>
            </View>
            <Switch
              value={settings.weeklyReminder}
              onValueChange={(value) => handleToggle('weeklyReminder', value)}
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={settings.weeklyReminder ? colors.primary : '#BDBDBD'}
            />
          </View>

          {settings.weeklyReminder && (
            <View style={styles.daySelector}>
              <Text style={styles.daySelectorLabel}>Day of week:</Text>
              <View style={styles.dayOptions}>
                {DAYS.map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      settings.weeklyReminderDay === index + 1 && styles.dayChipActive,
                    ]}
                    onPress={() => handleDayChange(index + 1)}
                  >
                    <Text style={[
                      styles.dayChipText,
                      settings.weeklyReminderDay === index + 1 && styles.dayChipTextActive,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.section, shadows.sm]}>
          <Text style={styles.sectionTitle}>Health Alerts</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>High Risk Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when symptoms indicate high risk
              </Text>
            </View>
            <Switch
              value={settings.highRiskAlerts}
              onValueChange={(value) => handleToggle('highRiskAlerts', value)}
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={settings.highRiskAlerts ? colors.primary : '#BDBDBD'}
            />
          </View>
        </View>

        <View style={[styles.infoCard, shadows.sm]}>
          <Text style={styles.infoTitle}>💡 Notification Types</Text>
          <Text style={styles.infoText}>
            📅 <Text style={styles.infoBold}>Check-up Reminders</Text> - Monthly prenatal visit reminders{'\n\n'}
            💊 <Text style={styles.infoBold}>Daily Health</Text> - Log your health data daily{'\n\n'}
            ⚠️ <Text style={styles.infoBold}>High Risk Alerts</Text> - Urgent health warnings{'\n\n'}
            👶 <Text style={styles.infoBold}>Baby Milestones</Text> - Track your baby's development
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  scroll: { padding: 16, gap: 12 },
  permissionCard: {
    backgroundColor: '#FFF3E0', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#FFB74D',
  },
  permissionTitle: { fontSize: 16, fontWeight: '700', color: '#E65100', marginBottom: 8 },
  permissionText: { fontSize: 14, color: '#795548', lineHeight: 20 },
  section: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  settingDescription: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  timeSelector: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  timeSelectorLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: colors.background, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeChipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  timeChipTextActive: { color: '#fff' },
  daySelector: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  daySelectorLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  dayOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  dayChipTextActive: { color: '#fff' },
  infoCard: {
    backgroundColor: '#F0F7FF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#D6E8FF',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark, marginBottom: 12 },
  infoText: { fontSize: 13, color: colors.accentDark, lineHeight: 22 },
  infoBold: { fontWeight: '700' },
});
